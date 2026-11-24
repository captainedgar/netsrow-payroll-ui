import React from 'react';
import { ArrowLeft, LogOut, ShieldAlert } from 'lucide-react';
import { usePlatform } from '../context/PlatformContext';

export const AccessRestrictedScreen: React.FC = () => {
  const { authSession, activeTenant, theme, pt, navigateRoute, logoutSession } =
    usePlatform();

  return (
    <div
      className={`netsrow-payroll-shell min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex items-center justify-center p-4 ${
        theme === 'dark' ? 'dark' : ''
      }`}
    >
      <div className="w-full max-w-lg rounded-lg border border-red-200 dark:border-red-900/70 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-lg bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="font-mono-num text-xs font-bold text-red-700 dark:text-red-400">
              HTTP 403 · /platform
            </div>
            <h1 className="font-display text-xl sm:text-2xl font-bold mt-0.5">
              {pt.auth.restrictedTitle}
            </h1>
          </div>
        </div>

        <div className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          <p>{pt.auth.restrictedBody}</p>
          <p>{pt.auth.restrictedReason}</p>
        </div>

        {authSession && (
          <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-3 text-xs space-y-1">
            <div className="font-semibold text-slate-900 dark:text-slate-100">
              {authSession.fullName} · {authSession.email}
            </div>
            {activeTenant && (
              <div className="text-slate-500 dark:text-slate-400">
                {activeTenant.name} ({activeTenant.code})
              </div>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigateRoute('/erp')}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{pt.auth.backToMyErp}</span>
          </button>

          <button
            type="button"
            onClick={() => logoutSession('/platform/login')}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-md border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <LogOut className="w-4 h-4" />
            <span>{pt.auth.logoutButton}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
