import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { PayrollBreakdownPanel } from '../components/PayrollBreakdownPanel';
import { SidebarNav } from '../components/SidebarNav';
import { TopBar } from '../components/TopBar';
import { usePayrollWorkspace } from '../context/PayrollWorkspaceContext';
import { EmployeesScreen } from './EmployeesScreen';
import { ModulePlaceholderScreen } from './ModulePlaceholderScreen';
import { NoveltiesScreen } from './NoveltiesScreen';
import { PayrollReviewScreen } from './PayrollReviewScreen';
import { PeriodsScreen } from './PeriodsScreen';

/**
 * Full NetsRow ERP Payroll Workspace layout.
 * Scoped class (.netsrow-payroll-shell + conditional .dark) keeps themes isolated
 * without leaking global CSS rules across other ERP screens.
 */
export const NetsRowPayrollWorkspace: React.FC = () => {
  const { activeScreen, theme, errorMessage, clearError } = usePayrollWorkspace();

  const renderScreen = () => {
    switch (activeScreen) {
      case 'periods':
        return <PeriodsScreen />;
      case 'employees':
        return <EmployeesScreen />;
      case 'novelties':
        return <NoveltiesScreen />;
      case 'payroll_review':
      case 'run_history':
        return <PayrollReviewScreen />;
      case 'overview':
      case 'pos':
      case 'sales_ar':
      case 'customers':
      case 'cashbox':
      case 'inventory':
      case 'catalog':
      case 'internal_docs':
      case 'accounting':
      case 'work_risk':
      case 'concept_treatment':
      case 'business':
      case 'company':
      case 'branches':
      case 'users_roles':
        return <ModulePlaceholderScreen moduleId={activeScreen} />;
      default:
        return <PayrollReviewScreen />;
    }
  };

  return (
    <div
      className={`netsrow-payroll-shell min-h-screen flex bg-[#F8FAFC] text-slate-900 dark:bg-slate-950 dark:text-slate-100 ${
        theme === 'dark' ? 'dark' : ''
      }`}
    >
      <SidebarNav />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />

        <div className="flex-1 flex min-w-0">
          <main className="flex-1 min-w-0 p-4 sm:p-6">
            {errorMessage && (
              <div className="mb-4 flex items-center justify-between gap-3 rounded-md border border-red-200 dark:border-red-900/70 bg-red-50 dark:bg-red-950/40 px-3.5 py-2.5 text-xs text-red-800 dark:text-red-300">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
                <button
                  type="button"
                  onClick={clearError}
                  className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/40"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {renderScreen()}
          </main>

          {/* Persistent «Desglose de nómina» inspector on active Payroll routes */}
          {(activeScreen === 'payroll_review' ||
            activeScreen === 'employees' ||
            activeScreen === 'novelties' ||
            activeScreen === 'periods') && <PayrollBreakdownPanel />}
        </div>
      </div>
    </div>
  );
};
