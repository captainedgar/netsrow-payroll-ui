import React, { useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, X } from 'lucide-react';
import { PlatformSidebar } from '../components/PlatformSidebar';
import { PlatformTopBar } from '../components/PlatformTopBar';
import { usePlatform } from '../context/PlatformContext';
import { PlatformAuditScreen } from './PlatformAuditScreen';
import { PlatformOverviewScreen } from './PlatformOverviewScreen';
import { PlatformPlansScreen } from './PlatformPlansScreen';
import { PlatformSubscriptionsScreen } from './PlatformSubscriptionsScreen';
import { PlatformSupportScreen } from './PlatformSupportScreen';
import { PlatformTenantsScreen } from './PlatformTenantsScreen';

export const PlatformWorkspace: React.FC = () => {
  const {
    activePlatformScreen,
    theme,
    errorMessage,
    clearError,
    successMessage,
    clearSuccess,
  } = usePlatform();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileTriggerRef = useRef<HTMLButtonElement | null>(null);

  const renderScreen = () => {
    switch (activePlatformScreen) {
      case 'platform_tenants':
        return <PlatformTenantsScreen />;
      case 'platform_plans':
        return <PlatformPlansScreen />;
      case 'platform_subscriptions':
        return <PlatformSubscriptionsScreen />;
      case 'platform_support':
        return <PlatformSupportScreen />;
      case 'platform_audit':
        return <PlatformAuditScreen />;
      default:
        return <PlatformOverviewScreen />;
    }
  };

  return (
    <div
      className={`netsrow-payroll-shell min-h-screen flex bg-[#F8FAFC] text-slate-900 dark:bg-slate-950 dark:text-slate-100 ${
        theme === 'dark' ? 'dark' : ''
      }`}
    >
      <PlatformSidebar
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        mobileTriggerRef={mobileTriggerRef}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <PlatformTopBar
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          mobileTriggerRef={mobileTriggerRef}
        />

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
      </div>
    </div>
  );
};
