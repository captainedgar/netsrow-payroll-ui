import React, { useMemo, useState } from 'react';
import { CreditCard, Plus } from 'lucide-react';
import { DataTable, DataTableColumn } from '../components/DataTable';
import {
  ErpModal,
  ErpPageHeader,
  ErpSurfaceCard,
} from '../components/ErpUiPrimitives';
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
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setIsSubmitting(true);
    try {
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payBill) return;
    setIsSubmitting(true);
    try {
      await payPurchaseBill(payBill.id, Number(payAmount) || 0);
      setPayBill(null);
      setPayAmount('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: DataTableColumn<PurchaseBill>[] = [
    {
      key: 'number',
      header: locale === 'es' ? 'Factura compra' : 'Bill #',
      stickyLeft: true,
      render: (p) => (
        <span className="font-mono-num text-xs font-bold text-[var(--nr-primary)]">
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
          <div className="font-semibold text-xs text-[var(--nr-text)]">{p.supplierName}</div>
          <div className="text-[11px] text-[var(--nr-text-secondary)]">
            {p.productName} ({p.quantity} uds)
          </div>
        </div>
      ),
    },
    {
      key: 'due',
      header: locale === 'es' ? 'Vence' : 'Due date',
      render: (p) => (
        <span className="font-mono-num text-xs text-[var(--nr-text-secondary)]">{p.dueDate}</span>
      ),
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
            className="nr-focus-ring nr-transition inline-flex items-center gap-1 rounded-lg border border-[var(--nr-success-border)] bg-[var(--nr-success-bg)] hover:border-[var(--nr-primary)] px-2.5 py-1 text-xs font-semibold text-[var(--nr-success)] disabled:opacity-40 disabled:cursor-not-allowed"
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
      <ErpPageHeader
        title={t.navigation.purchasesAp}
        subtitle={
          locale === 'es'
            ? 'Registra compras a crédito (incrementando inventario, CxP y Diario) y aplica abonos a proveedores.'
            : 'Record credit purchases (updating inventory, AP, and GL) and apply supplier payments.'
        }
        badge={<StatusBadge label={t.topBar.demoOnlyTag} tone="amber" />}
        actions={
          <button
            type="button"
            onClick={() => setNewOpen(true)}
            className="nr-focus-ring nr-transition inline-flex items-center gap-1.5 h-10 px-4 rounded-lg bg-[var(--nr-primary)] hover:bg-[var(--nr-primary-hover)] text-xs font-semibold text-[var(--nr-primary-fg)] whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{locale === 'es' ? 'Compra a crédito' : 'New credit purchase'}</span>
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <ErpSurfaceCard padding="sm">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--nr-text-secondary)]">
            {locale === 'es' ? 'Saldo total por pagar' : 'Total AP balance'}
          </div>
          <div className="mt-2">
            <MoneyCell amount={totalPendingAp} locale={locale} size="lg" emphasize />
          </div>
        </ErpSurfaceCard>
        <ErpSurfaceCard padding="sm">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--nr-text-secondary)]">
            {locale === 'es' ? 'Facturas activas' : 'Purchase bills'}
          </div>
          <div className="mt-2 font-mono-num text-xl font-bold text-[var(--nr-text)]">
            {erpState.purchases.length}
          </div>
        </ErpSurfaceCard>
        <ErpSurfaceCard padding="sm">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--nr-text-secondary)]">
            {locale === 'es' ? 'Proveedores registrados' : 'Suppliers'}
          </div>
          <div className="mt-2 font-mono-num text-xl font-bold text-[var(--nr-text)]">
            {erpState.suppliers.length}
          </div>
        </ErpSurfaceCard>
      </div>

      <DataTable
        columns={columns}
        rows={erpState.purchases}
        getRowKey={(p) => p.id}
        emptyMessage={t.common.noResults}
      />

      <ErpModal
        open={newOpen}
        onClose={() => setNewOpen(false)}
        title={
          locale === 'es'
            ? 'Registrar compra a crédito (Solo demo)'
            : 'Record credit purchase'
        }
        maxWidthClass="max-w-md"
        closeLabel={t.common.cancel}
      >
        <form onSubmit={handleCreatePurchase} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-[var(--nr-text)] mb-1">
              {locale === 'es' ? 'Proveedor' : 'Supplier'}
            </label>
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className="nr-focus-ring w-full h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-2.5 text-xs text-[var(--nr-text)]"
            >
              {erpState.suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} · {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--nr-text)] mb-1">
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
              className="nr-focus-ring w-full h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-2.5 text-xs text-[var(--nr-text)]"
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
              <label className="block text-xs font-semibold text-[var(--nr-text)] mb-1">
                {locale === 'es' ? 'Cantidad' : 'Qty'}
              </label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="nr-focus-ring w-full h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-2.5 text-sm font-mono-num text-[var(--nr-text)]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--nr-text)] mb-1">
                {locale === 'es' ? 'Costo unit.' : 'Unit cost'}
              </label>
              <input
                type="number"
                min="1"
                step="0.01"
                required
                value={unitCost}
                onChange={(e) => setUnitCost(e.target.value)}
                className="nr-focus-ring w-full h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-2.5 text-sm font-mono-num text-[var(--nr-text)]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--nr-text)] mb-1">
                {locale === 'es' ? 'Vencimiento' : 'Due date'}
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="nr-focus-ring w-full h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-2 text-xs font-mono-num text-[var(--nr-text)]"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--nr-text)] mb-1">
              {locale === 'es' ? 'Notas' : 'Notes'}
            </label>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="nr-focus-ring w-full h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-2.5 text-sm text-[var(--nr-text)]"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-[var(--nr-border)]">
            <button
              type="button"
              onClick={() => setNewOpen(false)}
              className="nr-focus-ring nr-transition h-9 px-3.5 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface)] text-xs font-semibold text-[var(--nr-text)] hover:bg-[var(--nr-surface-muted)]"
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="nr-focus-ring nr-transition h-9 px-4 rounded-lg bg-[var(--nr-primary)] hover:bg-[var(--nr-primary-hover)] text-xs font-semibold text-[var(--nr-primary-fg)] disabled:opacity-50"
            >
              {t.common.save}
            </button>
          </div>
        </form>
      </ErpModal>

      <ErpModal
        open={payBill !== null}
        onClose={() => setPayBill(null)}
        title={payBill ? (locale === 'es' ? `Pagar ${payBill.number}` : `Pay ${payBill.number}`) : ''}
        maxWidthClass="max-w-sm"
        closeLabel={t.common.cancel}
      >
        {payBill && (
          <form onSubmit={handlePaySubmit} className="space-y-3">
            <div className="text-xs font-medium text-[var(--nr-text-secondary)]">
              {payBill.supplierName}
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--nr-text)] mb-1">
                {locale === 'es' ? 'Monto a pagar (RD$)' : 'Payment amount (RD$)'}
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                required
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                className="nr-focus-ring w-full h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-2.5 text-sm font-mono-num text-[var(--nr-text)]"
              />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-[var(--nr-border)]">
              <button
                type="button"
                onClick={() => setPayBill(null)}
                className="nr-focus-ring nr-transition h-9 px-3.5 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface)] text-xs font-semibold text-[var(--nr-text)] hover:bg-[var(--nr-surface-muted)]"
              >
                {t.common.cancel}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="nr-focus-ring nr-transition h-9 px-4 rounded-lg bg-[var(--nr-primary)] hover:bg-[var(--nr-primary-hover)] text-xs font-semibold text-[var(--nr-primary-fg)] disabled:opacity-50"
              >
                {locale === 'es' ? 'Confirmar pago' : 'Confirm payment'}
              </button>
            </div>
          </form>
        )}
      </ErpModal>
    </div>
  );
};
