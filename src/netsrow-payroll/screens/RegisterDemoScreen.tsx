import React, { useState } from 'react';
import { ArrowLeft, Building2, CheckCircle2 } from 'lucide-react';
import { usePlatform } from '../context/PlatformContext';

export const RegisterDemoScreen: React.FC = () => {
  const { locale, theme, pt, navigateRoute } = usePlatform();
  const [companyName, setCompanyName] = useState('');
  const [rnc, setRnc] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  return (
    <div
      className={`netsrow-payroll-shell min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex items-center justify-center p-4 ${
        theme === 'dark' ? 'dark' : ''
      }`}
    >
      <div className="w-full max-w-md rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-5 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-md bg-emerald-600 flex items-center justify-center text-white shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <div className="font-display text-base font-bold">NetsRow ERP</div>
            <div className="text-[11px] font-semibold text-amber-700 dark:text-amber-300">
              {pt.auth.demoBanner}
            </div>
          </div>
        </div>

        <div>
          <h1 className="font-display text-xl font-bold">{pt.auth.registerTitle}</h1>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
            {pt.auth.registerSubtitle}
          </p>
        </div>

        {submitted && (
          <div className="rounded-md border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 p-3 text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{pt.auth.registerSuccess}</span>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (companyName.trim() && email.trim()) setSubmitted(true);
          }}
          className="space-y-3"
        >
          <div>
            <label className="block text-xs font-semibold mb-1">
              {locale === 'es' ? 'Nombre de la empresa' : 'Company name'}
            </label>
            <input
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Comercial Caribe, SRL"
              className="w-full h-10 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">RNC</label>
            <input
              required
              value={rnc}
              onChange={(e) => setRnc(e.target.value)}
              placeholder="1-30-00000-0"
              className="w-full h-10 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm font-mono-num"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">{pt.auth.emailLabel}</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={pt.auth.emailPlaceholder}
              className="w-full h-10 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm"
            />
          </div>
          <button
            type="submit"
            className="w-full h-10 rounded-md bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white"
          >
            {pt.auth.registerSubmit}
          </button>
        </form>

        <button
          type="button"
          onClick={() => navigateRoute('/login')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{pt.auth.backToLogin}</span>
        </button>
      </div>
    </div>
  );
};
