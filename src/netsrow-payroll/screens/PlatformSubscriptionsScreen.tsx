import React, { useState } from 'react';
import { CheckCircle2, CreditCard, ShieldAlert } from 'lucide-react';
import { DataTable, DataTableColumn } from '../components/DataTable';
import {
  ErpModal,
  ErpPageHeader,
  ErpSurfaceCard,
} from '../components/ErpUiPrimitives';
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
          className="nr-focus-ring text-left group rounded"
        >
          <div className="font-semibold text-[var(--nr-text)] group-hover:text-[var(--nr-primary)]">
            {t.name}
          </div>
          <div className="text-[11px] text-[var(--nr-text-secondary)]">
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
          className="nr-focus-ring nr-transition inline-flex items-center gap-1 rounded-lg border border-[var(--nr-success-border)] bg-[var(--nr-success-bg)] px-2.5 py-1 text-[11px] font-semibold text-[var(--nr-success)] hover:opacity-90 whitespace-nowrap"
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
      <ErpPageHeader
        title={pt.platformNav.subscriptions}
        subtitle={
          locale === 'es'
            ? 'Separación explícita entre estado operativo de empresa, estado de suscripción y estado de pago administrativo.'
            : 'Explicit separation between company operational status, subscription status, and manual payment status.'
        }
      />

      {/* Explicit non-billing notice */}
      <div className="rounded-xl border border-[var(--nr-warning-border)] bg-[var(--nr-warning-bg)] px-4 py-3 flex items-start gap-2.5 text-xs text-[var(--nr-text)]">
        <ShieldAlert className="w-4 h-4 text-[var(--nr-warning)] shrink-0 mt-0.5" />
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
      <ErpSurfaceCard padding="none" className="overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--nr-border)] flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-[var(--nr-primary)]" />
          <h2 className="font-display text-sm font-bold text-[var(--nr-text)]">
            {locale === 'es'
              ? 'Confirmaciones manuales registradas (Solo demo)'
              : 'Recorded manual confirmations (Demo only)'}
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] text-[var(--nr-text-secondary)]">
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
            <tbody className="divide-y divide-[var(--nr-border)]">
              {platformState.payments.map((pay) => (
                <tr key={pay.id}>
                  <td className="py-2.5 px-4 font-mono-num font-bold text-[var(--nr-primary)]">
                    {pay.reference}
                  </td>
                  <td className="py-2.5 px-4">
                    <div className="font-semibold text-[var(--nr-text)]">
                      {pay.tenantName}
                    </div>
                    <div className="text-[11px] text-[var(--nr-text-secondary)]">{pay.note}</div>
                  </td>
                  <td className="py-2.5 px-4 font-mono-num text-[var(--nr-text)]">{pay.paymentDate}</td>
                  <td className="py-2.5 px-4 text-[var(--nr-text-secondary)]">
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
      </ErpSurfaceCard>

      {/* Confirm Manual Payment Modal */}
      <ErpModal
        open={Boolean(paymentModalTenant)}
        onClose={() => setPaymentModalTenant(null)}
        maxWidthClass="max-w-md"
        closeLabel={locale === 'es' ? 'Cerrar' : 'Close'}
        title={
          locale === 'es'
            ? 'Confirmar pago manual (Solo demo)'
            : 'Confirm manual payment (Demo only)'
        }
        footer={
          <>
            <button
              type="button"
              onClick={() => setPaymentModalTenant(null)}
              className="nr-focus-ring nr-transition h-9 px-3.5 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface)] text-xs font-semibold text-[var(--nr-text)]"
            >
              {locale === 'es' ? 'Cancelar' : 'Cancel'}
            </button>
            <button
              type="submit"
              form="platform-manual-payment-form"
              disabled={isMutating}
              className="nr-focus-ring nr-transition h-9 px-4 rounded-lg bg-[var(--nr-primary)] hover:bg-[var(--nr-primary-hover)] disabled:opacity-50 text-xs font-semibold text-[var(--nr-primary-fg)]"
            >
              {locale === 'es'
                ? 'Confirmar pago (Solo demo)'
                : 'Confirm payment (Demo)'}
            </button>
          </>
        }
      >
        {paymentModalTenant && (
          <form id="platform-manual-payment-form" onSubmit={handleConfirmPayment} className="space-y-3 text-xs">
            <div className="rounded-xl border border-[var(--nr-warning-border)] bg-[var(--nr-warning-bg)] p-2.5 text-[11px] text-[var(--nr-text)]">
              {locale === 'es'
                ? 'Confirmación administrativa ficticia: registra la referencia y marca el pago como Al día sin ejecutar cobro bancario.'
                : 'Administrative demo confirmation: logs the reference and marks payment Paid without any real bank charge.'}
            </div>

            {modalError && (
              <div
                role="alert"
                className="rounded-xl border border-[var(--nr-error-border)] bg-[var(--nr-error-bg)] p-2.5 text-[var(--nr-error)]"
              >
                {modalError}
              </div>
            )}

            <div>
              <div className="text-[var(--nr-text-secondary)]">{locale === 'es' ? 'Empresa' : 'Company'}</div>
              <div className="font-bold text-sm text-[var(--nr-text)]">{paymentModalTenant.name}</div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[var(--nr-text)] mb-1">
                  {locale === 'es' ? 'Importe (RD$)' : 'Amount (RD$)'}
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  required
                  value={amountDop}
                  onChange={(e) => setAmountDop(e.target.value)}
                  className="nr-focus-ring nr-transition w-full h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-2.5 font-mono-num text-[var(--nr-text)]"
                />
              </div>
              <div>
                <label className="block font-semibold text-[var(--nr-text)] mb-1">
                  {locale === 'es' ? 'Fecha del comprobante' : 'Receipt date'}
                </label>
                <input
                  type="date"
                  required
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="nr-focus-ring nr-transition w-full h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-2.5 font-mono-num text-[var(--nr-text)]"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[var(--nr-text)] mb-1">
                {locale === 'es' ? 'Referencia bancaria única' : 'Unique bank reference'}
              </label>
              <input
                required
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="nr-focus-ring nr-transition w-full h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-2.5 font-mono-num uppercase text-[var(--nr-text)]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[var(--nr-text)] mb-1">
                {locale === 'es' ? 'Nota administrativa' : 'Admin note'}
              </label>
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="nr-focus-ring nr-transition w-full h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-2.5 text-sm text-[var(--nr-text)]"
              />
            </div>
          </form>
        )}
      </ErpModal>
    </div>
  );
};
