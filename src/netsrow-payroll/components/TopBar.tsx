import React from 'react';
import {
  Building2,
  LogOut,
  Menu,
  Moon,
  PanelRightOpen,
  RotateCcw,
  ShieldAlert,
  Store,
  Sun,
} from 'lucide-react';
import { usePayrollWorkspace } from '../context/PayrollWorkspaceContext';
import { DemoRoleKey } from '../types/payroll';

export const TopBar: React.FC<{ companyName?: string }> = ({ companyName }) => {
  const {
    periods,
    activePeriodId,
    activePeriod,
    activeRun,
    activeScreen,
    erpState,
    activeBranch,
    setActiveBranchId,
    setActiveScreen,
    selectPeriod,
    locale,
    setLocale,
    theme,
    toggleTheme,
    t,
    isDemoRoleControlEnabled,
    demoRole,
    setDemoRole,
    actorName,
    resetDemoData,
    isMutating,
    setIsMobileNavOpen,
    setIsMobileBreakdownOpen,
    activeEmployee,
    enabledModules,
    tenantStatus,
    onLogout,
  } = usePayrollWorkspace();

  const isPayrollScreen = !companyName && (
    activeScreen === 'periods' ||
    activeScreen === 'employees' ||
    activeScreen === 'novelties' ||
    activeScreen === 'payroll_review' ||
    activeScreen === 'run_history' ||
    activeScreen === 'work_risk' ||
    activeScreen === 'concept_treatment');

  const statusBannerText = (() => {
    if (!activePeriod) return t.topBar.noPeriodSelected;
    const pName = (locale === 'es' ? activePeriod.nameEs : activePeriod.nameEn).toUpperCase();
    if (activePeriod.status === 'APPROVED') {
      return `${t.topBar.approvedBannerPrefix} · ${pName}`;
    }
    if (activePeriod.status === 'DRAFT') {
      return `${t.topBar.draftBannerPrefix} · ${pName}`;
    }
    if (activeRun?.phase === 'STATUTORY_REVIEW') {
      return `${t.topBar.statutoryBannerPrefix} · ${pName}`;
    }
    return `${t.topBar.simBannerPrefix} · ${pName}`;
  })();

  const bannerColorClasses =
    activePeriod?.status === 'APPROVED'
      ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300'
      : activeRun?.phase === 'STATUTORY_REVIEW'
        ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300'
        : 'bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-200';

  const initials = actorName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <header className="sticky top-0 z-30 bg-[var(--nr-surface)] border-b border-[var(--nr-border)]">
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-6 py-2.5">
        {/* Left zone: Mobile Menu + Live Entity & Branch + Active Payroll Status + Period */}
        <div className="flex items-center gap-2 min-w-0 flex-wrap">
          <button
            id="nr-mobile-nav-trigger"
            type="button"
            onClick={() => setIsMobileNavOpen(true)}
            className="nr-focus-ring nr-transition lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface)] text-[var(--nr-text)] hover:bg-[var(--nr-surface-muted)] shrink-0"
            aria-label={t.navigation.openMenu}
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Live Entity indicator */}
          <button
            type="button"
            onClick={() => setActiveScreen('company')}
            className="nr-focus-ring nr-transition hidden 2xl:flex items-center gap-1.5 rounded-lg border border-[var(--nr-success-border)] bg-[var(--nr-success-bg)] px-2.5 py-1 text-xs hover:opacity-90"
          >
            <Building2 className="w-3.5 h-3.5 text-[var(--nr-primary)] shrink-0" />
            <span className="font-semibold text-[var(--nr-text)] whitespace-nowrap">
              {companyName ?? erpState.company.name}
            </span>
            {erpState.company.rnc && <span className="font-mono-num text-[11px] text-[var(--nr-text-secondary)] whitespace-nowrap">
              · {erpState.company.rnc}
            </span>}
          </button>

          {/* Live Active Branch Selector (synced immediately when renamed in Sucursales) */}
          {!companyName && <div className="flex items-center gap-1.5 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-2.5 py-1 text-xs h-8">
            <Store className="w-3.5 h-3.5 text-[var(--nr-primary)] shrink-0" />
            <select
              aria-label={t.topBar.branchLabel}
              value={activeBranch?.id ?? ''}
              onChange={(e) => {
                if (e.target.value) setActiveBranchId(e.target.value);
              }}
              className="bg-transparent text-xs font-semibold text-[var(--nr-text)] focus:outline-none cursor-pointer max-w-[140px] sm:max-w-[200px] truncate"
            >
              {erpState.branches
                .filter((b) => b.active)
                .map((b) => (
                  <option
                    key={b.id}
                    value={b.id}
                    className="bg-[var(--nr-surface)] text-[var(--nr-text)]"
                  >
                    {b.name}
                  </option>
                ))}
            </select>
          </div>}

          {/* Active payroll status pill (when Payroll module enabled) */}
          {isPayrollScreen && enabledModules.includes('PAYROLL') && (
            <div
              className={`hidden md:inline-flex items-center rounded-md border px-2.5 py-1 text-[11px] font-bold tracking-wide whitespace-nowrap ${bannerColorClasses}`}
            >
              {statusBannerText}
            </div>
          )}

          {tenantStatus === 'TRIAL' && (
            <span className="hidden md:inline-flex items-center rounded-md border border-[var(--nr-warning-border)] bg-[var(--nr-warning-bg)] px-2 py-0.5 text-[11px] font-bold text-[var(--nr-warning)]">
              {locale === 'es' ? 'Período de prueba' : 'Trial'}
            </span>
          )}

          {/* Monthly Period Selector */}
          <select
            aria-label={t.topBar.activePeriodLabel}
            value={activePeriodId ?? ''}
            onChange={(e) => {
              if (e.target.value) selectPeriod(e.target.value, false);
            }}
            className="nr-focus-ring h-8 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface)] px-2.5 text-xs font-semibold text-[var(--nr-text)] max-w-[170px] sm:max-w-none truncate"
          >
            {periods.length === 0 && (
              <option value="">{t.topBar.noPeriodSelected}</option>
            )}
            {periods.map((p) => (
              <option key={p.id} value={p.id}>
                {locale === 'es' ? p.nameEs : p.nameEn} · {t.statuses[p.status]}
              </option>
            ))}
          </select>
        </div>

        {/* Right zone: Reset Demo + ES/EN + Theme + Demo Role Switcher + User + Mobile Breakdown */}
        <div className="flex items-center gap-2 flex-wrap">
          {!companyName && <button
            type="button"
            disabled={isMutating}
            onClick={() => resetDemoData()}
            title={t.topBar.resetDemoData}
            className="nr-focus-ring nr-transition hidden sm:inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface)] text-xs font-medium text-[var(--nr-text)] hover:bg-[var(--nr-surface-muted)] disabled:opacity-50 whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[var(--nr-warning)]" />
            <span className="hidden 2xl:inline">{t.topBar.resetDemoData}</span>
          </button>}

          {/* Segmented ES | EN */}
          <div
            role="group"
            aria-label={t.topBar.languageLabel}
            className="inline-flex items-center rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-muted)] p-0.5 shrink-0"
          >
            <button
              type="button"
              onClick={() => setLocale('es')}
              className={`nr-focus-ring nr-transition px-2 py-1 text-[11px] font-semibold rounded-md whitespace-nowrap ${
                locale === 'es'
                  ? 'bg-[var(--nr-surface)] text-[var(--nr-text)] shadow-xs'
                  : 'text-[var(--nr-text-secondary)] hover:text-[var(--nr-text)]'
              }`}
            >
              ES
            </button>
            <button
              type="button"
              onClick={() => setLocale('en')}
              className={`nr-focus-ring nr-transition px-2 py-1 text-[11px] font-semibold rounded-md whitespace-nowrap ${
                locale === 'en'
                  ? 'bg-[var(--nr-surface)] text-[var(--nr-text)] shadow-xs'
                  : 'text-[var(--nr-text-secondary)] hover:text-[var(--nr-text)]'
              }`}
            >
              EN
            </button>
          </div>

          {/* Theme toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'light' ? t.topBar.themeDark : t.topBar.themeLight}
            className="nr-focus-ring nr-transition inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface)] text-xs font-medium text-[var(--nr-text)] hover:bg-[var(--nr-surface-muted)] shrink-0"
          >
            {theme === 'light' ? (
              <Moon className="w-3.5 h-3.5 text-[var(--nr-text-secondary)]" />
            ) : (
              <Sun className="w-3.5 h-3.5 text-[var(--nr-warning)]" />
            )}
            <span className="hidden sm:inline whitespace-nowrap">
              {theme === 'light' ? t.topBar.themeLight : t.topBar.themeDark}
            </span>
          </button>

          {/* Clearly labeled Demo Role Switcher */}
          {isDemoRoleControlEnabled && (
            <div className="flex items-center gap-1.5 rounded-lg border border-[var(--nr-warning-border)] bg-[var(--nr-warning-bg)] px-2.5 py-1 h-8">
              <ShieldAlert
                className="w-3.5 h-3.5 text-[var(--nr-warning)] shrink-0"
                aria-hidden="true"
              />
              <span className="hidden 2xl:inline text-[10px] font-bold uppercase tracking-wider text-[var(--nr-warning)] whitespace-nowrap">
                {t.topBar.demoControlBadge}:
              </span>
              <select
                aria-label={t.topBar.demoRoleLabel}
                value={demoRole}
                onChange={(e) => setDemoRole(e.target.value as DemoRoleKey)}
                className="bg-transparent text-xs font-semibold text-[var(--nr-warning)] focus:outline-none cursor-pointer max-w-[140px] sm:max-w-[190px] truncate"
              >
                <option
                  value="payroll_admin"
                  className="bg-[var(--nr-surface)] text-[var(--nr-text)]"
                >
                  {t.topBar.roleAdmin}
                </option>
                <option
                  value="supervisor_readonly"
                  className="bg-[var(--nr-surface)] text-[var(--nr-text)]"
                >
                  {t.topBar.roleSupervisor}
                </option>
              </select>
            </div>
          )}

          {/* User badge */}
          <div className="hidden md:flex items-center gap-2 pl-2 border-l border-[var(--nr-border)]">
            <div className="text-right leading-tight">
              <div className="text-xs font-semibold text-[var(--nr-text)] whitespace-nowrap">
                {companyName ?? actorName}
              </div>
              {!companyName && <div className="text-[10px] text-[var(--nr-text-secondary)] whitespace-nowrap">
                {demoRole === 'payroll_admin'
                  ? t.topBar.roleTitleAdmin
                  : t.topBar.roleTitleSupervisor}
              </div>}
            </div>
            <div className="w-8 h-8 rounded-full bg-[#081321] dark:bg-[var(--nr-primary)] text-white dark:text-[var(--nr-primary-fg)] text-xs font-bold flex items-center justify-center shrink-0">
              {initials}
            </div>
          </div>

          {/* Mobile/tablet trigger for «Desglose de nómina» drawer */}
          {isPayrollScreen && enabledModules.includes('PAYROLL') && activeEmployee && (
            <button
              type="button"
              onClick={() => setIsMobileBreakdownOpen(true)}
              className="nr-focus-ring nr-transition xl:hidden inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-[var(--nr-success-border)] bg-[var(--nr-success-bg)] text-xs font-semibold text-[var(--nr-success)] shrink-0 whitespace-nowrap"
            >
              <PanelRightOpen className="w-3.5 h-3.5" />
              <span>{t.topBar.openBreakdown}</span>
            </button>
          )}

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              title={locale === 'es' ? 'Cerrar sesión' : 'Sign out'}
              className="nr-focus-ring nr-transition inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface)] text-xs font-semibold text-[var(--nr-text)] hover:bg-[var(--nr-surface-muted)] shrink-0 whitespace-nowrap"
            >
              <LogOut className="w-3.5 h-3.5 text-[var(--nr-text-secondary)]" />
              <span className="hidden sm:inline">
                {locale === 'es' ? 'Cerrar sesión' : 'Sign out'}
              </span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
