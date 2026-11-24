import React from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Lock,
  LogOut,
  PauseCircle,
  Shield,
  X,
} from 'lucide-react';
import { PayrollBreakdownPanel } from '../components/PayrollBreakdownPanel';
import { SidebarNav } from '../components/SidebarNav';
import { TopBar } from '../components/TopBar';
import { usePayrollWorkspace } from '../context/PayrollWorkspaceContext';
import { AccountingScreen } from './AccountingScreen';
import { BanksTreasuryScreen } from './BanksTreasuryScreen';
import { CashboxScreen } from './CashboxScreen';
import { CatalogScreen } from './CatalogScreen';
import { CustomersScreen } from './CustomersScreen';
import { EmployeesScreen } from './EmployeesScreen';
import { InternalDocsScreen } from './InternalDocsScreen';
import { InventoryScreen } from './InventoryScreen';
import { NoveltiesScreen } from './NoveltiesScreen';
import { OverviewScreen } from './OverviewScreen';
import { PayrollConfigScreen } from './PayrollConfigScreen';
import { PayrollReviewScreen } from './PayrollReviewScreen';
import { PeriodsScreen } from './PeriodsScreen';
import { PosScreen } from './PosScreen';
import { PurchasesScreen } from './PurchasesScreen';
import { SalesScreen } from './SalesScreen';
import { SettingsScreen } from './SettingsScreen';

/**
 * Full NetsRow ERP Workspace layout.
 * Scoped class (.netsrow-payroll-shell + conditional .dark) keeps themes isolated
 * without leaking global CSS rules across external Next.js shells.
 */
