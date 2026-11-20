import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Edit3,
  Info,
  Lock,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { DataTable, DataTableColumn } from '../components/DataTable';
import { MoneyCell } from '../components/MoneyCell';
import { StatusBadge } from '../components/StatusBadge';
import { SummaryCardGrid, SummaryCardItem } from '../components/SummaryCardGrid';
import { usePayrollWorkspace } from '../context/PayrollWorkspaceContext';
import { formatDateLocalized } from '../i18n/translations';
import {
  NoveltyCategory,
  NoveltyConceptCode,
  PayrollNovelty,
} from '../types/payroll';

const CONCEPT_CATEGORY_DEFAULT: Record<NoveltyConceptCode, NoveltyCategory> = {
  OVERTIME_35: 'EARNING',
  COMMISSION: 'EARNING',
  PERFORMANCE_BONUS: 'EARNING',
  TRANSPORT_ALLOWANCE: 'EARNING',
  LOAN_DEDUCTION: 'DEDUCTION',
  UNPAID_ABSENCE: 'DEDUCTION',
};

export const NoveltiesScreen: React.FC = () => {
  const {
    periods,
    activePeriodId,
    selectPeriod,
    activePeriod,
    activePeriodNovelties,
    employees,
    selectEmployee,
    locale,
    t,
    permissions,
    isLoading,
    isMutating,
    createNovelty,
    updateNovelty,
    deleteNovelty,
    setActiveScreen,
  } = usePayrollWorkspace();

  const [filterText, setFilterText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | NoveltyCategory>('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNovelty, setEditingNovelty] = useState<PayrollNovelty | null>(null);
  const [formEmployeeId, setFormEmployeeId] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formConcept, setFormConcept] = useState<NoveltyConceptCode>('OVERTIME_35');
  const [formCategory, setFormCategory] = useState<NoveltyCategory>('EARNING');
  const [formAmount, setFormAmount] = useState('');
  const [formNote, setFormNote] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const isDraftPeriod = activePeriod?.status === 'DRAFT';
  const canEdit = Boolean(isDraftPeriod && permissions.canEditNovelties);

  const employeeMap = useMemo(() => {
    const map = new Map<string, (typeof employees)[number]>();
    employees.forEach((e) => map.set(e.id, e));
    return map;
  }, [employees]);

  const filteredNovelties = useMemo(() => {
    const q = filterText.trim().toLowerCase();
    return activePeriodNovelties.filter((nov) => {
      if (categoryFilter !== 'ALL' && nov.category !== categoryFilter) {
        return false;
      }
      if (!q) return true;
      const emp = employeeMap.get(nov.employeeId);
      const conceptLabel = t.noveltyConcepts[nov.conceptCode].toLowerCase();
      return (
        (emp?.code.toLowerCase().includes(q) ?? false) ||
        (emp?.fullName.toLowerCase().includes(q) ?? false) ||
        conceptLabel.includes(q)
      );
    });
  }, [activePeriodNovelties, categoryFilter, filterText, employeeMap, t]);

  const earningsTotal = useMemo(
    () =>
      activePeriodNovelties
        .filter((n) => n.category === 'EARNING')
        .reduce((acc, n) => acc + n.amount, 0),
    [activePeriodNovelties]
  );

  const deductionsTotal = useMemo(
    () =>
      activePeriodNovelties
        .filter((n) => n.category === 'DEDUCTION')
        .reduce((acc, n) => acc + n.amount, 0),
    [activePeriodNovelties]
  );

  const summaryItems: SummaryCardItem[] = [
    {
      id: 'nov-count',
      label: t.noveltiesScreen.recordsCount,
      valueText: String(activePeriodNovelties.length),
    },
    {
      id: 'nov-earnings',
      label: t.noveltiesScreen.earningsTotal,
      isCurrency: true,
      amount: earningsTotal,
      emphasize: earningsTotal > 0,
    },
    {
      id: 'nov-deductions',
      label: t.noveltiesScreen.deductionsTotal,
      isCurrency: true,
      amount: deductionsTotal,
    },
  ];

  const openCreateModal = () => {
    if (!activePeriod || !canEdit) return;
    setEditingNovelty(null);
    setFormEmployeeId(employees[0]?.id ?? '');
    setFormDate(activePeriod.startDate);
    setFormConcept('OVERTIME_35');
    setFormCategory('EARNING');
    setFormAmount('');
    setFormNote('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (nov: PayrollNovelty) => {
    if (!canEdit) return;
    setEditingNovelty(nov);
    setFormEmployeeId(nov.employeeId);
    setFormDate(nov.date);
    setFormConcept(nov.conceptCode);
    setFormCategory(nov.category);
    setFormAmount(String(nov.amount));
    setFormNote(locale === 'es' ? nov.noteEs : nov.noteEn);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePeriod || !canEdit) return;
    const numericAmount = Number(formAmount);
    if (!formEmployeeId || !formDate || Number.isNaN(numericAmount) || numericAmount <= 0) {
      setFormError(
        locale === 'es'
          ? 'Ingresa un empleado, fecha e importe mayor a RD$0.00.'
          : 'Enter a valid employee, date, and amount greater than RD$0.00.'
      );
      return;
    }

    try {
      if (editingNovelty) {
        await updateNovelty({
          id: editingNovelty.id,
          employeeId: formEmployeeId,
          date: formDate,
          conceptCode: formConcept,
          category: formCategory,
          amount: numericAmount,
          noteEs: formNote || t.noveltyConcepts[formConcept],
          noteEn: formNote || t.noveltyConcepts[formConcept],
        });
      } else {
        await createNovelty({
          periodId: activePeriod.id,
          employeeId: formEmployeeId,
          date: formDate,
          conceptCode: formConcept,
          category: formCategory,
          amount: numericAmount,
          noteEs: formNote || t.noveltyConcepts[formConcept],
          noteEn: formNote || t.noveltyConcepts[formConcept],
        });
      }
      setIsModalOpen(false);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Error');
    }
  };

  const handleDelete = async (nov: PayrollNovelty) => {
    if (!activePeriod || !canEdit) return;
    await deleteNovelty(nov.id, activePeriod.id);
  };

  const columns: DataTableColumn<PayrollNovelty>[] = [
    {
      key: 'employee',
      header: t.common.employee,
      stickyLeft: true,
      minWidthClass: 'min-w-[195px]',
      render: (nov) => {
        const emp = employeeMap.get(nov.employeeId);
        return (
          <div>
            <div className="font-semibold text-slate-900 dark:text-slate-100">
              {emp?.fullName ?? nov.employeeId}
            </div>
            <div className="font-mono-num text-[11px] text-slate-500 dark:text-slate-400">
              {emp?.code ?? '—'}
            </div>
          </div>
        );
      },
    },
    {
      key: 'date',
      header: t.common.date,
      minWidthClass: 'min-w-[120px]',
      render: (nov) => (
        <span className="font-mono-num text-xs text-slate-700 dark:text-slate-300 whitespace-nowrap">
          {formatDateLocalized(nov.date, locale)}
        </span>
      ),
    },
    {
      key: 'concept',
      header: t.noveltiesScreen.concept,
      minWidthClass: 'min-w-[180px]',
      render: (nov) => (
        <div>
          <div className="font-medium text-slate-900 dark:text-slate-100">
            {t.noveltyConcepts[nov.conceptCode]}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[240px]">
            {locale === 'es' ? nov.noteEs : nov.noteEn}
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: t.noveltiesScreen.category,
      render: (nov) => (
        <StatusBadge
          label={t.noveltyCategories[nov.category]}
          tone={nov.category === 'EARNING' ? 'emerald' : 'amber'}
          icon={nov.category === 'EARNING' ? 'approved' : 'warning'}
        />
      ),
    },
    {
      key: 'amount',
      header: t.common.amount,
      align: 'right',
      render: (nov) => (
        <MoneyCell
          amount={nov.amount}
          locale={locale}
          emphasize={nov.category === 'EARNING'}
        />
      ),
    },
    ...(canEdit
      ? [
          {
            key: 'actions',
            header: t.common.actions,
            align: 'right' as const,
            render: (nov: PayrollNovelty) => (
              <div className="inline-flex items-center justify-end gap-1.5">
                <button
                  type="button"
                  disabled={isMutating}
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditModal(nov);
                  }}
                  className="p-1.5 rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  title={t.common.edit}
                  aria-label={t.common.edit}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={isMutating}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(nov);
                  }}
                  className="p-1.5 rounded border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"
                  title={t.common.delete}
                  aria-label={t.common.delete}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
              {t.noveltiesScreen.title}
            </h1>
            {activePeriod && (
              <StatusBadge
                label={`${locale === 'es' ? activePeriod.nameEs : activePeriod.nameEn} · ${
                  t.statuses[activePeriod.status]
                }`}
                tone={
                  activePeriod.status === 'APPROVED'
                    ? 'emerald'
                    : activePeriod.status === 'IN_REVIEW'
                      ? 'amber'
                      : 'neutral'
                }
                icon={
                  activePeriod.status === 'APPROVED'
                    ? 'approved'
                    : activePeriod.status === 'IN_REVIEW'
                      ? 'review'
                      : 'draft'
                }
              />
            )}
          </div>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
            {t.noveltiesScreen.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveScreen('payroll_review')}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap"
          >
            <span>{t.noveltiesScreen.goToReviewCta}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          {canEdit && (
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>{t.noveltiesScreen.addNovelty}</span>
            </button>
          )}
        </div>
      </div>

      {/* Inline Monthly Period Switcher Chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          {t.noveltiesScreen.periodSelectorLabel}:
        </span>
        {periods.map((p) => {
          const selected = p.id === activePeriodId;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => selectPeriod(p.id, false)}
              className={`px-3 py-1.5 rounded border text-xs font-semibold transition-colors whitespace-nowrap ${
                selected
                  ? 'bg-slate-900 text-white border-slate-900 dark:bg-emerald-600 dark:border-emerald-500'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {locale === 'es' ? p.nameEs : p.nameEn} · {t.statuses[p.status]}
            </button>
          );
        })}
      </div>

      {/* Period editability / lock banner */}
      {activePeriod && (
        <div
          className={`flex items-start gap-2.5 rounded-md border p-3 text-xs ${
            activePeriod.status === 'DRAFT'
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900 dark:bg-emerald-950/30 dark:border-emerald-800/70 dark:text-emerald-200'
              : activePeriod.status === 'IN_REVIEW'
                ? 'bg-amber-50/80 border-amber-200 text-amber-900 dark:bg-amber-950/30 dark:border-amber-800/70 dark:text-amber-200'
                : 'bg-slate-100 border-slate-300 text-slate-800 dark:bg-slate-800/70 dark:border-slate-700 dark:text-slate-200'
          }`}
        >
          {activePeriod.status === 'DRAFT' ? (
            <Info className="w-4 h-4 mt-0.5 shrink-0" />
          ) : (
            <Lock className="w-4 h-4 mt-0.5 shrink-0" />
          )}
          <span>
            {activePeriod.status === 'DRAFT'
              ? t.noveltiesScreen.draftEditableBanner
              : activePeriod.status === 'IN_REVIEW'
                ? t.noveltiesScreen.reviewLockedBanner
                : t.noveltiesScreen.approvedLockedBanner}
          </span>
        </div>
      )}

      <SummaryCardGrid items={summaryItems} locale={locale} columns={3} />

      {/* Search & category filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder={t.noveltiesScreen.filterEmployeeOrConcept}
            className="w-full h-9 pl-9 pr-3 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="inline-flex items-center gap-1 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 p-1">
          {(['ALL', 'EARNING', 'DEDUCTION'] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors whitespace-nowrap ${
                categoryFilter === cat
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {cat === 'ALL' ? t.common.all : t.noveltyCategories[cat]}
            </button>
          ))}
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={filteredNovelties}
        getRowKey={(n) => n.id}
        onRowClick={(n) => selectEmployee(n.employeeId)}
        emptyMessage={t.noveltiesScreen.emptyState}
        isLoading={isLoading}
        mobileCardRender={(nov) => {
          const emp = employeeMap.get(nov.employeeId);
          return (
            <div className="space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-mono-num text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                    {emp?.code ?? '—'}
                  </div>
                  <div className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                    {emp?.fullName ?? nov.employeeId}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300">
                    {t.noveltyConcepts[nov.conceptCode]}
                  </div>
                </div>
                <StatusBadge
                  label={t.noveltyCategories[nov.category]}
                  tone={nov.category === 'EARNING' ? 'emerald' : 'amber'}
                  icon={nov.category === 'EARNING' ? 'approved' : 'warning'}
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="font-mono-num text-xs text-slate-500 dark:text-slate-400">
                  {formatDateLocalized(nov.date, locale)}
                </span>
                <MoneyCell
                  amount={nov.amount}
                  locale={locale}
                  emphasize={nov.category === 'EARNING'}
                />
              </div>

              {canEdit && (
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(nov);
                    }}
                    className="inline-flex items-center gap-1 rounded border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-200"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>{t.common.edit}</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(nov);
                    }}
                    className="inline-flex items-center gap-1 rounded border border-red-200 dark:border-red-900/60 px-2.5 py-1 text-xs font-medium text-red-700 dark:text-red-400"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>{t.common.delete}</span>
                  </button>
                </div>
              )}
            </div>
          );
        }}
      />

      {/* Create / Edit Draft Novelty Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60">
          <div className="w-full max-w-md rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
              <h2 className="font-display text-base font-bold text-slate-900 dark:text-slate-100">
                {editingNovelty
                  ? t.noveltiesScreen.editNovelty
                  : t.noveltiesScreen.addNovelty}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.common.employee}
                </label>
                <select
                  value={formEmployeeId}
                  onChange={(e) => setFormEmployeeId(e.target.value)}
                  className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.code} · {emp.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t.common.date}
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t.noveltiesScreen.category}
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) =>
                      setFormCategory(e.target.value as NoveltyCategory)
                    }
                    className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="EARNING">{t.noveltyCategories.EARNING}</option>
                    <option value="DEDUCTION">{t.noveltyCategories.DEDUCTION}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.noveltiesScreen.concept}
                </label>
                <select
                  value={formConcept}
                  onChange={(e) => {
                    const code = e.target.value as NoveltyConceptCode;
                    setFormConcept(code);
                    setFormCategory(CONCEPT_CATEGORY_DEFAULT[code]);
                  }}
                  className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  {(Object.keys(t.noveltyConcepts) as NoveltyConceptCode[]).map(
                    (code) => (
                      <option key={code} value={code}>
                        {t.noveltyConcepts[code]}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.common.amount}
                </label>
                <div className="flex items-center h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20">
                  <span className="px-2.5 h-full flex items-center bg-slate-100 dark:bg-slate-700 border-r border-slate-300 dark:border-slate-600 font-mono-num text-xs font-semibold text-slate-700 dark:text-slate-200">
                    RD$
                  </span>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    placeholder={t.noveltiesScreen.amountPlaceholder}
                    className="flex-1 h-full px-2.5 bg-transparent font-mono-num text-sm text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.noveltiesScreen.noteLabel}
                </label>
                <input
                  type="text"
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {formError && (
                <div className="text-xs font-medium text-red-600 dark:text-red-400">
                  {formError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-9 px-3.5 rounded border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isMutating}
                  className="h-9 px-4 rounded bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-xs font-semibold text-white"
                >
                  {t.common.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
