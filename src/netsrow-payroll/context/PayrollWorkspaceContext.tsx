import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { createSeedEInvoicingState } from '../data/eInvoicingSeed';
import { createEmptyErpState } from '../data/emptyErpState';
import { createSeedErpState } from '../data/erpSeed';
import { getDemoPermissions, TRANSLATIONS, Translations } from '../i18n/translations';
import {
  buildDeterministicSecurityCode,
  buildEcfQrUrl,
  buildEcfXml,
  buildTrackId,
  cleanTaxId,
  formatENcf,
  getEcfTypeMeta,
  validateDominicanTaxId,
} from '../services/eInvoicingEngine';
import {
  EcfConfigState,
  EcfLineItem,
  EcfSequenceRange,
  EcfSimulationOutcome,
  EcfStatus,
  EcfTypeCode,
  ElectronicInvoice,
} from '../types/einvoicing';
import {
  AccountingPeriod,
  BankTransaction,
  Branch,
  BusinessSettings,
  CatalogProduct,
  CompanyProfile,
  ConceptTreatmentRule,
  Customer,
  ErpDemoState,
  ErpRoleDefinition,
  ErpUser,
  GlAccount,
  JournalEntryLine,
  PaymentMethod,
  PriceList,
  ProductBrand,
  ProductCategory,
  UnitOfMeasure,
  WorkRiskRule,
} from '../types/erp';
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
import { SaasModuleCode, TenantRecord, TenantStatus } from '../types/platform';

const ALL_SAAS_MODULES: SaasModuleCode[] = [
  'CORE_ERP',
  'INVENTORY_CATALOG',
  'POS_CASHBOX',
  'MULTI_BRANCH',
  'PAYROLL',
  'ACCOUNTING',
];

