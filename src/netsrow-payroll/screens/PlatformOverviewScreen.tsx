import React, { useMemo } from 'react';
import {
  ArrowUpRight,
  Building2,
  CalendarClock,
  CheckCircle2,
  Clock,
  PauseCircle,
} from 'lucide-react';
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
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
            {pt.platformNav.overview}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {locale === 'es'
              ? 'Resumen operativo de empresas SaaS, renovaciones próximas y auditoría reciente calculados sobre el estado vivo.'
              : 'Live operational overview of SaaS companies, upcoming renewals, and recent platform audit activity.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setActivePlatformScreen('platform_tenants')}
          className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white whitespace-nowrap shrink-0"
        >
          <Building2 className="w-4 h-4" />
          <span>{locale === 'es' ? 'Administrar empresas' : 'Manage companies'}</span>
        </button>
      </div>

      {/* KPI Strip — exact counts from tenant list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>{locale === 'es' ? 'Empresas activas' : 'Active companies'}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 font-mono-num text-2xl font-bold text-slate-900 dark:text-slate-100">
            {metrics.activeCount}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            {locale === 'es'
              ? `${platformState.tenants.length} registradas en catálogo`
              : `${platformState.tenants.length} total registered`}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>{locale === 'es' ? 'Empresas en prueba' : 'Trial companies'}</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 font-mono-num text-2xl font-bold text-amber-700 dark:text-amber-300">
            {metrics.trialCount}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            {locale === 'es' ? 'Evaluación comercial activa' : 'Active trial onboarding'}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>{locale === 'es' ? 'Empresas suspendidas' : 'Suspended companies'}</span>
            <PauseCircle className="w-4 h-4 text-red-600" />
          </div>
          <div className="mt-2 font-mono-num text-2xl font-bold text-red-700 dark:text-red-400">
            {metrics.suspendedCount}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            {locale === 'es' ? 'Registros operativos preservados' : 'Historical data preserved'}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>{locale === 'es' ? 'Ingreso mensual SaaS (MRR)' : 'Monthly SaaS MRR'}</span>
            <CalendarClock className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2">
            <MoneyCell amount={metrics.activeMrrDop} locale={locale} size="lg" emphasize />
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            {locale === 'es' ? 'Planes + complementos vigentes' : 'Active plans + add-ons'}
          </div>
        </div>
      </div>

      {/* Upcoming Renewals + Recent Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-7 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm sm:text-base font-bold">
              {locale === 'es' ? 'Próximas renovaciones' : 'Upcoming renewals'}
            </h2>
            <button
              type="button"
              onClick={() => setActivePlatformScreen('platform_subscriptions')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
            >
              <span>{pt.platformNav.subscriptions}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
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
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
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
                      className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    >
                      <td className="py-2.5 pr-3">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {ten.name}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {locale === 'es' ? ten.planNameSnapshotEs : ten.planNameSnapshotEn}
                        </div>
                      </td>
                      <td className="py-2.5 pr-3 font-mono-num whitespace-nowrap">
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
        </div>

        <div className="xl:col-span-5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm sm:text-base font-bold">
              {locale === 'es' ? 'Actividad reciente' : 'Recent activity'}
            </h2>
            <button
              type="button"
              onClick={() => setActivePlatformScreen('platform_audit')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
            >
              <span>{pt.platformNav.audit}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentAudit.map((ev) => (
              <div key={ev.id} className="py-2.5 space-y-1 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <StatusBadge label={pt.auditEvents[ev.eventType]} tone="neutral" />
                  <span className="font-mono-num text-[11px] text-slate-500">
                    {ev.timestamp}
                  </span>
                </div>
                <div className="font-semibold text-slate-900 dark:text-slate-100">
                  {ev.tenantName ?? (locale === 'es' ? 'Catálogo SaaS' : 'SaaS Catalog')}
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-300">
                  {locale === 'es' ? ev.summaryEs : ev.summaryEn}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
