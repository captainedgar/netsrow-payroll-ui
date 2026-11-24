import {
  computeTenantMonthlyBreakdown,
  createSeedPlatformState,
  DEMO_LOGIN_PROFILES,
} from '../data/platformSeed';
import {
  AuthSession,
  LoginCredentialsInput,
  LoginResult,
  ManualPaymentInput,
  PlatformApiClient,
  PlatformAuditEvent,
  PlatformWorkspaceState,
  SaasModule,
  SaasModuleCode,
  SaasPlan,
  SimulatedAuthFault,
  SupportTicketStatus,
  TenantPlanChangeInput,
  TenantStatusChangeInput,
} from '../types/platform';

const PLATFORM_STORAGE_KEY = 'netsrow_platform_demo_v1';
const SESSION_STORAGE_KEY = 'netsrow_auth_session_demo_v1';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function clone<T>(val: T): T {
  return JSON.parse(JSON.stringify(val)) as T;
}

function stampNow(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${day} ${hh}:${mm}`;
}

export function validateModuleDependencies(
  selectedModules: SaasModuleCode[],
  catalog: SaasModule[]
): { valid: boolean; missing: { module: SaasModuleCode; requires: SaasModuleCode[] }[] } {
  const set = new Set(selectedModules);
  const missing: { module: SaasModuleCode; requires: SaasModuleCode[] }[] = [];
  selectedModules.forEach((code) => {
    const def = catalog.find((m) => m.code === code);
    if (!def) return;
    const unmet = def.dependsOn.filter((dep) => !set.has(dep));
    if (unmet.length > 0) {
      missing.push({ module: code, requires: unmet });
    }
  });
  return { valid: missing.length === 0, missing };
}

function loadPlatformStorage(): PlatformWorkspaceState | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    const raw = window.localStorage.getItem(PLATFORM_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PlatformWorkspaceState>;
    if (
      Array.isArray(parsed.tenants) &&
      Array.isArray(parsed.plans) &&
      Array.isArray(parsed.modules) &&
      Array.isArray(parsed.auditEvents)
    ) {
      return parsed as PlatformWorkspaceState;
    }
    return null;
  } catch {
    return null;
  }
}

function savePlatformStorage(state: PlatformWorkspaceState): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(PLATFORM_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage constraints
  }
}

export function loadSavedSession(): AuthSession | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthSession;
    if (parsed && parsed.userId && parsed.accountType) return parsed;
    return null;
  } catch {
    return null;
  }
}

export function persistSavedSession(session: AuthSession | null): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    if (!session) {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
    } else {
      window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    }
  } catch {
    // Ignore
  }
}

export class AuthClientError extends Error {
  code: 'INVALID_CREDENTIALS' | 'SESSION_EXPIRED' | 'SERVICE_UNAVAILABLE' | 'PLATFORM_FORBIDDEN' | 'TWO_FACTOR_INVALID';
  constructor(
    code: AuthClientError['code'],
    message: string
  ) {
    super(message);
    this.code = code;
  }
}

/**
 * Isolated simulated SaaS Platform & Authentication client.
 * Replace with ERPSYSTEM/apps/web HTTP client once platform & auth endpoints are wired.
 */
export class MockPlatformClient implements PlatformApiClient {
  private state: PlatformWorkspaceState;
  private latencyMs: number;

  constructor(latencyMs = 150) {
    this.state = loadPlatformStorage() ?? createSeedPlatformState();
    this.latencyMs = latencyMs;
  }

  private persist() {
    savePlatformStorage(this.state);
  }

  async fetchPlatformState(): Promise<PlatformWorkspaceState> {
    await delay(Math.min(this.latencyMs, 100));
    const saved = loadPlatformStorage();
    if (saved) this.state = saved;
    return clone(this.state);
  }

  async resetPlatformDemo(): Promise<PlatformWorkspaceState> {
    await delay(Math.min(this.latencyMs, 100));
    this.state = createSeedPlatformState();
    this.persist();
    return clone(this.state);
  }

  async login(
    input: LoginCredentialsInput,
    faultMode: SimulatedAuthFault = 'NONE'
  ): Promise<LoginResult> {
    await delay(this.latencyMs);

    if (faultMode === 'SERVICE_UNAVAILABLE') {
      throw new AuthClientError('SERVICE_UNAVAILABLE', 'Auth service unreachable (503)');
    }
    if (faultMode === 'SESSION_EXPIRED') {
      throw new AuthClientError('SESSION_EXPIRED', 'Session expired (401)');
    }

    const emailNorm = input.email.trim().toLowerCase();
    const matched = DEMO_LOGIN_PROFILES.find(
      (p) => p.email.toLowerCase() === emailNorm && p.demoPasscode === input.password
    );

    if (!matched) {
      // Generic failure — never disclose whether account exists
      throw new AuthClientError('INVALID_CREDENTIALS', 'Invalid credentials');
    }

    if (input.portal === 'PLATFORM') {
      if (matched.targetScope !== 'PLATFORM') {
        throw new AuthClientError(
          'PLATFORM_FORBIDDEN',
          'Tenant accounts cannot access platform console'
        );
      }

      if (input.twoFactorCode !== undefined) {
        if (input.twoFactorCode.trim() !== '246810') {
          throw new AuthClientError('TWO_FACTOR_INVALID', 'Invalid 2FA demo code');
        }
      }

      const session: AuthSession = {
        sessionId: `sess-plat-${Date.now()}`,
        userId: 'op-1',
        fullName: 'Ing. Laura Méndez',
        email: matched.email,
        accountType: 'PLATFORM_OPERATOR',
        platformRole: 'PLATFORM_ADMIN',
        issuedAt: stampNow(),
      };
      persistSavedSession(session);
      return { status: 'AUTHENTICATED', session };
    }

    // Tenant ERP login
    if (matched.targetScope === 'PLATFORM') {
      // Platform operator logging into tenant portal is also denied generic/cleanly or must use /platform/login
      throw new AuthClientError('INVALID_CREDENTIALS', 'Invalid credentials');
    }

    const tenant = this.state.tenants.find(
      (t) => t.ownerEmail.toLowerCase() === emailNorm
    );
    if (!tenant) {
      throw new AuthClientError('INVALID_CREDENTIALS', 'Invalid credentials');
    }

    const session: AuthSession = {
      sessionId: `sess-ten-${Date.now()}`,
      userId: `usr-${tenant.id}`,
      fullName: tenant.ownerName,
      email: tenant.ownerEmail,
      accountType: 'TENANT_USER',
      tenantId: tenant.id,
      authorizedTenants: [
        {
          tenantId: tenant.id,
          tenantCode: tenant.code,
          tenantName: tenant.name,
          rnc: tenant.rnc,
          roleLabelEs: 'Propietario / Admin ERP',
          roleLabelEn: 'Owner / ERP Admin',
        },
      ],
      issuedAt: stampNow(),
    };
    persistSavedSession(session);
    return { status: 'AUTHENTICATED', session };
  }

  async selectAuthorizedTenant(
    pendingToken: string,
    tenantId: string
  ): Promise<AuthSession> {
    await delay(this.latencyMs);
    const tenant = this.state.tenants.find((t) => t.id === tenantId);
    if (!tenant) throw new Error('Tenant not found');
    const session: AuthSession = {
      sessionId: `${pendingToken}-${tenant.id}`,
      userId: `usr-${tenant.id}`,
      fullName: tenant.ownerName,
      email: tenant.ownerEmail,
      accountType: 'TENANT_USER',
      tenantId: tenant.id,
      issuedAt: stampNow(),
    };
    persistSavedSession(session);
    return session;
  }

  async logout(): Promise<void> {
    await delay(60);
    persistSavedSession(null);
  }

  private assertOperator(operator: AuthSession) {
    if (operator.accountType !== 'PLATFORM_OPERATOR') {
      throw new AuthClientError('PLATFORM_FORBIDDEN', 'Platform operator privileges required');
    }
  }

  async updateTenantSubscription(
    input: TenantPlanChangeInput,
    operator: AuthSession
  ): Promise<PlatformWorkspaceState> {
    await delay(this.latencyMs);
    this.assertOperator(operator);

    const tenant = this.state.tenants.find((t) => t.id === input.tenantId);
    const nextPlan = this.state.plans.find((p) => p.id === input.nextPlanId);
    if (!tenant || !nextPlan) throw new Error('Tenant or plan not found');

    if (!input.reason.trim()) {
      throw new Error('Audit reason is required');
    }

    const depCheck = validateModuleDependencies(
      input.nextEnabledModules,
      this.state.modules
    );
    if (!depCheck.valid) {
      throw new Error('Unmet module dependencies');
    }

    const prevBreakdown = computeTenantMonthlyBreakdown(
      tenant,
      this.state.modules,
      this.state.plans
    );

    const nextIncludedSet = new Set<SaasModuleCode>(nextPlan.includedModules);
    const nextEnabledSet = new Set<SaasModuleCode>([
      'CORE_ERP',
      ...nextPlan.includedModules,
      ...input.nextEnabledModules,
    ]);

    const nextAddonPrices: Partial<Record<SaasModuleCode, number>> = {};
    nextEnabledSet.forEach((code) => {
      if (nextIncludedSet.has(code)) return;
      const modDef = this.state.modules.find((m) => m.code === code);
      if (modDef && modDef.monthlyPriceDop > 0) {
        nextAddonPrices[code] = tenant.addonPricesDop[code] ?? modDef.monthlyPriceDop;
      }
    });

    const planChanged = tenant.planId !== nextPlan.id;
    const nextContractedBase = planChanged
      ? nextPlan.monthlyBasePriceDop
      : tenant.contractedBasePriceDop;

    const updatedTenant = {
      ...tenant,
      planId: nextPlan.id,
      planNameSnapshotEs: nextPlan.nameEs,
      planNameSnapshotEn: nextPlan.nameEn,
      contractedBasePriceDop: nextContractedBase,
      enabledModules: Array.from(nextEnabledSet),
      addonPricesDop: nextAddonPrices,
      effectiveDate: input.effectiveDate || tenant.effectiveDate,
    };

    const nextBreakdown = computeTenantMonthlyBreakdown(
      updatedTenant,
      this.state.modules,
      this.state.plans
    );

    const auditEvent: PlatformAuditEvent = {
      id: `aud-${Date.now()}`,
      timestamp: stampNow(),
      operatorName: operator.fullName,
      operatorEmail: operator.email,
      tenantId: tenant.id,
      tenantName: tenant.name,
      eventType: planChanged ? 'PLAN_CHANGE' : 'MODULE_TOGGLE',
      reason: input.reason.trim(),
      summaryEs: `${nextPlan.nameEs} · Módulos: ${updatedTenant.enabledModules.join(', ')} · Total RD$${prevBreakdown.totalDop.toLocaleString()} → RD$${nextBreakdown.totalDop.toLocaleString()} (vigencia ${updatedTenant.effectiveDate})`,
      summaryEn: `${nextPlan.nameEn} · Modules: ${updatedTenant.enabledModules.join(', ')} · Total RD$${prevBreakdown.totalDop.toLocaleString()} → RD$${nextBreakdown.totalDop.toLocaleString()} (effective ${updatedTenant.effectiveDate})`,
    };

    this.state = {
      ...this.state,
      tenants: this.state.tenants.map((t) => (t.id === tenant.id ? updatedTenant : t)),
      auditEvents: [auditEvent, ...this.state.auditEvents],
    };
    this.persist();
    return clone(this.state);
  }

  async changeTenantStatus(
    input: TenantStatusChangeInput,
    operator: AuthSession
  ): Promise<PlatformWorkspaceState> {
    await delay(this.latencyMs);
    this.assertOperator(operator);
    const tenant = this.state.tenants.find((t) => t.id === input.tenantId);
    if (!tenant) throw new Error('Tenant not found');
    if (!input.reason.trim()) throw new Error('Reason is required');

    const updatedTenant = {
      ...tenant,
      status: input.nextStatus,
      subscriptionStatus:
        input.nextStatus === 'SUSPENDED' ? ('SUSPENDED' as const) : ('ACTIVE' as const),
    };

    const auditEvent: PlatformAuditEvent = {
      id: `aud-${Date.now()}`,
      timestamp: stampNow(),
      operatorName: operator.fullName,
      operatorEmail: operator.email,
      tenantId: tenant.id,
      tenantName: tenant.name,
      eventType: input.nextStatus === 'SUSPENDED' ? 'SUSPEND' : 'REACTIVATE',
      reason: input.reason.trim(),
      summaryEs:
        input.nextStatus === 'SUSPENDED'
          ? 'Empresa suspendida (registros operativos preservados)'
          : 'Empresa reactivada y acceso restaurado',
      summaryEn:
        input.nextStatus === 'SUSPENDED'
          ? 'Company suspended (historical records preserved)'
          : 'Company reactivated and access restored',
    };

    this.state = {
      ...this.state,
      tenants: this.state.tenants.map((t) => (t.id === tenant.id ? updatedTenant : t)),
      auditEvents: [auditEvent, ...this.state.auditEvents],
    };
    this.persist();
    return clone(this.state);
  }

  async upsertPlan(
    plan: SaasPlan,
    reason: string,
    operator: AuthSession
  ): Promise<PlatformWorkspaceState> {
    await delay(this.latencyMs);
    this.assertOperator(operator);
    const depCheck = validateModuleDependencies(plan.includedModules, this.state.modules);
    if (!depCheck.valid) {
      throw new Error('Plan module combination has unmet dependencies');
    }

    const exists = this.state.plans.some((p) => p.id === plan.id);
    const plans = exists
      ? this.state.plans.map((p) => (p.id === plan.id ? plan : p))
      : [...this.state.plans, plan];

    const auditEvent: PlatformAuditEvent = {
      id: `aud-${Date.now()}`,
      timestamp: stampNow(),
      operatorName: operator.fullName,
      operatorEmail: operator.email,
      tenantId: null,
      tenantName: null,
      eventType: 'PLAN_CATALOG_EDIT',
      reason: reason.trim() || 'Actualización catálogo comercial SaaS',
      summaryEs: `Plan ${plan.code} (${plan.nameEs}) · RD$${plan.monthlyBasePriceDop.toLocaleString()}/mes · Vigencia ${plan.effectiveDate} (suscripciones previas conservan precio acordado)`,
      summaryEn: `Plan ${plan.code} (${plan.nameEn}) · RD$${plan.monthlyBasePriceDop.toLocaleString()}/mo · Effective ${plan.effectiveDate} (existing subscriptions keep agreed rates)`,
    };

    this.state = {
      ...this.state,
      plans,
      auditEvents: [auditEvent, ...this.state.auditEvents],
    };
    this.persist();
    return clone(this.state);
  }

  async recordManualPayment(
    input: ManualPaymentInput,
    operator: AuthSession
  ): Promise<PlatformWorkspaceState> {
    await delay(this.latencyMs);
    this.assertOperator(operator);

    const tenant = this.state.tenants.find((t) => t.id === input.tenantId);
    if (!tenant) throw new Error('Tenant not found');
    const refNorm = input.reference.trim().toUpperCase();
    if (!refNorm || input.amountDop <= 0) {
      throw new Error('Valid amount and reference required');
    }

    // Deduplicate repeated confirmation with same tenant + reference
    const duplicate = this.state.payments.some(
      (p) => p.tenantId === tenant.id && p.reference.toUpperCase() === refNorm
    );
    if (duplicate) {
      throw new Error(`DUPLICATE_REF:${refNorm}`);
    }

    const payment = {
      id: `pay-${Date.now()}`,
      tenantId: tenant.id,
      tenantName: tenant.name,
      amountDop: Math.round(input.amountDop * 100) / 100,
      paymentDate: input.paymentDate,
      reference: refNorm,
      recordedBy: operator.fullName,
      recordedAt: stampNow(),
      note: input.note.trim() || 'Confirmación manual de pago (Solo demo)',
    };

    const updatedTenant = {
      ...tenant,
      paymentStatus: 'PAID' as const,
      subscriptionStatus:
        tenant.status === 'SUSPENDED' ? ('SUSPENDED' as const) : ('ACTIVE' as const),
    };

    const auditEvent: PlatformAuditEvent = {
      id: `aud-${Date.now()}`,
      timestamp: stampNow(),
      operatorName: operator.fullName,
      operatorEmail: operator.email,
      tenantId: tenant.id,
      tenantName: tenant.name,
      eventType: 'PAYMENT_CONFIRM',
      reason: `Ref. ${refNorm} · ${payment.note}`,
      summaryEs: `Confirmación manual de pago RD$${payment.amountDop.toLocaleString()} (${input.paymentDate}) · Solo demo`,
      summaryEn: `Manual payment confirmation RD$${payment.amountDop.toLocaleString()} (${input.paymentDate}) · Demo only`,
    };

    this.state = {
      ...this.state,
      tenants: this.state.tenants.map((t) => (t.id === tenant.id ? updatedTenant : t)),
      payments: [payment, ...this.state.payments],
      auditEvents: [auditEvent, ...this.state.auditEvents],
    };
    this.persist();
    return clone(this.state);
  }

  async updateSupportTicket(
    input: {
      ticketId: string;
      status?: SupportTicketStatus;
      assignedTo?: string;
      newInternalNote?: string;
    },
    operator: AuthSession
  ): Promise<PlatformWorkspaceState> {
    await delay(this.latencyMs);
    this.assertOperator(operator);

    const tickets = this.state.tickets.map((tkt) => {
      if (tkt.id !== input.ticketId) return tkt;
      const notes =
        input.newInternalNote && input.newInternalNote.trim()
          ? [
              ...tkt.internalNotes,
              {
                id: `note-${Date.now()}`,
                author: operator.fullName,
                timestamp: stampNow(),
                text: input.newInternalNote.trim(),
              },
            ]
          : tkt.internalNotes;
      return {
        ...tkt,
        status: input.status ?? tkt.status,
        assignedTo: input.assignedTo ?? tkt.assignedTo,
        internalNotes: notes,
      };
    });

    this.state = { ...this.state, tickets };
    this.persist();
    return clone(this.state);
  }
}
