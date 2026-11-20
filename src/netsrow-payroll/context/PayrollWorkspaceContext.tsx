import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { getDemoPermissions, TRANSLATIONS, Translations } from '../i18n/translations';
import {
  CreateNoveltyInput,
  DemoRoleKey,
  Employee,
  EmployeeBreakdown,
  Locale,
  NetsRowPermissions,
  PayrollApiClient,
  PayrollNovelty,
  PayrollPeriod,
  PayrollRun,
  ReviewTabId,
  ScreenId,
  ThemeMode,
  UpdateNoveltyInput,
} from '../types/payroll';

export interface PayrollWorkspaceContextValue {
  periods: PayrollPeriod[];
  employees: Employee[];
  novelties: PayrollNovelty[];
  isLoading: boolean;
  isMutating: boolean;
  actionType:
    | 'idle'
    | 'novelty'
    | 'submit_review'
    | 'return_draft'
    | 'simulate'
    | 'statutory'
    | 'approve';
  errorMessage: string | null;
  clearError: () => void;

  activeScreen: ScreenId;
  setActiveScreen: (screen: ScreenId) => void;
  activeReviewTab: ReviewTabId;
  setActiveReviewTab: (tab: ReviewTabId) => void;
  activePeriodId: string | null;
  selectPeriod: (periodId: string, navigateToReview?: boolean) => void;
  activeRunId: string | null;
  selectRun: (runId: string | null) => void;
  activeEmployeeId: string | null;
  selectEmployee: (employeeId: string | null) => void;

  activePeriod: PayrollPeriod | null;
  activeRun: PayrollRun | null;
  currentPeriodRun: PayrollRun | null;
  isViewingHistoricalRun: boolean;
  activeEmployee: Employee | null;
  activeBreakdown: EmployeeBreakdown | null;
  activePeriodNovelties: PayrollNovelty[];

  canApproveCurrentRun: boolean;
  approvalDisabledReason: string | null;

  locale: Locale;
  setLocale: (locale: Locale) => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  t: Translations;

  permissions: NetsRowPermissions;
  isDemoRoleControlEnabled: boolean;
  demoRole: DemoRoleKey;
  setDemoRole: (role: DemoRoleKey) => void;
  actorName: string;

  isMobileNavOpen: boolean;
  setIsMobileNavOpen: (open: boolean) => void;
  isMobileBreakdownOpen: boolean;
  setIsMobileBreakdownOpen: (open: boolean) => void;

  createNovelty: (input: CreateNoveltyInput) => Promise<void>;
  updateNovelty: (input: UpdateNoveltyInput) => Promise<void>;
  deleteNovelty: (noveltyId: string, periodId: string) => Promise<void>;
  submitPeriodForReview: (periodId: string) => Promise<void>;
  returnPeriodToDraft: (periodId: string) => Promise<void>;
  runSimulation: (periodId: string) => Promise<void>;
  runStatutoryCalculation: (periodId: string) => Promise<void>;
  approvePayrollRun: (periodId: string, runId: string) => Promise<void>;
}

const PayrollWorkspaceContext = createContext<PayrollWorkspaceContextValue | null>(null);

export interface PayrollWorkspaceProviderProps {
  children: React.ReactNode;
  apiClient: PayrollApiClient;
  sessionPermissions?: NetsRowPermissions;
  sessionActorName?: string;
  enableDemoRoleControl?: boolean;
  initialScreen?: ScreenId;
  initialLocale?: Locale;
  initialTheme?: ThemeMode;
  onNavigateScreen?: (screen: ScreenId) => void;
}

