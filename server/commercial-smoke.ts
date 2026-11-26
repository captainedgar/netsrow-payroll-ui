import assert from 'node:assert/strict';
import { PrismaClient } from '@prisma/client';
import { DEFAULT_COMMERCIAL_SELECTION, PRESET_POS_BUNDLE_INSTALLMENTS } from '../src/netsrow-payroll/data/commercialCatalog';

const endpoint = 'http://127.0.0.1:3000/api/commercial/quote-requests';
const contact = {
  contactName: 'Contacto ficticio',
  businessName: 'Comercio de prueba',
  contactEmailOrWhatsapp: 'contacto@example.test',
};
const prisma = new PrismaClient();

async function post(selection: unknown, quoteContact = contact) {
  return fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ locale: 'es', selection, contact: quoteContact, breakdown: { softwareMonthlyCents: 1 } }),
  });
}

try {
  for (const selection of [DEFAULT_COMMERCIAL_SELECTION, PRESET_POS_BUNDLE_INSTALLMENTS]) {
    const response = await post(selection);
    const receipt = await response.json() as { quoteReference: string; contact?: unknown };
    assert.equal(response.status, 201, JSON.stringify(receipt));
    assert.match(receipt.quoteReference, /^COT-[a-f0-9-]{36}$/);
    assert.equal(receipt.contact, undefined);
    const quote = await prisma.commercialQuoteRequest.findUniqueOrThrow({
      where: { id: receipt.quoteReference.slice(4) },
    });
    assert.equal(quote.catalogVersion, 'unpriced-v1');
    assert.deepEqual(quote.selection, {
      ...(selection.mode === 'POS_BUNDLE' ? selection : {
        mode: selection.mode,
        planId: selection.planId,
        selectedAddons: selection.selectedAddons,
        installationId: selection.installationId,
        trainingId: selection.trainingId,
      }),
    });
    assert.equal('breakdown' in quote, false);
  }
  assert.equal((await post({ ...DEFAULT_COMMERCIAL_SELECTION, planId: 'invalid' })).status, 400);
  assert.equal((await post(DEFAULT_COMMERCIAL_SELECTION, { ...contact, contactEmailOrWhatsapp: '' })).status, 400);
  console.log('Commercial quote intake verified');
} finally {
  await prisma.$disconnect();
}
