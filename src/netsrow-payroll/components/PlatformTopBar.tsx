import React from 'react';
import { LogOut, Menu, Moon, Sun } from 'lucide-react';
import { usePlatform } from '../context/PlatformContext';

export interface PlatformTopBarProps {
  onOpenMobileMenu: () => void;
  mobileTriggerRef: React.RefObject<HTMLButtonElement | null>;
}

export const PlatformTopBar: React.FC<PlatformTopBarProps> = ({
  onOpenMobileMenu,
  mobileTriggerRef,
}) => {
  const {
    authSession,
    locale,
    setLocale,
    theme,
    toggleTheme,
    pt,
    logoutSession,
  } = usePlatform();

  const operatorName = authSession?.fullName ?? 'Operador Plataforma';

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-2.5">
        {/* Left: Mobile drawer trigger + Platform title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            ref={mobileTriggerRef}
            type="button"
            onClick={onOpenMobileMenu}
            aria-label={pt.platformNav.openMenu}
            className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0 focus-visible:outline-2 focus-visible:outline-emerald-500"
          >
            <Menu className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <span className="font-display text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
              {pt.platformNav.brandTitle}
            </span>
            <span className="hidden sm:inline text-xs text-slate-400">·</span>
            <span className="hidden sm:inline rounded px-2 py-0.5 border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/50 text-[11px] font-semibold text-amber-800 dark:text-amber-300 whitespace-nowrap">
              {pt.platformNav.demoTag}
            </span>
          </div>
        </div>

        {/* Right: Operator name + ES/EN + Light/Dark + Sign out */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="hidden md:flex items-center gap-2 pr-2 border-r border-slate-200 dark:border-slate-700">
            <div className="text-right leading-tight">
              <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                {operatorName}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                {pt.platformNav.operatorRoleLabel}
              </div>
            </div>
          </div>

          <div className="inline-flex items-center rounded border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 p-0.5 shrink-0">
            <button
              type="button"
              onClick={() => setLocale('es')}
              className={`px-2 py-1 text-[11px] font-semibold rounded-sm whitespace-nowrap ${
                locale === 'es'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              ES
            </button>
            <button
              type="button"
              onClick={() => setLocale('en')}
              className={`px-2 py-1 text-[11px] font-semibold rounded-sm whitespace-nowrap ${
                locale === 'en'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              EN
            </button>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shrink-0 whitespace-nowrap"
          >
            {theme === 'light' ? (
              <Moon className="w-3.5 h-3.5 text-slate-600" />
            ) : (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span className="hidden sm:inline">
              {theme === 'light'
                ? locale === 'es'
                  ? 'Claro'
                  : 'Light'
                : locale === 'es'
                  ? 'Oscuro'
                  : 'Dark'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => logoutSession('/platform/login')}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 whitespace-nowrap shrink-0"
          >
            <LogOut className="w-3.5 h-3.5 text-slate-500" />
            <span>{pt.auth.logoutButton}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
