import React, { useEffect, useState } from 'react';
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
import { ErpStatePanel } from './ErpUiPrimitives';
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

  useEffect(() => {
    if (!isMobileBreakdownOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileBreakdownOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isMobileBreakdownOpen, setIsMobileBreakdownOpen]);

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
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--nr-text-secondary)]">
              {t.breakdownPanel.section1Title}
            </span>
            <span className="text-[11px] font-semibold text-[var(--nr-success)]">
              {t.breakdownPanel.section1Badge}
            </span>
          </div>

          <div className="space-y-2">
            {tranches.map((tr) => {
              const hasBadge = Boolean(tr.badgeEs);
              return (
                <div
                  key={tr.id}
                  className={`rounded-xl border p-2.5 text-xs space-y-1 ${
                    hasBadge
                      ? 'bg-[var(--nr-success-bg)] border-[var(--nr-success-border)]'
                      : 'bg-[var(--nr-surface-elevated)] border-[var(--nr-border)]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-[var(--nr-text)] flex items-center gap-1.5">
                      <span>{locale === 'es' ? tr.titleEs : tr.titleEn}</span>
                      {hasBadge && (
                        <TrendingUp className="w-3.5 h-3.5 text-[var(--nr-success)]" />
                      )}
                    </span>
                    {hasBadge ? (
                      <StatusBadge
                        label={locale === 'es' ? tr.badgeEs! : tr.badgeEn!}
                        tone="emerald"
                      />
                    ) : (
                      <span className="font-mono-num text-[11px] text-[var(--nr-text-secondary)]">
                        {tr.days} {t.common.daysSuffix}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[var(--nr-text-secondary)]">
                    <span>{t.breakdownPanel.registeredMonthlySalary}</span>
                    <MoneyCell
                      amount={tr.registeredMonthlySalary}
                      locale={locale}
                      size="sm"
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs font-semibold text-[var(--nr-text)]">
                    <span>{t.breakdownPanel.trancheAmount}</span>
                    <MoneyCell amount={tr.computedAmount} locale={locale} size="sm" />
                  </div>
                </div>
              );
            })}

            <div className="flex items-center justify-between rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-muted)] px-3 py-2 text-xs font-bold text-[var(--nr-text)]">
              <span>{t.breakdownPanel.subtotalCalculatedSalary}</span>
              <MoneyCell amount={calculatedSalarySubtotal} locale={locale} />
            </div>
          </div>
        </div>

        {/* 2. NOVEDADES DEL PERÍODO */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--nr-text-secondary)]">
              {t.breakdownPanel.section2Title}
            </span>
            <span className="font-mono-num text-[11px] text-[var(--nr-text-secondary)]">
              {employeePeriodNovelties.length} {t.breakdownPanel.recordsSuffix}
            </span>
          </div>

          {employeePeriodNovelties.length === 0 ? (
            <div className="rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-3 py-2.5 text-xs text-[var(--nr-text-secondary)]">
              {t.breakdownPanel.noNoveltiesForEmployee}
            </div>
          ) : (
            <div className="space-y-1.5">
              {employeePeriodNovelties.map((nov) => {
                const isEarning = nov.category === 'EARNING';
                return (
                  <div
                    key={nov.id}
                    className="flex items-center justify-between gap-2 rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface)] px-3 py-2 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="font-medium text-[var(--nr-text)] truncate">
                        {t.noveltyConcepts[nov.conceptCode]}
                      </div>
                      <div className="text-[11px] text-[var(--nr-text-secondary)] truncate">
                        {locale === 'es' ? nov.noteEs : nov.noteEn}
                      </div>
                    </div>
                    <span
                      className={`font-mono-num font-semibold whitespace-nowrap shrink-0 ${
                        isEarning
                          ? 'text-[var(--nr-success)]'
                          : 'text-[var(--nr-error)]'
                      }`}
                    >
                      {isEarning ? '+' : '-'}
                      <MoneyCell
                        amount={nov.amount}
                        locale={locale}
                        size="sm"
                        className={
                          isEarning
                            ? '!text-[var(--nr-success)]'
                            : '!text-[var(--nr-error)]'
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
          <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--nr-text-secondary)]">
            {t.breakdownPanel.section3Title}
          </div>

          {/* Subtotal provisional antes de retenciones */}
          <div className="rounded-xl border border-[var(--nr-success-border)] bg-[var(--nr-success-bg)] p-3 space-y-1">
            <div className="text-xs font-medium text-[var(--nr-text)]">
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
            <div className="text-[11px] text-[var(--nr-text-secondary)]">
              {t.breakdownPanel.provisionalFormulaHint}
            </div>
          </div>

          {/* TSS Empleado */}
          <div className="rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] p-2.5 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="text-xs font-semibold text-[var(--nr-text)]">
                  {t.breakdownPanel.tssEmployeeTitle}
                </div>
                <div className="text-[11px] text-[var(--nr-text-secondary)]">
                  {t.breakdownPanel.tssEmployeeFormula}
                </div>
              </div>
              {tssWorkerSum === null ? (
                <span className="inline-flex items-center gap-1 rounded-md border border-[var(--nr-border)] bg-[var(--nr-surface)] px-2 py-0.5 text-[11px] font-medium text-[var(--nr-text-secondary)]">
                  <Clock className="w-3 h-3" />
                  {t.breakdownPanel.pendingCalculationBadge}
                </span>
              ) : (
                <MoneyCell amount={tssWorkerSum} locale={locale} />
              )}
            </div>
            {hasComputedStatutory && activeBreakdown && (
              <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-[var(--nr-border)] text-[11px] text-[var(--nr-text-secondary)]">
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
          <div className="rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] p-2.5">
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="text-xs font-semibold text-[var(--nr-text)]">
                  {t.breakdownPanel.isrDgiiTitle}
                </div>
                <div className="text-[11px] text-[var(--nr-text-secondary)]">
                  {t.breakdownPanel.isrDgiiFormula}
                </div>
              </div>
              {!hasComputedStatutory || activeBreakdown?.isrWithheld === null ? (
                <span className="inline-flex items-center gap-1 rounded-md border border-[var(--nr-border)] bg-[var(--nr-surface)] px-2 py-0.5 text-[11px] font-medium text-[var(--nr-text-secondary)]">
                  <Clock className="w-3 h-3" />
                  {t.breakdownPanel.pendingCalculationBadge}
                </span>
              ) : (
                <MoneyCell amount={activeBreakdown?.isrWithheld ?? null} locale={locale} />
              )}
            </div>
          </div>

          {/* Total Worker Deductions */}
          <div className="flex items-center justify-between rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface)] px-3 py-2 text-xs font-semibold">
            <span className="text-[var(--nr-text)]">
              {t.breakdownPanel.workerDeductionsTotal}
            </span>
            <MoneyCell
              amount={activeBreakdown?.workerDeductionsTotal ?? null}
              locale={locale}
              pendingLabel={t.common.pending}
            />
          </div>

          {/* Aportes Patronales */}
          <div className="rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] p-2.5 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs font-semibold text-[var(--nr-text)]">
                {t.breakdownPanel.employerSectionTitle}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--nr-text-secondary)]">
                {hasComputedStatutory
                  ? t.breakdownPanel.employerBadgeComputed
                  : t.breakdownPanel.employerBadgeInformative}
              </span>
            </div>
            <div className="text-[11px] text-[var(--nr-text-secondary)]">
              {t.breakdownPanel.employerFormula}
            </div>
            <div className="flex items-center justify-between pt-1.5 border-t border-[var(--nr-border)] text-xs font-semibold">
              <span className="text-[var(--nr-text-secondary)]">
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
            className={`rounded-xl border p-3 flex items-center justify-between gap-2 ${
              activeBreakdown?.calculatedNet !== null &&
              activeBreakdown?.calculatedNet !== undefined
                ? 'bg-[var(--nr-success-bg)] border-[var(--nr-success-border)]'
                : 'bg-[var(--nr-surface-muted)] border-[var(--nr-border)]'
            }`}
          >
            <span className="text-xs font-bold uppercase tracking-wide text-[var(--nr-text)]">
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

          {!activeRun && (
            <div className="flex items-start gap-2 rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] p-2.5 text-[11px] text-[var(--nr-text-secondary)]">
              <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>{t.breakdownPanel.pendingSimulationNote}</span>
            </div>
          )}
          {activeRun?.phase === 'SIMULATED' && (
            <div className="flex items-start gap-2 rounded-xl border border-[var(--nr-success-border)] bg-[var(--nr-success-bg)] p-2.5 text-[11px] text-[var(--nr-text)]">
              <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[var(--nr-success)]" />
              <span>{t.breakdownPanel.pendingStatutoryNote}</span>
            </div>
          )}
          {activeRun?.phase === 'STATUTORY_REVIEW' &&
            activeBreakdown?.isrWithheld === 0 && (
              <div className="flex items-start gap-2 rounded-xl border border-[var(--nr-success-border)] bg-[var(--nr-success-bg)] p-2.5 text-[11px] text-[var(--nr-success)]">
                <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>{t.breakdownPanel.isrExemptNote}</span>
              </div>
            )}
          {activePeriod?.status === 'APPROVED' && (
            <div className="flex items-start gap-2 rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] p-2.5 text-[11px] text-[var(--nr-text-secondary)]">
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
        <ErpStatePanel
          variant="restricted"
          title={t.breakdownPanel.permissionRestrictedTitle}
          description={t.breakdownPanel.permissionRestrictedSalary}
        />
      );
    }

    return (
      <div className="space-y-3">
        {activeEmployee.salaryHistory.map((item) => (
          <div
            key={item.id}
            className="rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface)] p-3 space-y-2"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono-num font-semibold text-[var(--nr-text)]">
                {formatDateLocalized(item.effectiveDate, locale)}
              </span>
              <span className="text-[11px] text-[var(--nr-text-secondary)]">
                {item.authorizedBy}
              </span>
            </div>
            <div className="text-xs text-[var(--nr-text-secondary)]">
              {locale === 'es' ? item.reasonEs : item.reasonEn}
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--nr-border)] text-xs">
              <div>
                <div className="text-[11px] text-[var(--nr-text-secondary)]">
                  {t.breakdownPanel.previousSalary}
                </div>
                <MoneyCell amount={item.previousSalary} locale={locale} size="sm" />
              </div>
              <div className="text-right">
                <div className="text-[11px] text-[var(--nr-text-secondary)]">
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
        <ErpStatePanel
          variant="restricted"
          title={t.breakdownPanel.permissionRestrictedTitle}
          description={t.breakdownPanel.permissionRestrictedIsr}
        />
      );
    }

    return (
      <div className="space-y-3">
        {activeEmployee.isrBackground.map((rec) => (
          <div
            key={rec.id}
            className="rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface)] p-3 space-y-2"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[var(--nr-text)]">
                {locale === 'es' ? rec.periodLabelEs : rec.periodLabelEn}
              </span>
              <span className="font-mono-num text-[11px] text-[var(--nr-text-secondary)]">
                {rec.ir3Reference}
              </span>
            </div>
            <div className="text-[11px] text-[var(--nr-text-secondary)]">
              {locale === 'es' ? rec.dgiiBracketEs : rec.dgiiBracketEn}
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--nr-border)] text-xs">
              <div>
                <div className="text-[11px] text-[var(--nr-text-secondary)]">
                  {t.breakdownPanel.taxableIncome}
                </div>
                <MoneyCell
                  amount={rec.annualizedTaxableIncome}
                  locale={locale}
                  size="sm"
                />
              </div>
              <div className="text-right">
                <div className="text-[11px] text-[var(--nr-text-secondary)]">
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
    <div className="flex h-full flex-col bg-[var(--nr-surface)] border-l border-[var(--nr-border)]">
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-[var(--nr-border)]">
        <div className="flex items-center gap-2 min-w-0">
          <h2 className="font-display text-sm font-bold text-[var(--nr-text)] truncate">
            {t.breakdownPanel.title}
          </h2>
          {runHeaderBadge()}
        </div>
        {isDrawer && (
          <button
            type="button"
            onClick={() => setIsMobileBreakdownOpen(false)}
            className="nr-focus-ring nr-transition p-1.5 rounded-lg text-[var(--nr-text-secondary)] hover:text-[var(--nr-text)] hover:bg-[var(--nr-surface-muted)] shrink-0"
            aria-label={t.common.close}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {!activeEmployee ? (
        <div className="p-4">
          <ErpStatePanel
            variant="empty"
            title={t.breakdownPanel.noEmployeeSelected}
          />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[var(--nr-navy-900)] text-white text-sm font-bold flex items-center justify-center shrink-0">
              {empInitials}
            </div>
            <div className="min-w-0">
              <div className="font-display text-sm font-bold text-[var(--nr-text)] truncate">
                {activeEmployee.fullName}
              </div>
              <div className="font-mono-num text-[11px] text-[var(--nr-text-secondary)] truncate">
                {activeEmployee.code} · {t.common.cedula} {activeEmployee.cedula}
              </div>
              <div className="text-[11px] text-[var(--nr-text-secondary)] truncate">
                {locale === 'es'
                  ? `${activeEmployee.departmentEs} · ${activeEmployee.positionEs}`
                  : `${activeEmployee.departmentEn} · ${activeEmployee.positionEn}`}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-muted)] p-1">
            <button
              type="button"
              onClick={() => setTab('payroll')}
              className={`nr-focus-ring nr-transition inline-flex items-center justify-center gap-1 rounded-md px-2 py-1.5 text-[11px] font-semibold whitespace-nowrap ${
                tab === 'payroll'
                  ? 'bg-[var(--nr-surface)] text-[var(--nr-text)] shadow-xs'
                  : 'text-[var(--nr-text-secondary)] hover:text-[var(--nr-text)]'
              }`}
            >
              <Receipt className="w-3 h-3 shrink-0" />
              <span className="truncate">{t.breakdownPanel.tabPayroll}</span>
            </button>
            <button
              type="button"
              onClick={() => setTab('salary')}
              className={`nr-focus-ring nr-transition inline-flex items-center justify-center gap-1 rounded-md px-2 py-1.5 text-[11px] font-semibold whitespace-nowrap ${
                tab === 'salary'
                  ? 'bg-[var(--nr-surface)] text-[var(--nr-text)] shadow-xs'
                  : 'text-[var(--nr-text-secondary)] hover:text-[var(--nr-text)]'
              }`}
            >
              <History className="w-3 h-3 shrink-0" />
              <span className="truncate">{t.breakdownPanel.tabSalaryHistory}</span>
            </button>
            <button
              type="button"
              onClick={() => setTab('isr')}
              className={`nr-focus-ring nr-transition inline-flex items-center justify-center gap-1 rounded-md px-2 py-1.5 text-[11px] font-semibold whitespace-nowrap ${
                tab === 'isr'
                  ? 'bg-[var(--nr-surface)] text-[var(--nr-text)] shadow-xs'
                  : 'text-[var(--nr-text-secondary)] hover:text-[var(--nr-text)]'
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
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 xl:hidden flex justify-end"
        >
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
