import { EInvoicingState } from './einvoicing';
import { ScreenId } from './payroll';

export type EndpointStatus = 'CONTRACT_READY' | 'DEMO_ONLY';

export interface BusinessSettings {
  currencyCode: string;
  currencySymbol: string;
  standardItbisRate: number;
  payrollCycleLabelEs: string;
  payrollCycleLabelEn: string;
  allowNegativeStock: boolean;
  receiptFooterEs: string;
  receiptFooterEn: string;
}

export interface CompanyProfile {
  name: string;
  rnc: string;
  tssEmployerCode: string;
  address: string;
  phone: string;
  email: string;
}

export interface Branch {
  id: string;
  code: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  isMain: boolean;
  active: boolean;
}

export interface ErpUser {
  id: string;
  fullName: string;
  email: string;
  roleId: string;
  branchId: string;
  active: boolean;
}

export interface ErpRoleDefinition {
  id: string;
  nameEs: string;
  nameEn: string;
  descriptionEs: string;
  descriptionEn: string;
  canApprovePayroll: boolean;
  canEditCatalogInventory: boolean;
  canOperatePosCashbox: boolean;
  canPostAccounting: boolean;
  canEditSettings: boolean;
}

export interface ProductCategory {
  id: string;
  code: string;
  nameEs: string;
  nameEn: string;
  active: boolean;
}

export interface ProductBrand {
  id: string;
  code: string;
  name: string;
  origin: string;
  active: boolean;
}

export interface UnitOfMeasure {
  id: string;
  code: string;
  nameEs: string;
  nameEn: string;
  allowDecimals: boolean;
}

export interface PriceList {
  id: string;
  code: string;
  nameEs: string;
  nameEn: string;
  discountPercent: number;
  isDefault: boolean;
  active: boolean;
}

export interface CatalogProduct {
  id: string;
  sku: string;
  nameEs: string;
  nameEn: string;
  categoryId: string;
  brandId: string;
  unitId: string;
  cost: number;
  price: number;
  taxableItbis: boolean;
  stock: number;
  minStock: number;
  active: boolean;
}

export interface Customer {
  id: string;
  code: string;
  name: string;
  taxId: string;
  email: string;
  phone: string;
  type: 'INDIVIDUAL' | 'CORPORATE';
  creditLimit: number;
  currentBalance: number;
  active: boolean;
}

export type InventoryMovementType = 'SALE' | 'PURCHASE' | 'ADJUSTMENT_IN' | 'ADJUSTMENT_OUT';

export interface InventoryMovement {
  id: string;
  date: string;
  productId: string;
  branchId: string;
  type: InventoryMovementType;
  quantityDelta: number;
  stockAfter: number;
  reference: string;
  reasonEs: string;
  reasonEn: string;
  actorName: string;
}

export type PaymentMethod = 'CASH' | 'CARD' | 'TRANSFER' | 'CREDIT';

export interface CashMovement {
  id: string;
  sessionId: string;
  timestamp: string;
  type: 'OPENING' | 'SALE_CASH' | 'INCOME' | 'EXPENSE' | 'CLOSING';
  amount: number;
  reference: string;
  noteEs: string;
  noteEn: string;
  actorName: string;
}

export interface CashRegisterSession {
  id: string;
  branchId: string;
  cashierName: string;
  openedAt: string;
  closedAt: string | null;
  status: 'OPEN' | 'CLOSED';
  openingAmount: number;
  cashSalesTotal: number;
  otherIncomesTotal: number;
  expensesTotal: number;
  expectedCash: number;
  countedCash: number | null;
  variance: number | null;
}

export interface SaleItem {
  productId: string;
  sku: string;
  nameEs: string;
  nameEn: string;
  quantity: number;
  unitPrice: number;
  taxableItbis: boolean;
  lineSubtotal: number;
  lineTax: number;
  lineTotal: number;
}

export interface SaleRecord {
  id: string;
  number: string;
  date: string;
  branchId: string;
  customerId: string;
  customerName: string;
  cashierName: string;
  paymentMethod: PaymentMethod;
  discountPercent: number;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  status: 'COMPLETED' | 'VOIDED';
  items: SaleItem[];
  internalDocId: string | null;
  eInvoiceId?: string | null;
}

export interface InternalDocument {
  id: string;
  number: string;
  type: 'NON_FISCAL_RECEIPT' | 'STOCK_ADJUSTMENT' | 'CASH_CLOSING' | 'PAYROLL_MEMO';
  date: string;
  branchId: string;
  referenceCode: string;
  titleEs: string;
  titleEn: string;
  counterparty: string;
  amount: number;
  nonFiscalNoticeEs: string;
  nonFiscalNoticeEn: string;
  lines: { label: string; qty?: number; amount: number }[];
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  rnc: string;
  phone: string;
}

export interface PurchaseBill {
  id: string;
  number: string;
  date: string;
  dueDate: string;
  supplierId: string;
  supplierName: string;
  branchId: string;
  productId: string;
  productName: string;
  quantity: number;
  totalAmount: number;
  paidAmount: number;
  status: 'OPEN' | 'PARTIAL' | 'PAID';
  notesEs: string;
  notesEn: string;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  currency: string;
  ledgerBalance: number;
}

