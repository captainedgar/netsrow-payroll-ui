export type Locale = 'es' | 'en';
export type ThemeMode = 'light' | 'dark';

export type ScreenId =
  | 'periods'
  | 'employees'
  | 'novelties'
  | 'payroll_review'
  | 'run_history'
  | 'work_risk'
  | 'concept_treatment'
  | 'overview'
  | 'pos'
  | 'sales_ar'
  | 'customers'
  | 'cashbox'
  | 'inventory'
  | 'catalog'
  | 'internal_docs'
  | 'accounting'
  | 'business'
  | 'company'
  | 'branches'
  | 'users_roles';

export type ReviewTabId =
  | 'all'
  | 'simulation'
  | 'statutory'
  | 'breakdown'
  | 'history';

export type PeriodStatus = 'DRAFT' | 'IN_REVIEW' | 'APPROVED';

export type RunPhase = 'SIMULATED' | 'STATUTORY_REVIEW';

export type RunCondition =
  | 'SIMULATION_COMPLETED'
  | 'INCOMPLETE_CHECKS'
  | 'READY_FOR_FINAL_REVIEW'
  | 'APPROVED';

export type EmployeeStatus = 'ACTIVE' | 'LEAVE' | 'SUSPENDED';

export type NoveltyCategory = 'EARNING' | 'DEDUCTION';

export type NoveltyConceptCode =
  | 'OVERTIME_35'
  | 'COMMISSION'
  | 'PERFORMANCE_BONUS'
  | 'LOAN_DEDUCTION'
  | 'UNPAID_ABSENCE'
  | 'TRANSPORT_ALLOWANCE';

/**
 * Real NetsRow session permissions contract.
 * Portable components evaluate these flags directly without coupling to any demo role switcher.
 */
export interface NetsRowPermissions {
  canViewSalaryHistory: boolean;
  canViewIsrBackground: boolean;
  canEditNovelties: boolean;
  canSubmitForReview: boolean;
  canRunSimulation: boolean;
  canRunStatutoryReview: boolean;
  canApprovePayroll: boolean;
}

export type DemoRoleKey = 'payroll_admin' | 'supervisor_readonly';

export interface SalaryHistoryEntry {
  id: string;
  effectiveDate: string;
  previousSalary: number;
  newSalary: number;
  reasonEs: string;
  reasonEn: string;
  authorizedBy: string;
}

export interface IsrBackgroundRecord {
  id: string;
  fiscalYear: number;
  periodLabelEs: string;
  periodLabelEn: string;
  annualizedTaxableIncome: number;
  accumulatedIsrWithheld: number;
  dgiiBracketEs: string;
  dgiiBracketEn: string;
  ir3Reference: string;
}

export interface Employee {
  id: string;
  code: string;
  fullName: string;
  cedula: string;
  departmentEs: string;
  departmentEn: string;
  positionEs: string;
  positionEn: string;
  hireDate: string;
  status: EmployeeStatus;
  baseMonthlySalary: number;
  afpProvider: string;
  arsProvider: string;
  tssRegistered: boolean;
  salaryHistory: SalaryHistoryEntry[];
  isrBackground: IsrBackgroundRecord[];
}

export interface PayrollNovelty {
  id: string;
  periodId: string;
  employeeId: string;
  date: string;
  conceptCode: NoveltyConceptCode;
  category: NoveltyCategory;
  amount: number;
  noteEs: string;
  noteEn: string;
}

export interface StatutoryCheckItem {
  id: string;
  labelEs: string;
  labelEn: string;
  passed: boolean;
  detailEs: string;
  detailEn: string;
}

export interface SalaryTranche {
  id: string;
  titleEs: string;
  titleEn: string;
  days: number;
  registeredMonthlySalary: number;
  computedAmount: number;
  badgeEs?: string;
  badgeEn?: string;
}

