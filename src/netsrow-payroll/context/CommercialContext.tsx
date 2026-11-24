import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  DEFAULT_COMMERCIAL_SELECTION,
  PRESET_POS_BUNDLE_INSTALLMENTS,
  PRESET_SOFTWARE_WITH_PAYROLL,
  SEED_COMMERCIAL_CATALOG,
} from '../data/commercialCatalog';
import {
  COMMERCIAL_TRANSLATIONS,
  CommercialTranslations,
} from '../i18n/commercialTranslations';
import {
  computeQuoteBreakdown,
  validateCommercialDependencies,
} from '../services/commercialPricing';
import {
  CommercialApiClient,
  CommercialCatalog,
  CommercialFaultMode,
  CommercialModuleCode,
  CommercialSelectionState,
  ContractMode,
  QuoteBreakdown,
  QuoteFormDraft,
  QuoteSubmissionResult,
} from '../types/commercial';
import { Locale, ThemeMode } from '../types/payroll';
import { AppRoutePath } from '../types/platform';

export type ConfiguratorStep = 1 | 2 | 3 | 4;

export interface CommercialContextValue {
  catalog: CommercialCatalog;
  isLoadingCatalog: boolean;
  selection: CommercialSelectionState;
  breakdown: QuoteBreakdown;
  dependencyCheck: {
    valid: boolean;
    missing: { module: CommercialModuleCode; requires: CommercialModuleCode[] }[];
  };
  configuratorStep: ConfiguratorStep;
  setConfiguratorStep: (step: ConfiguratorStep) => void;
  setContractMode: (mode: ContractMode) => void;
  selectPlan: (planId: string) => void;
  toggleAddon: (code: CommercialModuleCode) => void;
  confirmRequiredDependencies: () => void;
  selectHardware: (hardwareId: string) => void;
  setHardwareQuantity: (qty: number) => void;
  selectPaymentOption: (paymentOptionId: string) => void;
  selectInstallation: (installationId: string) => void;
  selectTraining: (trainingId: string) => void;
  applyPreset: (preset: 'SOFTWARE_PAYROLL' | 'BUNDLE_INSTALLMENTS') => void;
  openConfiguratorWithPreset: (
    mode: ContractMode | 'KEEP',
    addon?: CommercialModuleCode
  ) => void;

  quoteDraft: QuoteFormDraft;
  updateQuoteDraft: (patch: Partial<QuoteFormDraft>) => void;
  isSubmittingQuote: boolean;
  quoteError: string | null;
  clearQuoteError: () => void;
  lastSubmission: QuoteSubmissionResult | null;
  clearSubmission: () => void;
  faultMode: CommercialFaultMode;
  setFaultMode: (mode: CommercialFaultMode) => void;
  submitQuote: () => Promise<QuoteSubmissionResult>;

  locale: Locale;
  setLocale: (loc: Locale) => void;
  theme: ThemeMode;
  toggleTheme: () => void;
  ct: CommercialTranslations;
  navigateTo: (path: AppRoutePath | string) => void;
  isTenantAuthenticated: boolean;
}

const CommercialContext = createContext<CommercialContextValue | null>(null);

export interface CommercialProviderProps {
  children: React.ReactNode;
  apiClient: CommercialApiClient;
  locale: Locale;
  onLocaleChange: (loc: Locale) => void;
  theme: ThemeMode;
  onThemeToggle: () => void;
  onNavigate: (target: string) => void;
  isTenantAuthenticated?: boolean;
}

const EMPTY_DRAFT: QuoteFormDraft = {
  contactName: '',
  businessName: '',
  contactEmailOrWhatsapp: '',
  businessType: '',
  branchCount: '1',
  comments: '',
  alreadyIssuesElectronicReceipts: '',
  eInvoicingBranchesCount: '',
};

