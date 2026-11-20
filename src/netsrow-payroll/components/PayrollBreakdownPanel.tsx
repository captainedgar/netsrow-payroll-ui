import React, { useState } from 'react';
import {
  Clock,
  FileText,
  History,
  Info,
  Lock,
  Receipt,
  TrendingUp,
  X,
} from 'lucide-react';
import { usePayrollWorkspace } from '../context/PayrollWorkspaceContext';
import { formatDateLocalized } from '../i18n/translations';
import { MoneyCell } from './MoneyCell';
import { StatusBadge } from './StatusBadge';

type InspectorTab = 'payroll' | 'salary' | 'isr';

export const PayrollBreakdownPanel: React.FC = () => {
  const {
    activeEmployee,
    activePeriod,
    activeRun,
    activeBreakdown,
    activePeriodNovelties,
    locale,
    t,
    permissions,
    isMobileBreakdownOpen,
    setIsMobileBreakdownOpen,
  } = usePayrollWorkspace();

  const [tab, setTab] = useState<InspectorTab>('payroll');

  const employeePeriodNovelties = activeEmployee
    ? activePeriodNovelties.filter((n) => n.employeeId === activeEmployee.id)
    : [];

  const empInitials = activeEmployee
    ? activeEmployee.fullName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? '')
        .join('')
    : '';

  const runHeaderBadge = () => {
    if (!activeRun) {
      return (
        <StatusBadge
          label={t.common.pendingShort}
          tone="neutral"
          icon="draft"
        />
      );
    }
    if (activeRun.condition === 'APPROVED') {
      return (
        <StatusBadge
          label={`${t.statuses.APPROVED} · #${activeRun.runNumber}`}
          tone="emerald"
          icon="approved"
        />
      );
    }
    if (activeRun.condition === 'READY_FOR_FINAL_REVIEW') {
      return (
        <StatusBadge
          label={`${t.runConditions.READY_FOR_FINAL_REVIEW} · #${activeRun.runNumber}`}
          tone="emerald"
          icon="ready"
        />
      );
    }
    return (
      <StatusBadge
        label={`${t.runPhases[activeRun.phase]} #${activeRun.runNumber}`}
        tone="amber"
        icon="review"
      />
    );
  };

  const renderPayrollTab = () => {
    if (!activeEmployee) return null;

    const tranches = activeBreakdown?.salaryTranches ?? [
      {
        id: 'draft-tr',
        titleEs: 'Tramo completo (01 – 30 del mes)',
        titleEn: 'Full month tranche (01 – 30)',
        days: 30,
        registeredMonthlySalary: activeEmployee.baseMonthlySalary,
        computedAmount: activeEmployee.baseMonthlySalary,
      },
    ];

    const calculatedSalarySubtotal =
      activeBreakdown?.calculatedBaseSalary ?? activeEmployee.baseMonthlySalary;

    const hasComputedStatutory = Boolean(
      activeRun && activeRun.phase === 'STATUTORY_REVIEW' && activeBreakdown
    );

    const tssWorkerSum =
      hasComputedStatutory &&
      activeBreakdown?.sfsEmployee !== null &&
      activeBreakdown?.afpEmployee !== null
        ? (activeBreakdown?.sfsEmployee ?? 0) + (activeBreakdown?.afpEmployee ?? 0)
        : null;

    return (
      <div className="space-y-4">
        {/* 1. TRAMOS SALARIALES APLICADOS */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              {t.breakdownPanel.section1Title}
            </span>
            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
              {t.breakdownPanel.section1Badge}
            </span>
          </div>

          <div className="space-y-2">
            {tranches.map((tr) => {
              const hasBadge = Boolean(tr.badgeEs);
              return (
                <div
                  key={tr.id}
                  className={`rounded border p-2.5 text-xs space-y-1 ${
                    hasBadge
                      ? 'bg-emerald-50/70 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800/70'
                      : 'bg-slate-50/80 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <span>{locale === 'es' ? tr.titleEs : tr.titleEn}</span>
                      {hasBadge && (
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      )}
                    </span>
                    {hasBadge ? (
                      <StatusBadge
                        label={locale === 'es' ? tr.badgeEs! : tr.badgeEn!}
                        tone="emerald"
                      />
                    ) : (
                      <span className="font-mono-num text-[11px] text-slate-500 dark:text-slate-400">
                        {tr.days} {t.common.daysSuffix}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span>{t.breakdownPanel.registeredMonthlySalary}</span>
                    <MoneyCell
                      amount={tr.registeredMonthlySalary}
                      locale={locale}
                      size="sm"
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200">
                    <span>{t.breakdownPanel.trancheAmount}</span>
                    <MoneyCell amount={tr.computedAmount} locale={locale} size="sm" />
                  </div>
                </div>
              );
            })}

            <div className="flex items-center justify-between rounded border border-slate-200 dark:border-slate-700 bg-slate-100/80 dark:bg-slate-800/80 px-3 py-2 text-xs font-bold text-slate-900 dark:text-slate-100">
              <span>{t.breakdownPanel.subtotalCalculatedSalary}</span>
              <MoneyCell amount={calculatedSalarySubtotal} locale={locale} />
            </div>
          </div>
        </div>

        {/* 2. NOVEDADES DEL PERÍODO */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              {t.breakdownPanel.section2Title}
            </span>
            <span className="font-mono-num text-[11px] text-slate-500 dark:text-slate-400">
              {employeePeriodNovelties.length} {t.breakdownPanel.recordsSuffix}
            </span>
          </div>

          {employeePeriodNovelties.length === 0 ? (
            <div className="rounded border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/40 px-3 py-2.5 text-xs text-slate-500 dark:text-slate-400">
              {t.breakdownPanel.noNoveltiesForEmployee}
            </div>
          ) : (
            <div className="space-y-1.5">
              {employeePeriodNovelties.map((nov) => {
                const isEarning = nov.category === 'EARNING';
                return (
                  <div
                    key={nov.id}
                    className="flex items-center justify-between gap-2 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="font-medium text-slate-800 dark:text-slate-200 truncate">
                        {t.noveltyConcepts[nov.conceptCode]}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {locale === 'es' ? nov.noteEs : nov.noteEn}
                      </div>
                    </div>
                    <span
                      className={`font-mono-num font-semibold whitespace-nowrap shrink-0 ${
                        isEarning
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {isEarning ? '+' : '-'}
                      <MoneyCell
                        amount={nov.amount}
                        locale={locale}
                        size="sm"
                        className={
                          isEarning
                            ? '!text-emerald-700 dark:!text-emerald-400'
                            : '!text-red-600 dark:!text-red-400'
                        }
                      />
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 3. RETENCIONES FISCALES Y TSS (RD) */}
        <div className="space-y-2.5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            {t.breakdownPanel.section3Title}
          </div>

          {/* Subtotal provisional antes de retenciones */}
          <div className="rounded-md border border-emerald-200 dark:border-emerald-800/70 bg-emerald-50/70 dark:bg-emerald-950/30 p-3 space-y-1">
            <div className="text-xs font-medium text-slate-700 dark:text-slate-200">
              {t.breakdownPanel.provisionalBeforeRetentions}
            </div>
            <div>
              <MoneyCell
                amount={activeBreakdown?.provisionalSubtotal ?? null}
                locale={locale}
                pendingLabel={t.common.pending}
                size="lg"
                emphasize={activeBreakdown?.provisionalSubtotal !== null && activeBreakdown?.provisionalSubtotal !== undefined}
              />
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              {t.breakdownPanel.provisionalFormulaHint}
            </div>
          </div>

          {/* TSS Empleado */}
          <div className="rounded border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 p-2.5 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {t.breakdownPanel.tssEmployeeTitle}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {t.breakdownPanel.tssEmployeeFormula}
                </div>
              </div>
              {tssWorkerSum === null ? (
                <span className="inline-flex items-center gap-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-0.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  <Clock className="w-3 h-3" />
                  {t.breakdownPanel.pendingCalculationBadge}
                </span>
              ) : (
                <MoneyCell amount={tssWorkerSum} locale={locale} />
              )}
            </div>
            {hasComputedStatutory && activeBreakdown && (
              <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>SFS (3.04%):</span>
                  <MoneyCell amount={activeBreakdown.sfsEmployee} locale={locale} size="sm" />
                </div>
                <div className="flex justify-between">
                  <span>AFP (2.87%):</span>
                  <MoneyCell amount={activeBreakdown.afpEmployee} locale={locale} size="sm" />
                </div>
              </div>
            )}
          </div>

          {/* ISR DGII */}
          <div className="rounded border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 p-2.5">
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {t.breakdownPanel.isrDgiiTitle}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {t.breakdownPanel.isrDgiiFormula}
                </div>
              </div>
              {!hasComputedStatutory || activeBreakdown?.isrWithheld === null ? (
                <span className="inline-flex items-center gap-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-0.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  <Clock className="w-3 h-3" />
                  {t.breakdownPanel.pendingCalculationBadge}
                </span>
              ) : (
                <MoneyCell amount={activeBreakdown?.isrWithheld ?? null} locale={locale} />
              )}
            </div>
          </div>

          {/* Total Worker Deductions */}
          <div className="flex items-center justify-between rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold">
            <span className="text-slate-700 dark:text-slate-200">
              {t.breakdownPanel.workerDeductionsTotal}
            </span>
            <MoneyCell
              amount={activeBreakdown?.workerDeductionsTotal ?? null}
              locale={locale}
              pendingLabel={t.common.pending}
            />
          </div>

          {/* Aportes Patronales */}
          <div className="rounded border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 p-2.5 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {t.breakdownPanel.employerSectionTitle}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {hasComputedStatutory
                  ? t.breakdownPanel.employerBadgeComputed
                  : t.breakdownPanel.employerBadgeInformative}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              {t.breakdownPanel.employerFormula}
            </div>
            <div className="flex items-center justify-between pt-1.5 border-t border-slate-200 dark:border-slate-700 text-xs font-semibold">
              <span className="text-slate-700 dark:text-slate-300">
                {t.breakdownPanel.employerContributionsTotal}
              </span>
              <MoneyCell
                amount={activeBreakdown?.employerContributionsTotal ?? null}
                locale={locale}
                pendingLabel={t.common.pending}
              />
            </div>
          </div>

          {/* Neto calculado */}
          <div
            className={`rounded-md border p-3 flex items-center justify-between gap-2 ${
              activeBreakdown?.calculatedNet !== null &&
              activeBreakdown?.calculatedNet !== undefined
                ? 'bg-emerald-50 border-emerald-300 dark:bg-emerald-950/45 dark:border-emerald-700'
                : 'bg-slate-100 border-slate-200 dark:bg-slate-800/70 dark:border-slate-700'
            }`}
          >
            <span className="text-xs font-bold uppercase tracking-wide text-slate-800 dark:text-slate-100">
              {t.breakdownPanel.calculatedNet}
            </span>
            <MoneyCell
              amount={activeBreakdown?.calculatedNet ?? null}
              locale={locale}
              pendingLabel={t.common.pending}
              size="lg"
              emphasize={
                activeBreakdown?.calculatedNet !== null &&
                activeBreakdown?.calculatedNet !== undefined
              }
            />
          </div>

          {/* Bottom contextual guidance note matching Stitch screenshot */}
          {!activeRun && (
            <div className="flex items-start gap-2 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-2.5 text-[11px] text-slate-600 dark:text-slate-400">
              <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>{t.breakdownPanel.pendingSimulationNote}</span>
            </div>
          )}
          {activeRun?.phase === 'SIMULATED' && (
            <div className="flex items-start gap-2 rounded border border-emerald-200 dark:border-emerald-800/70 bg-emerald-50/70 dark:bg-emerald-950/30 p-2.5 text-[11px] text-emerald-900 dark:text-emerald-200">
              <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>{t.breakdownPanel.pendingStatutoryNote}</span>
            </div>
          )}
          {activeRun?.phase === 'STATUTORY_REVIEW' &&
            activeBreakdown?.isrWithheld === 0 && (
              <div className="flex items-start gap-2 rounded border border-emerald-200 dark:border-emerald-800/70 bg-emerald-50/60 dark:bg-emerald-950/30 p-2.5 text-[11px] text-emerald-800 dark:text-emerald-300">
                <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>{t.breakdownPanel.isrExemptNote}</span>
              </div>
            )}
          {activePeriod?.status === 'APPROVED' && (
            <div className="flex items-start gap-2 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-2.5 text-[11px] text-slate-600 dark:text-slate-400">
              <Lock className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>{t.breakdownPanel.approvedReadOnlyNote}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSalaryHistoryTab = () => {
    if (!activeEmployee) return null;
    if (!permissions.canViewSalaryHistory) {
      return (
        <div className="rounded-md border border-amber-200 dark:border-amber-800/70 bg-amber-50/70 dark:bg-amber-950/30 p-4 text-xs space-y-2">
          <div className="flex items-center gap-2 font-semibold text-amber-900 dark:text-amber-200">
            <Lock className="w-4 h-4 shrink-0" />
            <span>{t.breakdownPanel.permissionRestrictedTitle}</span>
          </div>
          <p className="text-amber-800 dark:text-amber-300 leading-relaxed">
            {t.breakdownPanel.permissionRestrictedSalary}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {activeEmployee.salaryHistory.map((item) => (
          <div
            key={item.id}
            className="rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 space-y-2"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono-num font-semibold text-slate-900 dark:text-slate-100">
                {formatDateLocalized(item.effectiveDate, locale)}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {item.authorizedBy}
              </span>
            </div>
            <div className="text-xs text-slate-700 dark:text-slate-300">
              {locale === 'es' ? item.reasonEs : item.reasonEn}
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {t.breakdownPanel.previousSalary}
                </div>
                <MoneyCell amount={item.previousSalary} locale={locale} size="sm" />
              </div>
              <div className="text-right">
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {t.breakdownPanel.newSalary}
                </div>
                <MoneyCell amount={item.newSalary} locale={locale} size="sm" emphasize />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderIsrBackgroundTab = () => {
    if (!activeEmployee) return null;
    if (!permissions.canViewIsrBackground) {
      return (
        <div className="rounded-md border border-amber-200 dark:border-amber-800/70 bg-amber-50/70 dark:bg-amber-950/30 p-4 text-xs space-y-2">
          <div className="flex items-center gap-2 font-semibold text-amber-900 dark:text-amber-200">
            <Lock className="w-4 h-4 shrink-0" />
            <span>{t.breakdownPanel.permissionRestrictedTitle}</span>
          </div>
          <p className="text-amber-800 dark:text-amber-300 leading-relaxed">
            {t.breakdownPanel.permissionRestrictedIsr}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {activeEmployee.isrBackground.map((rec) => (
          <div
            key={rec.id}
            className="rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 space-y-2"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {locale === 'es' ? rec.periodLabelEs : rec.periodLabelEn}
              </span>
              <span className="font-mono-num text-[11px] text-slate-500 dark:text-slate-400">
                {rec.ir3Reference}
              </span>
            </div>
            <div className="text-[11px] text-slate-600 dark:text-slate-400">
              {locale === 'es' ? rec.dgiiBracketEs : rec.dgiiBracketEn}
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {t.breakdownPanel.taxableIncome}
                </div>
                <MoneyCell
                  amount={rec.annualizedTaxableIncome}
                  locale={locale}
                  size="sm"
                />
              </div>
              <div className="text-right">
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {t.breakdownPanel.withheldIsr}
                </div>
                <MoneyCell
                  amount={rec.accumulatedIsrWithheld}
                  locale={locale}
                  size="sm"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const panelBody = (isDrawer: boolean) => (
    <div className="flex h-full flex-col bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800">
      {/* Header matching Stitch panel */}
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 min-w-0">
          <h2 className="font-display text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
            {t.breakdownPanel.title}
          </h2>
          {runHeaderBadge()}
        </div>
        {isDrawer && (
          <button
            type="button"
            onClick={() => setIsMobileBreakdownOpen(false)}
            className="p-1.5 rounded text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
            aria-label={t.common.close}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {!activeEmployee ? (
        <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400">
          {t.breakdownPanel.noEmployeeSelected}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Employee Identity Header matching Stitch right panel */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-slate-900 dark:bg-emerald-700 text-white text-sm font-bold flex items-center justify-center shrink-0">
              {empInitials}
            </div>
            <div className="min-w-0">
              <div className="font-display text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                {activeEmployee.fullName}
              </div>
              <div className="font-mono-num text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {activeEmployee.code} · {t.common.cedula} {activeEmployee.cedula}
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-300 truncate">
                {locale === 'es'
                  ? `${activeEmployee.departmentEs} · ${activeEmployee.positionEs}`
                  : `${activeEmployee.departmentEn} · ${activeEmployee.positionEn}`}
              </div>
            </div>
          </div>

          {/* Sub-tabs */}
          <div className="grid grid-cols-3 gap-1 rounded bg-slate-100 dark:bg-slate-800 p-1">
            <button
              type="button"
              onClick={() => setTab('payroll')}
              className={`inline-flex items-center justify-center gap-1 rounded-sm px-2 py-1.5 text-[11px] font-semibold transition-colors whitespace-nowrap ${
                tab === 'payroll'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Receipt className="w-3 h-3 shrink-0" />
              <span className="truncate">{t.breakdownPanel.tabPayroll}</span>
            </button>
            <button
              type="button"
              onClick={() => setTab('salary')}
              className={`inline-flex items-center justify-center gap-1 rounded-sm px-2 py-1.5 text-[11px] font-semibold transition-colors whitespace-nowrap ${
                tab === 'salary'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <History className="w-3 h-3 shrink-0" />
              <span className="truncate">{t.breakdownPanel.tabSalaryHistory}</span>
            </button>
            <button
              type="button"
              onClick={() => setTab('isr')}
              className={`inline-flex items-center justify-center gap-1 rounded-sm px-2 py-1.5 text-[11px] font-semibold transition-colors whitespace-nowrap ${
                tab === 'isr'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <FileText className="w-3 h-3 shrink-0" />
              <span className="truncate">{t.breakdownPanel.tabIsrBackground}</span>
            </button>
          </div>

          {tab === 'payroll' && renderPayrollTab()}
          {tab === 'salary' && renderSalaryHistoryTab()}
          {tab === 'isr' && renderIsrBackgroundTab()}
        </div>
      )}
    </div>
  );

  return (
    <>
      <aside className="hidden xl:block w-[400px] 2xl:w-[430px] shrink-0">
        <div className="sticky top-12 h-[calc(100vh-3rem)]">
          {panelBody(false)}
        </div>
      </aside>

      {isMobileBreakdownOpen && (
        <div className="fixed inset-0 z-50 xl:hidden flex justify-end">
          <div
            className="fixed inset-0 bg-slate-950/60"
            onClick={() => setIsMobileBreakdownOpen(false)}
          />
          <aside className="relative z-10 w-full max-w-[430px] h-full shadow-2xl">
            {panelBody(true)}
          </aside>
        </div>
      )}
    </>
  );
};
