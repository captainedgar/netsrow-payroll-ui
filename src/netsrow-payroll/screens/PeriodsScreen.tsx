import React, { useMemo, useState } from 'react';
import { ArrowUpRight, CalendarCheck2, Layers } from 'lucide-react';
import { DataTable, DataTableColumn } from '../components/DataTable';
import { ErpPageHeader } from '../components/ErpUiPrimitives';
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
        <span className="text-xs italic text-[var(--nr-text-secondary)]">
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
            <div className="font-semibold text-[var(--nr-text)]">
              {locale === 'es' ? period.nameEs : period.nameEn}
            </div>
            <div className="font-mono-num text-[11px] text-[var(--nr-text-secondary)]">
              {period.code}
            </div>
          </div>
          {period.id === activePeriodId && (
            <span className="text-[11px] font-semibold text-[var(--nr-primary)]">
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
        <span className="font-mono-num text-xs text-[var(--nr-text-secondary)] whitespace-nowrap">
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
        <span className="font-mono-num text-xs font-semibold text-[var(--nr-text)]">
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
            className="nr-focus-ring nr-transition inline-flex items-center gap-1 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface)] px-2.5 py-1 text-xs font-medium text-[var(--nr-text)] hover:border-[var(--nr-primary)] hover:bg-[var(--nr-surface-muted)] whitespace-nowrap"
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
            className="nr-focus-ring nr-transition inline-flex items-center gap-1 rounded-lg border border-[var(--nr-success-border)] bg-[var(--nr-success-bg)] px-2.5 py-1 text-xs font-semibold text-[var(--nr-success)] hover:opacity-90 whitespace-nowrap"
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
      <ErpPageHeader
        title={t.periodsScreen.title}
        subtitle={t.periodsScreen.subtitle}
        actions={
          <div className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface)] px-3 py-1.5 text-xs font-medium text-[var(--nr-text-secondary)]">
            <CalendarCheck2 className="w-4 h-4 text-[var(--nr-primary)]" />
            <span>{t.periodsScreen.monthlyOnlyNote}</span>
          </div>
        }
      />

      <SummaryCardGrid
        items={summaryItems}
        locale={locale}
        pendingLabel={t.common.pending}
        columns={4}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex flex-wrap items-center gap-1 rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface-muted)] p-1">
          {(['ALL', 'DRAFT', 'IN_REVIEW', 'APPROVED'] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`nr-focus-ring nr-transition px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
                statusFilter === status
                  ? 'bg-[var(--nr-surface)] text-[var(--nr-text)] border border-[var(--nr-border)] shadow-xs'
                  : 'text-[var(--nr-text-secondary)] hover:text-[var(--nr-text)]'
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
                  <div className="font-semibold text-sm text-[var(--nr-text)]">
                    {locale === 'es' ? period.nameEs : period.nameEn}
                  </div>
                  <div className="font-mono-num text-[11px] text-[var(--nr-text-secondary)]">
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

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--nr-border)] text-xs">
                <div>
                  <div className="text-[11px] text-[var(--nr-text-secondary)]">
                    {t.periodsScreen.provisionalSubtotal}
                  </div>
                  <MoneyCell
                    amount={run?.provisionalSubtotalTotal ?? null}
                    locale={locale}
                    pendingLabel={t.common.pendingShort}
                  />
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-[var(--nr-text-secondary)]">
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

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-[var(--nr-border)]">
                <div>{getRunConditionCell(period)}</div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      selectPeriod(period.id, false);
                      setActiveScreen('novelties');
                    }}
                    className="nr-focus-ring nr-transition rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface)] px-2.5 py-1.5 text-xs font-semibold text-[var(--nr-text)] hover:border-[var(--nr-primary)]"
                  >
                    {t.periodsScreen.viewNovelties}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      selectPeriod(period.id, true);
                    }}
                    className="nr-focus-ring nr-transition inline-flex items-center gap-1 rounded-lg bg-[var(--nr-primary)] hover:bg-[var(--nr-primary-hover)] px-3 py-1.5 text-xs font-semibold text-[var(--nr-primary-fg)] whitespace-nowrap"
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