export function PayrollWorkspaceProvider({
  children,
  apiClient,
  sessionPermissions,
  sessionActorName,
  enableDemoRoleControl = true,
  initialScreen = 'payroll_review',
  initialLocale = 'es',
  initialTheme = 'light',
  onNavigateScreen,
}: PayrollWorkspaceProviderProps) {
  const [periods, setPeriods] = useState<PayrollPeriod[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [novelties, setNovelties] = useState<PayrollNovelty[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMutating, setIsMutating] = useState<boolean>(false);
  const [actionType, setActionType] =
    useState<PayrollWorkspaceContextValue['actionType']>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [activeScreen, setActiveScreenState] = useState<ScreenId>(initialScreen);
  const [activeReviewTab, setActiveReviewTab] = useState<ReviewTabId>('all');
  const [activePeriodId, setActivePeriodId] = useState<string | null>(null);
  const [activeRunId, setActiveRunId] = useState<string | null>(null);
  const [activeEmployeeId, setActiveEmployeeId] = useState<string | null>(null);

  const [locale, setLocale] = useState<Locale>(initialLocale);
  const [theme, setTheme] = useState<ThemeMode>(initialTheme);
  const [demoRole, setDemoRole] = useState<DemoRoleKey>('payroll_admin');

  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);
  const [isMobileBreakdownOpen, setIsMobileBreakdownOpen] = useState<boolean>(false);

  const t = TRANSLATIONS[locale];

  const permissions = useMemo<NetsRowPermissions>(() => {
    if (sessionPermissions) return sessionPermissions;
    return getDemoPermissions(demoRole);
  }, [sessionPermissions, demoRole]);

  const actorName = useMemo(() => {
    if (sessionActorName) return sessionActorName;
    return demoRole === 'payroll_admin'
      ? 'Lic. Altagracia Castillo'
      : 'Consulta Demo';
  }, [sessionActorName, demoRole]);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    apiClient
      .fetchWorkspaceData()
      .then((payload) => {
        if (cancelled) return;
        setPeriods(payload.periods);
        setEmployees(payload.employees);
        setNovelties(payload.novelties);

        const defaultPeriod =
          payload.periods.find((p) => p.id === 'per-2026-10') ??
          payload.periods[0] ??
          null;
        if (defaultPeriod) {
          setActivePeriodId((prev) => prev ?? defaultPeriod.id);
          setActiveRunId((prev) => prev ?? defaultPeriod.currentRunId ?? null);
        }
        const defaultEmployee = payload.employees[0] ?? null;
        if (defaultEmployee) {
          setActiveEmployeeId((prev) => prev ?? defaultEmployee.id);
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setErrorMessage(err instanceof Error ? err.message : 'Error loading payroll data');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [apiClient]);

  const setActiveScreen = useCallback(
    (screen: ScreenId) => {
      if (screen === 'run_history') {
        setActiveScreenState('payroll_review');
        setActiveReviewTab('history');
        onNavigateScreen?.('payroll_review');
      } else {
        setActiveScreenState(screen);
        onNavigateScreen?.(screen);
      }
      setIsMobileNavOpen(false);
    },
    [onNavigateScreen]
  );

  const selectPeriod = useCallback(
    (periodId: string, navigateToReview = false) => {
      setActivePeriodId(periodId);
      const target = periods.find((p) => p.id === periodId);
      setActiveRunId(target?.currentRunId ?? null);
      if (navigateToReview) {
        setActiveScreenState('payroll_review');
        setActiveReviewTab('all');
        onNavigateScreen?.('payroll_review');
      }
      setIsMobileNavOpen(false);
    },
    [periods, onNavigateScreen]
  );

  const selectRun = useCallback((runId: string | null) => {
    setActiveRunId(runId);
  }, []);

  const selectEmployee = useCallback((employeeId: string | null) => {
    setActiveEmployeeId(employeeId);
    if (employeeId) {
      setIsMobileBreakdownOpen(true);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const clearError = useCallback(() => setErrorMessage(null), []);

  const activePeriod = useMemo(
    () => periods.find((p) => p.id === activePeriodId) ?? null,
    [periods, activePeriodId]
  );

  const currentPeriodRun = useMemo(() => {
    if (!activePeriod || !activePeriod.currentRunId) return null;
    return activePeriod.runs.find((r) => r.id === activePeriod.currentRunId) ?? null;
  }, [activePeriod]);

  const activeRun = useMemo(() => {
    if (!activePeriod) return null;
    if (activeRunId) {
      const matched = activePeriod.runs.find((r) => r.id === activeRunId);
      if (matched) return matched;
    }
    return currentPeriodRun;
  }, [activePeriod, activeRunId, currentPeriodRun]);

  const isViewingHistoricalRun = Boolean(
    activePeriod &&
      activeRun &&
      activePeriod.currentRunId &&
      activeRun.id !== activePeriod.currentRunId
  );

  const activeEmployee = useMemo(
    () => employees.find((e) => e.id === activeEmployeeId) ?? null,
    [employees, activeEmployeeId]
  );

  const activeBreakdown = useMemo(() => {
    if (!activeRun || !activeEmployeeId) return null;
    return activeRun.breakdowns.find((b) => b.employeeId === activeEmployeeId) ?? null;
  }, [activeRun, activeEmployeeId]);

  const activePeriodNovelties = useMemo(
    () => (activePeriodId ? novelties.filter((n) => n.periodId === activePeriodId) : []),
    [novelties, activePeriodId]
  );

  const { canApproveCurrentRun, approvalDisabledReason } = useMemo(() => {
    if (!activePeriod || activePeriod.status === 'APPROVED') {
      return { canApproveCurrentRun: false, approvalDisabledReason: null };
    }
    if (!permissions.canApprovePayroll) {
      return {
        canApproveCurrentRun: false,
        approvalDisabledReason: t.reviewScreen.approvalBlockedPermission,
      };
    }
    if (isViewingHistoricalRun) {
      return {
        canApproveCurrentRun: false,
        approvalDisabledReason: t.reviewScreen.approvalBlockedHistorical,
      };
    }
    if (
      activePeriod.status !== 'IN_REVIEW' ||
      !activeRun ||
      !activeRun.isCurrent ||
      activeRun.phase !== 'STATUTORY_REVIEW' ||
      activeRun.condition !== 'READY_FOR_FINAL_REVIEW'
    ) {
      return {
        canApproveCurrentRun: false,
        approvalDisabledReason: t.reviewScreen.approvalBlockedIncomplete,
      };
    }
    return { canApproveCurrentRun: true, approvalDisabledReason: null };
  }, [activePeriod, activeRun, isViewingHistoricalRun, permissions.canApprovePayroll, t]);

  const replacePeriod = useCallback((updatedPeriod: PayrollPeriod) => {
    setPeriods((prev) =>
      prev.map((p) => (p.id === updatedPeriod.id ? updatedPeriod : p))
    );
    setActiveRunId(updatedPeriod.currentRunId);
  }, []);

  const createNovelty = useCallback(
    async (input: CreateNoveltyInput) => {
      setIsMutating(true);
      setActionType('novelty');
      setErrorMessage(null);
      try {
        const created = await apiClient.createNovelty(input);
        setNovelties((prev) => [created, ...prev]);
      } catch (err: unknown) {
        setErrorMessage(err instanceof Error ? err.message : 'Error creating novelty');
        throw err;
      } finally {
        setIsMutating(false);
        setActionType('idle');
      }
    },
    [apiClient]
  );

  const updateNovelty = useCallback(
    async (input: UpdateNoveltyInput) => {
      setIsMutating(true);
      setActionType('novelty');
      setErrorMessage(null);
      try {
        const updated = await apiClient.updateNovelty(input);
        setNovelties((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
      } catch (err: unknown) {
        setErrorMessage(err instanceof Error ? err.message : 'Error updating novelty');
        throw err;
      } finally {
        setIsMutating(false);
        setActionType('idle');
      }
    },
    [apiClient]
  );

  const deleteNovelty = useCallback(
    async (noveltyId: string, periodId: string) => {
      setIsMutating(true);
      setActionType('novelty');
      setErrorMessage(null);
      try {
        await apiClient.deleteNovelty(noveltyId, periodId);
        setNovelties((prev) => prev.filter((n) => n.id !== noveltyId));
      } catch (err: unknown) {
        setErrorMessage(err instanceof Error ? err.message : 'Error deleting novelty');
        throw err;
      } finally {
        setIsMutating(false);
        setActionType('idle');
      }
    },
    [apiClient]
  );

  const submitPeriodForReview = useCallback(
    async (periodId: string) => {
      setIsMutating(true);
      setActionType('submit_review');
      setErrorMessage(null);
      try {
        const updated = await apiClient.submitPeriodForReview(periodId, actorName);
        replacePeriod(updated);
      } catch (err: unknown) {
        setErrorMessage(err instanceof Error ? err.message : 'Error submitting period');
      } finally {
        setIsMutating(false);
        setActionType('idle');
      }
    },
    [apiClient, actorName, replacePeriod]
  );

  const returnPeriodToDraft = useCallback(
    async (periodId: string) => {
      setIsMutating(true);
      setActionType('return_draft');
      setErrorMessage(null);
      try {
        const updated = await apiClient.returnPeriodToDraft(periodId, actorName);
        replacePeriod(updated);
      } catch (err: unknown) {
        setErrorMessage(
          err instanceof Error ? err.message : 'Error returning period to draft'
        );
      } finally {
        setIsMutating(false);
        setActionType('idle');
      }
    },
    [apiClient, actorName, replacePeriod]
  );

  const runSimulation = useCallback(
    async (periodId: string) => {
      setIsMutating(true);
      setActionType('simulate');
      setErrorMessage(null);
      try {
        const updated = await apiClient.runSimulation(periodId, actorName);
        replacePeriod(updated);
        setActiveReviewTab((prev) => (prev === 'all' ? 'all' : 'simulation'));
      } catch (err: unknown) {
        setErrorMessage(err instanceof Error ? err.message : 'Error running simulation');
      } finally {
        setIsMutating(false);
        setActionType('idle');
      }
    },
    [apiClient, actorName, replacePeriod]
  );

  const runStatutoryCalculation = useCallback(
    async (periodId: string) => {
      setIsMutating(true);
      setActionType('statutory');
      setErrorMessage(null);
      try {
        const updated = await apiClient.runStatutoryCalculation(periodId, actorName);
        replacePeriod(updated);
        setActiveReviewTab((prev) => (prev === 'all' ? 'all' : 'statutory'));
      } catch (err: unknown) {
        setErrorMessage(
          err instanceof Error ? err.message : 'Error running statutory TSS/ISR'
        );
      } finally {
        setIsMutating(false);
        setActionType('idle');
      }
    },
    [apiClient, actorName, replacePeriod]
  );

  const approvePayrollRun = useCallback(
    async (periodId: string, runId: string) => {
      setIsMutating(true);
      setActionType('approve');
      setErrorMessage(null);
      try {
        const updated = await apiClient.approvePayrollRun(periodId, runId, actorName);
        replacePeriod(updated);
      } catch (err: unknown) {
        setErrorMessage(err instanceof Error ? err.message : 'Error approving payroll');
      } finally {
        setIsMutating(false);
        setActionType('idle');
      }
    },
    [apiClient, actorName, replacePeriod]
  );

  const value: PayrollWorkspaceContextValue = {
    periods,
    employees,
    novelties,
    isLoading,
    isMutating,
    actionType,
    errorMessage,
    clearError,
    activeScreen,
    setActiveScreen,
    activeReviewTab,
    setActiveReviewTab,
    activePeriodId,
    selectPeriod,
    activeRunId,
    selectRun,
    activeEmployeeId,
    selectEmployee,
    activePeriod,
    activeRun,
    currentPeriodRun,
    isViewingHistoricalRun,
    activeEmployee,
    activeBreakdown,
    activePeriodNovelties,
    canApproveCurrentRun,
    approvalDisabledReason,
    locale,
    setLocale,
    theme,
    setTheme,
    toggleTheme,
    t,
    permissions,
    isDemoRoleControlEnabled: enableDemoRoleControl && !sessionPermissions,
    demoRole,
    setDemoRole,
    actorName,
    isMobileNavOpen,
    setIsMobileNavOpen,
    isMobileBreakdownOpen,
    setIsMobileBreakdownOpen,
    createNovelty,
    updateNovelty,
    deleteNovelty,
    submitPeriodForReview,
    returnPeriodToDraft,
    runSimulation,
    runStatutoryCalculation,
    approvePayrollRun,
  };

  return (
    <PayrollWorkspaceContext.Provider value={value}>
      {children}
    </PayrollWorkspaceContext.Provider>
  );
}

export function usePayrollWorkspace(): PayrollWorkspaceContextValue {
  const ctx = useContext(PayrollWorkspaceContext);
  if (!ctx) {
    throw new Error('usePayrollWorkspace must be used inside PayrollWorkspaceProvider');
  }
  return ctx;
}
