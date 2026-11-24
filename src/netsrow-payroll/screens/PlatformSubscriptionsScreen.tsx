import React, { useState } from 'react';
import { CheckCircle2, CreditCard, ShieldAlert, X } from 'lucide-react';
import { DataTable, DataTableColumn } from '../components/DataTable';
import { MoneyCell } from '../components/MoneyCell';
import { StatusBadge } from '../components/StatusBadge';
import { usePlatform } from '../context/PlatformContext';
import { computeTenantMonthlyBreakdown } from '../data/platformSeed';
import { TenantRecord } from '../types/platform';

export const PlatformSubscriptionsScreen: React.FC = () => {
  const {
    platformState,
    locale,
    pt,
    openTenantDetail,
    recordManualPayment,
    isMutating,
  } = usePlatform();

  const [paymentModalTenant, setPaymentModalTenant] = useState<TenantRecord | null>(null);
  const [amountDop, setAmountDop] = useState('');
  const [paymentDate, setPaymentDate] = useState('2026-11-24');
  const [reference, setReference] = useState('');
  const [note, setNote] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);

  const openManualPaymentModal = (ten: TenantRecord) => {
    const breakdown = computeTenantMonthlyBreakdown(
      ten,
      platformState.modules,
      platformState.plans
    );
    setPaymentModalTenant(ten);
    setAmountDop(String(breakdown.totalDop));
    setPaymentDate('2026-11-24');
    setReference(`TRF-${ten.code}-NOV`);
    setNote(
      locale === 'es'
        ? 'Confirmación manual administrativa de comprobante bancario (Solo demo)'
        : 'Manual administrative bank slip confirmation (Demo only)'
    );
    setModalError(null);
  };

  const handleConfirmPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalTenant) return;
    setModalError(null);
    try {
      await recordManualPayment({
        tenantId: paymentModalTenant.id,
        amountDop: Number(amountDop) || 0,
        paymentDate,
        reference: reference.trim(),
        note: note.trim(),
      });
      setPaymentModalTenant(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error';
      if (msg.startsWith('DUPLICATE_REF:')) {
        const ref = msg.replace('DUPLICATE_REF:', '');
        setModalError(
          locale === 'es'
            ? `La referencia ${ref} ya fue confirmada para esta empresa. Se evitó duplicar el registro.`
            : `Reference ${ref} was already confirmed for this tenant. Duplicate prevented.`
        );
      } else {
        setModalError(msg);
      }
    }
  };

  const columns: DataTableColumn<TenantRecord>[] = [
    {
      key: 'tenant',
      header: locale === 'es' ? 'Empresa y plan' : 'Company & plan',
      stickyLeft: true,
      minWidthClass: 'min-w-[200px]',
      render: (t) => (
        <button
          type="button"
          onClick={() => openTenantDetail(t.id)}
          className="text-left group"
        >
          <div className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
            {t.name}
          </div>
          <div className="text-[11px] text-slate-500">
            {t.code} · {locale === 'es' ? t.planNameSnapshotEs : t.planNameSnapshotEn}
          </div>
        </button>
      ),
    },
    {
      key: 'tenantStatus',
      header: locale === 'es' ? 'Estado empresa' : 'Tenant status',
      render: (t) => (
        <StatusBadge
          label={pt.tenantStatuses[t.status]}
          tone={t.status === 'ACTIVE' ? 'emerald' : t.status === 'TRIAL' ? 'amber' : 'crimson'}
        />
      ),
    },
    {
      key: 'subStatus',
      header: locale === 'es' ? 'Estado suscripción' : 'Subscription',
      render: (t) => (
        <StatusBadge
          label={pt.subscriptionStatuses[t.subscriptionStatus]}
          tone={
            t.subscriptionStatus === 'ACTIVE'
              ? 'emerald'
              : t.subscriptionStatus === 'TRIALING'
                ? 'amber'
                : 'crimson'
          }
        />
      ),
    },
    {
      key: 'payStatus',
      header: locale === 'es' ? 'Estado pago' : 'Payment status',
      render: (t) => (
        <StatusBadge
          label={pt.paymentStatuses[t.paymentStatus]}
          tone={
            t.paymentStatus === 'PAID'
              ? 'emerald'
              : t.paymentStatus === 'PENDING_CONFIRMATION'
                ? 'amber'
                : 'crimson'
          }
        />
      ),
    },
    {
      key: 'renewal',
      header: locale === 'es' ? 'Renovación' : 'Renewal',
      render: (t) => <span className="font-mono-num text-xs">{t.renewalDate}</span>,
    },
    {
      key: 'total',
      header: locale === 'es' ? 'Cuota mensual' : 'Monthly fee',
      align: 'right',
      render: (t) => {
        const b = computeTenantMonthlyBreakdown(
          t,
          platformState.modules,
          platformState.plans
        );
        return <MoneyCell amount={b.totalDop} locale={locale} emphasize />;
      },
    },
    {
      key: 'actions',
      header: locale === 'es' ? 'Acción manual (Demo)' : 'Manual action (Demo)',
      align: 'right',
      render: (t) => (
        <button
          type="button"
          onClick={() => openManualPaymentModal(t)}
          className="inline-flex items-center gap-1 rounded border border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/30 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 whitespace-nowrap"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>
            {locale === 'es'
              ? 'Confirmar pago manual (Solo demo)'
              : 'Confirm manual payment (Demo)'}
          </span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
          {pt.platformNav.subscriptions}
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          {locale === 'es'
            ? 'Separación explícita entre estado operativo de empresa, estado de suscripción y estado de pago administrativo.'
            : 'Explicit separation between company operational status, subscription status, and manual payment status.'}
        </p>
      </div>

      {/* Explicit non-billing notice */}
      <div className="rounded-md border border-amber-300/80 dark:border-amber-800/70 bg-amber-50/70 dark:bg-amber-950/30 px-4 py-3 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
        <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
        <span>
          {locale === 'es'
            ? 'Solo demo: este módulo registra confirmaciones administrativas manuales y previene referencias duplicadas. No procesa cobros automáticos ni tarjetas reales.'
            : 'Demo only: this screen records manual administrative confirmations with duplicate reference protection. No real card or bank charges are processed.'}
        </span>
      </div>

      <DataTable
        columns={columns}
        rows={platformState.tenants}
        getRowKey={(t) => t.id}
        emptyMessage={
          locale === 'es'
            ? 'No hay suscripciones registradas.'
            : 'No subscriptions recorded.'
        }
      />

      {/* Recorded Manual Confirmations History */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-emerald-600" />
          <h2 className="font-display text-sm font-bold">
            {locale === 'es'
              ? 'Confirmaciones manuales registradas (Solo demo)'
              : 'Recorded manual confirmations (Demo only)'}
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-500">
                <th className="py-2.5 px-4 text-left font-semibold">
                  {locale === 'es' ? 'Referencia' : 'Reference'}
                </th>
                <th className="py-2.5 px-4 text-left font-semibold">
                  {locale === 'es' ? 'Empresa' : 'Company'}
                </th>
                <th className="py-2.5 px-4 text-left font-semibold">
                  {locale === 'es' ? 'Fecha pago' : 'Payment date'}
                </th>
                <th className="py-2.5 px-4 text-left font-semibold">
                  {locale === 'es' ? 'Registrado por' : 'Recorded by'}
                </th>
                <th className="py-2.5 px-4 text-right font-semibold">
                  {locale === 'es' ? 'Importe (RD$)' : 'Amount (RD$)'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {platformState.payments.map((pay) => (
                <tr key={pay.id}>
                  <td className="py-2.5 px-4 font-mono-num font-bold text-emerald-700 dark:text-emerald-400">
                    {pay.reference}
                  </td>
                  <td className="py-2.5 px-4">
                    <div className="font-semibold text-slate-900 dark:text-slate-100">
                      {pay.tenantName}
                    </div>
                    <div className="text-[11px] text-slate-500">{pay.note}</div>
                  </td>
                  <td className="py-2.5 px-4 font-mono-num">{pay.paymentDate}</td>
                  <td className="py-2.5 px-4 text-slate-600 dark:text-slate-300">
                    {pay.recordedBy}
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    <MoneyCell amount={pay.amountDop} locale={locale} emphasize />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirm Manual Payment Modal */}
      {paymentModalTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60">
          <div className="w-full max-w-md rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
              <h2 className="font-display text-base font-bold">
                {locale === 'es'
                  ? 'Confirmar pago manual (Solo demo)'
                  : 'Confirm manual payment (Demo only)'}
              </h2>
              <button
                type="button"
                onClick={() => setPaymentModalTenant(null)}
                className="p-1 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmPayment} className="p-4 space-y-3 text-xs">
              <div className="rounded border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 p-2.5 text-[11px] text-amber-900 dark:text-amber-200">
                {locale === 'es'
                  ? 'Confirmación administrativa ficticia: registra la referencia y marca el pago como Al día sin ejecutar cobro bancario.'
                  : 'Administrative demo confirmation: logs the reference and marks payment Paid without any real bank charge.'}
              </div>

              {modalError && (
                <div
                  role="alert"
                  className="rounded border border-red-300 dark:border-red-900 bg-red-50 dark:bg-red-950/40 p-2.5 text-red-900 dark:text-red-200"
                >
                  {modalError}
                </div>
              )}

              <div>
                <div className="text-slate-500">{locale === 'es' ? 'Empresa' : 'Company'}</div>
                <div className="font-bold text-sm">{paymentModalTenant.name}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">
                    {locale === 'es' ? 'Importe (RD$)' : 'Amount (RD$)'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    required
                    value={amountDop}
                    onChange={(e) => setAmountDop(e.target.value)}
                    className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 font-mono-num"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">
                    {locale === 'es' ? 'Fecha del comprobante' : 'Receipt date'}
                  </label>
                  <input
                    type="date"
                    required
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 font-mono-num"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">
                  {locale === 'es' ? 'Referencia bancaria única' : 'Unique bank reference'}
                </label>
                <input
                  required
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 font-mono-num uppercase"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">
                  {locale === 'es' ? 'Nota administrativa' : 'Admin note'}
                </label>
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setPaymentModalTenant(null)}
                  className="h-9 px-3.5 rounded border border-slate-300 dark:border-slate-700 font-semibold"
                >
                  {locale === 'es' ? 'Cancelar' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isMutating}
                  className="h-9 px-4 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                >
                  {locale === 'es'
                    ? 'Confirmar pago (Solo demo)'
                    : 'Confirm payment (Demo)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
