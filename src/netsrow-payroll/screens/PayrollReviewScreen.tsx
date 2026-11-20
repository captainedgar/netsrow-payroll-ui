import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Calculator,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Clock,
  Eye,
  Filter,
  History,
  Lock,
  Play,
  RotateCcw,
  Search,
  Send,
  ShieldCheck,
  Undo2,
  Users,
} from 'lucide-react';
import { DataTable, DataTableColumn } from '../components/DataTable';
import { MoneyCell } from '../components/MoneyCell';
import { BadgeTone, StatusBadge } from '../components/StatusBadge';
import { usePayrollWorkspace } from '../context/PayrollWorkspaceContext';
import { formatDateLocalized } from '../i18n/translations';
import {
  EmployeeBreakdown,
  PayrollRun,
  ReviewTabId,
} from '../types/payroll';

export const PayrollReviewScreen: React.FC = () => {
  const {
    employees,
    activePeriod,
    activeRun,
    activePeriodNovelties,
    isViewingHistoricalRun,
    activeReviewTab,
    setActiveReviewTab,
    selectRun,
    activeEmployeeId,
    selectEmployee,
    canApproveCurrentRun,
    approvalDisabledReason,
    locale,
    theme,
    t,
    permissions,
    isLoading,
    isMutating,
    actionType,
    submitPeriodForReview,
    returnPeriodToDraft,
    runSimulation,
    runStatutoryCalculation,
    approvePayrollRun,
    setActiveScreen,
  } = usePayrollWorkspace();

  const [breakdownSearch, setBreakdownSearch] = useState('');
  const [onlyIncidences, setOnlyIncidences] = useState(false);

  const incidencesCount = useMemo(() => {
    if (!activeRun) return 0;
    return activeRun.breakdowns.filter((b) => b.complianceFlag !== 'OK').length;
  }, [activeRun]);

  const filteredBreakdowns = useMemo(() => {
    if (!activeRun) return [];
    const q = breakdownSearch.trim().toLowerCase();
    return activeRun.breakdowns.filter((b) => {
      if (onlyIncidences && b.complianceFlag === 'OK') {
        return false;
      }
      if (!q) return true;
      return (
        b.employeeCode.toLowerCase().includes(q) ||
        b.employeeName.toLowerCase().includes(q)
      );
    });
  }, [activeRun, breakdownSearch, onlyIncidences]);

  const activeEmployeesCount = useMemo(
    () => employees.filter((e) => e.status === 'ACTIVE').length,
    [employees]
  );
  const nonActiveEmployeesCount = Math.max(0, employees.length - activeEmployeesCount);

  const workflowStepIndex = useMemo(() => {
    if (!activePeriod) return 0;
    if (activePeriod.status === 'DRAFT') return 0;
    if (activePeriod.status === 'APPROVED') return 4;
    if (!activeRun) return 1;
    if (activeRun.phase === 'SIMULATED') return 2;
    if (activeRun.phase === 'STATUTORY_REVIEW') return 3;
    return 1;
  }, [activePeriod, activeRun]);

  const steps = [
    t.reviewScreen.stepDraft,
    t.reviewScreen.stepInReview,
    t.reviewScreen.stepSimulation,
    t.reviewScreen.stepStatutory,
    t.reviewScreen.stepApprove,
  ];

  const renderConditionBadge = (run: PayrollRun) => {
    const tone: BadgeTone =
      run.condition === 'APPROVED' ||
      run.condition === 'READY_FOR_FINAL_REVIEW'
        ? 'emerald'
        : run.condition === 'INCOMPLETE_CHECKS'
          ? 'crimson'
          : 'amber';
    const icon =
      run.condition === 'APPROVED'
        ? 'approved'
        : run.condition === 'READY_FOR_FINAL_REVIEW'
          ? 'ready'
          : run.condition === 'INCOMPLETE_CHECKS'
            ? 'warning'
            : 'review';
    return (
      <StatusBadge
        label={t.runConditions[run.condition]}
        tone={tone}
        icon={icon}
      />
    );
  };

  const getInitials = (name: string) =>
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? '')
      .join('');

  const breakdownColumns: DataTableColumn<EmployeeBreakdown>[] = [
    {
      key: 'emp',
      header: t.reviewScreen.colEmployee,
      stickyLeft: true,
      minWidthClass: 'min-w-[260px]',
      render: (row) => {
        const hasIncidence = row.complianceFlag !== 'OK';
        const noteText =
          locale === 'es' ? row.incidenceNoteEs : row.incidenceNoteEn;
        return (
          <div className="space-y-1.5">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                {getInitials(row.employeeName)}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {row.employeeName}
                  </span>
                  <span className="font-mono-num text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                    {row.employeeCode}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {locale === 'es'
                    ? `${row.positionEs} · ${row.departmentEs}`
                    : `${row.positionEn} · ${row.departmentEn}`}
                </div>
              </div>
            </div>

            {hasIncidence && noteText && (
              <div className="flex items-start justify-between gap-2 rounded border border-amber-200 dark:border-amber-800/70 bg-amber-50/80 dark:bg-amber-950/35 px-2 py-1 text-[11px] text-amber-900 dark:text-amber-200">
                <div className="flex items-start gap-1.5 min-w-0">
                  <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
                  <span className="leading-snug">{noteText}</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    selectEmployee(row.employeeId);
                    setActiveScreen('employees');
                  }}
                  className="inline-flex items-center gap-0.5 font-semibold text-emerald-700 dark:text-emerald-400 hover:underline shrink-0 whitespace-nowrap"
                >
                  <span>{t.reviewScreen.viewHistoryLink}</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'baseCalc',
      header: t.reviewScreen.colBaseCalc,
      align: 'right',
      render: (row) => (
        <div className="inline-flex flex-col items-end">
          <MoneyCell amount={row.calculatedBaseSalary} locale={locale} />
          {row.salaryTranches.length > 1 && (
            <span className="text-[10px] font-medium text-emerald-700 dark:text-emerald-400">
              {row.salaryTranches.length} {locale === 'es' ? 'tramos' : 'tranches'}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'extraEarnings',
      header: t.reviewScreen.colExtraEarnings,
      align: 'right',
      render: (row) => (
        <span
          className={
            row.earningsNovelties > 0
              ? 'text-emerald-700 dark:text-emerald-400 font-semibold'
              : ''
          }
        >
          {row.earningsNovelties > 0 ? '+' : ''}
          <MoneyCell
            amount={row.earningsNovelties}
            locale={locale}
            className={
              row.earningsNovelties > 0
                ? '!text-emerald-700 dark:!text-emerald-400'
                : ''
            }
          />
        </span>
      ),
    },
    {
      key: 'regDeductions',
      header: t.reviewScreen.colRegDeductions,
      align: 'right',
      render: (row) => (
        <span
          className={
            row.deductionsNovelties > 0
              ? 'text-red-600 dark:text-red-400 font-semibold'
              : ''
          }
        >
          {row.deductionsNovelties > 0 ? '-' : ''}
          <MoneyCell
            amount={row.deductionsNovelties}
            locale={locale}
            className={
              row.deductionsNovelties > 0
                ? '!text-red-600 dark:!text-red-400'
                : ''
            }
          />
        </span>
      ),
    },
    {
      key: 'provisional',
      header: t.reviewScreen.colProvisional,
      align: 'right',
      render: (row) => (
        <MoneyCell
          amount={row.provisionalSubtotal}
          locale={locale}
          pendingLabel={t.common.pendingShort}
        />
      ),
    },
    {
      key: 'workerDeductions',
      header: t.reviewScreen.colWorkerDed,
      align: 'right',
      render: (row) => (
        <MoneyCell
          amount={row.workerDeductionsTotal}
          locale={locale}
          pendingLabel={t.common.pendingShort}
        />
      ),
    },
    {
      key: 'employerContrib',
      header: t.reviewScreen.colEmployerContrib,
      align: 'right',
      render: (row) => (
        <MoneyCell
          amount={row.employerContributionsTotal}
          locale={locale}
          pendingLabel={t.common.pendingShort}
        />
      ),
    },
    {
      key: 'net',
      header: t.reviewScreen.colNet,
      align: 'right',
      render: (row) => (
        <MoneyCell
          amount={row.calculatedNet}
          locale={locale}
          pendingLabel={t.common.pendingShort}
          emphasize={row.calculatedNet !== null}
        />
      ),
    },
  ];

  const statutoryColumns: DataTableColumn<EmployeeBreakdown>[] = [
    {
      key: 'emp',
      header: t.reviewScreen.colEmployee,
      stickyLeft: true,
      minWidthClass: 'min-w-[190px]',
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-900 dark:text-slate-100">
            {row.employeeName}
          </div>
          <div className="font-mono-num text-[11px] text-slate-500 dark:text-slate-400">
            {row.employeeCode}
          </div>
        </div>
      ),
    },
    {
      key: 'sfsEmp',
      header: 'SFS (3.04%)',
      align: 'right',
      render: (row) => (
        <MoneyCell
          amount={row.sfsEmployee}
          locale={locale}
          pendingLabel={t.common.pendingShort}
          size="sm"
        />
      ),
    },
    {
      key: 'afpEmp',
      header: 'AFP (2.87%)',
      align: 'right',
      render: (row) => (
        <MoneyCell
          amount={row.afpEmployee}
          locale={locale}
          pendingLabel={t.common.pendingShort}
          size="sm"
        />
      ),
    },
    {
      key: 'isr',
      header: 'DGII ISR',
      align: 'right',
      render: (row) => (
        <div className="inline-flex flex-col items-end">
          <MoneyCell
            amount={row.isrWithheld}
            locale={locale}
            pendingLabel={t.common.pendingShort}
            size="sm"
          />
          {row.isrBracketCode && (
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              {row.isrBracketCode === 'EXEMPT'
                ? locale === 'es'
                  ? 'Exento'
                  : 'Exempt'
                : row.isrBracketCode}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'employerTotal',
      header: t.reviewScreen.colEmployerContrib,
      align: 'right',
      render: (row) => (
        <MoneyCell
          amount={row.employerContributionsTotal}
          locale={locale}
          pendingLabel={t.common.pendingShort}
          size="sm"
        />
      ),
    },
    {
      key: 'net',
      header: t.reviewScreen.colNet,
      align: 'right',
      render: (row) => (
        <MoneyCell
          amount={row.calculatedNet}
          locale={locale}
          pendingLabel={t.common.pendingShort}
          emphasize={row.calculatedNet !== null}
        />
      ),
    },
  ];

  if (!activePeriod && !isLoading) {
    return (
      <div className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-8 text-center space-y-3">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {t.topBar.noPeriodSelected}
        </p>
        <button
          type="button"
          onClick={() => setActiveScreen('periods')}
          className="h-9 px-4 rounded bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white"
        >
          {t.common.backToPeriods}
        </button>
      </div>
    );
  }

  const showSimulationSection =
    activeReviewTab === 'all' || activeReviewTab === 'simulation';
  const showStatutorySection =
    activeReviewTab === 'all' || activeReviewTab === 'statutory';
  const showBreakdownSection =
    activeReviewTab === 'all' || activeReviewTab === 'breakdown';
  const showHistorySection =
    activeReviewTab === 'all' || activeReviewTab === 'history';

  const periodName = activePeriod
    ? locale === 'es'
      ? activePeriod.nameEs
      : activePeriod.nameEn
    : '';

  return (
    <div className="space-y-5">
      {/* Stitch Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400"
      >
        <span>{t.reviewScreen.breadcrumbModule}</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <button
          type="button"
          onClick={() => setActiveScreen('periods')}
          className="hover:text-emerald-700 dark:hover:text-emerald-400 font-medium transition-colors"
        >
          {t.reviewScreen.breadcrumbPeriods}
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="font-medium text-slate-700 dark:text-slate-300">
          {t.reviewScreen.breadcrumbReview}
        </span>
        {activePeriod && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {periodName} · {t.reviewScreen.monthlyPeriodTag}
            </span>
          </>
        )}
      </nav>

      {/* Header + Status Badges + Stitch Action Toolbar */}
      <div className="space-y-3">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                {t.reviewScreen.titlePrefix} / {periodName}
              </h1>
              {activePeriod && (
                <StatusBadge
                  label={`${t.reviewScreen.statusLabel}: ${
                    t.statuses[activePeriod.status]
                  }`}
                  tone={
                    activePeriod.status === 'APPROVED'
                      ? 'emerald'
                      : activePeriod.status === 'IN_REVIEW'
                        ? 'amber'
                        : 'neutral'
                  }
                  icon={
                    activePeriod.status === 'APPROVED'
                      ? 'approved'
                      : activePeriod.status === 'IN_REVIEW'
                        ? 'review'
                        : 'draft'
                  }
                />
              )}
              {activeRun && (
                <StatusBadge
                  label={`${t.reviewScreen.runTypeLabel}: ${
                    t.runConditions[activeRun.condition]
                  } (#${activeRun.runNumber})`}
                  tone={
                    activeRun.condition === 'APPROVED' ||
                    activeRun.condition === 'READY_FOR_FINAL_REVIEW'
                      ? 'emerald'
                      : activeRun.condition === 'INCOMPLETE_CHECKS'
                        ? 'crimson'
                        : 'amber'
                  }
                  icon={
                    activeRun.condition === 'APPROVED'
                      ? 'approved'
                      : activeRun.condition === 'READY_FOR_FINAL_REVIEW'
                        ? 'ready'
                        : activeRun.condition === 'INCOMPLETE_CHECKS'
                          ? 'warning'
                          : 'review'
                  }
                />
              )}
            </div>
            {activePeriod && (
              <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                {periodName} · {t.reviewScreen.monthlyPeriodTag} (
                <span className="font-mono-num">
                  {formatDateLocalized(activePeriod.startDate, locale)} –{' '}
                  {formatDateLocalized(activePeriod.endDate, locale)}
                </span>
                )
              </p>
            )}
          </div>
        </div>

        {/* Action Toolbar matching Stitch */}
        {activePeriod && (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2.5">
            <div className="inline-flex items-center gap-2 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>
                {locale.toUpperCase()} ·{' '}
                {theme === 'light' ? t.topBar.themeLight : t.topBar.themeDark}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {activePeriod.status === 'DRAFT' && (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveScreen('novelties')}
                    className="inline-flex items-center gap-1.5 h-9 px-3 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors whitespace-nowrap"
                  >
                    <span>{t.periodsScreen.viewNovelties}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={isMutating || !permissions.canSubmitForReview}
                    onClick={() => submitPeriodForReview(activePeriod.id)}
                    className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-semibold text-white transition-colors whitespace-nowrap"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{t.reviewScreen.ctaSendToReview}</span>
                  </button>
                </>
              )}

              {activePeriod.status === 'IN_REVIEW' && !isViewingHistoricalRun && (
                <>
                  <button
                    type="button"
                    disabled={isMutating || !permissions.canEditNovelties}
                    onClick={() => returnPeriodToDraft(activePeriod.id)}
                    className="inline-flex items-center gap-1.5 h-9 px-3 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors whitespace-nowrap"
                  >
                    <Undo2 className="w-3.5 h-3.5" />
                    <span>{t.reviewScreen.ctaReturnToDraft}</span>
                  </button>

                  <button
                    type="button"
                    disabled={isMutating || !permissions.canRunSimulation}
                    onClick={() => runSimulation(activePeriod.id)}
                    className="inline-flex items-center gap-1.5 h-9 px-3 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-semibold text-slate-800 dark:text-slate-100 transition-colors whitespace-nowrap"
                  >
                    <Play className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>
                      {actionType === 'simulate'
                        ? t.reviewScreen.simulating
                        : t.reviewScreen.ctaSimulate}
                    </span>
                  </button>

                  <button
                    type="button"
                    disabled={
                      isMutating ||
                      !permissions.canRunStatutoryReview ||
                      !activeRun
                    }
                    onClick={() => runStatutoryCalculation(activePeriod.id)}
                    className={`inline-flex items-center gap-1.5 h-9 px-3.5 rounded text-xs font-semibold transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed ${
                      activeRun?.phase === 'SIMULATED'
                        ? 'bg-[#059669] hover:bg-emerald-700 text-white'
                        : 'border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100'
                    }`}
                  >
                    <Calculator className="w-3.5 h-3.5" />
                    <span>
                      {actionType === 'statutory'
                        ? t.reviewScreen.calculatingStatutory
                        : t.reviewScreen.ctaCalculateStatutory}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    disabled={isMutating || !canApproveCurrentRun}
                    title={approvalDisabledReason ?? undefined}
                    onClick={() => {
                      if (activeRun && canApproveCurrentRun) {
                        approvePayrollRun(activePeriod.id, activeRun.id);
                      }
                    }}
                    className="inline-flex items-center gap-1.5 h-9 px-4 rounded bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-500 dark:disabled:text-slate-400 disabled:cursor-not-allowed text-xs font-semibold text-white transition-colors whitespace-nowrap"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>
                      {actionType === 'approve'
                        ? t.reviewScreen.approving
                        : t.reviewScreen.ctaApprovePayroll}
                    </span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 5-Step Workflow Progress Strip */}
      <div className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
          {t.reviewScreen.workflowStepperTitle}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {steps.map((stepLabel, idx) => {
            const completed = idx < workflowStepIndex;
            const current = idx === workflowStepIndex;
            return (
              <div
                key={stepLabel}
                className={`rounded border px-2.5 py-2 text-xs font-semibold flex items-center gap-1.5 ${
                  completed
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800/70 dark:text-emerald-300'
                    : current
                      ? 'bg-slate-900 border-slate-900 text-white dark:bg-emerald-600 dark:border-emerald-500'
                      : 'bg-slate-50 border-slate-200 text-slate-500 dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-400'
                }`}
              >
                {completed ? (
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <Clock className="w-3.5 h-3.5 shrink-0 opacity-75" />
                )}
                <span className="truncate">{stepLabel}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Contextual State Banners */}
      {activePeriod?.status === 'APPROVED' && !isViewingHistoricalRun && (
        <div className="flex items-start gap-2.5 rounded-md border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/35 p-3 text-xs text-emerald-900 dark:text-emerald-200">
          <Lock className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            <div className="font-semibold">{t.reviewScreen.approvedBannerTitle}</div>
            <div className="mt-0.5 text-emerald-800 dark:text-emerald-300">
              {t.reviewScreen.approvedBannerDesc}
              {activeRun?.approvedAt && activeRun.approvedBy
                ? ` (${activeRun.approvedBy} · ${activeRun.approvedAt})`
                : ''}
            </div>
          </div>
        </div>
      )}

      {isViewingHistoricalRun && activePeriod?.currentRunId && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-md border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 p-3 text-xs text-amber-900 dark:text-amber-200">
          <div className="flex items-start gap-2.5">
            <History className="w-4 h-4 mt-0.5 shrink-0" />
            <div>
              <div className="font-semibold">
                {t.reviewScreen.historicalBannerTitle}
              </div>
              <div className="mt-0.5">{t.reviewScreen.historicalBannerDesc}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => selectRun(activePeriod.currentRunId)}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded border border-amber-400 dark:border-amber-600 bg-white dark:bg-slate-900 text-xs font-semibold text-amber-900 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/40 shrink-0 whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.reviewScreen.selectCurrentRunBtn}</span>
          </button>
        </div>
      )}

      {activePeriod?.status === 'IN_REVIEW' &&
        activeRun?.isCurrent &&
        activeRun.phase === 'STATUTORY_REVIEW' && (
          <div
            className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-md border p-3 text-xs ${
              activeRun.condition === 'READY_FOR_FINAL_REVIEW'
                ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200'
                : 'border-red-200 dark:border-red-800 bg-red-50/70 dark:bg-red-950/30 text-red-900 dark:text-red-200'
            }`}
          >
            <div className="flex items-center gap-2 font-semibold">
              {activeRun.condition === 'READY_FOR_FINAL_REVIEW' ? (
                <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
              )}
              <span>
                {activeRun.condition === 'READY_FOR_FINAL_REVIEW'
                  ? t.reviewScreen.readyConditionBanner
                  : t.reviewScreen.incompleteConditionBanner}
              </span>
            </div>
            {approvalDisabledReason && (
              <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{approvalDisabledReason}</span>
              </div>
            )}
          </div>
        )}

      {/* Stitch KPI Grid + 4 Financial Separation Metrics */}
      <div className="space-y-3">
        {/* Operational Overview + Provisional vs Net */}
        <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4 gap-3">
          {/* Empleados incluidos */}
          <div className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t.reviewScreen.kpiEmployeesIncluded}
              </span>
              <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            </div>
            <div className="mt-2 font-mono-num text-2xl font-bold text-slate-900 dark:text-slate-100">
              {activeRun?.employeeCount ?? activePeriod?.employeeCount ?? employees.length}
            </div>
            <div className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
              {t.common.employeesCount} · {activeEmployeesCount}{' '}
              {t.employeeStatuses.ACTIVE.toLowerCase()} / {nonActiveEmployeesCount}{' '}
              {t.employeeStatuses.LEAVE.toLowerCase()}
            </div>
          </div>

          {/* Incidencias / Cálculos */}
          <button
            type="button"
            onClick={() => {
              if (incidencesCount > 0) {
                setOnlyIncidences((prev) => !prev);
              }
            }}
            className={`text-left rounded-md border p-4 flex flex-col justify-between transition-colors ${
              incidencesCount > 0
                ? 'border-amber-300 dark:border-amber-700/80 bg-amber-50/40 dark:bg-amber-950/20 hover:bg-amber-50 dark:hover:bg-amber-950/35 cursor-pointer'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 cursor-default'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t.reviewScreen.kpiIncidences}
              </span>
              <AlertTriangle
                className={`w-4 h-4 shrink-0 ${
                  incidencesCount > 0
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-emerald-600 dark:text-emerald-400'
                }`}
              />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span
                className={`font-mono-num text-2xl font-bold ${
                  incidencesCount > 0
                    ? 'text-amber-700 dark:text-amber-300'
                    : 'text-slate-900 dark:text-slate-100'
                }`}
              >
                {incidencesCount}
              </span>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                {incidencesCount > 0
                  ? t.reviewScreen.kpiIncidencesDetected
                  : ''}
              </span>
            </div>
            <div className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
              {incidencesCount > 0
                ? onlyIncidences
                  ? `${t.reviewScreen.showOnlyIncidences} ✓`
                  : t.reviewScreen.showOnlyIncidences
                : t.reviewScreen.kpiIncidencesNone}
            </div>
          </button>

          {/* Subtotal provisional */}
          <div className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t.reviewScreen.kpiProvisionalSubtotal}
              </span>
              {activeRun?.phase === 'SIMULATED' && (
                <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/50 text-[10px] font-bold text-amber-800 dark:text-amber-300">
                  {t.reviewScreen.preLegalBadge}
                </span>
              )}
            </div>
            <div className="mt-2">
              <MoneyCell
                amount={activeRun?.provisionalSubtotalTotal ?? null}
                locale={locale}
                pendingLabel={t.common.pending}
                size="lg"
              />
            </div>
            {(!activeRun || activeRun.phase === 'SIMULATED') && (
              <div className="mt-2 inline-flex items-center gap-1 rounded border border-amber-200 dark:border-amber-800/60 bg-amber-50/70 dark:bg-amber-950/30 px-2 py-0.5 text-[10px] font-medium text-amber-800 dark:text-amber-300 w-fit">
                <Clock className="w-3 h-3 shrink-0" />
                <span>{t.reviewScreen.pendingTssIsrNote}</span>
              </div>
            )}
          </div>

          {/* Neto calculado */}
          <div
            className={`rounded-md border p-4 flex flex-col justify-between ${
              activeRun?.calculatedNetTotal !== null &&
              activeRun?.calculatedNetTotal !== undefined
                ? 'bg-emerald-50/70 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800/70'
                : 'bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-700'
            }`}
          >
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t.reviewScreen.kpiCalculatedNet}
            </div>
            <div className="mt-2">
              <MoneyCell
                amount={activeRun?.calculatedNetTotal ?? null}
                locale={locale}
                pendingLabel={t.common.pending}
                size="lg"
                emphasize={
                  activeRun?.calculatedNetTotal !== null &&
                  activeRun?.calculatedNetTotal !== undefined
                }
              />
            </div>
            <div className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
              {activeRun?.calculatedNetTotal === null ||
              activeRun?.calculatedNetTotal === undefined
                ? t.reviewScreen.pendingTssIsrNote
                : t.reviewScreen.kpiCalculatedNet}
            </div>
          </div>
        </div>

        {/* Separated Worker Deductions vs Employer Contributions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 flex items-center justify-between gap-3">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t.reviewScreen.kpiWorkerDeductions}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                SFS 3.04% + AFP 2.87% + DGII ISR
              </div>
            </div>
            <MoneyCell
              amount={activeRun?.workerDeductionsTotal ?? null}
              locale={locale}
              pendingLabel={t.common.pending}
              size="lg"
            />
          </div>

          <div className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 flex items-center justify-between gap-3">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t.reviewScreen.kpiEmployerContributions}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                SFS 7.09% + AFP 7.10% + SRL 1.10% + INFOTEP 1.00%
              </div>
            </div>
            <MoneyCell
              amount={activeRun?.employerContributionsTotal ?? null}
              locale={locale}
              pendingLabel={t.common.pending}
              size="lg"
            />
          </div>
        </div>
      </div>

      {/* Inline Compact HISTORIAL DE CORRIDAS Card matching Stitch screenshot */}
      {activePeriod && (
        <div className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3.5 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
              <History className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>{t.reviewScreen.historyTitle}</span>
            </div>
            <span className="font-mono-num text-[11px] text-slate-500 dark:text-slate-400">
              {activePeriod.runs.length}
            </span>
          </div>

          {activePeriod.runs.length === 0 ? (
            <div className="text-xs text-slate-500 dark:text-slate-400 py-1">
              {t.reviewScreen.historyEmpty}
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {activePeriod.runs.map((run) => {
                const isSelected = activeRun?.id === run.id;
                return (
                  <button
                    key={run.id}
                    type="button"
                    onClick={() => selectRun(run.id)}
                    className={`w-full flex flex-wrap items-center justify-between gap-2 py-2 px-2 rounded text-left transition-colors ${
                      isSelected
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/35'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          run.isCurrent
                            ? 'bg-emerald-500'
                            : 'bg-slate-400 dark:bg-slate-600'
                        }`}
                      />
                      <span className="font-mono-num font-bold text-slate-900 dark:text-slate-100">
                        {t.reviewScreen.runLabel} #{run.runNumber}
                      </span>
                      <span className="font-mono-num text-[11px] text-slate-500 dark:text-slate-400">
                        {run.executedAt}
                      </span>
                      <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                        · {t.runPhases[run.phase]}
                      </span>
                      <StatusBadge
                        label={
                          run.isCurrent
                            ? t.common.activeRun
                            : t.common.historicalRun
                        }
                        tone={run.isCurrent ? 'emerald' : 'neutral'}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      {renderConditionBadge(run)}
                      <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                        {isSelected
                          ? t.reviewScreen.currentlyViewing
                          : t.reviewScreen.inspectRun}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Section Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-1">
          {(
            [
              { id: 'all', label: t.reviewScreen.tabs.all },
              { id: 'simulation', label: t.reviewScreen.tabs.simulation },
              { id: 'statutory', label: t.reviewScreen.tabs.statutory },
              { id: 'breakdown', label: t.reviewScreen.tabs.breakdown },
              { id: 'history', label: t.reviewScreen.tabs.history },
            ] as { id: ReviewTabId; label: string }[]
          ).map((tabItem) => {
            const active = activeReviewTab === tabItem.id;
            return (
              <button
                key={tabItem.id}
                type="button"
                onClick={() => setActiveReviewTab(tabItem.id)}
                className={`px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  active
                    ? 'border-emerald-600 text-emerald-700 dark:border-emerald-400 dark:text-emerald-300'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {tabItem.label}
              </button>
            );
          })}
        </div>

        {activeRun && (
          <div className="pb-2 flex items-center gap-2">
            <span className="font-mono-num text-xs text-slate-500 dark:text-slate-400">
              {t.reviewScreen.runLabel} #{activeRun.runNumber}
            </span>
            {renderConditionBadge(activeRun)}
          </div>
        )}
      </div>

      {/* Empty State when no run exists yet */}
      {!activeRun && (
        <div className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-8 text-center space-y-3">
          <ClipboardCheck className="w-8 h-8 mx-auto text-slate-400" />
          <div className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
            {t.reviewScreen.noRunYetTitle}
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            {t.reviewScreen.noRunYetDesc}
          </p>
        </div>
      )}

      {/* SECTION 1: Simulación */}
      {activeRun && showSimulationSection && (
        <section className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 sm:p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="font-display text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                {t.reviewScreen.simulationSummaryTitle}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {t.reviewScreen.simulationSummaryDesc}
              </p>
            </div>
            <StatusBadge
              label={`${t.reviewScreen.runLabel} #${activeRun.runNumber} · ${
                t.runPhases[activeRun.phase]
              }`}
              tone={activeRun.phase === 'STATUTORY_REVIEW' ? 'emerald' : 'amber'}
              icon={activeRun.phase === 'STATUTORY_REVIEW' ? 'ready' : 'review'}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="rounded border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-3">
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                {t.reviewScreen.kpiEmployeesIncluded}
              </div>
              <div className="mt-1 font-mono-num text-sm font-bold text-slate-900 dark:text-slate-100">
                {activeRun.employeeCount}
              </div>
            </div>
            <div className="rounded border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-3">
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                {t.noveltiesScreen.recordsCount}
              </div>
              <div className="mt-1 font-mono-num text-sm font-bold text-slate-900 dark:text-slate-100">
                {activePeriodNovelties.length}
              </div>
            </div>
            <div className="rounded border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-3">
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                {t.reviewScreen.kpiProvisionalSubtotal}
              </div>
              <div className="mt-1">
                <MoneyCell
                  amount={activeRun.provisionalSubtotalTotal}
                  locale={locale}
                  pendingLabel={t.common.pending}
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SECTION 2: Revisión de TSS e ISR + Lista de verificación normativa */}
      {activeRun && showStatutorySection && (
        <section className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="font-display text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                {t.reviewScreen.statutorySummaryTitle}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {t.reviewScreen.statutorySummaryDesc}
              </p>
            </div>
            {renderConditionBadge(activeRun)}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Worker deductions */}
            <div className="rounded border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 p-3.5 space-y-2">
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {t.reviewScreen.workerDeductionsTitle}
              </div>
              <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400">
                  TSS (SFS 3.04% + AFP 2.87%)
                </span>
                <MoneyCell
                  amount={activeRun.tssEmployeeTotal}
                  locale={locale}
                  pendingLabel={t.common.pending}
                  size="sm"
                />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">DGII ISR</span>
                <MoneyCell
                  amount={activeRun.isrTotal}
                  locale={locale}
                  pendingLabel={t.common.pending}
                  size="sm"
                />
              </div>
              <div className="flex items-center justify-between text-xs font-semibold pt-2 border-t border-slate-200 dark:border-slate-700">
                <span>{t.reviewScreen.kpiWorkerDeductions}</span>
                <MoneyCell
                  amount={activeRun.workerDeductionsTotal}
                  locale={locale}
                  pendingLabel={t.common.pending}
                />
              </div>
            </div>

            {/* Employer contributions */}
            <div className="rounded border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 p-3.5 space-y-2">
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {t.reviewScreen.employerContributionsTitle}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-1.5 border-t border-slate-200 dark:border-slate-700">
                SFS (7.09%) · AFP (7.10%) · SRL (1.10%) · INFOTEP (1.00%)
              </div>
              <div className="flex items-center justify-between text-xs font-semibold pt-2 border-t border-slate-200 dark:border-slate-700">
                <span>{t.reviewScreen.kpiEmployerContributions}</span>
                <MoneyCell
                  amount={activeRun.employerContributionsTotal}
                  locale={locale}
                  pendingLabel={t.common.pending}
                />
              </div>
            </div>

            {/* Normative checklist */}
            <div className="rounded border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 p-3.5 space-y-2">
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {t.reviewScreen.statutoryChecksTitle}
              </div>
              <ul className="space-y-1.5 pt-1.5 border-t border-slate-200 dark:border-slate-700">
                {activeRun.statutoryChecks.map((chk) => (
                  <li key={chk.id} className="flex items-start gap-2 text-[11px]">
                    {chk.passed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 mt-0.5 text-amber-600 dark:text-amber-400 shrink-0" />
                    )}
                    <div>
                      <div className="font-medium text-slate-800 dark:text-slate-200">
                        {locale === 'es' ? chk.labelEs : chk.labelEn}
                      </div>
                      <div className="text-slate-500 dark:text-slate-400">
                        {locale === 'es' ? chk.detailEs : chk.detailEn}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {activeReviewTab === 'statutory' && (
            <DataTable
              columns={statutoryColumns}
              rows={activeRun.breakdowns}
              getRowKey={(r) => r.employeeId}
              selectedRowKey={activeEmployeeId}
              onRowClick={(r) => selectEmployee(r.employeeId)}
              emptyMessage={t.common.noResults}
              isLoading={isLoading}
            />
          )}
        </section>
      )}

      {/* SECTION 3: Desglose individual + Search + Mostrar solo incidencias */}
      {activeRun && showBreakdownSection && (
        <section className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="font-display text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
              {t.reviewScreen.breakdownSectionTitle}
            </h2>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="search"
                  value={breakdownSearch}
                  onChange={(e) => setBreakdownSearch(e.target.value)}
                  placeholder={t.reviewScreen.breakdownSearchPlaceholder}
                  className="w-full h-9 pl-9 pr-3 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="button"
                onClick={() => setOnlyIncidences((prev) => !prev)}
                className={`inline-flex items-center gap-1.5 h-9 px-3 rounded border text-xs font-semibold transition-colors whitespace-nowrap ${
                  onlyIncidences
                    ? 'bg-amber-100 border-amber-400 text-amber-950 dark:bg-amber-900/60 dark:border-amber-600 dark:text-amber-100'
                    : 'bg-amber-50/80 border-amber-200 text-amber-900 hover:bg-amber-100 dark:bg-amber-950/30 dark:border-amber-800/70 dark:text-amber-200'
                }`}
              >
                <Filter className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {t.reviewScreen.showOnlyIncidences} ({incidencesCount})
                </span>
              </button>
            </div>
          </div>

          <DataTable
            columns={breakdownColumns}
            rows={filteredBreakdowns}
            getRowKey={(r) => r.employeeId}
            selectedRowKey={activeEmployeeId}
            onRowClick={(r) => selectEmployee(r.employeeId)}
            emptyMessage={t.common.noResults}
            isLoading={isLoading}
            mobileCardRender={(row) => (
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-[11px] font-bold flex items-center justify-center shrink-0">
                      {getInitials(row.employeeName)}
                    </div>
                    <div>
                      <div className="font-mono-num text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                        {row.employeeCode}
                      </div>
                      <div className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                        {row.employeeName}
                      </div>
                    </div>
                  </div>
                  <MoneyCell
                    amount={row.calculatedNet}
                    locale={locale}
                    pendingLabel={t.common.pendingShort}
                    emphasize={row.calculatedNet !== null}
                  />
                </div>

                {row.complianceFlag !== 'OK' &&
                  (locale === 'es' ? row.incidenceNoteEs : row.incidenceNoteEn) && (
                    <div className="flex items-center justify-between gap-2 rounded border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1.5 text-[11px] text-amber-900 dark:text-amber-200">
                      <span>
                        {locale === 'es' ? row.incidenceNoteEs : row.incidenceNoteEn}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          selectEmployee(row.employeeId);
                          setActiveScreen('employees');
                        }}
                        className="font-semibold text-emerald-700 dark:text-emerald-400 shrink-0"
                      >
                        {t.reviewScreen.viewHistoryLink}
                      </button>
                    </div>
                  )}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                  <div>
                    <div className="text-slate-500 dark:text-slate-400">
                      {t.reviewScreen.colBaseCalc}
                    </div>
                    <MoneyCell
                      amount={row.calculatedBaseSalary}
                      locale={locale}
                      size="sm"
                    />
                  </div>
                  <div>
                    <div className="text-slate-500 dark:text-slate-400">
                      {t.reviewScreen.colProvisional}
                    </div>
                    <MoneyCell
                      amount={row.provisionalSubtotal}
                      locale={locale}
                      pendingLabel={t.common.pendingShort}
                      size="sm"
                    />
                  </div>
                  <div>
                    <div className="text-slate-500 dark:text-slate-400">
                      {t.reviewScreen.colWorkerDed}
                    </div>
                    <MoneyCell
                      amount={row.workerDeductionsTotal}
                      locale={locale}
                      pendingLabel={t.common.pendingShort}
                      size="sm"
                    />
                  </div>
                  <div className="text-right">
                    <div className="text-slate-500 dark:text-slate-400">
                      {t.reviewScreen.colEmployerContrib}
                    </div>
                    <MoneyCell
                      amount={row.employerContributionsTotal}
                      locale={locale}
                      pendingLabel={t.common.pendingShort}
                      size="sm"
                    />
                  </div>
                </div>
              </div>
            )}
          />
        </section>
      )}

      {/* SECTION 4: Detailed Historial de corridas (when tab === 'history' or 'all') */}
      {showHistorySection && activeReviewTab === 'history' && (
        <section className="space-y-3">
          <h2 className="font-display text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
            {t.reviewScreen.historyTitle}
          </h2>
          {!activePeriod || activePeriod.runs.length === 0 ? (
            <div className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 text-center text-xs text-slate-500 dark:text-slate-400">
              {t.reviewScreen.historyEmpty}
            </div>
          ) : (
            <div className="space-y-2.5">
              {activePeriod.runs.map((run) => {
                const isSelected = activeRun?.id === run.id;
                return (
                  <div
                    key={run.id}
                    className={`rounded-md border p-4 transition-colors ${
                      isSelected
                        ? 'bg-emerald-50/60 border-emerald-300 dark:bg-emerald-950/30 dark:border-emerald-700'
                        : 'bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-700'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono-num text-sm font-bold text-slate-900 dark:text-slate-100">
                            {t.reviewScreen.runLabel} #{run.runNumber} ·{' '}
                            {t.runPhases[run.phase]}
                          </span>
                          <StatusBadge
                            label={
                              run.isCurrent
                                ? t.common.activeRun
                                : t.common.historicalRun
                            }
                            tone={run.isCurrent ? 'navy' : 'neutral'}
                          />
                          {renderConditionBadge(run)}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                          {t.reviewScreen.executedBy}: {run.executedBy} ·{' '}
                          <span className="font-mono-num">{run.executedAt}</span>
                          {run.approvedAt && run.approvedBy
                            ? ` · ${t.reviewScreen.approvedBy}: ${run.approvedBy} (${run.approvedAt})`
                            : ''}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {locale === 'es' ? run.notesEs : run.notesEn}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            {t.reviewScreen.kpiCalculatedNet}
                          </div>
                          <MoneyCell
                            amount={run.calculatedNetTotal}
                            locale={locale}
                            pendingLabel={t.common.pendingShort}
                            emphasize={run.calculatedNetTotal !== null}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => selectRun(run.id)}
                          className={`inline-flex items-center gap-1.5 h-8 px-3 rounded text-xs font-semibold transition-colors whitespace-nowrap ${
                            isSelected
                              ? 'bg-emerald-600 text-white'
                              : 'border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
                          }`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>
                            {isSelected
                              ? t.reviewScreen.currentlyViewing
                              : t.reviewScreen.inspectRun}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* SECTION 5: Deferred Phase-2 Operations Notice */}
      <div className="rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              {t.reviewScreen.deferredOpsTitle}
            </div>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {t.reviewScreen.deferredOpsDesc}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium text-slate-500 dark:text-slate-400">
            <span className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
              {t.reviewScreen.deferredPayment}
            </span>
            <span className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
              {t.reviewScreen.deferredExports}
            </span>
            <span className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
              {t.reviewScreen.deferredAccounting}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
