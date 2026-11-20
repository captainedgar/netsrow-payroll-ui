import React, { useState } from 'react';
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
  FileText,
  History,
  Home,
  Landmark,
  Layers,
  MonitorSmartphone,
  ReceiptText,
  ShieldCheck,
  Store,
  Tag,
  UserCog,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import { usePayrollWorkspace } from '../context/PayrollWorkspaceContext';
import { ScreenId } from '../types/payroll';

interface NavItem {
  id: ScreenId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  hasSubmenuChevron?: boolean;
}

export const SidebarNav: React.FC = () => {
  const {
    activeScreen,
    activeReviewTab,
    setActiveScreen,
    t,
    isMobileNavOpen,
    setIsMobileNavOpen,
  } = usePayrollWorkspace();

  const [collapsed, setCollapsed] = useState(false);
  const [payrollExpanded, setPayrollExpanded] = useState(true);

  const operationItems: NavItem[] = [
    { id: 'overview', label: t.navigation.overview, icon: Home },
    { id: 'pos', label: t.navigation.pos, icon: MonitorSmartphone },
    { id: 'sales_ar', label: t.navigation.salesAr, icon: ReceiptText },
    { id: 'customers', label: t.navigation.customers, icon: Users },
    { id: 'cashbox', label: t.navigation.cashbox, icon: Landmark, hasSubmenuChevron: true },
    { id: 'inventory', label: t.navigation.inventory, icon: Boxes, hasSubmenuChevron: true },
    { id: 'catalog', label: t.navigation.catalog, icon: Tag, hasSubmenuChevron: true },
    { id: 'internal_docs', label: t.navigation.internalDocs, icon: FileText },
  ];

  const payrollItems: NavItem[] = [
    { id: 'employees', label: t.navigation.employees, icon: Users },
    { id: 'periods', label: t.navigation.periods, icon: CalendarDays },
    { id: 'novelties', label: t.navigation.novelties, icon: Layers },
    { id: 'payroll_review', label: t.navigation.payrollReview, icon: ClipboardCheck },
    { id: 'run_history', label: t.navigation.runHistory, icon: History },
  ];

  const payrollConfigItems: NavItem[] = [
    { id: 'work_risk', label: t.navigation.workRisk, icon: ShieldCheck },
    { id: 'concept_treatment', label: t.navigation.conceptTreatment, icon: Wallet },
  ];

  const settingsItems: NavItem[] = [
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
    return activeScreen === id;
  };

  const renderFlatList = (items: NavItem[], compact: boolean, dense = false) => (
    <ul className="space-y-0.5">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = isNavItemActive(item.id);
        return (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => setActiveScreen(item.id)}
              title={compact ? item.label : undefined}
              className={`w-full flex items-center justify-between gap-2 rounded px-3 ${
                dense ? 'py-1.5 text-xs' : 'py-2 text-[13px]'
              } font-medium transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              } ${compact ? 'justify-center px-2' : ''}`}
            >
              <span className="flex items-center gap-2.5 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-white' : 'text-slate-400'
                  }`}
                />
                {!compact && <span className="truncate">{item.label}</span>}
              </span>
              {!compact && item.hasSubmenuChevron && (
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );

  const sidebarContent = (compact: boolean, mobile = false) => (
    <div className="flex h-full flex-col bg-[#0F172A] text-slate-100 border-r border-slate-800 select-none">
      {/* Brand header */}
      <div
        className={`flex items-center justify-between h-14 px-3.5 border-b border-slate-800 ${
          compact ? 'justify-center' : ''
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded bg-emerald-600 flex items-center justify-center text-white shrink-0">
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
        </div>
        {mobile && (
          <button
            type="button"
            onClick={() => setIsMobileNavOpen(false)}
            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800"
            aria-label={t.common.close}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Entity Card matching Stitch screenshot */}
      {!compact && (
        <div className="px-3 py-2.5 border-b border-slate-800">
          <button
            type="button"
            onClick={() => setActiveScreen('company')}
            className="w-full flex items-center justify-between gap-2 rounded border border-slate-700/80 bg-slate-800/70 px-2.5 py-2 text-left hover:bg-slate-800 transition-colors"
          >
            <div className="min-w-0">
              <div className="text-xs font-semibold text-white truncate">
                {t.entityName}
              </div>
              <div className="font-mono-num text-[10px] text-slate-400 truncate">
                {t.entityRnc}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>
        </div>
      )}

      {/* Navigation groups */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-5">
        {/* OPERACIÓN */}
        <div>
          {!compact && (
            <div className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              {t.navigation.operationSection}
            </div>
          )}
          {renderFlatList(operationItems, compact)}
        </div>

        {/* FINANZAS (Contabilidad + Nómina expanded group) */}
        <div className="pt-2 border-t border-slate-800/80">
          {!compact && (
            <div className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              {t.navigation.financeSection}
            </div>
          )}
          {renderFlatList(
            [
              {
                id: 'accounting',
                label: t.navigation.accounting,
                icon: BookOpen,
                hasSubmenuChevron: true,
              },
            ],
            compact
          )}

          {/* Nómina Group */}
          <div className="mt-1">
            <button
              type="button"
              onClick={() => {
                if (compact) {
                  setActiveScreen('payroll_review');
                } else {
                  setPayrollExpanded((prev) => !prev);
                }
              }}
              className={`w-full flex items-center justify-between gap-2 rounded px-3 py-2 text-[13px] font-semibold text-emerald-300 bg-emerald-950/50 border border-emerald-700/40 ${
                compact ? 'justify-center px-2' : ''
              }`}
            >
              <span className="flex items-center gap-2.5 min-w-0">
                <Wallet className="w-4 h-4 text-emerald-400 shrink-0" />
                {!compact && (
                  <span className="truncate">{t.navigation.payrollGroup}</span>
                )}
              </span>
              {!compact &&
                (payrollExpanded ? (
                  <ChevronUp className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ))}
            </button>

            {!compact && payrollExpanded && (
              <div className="mt-1 ml-2 pl-2 border-l border-slate-800 space-y-2">
                {renderFlatList(payrollItems, false)}
                <div className="pt-1.5">
                  <div className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    {t.navigation.payrollConfigSection}
                  </div>
                  {renderFlatList(payrollConfigItems, false, true)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CONFIGURACIÓN */}
        <div className="pt-2 border-t border-slate-800/80">
          {!compact && (
            <div className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              {t.navigation.settingsSection}
            </div>
          )}
          {renderFlatList(settingsItems, compact)}
        </div>
      </nav>

      {/* Desktop collapse toggle */}
      {!mobile && (
        <div className="p-2.5 border-t border-slate-800">
          <button
            type="button"
            onClick={() => setCollapsed((prev) => !prev)}
            className="w-full flex items-center justify-center gap-2 rounded px-2.5 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
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
        </div>
      )}
    </div>
  );

  return (
    <>
      <aside
        className={`hidden lg:block shrink-0 transition-all duration-200 ${
          collapsed ? 'w-[68px]' : 'w-[252px]'
        }`}
      >
        <div className="sticky top-0 h-screen">{sidebarContent(collapsed, false)}</div>
      </aside>

      {isMobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/60"
            onClick={() => setIsMobileNavOpen(false)}
          />
          <aside className="relative z-10 w-[268px] max-w-[85vw] h-full">
            {sidebarContent(false, true)}
          </aside>
        </div>
      )}
    </>
  );
};
