import { Locale } from './payroll';

export type ContractMode = 'SOFTWARE_ONLY' | 'POS_BUNDLE';

export type ModuleAvailabilityStatus =
  | 'INCLUDED'
  | 'ADDON_AVAILABLE'
  | 'IN_DEVELOPMENT';

export type PricingStatus = 'DEFINED' | 'QUOTE_REQUIRED';

export type CommercialModuleCode =
  | 'POS'
  | 'SALES'
  | 'CASHBOX'
  | 'CUSTOMERS'
  | 'CATALOG'
  | 'INVENTORY'
  | 'PAYROLL'
  | 'ACCOUNTING'
  | 'PURCHASES_AP'
  | 'ACCOUNTS_RECEIVABLE'
  | 'TREASURY'
  | 'E_INVOICING';

export interface CommercialModule {
  code: CommercialModuleCode;
  nameEs: string;
  nameEn: string;
  benefitEs: string;
  benefitEn: string;
  category: 'CORE' | 'ADDON' | 'ROADMAP';
  status: ModuleAvailabilityStatus;
  priceStatus: PricingStatus;
  /** Stored in integer cents (e.g. 60000 = RD$600.00). Null when QUOTE_REQUIRED or IN_DEVELOPMENT. */
  monthlyPriceCents: number | null;
  dependsOn: CommercialModuleCode[];
  isPrototypeDemoOnly?: boolean;
}

export interface CommercialPlan {
  id: string;
  code: string;
  nameEs: string;
  nameEn: string;
  summaryEs: string;
  summaryEn: string;
  monthlyPriceCents: number;
  includedModules: CommercialModuleCode[];
  isIllustrative: boolean;
}

export interface HardwarePaymentOption {
  id: string;
  labelEs: string;
  labelEn: string;
  type: 'INSTALLMENTS' | 'UPFRONT' | 'QUOTE_REQUIRED';
  installmentsCount: number;
  monthlyInstallmentCents: number | null;
  upfrontPriceCents: number | null;
  downPaymentCents: number | null;
  interestNoteEs: string | null;
  interestNoteEn: string | null;
  isIllustrative: boolean;
}

export interface HardwarePackageItem {
  id: string;
  nameEs: string;
  nameEn: string;
  specsEs: string[];
  specsEn: string[];
  defaultQuantity: number;
  maxSelfServiceQuantity: number;
  isIllustrativeHardware: boolean;
  paymentOptions: HardwarePaymentOption[];
}

export interface CommercialServiceOption {
  id: string;
  kind: 'INSTALLATION' | 'TRAINING';
  nameEs: string;
  nameEn: string;
  scopeEs: string;
  scopeEn: string;
  applicableModes: ContractMode[];
  priceStatus: PricingStatus;
  oneTimePriceCents: number | null;
  includedInBundle?: boolean;
  isIllustrative: boolean;
}

export interface CommercialConditionsConfig {
  warrantyEs: string;
  warrantyEn: string;
  dispatchEs: string;
  dispatchEn: string;
  supportEs: string;
  supportEn: string;
  taxesNoteEs: string;
  taxesNoteEn: string;
  installmentEndNoteEs: string;
  installmentEndNoteEn: string;
  illustrativeLabelEs: string;
  illustrativeLabelEn: string;
  whatsappCommercialNumber: string | null;
}

export interface CommercialFaqItem {
  id: string;
  questionEs: string;
  questionEn: string;
  answerEs: string;
  answerEn: string;
  pendingDefinitionEs?: string;
  pendingDefinitionEn?: string;
}

export interface ElectronicInvoicingCommercialSpec {
  isIllustrativePreview: boolean;
  confirmedMonthlyPriceCents: number | null;
  confirmedOneTimeImplementationCents: number | null;
  applicableLimitsEs: string | null;
  applicableLimitsEn: string | null;
  documentTypesEs: string[];
  documentTypesEn: string[];
  submissionStatesEs: string[];
  submissionStatesEn: string[];
  providerLabelEs: string;
  providerLabelEn: string;
  timelineEs: string;
  timelineEn: string;
  scopeEs: string;
  scopeEn: string;
}

export interface CommercialCatalog {
  plans: CommercialPlan[];
  modules: CommercialModule[];
  hardwareOptions: HardwarePackageItem[];
  installationOptions: CommercialServiceOption[];
  trainingOptions: CommercialServiceOption[];
  conditions: CommercialConditionsConfig;
  electronicInvoicing: ElectronicInvoicingCommercialSpec;
  faqs: CommercialFaqItem[];
}

export interface CommercialSelectionState {
  mode: ContractMode;
  planId: string;
  selectedAddons: CommercialModuleCode[];
  hardwareId: string;
  hardwareQuantity: number;
  paymentOptionId: string;
  installationId: string;
  trainingId: string;
}

export interface QuoteBreakdown {
  softwareMonthlyCents: number;
  equipmentMonthlyCents: number | null;
  installmentsCount: number;
  oneTimeChargesCents: number | null;
  knownOneTimeChargesCents: number;
  knownMonthlyDuringInstallmentsCents: number;
  totalDuringInstallmentsCents: number | null;
  totalAfterInstallmentsCents: number;
  initialPaymentCents: number | null;
  pendingQuoteItems: {
    labelEs: string;
    labelEn: string;
  }[];
  hasPendingPricing: boolean;
  hasPendingSoftwarePricing: boolean;
  hasPendingOneTimePricing: boolean;
  isUpfrontHardware: boolean;
  includedModulesInPlan: CommercialModuleCode[];
  billedAddons: {
    code: CommercialModuleCode;
    nameEs: string;
    nameEn: string;
    monthlyPriceCents: number | null;
    priceStatus: PricingStatus;
  }[];
}

export type ElectronicInvoicingExperience = '' | 'YES' | 'NO' | 'UNSURE';

export interface QuoteFormDraft {
  contactName: string;
  businessName: string;
  contactEmailOrWhatsapp: string;
  businessType: string;
  branchCount: string;
  comments: string;
  alreadyIssuesElectronicReceipts?: ElectronicInvoicingExperience;
  eInvoicingBranchesCount?: string;
}

export interface QuoteSubmissionPayload {
  locale: Locale;
  selection: CommercialSelectionState;
  breakdown: QuoteBreakdown;
  contact: QuoteFormDraft;
  submittedAt: string;
}

export interface QuoteSubmissionResult {
  quoteReference: string;
  isDemoConfirmation: boolean;
  submittedAt: string;
  messageEs: string;
  messageEn: string;
  payload: QuoteSubmissionPayload;
}

export type CommercialFaultMode = 'NONE' | 'SERVER_ERROR';

export interface CommercialApiClient {
  fetchCatalog(): Promise<CommercialCatalog>;
  submitQuoteRequest(
    payload: QuoteSubmissionPayload,
    faultMode?: CommercialFaultMode
  ): Promise<QuoteSubmissionResult>;
  listDemoQuotes(): Promise<QuoteSubmissionResult[]>;
}
