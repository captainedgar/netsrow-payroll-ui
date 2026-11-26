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
      className={`netsrow-payroll-shell min-h-screen flex bg-[var(--nr-bg)] text-[var(--nr-text)] ${
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

          {successMessage && (
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
      </div>
    </div>
  );
};