export interface EmployeeBreakdown {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  cedula: string;
  positionEs: string;
  positionEn: string;
  departmentEs: string;
  departmentEn: string;
  baseSalary: number;
  calculatedBaseSalary: number;
  salaryTranches: SalaryTranche[];
  earningsNovelties: number;
  deductionsNovelties: number;
  /** Computed during SIMULATED and carried into STATUTORY_REVIEW; null if no active run */
  provisionalSubtotal: number | null;
  /** Worker deductions — null until STATUTORY_REVIEW is calculated */
  sfsEmployee: number | null;
  afpEmployee: number | null;
  isrWithheld: number | null;
  workerDeductionsTotal: number | null;
  /** Employer contributions — null until STATUTORY_REVIEW is calculated */
  sfsEmployer: number | null;
  afpEmployer: number | null;
  srlEmployer: number | null;
  infotepEmployer: number | null;
  employerContributionsTotal: number | null;
  /** Net pay — null until STATUTORY_REVIEW is calculated */
  calculatedNet: number | null;
  /** Tax bracket description once statutory review runs */
  isrBracketCode: 'EXEMPT' | '15%' | '20%' | '25%' | null;
  complianceFlag: 'OK' | 'TSS_PENDING' | 'IR3_WARNING';
  incidenceNoteEs?: string;
  incidenceNoteEn?: string;
}

export interface PayrollRun {
  id: string;
  periodId: string;
  runNumber: number;
  phase: RunPhase;
  condition: RunCondition;
  isCurrent: boolean;
  isReadOnly: boolean;
  executedAt: string;
  executedBy: string;
  approvedAt: string | null;
  approvedBy: string | null;
  employeeCount: number;
  incidencesCount: number;
  /** Aggregated totals — statutory totals are null during SIMULATED phase */
  provisionalSubtotalTotal: number | null;
  workerDeductionsTotal: number | null;
  employerContributionsTotal: number | null;
  calculatedNetTotal: number | null;
  tssEmployeeTotal: number | null;
  isrTotal: number | null;
  statutoryChecks: StatutoryCheckItem[];
  breakdowns: EmployeeBreakdown[];
  notesEs: string;
  notesEn: string;
}

export interface PayrollPeriod {
  id: string;
  code: string;
  year: number;
  month: number;
  nameEs: string;
  nameEn: string;
  startDate: string;
  endDate: string;
  paymentTargetDate: string;
  status: PeriodStatus;
  employeeCount: number;
  currentRunId: string | null;
  runs: PayrollRun[];
}

export interface CreateNoveltyInput {
  periodId: string;
  employeeId: string;
  date: string;
  conceptCode: NoveltyConceptCode;
  category: NoveltyCategory;
  amount: number;
  noteEs: string;
  noteEn: string;
}

export interface UpdateNoveltyInput {
  id: string;
  employeeId: string;
  date: string;
  conceptCode: NoveltyConceptCode;
  category: NoveltyCategory;
  amount: number;
  noteEs: string;
  noteEn: string;
}

export interface PayrollBootstrapPayload {
  periods: PayrollPeriod[];
  employees: Employee[];
  novelties: PayrollNovelty[];
}

/**
 * Async client interface so the simulated layer can be swapped
 * directly for NetsRow's production HTTP API client.
 */
export interface PayrollApiClient {
  fetchWorkspaceData(): Promise<PayrollBootstrapPayload>;
  createNovelty(input: CreateNoveltyInput): Promise<PayrollNovelty>;
  updateNovelty(input: UpdateNoveltyInput): Promise<PayrollNovelty>;
  deleteNovelty(noveltyId: string, periodId: string): Promise<void>;
  submitPeriodForReview(periodId: string, actorName: string): Promise<PayrollPeriod>;
  returnPeriodToDraft(periodId: string, actorName: string): Promise<PayrollPeriod>;
  runSimulation(periodId: string, actorName: string): Promise<PayrollPeriod>;
  runStatutoryCalculation(periodId: string, actorName: string): Promise<PayrollPeriod>;
  approvePayrollRun(periodId: string, runId: string, actorName: string): Promise<PayrollPeriod>;
}
