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
    <header className="sticky top-0 z-30 bg-[var(--nr-surface)] border-b border-[var(--nr-border)]">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-2.5">
        {/* Left: Mobile drawer trigger + Platform title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            ref={mobileTriggerRef}
            type="button"
            onClick={onOpenMobileMenu}
            aria-label={pt.platformNav.openMenu}
            className="nr-focus-ring nr-transition lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface)] text-[var(--nr-text)] hover:bg-[var(--nr-surface-muted)] shrink-0"
          >
            <Menu className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <span className="font-display text-sm font-bold text-[var(--nr-text)] truncate">
              {pt.platformNav.brandTitle}
            </span>
            <span className="hidden sm:inline text-xs text-[var(--nr-text-secondary)]">·</span>
            <span className="hidden sm:inline rounded-md px-2 py-0.5 border border-[var(--nr-warning-border)] bg-[var(--nr-warning-bg)] text-[11px] font-semibold text-[var(--nr-warning)] whitespace-nowrap">
              {pt.platformNav.demoTag}
            </span>
          </div>
        </div>

        {/* Right: Operator name + ES/EN + Light/Dark + Sign out */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="hidden md:flex items-center gap-2 pr-2 border-r border-[var(--nr-border)]">
            <div className="text-right leading-tight">
              <div className="text-xs font-semibold text-[var(--nr-text)] whitespace-nowrap">
                {operatorName}
              </div>
              <div className="text-[10px] text-[var(--nr-text-secondary)] whitespace-nowrap">
                {pt.platformNav.operatorRoleLabel}
              </div>
            </div>
          </div>

          <div className="inline-flex items-center rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-muted)] p-0.5 shrink-0">
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

          <button
            type="button"
            onClick={toggleTheme}
            className="nr-focus-ring nr-transition inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface)] text-xs font-medium text-[var(--nr-text)] hover:bg-[var(--nr-surface-muted)] shrink-0 whitespace-nowrap"
          >
            {theme === 'light' ? (
              <Moon className="w-3.5 h-3.5 text-[var(--nr-text-secondary)]" />
            ) : (
              <Sun className="w-3.5 h-3.5 text-[var(--nr-warning)]" />
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
            className="nr-focus-ring nr-transition inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface)] text-xs font-semibold text-[var(--nr-text)] hover:bg-[var(--nr-surface-muted)] whitespace-nowrap shrink-0"
          >
            <LogOut className="w-3.5 h-3.5 text-[var(--nr-text-secondary)]" />
            <span>{pt.auth.logoutButton}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
