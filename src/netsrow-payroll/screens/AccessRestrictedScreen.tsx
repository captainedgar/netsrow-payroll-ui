import React from 'react';
import { ArrowLeft, LogOut, ShieldAlert } from 'lucide-react';
import { usePlatform } from '../context/PlatformContext';

export const AccessRestrictedScreen: React.FC = () => {
  const { authSession, activeTenant, theme, pt, navigateRoute, logoutSession } =
    usePlatform();

  return (
    <div
      className={`netsrow-payroll-shell min-h-screen bg-[var(--nr-bg)] text-[var(--nr-text)] flex items-center justify-center p-4 ${
        theme === 'dark' ? 'dark' : ''
      }`}
    >
      <div className="w-full max-w-lg rounded-2xl border border-[var(--nr-error-border)] bg-[var(--nr-surface)] p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-[var(--nr-error-bg)] border border-[var(--nr-error-border)] flex items-center justify-center text-[var(--nr-error)] shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="font-mono-num text-xs font-bold text-[var(--nr-error)]">
              HTTP 403 · /platform
            </div>
            <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-[var(--nr-text)] mt-0.5">
              {pt.auth.restrictedTitle}
            </h1>
          </div>
        </div>

        <div className="space-y-2 text-xs sm:text-sm text-[var(--nr-text-secondary)]">
          <p>{pt.auth.restrictedBody}</p>
          <p>{pt.auth.restrictedReason}</p>
        </div>

        {authSession && (
          <div className="rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] p-3 text-xs space-y-1">
            <div className="font-semibold text-[var(--nr-text)]">
              {authSession.fullName} · {authSession.email}
            </div>
            {activeTenant && (
              <div className="text-[var(--nr-text-secondary)]">
                {activeTenant.name} ({activeTenant.code})
              </div>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigateRoute('/erp')}
            className="nr-focus-ring nr-transition inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-[var(--nr-primary)] hover:bg-[var(--nr-primary-hover)] text-xs font-semibold text-[var(--nr-primary-fg)]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{pt.auth.backToMyErp}</span>
          </button>

          <button
            type="button"
            onClick={() => logoutSession('/platform/login')}
            className="nr-focus-ring nr-transition inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] text-xs font-semibold text-[var(--nr-text)] hover:bg-[var(--nr-surface-muted)]"
          >
            <LogOut className="w-4 h-4" />
            <span>{pt.auth.logoutButton}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
