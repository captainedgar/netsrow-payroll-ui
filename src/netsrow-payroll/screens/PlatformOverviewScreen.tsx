import React, { useMemo } from 'react';
import {
  ArrowUpRight,
  Building2,
  CalendarClock,
  CheckCircle2,
  Clock,
  PauseCircle,
} from 'lucide-react';
import { ErpPageHeader, ErpSurfaceCard } from '../components/ErpUiPrimitives';
import { MoneyCell } from '../components/MoneyCell';
import { StatusBadge } from '../components/StatusBadge';
import { usePlatform } from '../context/PlatformContext';
import { computeTenantMonthlyBreakdown } from '../data/platformSeed';

export const PlatformOverviewScreen: React.FC = () => {
  const {
    platformState,
    locale,
    pt,
    setActivePlatformScreen,
    openTenantDetail,
  } = usePlatform();

  // Single source of truth: derived directly from platformState.tenants
  const metrics = useMemo(() => {
    let activeCount = 0;
    let trialCount = 0;
    let suspendedCount = 0;
    let activeMrrDop = 0;

    platformState.tenants.forEach((ten) => {
      if (ten.status === 'ACTIVE') activeCount += 1;
      if (ten.status === 'TRIAL') trialCount += 1;
      if (ten.status === 'SUSPENDED') suspendedCount += 1;
      if (ten.status !== 'SUSPENDED') {
        const b = computeTenantMonthlyBreakdown(
          ten,
          platformState.modules,
          platformState.plans
        );
        activeMrrDop += b.totalDop;
      }
    });

    return {
      activeCount,
      trialCount,
      suspendedCount,
      activeMrrDop,
    };
  }, [platformState]);

  const upcomingRenewals = useMemo(
    () =>
      [...platformState.tenants]
        .filter((t) => t.status !== 'SUSPENDED')
        .sort((a, b) => a.renewalDate.localeCompare(b.renewalDate))
        .slice(0, 5),
    [platformState.tenants]
  );

  const recentAudit = useMemo(
    () => platformState.auditEvents.slice(0, 5),
    [platformState.auditEvents]
  );

  return (
    <div className="space-y-6">
      <ErpPageHeader
        variant="hero"
        eyebrow="NetsRow Platform · SaaS Admin"
        title={pt.platformNav.overview}
        subtitle={
          locale === 'es'
            ? 'Resumen operativo de empresas SaaS, renovaciones próximas y auditoría reciente calculados sobre el estado vivo.'
            : 'Live operational overview of SaaS companies, upcoming renewals, and recent platform audit activity.'
        }
        actions={
          <button
            type="button"
            onClick={() => setActivePlatformScreen('platform_tenants')}
            className="nr-focus-ring nr-transition inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-[var(--nr-primary)] hover:bg-[var(--nr-primary-hover)] text-xs font-semibold text-[var(--nr-primary-fg)] whitespace-nowrap shrink-0"
          >
            <Building2 className="w-4 h-4" />
            <span>{locale === 'es' ? 'Administrar empresas' : 'Manage companies'}</span>
          </button>
        }
      />

      {/* KPI Strip — exact counts from tenant list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <ErpSurfaceCard padding="sm">
          <div className="flex items-center justify-between text-xs font-semibold text-[var(--nr-text-secondary)]">
            <span>{locale === 'es' ? 'Empresas activas' : 'Active companies'}</span>
            <CheckCircle2 className="w-4 h-4 text-[var(--nr-success)]" />
          </div>
          <div className="mt-2 font-mono-num text-2xl font-bold text-[var(--nr-text)]">
            {metrics.activeCount}
          </div>
          <div className="mt-1 text-[11px] text-[var(--nr-text-secondary)]">
            {locale === 'es'
              ? `${platformState.tenants.length} registradas en catálogo`
              : `${platformState.tenants.length} total registered`}
          </div>
        </ErpSurfaceCard>

        <ErpSurfaceCard padding="sm">
          <div className="flex items-center justify-between text-xs font-semibold text-[var(--nr-text-secondary)]">
            <span>{locale === 'es' ? 'Empresas en prueba' : 'Trial companies'}</span>
            <Clock className="w-4 h-4 text-[var(--nr-warning)]" />
          </div>
          <div className="mt-2 font-mono-num text-2xl font-bold text-[var(--nr-warning)]">
            {metrics.trialCount}
          </div>
          <div className="mt-1 text-[11px] text-[var(--nr-text-secondary)]">
            {locale === 'es' ? 'Evaluación comercial activa' : 'Active trial onboarding'}
          </div>
        </ErpSurfaceCard>

        <ErpSurfaceCard padding="sm">
          <div className="flex items-center justify-between text-xs font-semibold text-[var(--nr-text-secondary)]">
            <span>{locale === 'es' ? 'Empresas suspendidas' : 'Suspended companies'}</span>
            <PauseCircle className="w-4 h-4 text-[var(--nr-error)]" />
          </div>
          <div className="mt-2 font-mono-num text-2xl font-bold text-[var(--nr-error)]">
            {metrics.suspendedCount}
          </div>
          <div className="mt-1 text-[11px] text-[var(--nr-text-secondary)]">
            {locale === 'es' ? 'Registros operativos preservados' : 'Historical data preserved'}
          </div>
        </ErpSurfaceCard>

        <ErpSurfaceCard padding="sm">
          <div className="flex items-center justify-between text-xs font-semibold text-[var(--nr-text-secondary)]">
            <span>{locale === 'es' ? 'Ingreso mensual SaaS (MRR)' : 'Monthly SaaS MRR'}</span>
            <CalendarClock className="w-4 h-4 text-[var(--nr-primary)]" />
          </div>
          <div className="mt-2">
            <MoneyCell amount={metrics.activeMrrDop} locale={locale} size="lg" emphasize />
          </div>
          <div className="mt-1 text-[11px] text-[var(--nr-text-secondary)]">
            {locale === 'es' ? 'Planes + complementos vigentes' : 'Active plans + add-ons'}
          </div>
        </ErpSurfaceCard>
      </div>

      {/* Upcoming Renewals + Recent Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <ErpSurfaceCard className="xl:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm sm:text-base font-bold text-[var(--nr-text)]">
              {locale === 'es' ? 'Próximas renovaciones' : 'Upcoming renewals'}
            </h2>
            <button
              type="button"
              onClick={() => setActivePlatformScreen('platform_subscriptions')}
              className="nr-focus-ring inline-flex items-center gap-1 text-xs font-semibold text-[var(--nr-primary)] hover:underline rounded"
            >
              <span>{pt.platformNav.subscriptions}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[var(--nr-border)] text-[var(--nr-text-secondary)]">
                  <th className="py-2 text-left font-semibold">
                    {locale === 'es' ? 'Empresa' : 'Company'}
                  </th>
                  <th className="py-2 text-left font-semibold">
                    {locale === 'es' ? 'Renovación' : 'Renewal'}
                  </th>
                  <th className="py-2 text-left font-semibold">
                    {locale === 'es' ? 'Pago' : 'Payment'}
                  </th>
                  <th className="py-2 text-right font-semibold">
                    {locale === 'es' ? 'Cuota' : 'Fee'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--nr-border)]">
                {upcomingRenewals.map((ten) => {
                  const breakdown = computeTenantMonthlyBreakdown(
                    ten,
                    platformState.modules,
                    platformState.plans
                  );
                  return (
                    <tr
                      key={ten.id}
                      onClick={() => openTenantDetail(ten.id)}
                      className="nr-transition cursor-pointer hover:bg-[var(--nr-surface-muted)]"
                    >
                      <td className="py-2.5 pr-3">
                        <div className="font-semibold text-[var(--nr-text)]">
                          {ten.name}
                        </div>
                        <div className="text-[11px] text-[var(--nr-text-secondary)]">
                          {locale === 'es' ? ten.planNameSnapshotEs : ten.planNameSnapshotEn}
                        </div>
                      </td>
                      <td className="py-2.5 pr-3 font-mono-num whitespace-nowrap text-[var(--nr-text)]">
                        {ten.renewalDate}
                      </td>
                      <td className="py-2.5 pr-3">
                        <StatusBadge
                          label={pt.paymentStatuses[ten.paymentStatus]}
                          tone={
                            ten.paymentStatus === 'PAID'
                              ? 'emerald'
                              : ten.paymentStatus === 'PENDING_CONFIRMATION'
                                ? 'amber'
                                : 'crimson'
                          }
                        />
                      </td>
                      <td className="py-2.5 text-right">
                        <MoneyCell amount={breakdown.totalDop} locale={locale} emphasize />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </ErpSurfaceCard>

        <ErpSurfaceCard className="xl:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm sm:text-base font-bold text-[var(--nr-text)]">
              {locale === 'es' ? 'Actividad reciente' : 'Recent activity'}
            </h2>
            <button
              type="button"
              onClick={() => setActivePlatformScreen('platform_audit')}
              className="nr-focus-ring inline-flex items-center gap-1 text-xs font-semibold text-[var(--nr-primary)] hover:underline rounded"
            >
              <span>{pt.platformNav.audit}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-[var(--nr-border)]">
            {recentAudit.map((ev) => (
              <div key={ev.id} className="py-2.5 space-y-1 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <StatusBadge label={pt.auditEvents[ev.eventType]} tone="neutral" />
                  <span className="font-mono-num text-[11px] text-[var(--nr-text-secondary)]">
                    {ev.timestamp}
                  </span>
                </div>
                <div className="font-semibold text-[var(--nr-text)]">
                  {ev.tenantName ?? (locale === 'es' ? 'Catálogo SaaS' : 'SaaS Catalog')}
                </div>
                <div className="text-[11px] text-[var(--nr-text-secondary)]">
                  {locale === 'es' ? ev.summaryEs : ev.summaryEn}
                </div>
              </div>
            ))}
          </div>
        </ErpSurfaceCard>
      </div>
    </div>
  );
};