export interface BankTransaction {
  id: string;
  bankAccountId: string;
  date: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER';
  reference: string;
  descriptionEs: string;
  descriptionEn: string;
  amount: number;
  reconciled: boolean;
}

export type AccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'COST' | 'EXPENSE';

export interface GlAccount {
  id: string;
  code: string;
  nameEs: string;
  nameEn: string;
  type: AccountType;
  normalSide: 'DEBIT' | 'CREDIT';
  active: boolean;
}

export interface AccountingPeriod {
  id: string;
  code: string;
  nameEs: string;
  nameEn: string;
  status: 'OPEN' | 'CLOSING' | 'CLOSED';
}

export interface JournalEntryLine {
  id: string;
  accountId: string;
  descriptionEs: string;
  descriptionEn: string;
  debit: number;
  credit: number;
}

export interface JournalEntry {
  id: string;
  number: string;
  date: string;
  periodId: string;
  sourceModule: 'POS' | 'PAYROLL' | 'PURCHASES' | 'INVENTORY' | 'MANUAL';
  reference: string;
  memoEs: string;
  memoEn: string;
  status: 'POSTED';
  lines: JournalEntryLine[];
}

export interface AccountingReconciliationItem {
  id: string;
  accountId: string;
  date: string;
  reference: string;
  descriptionEs: string;
  descriptionEn: string;
  bookAmount: number;
  externalAmount: number;
  status: 'MATCHED' | 'PENDING';
}

export interface WorkRiskRule {
  id: string;
  branchId: string;
  departmentEs: string;
  departmentEn: string;
  riskLevel: 'I' | 'II' | 'III';
  srlRatePercent: number;
  active: boolean;
}

export interface ConceptTreatmentRule {
  id: string;
  conceptCode: string;
  labelEs: string;
  labelEn: string;
  category: 'EARNING' | 'DEDUCTION';
  subjectToTss: boolean;
  subjectToIsr: boolean;
  subjectToInfotep: boolean;
}

export interface DashboardIncidence {
  id: string;
  periodCode: string;
  severity: 'HIGH' | 'MEDIUM';
  module: 'PAYROLL' | 'INVENTORY' | 'ACCOUNTING' | 'CASHBOX';
  titleEs: string;
  titleEn: string;
  detailEs: string;
  detailEn: string;
  targetScreen: string;
  employeeId?: string;
}

export type ActivityFeedCategory =
  | 'ALL'
  | 'PAYROLL_RUN'
  | 'EMPLOYEE_UPDATE'
  | 'SYSTEM_ALERT';

export type ActivityBadgeTone =
  | 'neutral'
  | 'amber'
  | 'emerald'
  | 'crimson'
  | 'navy';

export type ActivityBadgeIcon =
  | 'draft'
  | 'review'
  | 'approved'
  | 'ready'
  | 'warning'
  | 'lock';

export type ActivityStatusType =
  | 'approved'
  | 'ready'
  | 'completed'
  | 'active'
  | 'open'
  | 'ok'
  | 'pending'
  | 'in_review'
  | 'simulated'
  | 'warning'
  | 'leave'
  | 'locked'
  | 'closed'
  | 'alert'
  | 'error'
  | 'critical'
  | 'suspended'
  | 'incomplete'
  | 'draft'
  | 'update'
  | 'neutral';

export interface ActivityFeedItem {
  id: string;
  category: Exclude<ActivityFeedCategory, 'ALL'>;
  statusType: ActivityStatusType;
  /** Normalized sortable timestamp: YYYY-MM-DD HH:mm */
  sortTimestamp: string;
  displayTime: string;
  periodCode?: string;
  titleEs: string;
  titleEn: string;
  descriptionEs: string;
  descriptionEn: string;
  actorOrSubject: string;
  badgeLabelEs: string;
  badgeLabelEn: string;
  badgeTone: ActivityBadgeTone;
  badgeIcon: ActivityBadgeIcon;
  targetScreen: ScreenId;
  periodId?: string;
  runId?: string;
  employeeId?: string;
}

export interface ErpDemoState {
  business: BusinessSettings;
  company: CompanyProfile;
  branches: Branch[];
  activeBranchId: string;
  users: ErpUser[];
  roles: ErpRoleDefinition[];
  categories: ProductCategory[];
  brands: ProductBrand[];
  units: UnitOfMeasure[];
  priceLists: PriceList[];
  products: CatalogProduct[];
  customers: Customer[];
  inventoryMovements: InventoryMovement[];
  cashSessions: CashRegisterSession[];
  cashMovements: CashMovement[];
  sales: SaleRecord[];
  internalDocs: InternalDocument[];
  suppliers: Supplier[];
  purchases: PurchaseBill[];
  bankAccounts: BankAccount[];
  bankTransactions: BankTransaction[];
  glAccounts: GlAccount[];
  accountingPeriods: AccountingPeriod[];
  journalEntries: JournalEntry[];
  reconciliationItems: AccountingReconciliationItem[];
  workRiskRules: WorkRiskRule[];
  conceptTreatmentRules: ConceptTreatmentRule[];
  eInvoicing: EInvoicingState;
}
