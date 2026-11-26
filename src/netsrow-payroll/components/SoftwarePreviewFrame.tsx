import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Boxes,
  Building2,
  Check,
  FileCheck2,
  Home,
  Landmark,
  MonitorSmartphone,
  Plus,
  ReceiptText,
  ShoppingCart,
  WalletCards,
} from 'lucide-react';
import { useCommercial } from '../context/CommercialContext';

interface PreviewCartLine {
  sku: string;
  nameEs: string;
  nameEn: string;
  stockNoteEs: string;
  stockNoteEn: string;
  unitPrice: number;
  qty: number;
}

const PREVIEW_CATALOG: PreviewCartLine[] = [
  {
    sku: 'ARR-010',
    nameEs: 'Arroz Selecto 10 lb',
    nameEn: 'Select Rice 10 lb',
    stockNoteEs: 'Almacén A · 48 uds',
    stockNoteEn: 'Warehouse A · 48 u',
    unitPrice: 340,
    qty: 2,
  },
  {
    sku: 'ACE-032',
    nameEs: 'Aceite Vegetal 32 oz',
    nameEn: 'Vegetable Oil 32 oz',
    stockNoteEs: 'Góndola 2 · 26 uds',
    stockNoteEn: 'Aisle 2 · 26 u',
    unitPrice: 215,
    qty: 1,
  },
  {
    sku: 'CAF-001',
    nameEs: 'Café Molido 1 lb',
    nameEn: 'Ground Coffee 1 lb',
    stockNoteEs: 'Mostrador · 19 uds',
    stockNoteEn: 'Counter · 19 u',
    unitPrice: 295,
    qty: 1,
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
  const [tab, setTab] = useState<'POS' | 'DASH'>('POS');
  const [receiptMode, setReceiptMode] = useState<'INTERNAL' | 'ECF'>('ECF');
  const [cartQuantities, setCartQuantities] = useState<Record<string, number>>({
    'ARR-010': 2,
    'ACE-032': 1,
    'CAF-001': 1,
  });
  const [cashboxBalance, setCashboxBalance] = useState<number>(16800);
  const [riceStock, setRiceStock] = useState<number>(48);
  const [lastConfirmedSaleTotal, setLastConfirmedSaleTotal] = useState<number | null>(null);
  const [salePulse, setSalePulse] = useState(false);

  useEffect(() => {
    if (!salePulse) return;
    const t = window.setTimeout(() => setSalePulse(false), 750);
    return () => window.clearTimeout(t);
  }, [salePulse]);

  const handleAddUnit = (sku: string) => {
    setCartQuantities((prev) => ({
      ...prev,
      [sku]: (prev[sku] ?? 0) + 1,
    }));
  };

  const cartLines = PREVIEW_CATALOG.filter((item) => (cartQuantities[item.sku] ?? 0) > 0).map(
    (item) => ({
      ...item,
      qty: cartQuantities[item.sku] ?? 0,
    })
  );

  const subtotal = cartLines.reduce((acc, item) => acc + item.unitPrice * item.qty, 0);
  const itbis = Math.round(subtotal * 0.08 * 100) / 100;
  const total = subtotal + itbis;
  const totalUnits = cartLines.reduce((acc, item) => acc + item.qty, 0);
  const riceCartQty = cartQuantities['ARR-010'] ?? 0;

  const handleConfirmPreviewSale = () => {
    if (total <= 0) return;
    setCashboxBalance((prev) => Math.round((prev + total) * 100) / 100);
    setRiceStock((prev) => Math.max(4, prev - riceCartQty));
    setLastConfirmedSaleTotal(total);
    setSalePulse(true);
  };

  const navItems: {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    targetTab: 'POS' | 'DASH';
    active: boolean;
  }[] = [
    {
      id: 'dash',
      label: locale === 'es' ? 'Tablero' : 'Overview',
      icon: Home,
      targetTab: 'DASH',
      active: tab === 'DASH',
    },
    {
      id: 'pos',
      label: 'POS',
      icon: MonitorSmartphone,
      targetTab: 'POS',
      active: tab === 'POS',
    },
    {
      id: 'sales',
      label: locale === 'es' ? 'Ventas' : 'Sales',
      icon: ReceiptText,
      targetTab: 'DASH',
      active: false,
    },
    {
      id: 'ecf',
      label: locale === 'es' ? 'Facturación e-CF' : 'e-CF Invoicing',
      icon: FileCheck2,
      targetTab: 'POS',
      active: false,
    },
    {
      id: 'cash',
      label: locale === 'es' ? 'Caja' : 'Cashbox',
      icon: Landmark,
      targetTab: 'POS',
      active: false,
    },
    {
      id: 'inv',
      label: locale === 'es' ? 'Inventario' : 'Inventory',
      icon: Boxes,
      targetTab: 'DASH',
      active: false,
    },
    {
      id: 'pay',
      label: locale === 'es' ? 'Nómina y TSS' : 'Payroll & TSS',
      icon: WalletCards,
      targetTab: 'DASH',
      active: false,
    },
    {
      id: 'acc',
      label: locale === 'es' ? 'Contabilidad' : 'Accounting',
      icon: BookOpen,
      targetTab: 'DASH',
      active: false,
    },
  ];

  return (
    <div className="bg-[var(--nr-surface)] text-[var(--nr-text)] overflow-hidden nr-transition select-none">
      {/* Executive Top Window Bar inside Laptop Screen */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 border-b border-[var(--nr-border)] bg-[var(--nr-surface)]">
        {/* Left: Workspace breadcrumb & Branch context */}
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
              aria-selected={tab === 'POS'}
              onClick={() => setTab('POS')}
              className={`px-3 py-1 text-[11px] font-semibold rounded-md whitespace-nowrap nr-focus-ring nr-transition ${
                tab === 'POS'
                  ? 'bg-[var(--nr-surface)] text-[var(--nr-text)] shadow-xs'
                  : 'text-[var(--nr-text-secondary)] hover:text-[var(--nr-text)]'
              }`}
            >
              {ct.hero.previewTabPos}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'DASH'}
              onClick={() => setTab('DASH')}
              className={`px-3 py-1 text-[11px] font-semibold rounded-md whitespace-nowrap nr-focus-ring nr-transition ${
                tab === 'DASH'
                  ? 'bg-[var(--nr-surface)] text-[var(--nr-text)] shadow-xs'
                  : 'text-[var(--nr-text-secondary)] hover:text-[var(--nr-text)]'
              }`}
            >
              {ct.hero.previewTabDash}
            </button>
          </div>
        </div>

        {/* Right: Factual Demo Indicator & Actor Avatar */}
        <div className="flex items-center gap-2.5 text-[11px]">
          <span className="hidden sm:inline font-medium text-[var(--nr-success)] bg-[var(--nr-success-bg)] border border-[var(--nr-success-border)] px-2 py-0.5 rounded-md">
            {locale === 'es' ? 'e-CF · Flujo ilustrativo' : 'e-CF · Illustrative flow'}
          </span>
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

      {/* App Shell Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-12 min-h-[390px]">
        {/* Dark Midnight Navy Navigation Sidebar */}
        <div className="hidden sm:flex sm:col-span-3 bg-[#081321] text-slate-200 p-3 flex-col justify-between gap-3 border-r border-[#1A293D]">
          <div className="space-y-2.5 w-full">
            <div className="flex items-center justify-between px-2 pt-0.5">
              <span className="font-display text-xs font-bold tracking-tight text-white">
                NetsRow ERP
              </span>
              <span className="text-[10px] text-slate-400 font-mono-num">RD$</span>
            </div>

            <div className="flex flex-col gap-0.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTab(item.targetTab)}
                    className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[11px] font-medium whitespace-nowrap nr-focus-ring nr-transition ${
                      item.active
                        ? 'bg-[#047857] text-white'
                        : 'text-slate-300/90 hover:bg-[#132B42] hover:text-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0 opacity-90" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2.5 border-t border-[#1A293D] px-2 space-y-0.5">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
              {locale === 'es' ? 'Caja #1 · Turno' : 'Register #1 · Shift'}
            </div>
            <div className="font-mono-num text-xs font-semibold text-emerald-300">
              {fmtRd(cashboxBalance)}
            </div>
          </div>
        </div>

        {/* Main Workspace Canvas */}
        <div className="sm:col-span-9 p-4 sm:p-5 bg-[var(--nr-bg)] flex flex-col justify-between gap-3.5">
          {tab === 'POS' ? (
            <div key="POS" className="space-y-3.5 nr-panel-enter">
              {/* Executive KPI Header Strip inside POS */}
              <div className="hidden md:grid grid-cols-3 gap-2.5">
                <div className="rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface)] px-3 py-2.5">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--nr-text-secondary)]">
                    {locale === 'es' ? 'Ventas del turno' : 'Shift sales'}
                  </div>
                  <div className="mt-0.5 font-mono-num text-sm font-bold text-[var(--nr-text)]">
                    RD$28,450.00
                  </div>
                </div>
                <div
                  className={`rounded-xl border px-3 py-2.5 nr-transition ${
                    salePulse
                      ? 'border-[var(--nr-primary)] bg-[var(--nr-success-bg)]'
                      : 'border-[var(--nr-border)] bg-[var(--nr-surface)]'
                  }`}
                >
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--nr-text-secondary)]">
                    {locale === 'es' ? 'Caja #1 en vivo' : 'Live cashbox'}
                  </div>
                  <div className="mt-0.5 font-mono-num text-sm font-bold text-[var(--nr-primary)]">
                    {fmtRd(cashboxBalance)}
                  </div>
                </div>
                <div className="rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface)] px-3 py-2.5">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--nr-text-secondary)]">
                    {locale === 'es' ? 'Comprobante activo' : 'Active receipt'}
                  </div>
                  <div
                    key={receiptMode}
                    className="mt-0.5 text-xs font-bold text-[var(--nr-text)] truncate nr-panel-enter"
                  >
                    {receiptMode === 'ECF'
                      ? locale === 'es'
                        ? 'e-CF · Crédito Fiscal'
                        : 'e-CF · Fiscal Receipt'
                      : locale === 'es'
                        ? 'Recibo interno no fiscal'
                        : 'Internal non-fiscal slip'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-stretch">
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
                    {PREVIEW_CATALOG.map((p) => (
                      <button
                        key={p.sku}
                        type="button"
                        onClick={() => handleAddUnit(p.sku)}
                        className="rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface)] hover:border-[var(--nr-primary)] active:scale-[0.985] px-3 py-2.5 flex items-center justify-between gap-2 text-left nr-focus-ring nr-transition"
                      >
                        <div className="min-w-0">
                          <div className="font-display text-xs font-semibold text-[var(--nr-text)] truncate">
                            {locale === 'es' ? p.nameEs : p.nameEn}
                          </div>
                          <div className="text-[10px] text-[var(--nr-text-secondary)] truncate">
                            <span className="font-mono-num">{p.sku}</span> ·{' '}
                            {locale === 'es' ? p.stockNoteEs : p.stockNoteEn}
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

                {/* Focused Cart & e-CF Receipt Summary */}
                <div className="md:col-span-6 rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface)] p-3.5 flex flex-col justify-between gap-3">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2 pb-2 border-b border-[var(--nr-border)]">
                      <span className="inline-flex items-center gap-1.5 font-display text-xs font-bold text-[var(--nr-text)]">
                        <ShoppingCart className="w-3.5 h-3.5 text-[var(--nr-primary)]" />
                        <span>
                          {locale === 'es' ? 'Carrito · Caja #1' : 'Cart · Register #1'}
                        </span>
                      </span>

                      {/* Functional Internal vs e-CF Illustrative Selector */}
                      <div className="inline-flex rounded-md border border-[var(--nr-border)] bg-[var(--nr-surface-muted)] p-0.5 text-[10px] font-semibold">
                        <button
                          type="button"
                          onClick={() => setReceiptMode('ECF')}
                          className={`px-2 py-0.5 rounded nr-transition ${
                            receiptMode === 'ECF'
                              ? 'bg-[var(--nr-surface)] text-[var(--nr-primary)] shadow-xs'
                              : 'text-[var(--nr-text-secondary)]'
                          }`}
                        >
                          e-CF
                        </button>
                        <button
                          type="button"
                          onClick={() => setReceiptMode('INTERNAL')}
                          className={`px-2 py-0.5 rounded nr-transition ${
                            receiptMode === 'INTERNAL'
                              ? 'bg-[var(--nr-surface)] text-[var(--nr-text)] shadow-xs'
                              : 'text-[var(--nr-text-secondary)]'
                          }`}
                        >
                          {locale === 'es' ? 'Recibo' : 'Slip'}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      {cartLines.map((line) => (
                        <div key={line.sku} className="flex items-center justify-between gap-2">
                          <span className="text-[var(--nr-text)] truncate">
                            <span className="font-mono-num font-semibold text-[var(--nr-text-secondary)]">
                              {line.qty}×
                            </span>{' '}
                            {locale === 'es' ? line.nameEs : line.nameEn}
                          </span>
                          <span className="font-mono-num font-semibold text-[var(--nr-text)] whitespace-nowrap">
                            {fmtRd(line.unitPrice * line.qty)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-[var(--nr-border)] space-y-1 text-[11px]">
                    <div className="flex justify-between text-[var(--nr-text-secondary)]">
                      <span>Subtotal</span>
                      <span className="font-mono-num">{fmtRd(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-[var(--nr-text-secondary)]">
                      <span>ITBIS (ref.)</span>
                      <span className="font-mono-num">{fmtRd(itbis)}</span>
                    </div>
                    <div className="flex justify-between items-baseline font-display font-bold text-sm text-[var(--nr-text)] pt-1.5">
                      <span>{locale === 'es' ? 'Total a cobrar' : 'Total due'}</span>
                      <span className="font-mono-num text-base font-bold text-[var(--nr-primary)] whitespace-nowrap">
                        {fmtRd(total)}
                      </span>
                    </div>
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleConfirmPreviewSale}
                        className="w-full py-2 px-3 rounded-lg bg-[var(--nr-primary)] hover:bg-[var(--nr-primary-hover)] active:scale-[0.985] text-[var(--nr-primary-fg)] text-center text-xs font-semibold nr-focus-ring nr-transition"
                      >
                        {locale === 'es'
                          ? 'Confirmar venta y actualizar caja'
                          : 'Confirm sale & update register'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Synchronized Cashbox & Inventory Strip */}
              <div
                className={`rounded-xl border px-3.5 py-2.5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs nr-transition ${
                  salePulse
                    ? 'border-[var(--nr-primary)] bg-[var(--nr-success-bg)]/70'
                    : 'border-[var(--nr-border)] bg-[var(--nr-surface)]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-[var(--nr-success-bg)] text-[var(--nr-success)] flex items-center justify-center shrink-0">
                      <Landmark className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-[var(--nr-text)] truncate">
                        {locale === 'es' ? 'Caja #1 · Saldo en vivo' : 'Cashbox #1 · Balance'}
                      </div>
                      <div className="text-[11px] text-[var(--nr-text-secondary)] truncate">
                        {lastConfirmedSaleTotal !== null
                          ? locale === 'es'
                            ? `Último cobro +${fmtRd(lastConfirmedSaleTotal)}`
                            : `Last sale +${fmtRd(lastConfirmedSaleTotal)}`
                          : locale === 'es'
                            ? `Al confirmar suma +${fmtRd(total)}`
                            : `Adds +${fmtRd(total)} on confirm`}
                      </div>
                    </div>
                  </div>
                  <span className="font-mono-num font-bold text-[var(--nr-primary)] whitespace-nowrap">
                    {fmtRd(cashboxBalance)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 sm:border-l sm:border-[var(--nr-border)] sm:pl-3">
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
                    {riceStock} {locale === 'es' ? 'uds' : 'u'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Executive Tablero ERP View (matches reference visual rhythm & hierarchy) */
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

              {/* 4 KPI Sparkline Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
                <div className="rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface)] p-3">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--nr-text-secondary)]">
                    {locale === 'es' ? 'Ventas del mes' : 'Monthly sales'}
                  </div>
                  <div className="mt-1 font-mono-num text-sm font-bold text-[var(--nr-text)] whitespace-nowrap">
                    RD$482,910.00
                  </div>
                  <Sparkline points="0,18 20,15 40,16 60,11 80,8 100,4" tone="emerald" />
                </div>

                <div className="rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface)] p-3">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--nr-text-secondary)]">
                    {locale === 'es' ? 'Por cobrar' : 'Receivables'}
                  </div>
                  <div className="mt-1 font-mono-num text-sm font-bold text-[var(--nr-text)] whitespace-nowrap">
                    RD$128,450.00
                  </div>
                  <Sparkline points="0,10 25,13 50,11 75,15 100,12" tone="slate" />
                </div>

                <div className="rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface)] p-3">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--nr-text-secondary)]">
                    {locale === 'es' ? 'Nómina activa' : 'Active payroll'}
                  </div>
                  <div className="mt-1 font-mono-num text-sm font-bold text-[var(--nr-text)] whitespace-nowrap">
                    RD$194,200.00
                  </div>
                  <Sparkline points="0,14 33,14 66,12 100,11" tone="emerald" />
                </div>

                <div className="rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface)] p-3">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--nr-text-secondary)]">
                    {locale === 'es' ? 'Comprobantes' : 'Receipts'}
                  </div>
                  <div className="mt-1 font-mono-num text-sm font-bold text-[var(--nr-primary)] whitespace-nowrap">
                    148 e-CF
                  </div>
                  <Sparkline points="0,19 25,16 50,13 75,7 100,3" tone="emerald" />
                </div>
              </div>

              {/* Lower Split: Agenda + Recent Movements */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
                <div className="md:col-span-5 rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface)] p-3.5 flex flex-col justify-between gap-3">
                  <div className="space-y-2.5">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--nr-text-secondary)]">
                      {locale === 'es' ? 'Agenda operativa' : 'Today’s focus'}
                    </div>
                    <div className="space-y-2 text-[11px]">
                      <div className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-[var(--nr-primary)] shrink-0 mt-0.5" />
                        <span className="text-[var(--nr-text)]">
                          {locale === 'es'
                            ? 'Revisión TSS e ISR de nómina lista para aprobación.'
                            : 'Payroll TSS & ISR run ready for review.'}
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-[var(--nr-primary)] shrink-0 mt-0.5" />
                        <span className="text-[var(--nr-text)]">
                          {locale === 'es'
                            ? '2 productos en stock mínimo con reposición sugerida.'
                            : '2 low-stock items flagged for reorder.'}
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-[var(--nr-primary)] shrink-0 mt-0.5" />
                        <span className="text-[var(--nr-text)]">
                          {locale === 'es'
                            ? 'Flujo de facturación electrónica (e-CF) listo para cotizar.'
                            : 'Electronic invoicing (e-CF) workflow ready to quote.'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTab('POS')}
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
                      <div className="py-2 flex items-center justify-between gap-2">
                        <span className="truncate text-[var(--nr-text)]">
                          <span className="font-mono-num text-[var(--nr-text-secondary)] mr-1.5">10:42</span>
                          {locale === 'es' ? 'Venta e-CF (ejemplo) · Mostrador #1' : 'e-CF Sale (sample) · Register #1'}
                        </span>
                        <span className="font-mono-num font-semibold text-[var(--nr-primary)] whitespace-nowrap">
                          +RD$1,285.20
                        </span>
                      </div>
                      <div className="py-2 flex items-center justify-between gap-2">
                        <span className="truncate text-[var(--nr-text)]">
                          <span className="font-mono-num text-[var(--nr-text-secondary)] mr-1.5">10:15</span>
                          {locale === 'es' ? 'Asiento Diario General · Cuadrado' : 'General Journal entry · Balanced'}
                        </span>
                        <span className="font-mono-num font-semibold text-[var(--nr-text)] whitespace-nowrap">
                          RD$18,400.00
                        </span>
                      </div>
                      <div className="py-2 flex items-center justify-between gap-2">
                        <span className="truncate text-[var(--nr-text)]">
                          <span className="font-mono-num text-[var(--nr-text-secondary)] mr-1.5">09:48</span>
                          {locale === 'es' ? 'Cobro transferencia · Cliente corporativo' : 'Wire transfer · Corporate client'}
                        </span>
                        <span className="font-mono-num font-semibold text-[var(--nr-primary)] whitespace-nowrap">
                          +RD$42,500.00
                        </span>
                      </div>
                      <div className="py-2 flex items-center justify-between gap-2">
                        <span className="truncate text-[var(--nr-text)]">
                          <span className="font-mono-num text-[var(--nr-text-secondary)] mr-1.5">09:30</span>
                          {locale === 'es' ? 'Compra a proveedor · Almacén Central' : 'Supplier bill · Central Warehouse'}
                        </span>
                        <span className="font-mono-num font-semibold text-[var(--nr-text-secondary)] whitespace-nowrap">
                          RD$34,900.00
                        </span>
                      </div>
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
