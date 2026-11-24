import React, { useState } from 'react';
import {
  Boxes,
  Home,
  Landmark,
  MonitorSmartphone,
  Plus,
  ReceiptText,
  ShoppingCart,
} from 'lucide-react';
import { useCommercial } from '../context/CommercialContext';

interface PreviewCartLine {
  sku: string;
  nameEs: string;
  nameEn: string;
  unitPrice: number;
  qty: number;
}

const PREVIEW_CATALOG: PreviewCartLine[] = [
  {
    sku: 'ARR-010',
    nameEs: 'Arroz Selecto 10 lb',
    nameEn: 'Select Rice 10 lb',
    unitPrice: 340,
    qty: 2,
  },
  {
    sku: 'ACE-032',
    nameEs: 'Aceite Vegetal 32 oz',
    nameEn: 'Vegetable Oil 32 oz',
    unitPrice: 215,
    qty: 1,
  },
  {
    sku: 'CAF-001',
    nameEs: 'Café Molido 1 lb',
    nameEn: 'Ground Coffee 1 lb',
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

export const SoftwarePreviewFrame: React.FC = () => {
  const { locale, ct } = useCommercial();
  const [tab, setTab] = useState<'POS' | 'DASH'>('POS');
  const [cartQuantities, setCartQuantities] = useState<Record<string, number>>({
    'ARR-010': 2,
    'ACE-032': 1,
    'CAF-001': 1,
  });
  const [cashboxBalance, setCashboxBalance] = useState<number>(16800);
  const [riceStock, setRiceStock] = useState<number>(48);
  const [lastConfirmedSaleTotal, setLastConfirmedSaleTotal] = useState<number | null>(null);

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
  };

  const navItems = [
    { label: locale === 'es' ? 'Inicio' : 'Overview', icon: Home, active: tab === 'DASH' },
    { label: 'POS', icon: MonitorSmartphone, active: tab === 'POS' },
    { label: locale === 'es' ? 'Ventas' : 'Sales', icon: ReceiptText, active: false },
    { label: locale === 'es' ? 'Caja' : 'Cashbox', icon: Landmark, active: false },
    { label: locale === 'es' ? 'Inventario' : 'Inventory', icon: Boxes, active: false },
  ];

  return (
    <div
      style={{ boxShadow: 'var(--nr-shadow-frame)' }}
      className="rounded-[20px] border border-white/15 bg-[var(--nr-surface)] text-[var(--nr-text)] overflow-hidden nr-transition"
    >
      {/* Frame Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-[var(--nr-border)] bg-[var(--nr-surface-muted)]">
        <div
          role="tablist"
          aria-label="Software preview"
          className="inline-flex items-center rounded-full border border-[var(--nr-border)] bg-[var(--nr-surface)] p-0.5"
        >
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'POS'}
            onClick={() => setTab('POS')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap nr-focus-ring nr-transition ${
              tab === 'POS'
                ? 'bg-[var(--nr-primary)] text-[var(--nr-primary-fg)]'
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
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap nr-focus-ring nr-transition ${
              tab === 'DASH'
                ? 'bg-[var(--nr-primary)] text-[var(--nr-primary-fg)]'
                : 'text-[var(--nr-text-secondary)] hover:text-[var(--nr-text)]'
            }`}
          >
            {ct.hero.previewTabDash}
          </button>
        </div>

        <span className="text-[11px] font-medium text-[var(--nr-text-secondary)]">
          {ct.hero.previewDemoNote}
        </span>
      </div>

      {/* App layout simulation matching NetsRow ERP */}
      <div className="grid grid-cols-1 sm:grid-cols-12 min-h-[380px]">
        {/* Dark Slate NetsRow Navigation Sidebar (hidden on mobile <640px for focused Cart/Total crop) */}
        <div className="hidden sm:flex sm:col-span-3 bg-[#0B1728] text-slate-200 p-3.5 flex-col justify-between gap-3 border-r border-slate-800">
          <div className="space-y-3 w-full">
            <div className="text-xs font-bold tracking-tight text-white px-2">
              NetsRow ERP
            </div>
            <div className="flex flex-col gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      if (item.label === 'POS') setTab('POS');
                      if (item.label === 'Inicio' || item.label === 'Overview') setTab('DASH');
                    }}
                    className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium whitespace-nowrap nr-focus-ring nr-transition ${
                      item.active
                        ? 'bg-[#047857] text-white'
                        : 'text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2.5 border-t border-slate-800 text-[11px] text-slate-400 px-2">
            {locale === 'es' ? 'Sucursal Principal' : 'Main Branch'}
          </div>
        </div>

        {/* Operational Workspace Body */}
        <div className="sm:col-span-9 p-4 sm:p-5 bg-[var(--nr-bg)] flex flex-col justify-between gap-3.5">
          {tab === 'POS' ? (
            <div className="space-y-3.5">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Product picker (hidden on mobile <768px so mobile keeps focused crop on Cart + Total) */}
                <div className="hidden md:flex md:col-span-6 flex-col gap-2.5">
                  <div className="text-xs font-semibold text-[var(--nr-text-secondary)]">
                    {locale === 'es' ? 'Productos frecuentes' : 'Frequent products'}
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {PREVIEW_CATALOG.map((p) => (
                      <button
                        key={p.sku}
                        type="button"
                        onClick={() => handleAddUnit(p.sku)}
                        className="rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface)] hover:border-[var(--nr-primary)] p-3 flex items-center justify-between gap-2 text-left nr-focus-ring nr-transition"
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-[var(--nr-text)] truncate">
                            {locale === 'es' ? p.nameEs : p.nameEn}
                          </div>
                          <div className="font-mono-num text-[11px] text-[var(--nr-text-secondary)]">
                            {p.sku}
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

                {/* Legible Cart & Totals (always full-focus on mobile and right half on desktop) */}
                <div className="md:col-span-6 rounded-2xl border border-[var(--nr-border)] bg-[var(--nr-surface)] p-4 flex flex-col justify-between gap-3.5">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between border-b border-[var(--nr-border)] pb-2">
                      <span className="inline-flex items-center gap-2 text-xs font-bold text-[var(--nr-text)]">
                        <ShoppingCart className="w-4 h-4 text-[var(--nr-primary)]" />
                        <span>
                          {locale === 'es' ? 'Carrito · Caja #1' : 'Cart · Register #1'}
                        </span>
                      </span>
                      <span className="text-[11px] font-medium text-[var(--nr-text-secondary)]">
                        {locale === 'es' ? 'Efectivo' : 'Cash'}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      {cartLines.map((line) => (
                        <div key={line.sku} className="flex items-center justify-between gap-2">
                          <span className="text-[var(--nr-text)] truncate">
                            {line.qty} × {locale === 'es' ? line.nameEs : line.nameEn}
                          </span>
                          <span className="font-mono-num font-semibold text-[var(--nr-text)] whitespace-nowrap">
                            {fmtRd(line.unitPrice * line.qty)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-[var(--nr-border)] space-y-1.5 text-xs">
                    <div className="flex justify-between text-[var(--nr-text-secondary)]">
                      <span>Subtotal</span>
                      <span className="font-mono-num">{fmtRd(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-[var(--nr-text-secondary)]">
                      <span>ITBIS (ref.)</span>
                      <span className="font-mono-num">{fmtRd(itbis)}</span>
                    </div>
                    <div className="flex justify-between items-baseline font-bold text-base text-[var(--nr-text)] pt-1">
                      <span>{locale === 'es' ? 'Total a cobrar' : 'Total due'}</span>
                      <span className="font-mono-num text-lg text-[var(--nr-primary)] whitespace-nowrap">
                        {fmtRd(total)}
                      </span>
                    </div>
                    <div className="pt-1.5">
                      <button
                        type="button"
                        onClick={handleConfirmPreviewSale}
                        className="w-full py-2.5 px-3 rounded-xl bg-[var(--nr-primary)] hover:bg-[var(--nr-primary-hover)] text-[var(--nr-primary-fg)] text-center text-xs font-semibold nr-focus-ring nr-transition"
                      >
                        {locale === 'es'
                          ? 'Confirmar venta y actualizar caja'
                          : 'Confirm sale & update register'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Synchronized Cashbox & Inventory reflection below the POS sale */}
              <div className="rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface)] p-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-[var(--nr-success-bg)] text-[var(--nr-success)] flex items-center justify-center shrink-0">
                      <Landmark className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-[var(--nr-text)] truncate">
                        {locale === 'es' ? 'Caja #1 · Saldo en vivo' : 'Cashbox #1 · Live balance'}
                      </div>
                      <div className="text-[11px] text-[var(--nr-text-secondary)] truncate">
                        {lastConfirmedSaleTotal !== null
                          ? locale === 'es'
                            ? `Último cobro +${fmtRd(lastConfirmedSaleTotal)}`
                            : `Last sale +${fmtRd(lastConfirmedSaleTotal)}`
                          : locale === 'es'
                            ? `Al cobrar suma +${fmtRd(total)}`
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
                        {locale === 'es' ? 'Inventario · Descuento automático' : 'Inventory · Auto-deduct'}
                      </div>
                      <div className="text-[11px] text-[var(--nr-text-secondary)] truncate">
                        {locale === 'es'
                          ? `Arroz 10 lb · ${totalUnits} uds en carrito`
                          : `Rice 10 lb · ${totalUnits} units in cart`}
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
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-[var(--nr-text)]">
                  {locale === 'es' ? 'Resumen operativo del turno' : 'Shift operational summary'}
                </div>
                <span className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-[var(--nr-success-bg)] text-[var(--nr-success)] border border-[var(--nr-success-border)]">
                  {locale === 'es' ? 'Caja abierta' : 'Register open'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-2xl border border-[var(--nr-border)] bg-[var(--nr-surface)] p-3.5">
                  <div className="text-[11px] text-[var(--nr-text-secondary)]">
                    {locale === 'es' ? 'Ventas del turno' : 'Shift sales'}
                  </div>
                  <div className="mt-1 font-mono-num text-base font-bold text-[var(--nr-text)] whitespace-nowrap">
                    RD$28,450.00
                  </div>
                </div>
                <div className="rounded-2xl border border-[var(--nr-border)] bg-[var(--nr-surface)] p-3.5">
                  <div className="text-[11px] text-[var(--nr-text-secondary)]">
                    {locale === 'es' ? 'Efectivo en caja' : 'Expected cash'}
                  </div>
                  <div className="mt-1 font-mono-num text-base font-bold text-[var(--nr-primary)] whitespace-nowrap">
                    RD$16,800.00
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-[var(--nr-border)] bg-[var(--nr-surface)] p-3.5 space-y-2 text-xs">
                <div className="font-semibold text-[var(--nr-text)]">
                  {locale === 'es' ? 'Últimos movimientos' : 'Latest activity'}
                </div>
                <div className="divide-y divide-[var(--nr-border)]">
                  <div className="py-2 flex justify-between gap-2">
                    <span className="truncate text-[var(--nr-text)]">
                      VTA-2026-0104 · {locale === 'es' ? 'Cobro POS efectivo' : 'POS cash sale'}
                    </span>
                    <span className="font-mono-num font-semibold text-[var(--nr-primary)] whitespace-nowrap">
                      +RD$1,281.80
                    </span>
                  </div>
                  <div className="py-2 flex justify-between gap-2">
                    <span className="truncate text-[var(--nr-text)]">
                      AJU-0021 · {locale === 'es' ? 'Alerta stock mínimo' : 'Low stock alert'}
                    </span>
                    <span className="font-mono-num text-[var(--nr-warning)] whitespace-nowrap">
                      4 uds
                    </span>
                  </div>
                  <div className="py-2 flex justify-between gap-2">
                    <span className="truncate text-[var(--nr-text)]">
                      ASI-0019 · {locale === 'es' ? 'Asiento en Diario General' : 'Journal entry posted'}
                    </span>
                    <span className="font-mono-num text-[var(--nr-text-secondary)] whitespace-nowrap">
                      {locale === 'es' ? 'Cuadrado' : 'Balanced'}
                    </span>
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
