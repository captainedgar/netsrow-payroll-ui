import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  FilePlus2,
  FileText,
  KeyRound,
  ListOrdered,
  Plus,
  QrCode,
  RefreshCw,
  SearchCheck,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { DataTable, DataTableColumn } from '../components/DataTable';
import { EcfRepresentacionImpresa } from '../components/EcfRepresentacionImpresa';
import {
  ErpConfirmDialog,
  ErpFilterBar,
  ErpModal,
  ErpPageHeader,
  ErpStatePanel,
  ErpSurfaceCard,
} from '../components/ErpUiPrimitives';
import { MoneyCell } from '../components/MoneyCell';
import { StatusBadge } from '../components/StatusBadge';
import {
  IssueEcfInput,
  usePayrollWorkspace,
} from '../context/PayrollWorkspaceContext';
import {
  cleanTaxId,
  ECF_TYPE_CATALOG,
  formatENcf,
  formatTaxIdDisplay,
  getEcfStatusMeta,
  getEcfTypeMeta,
  validateDominicanTaxId,
} from '../services/eInvoicingEngine';
import {
  EcfEmissionMethod,
  EcfEnvironment,
  EcfSequenceRange,
  EcfSimulationOutcome,
  EcfStatus,
  EcfTaxpayerGroup,
  EcfTypeCode,
  ElectronicInvoice,
} from '../types/einvoicing';
import { ScreenId } from '../types/payroll';

type EcfSubTab =
  | 'e_invoicing_docs'
  | 'e_invoicing_issue'
  | 'e_invoicing_lookup'
  | 'e_invoicing_sequences'
  | 'e_invoicing_config';

interface DraftLine {
  key: string;
  productId?: string;
  sku?: string;
  descriptionEs: string;
  descriptionEn: string;
  unitCode: string;
  quantity: number;
  unitPrice: number;
  taxableItbis: boolean;
}

