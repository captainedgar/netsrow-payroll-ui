import React, { useState } from 'react';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Moon,
  ShieldCheck,
  Sun,
} from 'lucide-react';
import { AuthLoginForm } from '../components/AuthLoginForm';
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
      className={`netsrow-payroll-shell min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col ${
        theme === 'dark' ? 'dark' : ''
      }`}
    >
      <div className="flex-1 flex flex-col lg:grid lg:grid-cols-12">
        {/* Form column — FIRST on mobile (390px) so form is immediately visible */}
        <div className="order-1 lg:order-2 lg:col-span-7 flex flex-col justify-between bg-white dark:bg-slate-900 px-5 py-6 sm:px-10 sm:py-8">
          {/* Top utility bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              <button
                type="button"
                onClick={() => navigateRoute('/')}
                className="font-semibold text-slate-800 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
              >
                NetsRow ERP
              </button>
              <span aria-hidden="true">·</span>
              <span className="text-amber-700 dark:text-amber-300 font-semibold">
                {pt.auth.demoBanner}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div
                role="group"
                aria-label="Language"
                className="inline-flex items-center rounded border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 p-0.5"
              >
                <button
                  type="button"
                  onClick={() => setLocale('es')}
                  className={`px-2 py-1 text-[11px] font-semibold rounded-sm ${
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
                  className={`px-2 py-1 text-[11px] font-semibold rounded-sm ${
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
                className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium"
              >
                {theme === 'light' ? (
                  <Moon className="w-3.5 h-3.5 text-slate-600" />
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
                  <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {pt.auth.tenantLoginTitle}
                  </h1>
                  <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
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

                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => navigateRoute('/register')}
                      className="font-semibold text-emerald-700 dark:text-emerald-400 hover:underline text-left"
                    >
                      {pt.auth.goToRegister}
                    </button>
                    <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">
                      |
                    </span>
                    <button
                      type="button"
                      onClick={() => navigateRoute('/')}
                      className="font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:underline text-left"
                    >
                      {locale === 'es' ? 'Ver web y planes' : 'View site & plans'}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigateRoute('/platform/login')}
                    className="inline-flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400"
                  >
                    <span>{pt.auth.goToPlatformLogin}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div>
                  <h1 className="font-display text-xl font-bold">{pt.auth.forgotPasswordTitle}</h1>
                  <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400">
                    {pt.auth.forgotPasswordDesc}
                  </p>
                </div>

                {recoverySent && (
                  <div className="rounded-md border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 p-3 text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
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
                      className="block text-xs font-semibold mb-1"
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
                      className="w-full h-10 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full h-10 rounded-md bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white"
                  >
                    {locale === 'es'
                      ? 'Simular envío de recuperación'
                      : 'Simulate recovery request'}
                  </button>
                </form>

                <button
                  type="button"
                  onClick={() => setViewMode('login')}
                  className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
                >
                  {pt.auth.backToLogin}
                </button>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap items-center justify-between gap-2">
            <span>NetsRow ERP · SaaS Multiempresa</span>
            <span>/login</span>
          </div>
        </div>

        {/* Left dark showcase column — SECOND on mobile, FIRST on desktop */}
        <div className="order-2 lg:order-1 lg:col-span-5 bg-[#0F172A] text-slate-100 p-6 sm:p-10 flex flex-col justify-between border-t lg:border-t-0 lg:border-r border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-emerald-600 flex items-center justify-center text-white shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="font-display text-lg font-bold tracking-tight text-white">
                NetsRow ERP
              </div>
              <div className="text-[11px] font-semibold tracking-wider text-slate-400">
                ERP SUITE · REPÚBLICA DOMINICANA
              </div>
            </div>
          </div>

          <div className="my-8 space-y-6">
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
            <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-4 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{locale === 'es' ? 'Control por módulos SaaS' : 'SaaS Module Control'}</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded border border-slate-800 bg-slate-950/60 p-2.5">
                  <div className="text-[11px] text-slate-400">
                    {locale === 'es' ? 'POS + Inventario' : 'POS + Inventory'}
                  </div>
                  <div className="mt-1 font-mono-num font-bold text-white">
                    {locale === 'es' ? 'En tiempo real' : 'Real-time sync'}
                  </div>
                </div>
                <div className="rounded border border-slate-800 bg-slate-950/60 p-2.5">
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

          <div className="text-[11px] text-slate-400">
            {locale === 'es'
              ? 'Acceso protegido por empresa y módulos autorizados.'
              : 'Protected per tenant and contracted SaaS modules.'}
          </div>
        </div>
      </div>
    </div>
  );
};
