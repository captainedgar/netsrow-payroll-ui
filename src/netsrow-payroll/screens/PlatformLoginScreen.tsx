import React from 'react';
import { ArrowLeft, Moon, Sun } from 'lucide-react';
import { AuthLoginForm } from '../components/AuthLoginForm';
import { NetsRowLogo } from '../components/NetsRowLogo';
import { usePlatform } from '../context/PlatformContext';

export const PlatformLoginScreen: React.FC = () => {
  const { locale, setLocale, theme, toggleTheme, pt, navigateRoute } = usePlatform();

  return (
    <div
      className={`netsrow-payroll-shell nr-gradient-navy relative overflow-hidden min-h-screen text-slate-100 flex flex-col justify-between p-4 sm:p-8 ${
        theme === 'dark' ? 'dark' : ''
      }`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-80 w-[560px] rounded-full opacity-50"
        style={{
          background:
            'radial-gradient(circle, rgba(16,185,129,0.14) 0%, rgba(16,185,129,0) 70%)',
        }}
      />
      {/* Sober operator top bar */}
      <header className="max-w-5xl w-full mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <NetsRowLogo size="sm" surface="dark" />
          <div className="text-[10px] font-semibold tracking-wider text-slate-400">
            {pt.platformNav.brandSubtitle}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex items-center rounded border border-slate-700 bg-slate-800/80 p-0.5">
            <button
              type="button"
              onClick={() => setLocale('es')}
              className={`px-2 py-1 text-[11px] font-semibold rounded-sm ${
                locale === 'es' ? 'bg-slate-950 text-white' : 'text-slate-400'
              }`}
            >
              ES
            </button>
            <button
              type="button"
              onClick={() => setLocale('en')}
              className={`px-2 py-1 text-[11px] font-semibold rounded-sm ${
                locale === 'en' ? 'bg-slate-950 text-white' : 'text-slate-400'
              }`}
            >
              EN
            </button>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded border border-slate-700 bg-slate-800/80 text-xs font-medium text-slate-200"
          >
            {theme === 'light' ? (
              <Moon className="w-3.5 h-3.5" />
            ) : (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span>
              {theme === 'light'
                ? locale === 'es'
                  ? 'Claro'
                  : 'Light'
                : locale === 'es'
                  ? 'Oscuro'
                  : 'Dark'}
            </span>
          </button>
        </div>
      </header>

      {/* Center sober login card */}
      <main className="relative my-8 max-w-md w-full mx-auto rounded-2xl border border-[var(--nr-border)] bg-[var(--nr-surface)] text-[var(--nr-text)] p-6 sm:p-8 shadow-2xl space-y-5">
        <div>
          <div className="text-[11px] font-semibold text-[var(--nr-primary)] uppercase tracking-wider">
            {pt.auth.demoBanner}
          </div>
          <h1 className="mt-1 font-display text-xl sm:text-2xl font-bold tracking-tight text-[var(--nr-text)]">
            {pt.auth.platformLoginTitle}
          </h1>
          <p className="mt-1 text-xs text-[var(--nr-text-secondary)]">
            {pt.auth.platformLoginSubtitle}
          </p>
        </div>

        <AuthLoginForm
          portal="PLATFORM"
          onAuthenticated={() => navigateRoute('/platform')}
        />

        <div className="pt-3 border-t border-[var(--nr-border)] flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => navigateRoute('/login')}
            className="nr-focus-ring nr-transition inline-flex items-center gap-1.5 font-semibold text-[var(--nr-text-secondary)] hover:text-[var(--nr-primary)] rounded"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{pt.auth.goToTenantLogin}</span>
          </button>
          <span className="font-mono-num text-[11px] text-[var(--nr-text-secondary)]">/platform/login</span>
        </div>
      </main>

      <footer className="relative max-w-5xl w-full mx-auto text-center text-[11px] text-slate-400">
        {locale === 'es'
          ? 'Acceso exclusivo para operadores autorizados de plataforma. Las sesiones de empresa son rechazadas.'
          : 'Restricted to authorized platform operators. Tenant accounts are denied.'}
      </footer>
    </div>
  );
};
