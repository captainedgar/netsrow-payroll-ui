import React, { useMemo, useState } from 'react';
import { Edit3, Plus } from 'lucide-react';
import { DataTable, DataTableColumn } from '../components/DataTable';
import {
  ErpFilterBar,
  ErpModal,
  ErpPageHeader,
  ErpStatePanel,
  ErpSurfaceCard,
} from '../components/ErpUiPrimitives';
import { MoneyCell } from '../components/MoneyCell';
import { StatusBadge } from '../components/StatusBadge';
import { usePayrollWorkspace } from '../context/PayrollWorkspaceContext';
import { Customer } from '../types/erp';

export const CustomersScreen: React.FC = () => {
  const { erpState, locale, t, upsertCustomer, setActiveScreen, setSelectedSaleId } =
    usePayrollWorkspace();

  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'INDIVIDUAL' | 'CORPORATE'>('ALL');
  const [selectedId, setSelectedId] = useState<string | null>(
    erpState.customers[0]?.id ?? null
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [cCode, setCCode] = useState('');
  const [cName, setCName] = useState('');
  const [cTaxId, setCTaxId] = useState('');
  const [cEmail, setCEmail] = useState('');
  const [cPhone, setCPhone] = useState('');
  const [cType, setCType] = useState<'INDIVIDUAL' | 'CORPORATE'>('CORPORATE');
  const [cCreditLimit, setCCreditLimit] = useState('50000');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return erpState.customers.filter((c) => {
      if (typeFilter !== 'ALL' && c.type !== typeFilter) return false;
      if (!q) return true;
      return (
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.taxId.toLowerCase().includes(q)
      );
    });
  }, [erpState.customers, query, typeFilter]);

  const selectedCustomer = useMemo(
    () => erpState.customers.find((c) => c.id === selectedId) ?? null,
    [erpState.customers, selectedId]
  );

  const customerSales = useMemo(
    () =>
      selectedCustomer
        ? erpState.sales.filter((s) => s.customerId === selectedCustomer.id)
        : [],
    [erpState.sales, selectedCustomer]
  );

  const openNew = () => {
    setEditing(null);
    setCCode(`CLI-00${erpState.customers.length + 1}`);
    setCName('');
    setCTaxId('');
    setCEmail('');
    setCPhone('');
    setCType('CORPORATE');
    setCCreditLimit('50000');
    setModalOpen(true);
  };

  const openEdit = (c: Customer) => {
    setEditing(c);
    setCCode(c.code);
    setCName(c.name);
    setCTaxId(c.taxId);
    setCEmail(c.email);
    setCPhone(c.phone);
    setCType(c.type);
    setCCreditLimit(String(c.creditLimit));
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cCode.trim() || !cName.trim()) return;
    setIsSaving(true);
    try {
      const saved: Customer = {
        id: editing?.id ?? `cus-${Date.now()}`,
        code: cCode.trim(),
        name: cName.trim(),
        taxId: cTaxId.trim() || '000-0000000-0',
        email: cEmail.trim(),
        phone: cPhone.trim(),
        type: cType,
        creditLimit: Number(cCreditLimit) || 0,
        currentBalance: editing?.currentBalance ?? 0,
        active: editing?.active ?? true,
      };
      await upsertCustomer(saved);
      setSelectedId(saved.id);
      setModalOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  const activeFilterCount = (query.trim() ? 1 : 0) + (typeFilter !== 'ALL' ? 1 : 0);

  const columns: DataTableColumn<Customer>[] = [
    {
      key: 'code',
      header: t.common.code,
      stickyLeft: true,
      render: (c) => (
        <span className="font-mono-num text-xs font-semibold text-[var(--nr-primary)]">
          {c.code}
        </span>
      ),
    },
    {
      key: 'name',
      header: locale === 'es' ? 'Cliente' : 'Customer',
      minWidthClass: 'min-w-[200px]',
      render: (c) => (
        <div>
          <div className="font-semibold text-[var(--nr-text)]">{c.name}</div>
          <div className="font-mono-num text-[11px] text-[var(--nr-text-secondary)]">
            RNC/Cédula: {c.taxId}
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      header: locale === 'es' ? 'Tipo' : 'Type',
      render: (c) => (
        <StatusBadge
          label={
            c.type === 'CORPORATE'
              ? locale === 'es'
                ? 'Corporativo'
                : 'Corporate'
              : 'Individual'
          }
          tone={c.type === 'CORPORATE' ? 'navy' : 'neutral'}
        />
      ),
    },
    {
      key: 'limit',
      header: locale === 'es' ? 'Límite crédito' : 'Credit limit',
      align: 'right',
      render: (c) => <MoneyCell amount={c.creditLimit} locale={locale} />,
    },
    {
      key: 'balance',
      header: locale === 'es' ? 'Saldo CxC' : 'AR Balance',
      align: 'right',
      render: (c) => (
        <MoneyCell
          amount={c.currentBalance}
          locale={locale}
          emphasize={c.currentBalance > 0}
        />
      ),
    },
    {
      key: 'actions',
      header: t.common.actions,
      align: 'right',
      render: (c) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            openEdit(c);
          }}
          className="nr-focus-ring nr-transition inline-flex items-center gap-1 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] hover:border-[var(--nr-primary)] px-2.5 py-1 text-xs font-medium text-[var(--nr-text)]"
        >
          <Edit3 className="w-3 h-3" />
          <span>{t.common.edit}</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <ErpPageHeader
        title={t.navigation.customers}
        subtitle={
          locale === 'es'
            ? 'Directorio de clientes, límites de crédito y saldo pendiente por cobrar.'
            : 'Customer directory, credit limits, and open accounts receivable balances.'
        }
        badge={<StatusBadge label={t.topBar.demoOnlyTag} tone="amber" />}
        actions={
          <button
            type="button"
            onClick={openNew}
            className="nr-focus-ring nr-transition inline-flex items-center gap-1.5 h-10 px-4 rounded-lg bg-[var(--nr-primary)] hover:bg-[var(--nr-primary-hover)] text-xs font-semibold text-[var(--nr-primary-fg)] whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{locale === 'es' ? 'Nuevo cliente' : 'New customer'}</span>
          </button>
        }
      />

      <ErpFilterBar
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder={
          locale === 'es'
            ? 'Buscar por código, nombre o RNC/Cédula…'
            : 'Search by code, name, or tax ID…'
        }
        hasActiveFilters={activeFilterCount > 0}
        activeFilterCount={activeFilterCount}
        activeFilterLabel={
          locale === 'es'
            ? `${activeFilterCount} filtro${activeFilterCount > 1 ? 's' : ''}`
            : `${activeFilterCount} active`
        }
        clearLabel={locale === 'es' ? 'Limpiar' : 'Clear'}
        onClearFilters={() => {
          setQuery('');
          setTypeFilter('ALL');
        }}
      >
        <div className="inline-flex items-center gap-1 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-muted)] p-1">
          {(['ALL', 'CORPORATE', 'INDIVIDUAL'] as const).map((tp) => (
            <button
              key={tp}
              type="button"
              onClick={() => setTypeFilter(tp)}
              className={`nr-focus-ring nr-transition px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap ${
                typeFilter === tp
                  ? 'bg-[var(--nr-surface)] text-[var(--nr-text)] shadow-xs'
                  : 'text-[var(--nr-text-secondary)] hover:text-[var(--nr-text)]'
              }`}
            >
              {tp === 'ALL'
                ? t.common.all
                : tp === 'CORPORATE'
                  ? locale === 'es'
                    ? 'Corporativos'
                    : 'Corporate'
                  : locale === 'es'
                    ? 'Individuales'
                    : 'Individual'}
            </button>
          ))}
        </div>
      </ErpFilterBar>

      {filtered.length === 0 ? (
        <ErpStatePanel
          variant="empty"
          title={t.common.noResults}
          description={
            locale === 'es'
              ? 'No hay clientes que coincidan con tu búsqueda.'
              : 'No customers match your current filter.'
          }
          actionLabel={activeFilterCount > 0 ? (locale === 'es' ? 'Limpiar filtros' : 'Clear filters') : undefined}
          onAction={
            activeFilterCount > 0
              ? () => {
                  setQuery('');
                  setTypeFilter('ALL');
                }
              : undefined
          }
        />
      ) : (
        <DataTable
          columns={columns}
          rows={filtered}
          getRowKey={(c) => c.id}
          selectedRowKey={selectedId}
          onRowClick={(c) => setSelectedId(c.id)}
          emptyMessage={t.common.noResults}
        />
      )}

      {selectedCustomer && (
        <ErpSurfaceCard padding="md" className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--nr-border)] pb-3">
            <div>
              <h2 className="font-display text-sm sm:text-base font-bold text-[var(--nr-text)]">
                {selectedCustomer.name} ·{' '}
                <span className="font-mono-num text-[var(--nr-primary)]">
                  {selectedCustomer.code}
                </span>
              </h2>
              <p className="text-xs text-[var(--nr-text-secondary)]">
                {selectedCustomer.email || '—'} · {selectedCustomer.phone || '—'}
              </p>
            </div>
            <div className="text-right">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--nr-text-secondary)]">
                {locale === 'es' ? 'Saldo actual' : 'Current balance'}
              </div>
              <MoneyCell amount={selectedCustomer.currentBalance} locale={locale} emphasize />
            </div>
          </div>

          <div className="text-xs font-semibold text-[var(--nr-text)]">
            {locale === 'es' ? 'Historial de ventas al cliente' : 'Customer sales history'} (
            <span className="font-mono-num">{customerSales.length}</span>)
          </div>
          {customerSales.length === 0 ? (
            <p className="text-xs text-[var(--nr-text-secondary)]">
              {locale === 'es'
                ? 'Sin ventas registradas para este cliente.'
                : 'No recorded sales for this customer.'}
            </p>
          ) : (
            <div className="divide-y divide-[var(--nr-border)]">
              {customerSales.map((s) => (
                <div key={s.id} className="flex items-center justify-between py-2.5 text-xs">
                  <div>
                    <span className="font-mono-num font-semibold text-[var(--nr-text)]">
                      {s.number}
                    </span>{' '}
                    ·{' '}
                    <span className="font-mono-num text-[var(--nr-text-secondary)]">{s.date}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MoneyCell amount={s.total} locale={locale} />
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSaleId(s.id);
                        setActiveScreen('sales_ar');
                      }}
                      className="nr-focus-ring rounded text-[var(--nr-primary)] font-semibold hover:underline"
                    >
                      {t.common.viewDetails}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ErpSurfaceCard>
      )}

      <ErpModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          editing
            ? locale === 'es'
              ? 'Editar cliente'
              : 'Edit customer'
            : locale === 'es'
              ? 'Nuevo cliente'
              : 'New customer'
        }
        maxWidthClass="max-w-md"
        closeLabel={t.common.cancel}
      >
        <form onSubmit={handleSave} className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--nr-text)] mb-1">
                {t.common.code}
              </label>
              <input
                value={cCode}
                onChange={(e) => setCCode(e.target.value)}
                required
                className="nr-focus-ring w-full h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-2.5 text-sm font-mono-num text-[var(--nr-text)]"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-[var(--nr-text)] mb-1">
                {locale === 'es' ? 'Razón social / Nombre' : 'Name'}
              </label>
              <input
                value={cName}
                onChange={(e) => setCName(e.target.value)}
                required
                className="nr-focus-ring w-full h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-2.5 text-sm text-[var(--nr-text)]"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--nr-text)] mb-1">
                RNC / Cédula
              </label>
              <input
                value={cTaxId}
                onChange={(e) => setCTaxId(e.target.value)}
                className="nr-focus-ring w-full h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-2.5 text-sm font-mono-num text-[var(--nr-text)]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--nr-text)] mb-1">
                {locale === 'es' ? 'Tipo' : 'Type'}
              </label>
              <select
                value={cType}
                onChange={(e) => setCType(e.target.value as 'INDIVIDUAL' | 'CORPORATE')}
                className="nr-focus-ring w-full h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-2 text-xs text-[var(--nr-text)]"
              >
                <option value="CORPORATE">
                  {locale === 'es' ? 'Corporativo' : 'Corporate'}
                </option>
                <option value="INDIVIDUAL">Individual</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--nr-text)] mb-1">
                Email
              </label>
              <input
                type="email"
                value={cEmail}
                onChange={(e) => setCEmail(e.target.value)}
                className="nr-focus-ring w-full h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-2.5 text-sm text-[var(--nr-text)]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--nr-text)] mb-1">
                {locale === 'es' ? 'Teléfono' : 'Phone'}
              </label>
              <input
                value={cPhone}
                onChange={(e) => setCPhone(e.target.value)}
                className="nr-focus-ring w-full h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-2.5 text-sm text-[var(--nr-text)]"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--nr-text)] mb-1">
              {locale === 'es' ? 'Límite de crédito RD$' : 'Credit limit RD$'}
            </label>
            <input
              type="number"
              min="0"
              value={cCreditLimit}
              onChange={(e) => setCCreditLimit(e.target.value)}
              className="nr-focus-ring w-full h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-2.5 text-sm font-mono-num text-[var(--nr-text)]"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-[var(--nr-border)]">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="nr-focus-ring nr-transition h-9 px-3.5 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface)] text-xs font-semibold text-[var(--nr-text)] hover:bg-[var(--nr-surface-muted)]"
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="nr-focus-ring nr-transition h-9 px-4 rounded-lg bg-[var(--nr-primary)] hover:bg-[var(--nr-primary-hover)] text-xs font-semibold text-[var(--nr-primary-fg)] disabled:opacity-50"
            >
              {t.common.save}
            </button>
          </div>
        </form>
      </ErpModal>
    </div>
  );
};
