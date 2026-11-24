import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { createSeedPlatformState } from '../data/platformSeed';
import {
  PLATFORM_TRANSLATIONS,
  PlatformTranslations,
} from '../i18n/platformTranslations';
import {
  AuthClientError,
  loadSavedSession,
  persistSavedSession,
} from '../services/mockPlatformClient';
import { Locale, ThemeMode } from '../types/payroll';
import {
  AppRoutePath,
  AuthSession,
  LoginCredentialsInput,
  LoginResult,
  ManualPaymentInput,
  PlatformApiClient,
  PlatformScreenId,
  PlatformWorkspaceState,
  SaasPlan,
  SimulatedAuthFault,
  SupportTicketStatus,
  TenantPlanChangeInput,
  TenantRecord,
  TenantStatusChangeInput,
} from '../types/platform';

const LOCALE_STORAGE_KEY = 'netsrow_ui_locale_v1';
const THEME_STORAGE_KEY = 'netsrow_ui_theme_v1';

function readStoredLocale(fallback: Locale): Locale {
  if (typeof window === 'undefined' || !window.localStorage) return fallback;
  const v = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  return v === 'en' || v === 'es' ? v : fallback;
}

function readStoredTheme(fallback: ThemeMode): ThemeMode {
  if (typeof window === 'undefined' || !window.localStorage) return fallback;
  const v = window.localStorage.getItem(THEME_STORAGE_KEY);
  return v === 'dark' || v === 'light' ? v : fallback;
}

export interface PlatformContextValue {
  platformState: PlatformWorkspaceState;
  authSession: AuthSession | null;
  activeTenant: TenantRecord | null;
  isLoading: boolean;
  isMutating: boolean;
  errorMessage: string | null;
  successMessage: string | null;
  clearError: () => void;
  clearSuccess: () => void;

  locale: Locale;
  setLocale: (loc: Locale) => void;
  theme: ThemeMode;
  setTheme: (thm: ThemeMode) => void;
  toggleTheme: () => void;
  pt: PlatformTranslations;

  currentRoute: AppRoutePath;
  navigateRoute: (path: AppRoutePath) => void;
  activePlatformScreen: PlatformScreenId;
  setActivePlatformScreen: (screen: PlatformScreenId) => void;
  selectedTenantId: string | null;
  setSelectedTenantId: (tenantId: string | null) => void;
  openTenantDetail: (tenantId: string) => void;

  simulatedFault: SimulatedAuthFault;
  setSimulatedFault: (fault: SimulatedAuthFault) => void;

  loginWithCredentials: (input: LoginCredentialsInput) => Promise<LoginResult>;
  selectTenantSession: (pendingToken: string, tenantId: string) => Promise<void>;
  logoutSession: (targetPath?: AppRoutePath) => Promise<void>;

  updateTenantSubscription: (input: TenantPlanChangeInput) => Promise<void>;
  changeTenantStatus: (input: TenantStatusChangeInput) => Promise<void>;
  upsertPlan: (plan: SaasPlan, reason: string) => Promise<void>;
  recordManualPayment: (input: ManualPaymentInput) => Promise<void>;
  updateSupportTicket: (input: {
    ticketId: string;
    status?: SupportTicketStatus;
    assignedTo?: string;
    newInternalNote?: string;
  }) => Promise<void>;
  resetPlatformDemoData: () => Promise<void>;
}

const PlatformContext = createContext<PlatformContextValue | null>(null);

export interface PlatformProviderProps {
  children: React.ReactNode;
  apiClient: PlatformApiClient;
  currentRoute: AppRoutePath;
  onNavigateRoute: (path: AppRoutePath) => void;
  initialLocale?: Locale;
  initialTheme?: ThemeMode;
}

export function routeToPlatformScreen(path: AppRoutePath): PlatformScreenId {
  switch (path) {
    case '/platform/tenants':
      return 'platform_tenants';
    case '/platform/plans':
      return 'platform_plans';
    case '/platform/subscriptions':
      return 'platform_subscriptions';
    case '/platform/support':
      return 'platform_support';
    case '/platform/audit':
      return 'platform_audit';
    default:
      return 'platform_overview';
  }
}

export function platformScreenToRoute(screen: PlatformScreenId): AppRoutePath {
  switch (screen) {
    case 'platform_tenants':
      return '/platform/tenants';
    case 'platform_plans':
      return '/platform/plans';
    case 'platform_subscriptions':
      return '/platform/subscriptions';
    case 'platform_support':
      return '/platform/support';
    case 'platform_audit':
      return '/platform/audit';
    default:
      return '/platform';
  }
}

