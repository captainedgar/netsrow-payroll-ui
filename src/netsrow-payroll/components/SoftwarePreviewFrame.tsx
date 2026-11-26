import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Boxes,
  Building2,
  Check,
  CheckCircle2,
  Clock,
  FileCheck2,
  Home,
  Landmark,
  Minus,
  MonitorSmartphone,
  Plus,
  QrCode,
  ReceiptText,
  RefreshCw,
  ShoppingCart,
  WalletCards,
} from 'lucide-react';
import { useCommercial } from '../context/CommercialContext';
import { NetsRowLogo } from './NetsRowLogo';

export type PreviewModuleId =
  | 'DASH'
  | 'POS'
  | 'SALES'
  | 'ECF'
  | 'CASH'
  | 'INV'
  | 'PAY'
  | 'ACC';

interface PreviewInventoryItem {
  sku: string;
  nameEs: string;
  nameEn: string;
  locationEs: string;
  locationEn: string;
  unitPrice: number;
  stock: number;
  minStock: number;
}

interface PreviewEcfDoc {
  id: string;
  eNcf: string;
  typeCode: '31' | '32' | '34';
  buyerName: string;
  buyerRnc: string;
  total: number;
  status: 'ACEPTADO' | 'EN_PROCESO';
  trackId: string;
  securityCode: string;
  date: string;
}

interface PreviewSaleDoc {
  id: string;
  number: string;
  customer: string;
  methodEs: string;
  methodEn: string;
  eNcf: string | null;
  total: number;
  time: string;
}

interface PreviewPayrollRow {
  id: string;
  name: string;
  roleEs: string;
  roleEn: string;
  gross: number;
  net: number;
  status: 'APPROVED' | 'PENDING';
}

interface PreviewJournalRow {
  id: string;
  ref: string;
  conceptEs: string;
  conceptEn: string;
  debit: number;
  credit: number;
  time: string;
}

const INITIAL_INVENTORY: PreviewInventoryItem[] = [
  {
    sku: 'ARR-010',
    nameEs: 'Arroz Selecto 10 lb',
    nameEn: 'Select Rice 10 lb',
    locationEs: 'Almacén A',
    locationEn: 'Warehouse A',
    unitPrice: 340,
    stock: 48,
    minStock: 15,
  },
  {
    sku: 'ACE-032',
    nameEs: 'Aceite Vegetal 32 oz',
    nameEn: 'Vegetable Oil 32 oz',
    locationEs: 'Góndola 2',
    locationEn: 'Aisle 2',
    unitPrice: 215,
    stock: 26,
    minStock: 10,
  },
  {
    sku: 'CAF-001',
    nameEs: 'Café Molido 1 lb',
    nameEn: 'Ground Coffee 1 lb',
    locationEs: 'Mostrador',
    locationEn: 'Counter',
    unitPrice: 295,
    stock: 19,
    minStock: 12,
  },
  {
    sku: 'AZU-005',
    nameEs: 'Azúcar Crema 5 lb',
    nameEn: 'Brown Sugar 5 lb',
    locationEs: 'Almacén B',
    locationEn: 'Warehouse B',
    unitPrice: 185,
    stock: 9,
    minStock: 12,
  },
];

const INITIAL_ECFS: PreviewEcfDoc[] = [
  {
    id: 'p-ecf-1',
    eNcf: 'E310000000001',
    typeCode: '31',
    buyerName: 'Hotel Costa Dorada, SRL',
    buyerRnc: '1-31-44890-2',
    total: 33267.7,
    status: 'ACEPTADO',
    trackId: 'TRK-DGII-E31-915165',
    securityCode: 'AiGhuu',
    date: '10:42',
  },
  {
    id: 'p-ecf-2',
    eNcf: 'E320000000001',
    typeCode: '32',
    buyerName: 'Consumidor Final',
    buyerRnc: '',
    total: 1285.2,
    status: 'ACEPTADO',
    trackId: 'TRK-DGII-E32-915166',
    securityCode: 'Kp82Mn',
    date: '10:15',
  },
  {
    id: 'p-ecf-3',
    eNcf: 'E310000000003',
    typeCode: '31',
    buyerName: 'Farmacia Los Próceres, SRL',
    buyerRnc: '1-30-98441-5',
    total: 15930.0,
    status: 'EN_PROCESO',
    trackId: 'TRK-DGII-E31-915167',
    securityCode: 'AVKVsH',
    date: '09:50',
  },
  {
    id: 'p-ecf-4',
    eNcf: 'E340000000001',
    typeCode: '34',
    buyerName: 'Hotel Costa Dorada, SRL',
    buyerRnc: '1-31-44890-2',
    total: 2450.0,
    status: 'ACEPTADO',
    trackId: 'TRK-DGII-E34-915168',
    securityCode: 'Qx71Tr',
    date: '09:12',
  },
];

const INITIAL_SALES: PreviewSaleDoc[] = [
  {
    id: 'p-sal-1',
    number: 'VTA-2026-0103',
    customer: 'Hotel Costa Dorada, SRL',
    methodEs: 'Transferencia',
    methodEn: 'Wire transfer',
    eNcf: 'E310000000001',
    total: 33267.7,
    time: '10:42',
  },
  {
    id: 'p-sal-2',
    number: 'VTA-2026-0102',
    customer: 'Consumidor Final',
    methodEs: 'Efectivo',
    methodEn: 'Cash',
    eNcf: 'E320000000001',
    total: 1285.2,
    time: '10:15',
  },
  {
    id: 'p-sal-3',
    number: 'VTA-2026-0101',
    customer: 'Farmacia Los Próceres, SRL',
    methodEs: 'Tarjeta',
    methodEn: 'Card',
    eNcf: 'E310000000003',
    total: 15930.0,
    time: '09:50',
  },
];

const INITIAL_PAYROLL: PreviewPayrollRow[] = [
  {
    id: 'p-emp-1',
    name: 'Altagracia Castillo',
    roleEs: 'Encargada de Nómina',
    roleEn: 'Payroll Lead',
    gross: 68500,
    net: 58920,
    status: 'APPROVED',
  },
  {
    id: 'p-emp-2',
    name: 'Carlos Méndez',
    roleEs: 'Supervisor POS y Caja',
    roleEn: 'POS & Cash Supervisor',
    gross: 52000,
    net: 46110,
    status: 'APPROVED',
  },
  {
    id: 'p-emp-3',
    name: 'Yamileth Núñez',
    roleEs: 'Cajera Mostrador #1',
    roleEn: 'Register #1 Cashier',
    gross: 36000,
    net: 32940,
    status: 'PENDING',
  },
];

const INITIAL_JOURNAL: PreviewJournalRow[] = [
  {
    id: 'p-jrn-1',
    ref: 'AST-2026-041',
    conceptEs: 'Venta crédito fiscal E310000000001 · ITBIS 18%',
    conceptEn: 'Tax credit sale E310000000001 · ITBIS 18%',
    debit: 33267.7,
    credit: 33267.7,
    time: '10:42',
  },
  {
    id: 'p-jrn-2',
    ref: 'AST-2026-040',
    conceptEs: 'Asiento Diario General · Cuadre Caja #1',
    conceptEn: 'General Journal entry · Register #1',
    debit: 18400.0,
    credit: 18400.0,
    time: '10:15',
  },
  {
    id: 'p-jrn-3',
    ref: 'AST-2026-039',
    conceptEs: 'Compra a proveedor · Almacén Central',
    conceptEn: 'Supplier bill · Central Warehouse',
    debit: 34900.0,
    credit: 34900.0,
    time: '09:30',
  },
];

function fmtRd(n: number): string {
  return `RD$${new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)}`;
}

const Sparkline: React.FC<{ points: string; tone?: 'emerald' | 'slate' }> = ({
  points,
  tone = 'emerald',
}) => (
  <svg
    viewBox="0 0 100 22"
    fill="none"
    aria-hidden="true"
    className="w-full h-4 mt-1.5 overflow-visible"
  >
    <polyline
      points={points}
      stroke={tone === 'emerald' ? 'var(--nr-primary)' : 'var(--nr-text-secondary)'}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={tone === 'emerald' ? 0.9 : 0.45}
    />
  </svg>
);

