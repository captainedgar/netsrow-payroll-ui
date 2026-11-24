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

export const TopBar: React.FC = () => {
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

  const isPayrollScreen =
    activeScreen === 'periods' ||
    activeScreen === 'employees' ||
    activeScreen === 'novelties' ||
    activeScreen === 'payroll_review' ||
    activeScreen === 'run_history' ||
    activeScreen === 'work_risk' ||
    activeScreen === 'concept_treatment';

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
    <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-5 py-2">
        {/* Left zone: Mobile Menu + Live Entity & Branch + Active Payroll Status + Period */}
        <div className="flex items-center gap-2 min-w-0 flex-wrap">
          <button
            type="button"
            onClick={() => setIsMobileNavOpen(true)}
            className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
            aria-label={t.navigation.openMenu}
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Live Entity indicator */}
          <button
            type="button"
            onClick={() => setActiveScreen('company')}
            className="hidden xl:flex items-center gap-1.5 rounded border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/30 px-2.5 py-1 text-xs hover:bg-emerald-100/60 dark:hover:bg-emerald-950/50 transition-colors"
          >
            <Building2 className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
            <span className="font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
              {erpState.company.name}
            </span>
            <span className="font-mono-num text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
              · {erpState.company.rnc}
            </span>
          </button>

          {/* Live Active Branch Selector (synced immediately when renamed in Sucursales) */}
          <div className="flex items-center gap-1.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-2 py-1 text-xs">
            <Store className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <select
              aria-label={t.topBar.branchLabel}
              value={activeBranch?.id ?? ''}
              onChange={(e) => {
                if (e.target.value) setActiveBranchId(e.target.value);
              }}
              className="bg-transparent text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none cursor-pointer max-w-[140px] sm:max-w-[200px] truncate"
            >
              {erpState.branches
                .filter((b) => b.active)
                .map((b) => (
                  <option
                    key={b.id}
                    value={b.id}
                    className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100"
                  >
                    {b.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Active payroll status pill (when Payroll module enabled) */}
          {isPayrollScreen && enabledModules.includes('PAYROLL') && (
            <div
              className={`hidden md:inline-flex items-center rounded border px-2.5 py-1 text-[11px] font-bold tracking-wide whitespace-nowrap ${bannerColorClasses}`}
            >
              {statusBannerText}
            </div>
          )}

          {tenantStatus === 'TRIAL' && (
            <span className="hidden md:inline-flex items-center rounded border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 text-[11px] font-bold text-amber-800 dark:text-amber-300">
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
            className="h-8 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 max-w-[170px] sm:max-w-none truncate"
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
          <button
            type="button"
            disabled={isMutating}
            onClick={() => resetDemoData()}
            title={t.topBar.resetDemoData}
            className="hidden sm:inline-flex items-center gap-1 h-8 px-2.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span className="hidden 2xl:inline">{t.topBar.resetDemoData}</span>
          </button>

          {/* Segmented ES | EN */}
          <div
            role="group"
            aria-label={t.topBar.languageLabel}
            className="inline-flex items-center rounded border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 p-0.5 shrink-0"
          >
            <button
              type="button"
              onClick={() => setLocale('es')}
              className={`px-2 py-1 text-[11px] font-semibold rounded-sm transition-colors whitespace-nowrap ${
                locale === 'es'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              ES
            </button>
            <button
              type="button"
              onClick={() => setLocale('en')}
              className={`px-2 py-1 text-[11px] font-semibold rounded-sm transition-colors whitespace-nowrap ${
                locale === 'en'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
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
            className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shrink-0"
          >
            {theme === 'light' ? (
              <Moon className="w-3.5 h-3.5 text-slate-600" />
            ) : (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span className="hidden sm:inline whitespace-nowrap">
              {theme === 'light' ? t.topBar.themeLight : t.topBar.themeDark}
            </span>
          </button>

          {/* Clearly labeled Demo Role Switcher */}
          {isDemoRoleControlEnabled && (
            <div className="flex items-center gap-1.5 rounded border border-amber-300/80 dark:border-amber-700/70 bg-amber-50/70 dark:bg-amber-950/35 px-2 py-1">
              <ShieldAlert
                className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 shrink-0"
                aria-hidden="true"
              />
              <span className="hidden 2xl:inline text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 whitespace-nowrap">
                {t.topBar.demoControlBadge}:
              </span>
              <select
                aria-label={t.topBar.demoRoleLabel}
                value={demoRole}
                onChange={(e) => setDemoRole(e.target.value as DemoRoleKey)}
                className="bg-transparent text-xs font-semibold text-amber-900 dark:text-amber-200 focus:outline-none cursor-pointer max-w-[140px] sm:max-w-[190px] truncate"
              >
                <option
                  value="payroll_admin"
                  className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100"
                >
                  {t.topBar.roleAdmin}
                </option>
                <option
                  value="supervisor_readonly"
                  className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100"
                >
                  {t.topBar.roleSupervisor}
                </option>
              </select>
            </div>
          )}

          {/* User badge */}
          <div className="hidden md:flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700">
            <div className="text-right leading-tight">
              <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                {actorName}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                {demoRole === 'payroll_admin'
                  ? t.topBar.roleTitleAdmin
                  : t.topBar.roleTitleSupervisor}
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-900 dark:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center shrink-0">
              {initials}
            </div>
          </div>

          {/* Mobile/tablet trigger for «Desglose de nómina» drawer */}
          {isPayrollScreen && enabledModules.includes('PAYROLL') && activeEmployee && (
            <button
              type="button"
              onClick={() => setIsMobileBreakdownOpen(true)}
              className="xl:hidden inline-flex items-center gap-1.5 h-8 px-2.5 rounded border border-emerald-600/30 bg-emerald-50 dark:bg-emerald-950/50 text-xs font-semibold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors shrink-0 whitespace-nowrap"
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
              className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shrink-0 whitespace-nowrap"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-500" />
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
