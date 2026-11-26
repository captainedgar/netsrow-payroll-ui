import { createHash, randomBytes } from 'node:crypto';
import {
  BadRequestException, Body, Controller, ForbiddenException, Get, Header, HttpCode, Inject,
  NotFoundException, Param, Patch, Post, Req, Res, UnauthorizedException,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import type { Request, Response } from 'express';
import { verifyPassword } from './password';

const cookieName = 'netsrow_session';
const maxAge = 8 * 60 * 60 * 1000;
const cookie = { httpOnly: true, sameSite: 'strict' as const, secure: process.env.NODE_ENV === 'production', path: '/api/tenant' };
const dummyHash = `${'0'.repeat(32)}:${'0'.repeat(128)}`;

const companyProfileFields = {
  name: 120, rnc: 24, tssEmployerCode: 48, address: 240, phone: 32, email: 254,
} as const;

function readCompanyProfile(body: unknown) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new BadRequestException();
  const profile = body as Record<string, unknown>;
  return Object.fromEntries(Object.entries(companyProfileFields).map(([key, limit]) => {
    const value = profile[key];
    if (typeof value !== 'string' || value.length > limit || (key === 'name' && !value.trim())) {
      throw new BadRequestException('Invalid company profile');
    }
    return [key, value.trim()];
  }));
}

function sessionDigest(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

@Controller('api/tenant')
export class TenantController {
  constructor(@Inject(PrismaClient) private readonly prisma: PrismaClient) {}

  private mutation(request: Request) {
    if (request.get('x-netsrow-client') !== 'web') throw new ForbiddenException();
  }

  private token(request: Request) {
    return request.headers.cookie?.match(/(?:^|;\s*)netsrow_session=([a-f0-9]{64})(?:;|$)/)?.[1];
  }

  private async account(request: Request) {
    const token = this.token(request);
    if (!token) throw new UnauthorizedException();
    const session = await this.prisma.session.findUnique({
      where: { digest: sessionDigest(token) },
      include: { account: { include: { company: true } } },
    });
    if (!session || session.expiresAt.getTime() <= Date.now()) throw new UnauthorizedException();
    return session.account;
  }

  @Post('login')
  @HttpCode(200)
  @Header('Cache-Control', 'no-store')
  async login(@Body() body: unknown, @Req() request: Request, @Res({ passthrough: true }) response: Response) {
    this.mutation(request);
    const input = body as { email?: unknown; password?: unknown } | null;
    if (typeof input?.email !== 'string' || input.email.length > 254 ||
        typeof input.password !== 'string' || input.password.length > 256 || !input.password) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const account = await this.prisma.account.findUnique({
      where: { email: input.email.trim().toLowerCase() },
      include: { company: true },
    });
    const valid = await verifyPassword(input.password, account?.password ?? dummyHash);
    if (!account || !valid) throw new UnauthorizedException('Invalid credentials');
    const token = randomBytes(32).toString('hex');
    const prior = this.token(request);
    await this.prisma.$transaction([
      this.prisma.session.deleteMany({
        where: { OR: [{ expiresAt: { lte: new Date() } }, ...(prior ? [{ digest: sessionDigest(prior) }] : [])] },
      }),
      this.prisma.session.create({
        data: { digest: sessionDigest(token), accountId: account.id, expiresAt: new Date(Date.now() + maxAge) },
      }),
    ]);
    response.cookie(cookieName, token, { ...cookie, maxAge });
    return { company: account.company };
  }

  @Post('logout')
  @HttpCode(204)
  async logout(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    this.mutation(request);
    const token = this.token(request);
    if (token) await this.prisma.session.deleteMany({ where: { digest: sessionDigest(token) } });
    response.clearCookie(cookieName, cookie);
  }

  @Get('catalog')
  @Header('Cache-Control', 'no-store')
  async catalog(@Req() request: Request) {
    const { company, canManageCatalog, canManageCompany } = await this.account(request);
    const primaryBranch = await this.prisma.branch.findUnique({
      where: { companyId: company.id },
      select: { id: true, name: true },
    });
    const products = await this.prisma.product.findMany({
      where: { companyId: company.id },
      select: { id: true, name: true },
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
    });
    return { company, primaryBranch, products, canManageCatalog, canManageCompany };
  }

  @Patch('company')
  @Header('Cache-Control', 'no-store')
  async updateCompany(@Req() request: Request, @Body() body: unknown) {
    this.mutation(request);
    const { companyId, canManageCompany } = await this.account(request);
    if (!canManageCompany) throw new ForbiddenException();
    return this.prisma.company.update({
      where: { id: companyId },
      data: readCompanyProfile(body),
    });
  }

  @Post('catalog')
  async createProduct(@Req() request: Request, @Body() body: unknown) {
    this.mutation(request);
    const { companyId, canManageCatalog } = await this.account(request);
    if (!canManageCatalog) throw new ForbiddenException();

    const input = body as { name?: unknown } | null;
    if (typeof input?.name !== 'string' || !input.name.trim() || input.name.trim().length > 120) {
      throw new BadRequestException('Product name must contain 1 to 120 characters');
    }

    return this.prisma.product.create({
      data: { name: input.name.trim(), companyId },
      select: { id: true, name: true },
    });
  }

  @Get('catalog/:id')
  @Header('Cache-Control', 'no-store')
  async product(@Param('id') id: string, @Req() request: Request) {
    const { companyId } = await this.account(request);
    const product = await this.prisma.product.findFirst({
      where: { id, companyId },
      select: { id: true, name: true },
    });
    if (!product) throw new NotFoundException();
    return product;
  }
}
