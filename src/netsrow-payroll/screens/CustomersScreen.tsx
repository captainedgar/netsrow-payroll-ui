import React, { useMemo, useState } from 'react';
import { Edit3, Plus, Search, X } from 'lucide-react';
import { DataTable, DataTableColumn } from '../components/DataTable';
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
  };

  const columns: DataTableColumn<Customer>[] = [
    {
      key: 'code',
      header: t.common.code,
      stickyLeft: true,
      render: (c) => (
        <span className="font-mono-num text-xs font-semibold text-emerald-700 dark:text-emerald-400">
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
          <div className="font-semibold text-slate-900 dark:text-slate-100">{c.name}</div>
          <div className="font-mono-num text-[11px] text-slate-500 dark:text-slate-400">
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
              : locale === 'es'
                ? 'Individual'
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
          className="inline-flex items-center gap-1 rounded border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          <Edit3 className="w-3 h-3" />
          <span>{t.common.edit}</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
              {t.navigation.customers}
            </h1>
            <StatusBadge label={t.topBar.demoOnlyTag} tone="amber" />
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {locale === 'es'
              ? 'Directorio de clientes, límites de crédito y saldo pendiente por cobrar.'
              : 'Customer directory, credit limits, and open accounts receivable balances.'}
          </p>
        </div>

        <button
          type="button"
          onClick={openNew}
          className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{locale === 'es' ? 'Nuevo cliente' : 'New customer'}</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              locale === 'es'
                ? 'Buscar por código, nombre o RNC/Cédula…'
                : 'Search by code, name, or tax ID…'
            }
            className="w-full h-9 pl-9 pr-3 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="inline-flex items-center gap-1 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 p-1">
          {(['ALL', 'CORPORATE', 'INDIVIDUAL'] as const).map((tp) => (
            <button
              key={tp}
              type="button"
              onClick={() => setTypeFilter(tp)}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors whitespace-nowrap ${
                typeFilter === tp
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
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
      </div>

      <DataTable
        columns={columns}
        rows={filtered}
        getRowKey={(c) => c.id}
        selectedRowKey={selectedId}
        onRowClick={(c) => setSelectedId(c.id)}
        emptyMessage={t.common.noResults}
      />

      {selectedCustomer && (
        <section className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <div>
              <h2 className="font-display text-sm sm:text-base font-bold">
                {selectedCustomer.name} · {selectedCustomer.code}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {selectedCustomer.email || '—'} · {selectedCustomer.phone || '—'}
              </p>
            </div>
            <div className="text-right">
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                {locale === 'es' ? 'Saldo actual' : 'Current balance'}
              </div>
              <MoneyCell amount={selectedCustomer.currentBalance} locale={locale} emphasize />
            </div>
          </div>

          <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {locale === 'es' ? 'Historial de ventas al cliente' : 'Customer sales history'} (
            {customerSales.length})
          </div>
          {customerSales.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {locale === 'es'
                ? 'Sin ventas registradas para este cliente.'
                : 'No recorded sales for this customer.'}
            </p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {customerSales.map((s) => (
                <div key={s.id} className="flex items-center justify-between py-2 text-xs">
                  <div>
                    <span className="font-mono-num font-semibold">{s.number}</span> ·{' '}
                    <span className="text-slate-500">{s.date}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MoneyCell amount={s.total} locale={locale} />
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSaleId(s.id);
                        setActiveScreen('sales_ar');
                      }}
                      className="text-emerald-700 dark:text-emerald-400 font-semibold hover:underline"
                    >
                      {t.common.viewDetails}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60">
          <div className="w-full max-w-md rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
              <h2 className="font-display text-base font-bold">
                {editing
                  ? locale === 'es'
                    ? 'Editar cliente'
                    : 'Edit customer'
                  : locale === 'es'
                    ? 'Nuevo cliente'
                    : 'New customer'}
              </h2>
              <button type="button" onClick={() => setModalOpen(false)} className="p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-4 space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">{t.common.code}</label>
                  <input
                    value={cCode}
                    onChange={(e) => setCCode(e.target.value)}
                    required
                    className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 text-sm font-mono-num"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold mb-1">
                    {locale === 'es' ? 'Razón social / Nombre' : 'Name'}
                  </label>
                  <input
                    value={cName}
                    onChange={(e) => setCName(e.target.value)}
                    required
                    className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">RNC / Cédula</label>
                  <input
                    value={cTaxId}
                    onChange={(e) => setCTaxId(e.target.value)}
                    className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 text-sm font-mono-num"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    {locale === 'es' ? 'Tipo' : 'Type'}
                  </label>
                  <select
                    value={cType}
                    onChange={(e) => setCType(e.target.value as 'INDIVIDUAL' | 'CORPORATE')}
                    className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 text-xs"
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
                  <label className="block text-xs font-semibold mb-1">Email</label>
                  <input
                    type="email"
                    value={cEmail}
                    onChange={(e) => setCEmail(e.target.value)}
                    className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    {locale === 'es' ? 'Teléfono' : 'Phone'}
                  </label>
                  <input
                    value={cPhone}
                    onChange={(e) => setCPhone(e.target.value)}
                    className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">
                  {locale === 'es' ? 'Límite de crédito RD$' : 'Credit limit RD$'}
                </label>
                <input
                  type="number"
                  min="0"
                  value={cCreditLimit}
                  onChange={(e) => setCCreditLimit(e.target.value)}
                  className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 text-sm font-mono-num"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="h-9 px-3.5 rounded border border-slate-300 dark:border-slate-700 text-xs font-semibold"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 rounded bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white"
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
