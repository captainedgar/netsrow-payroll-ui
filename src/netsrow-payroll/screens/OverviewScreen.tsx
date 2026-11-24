import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowUpRight,
  Boxes,
  Calculator,
  ClipboardCheck,
  Landmark,
  MonitorSmartphone,
  ReceiptText,
  TrendingUp,
  X,
} from 'lucide-react';
import { MoneyCell } from '../components/MoneyCell';
import { RecentActivityFeed } from '../components/RecentActivityFeed';
import { StatusBadge } from '../components/StatusBadge';
import { usePayrollWorkspace } from '../context/PayrollWorkspaceContext';
import { ActivityStatusType, DashboardIncidence } from '../types/erp';

export const OverviewScreen: React.FC = () => {
  const {
    periods,
    activePeriodId,
    selectPeriod,
    erpState,
    activeBranch,
    locale,
    setActiveScreen,
    selectEmployee,
  } = usePayrollWorkspace();

  const [selectedIncidence, setSelectedIncidence] =
    useState<DashboardIncidence | null>(null);

  const dashboardPeriod = useMemo(
    () => periods.find((p) => p.id === activePeriodId) ?? periods[0] ?? null,
    [periods, activePeriodId]
  );

  const periodCode = dashboardPeriod?.code ?? '2026-11';

  const openCashSession = useMemo(
    () => erpState.cashSessions.find((s) => s.status === 'OPEN') ?? null,
    [erpState.cashSessions]
  );

  const lowStockProducts = useMemo(
    () => erpState.products.filter((p) => p.stock <= p.minStock && p.active),
    [erpState.products]
  );

  const periodSalesTotal = useMemo(() => {
    const liveNovSales = erpState.sales
      .filter((s) => s.status === 'COMPLETED' && s.date.startsWith(periodCode))
      .reduce((acc, s) => acc + s.total, 0);
    if (liveNovSales > 0) return liveNovSales;
    const baseByMonth: Record<string, number> = {
      '2026-10': 142800,
      '2026-09': 128450,
      '2026-08': 119320,
      '2026-07': 108900,
    };
    return baseByMonth[periodCode] ?? 0;
  }, [erpState.sales, periodCode]);

  const currentPeriodRun = useMemo(
    () =>
      dashboardPeriod?.runs.find((r) => r.id === dashboardPeriod.currentRunId) ?? null,
    [dashboardPeriod]
  );

  const periodPayrollCost = currentPeriodRun?.provisionalSubtotalTotal ?? null;

  const payrollOverviewStatus: {
    statusType: ActivityStatusType;
    labelEs: string;
    labelEn: string;
  } = useMemo(() => {
    if (!dashboardPeriod || dashboardPeriod.status === 'DRAFT' || !currentPeriodRun) {
      return {
        statusType: 'draft',
        labelEs: 'Borrador',
        labelEn: 'Draft',
      };
    }
    if (currentPeriodRun.condition === 'APPROVED') {
      return {
        statusType: 'approved',
        labelEs: 'Aprobada',
        labelEn: 'Approved',
      };
    }
    if (currentPeriodRun.condition === 'READY_FOR_FINAL_REVIEW') {
      return {
        statusType: 'ready',
        labelEs: 'Lista para revisión',
        labelEn: 'Ready for review',
      };
    }
    if (currentPeriodRun.condition === 'INCOMPLETE_CHECKS') {
      return {
        statusType: 'alert',
        labelEs: 'Alerta IR-3',
        labelEn: 'Alert',
      };
    }
    return {
      statusType: 'pending',
      labelEs: 'Pendiente TSS/ISR',
      labelEn: 'Pending TSS/ISR',
    };
  }, [dashboardPeriod, currentPeriodRun]);

  const periodPayablesBalance = useMemo(
    () =>
      erpState.purchases.reduce(
        (acc, p) => acc + Math.max(0, p.totalAmount - p.paidAmount),
        0
      ),
    [erpState.purchases]
  );

  const chartSeries = useMemo(() => {
    const liveNov = erpState.sales
      .filter((s) => s.status === 'COMPLETED')
      .reduce((a, s) => a + s.total, 0);

    const rows = [
      { code: '2026-07', label: 'Jul', sales: 108900, payroll: 372000 },
      { code: '2026-08', label: 'Ago', sales: 119320, payroll: 418000 },
      { code: '2026-09', label: 'Sep', sales: 128450, payroll: 493500 },
      { code: '2026-10', label: 'Oct', sales: 142800, payroll: 491300 },
      { code: '2026-11', label: 'Nov', sales: Math.max(42197.7, liveNov), payroll: 486500 },
    ];
    const maxVal = Math.max(...rows.map((r) => Math.max(r.sales, r.payroll)), 1);
    return { rows, maxVal };
  }, [erpState.sales]);

  const incidences = useMemo<DashboardIncidence[]>(() => {
    const list: DashboardIncidence[] = [];
    const currentRun = dashboardPeriod?.runs.find(
      (r) => r.id === dashboardPeriod.currentRunId
    );
    if (currentRun) {
      currentRun.breakdowns
        .filter((b) => b.complianceFlag !== 'OK')
        .forEach((b) => {
          list.push({
            id: `inc-pay-${b.employeeId}`,
            periodCode,
            severity: b.complianceFlag === 'IR3_WARNING' ? 'HIGH' : 'MEDIUM',
            module: 'PAYROLL',
            titleEs: `${b.employeeName} (${b.employeeCode})`,
            titleEn: `${b.employeeName} (${b.employeeCode})`,
            detailEs:
              b.incidenceNoteEs ?? 'Observación detectada en corrida de nómina.',
            detailEn:
              b.incidenceNoteEn ?? 'Observation detected in payroll run.',
            targetScreen: 'payroll_review',
            employeeId: b.employeeId,
          });
        });
    }
    lowStockProducts.forEach((prod) => {
      list.push({
        id: `inc-inv-${prod.id}`,
        periodCode,
        severity: prod.stock <= 6 ? 'HIGH' : 'MEDIUM',
        module: 'INVENTORY',
        titleEs: `Stock bajo: ${prod.nameEs} (${prod.sku})`,
        titleEn: `Low stock: ${prod.nameEn} (${prod.sku})`,
        detailEs: `Existencia actual ${prod.stock} uds (mínimo requerido: ${prod.minStock}).`,
        detailEn: `Current stock ${prod.stock} units (minimum required: ${prod.minStock}).`,
        targetScreen: 'inventory_alerts',
      });
    });
    if (!openCashSession) {
      list.push({
        id: 'inc-cash-closed',
        periodCode,
        severity: 'MEDIUM',
        module: 'CASHBOX',
        titleEs: 'Caja registradora cerrada para el turno actual',
        titleEn: 'Cash register closed for current shift',
        detailEs:
          'Abre la caja para habilitar ventas en efectivo desde POS y registrar cobros.',
        detailEn:
          'Open the cash register to enable cash POS sales and collection tracking.',
        targetScreen: 'cashbox_shift',
      });
    }
    return list;
  }, [dashboardPeriod, periodCode, lowStockProducts, openCashSession]);

  return (
    <div className="space-y-6">
      {/* Header + Period Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
            {locale === 'es' ? 'Inicio · Panel Ejecutivo ERP' : 'Home · ERP Executive Overview'}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {erpState.company.name} · {activeBranch?.name ?? ''} ·{' '}
            {locale === 'es'
              ? 'Resumen en tiempo real de operación, caja, inventario y nómina.'
              : 'Real-time overview of sales, cashbox, inventory, and payroll.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            {locale === 'es' ? 'Período del panel:' : 'Dashboard period:'}
          </span>
          <div className="inline-flex flex-wrap items-center gap-1 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 p-1">
            {periods.map((p) => {
              const selected = p.id === dashboardPeriod?.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => selectPeriod(p.id, false)}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors whitespace-nowrap ${
                    selected
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {locale === 'es' ? p.nameEs : p.nameEn}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4 Live KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
        <div className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
          <div className="flex items-center justify-between gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>{locale === 'es' ? 'Ventas del período' : 'Period Sales'}</span>
            <StatusBadge
              activityStatus={periodSalesTotal > 0 ? 'active' : 'pending'}
              locale={locale}
              label={
                periodSalesTotal > 0
                  ? locale === 'es'
                    ? 'Activo'
                    : 'Active'
                  : locale === 'es'
                    ? 'Sin ventas'
                    : 'Pending'
              }
            />
          </div>
          <div className="mt-2">
            <MoneyCell amount={periodSalesTotal} locale={locale} size="lg" emphasize />
          </div>
          <div className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <ReceiptText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              {periodCode} · {erpState.sales.length}{' '}
              {locale === 'es' ? 'facturas registradas' : 'recorded sales'}
            </span>
          </div>
        </div>

        <div className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
          <div className="flex items-center justify-between gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>{locale === 'es' ? 'Nómina del período' : 'Period Payroll'}</span>
            <StatusBadge
              activityStatus={payrollOverviewStatus.statusType}
              locale={locale}
              label={
                locale === 'es'
                  ? payrollOverviewStatus.labelEs
                  : payrollOverviewStatus.labelEn
              }
            />
          </div>
          <div className="mt-2">
            <MoneyCell
              amount={periodPayrollCost}
              locale={locale}
              size="lg"
              pendingLabel={locale === 'es' ? 'En borrador (sin corrida)' : 'Draft (no run)'}
            />
          </div>
          <div className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Calculator className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              {dashboardPeriod
                ? locale === 'es'
                  ? dashboardPeriod.nameEs
                  : dashboardPeriod.nameEn
                : '—'}
            </span>
          </div>
        </div>

        <div className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
          <div className="flex items-center justify-between gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>{locale === 'es' ? 'Estado de Caja' : 'Cashbox Status'}</span>
            <StatusBadge
              activityStatus={openCashSession ? 'open' : 'pending'}
              locale={locale}
              label={
                openCashSession
                  ? locale === 'es'
                    ? 'Turno abierto'
                    : 'Open'
                  : locale === 'es'
                    ? 'Pendiente apertura'
                    : 'Pending'
              }
            />
          </div>
          <div className="mt-2">
            {openCashSession ? (
              <MoneyCell amount={openCashSession.expectedCash} locale={locale} size="lg" />
            ) : (
              <span className="font-display text-lg font-bold text-amber-700 dark:text-amber-300">
                {locale === 'es' ? 'Caja cerrada' : 'Register closed'}
              </span>
            )}
          </div>
          <div className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Landmark className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              {openCashSession
                ? `${locale === 'es' ? 'Turno abierto por' : 'Opened by'} ${openCashSession.cashierName}`
                : locale === 'es'
                  ? 'Requiere apertura para efectivo'
                  : 'Open register for cash sales'}
            </span>
          </div>
        </div>

        <div className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
          <div className="flex items-center justify-between gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>{locale === 'es' ? 'Alertas e Incidencias' : 'Alerts & Incidences'}</span>
            <StatusBadge
              activityStatus={
                incidences.some((i) => i.severity === 'HIGH')
                  ? 'alert'
                  : incidences.length > 0
                    ? 'warning'
                    : 'ok'
              }
              locale={locale}
              label={
                incidences.some((i) => i.severity === 'HIGH')
                  ? locale === 'es'
                    ? 'Alerta'
                    : 'Alert'
                  : incidences.length > 0
                    ? locale === 'es'
                      ? 'Revisar'
                      : 'Pending'
                    : locale === 'es'
                      ? 'Al día'
                      : 'Approved'
              }
            />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono-num text-xl font-bold text-slate-900 dark:text-slate-100">
              {incidences.length}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {locale === 'es' ? 'activas' : 'active'}
            </span>
          </div>
          <div className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>
              {lowStockProducts.length}{' '}
              {locale === 'es' ? 'productos en stock mínimo' : 'low-stock items'} ·{' '}
              {locale === 'es' ? 'CxP:' : 'AP:'} RD${periodPayablesBalance.toLocaleString('en-US')}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <section className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
          {locale === 'es' ? 'Accesos rápidos operativos' : 'Operational Quick Actions'}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {[
            {
              id: 'cashbox_shift' as const,
              icon: Landmark,
              label: locale === 'es' ? 'Abrir / Ver Caja' : 'Open / View Cashbox',
            },
            {
              id: 'pos' as const,
              icon: MonitorSmartphone,
              label: locale === 'es' ? 'Nueva venta POS' : 'New POS Sale',
            },
            {
              id: 'inventory_movements' as const,
              icon: Boxes,
              label: locale === 'es' ? 'Ajustar inventario' : 'Adjust Inventory',
            },
            {
              id: 'payroll_review' as const,
              icon: ClipboardCheck,
              label: locale === 'es' ? 'Revisar nómina' : 'Review Payroll',
            },
            {
              id: 'accounting_trial_balance' as const,
              icon: TrendingUp,
              label: locale === 'es' ? 'Balanza contable' : 'Trial Balance',
            },
            {
              id: 'branches' as const,
              icon: ArrowUpRight,
              label: locale === 'es' ? 'Sucursales' : 'Branches',
            },
          ].map((btn) => {
            const Icon = btn.icon;
            return (
              <button
                key={btn.id}
                type="button"
                onClick={() => setActiveScreen(btn.id)}
                className="flex items-center gap-2 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:border-emerald-300 dark:hover:border-emerald-700 px-3 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 transition-colors text-left"
              >
                <Icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="truncate">{btn.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Chart + Incidences Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Interactive Monthly Bar Chart */}
        <section className="lg:col-span-7 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 sm:p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-display text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                {locale === 'es'
                  ? 'Comparativo mensual: Ventas vs. Nómina'
                  : 'Monthly Comparison: Sales vs. Payroll'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {locale === 'es'
                  ? 'Haz clic en un mes para enfocar el panel en ese período.'
                  : 'Click a month to focus the dashboard on that period.'}
              </p>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-medium text-slate-600 dark:text-slate-300">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600" />
                {locale === 'es' ? 'Ventas' : 'Sales'}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-slate-700 dark:bg-slate-400" />
                {locale === 'es' ? 'Nómina' : 'Payroll'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-3 items-end h-52 pt-4 border-t border-slate-100 dark:border-slate-800">
            {chartSeries.rows.map((bar) => {
              const salesH = Math.max(8, Math.round((bar.sales / chartSeries.maxVal) * 140));
              const payH = Math.max(8, Math.round((bar.payroll / chartSeries.maxVal) * 140));
              const isSelected = bar.code === periodCode;
              const matchedPeriod = periods.find((p) => p.code === bar.code);
              return (
                <button
                  key={bar.code}
                  type="button"
                  onClick={() => {
                    if (matchedPeriod) selectPeriod(matchedPeriod.id, false);
                  }}
                  className={`flex flex-col items-center justify-end h-full rounded p-2 transition-colors ${
                    isSelected
                      ? 'bg-emerald-50/70 dark:bg-emerald-950/30 ring-1 ring-emerald-400/70'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-end gap-1.5 h-[148px]">
                    <div
                      style={{ height: `${salesH}px` }}
                      className="w-4 sm:w-5 rounded-t bg-emerald-600 transition-all"
                      title={`RD$${bar.sales.toLocaleString('en-US')}`}
                    />
                    <div
                      style={{ height: `${payH}px` }}
                      className="w-4 sm:w-5 rounded-t bg-slate-700 dark:bg-slate-400 transition-all"
                      title={`RD$${bar.payroll.toLocaleString('en-US')}`}
                    />
                  </div>
                  <div className="mt-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {bar.label}
                  </div>
                  <div className="font-mono-num text-[10px] text-slate-500 dark:text-slate-400">
                    {Math.round(bar.sales / 1000)}k
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Incidences Panel */}
        <section className="lg:col-span-5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
              {locale === 'es'
                ? 'Incidencias y alertas activas'
                : 'Active Incidences & Alerts'}
            </h2>
            <span className="font-mono-num text-xs font-semibold text-slate-500 dark:text-slate-400">
              {incidences.length}
            </span>
          </div>

          {incidences.length === 0 ? (
            <div className="rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-4 text-xs text-slate-500 dark:text-slate-400">
              {locale === 'es'
                ? 'Sin incidencias pendientes para este período.'
                : 'No pending incidences for this period.'}
            </div>
          ) : (
            <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
              {incidences.map((inc) => (
                <button
                  key={inc.id}
                  type="button"
                  onClick={() => setSelectedIncidence(inc)}
                  className="w-full text-left rounded border border-slate-200 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-600 bg-slate-50/70 dark:bg-slate-800/40 p-3 transition-colors space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {locale === 'es' ? inc.titleEs : inc.titleEn}
                    </span>
                    <StatusBadge
                      activityStatus={inc.severity === 'HIGH' ? 'alert' : 'warning'}
                      locale={locale}
                      label={inc.module}
                    />
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">
                    {locale === 'es' ? inc.detailEs : inc.detailEn}
                  </p>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Recent Activity Feed */}
      <RecentActivityFeed />

      {/* Incidence Detail Modal */}
      {selectedIncidence && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60">
          <div className="w-full max-w-md rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <StatusBadge
                  activityStatus={selectedIncidence.severity === 'HIGH' ? 'alert' : 'warning'}
                  locale={locale}
                  label={selectedIncidence.module}
                />
                <h3 className="mt-2 font-display text-base font-bold text-slate-900 dark:text-slate-100">
                  {locale === 'es' ? selectedIncidence.titleEs : selectedIncidence.titleEn}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedIncidence(null)}
                className="p-1 rounded text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {locale === 'es' ? selectedIncidence.detailEs : selectedIncidence.detailEn}
            </p>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedIncidence(null)}
                className="h-9 px-3.5 rounded border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200"
              >
                {locale === 'es' ? 'Cerrar' : 'Close'}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (selectedIncidence.employeeId) {
                    selectEmployee(selectedIncidence.employeeId);
                  }
                  setActiveScreen(selectedIncidence.targetScreen as never);
                  setSelectedIncidence(null);
                }}
                className="inline-flex items-center gap-1.5 h-9 px-4 rounded bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white"
              >
                <span>
                  {locale === 'es' ? 'Resolver en módulo' : 'Resolve in module'}
                </span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
