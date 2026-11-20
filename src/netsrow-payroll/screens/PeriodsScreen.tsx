import React, { useMemo, useState } from 'react';
import { ArrowUpRight, CalendarCheck2, Layers } from 'lucide-react';
import { DataTable, DataTableColumn } from '../components/DataTable';
import { MoneyCell } from '../components/MoneyCell';
import { BadgeTone, StatusBadge } from '../components/StatusBadge';
import { SummaryCardGrid, SummaryCardItem } from '../components/SummaryCardGrid';
import { usePayrollWorkspace } from '../context/PayrollWorkspaceContext';
import { formatDateLocalized } from '../i18n/translations';
import { PayrollPeriod, PeriodStatus } from '../types/payroll';

export const PeriodsScreen: React.FC = () => {
  const {
    periods,
    novelties,
    activePeriodId,
    selectPeriod,
    setActiveScreen,
    locale,
    t,
    isLoading,
  } = usePayrollWorkspace();

  const [statusFilter, setStatusFilter] = useState<'ALL' | PeriodStatus>('ALL');

  const filteredPeriods = useMemo(() => {
    if (statusFilter === 'ALL') return periods;
    return periods.filter((p) => p.status === statusFilter);
  }, [periods, statusFilter]);

  const noveltyCountByPeriod = useMemo(() => {
    const map = new Map<string, number>();
    novelties.forEach((n) => {
      map.set(n.periodId, (map.get(n.periodId) ?? 0) + 1);
    });
    return map;
  }, [novelties]);

  const draftCount = periods.filter((p) => p.status === 'DRAFT').length;
  const inReviewCount = periods.filter((p) => p.status === 'IN_REVIEW').length;
  const approvedCount = periods.filter((p) => p.status === 'APPROVED').length;

  const summaryItems: SummaryCardItem[] = [
    {
      id: 'total-periods',
      label: t.periodsScreen.totalPeriods,
      valueText: String(periods.length),
    },
    {
      id: 'draft-periods',
      label: t.periodsScreen.draftPeriods,
      valueText: String(draftCount),
    },
    {
      id: 'review-periods',
      label: t.periodsScreen.inReviewPeriods,
      valueText: String(inReviewCount),
    },
    {
      id: 'approved-periods',
      label: t.periodsScreen.approvedPeriods,
      valueText: String(approvedCount),
      emphasize: approvedCount > 0,
    },
  ];

  const getStatusBadgeProps = (
    status: PeriodStatus
  ): { tone: BadgeTone; icon: 'draft' | 'review' | 'approved' } => {
    if (status === 'APPROVED') return { tone: 'emerald', icon: 'approved' };
    if (status === 'IN_REVIEW') return { tone: 'amber', icon: 'review' };
    return { tone: 'neutral', icon: 'draft' };
  };

  const getRunConditionCell = (period: PayrollPeriod) => {
    const currentRun = period.runs.find((r) => r.id === period.currentRunId) ?? null;
    if (!currentRun) {
      return (
        <span className="text-xs italic text-slate-400 dark:text-slate-500">
          {t.common.pending}
        </span>
      );
    }
    const tone: BadgeTone =
      currentRun.condition === 'APPROVED' ||
      currentRun.condition === 'READY_FOR_FINAL_REVIEW'
        ? 'emerald'
        : currentRun.condition === 'INCOMPLETE_CHECKS'
          ? 'crimson'
          : 'amber';
    const icon =
      currentRun.condition === 'APPROVED'
        ? 'approved'
        : currentRun.condition === 'READY_FOR_FINAL_REVIEW'
          ? 'ready'
          : currentRun.condition === 'INCOMPLETE_CHECKS'
            ? 'warning'
            : 'review';

    return (
      <StatusBadge
        label={t.runConditions[currentRun.condition]}
        tone={tone}
        icon={icon}
      />
    );
  };

  const columns: DataTableColumn<PayrollPeriod>[] = [
    {
      key: 'period',
      header: t.periodsScreen.periodColumn,
      stickyLeft: true,
      minWidthClass: 'min-w-[175px]',
      render: (period) => (
        <div className="flex items-center gap-2">
          <div>
            <div className="font-semibold text-slate-900 dark:text-slate-100">
              {locale === 'es' ? period.nameEs : period.nameEn}
            </div>
            <div className="font-mono-num text-[11px] text-slate-500 dark:text-slate-400">
              {period.code}
            </div>
          </div>
          {period.id === activePeriodId && (
            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
              · {t.periodsScreen.activeSelected}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'dates',
      header: t.periodsScreen.dateRangeColumn,
      minWidthClass: 'min-w-[180px]',
      render: (period) => (
        <span className="font-mono-num text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap">
          {formatDateLocalized(period.startDate, locale)} –{' '}
          {formatDateLocalized(period.endDate, locale)}
        </span>
      ),
    },
    {
      key: 'novelties',
      header: t.periodsScreen.noveltiesColumn,
      align: 'right',
      render: (period) => (
        <span className="font-mono-num text-xs font-semibold text-slate-700 dark:text-slate-300">
          {noveltyCountByPeriod.get(period.id) ?? 0}
        </span>
      ),
    },
    {
      key: 'status',
      header: t.common.status,
      render: (period) => {
        const badge = getStatusBadgeProps(period.status);
        return (
          <StatusBadge
            label={t.statuses[period.status]}
            tone={badge.tone}
            icon={badge.icon}
          />
        );
      },
    },
    {
      key: 'runCondition',
      header: t.periodsScreen.runStateColumn,
      render: (period) => getRunConditionCell(period),
    },
    {
      key: 'provisional',
      header: t.periodsScreen.provisionalSubtotal,
      align: 'right',
      render: (period) => {
        const run = period.runs.find((r) => r.id === period.currentRunId) ?? null;
        return (
          <MoneyCell
            amount={run?.provisionalSubtotalTotal ?? null}
            locale={locale}
            pendingLabel={t.common.pendingShort}
          />
        );
      },
    },
    {
      key: 'net',
      header: t.periodsScreen.calculatedNet,
      align: 'right',
      render: (period) => {
        const run = period.runs.find((r) => r.id === period.currentRunId) ?? null;
        return (
          <MoneyCell
            amount={run?.calculatedNetTotal ?? null}
            locale={locale}
            pendingLabel={t.common.pendingShort}
            emphasize={
              run?.calculatedNetTotal !== null &&
              run?.calculatedNetTotal !== undefined
            }
          />
        );
      },
    },
    {
      key: 'actions',
      header: t.common.actions,
      align: 'right',
      render: (period) => (
        <div className="inline-flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              selectPeriod(period.id, false);
              setActiveScreen('novelties');
            }}
            className="inline-flex items-center gap-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors whitespace-nowrap"
          >
            <Layers className="w-3 h-3" />
            <span>{t.periodsScreen.viewNovelties}</span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              selectPeriod(period.id, true);
            }}
            className="inline-flex items-center gap-1 rounded border border-emerald-600/30 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors whitespace-nowrap"
          >
            <span>{t.periodsScreen.openInReview}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
            {t.periodsScreen.title}
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
            {t.periodsScreen.subtitle}
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
          <CalendarCheck2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{t.periodsScreen.monthlyOnlyNote}</span>
        </div>
      </div>

      <SummaryCardGrid
        items={summaryItems}
        locale={locale}
        pendingLabel={t.common.pending}
        columns={4}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex flex-wrap items-center gap-1 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 p-1">
          {(['ALL', 'DRAFT', 'IN_REVIEW', 'APPROVED'] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors whitespace-nowrap ${
                statusFilter === status
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {status === 'ALL' ? t.common.all : t.statuses[status]}
            </button>
          ))}
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={filteredPeriods}
        getRowKey={(p) => p.id}
        selectedRowKey={activePeriodId}
        onRowClick={(p) => selectPeriod(p.id, true)}
        emptyMessage={t.common.noResults}
        isLoading={isLoading}
        mobileCardRender={(period) => {
          const run = period.runs.find((r) => r.id === period.currentRunId) ?? null;
          const badge = getStatusBadgeProps(period.status);
          return (
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                    {locale === 'es' ? period.nameEs : period.nameEn}
                  </div>
                  <div className="font-mono-num text-[11px] text-slate-500 dark:text-slate-400">
                    {formatDateLocalized(period.startDate, locale)} –{' '}
                    {formatDateLocalized(period.endDate, locale)}
                  </div>
                </div>
                <StatusBadge
                  label={t.statuses[period.status]}
                  tone={badge.tone}
                  icon={badge.icon}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {t.periodsScreen.provisionalSubtotal}
                  </div>
                  <MoneyCell
                    amount={run?.provisionalSubtotalTotal ?? null}
                    locale={locale}
                    pendingLabel={t.common.pendingShort}
                  />
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {t.periodsScreen.calculatedNet}
                  </div>
                  <MoneyCell
                    amount={run?.calculatedNetTotal ?? null}
                    locale={locale}
                    pendingLabel={t.common.pendingShort}
                    emphasize={
                      run?.calculatedNetTotal !== null &&
                      run?.calculatedNetTotal !== undefined
                    }
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>{getRunConditionCell(period)}</div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      selectPeriod(period.id, false);
                      setActiveScreen('novelties');
                    }}
                    className="rounded border border-slate-300 dark:border-slate-700 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200"
                  >
                    {t.periodsScreen.viewNovelties}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      selectPeriod(period.id, true);
                    }}
                    className="inline-flex items-center gap-1 rounded bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white whitespace-nowrap"
                  >
                    <span>{t.periodsScreen.openInReview}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        }}
      />
    </div>
  );
};
