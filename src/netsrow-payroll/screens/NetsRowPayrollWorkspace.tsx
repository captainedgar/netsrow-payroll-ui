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
import { ElectronicInvoicingScreen } from './ElectronicInvoicingScreen';
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
type WorkspaceProps = {
  companyName?: string;
  liveCatalog?: React.ReactNode;
  sessionError?: string;
};

export const NetsRowPayrollWorkspace: React.FC<WorkspaceProps> = ({ companyName, liveCatalog, sessionError }) => {
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
    if (companyName) {
      if (['overview', 'catalog', 'catalog_products'].includes(activeScreen)) return liveCatalog;
      return (
        <div className="rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface)] p-6 space-y-4">
          <h1 className="font-display text-lg font-bold">
            {locale === 'es' ? 'Sección aún no disponible' : 'Section not available yet'}
          </h1>
          <button type="button" onClick={() => setActiveScreen('catalog_products')}
            className="nr-focus-ring text-[var(--nr-primary)] underline rounded">
            {locale === 'es' ? 'Ir al catálogo' : 'Go to catalog'}
          </button>
        </div>
      );
    }
    if (tenantStatus === 'SUSPENDED') {
      return (
        <div className="max-w-lg mx-auto my-12 rounded-2xl border border-[var(--nr-error-border)] bg-[var(--nr-surface)] p-6 sm:p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-[var(--nr-error-bg)] text-[var(--nr-error)] flex items-center justify-center mx-auto">
            <PauseCircle className="w-6 h-6" />
          </div>
          <h1 className="font-display text-xl font-bold text-[var(--nr-text)]">
            {locale === 'es'
              ? 'Empresa temporalmente suspendida'
              : 'Company temporarily suspended'}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--nr-text-secondary)]">
            {locale === 'es'
              ? `El acceso operativo de ${erpState.company.name} está suspendido desde la consola de plataforma. Tus registros históricos permanecen intactos.`
              : `Operational access for ${erpState.company.name} is currently suspended by platform administration. Historical records remain preserved.`}
          </p>
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="nr-focus-ring nr-transition inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-[var(--nr-primary)] hover:bg-[var(--nr-primary-hover)] text-xs font-semibold text-[var(--nr-primary-fg)]"
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
        <div className="max-w-xl mx-auto my-8 rounded-2xl border border-[var(--nr-border)] bg-[var(--nr-surface)] p-6 sm:p-8 space-y-4">
          <div className="w-11 h-11 rounded-xl bg-[var(--nr-warning-bg)] border border-[var(--nr-warning-border)] text-[var(--nr-warning)] flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-display text-lg sm:text-xl font-bold text-[var(--nr-text)]">
              {locale === 'es'
                ? 'Módulo no contratado en su plan'
                : 'Module not included in your plan'}
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-[var(--nr-text-secondary)]">
              {locale === 'es'
                ? `Tu empresa (${erpState.company.name}) opera actualmente con ${tenantPlanLabel ?? 'su plan vigente'} y no tiene habilitado el módulo «${gatedModuleName}».`
                : `Your company (${erpState.company.name}) currently runs ${tenantPlanLabel ?? 'its active plan'} and does not have «${gatedModuleName}» enabled.`}
            </p>
            <p className="mt-2 text-xs text-[var(--nr-text-secondary)]">
              {locale === 'es'
                ? 'Un operador de plataforma puede habilitar este complemento desde Administración de NetsRow (/platform) y el acceso se desbloqueará de inmediato.'
                : 'A platform operator can activate this add-on from NetsRow Administration (/platform) to unlock access immediately.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setActiveScreen('overview')}
              className="nr-focus-ring nr-transition inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-[var(--nr-primary)] hover:bg-[var(--nr-primary-hover)] text-xs font-semibold text-[var(--nr-primary-fg)]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{locale === 'es' ? 'Volver a Inicio' : 'Back to Overview'}</span>
            </button>
            {onNavigateToPlatformLogin && (
              <button
                type="button"
                onClick={onNavigateToPlatformLogin}
                className="nr-focus-ring nr-transition inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] text-xs font-semibold text-[var(--nr-text)] hover:bg-[var(--nr-surface-muted)]"
              >
                <Shield className="w-4 h-4 text-[var(--nr-primary)]" />
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
      case 'e_invoicing':
      case 'e_invoicing_docs':
      case 'e_invoicing_issue':
      case 'e_invoicing_lookup':
      case 'e_invoicing_sequences':
      case 'e_invoicing_config':
        return <ElectronicInvoicingScreen />;
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
      className={`netsrow-payroll-shell min-h-screen flex bg-[var(--nr-bg)] text-[var(--nr-text)] ${
        theme === 'dark' ? 'dark' : ''
      }`}
    >
      <SidebarNav companyName={companyName} />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar companyName={companyName} />

        <div className="flex-1 flex min-w-0">
          <main className="flex-1 min-w-0 p-4 sm:p-6">
            {sessionError && (
              <p role="alert" className="mb-4 rounded-xl border border-[var(--nr-error-border)] bg-[var(--nr-error-bg)] px-4 py-3 text-xs text-[var(--nr-error)]">
                {sessionError}
              </p>
            )}
            {!companyName && errorMessage && (
              <div
                role="alert"
                className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-[var(--nr-error-border)] bg-[var(--nr-error-bg)] px-4 py-3 text-xs text-[var(--nr-error)]"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
                <button
                  type="button"
                  onClick={clearError}
                  className="nr-focus-ring p-1 rounded-lg hover:opacity-80"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {!companyName && successMessage && (
              <div
                role="status"
                className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-[var(--nr-success-border)] bg-[var(--nr-success-bg)] px-4 py-3 text-xs text-[var(--nr-success)]"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMessage}</span>
                </div>
                <button
                  type="button"
                  onClick={clearSuccess}
                  className="nr-focus-ring p-1 rounded-lg hover:opacity-80"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {renderScreen()}
          </main>

          {/* Persistent «Desglose de nómina» inspector on active Payroll routes when PAYROLL is contracted */}
          {!companyName && payrollEnabled &&
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
