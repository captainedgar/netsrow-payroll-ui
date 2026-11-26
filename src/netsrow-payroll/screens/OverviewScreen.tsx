import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowUpRight,
  Boxes,
  Calculator,
  ClipboardCheck,
  FileCheck2,
  Landmark,
  MonitorSmartphone,
  PackageCheck,
  ReceiptText,
  TrendingUp,
} from 'lucide-react';
import {
  ErpModal,
  ErpPageHeader,
  ErpStatePanel,
  ErpSurfaceCard,
} from '../components/ErpUiPrimitives';
import { MoneyCell } from '../components/MoneyCell';
import { RecentActivityFeed } from '../components/RecentActivityFeed';
import { StatusBadge } from '../components/StatusBadge';
import { usePayrollWorkspace } from '../context/PayrollWorkspaceContext';
import { ActivityStatusType, DashboardIncidence } from '../types/erp';

export const OverviewScreen: React.FC<{ live?: boolean }> = ({ live = false }) => {
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

  const activeProductsCount = useMemo(
    () => erpState.products.filter((p) => p.active).length,
    [erpState.products]
  );

  const periodSalesTotal = useMemo(() => {
    const livePeriodSales = erpState.sales
      .filter((s) => s.status === 'COMPLETED' && s.date.startsWith(periodCode))
      .reduce((acc, s) => acc + s.total, 0);
    if (live || livePeriodSales > 0) return livePeriodSales;
    const baseByMonth: Record<string, number> = {
      '2026-10': 142800,
      '2026-09': 128450,
      '2026-08': 119320,
      '2026-07': 108900,
    };
    return baseByMonth[periodCode] ?? 0;
  }, [erpState.sales, periodCode, live]);

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
    if (live) return { rows: [], maxVal: 1 };
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
  }, [erpState.sales, live]);

  // Compute genuine period-over-period delta ONLY when historical prior-month value exists
  const salesDeltaPct = useMemo(() => {
    const idx = chartSeries.rows.findIndex((r) => r.code === periodCode);
    if (idx <= 0) return null;
    const prev = chartSeries.rows[idx - 1]?.sales ?? 0;
    if (prev <= 0 || periodSalesTotal <= 0) return null;
    return Math.round(((periodSalesTotal - prev) / prev) * 1000) / 10;
  }, [chartSeries.rows, periodCode, periodSalesTotal]);

  const payrollDeltaPct = useMemo(() => {
    if (periodPayrollCost === null) return null;
    const idx = chartSeries.rows.findIndex((r) => r.code === periodCode);
    if (idx <= 0) return null;
    const prev = chartSeries.rows[idx - 1]?.payroll ?? 0;
    if (prev <= 0) return null;
    return Math.round(((periodPayrollCost - prev) / prev) * 1000) / 10;
  }, [chartSeries.rows, periodCode, periodPayrollCost]);

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
    if (!live && !openCashSession) {
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
  }, [dashboardPeriod, periodCode, lowStockProducts, openCashSession, live]);

  return (
    <div className="space-y-6">
      {/* Subtle Navy Gradient Executive Header */}
      <ErpPageHeader
        variant="hero"
        eyebrow={activeBranch ? `${erpState.company.name} · ${activeBranch.name}` : erpState.company.name}
        title={locale === 'es' ? 'Panel operativo del negocio' : 'Business Operations Overview'}
        subtitle={
          locale === 'es'
            ? 'Control diario de ventas, caja, inventario y cumplimiento de nómina en tiempo real.'
            : 'Daily control across sales, cash register, inventory, and payroll compliance.'
        }
        actions={
          <button
            type="button"
            onClick={() => setActiveScreen('pos')}
            className="nr-focus-ring nr-transition inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-[#047857] hover:bg-[#065F46] text-xs sm:text-sm font-semibold text-white whitespace-nowrap"
          >
            <MonitorSmartphone className="w-4 h-4 shrink-0" />
            <span>{locale === 'es' ? 'Nueva venta POS' : 'New POS Sale'}</span>
          </button>
        }
      />

      {/* Period Selector Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-[var(--nr-text-secondary)]">
          <span className="font-semibold text-[var(--nr-text)]">
            {locale === 'es' ? 'Período activo:' : 'Active period:'}
          </span>
          <span className="font-mono-num">
            {dashboardPeriod ? (locale === 'es' ? dashboardPeriod.nameEs : dashboardPeriod.nameEn) : '—'}
          </span>
        </div>

        <div
          role="group"
          aria-label={locale === 'es' ? 'Seleccionar período del panel' : 'Select dashboard period'}
          className="inline-flex flex-wrap items-center gap-1 rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface)] p-1"
        >
          {periods.map((p) => {
            const selected = p.id === dashboardPeriod?.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => selectPeriod(p.id, false)}
                className={`nr-focus-ring nr-transition px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
                  selected
                    ? 'bg-[var(--nr-primary)] text-[var(--nr-primary-fg)]'
                    : 'text-[var(--nr-text-secondary)] hover:text-[var(--nr-text)] hover:bg-[var(--nr-surface-muted)]'
                }`}
              >
                {locale === 'es' ? p.nameEs : p.nameEn}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4 Prioritized KPI Cards: Ventas, Caja, Inventario/Alertas, Nómina */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 sm:gap-4">
        {/* 1. Ventas del período */}
        <ErpSurfaceCard className="flex flex-col justify-between gap-2 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-1.5">
            <span className="text-xs font-semibold text-[var(--nr-text-secondary)] leading-tight">
              {locale === 'es' ? 'Ventas del período' : 'Period Sales'}
            </span>
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
          <div className="min-w-0 flex flex-wrap items-baseline justify-between gap-2">
            <MoneyCell amount={periodSalesTotal} locale={locale} size="lg" emphasize />
            {salesDeltaPct !== null && (
              <span
                data-tabular="true"
                className={`font-mono-num text-[11px] font-semibold ${
                  salesDeltaPct >= 0 ? 'text-[var(--nr-success)]' : 'text-[var(--nr-warning)]'
                }`}
              >
                {salesDeltaPct >= 0 ? `+${salesDeltaPct}%` : `${salesDeltaPct}%`}
              </span>
            )}
          </div>
          <div className="text-[11px] text-[var(--nr-text-secondary)] flex items-center gap-1.5 pt-1 border-t border-[var(--nr-border)]">
            <ReceiptText className="w-3.5 h-3.5 text-[var(--nr-primary)] shrink-0" />
            <span className="truncate">
              {periodCode} · {erpState.sales.length}{' '}
              {locale === 'es' ? 'ventas' : 'sales'} ·{' '}
              {erpState.eInvoicing.invoices.length} e-CF
            </span>
          </div>
        </ErpSurfaceCard>

        {/* 2. Estado de Caja */}
        <ErpSurfaceCard className="flex flex-col justify-between gap-2 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-1.5">
            <span className="text-xs font-semibold text-[var(--nr-text-secondary)] leading-tight">
              {locale === 'es' ? 'Estado de Caja' : 'Cashbox Status'}
            </span>
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
          <div className="min-w-0">
            {openCashSession ? (
              <MoneyCell amount={openCashSession.expectedCash} locale={locale} size="lg" />
            ) : (
              <span className="font-display text-lg font-bold text-[var(--nr-warning)]">
                {locale === 'es' ? 'Caja cerrada' : 'Register closed'}
              </span>
            )}
          </div>
          <div className="text-[11px] text-[var(--nr-text-secondary)] flex items-center gap-1.5 pt-1 border-t border-[var(--nr-border)]">
            <Landmark className="w-3.5 h-3.5 text-[var(--nr-primary)] shrink-0" />
            <span className="truncate">
              {openCashSession
                ? `${locale === 'es' ? 'Turno de' : 'Opened by'} ${openCashSession.cashierName}`
                : locale === 'es'
                  ? 'Requiere apertura para efectivo'
                  : 'Open register for cash sales'}
            </span>
          </div>
        </ErpSurfaceCard>

        {/* 3. Inventario y Alertas */}
        <ErpSurfaceCard className="flex flex-col justify-between gap-2 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-1.5">
            <span className="text-xs font-semibold text-[var(--nr-text-secondary)] leading-tight">
              {locale === 'es' ? 'Inventario y Alertas' : 'Inventory & Alerts'}
            </span>
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
                      : 'Review'
                    : locale === 'es'
                      ? 'Al día'
                      : 'Clear'
              }
            />
          </div>
          <div className="flex flex-wrap items-baseline gap-2 min-w-0">
            <span
              data-tabular="true"
              className="font-mono-num text-lg sm:text-xl font-bold text-[var(--nr-text)]"
            >
              {lowStockProducts.length}
            </span>
            <span className="text-xs text-[var(--nr-text-secondary)] truncate">
              {locale === 'es'
                ? `en mínimo / ${activeProductsCount} activos`
                : `low stock / ${activeProductsCount} active`}
            </span>
          </div>
          <div className="text-[11px] text-[var(--nr-text-secondary)] flex items-center gap-1.5 pt-1 border-t border-[var(--nr-border)]">
            <PackageCheck className="w-3.5 h-3.5 text-[var(--nr-warning)] shrink-0" />
            <span className="truncate">
              {incidences.length}{' '}
              {locale === 'es' ? 'incidencias' : 'incidences'} ·{' '}
              {locale === 'es' ? 'CxP:' : 'AP:'}{' '}
              <span data-tabular="true" className="font-mono-num">
                RD${periodPayablesBalance.toLocaleString('en-US')}
              </span>
            </span>
          </div>
        </ErpSurfaceCard>

        {/* 4. Nómina del período */}
        <ErpSurfaceCard className="flex flex-col justify-between gap-2 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-1.5">
            <span className="text-xs font-semibold text-[var(--nr-text-secondary)] leading-tight">
              {locale === 'es' ? 'Nómina del período' : 'Period Payroll'}
            </span>
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
          <div className="min-w-0 flex flex-wrap items-baseline justify-between gap-2">
            <MoneyCell
              amount={periodPayrollCost}
              locale={locale}
              size="lg"
              pendingLabel={locale === 'es' ? 'En borrador (sin corrida)' : 'Draft (no run)'}
            />
            {payrollDeltaPct !== null && (
              <span
                data-tabular="true"
                className="font-mono-num text-[11px] font-semibold text-[var(--nr-text-secondary)]"
              >
                {payrollDeltaPct >= 0 ? `+${payrollDeltaPct}%` : `${payrollDeltaPct}%`}
              </span>
            )}
          </div>
          <div className="text-[11px] text-[var(--nr-text-secondary)] flex items-center gap-1.5 pt-1 border-t border-[var(--nr-border)]">
            <Calculator className="w-3.5 h-3.5 text-[var(--nr-primary)] shrink-0" />
            <span className="truncate">
              {dashboardPeriod
                ? locale === 'es'
                  ? dashboardPeriod.nameEs
                  : dashboardPeriod.nameEn
                : '—'}
            </span>
          </div>
        </ErpSurfaceCard>
      </div>

      {/* Quick Actions */}
      <ErpSurfaceCard padding="sm">
        <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--nr-text-secondary)] mb-3">
          {locale === 'es' ? 'Accesos rápidos operativos' : 'Operational Quick Actions'}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {[
            {
              id: 'pos' as const,
              icon: MonitorSmartphone,
              label: locale === 'es' ? 'Abrir POS' : 'Open POS',
            },
            {
              id: 'e_invoicing_docs' as const,
              icon: FileCheck2,
              label: locale === 'es' ? 'Facturación e-CF' : 'e-CF Invoicing',
            },
            {
              id: 'cashbox_shift' as const,
              icon: Landmark,
              label: locale === 'es' ? 'Abrir / Ver Caja' : 'Open / View Cashbox',
            },
            {
              id: 'inventory_movements' as const,
              icon: Boxes,
              label: locale === 'es' ? 'Ajustar inventario' : 'Adjust Inventory',
            },
            {
              id: 'sales_ar' as const,
              icon: ReceiptText,
              label: locale === 'es' ? 'Ventas y CxC' : 'Sales & AR',
            },
            {
              id: 'accounting_trial_balance' as const,
              icon: TrendingUp,
              label: locale === 'es' ? 'Balanza contable' : 'Trial Balance',
            },
            {
              id: 'payroll_review' as const,
              icon: ClipboardCheck,
              label: locale === 'es' ? 'Revisar nómina' : 'Review Payroll',
            },
          ].map((btn) => {
            const Icon = btn.icon;
            return (
              <button
                key={btn.id}
                type="button"
                onClick={() => setActiveScreen(btn.id)}
                className="nr-focus-ring nr-transition flex items-center gap-2 rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] hover:bg-[var(--nr-success-bg)] hover:border-[var(--nr-success-border)] px-3 py-2.5 text-xs font-semibold text-[var(--nr-text)] text-left"
              >
                <Icon className="w-4 h-4 text-[var(--nr-primary)] shrink-0" />
                <span className="truncate">{btn.label}</span>
              </button>
            );
          })}
        </div>
      </ErpSurfaceCard>

      {/* Chart + Incidences Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Interactive Monthly Bar Chart */}
        <ErpSurfaceCard className="lg:col-span-7 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-display text-[17px] sm:text-lg font-bold text-[var(--nr-text)]">
                {locale === 'es'
                  ? 'Comparativo mensual: Ventas vs. Nómina'
                  : 'Monthly Comparison: Sales vs. Payroll'}
              </h2>
              <p className="text-xs text-[var(--nr-text-secondary)]">
                {locale === 'es'
                  ? 'Haz clic en un mes para enfocar el panel en ese período.'
                  : 'Click a month to focus the dashboard on that period.'}
              </p>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-medium text-[var(--nr-text-secondary)]">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-[var(--nr-primary)]" />
                {locale === 'es' ? 'Ventas' : 'Sales'}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#132B42] dark:bg-slate-400" />
                {locale === 'es' ? 'Nómina' : 'Payroll'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-2 sm:gap-3 items-end h-52 pt-4 border-t border-[var(--nr-border)]">
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
                  className={`nr-focus-ring nr-transition flex flex-col items-center justify-end h-full rounded-xl p-2 ${
                    isSelected
                      ? 'bg-[var(--nr-success-bg)] ring-1 ring-[var(--nr-primary)]'
                      : 'hover:bg-[var(--nr-surface-muted)]'
                  }`}
                >
                  <div className="flex items-end gap-1.5 h-[148px]">
                    <div
                      style={{ height: `${salesH}px` }}
                      className="w-4 sm:w-5 rounded-t bg-[var(--nr-primary)] transition-all"
                      title={`RD$${bar.sales.toLocaleString('en-US')}`}
                    />
                    <div
                      style={{ height: `${payH}px` }}
                      className="w-4 sm:w-5 rounded-t bg-[#132B42] dark:bg-slate-400 transition-all"
                      title={`RD$${bar.payroll.toLocaleString('en-US')}`}
                    />
                  </div>
                  <div className="mt-2 text-xs font-semibold text-[var(--nr-text)]">
                    {bar.label}
                  </div>
                  <div
                    data-tabular="true"
                    className="font-mono-num text-[10px] text-[var(--nr-text-secondary)]"
                  >
                    {Math.round(bar.sales / 1000)}k
                  </div>
                </button>
              );
            })}
          </div>
        </ErpSurfaceCard>

        {/* Incidences Panel */}
        <ErpSurfaceCard className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-[17px] sm:text-lg font-bold text-[var(--nr-text)]">
              {locale === 'es'
                ? 'Incidencias y alertas activas'
                : 'Active Incidences & Alerts'}
            </h2>
            <span
              data-tabular="true"
              className="font-mono-num text-xs font-semibold px-2 py-0.5 rounded-md bg-[var(--nr-surface-muted)] border border-[var(--nr-border)] text-[var(--nr-text-secondary)]"
            >
              {incidences.length}
            </span>
          </div>

          {incidences.length === 0 ? (
            <ErpStatePanel
              variant="success"
              title={
                locale === 'es'
                  ? 'Sin incidencias pendientes'
                  : 'No pending incidences'
              }
              description={
                locale === 'es'
                  ? 'Caja, inventario y nómina no presentan observaciones activas en este período.'
                  : 'Cashbox, inventory, and payroll have no active alerts for this period.'
              }
            />
          ) : (
            <div className="space-y-2 max-h-[252px] overflow-y-auto pr-1">
              {incidences.map((inc) => (
                <button
                  key={inc.id}
                  type="button"
                  onClick={() => setSelectedIncidence(inc)}
                  className="nr-focus-ring nr-transition w-full text-left rounded-xl border border-[var(--nr-border)] hover:border-[var(--nr-warning-border)] bg-[var(--nr-surface-elevated)] hover:bg-[var(--nr-surface-muted)] p-3 space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-[var(--nr-text)] truncate">
                      {locale === 'es' ? inc.titleEs : inc.titleEn}
                    </span>
                    <StatusBadge
                      activityStatus={inc.severity === 'HIGH' ? 'alert' : 'warning'}
                      locale={locale}
                      label={inc.module}
                    />
                  </div>
                  <p className="text-[11px] text-[var(--nr-text-secondary)] line-clamp-2">
                    {locale === 'es' ? inc.detailEs : inc.detailEn}
                  </p>
                </button>
              ))}
            </div>
          )}
        </ErpSurfaceCard>
      </div>

      {/* Recent Activity Feed */}
      <RecentActivityFeed />

      {/* Incidence Detail Modal (Escape & backdrop accessible) */}
      <ErpModal
        open={Boolean(selectedIncidence)}
        onClose={() => setSelectedIncidence(null)}
        title={
          selectedIncidence
            ? locale === 'es'
              ? selectedIncidence.titleEs
              : selectedIncidence.titleEn
            : ''
        }
        closeLabel={locale === 'es' ? 'Cerrar' : 'Close'}
        maxWidthClass="max-w-md"
        footer={
          selectedIncidence ? (
            <>
              <button
                type="button"
                onClick={() => setSelectedIncidence(null)}
                className="nr-focus-ring nr-transition h-9 px-3.5 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface)] text-xs font-semibold text-[var(--nr-text)] hover:bg-[var(--nr-surface-muted)]"
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
                className="nr-focus-ring nr-transition inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-[var(--nr-primary)] hover:bg-[var(--nr-primary-hover)] text-xs font-semibold text-[var(--nr-primary-fg)]"
              >
                <span>
                  {locale === 'es' ? 'Resolver en módulo' : 'Resolve in module'}
                </span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </>
          ) : undefined
        }
      >
        {selectedIncidence && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <StatusBadge
                activityStatus={selectedIncidence.severity === 'HIGH' ? 'alert' : 'warning'}
                locale={locale}
                label={selectedIncidence.module}
              />
              <span className="font-mono-num text-[11px] text-[var(--nr-text-secondary)]">
                {selectedIncidence.periodCode}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[var(--nr-text-secondary)] leading-relaxed">
              {locale === 'es' ? selectedIncidence.detailEs : selectedIncidence.detailEn}
            </p>
          </div>
        )}
      </ErpModal>
    </div>
  );
};
