import React, { useMemo, useState } from 'react';
import { CreditCard, Plus, X } from 'lucide-react';
import { DataTable, DataTableColumn } from '../components/DataTable';
import { MoneyCell } from '../components/MoneyCell';
import { StatusBadge } from '../components/StatusBadge';
import { usePayrollWorkspace } from '../context/PayrollWorkspaceContext';
import { PurchaseBill } from '../types/erp';

export const PurchasesScreen: React.FC = () => {
  const {
    erpState,
    locale,
    t,
    registerCreditPurchase,
    payPurchaseBill,
  } = usePayrollWorkspace();

  const [newOpen, setNewOpen] = useState(false);
  const [supplierId, setSupplierId] = useState(erpState.suppliers[0]?.id ?? '');
  const [productId, setProductId] = useState(erpState.products[0]?.id ?? '');
  const [quantity, setQuantity] = useState('10');
  const [unitCost, setUnitCost] = useState(String(erpState.products[0]?.cost ?? 250));
  const [dueDate, setDueDate] = useState('2026-12-24');
  const [notes, setNotes] = useState('');

  const [payBill, setPayBill] = useState<PurchaseBill | null>(null);
  const [payAmount, setPayAmount] = useState('');

  const totalPendingAp = useMemo(
    () =>
      erpState.purchases.reduce(
        (acc, p) => acc + Math.max(0, p.totalAmount - p.paidAmount),
        0
      ),
    [erpState.purchases]
  );

  const handleCreatePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    await registerCreditPurchase({
      supplierId,
      productId,
      quantity: Number(quantity) || 0,
      unitCost: Number(unitCost) || 0,
      dueDate,
      notes,
    });
    setNewOpen(false);
    setNotes('');
  };

  const handlePaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payBill) return;
    await payPurchaseBill(payBill.id, Number(payAmount) || 0);
    setPayBill(null);
    setPayAmount('');
  };

  const columns: DataTableColumn<PurchaseBill>[] = [
    {
      key: 'number',
      header: locale === 'es' ? 'Factura compra' : 'Bill #',
      stickyLeft: true,
      render: (p) => (
        <span className="font-mono-num text-xs font-bold text-emerald-700 dark:text-emerald-400">
          {p.number}
        </span>
      ),
    },
    {
      key: 'supplier',
      header: locale === 'es' ? 'Proveedor' : 'Supplier',
      minWidthClass: 'min-w-[200px]',
      render: (p) => (
        <div>
          <div className="font-semibold text-xs">{p.supplierName}</div>
          <div className="text-[11px] text-slate-500">
            {p.productName} ({p.quantity} uds)
          </div>
        </div>
      ),
    },
    {
      key: 'due',
      header: locale === 'es' ? 'Vence' : 'Due date',
      render: (p) => <span className="font-mono-num text-xs">{p.dueDate}</span>,
    },
    {
      key: 'total',
      header: 'Total',
      align: 'right',
      render: (p) => <MoneyCell amount={p.totalAmount} locale={locale} />,
    },
    {
      key: 'bal',
      header: locale === 'es' ? 'Saldo CxP' : 'AP Balance',
      align: 'right',
      render: (p) => (
        <MoneyCell
          amount={Math.max(0, p.totalAmount - p.paidAmount)}
          locale={locale}
          emphasize={p.totalAmount - p.paidAmount > 0}
        />
      ),
    },
    {
      key: 'status',
      header: t.common.status,
      render: (p) => (
        <StatusBadge
          label={p.status}
          tone={p.status === 'PAID' ? 'emerald' : p.status === 'PARTIAL' ? 'amber' : 'crimson'}
          icon={p.status === 'PAID' ? 'approved' : 'warning'}
        />
      ),
    },
    {
      key: 'actions',
      header: t.common.actions,
      align: 'right',
      render: (p) => {
        const rem = Math.max(0, p.totalAmount - p.paidAmount);
        return (
          <button
            type="button"
            disabled={rem <= 0}
            onClick={() => {
              setPayBill(p);
              setPayAmount(rem.toFixed(2));
            }}
            className="inline-flex items-center gap-1 rounded border border-emerald-600/30 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-300 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <CreditCard className="w-3 h-3" />
            <span>{locale === 'es' ? 'Registrar pago' : 'Pay bill'}</span>
          </button>
        );
      },
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
              {t.navigation.purchasesAp}
            </h1>
            <StatusBadge label={t.topBar.demoOnlyTag} tone="amber" />
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {locale === 'es'
              ? 'Registra compras a crédito (incrementando inventario, CxP y Diario) y aplica abonos a proveedores.'
              : 'Record credit purchases (updating inventory, AP, and GL) and apply supplier payments.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setNewOpen(true)}
          className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{locale === 'es' ? 'Compra a crédito' : 'New credit purchase'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <div className="text-[11px] font-semibold uppercase text-slate-500">
            {locale === 'es' ? 'Saldo total por pagar' : 'Total AP balance'}
          </div>
          <div className="mt-2">
            <MoneyCell amount={totalPendingAp} locale={locale} size="lg" emphasize />
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <div className="text-[11px] font-semibold uppercase text-slate-500">
            {locale === 'es' ? 'Facturas activas' : 'Purchase bills'}
          </div>
          <div className="mt-2 font-mono-num text-xl font-bold">
            {erpState.purchases.length}
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <div className="text-[11px] font-semibold uppercase text-slate-500">
            {locale === 'es' ? 'Proveedores registrados' : 'Suppliers'}
          </div>
          <div className="mt-2 font-mono-num text-xl font-bold">
            {erpState.suppliers.length}
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={erpState.purchases}
        getRowKey={(p) => p.id}
        emptyMessage={t.common.noResults}
      />

      {newOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60">
          <div className="w-full max-w-md rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
              <h2 className="font-display text-base font-bold">
                {locale === 'es' ? 'Registrar compra a crédito (Solo demo)' : 'Record credit purchase'}
              </h2>
              <button type="button" onClick={() => setNewOpen(false)} className="p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreatePurchase} className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">
                  {locale === 'es' ? 'Proveedor' : 'Supplier'}
                </label>
                <select
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 text-xs"
                >
                  {erpState.suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code} · {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">
                  {locale === 'es' ? 'Producto a ingresar' : 'Product'}
                </label>
                <select
                  value={productId}
                  onChange={(e) => {
                    const pid = e.target.value;
                    setProductId(pid);
                    const found = erpState.products.find((p) => p.id === pid);
                    if (found) setUnitCost(String(found.cost));
                  }}
                  className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 text-xs"
                >
                  {erpState.products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.sku} · {locale === 'es' ? p.nameEs : p.nameEn}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    {locale === 'es' ? 'Cantidad' : 'Qty'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 text-sm font-mono-num"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    {locale === 'es' ? 'Costo unit.' : 'Unit cost'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    required
                    value={unitCost}
                    onChange={(e) => setUnitCost(e.target.value)}
                    className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 text-sm font-mono-num"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    {locale === 'es' ? 'Vencimiento' : 'Due date'}
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 text-xs font-mono-num"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">
                  {locale === 'es' ? 'Notas' : 'Notes'}
                </label>
                <input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setNewOpen(false)}
                  className="h-9 px-3.5 rounded border border-slate-300 dark:border-slate-700 text-xs font-semibold"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 rounded bg-emerald-600 text-xs font-semibold text-white"
                >
                  {t.common.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {payBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60">
          <div className="w-full max-w-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
              <h2 className="font-display text-base font-bold">
                {locale === 'es' ? `Pagar ${payBill.number}` : `Pay ${payBill.number}`}
              </h2>
              <button type="button" onClick={() => setPayBill(null)} className="p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handlePaySubmit} className="p-4 space-y-3">
              <div className="text-xs text-slate-600 dark:text-slate-300">
                {payBill.supplierName}
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">
                  {locale === 'es' ? 'Monto a pagar (RD$)' : 'Payment amount (RD$)'}
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 text-sm font-mono-num"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setPayBill(null)}
                  className="h-9 px-3.5 rounded border border-slate-300 dark:border-slate-700 text-xs font-semibold"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 rounded bg-emerald-600 text-xs font-semibold text-white"
                >
                  {locale === 'es' ? 'Confirmar pago' : 'Confirm payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
