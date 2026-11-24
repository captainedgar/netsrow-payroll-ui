import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  Landmark,
  Minus,
  Plus,
  ReceiptText,
  Search,
  ShoppingCart,
  Trash2,
  Unlock,
} from 'lucide-react';
import { MoneyCell } from '../components/MoneyCell';
import { StatusBadge } from '../components/StatusBadge';
import { usePayrollWorkspace } from '../context/PayrollWorkspaceContext';
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
    openCashbox,
    confirmPosSale,
    setActiveScreen,
    setSelectedDocumentId,
    setSelectedSaleId,
  } = usePayrollWorkspace();

  const [query, setQuery] = useState('');
  const [catFilter, setCatFilter] = useState('ALL');
  const [cart, setCart] = useState<CartLine[]>([]);
  const [customerId, setCustomerId] = useState(erpState.customers[0]?.id ?? 'cus-1');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [discountPercent, setDiscountPercent] = useState('0');
  const [posError, setPosError] = useState<string | null>(null);
  const [lastCompleted, setLastCompleted] = useState<{
    saleId: string;
    docId: string;
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

  const cashBlocked = paymentMethod === 'CASH' && !openSession;
  const canConfirm = cart.length > 0 && !cashBlocked;

  const disabledReason = useMemo(() => {
    if (cart.length === 0) {
      return locale === 'es'
        ? 'Agrega al menos un producto al carrito para facturar.'
        : 'Add at least one product to the cart to checkout.';
    }
    if (cashBlocked) {
      return locale === 'es'
        ? 'Cobro en efectivo requiere abrir caja primero (usa el botón «Abrir caja rápida RD$5,000» arriba).'
        : 'Cash payment requires an open cashbox shift first.';
    }
    return null;
  }, [cart.length, cashBlocked, locale]);

  const handleConfirm = async () => {
    setPosError(null);
    try {
      const result = await confirmPosSale({
        customerId,
        paymentMethod,
        discountPercent: summary.discPct,
        items: cart,
      });
      setLastCompleted(result);
      setCart([]);
      setDiscountPercent('0');
    } catch (err: unknown) {
      setPosError(err instanceof Error ? err.message : 'Error confirming sale');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
              {t.navigation.pos} · {activeBranch?.name ?? ''}
            </h1>
            <StatusBadge label={t.topBar.demoOnlyTag} tone="amber" />
          </div>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {locale === 'es'
              ? 'Cada venta confirmada descuenta inventario, registra movimiento en Ventas, actualiza Caja (si es efectivo) y genera comprobante interno no fiscal.'
              : 'Confirmed sales deduct stock, post to Sales history, update Cashbox (if cash), and generate an internal non-fiscal receipt.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {openSession ? (
            <button
              type="button"
              onClick={() => setActiveScreen('cashbox_shift')}
              className="inline-flex items-center gap-2 h-9 px-3 rounded border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-xs font-semibold text-emerald-800 dark:text-emerald-300"
            >
              <Landmark className="w-3.5 h-3.5" />
              <span>
                {locale === 'es' ? 'Caja abierta:' : 'Cashbox:'} RD${openSession.expectedCash.toFixed(2)}
              </span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => openCashbox(5000)}
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded bg-amber-600 hover:bg-amber-700 text-xs font-semibold text-white"
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
                className="h-9 px-3 rounded border border-slate-300 dark:border-slate-700 text-xs font-semibold"
              >
                {locale === 'es' ? 'Ir a Caja' : 'Go to Cashbox'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Post-sale action bar */}
      {lastCompleted && (
        <div className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 p-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-900 dark:text-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
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
              className="inline-flex items-center gap-1 h-8 px-3 rounded bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 text-xs font-semibold text-emerald-800 dark:text-emerald-300"
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
              className="inline-flex items-center gap-1 h-8 px-3 rounded bg-emerald-700 text-xs font-semibold text-white"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{locale === 'es' ? 'Ver comprobante no fiscal' : 'View receipt'}</span>
            </button>
          </div>
        </div>
      )}

      {posError && (
        <div className="rounded-md border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 p-3 text-xs text-red-800 dark:text-red-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{posError}</span>
        </div>
      )}

      {/* Main Split: Catalog Grid + Cart Checkout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Product picker */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  locale === 'es' ? 'Buscar producto por SKU o nombre…' : 'Search product by SKU or name…'
                }
                className="w-full h-9 pl-9 pr-3 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
            <select
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value)}
              className="h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs font-semibold"
            >
              <option value="ALL">{t.common.all}</option>
              {erpState.categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {locale === 'es' ? c.nameEs : c.nameEn}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {filteredProducts.map((p) => {
              const outOfStock = p.stock <= 0 && !erpState.business.allowNegativeStock;
              return (
                <button
                  key={p.id}
                  type="button"
                  disabled={outOfStock}
                  onClick={() => addToCart(p.id)}
                  className="text-left rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex flex-col justify-between gap-2"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono-num text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                        {p.sku}
                      </span>
                      <StatusBadge
                        label={`Stock: ${p.stock}`}
                        tone={p.stock <= p.minStock ? 'amber' : 'neutral'}
                      />
                    </div>
                    <div className="mt-1.5 text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-2">
                      {locale === 'es' ? p.nameEs : p.nameEn}
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <MoneyCell amount={p.price} locale={locale} emphasize />
                    <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                      + {locale === 'es' ? 'Agregar' : 'Add'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Cart & Checkout */}
        <div className="lg:col-span-5 xl:col-span-4">
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-4 sticky top-20">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-emerald-600" />
                <h2 className="font-display text-base font-bold">
                  {locale === 'es' ? 'Carrito POS' : 'POS Cart'}
                </h2>
              </div>
              <span className="font-mono-num text-xs font-semibold text-slate-500">
                {cart.reduce((a, b) => a + b.quantity, 0)} {locale === 'es' ? 'uds' : 'pcs'}
              </span>
            </div>

            {/* Customer */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
                {locale === 'es' ? 'Cliente' : 'Customer'}
              </label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 text-xs font-semibold"
              >
                {erpState.customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} · {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Cart items */}
            <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {cart.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500">
                  {locale === 'es'
                    ? 'Selecciona productos del catálogo para agregar al carrito.'
                    : 'Select products to add to the cart.'}
                </div>
              ) : (
                cart.map((line) => {
                  const p = productMap.get(line.productId);
                  if (!p) return null;
                  return (
                    <div key={line.productId} className="py-2.5 flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold truncate">
                          {locale === 'es' ? p.nameEs : p.nameEn}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono-num">
                          RD${p.price.toFixed(2)} x {line.quantity}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => updateCartQty(line.productId, -1)}
                          className="w-6 h-6 rounded border border-slate-300 dark:border-slate-700 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center font-mono-num text-xs font-bold">
                          {line.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateCartQty(line.productId, 1)}
                          className="w-6 h-6 rounded border border-slate-300 dark:border-slate-700 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeFromCart(line.productId)}
                          className="w-6 h-6 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center justify-center ml-1"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Discount & Payment Method */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
                  {locale === 'es' ? 'Descuento (%)' : 'Discount (%)'}
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                  className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 text-sm font-mono-num"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
                  {locale === 'es' ? 'Forma de pago' : 'Payment'}
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 text-xs font-semibold"
                >
                  <option value="CASH">{locale === 'es' ? 'Efectivo (Caja)' : 'Cash'}</option>
                  <option value="CARD">{locale === 'es' ? 'Tarjeta' : 'Card'}</option>
                  <option value="TRANSFER">{locale === 'es' ? 'Transferencia' : 'Transfer'}</option>
                  <option value="CREDIT">{locale === 'es' ? 'Crédito CxC' : 'Credit AR'}</option>
                </select>
              </div>
            </div>

            {/* Totals */}
            <div className="rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-3 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">{locale === 'es' ? 'Subtotal' : 'Subtotal'}</span>
                <MoneyCell amount={summary.subtotal} locale={locale} />
              </div>
              {summary.discountAmount > 0 && (
                <div className="flex justify-between text-amber-700 dark:text-amber-300">
                  <span>
                    {locale === 'es' ? `Descuento (${summary.discPct}%)` : `Discount (${summary.discPct}%)`}
                  </span>
                  <MoneyCell amount={-summary.discountAmount} locale={locale} />
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">
                  ITBIS ({erpState.business.standardItbisRate}%)
                </span>
                <MoneyCell amount={summary.tax} locale={locale} />
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700 font-bold text-sm">
                <span>{locale === 'es' ? 'Total a cobrar' : 'Total due'}</span>
                <MoneyCell amount={summary.total} locale={locale} size="lg" emphasize />
              </div>
            </div>

            {disabledReason && (
              <p className="text-[11px] text-amber-700 dark:text-amber-300">
                {disabledReason}
              </p>
            )}

            <button
              type="button"
              disabled={!canConfirm}
              onClick={handleConfirm}
              className="w-full h-10 rounded bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold text-white flex items-center justify-center gap-2 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{locale === 'es' ? 'Confirmar venta' : 'Confirm sale'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
