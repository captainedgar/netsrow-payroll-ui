import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Moon,
  ShieldCheck,
  Sun,
} from 'lucide-react';
import { AuthLoginForm } from '../components/AuthLoginForm';
import { NetsRowLogo } from '../components/NetsRowLogo';
import { usePlatform } from '../context/PlatformContext';

export const TenantLoginScreen: React.FC = () => {
  const {
    locale,
    setLocale,
    theme,
    toggleTheme,
    pt,
    navigateRoute,
  } = usePlatform();

  const [viewMode, setViewMode] = useState<'login' | 'forgot'>('login');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoverySent, setRecoverySent] = useState(false);

  return (
    <div
      className={`netsrow-payroll-shell min-h-screen bg-[var(--nr-bg)] text-[var(--nr-text)] flex flex-col ${
        theme === 'dark' ? 'dark' : ''
      }`}
    >
      <div className="flex-1 flex flex-col lg:grid lg:grid-cols-12">
        {/* Form column — FIRST on mobile (390px) so form is immediately visible */}
        <div className="order-1 lg:order-2 lg:col-span-7 flex flex-col justify-between bg-[var(--nr-surface)] px-5 py-6 sm:px-10 sm:py-8">
          {/* Top utility bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-[var(--nr-border)]">
            <div className="flex items-center gap-2 text-xs font-medium text-[var(--nr-text-secondary)]">
              <button
                type="button"
                onClick={() => navigateRoute('/')}
                aria-label="NetsRow ERP"
                className="nr-focus-ring nr-transition inline-flex items-center rounded-lg"
              >
                <NetsRowLogo size="xs" surface="auto" />
              </button>
              <span aria-hidden="true">·</span>
              <span className="text-[var(--nr-warning)] font-semibold">
                {pt.auth.demoBanner}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div
                role="group"
                aria-label="Language"
                className="inline-flex items-center rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-muted)] p-0.5"
              >
                <button
                  type="button"
                  onClick={() => setLocale('es')}
                  className={`nr-focus-ring nr-transition px-2 py-1 text-[11px] font-semibold rounded-md ${
                    locale === 'es'
                      ? 'bg-[var(--nr-surface)] text-[var(--nr-text)]'
                      : 'text-[var(--nr-text-secondary)]'
                  }`}
                >
                  ES
                </button>
                <button
                  type="button"
                  onClick={() => setLocale('en')}
                  className={`nr-focus-ring nr-transition px-2 py-1 text-[11px] font-semibold rounded-md ${
                    locale === 'en'
                      ? 'bg-[var(--nr-surface)] text-[var(--nr-text)]'
                      : 'text-[var(--nr-text-secondary)]'
                  }`}
                >
                  EN
                </button>
              </div>

              <button
                type="button"
                onClick={toggleTheme}
                className="nr-focus-ring nr-transition inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] text-xs font-medium text-[var(--nr-text)]"
              >
                {theme === 'light' ? (
                  <Moon className="w-3.5 h-3.5 text-[var(--nr-text-secondary)]" />
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
          </div>

          {/* Form container */}
          <div className="my-auto py-6 w-full max-w-md mx-auto space-y-6">
            {viewMode === 'login' ? (
              <>
                <div>
                  <h1 className="font-display text-2xl font-bold tracking-tight text-[var(--nr-text)]">
                    {pt.auth.tenantLoginTitle}
                  </h1>
                  <p className="mt-1.5 text-xs sm:text-sm text-[var(--nr-text-secondary)]">
                    {pt.auth.tenantLoginSubtitle}
                  </p>
                </div>

                <AuthLoginForm
                  portal="TENANT"
                  onAuthenticated={() => navigateRoute('/erp')}
                  onForgotPasswordClick={() => {
                    setRecoverySent(false);
                    setViewMode('forgot');
                  }}
                />

                <div className="pt-4 border-t border-[var(--nr-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => navigateRoute('/register')}
                      className="nr-focus-ring font-semibold text-[var(--nr-primary)] hover:underline text-left rounded"
                    >
                      {pt.auth.goToRegister}
                    </button>
                    <span className="text-[var(--nr-border)]" aria-hidden="true">
                      |
                    </span>
                    <button
                      type="button"
                      onClick={() => navigateRoute('/')}
                      className="nr-focus-ring font-medium text-[var(--nr-text-secondary)] hover:text-[var(--nr-text)] hover:underline text-left rounded"
                    >
                      {locale === 'es' ? 'Ver web y planes' : 'View site & plans'}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigateRoute('/platform/login')}
                    className="nr-focus-ring inline-flex items-center gap-1 font-semibold text-[var(--nr-text)] hover:text-[var(--nr-primary)] rounded"
                  >
                    <span>{pt.auth.goToPlatformLogin}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div>
                  <h1 className="font-display text-xl font-bold text-[var(--nr-text)]">{pt.auth.forgotPasswordTitle}</h1>
                  <p className="mt-1.5 text-xs text-[var(--nr-text-secondary)]">
                    {pt.auth.forgotPasswordDesc}
                  </p>
                </div>

                {recoverySent && (
                  <div className="rounded-xl border border-[var(--nr-success-border)] bg-[var(--nr-success-bg)] p-3 text-xs text-[var(--nr-success)] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{pt.auth.forgotPasswordSent}</span>
                  </div>
                )}

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (recoveryEmail.trim()) setRecoverySent(true);
                  }}
                  className="space-y-3"
                >
                  <div>
                    <label
                      htmlFor="recovery-email"
                      className="block text-xs font-semibold text-[var(--nr-text)] mb-1"
                    >
                      {pt.auth.emailLabel}
                    </label>
                    <input
                      id="recovery-email"
                      type="email"
                      required
                      value={recoveryEmail}
                      onChange={(e) => setRecoveryEmail(e.target.value)}
                      placeholder={pt.auth.emailPlaceholder}
                      className="nr-focus-ring nr-transition w-full h-10 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-3 text-sm text-[var(--nr-text)]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="nr-focus-ring nr-transition w-full h-10 rounded-lg bg-[var(--nr-primary)] hover:bg-[var(--nr-primary-hover)] text-xs font-semibold text-[var(--nr-primary-fg)]"
                  >
                    {locale === 'es'
                      ? 'Simular envío de recuperación'
                      : 'Simulate recovery request'}
                  </button>
                </form>

                <button
                  type="button"
                  onClick={() => setViewMode('login')}
                  className="nr-focus-ring text-xs font-semibold text-[var(--nr-primary)] hover:underline rounded"
                >
                  {pt.auth.backToLogin}
                </button>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[var(--nr-border)] text-[11px] text-[var(--nr-text-secondary)] flex flex-wrap items-center justify-between gap-2">
            <span>NetsRow ERP · SaaS Multiempresa</span>
            <span className="font-mono-num">/login</span>
          </div>
        </div>

        {/* Left dark showcase column — SECOND on mobile, FIRST on desktop */}
        <div className="order-2 lg:order-1 lg:col-span-5 nr-gradient-navy relative overflow-hidden text-slate-100 p-6 sm:p-10 flex flex-col justify-between border-t lg:border-t-0 lg:border-r border-slate-800">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full opacity-60"
            style={{
              background:
                'radial-gradient(circle, rgba(16,185,129,0.16) 0%, rgba(16,185,129,0) 70%)',
            }}
          />
          <div className="relative flex flex-wrap items-center gap-3">
            <NetsRowLogo size="sm" surface="dark" />
            <div className="text-[11px] font-semibold tracking-wider text-slate-400">
              ERP SUITE · REPÚBLICA DOMINICANA
            </div>
          </div>

          <div className="relative my-8 space-y-6">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-white leading-snug">
              {pt.auth.productHighlightsTitle}
            </h2>

            <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{pt.auth.productHighlight1}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{pt.auth.productHighlight2}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{pt.auth.productHighlight3}</span>
              </li>
            </ul>

            {/* Compact product preview summary */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{locale === 'es' ? 'Control por módulos SaaS' : 'SaaS Module Control'}</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-2.5">
                  <div className="text-[11px] text-slate-400">
                    {locale === 'es' ? 'POS + Inventario' : 'POS + Inventory'}
                  </div>
                  <div className="mt-1 font-mono-num font-bold text-white">
                    {locale === 'es' ? 'En tiempo real' : 'Real-time sync'}
                  </div>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-2.5">
                  <div className="text-[11px] text-slate-400">
                    {locale === 'es' ? 'Nómina DO' : 'Payroll DO'}
                  </div>
                  <div className="mt-1 font-mono-num font-bold text-emerald-400">
                    TSS · ISR · IR-3
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative text-[11px] text-slate-400">
            {locale === 'es'
              ? 'Acceso protegido por empresa y módulos autorizados.'
              : 'Protected per tenant and contracted SaaS modules.'}
          </div>
        </div>
      </div>
    </div>
  );
};