export const NetsRowPayrollWorkspace: React.FC = () => {
  const {
    activeScreen,
    setActiveScreen,
    theme,
    locale,
    erpState,
    enabledModules,
    tenantStatus,
    tenantPlanLabel,
    onLogout,
    onNavigateToPlatformLogin,
    errorMessage,
    clearError,
    successMessage,
    clearSuccess,
  } = usePayrollWorkspace();

  const isPayrollRoute =
    activeScreen === 'periods' ||
    activeScreen === 'employees' ||
    activeScreen === 'novelties' ||
    activeScreen === 'payroll_review' ||
    activeScreen === 'run_history' ||
    activeScreen === 'work_risk' ||
    activeScreen === 'concept_treatment';

  const isAccountingRoute =
    activeScreen === 'accounting' || activeScreen.startsWith('accounting_');

  const payrollEnabled = enabledModules.includes('PAYROLL');
  const accountingEnabled = enabledModules.includes('ACCOUNTING');

  const gatedModuleName =
    isPayrollRoute && !payrollEnabled
      ? locale === 'es'
        ? 'Nómina DO (TSS e ISR)'
        : 'Payroll DO (TSS & ISR)'
      : isAccountingRoute && !accountingEnabled
        ? locale === 'es'
          ? 'Contabilidad General'
          : 'General Accounting'
        : null;

  const renderScreen = () => {
    if (tenantStatus === 'SUSPENDED') {
      return (
        <div className="max-w-lg mx-auto my-12 rounded-lg border border-red-200 dark:border-red-900 bg-white dark:bg-slate-900 p-6 sm:p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 flex items-center justify-center mx-auto">
            <PauseCircle className="w-6 h-6" />
          </div>
          <h1 className="font-display text-xl font-bold text-slate-900 dark:text-slate-100">
            {locale === 'es'
              ? 'Empresa temporalmente suspendida'
              : 'Company temporarily suspended'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            {locale === 'es'
              ? `El acceso operativo de ${erpState.company.name} está suspendido desde la consola de plataforma. Tus registros históricos permanecen intactos.`
              : `Operational access for ${erpState.company.name} is currently suspended by platform administration. Historical records remain preserved.`}
          </p>
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-2 h-9 px-4 rounded bg-slate-900 dark:bg-emerald-600 text-xs font-semibold text-white"
            >
              <LogOut className="w-4 h-4" />
              <span>{locale === 'es' ? 'Cerrar sesión' : 'Sign out'}</span>
            </button>
          )}
        </div>
      );
    }

    if (gatedModuleName) {
      return (
        <div className="max-w-xl mx-auto my-8 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-4">
          <div className="w-11 h-11 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
              {locale === 'es'
                ? 'Módulo no contratado en su plan'
                : 'Module not included in your plan'}
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              {locale === 'es'
                ? `Tu empresa (${erpState.company.name}) opera actualmente con ${tenantPlanLabel ?? 'su plan vigente'} y no tiene habilitado el módulo «${gatedModuleName}».`
                : `Your company (${erpState.company.name}) currently runs ${tenantPlanLabel ?? 'its active plan'} and does not have «${gatedModuleName}» enabled.`}
            </p>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              {locale === 'es'
                ? 'Un operador de plataforma puede habilitar este complemento desde Administración de NetsRow (/platform) y el acceso se desbloqueará de inmediato.'
                : 'A platform operator can activate this add-on from NetsRow Administration (/platform) to unlock access immediately.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setActiveScreen('overview')}
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{locale === 'es' ? 'Volver a Inicio' : 'Back to Overview'}</span>
            </button>
            {onNavigateToPlatformLogin && (
              <button
                type="button"
                onClick={onNavigateToPlatformLogin}
                className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <Shield className="w-4 h-4 text-emerald-600" />
                <span>
                  {locale === 'es'
                    ? 'Ir a Administración (/platform/login)'
                    : 'Open Platform Login (/platform/login)'}
                </span>
              </button>
            )}
          </div>
        </div>
      );
    }

    switch (activeScreen) {
      case 'overview':
        return <OverviewScreen />;
      case 'pos':
        return <PosScreen />;
      case 'sales_ar':
        return <SalesScreen />;
      case 'customers':
        return <CustomersScreen />;
      case 'cashbox':
      case 'cashbox_shift':
      case 'cashbox_movements':
      case 'cashbox_closing':
        return <CashboxScreen />;
      case 'inventory':
      case 'inventory_stock':
      case 'inventory_alerts':
      case 'inventory_movements':
        return <InventoryScreen />;
      case 'catalog':
      case 'catalog_products':
      case 'catalog_categories':
      case 'catalog_brands':
      case 'catalog_units':
      case 'catalog_pricelists':
        return <CatalogScreen />;
      case 'purchases_ap':
        return <PurchasesScreen />;
      case 'internal_docs':
        return <InternalDocsScreen />;
      case 'accounting':
      case 'accounting_accounts':
      case 'accounting_periods':
      case 'accounting_journal':
      case 'accounting_ledger':
      case 'accounting_trial_balance':
      case 'accounting_reconciliation':
        return <AccountingScreen />;
      case 'banks_treasury':
        return <BanksTreasuryScreen />;
      case 'periods':
        return <PeriodsScreen />;
      case 'employees':
        return <EmployeesScreen />;
      case 'novelties':
        return <NoveltiesScreen />;
      case 'payroll_review':
      case 'run_history':
        return <PayrollReviewScreen />;
      case 'work_risk':
      case 'concept_treatment':
        return <PayrollConfigScreen />;
      case 'business':
      case 'company':
      case 'branches':
      case 'users_roles':
        return <SettingsScreen />;
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

            {successMessage && (
              <div className="mb-4 flex items-center justify-between gap-3 rounded-md border border-emerald-200 dark:border-emerald-900/70 bg-emerald-50 dark:bg-emerald-950/40 px-3.5 py-2.5 text-xs text-emerald-900 dark:text-emerald-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{successMessage}</span>
                </div>
                <button
                  type="button"
                  onClick={clearSuccess}
                  className="p-1 rounded hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {renderScreen()}
          </main>

          {/* Persistent «Desglose de nómina» inspector on active Payroll routes when PAYROLL is contracted */}
          {payrollEnabled &&
            tenantStatus !== 'SUSPENDED' &&
            (activeScreen === 'payroll_review' ||
              activeScreen === 'employees' ||
              activeScreen === 'novelties' ||
              activeScreen === 'periods') && <PayrollBreakdownPanel />}
        </div>
      </div>
    </div>
  );
};
