// Portable entry exports for Next.js App Router (ERPSYSTEM/apps/web)
export * from './types/payroll';
export * from './types/erp';
export * from './types/platform';
export * from './i18n/translations';
export * from './i18n/platformTranslations';
export * from './context/PayrollWorkspaceContext';
export * from './context/PlatformContext';
export { MockPayrollClient } from './services/mockPayrollClient';
export {
  MockPlatformClient,
  AuthClientError,
  validateModuleDependencies,
} from './services/mockPlatformClient';
export {
  DEMO_LOGIN_PROFILES,
  SEED_SAAS_MODULES,
  SEED_SAAS_PLANS,
  computeTenantMonthlyBreakdown,
} from './data/platformSeed';

export { SidebarNav } from './components/SidebarNav';
export { TopBar } from './components/TopBar';
export { PayrollBreakdownPanel } from './components/PayrollBreakdownPanel';
export { DataTable } from './components/DataTable';
export { SummaryCardGrid } from './components/SummaryCardGrid';
export {
  StatusBadge,
  resolveStatusBadgePreset,
  type StatusBadgeProps,
  type BadgeTone,
  type BadgeIcon,
  type StatusBadgePreset,
} from './components/StatusBadge';
export { MoneyCell } from './components/MoneyCell';
export { RecentActivityFeed } from './components/RecentActivityFeed';
export { buildRecentActivityFeed } from './services/activityFeed';
export { AuthLoginForm } from './components/AuthLoginForm';
export { PlatformSidebar } from './components/PlatformSidebar';
export { PlatformTopBar } from './components/PlatformTopBar';

export { OverviewScreen } from './screens/OverviewScreen';
export { PosScreen } from './screens/PosScreen';
export { SalesScreen } from './screens/SalesScreen';
export { CustomersScreen } from './screens/CustomersScreen';
export { CashboxScreen } from './screens/CashboxScreen';
export { InventoryScreen } from './screens/InventoryScreen';
export { CatalogScreen } from './screens/CatalogScreen';
export { PurchasesScreen } from './screens/PurchasesScreen';
export { InternalDocsScreen } from './screens/InternalDocsScreen';
export { AccountingScreen } from './screens/AccountingScreen';
export { BanksTreasuryScreen } from './screens/BanksTreasuryScreen';
export { PeriodsScreen } from './screens/PeriodsScreen';
export { EmployeesScreen } from './screens/EmployeesScreen';
export { NoveltiesScreen } from './screens/NoveltiesScreen';
export { PayrollReviewScreen } from './screens/PayrollReviewScreen';
export { PayrollConfigScreen } from './screens/PayrollConfigScreen';
export { SettingsScreen } from './screens/SettingsScreen';
export { NetsRowPayrollWorkspace } from './screens/NetsRowPayrollWorkspace';

export { TenantLoginScreen } from './screens/TenantLoginScreen';
export { PlatformLoginScreen } from './screens/PlatformLoginScreen';
export { RegisterDemoScreen } from './screens/RegisterDemoScreen';
export { AccessRestrictedScreen } from './screens/AccessRestrictedScreen';
export { PlatformOverviewScreen } from './screens/PlatformOverviewScreen';
export { PlatformTenantsScreen } from './screens/PlatformTenantsScreen';
export { PlatformPlansScreen } from './screens/PlatformPlansScreen';
export { PlatformSubscriptionsScreen } from './screens/PlatformSubscriptionsScreen';
export { PlatformSupportScreen } from './screens/PlatformSupportScreen';
export { PlatformAuditScreen } from './screens/PlatformAuditScreen';
export { PlatformWorkspace } from './screens/PlatformWorkspace';

// Commercial Website & Plan Configurator (/ and /planes)
export * from './types/commercial';
export * from './data/marketingAssets';
export * from './data/commercialCatalog';
export * from './services/commercialPricing';
export * from './i18n/commercialTranslations';
export {
  MockCommercialClient,
  mergeCommercialCatalogWithSuperadmin,
  validateQuoteContact,
  buildWhatsAppQuoteUrl,
  COMMERCIAL_MODULE_LABELS,
} from './services/mockCommercialClient';
export * from './context/CommercialContext';
export { CommercialHeader } from './components/CommercialHeader';
export { CommercialFooter } from './components/CommercialFooter';
export { SoftwarePreviewFrame } from './components/SoftwarePreviewFrame';
export { QuoteSummaryPanel } from './components/QuoteSummaryPanel';
export { QuoteRequestForm } from './components/QuoteRequestForm';
export { LandingScreen } from './screens/LandingScreen';
export { PlansConfiguratorScreen } from './screens/PlansConfiguratorScreen';
