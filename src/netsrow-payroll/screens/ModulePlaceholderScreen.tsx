import React from 'react';
import { ArrowLeft, CalendarDays, CheckCircle2, Layers } from 'lucide-react';
import { usePayrollWorkspace } from '../context/PayrollWorkspaceContext';
import { ScreenId } from '../types/payroll';

export interface ModulePlaceholderScreenProps {
  moduleId: Extract<
    ScreenId,
    | 'overview'
    | 'pos'
    | 'sales_ar'
    | 'customers'
    | 'cashbox'
    | 'inventory'
    | 'catalog'
    | 'internal_docs'
    | 'accounting'
    | 'work_risk'
    | 'concept_treatment'
    | 'business'
    | 'company'
    | 'branches'
    | 'users_roles'
  >;
}

export const ModulePlaceholderScreen: React.FC<ModulePlaceholderScreenProps> = ({
  moduleId,
}) => {
  const { t, setActiveScreen } = usePayrollWorkspace();
  const info = t.placeholderScreen.modules[moduleId];

  return (
    <div className="max-w-3xl rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-5">
      <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
        <Layers className="w-4 h-4" />
        <span>{t.placeholderScreen.referenceBadge}</span>
      </div>
      <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
        {info.title}
      </h1>
      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        {info.summary}
      </p>

      <div className="rounded border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-4 space-y-2">
        {info.capabilities.map((cap) => (
          <div
            key={cap}
            className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{cap}</span>
          </div>
        ))}
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400">
        {t.placeholderScreen.descriptionPrefix}
      </p>

      <div className="flex flex-wrap items-center gap-2.5 pt-2">
        <button
          type="button"
          onClick={() => setActiveScreen('payroll_review')}
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t.placeholderScreen.returnToPayroll}</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveScreen('periods')}
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          <CalendarDays className="w-3.5 h-3.5" />
          <span>{t.placeholderScreen.openPeriods}</span>
        </button>
      </div>
    </div>
  );
};
