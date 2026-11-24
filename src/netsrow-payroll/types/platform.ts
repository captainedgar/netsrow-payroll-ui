import { Locale, ThemeMode } from './payroll';

export type SaasModuleCode =
  | 'CORE_ERP'
  | 'INVENTORY_CATALOG'
  | 'POS_CASHBOX'
  | 'MULTI_BRANCH'
  | 'PAYROLL'
  | 'ACCOUNTING';

export type TenantStatus = 'ACTIVE' | 'TRIAL' | 'SUSPENDED';
export type SubscriptionStatus = 'ACTIVE' | 'TRIALING' | 'PAST_DUE' | 'SUSPENDED';
export type PaymentStatus = 'PAID' | 'PENDING_CONFIRMATION' | 'OVERDUE';

export type PlatformScreenId =
  | 'platform_overview'
  | 'platform_tenants'
  | 'platform_plans'
  | 'platform_subscriptions'
  | 'platform_support'
  | 'platform_audit';

export type AppRoutePath =
  | '/'
  | '/planes'
  | '/erp'
  | '/login'
  | '/register'
  | '/platform/login'
  | '/platform'
  | '/platform/tenants'
  | '/platform/plans'
  | '/platform/subscriptions'
  | '/platform/support'
  | '/platform/audit';

export type SimulatedAuthFault = 'NONE' | 'SERVICE_UNAVAILABLE' | 'SESSION_EXPIRED';

export interface TenantSummaryRef {
  tenantId: string;
  tenantCode: string;
  tenantName: string;
  rnc: string;
  roleLabelEs: string;
  roleLabelEn: string;
}

export interface AuthSession {
  sessionId: string;
  userId: string;
  fullName: string;
  email: string;
  accountType: 'PLATFORM_OPERATOR' | 'TENANT_USER';
  platformRole?: 'PLATFORM_ADMIN';
  tenantId?: string;
  authorizedTenants?: TenantSummaryRef[];
  issuedAt: string;
}

export interface DemoLoginProfile {
  id: string;
  labelEs: string;
  labelEn: string;
  badgeEs: string;
  badgeEn: string;
  email: string;
  demoPasscode: string;
  targetScope: 'TENANT' | 'PLATFORM';
  requiresTwoFactorDemo?: boolean;
}

export interface LoginCredentialsInput {
  email: string;
  password: string;
  portal: 'TENANT' | 'PLATFORM';
  twoFactorCode?: string;
}

export interface LoginResult {
  status: 'AUTHENTICATED' | 'REQUIRES_2FA_DEMO' | 'SELECT_TENANT';
  session?: AuthSession;
  authorizedTenants?: TenantSummaryRef[];
  pendingToken?: string;
}

export interface SaasModule {
  code: SaasModuleCode;
  nameEs: string;
  nameEn: string;
  descriptionEs: string;
  descriptionEn: string;
  monthlyPriceDop: number;
  dependsOn: SaasModuleCode[];
  isCore: boolean;
}

export interface SaasPlan {
  id: string;
  code: string;
  nameEs: string;
  nameEn: string;
  descriptionEs: string;
  descriptionEn: string;
  monthlyBasePriceDop: number;
  effectiveDate: string;
  status: 'ACTIVE' | 'ARCHIVED';
  includedModules: SaasModuleCode[];
}

export interface ScheduledTenantChange {
  descriptionEs: string;
  descriptionEn: string;
  effectiveDate: string;
  nextMonthlyTotalDop: number;
}

