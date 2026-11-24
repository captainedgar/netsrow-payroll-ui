import React, { useMemo, useState } from 'react';
import { FileText, Plus, Search } from 'lucide-react';
import { DataTable, DataTableColumn } from '../components/DataTable';
import { MoneyCell } from '../components/MoneyCell';
import { StatusBadge } from '../components/StatusBadge';
import { usePayrollWorkspace } from '../context/PayrollWorkspaceContext';
import { SaleRecord } from '../types/erp';

export const SalesScreen: React.FC = () => {
  const {
    erpState,
    locale,
    t,
    selectedSaleId,
    setSelectedSaleId,
    openSaleReceiptDoc,
    setActiveScreen,
  } = usePayrollWorkspace();

  const [query, setQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState('ALL');

  const filteredSales = useMemo(() => {
    const q = query.trim().toLowerCase();
    return erpState.sales.filter((s) => {
      if (methodFilter !== 'ALL' && s.paymentMethod !== methodFilter) return false;
      if (!q) return true;
      return (
        s.number.toLowerCase().includes(q) ||
        s.customerName.toLowerCase().includes(q)
      );
    });
  }, [erpState.sales, query, methodFilter]);

  const activeSale = useMemo(
    () =>
      erpState.sales.find((s) => s.id === selectedSaleId) ??
      filteredSales[0] ??
      null,
    [erpState.sales, selectedSaleId, filteredSales]
  );

  const methodLabel = (m: SaleRecord['paymentMethod']) => {
    const map: Record<SaleRecord['paymentMethod'], { es: string; en: string }> = {
      CASH: { es: 'Efectivo', en: 'Cash' },
      CARD: { es: 'Tarjeta', en: 'Card' },
      TRANSFER: { es: 'Transferencia', en: 'Transfer' },
      CREDIT: { es: 'Crédito CxC', en: 'Credit AR' },
    };
    return locale === 'es' ? map[m].es : map[m].en;
  };

  const columns: DataTableColumn<SaleRecord>[] = [
    {
      key: 'number',
      header: locale === 'es' ? 'Nro. Venta' : 'Sale #',
      stickyLeft: true,
      render: (s) => (
        <span className="font-mono-num text-xs font-semibold text-emerald-700 dark:text-emerald-400">
          {s.number}
        </span>
      ),
    },
    {
      key: 'date',
      header: t.common.date,
      render: (s) => <span className="font-mono-num text-xs">{s.date}</span>,
    },
    {
      key: 'customer',
      header: locale === 'es' ? 'Cliente' : 'Customer',
      minWidthClass: 'min-w-[180px]',
      render: (s) => <span className="font-semibold text-xs">{s.customerName}</span>,
    },
    {
      key: 'method',
      header: locale === 'es' ? 'Pago' : 'Method',
      render: (s) => (
        <StatusBadge
          label={methodLabel(s.paymentMethod)}
          tone={s.paymentMethod === 'CREDIT' ? 'amber' : 'neutral'}
        />
      ),
    },
    {
      key: 'total',
      header: 'Total',
      align: 'right',
      render: (s) => <MoneyCell amount={s.total} locale={locale} emphasize />,
    },
    {
      key: 'doc',
      header: t.common.actions,
      align: 'right',
      render: (s) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            openSaleReceiptDoc(s.id);
          }}
          className="inline-flex items-center gap-1 rounded border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          <FileText className="w-3 h-3 text-emerald-600" />
          <span>{locale === 'es' ? 'Comprobante' : 'Receipt'}</span>
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
              {t.navigation.salesAr}
            </h1>
            <StatusBadge label={t.topBar.demoOnlyTag} tone="amber" />
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {locale === 'es'
              ? 'Historial de ventas del POS, detalle de artículos y emisión de comprobantes internos no fiscales.'
              : 'POS sales history, itemized detail, and internal non-fiscal receipt issuance.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setActiveScreen('pos')}
          className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{locale === 'es' ? 'Nueva venta POS' : 'New POS sale'}</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              locale === 'es' ? 'Buscar por número o cliente…' : 'Search by sale # or customer…'
            }
            className="w-full h-9 pl-9 pr-3 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
          />
        </div>
        <select
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value)}
          className="h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs font-semibold"
        >
          <option value="ALL">{t.common.all}</option>
          <option value="CASH">{locale === 'es' ? 'Efectivo' : 'Cash'}</option>
          <option value="CARD">{locale === 'es' ? 'Tarjeta' : 'Card'}</option>
          <option value="TRANSFER">{locale === 'es' ? 'Transferencia' : 'Transfer'}</option>
          <option value="CREDIT">{locale === 'es' ? 'Crédito' : 'Credit'}</option>
        </select>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-7">
          <DataTable
            columns={columns}
            rows={filteredSales}
            getRowKey={(s) => s.id}
            selectedRowKey={activeSale?.id ?? null}
            onRowClick={(s) => setSelectedSaleId(s.id)}
            emptyMessage={t.common.noResults}
          />
        </div>

        <div className="xl:col-span-5">
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-4">
            {!activeSale ? (
              <p className="text-xs text-slate-500">
                {locale === 'es' ? 'Selecciona una venta para ver el detalle.' : 'Select a sale.'}
              </p>
            ) : (
              <>
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <div className="font-mono-num text-sm font-bold text-emerald-700 dark:text-emerald-400">
                      {activeSale.number}
                    </div>
                    <div className="text-xs font-semibold mt-0.5">{activeSale.customerName}</div>
                    <div className="text-[11px] text-slate-500 font-mono-num">
                      {activeSale.date} · {activeSale.cashierName}
                    </div>
                  </div>
                  <StatusBadge label={methodLabel(activeSale.paymentMethod)} tone="emerald" />
                </div>

                <div className="space-y-2">
                  <div className="text-[11px] font-semibold uppercase text-slate-500">
                    {locale === 'es' ? 'Artículos vendidos' : 'Sold items'}
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {activeSale.items.map((item, idx) => (
                      <div key={idx} className="py-2 flex items-center justify-between gap-2">
                        <div>
                          <div className="font-medium">
                            {locale === 'es' ? item.nameEs : item.nameEn}
                          </div>
                          <div className="font-mono-num text-[11px] text-slate-500">
                            {item.sku} · {item.quantity} x RD${item.unitPrice.toFixed(2)}
                          </div>
                        </div>
                        <MoneyCell amount={item.lineTotal} locale={locale} />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-3 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <MoneyCell amount={activeSale.subtotal} locale={locale} />
                  </div>
                  {activeSale.discountAmount > 0 && (
                    <div className="flex justify-between text-amber-700 dark:text-amber-300">
                      <span>
                        {locale === 'es'
                          ? `Descuento (${activeSale.discountPercent}%)`
                          : `Discount (${activeSale.discountPercent}%)`}
                      </span>
                      <MoneyCell amount={-activeSale.discountAmount} locale={locale} />
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>ITBIS</span>
                    <MoneyCell amount={activeSale.taxAmount} locale={locale} />
                  </div>
                  <div className="flex justify-between pt-1.5 border-t border-slate-200 dark:border-slate-700 font-bold text-sm">
                    <span>Total</span>
                    <MoneyCell amount={activeSale.total} locale={locale} size="lg" emphasize />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => openSaleReceiptDoc(activeSale.id)}
                  className="w-full h-9 rounded bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white flex items-center justify-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>
                    {locale === 'es'
                      ? 'Emitir / Ver comprobante interno no fiscal'
                      : 'Issue / View internal non-fiscal receipt'}
                  </span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
