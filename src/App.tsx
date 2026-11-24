/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AccessRestrictedScreen,
  AppRoutePath,
  CommercialProvider,
  LandingScreen,
  MockCommercialClient,
  MockPayrollClient,
  MockPlatformClient,
  NetsRowPayrollWorkspace,
  PayrollWorkspaceProvider,
  PlansConfiguratorScreen,
  PlatformLoginScreen,
  PlatformProvider,
  PlatformWorkspace,
  RegisterDemoScreen,
  TenantLoginScreen,
  usePlatform,
} from './netsrow-payroll';

const VALID_PLATFORM_ROUTES: AppRoutePath[] = [
  '/platform',
  '/platform/tenants',
  '/platform/plans',
  '/platform/subscriptions',
  '/platform/support',
  '/platform/audit',
];

function parseAppRoute(pathname: string): AppRoutePath {
  const clean = pathname.replace(/\/+$/, '') || '/';
  if (clean === '/planes') return '/planes';
  if (clean === '/erp') return '/erp';
  if (clean === '/login') return '/login';
  if (clean === '/register') return '/register';
  if (clean === '/platform/login') return '/platform/login';
  if (clean === '/platform') return '/platform';
  if (clean === '/platform/tenants') return '/platform/tenants';
  if (clean === '/platform/plans') return '/platform/plans';
  if (clean === '/platform/subscriptions') return '/platform/subscriptions';
  if (clean === '/platform/support') return '/platform/support';
  if (clean === '/platform/audit') return '/platform/audit';
  if (clean.startsWith('/platform/')) return '/platform';
  return '/';
}

function PreviewRouterContent() {
  const {
    authSession,
    activeTenant,
    currentRoute,
    navigateRoute,
    locale,
    setLocale,
    theme,
    setTheme,
    toggleTheme,
    logoutSession,
  } = usePlatform();

  const payrollClient = useMemo(() => new MockPayrollClient(140), []);
  const commercialClient = useMemo(() => new MockCommercialClient(120), []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
  }, [theme]);

  const handleCommercialNavigate = useCallback(
    (target: string) => {
      const [rawPath, hash] = target.split('#');
      const nextRoute = parseAppRoute(rawPath || '/');
      navigateRoute(nextRoute);

      if (typeof window !== 'undefined') {
        if (hash) {
          window.setTimeout(() => {
            const el = document.getElementById(hash);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }, 60);
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    },
    [navigateRoute]
  );

  const isPlatformConsoleRoute = VALID_PLATFORM_ROUTES.includes(currentRoute);

  const renderRouteScreen = () => {
    // Public Commercial Website Routes (always accessible whether signed in or out)
    if (currentRoute === '/') {
      return <LandingScreen />;
    }
    if (currentRoute === '/planes') {
      return <PlansConfiguratorScreen />;
    }
    if (currentRoute === '/register') {
      return <RegisterDemoScreen />;
    }

    // Platform Login & Superadmin Area
    if (currentRoute === '/platform/login') {
      if (authSession?.accountType === 'PLATFORM_OPERATOR') {
        return <PlatformWorkspace />;
      }
      return <PlatformLoginScreen />;
    }

    if (isPlatformConsoleRoute) {
      if (!authSession) {
        return <PlatformLoginScreen />;
      }
      if (authSession.accountType === 'TENANT_USER') {
        return <AccessRestrictedScreen />;
      }
      return <PlatformWorkspace />;
    }

    // Client ERP Login Route
    if (currentRoute === '/login') {
      return <TenantLoginScreen />;
    }

    // Authenticated Client ERP Workspace (/erp)
    if (currentRoute === '/erp') {
      if (!authSession) {
        return <TenantLoginScreen />;
      }
      if (authSession.accountType === 'PLATFORM_OPERATOR') {
        return <PlatformWorkspace />;
      }
      return (
        <PayrollWorkspaceProvider
          key={activeTenant?.id ?? authSession.userId}
          apiClient={payrollClient}
          enableDemoRoleControl={true}
          initialScreen="overview"
          externalLocale={locale}
          onLocaleChange={setLocale}
          externalTheme={theme}
          onThemeChange={setTheme}
          tenantContext={activeTenant}
          sessionActorName={authSession.fullName}
          onLogout={() => void logoutSession('/login')}
          onNavigateToPlatformLogin={() => navigateRoute('/platform/login')}
        >
          <NetsRowPayrollWorkspace />
        </PayrollWorkspaceProvider>
      );
    }

    return <LandingScreen />;
  };

  return (
    <CommercialProvider
      apiClient={commercialClient}
      locale={locale}
      onLocaleChange={setLocale}
      theme={theme}
      onThemeToggle={toggleTheme}
      onNavigate={handleCommercialNavigate}
      isTenantAuthenticated={authSession?.accountType === 'TENANT_USER'}
    >
      {renderRouteScreen()}
    </CommercialProvider>
  );
}

export default function App() {
  const platformClient = useMemo(() => new MockPlatformClient(120), []);
  const [currentRoute, setCurrentRoute] = useState<AppRoutePath>(() =>
    typeof window !== 'undefined' ? parseAppRoute(window.location.pathname) : '/'
  );

  useEffect(() => {
    const onPopState = () => {
      setCurrentRoute(parseAppRoute(window.location.pathname));
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const handleNavigateRoute = useCallback((nextPath: AppRoutePath) => {
    setCurrentRoute(nextPath);
    if (typeof window !== 'undefined' && window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath);
    }
  }, []);

  return (
    <PlatformProvider
      apiClient={platformClient}
      currentRoute={currentRoute}
      onNavigateRoute={handleNavigateRoute}
      initialLocale="es"
      initialTheme="light"
    >
      <PreviewRouterContent />
    </PlatformProvider>
  );
}
