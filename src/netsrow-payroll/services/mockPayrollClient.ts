import { createSeedEInvoicingState } from '../data/eInvoicingSeed';
import { createSeedErpState } from '../data/erpSeed';
import {
  buildRunObject,
  createSeedPeriods,
  SEED_EMPLOYEES,
  SEED_NOVELTIES,
} from '../data/mockSeed';
import { ErpDemoState } from '../types/erp';
import {
  CreateNoveltyInput,
  Employee,
  PayrollApiClient,
  PayrollBootstrapPayload,
  PayrollNovelty,
  PayrollPeriod,
  UpdateNoveltyInput,
} from '../types/payroll';

const STORAGE_KEY = 'netsrow_erp_demo_v1';

interface PersistedWorkspace {
  periods: PayrollPeriod[];
  employees: Employee[];
  novelties: PayrollNovelty[];
  erpState: ErpDemoState;
}

function formatTimestampNow(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${d} ${hh}:${mm}`;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function buildFreshSeed(): PersistedWorkspace {
  return {
    periods: createSeedPeriods(),
    employees: clone(SEED_EMPLOYEES),
    novelties: clone(SEED_NOVELTIES),
    erpState: createSeedErpState(),
  };
}

function loadFromStorage(): PersistedWorkspace | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PersistedWorkspace>;
    if (
      Array.isArray(parsed.periods) &&
      Array.isArray(parsed.employees) &&
      Array.isArray(parsed.novelties) &&
      parsed.erpState &&
      Array.isArray(parsed.erpState.products)
    ) {
      if (!parsed.erpState.eInvoicing) {
        parsed.erpState.eInvoicing = createSeedEInvoicingState(
          parsed.erpState.company
        );
      }
      return parsed as PersistedWorkspace;
    }
    return null;
  } catch {
    return null;
  }
}

function persistToStorage(data: PersistedWorkspace): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage quota issues in constrained environments
  }
}

/**
 * Isolated simulated backend client with localStorage persistence for demo evaluation.
 * Replace this implementation with NetsRow's HTTP client in ERPSYSTEM/apps/web.
 */
export class MockPayrollClient implements PayrollApiClient {
  private periods: PayrollPeriod[];
  private employees: Employee[];
  private novelties: PayrollNovelty[];
  private erpState: ErpDemoState;
  private latencyMs: number;

  constructor(latencyMs = 120) {
    const saved = loadFromStorage();
    const initial = saved ?? buildFreshSeed();
    this.periods = initial.periods;
    this.employees = initial.employees;
    this.novelties = initial.novelties;
    this.erpState = initial.erpState;
    this.latencyMs = latencyMs;
  }

  private saveSnapshot() {
    persistToStorage({
      periods: this.periods,
      employees: this.employees,
      novelties: this.novelties,
      erpState: this.erpState,
    });
  }

  async fetchWorkspaceData(): Promise<PayrollBootstrapPayload> {
    await delay(Math.min(this.latencyMs, 100));
    const saved = loadFromStorage();
    if (saved) {
      this.periods = saved.periods;
      this.employees = saved.employees;
      this.novelties = saved.novelties;
      this.erpState = saved.erpState;
    }
    return {
      periods: clone(this.periods),
      employees: clone(this.employees),
      novelties: clone(this.novelties),
      erpState: clone(this.erpState),
    };
  }

  async saveErpState(nextState: ErpDemoState): Promise<ErpDemoState> {
    await delay(Math.min(this.latencyMs, 60));
    this.erpState = clone(nextState);
    this.saveSnapshot();
    return clone(this.erpState);
  }

  async resetDemoWorkspace(): Promise<PayrollBootstrapPayload> {
    await delay(Math.min(this.latencyMs, 100));
    const fresh = buildFreshSeed();
    this.periods = fresh.periods;
    this.employees = fresh.employees;
    this.novelties = fresh.novelties;
    this.erpState = fresh.erpState;
    this.saveSnapshot();
    return {
      periods: clone(this.periods),
      employees: clone(this.employees),
      novelties: clone(this.novelties),
      erpState: clone(this.erpState),
    };
  }

  async createNovelty(input: CreateNoveltyInput): Promise<PayrollNovelty> {
    await delay(this.latencyMs);
    const period = this.periods.find((p) => p.id === input.periodId);
    if (!period) throw new Error('Period not found');
    if (period.status !== 'DRAFT') {
      throw new Error('Novelties can only be created when period is in Draft');
    }

    const created: PayrollNovelty = {
      id: `nov-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ...input,
    };
    this.novelties = [created, ...this.novelties];
    this.saveSnapshot();
    return clone(created);
  }

  async updateNovelty(input: UpdateNoveltyInput): Promise<PayrollNovelty> {
    await delay(this.latencyMs);
    const existing = this.novelties.find((n) => n.id === input.id);
    if (!existing) throw new Error('Novelty not found');

    const period = this.periods.find((p) => p.id === existing.periodId);
    if (!period || period.status !== 'DRAFT') {
      throw new Error('Novelties can only be edited when period is in Draft');
    }

    const updated: PayrollNovelty = {
      ...existing,
      employeeId: input.employeeId,
      date: input.date,
      conceptCode: input.conceptCode,
      category: input.category,
      amount: input.amount,
      noteEs: input.noteEs,
      noteEn: input.noteEn,
    };

    this.novelties = this.novelties.map((n) => (n.id === input.id ? updated : n));
    this.saveSnapshot();
    return clone(updated);
  }

  async deleteNovelty(noveltyId: string, periodId: string): Promise<void> {
    await delay(this.latencyMs);
    const period = this.periods.find((p) => p.id === periodId);
    if (!period || period.status !== 'DRAFT') {
      throw new Error('Novelties can only be deleted when period is in Draft');
    }
    this.novelties = this.novelties.filter((n) => n.id !== noveltyId);
    this.saveSnapshot();
  }

  async submitPeriodForReview(periodId: string): Promise<PayrollPeriod> {
    await delay(this.latencyMs);
    const period = this.periods.find((p) => p.id === periodId);
    if (!period) throw new Error('Period not found');
    if (period.status !== 'DRAFT') {
      throw new Error('Only Draft periods can be sent for review');
    }
    period.status = 'IN_REVIEW';
    this.saveSnapshot();
    return clone(period);
  }

  async returnPeriodToDraft(periodId: string): Promise<PayrollPeriod> {
    await delay(this.latencyMs);
    const period = this.periods.find((p) => p.id === periodId);
    if (!period) throw new Error('Period not found');
    if (period.status !== 'IN_REVIEW') {
      throw new Error('Only periods In Review can be returned to Draft');
    }
    period.status = 'DRAFT';
    this.saveSnapshot();
    return clone(period);
  }

  async runSimulation(periodId: string, actorName: string): Promise<PayrollPeriod> {
    await delay(this.latencyMs + 100);
    const period = this.periods.find((p) => p.id === periodId);
    if (!period) throw new Error('Period not found');
    if (period.status !== 'IN_REVIEW') {
      throw new Error('Simulation requires the period to be In Review');
    }

    const markedOldRuns = period.runs.map((r) => ({
      ...r,
      isCurrent: false,
      isReadOnly: true,
    }));

    const nextNumber = markedOldRuns.length + 1;
    const newRun = buildRunObject({
      id: `run-${period.code}-${nextNumber}-${Date.now()}`,
      periodId: period.id,
      runNumber: nextNumber,
      phase: 'SIMULATED',
      condition: 'SIMULATION_COMPLETED',
      isCurrent: true,
      isReadOnly: false,
      executedAt: formatTimestampNow(),
      executedBy: actorName,
      approvedAt: null,
      approvedBy: null,
      employees: this.employees,
      novelties: this.novelties,
      notesEs: `Simulación #${nextNumber} ejecutada manualmente.`,
      notesEn: `Manual simulation run #${nextNumber} completed.`,
    });

    period.runs = [newRun, ...markedOldRuns];
    period.currentRunId = newRun.id;
    this.saveSnapshot();
    return clone(period);
  }

  async runStatutoryCalculation(
    periodId: string,
    actorName: string
  ): Promise<PayrollPeriod> {
    await delay(this.latencyMs + 120);
    const period = this.periods.find((p) => p.id === periodId);
    if (!period) throw new Error('Period not found');
    if (period.status !== 'IN_REVIEW') {
      throw new Error('Statutory TSS & ISR calculation requires the period to be In Review');
    }

    const currentRun = period.runs.find((r) => r.id === period.currentRunId);
    if (!currentRun) {
      throw new Error('Simulate calculation before running TSS & ISR review');
    }

    const markedOldRuns = period.runs.map((r) => ({
      ...r,
      isCurrent: false,
      isReadOnly: true,
    }));

    const nextNumber = markedOldRuns.length + 1;
    const newRun = buildRunObject({
      id: `run-${period.code}-${nextNumber}-${Date.now()}`,
      periodId: period.id,
      runNumber: nextNumber,
      phase: 'STATUTORY_REVIEW',
      condition: 'READY_FOR_FINAL_REVIEW',
      isCurrent: true,
      isReadOnly: false,
      executedAt: formatTimestampNow(),
      executedBy: actorName,
      approvedAt: null,
      approvedBy: null,
      employees: this.employees,
      novelties: this.novelties,
      notesEs: `Corrida STATUTORY_REVIEW #${nextNumber}: TSS e ISR calculados; lista para revisión final.`,
      notesEn: `STATUTORY_REVIEW run #${nextNumber}: TSS & ISR computed; ready for final review.`,
    });

    period.runs = [newRun, ...markedOldRuns];
    period.currentRunId = newRun.id;
    this.saveSnapshot();
    return clone(period);
  }

  async approvePayrollRun(
    periodId: string,
    runId: string,
    actorName: string
  ): Promise<PayrollPeriod> {
    await delay(this.latencyMs + 100);
    const period = this.periods.find((p) => p.id === periodId);
    if (!period) throw new Error('Period not found');
    if (period.status !== 'IN_REVIEW') {
      throw new Error('Period must be In Review to approve');
    }

    const targetRun = period.runs.find((r) => r.id === runId);
    if (
      !targetRun ||
      !targetRun.isCurrent ||
      targetRun.phase !== 'STATUTORY_REVIEW' ||
      targetRun.condition !== 'READY_FOR_FINAL_REVIEW'
    ) {
      throw new Error(
        'Only the current, complete STATUTORY_REVIEW run can be approved'
      );
    }

    const approvedTimestamp = formatTimestampNow();
    period.status = 'APPROVED';
    period.runs = period.runs.map((r) =>
      r.id === runId
        ? {
            ...r,
            condition: 'APPROVED',
            isReadOnly: true,
            approvedAt: approvedTimestamp,
            approvedBy: actorName,
            notesEs: 'Corrida aprobada y bloqueada en solo lectura.',
            notesEn: 'Run approved and locked in read-only mode.',
          }
        : { ...r, isReadOnly: true }
    );

    this.saveSnapshot();
    return clone(period);
  }
}
