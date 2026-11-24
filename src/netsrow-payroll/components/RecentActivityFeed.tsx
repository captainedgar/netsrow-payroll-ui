import React, { useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Calculator,
  Clock,
  UserCheck,
} from 'lucide-react';
import { usePayrollWorkspace } from '../context/PayrollWorkspaceContext';
import { buildRecentActivityFeed } from '../services/activityFeed';
import { ActivityFeedCategory, ActivityFeedItem } from '../types/erp';
import { StatusBadge } from './StatusBadge';

export interface RecentActivityFeedProps {
  /** Optional override for period scope default ('ALL_PERIODS' | 'SELECTED_PERIOD') */
  defaultScope?: 'ALL_PERIODS' | 'SELECTED_PERIOD';
  /** Maximum rows shown before clicking "Ver todas" */
  initialLimit?: number;
}

const CATEGORY_ICON_MAP = {
  PAYROLL_RUN: {
    Icon: Calculator,
    bgClass:
      'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/70',
  },
  EMPLOYEE_UPDATE: {
    Icon: UserCheck,
    bgClass:
      'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700',
  },
  SYSTEM_ALERT: {
    Icon: AlertTriangle,
    bgClass:
      'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/70',
  },
} as const;

export const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({
  defaultScope = 'ALL_PERIODS',
  initialLimit = 10,
}) => {
  const {
    periods,
    employees,
    novelties,
    erpState,
    activePeriodId,
    permissions,
    enabledModules,
    tenantStatus,
    locale,
    setActiveScreen,
    selectPeriod,
    selectRun,
    selectEmployee,
  } = usePayrollWorkspace();

  const [selectedCategory, setSelectedCategory] =
    useState<ActivityFeedCategory>('ALL');
  const [periodScope, setPeriodScope] = useState<'ALL_PERIODS' | 'SELECTED_PERIOD'>(
    defaultScope
  );
  const [showAll, setShowAll] = useState(false);

  const selectedPeriod = useMemo(
    () => periods.find((p) => p.id === activePeriodId) ?? periods[0] ?? null,
    [periods, activePeriodId]
  );

  const allEvents = useMemo(
    () =>
      buildRecentActivityFeed({
        periods,
        employees,
        novelties,
        erpState,
        canViewSalaryHistory: permissions.canViewSalaryHistory,
        enabledModules,
        tenantStatus,
      }),
    [
      periods,
      employees,
      novelties,
      erpState,
      permissions.canViewSalaryHistory,
      enabledModules,
      tenantStatus,
    ]
  );

  const scopedEvents = useMemo(() => {
    if (periodScope === 'ALL_PERIODS' || !selectedPeriod) {
      return allEvents;
    }
    return allEvents.filter(
      (item) =>
        item.periodId === selectedPeriod.id ||
        item.periodCode === selectedPeriod.code ||
        (!item.periodId && !item.periodCode)
    );
  }, [allEvents, periodScope, selectedPeriod]);

  const counts = useMemo(
    () => ({
      ALL: scopedEvents.length,
      PAYROLL_RUN: scopedEvents.filter((i) => i.category === 'PAYROLL_RUN').length,
      EMPLOYEE_UPDATE: scopedEvents.filter((i) => i.category === 'EMPLOYEE_UPDATE')
        .length,
      SYSTEM_ALERT: scopedEvents.filter((i) => i.category === 'SYSTEM_ALERT').length,
    }),
    [scopedEvents]
  );

  const filteredEvents = useMemo(() => {
    if (selectedCategory === 'ALL') return scopedEvents;
    return scopedEvents.filter((item) => item.category === selectedCategory);
  }, [scopedEvents, selectedCategory]);

  const visibleEvents = useMemo(
    () => (showAll ? filteredEvents : filteredEvents.slice(0, initialLimit)),
    [filteredEvents, showAll, initialLimit]
  );

  const handleItemClick = (item: ActivityFeedItem) => {
    if (item.periodId) {
      selectPeriod(item.periodId, false);
    }
    if (item.runId) {
      selectRun(item.runId);
    }
    if (item.employeeId) {
      selectEmployee(item.employeeId);
    }
    setActiveScreen(item.targetScreen);
  };

  const filterTabs: {
    id: ActivityFeedCategory;
    label: string;
    count: number;
  }[] = [
    {
      id: 'ALL',
      label: locale === 'es' ? 'Todos' : 'All',
      count: counts.ALL,
    },
    {
      id: 'PAYROLL_RUN',
      label: locale === 'es' ? 'Corridas de nómina' : 'Payroll runs',
      count: counts.PAYROLL_RUN,
    },
    {
      id: 'EMPLOYEE_UPDATE',
      label: locale === 'es' ? 'Cambios de empleados' : 'Employee updates',
      count: counts.EMPLOYEE_UPDATE,
    },
    {
      id: 'SYSTEM_ALERT',
      label: locale === 'es' ? 'Alertas del sistema' : 'System alerts',
      count: counts.SYSTEM_ALERT,
    },
  ];

  return (
    <section
      aria-label={locale === 'es' ? 'Actividad reciente' : 'Recent Activity'}
      className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 sm:p-5 space-y-4"
    >
      {/* Header + Scope Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                {locale === 'es' ? 'Actividad reciente' : 'Recent Activity'}
              </h2>
              <span className="font-mono-num text-[11px] font-semibold px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {filteredEvents.length}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {locale === 'es'
                ? 'Registro cronológico de corridas de nómina, actualizaciones de colaboradores y alertas operativas.'
                : 'Chronological feed of payroll runs, employee updates, and operational system alerts.'}
            </p>
          </div>
        </div>

        {/* Period Scope Switch */}
        {selectedPeriod && (
          <div className="inline-flex items-center self-start rounded border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 p-0.5">
            <button
              type="button"
              onClick={() => {
                setPeriodScope('ALL_PERIODS');
                setShowAll(false);
              }}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-sm transition-colors ${
                periodScope === 'ALL_PERIODS'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {locale === 'es' ? 'Todo el historial' : 'All history'}
            </button>
            <button
              type="button"
              onClick={() => {
                setPeriodScope('SELECTED_PERIOD');
                setShowAll(false);
              }}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-sm transition-colors ${
                periodScope === 'SELECTED_PERIOD'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {locale === 'es' ? selectedPeriod.nameEs : selectedPeriod.nameEn}
            </button>
          </div>
        )}
      </div>

      {/* Category Filter Tabs */}
      <div
        role="tablist"
        aria-label={locale === 'es' ? 'Filtrar actividad' : 'Filter activity'}
        className="flex flex-wrap items-center gap-1.5 pb-3 border-b border-slate-200 dark:border-slate-800"
      >
        {filterTabs.map((tab) => {
          const active = selectedCategory === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={active}
              type="button"
              onClick={() => {
                setSelectedCategory(tab.id);
                setShowAll(false);
              }}
              className={`inline-flex items-center gap-1.5 h-8 px-3 rounded border text-xs font-semibold transition-colors ${
                active
                  ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`font-mono-num text-[11px] px-1.5 py-0.2 rounded ${
                  active
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Chronological Timeline List */}
      {visibleEvents.length === 0 ? (
        <div className="rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-6 text-center text-xs text-slate-500 dark:text-slate-400">
          {locale === 'es'
            ? 'No hay eventos registrados para el filtro seleccionado.'
            : 'No events found for the selected filter.'}
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {visibleEvents.map((item) => {
            const visual = CATEGORY_ICON_MAP[item.category];
            const CategoryIcon = visual.Icon;
            const categoryLabel =
              item.category === 'PAYROLL_RUN'
                ? locale === 'es'
                  ? 'Nómina'
                  : 'Payroll'
                : item.category === 'EMPLOYEE_UPDATE'
                  ? locale === 'es'
                    ? 'Empleado'
                    : 'Employee'
                  : locale === 'es'
                    ? 'Sistema'
                    : 'System';

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleItemClick(item)}
                className="w-full text-left py-3 px-2 -mx-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 group"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded border flex items-center justify-center shrink-0 mt-0.5 ${visual.bgClass}`}
                  >
                    <CategoryIcon className="w-4 h-4" aria-hidden="true" />
                  </div>

                  <div className="min-w-0 space-y-0.5">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span className="text-xs sm:text-[13px] font-semibold text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                        {locale === 'es' ? item.titleEs : item.titleEn}
                      </span>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        · {categoryLabel}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-snug">
                      {locale === 'es' ? item.descriptionEs : item.descriptionEn}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="inline-flex items-center gap-1 font-mono-num">
                        <Clock className="w-3 h-3 text-slate-400" aria-hidden="true" />
                        {item.displayTime}
                      </span>
                      <span>·</span>
                      <span className="truncate">{item.actorOrSubject}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-2 pl-11 sm:pl-0 shrink-0">
                  <StatusBadge
                    activityStatus={item.statusType}
                    locale={locale}
                    label={locale === 'es' ? item.badgeLabelEs : item.badgeLabelEn}
                  />
                  <ArrowUpRight
                    className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors"
                    aria-hidden="true"
                  />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Expand / Collapse Footer */}
      {filteredEvents.length > initialLimit && (
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            {locale === 'es'
              ? `Mostrando ${visibleEvents.length} de ${filteredEvents.length} eventos`
              : `Showing ${visibleEvents.length} of ${filteredEvents.length} events`}
          </span>
          <button
            type="button"
            onClick={() => setShowAll((prev) => !prev)}
            className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
          >
            {showAll
              ? locale === 'es'
                ? 'Mostrar menos'
                : 'Show fewer'
              : locale === 'es'
                ? `Ver todos (${filteredEvents.length})`
                : `View all (${filteredEvents.length})`}
          </button>
        </div>
      )}
    </section>
  );
};
