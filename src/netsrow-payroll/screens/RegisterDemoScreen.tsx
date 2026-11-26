import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { NetsRowLogo } from '../components/NetsRowLogo';
import { usePlatform } from '../context/PlatformContext';

export const RegisterDemoScreen: React.FC = () => {
  const { locale, theme, pt, navigateRoute } = usePlatform();
  const [companyName, setCompanyName] = useState('');
  const [rnc, setRnc] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  return (
    <div
      className={`netsrow-payroll-shell min-h-screen bg-[var(--nr-bg)] text-[var(--nr-text)] flex items-center justify-center p-4 ${
        theme === 'dark' ? 'dark' : ''
      }`}
    >
      <div className="w-full max-w-md rounded-2xl border border-[var(--nr-border)] bg-[var(--nr-surface)] p-6 sm:p-8 space-y-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <NetsRowLogo size="sm" surface="auto" />
          <div className="text-[11px] font-semibold text-[var(--nr-warning)]">
            {pt.auth.demoBanner}
          </div>
        </div>

        <div>
          <h1 className="font-display text-xl font-bold tracking-tight text-[var(--nr-text)]">{pt.auth.registerTitle}</h1>
          <p className="mt-1 text-xs text-[var(--nr-text-secondary)]">
            {pt.auth.registerSubtitle}
          </p>
        </div>

        {submitted && (
          <div className="rounded-xl border border-[var(--nr-success-border)] bg-[var(--nr-success-bg)] p-3 text-xs text-[var(--nr-success)] flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
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
            <label className="block text-xs font-semibold text-[var(--nr-text)] mb-1">
              {locale === 'es' ? 'Nombre de la empresa' : 'Company name'}
            </label>
            <input
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Comercial Caribe, SRL"
              className="nr-focus-ring nr-transition w-full h-10 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-3 text-sm text-[var(--nr-text)]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--nr-text)] mb-1">RNC</label>
            <input
              required
              value={rnc}
              onChange={(e) => setRnc(e.target.value)}
              placeholder="1-30-00000-0"
              className="nr-focus-ring nr-transition w-full h-10 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-3 text-sm font-mono-num text-[var(--nr-text)]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--nr-text)] mb-1">{pt.auth.emailLabel}</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={pt.auth.emailPlaceholder}
              className="nr-focus-ring nr-transition w-full h-10 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-3 text-sm text-[var(--nr-text)]"
            />
          </div>
          <button
            type="submit"
            className="nr-focus-ring nr-transition w-full h-10 rounded-lg bg-[var(--nr-primary)] hover:bg-[var(--nr-primary-hover)] text-xs font-semibold text-[var(--nr-primary-fg)]"
          >
            {pt.auth.registerSubmit}
          </button>
        </form>

        <button
          type="button"
          onClick={() => navigateRoute('/login')}
          className="nr-focus-ring inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--nr-primary)] hover:underline rounded"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{pt.auth.backToLogin}</span>
        </button>
      </div>
    </div>
  );
};
