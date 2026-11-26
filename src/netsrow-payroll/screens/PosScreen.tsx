import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  FileCheck2,
  FileText,
  Landmark,
  Loader2,
  Minus,
  Plus,
  ReceiptText,
  ShoppingCart,
  Trash2,
  Unlock,
  X,
} from 'lucide-react';
import {
  ErpFilterBar,
  ErpPageHeader,
  ErpStatePanel,
} from '../components/ErpUiPrimitives';
import { MoneyCell } from '../components/MoneyCell';
import { StatusBadge } from '../components/StatusBadge';
import { usePayrollWorkspace } from '../context/PayrollWorkspaceContext';
import { validateDominicanTaxId } from '../services/eInvoicingEngine';
import { EcfTypeCode } from '../types/einvoicing';
import { PaymentMethod } from '../types/erp';

interface CartLine {
  productId: string;
  quantity: number;
}

export const PosScreen: React.FC = () => {
  const {
    erpState,
    activeBranch,
    locale,
    t,
    isMutating,
    openCashbox,
    confirmPosSale,
    setActiveScreen,
    setSelectedDocumentId,
    setSelectedSaleId,
    setSelectedEcfId,
  } = usePayrollWorkspace();

  const [query, setQuery] = useState('');
  const [catFilter, setCatFilter] = useState('ALL');
  const [cart, setCart] = useState<CartLine[]>([]);
  const [customerId, setCustomerId] = useState(erpState.customers[0]?.id ?? 'cus-1');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [ecfType, setEcfType] = useState<EcfTypeCode | 'NONE'>('32');
  const [discountPercent, setDiscountPercent] = useState('0');
  const [posError, setPosError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  const mobileCartTriggerRef = useRef<HTMLButtonElement | null>(null);
  const [lastCompleted, setLastCompleted] = useState<{
    saleId: string;
    docId: string;
    ecfId?: string | null;
    eNcf?: string | null;
  } | null>(null);

  const openSession = useMemo(
    () => erpState.cashSessions.find((s) => s.status === 'OPEN') ?? null,
    [erpState.cashSessions]
  );

  const productMap = useMemo(
    () => new Map(erpState.products.map((p) => [p.id, p])),
    [erpState.products]
  );

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return erpState.products.filter((p) => {
      if (!p.active) return false;
      if (catFilter !== 'ALL' && p.categoryId !== catFilter) return false;
      if (!q) return true;
      return (
        p.sku.toLowerCase().includes(q) ||
        p.nameEs.toLowerCase().includes(q) ||
        p.nameEn.toLowerCase().includes(q)
      );
    });
  }, [erpState.products, query, catFilter]);

  const hasActiveFilters = query.trim().length > 0 || catFilter !== 'ALL';

  const clearFilters = () => {
    setQuery('');
    setCatFilter('ALL');
  };

  // Escape key closes mobile checkout drawer and returns focus
  useEffect(() => {
    if (!isMobileCartOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileCartOpen(false);
        requestAnimationFrame(() => {
          mobileCartTriggerRef.current?.focus();
        });
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isMobileCartOpen]);

  const closeMobileDrawer = () => {
    setIsMobileCartOpen(false);
    requestAnimationFrame(() => {
      mobileCartTriggerRef.current?.focus();
    });
  };

  const addToCart = (productId: string) => {
    setPosError(null);
    const prod = productMap.get(productId);
    if (!prod) return;
    setCart((prev) => {
      const existing = prev.find((c) => c.productId === productId);
      const nextQty = (existing?.quantity ?? 0) + 1;
      if (nextQty > prod.stock && !erpState.business.allowNegativeStock) {
        setPosError(
          locale === 'es'
            ? `Stock máximo alcanzado para ${prod.nameEs} (${prod.stock} uds).`
            : `Max stock reached for ${prod.nameEn} (${prod.stock} units).`
        );
        return prev;
      }
      if (existing) {
        return prev.map((c) =>
          c.productId === productId ? { ...c, quantity: nextQty } : c
        );
      }
      return [...prev, { productId, quantity: 1 }];
    });
  };

  const updateCartQty = (productId: string, delta: number) => {
    setPosError(null);
    const prod = productMap.get(productId);
    if (!prod) return;
    setCart((prev) =>
      prev
        .map((line) => {
          if (line.productId !== productId) return line;
          const next = line.quantity + delta;
          if (next <= 0) return null;
          if (next > prod.stock && !erpState.business.allowNegativeStock) {
            setPosError(
              locale === 'es'
                ? `Stock disponible: ${prod.stock}.`
                : `Available stock: ${prod.stock}.`
            );
            return line;
          }
          return { ...line, quantity: next };
        })
        .filter((x): x is CartLine => x !== null)
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((c) => c.productId !== productId));
  };

  const summary = useMemo(() => {
    const itbisRate = erpState.business.standardItbisRate / 100;
    const discPct = Math.min(100, Math.max(0, Number(discountPercent) || 0));
    let subtotal = 0;
    let tax = 0;
    cart.forEach((line) => {
      const p = productMap.get(line.productId);
      if (!p) return;
      const lineSub = p.price * line.quantity;
      const discounted = lineSub * (1 - discPct / 100);
      subtotal += lineSub;
      if (p.taxableItbis) {
        tax += discounted * itbisRate;
      }
    });
    const discountAmount = Math.round(subtotal * (discPct / 100) * 100) / 100;
    const roundedSub = Math.round(subtotal * 100) / 100;
    const roundedTax = Math.round(tax * 100) / 100;
    const total = Math.round((roundedSub - discountAmount + roundedTax) * 100) / 100;
    return {
      subtotal: roundedSub,
      discountAmount,
      tax: roundedTax,
      total,
      discPct,
    };
  }, [cart, productMap, erpState.business.standardItbisRate, discountPercent]);

  const totalUnits = useMemo(
    () => cart.reduce((acc, item) => acc + item.quantity, 0),
    [cart]
  );

  const selectedCustomer = useMemo(
    () => erpState.customers.find((c) => c.id === customerId) ?? null,
    [erpState.customers, customerId]
  );

  const missingRncForE31 =
    ecfType === '31' &&
    (!selectedCustomer?.taxId || !validateDominicanTaxId(selectedCustomer.taxId).valid);

  const cashBlocked = paymentMethod === 'CASH' && !openSession;
  const canConfirm =
    cart.length > 0 && !cashBlocked && !missingRncForE31 && !isSubmitting && !isMutating;

  const disabledReason = useMemo(() => {
    if (cart.length === 0) {
      return locale === 'es'
        ? 'Agrega al menos un producto al carrito para facturar.'
        : 'Add at least one product to the cart to checkout.';
    }
    if (cashBlocked) {
      return locale === 'es'
        ? 'Cobro en efectivo requiere abrir caja primero.'
        : 'Cash payment requires an open cashbox shift first.';
    }
    if (missingRncForE31) {
      return locale === 'es'
        ? 'E31 Crédito Fiscal requiere un cliente con RNC/Cédula válido.'
        : 'E31 Tax Credit requires a customer with a valid RNC/National ID.';
    }
    return null;
  }, [cart.length, cashBlocked, missingRncForE31, locale]);

  const handleConfirm = async () => {
    if (!canConfirm) return;
    setPosError(null);
    setIsSubmitting(true);
    try {
      const result = await confirmPosSale({
        customerId,
        paymentMethod,
        discountPercent: summary.discPct,
        items: cart,
        ecfType,
      });
      setLastCompleted(result);
      setCart([]);
      setDiscountPercent('0');
      setIsMobileCartOpen(false);
    } catch (err: unknown) {
      setPosError(err instanceof Error ? err.message : 'Error confirming sale');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCartPanelContent = (isDrawer: boolean) => (
    <div className="flex flex-col h-full min-h-0">
      {/* Pinned Top: Cart Header + Customer */}
      <div className="p-3.5 border-b border-[var(--nr-border)] space-y-2.5 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-[var(--nr-primary)]" />
            <h2 className="font-display text-base font-bold text-[var(--nr-text)]">
              {locale === 'es' ? 'Carrito POS' : 'POS Cart'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span
              data-tabular="true"
              className="font-mono-num text-xs font-semibold px-2 py-0.5 rounded-md bg-[var(--nr-surface-muted)] border border-[var(--nr-border)] text-[var(--nr-text-secondary)]"
            >
              {totalUnits} {locale === 'es' ? 'uds' : 'pcs'}
            </span>
            {isDrawer && (
              <button
                type="button"
                onClick={closeMobileDrawer}
                aria-label={t.common.close}
                className="nr-focus-ring p-1.5 rounded-lg text-[var(--nr-text-secondary)] hover:bg-[var(--nr-surface-muted)]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <label
              htmlFor={isDrawer ? 'pos-customer-mobile' : 'pos-customer-desktop'}
              className="block text-[11px] font-semibold text-[var(--nr-text-secondary)] uppercase tracking-wider mb-1"
            >
              {locale === 'es' ? 'Cliente' : 'Customer'}
            </label>
            <select
              id={isDrawer ? 'pos-customer-mobile' : 'pos-customer-desktop'}
              value={customerId}
              onChange={(e) => {
                const nextId = e.target.value;
                setCustomerId(nextId);
                const nextCust = erpState.customers.find((c) => c.id === nextId);
                if (ecfType !== 'NONE') {
                  setEcfType(nextCust?.taxId ? '31' : '32');
                }
              }}
              className="nr-focus-ring w-full h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-2.5 text-xs font-semibold text-[var(--nr-text)]"
            >
              {erpState.customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} · {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor={isDrawer ? 'pos-ecf-mobile' : 'pos-ecf-desktop'}
              className="block text-[11px] font-semibold text-[var(--nr-text-secondary)] uppercase tracking-wider mb-1"
            >
              {locale === 'es' ? 'Comprobante e-CF' : 'Fiscal e-CF'}
            </label>
            <select
              id={isDrawer ? 'pos-ecf-mobile' : 'pos-ecf-desktop'}
              value={ecfType}
              onChange={(e) => setEcfType(e.target.value as EcfTypeCode | 'NONE')}
              className="nr-focus-ring w-full h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-2.5 text-xs font-semibold text-[var(--nr-text)]"
            >
              <option value="32">
                {locale === 'es' ? 'E32 · Consumo Electrónico' : 'E32 · Electronic Consumer'}
              </option>
              <option value="31">
                {locale === 'es' ? 'E31 · Crédito Fiscal' : 'E31 · Tax Credit'}
              </option>
              <option value="NONE">
                {locale === 'es' ? 'Solo recibo no fiscal' : 'Non-fiscal receipt only'}
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Scrollable Inner Cart Items */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 divide-y divide-[var(--nr-border)]">
        {cart.length === 0 ? (
          <div className="py-10 text-center text-xs text-[var(--nr-text-secondary)]">
            {locale === 'es'
              ? 'Selecciona productos del catálogo para agregar al carrito.'
              : 'Select products from the catalog to add to the cart.'}
          </div>
        ) : (
          cart.map((line) => {
            const p = productMap.get(line.productId);
            if (!p) return null;
            return (
              <div
                key={line.productId}
                className="py-2.5 flex items-center justify-between gap-2.5"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-[var(--nr-text)] truncate">
                    {locale === 'es' ? p.nameEs : p.nameEn}
                  </div>
                  <div
                    data-tabular="true"
                    className="text-[11px] text-[var(--nr-text-secondary)] font-mono-num"
                  >
                    RD${p.price.toFixed(2)} × {line.quantity}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    aria-label={locale === 'es' ? 'Restar cantidad' : 'Decrease quantity'}
                    onClick={() => updateCartQty(line.productId, -1)}
                    className="nr-focus-ring nr-transition w-7 h-7 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] flex items-center justify-center hover:bg-[var(--nr-surface-muted)]"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span
                    data-tabular="true"
                    className="w-6 text-center font-mono-num text-xs font-bold text-[var(--nr-text)]"
                  >
                    {line.quantity}
                  </span>
                  <button
                    type="button"
                    aria-label={locale === 'es' ? 'Aumentar cantidad' : 'Increase quantity'}
                    onClick={() => updateCartQty(line.productId, 1)}
                    className="nr-focus-ring nr-transition w-7 h-7 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] flex items-center justify-center hover:bg-[var(--nr-surface-muted)]"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    aria-label={locale === 'es' ? 'Eliminar del carrito' : 'Remove item'}
                    onClick={() => removeFromCart(line.productId)}
                    className="nr-focus-ring nr-transition w-7 h-7 rounded-lg text-[var(--nr-error)] hover:bg-[var(--nr-error-bg)] flex items-center justify-center ml-0.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pinned Bottom: Discount + Payment + Totals + Confirm CTA */}
      <div className="p-3.5 border-t border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] space-y-2.5 shrink-0">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label
              htmlFor={isDrawer ? 'pos-disc-mobile' : 'pos-disc-desktop'}
              className="block text-[11px] font-semibold text-[var(--nr-text-secondary)] uppercase tracking-wider mb-1"
            >
              {locale === 'es' ? 'Descuento (%)' : 'Discount (%)'}
            </label>
            <input
              id={isDrawer ? 'pos-disc-mobile' : 'pos-disc-desktop'}
              type="number"
              min="0"
              max="100"
              step="1"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(e.target.value)}
              className="nr-focus-ring w-full h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface)] px-2.5 text-sm font-mono-num text-[var(--nr-text)]"
            />
          </div>
          <div>
            <label
              htmlFor={isDrawer ? 'pos-pay-mobile' : 'pos-pay-desktop'}
              className="block text-[11px] font-semibold text-[var(--nr-text-secondary)] uppercase tracking-wider mb-1"
            >
              {locale === 'es' ? 'Forma de pago' : 'Payment'}
            </label>
            <select
              id={isDrawer ? 'pos-pay-mobile' : 'pos-pay-desktop'}
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="nr-focus-ring w-full h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface)] px-2 text-xs font-semibold text-[var(--nr-text)]"
            >
              <option value="CASH">{locale === 'es' ? 'Efectivo (Caja)' : 'Cash'}</option>
              <option value="CARD">{locale === 'es' ? 'Tarjeta' : 'Card'}</option>
              <option value="TRANSFER">{locale === 'es' ? 'Transferencia' : 'Transfer'}</option>
              <option value="CREDIT">{locale === 'es' ? 'Crédito CxC' : 'Credit AR'}</option>
            </select>
          </div>
        </div>

        {/* Totals */}
        <div className="rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface)] p-2.5 space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-[var(--nr-text-secondary)]">
              {locale === 'es' ? 'Subtotal' : 'Subtotal'}
            </span>
            <MoneyCell amount={summary.subtotal} locale={locale} />
          </div>
          {summary.discountAmount > 0 && (
            <div className="flex justify-between text-[var(--nr-warning)]">
              <span>
                {locale === 'es'
                  ? `Descuento (${summary.discPct}%)`
                  : `Discount (${summary.discPct}%)`}
              </span>
              <MoneyCell amount={-summary.discountAmount} locale={locale} />
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-[var(--nr-text-secondary)]">
              ITBIS ({erpState.business.standardItbisRate}%)
            </span>
            <MoneyCell amount={summary.tax} locale={locale} />
          </div>
          <div className="flex justify-between items-baseline pt-2 border-t border-[var(--nr-border)] font-bold text-sm text-[var(--nr-text)]">
            <span>{locale === 'es' ? 'Total a cobrar' : 'Total due'}</span>
            <MoneyCell amount={summary.total} locale={locale} size="lg" emphasize />
          </div>
        </div>

        {disabledReason && (
          <div className="flex items-center justify-between gap-2 text-[11px] text-[var(--nr-warning)]">
            <span>{disabledReason}</span>
            {cashBlocked && (
              <button
                type="button"
                onClick={() => openCashbox(5000)}
                className="font-semibold underline shrink-0"
              >
                {locale === 'es' ? 'Abrir caja' : 'Open'}
              </button>
            )}
          </div>
        )}

        <button
          type="button"
          disabled={!canConfirm}
          onClick={handleConfirm}
          className="nr-focus-ring nr-transition w-full h-11 rounded-xl bg-[var(--nr-primary)] hover:bg-[var(--nr-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm font-bold text-[var(--nr-primary-fg)] flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{locale === 'es' ? 'Procesando venta…' : 'Processing…'}</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>{locale === 'es' ? 'Confirmar venta' : 'Confirm sale'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 pb-24 lg:pb-0">
      {/* Header */}
      <ErpPageHeader
        title={`${t.navigation.pos} · ${activeBranch?.name ?? ''}`}
        badge={<StatusBadge label={t.topBar.demoOnlyTag} tone="amber" />}
        subtitle={
          locale === 'es'
            ? 'Cada venta descuenta inventario, registra movimiento en Ventas, actualiza Caja (si es efectivo) y genera comprobante interno no fiscal.'
            : 'Confirmed sales deduct stock, post to Sales history, update Cashbox (if cash), and generate an internal non-fiscal receipt.'
        }
        actions={
          openSession ? (
            <button
              type="button"
              onClick={() => setActiveScreen('cashbox_shift')}
              className="nr-focus-ring nr-transition inline-flex items-center gap-2 h-9 px-3.5 rounded-xl border border-[var(--nr-success-border)] bg-[var(--nr-success-bg)] text-xs font-semibold text-[var(--nr-success)]"
            >
              <Landmark className="w-3.5 h-3.5 shrink-0" />
              <span data-tabular="true" className="font-mono-num">
                {locale === 'es' ? 'Caja abierta:' : 'Cashbox:'} RD${openSession.expectedCash.toFixed(2)}
              </span>
            </button>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => openCashbox(5000)}
                className="nr-focus-ring nr-transition inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-[var(--nr-warning)] text-xs font-semibold text-white hover:opacity-95"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>
                  {locale === 'es'
                    ? 'Abrir caja rápida (RD$5,000)'
                    : 'Quick open cashbox (RD$5,000)'}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveScreen('cashbox_shift')}
                className="nr-focus-ring nr-transition h-9 px-3 rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface)] text-xs font-semibold text-[var(--nr-text)] hover:bg-[var(--nr-surface-muted)]"
              >
                {locale === 'es' ? 'Ir a Caja' : 'Go to Cashbox'}
              </button>
            </div>
          )
        }
      />

      {/* Post-sale action bar */}
      {lastCompleted && (
        <div
          role="status"
          className="rounded-xl border border-[var(--nr-success-border)] bg-[var(--nr-success-bg)] p-3.5 flex flex-wrap items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--nr-success)]">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>
              {locale === 'es'
                ? 'Venta registrada exitosamente en el ERP simulado.'
                : 'Sale recorded successfully in simulated ERP.'}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setSelectedSaleId(lastCompleted.saleId);
                setActiveScreen('sales_ar');
              }}
              className="nr-focus-ring nr-transition inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[var(--nr-surface)] border border-[var(--nr-success-border)] text-xs font-semibold text-[var(--nr-success)]"
            >
              <ReceiptText className="w-3.5 h-3.5" />
              <span>{locale === 'es' ? 'Ver venta en Historial' : 'View in Sales'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedDocumentId(lastCompleted.docId);
                setActiveScreen('internal_docs');
              }}
              className="nr-focus-ring nr-transition inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-[var(--nr-success-border)] bg-[var(--nr-surface)] text-xs font-semibold text-[var(--nr-text)]"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{locale === 'es' ? 'Ver recibo no fiscal' : 'View receipt'}</span>
            </button>
            {lastCompleted.ecfId && (
              <button
                type="button"
                onClick={() => {
                  setSelectedEcfId(lastCompleted.ecfId ?? null);
                  setActiveScreen('e_invoicing_docs');
                }}
                className="nr-focus-ring nr-transition inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[var(--nr-primary)] hover:bg-[var(--nr-primary-hover)] text-xs font-semibold text-[var(--nr-primary-fg)]"
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>
                  {locale === 'es'
                    ? `Ver e-CF (${lastCompleted.eNcf ?? ''})`
                    : `View e-CF (${lastCompleted.eNcf ?? ''})`}
                </span>
              </button>
            )}
          </div>
        </div>
      )}

      {posError && (
        <div
          role="alert"
          className="rounded-xl border border-[var(--nr-error-border)] bg-[var(--nr-error-bg)] px-4 py-3 text-xs text-[var(--nr-error)] flex items-center justify-between gap-2"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{posError}</span>
          </div>
          <button
            type="button"
            onClick={() => setPosError(null)}
            aria-label={t.common.close}
            className="nr-focus-ring p-1 rounded-lg hover:opacity-80"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Split: Catalog Grid + Viewport-Locked Desktop Cart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Product picker */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-3.5 min-w-0">
          <ErpFilterBar
            searchValue={query}
            onSearchChange={setQuery}
            searchPlaceholder={
              locale === 'es'
                ? 'Buscar producto por SKU o nombre…'
                : 'Search product by SKU or name…'
            }
            hasActiveFilters={hasActiveFilters}
            onClearFilters={clearFilters}
            clearLabel={locale === 'es' ? 'Limpiar búsqueda' : 'Clear search'}
            activeFilterCount={
              (query.trim() ? 1 : 0) + (catFilter !== 'ALL' ? 1 : 0)
            }
            activeFilterLabel={
              locale === 'es' ? 'Filtro activo' : 'Active filter'
            }
          >
            <select
              aria-label={locale === 'es' ? 'Categoría' : 'Category'}
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value)}
              className="nr-focus-ring h-10 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-3 text-xs font-semibold text-[var(--nr-text)]"
            >
              <option value="ALL">{t.common.all}</option>
              {erpState.categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {locale === 'es' ? c.nameEs : c.nameEn}
                </option>
              ))}
            </select>
          </ErpFilterBar>

          {filteredProducts.length === 0 ? (
            <ErpStatePanel
              variant="empty"
              title={
                locale === 'es'
                  ? 'No se encontraron productos'
                  : 'No products found'
              }
              description={
                locale === 'es'
                  ? 'Prueba con otro término de búsqueda o restablece el filtro de categoría.'
                  : 'Try another search term or reset the category filter.'
              }
              actionLabel={locale === 'es' ? 'Limpiar búsqueda' : 'Clear search'}
              onAction={clearFilters}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {filteredProducts.map((p) => {
                const outOfStock = p.stock <= 0 && !erpState.business.allowNegativeStock;
                const inCart = cart.find((c) => c.productId === p.id)?.quantity ?? 0;
                return (
                  <button
                    key={p.id}
                    type="button"
                    disabled={outOfStock}
                    onClick={() => addToCart(p.id)}
                    className={`nr-focus-ring nr-transition text-left rounded-xl border p-3.5 flex flex-col justify-between gap-2.5 ${
                      outOfStock
                        ? 'border-[var(--nr-border)] bg-[var(--nr-surface-muted)] opacity-55 cursor-not-allowed'
                        : inCart > 0
                          ? 'border-[var(--nr-primary)] bg-[var(--nr-surface)] ring-1 ring-[var(--nr-primary)]/30'
                          : 'border-[var(--nr-border)] bg-[var(--nr-surface)] hover:border-[var(--nr-primary)]'
                    }`}
                  >
                    <div className="space-y-1.5 w-full">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono-num text-[11px] font-semibold text-[var(--nr-primary)]">
                          {p.sku}
                        </span>
                        <StatusBadge
                          label={
                            outOfStock
                              ? locale === 'es'
                                ? 'Agotado'
                                : 'Out of stock'
                              : `Stock: ${p.stock}`
                          }
                          tone={
                            outOfStock
                              ? 'crimson'
                              : p.stock <= p.minStock
                                ? 'amber'
                                : 'neutral'
                          }
                        />
                      </div>
                      <div className="text-sm font-semibold text-[var(--nr-text)] line-clamp-2">
                        {locale === 'es' ? p.nameEs : p.nameEn}
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-[var(--nr-border)] w-full">
                      <MoneyCell amount={p.price} locale={locale} emphasize />
                      <span className="text-[11px] font-semibold text-[var(--nr-primary)]">
                        {inCart > 0
                          ? `${inCart} ${locale === 'es' ? 'en carrito' : 'in cart'} (+1)`
                          : `+ ${locale === 'es' ? 'Agregar' : 'Add'}`}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Desktop Cart & Checkout — Viewport height locked so Total & CTA never leave fold */}
        <aside className="hidden lg:block lg:col-span-5 xl:col-span-4 lg:sticky lg:top-16">
          <div className="rounded-2xl border border-[var(--nr-border)] bg-[var(--nr-surface)] overflow-hidden lg:max-h-[calc(100dvh-14rem)] flex flex-col">
            {renderCartPanelContent(false)}
          </div>
        </aside>
      </div>

      {/* Mobile Compact Sticky Bottom Summary Bar (< 1024px) */}
      <div className="lg:hidden fixed bottom-3 left-3 right-3 z-30">
        <button
          ref={mobileCartTriggerRef}
          type="button"
          onClick={() => setIsMobileCartOpen(true)}
          className="nr-focus-ring nr-transition w-full h-14 px-3 rounded-2xl bg-[#081321] text-white border border-[#1E334A] shadow-xl flex items-center justify-between gap-2"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-8 h-8 rounded-lg bg-[#047857] flex items-center justify-center shrink-0">
              <ShoppingCart className="w-4 h-4 text-white" />
            </span>
            <div className="text-left min-w-0">
              <div className="text-xs font-bold truncate">
                {locale === 'es' ? 'Carrito' : 'Cart'} ·{' '}
                <span data-tabular="true" className="font-mono-num">
                  {totalUnits} {locale === 'es' ? 'uds' : 'pcs'}
                </span>
              </div>
              <div className="text-[11px] text-slate-300 truncate">
                {locale === 'es' ? 'Toca para cobrar' : 'Tap to checkout'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span data-tabular="true" className="font-mono-num text-sm font-bold text-emerald-300">
              RD${summary.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-[#047857] text-xs font-semibold text-white">
              {locale === 'es' ? 'Cobrar' : 'Checkout'}
            </span>
          </div>
        </button>
      </div>

      {/* Mobile Expandable Checkout Drawer */}
      {isMobileCartOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden flex items-end sm:items-center justify-center bg-slate-950/65 backdrop-blur-[1px]"
          role="dialog"
          aria-modal="true"
          aria-label={locale === 'es' ? 'Carrito y cobro POS' : 'POS Cart and Checkout'}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeMobileDrawer();
          }}
        >
          <div className="w-full sm:max-w-md h-[88dvh] sm:h-auto sm:max-h-[90dvh] rounded-t-2xl sm:rounded-2xl border border-[var(--nr-border)] bg-[var(--nr-surface)] overflow-hidden flex flex-col">
            {renderCartPanelContent(true)}
          </div>
        </div>
      )}
    </div>
  );
};
