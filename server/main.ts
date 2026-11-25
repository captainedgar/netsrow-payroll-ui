import 'dotenv/config';
import 'reflect-metadata';
import { Controller, Get, Inject, Module, ServiceUnavailableException } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { PrismaClient } from '@prisma/client';

@Controller('api')
class FoundationController {
  constructor(@Inject(PrismaClient) private readonly prisma: PrismaClient) {}

  @Get('health')
  async health() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ok' };
    } catch {
      throw new ServiceUnavailableException('Database unavailable');
    }
  }

  @Get('demo/catalog')
  async catalog() {
    const catalog = await this.prisma.catalogSnapshot.findUnique({
      where: { key: 'demo' },
    });
    if (!catalog) throw new ServiceUnavailableException('Demo catalog has not been seeded');
    return { mode: 'demo', catalog: catalog.payload };
  }
}

const prisma = new PrismaClient();

@Module({
  controllers: [FoundationController],
  providers: [{ provide: PrismaClient, useValue: prisma }],
})
class FoundationModule {}

async function start() {
  const app = await NestFactory.create(FoundationModule);
  app.enableShutdownHooks();
  app.getHttpServer().once('close', () => void prisma.$disconnect());
  await app.listen(Number(process.env.API_PORT ?? 3001), '127.0.0.1');
}

void start();
