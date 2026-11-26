import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Edit3,
  Info,
  Lock,
  Plus,
  Trash2,
} from 'lucide-react';
import { DataTable, DataTableColumn } from '../components/DataTable';
import {
  ErpFilterBar,
  ErpModal,
  ErpPageHeader,
} from '../components/ErpUiPrimitives';
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
            <div className="font-semibold text-[var(--nr-text)]">
              {emp?.fullName ?? nov.employeeId}
            </div>
            <div className="font-mono-num text-[11px] text-[var(--nr-text-secondary)]">
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
        <span className="font-mono-num text-xs text-[var(--nr-text-secondary)] whitespace-nowrap">
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
          <div className="font-medium text-[var(--nr-text)]">
            {t.noveltyConcepts[nov.conceptCode]}
          </div>
          <div className="text-[11px] text-[var(--nr-text-secondary)] truncate max-w-[240px]">
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
                  className="nr-focus-ring nr-transition p-1.5 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface)] text-[var(--nr-text-secondary)] hover:text-[var(--nr-text)] hover:border-[var(--nr-primary)]"
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
                  className="nr-focus-ring nr-transition p-1.5 rounded-lg border border-[var(--nr-error-border)] bg-[var(--nr-error-bg)] text-[var(--nr-error)] hover:opacity-90"
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

  const activeFilterCount =
    (filterText.trim().length > 0 ? 1 : 0) + (categoryFilter !== 'ALL' ? 1 : 0);

  return (
    <div className="space-y-5">
      <ErpPageHeader
        title={t.noveltiesScreen.title}
        subtitle={t.noveltiesScreen.subtitle}
        badge={
          activePeriod ? (
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
          ) : undefined
        }
        actions={
          <>
            <button
              type="button"
              onClick={() => setActiveScreen('payroll_review')}
              className="nr-focus-ring nr-transition inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface)] text-xs font-semibold text-[var(--nr-text)] hover:border-[var(--nr-primary)] hover:bg-[var(--nr-surface-muted)] whitespace-nowrap"
            >
              <span>{t.noveltiesScreen.goToReviewCta}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            {canEdit && (
              <button
                type="button"
                onClick={openCreateModal}
                className="nr-focus-ring nr-transition inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-[var(--nr-primary)] hover:bg-[var(--nr-primary-hover)] text-xs font-semibold text-[var(--nr-primary-fg)] whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>{t.noveltiesScreen.addNovelty}</span>
              </button>
            )}
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-[var(--nr-text-secondary)]">
          {t.noveltiesScreen.periodSelectorLabel}:
        </span>
        {periods.map((p) => {
          const selected = p.id === activePeriodId;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => selectPeriod(p.id, false)}
              className={`nr-focus-ring nr-transition px-3 py-1.5 rounded-lg border text-xs font-semibold whitespace-nowrap ${
                selected
                  ? 'bg-[var(--nr-primary)] text-[var(--nr-primary-fg)] border-[var(--nr-primary)]'
                  : 'bg-[var(--nr-surface)] text-[var(--nr-text)] border-[var(--nr-border)] hover:border-[var(--nr-primary)]'
              }`}
            >
              {locale === 'es' ? p.nameEs : p.nameEn} · {t.statuses[p.status]}
            </button>
          );
        })}
      </div>

      {activePeriod && (
        <div
          className={`flex items-start gap-2.5 rounded-xl border p-3.5 text-xs ${
            activePeriod.status === 'DRAFT'
              ? 'bg-[var(--nr-success-bg)] border-[var(--nr-success-border)] text-[var(--nr-success)]'
              : activePeriod.status === 'IN_REVIEW'
                ? 'bg-[var(--nr-warning-bg)] border-[var(--nr-warning-border)] text-[var(--nr-warning)]'
                : 'bg-[var(--nr-surface-muted)] border-[var(--nr-border)] text-[var(--nr-text)]'
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

      <ErpFilterBar
        searchValue={filterText}
        onSearchChange={setFilterText}
        searchPlaceholder={t.noveltiesScreen.filterEmployeeOrConcept}
        hasActiveFilters={activeFilterCount > 0}
        onClearFilters={() => {
          setFilterText('');
          setCategoryFilter('ALL');
        }}
        clearLabel={locale === 'es' ? 'Limpiar filtros' : 'Clear filters'}
        activeFilterCount={activeFilterCount}
      >
        <div className="inline-flex items-center gap-1 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-muted)] p-1">
          {(['ALL', 'EARNING', 'DEDUCTION'] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`nr-focus-ring nr-transition px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap ${
                categoryFilter === cat
                  ? 'bg-[var(--nr-surface)] text-[var(--nr-text)] border border-[var(--nr-border)] shadow-xs'
                  : 'text-[var(--nr-text-secondary)] hover:text-[var(--nr-text)]'
              }`}
            >
              {cat === 'ALL' ? t.common.all : t.noveltyCategories[cat]}
            </button>
          ))}
        </div>
      </ErpFilterBar>

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
                  <div className="font-mono-num text-[11px] font-semibold text-[var(--nr-primary)]">
                    {emp?.code ?? '—'}
                  </div>
                  <div className="font-semibold text-sm text-[var(--nr-text)]">
                    {emp?.fullName ?? nov.employeeId}
                  </div>
                  <div className="text-xs text-[var(--nr-text-secondary)]">
                    {t.noveltyConcepts[nov.conceptCode]}
                  </div>
                </div>
                <StatusBadge
                  label={t.noveltyCategories[nov.category]}
                  tone={nov.category === 'EARNING' ? 'emerald' : 'amber'}
                  icon={nov.category === 'EARNING' ? 'approved' : 'warning'}
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[var(--nr-border)]">
                <span className="font-mono-num text-xs text-[var(--nr-text-secondary)]">
                  {formatDateLocalized(nov.date, locale)}
                </span>
                <MoneyCell
                  amount={nov.amount}
                  locale={locale}
                  emphasize={nov.category === 'EARNING'}
                />
              </div>

              {canEdit && (
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--nr-border)]">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(nov);
                    }}
                    className="nr-focus-ring nr-transition inline-flex items-center gap-1 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface)] px-2.5 py-1 text-xs font-medium text-[var(--nr-text)]"
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
                    className="nr-focus-ring nr-transition inline-flex items-center gap-1 rounded-lg border border-[var(--nr-error-border)] bg-[var(--nr-error-bg)] px-2.5 py-1 text-xs font-medium text-[var(--nr-error)]"
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

      <ErpModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          editingNovelty
            ? t.noveltiesScreen.editNovelty
            : t.noveltiesScreen.addNovelty
        }
        maxWidthClass="max-w-md"
        closeLabel={t.common.close}
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              disabled={isMutating}
              className="nr-focus-ring nr-transition h-9 px-3.5 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface)] text-xs font-semibold text-[var(--nr-text)] hover:bg-[var(--nr-surface-muted)]"
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              form="nr-novelty-form"
              disabled={isMutating}
              className="nr-focus-ring nr-transition h-9 px-4 rounded-lg bg-[var(--nr-primary)] hover:bg-[var(--nr-primary-hover)] disabled:opacity-50 text-xs font-semibold text-[var(--nr-primary-fg)]"
            >
              {t.common.save}
            </button>
          </>
        }
      >
        <form id="nr-novelty-form" onSubmit={handleSubmitForm} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-[var(--nr-text)] mb-1">
              {t.common.employee}
            </label>
            <select
              value={formEmployeeId}
              onChange={(e) => setFormEmployeeId(e.target.value)}
              className="nr-focus-ring nr-transition w-full h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-2.5 text-sm text-[var(--nr-text)]"
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
              <label className="block text-xs font-semibold text-[var(--nr-text)] mb-1">
                {t.common.date}
              </label>
              <input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="nr-focus-ring nr-transition w-full h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-2.5 text-sm text-[var(--nr-text)]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--nr-text)] mb-1">
                {t.noveltiesScreen.category}
              </label>
              <select
                value={formCategory}
                onChange={(e) =>
                  setFormCategory(e.target.value as NoveltyCategory)
                }
                className="nr-focus-ring nr-transition w-full h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-2.5 text-sm text-[var(--nr-text)]"
              >
                <option value="EARNING">{t.noveltyCategories.EARNING}</option>
                <option value="DEDUCTION">{t.noveltyCategories.DEDUCTION}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--nr-text)] mb-1">
              {t.noveltiesScreen.concept}
            </label>
            <select
              value={formConcept}
              onChange={(e) => {
                const code = e.target.value as NoveltyConceptCode;
                setFormConcept(code);
                setFormCategory(CONCEPT_CATEGORY_DEFAULT[code]);
              }}
              className="nr-focus-ring nr-transition w-full h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-2.5 text-sm text-[var(--nr-text)]"
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
            <label className="block text-xs font-semibold text-[var(--nr-text)] mb-1">
              {t.common.amount}
            </label>
            <div className="flex items-center h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] overflow-hidden focus-within:border-[var(--nr-primary)] focus-within:ring-2 focus-within:ring-[var(--nr-primary)]/20">
              <span className="px-2.5 h-full flex items-center bg-[var(--nr-surface-muted)] border-r border-[var(--nr-border)] font-mono-num text-xs font-semibold text-[var(--nr-text)]">
                RD$
              </span>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={formAmount}
                onChange={(e) => setFormAmount(e.target.value)}
                placeholder={t.noveltiesScreen.amountPlaceholder}
                className="flex-1 h-full px-2.5 bg-transparent font-mono-num text-sm text-[var(--nr-text)] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--nr-text)] mb-1">
              {t.noveltiesScreen.noteLabel}
            </label>
            <input
              type="text"
              value={formNote}
              onChange={(e) => setFormNote(e.target.value)}
              className="nr-focus-ring nr-transition w-full h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-2.5 text-sm text-[var(--nr-text)]"
            />
          </div>

          {formError && (
            <div className="text-xs font-medium text-[var(--nr-error)]">
              {formError}
            </div>
          )}
        </form>
      </ErpModal>
    </div>
  );
};