export const ElectronicInvoicingScreen: React.FC = () => {
  const {
    activeScreen,
    setActiveScreen,
    erpState,
    locale,
    t,
    selectedEcfId,
    setSelectedEcfId,
    ecfDraftPrefill,
    setEcfDraftPrefill,
    ecfLookupPrefill,
    setEcfLookupPrefill,
    issueElectronicInvoice,
    pollEcfTrackStatus,
    voidElectronicInvoice,
    upsertEcfSequenceRange,
    toggleEcfSequenceActive,
    updateEcfConfig,
    toggleEcfChecklistItem,
    renewDemoCertificate,
  } = usePayrollWorkspace();

  const eInv = erpState.eInvoicing;
  const invoices = eInv.invoices;
  const sequences = eInv.sequences;
  const config = eInv.config;

  const activeTab: EcfSubTab = useMemo(() => {
    if (
      activeScreen === 'e_invoicing_issue' ||
      activeScreen === 'e_invoicing_lookup' ||
      activeScreen === 'e_invoicing_sequences' ||
      activeScreen === 'e_invoicing_config'
    ) {
      return activeScreen;
    }
    return 'e_invoicing_docs';
  }, [activeScreen]);

  // --- Tab 1: Documents & Status filters ---
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | EcfTypeCode>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | EcfStatus>('ALL');
  const [riModalInvoice, setRiModalInvoice] = useState<ElectronicInvoice | null>(null);
  const [voidTarget, setVoidTarget] = useState<ElectronicInvoice | null>(null);
  const [voidReason, setVoidReason] = useState('');

  // --- Tab 2: Issue / Notes Form state ---
  const [draftType, setDraftType] = useState<EcfTypeCode>('31');
  const [draftSaleId, setDraftSaleId] = useState<string>('');
  const [draftCustomerId, setDraftCustomerId] = useState<string>('cus-2');
  const [draftBuyerName, setDraftBuyerName] = useState('Hotel Costa Dorada, SRL');
  const [draftBuyerRnc, setDraftBuyerRnc] = useState('1-31-44890-2');
  const [draftBuyerType, setDraftBuyerType] =
    useState<ElectronicInvoice['buyerType']>('CORPORATE');
  const [draftPaymentMethod, setDraftPaymentMethod] =
    useState<ElectronicInvoice['paymentMethod']>('TRANSFER');
  const [draftModifiedENcf, setDraftModifiedENcf] = useState('');
  const [draftModificationCode, setDraftModificationCode] = useState<'01' | '02' | '03'>('03');
  const [draftDiscount, setDraftDiscount] = useState('0');
  const [draftSimOutcome, setDraftSimOutcome] =
    useState<EcfSimulationOutcome>('AUTO_ACCEPTED');
  const [draftLines, setDraftLines] = useState<DraftLine[]>([
    {
      key: 'dl-init-1',
      productId: 'prd-5',
      sku: 'SKU-1005',
      descriptionEs: 'Impresora Térmica POS USB/LAN',
      descriptionEn: 'POS Thermal Receipt Printer USB/LAN',
      unitCode: 'UND',
      quantity: 1,
      unitPrice: 13500,
      taxableItbis: true,
    },
  ]);
  const [issueFormError, setIssueFormError] = useState<string | null>(null);

  // --- Tab 3: Lookup Simulator state ---
  const [lookupEmitterRnc, setLookupEmitterRnc] = useState(
    cleanTaxId(erpState.company.rnc)
  );
  const [lookupENcf, setLookupENcf] = useState(invoices[0]?.eNcf ?? '');
  const [lookupBuyerRnc, setLookupBuyerRnc] = useState(
    cleanTaxId(invoices[0]?.buyerRnc ?? '')
  );
  const [lookupSecurityCode, setLookupSecurityCode] = useState(
    invoices[0]?.securityCode ?? ''
  );
  const [lookupSubmitted, setLookupSubmitted] = useState(false);

  // --- Tab 4: Sequences modal ---
  const [seqModalOpen, setSeqModalOpen] = useState(false);
  const [seqType, setSeqType] = useState<EcfTypeCode>('31');
  const [seqFrom, setSeqFrom] = useState('1001');
  const [seqTo, setSeqTo] = useState('2000');
  const [seqAuth, setSeqAuth] = useState('AUTH-DGII-2026-NEW');
  const [seqExp, setSeqExp] = useState('2027-12-31');

  // Consume prefill coming from SalesScreen / Credit Note / Reissue
  useEffect(() => {
    if (!ecfDraftPrefill) return;
    setDraftType(ecfDraftPrefill.ecfType);
    setDraftSaleId(ecfDraftPrefill.saleId ?? '');
    setDraftCustomerId(ecfDraftPrefill.buyerId ?? 'MANUAL');
    setDraftBuyerName(ecfDraftPrefill.buyerName);
    setDraftBuyerRnc(ecfDraftPrefill.buyerRnc);
    setDraftBuyerType(ecfDraftPrefill.buyerType);
    setDraftPaymentMethod(ecfDraftPrefill.paymentMethod);
    setDraftModifiedENcf(ecfDraftPrefill.modifiedENcf ?? '');
    setDraftModificationCode(ecfDraftPrefill.modificationCode ?? '03');
    setDraftDiscount(String(ecfDraftPrefill.discountAmount ?? 0));
    setDraftLines(
      ecfDraftPrefill.items.map((it, idx) => ({
        key: `prefill-${Date.now()}-${idx}`,
        ...it,
      }))
    );
    setIssueFormError(null);
    setEcfDraftPrefill(null);
  }, [ecfDraftPrefill, setEcfDraftPrefill]);

  // Consume lookup prefill coming from RI Modal or Inspector
  useEffect(() => {
    if (!ecfLookupPrefill) return;
    setLookupEmitterRnc(cleanTaxId(ecfLookupPrefill.emitterRnc));
    setLookupENcf(ecfLookupPrefill.eNcf);
    setLookupBuyerRnc(cleanTaxId(ecfLookupPrefill.buyerRnc));
    setLookupSecurityCode(ecfLookupPrefill.securityCode);
    setLookupSubmitted(true);
    setEcfLookupPrefill(null);
  }, [ecfLookupPrefill, setEcfLookupPrefill]);

  const filteredInvoices = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return invoices.filter((inv) => {
      if (typeFilter !== 'ALL' && inv.ecfType !== typeFilter) return false;
      if (statusFilter !== 'ALL' && inv.status !== statusFilter) return false;
      if (!q) return true;
      return (
        inv.eNcf.toLowerCase().includes(q) ||
        inv.buyerName.toLowerCase().includes(q) ||
        inv.buyerRnc.toLowerCase().includes(q) ||
        inv.trackId.toLowerCase().includes(q)
      );
    });
  }, [invoices, searchQuery, typeFilter, statusFilter]);

  const activeInvoice = useMemo(
    () =>
      invoices.find((i) => i.id === selectedEcfId) ??
      filteredInvoices[0] ??
      null,
    [invoices, selectedEcfId, filteredInvoices]
  );

  const stats = useMemo(() => {
    const accepted = invoices.filter(
      (i) => i.status === 'ACEPTADO' || i.status === 'ACEPTADO_CONDICIONAL'
    ).length;
    const inProcess = invoices.filter((i) => i.status === 'EN_PROCESO').length;
    const rejectedOrVoid = invoices.filter(
      (i) => i.status === 'RECHAZADO' || i.status === 'ANULADO'
    ).length;
    const currentMonthPrefix = new Date().toISOString().slice(0, 7);
    const monthlyCount = invoices.filter((i) =>
      i.issueDate.startsWith(currentMonthPrefix)
    ).length;
    return {
      total: invoices.length,
      accepted,
      inProcess,
      rejectedOrVoid,
      monthlyCount,
    };
  }, [invoices]);

  const activeFilterCount =
    (searchQuery.trim() ? 1 : 0) +
    (typeFilter !== 'ALL' ? 1 : 0) +
    (statusFilter !== 'ALL' ? 1 : 0);

  const jumpToLookup = (inv: ElectronicInvoice) => {
    setEcfLookupPrefill({
      emitterRnc: erpState.company.rnc,
      eNcf: inv.eNcf,
      buyerRnc: inv.buyerRnc,
      securityCode: inv.securityCode,
    });
    setActiveScreen('e_invoicing_lookup');
  };

  const startAdjustmentNote = (inv: ElectronicInvoice, noteType: '33' | '34') => {
    setEcfDraftPrefill({
      ecfType: noteType,
      buyerId: inv.buyerId,
      buyerName: inv.buyerName,
      buyerRnc: inv.buyerRnc,
      buyerType: inv.buyerType,
      paymentMethod: inv.paymentMethod,
      modifiedENcf: inv.eNcf,
      modificationCode: noteType === '34' ? '03' : '02',
      discountAmount: 0,
      items: inv.items.map((it) => ({
        productId: it.productId,
        sku: it.sku,
        descriptionEs: it.descriptionEs,
        descriptionEn: it.descriptionEn,
        unitCode: it.unitCode,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        taxableItbis: it.taxableItbis,
      })),
    });
    setActiveScreen('e_invoicing_issue');
  };

  const startReissueRejected = (inv: ElectronicInvoice) => {
    setEcfDraftPrefill({
      ecfType: inv.ecfType,
      saleId: inv.saleId,
      buyerId: inv.buyerId,
      buyerName: inv.buyerName,
      buyerRnc: inv.buyerRnc,
      buyerType: inv.buyerType,
      paymentMethod: inv.paymentMethod,
      modifiedENcf: inv.modifiedENcf,
      modificationCode: inv.modificationCode,
      discountAmount: inv.discountAmount,
      items: inv.items.map((it) => ({
        productId: it.productId,
        sku: it.sku,
        descriptionEs: it.descriptionEs,
        descriptionEn: it.descriptionEn,
        unitCode: it.unitCode,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        taxableItbis: it.taxableItbis,
      })),
    });
    setActiveScreen('e_invoicing_issue');
  };

  // --- Draft helpers ---
  const draftTypeMeta = getEcfTypeMeta(draftType);
  const draftActiveSequence = useMemo(
    () =>
      sequences.find(
        (s) => s.ecfType === draftType && s.active && s.nextSeq <= s.toSeq
      ) ?? null,
    [sequences, draftType]
  );

  const draftSummary = useMemo(() => {
    const itbisRate = erpState.business.standardItbisRate / 100;
    const rawSub = draftLines.reduce((acc, l) => acc + l.quantity * l.unitPrice, 0);
    const disc = Math.max(0, Number(draftDiscount) || 0);
    const ratio = rawSub > 0 ? Math.min(1, disc / rawSub) : 0;
    let taxable = 0;
    let exempt = 0;
    let itbis = 0;
    draftLines.forEach((l) => {
      const net = l.quantity * l.unitPrice * (1 - ratio);
      if (l.taxableItbis) {
        taxable += net;
        itbis += net * itbisRate;
      } else {
        exempt += net;
      }
    });
    const total = taxable + exempt + itbis;
    return {
      taxable: Math.round(taxable * 100) / 100,
      exempt: Math.round(exempt * 100) / 100,
      itbis: Math.round(itbis * 100) / 100,
      total: Math.round(total * 100) / 100,
    };
  }, [draftLines, draftDiscount, erpState.business.standardItbisRate]);

  const handleImportFromSale = (saleId: string) => {
    setDraftSaleId(saleId);
    if (!saleId) return;
    const sale = erpState.sales.find((s) => s.id === saleId);
    if (!sale) return;
    const cust = erpState.customers.find((c) => c.id === sale.customerId);
    setDraftCustomerId(cust?.id ?? 'MANUAL');
    setDraftBuyerName(cust?.name ?? sale.customerName);
    setDraftBuyerRnc(cust?.taxId ?? '');
    setDraftBuyerType(cust?.type ?? 'INDIVIDUAL');
    setDraftPaymentMethod(sale.paymentMethod);
    setDraftType(cust?.taxId ? '31' : '32');
    setDraftDiscount(String(sale.discountAmount));
    setDraftLines(
      sale.items.map((it, idx) => ({
        key: `sale-imp-${idx}-${Date.now()}`,
        productId: it.productId,
        sku: it.sku,
        descriptionEs: it.nameEs,
        descriptionEn: it.nameEn,
        unitCode: 'UND',
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        taxableItbis: it.taxableItbis,
      }))
    );
  };

  const handleCustomerPick = (id: string) => {
    setDraftCustomerId(id);
    if (id === 'MANUAL') return;
    const cust = erpState.customers.find((c) => c.id === id);
    if (!cust) return;
    setDraftBuyerName(cust.name);
    setDraftBuyerRnc(cust.taxId);
    setDraftBuyerType(cust.type);
  };

  const handleIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIssueFormError(null);
    const validLines = draftLines.filter(
      (l) => l.descriptionEs.trim().length > 0 && l.quantity > 0 && l.unitPrice >= 0
    );
    if (validLines.length === 0) {
      setIssueFormError(
        locale === 'es'
          ? 'Incluye al menos un artículo o servicio válido.'
          : 'Include at least one valid product or service line.'
      );
      return;
    }

    const payload: IssueEcfInput = {
      ecfType: draftType,
      saleId: draftSaleId || null,
      buyerId: draftCustomerId !== 'MANUAL' ? draftCustomerId : undefined,
      buyerName: draftBuyerName,
      buyerRnc: draftBuyerRnc,
      buyerType: draftBuyerType,
      paymentMethod: draftPaymentMethod,
      modifiedENcf: draftTypeMeta.requiresModifiedEcf ? draftModifiedENcf : undefined,
      modificationCode: draftTypeMeta.requiresModifiedEcf
        ? draftModificationCode
        : undefined,
      discountAmount: Number(draftDiscount) || 0,
      simulationOutcome: draftSimOutcome,
      items: validLines.map((l) => ({
        productId: l.productId,
        sku: l.sku,
        descriptionEs: l.descriptionEs.trim(),
        descriptionEn: l.descriptionEn.trim() || l.descriptionEs.trim(),
        unitCode: l.unitCode || 'UND',
        quantity: l.quantity,
        unitPrice: l.unitPrice,
        taxableItbis: l.taxableItbis,
      })),
    };

    try {
      const created = await issueElectronicInvoice(payload);
      setActiveScreen('e_invoicing_docs');
      setRiModalInvoice(created);
    } catch (err: unknown) {
      setIssueFormError(err instanceof Error ? err.message : 'Error issuing e-CF');
    }
  };

  // --- Lookup result calculation (Pages 8–9 of Guide No. 6) ---
  const lookupEvaluation = useMemo(() => {
    if (!lookupSubmitted) return null;
    const cleanEmitter = cleanTaxId(lookupEmitterRnc);
    const companyRnc = cleanTaxId(erpState.company.rnc);
    const normalizedENcf = lookupENcf.trim().toUpperCase();
    const cleanBuyer = cleanTaxId(lookupBuyerRnc);
    const code = lookupSecurityCode.trim();

    if (cleanEmitter !== companyRnc) {
      return {
        found: false as const,
        reason:
          locale === 'es'
            ? `El RNC Emisor (${lookupEmitterRnc || '—'}) no coincide con el emisor registrado (${erpState.company.rnc}).`
            : `Emitter RNC (${lookupEmitterRnc || '—'}) does not match registered emitter (${erpState.company.rnc}).`,
      };
    }

    const matched = invoices.find(
      (i) =>
        i.eNcf.toUpperCase() === normalizedENcf &&
        i.securityCode === code &&
        (!cleanTaxId(i.buyerRnc) || cleanTaxId(i.buyerRnc) === cleanBuyer)
    );

    if (!matched) {
      return {
        found: false as const,
        reason:
          locale === 'es'
            ? 'No se encontró ningún e-CF que coincida exactamente con e-NCF, RNC Comprador y Código de Seguridad (6 caracteres sensibles a mayúsculas).'
            : 'No e-CF matched that exact e-NCF, Buyer RNC, and 6-character case-sensitive Security Code.',
      };
    }
    return { found: true as const, invoice: matched };
  }, [
    lookupSubmitted,
    lookupEmitterRnc,
    lookupENcf,
    lookupBuyerRnc,
    lookupSecurityCode,
    erpState.company.rnc,
    invoices,
    locale,
  ]);

  const columns: DataTableColumn<ElectronicInvoice>[] = [
    {
      key: 'eNcf',
      header: 'e-NCF',
      stickyLeft: true,
      render: (inv) => (
        <div>
          <div className="font-mono-num text-xs font-bold text-[var(--nr-primary)]">
            {inv.eNcf}
          </div>
          <div className="text-[11px] text-[var(--nr-text-secondary)]">
            {locale === 'es'
              ? getEcfTypeMeta(inv.ecfType).shortEs
              : getEcfTypeMeta(inv.ecfType).shortEn}
          </div>
        </div>
      ),
    },
    {
      key: 'buyer',
      header: locale === 'es' ? 'Receptor / RNC' : 'Recipient / RNC',
      minWidthClass: 'min-w-[190px]',
      render: (inv) => (
        <div className="min-w-0">
          <div className="text-xs font-semibold text-[var(--nr-text)] truncate">
            {inv.buyerName}
          </div>
          <div className="font-mono-num text-[11px] text-[var(--nr-text-secondary)]">
            {inv.buyerRnc
              ? formatTaxIdDisplay(inv.buyerRnc)
              : locale === 'es'
                ? 'Consumidor Final'
                : 'Final Consumer'}
          </div>
        </div>
      ),
    },
    {
      key: 'date',
      header: t.common.date,
      render: (inv) => (
        <span className="font-mono-num text-xs text-[var(--nr-text-secondary)] whitespace-nowrap">
          {inv.issueDate}
        </span>
      ),
    },
    {
      key: 'status',
      header: locale === 'es' ? 'Estado DGII' : 'DGII Status',
      render: (inv) => {
        const meta = getEcfStatusMeta(inv.status, locale);
        return (
          <StatusBadge
            activityStatus={meta.activityStatus}
            locale={locale}
            label={meta.label}
          />
        );
      },
    },
    {
      key: 'total',
      header: 'Total',
      align: 'right',
      render: (inv) => <MoneyCell amount={inv.totalAmount} locale={locale} emphasize />,
    },
    {
      key: 'actions',
      header: t.common.actions,
      align: 'right',
      render: (inv) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setRiModalInvoice(inv);
          }}
          className="nr-focus-ring nr-transition inline-flex items-center gap-1 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] hover:border-[var(--nr-primary)] px-2.5 py-1 text-xs font-semibold text-[var(--nr-text)] whitespace-nowrap"
        >
          <QrCode className="w-3 h-3 text-[var(--nr-primary)]" />
          <span>{locale === 'es' ? 'RI / XML' : 'RI / XML'}</span>
        </button>
      ),
    },
  ];

  const tabs: { id: EcfSubTab; label: string; icon: React.ComponentType<{ className?: string }> }[] =
    [
      { id: 'e_invoicing_docs', label: t.navigation.eInvoicingDocs, icon: FileText },
      { id: 'e_invoicing_issue', label: t.navigation.eInvoicingIssue, icon: FilePlus2 },
      { id: 'e_invoicing_lookup', label: t.navigation.eInvoicingLookup, icon: SearchCheck },
      { id: 'e_invoicing_sequences', label: t.navigation.eInvoicingSequences, icon: ListOrdered },
      { id: 'e_invoicing_config', label: t.navigation.eInvoicingConfig, icon: KeyRound },
    ];

  const handleSaveSequence = async (e: React.FormEvent) => {
    e.preventDefault();
    const fromSeq = Math.max(1, Number(seqFrom) || 1);
    const toSeq = Math.max(fromSeq, Number(seqTo) || fromSeq + 99);
    const newRange: EcfSequenceRange = {
      id: `seq-${seqType}-${Date.now()}`,
      ecfType: seqType,
      prefix: `E${seqType}`,
      fromSeq,
      toSeq,
      nextSeq: fromSeq,
      authorizationNumber: seqAuth.trim() || `AUTH-DGII-${Date.now().toString().slice(-6)}`,
      expirationDate: seqExp || '2027-12-31',
      branchId: erpState.activeBranchId,
      active: true,
      alertThreshold: Math.max(10, Math.round((toSeq - fromSeq + 1) * 0.1)),
    };
    await upsertEcfSequenceRange(newRange);
    setSeqModalOpen(false);
  };

  return (
    <div className="space-y-5">
      <ErpPageHeader
        title={
          locale === 'es'
            ? 'Facturación Electrónica (e-CF · DGII)'
            : 'Electronic Invoicing (e-CF · DGII)'
        }
        subtitle={
          locale === 'es'
            ? 'Emisión XML firmada, secuencias e-NCF (E31–E47), seguimiento TrackID, representación impresa con QR y verificación pública DGII.'
            : 'Digitally signed XML issuance, e-NCF sequences (E31–E47), TrackID status polling, QR printable RI, and DGII verification.'
        }
        badge={
          <StatusBadge
            activityStatus={config.environment === 'PRODUCCION' ? 'approved' : 'pending'}
            locale={locale}
            label={`${
              config.environment === 'PRODUCCION'
                ? locale === 'es'
                  ? 'Producción'
                  : 'Production'
                : locale === 'es'
                  ? 'Precertificación'
                  : 'Pre-Cert'
            } · ${t.topBar.demoOnlyTag}`}
          />
        }
        actions={
          <button
            type="button"
            onClick={() => setActiveScreen('e_invoicing_issue')}
            className="nr-focus-ring nr-transition inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-[var(--nr-primary)] hover:bg-[var(--nr-primary-hover)] text-xs font-semibold text-[var(--nr-primary-fg)] whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{locale === 'es' ? 'Emitir e-CF' : 'Issue e-CF'}</span>
          </button>
        }
      />

      {/* Segmented Navigation Tabs */}
      <div
        role="tablist"
        aria-label={locale === 'es' ? 'Secciones e-CF' : 'e-CF sections'}
        className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface)]"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActiveScreen(tab.id as ScreenId)}
              className={`nr-focus-ring nr-transition inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap ${
                active
                  ? 'bg-[var(--nr-primary)] text-[var(--nr-primary-fg)]'
                  : 'text-[var(--nr-text-secondary)] hover:text-[var(--nr-text)] hover:bg-[var(--nr-surface-muted)]'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: EMITTED e-CF DOCUMENTS & DGII TRACKID STATUS */}
      {activeTab === 'e_invoicing_docs' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
            <ErpSurfaceCard className="space-y-1">
              <div className="text-xs font-semibold text-[var(--nr-text-secondary)]">
                {locale === 'es' ? 'Comprobantes emitidos' : 'Issued e-CFs'}
              </div>
              <div className="font-mono-num text-2xl font-bold text-[var(--nr-text)]">
                {stats.total}
              </div>
              <div className="text-[11px] text-[var(--nr-text-secondary)]">
                {config.emissionMethod === 'FACTURADOR_GRATUITO'
                  ? `${stats.monthlyCount}/${config.freeToolMonthlyLimit} ${
                      locale === 'es' ? 'cupo mensual gratuito' : 'monthly free cap'
                    }`
                  : locale === 'es'
                    ? 'Modalidad Proveedor / Propio'
                    : 'Certified Provider / Own Dev'}
              </div>
            </ErpSurfaceCard>

            <ErpSurfaceCard className="space-y-1">
              <div className="text-xs font-semibold text-[var(--nr-text-secondary)]">
                {locale === 'es' ? 'Aceptados por DGII' : 'DGII Accepted'}
              </div>
              <div className="font-mono-num text-2xl font-bold text-[var(--nr-success)]">
                {stats.accepted}
              </div>
              <div className="text-[11px] text-[var(--nr-text-secondary)]">
                {locale === 'es'
                  ? 'Válidos para crédito fiscal / costo'
                  : 'Valid for tax credit & deductions'}
              </div>
            </ErpSurfaceCard>

            <ErpSurfaceCard className="space-y-1">
              <div className="text-xs font-semibold text-[var(--nr-text-secondary)]">
                {locale === 'es' ? 'En proceso (TrackID)' : 'In Process (TrackID)'}
              </div>
              <div className="font-mono-num text-2xl font-bold text-[var(--nr-warning)]">
                {stats.inProcess}
              </div>
              <div className="text-[11px] text-[var(--nr-text-secondary)]">
                {locale === 'es'
                  ? 'Requieren consulta TrackID'
                  : 'Require TrackID status query'}
              </div>
            </ErpSurfaceCard>

            <ErpSurfaceCard className="space-y-1">
              <div className="text-xs font-semibold text-[var(--nr-text-secondary)]">
                {locale === 'es' ? 'Rechazados / Anulados' : 'Rejected / Voided'}
              </div>
              <div className="font-mono-num text-2xl font-bold text-[var(--nr-error)]">
                {stats.rejectedOrVoid}
              </div>
              <div className="text-[11px] text-[var(--nr-text-secondary)]">
                {locale === 'es'
                  ? 'Sin validez tributaria vigente'
                  : 'Not valid for fiscal purposes'}
              </div>
            </ErpSurfaceCard>
          </div>

          <ErpFilterBar
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder={
              locale === 'es'
                ? 'Buscar por e-NCF, cliente, RNC o TrackID…'
                : 'Search by e-NCF, buyer, RNC, or TrackID…'
            }
            hasActiveFilters={activeFilterCount > 0}
            activeFilterCount={activeFilterCount}
            activeFilterLabel={
              locale === 'es' ? 'Filtros activos' : 'Active filters'
            }
            clearLabel={locale === 'es' ? 'Limpiar' : 'Clear'}
            onClearFilters={() => {
              setSearchQuery('');
              setTypeFilter('ALL');
              setStatusFilter('ALL');
            }}
          >
            <select
              aria-label={locale === 'es' ? 'Filtrar por tipo e-CF' : 'Filter by e-CF type'}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as 'ALL' | EcfTypeCode)}
              className="nr-focus-ring h-10 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-3 text-xs font-semibold text-[var(--nr-text)]"
            >
              <option value="ALL">
                {locale === 'es' ? 'Todos los tipos (E31–E47)' : 'All types (E31–E47)'}
              </option>
              {ECF_TYPE_CATALOG.map((meta) => (
                <option key={meta.code} value={meta.code}>
                  {meta.prefix} · {locale === 'es' ? meta.shortEs : meta.shortEn}
                </option>
              ))}
            </select>

            <select
              aria-label={locale === 'es' ? 'Filtrar por estado DGII' : 'Filter by DGII status'}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'ALL' | EcfStatus)}
              className="nr-focus-ring h-10 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-3 text-xs font-semibold text-[var(--nr-text)]"
            >
              <option value="ALL">
                {locale === 'es' ? 'Todos los estados DGII' : 'All DGII statuses'}
              </option>
              <option value="ACEPTADO">{locale === 'es' ? 'Aceptado' : 'Accepted'}</option>
              <option value="ACEPTADO_CONDICIONAL">
                {locale === 'es' ? 'Aceptado condicional' : 'Conditionally accepted'}
              </option>
              <option value="EN_PROCESO">{locale === 'es' ? 'En proceso' : 'In process'}</option>
              <option value="RECHAZADO">{locale === 'es' ? 'Rechazado' : 'Rejected'}</option>
              <option value="ANULADO">{locale === 'es' ? 'Anulado' : 'Voided'}</option>
            </select>
          </ErpFilterBar>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
            <div className="xl:col-span-7">
              {filteredInvoices.length === 0 ? (
                <ErpStatePanel
                  variant="empty"
                  title={t.common.noResults}
                  description={
                    locale === 'es'
                      ? 'No hay comprobantes electrónicos que coincidan con tu búsqueda.'
                      : 'No electronic invoices match the current filter.'
                  }
                  actionLabel={locale === 'es' ? 'Emitir nuevo e-CF' : 'Issue new e-CF'}
                  onAction={() => setActiveScreen('e_invoicing_issue')}
                />
              ) : (
                <DataTable
                  columns={columns}
                  rows={filteredInvoices}
                  getRowKey={(inv) => inv.id}
                  selectedRowKey={activeInvoice?.id ?? null}
                  onRowClick={(inv) => setSelectedEcfId(inv.id)}
                  emptyMessage={t.common.noResults}
                />
              )}
            </div>

            {/* Right-hand e-CF Inspector */}
            <div className="xl:col-span-5">
              <ErpSurfaceCard padding="md" className="space-y-4">
                {!activeInvoice ? (
                  <ErpStatePanel
                    variant="empty"
                    title={locale === 'es' ? 'Selecciona un e-CF' : 'Select an e-CF'}
                    description={
                      locale === 'es'
                        ? 'Haz clic en cualquier comprobante de la tabla para consultar TrackID, firma XML, código QR y acciones DGII.'
                        : 'Select any invoice to inspect TrackID, XML signature, QR code, and DGII actions.'
                    }
                  />
                ) : (
                  (() => {
                    const meta = getEcfTypeMeta(activeInvoice.ecfType);
                    const statusMeta = getEcfStatusMeta(activeInvoice.status, locale);
                    return (
                      <>
                        <div className="flex items-start justify-between gap-2 pb-3 border-b border-[var(--nr-border)]">
                          <div className="min-w-0">
                            <div className="font-mono-num text-sm font-bold text-[var(--nr-primary)]">
                              {activeInvoice.eNcf}
                            </div>
                            <div className="text-xs font-semibold text-[var(--nr-text)] mt-0.5">
                              {locale === 'es' ? meta.nameEs : meta.nameEn}
                            </div>
                            <div className="text-[11px] text-[var(--nr-text-secondary)]">
                              {activeInvoice.buyerName} ·{' '}
                              <span className="font-mono-num">
                                {activeInvoice.buyerRnc
                                  ? formatTaxIdDisplay(activeInvoice.buyerRnc)
                                  : locale === 'es'
                                    ? 'Consumidor Final'
                                    : 'Final Consumer'}
                              </span>
                            </div>
                          </div>
                          <StatusBadge
                            activityStatus={statusMeta.activityStatus}
                            locale={locale}
                            label={statusMeta.label}
                          />
                        </div>

                        {/* DGII Guide Status Guidance Box */}
                        <div className="rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] p-3 space-y-1.5 text-xs">
                          <div className="font-semibold text-[var(--nr-text)]">
                            {locale === 'es'
                              ? activeInvoice.statusMessageEs
                              : activeInvoice.statusMessageEn}
                          </div>
                          <p className="text-[11px] text-[var(--nr-text-secondary)]">
                            {statusMeta.guideExplanation}
                          </p>
                          {(activeInvoice.observationEs || activeInvoice.voidReason) && (
                            <div className="pt-1.5 border-t border-[var(--nr-border)] text-[11px] text-[var(--nr-warning)] font-medium">
                              {activeInvoice.voidReason
                                ? `${locale === 'es' ? 'Motivo anulación:' : 'Void reason:'} ${activeInvoice.voidReason}`
                                : locale === 'es'
                                  ? activeInvoice.observationEs
                                  : activeInvoice.observationEn}
                            </div>
                          )}
                        </div>

                        {/* Technical Security Metadata */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] p-2.5">
                            <div className="text-[10px] uppercase tracking-wider text-[var(--nr-text-secondary)]">
                              TrackID DGII
                            </div>
                            <div className="font-mono-num font-semibold text-[var(--nr-text)] truncate mt-0.5">
                              {activeInvoice.trackId}
                            </div>
                          </div>
                          <div className="rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] p-2.5">
                            <div className="text-[10px] uppercase tracking-wider text-[var(--nr-text-secondary)]">
                              {locale === 'es' ? 'Código Seguridad' : 'Security Code'}
                            </div>
                            <div className="font-mono-num font-bold text-[var(--nr-primary)] mt-0.5">
                              {activeInvoice.securityCode}
                            </div>
                          </div>
                          <div className="rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] p-2.5">
                            <div className="text-[10px] uppercase tracking-wider text-[var(--nr-text-secondary)]">
                              {locale === 'es' ? 'Firma Digital' : 'Digital Signature'}
                            </div>
                            <div className="font-mono-num text-[var(--nr-text)] truncate mt-0.5">
                              {activeInvoice.digitalSignatureDate}
                            </div>
                          </div>
                          <div className="rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] p-2.5">
                            <div className="text-[10px] uppercase tracking-wider text-[var(--nr-text-secondary)]">
                              Total e-CF
                            </div>
                            <div className="mt-0.5">
                              <MoneyCell amount={activeInvoice.totalAmount} locale={locale} emphasize />
                            </div>
                          </div>
                        </div>

                        {/* Operational DGII Actions */}
                        <div className="space-y-2 pt-1">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setRiModalInvoice(activeInvoice)}
                              className="nr-focus-ring nr-transition h-9 px-3 rounded-lg bg-[var(--nr-primary)] hover:bg-[var(--nr-primary-hover)] text-xs font-semibold text-[var(--nr-primary-fg)] inline-flex items-center justify-center gap-1.5"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                              <span>
                                {locale === 'es' ? 'Ver RI, QR y XML' : 'View RI, QR & XML'}
                              </span>
                            </button>

                            <button
                              type="button"
                              onClick={() => jumpToLookup(activeInvoice)}
                              className="nr-focus-ring nr-transition h-9 px-3 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] hover:bg-[var(--nr-surface-muted)] text-xs font-semibold text-[var(--nr-text)] inline-flex items-center justify-center gap-1.5"
                            >
                              <SearchCheck className="w-3.5 h-3.5 text-[var(--nr-primary)]" />
                              <span>
                                {locale === 'es' ? 'Verificar Consulta DGII' : 'Run DGII Lookup'}
                              </span>
                            </button>
                          </div>

                          {activeInvoice.status === 'EN_PROCESO' && (
                            <div className="rounded-xl border border-[var(--nr-warning-border)] bg-[var(--nr-warning-bg)] p-3 space-y-2">
                              <div className="text-xs font-semibold text-[var(--nr-warning)]">
                                {locale === 'es'
                                  ? 'Pendiente de respuesta final (Guía No. 6, pág. 6)'
                                  : 'Pending final DGII validation (Guide No. 6, p. 6)'}
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() => pollEcfTrackStatus(activeInvoice.id, 'ACEPTADO')}
                                  className="nr-focus-ring nr-transition inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[var(--nr-primary)] text-xs font-semibold text-white"
                                >
                                  <RefreshCw className="w-3.5 h-3.5" />
                                  <span>
                                    {locale === 'es'
                                      ? 'Consultar TrackID (Aceptar)'
                                      : 'Query TrackID (Accept)'}
                                  </span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    pollEcfTrackStatus(activeInvoice.id, 'ACEPTADO_CONDICIONAL')
                                  }
                                  className="nr-focus-ring nr-transition h-8 px-2.5 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface)] text-xs font-semibold text-[var(--nr-text)]"
                                >
                                  {locale === 'es' ? 'Simular Condicional' : 'Sim. Conditional'}
                                </button>
                              </div>
                            </div>
                          )}

                          {activeInvoice.status === 'RECHAZADO' && (
                            <button
                              type="button"
                              onClick={() => startReissueRejected(activeInvoice)}
                              className="nr-focus-ring nr-transition w-full h-9 px-3 rounded-lg border border-[var(--nr-warning-border)] bg-[var(--nr-warning-bg)] text-xs font-semibold text-[var(--nr-warning)] inline-flex items-center justify-center gap-1.5"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              <span>
                                {locale === 'es'
                                  ? 'Corregir datos y reemitir nuevo e-NCF'
                                  : 'Fix data & reissue new e-NCF'}
                              </span>
                            </button>
                          )}

                          {(activeInvoice.status === 'ACEPTADO' ||
                            activeInvoice.status === 'ACEPTADO_CONDICIONAL') &&
                            activeInvoice.ecfType !== '34' && (
                              <div className="grid grid-cols-2 gap-2">
                                <button
                                  type="button"
                                  onClick={() => startAdjustmentNote(activeInvoice, '34')}
                                  className="nr-focus-ring nr-transition h-9 px-2.5 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface)] hover:bg-[var(--nr-surface-muted)] text-xs font-semibold text-[var(--nr-text)]"
                                >
                                  {locale === 'es' ? 'Nota Crédito (E34)' : 'Credit Note (E34)'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => startAdjustmentNote(activeInvoice, '33')}
                                  className="nr-focus-ring nr-transition h-9 px-2.5 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface)] hover:bg-[var(--nr-surface-muted)] text-xs font-semibold text-[var(--nr-text)]"
                                >
                                  {locale === 'es' ? 'Nota Débito (E33)' : 'Debit Note (E33)'}
                                </button>
                              </div>
                            )}

                          {activeInvoice.status !== 'ANULADO' &&
                            activeInvoice.status !== 'RECHAZADO' && (
                              <button
                                type="button"
                                onClick={() => {
                                  setVoidReason('');
                                  setVoidTarget(activeInvoice);
                                }}
                                className="nr-focus-ring nr-transition w-full h-9 px-3 rounded-lg border border-[var(--nr-error-border)] bg-[var(--nr-error-bg)] hover:opacity-90 text-xs font-semibold text-[var(--nr-error)] inline-flex items-center justify-center gap-1.5"
                              >
                                <Ban className="w-3.5 h-3.5" />
                                <span>
                                  {locale === 'es'
                                    ? 'Anular comprobante (Formato DGII)'
                                    : 'Void e-CF (DGII format)'}
                                </span>
                              </button>
                            )}
                        </div>
                      </>
                    );
                  })()
                )}
              </ErpSurfaceCard>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ISSUE NEW e-CF / CREDIT & DEBIT NOTES (31-47) */}
      {activeTab === 'e_invoicing_issue' && (
        <form onSubmit={handleIssueSubmit} className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
          <div className="xl:col-span-8 space-y-4">
            <ErpSurfaceCard padding="md" className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[var(--nr-border)]">
                <div>
                  <h2 className="font-display text-base font-bold text-[var(--nr-text)]">
                    {locale === 'es'
                      ? '1. Tipo de comprobante e-CF y receptor'
                      : '1. e-CF Document Type & Recipient'}
                  </h2>
                  <p className="text-xs text-[var(--nr-text-secondary)]">
                    {locale === 'es' ? draftTypeMeta.descriptionEs : draftTypeMeta.descriptionEn}
                  </p>
                </div>

                {/* Quick import from existing ERP sale */}
                <div className="w-full sm:w-64">
                  <select
                    aria-label={locale === 'es' ? 'Importar desde venta' : 'Import from sale'}
                    value={draftSaleId}
                    onChange={(e) => handleImportFromSale(e.target.value)}
                    className="nr-focus-ring w-full h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-2.5 text-xs font-semibold text-[var(--nr-text)]"
                  >
                    <option value="">
                      {locale === 'es' ? 'Importar desde venta POS…' : 'Import from POS sale…'}
                    </option>
                    {erpState.sales.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.number} · {s.customerName} (RD${s.total.toFixed(0)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--nr-text-secondary)] mb-1">
                    {locale === 'es' ? 'Tipo e-CF (Guía DGII No. 6)' : 'e-CF Type (DGII Guide No. 6)'}
                  </label>
                  <select
                    value={draftType}
                    onChange={(e) => setDraftType(e.target.value as EcfTypeCode)}
                    className="nr-focus-ring w-full h-10 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-3 text-xs font-semibold text-[var(--nr-text)]"
                  >
                    {ECF_TYPE_CATALOG.map((meta) => (
                      <option key={meta.code} value={meta.code}>
                        {meta.prefix} — {locale === 'es' ? meta.nameEs : meta.nameEn}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--nr-text-secondary)] mb-1">
                    {locale === 'es' ? 'Cliente / Receptor del ERP' : 'ERP Customer / Recipient'}
                  </label>
                  <select
                    value={draftCustomerId}
                    onChange={(e) => handleCustomerPick(e.target.value)}
                    className="nr-focus-ring w-full h-10 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-3 text-xs font-semibold text-[var(--nr-text)]"
                  >
                    {erpState.customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code} · {c.name} {c.taxId ? `(${c.taxId})` : ''}
                      </option>
                    ))}
                    <option value="MANUAL">
                      {locale === 'es' ? 'Ingreso manual (Suplidor / Otro)' : 'Manual entry (Vendor / Other)'}
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--nr-text-secondary)] mb-1">
                    {locale === 'es' ? 'Razón social / Nombre receptor' : 'Recipient Legal Name'}
                  </label>
                  <input
                    type="text"
                    value={draftBuyerName}
                    onChange={(e) => setDraftBuyerName(e.target.value)}
                    required
                    className="nr-focus-ring w-full h-10 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface)] px-3 text-xs text-[var(--nr-text)]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--nr-text-secondary)] mb-1">
                    RNC / Cédula {draftTypeMeta.requiresBuyerRnc ? '*' : `(${locale === 'es' ? 'opcional' : 'optional'})`}
                  </label>
                  <input
                    type="text"
                    value={draftBuyerRnc}
                    onChange={(e) => setDraftBuyerRnc(e.target.value)}
                    placeholder="1-31-44890-2"
                    className="nr-focus-ring w-full h-10 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface)] px-3 text-xs font-mono-num text-[var(--nr-text)]"
                  />
                  {draftBuyerRnc.trim() && (
                    <div
                      className={`mt-1 text-[11px] font-medium ${
                        validateDominicanTaxId(draftBuyerRnc).valid
                          ? 'text-[var(--nr-success)]'
                          : 'text-[var(--nr-warning)]'
                      }`}
                    >
                      {validateDominicanTaxId(draftBuyerRnc).valid
                        ? `${validateDominicanTaxId(draftBuyerRnc).kind} ${
                            locale === 'es' ? 'válido' : 'valid'
                          }`
                        : locale === 'es'
                          ? 'Ingresa 9 dígitos (RNC) u 11 dígitos (Cédula).'
                          : 'Enter 9 digits (RNC) or 11 digits (National ID).'}
                    </div>
                  )}
                </div>

                {draftTypeMeta.requiresModifiedEcf && (
                  <>
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--nr-text-secondary)] mb-1">
                        {locale === 'es' ? 'e-NCF Modificado *' : 'Modified e-NCF *'}
                      </label>
                      <select
                        value={draftModifiedENcf}
                        onChange={(e) => setDraftModifiedENcf(e.target.value)}
                        className="nr-focus-ring w-full h-10 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-3 text-xs font-mono-num font-semibold text-[var(--nr-text)]"
                      >
                        <option value="">
                          {locale === 'es' ? 'Selecciona comprobante original…' : 'Select original e-CF…'}
                        </option>
                        {invoices
                          .filter((i) => i.ecfType === '31' || i.ecfType === '32')
                          .map((i) => (
                            <option key={i.id} value={i.eNcf}>
                              {i.eNcf} · {i.buyerName} (RD${i.totalAmount.toFixed(2)})
                            </option>
                          ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--nr-text-secondary)] mb-1">
                        {locale === 'es' ? 'Código de modificación' : 'Modification Code'}
                      </label>
                      <select
                        value={draftModificationCode}
                        onChange={(e) =>
                          setDraftModificationCode(e.target.value as '01' | '02' | '03')
                        }
                        className="nr-focus-ring w-full h-10 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-3 text-xs font-semibold text-[var(--nr-text)]"
                      >
                        <option value="01">
                          01 · {locale === 'es' ? 'Anulación total' : 'Full cancellation'}
                        </option>
                        <option value="02">
                          02 · {locale === 'es' ? 'Corrección de texto / cargo' : 'Text / charge adjustment'}
                        </option>
                        <option value="03">
                          03 · {locale === 'es' ? 'Corrección de monto / devolución' : 'Amount adjustment / return'}
                        </option>
                      </select>
                    </div>
                  </>
                )}
              </div>
            </ErpSurfaceCard>

            {/* Line Items */}
            <ErpSurfaceCard padding="md" className="space-y-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-display text-base font-bold text-[var(--nr-text)]">
                  {locale === 'es' ? '2. Detalle de ítems e ITBIS' : '2. Line Items & ITBIS'}
                </h2>
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    aria-label={locale === 'es' ? 'Agregar producto del catálogo' : 'Add catalog product'}
                    defaultValue=""
                    onChange={(e) => {
                      const prod = erpState.products.find((p) => p.id === e.target.value);
                      if (!prod) return;
                      setDraftLines((prev) => [
                        ...prev,
                        {
                          key: `dl-${Date.now()}-${Math.random()}`,
                          productId: prod.id,
                          sku: prod.sku,
                          descriptionEs: prod.nameEs,
                          descriptionEn: prod.nameEn,
                          unitCode: 'UND',
                          quantity: 1,
                          unitPrice: prod.price,
                          taxableItbis: prod.taxableItbis,
                        },
                      ]);
                      e.target.value = '';
                    }}
                    className="nr-focus-ring h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-2.5 text-xs font-semibold text-[var(--nr-text)]"
                  >
                    <option value="">
                      {locale === 'es' ? '+ Agregar del catálogo…' : '+ Add from catalog…'}
                    </option>
                    {erpState.products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.sku} · {locale === 'es' ? p.nameEs : p.nameEn} (RD${p.price})
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() =>
                      setDraftLines((prev) => [
                        ...prev,
                        {
                          key: `dl-custom-${Date.now()}`,
                          descriptionEs: '',
                          descriptionEn: '',
                          unitCode: 'SRV',
                          quantity: 1,
                          unitPrice: 0,
                          taxableItbis: true,
                        },
                      ])
                    }
                    className="nr-focus-ring nr-transition inline-flex items-center gap-1 h-9 px-3 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface)] hover:bg-[var(--nr-surface-muted)] text-xs font-semibold text-[var(--nr-text)]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{locale === 'es' ? 'Línea manual' : 'Custom line'}</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2.5">
                {draftLines.map((line) => (
                  <div
                    key={line.key}
                    className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] p-2.5"
                  >
                    <div className="sm:col-span-5">
                      <input
                        type="text"
                        value={line.descriptionEs}
                        onChange={(e) =>
                          setDraftLines((prev) =>
                            prev.map((item) =>
                              item.key === line.key
                                ? {
                                    ...item,
                                    descriptionEs: e.target.value,
                                    descriptionEn: e.target.value,
                                  }
                                : item
                            )
                          )
                        }
                        placeholder={locale === 'es' ? 'Descripción del bien o servicio' : 'Item or service description'}
                        className="nr-focus-ring w-full h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface)] px-2.5 text-xs text-[var(--nr-text)]"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={line.quantity}
                        onChange={(e) =>
                          setDraftLines((prev) =>
                            prev.map((item) =>
                              item.key === line.key
                                ? { ...item, quantity: Math.max(1, Number(e.target.value) || 1) }
                                : item
                            )
                          )
                        }
                        aria-label={locale === 'es' ? 'Cantidad' : 'Quantity'}
                        className="nr-focus-ring w-full h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface)] px-2 text-xs font-mono-num text-[var(--nr-text)]"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={line.unitPrice}
                        onChange={(e) =>
                          setDraftLines((prev) =>
                            prev.map((item) =>
                              item.key === line.key
                                ? { ...item, unitPrice: Math.max(0, Number(e.target.value) || 0) }
                                : item
                            )
                          )
                        }
                        aria-label={locale === 'es' ? 'Precio unitario' : 'Unit price'}
                        className="nr-focus-ring w-full h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface)] px-2 text-xs font-mono-num text-[var(--nr-text)]"
                      />
                    </div>
                    <div className="sm:col-span-2 flex items-center gap-1.5">
                      <label className="inline-flex items-center gap-1.5 text-xs text-[var(--nr-text)] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={line.taxableItbis}
                          onChange={(e) =>
                            setDraftLines((prev) =>
                              prev.map((item) =>
                                item.key === line.key
                                  ? { ...item, taxableItbis: e.target.checked }
                                  : item
                              )
                            )
                          }
                          className="rounded border-[var(--nr-border)] text-[var(--nr-primary)]"
                        />
                        <span>ITBIS</span>
                      </label>
                    </div>
                    <div className="sm:col-span-1 flex justify-end">
                      <button
                        type="button"
                        aria-label={locale === 'es' ? 'Eliminar línea' : 'Remove line'}
                        disabled={draftLines.length <= 1}
                        onClick={() =>
                          setDraftLines((prev) => prev.filter((item) => item.key !== line.key))
                        }
                        className="nr-focus-ring p-1.5 rounded-lg text-[var(--nr-error)] hover:bg-[var(--nr-error-bg)] disabled:opacity-40"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </ErpSurfaceCard>
          </div>

          {/* Right Summary & Firmado DGII Box */}
          <div className="xl:col-span-4 space-y-4">
            <ErpSurfaceCard padding="md" className="space-y-4">
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-[var(--nr-border)]">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--nr-text-secondary)]">
                  {locale === 'es' ? 'Resumen de Emisión' : 'Issuance Summary'}
                </span>
                <span className="font-mono-num text-xs font-bold text-[var(--nr-primary)]">
                  {draftActiveSequence
                    ? formatENcf(draftType, draftActiveSequence.nextSeq)
                    : locale === 'es'
                      ? 'Sin secuencia'
                      : 'No sequence'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--nr-text-secondary)] mb-1">
                    {locale === 'es' ? 'Pago' : 'Payment'}
                  </label>
                  <select
                    value={draftPaymentMethod}
                    onChange={(e) =>
                      setDraftPaymentMethod(
                        e.target.value as ElectronicInvoice['paymentMethod']
                      )
                    }
                    className="nr-focus-ring w-full h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-2 text-xs font-semibold text-[var(--nr-text)]"
                  >
                    <option value="TRANSFER">{locale === 'es' ? 'Transferencia' : 'Transfer'}</option>
                    <option value="CASH">{locale === 'es' ? 'Efectivo' : 'Cash'}</option>
                    <option value="CARD">{locale === 'es' ? 'Tarjeta' : 'Card'}</option>
                    <option value="CREDIT">{locale === 'es' ? 'Crédito' : 'Credit'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--nr-text-secondary)] mb-1">
                    {locale === 'es' ? 'Descuento RD$' : 'Discount RD$'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={draftDiscount}
                    onChange={(e) => setDraftDiscount(e.target.value)}
                    className="nr-focus-ring w-full h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface)] px-2.5 text-xs font-mono-num text-[var(--nr-text)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--nr-text-secondary)] mb-1">
                  {locale === 'es'
                    ? 'Respuesta Web Service DGII (Simulación)'
                    : 'DGII Web Service Outcome (Demo)'}
                </label>
                <select
                  value={draftSimOutcome}
                  onChange={(e) => setDraftSimOutcome(e.target.value as EcfSimulationOutcome)}
                  className="nr-focus-ring w-full h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-2.5 text-xs font-semibold text-[var(--nr-text)]"
                >
                  <option value="AUTO_ACCEPTED">
                    {locale === 'es' ? 'Aceptado (Validación exitosa)' : 'Accepted (Valid)'}
                  </option>
                  <option value="CONDITIONAL">
                    {locale === 'es'
                      ? 'Aceptado condicional (Con advertencia)'
                      : 'Conditionally accepted (With warning)'}
                  </option>
                  <option value="IN_PROCESS">
                    {locale === 'es'
                      ? 'En proceso (Probar consulta TrackID)'
                      : 'In process (Test TrackID polling)'}
                  </option>
                  <option value="REJECTED">
                    {locale === 'es' ? 'Rechazado (Simular error XSD)' : 'Rejected (Sim. XSD error)'}
                  </option>
                </select>
              </div>

              <div className="rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] p-3 space-y-1.5 text-xs">
                <div className="flex justify-between text-[var(--nr-text-secondary)]">
                  <span>{locale === 'es' ? 'Gravado' : 'Taxable'}</span>
                  <MoneyCell amount={draftSummary.taxable} locale={locale} />
                </div>
                <div className="flex justify-between text-[var(--nr-text-secondary)]">
                  <span>{locale === 'es' ? 'Exento' : 'Exempt'}</span>
                  <MoneyCell amount={draftSummary.exempt} locale={locale} />
                </div>
                <div className="flex justify-between text-[var(--nr-text-secondary)]">
                  <span>ITBIS ({erpState.business.standardItbisRate}%)</span>
                  <MoneyCell amount={draftSummary.itbis} locale={locale} />
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-[var(--nr-border)] font-bold text-sm text-[var(--nr-text)]">
                  <span>Total e-CF</span>
                  <MoneyCell amount={draftSummary.total} locale={locale} size="lg" emphasize />
                </div>
              </div>

              {issueFormError && (
                <div
                  role="alert"
                  className="rounded-lg border border-[var(--nr-error-border)] bg-[var(--nr-error-bg)] px-3 py-2 text-xs text-[var(--nr-error)] flex items-start gap-2"
                >
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{issueFormError}</span>
                </div>
              )}

              <button
                type="submit"
                className="nr-focus-ring nr-transition w-full h-11 rounded-xl bg-[var(--nr-primary)] hover:bg-[var(--nr-primary-hover)] text-xs sm:text-sm font-bold text-[var(--nr-primary-fg)] flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>
                  {locale === 'es'
                    ? 'Firmar XML y emitir e-CF'
                    : 'Sign XML & Issue e-CF'}
                </span>
              </button>
            </ErpSurfaceCard>
          </div>
        </form>
      )}

      {/* TAB 3: PUBLIC CONSULTATION & QR VERIFICATION (Pages 8-9) */}
      {activeTab === 'e_invoicing_lookup' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <ErpSurfaceCard className="lg:col-span-5 space-y-4">
            <div>
              <h2 className="font-display text-base font-bold text-[var(--nr-text)]">
                {locale === 'es'
                  ? 'Consulta de validez e-NCF / Código QR'
                  : 'e-NCF & QR Validity Lookup'}
              </h2>
              <p className="text-xs text-[var(--nr-text-secondary)] mt-1">
                {locale === 'es'
                  ? 'Simulador fiel al procedimiento oficial de verificación de la Guía DGII No. 6 (págs. 8–9).'
                  : 'Simulator aligned with the official DGII Guide No. 6 verification steps (pp. 8–9).'}
              </p>
            </div>

            {/* Quick pickers for testing */}
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--nr-text-secondary)] mb-1.5">
                {locale === 'es' ? 'Autocompletar con un e-CF emitido:' : 'Quick-fill from issued e-CF:'}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {invoices.slice(0, 5).map((inv) => (
                  <button
                    key={inv.id}
                    type="button"
                    onClick={() => {
                      setLookupEmitterRnc(cleanTaxId(erpState.company.rnc));
                      setLookupENcf(inv.eNcf);
                      setLookupBuyerRnc(cleanTaxId(inv.buyerRnc));
                      setLookupSecurityCode(inv.securityCode);
                      setLookupSubmitted(true);
                    }}
                    className="nr-focus-ring nr-transition px-2.5 py-1 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] hover:border-[var(--nr-primary)] font-mono-num text-[11px] font-semibold text-[var(--nr-text)]"
                  >
                    {inv.eNcf}
                  </button>
                ))}
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setLookupSubmitted(true);
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--nr-text-secondary)] mb-1">
                  1. RNC Emisor
                </label>
                <input
                  type="text"
                  value={lookupEmitterRnc}
                  onChange={(e) => setLookupEmitterRnc(e.target.value)}
                  required
                  className="nr-focus-ring w-full h-10 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface)] px-3 text-xs font-mono-num text-[var(--nr-text)]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--nr-text-secondary)] mb-1">
                  2. e-NCF (13 caracteres)
                </label>
                <input
                  type="text"
                  value={lookupENcf}
                  onChange={(e) => setLookupENcf(e.target.value)}
                  placeholder="E310000000001"
                  required
                  className="nr-focus-ring w-full h-10 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface)] px-3 text-xs font-mono-num text-[var(--nr-text)]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--nr-text-secondary)] mb-1">
                  3. RNC Comprador {locale === 'es' ? '(si aplica)' : '(if applicable)'}
                </label>
                <input
                  type="text"
                  value={lookupBuyerRnc}
                  onChange={(e) => setLookupBuyerRnc(e.target.value)}
                  placeholder="131448902"
                  className="nr-focus-ring w-full h-10 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface)] px-3 text-xs font-mono-num text-[var(--nr-text)]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--nr-text-secondary)] mb-1">
                  4. {locale === 'es' ? 'Código de Seguridad (6 dígitos)' : 'Security Code (6 chars)'}
                </label>
                <input
                  type="text"
                  value={lookupSecurityCode}
                  onChange={(e) => setLookupSecurityCode(e.target.value)}
                  placeholder="WkT3Sa"
                  required
                  className="nr-focus-ring w-full h-10 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface)] px-3 text-xs font-mono-num text-[var(--nr-text)]"
                />
              </div>

              <button
                type="submit"
                className="nr-focus-ring nr-transition w-full h-10 rounded-xl bg-[var(--nr-primary)] hover:bg-[var(--nr-primary-hover)] text-xs font-semibold text-[var(--nr-primary-fg)] flex items-center justify-center gap-1.5"
              >
                <SearchCheck className="w-4 h-4" />
                <span>{locale === 'es' ? 'Buscar e-NCF' : 'Verify e-NCF'}</span>
              </button>
            </form>
          </ErpSurfaceCard>

          <ErpSurfaceCard className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-[var(--nr-border)]">
              <h3 className="font-display text-base font-bold text-[var(--nr-text)]">
                {locale === 'es' ? 'Resultado de Verificación e-NCF' : 'e-NCF Verification Result'}
              </h3>
              <span className="text-[11px] text-[var(--nr-text-secondary)]">
                {locale === 'es' ? 'Simulación portal DGII' : 'DGII portal simulation'}
              </span>
            </div>

            {!lookupEvaluation ? (
              <ErpStatePanel
                variant="empty"
                title={
                  locale === 'es'
                    ? 'Ingresa los datos del timbre e-CF'
                    : 'Enter e-CF stamp credentials'
                }
                description={
                  locale === 'es'
                    ? 'Puedes seleccionar un comprobante arriba o introducir manualmente RNC Emisor, e-NCF y Código de Seguridad.'
                    : 'Pick a quick-fill e-CF or manually enter Emitter RNC, e-NCF, and Security Code.'
                }
              />
            ) : !lookupEvaluation.found ? (
              <ErpStatePanel
                variant="error"
                title={locale === 'es' ? 'Comprobante no encontrado' : 'Document not found'}
                description={lookupEvaluation.reason}
              />
            ) : (
              (() => {
                const inv = lookupEvaluation.invoice;
                const sMeta = getEcfStatusMeta(inv.status, locale);
                return (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--nr-success-border)] bg-[var(--nr-success-bg)] px-4 py-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-[var(--nr-success)]">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>
                          {locale === 'es'
                            ? 'Comprobante verificado en el registro local simulado'
                            : 'Document verified in simulated local registry'}
                        </span>
                      </div>
                      <StatusBadge
                        activityStatus={sMeta.activityStatus}
                        locale={locale}
                        label={sMeta.label}
                      />
                    </div>

                    <div className="overflow-hidden rounded-xl border border-[var(--nr-border)]">
                      <table className="w-full text-xs">
                        <tbody className="divide-y divide-[var(--nr-border)]">
                          {[
                            ['RNC Emisor', formatTaxIdDisplay(erpState.company.rnc)],
                            [
                              locale === 'es' ? 'Razón social emisor' : 'Emitter legal name',
                              erpState.company.name,
                            ],
                            [
                              'RNC Comprador',
                              inv.buyerRnc ? formatTaxIdDisplay(inv.buyerRnc) : '—',
                            ],
                            [
                              locale === 'es' ? 'Razón social comprador' : 'Buyer legal name',
                              inv.buyerName,
                            ],
                            ['e-NCF', inv.eNcf],
                            [
                              locale === 'es' ? 'Fecha de Emisión' : 'Issue Date',
                              inv.issueDate,
                            ],
                            [
                              locale === 'es' ? 'Total de ITBIS' : 'Total ITBIS',
                              `RD$${inv.itbisTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                            ],
                            [
                              locale === 'es' ? 'Monto Total' : 'Total Amount',
                              `RD$${inv.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                            ],
                            [locale === 'es' ? 'Estado' : 'Status', sMeta.label],
                            [
                              locale === 'es' ? 'Fecha de Firma Digital' : 'Digital Signature Date',
                              inv.digitalSignatureDate,
                            ],
                          ].map(([label, val]) => (
                            <tr key={label} className="bg-[var(--nr-surface)]">
                              <th className="py-2.5 px-3.5 text-left font-semibold text-[var(--nr-text-secondary)] bg-[var(--nr-surface-elevated)] w-48">
                                {label}
                              </th>
                              <td className="py-2.5 px-3.5 font-mono-num font-semibold text-[var(--nr-text)]">
                                {val}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setRiModalInvoice(inv)}
                        className="nr-focus-ring nr-transition inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface)] hover:bg-[var(--nr-surface-muted)] text-xs font-semibold text-[var(--nr-text)]"
                      >
                        <QrCode className="w-3.5 h-3.5 text-[var(--nr-primary)]" />
                        <span>{locale === 'es' ? 'Abrir RI y XML' : 'Open RI & XML'}</span>
                      </button>
                    </div>
                  </div>
                );
              })()
            )}
          </ErpSurfaceCard>
        </div>
      )}

      {/* TAB 4: AUTHORIZED e-NCF SEQUENCES */}
      {activeTab === 'e_invoicing_sequences' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-base font-bold text-[var(--nr-text)]">
                {locale === 'es'
                  ? 'Rangos de secuencias e-NCF autorizados'
                  : 'Authorized e-NCF Sequence Ranges'}
              </h2>
              <p className="text-xs text-[var(--nr-text-secondary)]">
                {locale === 'es'
                  ? 'Estructura oficial: Serie E + 2 dígitos de tipo + 10 dígitos secuenciales.'
                  : 'Official format: Series E + 2-digit type + 10-digit sequential number.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSeqModalOpen(true)}
              className="nr-focus-ring nr-transition inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-[var(--nr-primary)] hover:bg-[var(--nr-primary-hover)] text-xs font-semibold text-[var(--nr-primary-fg)]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>
                {locale === 'es' ? 'Autorizar nuevo rango' : 'Authorize new range'}
              </span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
            {sequences.map((seq) => {
              const meta = getEcfTypeMeta(seq.ecfType);
              const total = Math.max(1, seq.toSeq - seq.fromSeq + 1);
              const remaining = Math.max(0, seq.toSeq - seq.nextSeq + 1);
              const used = total - remaining;
              const pct = Math.min(100, Math.round((used / total) * 100));
              const lowStock = remaining <= seq.alertThreshold;

              return (
                <ErpSurfaceCard key={seq.id} padding="md" className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-mono-num text-sm font-bold text-[var(--nr-primary)]">
                        {seq.prefix} · {locale === 'es' ? meta.shortEs : meta.shortEn}
                      </div>
                      <div className="font-mono-num text-[11px] text-[var(--nr-text-secondary)] truncate">
                        {seq.authorizationNumber}
                      </div>
                    </div>
                    <StatusBadge
                      activityStatus={!seq.active ? 'closed' : lowStock ? 'warning' : 'active'}
                      locale={locale}
                      label={
                        !seq.active
                          ? locale === 'es'
                            ? 'Inactiva'
                            : 'Inactive'
                          : lowStock
                            ? locale === 'es'
                              ? 'Por agotar'
                              : 'Low'
                            : locale === 'es'
                              ? 'Activa'
                              : 'Active'
                      }
                    />
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[var(--nr-text-secondary)]">
                        {locale === 'es' ? 'Próximo e-NCF:' : 'Next e-NCF:'}
                      </span>
                      <span className="font-mono-num font-bold text-[var(--nr-text)]">
                        {formatENcf(seq.ecfType, seq.nextSeq)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--nr-text-secondary)]">
                        {locale === 'es' ? 'Disponibles:' : 'Remaining:'}
                      </span>
                      <span className="font-mono-num text-[var(--nr-text)]">
                        {remaining.toLocaleString('en-US')} / {total.toLocaleString('en-US')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--nr-text-secondary)]">
                        {locale === 'es' ? 'Vence:' : 'Expires:'}
                      </span>
                      <span className="font-mono-num text-[var(--nr-text-secondary)]">
                        {seq.expirationDate}
                      </span>
                    </div>
                  </div>

                  <div className="h-1.5 w-full rounded-full bg-[var(--nr-surface-muted)] overflow-hidden">
                    <div
                      style={{ width: `${Math.max(2, pct)}%` }}
                      className="h-full bg-[var(--nr-primary)]"
                    />
                  </div>

                  <div className="pt-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => toggleEcfSequenceActive(seq.id)}
                      className="nr-focus-ring nr-transition h-8 px-2.5 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] hover:bg-[var(--nr-surface-muted)] text-xs font-semibold text-[var(--nr-text)]"
                    >
                      {seq.active
                        ? locale === 'es'
                          ? 'Desactivar'
                          : 'Disable'
                        : locale === 'es'
                          ? 'Activar'
                          : 'Enable'}
                    </button>
                  </div>
                </ErpSurfaceCard>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: CERTIFICATE, EMISSION METHOD & DGII CHECKLIST */}
      {activeTab === 'e_invoicing_config' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <div className="lg:col-span-6 space-y-4">
            {/* Environment & Modality */}
            <ErpSurfaceCard padding="md" className="space-y-4">
              <h2 className="font-display text-base font-bold text-[var(--nr-text)]">
                {locale === 'es'
                  ? 'Modalidad de emisión y ambiente DGII'
                  : 'Issuance Mode & DGII Environment'}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--nr-text-secondary)] mb-1">
                    {locale === 'es' ? 'Ambiente' : 'Environment'}
                  </label>
                  <select
                    value={config.environment}
                    onChange={(e) =>
                      updateEcfConfig({ environment: e.target.value as EcfEnvironment })
                    }
                    className="nr-focus-ring w-full h-10 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-3 text-xs font-semibold text-[var(--nr-text)]"
                  >
                    <option value="PRODUCCION">
                      {locale === 'es' ? 'Producción' : 'Production'}
                    </option>
                    <option value="PRECERTIFICACION">
                      {locale === 'es' ? 'Pre-certificación (Pruebas)' : 'Pre-Certification (Sandbox)'}
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--nr-text-secondary)] mb-1">
                    {locale === 'es' ? 'Modalidad (Guía No. 6, p. 4)' : 'Method (Guide No. 6, p. 4)'}
                  </label>
                  <select
                    value={config.emissionMethod}
                    onChange={(e) =>
                      updateEcfConfig({ emissionMethod: e.target.value as EcfEmissionMethod })
                    }
                    className="nr-focus-ring w-full h-10 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-3 text-xs font-semibold text-[var(--nr-text)]"
                  >
                    <option value="PROVEEDOR_CERTIFICADO">
                      {locale === 'es'
                        ? 'Proveedor de Servicios Certificado'
                        : 'Certified Service Provider'}
                    </option>
                    <option value="DESARROLLO_PROPIO">
                      {locale === 'es' ? 'Desarrollo Propio (API ERP)' : 'In-House ERP Integration'}
                    </option>
                    <option value="FACTURADOR_GRATUITO">
                      {locale === 'es'
                        ? 'Facturador Gratuito DGII (máx. 150/mes)'
                        : 'DGII Free Tool (max 150/mo)'}
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--nr-text-secondary)] mb-1">
                  {locale === 'es'
                    ? 'Clasificación y calendario de obligatoriedad (Ley 32-23)'
                    : 'Taxpayer Classification & Legal Timeline (Law 32-23)'}
                </label>
                <select
                  value={config.taxpayerGroup}
                  onChange={(e) =>
                    updateEcfConfig({ taxpayerGroup: e.target.value as EcfTaxpayerGroup })
                  }
                  className="nr-focus-ring w-full h-10 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-3 text-xs font-semibold text-[var(--nr-text)]"
                >
                  <option value="GRANDES_NACIONALES">
                    {locale === 'es'
                      ? 'Grandes Contribuyentes Nacionales (12 meses desde vigencia)'
                      : 'Large National Taxpayers (12 months from enactment)'}
                  </option>
                  <option value="GRANDES_LOCALES_MEDIANOS">
                    {locale === 'es'
                      ? 'Grandes Locales y Medianos (24 meses desde vigencia)'
                      : 'Large Local & Medium (24 months from enactment)'}
                  </option>
                  <option value="PEQUENOS_MICRO">
                    {locale === 'es'
                      ? 'Pequeños, Micro y No Clasificados (36 meses / Nuevos: 120 días)'
                      : 'Small, Micro & Unclassified (36 months / New RNC: 120 days)'}
                  </option>
                </select>
              </div>
            </ErpSurfaceCard>

            {/* Digital Certificate */}
            <ErpSurfaceCard padding="md" className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[var(--nr-primary)]" />
                  <h2 className="font-display text-base font-bold text-[var(--nr-text)]">
                    {locale === 'es'
                      ? 'Certificado Digital Tributario (INDOTEL)'
                      : 'Tax Digital Certificate (INDOTEL)'}
                  </h2>
                </div>
                <StatusBadge
                  activityStatus={config.certificate.status === 'ACTIVE' ? 'approved' : 'warning'}
                  locale={locale}
                  label={config.certificate.status === 'ACTIVE' ? (locale === 'es' ? 'Vigente' : 'Active') : config.certificate.status}
                />
              </div>

              <div className="rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] p-3.5 space-y-1.5 text-xs">
                <div>
                  <span className="text-[var(--nr-text-secondary)]">
                    {locale === 'es' ? 'Entidad emisora:' : 'Issuer:'}{' '}
                  </span>
                  <span className="font-semibold text-[var(--nr-text)]">
                    {config.certificate.issuer}
                  </span>
                </div>
                <div>
                  <span className="text-[var(--nr-text-secondary)]">
                    {locale === 'es' ? 'Titular:' : 'Holder:'}{' '}
                  </span>
                  <span className="font-semibold text-[var(--nr-text)]">
                    {erpState.company.name} ({formatTaxIdDisplay(erpState.company.rnc)})
                  </span>
                </div>
                <div>
                  <span className="text-[var(--nr-text-secondary)]">Serial: </span>
                  <span className="font-mono-num text-[var(--nr-text)]">
                    {config.certificate.serialNumber}
                  </span>
                </div>
                <div>
                  <span className="text-[var(--nr-text-secondary)]">
                    {locale === 'es' ? 'Vigencia:' : 'Validity:'}{' '}
                  </span>
                  <span className="font-mono-num text-[var(--nr-text)]">
                    {config.certificate.validFrom} → {config.certificate.validTo}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={renewDemoCertificate}
                className="nr-focus-ring nr-transition inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface)] hover:bg-[var(--nr-surface-muted)] text-xs font-semibold text-[var(--nr-text)]"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[var(--nr-primary)]" />
                <span>
                  {locale === 'es'
                    ? 'Simular renovación por 12 meses'
                    : 'Simulate 12-month renewal'}
                </span>
              </button>
            </ErpSurfaceCard>
          </div>

          {/* Right Column: Official DGII Checklist (FI-GDF-016 + Facturador Gratuito) */}
          <ErpSurfaceCard padding="md" className="lg:col-span-6 space-y-3.5">
            <div>
              <h2 className="font-display text-base font-bold text-[var(--nr-text)]">
                {locale === 'es'
                  ? 'Requisitos para ser Emisor Electrónico (FI-GDF-016)'
                  : 'Electronic Issuer Requirements Checklist (FI-GDF-016)'}
              </h2>
              <p className="text-xs text-[var(--nr-text-secondary)] mt-0.5">
                {locale === 'es'
                  ? 'Lista interactiva basada en la Guía del Contribuyente No. 6 de la DGII (págs. 5, 7 y 8).'
                  : 'Interactive checklist based on DGII Taxpayer Guide No. 6 (pp. 5, 7, and 8).'}
              </p>
            </div>

            <div className="divide-y divide-[var(--nr-border)] rounded-xl border border-[var(--nr-border)] overflow-hidden">
              {config.checklist.map((item) => (
                <label
                  key={item.id}
                  className="flex items-start gap-3 p-3 bg-[var(--nr-surface)] hover:bg-[var(--nr-surface-elevated)] cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => toggleEcfChecklistItem(item.id)}
                    className="mt-0.5 rounded border-[var(--nr-border)] text-[var(--nr-primary)]"
                  />
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex flex-wrap items-center justify-between gap-1">
                      <span className="text-xs font-semibold text-[var(--nr-text)]">
                        {item.group === 'FREE_TOOL'
                          ? `${locale === 'es' ? 'Gratuito' : 'Free Tool'} · `
                          : `${item.stepNumber}. `}
                        {locale === 'es' ? item.titleEs : item.titleEn}
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--nr-text-secondary)]">
                      {locale === 'es' ? item.detailEs : item.detailEn}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </ErpSurfaceCard>
        </div>
      )}

      {/* Printable RI & XML Modal */}
      <EcfRepresentacionImpresa
        invoice={riModalInvoice}
        open={Boolean(riModalInvoice)}
        onClose={() => setRiModalInvoice(null)}
        onVerifyInLookup={jumpToLookup}
      />

      {/* Void Confirmation Modal */}
      <ErpConfirmDialog
        open={Boolean(voidTarget)}
        onClose={() => setVoidTarget(null)}
        onConfirm={async () => {
          if (!voidTarget) return;
          await voidElectronicInvoice(voidTarget.id, voidReason);
          setVoidTarget(null);
        }}
        title={
          locale === 'es'
            ? `Anular comprobante ${voidTarget?.eNcf ?? ''}`
            : `Void document ${voidTarget?.eNcf ?? ''}`
        }
        description={
          locale === 'es'
            ? 'Al enviar el formato de anulación a la DGII, este e-NCF quedará permanentemente sin validez tributaria. Esta acción no puede deshacerse.'
            : 'Submitting the DGII cancellation format permanently invalidates this e-NCF for fiscal use.'
        }
        confirmLabel={locale === 'es' ? 'Confirmar anulación' : 'Confirm void'}
        cancelLabel={t.common.cancel}
        tone="danger"
      />

      {/* Authorize Sequence Modal */}
      <ErpModal
        open={seqModalOpen}
        onClose={() => setSeqModalOpen(false)}
        title={
          locale === 'es'
            ? 'Autorizar nuevo rango de secuencias e-NCF'
            : 'Authorize new e-NCF sequence range'
        }
        closeLabel={t.common.close}
        maxWidthClass="max-w-md"
      >
        <form onSubmit={handleSaveSequence} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--nr-text-secondary)] mb-1">
              {locale === 'es' ? 'Tipo e-CF' : 'e-CF Type'}
            </label>
            <select
              value={seqType}
              onChange={(e) => setSeqType(e.target.value as EcfTypeCode)}
              className="nr-focus-ring w-full h-10 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-3 text-xs font-semibold text-[var(--nr-text)]"
            >
              {ECF_TYPE_CATALOG.map((m) => (
                <option key={m.code} value={m.code}>
                  {m.prefix} · {locale === 'es' ? m.shortEs : m.shortEn}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--nr-text-secondary)] mb-1">
                {locale === 'es' ? 'Desde secuencia' : 'From sequence'}
              </label>
              <input
                type="number"
                min="1"
                value={seqFrom}
                onChange={(e) => setSeqFrom(e.target.value)}
                required
                className="nr-focus-ring w-full h-10 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface)] px-3 text-xs font-mono-num text-[var(--nr-text)]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--nr-text-secondary)] mb-1">
                {locale === 'es' ? 'Hasta secuencia' : 'To sequence'}
              </label>
              <input
                type="number"
                min="1"
                value={seqTo}
                onChange={(e) => setSeqTo(e.target.value)}
                required
                className="nr-focus-ring w-full h-10 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface)] px-3 text-xs font-mono-num text-[var(--nr-text)]"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--nr-text-secondary)] mb-1">
                {locale === 'es' ? 'No. Autorización DGII' : 'DGII Auth #'}
              </label>
              <input
                type="text"
                value={seqAuth}
                onChange={(e) => setSeqAuth(e.target.value)}
                className="nr-focus-ring w-full h-10 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface)] px-3 text-xs font-mono-num text-[var(--nr-text)]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--nr-text-secondary)] mb-1">
                {locale === 'es' ? 'Fecha vencimiento' : 'Expiration date'}
              </label>
              <input
                type="date"
                value={seqExp}
                onChange={(e) => setSeqExp(e.target.value)}
                required
                className="nr-focus-ring w-full h-10 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface)] px-3 text-xs font-mono-num text-[var(--nr-text)]"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setSeqModalOpen(false)}
              className="nr-focus-ring h-9 px-3.5 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface)] text-xs font-semibold text-[var(--nr-text)]"
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              className="nr-focus-ring h-9 px-4 rounded-lg bg-[var(--nr-primary)] hover:bg-[var(--nr-primary-hover)] text-xs font-semibold text-[var(--nr-primary-fg)]"
            >
              {locale === 'es' ? 'Guardar rango' : 'Save range'}
            </button>
          </div>
        </form>
      </ErpModal>
    </div>
  );
};