function nowStamp(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${d} ${hh}:${mm}`;
}

function todayIso(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export interface PosSaleInput {
  customerId: string;
  paymentMethod: PaymentMethod;
  discountPercent: number;
  items: { productId: string; quantity: number }[];
  ecfType?: EcfTypeCode | 'NONE';
}

export interface IssueEcfInput {
  ecfType: EcfTypeCode;
  saleId?: string | null;
  buyerId?: string;
  buyerName: string;
  buyerRnc: string;
  buyerType: ElectronicInvoice['buyerType'];
  paymentMethod: ElectronicInvoice['paymentMethod'];
  modifiedENcf?: string;
  modificationCode?: '01' | '02' | '03';
  discountAmount?: number;
  simulationOutcome?: EcfSimulationOutcome;
  items: {
    productId?: string;
    sku?: string;
    descriptionEs: string;
    descriptionEn: string;
    unitCode: string;
    quantity: number;
    unitPrice: number;
    taxableItbis: boolean;
  }[];
}

export interface EcfDraftPrefill {
  ecfType: EcfTypeCode;
  saleId?: string | null;
  buyerId?: string;
  buyerName: string;
  buyerRnc: string;
  buyerType: ElectronicInvoice['buyerType'];
  paymentMethod: ElectronicInvoice['paymentMethod'];
  modifiedENcf?: string;
  modificationCode?: '01' | '02' | '03';
  discountAmount?: number;
  items: IssueEcfInput['items'];
}

export interface EcfLookupPrefill {
  emitterRnc: string;
  eNcf: string;
  buyerRnc: string;
  securityCode: string;
}

export interface StockAdjustmentInput {
  productId: string;
  direction: 'IN' | 'OUT';
  quantity: number;
  reason: string;
}

export interface CreditPurchaseInput {
  supplierId: string;
  productId: string;
  quantity: number;
  unitCost: number;
  dueDate: string;
  notes: string;
}

export interface PayrollWorkspaceContextValue {
  periods: PayrollPeriod[];
  employees: Employee[];
  novelties: PayrollNovelty[];
  erpState: ErpDemoState;
  activeBranch: Branch | null;
  isLoading: boolean;
  isMutating: boolean;
  actionType:
    | 'idle'
    | 'novelty'
    | 'submit_review'
    | 'return_draft'
    | 'simulate'
    | 'statutory'
    | 'approve'
    | 'erp';
  errorMessage: string | null;
  clearError: () => void;
  successMessage: string | null;
  clearSuccess: () => void;
  notifySuccess: (msg: string) => void;

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

  selectedAccountId: string | null;
  setSelectedAccountId: (accountId: string | null) => void;
  openAccountLedger: (accountId: string) => void;
  selectedSaleId: string | null;
  setSelectedSaleId: (saleId: string | null) => void;
  selectedDocumentId: string | null;
  setSelectedDocumentId: (docId: string | null) => void;

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

  // Multi-tenant SaaS gating & auth integration
  enabledModules: SaasModuleCode[];
  tenantStatus: TenantStatus;
  tenantPlanLabel: string | null;
  onLogout?: () => void;
  onNavigateToPlatformLogin?: () => void;

  isMobileNavOpen: boolean;
  setIsMobileNavOpen: (open: boolean) => void;
  isMobileBreakdownOpen: boolean;
  setIsMobileBreakdownOpen: (open: boolean) => void;

  // Payroll actions
  createNovelty: (input: CreateNoveltyInput) => Promise<void>;
  updateNovelty: (input: UpdateNoveltyInput) => Promise<void>;
  deleteNovelty: (noveltyId: string, periodId: string) => Promise<void>;
  submitPeriodForReview: (periodId: string) => Promise<void>;
  returnPeriodToDraft: (periodId: string) => Promise<void>;
  runSimulation: (periodId: string) => Promise<void>;
  runStatutoryCalculation: (periodId: string) => Promise<void>;
  approvePayrollRun: (periodId: string, runId: string) => Promise<void>;

  // ERP actions & state persistence
  resetDemoData: () => Promise<void>;
  updateBusinessSettings: (next: BusinessSettings) => Promise<void>;
  updateCompanyProfile: (next: CompanyProfile) => Promise<void>;
  upsertBranch: (branch: Branch) => Promise<void>;
  setActiveBranchId: (branchId: string) => Promise<void>;
  upsertErpUser: (user: ErpUser) => Promise<void>;
  updateRoleDefinition: (role: ErpRoleDefinition) => Promise<void>;

  upsertProduct: (product: CatalogProduct) => Promise<void>;
  upsertCategory: (category: ProductCategory) => Promise<void>;
  upsertBrand: (brand: ProductBrand) => Promise<void>;
  upsertUnit: (unit: UnitOfMeasure) => Promise<void>;
  upsertPriceList: (priceList: PriceList) => Promise<void>;
  upsertCustomer: (customer: Customer) => Promise<void>;
  registerInventoryAdjustment: (input: StockAdjustmentInput) => Promise<void>;

  openCashbox: (openingAmount: number) => Promise<void>;
  closeCashbox: (countedCash: number) => Promise<void>;
  recordCashMovement: (type: 'INCOME' | 'EXPENSE', amount: number, note: string) => Promise<void>;
  confirmPosSale: (
    input: PosSaleInput
  ) => Promise<{ saleId: string; docId: string; ecfId?: string | null; eNcf?: string | null }>;
  openSaleReceiptDoc: (saleId: string) => Promise<void>;

  selectedEcfId: string | null;
  setSelectedEcfId: (id: string | null) => void;
  ecfDraftPrefill: EcfDraftPrefill | null;
  setEcfDraftPrefill: (prefill: EcfDraftPrefill | null) => void;
  ecfLookupPrefill: EcfLookupPrefill | null;
  setEcfLookupPrefill: (prefill: EcfLookupPrefill | null) => void;
  issueElectronicInvoice: (input: IssueEcfInput) => Promise<ElectronicInvoice>;
  pollEcfTrackStatus: (
    invoiceId: string,
    targetStatus?: Extract<EcfStatus, 'ACEPTADO' | 'ACEPTADO_CONDICIONAL' | 'RECHAZADO'>
  ) => Promise<void>;
  voidElectronicInvoice: (invoiceId: string, reason: string) => Promise<void>;
  upsertEcfSequenceRange: (range: EcfSequenceRange) => Promise<void>;
  toggleEcfSequenceActive: (sequenceId: string) => Promise<void>;
  updateEcfConfig: (partial: Partial<EcfConfigState>) => Promise<void>;
  toggleEcfChecklistItem: (itemId: string) => Promise<void>;
  renewDemoCertificate: () => Promise<void>;

  registerCreditPurchase: (input: CreditPurchaseInput) => Promise<void>;
  payPurchaseBill: (purchaseId: string, amount: number) => Promise<void>;
  addBankTransaction: (tx: Omit<BankTransaction, 'id' | 'reconciled'>) => Promise<void>;
  toggleBankReconciled: (txId: string) => Promise<void>;

  upsertGlAccount: (account: GlAccount) => Promise<void>;
  setAccountingPeriodStatus: (periodId: string, status: AccountingPeriod['status']) => Promise<void>;
  createJournalEntry: (input: {
    date: string;
    periodId: string;
    reference: string;
    memo: string;
    lines: Omit<JournalEntryLine, 'id'>[];
  }) => Promise<void>;
  toggleReconciliationItem: (itemId: string) => Promise<void>;
  updateWorkRiskRule: (rule: WorkRiskRule) => Promise<void>;
  updateConceptTreatmentRule: (rule: ConceptTreatmentRule) => Promise<void>;
}

const PayrollWorkspaceContext = createContext<PayrollWorkspaceContextValue | null>(null);

export interface PayrollWorkspaceProviderProps {
  children: React.ReactNode;
  apiClient: PayrollApiClient;
  sessionPermissions?: NetsRowPermissions;
  sessionActorName?: string;
  enableDemoRoleControl?: boolean;
  liveCompanyName?: string;
  initialScreen?: ScreenId;
  initialLocale?: Locale;
  initialTheme?: ThemeMode;
  externalLocale?: Locale;
  onLocaleChange?: (locale: Locale) => void;
  externalTheme?: ThemeMode;
  onThemeChange?: (theme: ThemeMode) => void;
  tenantContext?: TenantRecord | null;
  onLogout?: () => void;
  onNavigateToPlatformLogin?: () => void;
  onNavigateScreen?: (screen: ScreenId) => void;
}

export function PayrollWorkspaceProvider({
  children,
  apiClient,
  sessionPermissions,
  sessionActorName,
  enableDemoRoleControl = true,
  liveCompanyName,
  initialScreen = 'overview',
  initialLocale = 'es',
  initialTheme = 'light',
  externalLocale,
  onLocaleChange,
  externalTheme,
  onThemeChange,
  tenantContext,
  onLogout,
  onNavigateToPlatformLogin,
  onNavigateScreen,
}: PayrollWorkspaceProviderProps) {
  const [periods, setPeriods] = useState<PayrollPeriod[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [novelties, setNovelties] = useState<PayrollNovelty[]>([]);
  const [erpState, setErpState] = useState<ErpDemoState>(() => liveCompanyName ? createEmptyErpState(liveCompanyName) : createSeedErpState());

  const [isLoading, setIsLoading] = useState<boolean>(!liveCompanyName);
  const [isMutating, setIsMutating] = useState<boolean>(false);
  const [actionType, setActionType] =
    useState<PayrollWorkspaceContextValue['actionType']>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [activeScreen, setActiveScreenState] = useState<ScreenId>(initialScreen);
  const [activeReviewTab, setActiveReviewTab] = useState<ReviewTabId>('all');
  const [activePeriodId, setActivePeriodId] = useState<string | null>(null);
  const [activeRunId, setActiveRunId] = useState<string | null>(null);
  const [activeEmployeeId, setActiveEmployeeId] = useState<string | null>(null);

  const [selectedAccountId, setSelectedAccountId] = useState<string | null>('acc-1102');
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [selectedEcfId, setSelectedEcfId] = useState<string | null>(null);
  const [ecfDraftPrefill, setEcfDraftPrefill] = useState<EcfDraftPrefill | null>(null);
  const [ecfLookupPrefill, setEcfLookupPrefill] = useState<EcfLookupPrefill | null>(null);

  const [internalLocale, setInternalLocale] = useState<Locale>(initialLocale);
  const [internalTheme, setInternalTheme] = useState<ThemeMode>(initialTheme);
  const [demoRole, setDemoRole] = useState<DemoRoleKey>('payroll_admin');

  const locale = externalLocale ?? internalLocale;
  const theme = externalTheme ?? internalTheme;

  const setLocale = useCallback(
    (next: Locale) => {
      setInternalLocale(next);
      onLocaleChange?.(next);
    },
    [onLocaleChange]
  );

  const setTheme = useCallback(
    (next: ThemeMode) => {
      setInternalTheme(next);
      onThemeChange?.(next);
    },
    [onThemeChange]
  );

  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);
  const [isMobileBreakdownOpen, setIsMobileBreakdownOpen] = useState<boolean>(false);

  const translations = TRANSLATIONS[locale];
  const t = liveCompanyName ? {
    ...translations,
    topBar: { ...translations.topBar, demoOnlyTag: locale === 'es' ? 'Solo consulta' : 'Read only' },
  } : translations;

  const permissions = useMemo<NetsRowPermissions>(() => {
    if (sessionPermissions) return sessionPermissions;
    return getDemoPermissions(demoRole);
  }, [sessionPermissions, demoRole]);

  const actorName = useMemo(() => {
    if (sessionActorName) return sessionActorName;
    if (tenantContext?.ownerName) return tenantContext.ownerName;
    return demoRole === 'payroll_admin'
      ? 'Lic. Altagracia Castillo'
      : 'Consulta Demo';
  }, [sessionActorName, tenantContext, demoRole]);

  const enabledModules = useMemo<SaasModuleCode[]>(
    () => (tenantContext ? tenantContext.enabledModules : ALL_SAAS_MODULES),
    [tenantContext]
  );

  const tenantStatus: TenantStatus = tenantContext?.status ?? 'ACTIVE';
  const tenantPlanLabel = tenantContext
    ? locale === 'es'
      ? tenantContext.planNameSnapshotEs
      : tenantContext.planNameSnapshotEn
    : null;

  const effectiveErpState = useMemo<ErpDemoState>(() => {
    const baseEInvoicing =
      erpState.eInvoicing ?? createSeedEInvoicingState(erpState.company);
    if (!tenantContext) {
      return {
        ...erpState,
        eInvoicing: baseEInvoicing,
      };
    }
    return {
      ...erpState,
      eInvoicing: baseEInvoicing,
      company: {
        ...erpState.company,
        name: tenantContext.name,
        rnc: tenantContext.rnc,
      },
    };
  }, [erpState, tenantContext]);

  const clearError = useCallback(() => setErrorMessage(null), []);
  const clearSuccess = useCallback(() => setSuccessMessage(null), []);
  const notifySuccess = useCallback((msg: string) => {
    setErrorMessage(null);
    setSuccessMessage(msg);
  }, []);

  useEffect(() => {
    if (liveCompanyName) return;
    let cancelled = false;
    setIsLoading(true);
    apiClient
      .fetchWorkspaceData()
      .then((payload) => {
        if (cancelled) return;
        setPeriods(payload.periods);
        setEmployees(payload.employees);
        setNovelties(payload.novelties);
        if (payload.erpState) {
          setErpState(payload.erpState);
        }

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
        setErrorMessage(err instanceof Error ? err.message : 'Error loading workspace data');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [apiClient, liveCompanyName]);

  const persistErp = useCallback(
    async (updater: (prev: ErpDemoState) => ErpDemoState): Promise<ErpDemoState> => {
      let nextSnapshot: ErpDemoState | null = null;
      setErpState((prev) => {
        nextSnapshot = updater(prev);
        return nextSnapshot;
      });
      if (nextSnapshot && apiClient.saveErpState) {
        await apiClient.saveErpState(nextSnapshot);
      }
      return nextSnapshot!;
    },
    [apiClient]
  );

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

  const openAccountLedger = useCallback(
    (accountId: string) => {
      setSelectedAccountId(accountId);
      setActiveScreenState('accounting_ledger');
      onNavigateScreen?.('accounting_ledger');
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
    setTheme(theme === 'light' ? 'dark' : 'light');
  }, [theme, setTheme]);

  const activeBranch = useMemo(
    () =>
      erpState.branches.find((b) => b.id === erpState.activeBranchId) ??
      erpState.branches[0] ??
      null,
    [erpState.branches, erpState.activeBranchId]
  );

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

  // --- Payroll CRUD & Lifecycle ---
  const createNovelty = useCallback(
    async (input: CreateNoveltyInput) => {
      setIsMutating(true);
      setActionType('novelty');
      setErrorMessage(null);
      try {
        const created = await apiClient.createNovelty(input);
        setNovelties((prev) => [created, ...prev]);
        notifySuccess(
          locale === 'es'
            ? 'Novedad registrada en período en borrador.'
            : 'Adjustment saved to draft period.'
        );
      } catch (err: unknown) {
        setErrorMessage(err instanceof Error ? err.message : 'Error creating novelty');
        throw err;
      } finally {
        setIsMutating(false);
        setActionType('idle');
      }
    },
    [apiClient, locale, notifySuccess]
  );

  const updateNovelty = useCallback(
    async (input: UpdateNoveltyInput) => {
      setIsMutating(true);
      setActionType('novelty');
      setErrorMessage(null);
      try {
        const updated = await apiClient.updateNovelty(input);
        setNovelties((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
        notifySuccess(
          locale === 'es' ? 'Novedad actualizada.' : 'Adjustment updated.'
        );
      } catch (err: unknown) {
        setErrorMessage(err instanceof Error ? err.message : 'Error updating novelty');
        throw err;
      } finally {
        setIsMutating(false);
        setActionType('idle');
      }
    },
    [apiClient, locale, notifySuccess]
  );

  const deleteNovelty = useCallback(
    async (noveltyId: string, periodId: string) => {
      setIsMutating(true);
      setActionType('novelty');
      setErrorMessage(null);
      try {
        await apiClient.deleteNovelty(noveltyId, periodId);
        setNovelties((prev) => prev.filter((n) => n.id !== noveltyId));
        notifySuccess(locale === 'es' ? 'Novedad eliminada.' : 'Adjustment deleted.');
      } catch (err: unknown) {
        setErrorMessage(err instanceof Error ? err.message : 'Error deleting novelty');
        throw err;
      } finally {
        setIsMutating(false);
        setActionType('idle');
      }
    },
    [apiClient, locale, notifySuccess]
  );

  const submitPeriodForReview = useCallback(
    async (periodId: string) => {
      setIsMutating(true);
      setActionType('submit_review');
      setErrorMessage(null);
      try {
        const updated = await apiClient.submitPeriodForReview(periodId, actorName);
        replacePeriod(updated);
        notifySuccess(
          locale === 'es'
            ? 'Período enviado a revisión.'
            : 'Period submitted for review.'
        );
      } catch (err: unknown) {
        setErrorMessage(err instanceof Error ? err.message : 'Error submitting period');
      } finally {
        setIsMutating(false);
        setActionType('idle');
      }
    },
    [apiClient, actorName, replacePeriod, locale, notifySuccess]
  );

  const returnPeriodToDraft = useCallback(
    async (periodId: string) => {
      setIsMutating(true);
      setActionType('return_draft');
      setErrorMessage(null);
      try {
        const updated = await apiClient.returnPeriodToDraft(periodId, actorName);
        replacePeriod(updated);
        notifySuccess(
          locale === 'es'
            ? 'Período devuelto a borrador para edición de novedades.'
            : 'Period returned to draft for adjustment edits.'
        );
      } catch (err: unknown) {
        setErrorMessage(
          err instanceof Error ? err.message : 'Error returning period to draft'
        );
      } finally {
        setIsMutating(false);
        setActionType('idle');
      }
    },
    [apiClient, actorName, replacePeriod, locale, notifySuccess]
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
        notifySuccess(
          locale === 'es'
            ? 'Simulación ejecutada. Revisa el subtotal provisional y ejecuta «Calcular TSS e ISR».'
            : 'Simulation completed. Review provisional subtotal and run «Calculate TSS & ISR».'
        );
      } catch (err: unknown) {
        setErrorMessage(err instanceof Error ? err.message : 'Error running simulation');
      } finally {
        setIsMutating(false);
        setActionType('idle');
      }
    },
    [apiClient, actorName, replacePeriod, locale, notifySuccess]
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
        notifySuccess(
          locale === 'es'
            ? 'Cálculo TSS e ISR completado: Lista para revisión final.'
            : 'TSS & ISR calculation complete: Ready for final review.'
        );
      } catch (err: unknown) {
        setErrorMessage(
          err instanceof Error ? err.message : 'Error running statutory TSS/ISR'
        );
      } finally {
        setIsMutating(false);
        setActionType('idle');
      }
    },
    [apiClient, actorName, replacePeriod, locale, notifySuccess]
  );

  const approvePayrollRun = useCallback(
    async (periodId: string, runId: string) => {
      setIsMutating(true);
      setActionType('approve');
      setErrorMessage(null);
      try {
        const updated = await apiClient.approvePayrollRun(periodId, runId, actorName);
        replacePeriod(updated);
        notifySuccess(
          locale === 'es'
            ? 'Nómina aprobada y bloqueada en solo lectura.'
            : 'Payroll approved and locked read-only.'
        );
      } catch (err: unknown) {
        setErrorMessage(err instanceof Error ? err.message : 'Error approving payroll');
      } finally {
        setIsMutating(false);
        setActionType('idle');
      }
    },
    [apiClient, actorName, replacePeriod, locale, notifySuccess]
  );

  // --- Reset Demo Workspace ---
  const resetDemoData = useCallback(async () => {
    setIsMutating(true);
    setActionType('erp');
    setErrorMessage(null);
    try {
      const payload = apiClient.resetDemoWorkspace
        ? await apiClient.resetDemoWorkspace()
        : await apiClient.fetchWorkspaceData();
      setPeriods(payload.periods);
      setEmployees(payload.employees);
      setNovelties(payload.novelties);
      if (payload.erpState) {
        setErpState(payload.erpState);
      } else {
        setErpState(createSeedErpState());
      }
      const defPeriod =
        payload.periods.find((p) => p.id === 'per-2026-10') ?? payload.periods[0];
      if (defPeriod) {
        setActivePeriodId(defPeriod.id);
        setActiveRunId(defPeriod.currentRunId ?? null);
      }
      if (payload.employees[0]) {
        setActiveEmployeeId(payload.employees[0].id);
      }
      setSelectedSaleId(null);
      setSelectedDocumentId(null);
      notifySuccess(t.topBar.demoResetDone);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Error resetting demo data');
    } finally {
      setIsMutating(false);
      setActionType('idle');
    }
  }, [apiClient, notifySuccess, t.topBar.demoResetDone]);

  // --- Settings & Company / Branches / Users ---
  const updateBusinessSettings = useCallback(
    async (next: BusinessSettings) => {
      await persistErp((prev) => ({ ...prev, business: next }));
      notifySuccess(
        locale === 'es' ? 'Parámetros de negocio guardados.' : 'Business settings saved.'
      );
    },
    [persistErp, locale, notifySuccess]
  );

  const updateCompanyProfile = useCallback(
    async (next: CompanyProfile) => {
      await persistErp((prev) => ({ ...prev, company: next }));
      notifySuccess(
        locale === 'es'
          ? 'Datos de empresa actualizados en cabecera y menú.'
          : 'Company profile updated across header and sidebar.'
      );
    },
    [persistErp, locale, notifySuccess]
  );

  const upsertBranch = useCallback(
    async (branch: Branch) => {
      await persistErp((prev) => {
        const exists = prev.branches.some((b) => b.id === branch.id);
        const branches = exists
          ? prev.branches.map((b) => (b.id === branch.id ? branch : b))
          : [...prev.branches, branch];
        return { ...prev, branches };
      });
      notifySuccess(
        locale === 'es'
          ? `Sucursal "${branch.name}" guardada.`
          : `Branch "${branch.name}" saved.`
      );
    },
    [persistErp, locale, notifySuccess]
  );

  const setActiveBranchId = useCallback(
    async (branchId: string) => {
      await persistErp((prev) => ({ ...prev, activeBranchId: branchId }));
      notifySuccess(
        locale === 'es'
          ? 'Sucursal activa cambiada en cabecera.'
          : 'Active branch updated in header.'
      );
    },
    [persistErp, locale, notifySuccess]
  );

  const upsertErpUser = useCallback(
    async (user: ErpUser) => {
      await persistErp((prev) => {
        const exists = prev.users.some((u) => u.id === user.id);
        const users = exists
          ? prev.users.map((u) => (u.id === user.id ? user : u))
          : [...prev.users, user];
        return { ...prev, users };
      });
      notifySuccess(
        locale === 'es' ? 'Usuario actualizado (Solo demo).' : 'User updated (Demo only).'
      );
    },
    [persistErp, locale, notifySuccess]
  );

  const updateRoleDefinition = useCallback(
    async (role: ErpRoleDefinition) => {
      await persistErp((prev) => ({
        ...prev,
        roles: prev.roles.map((r) => (r.id === role.id ? role : r)),
      }));
      notifySuccess(
        locale === 'es' ? 'Permisos de rol actualizados.' : 'Role permissions updated.'
      );
    },
    [persistErp, locale, notifySuccess]
  );

  // --- Catalog, Customers, Inventory ---
  const upsertProduct = useCallback(
    async (product: CatalogProduct) => {
      await persistErp((prev) => {
        const exists = prev.products.some((p) => p.id === product.id);
        const products = exists
          ? prev.products.map((p) => (p.id === product.id ? product : p))
          : [product, ...prev.products];
        return { ...prev, products };
      });
      notifySuccess(
        locale === 'es' ? `Producto ${product.sku} guardado.` : `Product ${product.sku} saved.`
      );
    },
    [persistErp, locale, notifySuccess]
  );

  const upsertCategory = useCallback(
    async (category: ProductCategory) => {
      await persistErp((prev) => {
        const exists = prev.categories.some((c) => c.id === category.id);
        const categories = exists
          ? prev.categories.map((c) => (c.id === category.id ? category : c))
          : [...prev.categories, category];
        return { ...prev, categories };
      });
      notifySuccess(locale === 'es' ? 'Categoría guardada.' : 'Category saved.');
    },
    [persistErp, locale, notifySuccess]
  );

  const upsertBrand = useCallback(
    async (brand: ProductBrand) => {
      await persistErp((prev) => {
        const exists = prev.brands.some((b) => b.id === brand.id);
        const brands = exists
          ? prev.brands.map((b) => (b.id === brand.id ? brand : b))
          : [...prev.brands, brand];
        return { ...prev, brands };
      });
      notifySuccess(locale === 'es' ? 'Marca guardada.' : 'Brand saved.');
    },
    [persistErp, locale, notifySuccess]
  );

  const upsertUnit = useCallback(
    async (unit: UnitOfMeasure) => {
      await persistErp((prev) => {
        const exists = prev.units.some((u) => u.id === unit.id);
        const units = exists
          ? prev.units.map((u) => (u.id === unit.id ? unit : u))
          : [...prev.units, unit];
        return { ...prev, units };
      });
      notifySuccess(locale === 'es' ? 'Unidad de medida guardada.' : 'Unit saved.');
    },
    [persistErp, locale, notifySuccess]
  );

  const upsertPriceList = useCallback(
    async (priceList: PriceList) => {
      await persistErp((prev) => {
        const exists = prev.priceLists.some((pl) => pl.id === priceList.id);
        const base = priceList.isDefault
          ? prev.priceLists.map((pl) => ({ ...pl, isDefault: false }))
          : prev.priceLists;
        const priceLists = exists
          ? base.map((pl) => (pl.id === priceList.id ? priceList : pl))
          : [...base, priceList];
        return { ...prev, priceLists };
      });
      notifySuccess(locale === 'es' ? 'Lista de precios guardada.' : 'Price list saved.');
    },
    [persistErp, locale, notifySuccess]
  );

  const upsertCustomer = useCallback(
    async (customer: Customer) => {
      await persistErp((prev) => {
        const exists = prev.customers.some((c) => c.id === customer.id);
        const customers = exists
          ? prev.customers.map((c) => (c.id === customer.id ? customer : c))
          : [customer, ...prev.customers];
        return { ...prev, customers };
      });
      notifySuccess(
        locale === 'es' ? `Cliente ${customer.name} guardado.` : `Customer ${customer.name} saved.`
      );
    },
    [persistErp, locale, notifySuccess]
  );

  const registerInventoryAdjustment = useCallback(
    async (input: StockAdjustmentInput) => {
      const target = erpState.products.find((p) => p.id === input.productId);
      if (!target) {
        setErrorMessage('Product not found');
        return;
      }
      if (input.quantity <= 0) {
        setErrorMessage(
          locale === 'es' ? 'La cantidad debe ser mayor que cero.' : 'Quantity must be > 0.'
        );
        return;
      }
      const delta = input.direction === 'IN' ? input.quantity : -input.quantity;
      const nextStock = target.stock + delta;
      if (nextStock < 0 && !erpState.business.allowNegativeStock) {
        setErrorMessage(
          locale === 'es'
            ? `Stock insuficiente para ${target.nameEs} (disponible: ${target.stock}).`
            : `Insufficient stock for ${target.nameEn} (available: ${target.stock}).`
        );
        return;
      }

      const refCode = `AJU-${Date.now().toString().slice(-5)}`;
      const stamp = nowStamp();

      await persistErp((prev) => ({
        ...prev,
        products: prev.products.map((p) =>
          p.id === target.id ? { ...p, stock: nextStock } : p
        ),
        inventoryMovements: [
          {
            id: `mov-${Date.now()}`,
            date: stamp,
            productId: target.id,
            branchId: prev.activeBranchId,
            type: input.direction === 'IN' ? 'ADJUSTMENT_IN' : 'ADJUSTMENT_OUT',
            quantityDelta: delta,
            stockAfter: nextStock,
            reference: refCode,
            reasonEs: input.reason || 'Ajuste manual simulado de inventario',
            reasonEn: input.reason || 'Simulated manual inventory adjustment',
            actorName,
          },
          ...prev.inventoryMovements,
        ],
        internalDocs: [
          {
            id: `doc-${Date.now()}`,
            number: `DOC-${refCode}`,
            type: 'STOCK_ADJUSTMENT',
            date: stamp,
            branchId: prev.activeBranchId,
            referenceCode: refCode,
            titleEs: `Comprobante ajuste inventario ${refCode}`,
            titleEn: `Inventory adjustment slip ${refCode}`,
            counterparty: actorName,
            amount: round2(Math.abs(delta) * target.cost),
            nonFiscalNoticeEs: 'DOCUMENTO INTERNO NO FISCAL — AJUSTE DE INVENTARIO',
            nonFiscalNoticeEn: 'INTERNAL NON-FISCAL DOCUMENT — INVENTORY ADJUSTMENT',
            lines: [
              {
                label: `${target.sku} · ${locale === 'es' ? target.nameEs : target.nameEn}`,
                qty: delta,
                amount: round2(delta * target.cost),
              },
            ],
          },
          ...prev.internalDocs,
        ],
      }));

      notifySuccess(
        locale === 'es'
          ? `Ajuste ${refCode} aplicado. Nuevo stock: ${nextStock}.`
          : `Adjustment ${refCode} applied. New stock: ${nextStock}.`
      );
    },
    [erpState.products, erpState.business.allowNegativeStock, locale, persistErp, actorName, notifySuccess]
  );

  // --- Cashbox & POS & Sales & Internal Docs ---
  const openCashbox = useCallback(
    async (openingAmount: number) => {
      if (openingAmount < 0 || Number.isNaN(openingAmount)) {
        setErrorMessage(
          locale === 'es' ? 'Monto de apertura inválido.' : 'Invalid opening amount.'
        );
        return;
      }
      const alreadyOpen = erpState.cashSessions.some((s) => s.status === 'OPEN');
      if (alreadyOpen) {
        setErrorMessage(
          locale === 'es' ? 'Ya existe un turno de caja abierto.' : 'A cash register shift is already open.'
        );
        return;
      }

      const stamp = nowStamp();
      const sessionId = `csh-${Date.now()}`;
      await persistErp((prev) => ({
        ...prev,
        cashSessions: [
          {
            id: sessionId,
            branchId: prev.activeBranchId,
            cashierName: actorName,
            openedAt: stamp,
            closedAt: null,
            status: 'OPEN',
            openingAmount: round2(openingAmount),
            cashSalesTotal: 0,
            otherIncomesTotal: 0,
            expensesTotal: 0,
            expectedCash: round2(openingAmount),
            countedCash: null,
            variance: null,
          },
          ...prev.cashSessions,
        ],
        cashMovements: [
          {
            id: `cmv-${Date.now()}`,
            sessionId,
            timestamp: stamp,
            type: 'OPENING',
            amount: round2(openingAmount),
            reference: `TURNO-${sessionId.slice(-4)}`,
            noteEs: 'Apertura de caja registrada',
            noteEn: 'Cash register opened',
            actorName,
          },
          ...prev.cashMovements,
        ],
      }));

      notifySuccess(
        locale === 'es'
          ? `Caja abierta con RD$${openingAmount.toFixed(2)}.`
          : `Cash register opened with RD$${openingAmount.toFixed(2)}.`
      );
    },
    [erpState.cashSessions, locale, persistErp, actorName, notifySuccess]
  );

  const recordCashMovement = useCallback(
    async (type: 'INCOME' | 'EXPENSE', amount: number, note: string) => {
      const openSession = erpState.cashSessions.find((s) => s.status === 'OPEN');
      if (!openSession) {
        setErrorMessage(
          locale === 'es' ? 'Abre una caja antes de registrar movimientos.' : 'Open cashbox first.'
        );
        return;
      }
      if (amount <= 0 || Number.isNaN(amount)) {
        setErrorMessage(locale === 'es' ? 'Importe inválido.' : 'Invalid amount.');
        return;
      }
      const stamp = nowStamp();
      await persistErp((prev) => ({
        ...prev,
        cashSessions: prev.cashSessions.map((s) => {
          if (s.id !== openSession.id) return s;
          const otherIncomesTotal =
            type === 'INCOME' ? round2(s.otherIncomesTotal + amount) : s.otherIncomesTotal;
          const expensesTotal =
            type === 'EXPENSE' ? round2(s.expensesTotal + amount) : s.expensesTotal;
          const expectedCash = round2(
            s.openingAmount + s.cashSalesTotal + otherIncomesTotal - expensesTotal
          );
          return { ...s, otherIncomesTotal, expensesTotal, expectedCash };
        }),
        cashMovements: [
          {
            id: `cmv-${Date.now()}`,
            sessionId: openSession.id,
            timestamp: stamp,
            type,
            amount: round2(amount),
            reference: `${type === 'INCOME' ? 'ING' : 'EGR'}-${Date.now().toString().slice(-4)}`,
            noteEs: note || (type === 'INCOME' ? 'Ingreso manual en caja' : 'Egreso menor de caja'),
            noteEn: note || (type === 'INCOME' ? 'Manual cash income' : 'Petty cash expense'),
            actorName,
          },
          ...prev.cashMovements,
        ],
      }));

      notifySuccess(
        locale === 'es' ? 'Movimiento de caja registrado.' : 'Cash movement recorded.'
      );
    },
    [erpState.cashSessions, locale, persistErp, actorName, notifySuccess]
  );

  const closeCashbox = useCallback(
    async (countedCash: number) => {
      const openSession = erpState.cashSessions.find((s) => s.status === 'OPEN');
      if (!openSession) {
        setErrorMessage(locale === 'es' ? 'No hay caja abierta.' : 'No open cashbox.');
        return;
      }
      const stamp = nowStamp();
      const variance = round2(countedCash - openSession.expectedCash);
      const docId = `doc-close-${Date.now()}`;
      const turnRef = `CIERRE-${openSession.id.slice(-4)}`;

      await persistErp((prev) => ({
        ...prev,
        cashSessions: prev.cashSessions.map((s) =>
          s.id === openSession.id
            ? {
                ...s,
                status: 'CLOSED',
                closedAt: stamp,
                countedCash: round2(countedCash),
                variance,
              }
            : s
        ),
        cashMovements: [
          {
            id: `cmv-${Date.now()}`,
            sessionId: openSession.id,
            timestamp: stamp,
            type: 'CLOSING',
            amount: round2(countedCash),
            reference: turnRef,
            noteEs: `Cierre de caja · Diferencia: RD$${variance.toFixed(2)}`,
            noteEn: `Cashbox closing · Variance: RD$${variance.toFixed(2)}`,
            actorName,
          },
          ...prev.cashMovements,
        ],
        internalDocs: [
          {
            id: docId,
            number: `DOC-${turnRef}`,
            type: 'CASH_CLOSING',
            date: stamp,
            branchId: prev.activeBranchId,
            referenceCode: turnRef,
            titleEs: `Acta de cierre de caja ${turnRef}`,
            titleEn: `Cash register closing report ${turnRef}`,
            counterparty: actorName,
            amount: round2(countedCash),
            nonFiscalNoticeEs: 'DOCUMENTO INTERNO NO FISCAL — CIERRE DE CAJA',
            nonFiscalNoticeEn: 'INTERNAL NON-FISCAL DOCUMENT — CASH CLOSING',
            lines: [
              { label: 'Fondo inicial', amount: openSession.openingAmount },
              { label: 'Ventas en efectivo', amount: openSession.cashSalesTotal },
              { label: 'Otros ingresos', amount: openSession.otherIncomesTotal },
              { label: 'Egresos', amount: -openSession.expensesTotal },
              { label: 'Efectivo contado', amount: round2(countedCash) },
            ],
          },
          ...prev.internalDocs,
        ],
      }));

      notifySuccess(
        locale === 'es'
          ? `Cierre de caja completado (Diferencia: RD$${variance.toFixed(2)}).`
          : `Cashbox closed (Variance: RD$${variance.toFixed(2)}).`
      );
    },
    [erpState.cashSessions, locale, persistErp, actorName, notifySuccess]
  );

  const buildIssuedInvoiceInternal = useCallback(
    (
      prev: ErpDemoState,
      input: IssueEcfInput,
      company: CompanyProfile
    ): { invoice: ElectronicInvoice; nextSequences: EcfSequenceRange[] } => {
      const eInv = prev.eInvoicing ?? createSeedEInvoicingState(company);
      if (eInv.config.certificate.status === 'EXPIRED') {
        throw new Error(
          locale === 'es'
            ? 'Tu certificado digital está vencido. Renuévalo en Configuración e-CF antes de firmar.'
            : 'Your digital certificate has expired. Renew it in e-CF Settings before signing.'
        );
      }

      if (eInv.config.emissionMethod === 'FACTURADOR_GRATUITO') {
        const currentMonthPrefix = todayIso().slice(0, 7);
        const monthlyIssued = eInv.invoices.filter((inv) =>
          inv.issueDate.startsWith(currentMonthPrefix)
        ).length;
        if (monthlyIssued >= eInv.config.freeToolMonthlyLimit) {
          throw new Error(
            locale === 'es'
              ? `Has alcanzado el límite mensual de ${eInv.config.freeToolMonthlyLimit} comprobantes del Facturador Gratuito DGII.`
              : `You reached the ${eInv.config.freeToolMonthlyLimit} monthly invoice cap for the DGII Free Tool.`
          );
        }
      }

      const meta = getEcfTypeMeta(input.ecfType);
      if (!input.buyerName.trim()) {
        throw new Error(
          locale === 'es'
            ? 'Ingresa el nombre o razón social del receptor.'
            : 'Enter the buyer name or legal entity.'
        );
      }

      const taxCheck = validateDominicanTaxId(input.buyerRnc);
      if (meta.requiresBuyerRnc && !taxCheck.valid) {
        throw new Error(
          locale === 'es'
            ? `El tipo E${input.ecfType} (${meta.shortEs}) requiere un RNC (9 dígitos) o Cédula (11 dígitos) válido.`
            : `Type E${input.ecfType} (${meta.shortEn}) requires a valid 9-digit RNC or 11-digit National ID.`
        );
      }

      if (meta.requiresModifiedEcf && !(input.modifiedENcf ?? '').trim()) {
        throw new Error(
          locale === 'es'
            ? `Las notas E${input.ecfType} deben indicar el e-NCF original modificado.`
            : `E${input.ecfType} notes must reference the original modified e-NCF.`
        );
      }

      const seqRange = eInv.sequences.find(
        (s) =>
          s.ecfType === input.ecfType &&
          s.active &&
          s.nextSeq <= s.toSeq
      );
      if (!seqRange) {
        throw new Error(
          locale === 'es'
            ? `No hay secuencia e-NCF activa con folios disponibles para el tipo E${input.ecfType}. Autoriza un rango en Secuencias e-NCF.`
            : `No active e-NCF sequence with remaining folios for type E${input.ecfType}. Authorize a range in e-NCF Sequences.`
        );
      }

      const itbisRate = prev.business.standardItbisRate;
      const discountAmt = Math.max(0, round2(input.discountAmount ?? 0));
      const rawSubtotal = round2(
        input.items.reduce((acc, it) => acc + it.quantity * it.unitPrice, 0)
      );
      const discRatio = rawSubtotal > 0 ? Math.min(1, discountAmt / rawSubtotal) : 0;

      const builtItems: EcfLineItem[] = input.items.map((it, idx) => {
        const lineSub = round2(it.quantity * it.unitPrice);
        const netSub = round2(lineSub * (1 - discRatio));
        const itbisAmount = it.taxableItbis ? round2(netSub * (itbisRate / 100)) : 0;
        return {
          id: `ecfi-${Date.now()}-${idx}`,
          productId: it.productId,
          sku: it.sku,
          descriptionEs: it.descriptionEs,
          descriptionEn: it.descriptionEn,
          unitCode: it.unitCode || 'UND',
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          taxableItbis: it.taxableItbis,
          itbisRate: it.taxableItbis ? itbisRate : 0,
          itbisAmount,
          lineSubtotal: netSub,
          lineTotal: round2(netSub + itbisAmount),
        };
      });

      const subtotalTaxable = round2(
        builtItems
          .filter((i) => i.taxableItbis)
          .reduce((acc, i) => acc + i.lineSubtotal, 0)
      );
      const subtotalExempt = round2(
        builtItems
          .filter((i) => !i.taxableItbis)
          .reduce((acc, i) => acc + i.lineSubtotal, 0)
      );
      const itbisTotal = round2(
        builtItems.reduce((acc, i) => acc + i.itbisAmount, 0)
      );
      const totalAmount = round2(subtotalTaxable + subtotalExempt + itbisTotal);

      const eNcf = formatENcf(input.ecfType, seqRange.nextSeq);
      const stamp = nowStamp();
      const signStamp = `${stamp}:08`;
      const securityCode = buildDeterministicSecurityCode(
        `${eNcf}-${cleanTaxId(input.buyerRnc)}-${totalAmount.toFixed(2)}-${stamp}`
      );
      const trackId = buildTrackId(input.ecfType, eNcf);
      const qrPayloadUrl = buildEcfQrUrl({
        emitterRnc: company.rnc,
        buyerRnc: input.buyerRnc,
        eNcf,
        issueDate: stamp,
        totalAmount,
        digitalSignatureDate: signStamp,
        securityCode,
      });

      const outcome = input.simulationOutcome ?? 'AUTO_ACCEPTED';
      let status: EcfStatus = 'ACEPTADO';
      let statusMessageEs =
        'e-CF firmado digitalmente y aceptado por Web Service DGII (Simulación demo).';
      let statusMessageEn =
        'e-CF digitally signed and accepted by DGII Web Service (Demo simulation).';
      let observationEs: string | undefined;
      let observationEn: string | undefined;

      if (outcome === 'CONDITIONAL') {
        status = 'ACEPTADO_CONDICIONAL';
        statusMessageEs =
          'Aceptado condicional por DGII: válido fiscalmente, con observación menor para próximas emisiones.';
        statusMessageEn =
          'Conditionally accepted by DGII: fiscally valid, with minor observation for future submissions.';
        observationEs =
          'Observación simulada: validar catálogo de unidades de medida antes del próximo cierre.';
        observationEn =
          'Simulated warning: validate unit-of-measure catalog code prior to next filing.';
      } else if (outcome === 'IN_PROCESS') {
        status = 'EN_PROCESO';
        statusMessageEs =
          'Recibido por DGII con TrackID pendiente de respuesta final. Consulta TrackID para confirmar.';
        statusMessageEn =
          'Received by DGII with TrackID pending final validation. Query TrackID to confirm.';
      } else if (outcome === 'REJECTED') {
        status = 'RECHAZADO';
        statusMessageEs =
          'Rechazado en validación DGII simulada: no válido para fines fiscales. Corrige y reemite un nuevo e-NCF.';
        statusMessageEn =
          'Rejected in simulated DGII validation: invalid for tax credit. Correct and reissue a new e-NCF.';
        observationEs =
          'Error simulado XSD-202: inconsistencia en datos tributarios del receptor.';
        observationEn =
          'Simulated error XSD-202: inconsistency in buyer tax payload.';
      }

      const invoiceBase: Omit<ElectronicInvoice, 'xmlContent'> = {
        id: `ecf-${Date.now()}`,
        eNcf,
        ecfType: input.ecfType,
        trackId,
        securityCode,
        digitalSignatureDate: signStamp,
        signatureAlgorithm: 'RSA-SHA256 (XMLDSig)',
        certificateSerial: eInv.config.certificate.serialNumber,
        status,
        statusMessageEs,
        statusMessageEn,
        observationEs,
        observationEn,
        issueDate: stamp,
        expirationDate: seqRange.expirationDate,
        branchId: prev.activeBranchId,
        saleId: input.saleId ?? null,
        modifiedENcf: input.modifiedENcf,
        modificationCode: input.modificationCode,
        buyerId: input.buyerId,
        buyerName: input.buyerName.trim(),
        buyerRnc: input.buyerRnc.trim(),
        buyerType: input.buyerType,
        paymentMethod: input.paymentMethod,
        items: builtItems,
        subtotalTaxable,
        subtotalExempt,
        discountAmount: discountAmt,
        itbisTotal,
        totalAmount,
        qrPayloadUrl,
      };

      const invoice: ElectronicInvoice = {
        ...invoiceBase,
        xmlContent: buildEcfXml(invoiceBase, company),
      };

      const nextSequences = eInv.sequences.map((s) =>
        s.id === seqRange.id ? { ...s, nextSeq: s.nextSeq + 1 } : s
      );

      return { invoice, nextSequences };
    },
    [locale]
  );

  const confirmPosSale = useCallback(
    async (
      input: PosSaleInput
    ): Promise<{ saleId: string; docId: string; ecfId?: string | null; eNcf?: string | null }> => {
      if (input.items.length === 0) {
        throw new Error(
          locale === 'es' ? 'Agrega al menos un producto al carrito.' : 'Cart is empty.'
        );
      }

      const openSession = erpState.cashSessions.find((s) => s.status === 'OPEN');
      if (input.paymentMethod === 'CASH' && !openSession) {
        throw new Error(
          locale === 'es'
            ? 'Para cobrar en efectivo debes abrir la caja primero.'
            : 'Open the cash register before completing a cash sale.'
        );
      }

      const customer = erpState.customers.find((c) => c.id === input.customerId);
      if (!customer) throw new Error('Customer not found');

      const itbisRate = erpState.business.standardItbisRate / 100;
      const discountPct = Math.min(100, Math.max(0, input.discountPercent));

      const builtItems = input.items.map((line) => {
        const prod = erpState.products.find((p) => p.id === line.productId);
        if (!prod) throw new Error('Product not found');
        if (line.quantity <= 0) throw new Error('Invalid quantity');
        if (prod.stock < line.quantity && !erpState.business.allowNegativeStock) {
          throw new Error(
            locale === 'es'
              ? `Stock insuficiente para ${prod.nameEs} (disponible: ${prod.stock}).`
              : `Insufficient stock for ${prod.nameEn} (available: ${prod.stock}).`
          );
        }
        const lineSubtotal = round2(prod.price * line.quantity);
        const discounted = round2(lineSubtotal * (1 - discountPct / 100));
        const lineTax = prod.taxableItbis ? round2(discounted * itbisRate) : 0;
        return {
          productId: prod.id,
          sku: prod.sku,
          nameEs: prod.nameEs,
          nameEn: prod.nameEn,
          quantity: line.quantity,
          unitPrice: prod.price,
          taxableItbis: prod.taxableItbis,
          lineSubtotal,
          lineTax,
          lineTotal: round2(discounted + lineTax),
        };
      });

      const subtotal = round2(builtItems.reduce((acc, i) => acc + i.lineSubtotal, 0));
      const discountAmount = round2(subtotal * (discountPct / 100));
      const taxAmount = round2(builtItems.reduce((acc, i) => acc + i.lineTax, 0));
      const total = round2(subtotal - discountAmount + taxAmount);

      const stamp = nowStamp();
      const isoDay = todayIso();
      const seq = erpState.sales.length + 101;
      const saleId = `sal-${Date.now()}`;
      const saleNumber = `VTA-2026-0${seq}`;
      const docId = `doc-${Date.now()}`;
      const docNumber = `DOC-INT-0${seq}`;

      const wantEcf = input.ecfType && input.ecfType !== 'NONE' ? input.ecfType : null;
      let issuedEcfResult: {
        invoice: ElectronicInvoice;
        nextSequences: EcfSequenceRange[];
      } | null = null;

      if (wantEcf) {
        issuedEcfResult = buildIssuedInvoiceInternal(
          effectiveErpState,
          {
            ecfType: wantEcf,
            saleId,
            buyerId: customer.id,
            buyerName: customer.name,
            buyerRnc: customer.taxId,
            buyerType: customer.type,
            paymentMethod: input.paymentMethod,
            discountAmount,
            simulationOutcome: 'AUTO_ACCEPTED',
            items: builtItems.map((i) => ({
              productId: i.productId,
              sku: i.sku,
              descriptionEs: i.nameEs,
              descriptionEn: i.nameEn,
              unitCode: 'UND',
              quantity: i.quantity,
              unitPrice: i.unitPrice,
              taxableItbis: i.taxableItbis,
            })),
          },
          effectiveErpState.company
        );
      }

      await persistErp((prev) => {
        const nextProducts = prev.products.map((prod) => {
          const line = builtItems.find((i) => i.productId === prod.id);
          return line ? { ...prod, stock: prod.stock - line.quantity } : prod;
        });

        const newMovements = builtItems.map((line, idx) => {
          const updatedProd = nextProducts.find((p) => p.id === line.productId)!;
          return {
            id: `mov-sale-${Date.now()}-${idx}`,
            date: stamp,
            productId: line.productId,
            branchId: prev.activeBranchId,
            type: 'SALE' as const,
            quantityDelta: -line.quantity,
            stockAfter: updatedProd.stock,
            reference: saleNumber,
            reasonEs: `Venta POS (${saleNumber})`,
            reasonEn: `POS Sale (${saleNumber})`,
            actorName,
          };
        });

        const nextCashSessions =
          input.paymentMethod === 'CASH' && openSession
            ? prev.cashSessions.map((s) => {
                if (s.id !== openSession.id) return s;
                const cashSalesTotal = round2(s.cashSalesTotal + total);
                const expectedCash = round2(
                  s.openingAmount + cashSalesTotal + s.otherIncomesTotal - s.expensesTotal
                );
                return { ...s, cashSalesTotal, expectedCash };
              })
            : prev.cashSessions;

        const nextCashMovements =
          input.paymentMethod === 'CASH' && openSession
            ? [
                {
                  id: `cmv-sale-${Date.now()}`,
                  sessionId: openSession.id,
                  timestamp: stamp,
                  type: 'SALE_CASH' as const,
                  amount: total,
                  reference: saleNumber,
                  noteEs: `Cobro en efectivo venta ${saleNumber}`,
                  noteEn: `Cash collection for sale ${saleNumber}`,
                  actorName,
                },
                ...prev.cashMovements,
              ]
            : prev.cashMovements;

        const nextCustomers =
          input.paymentMethod === 'CREDIT'
            ? prev.customers.map((c) =>
                c.id === customer.id
                  ? { ...c, currentBalance: round2(c.currentBalance + total) }
                  : c
              )
            : prev.customers;

        const debitAccountId =
          input.paymentMethod === 'CASH'
            ? 'acc-1101'
            : input.paymentMethod === 'CREDIT'
              ? 'acc-1201'
              : 'acc-1102';

        const openPeriod =
          prev.accountingPeriods.find((ap) => ap.status === 'OPEN') ??
          prev.accountingPeriods[0];

        const jeLines: JournalEntryLine[] = [
          {
            id: `jel-${Date.now()}-1`,
            accountId: debitAccountId,
            descriptionEs: `Cobro/CxC venta ${saleNumber}`,
            descriptionEn: `Receipt/AR sale ${saleNumber}`,
            debit: total,
            credit: 0,
          },
          {
            id: `jel-${Date.now()}-2`,
            accountId: 'acc-4101',
            descriptionEs: `Ingreso neto ${saleNumber}`,
            descriptionEn: `Net revenue ${saleNumber}`,
            debit: 0,
            credit: round2(subtotal - discountAmount),
          },
        ];
        if (taxAmount > 0) {
          jeLines.push({
            id: `jel-${Date.now()}-3`,
            accountId: 'acc-2201',
            descriptionEs: `ITBIS facturado ${saleNumber}`,
            descriptionEn: `ITBIS billed ${saleNumber}`,
            debit: 0,
            credit: taxAmount,
          });
        }

        const nextJournalEntries = openPeriod
          ? [
              {
                id: `je-${Date.now()}`,
                number: `ASI-2026-00${prev.journalEntries.length + 1}`,
                date: isoDay,
                periodId: openPeriod.id,
                sourceModule: 'POS' as const,
                reference: saleNumber,
                memoEs: `Venta POS ${saleNumber} · ${customer.name}`,
                memoEn: `POS Sale ${saleNumber} · ${customer.name}`,
                status: 'POSTED' as const,
                lines: jeLines,
              },
              ...prev.journalEntries,
            ]
          : prev.journalEntries;

        return {
          ...prev,
          products: nextProducts,
          inventoryMovements: [...newMovements, ...prev.inventoryMovements],
          cashSessions: nextCashSessions,
          cashMovements: nextCashMovements,
          customers: nextCustomers,
          eInvoicing: issuedEcfResult
            ? {
                ...(prev.eInvoicing ?? createSeedEInvoicingState(prev.company)),
                sequences: issuedEcfResult.nextSequences,
                invoices: [
                  issuedEcfResult.invoice,
                  ...(prev.eInvoicing ?? createSeedEInvoicingState(prev.company)).invoices,
                ],
              }
            : prev.eInvoicing,
          sales: [
            {
              id: saleId,
              number: saleNumber,
              date: stamp,
              branchId: prev.activeBranchId,
              customerId: customer.id,
              customerName: customer.name,
              cashierName: actorName,
              paymentMethod: input.paymentMethod,
              discountPercent: discountPct,
              subtotal,
              discountAmount,
              taxAmount,
              total,
              status: 'COMPLETED',
              items: builtItems,
              internalDocId: docId,
              eInvoiceId: issuedEcfResult ? issuedEcfResult.invoice.id : null,
            },
            ...prev.sales,
          ],
          internalDocs: [
            {
              id: docId,
              number: docNumber,
              type: 'NON_FISCAL_RECEIPT',
              date: stamp,
              branchId: prev.activeBranchId,
              referenceCode: saleNumber,
              titleEs: `Comprobante interno de venta ${saleNumber}`,
              titleEn: `Internal sale receipt ${saleNumber}`,
              counterparty: customer.name,
              amount: total,
              nonFiscalNoticeEs:
                'DOCUMENTO INTERNO NO FISCAL — NO VÁLIDO PARA CRÉDITO FISCAL DGII',
              nonFiscalNoticeEn:
                'INTERNAL NON-FISCAL DOCUMENT — NOT VALID FOR DGII TAX CREDIT',
              lines: [
                ...builtItems.map((i) => ({
                  label: `${locale === 'es' ? i.nameEs : i.nameEn} x${i.quantity}`,
                  qty: i.quantity,
                  amount: i.lineSubtotal,
                })),
                ...(discountAmount > 0
                  ? [{ label: `Descuento (${discountPct}%)`, amount: -discountAmount }]
                  : []),
                ...(taxAmount > 0 ? [{ label: 'ITBIS (18%)', amount: taxAmount }] : []),
              ],
            },
            ...prev.internalDocs,
          ],
          journalEntries: nextJournalEntries,
        };
      });

      setSelectedSaleId(saleId);
      setSelectedDocumentId(docId);
      if (issuedEcfResult) {
        setSelectedEcfId(issuedEcfResult.invoice.id);
      }
      notifySuccess(
        issuedEcfResult
          ? locale === 'es'
            ? `Venta ${saleNumber} y e-CF ${issuedEcfResult.invoice.eNcf} emitidos por RD$${total.toFixed(2)}.`
            : `Sale ${saleNumber} and e-CF ${issuedEcfResult.invoice.eNcf} issued for RD$${total.toFixed(2)}.`
          : locale === 'es'
            ? `Venta ${saleNumber} confirmada por RD$${total.toFixed(2)}. Stock y caja/contabilidad actualizados.`
            : `Sale ${saleNumber} confirmed for RD$${total.toFixed(2)}. Stock and cashbox/GL updated.`
      );
      return {
        saleId,
        docId,
        ecfId: issuedEcfResult ? issuedEcfResult.invoice.id : null,
        eNcf: issuedEcfResult ? issuedEcfResult.invoice.eNcf : null,
      };
    },
    [erpState, effectiveErpState, buildIssuedInvoiceInternal, locale, persistErp, actorName, notifySuccess]
  );

  // --- Electronic Invoicing (e-CF DGII) ---
  const issueElectronicInvoice = useCallback(
    async (input: IssueEcfInput): Promise<ElectronicInvoice> => {
      if (input.items.length === 0) {
        throw new Error(
          locale === 'es'
            ? 'Agrega al menos una línea de detalle al comprobante.'
            : 'Add at least one line item to the e-CF.'
        );
      }

      const built = buildIssuedInvoiceInternal(
        effectiveErpState,
        input,
        effectiveErpState.company
      );

      await persistErp((prev) => {
        const currentEInv = prev.eInvoicing ?? createSeedEInvoicingState(prev.company);
        return {
          ...prev,
          eInvoicing: {
            ...currentEInv,
            sequences: built.nextSequences,
            invoices: [built.invoice, ...currentEInv.invoices],
          },
          sales: input.saleId
            ? prev.sales.map((s) =>
                s.id === input.saleId ? { ...s, eInvoiceId: built.invoice.id } : s
              )
            : prev.sales,
        };
      });

      setSelectedEcfId(built.invoice.id);
      notifySuccess(
        locale === 'es'
          ? `Comprobante ${built.invoice.eNcf} firmado (${built.invoice.status}).`
          : `Document ${built.invoice.eNcf} signed (${built.invoice.status}).`
      );
      return built.invoice;
    },
    [effectiveErpState, buildIssuedInvoiceInternal, locale, persistErp, notifySuccess]
  );

  const pollEcfTrackStatus = useCallback(
    async (
      invoiceId: string,
      targetStatus: Extract<EcfStatus, 'ACEPTADO' | 'ACEPTADO_CONDICIONAL' | 'RECHAZADO'> = 'ACEPTADO'
    ) => {
      const current = effectiveErpState.eInvoicing.invoices.find((i) => i.id === invoiceId);
      if (!current) return;

      await persistErp((prev) => {
        const currentEInv = prev.eInvoicing ?? createSeedEInvoicingState(prev.company);
        return {
          ...prev,
          eInvoicing: {
            ...currentEInv,
            invoices: currentEInv.invoices.map((inv) => {
              if (inv.id !== invoiceId) return inv;
              const statusMessageEs =
                targetStatus === 'ACEPTADO'
                  ? `Consulta TrackID ${inv.trackId}: e-CF ACEPTADO por la DGII (${nowStamp()}).`
                  : targetStatus === 'ACEPTADO_CONDICIONAL'
                    ? `Consulta TrackID ${inv.trackId}: ACEPTADO CONDICIONAL con advertencias menores.`
                    : `Consulta TrackID ${inv.trackId}: RECHAZADO por error de esquema.`;
              const statusMessageEn =
                targetStatus === 'ACEPTADO'
                  ? `TrackID ${inv.trackId} query: e-CF ACCEPTED by DGII (${nowStamp()}).`
                  : targetStatus === 'ACEPTADO_CONDICIONAL'
                    ? `TrackID ${inv.trackId} query: CONDITIONALLY ACCEPTED with minor warnings.`
                    : `TrackID ${inv.trackId} query: REJECTED due to schema error.`;
              return {
                ...inv,
                status: targetStatus,
                statusMessageEs,
                statusMessageEn,
              };
            }),
          },
        };
      });

      notifySuccess(
        locale === 'es'
          ? `Estado TrackID actualizado para ${current.eNcf}: ${targetStatus}.`
          : `TrackID status updated for ${current.eNcf}: ${targetStatus}.`
      );
    },
    [effectiveErpState.eInvoicing.invoices, locale, persistErp, notifySuccess]
  );

  const voidElectronicInvoice = useCallback(
    async (invoiceId: string, reason: string) => {
      const target = effectiveErpState.eInvoicing.invoices.find((i) => i.id === invoiceId);
      if (!target) return;
      if (target.status === 'ANULADO' || target.status === 'RECHAZADO') {
        setErrorMessage(
          locale === 'es'
            ? 'Este comprobante ya está anulado o fue rechazado y no requiere anulación.'
            : 'This e-CF is already voided or rejected and cannot be cancelled.'
        );
        return;
      }

      const stamp = nowStamp();
      await persistErp((prev) => {
        const currentEInv = prev.eInvoicing ?? createSeedEInvoicingState(prev.company);
        return {
          ...prev,
          eInvoicing: {
            ...currentEInv,
            invoices: currentEInv.invoices.map((inv) =>
              inv.id === invoiceId
                ? {
                    ...inv,
                    status: 'ANULADO',
                    voidReason:
                      reason.trim() ||
                      (locale === 'es'
                        ? 'Anulación administrativa de e-NCF'
                        : 'Administrative e-NCF cancellation'),
                    voidedAt: stamp,
                    statusMessageEs: `Comprobante anulado ante DGII (${stamp}).`,
                    statusMessageEn: `Document voided with DGII (${stamp}).`,
                  }
                : inv
            ),
          },
        };
      });

      notifySuccess(
        locale === 'es'
          ? `Comprobante ${target.eNcf} anulado ante la DGII (Demo).`
          : `Document ${target.eNcf} voided with DGII (Demo).`
      );
    },
    [effectiveErpState.eInvoicing.invoices, locale, persistErp, notifySuccess]
  );

  const upsertEcfSequenceRange = useCallback(
    async (range: EcfSequenceRange) => {
      await persistErp((prev) => {
        const currentEInv = prev.eInvoicing ?? createSeedEInvoicingState(prev.company);
        const exists = currentEInv.sequences.some((s) => s.id === range.id);
        const sequences = exists
          ? currentEInv.sequences.map((s) => (s.id === range.id ? range : s))
          : [range, ...currentEInv.sequences];
        return {
          ...prev,
          eInvoicing: {
            ...currentEInv,
            sequences,
          },
        };
      });
      notifySuccess(
        locale === 'es'
          ? `Secuencia ${range.prefix} guardada.`
          : `Sequence ${range.prefix} saved.`
      );
    },
    [persistErp, locale, notifySuccess]
  );

  const toggleEcfSequenceActive = useCallback(
    async (sequenceId: string) => {
      await persistErp((prev) => {
        const currentEInv = prev.eInvoicing ?? createSeedEInvoicingState(prev.company);
        return {
          ...prev,
          eInvoicing: {
            ...currentEInv,
            sequences: currentEInv.sequences.map((s) =>
              s.id === sequenceId ? { ...s, active: !s.active } : s
            ),
          },
        };
      });
      notifySuccess(
        locale === 'es' ? 'Estado de secuencia actualizado.' : 'Sequence status updated.'
      );
    },
    [persistErp, locale, notifySuccess]
  );

  const updateEcfConfig = useCallback(
    async (partial: Partial<EcfConfigState>) => {
      await persistErp((prev) => {
        const currentEInv = prev.eInvoicing ?? createSeedEInvoicingState(prev.company);
        return {
          ...prev,
          eInvoicing: {
            ...currentEInv,
            config: {
              ...currentEInv.config,
              ...partial,
            },
          },
        };
      });
      notifySuccess(
        locale === 'es'
          ? 'Configuración de facturación electrónica actualizada.'
          : 'Electronic invoicing settings updated.'
      );
    },
    [persistErp, locale, notifySuccess]
  );

  const toggleEcfChecklistItem = useCallback(
    async (itemId: string) => {
      await persistErp((prev) => {
        const currentEInv = prev.eInvoicing ?? createSeedEInvoicingState(prev.company);
        return {
          ...prev,
          eInvoicing: {
            ...currentEInv,
            config: {
              ...currentEInv.config,
              checklist: currentEInv.config.checklist.map((item) =>
                item.id === itemId ? { ...item, completed: !item.completed } : item
              ),
            },
          },
        };
      });
    },
    [persistErp]
  );

  const renewDemoCertificate = useCallback(async () => {
    const today = todayIso();
    const nextYear = `${Number(today.slice(0, 4)) + 1}${today.slice(4)}`;
    await persistErp((prev) => {
      const currentEInv = prev.eInvoicing ?? createSeedEInvoicingState(prev.company);
      return {
        ...prev,
        eInvoicing: {
          ...currentEInv,
          config: {
            ...currentEInv.config,
            certificate: {
              ...currentEInv.config.certificate,
              serialNumber: `IND-CERT-${today.slice(0, 4)}-${Date.now().toString().slice(-6)}`,
              validFrom: today,
              validTo: nextYear,
              status: 'ACTIVE',
            },
          },
        },
      };
    });
    notifySuccess(
      locale === 'es'
        ? 'Certificado digital tributario renovado por 12 meses (Demo).'
        : 'Tax digital certificate renewed for 12 months (Demo).'
    );
  }, [persistErp, locale, notifySuccess]);

  const openSaleReceiptDoc = useCallback(
    async (saleId: string) => {
      const sale = erpState.sales.find((s) => s.id === saleId);
      if (!sale) return;
      if (sale.internalDocId) {
        setSelectedDocumentId(sale.internalDocId);
        setActiveScreen('internal_docs');
        return;
      }
      const docId = `doc-${Date.now()}`;
      const docNumber = `DOC-INT-${sale.number.slice(-4)}`;
      await persistErp((prev) => ({
        ...prev,
        sales: prev.sales.map((s) =>
          s.id === saleId ? { ...s, internalDocId: docId } : s
        ),
        internalDocs: [
          {
            id: docId,
            number: docNumber,
            type: 'NON_FISCAL_RECEIPT',
            date: nowStamp(),
            branchId: sale.branchId,
            referenceCode: sale.number,
            titleEs: `Comprobante interno de venta ${sale.number}`,
            titleEn: `Internal sale receipt ${sale.number}`,
            counterparty: sale.customerName,
            amount: sale.total,
            nonFiscalNoticeEs:
              'DOCUMENTO INTERNO NO FISCAL — NO VÁLIDO PARA CRÉDITO FISCAL DGII',
            nonFiscalNoticeEn:
              'INTERNAL NON-FISCAL DOCUMENT — NOT VALID FOR DGII TAX CREDIT',
            lines: sale.items.map((i) => ({
              label: `${locale === 'es' ? i.nameEs : i.nameEn} x${i.quantity}`,
              qty: i.quantity,
              amount: i.lineTotal,
            })),
          },
          ...prev.internalDocs,
        ],
      }));
      setSelectedDocumentId(docId);
      setActiveScreen('internal_docs');
    },
    [erpState.sales, locale, persistErp, setActiveScreen]
  );

  // --- Purchases & Banks ---
  const registerCreditPurchase = useCallback(
    async (input: CreditPurchaseInput) => {
      const supplier = erpState.suppliers.find((s) => s.id === input.supplierId);
      const product = erpState.products.find((p) => p.id === input.productId);
      if (!supplier || !product || input.quantity <= 0 || input.unitCost <= 0) {
        setErrorMessage(
          locale === 'es'
            ? 'Completa proveedor, producto, cantidad y costo válidos.'
            : 'Provide valid supplier, product, quantity, and cost.'
        );
        return;
      }

      const totalAmount = round2(input.quantity * input.unitCost);
      const number = `COMP-2026-0${erpState.purchases.length + 20}`;
      const stamp = nowStamp();
      const isoDay = todayIso();

      await persistErp((prev) => {
        const nextStock = product.stock + input.quantity;
        const openPeriod =
          prev.accountingPeriods.find((ap) => ap.status === 'OPEN') ??
          prev.accountingPeriods[0];
        return {
          ...prev,
          products: prev.products.map((p) =>
            p.id === product.id ? { ...p, stock: nextStock, cost: input.unitCost } : p
          ),
          inventoryMovements: [
            {
              id: `mov-pur-${Date.now()}`,
              date: stamp,
              productId: product.id,
              branchId: prev.activeBranchId,
              type: 'PURCHASE',
              quantityDelta: input.quantity,
              stockAfter: nextStock,
              reference: number,
              reasonEs: `Compra a crédito ${supplier.name}`,
              reasonEn: `Credit purchase ${supplier.name}`,
              actorName,
            },
            ...prev.inventoryMovements,
          ],
          purchases: [
            {
              id: `pur-${Date.now()}`,
              number,
              date: isoDay,
              dueDate: input.dueDate || isoDay,
              supplierId: supplier.id,
              supplierName: supplier.name,
              branchId: prev.activeBranchId,
              productId: product.id,
              productName: locale === 'es' ? product.nameEs : product.nameEn,
              quantity: input.quantity,
              totalAmount,
              paidAmount: 0,
              status: 'OPEN',
              notesEs: input.notes || 'Compra a crédito (Solo demo)',
              notesEn: input.notes || 'Credit purchase (Demo only)',
            },
            ...prev.purchases,
          ],
          journalEntries: openPeriod
            ? [
                {
                  id: `je-pur-${Date.now()}`,
                  number: `ASI-2026-00${prev.journalEntries.length + 1}`,
                  date: isoDay,
                  periodId: openPeriod.id,
                  sourceModule: 'PURCHASES',
                  reference: number,
                  memoEs: `Compra a crédito ${number} · ${supplier.name}`,
                  memoEn: `Credit purchase ${number} · ${supplier.name}`,
                  status: 'POSTED',
                  lines: [
                    {
                      id: `jel-${Date.now()}-a`,
                      accountId: 'acc-1401',
                      descriptionEs: `Entrada inventario ${number}`,
                      descriptionEn: `Inventory receipt ${number}`,
                      debit: totalAmount,
                      credit: 0,
                    },
                    {
                      id: `jel-${Date.now()}-b`,
                      accountId: 'acc-2101',
                      descriptionEs: `CxP ${supplier.name}`,
                      descriptionEn: `AP ${supplier.name}`,
                      debit: 0,
                      credit: totalAmount,
                    },
                  ],
                },
                ...prev.journalEntries,
              ]
            : prev.journalEntries,
        };
      });

      notifySuccess(
        locale === 'es'
          ? `Compra ${number} registrada. Stock y saldo CxP actualizados.`
          : `Purchase ${number} recorded. Stock and AP balance updated.`
      );
    },
    [erpState.suppliers, erpState.products, locale, persistErp, actorName, notifySuccess]
  );

  const payPurchaseBill = useCallback(
    async (purchaseId: string, amount: number) => {
      const bill = erpState.purchases.find((p) => p.id === purchaseId);
      if (!bill) return;
      const remaining = round2(bill.totalAmount - bill.paidAmount);
      if (amount <= 0 || amount > remaining) {
        setErrorMessage(
          locale === 'es'
            ? `El pago debe estar entre RD$0.01 y RD$${remaining.toFixed(2)}.`
            : `Payment must be between RD$0.01 and RD$${remaining.toFixed(2)}.`
        );
        return;
      }

      const nextPaid = round2(bill.paidAmount + amount);
      const nextStatus = nextPaid >= bill.totalAmount ? 'PAID' : 'PARTIAL';
      await persistErp((prev) => ({
        ...prev,
        purchases: prev.purchases.map((p) =>
          p.id === purchaseId ? { ...p, paidAmount: nextPaid, status: nextStatus } : p
        ),
        bankTransactions: [
          {
            id: `btx-${Date.now()}`,
            bankAccountId: prev.bankAccounts[0]?.id ?? 'bnk-1',
            date: todayIso(),
            type: 'WITHDRAWAL',
            reference: `PAG-${bill.number}`,
            descriptionEs: `Pago proveedor ${bill.supplierName} (${bill.number})`,
            descriptionEn: `Supplier payment ${bill.supplierName} (${bill.number})`,
            amount: -round2(amount),
            reconciled: false,
          },
          ...prev.bankTransactions,
        ],
      }));

      notifySuccess(
        locale === 'es'
          ? `Pago de RD$${amount.toFixed(2)} aplicado a ${bill.number}.`
          : `Payment of RD$${amount.toFixed(2)} applied to ${bill.number}.`
      );
    },
    [erpState.purchases, locale, persistErp, notifySuccess]
  );

  const addBankTransaction = useCallback(
    async (tx: Omit<BankTransaction, 'id' | 'reconciled'>) => {
      await persistErp((prev) => ({
        ...prev,
        bankAccounts: prev.bankAccounts.map((b) =>
          b.id === tx.bankAccountId
            ? { ...b, ledgerBalance: round2(b.ledgerBalance + tx.amount) }
            : b
        ),
        bankTransactions: [
          {
            ...tx,
            id: `btx-${Date.now()}`,
            reconciled: false,
          },
          ...prev.bankTransactions,
        ],
      }));
      notifySuccess(
        locale === 'es'
          ? 'Movimiento bancario registrado (Solo demo).'
          : 'Bank transaction recorded (Demo only).'
      );
    },
    [persistErp, locale, notifySuccess]
  );

  const toggleBankReconciled = useCallback(
    async (txId: string) => {
      await persistErp((prev) => ({
        ...prev,
        bankTransactions: prev.bankTransactions.map((tx) =>
          tx.id === txId ? { ...tx, reconciled: !tx.reconciled } : tx
        ),
      }));
      notifySuccess(
        locale === 'es'
          ? 'Estado de conciliación bancaria actualizado.'
          : 'Bank reconciliation status updated.'
      );
    },
    [persistErp, locale, notifySuccess]
  );

  // --- Accounting ---
  const upsertGlAccount = useCallback(
    async (account: GlAccount) => {
      await persistErp((prev) => {
        const exists = prev.glAccounts.some((a) => a.id === account.id);
        const glAccounts = exists
          ? prev.glAccounts.map((a) => (a.id === account.id ? account : a))
          : [...prev.glAccounts, account];
        return { ...prev, glAccounts };
      });
      notifySuccess(
        locale === 'es'
          ? `Cuenta ${account.code} guardada.`
          : `Account ${account.code} saved.`
      );
    },
    [persistErp, locale, notifySuccess]
  );

  const setAccountingPeriodStatus = useCallback(
    async (periodId: string, status: AccountingPeriod['status']) => {
      await persistErp((prev) => ({
        ...prev,
        accountingPeriods: prev.accountingPeriods.map((ap) =>
          ap.id === periodId ? { ...ap, status } : ap
        ),
      }));
      notifySuccess(
        locale === 'es'
          ? 'Estado del período contable actualizado.'
          : 'Accounting period status updated.'
      );
    },
    [persistErp, locale, notifySuccess]
  );

  const createJournalEntry = useCallback(
    async (input: {
      date: string;
      periodId: string;
      reference: string;
      memo: string;
      lines: Omit<JournalEntryLine, 'id'>[];
    }) => {
      const totalDebit = round2(input.lines.reduce((s, l) => s + l.debit, 0));
      const totalCredit = round2(input.lines.reduce((s, l) => s + l.credit, 0));
      if (input.lines.length < 2 || totalDebit <= 0 || totalDebit !== totalCredit) {
        setErrorMessage(
          locale === 'es'
            ? `El asiento debe cuadrar (Débito RD$${totalDebit.toFixed(2)} = Crédito RD$${totalCredit.toFixed(2)}).`
            : `Journal entry must balance (Debit RD$${totalDebit.toFixed(2)} = Credit RD$${totalCredit.toFixed(2)}).`
        );
        return;
      }

      await persistErp((prev) => ({
        ...prev,
        journalEntries: [
          {
            id: `je-${Date.now()}`,
            number: `ASI-2026-00${prev.journalEntries.length + 1}`,
            date: input.date,
            periodId: input.periodId,
            sourceModule: 'MANUAL',
            reference: input.reference || `MAN-${Date.now().toString().slice(-4)}`,
            memoEs: input.memo || 'Asiento manual de diario',
            memoEn: input.memo || 'Manual journal entry',
            status: 'POSTED',
            lines: input.lines.map((l, idx) => ({
              ...l,
              id: `jel-${Date.now()}-${idx}`,
            })),
          },
          ...prev.journalEntries,
        ],
      }));
      notifySuccess(
        locale === 'es'
          ? 'Asiento contabilizado en Diario, Mayor y Balanza.'
          : 'Journal entry posted to Journal, Ledger, and Trial Balance.'
      );
    },
    [locale, persistErp, notifySuccess]
  );

  const toggleReconciliationItem = useCallback(
    async (itemId: string) => {
      await persistErp((prev) => ({
        ...prev,
        reconciliationItems: prev.reconciliationItems.map((it) =>
          it.id === itemId
            ? { ...it, status: it.status === 'MATCHED' ? 'PENDING' : 'MATCHED' }
            : it
        ),
      }));
      notifySuccess(
        locale === 'es'
          ? 'Partida de conciliación actualizada.'
          : 'Reconciliation item updated.'
      );
    },
    [persistErp, locale, notifySuccess]
  );

  // --- Payroll Config ---
  const updateWorkRiskRule = useCallback(
    async (rule: WorkRiskRule) => {
      await persistErp((prev) => ({
        ...prev,
        workRiskRules: prev.workRiskRules.map((r) => (r.id === rule.id ? rule : r)),
      }));
      notifySuccess(
        locale === 'es' ? 'Regla SRL actualizada.' : 'SRL risk rule updated.'
      );
    },
    [persistErp, locale, notifySuccess]
  );

  const updateConceptTreatmentRule = useCallback(
    async (rule: ConceptTreatmentRule) => {
      await persistErp((prev) => ({
        ...prev,
        conceptTreatmentRules: prev.conceptTreatmentRules.map((r) =>
          r.id === rule.id ? rule : r
        ),
      }));
      notifySuccess(
        locale === 'es' ? 'Tratamiento de concepto guardado.' : 'Concept rule saved.'
      );
    },
    [persistErp, locale, notifySuccess]
  );

  const value: PayrollWorkspaceContextValue = {
    periods,
    employees,
    novelties,
    erpState: effectiveErpState,
    activeBranch,
    isLoading,
    isMutating,
    actionType,
    errorMessage,
    clearError,
    successMessage,
    clearSuccess,
    notifySuccess,
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
    selectedAccountId,
    setSelectedAccountId,
    openAccountLedger,
    selectedSaleId,
    setSelectedSaleId,
    selectedDocumentId,
    setSelectedDocumentId,
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
    enabledModules,
    tenantStatus,
    tenantPlanLabel,
    onLogout,
    onNavigateToPlatformLogin,
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
    resetDemoData,
    updateBusinessSettings,
    updateCompanyProfile,
    upsertBranch,
    setActiveBranchId,
    upsertErpUser,
    updateRoleDefinition,
    upsertProduct,
    upsertCategory,
    upsertBrand,
    upsertUnit,
    upsertPriceList,
    upsertCustomer,
    registerInventoryAdjustment,
    openCashbox,
    closeCashbox,
    recordCashMovement,
    confirmPosSale,
    openSaleReceiptDoc,
    selectedEcfId,
    setSelectedEcfId,
    ecfDraftPrefill,
    setEcfDraftPrefill,
    ecfLookupPrefill,
    setEcfLookupPrefill,
    issueElectronicInvoice,
    pollEcfTrackStatus,
    voidElectronicInvoice,
    upsertEcfSequenceRange,
    toggleEcfSequenceActive,
    updateEcfConfig,
    toggleEcfChecklistItem,
    renewDemoCertificate,
    registerCreditPurchase,
    payPurchaseBill,
    addBankTransaction,
    toggleBankReconciled,
    upsertGlAccount,
    setAccountingPeriodStatus,
    createJournalEntry,
    toggleReconciliationItem,
    updateWorkRiskRule,
    updateConceptTreatmentRule,
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