export const SoftwarePreviewFrame: React.FC = () => {
  const { locale, ct } = useCommercial();
  const [activeView, setActiveView] = useState<PreviewModuleId>('POS');

  // Shared live POS / Inventory / Cashbox / e-CF / Sales / Payroll / Accounting state
  const [inventoryItems, setInventoryItems] = useState<PreviewInventoryItem[]>(INITIAL_INVENTORY);
  const [cartQuantities, setCartQuantities] = useState<Record<string, number>>({
    'ARR-010': 2,
    'ACE-032': 1,
    'CAF-001': 1,
  });
  const [posCustomerMode, setPosCustomerMode] = useState<'CORPORATE' | 'FINAL'>('CORPORATE');
  const [receiptMode, setReceiptMode] = useState<'E31' | 'E32' | 'INTERNAL'>('E31');
  const [cashboxBalance, setCashboxBalance] = useState<number>(16800);
  const [shiftSalesTotal, setShiftSalesTotal] = useState<number>(28450);
  const [lastConfirmedSale, setLastConfirmedSale] = useState<{
    total: number;
    eNcf: string | null;
  } | null>(null);
  const [salePulse, setSalePulse] = useState(false);

  const [ecfDocs, setEcfDocs] = useState<PreviewEcfDoc[]>(INITIAL_ECFS);
  const [selectedEcfId, setSelectedEcfId] = useState<string>(INITIAL_ECFS[0].id);
  const [ecfFilterType, setEcfFilterType] = useState<'ALL' | '31' | '32' | '34'>('ALL');
  const [showMiniRiModal, setShowMiniRiModal] = useState(false);
  const [quickIssueOpen, setQuickIssueOpen] = useState(false);
  const [quickIssueType, setQuickIssueType] = useState<'31' | '32'>('31');
  const [quickIssueBuyer, setQuickIssueBuyer] = useState('Supermercados del Caribe, S.A.');
  const [quickIssueRnc, setQuickIssueRnc] = useState('1-01-55219-8');
  const [quickIssueAmount, setQuickIssueAmount] = useState('4250');

  const [salesDocs, setSalesDocs] = useState<PreviewSaleDoc[]>(INITIAL_SALES);
  const [payrollRows, setPayrollRows] = useState<PreviewPayrollRow[]>(INITIAL_PAYROLL);
  const [journalRows, setJournalRows] = useState<PreviewJournalRow[]>(INITIAL_JOURNAL);
  const [nextSeq31, setNextSeq31] = useState(4);
  const [nextSeq32, setNextSeq32] = useState(2);

  useEffect(() => {
    if (!salePulse) return;
    const t = window.setTimeout(() => setSalePulse(false), 850);
    return () => window.clearTimeout(t);
  }, [salePulse]);

  const handleCustomerSwitch = (nextMode: 'CORPORATE' | 'FINAL') => {
    setPosCustomerMode(nextMode);
    if (receiptMode !== 'INTERNAL') {
      setReceiptMode(nextMode === 'CORPORATE' ? 'E31' : 'E32');
    }
  };

  const handleAdjustCart = (sku: string, delta: number) => {
    setCartQuantities((prev) => {
      const next = Math.max(0, (prev[sku] ?? 0) + delta);
      return { ...prev, [sku]: next };
    });
  };

  const cartLines = inventoryItems
    .filter((item) => (cartQuantities[item.sku] ?? 0) > 0)
    .map((item) => ({
      ...item,
      qty: cartQuantities[item.sku] ?? 0,
    }));

  const subtotal = cartLines.reduce((acc, item) => acc + item.unitPrice * item.qty, 0);
  const itbis = Math.round(subtotal * 0.18 * 100) / 100;
  const total = Math.round((subtotal + itbis) * 100) / 100;
  const totalUnits = cartLines.reduce((acc, item) => acc + item.qty, 0);
  const riceItem = inventoryItems[0];

  const handleConfirmPreviewSale = () => {
    if (total <= 0) return;

    const now = new Date();
    const timeLabel = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;

    setCashboxBalance((prev) => Math.round((prev + total) * 100) / 100);
    setShiftSalesTotal((prev) => Math.round((prev + total) * 100) / 100);
    setInventoryItems((prev) =>
      prev.map((item) => ({
        ...item,
        stock: Math.max(1, item.stock - (cartQuantities[item.sku] ?? 0)),
      }))
    );

    let emittedENcf: string | null = null;
    if (receiptMode === 'E31' || receiptMode === 'E32') {
      const ecfCode: '31' | '32' = receiptMode === 'E31' ? '31' : '32';
      const seqNum = ecfCode === '31' ? nextSeq31 : nextSeq32;
      emittedENcf = `E${ecfCode}${String(seqNum).padStart(10, '0')}`;
      if (ecfCode === '31') setNextSeq31((n) => n + 1);
      else setNextSeq32((n) => n + 1);

      const newEcf: PreviewEcfDoc = {
        id: `p-ecf-${Date.now()}`,
        eNcf: emittedENcf,
        typeCode: ecfCode,
        buyerName:
          posCustomerMode === 'CORPORATE'
            ? 'Hotel Costa Dorada, SRL'
            : 'Consumidor Final',
        buyerRnc: posCustomerMode === 'CORPORATE' ? '1-31-44890-2' : '',
        total,
        status: 'ACEPTADO',
        trackId: `TRK-DGII-E${ecfCode}-${915170 + seqNum}`,
        securityCode: ecfCode === '31' ? 'Nr7xP2' : 'Km4vQ9',
        date: timeLabel,
      };
      setEcfDocs((prev) => [newEcf, ...prev]);
      setSelectedEcfId(newEcf.id);
    }

    const saleNum = `VTA-2026-0${104 + salesDocs.length - 3}`;
    setSalesDocs((prev) => [
      {
        id: `p-sal-${Date.now()}`,
        number: saleNum,
        customer:
          posCustomerMode === 'CORPORATE'
            ? 'Hotel Costa Dorada, SRL'
            : 'Consumidor Final',
        methodEs: 'Efectivo POS',
        methodEn: 'POS Cash',
        eNcf: emittedENcf,
        total,
        time: timeLabel,
      },
      ...prev,
    ]);

    setJournalRows((prev) => [
      {
        id: `p-jrn-${Date.now()}`,
        ref: `AST-2026-0${42 + prev.length - 3}`,
        conceptEs: emittedENcf
          ? `Venta POS ${saleNum} · ${emittedENcf}`
          : `Venta POS ${saleNum} · Recibo interno`,
        conceptEn: emittedENcf
          ? `POS Sale ${saleNum} · ${emittedENcf}`
          : `POS Sale ${saleNum} · Internal slip`,
        debit: total,
        credit: total,
        time: timeLabel,
      },
      ...prev,
    ]);

    setLastConfirmedSale({ total, eNcf: emittedENcf });
    setSalePulse(true);
  };

  const handlePollTrackId = (docId: string) => {
    setEcfDocs((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, status: 'ACEPTADO' } : d))
    );
  };

  const handleQuickIssueEcf = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = Math.max(100, Number(quickIssueAmount) || 4250);
    const seqNum = quickIssueType === '31' ? nextSeq31 : nextSeq32;
    const eNcf = `E${quickIssueType}${String(seqNum).padStart(10, '0')}`;
    if (quickIssueType === '31') setNextSeq31((n) => n + 1);
    else setNextSeq32((n) => n + 1);

    const newDoc: PreviewEcfDoc = {
      id: `p-ecf-${Date.now()}`,
      eNcf,
      typeCode: quickIssueType,
      buyerName:
        quickIssueType === '31'
          ? quickIssueBuyer.trim() || 'Supermercados del Caribe, S.A.'
          : 'Consumidor Final',
      buyerRnc: quickIssueType === '31' ? quickIssueRnc.trim() || '1-01-55219-8' : '',
      total: Math.round(numericAmount * 1.18 * 100) / 100,
      status: 'ACEPTADO',
      trackId: `TRK-DGII-E${quickIssueType}-${915200 + seqNum}`,
      securityCode: quickIssueType === '31' ? 'Dg62Yz' : 'Cs39Lm',
      date: locale === 'es' ? 'Ahora' : 'Now',
    };

    setEcfDocs((prev) => [newDoc, ...prev]);
    setSelectedEcfId(newDoc.id);
    setQuickIssueOpen(false);
  };

  const filteredEcfs = useMemo(
    () =>
      ecfDocs.filter((d) =>
        ecfFilterType === 'ALL' ? true : d.typeCode === ecfFilterType
      ),
    [ecfDocs, ecfFilterType]
  );

  const selectedEcf = useMemo(
    () => ecfDocs.find((d) => d.id === selectedEcfId) ?? filteredEcfs[0] ?? ecfDocs[0],
    [ecfDocs, selectedEcfId, filteredEcfs]
  );

  const navItems: {
    id: PreviewModuleId;
    label: string;
    shortLabel: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }[] = [
    {
      id: 'DASH',
      label: locale === 'es' ? 'Tablero' : 'Overview',
      shortLabel: locale === 'es' ? 'Tablero' : 'Overview',
      icon: Home,
    },
    {
      id: 'POS',
      label: 'POS',
      shortLabel: 'POS',
      icon: MonitorSmartphone,
    },
    {
      id: 'SALES',
      label: locale === 'es' ? 'Ventas' : 'Sales',
      shortLabel: locale === 'es' ? 'Ventas' : 'Sales',
      icon: ReceiptText,
    },
    {
      id: 'ECF',
      label: locale === 'es' ? 'Facturación e-CF' : 'e-CF Invoicing',
      shortLabel: 'e-CF',
      icon: FileCheck2,
      badge: String(ecfDocs.length),
    },
    {
      id: 'CASH',
      label: locale === 'es' ? 'Caja' : 'Cashbox',
      shortLabel: locale === 'es' ? 'Caja' : 'Cash',
      icon: Landmark,
    },
    {
      id: 'INV',
      label: locale === 'es' ? 'Inventario' : 'Inventory',
      shortLabel: locale === 'es' ? 'Stock' : 'Stock',
      icon: Boxes,
    },
    {
      id: 'PAY',
      label: locale === 'es' ? 'Nómina y TSS' : 'Payroll & TSS',
      shortLabel: locale === 'es' ? 'Nómina' : 'Payroll',
      icon: WalletCards,
    },
    {
      id: 'ACC',
      label: locale === 'es' ? 'Contabilidad' : 'Accounting',
      shortLabel: locale === 'es' ? 'Contab.' : 'Ledger',
      icon: BookOpen,
    },
  ];

  const acceptedEcfCount = ecfDocs.filter((d) => d.status === 'ACEPTADO').length;
  const inProcessEcfCount = ecfDocs.filter((d) => d.status === 'EN_PROCESO').length;

  return (
    <div className="bg-[var(--nr-surface)] text-[var(--nr-text)] overflow-hidden nr-transition select-none">
      {/* Executive Top Window Bar inside Laptop Screen */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-2 border-b border-[var(--nr-border)] bg-[var(--nr-surface)]">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="hidden md:flex items-center gap-1.5 text-[11px] font-medium text-[var(--nr-text-secondary)]">
            <Building2 className="w-3.5 h-3.5 text-[var(--nr-primary)] shrink-0" />
            <span className="font-semibold text-[var(--nr-text)]">
              {locale === 'es' ? 'Comercial La Esperanza' : 'La Esperanza Retail'}
            </span>
            <span aria-hidden="true" className="text-[var(--nr-border)]">
              /
            </span>
            <span>{locale === 'es' ? 'Sucursal Principal' : 'Main Branch'}</span>
          </div>

          <div
            role="tablist"
            aria-label="Software preview"
            className="inline-flex items-center rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-muted)] p-0.5"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeView === 'POS'}
              onClick={() => setActiveView('POS')}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md whitespace-nowrap nr-focus-ring nr-transition ${
                activeView === 'POS'
                  ? 'bg-[var(--nr-surface)] text-[var(--nr-text)] shadow-xs'
                  : 'text-[var(--nr-text-secondary)] hover:text-[var(--nr-text)]'
              }`}
            >
              {ct.hero.previewTabPos}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeView === 'ECF'}
              onClick={() => setActiveView('ECF')}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md whitespace-nowrap nr-focus-ring nr-transition ${
                activeView === 'ECF'
                  ? 'bg-[var(--nr-surface)] text-[var(--nr-primary)] shadow-xs'
                  : 'text-[var(--nr-text-secondary)] hover:text-[var(--nr-text)]'
              }`}
            >
              {locale === 'es' ? 'Facturación e-CF' : 'e-CF DGII'}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeView === 'DASH'}
              onClick={() => setActiveView('DASH')}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md whitespace-nowrap nr-focus-ring nr-transition ${
                activeView === 'DASH'
                  ? 'bg-[var(--nr-surface)] text-[var(--nr-text)] shadow-xs'
                  : 'text-[var(--nr-text-secondary)] hover:text-[var(--nr-text)]'
              }`}
            >
              {ct.hero.previewTabDash}
            </button>
          </div>
        </div>

        {/* Right: Interactive Demo Indicator & Actor Avatar */}
        <div className="flex items-center gap-2 text-[11px]">
          <button
            type="button"
            onClick={() => setActiveView('ECF')}
            className="hidden sm:inline-flex items-center gap-1 font-semibold text-[var(--nr-success)] bg-[var(--nr-success-bg)] border border-[var(--nr-success-border)] px-2 py-0.5 rounded-md hover:brightness-95 nr-transition"
          >
            <FileCheck2 className="w-3 h-3" />
            <span>
              {locale === 'es'
                ? `e-CF activo (${ecfDocs.length})`
                : `Live e-CF (${ecfDocs.length})`}
            </span>
          </button>
          <span className="text-[var(--nr-text-secondary)] font-medium">
            {ct.hero.previewDemoNote}
          </span>
          <span
            aria-hidden="true"
            className="hidden sm:inline-flex w-6 h-6 rounded-full bg-[#081321] text-white text-[10px] font-bold items-center justify-center"
          >
            AC
          </span>
        </div>
      </div>

      {/* Mobile horizontal module selector (visible when left sidebar hides on < sm) */}
      <div className="flex sm:hidden items-center gap-1 overflow-x-auto px-3 py-2 border-b border-[var(--nr-border)] bg-[#081321] text-slate-200">
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveView(item.id)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap shrink-0 nr-transition ${
                isActive
                  ? 'bg-[#047857] text-white'
                  : 'text-slate-300 hover:bg-[#132B42]'
              }`}
            >
              {item.shortLabel}
            </button>
          );
        })}
      </div>

      {/* App Shell Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-12 min-h-[415px]">
        {/* Dark Midnight Navy Navigation Sidebar */}
        <div className="hidden sm:flex sm:col-span-3 bg-[#081321] text-slate-200 p-3 flex-col justify-between gap-3 border-r border-[#1A293D]">
          <div className="space-y-2.5 w-full">
            <div className="flex items-center justify-between gap-2 px-1 pt-0.5">
              <NetsRowLogo size="xs" surface="dark" />
              <span className="text-[10px] text-slate-400 font-mono-num">RD$</span>
            </div>

            <div className="flex flex-col gap-0.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveView(item.id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-[11px] font-medium whitespace-nowrap nr-focus-ring nr-transition ${
                      isActive
                        ? 'bg-[#047857] text-white'
                        : 'text-slate-300/90 hover:bg-[#132B42] hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <Icon className="w-3.5 h-3.5 shrink-0 opacity-90" />
                      <span className="truncate">{item.label}</span>
                    </span>
                    {item.badge && (
                      <span
                        className={`font-mono-num text-[10px] px-1.5 py-0.2 rounded ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-[#132B42] text-emerald-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveView('CASH')}
            className="pt-2.5 border-t border-[#1A293D] px-2 space-y-0.5 text-left rounded-lg hover:bg-[#132B42]/60 pb-1 nr-focus-ring nr-transition"
          >
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
              {locale === 'es' ? 'Caja #1 · Turno' : 'Register #1 · Shift'}
            </div>
            <div className="font-mono-num text-xs font-semibold text-emerald-300">
              {fmtRd(cashboxBalance)}
            </div>
          </button>
        </div>

        {/* Main Workspace Canvas */}
        <div className="sm:col-span-9 p-4 sm:p-5 bg-[var(--nr-bg)] flex flex-col justify-between gap-3.5">
          {/* 1. POS VIEW */}
          {activeView === 'POS' && (
            <div key="POS" className="space-y-3 nr-panel-enter">
              <div className="hidden md:grid grid-cols-3 gap-2.5">
                <div className="rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface)] px-3 py-2">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--nr-text-secondary)]">
                    {locale === 'es' ? 'Ventas del turno' : 'Shift sales'}
                  </div>
                  <div className="mt-0.5 font-mono-num text-sm font-bold text-[var(--nr-text)]">
                    {fmtRd(shiftSalesTotal)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveView('CASH')}
                  className={`text-left rounded-xl border px-3 py-2 nr-transition ${
                    salePulse
                      ? 'border-[var(--nr-primary)] bg-[var(--nr-success-bg)]'
                      : 'border-[var(--nr-border)] bg-[var(--nr-surface)] hover:border-[var(--nr-primary)]/50'
                  }`}
                >
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--nr-text-secondary)]">
                    {locale === 'es' ? 'Caja #1 en vivo' : 'Live cashbox'}
                  </div>
                  <div className="mt-0.5 font-mono-num text-sm font-bold text-[var(--nr-primary)]">
                    {fmtRd(cashboxBalance)}
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveView('ECF')}
                  className="text-left rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface)] hover:border-[var(--nr-primary)]/50 px-3 py-2 nr-transition"
                >
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--nr-text-secondary)]">
                    {locale === 'es' ? 'Comprobante activo' : 'Active receipt'}
                  </div>
                  <div className="mt-0.5 text-xs font-bold text-[var(--nr-primary)] truncate">
                    {receiptMode === 'E31'
                      ? 'e-CF E31 · Crédito Fiscal'
                      : receiptMode === 'E32'
                        ? 'e-CF E32 · Consumo'
                        : locale === 'es'
                          ? 'Recibo interno no fiscal'
                          : 'Internal non-fiscal slip'}
                  </div>
                </button>
              </div>

              {lastConfirmedSale && (
                <div className="rounded-xl border border-[var(--nr-success-border)] bg-[var(--nr-success-bg)] px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="font-semibold text-[var(--nr-success)] inline-flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      {lastConfirmedSale.eNcf
                        ? locale === 'es'
                          ? `Venta ${fmtRd(lastConfirmedSale.total)} · Emitido ${lastConfirmedSale.eNcf}`
                          : `Sale ${fmtRd(lastConfirmedSale.total)} · Issued ${lastConfirmedSale.eNcf}`
                        : locale === 'es'
                          ? `Venta ${fmtRd(lastConfirmedSale.total)} registrada en caja`
                          : `Sale ${fmtRd(lastConfirmedSale.total)} posted to register`}
                    </span>
                  </span>
                  {lastConfirmedSale.eNcf && (
                    <button
                      type="button"
                      onClick={() => setActiveView('ECF')}
                      className="inline-flex items-center gap-1 font-bold text-[var(--nr-primary)] hover:underline"
                    >
                      <span>{locale === 'es' ? 'Ver en e-CF' : 'View in e-CF'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-stretch">
                {/* Product picker */}
                <div className="hidden md:flex md:col-span-6 flex-col justify-between gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--nr-text-secondary)]">
                      {locale === 'es' ? 'Catálogo rápido' : 'Quick catalog'}
                    </span>
                    <span className="text-[11px] text-[var(--nr-text-secondary)]">
                      {locale === 'es' ? 'Clic para sumar' : 'Click to add'}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-2 flex-1">
                    {inventoryItems.slice(0, 3).map((p) => (
                      <button
                        key={p.sku}
                        type="button"
                        onClick={() => handleAdjustCart(p.sku, 1)}
                        className="rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface)] hover:border-[var(--nr-primary)] active:scale-[0.985] px-3 py-2 flex items-center justify-between gap-2 text-left nr-focus-ring nr-transition"
                      >
                        <div className="min-w-0">
                          <div className="font-display text-xs font-semibold text-[var(--nr-text)] truncate">
                            {locale === 'es' ? p.nameEs : p.nameEn}
                          </div>
                          <div className="text-[10px] text-[var(--nr-text-secondary)] truncate">
                            <span className="font-mono-num">{p.sku}</span> ·{' '}
                            {locale === 'es' ? p.locationEs : p.locationEn} · {p.stock}{' '}
                            {locale === 'es' ? 'uds' : 'u'}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-mono-num text-xs font-bold text-[var(--nr-primary)] whitespace-nowrap">
                            {fmtRd(p.unitPrice)}
                          </span>
                          <span className="w-6 h-6 rounded-lg bg-[var(--nr-surface-muted)] text-[var(--nr-text)] flex items-center justify-center">
                            <Plus className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Focused Cart & Interactive Customer + e-CF Receipt Selector */}
                <div className="md:col-span-6 rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface)] p-3 flex flex-col justify-between gap-2.5">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2 pb-2 border-b border-[var(--nr-border)]">
                      <span className="inline-flex items-center gap-1.5 font-display text-xs font-bold text-[var(--nr-text)]">
                        <ShoppingCart className="w-3.5 h-3.5 text-[var(--nr-primary)]" />
                        <span>{locale === 'es' ? 'Carrito · Caja #1' : 'Cart · Register #1'}</span>
                      </span>

                      {/* Customer toggle (auto-switches E31 vs E32) */}
                      <select
                        aria-label={locale === 'es' ? 'Cliente POS' : 'POS Customer'}
                        value={posCustomerMode}
                        onChange={(e) =>
                          handleCustomerSwitch(e.target.value as 'CORPORATE' | 'FINAL')
                        }
                        className="rounded-md border border-[var(--nr-border)] bg-[var(--nr-surface-muted)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--nr-text)] focus:outline-none"
                      >
                        <option value="CORPORATE">Hotel Costa Dorada (RNC)</option>
                        <option value="FINAL">
                          {locale === 'es' ? 'Consumidor Final' : 'Final Consumer'}
                        </option>
                      </select>
                    </div>

                    {/* Interactive e-CF E31 / E32 / Recibo selector */}
                    <div className="flex items-center justify-between gap-1 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-muted)] p-0.5 text-[10px] font-semibold">
                      <button
                        type="button"
                        onClick={() => setReceiptMode('E31')}
                        className={`flex-1 py-1 rounded-md nr-transition ${
                          receiptMode === 'E31'
                            ? 'bg-[var(--nr-surface)] text-[var(--nr-primary)] shadow-xs'
                            : 'text-[var(--nr-text-secondary)]'
                        }`}
                      >
                        e-CF E31
                      </button>
                      <button
                        type="button"
                        onClick={() => setReceiptMode('E32')}
                        className={`flex-1 py-1 rounded-md nr-transition ${
                          receiptMode === 'E32'
                            ? 'bg-[var(--nr-surface)] text-[var(--nr-primary)] shadow-xs'
                            : 'text-[var(--nr-text-secondary)]'
                        }`}
                      >
                        e-CF E32
                      </button>
                      <button
                        type="button"
                        onClick={() => setReceiptMode('INTERNAL')}
                        className={`flex-1 py-1 rounded-md nr-transition ${
                          receiptMode === 'INTERNAL'
                            ? 'bg-[var(--nr-surface)] text-[var(--nr-text)] shadow-xs'
                            : 'text-[var(--nr-text-secondary)]'
                        }`}
                      >
                        {locale === 'es' ? 'Recibo' : 'Slip'}
                      </button>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      {cartLines.length === 0 ? (
                        <div className="py-3 text-center text-[11px] text-[var(--nr-text-secondary)]">
                          {locale === 'es'
                            ? 'Carrito vacío. Suma artículos del catálogo.'
                            : 'Empty cart. Add items from catalog.'}
                        </div>
                      ) : (
                        cartLines.map((line) => (
                          <div
                            key={line.sku}
                            className="flex items-center justify-between gap-2"
                          >
                            <span className="text-[var(--nr-text)] truncate">
                              {locale === 'es' ? line.nameEs : line.nameEn}
                            </span>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                aria-label={`Minus ${line.sku}`}
                                onClick={() => handleAdjustCart(line.sku, -1)}
                                className="w-4 h-4 rounded border border-[var(--nr-border)] flex items-center justify-center text-[var(--nr-text-secondary)] hover:text-[var(--nr-text)]"
                              >
                                <Minus className="w-2.5 h-2.5" />
                              </button>
                              <span className="font-mono-num font-semibold w-4 text-center text-[11px]">
                                {line.qty}
                              </span>
                              <button
                                type="button"
                                aria-label={`Plus ${line.sku}`}
                                onClick={() => handleAdjustCart(line.sku, 1)}
                                className="w-4 h-4 rounded border border-[var(--nr-border)] flex items-center justify-center text-[var(--nr-text-secondary)] hover:text-[var(--nr-text)]"
                              >
                                <Plus className="w-2.5 h-2.5" />
                              </button>
                              <span className="font-mono-num font-semibold text-[var(--nr-text)] whitespace-nowrap ml-1">
                                {fmtRd(line.unitPrice * line.qty)}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[var(--nr-border)] space-y-1 text-[11px]">
                    <div className="flex justify-between text-[var(--nr-text-secondary)]">
                      <span>Subtotal</span>
                      <span className="font-mono-num">{fmtRd(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-[var(--nr-text-secondary)]">
                      <span>ITBIS (18%)</span>
                      <span className="font-mono-num">{fmtRd(itbis)}</span>
                    </div>
                    <div className="flex justify-between items-baseline font-display font-bold text-sm text-[var(--nr-text)] pt-1">
                      <span>{locale === 'es' ? 'Total a cobrar' : 'Total due'}</span>
                      <span className="font-mono-num text-base font-bold text-[var(--nr-primary)] whitespace-nowrap">
                        {fmtRd(total)}
                      </span>
                    </div>
                    <div className="pt-1.5">
                      <button
                        type="button"
                        disabled={total <= 0}
                        onClick={handleConfirmPreviewSale}
                        className="w-full py-2 px-3 rounded-lg bg-[var(--nr-primary)] hover:bg-[var(--nr-primary-hover)] disabled:opacity-45 active:scale-[0.985] text-[var(--nr-primary-fg)] text-center text-xs font-semibold nr-focus-ring nr-transition"
                      >
                        {receiptMode === 'INTERNAL'
                          ? locale === 'es'
                            ? 'Confirmar venta y actualizar caja'
                            : 'Confirm sale & update register'
                          : locale === 'es'
                            ? `Confirmar venta y emitir ${receiptMode}`
                            : `Confirm sale & issue ${receiptMode}`}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Synchronized Cashbox & Inventory Strip */}
              <div
                className={`rounded-xl border px-3.5 py-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs nr-transition ${
                  salePulse
                    ? 'border-[var(--nr-primary)] bg-[var(--nr-success-bg)]/70'
                    : 'border-[var(--nr-border)] bg-[var(--nr-surface)]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setActiveView('CASH')}
                  className="flex items-center justify-between gap-2 text-left"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-[var(--nr-success-bg)] text-[var(--nr-success)] flex items-center justify-center shrink-0">
                      <Landmark className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-[var(--nr-text)] truncate">
                        {locale === 'es' ? 'Caja #1 · Saldo en vivo' : 'Cashbox #1 · Balance'}
                      </div>
                      <div className="text-[11px] text-[var(--nr-text-secondary)] truncate">
                        {locale === 'es'
                          ? `Al confirmar suma +${fmtRd(total)}`
                          : `Adds +${fmtRd(total)} on confirm`}
                      </div>
                    </div>
                  </div>
                  <span className="font-mono-num font-bold text-[var(--nr-primary)] whitespace-nowrap">
                    {fmtRd(cashboxBalance)}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveView('INV')}
                  className="flex items-center justify-between gap-2 sm:border-l sm:border-[var(--nr-border)] sm:pl-3 text-left"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-[var(--nr-surface-muted)] text-[var(--nr-text)] flex items-center justify-center shrink-0">
                      <Boxes className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-[var(--nr-text)] truncate">
                        {locale === 'es' ? 'Inventario · Descuento en línea' : 'Inventory · Live stock'}
                      </div>
                      <div className="text-[11px] text-[var(--nr-text-secondary)] truncate">
                        {locale === 'es'
                          ? `Arroz 10 lb · ${totalUnits} uds en carrito`
                          : `Rice 10 lb · ${totalUnits} u in cart`}
                      </div>
                    </div>
                  </div>
                  <span className="font-mono-num font-bold text-[var(--nr-text)] whitespace-nowrap">
                    {riceItem.stock} {locale === 'es' ? 'uds' : 'u'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* 2. FACTURACIÓN ELECTRÓNICA (e-CF) INTERACTIVE VIEW */}
          {activeView === 'ECF' && (
            <div key="ECF" className="space-y-3 nr-panel-enter">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--nr-primary)]">
                    {locale === 'es' ? 'Guía DGII No. 6 · e-NCF E31–E47' : 'DGII Guide No. 6 · e-NCF E31–E47'}
                  </div>
                  <div className="font-display text-base sm:text-lg font-bold tracking-tight text-[var(--nr-text)] leading-tight">
                    {locale === 'es' ? 'Facturación Electrónica (e-CF)' : 'Electronic Invoicing (e-CF)'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setQuickIssueOpen((p) => !p)}
                  className="inline-flex items-center gap-1 h-8 px-3 rounded-lg bg-[var(--nr-primary)] hover:bg-[var(--nr-primary-hover)] text-[11px] font-semibold text-[var(--nr-primary-fg)] nr-transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{locale === 'es' ? 'Emitir e-CF rápido' : 'Quick issue e-CF'}</span>
                </button>
              </div>

              {/* KPI Strip */}
              <div className="grid grid-cols-3 gap-2.5 text-xs">
                <div className="rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface)] px-3 py-2">
                  <div className="text-[10px] uppercase tracking-wider text-[var(--nr-text-secondary)] font-semibold">
                    {locale === 'es' ? 'Emitidos' : 'Issued'}
                  </div>
                  <div className="font-mono-num text-sm font-bold text-[var(--nr-text)]">
                    {ecfDocs.length}
                  </div>
                </div>
                <div className="rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface)] px-3 py-2">
                  <div className="text-[10px] uppercase tracking-wider text-[var(--nr-text-secondary)] font-semibold">
                    {locale === 'es' ? 'Aceptados DGII' : 'DGII Accepted'}
                  </div>
                  <div className="font-mono-num text-sm font-bold text-[var(--nr-success)]">
                    {acceptedEcfCount}
                  </div>
                </div>
                <div className="rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface)] px-3 py-2">
                  <div className="text-[10px] uppercase tracking-wider text-[var(--nr-text-secondary)] font-semibold">
                    TrackID
                  </div>
                  <div className="font-mono-num text-sm font-bold text-[var(--nr-warning)]">
                    {inProcessEcfCount} {locale === 'es' ? 'en proceso' : 'pending'}
                  </div>
                </div>
              </div>

              {/* Inline Quick e-CF Issuance Form */}
              {quickIssueOpen && (
                <form
                  onSubmit={handleQuickIssueEcf}
                  className="rounded-xl border border-[var(--nr-primary)]/45 bg-[var(--nr-surface)] p-3 grid grid-cols-1 sm:grid-cols-12 gap-2 items-end text-xs"
                >
                  <div className="sm:col-span-3">
                    <label className="block text-[10px] font-semibold text-[var(--nr-text-secondary)] mb-1">
                      {locale === 'es' ? 'Tipo e-CF' : 'Type'}
                    </label>
                    <select
                      value={quickIssueType}
                      onChange={(e) => setQuickIssueType(e.target.value as '31' | '32')}
                      className="w-full h-8 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-bg)] px-2 text-xs text-[var(--nr-text)]"
                    >
                      <option value="31">E31 Crédito Fiscal</option>
                      <option value="32">E32 Consumo</option>
                    </select>
                  </div>
                  <div className="sm:col-span-4">
                    <label className="block text-[10px] font-semibold text-[var(--nr-text-secondary)] mb-1">
                      {locale === 'es' ? 'Receptor' : 'Recipient'}
                    </label>
                    <input
                      value={quickIssueType === '32' ? 'Consumidor Final' : quickIssueBuyer}
                      disabled={quickIssueType === '32'}
                      onChange={(e) => setQuickIssueBuyer(e.target.value)}
                      className="w-full h-8 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-bg)] px-2 text-xs text-[var(--nr-text)] disabled:opacity-60"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-semibold text-[var(--nr-text-secondary)] mb-1">
                      RNC
                    </label>
                    <input
                      value={quickIssueType === '32' ? '—' : quickIssueRnc}
                      disabled={quickIssueType === '32'}
                      onChange={(e) => setQuickIssueRnc(e.target.value)}
                      className="w-full h-8 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-bg)] px-2 text-xs font-mono-num text-[var(--nr-text)] disabled:opacity-60"
                    />
                  </div>
                  <div className="sm:col-span-3 flex items-center gap-1.5">
                    <input
                      type="number"
                      min="100"
                      value={quickIssueAmount}
                      onChange={(e) => setQuickIssueAmount(e.target.value)}
                      aria-label={locale === 'es' ? 'Monto gravado' : 'Taxable amount'}
                      className="w-full h-8 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-bg)] px-2 text-xs font-mono-num text-[var(--nr-text)]"
                    />
                    <button
                      type="submit"
                      className="h-8 px-2.5 rounded-lg bg-[var(--nr-primary)] text-white text-[11px] font-semibold shrink-0"
                    >
                      {locale === 'es' ? 'Firmar' : 'Sign'}
                    </button>
                  </div>
                </form>
              )}

              {/* Filter Chips */}
              <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-semibold">
                {(
                  [
                    { id: 'ALL', label: locale === 'es' ? 'Todos' : 'All' },
                    { id: '31', label: 'E31 Crédito Fiscal' },
                    { id: '32', label: 'E32 Consumo' },
                    { id: '34', label: 'E34 Nota Crédito' },
                  ] as const
                ).map((chip) => (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => setEcfFilterType(chip.id)}
                    className={`px-2.5 py-1 rounded-md border nr-transition ${
                      ecfFilterType === chip.id
                        ? 'border-[var(--nr-primary)] bg-[var(--nr-success-bg)] text-[var(--nr-primary)]'
                        : 'border-[var(--nr-border)] bg-[var(--nr-surface)] text-[var(--nr-text-secondary)]'
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              {/* Split: e-CF List + Interactive Inspector / RI QR card */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-stretch">
                <div className="md:col-span-7 rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface)] divide-y divide-[var(--nr-border)] overflow-hidden">
                  {filteredEcfs.slice(0, 4).map((doc) => {
                    const active = selectedEcf?.id === doc.id;
                    return (
                      <div
                        key={doc.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          setSelectedEcfId(doc.id);
                          setShowMiniRiModal(false);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            setSelectedEcfId(doc.id);
                          }
                        }}
                        className={`px-3 py-2 flex items-center justify-between gap-2 text-xs cursor-pointer nr-transition ${
                          active
                            ? 'bg-[var(--nr-success-bg)]/70'
                            : 'hover:bg-[var(--nr-surface-muted)]/60'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="font-mono-num font-bold text-[var(--nr-primary)] truncate">
                            {doc.eNcf}
                          </div>
                          <div className="text-[11px] text-[var(--nr-text-secondary)] truncate">
                            {doc.buyerName}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                              doc.status === 'ACEPTADO'
                                ? 'border-[var(--nr-success-border)] bg-[var(--nr-success-bg)] text-[var(--nr-success)]'
                                : 'border-[var(--nr-warning-border)] bg-[var(--nr-warning-bg)] text-[var(--nr-warning)]'
                            }`}
                          >
                            {doc.status === 'ACEPTADO'
                              ? locale === 'es'
                                ? 'Aceptado'
                                : 'Accepted'
                              : locale === 'es'
                                ? 'En proceso'
                                : 'Pending'}
                          </span>
                          <span className="font-mono-num font-bold text-[var(--nr-text)] whitespace-nowrap">
                            {fmtRd(doc.total)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Selected e-CF Inspector / Inline RI QR Preview */}
                {selectedEcf && (
                  <div className="md:col-span-5 rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface)] p-3 flex flex-col justify-between gap-2.5 text-xs">
                    {!showMiniRiModal ? (
                      <>
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-mono-num font-bold text-[var(--nr-primary)]">
                              {selectedEcf.eNcf}
                            </span>
                            <span className="text-[10px] text-[var(--nr-text-secondary)]">
                              {selectedEcf.date}
                            </span>
                          </div>
                          <div className="text-[11px] font-semibold text-[var(--nr-text)] truncate">
                            {selectedEcf.buyerName}
                          </div>
                          <div className="rounded-lg border border-[var(--nr-border)] bg-[var(--nr-bg)] p-2 space-y-1 text-[10px]">
                            <div className="flex justify-between gap-2">
                              <span className="text-[var(--nr-text-secondary)]">TrackID:</span>
                              <span className="font-mono-num font-semibold text-[var(--nr-text)] truncate">
                                {selectedEcf.trackId}
                              </span>
                            </div>
                            <div className="flex justify-between gap-2">
                              <span className="text-[var(--nr-text-secondary)]">
                                {locale === 'es' ? 'Cód. Seguridad:' : 'Security Code:'}
                              </span>
                              <span className="font-mono-num font-bold text-[var(--nr-primary)]">
                                {selectedEcf.securityCode}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          {selectedEcf.status === 'EN_PROCESO' && (
                            <button
                              type="button"
                              onClick={() => handlePollTrackId(selectedEcf.id)}
                              className="w-full py-1.5 px-2.5 rounded-lg border border-[var(--nr-warning-border)] bg-[var(--nr-warning-bg)] text-[var(--nr-warning)] text-[11px] font-semibold inline-flex items-center justify-center gap-1.5"
                            >
                              <RefreshCw className="w-3 h-3" />
                              <span>
                                {locale === 'es' ? 'Consultar TrackID DGII' : 'Poll DGII TrackID'}
                              </span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setShowMiniRiModal(true)}
                            className="w-full py-1.5 px-2.5 rounded-lg bg-[var(--nr-primary)] hover:bg-[var(--nr-primary-hover)] text-[var(--nr-primary-fg)] text-[11px] font-semibold inline-flex items-center justify-center gap-1.5"
                          >
                            <QrCode className="w-3 h-3" />
                            <span>
                              {locale === 'es' ? 'Ver RI con QR y firma' : 'View RI with QR'}
                            </span>
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="space-y-2 text-[10px]">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[var(--nr-primary)]">
                            RI · {selectedEcf.eNcf}
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowMiniRiModal(false)}
                            className="text-[var(--nr-text-secondary)] hover:text-[var(--nr-text)] font-semibold"
                          >
                            {locale === 'es' ? 'Volver' : 'Back'}
                          </button>
                        </div>
                        <div className="flex items-center gap-2.5 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-bg)] p-2">
                          <div className="w-12 h-12 rounded bg-white p-1 border border-slate-200 shrink-0 grid grid-cols-5 gap-0.5">
                            {[
                              1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1,
                              1, 1,
                            ].map((c, idx) => (
                              <span
                                key={idx}
                                className={c ? 'bg-slate-900 rounded-[1px]' : 'bg-white'}
                              />
                            ))}
                          </div>
                          <div className="min-w-0 space-y-0.5">
                            <div className="font-semibold text-[var(--nr-text)]">
                              {locale === 'es' ? 'Timbre Electrónico' : 'e-CF Stamp'}
                            </div>
                            <div className="font-mono-num text-[var(--nr-primary)] font-bold">
                              {selectedEcf.securityCode}
                            </div>
                            <div className="text-[9px] text-[var(--nr-text-secondary)] truncate">
                              {locale === 'es' ? 'Ejemplo ilustrativo' : 'Illustrative sample'}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3. SALES VIEW */}
          {activeView === 'SALES' && (
            <div key="SALES" className="space-y-3 nr-panel-enter">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--nr-primary)]">
                    {locale === 'es' ? 'Historial sincronizado' : 'Synced sales log'}
                  </div>
                  <div className="font-display text-base sm:text-lg font-bold text-[var(--nr-text)]">
                    {locale === 'es' ? 'Ventas y comprobantes' : 'Sales & Receipts'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveView('POS')}
                  className="h-8 px-3 rounded-lg bg-[var(--nr-primary)] text-white text-[11px] font-semibold"
                >
                  + {locale === 'es' ? 'Nueva venta POS' : 'New POS sale'}
                </button>
              </div>

              <div className="rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface)] divide-y divide-[var(--nr-border)]">
                {salesDocs.slice(0, 5).map((sale) => (
                  <div
                    key={sale.id}
                    className="px-3.5 py-2.5 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono-num font-bold text-[var(--nr-primary)]">
                          {sale.number}
                        </span>
                        {sale.eNcf && (
                          <button
                            type="button"
                            onClick={() => {
                              const found = ecfDocs.find((e) => e.eNcf === sale.eNcf);
                              if (found) setSelectedEcfId(found.id);
                              setActiveView('ECF');
                            }}
                            className="font-mono-num text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[var(--nr-success-bg)] text-[var(--nr-success)] border border-[var(--nr-success-border)] hover:underline"
                          >
                            {sale.eNcf}
                          </button>
                        )}
                      </div>
                      <div className="text-[11px] text-[var(--nr-text-secondary)] truncate mt-0.5">
                        {sale.customer} · {locale === 'es' ? sale.methodEs : sale.methodEn} ·{' '}
                        {sale.time}
                      </div>
                    </div>
                    <span className="font-mono-num font-bold text-[var(--nr-text)] whitespace-nowrap">
                      {fmtRd(sale.total)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. CASHBOX VIEW */}
          {activeView === 'CASH' && (
            <div key="CASH" className="space-y-3 nr-panel-enter">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--nr-primary)]">
                    {locale === 'es' ? 'Turno CAJ-024 · Abierto' : 'Shift CAJ-024 · Open'}
                  </div>
                  <div className="font-display text-base sm:text-lg font-bold text-[var(--nr-text)]">
                    {locale === 'es' ? 'Caja #1 · Control de turno' : 'Cashbox #1 · Shift Control'}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCashboxBalance((b) => Math.round((b + 500) * 100) / 100)}
                    className="h-8 px-2.5 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface)] hover:border-[var(--nr-primary)] text-[11px] font-semibold text-[var(--nr-text)]"
                  >
                    +RD$500
                  </button>
                  <button
                    type="button"
                    onClick={() => setCashboxBalance((b) => Math.max(0, Math.round((b - 250) * 100) / 100))}
                    className="h-8 px-2.5 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface)] hover:border-[var(--nr-warning)] text-[11px] font-semibold text-[var(--nr-text)]"
                  >
                    -RD$250
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface)] p-3">
                  <div className="text-[10px] text-[var(--nr-text-secondary)] uppercase font-semibold">
                    {locale === 'es' ? 'Fondo inicial' : 'Opening float'}
                  </div>
                  <div className="font-mono-num text-sm font-bold text-[var(--nr-text)] mt-1">
                    RD$5,000.00
                  </div>
                </div>
                <div className="rounded-xl border border-[var(--nr-success-border)] bg-[var(--nr-success-bg)]/50 p-3">
                  <div className="text-[10px] text-[var(--nr-success)] uppercase font-semibold">
                    {locale === 'es' ? 'Saldo esperado' : 'Expected balance'}
                  </div>
                  <div className="font-mono-num text-sm font-bold text-[var(--nr-primary)] mt-1">
                    {fmtRd(cashboxBalance)}
                  </div>
                </div>
                <div className="col-span-2 sm:col-span-1 rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface)] p-3">
                  <div className="text-[10px] text-[var(--nr-text-secondary)] uppercase font-semibold">
                    {locale === 'es' ? 'Ventas cobradas' : 'Collected sales'}
                  </div>
                  <div className="font-mono-num text-sm font-bold text-[var(--nr-text)] mt-1">
                    {salesDocs.length}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface)] p-3 space-y-2 text-xs">
                <div className="font-semibold text-[var(--nr-text)]">
                  {locale === 'es' ? 'Últimos movimientos de caja' : 'Recent register entries'}
                </div>
                <div className="divide-y divide-[var(--nr-border)]">
                  {salesDocs.slice(0, 3).map((s) => (
                    <div key={s.id} className="py-1.5 flex justify-between gap-2">
                      <span className="text-[var(--nr-text-secondary)] truncate">
                        {s.number} · {locale === 'es' ? s.methodEs : s.methodEn}
                      </span>
                      <span className="font-mono-num font-semibold text-[var(--nr-primary)] whitespace-nowrap">
                        +{fmtRd(s.total)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 5. INVENTORY VIEW */}
          {activeView === 'INV' && (
            <div key="INV" className="space-y-3 nr-panel-enter">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--nr-primary)]">
                    {locale === 'es' ? 'Stock en tiempo real' : 'Live warehouse stock'}
                  </div>
                  <div className="font-display text-base sm:text-lg font-bold text-[var(--nr-text)]">
                    {locale === 'es' ? 'Inventario operativo' : 'Operational Inventory'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveView('POS')}
                  className="h-8 px-3 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface)] hover:border-[var(--nr-primary)] text-[11px] font-semibold text-[var(--nr-text)]"
                >
                  {locale === 'es' ? 'Ir al POS' : 'Open POS'}
                </button>
              </div>

              <div className="rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface)] divide-y divide-[var(--nr-border)]">
                {inventoryItems.map((item) => {
                  const low = item.stock <= item.minStock;
                  return (
                    <div
                      key={item.sku}
                      className="px-3.5 py-2.5 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="min-w-0">
                        <div className="font-semibold text-[var(--nr-text)] truncate">
                          {locale === 'es' ? item.nameEs : item.nameEn}
                        </div>
                        <div className="text-[11px] text-[var(--nr-text-secondary)]">
                          <span className="font-mono-num">{item.sku}</span> ·{' '}
                          {locale === 'es' ? item.locationEs : item.locationEn}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {low && (
                          <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold border border-[var(--nr-warning-border)] bg-[var(--nr-warning-bg)] text-[var(--nr-warning)]">
                            {locale === 'es' ? 'Stock bajo' : 'Low'}
                          </span>
                        )}
                        <span className="font-mono-num font-bold text-[var(--nr-text)] w-12 text-right">
                          {item.stock} {locale === 'es' ? 'uds' : 'u'}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setInventoryItems((prev) =>
                              prev.map((p) =>
                                p.sku === item.sku ? { ...p, stock: p.stock + 10 } : p
                              )
                            )
                          }
                          className="px-2 py-1 rounded-md border border-[var(--nr-border)] bg-[var(--nr-bg)] hover:border-[var(--nr-primary)] text-[10px] font-semibold text-[var(--nr-primary)]"
                        >
                          +10
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 6. PAYROLL & TSS VIEW */}
          {activeView === 'PAY' && (
            <div key="PAY" className="space-y-3 nr-panel-enter">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--nr-primary)]">
                    {locale === 'es' ? 'TSS · AFP · SFS · ISR (RD)' : 'TSS · AFP · SFS · ISR (DR)'}
                  </div>
                  <div className="font-display text-base sm:text-lg font-bold text-[var(--nr-text)]">
                    {locale === 'es' ? 'Nómina y cumplimiento' : 'Payroll & Compliance'}
                  </div>
                </div>
                <span className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold border border-[var(--nr-warning-border)] bg-[var(--nr-warning-bg)] text-[var(--nr-warning)]">
                  {locale === 'es' ? 'Solo demo' : 'Demo only'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2.5 text-xs">
                <div className="rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface)] p-2.5">
                  <div className="text-[10px] text-[var(--nr-text-secondary)]">
                    {locale === 'es' ? 'Nómina bruta' : 'Gross payroll'}
                  </div>
                  <div className="font-mono-num font-bold text-[var(--nr-text)] mt-0.5">
                    RD$156,500.00
                  </div>
                </div>
                <div className="rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface)] p-2.5">
                  <div className="text-[10px] text-[var(--nr-text-secondary)]">TSS + ISR</div>
                  <div className="font-mono-num font-bold text-[var(--nr-text)] mt-0.5">
                    RD$18,530.00
                  </div>
                </div>
                <div className="rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface)] p-2.5">
                  <div className="text-[10px] text-[var(--nr-text-secondary)]">
                    {locale === 'es' ? 'Neto a pagar' : 'Net pay'}
                  </div>
                  <div className="font-mono-num font-bold text-[var(--nr-primary)] mt-0.5">
                    RD$137,970.00
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface)] divide-y divide-[var(--nr-border)]">
                {payrollRows.map((emp) => (
                  <div
                    key={emp.id}
                    className="px-3.5 py-2.5 flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-[var(--nr-text)] truncate">{emp.name}</div>
                      <div className="text-[11px] text-[var(--nr-text-secondary)]">
                        {locale === 'es' ? emp.roleEs : emp.roleEn} ·{' '}
                        <span className="font-mono-num">{fmtRd(emp.net)}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setPayrollRows((prev) =>
                          prev.map((r) =>
                            r.id === emp.id
                              ? {
                                  ...r,
                                  status: r.status === 'APPROVED' ? 'PENDING' : 'APPROVED',
                                }
                              : r
                          )
                        )
                      }
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold border nr-transition ${
                        emp.status === 'APPROVED'
                          ? 'border-[var(--nr-success-border)] bg-[var(--nr-success-bg)] text-[var(--nr-success)]'
                          : 'border-[var(--nr-warning-border)] bg-[var(--nr-warning-bg)] text-[var(--nr-warning)]'
                      }`}
                    >
                      {emp.status === 'APPROVED'
                        ? locale === 'es'
                          ? 'Aprobado'
                          : 'Approved'
                        : locale === 'es'
                          ? 'Aprobar'
                          : 'Approve'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7. ACCOUNTING VIEW */}
          {activeView === 'ACC' && (
            <div key="ACC" className="space-y-3 nr-panel-enter">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--nr-primary)]">
                    {locale === 'es' ? 'Diario y balanza · En línea' : 'General Ledger · Live'}
                  </div>
                  <div className="font-display text-base sm:text-lg font-bold text-[var(--nr-text)]">
                    {locale === 'es' ? 'Contabilidad general' : 'General Accounting'}
                  </div>
                </div>
                <span className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold border border-[var(--nr-success-border)] bg-[var(--nr-success-bg)] text-[var(--nr-success)]">
                  {locale === 'es' ? 'Diario cuadrado' : 'Balanced'}
                </span>
              </div>

              <div className="rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface)] divide-y divide-[var(--nr-border)]">
                {journalRows.slice(0, 4).map((row) => (
                  <div
                    key={row.id}
                    className="px-3.5 py-2.5 flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="font-mono-num text-[11px] font-bold text-[var(--nr-primary)]">
                        {row.ref} · {row.time}
                      </div>
                      <div className="text-[11px] text-[var(--nr-text)] truncate">
                        {locale === 'es' ? row.conceptEs : row.conceptEn}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-mono-num font-bold text-[var(--nr-text)]">
                        {fmtRd(row.debit)}
                      </div>
                      <div className="text-[10px] text-[var(--nr-success)]">
                        {locale === 'es' ? 'Déb = Créd' : 'Dr = Cr'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 8. EXECUTIVE DASHBOARD VIEW */}
          {activeView === 'DASH' && (
            <div key="DASH" className="space-y-3.5 nr-panel-enter">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--nr-primary)]">
                    {locale === 'es' ? 'Pulso operativo' : 'Operational pulse'}
                  </div>
                  <div className="font-display text-lg font-bold tracking-tight text-[var(--nr-text)] leading-tight">
                    {locale === 'es' ? 'Tablero general' : 'Executive Overview'}
                  </div>
                </div>
                <div className="text-[11px] text-[var(--nr-text-secondary)] font-medium">
                  {locale === 'es' ? 'Noviembre 2026 · 3 sucursales' : 'November 2026 · 3 branches'}
                </div>
              </div>

              {/* 4 Interactive KPI Sparkline Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
                <button
                  type="button"
                  onClick={() => setActiveView('SALES')}
                  className="text-left rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface)] hover:border-[var(--nr-primary)] p-3 nr-transition"
                >
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--nr-text-secondary)]">
                    {locale === 'es' ? 'Ventas del mes' : 'Monthly sales'}
                  </div>
                  <div className="mt-1 font-mono-num text-sm font-bold text-[var(--nr-text)] whitespace-nowrap">
                    {fmtRd(482910 + (shiftSalesTotal - 28450))}
                  </div>
                  <Sparkline points="0,18 20,15 40,16 60,11 80,8 100,4" tone="emerald" />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveView('CASH')}
                  className="text-left rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface)] hover:border-[var(--nr-primary)] p-3 nr-transition"
                >
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--nr-text-secondary)]">
                    {locale === 'es' ? 'Caja activa' : 'Active cashbox'}
                  </div>
                  <div className="mt-1 font-mono-num text-sm font-bold text-[var(--nr-text)] whitespace-nowrap">
                    {fmtRd(cashboxBalance)}
                  </div>
                  <Sparkline points="0,10 25,13 50,11 75,15 100,12" tone="slate" />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveView('PAY')}
                  className="text-left rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface)] hover:border-[var(--nr-primary)] p-3 nr-transition"
                >
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--nr-text-secondary)]">
                    {locale === 'es' ? 'Nómina activa' : 'Active payroll'}
                  </div>
                  <div className="mt-1 font-mono-num text-sm font-bold text-[var(--nr-text)] whitespace-nowrap">
                    RD$156,500.00
                  </div>
                  <Sparkline points="0,14 33,14 66,12 100,11" tone="emerald" />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveView('ECF')}
                  className="text-left rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface)] hover:border-[var(--nr-primary)] p-3 nr-transition"
                >
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--nr-text-secondary)]">
                    {locale === 'es' ? 'Comprobantes' : 'e-CF Docs'}
                  </div>
                  <div className="mt-1 font-mono-num text-sm font-bold text-[var(--nr-primary)] whitespace-nowrap">
                    {ecfDocs.length} e-CF
                  </div>
                  <Sparkline points="0,19 25,16 50,13 75,7 100,3" tone="emerald" />
                </button>
              </div>

              {/* Lower Split: Agenda + Recent Movements */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
                <div className="md:col-span-5 rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface)] p-3.5 flex flex-col justify-between gap-3">
                  <div className="space-y-2">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--nr-text-secondary)]">
                      {locale === 'es' ? 'Agenda operativa' : 'Today’s focus'}
                    </div>
                    <div className="space-y-1.5 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setActiveView('PAY')}
                        className="w-full text-left flex items-start gap-2 hover:text-[var(--nr-primary)] nr-transition"
                      >
                        <Check className="w-3.5 h-3.5 text-[var(--nr-primary)] shrink-0 mt-0.5" />
                        <span>
                          {locale === 'es'
                            ? 'Revisión TSS e ISR de nómina lista para aprobación.'
                            : 'Payroll TSS & ISR run ready for review.'}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveView('INV')}
                        className="w-full text-left flex items-start gap-2 hover:text-[var(--nr-primary)] nr-transition"
                      >
                        <Clock className="w-3.5 h-3.5 text-[var(--nr-warning)] shrink-0 mt-0.5" />
                        <span>
                          {locale === 'es'
                            ? 'Azúcar Crema 5 lb en stock mínimo (reponer).'
                            : 'Brown Sugar 5 lb at low stock (reorder).'}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveView('ECF')}
                        className="w-full text-left flex items-start gap-2 hover:text-[var(--nr-primary)] nr-transition"
                      >
                        <FileCheck2 className="w-3.5 h-3.5 text-[var(--nr-primary)] shrink-0 mt-0.5" />
                        <span>
                          {locale === 'es'
                            ? `${inProcessEcfCount} e-CF con TrackID pendiente de validar.`
                            : `${inProcessEcfCount} e-CF TrackID pending validation.`}
                        </span>
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveView('POS')}
                    className="w-full py-2 px-3 rounded-lg bg-[var(--nr-primary)] hover:bg-[var(--nr-primary-hover)] text-[var(--nr-primary-fg)] text-[11px] font-semibold nr-focus-ring nr-transition"
                  >
                    {locale === 'es' ? 'Ir a facturar en POS' : 'Open POS checkout'}
                  </button>
                </div>

                <div className="md:col-span-7 rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface)] p-3.5 flex flex-col justify-between gap-2">
                  <div className="space-y-2">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--nr-text-secondary)]">
                      {locale === 'es' ? 'Movimientos recientes' : 'Recent activity'}
                    </div>
                    <div className="divide-y divide-[var(--nr-border)] text-[11px]">
                      {salesDocs.slice(0, 4).map((s) => (
                        <div key={s.id} className="py-2 flex items-center justify-between gap-2">
                          <span className="truncate text-[var(--nr-text)]">
                            <span className="font-mono-num text-[var(--nr-text-secondary)] mr-1.5">
                              {s.time}
                            </span>
                            {s.eNcf ? `${s.eNcf} · ${s.customer}` : `${s.number} · ${s.customer}`}
                          </span>
                          <span className="font-mono-num font-semibold text-[var(--nr-primary)] whitespace-nowrap">
                            +{fmtRd(s.total)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
