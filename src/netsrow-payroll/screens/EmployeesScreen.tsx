import React, { useMemo, useState } from 'react';
import {
  FileText,
  History,
  Lock,
  Search,
  UserCheck,
} from 'lucide-react';
import { DataTable, DataTableColumn } from '../components/DataTable';
import { MoneyCell } from '../components/MoneyCell';
import { StatusBadge } from '../components/StatusBadge';
import { SummaryCardGrid, SummaryCardItem } from '../components/SummaryCardGrid';
import { usePayrollWorkspace } from '../context/PayrollWorkspaceContext';
import { formatDateLocalized } from '../i18n/translations';
import { Employee, EmployeeStatus } from '../types/payroll';

export const EmployeesScreen: React.FC = () => {
  const {
    employees,
    activeEmployeeId,
    activeEmployee,
    selectEmployee,
    permissions,
    locale,
    t,
    isLoading,
  } = usePayrollWorkspace();

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | EmployeeStatus>('ALL');

  const filteredEmployees = useMemo(() => {
    const q = query.trim().toLowerCase();
    return employees.filter((emp) => {
      if (statusFilter !== 'ALL' && emp.status !== statusFilter) {
        return false;
      }
      if (!q) return true;
      return (
        emp.code.toLowerCase().includes(q) ||
        emp.fullName.toLowerCase().includes(q)
      );
    });
  }, [employees, query, statusFilter]);

  const activeCount = employees.filter((e) => e.status === 'ACTIVE').length;
  const nonActiveCount = employees.length - activeCount;

  const summaryItems: SummaryCardItem[] = [
    {
      id: 'total-emp',
      label: t.employeesScreen.totalEmployees,
      valueText: String(employees.length),
    },
    {
      id: 'active-emp',
      label: t.employeesScreen.activeEmployees,
      valueText: String(activeCount),
      emphasize: true,
    },
    {
      id: 'leave-emp',
      label: t.employeesScreen.onLeaveOrSuspended,
      valueText: String(nonActiveCount),
    },
  ];

  const columns: DataTableColumn<Employee>[] = [
    {
      key: 'code',
      header: t.common.code,
      stickyLeft: true,
      minWidthClass: 'min-w-[105px]',
      render: (emp) => (
        <span className="font-mono-num text-xs font-semibold text-emerald-700 dark:text-emerald-400">
          {emp.code}
        </span>
      ),
    },
    {
      key: 'name',
      header: t.common.employee,
      minWidthClass: 'min-w-[210px]',
      render: (emp) => (
        <div>
          <div className="font-semibold text-slate-900 dark:text-slate-100">
            {emp.fullName}
          </div>
          <div className="font-mono-num text-[11px] text-slate-500 dark:text-slate-400">
            {emp.cedula} · {locale === 'es' ? emp.departmentEs : emp.departmentEn}
          </div>
        </div>
      ),
    },
    {
      key: 'hireDate',
      header: t.employeesScreen.hireDate,
      minWidthClass: 'min-w-[130px]',
      render: (emp) => (
        <span className="font-mono-num text-xs text-slate-700 dark:text-slate-300 whitespace-nowrap">
          {formatDateLocalized(emp.hireDate, locale)}
        </span>
      ),
    },
    {
      key: 'baseSalary',
      header: t.employeesScreen.baseSalary,
      align: 'right',
      render: (emp) => (
        <MoneyCell amount={emp.baseMonthlySalary} locale={locale} />
      ),
    },
    {
      key: 'tss',
      header: t.employeesScreen.tssCoverage,
      render: (emp) => (
        <span className="inline-flex items-center gap-1 text-xs text-slate-700 dark:text-slate-300 whitespace-nowrap">
          <UserCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          {emp.tssRegistered
            ? t.employeesScreen.tssRegistered
            : t.employeesScreen.tssPending}
        </span>
      ),
    },
    {
      key: 'status',
      header: t.common.status,
      render: (emp) => (
        <StatusBadge
          label={t.employeeStatuses[emp.status]}
          tone={
            emp.status === 'ACTIVE'
              ? 'emerald'
              : emp.status === 'LEAVE'
                ? 'amber'
                : 'crimson'
          }
          icon={emp.status === 'ACTIVE' ? 'approved' : 'warning'}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
          {t.employeesScreen.title}
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
          {t.employeesScreen.subtitle}
        </p>
      </div>

      <SummaryCardGrid items={summaryItems} locale={locale} columns={3} />

      {/* Search by code and name + status filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search
            className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.employeesScreen.searchPlaceholder}
            aria-label={t.employeesScreen.searchPlaceholder}
            className="w-full h-9 pl-9 pr-3 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div className="inline-flex flex-wrap items-center gap-1 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 p-1">
          {(['ALL', 'ACTIVE', 'LEAVE', 'SUSPENDED'] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors whitespace-nowrap ${
                statusFilter === status
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {status === 'ALL' ? t.common.all : t.employeeStatuses[status]}
            </button>
          ))}
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={filteredEmployees}
        getRowKey={(e) => e.id}
        selectedRowKey={activeEmployeeId}
        onRowClick={(e) => selectEmployee(e.id)}
        emptyMessage={t.common.noResults}
        isLoading={isLoading}
        mobileCardRender={(emp) => (
          <div className="space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-mono-num text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  {emp.code}
                </div>
                <div className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                  {emp.fullName}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {locale === 'es' ? emp.departmentEs : emp.departmentEn}
                </div>
              </div>
              <StatusBadge
                label={t.employeeStatuses[emp.status]}
                tone={
                  emp.status === 'ACTIVE'
                    ? 'emerald'
                    : emp.status === 'LEAVE'
                      ? 'amber'
                      : 'crimson'
                }
                icon={emp.status === 'ACTIVE' ? 'approved' : 'warning'}
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <span className="text-slate-500 dark:text-slate-400">
                {t.employeesScreen.hireDate}:{' '}
                <span className="font-mono-num text-slate-700 dark:text-slate-300">
                  {formatDateLocalized(emp.hireDate, locale)}
                </span>
              </span>
              <MoneyCell amount={emp.baseMonthlySalary} locale={locale} />
            </div>
          </div>
        )}
      />

      {/* Visible Employee Dossier Section (General + Permission-Gated Salary History & ISR Background) */}
      {activeEmployee && (
        <section className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="font-display text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                {t.employeesScreen.dossierTitle} · {activeEmployee.fullName}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t.employeesScreen.dossierSubtitle}
              </p>
            </div>
            <StatusBadge
              label={`${activeEmployee.code} · ${t.employeeStatuses[activeEmployee.status]}`}
              tone={
                activeEmployee.status === 'ACTIVE'
                  ? 'emerald'
                  : activeEmployee.status === 'LEAVE'
                    ? 'amber'
                    : 'crimson'
              }
              icon={activeEmployee.status === 'ACTIVE' ? 'approved' : 'warning'}
            />
          </div>

          {/* General Profile */}
          <div className="rounded border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50 p-3.5">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
              {t.employeesScreen.generalProfileTitle}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {t.common.cedula}
                </div>
                <div className="font-mono-num font-semibold text-slate-900 dark:text-slate-100">
                  {activeEmployee.cedula}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {t.employeesScreen.positionLabel}
                </div>
                <div className="font-semibold text-slate-900 dark:text-slate-100">
                  {locale === 'es'
                    ? activeEmployee.positionEs
                    : activeEmployee.positionEn}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {t.employeesScreen.hireDate}
                </div>
                <div className="font-mono-num font-semibold text-slate-900 dark:text-slate-100">
                  {formatDateLocalized(activeEmployee.hireDate, locale)}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {t.employeesScreen.afpLabel} / {t.employeesScreen.arsLabel}
                </div>
                <div className="font-semibold text-slate-900 dark:text-slate-100">
                  {activeEmployee.afpProvider} · {activeEmployee.arsProvider}
                </div>
              </div>
            </div>
          </div>

          {/* Two-column Permission-Gated Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Historial salarial */}
            <div className="rounded border border-slate-200 dark:border-slate-700 p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                  <History className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{t.employeesScreen.salaryHistoryTitle}</span>
                </div>
                {!permissions.canViewSalaryHistory && (
                  <StatusBadge
                    label={t.common.readOnly}
                    tone="amber"
                    icon="lock"
                  />
                )}
              </div>

              {!permissions.canViewSalaryHistory ? (
                <div className="rounded border border-amber-200 dark:border-amber-800/70 bg-amber-50/70 dark:bg-amber-950/30 p-3.5 text-xs space-y-1.5">
                  <div className="flex items-center gap-1.5 font-semibold text-amber-900 dark:text-amber-200">
                    <Lock className="w-3.5 h-3.5 shrink-0" />
                    <span>{t.breakdownPanel.permissionRestrictedTitle}</span>
                  </div>
                  <p className="text-amber-800 dark:text-amber-300">
                    {t.breakdownPanel.permissionRestrictedSalary}
                  </p>
                </div>
              ) : activeEmployee.salaryHistory.length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t.employeesScreen.noSalaryHistory}
                </p>
              ) : (
                <div className="space-y-2.5">
                  {activeEmployee.salaryHistory.map((item) => (
                    <div
                      key={item.id}
                      className="rounded border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-3 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono-num font-semibold text-slate-900 dark:text-slate-100">
                          {formatDateLocalized(item.effectiveDate, locale)}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          {item.authorizedBy}
                        </span>
                      </div>
                      <div className="text-slate-700 dark:text-slate-300">
                        {locale === 'es' ? item.reasonEs : item.reasonEn}
                      </div>
                      <div className="flex items-center justify-between pt-1.5 border-t border-slate-200 dark:border-slate-700">
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          {t.breakdownPanel.previousSalary}:{' '}
                          <MoneyCell
                            amount={item.previousSalary}
                            locale={locale}
                            size="sm"
                          />
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          {t.breakdownPanel.newSalary}:{' '}
                          <MoneyCell
                            amount={item.newSalary}
                            locale={locale}
                            size="sm"
                            emphasize
                          />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Antecedentes de ISR */}
            <div className="rounded border border-slate-200 dark:border-slate-700 p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                  <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{t.employeesScreen.isrBackgroundTitle}</span>
                </div>
                {!permissions.canViewIsrBackground && (
                  <StatusBadge
                    label={t.common.readOnly}
                    tone="amber"
                    icon="lock"
                  />
                )}
              </div>

              {!permissions.canViewIsrBackground ? (
                <div className="rounded border border-amber-200 dark:border-amber-800/70 bg-amber-50/70 dark:bg-amber-950/30 p-3.5 text-xs space-y-1.5">
                  <div className="flex items-center gap-1.5 font-semibold text-amber-900 dark:text-amber-200">
                    <Lock className="w-3.5 h-3.5 shrink-0" />
                    <span>{t.breakdownPanel.permissionRestrictedTitle}</span>
                  </div>
                  <p className="text-amber-800 dark:text-amber-300">
                    {t.breakdownPanel.permissionRestrictedIsr}
                  </p>
                </div>
              ) : activeEmployee.isrBackground.length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t.employeesScreen.noIsrBackground}
                </p>
              ) : (
                <div className="space-y-2.5">
                  {activeEmployee.isrBackground.map((rec) => (
                    <div
                      key={rec.id}
                      className="rounded border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-3 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {locale === 'es' ? rec.periodLabelEs : rec.periodLabelEn}
                        </span>
                        <span className="font-mono-num text-[11px] text-slate-500 dark:text-slate-400">
                          {rec.ir3Reference}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-400">
                        {locale === 'es' ? rec.dgiiBracketEs : rec.dgiiBracketEn}
                      </div>
                      <div className="flex items-center justify-between pt-1.5 border-t border-slate-200 dark:border-slate-700">
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          {t.breakdownPanel.taxableIncome}:{' '}
                          <MoneyCell
                            amount={rec.annualizedTaxableIncome}
                            locale={locale}
                            size="sm"
                          />
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          {t.breakdownPanel.withheldIsr}:{' '}
                          <MoneyCell
                            amount={rec.accumulatedIsrWithheld}
                            locale={locale}
                            size="sm"
                          />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