export function PlatformProvider({
  children,
  apiClient,
  currentRoute,
  onNavigateRoute,
  initialLocale = 'es',
  initialTheme = 'light',
}: PlatformProviderProps) {
  const [platformState, setPlatformState] = useState<PlatformWorkspaceState>(() =>
    createSeedPlatformState()
  );
  const [authSession, setAuthSession] = useState<AuthSession | null>(() =>
    loadSavedSession()
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [locale, setLocaleState] = useState<Locale>(() =>
    readStoredLocale(initialLocale)
  );
  const [theme, setThemeState] = useState<ThemeMode>(() =>
    readStoredTheme(initialTheme)
  );
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [simulatedFault, setSimulatedFault] = useState<SimulatedAuthFault>('NONE');

  const pt = PLATFORM_TRANSLATIONS[locale];

  const setLocale = useCallback((loc: Locale) => {
    setLocaleState(loc);
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, loc);
    }
  }, []);

  const setTheme = useCallback((thm: ThemeMode) => {
    setThemeState(thm);
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(THEME_STORAGE_KEY, thm);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }, [theme, setTheme]);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    apiClient
      .fetchPlatformState()
      .then((data) => {
        if (!cancelled) setPlatformState(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setErrorMessage(
            err instanceof Error ? err.message : 'Error loading platform state'
          );
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [apiClient]);

  const clearError = useCallback(() => setErrorMessage(null), []);
  const clearSuccess = useCallback(() => setSuccessMessage(null), []);

  const activePlatformScreen = useMemo(
    () => routeToPlatformScreen(currentRoute),
    [currentRoute]
  );

  const navigateRoute = useCallback(
    (path: AppRoutePath) => {
      setErrorMessage(null);
      onNavigateRoute(path);
    },
    [onNavigateRoute]
  );

  const setActivePlatformScreen = useCallback(
    (screen: PlatformScreenId) => {
      navigateRoute(platformScreenToRoute(screen));
    },
    [navigateRoute]
  );

  const openTenantDetail = useCallback(
    (tenantId: string) => {
      setSelectedTenantId(tenantId);
      navigateRoute('/platform/tenants');
    },
    [navigateRoute]
  );

  const activeTenant = useMemo(() => {
    if (!authSession || authSession.accountType !== 'TENANT_USER' || !authSession.tenantId) {
      return null;
    }
    return platformState.tenants.find((t) => t.id === authSession.tenantId) ?? null;
  }, [authSession, platformState.tenants]);

  const loginWithCredentials = useCallback(
    async (input: LoginCredentialsInput): Promise<LoginResult> => {
      setIsMutating(true);
      setErrorMessage(null);
      try {
        const res = await apiClient.login(input, simulatedFault);
        if (res.status === 'AUTHENTICATED' && res.session) {
          setAuthSession(res.session);
          persistSavedSession(res.session);
        }
        return res;
      } catch (err: unknown) {
        if (err instanceof AuthClientError && err.code === 'SESSION_EXPIRED') {
          setSimulatedFault('NONE');
        }
        throw err;
      } finally {
        setIsMutating(false);
      }
    },
    [apiClient, simulatedFault]
  );

  const selectTenantSession = useCallback(
    async (pendingToken: string, tenantId: string) => {
      setIsMutating(true);
      setErrorMessage(null);
      try {
        const sess = await apiClient.selectAuthorizedTenant(pendingToken, tenantId);
        setAuthSession(sess);
        persistSavedSession(sess);
      } finally {
        setIsMutating(false);
      }
    },
    [apiClient]
  );

  const logoutSession = useCallback(
    async (targetPath?: AppRoutePath) => {
      const wasPlatform = authSession?.accountType === 'PLATFORM_OPERATOR';
      await apiClient.logout();
      setAuthSession(null);
      persistSavedSession(null);
      setSelectedTenantId(null);
      setSuccessMessage(null);
      setErrorMessage(null);
      navigateRoute(targetPath ?? (wasPlatform ? '/platform/login' : '/login'));
    },
    [apiClient, authSession, navigateRoute]
  );

  const requireOperator = useCallback((): AuthSession => {
    if (!authSession || authSession.accountType !== 'PLATFORM_OPERATOR') {
      throw new Error(pt.auth.errPlatformForbidden);
    }
    return authSession;
  }, [authSession, pt.auth.errPlatformForbidden]);

  const updateTenantSubscription = useCallback(
    async (input: TenantPlanChangeInput) => {
      setIsMutating(true);
      setErrorMessage(null);
      try {
        const op = requireOperator();
        const next = await apiClient.updateTenantSubscription(input, op);
        setPlatformState(next);
        setSuccessMessage(
          locale === 'es'
            ? 'Plan y módulos actualizados y registrados en Auditoría.'
            : 'Plan and modules updated and logged to Audit.'
        );
      } catch (err: unknown) {
        setErrorMessage(err instanceof Error ? err.message : 'Error updating tenant');
        throw err;
      } finally {
        setIsMutating(false);
      }
    },
    [apiClient, requireOperator, locale]
  );

  const changeTenantStatus = useCallback(
    async (input: TenantStatusChangeInput) => {
      setIsMutating(true);
      setErrorMessage(null);
      try {
        const op = requireOperator();
        const next = await apiClient.changeTenantStatus(input, op);
        setPlatformState(next);
        setSuccessMessage(
          locale === 'es'
            ? input.nextStatus === 'SUSPENDED'
              ? 'Empresa suspendida conservando sus registros.'
              : 'Empresa reactivada y evento registrado en Auditoría.'
            : input.nextStatus === 'SUSPENDED'
              ? 'Company suspended with records preserved.'
              : 'Company reactivated and logged to Audit.'
        );
      } catch (err: unknown) {
        setErrorMessage(err instanceof Error ? err.message : 'Error changing status');
        throw err;
      } finally {
        setIsMutating(false);
      }
    },
    [apiClient, requireOperator, locale]
  );

  const upsertPlan = useCallback(
    async (plan: SaasPlan, reason: string) => {
      setIsMutating(true);
      setErrorMessage(null);
      try {
        const op = requireOperator();
        const next = await apiClient.upsertPlan(plan, reason, op);
        setPlatformState(next);
        setSuccessMessage(
          locale === 'es'
            ? `Plan ${plan.code} guardado. Suscripciones previas mantienen su precio acordado.`
            : `Plan ${plan.code} saved. Existing subscriptions keep their agreed rates.`
        );
      } catch (err: unknown) {
        setErrorMessage(err instanceof Error ? err.message : 'Error saving plan');
        throw err;
      } finally {
        setIsMutating(false);
      }
    },
    [apiClient, requireOperator, locale]
  );

  const recordManualPayment = useCallback(
    async (input: ManualPaymentInput) => {
      setIsMutating(true);
      setErrorMessage(null);
      try {
        const op = requireOperator();
        const next = await apiClient.recordManualPayment(input, op);
        setPlatformState(next);
        setSuccessMessage(
          locale === 'es'
            ? 'Confirmación manual de pago registrada (Solo demo) y auditada.'
            : 'Manual payment confirmation recorded (Demo only) and audited.'
        );
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error recording payment';
        if (msg.startsWith('DUPLICATE_REF:')) {
          const ref = msg.replace('DUPLICATE_REF:', '');
          setErrorMessage(
            locale === 'es'
              ? `Ya existe una confirmación registrada con la referencia ${ref}. Se evitó duplicar el registro.`
              : `A confirmation with reference ${ref} already exists. Duplicate prevented.`
          );
        } else {
          setErrorMessage(msg);
        }
        throw err;
      } finally {
        setIsMutating(false);
      }
    },
    [apiClient, requireOperator, locale]
  );

  const updateSupportTicket = useCallback(
    async (input: {
      ticketId: string;
      status?: SupportTicketStatus;
      assignedTo?: string;
      newInternalNote?: string;
    }) => {
      setIsMutating(true);
      setErrorMessage(null);
      try {
        const op = requireOperator();
        const next = await apiClient.updateSupportTicket(input, op);
        setPlatformState(next);
        setSuccessMessage(
          locale === 'es' ? 'Ticket de soporte actualizado.' : 'Support ticket updated.'
        );
      } catch (err: unknown) {
        setErrorMessage(err instanceof Error ? err.message : 'Error updating ticket');
        throw err;
      } finally {
        setIsMutating(false);
      }
    },
    [apiClient, requireOperator, locale]
  );

  const resetPlatformDemoData = useCallback(async () => {
    setIsMutating(true);
    setErrorMessage(null);
    try {
      const fresh = await apiClient.resetPlatformDemo();
      setPlatformState(fresh);
      setSelectedTenantId(null);
      setSuccessMessage(
        locale === 'es'
          ? 'Datos de demostración de plataforma restablecidos.'
          : 'Platform demo data reset.'
      );
    } finally {
      setIsMutating(false);
    }
  }, [apiClient, locale]);

  const value: PlatformContextValue = {
    platformState,
    authSession,
    activeTenant,
    isLoading,
    isMutating,
    errorMessage,
    successMessage,
    clearError,
    clearSuccess,
    locale,
    setLocale,
    theme,
    setTheme,
    toggleTheme,
    pt,
    currentRoute,
    navigateRoute,
    activePlatformScreen,
    setActivePlatformScreen,
    selectedTenantId,
    setSelectedTenantId,
    openTenantDetail,
    simulatedFault,
    setSimulatedFault,
    loginWithCredentials,
    selectTenantSession,
    logoutSession,
    updateTenantSubscription,
    changeTenantStatus,
    upsertPlan,
    recordManualPayment,
    updateSupportTicket,
    resetPlatformDemoData,
  };

  return (
    <PlatformContext.Provider value={value}>{children}</PlatformContext.Provider>
  );
}

export function usePlatform(): PlatformContextValue {
  const ctx = useContext(PlatformContext);
  if (!ctx) {
    throw new Error('usePlatform must be used inside PlatformProvider');
  }
  return ctx;
}
