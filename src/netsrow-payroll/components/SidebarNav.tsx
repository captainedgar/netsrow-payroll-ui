import React, { useCallback, useEffect, useState } from 'react';
import {
  BookOpen,
  Boxes,
  Briefcase,
  Building,
  Building2,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ClipboardCheck,
  FileCheck2,
  FileText,
  History,
  Home,
  Landmark,
  Layers,
  Lock,
  MonitorSmartphone,
  ReceiptText,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Store,
  Tag,
  UserCog,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import { usePayrollWorkspace } from '../context/PayrollWorkspaceContext';
import { ScreenId } from '../types/payroll';

interface NavSubItem {
  id: ScreenId;
  label: string;
}

interface NavGroupItem {
  id: ScreenId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  subItems?: NavSubItem[];
}

export const SidebarNav: React.FC = () => {
  const {
    activeScreen,
    activeReviewTab,
    setActiveScreen,
    erpState,
    resetDemoData,
    isMutating,
    t,
    locale,
    enabledModules,
    isMobileNavOpen,
    setIsMobileNavOpen,
  } = usePayrollWorkspace();

  const hasPayroll = enabledModules.includes('PAYROLL');
  const hasAccounting = enabledModules.includes('ACCOUNTING');

  const [collapsed, setCollapsed] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    e_invoicing: false,
    cashbox: false,
    inventory: false,
    catalog: false,
    accounting: false,
    payroll: true,
  });

  const toggleGroup = (key: string) => {
    setExpandedGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const closeMobileWithFocus = useCallback(() => {
    setIsMobileNavOpen(false);
    requestAnimationFrame(() => {
      document.getElementById('nr-mobile-nav-trigger')?.focus();
    });
  }, [setIsMobileNavOpen]);

  useEffect(() => {
    if (!isMobileNavOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMobileWithFocus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileNavOpen, closeMobileWithFocus]);

  const operationItems: NavGroupItem[] = [
    { id: 'overview', label: t.navigation.overview, icon: Home },
    { id: 'pos', label: t.navigation.pos, icon: MonitorSmartphone },
    { id: 'sales_ar', label: t.navigation.salesAr, icon: ReceiptText },
    {
      id: 'e_invoicing',
      label: t.navigation.eInvoicing,
      icon: FileCheck2,
      subItems: [
        { id: 'e_invoicing_docs', label: t.navigation.eInvoicingDocs },
        { id: 'e_invoicing_issue', label: t.navigation.eInvoicingIssue },
        { id: 'e_invoicing_lookup', label: t.navigation.eInvoicingLookup },
        { id: 'e_invoicing_sequences', label: t.navigation.eInvoicingSequences },
        { id: 'e_invoicing_config', label: t.navigation.eInvoicingConfig },
      ],
    },
    { id: 'customers', label: t.navigation.customers, icon: Users },
    {
      id: 'cashbox',
      label: t.navigation.cashbox,
      icon: Landmark,
      subItems: [
        { id: 'cashbox_shift', label: t.navigation.cashboxShift },
        { id: 'cashbox_movements', label: t.navigation.cashboxMovements },
        { id: 'cashbox_closing', label: t.navigation.cashboxClosing },
      ],
    },
    {
      id: 'inventory',
      label: t.navigation.inventory,
      icon: Boxes,
      subItems: [
        { id: 'inventory_stock', label: t.navigation.inventoryStock },
        { id: 'inventory_alerts', label: t.navigation.inventoryAlerts },
        { id: 'inventory_movements', label: t.navigation.inventoryMovements },
      ],
    },
    {
      id: 'catalog',
      label: t.navigation.catalog,
      icon: Tag,
      subItems: [
        { id: 'catalog_products', label: t.navigation.catalogProducts },
        { id: 'catalog_categories', label: t.navigation.catalogCategories },
        { id: 'catalog_brands', label: t.navigation.catalogBrands },
        { id: 'catalog_units', label: t.navigation.catalogUnits },
        { id: 'catalog_pricelists', label: t.navigation.catalogPriceLists },
      ],
    },
    { id: 'purchases_ap', label: t.navigation.purchasesAp, icon: ShoppingBag },
    { id: 'internal_docs', label: t.navigation.internalDocs, icon: FileText },
  ];

  const accountingSubItems: NavSubItem[] = [
    { id: 'accounting_accounts', label: t.navigation.accountingAccounts },
    { id: 'accounting_periods', label: t.navigation.accountingPeriods },
    { id: 'accounting_journal', label: t.navigation.accountingJournal },
    { id: 'accounting_ledger', label: t.navigation.accountingLedger },
    { id: 'accounting_trial_balance', label: t.navigation.accountingTrialBalance },
    { id: 'accounting_reconciliation', label: t.navigation.accountingReconciliation },
  ];

  const payrollItems: {
    id: ScreenId;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: 'employees', label: t.navigation.employees, icon: Users },
    { id: 'periods', label: t.navigation.periods, icon: CalendarDays },
    { id: 'novelties', label: t.navigation.novelties, icon: Layers },
    { id: 'payroll_review', label: t.navigation.payrollReview, icon: ClipboardCheck },
    { id: 'run_history', label: t.navigation.runHistory, icon: History },
  ];

  const payrollConfigItems: {
    id: ScreenId;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: 'work_risk', label: t.navigation.workRisk, icon: ShieldCheck },
    { id: 'concept_treatment', label: t.navigation.conceptTreatment, icon: Wallet },
  ];

  const settingsItems: NavGroupItem[] = [
    { id: 'business', label: t.navigation.business, icon: Briefcase },
    { id: 'company', label: t.navigation.company, icon: Building },
    { id: 'branches', label: t.navigation.branches, icon: Store },
    { id: 'users_roles', label: t.navigation.usersRoles, icon: UserCog },
  ];

  const isNavItemActive = (id: ScreenId) => {
    if (id === 'run_history') {
      return activeScreen === 'payroll_review' && activeReviewTab === 'history';
    }
    if (id === 'payroll_review') {
      return activeScreen === 'payroll_review' && activeReviewTab !== 'history';
    }
    if (id === 'e_invoicing') {
      return (
        activeScreen === 'e_invoicing' ||
        activeScreen.startsWith('e_invoicing_')
      );
    }
    if (id === 'cashbox') {
      return (
        activeScreen === 'cashbox' ||
        activeScreen === 'cashbox_shift' ||
        activeScreen === 'cashbox_movements' ||
        activeScreen === 'cashbox_closing'
      );
    }
    if (id === 'inventory') {
      return (
        activeScreen === 'inventory' ||
        activeScreen === 'inventory_stock' ||
        activeScreen === 'inventory_alerts' ||
        activeScreen === 'inventory_movements'
      );
    }
    if (id === 'catalog') {
      return (
        activeScreen === 'catalog' ||
        activeScreen === 'catalog_products' ||
        activeScreen === 'catalog_categories' ||
        activeScreen === 'catalog_brands' ||
        activeScreen === 'catalog_units' ||
        activeScreen === 'catalog_pricelists'
      );
    }
    if (id === 'accounting') {
      return (
        activeScreen === 'accounting' ||
        activeScreen.startsWith('accounting_')
      );
    }
    return activeScreen === id;
  };

  const renderGroupList = (items: NavGroupItem[], compact: boolean) => (
    <ul className="space-y-0.5">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = isNavItemActive(item.id);
        const hasSubs = Boolean(item.subItems && item.subItems.length > 0);
        const isExpanded = Boolean(expandedGroups[item.id]) || (hasSubs && isActive);

        return (
          <li key={item.id}>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  if (hasSubs && !compact) {
                    toggleGroup(item.id);
                    setActiveScreen(item.subItems![0].id);
                  } else {
                    setActiveScreen(item.id);
                  }
                }}
                title={compact ? item.label : undefined}
                className={`nr-focus-ring nr-transition flex-1 flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-[13px] font-medium whitespace-nowrap ${
                  isActive && !hasSubs
                    ? 'bg-[#047857] text-white'
                    : isActive && hasSubs
                      ? 'bg-[#132B42] text-emerald-300'
                      : 'text-slate-300 hover:bg-[#132B42]/75 hover:text-white'
                } ${compact ? 'justify-center px-2' : ''}`}
              >
                <span className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-emerald-300' : 'text-slate-400'
                    } ${isActive && !hasSubs ? '!text-white' : ''}`}
                  />
                  {!compact && (
                    <span className="truncate flex items-center gap-1.5">
                      <span>{item.label}</span>
                      {item.id === 'accounting' && !hasAccounting && (
                        <Lock className="w-3 h-3 text-amber-400 shrink-0" />
                      )}
                    </span>
                  )}
                </span>
                {!compact && hasSubs && (
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-150 ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                )}
              </button>
            </div>

            {!compact && hasSubs && isExpanded && item.subItems && (
              <ul className="mt-0.5 ml-4 pl-2.5 border-l border-[#1A293D] space-y-0.5">
                {item.subItems.map((sub) => {
                  const subActive = activeScreen === sub.id;
                  return (
                    <li key={sub.id}>
                      <button
                        type="button"
                        onClick={() => setActiveScreen(sub.id)}
                        className={`nr-focus-ring nr-transition w-full text-left rounded-lg px-2.5 py-1.5 text-xs font-medium truncate ${
                          subActive
                            ? 'bg-[#047857] text-white'
                            : 'text-slate-400 hover:bg-[#132B42]/70 hover:text-slate-100'
                        }`}
                      >
                        {sub.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );

  const sidebarContent = (compact: boolean, mobile = false) => (
    <div className="flex h-full flex-col bg-[#081321] text-slate-100 border-r border-[#1A293D] select-none">
      {/* Brand header */}
      <div
        className={`flex items-center justify-between h-14 px-3.5 border-b border-[#1A293D] shrink-0 ${
          compact ? 'justify-center' : ''
        }`}
      >
        <button
          type="button"
          onClick={() => setActiveScreen('overview')}
          className="nr-focus-ring flex items-center gap-2.5 min-w-0 text-left rounded-lg"
        >
          <div className="w-8 h-8 rounded-lg bg-[#047857] flex items-center justify-center text-white shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          {!compact && (
            <div className="min-w-0">
              <div className="font-display text-sm font-bold tracking-tight text-white truncate">
                {t.brandName}
              </div>
              <div className="text-[10px] font-semibold tracking-wider text-slate-400 truncate">
                {t.brandSubtitle}
              </div>
            </div>
          )}
        </button>
        {mobile && (
          <button
            type="button"
            onClick={closeMobileWithFocus}
            className="nr-focus-ring nr-transition p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#132B42]"
            aria-label={t.common.close}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Live Entity Card synced with Company Profile */}
      {!compact && (
        <div className="px-3 py-2.5 border-b border-[#1A293D] shrink-0">
          <button
            type="button"
            onClick={() => setActiveScreen('company')}
            className="nr-focus-ring nr-transition w-full flex items-center justify-between gap-2 rounded-lg border border-[#1E334A] bg-[#0E1E31] px-2.5 py-2 text-left hover:bg-[#132B42]"
          >
            <div className="min-w-0">
              <div className="text-xs font-semibold text-white truncate">
                {erpState.company.name}
              </div>
              <div className="font-mono-num text-[10px] text-slate-400 truncate">
                RNC {erpState.company.rnc}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>
        </div>
      )}

      {/* Full-height independently scrollable nav */}
      <nav
        aria-label={t.navigation.operationSection}
        className="flex-1 min-h-0 overflow-y-auto px-2.5 py-3 space-y-5"
      >
        {/* OPERACIÓN */}
        <div>
          {!compact && (
            <div className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              {t.navigation.operationSection}
            </div>
          )}
          {renderGroupList(operationItems, compact)}
        </div>

        {/* FINANZAS */}
        <div className="pt-2 border-t border-slate-800/80 space-y-1">
          {!compact && (
            <div className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              {t.navigation.financeSection}
            </div>
          )}

          {/* Contabilidad expandable group */}
          {renderGroupList(
            [
              {
                id: 'accounting',
                label: t.navigation.accounting,
                icon: BookOpen,
                subItems: accountingSubItems,
              },
              {
                id: 'banks_treasury',
                label: t.navigation.banksTreasury,
                icon: Landmark,
              },
            ],
            compact
          )}

          {/* Nómina expandable group */}
          <div className="mt-1">
            <button
              type="button"
              onClick={() => {
                if (!hasPayroll) {
                  setActiveScreen('payroll_review');
                } else if (compact) {
                  setActiveScreen('payroll_review');
                } else {
                  toggleGroup('payroll');
                }
              }}
              className={`w-full flex items-center justify-between gap-2 rounded px-3 py-2 text-[13px] font-semibold border ${
                hasPayroll
                  ? 'text-emerald-300 bg-emerald-950/50 border-emerald-700/40'
                  : 'text-slate-400 bg-slate-900/60 border-slate-800 hover:text-slate-200'
              } ${compact ? 'justify-center px-2' : ''}`}
            >
              <span className="flex items-center gap-2.5 min-w-0">
                {hasPayroll ? (
                  <Wallet className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                )}
                {!compact && (
                  <span className="truncate flex items-center gap-1.5">
                    <span>{t.navigation.payrollGroup}</span>
                    {!hasPayroll && (
                      <span className="text-[10px] font-semibold text-amber-400">
                        · {locale === 'es' ? 'No incluido' : 'Locked'}
                      </span>
                    )}
                  </span>
                )}
              </span>
              {!compact &&
                hasPayroll &&
                (expandedGroups.payroll ? (
                  <ChevronUp className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ))}
            </button>

            {!compact && hasPayroll && expandedGroups.payroll && (
              <div className="mt-1 ml-2 pl-2 border-l border-slate-800 space-y-2">
                <ul className="space-y-0.5">
                  {payrollItems.map((item) => {
                    const Icon = item.icon;
                    const active = isNavItemActive(item.id);
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => setActiveScreen(item.id)}
                          className={`nr-focus-ring nr-transition w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium whitespace-nowrap ${
                            active
                              ? 'bg-[#047857] text-white'
                              : 'text-slate-300 hover:bg-[#132B42]/75 hover:text-white'
                          }`}
                        >
                          <Icon
                            className={`w-4 h-4 shrink-0 ${
                              active ? 'text-white' : 'text-slate-400'
                            }`}
                          />
                          <span className="truncate">{item.label}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>

                <div className="pt-1.5">
                  <div className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    {t.navigation.payrollConfigSection}
                  </div>
                  <ul className="space-y-0.5">
                    {payrollConfigItems.map((item) => {
                      const Icon = item.icon;
                      const active = isNavItemActive(item.id);
                      return (
                        <li key={item.id}>
                          <button
                            type="button"
                            onClick={() => setActiveScreen(item.id)}
                            className={`nr-focus-ring nr-transition w-full flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap ${
                              active
                                ? 'bg-[#047857] text-white'
                                : 'text-slate-300 hover:bg-[#132B42]/75 hover:text-white'
                            }`}
                          >
                            <Icon
                              className={`w-3.5 h-3.5 shrink-0 ${
                                active ? 'text-white' : 'text-slate-400'
                              }`}
                            />
                            <span className="truncate">{item.label}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CONFIGURACIÓN */}
        <div className="pt-2 border-t border-[#1A293D] pb-3">
          {!compact && (
            <div className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              {t.navigation.settingsSection}
            </div>
          )}
          {renderGroupList(settingsItems, compact)}
        </div>
      </nav>

      {/* Bottom controls: Reset demo + Collapse */}
      <div className="p-2.5 border-t border-[#1A293D] space-y-1.5 shrink-0">
        <button
          type="button"
          disabled={isMutating}
          onClick={() => {
            resetDemoData();
            if (mobile) closeMobileWithFocus();
          }}
          title={t.topBar.resetDemoData}
          className={`nr-focus-ring nr-transition w-full flex items-center justify-center gap-2 rounded-lg border border-[#1E334A] bg-[#0E1E31] px-2.5 py-2 text-xs font-medium text-amber-300 hover:bg-[#132B42] hover:text-amber-200 disabled:opacity-50 ${
            compact ? 'px-2' : ''
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5 shrink-0" />
          {!compact && <span className="truncate">{t.topBar.resetDemoData}</span>}
        </button>

        {!mobile && (
          <button
            type="button"
            onClick={() => setCollapsed((prev) => !prev)}
            className="nr-focus-ring nr-transition w-full flex items-center justify-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-[#132B42]"
            title={
              compact
                ? t.navigation.expandSidebar
                : t.navigation.collapseSidebar
            }
          >
            {compact ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span className="truncate">{t.navigation.collapseSidebar}</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      <aside
        className={`hidden lg:block shrink-0 transition-all duration-200 ${
          collapsed ? 'w-[68px]' : 'w-[258px]'
        }`}
      >
        <div className="sticky top-0 h-[100dvh]">{sidebarContent(collapsed, false)}</div>
      </aside>

      {isMobileNavOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden flex"
          role="dialog"
          aria-modal="true"
          aria-label={t.navigation.openMenu}
        >
          <div
            className="fixed inset-0 bg-slate-950/65 backdrop-blur-[1px]"
            onClick={closeMobileWithFocus}
          />
          <aside className="relative z-10 w-[274px] max-w-[85vw] h-[100dvh]">
            {sidebarContent(false, true)}
          </aside>
        </div>
      )}
    </>
  );
};
