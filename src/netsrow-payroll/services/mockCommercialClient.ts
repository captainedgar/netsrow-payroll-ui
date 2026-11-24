import { SEED_COMMERCIAL_CATALOG } from '../data/commercialCatalog';
import {
  CommercialApiClient,
  CommercialCatalog,
  CommercialFaultMode,
  CommercialModuleCode,
  QuoteSubmissionPayload,
  QuoteSubmissionResult,
} from '../types/commercial';
import { SaasModule, SaasPlan } from '../types/platform';

const QUOTES_STORAGE_KEY = 'netsrow_commercial_quotes_v1';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function clone<T>(val: T): T {
  return JSON.parse(JSON.stringify(val)) as T;
}

export function validateQuoteContact(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (trimmed.includes('@')) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
  }
  const digits = trimmed.replace(/\D/g, '');
  return digits.length >= 7;
}

/**
 * Prepares future integration with the Superadmin catalog without overwriting
 * unconfirmed commercial bundle definitions when no live HTTP catalog is active.
 */
export function mergeCommercialCatalogWithSuperadmin(
  baseCatalog: CommercialCatalog,
  superadminPlans?: SaasPlan[],
  superadminModules?: SaasModule[]
): CommercialCatalog {
  if (!superadminPlans?.length && !superadminModules?.length) {
    return baseCatalog;
  }
  return clone(baseCatalog);
}

/**
 * Builds a WhatsApp link strictly when a real commercial number is configured.
 * Returns null in demo mode when no verified WhatsApp number exists.
 */
export function buildWhatsAppQuoteUrl(
  commercialNumber: string | null | undefined,
  summaryText: string
): string | null {
  if (!commercialNumber) return null;
  const digits = commercialNumber.replace(/\D/g, '');
  if (digits.length < 10) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(summaryText)}`;
}

export function formatQuoteSummaryMessage(
  payload: QuoteSubmissionPayload,
  catalog: CommercialCatalog
): string {
  const plan = catalog.plans.find((p) => p.id === payload.selection.planId);
  const modeLabel =
    payload.selection.mode === 'POS_BUNDLE'
      ? 'Paquete completo POS'
      : 'Solo software';
  const addons = payload.breakdown.billedAddons
    .map((a) => (payload.locale === 'es' ? a.nameEs : a.nameEn))
    .join(', ');
  const eiNotes: string[] = [];
  if (payload.contact.alreadyIssuesElectronicReceipts) {
    eiNotes.push(`Emisión electrónica actual: ${payload.contact.alreadyIssuesElectronicReceipts}`);
  }
  if (payload.contact.eInvoicingBranchesCount) {
    eiNotes.push(`Sucursales a emitir: ${payload.contact.eInvoicingBranchesCount}`);
  }
  return `Hola NetsRow, solicito cotización (${modeLabel}) · Plan: ${
    plan ? (payload.locale === 'es' ? plan.nameEs : plan.nameEn) : payload.selection.planId
  }${addons ? ` · Extras: ${addons}` : ''}${eiNotes.length ? ` · ${eiNotes.join(' / ')}` : ''} · Negocio: ${
    payload.contact.businessName
  }`;
}

function readStoredQuotes(): QuoteSubmissionResult[] {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const raw = window.localStorage.getItem(QUOTES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as QuoteSubmissionResult[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveStoredQuotes(quotes: QuoteSubmissionResult[]): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(QUOTES_STORAGE_KEY, JSON.stringify(quotes));
  } catch {
    // Ignore storage quota errors
  }
}

export const COMMERCIAL_MODULE_LABELS: Record<
  CommercialModuleCode,
  { es: string; en: string }
> = {
  POS: { es: 'Punto de Venta (POS)', en: 'Point of Sale (POS)' },
  SALES: { es: 'Ventas e historial', en: 'Sales & history' },
  CASHBOX: { es: 'Caja y turnos', en: 'Cashbox & shifts' },
  CUSTOMERS: { es: 'Clientes', en: 'Customers' },
  CATALOG: { es: 'Catálogo comercial', en: 'Commercial catalog' },
  INVENTORY: { es: 'Inventario operativo', en: 'Operational inventory' },
  PAYROLL: { es: 'Nómina DO (TSS e ISR)', en: 'Payroll DO (TSS & ISR)' },
  ACCOUNTING: { es: 'Contabilidad general', en: 'General accounting' },
  PURCHASES_AP: { es: 'Compras y cuentas por pagar', en: 'Purchases & AP' },
  ACCOUNTS_RECEIVABLE: { es: 'Cuentas por cobrar', en: 'Accounts receivable' },
  TREASURY: { es: 'Tesorería y bancos', en: 'Treasury & banking' },
  E_INVOICING: { es: 'Facturación electrónica', en: 'Electronic invoicing' },
};

/**
 * Isolated demo client for Commercial Landing & Configurator.
 * Replace with NetsRow HTTP API client in ERPSYSTEM/apps/web.
 */
export class MockCommercialClient implements CommercialApiClient {
  private latencyMs: number;
  private quotes: QuoteSubmissionResult[];

  constructor(latencyMs = 180) {
    this.latencyMs = latencyMs;
    this.quotes = readStoredQuotes();
  }

  async fetchCatalog(): Promise<CommercialCatalog> {
    await delay(Math.min(this.latencyMs, 90));
    return clone(SEED_COMMERCIAL_CATALOG);
  }

  async submitQuoteRequest(
    payload: QuoteSubmissionPayload,
    faultMode: CommercialFaultMode = 'NONE'
  ): Promise<QuoteSubmissionResult> {
    await delay(this.latencyMs);

    if (faultMode === 'SERVER_ERROR') {
      throw new Error('DEMO_QUOTE_SUBMIT_FAILED');
    }

    if (
      !payload.contact.contactName.trim() ||
      !payload.contact.businessName.trim() ||
      !validateQuoteContact(payload.contact.contactEmailOrWhatsapp)
    ) {
      throw new Error('VALIDATION_ERROR');
    }

    const ref = `COT-DEMO-${String(this.quotes.length + 101).padStart(4, '0')}`;
    const result: QuoteSubmissionResult = {
      quoteReference: ref,
      isDemoConfirmation: true,
      submittedAt: new Date().toISOString(),
      messageEs: `Solicitud ${ref} registrada en vista previa de demostración (sin envío a backend productivo).`,
      messageEn: `Demo request ${ref} logged locally (not submitted to a live production backend).`,
      payload: clone(payload),
    };

    this.quotes = [result, ...this.quotes];
    saveStoredQuotes(this.quotes);
    return clone(result);
  }

  async listDemoQuotes(): Promise<QuoteSubmissionResult[]> {
    await delay(40);
    return clone(this.quotes);
  }
}