export function CommercialProvider({
  children,
  apiClient,
  locale,
  onLocaleChange,
  theme,
  onThemeToggle,
  onNavigate,
  isTenantAuthenticated = false,
}: CommercialProviderProps) {
  const [catalog, setCatalog] = useState<CommercialCatalog>(SEED_COMMERCIAL_CATALOG);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);
  const [selection, setSelection] = useState<CommercialSelectionState>(
    DEFAULT_COMMERCIAL_SELECTION
  );
  const [configuratorStep, setConfiguratorStep] = useState<ConfiguratorStep>(1);
  const [quoteDraft, setQuoteDraft] = useState<QuoteFormDraft>(EMPTY_DRAFT);
  const [isSubmittingQuote, setIsSubmittingQuote] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [lastSubmission, setLastSubmission] = useState<QuoteSubmissionResult | null>(null);
  const [faultMode, setFaultMode] = useState<CommercialFaultMode>('NONE');

  const ct = COMMERCIAL_TRANSLATIONS[locale];

  useEffect(() => {
    let cancelled = false;
    setIsLoadingCatalog(true);
    apiClient
      .fetchCatalog()
      .then((res) => {
        if (!cancelled) setCatalog(res);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingCatalog(false);
      });
    return () => {
      cancelled = true;
    };
  }, [apiClient]);

  const activePlan = useMemo(
    () => catalog.plans.find((p) => p.id === selection.planId) ?? catalog.plans[0],
    [catalog.plans, selection.planId]
  );

  const dependencyCheck = useMemo(
    () =>
      validateCommercialDependencies(
        activePlan.includedModules,
        selection.selectedAddons,
        catalog
      ),
    [activePlan.includedModules, selection.selectedAddons, catalog]
  );

  const breakdown = useMemo(
    () => computeQuoteBreakdown(selection, catalog),
    [selection, catalog]
  );

  const setContractMode = useCallback(
    (mode: ContractMode) => {
      setSelection((prev) => {
        if (prev.mode === mode) return prev;
        if (mode === 'POS_BUNDLE') {
          const hw =
            catalog.hardwareOptions.find((h) => h.id === prev.hardwareId) ??
            catalog.hardwareOptions[0];
          const payOpt =
            hw.paymentOptions.find((p) => p.id === prev.paymentOptionId) ??
            hw.paymentOptions[0];
          return {
            ...prev,
            mode,
            hardwareId: hw.id,
            paymentOptionId: payOpt.id,
            installationId:
              prev.installationId === 'inst-none' ? 'inst-estandar' : prev.installationId,
            trainingId:
              prev.trainingId === 'trn-ninguna'
                ? 'trn-incluida-paquete'
                : prev.trainingId,
          };
        }
        return {
          ...prev,
          mode,
          installationId:
            prev.installationId === 'inst-multisucursal'
              ? 'inst-none'
              : prev.installationId,
          trainingId:
            prev.trainingId === 'trn-incluida-paquete'
              ? 'trn-ninguna'
              : prev.trainingId,
        };
      });
      setLastSubmission(null);
    },
    [catalog.hardwareOptions]
  );

  const selectPlan = useCallback(
    (planId: string) => {
      const targetPlan = catalog.plans.find((p) => p.id === planId);
      setSelection((prev) => ({
        ...prev,
        planId,
        // Drop add-ons now included inside the chosen plan to avoid any redundancy
        selectedAddons: targetPlan
          ? prev.selectedAddons.filter(
              (code) => !targetPlan.includedModules.includes(code)
            )
          : prev.selectedAddons,
      }));
      setLastSubmission(null);
    },
    [catalog.plans]
  );

  const toggleAddon = useCallback(
    (code: CommercialModuleCode) => {
      const modDef = catalog.modules.find((m) => m.code === code);
      if (!modDef || modDef.status === 'IN_DEVELOPMENT') return;
      if (activePlan.includedModules.includes(code)) return;

      setSelection((prev) => {
        const exists = prev.selectedAddons.includes(code);
        return {
          ...prev,
          selectedAddons: exists
            ? prev.selectedAddons.filter((c) => c !== code)
            : [...prev.selectedAddons, code],
        };
      });
      setLastSubmission(null);
    },
    [catalog.modules, activePlan.includedModules]
  );

  const confirmRequiredDependencies = useCallback(() => {
    setSelection((prev) => {
      const next = new Set<CommercialModuleCode>(prev.selectedAddons);
      dependencyCheck.missing.forEach((m) => {
        m.requires.forEach((req) => {
          if (!activePlan.includedModules.includes(req)) {
            next.add(req);
          }
        });
      });
      return { ...prev, selectedAddons: Array.from(next) };
    });
  }, [dependencyCheck.missing, activePlan.includedModules]);

  const selectHardware = useCallback(
    (hardwareId: string) => {
      const hw = catalog.hardwareOptions.find((h) => h.id === hardwareId);
      if (!hw) return;
      setSelection((prev) => ({
        ...prev,
        hardwareId,
        hardwareQuantity: hw.defaultQuantity,
        paymentOptionId: hw.paymentOptions[0]?.id ?? prev.paymentOptionId,
        installationId:
          hardwareId === 'hw-custom-multisucursal'
            ? 'inst-multisucursal'
            : prev.installationId,
      }));
      setLastSubmission(null);
    },
    [catalog.hardwareOptions]
  );

  const setHardwareQuantity = useCallback((qty: number) => {
    const safe = Math.max(1, Math.min(20, Math.round(qty) || 1));
    setSelection((prev) => ({ ...prev, hardwareQuantity: safe }));
    setLastSubmission(null);
  }, []);

  const selectPaymentOption = useCallback((paymentOptionId: string) => {
    setSelection((prev) => ({ ...prev, paymentOptionId }));
    setLastSubmission(null);
  }, []);

  const selectInstallation = useCallback((installationId: string) => {
    setSelection((prev) => ({ ...prev, installationId }));
    setLastSubmission(null);
  }, []);

  const selectTraining = useCallback((trainingId: string) => {
    setSelection((prev) => ({ ...prev, trainingId }));
    setLastSubmission(null);
  }, []);

  const applyPreset = useCallback(
    (preset: 'SOFTWARE_PAYROLL' | 'BUNDLE_INSTALLMENTS') => {
      if (preset === 'SOFTWARE_PAYROLL') {
        setSelection({ ...PRESET_SOFTWARE_WITH_PAYROLL });
        setConfiguratorStep(2);
      } else {
        setSelection({ ...PRESET_POS_BUNDLE_INSTALLMENTS });
        setConfiguratorStep(3);
      }
      setLastSubmission(null);
    },
    []
  );

  const openConfiguratorWithPreset = useCallback(
    (mode: ContractMode | 'KEEP', addon?: CommercialModuleCode) => {
      if (mode !== 'KEEP') {
        setContractMode(mode);
      }
      if (addon) {
        setSelection((prev) => {
          const nextMode = mode === 'KEEP' ? prev.mode : mode;
          const plan = catalog.plans.find((p) => p.id === prev.planId) ?? catalog.plans[0];
          if (plan.includedModules.includes(addon)) {
            return { ...prev, mode: nextMode };
          }
          const set = new Set<CommercialModuleCode>(prev.selectedAddons);
          set.add(addon);
          return { ...prev, mode: nextMode, selectedAddons: Array.from(set) };
        });
        setConfiguratorStep(2);
      } else {
        setConfiguratorStep(mode === 'POS_BUNDLE' ? 3 : 2);
      }
      setLastSubmission(null);
      onNavigate('/planes');
    },
    [catalog.plans, onNavigate, setContractMode]
  );

  const updateQuoteDraft = useCallback((patch: Partial<QuoteFormDraft>) => {
    setQuoteDraft((prev) => ({ ...prev, ...patch }));
  }, []);

  const clearQuoteError = useCallback(() => setQuoteError(null), []);
  const clearSubmission = useCallback(() => setLastSubmission(null), []);

  const submitQuote = useCallback(async () => {
    setIsSubmittingQuote(true);
    setQuoteError(null);
    try {
      const result = await apiClient.submitQuoteRequest(
        {
          locale,
          selection,
          breakdown,
          contact: quoteDraft,
          submittedAt: new Date().toISOString(),
        },
        faultMode
      );
      setLastSubmission(result);
      return result;
    } catch (err: unknown) {
      const msg =
        err instanceof Error && err.message === 'VALIDATION_ERROR'
          ? ct.quoteForm.errContactRequired
          : ct.quoteForm.errServerGeneric;
      setQuoteError(msg);
      throw err;
    } finally {
      setIsSubmittingQuote(false);
    }
  }, [
    apiClient,
    locale,
    selection,
    breakdown,
    quoteDraft,
    faultMode,
    ct.quoteForm.errContactRequired,
    ct.quoteForm.errServerGeneric,
  ]);

  const value: CommercialContextValue = {
    catalog,
    isLoadingCatalog,
    selection,
    breakdown,
    dependencyCheck,
    configuratorStep,
    setConfiguratorStep,
    setContractMode,
    selectPlan,
    toggleAddon,
    confirmRequiredDependencies,
    selectHardware,
    setHardwareQuantity,
    selectPaymentOption,
    selectInstallation,
    selectTraining,
    applyPreset,
    openConfiguratorWithPreset,
    quoteDraft,
    updateQuoteDraft,
    isSubmittingQuote,
    quoteError,
    clearQuoteError,
    lastSubmission,
    clearSubmission,
    faultMode,
    setFaultMode,
    submitQuote,
    locale,
    setLocale: onLocaleChange,
    theme,
    toggleTheme: onThemeToggle,
    ct,
    navigateTo: onNavigate,
    isTenantAuthenticated,
  };

  return (
    <CommercialContext.Provider value={value}>{children}</CommercialContext.Provider>
  );
}

export function useCommercial(): CommercialContextValue {
  const ctx = useContext(CommercialContext);
  if (!ctx) {
    throw new Error('useCommercial must be used inside CommercialProvider');
  }
  return ctx;
}
