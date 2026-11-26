import { BadRequestException, Body, Controller, Inject, NotFoundException, Post } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { SEED_COMMERCIAL_CATALOG as catalog } from '../src/netsrow-payroll/data/commercialCatalog';
import { validateCommercialDependencies, validateQuoteContact } from '../src/netsrow-payroll/services/commercialPricing';

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new BadRequestException('Invalid quote request');
  }
  return value as Record<string, unknown>;
}

function field(value: unknown, max: number, required = false): string {
  if (value === undefined && !required) return '';
  if (typeof value !== 'string' || value.length > max || (required && !value.trim())) {
    throw new BadRequestException('Invalid quote field');
  }
  return value.trim();
}

@Controller('api/commercial')
export class CommercialController {
  constructor(@Inject(PrismaClient) private readonly prisma: PrismaClient) {}

  @Post('quote-requests')
  async submit(@Body() body: unknown) {
    if (process.env.NETSROW_COMMERCIAL_INTAKE !== 'true') throw new NotFoundException();

    const input = record(body);
    const choice = record(input.selection);
    const contact = record(input.contact);
    const locale = input.locale;
    const mode = choice.mode;
    const plan = catalog.plans.find((item) => item.id === choice.planId);
    if ((locale !== 'es' && locale !== 'en') ||
        (mode !== 'SOFTWARE_ONLY' && mode !== 'POS_BUNDLE') || !plan) {
      throw new BadRequestException('Invalid locale, mode or plan');
    }

    const addons = choice.selectedAddons;
    if (!Array.isArray(addons) || addons.length > catalog.modules.length ||
        new Set(addons).size !== addons.length) {
      throw new BadRequestException('Invalid add-ons');
    }
    const selectedAddons = addons.map((code: unknown) => {
      const module = catalog.modules.find((item) => item.code === code && item.status === 'ADDON_AVAILABLE');
      if (!module) throw new BadRequestException('Invalid add-on');
      return module.code;
    });
    if (!validateCommercialDependencies(plan.includedModules, selectedAddons, catalog).valid) {
      throw new BadRequestException('Missing add-on dependency');
    }

    const installation = catalog.installationOptions.find(
      (item) => item.id === choice.installationId && item.applicableModes.includes(mode),
    );
    const training = catalog.trainingOptions.find(
      (item) => item.id === choice.trainingId && item.applicableModes.includes(mode),
    );
    if (!installation || !training) throw new BadRequestException('Invalid service');

    const hardware = catalog.hardwareOptions.find((item) => item.id === choice.hardwareId);
    const payment = hardware?.paymentOptions.find((item) => item.id === choice.paymentOptionId);
    const quantity = choice.hardwareQuantity;
    if (mode === 'POS_BUNDLE' && (!hardware || !payment ||
        typeof quantity !== 'number' || !Number.isInteger(quantity) ||
        quantity < 1 || quantity > hardware.maxSelfServiceQuantity)) {
      throw new BadRequestException('Invalid equipment selection');
    }

    const contactEmailOrWhatsapp = field(contact.contactEmailOrWhatsapp, 254, true);
    if (!validateQuoteContact(contactEmailOrWhatsapp)) throw new BadRequestException('Invalid contact');
    const request = await this.prisma.commercialQuoteRequest.create({
      data: {
        locale,
        catalogVersion: 'unpriced-v1',
        selection: {
          mode,
          planId: plan.id,
          selectedAddons,
          installationId: installation.id,
          trainingId: training.id,
          ...(mode === 'POS_BUNDLE' && {
            hardwareId: hardware!.id,
            paymentOptionId: payment!.id,
            hardwareQuantity: Number(quantity),
          }),
        },
        contact: {
          contactName: field(contact.contactName, 120, true),
          businessName: field(contact.businessName, 160, true),
          contactEmailOrWhatsapp,
          businessType: field(contact.businessType, 100),
          branchCount: field(contact.branchCount, 12),
          comments: field(contact.comments, 2000),
          alreadyIssuesElectronicReceipts: field(contact.alreadyIssuesElectronicReceipts, 6),
          eInvoicingBranchesCount: field(contact.eInvoicingBranchesCount, 12),
        },
      },
      select: { id: true, createdAt: true },
    });
    return { quoteReference: `COT-${request.id}`, submittedAt: request.createdAt.toISOString() };
  }
}