export interface TenantRecord {
  id: string;
  code: string;
  name: string;
  rnc: string;
  sectorEs: string;
  sectorEn: string;
  ownerName: string;
  ownerEmail: string;
  accountManagerName: string;
  status: TenantStatus;
  createdAt: string;
  branchCount: number;
  planId: string;
  planNameSnapshotEs: string;
  planNameSnapshotEn: string;
  /** Agreed base quota preserved even if catalog plan prices change later */
  contractedBasePriceDop: number;
  /** Modules currently enabled for this tenant */
  enabledModules: SaasModuleCode[];
  /** Agreed add-on monthly fees per module code (0 or absent if included in plan) */
  addonPricesDop: Partial<Record<SaasModuleCode, number>>;
  effectiveDate: string;
  renewalDate: string;
  trialEndsAt: string | null;
  subscriptionStatus: SubscriptionStatus;
  paymentStatus: PaymentStatus;
  scheduledChange: ScheduledTenantChange | null;
}

export interface ManualPaymentConfirmation {
  id: string;
  tenantId: string;
  tenantName: string;
  amountDop: number;
  paymentDate: string;
  reference: string;
  recordedBy: string;
  recordedAt: string;
  note: string;
}

export type SupportTicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
export type SupportTicketCategory = 'BILLING' | 'ACCESS' | 'MODULE' | 'TECHNICAL';

export interface SupportTicketNote {
  id: string;
  author: string;
  timestamp: string;
  text: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  tenantId: string;
  tenantName: string;
  category: SupportTicketCategory;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: SupportTicketStatus;
  subjectEs: string;
  subjectEn: string;
  assignedTo: string;
  createdAt: string;
  internalNotes: SupportTicketNote[];
}

export type AuditEventType =
  | 'PLAN_CHANGE'
  | 'MODULE_TOGGLE'
  | 'PRICE_CHANGE'
  | 'SUSPEND'
  | 'REACTIVATE'
  | 'PAYMENT_CONFIRM'
  | 'PLAN_CATALOG_EDIT';

export interface PlatformAuditEvent {
  id: string;
  timestamp: string;
  operatorName: string;
  operatorEmail: string;
  tenantId: string | null;
  tenantName: string | null;
  eventType: AuditEventType;
  reason: string;
  summaryEs: string;
  summaryEn: string;
}

export interface PlatformWorkspaceState {
  modules: SaasModule[];
  plans: SaasPlan[];
  tenants: TenantRecord[];
  payments: ManualPaymentConfirmation[];
  tickets: SupportTicket[];
  auditEvents: PlatformAuditEvent[];
}

export interface TenantPlanChangeInput {
  tenantId: string;
  nextPlanId: string;
  nextEnabledModules: SaasModuleCode[];
  effectiveDate: string;
  reason: string;
}

export interface TenantStatusChangeInput {
  tenantId: string;
  nextStatus: 'ACTIVE' | 'SUSPENDED';
  reason: string;
}

export interface ManualPaymentInput {
  tenantId: string;
  amountDop: number;
  paymentDate: string;
  reference: string;
  note: string;
}

export interface PlatformApiClient {
  fetchPlatformState(): Promise<PlatformWorkspaceState>;
  resetPlatformDemo(): Promise<PlatformWorkspaceState>;
  login(input: LoginCredentialsInput, faultMode?: SimulatedAuthFault): Promise<LoginResult>;
  selectAuthorizedTenant(pendingToken: string, tenantId: string): Promise<AuthSession>;
  logout(): Promise<void>;
  updateTenantSubscription(
    input: TenantPlanChangeInput,
    operator: AuthSession
  ): Promise<PlatformWorkspaceState>;
  changeTenantStatus(
    input: TenantStatusChangeInput,
    operator: AuthSession
  ): Promise<PlatformWorkspaceState>;
  upsertPlan(
    plan: SaasPlan,
    reason: string,
    operator: AuthSession
  ): Promise<PlatformWorkspaceState>;
  recordManualPayment(
    input: ManualPaymentInput,
    operator: AuthSession
  ): Promise<PlatformWorkspaceState>;
  updateSupportTicket(
    input: {
      ticketId: string;
      status?: SupportTicketStatus;
      assignedTo?: string;
      newInternalNote?: string;
    },
    operator: AuthSession
  ): Promise<PlatformWorkspaceState>;
}

export interface UiPreferences {
  locale: Locale;
  theme: ThemeMode;
}
