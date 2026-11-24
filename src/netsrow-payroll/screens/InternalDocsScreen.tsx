import React, { useMemo, useState } from 'react';
import { FileText, Printer, Search } from 'lucide-react';
import { DataTable, DataTableColumn } from '../components/DataTable';
import { MoneyCell } from '../components/MoneyCell';
import { StatusBadge } from '../components/StatusBadge';
import { usePayrollWorkspace } from '../context/PayrollWorkspaceContext';
import { InternalDocument } from '../types/erp';

export const InternalDocsScreen: React.FC = () => {
  const {
    erpState,
    locale,
    t,
    selectedDocumentId,
    setSelectedDocumentId,
    notifySuccess,
  } = usePayrollWorkspace();

  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  const filteredDocs = useMemo(() => {
    const q = query.trim().toLowerCase();
    return erpState.internalDocs.filter((d) => {
      if (typeFilter !== 'ALL' && d.type !== typeFilter) return false;
      if (!q) return true;
      return (
        d.number.toLowerCase().includes(q) ||
        d.referenceCode.toLowerCase().includes(q) ||
        d.counterparty.toLowerCase().includes(q)
      );
    });
  }, [erpState.internalDocs, query, typeFilter]);

  const activeDoc = useMemo(
    () =>
      erpState.internalDocs.find((d) => d.id === selectedDocumentId) ??
      filteredDocs[0] ??
      null,
    [erpState.internalDocs, selectedDocumentId, filteredDocs]
  );

  const columns: DataTableColumn<InternalDocument>[] = [
    {
      key: 'number',
      header: locale === 'es' ? 'Número' : 'Doc #',
      stickyLeft: true,
      render: (d) => (
        <span className="font-mono-num text-xs font-semibold text-emerald-700 dark:text-emerald-400">
          {d.number}
        </span>
      ),
    },
    {
      key: 'title',
      header: locale === 'es' ? 'Documento' : 'Document',
      minWidthClass: 'min-w-[200px]',
      render: (d) => (
        <div>
          <div className="font-semibold text-xs">
            {locale === 'es' ? d.titleEs : d.titleEn}
          </div>
          <div className="text-[11px] text-slate-500">
            {d.counterparty} · {d.date}
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      header: locale === 'es' ? 'Tipo' : 'Type',
      render: (d) => <StatusBadge label={d.type} tone="neutral" />,
    },
    {
      key: 'amount',
      header: locale === 'es' ? 'Importe' : 'Amount',
      align: 'right',
      render: (d) => <MoneyCell amount={d.amount} locale={locale} emphasize />,
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
            {t.navigation.internalDocs}
          </h1>
          <StatusBadge label={t.topBar.demoOnlyTag} tone="amber" />
        </div>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          {locale === 'es'
            ? 'Archivo de comprobantes internos no fiscales emitidos desde POS, ajustes de inventario y cierres de caja.'
            : 'Repository of non-fiscal internal receipts issued from POS sales, stock adjustments, and cashbox closings.'}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              locale === 'es' ? 'Buscar comprobante o referencia…' : 'Search doc # or ref…'
            }
            className="w-full h-9 pl-9 pr-3 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs font-semibold"
        >
          <option value="ALL">{t.common.all}</option>
          <option value="NON_FISCAL_RECEIPT">NON_FISCAL_RECEIPT</option>
          <option value="CASH_CLOSING">CASH_CLOSING</option>
          <option value="STOCK_ADJUSTMENT">STOCK_ADJUSTMENT</option>
        </select>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-7">
          <DataTable
            columns={columns}
            rows={filteredDocs}
            getRowKey={(d) => d.id}
            selectedRowKey={activeDoc?.id ?? null}
            onRowClick={(d) => setSelectedDocumentId(d.id)}
            emptyMessage={t.common.noResults}
          />
        </div>

        <div className="xl:col-span-5">
          {activeDoc ? (
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
              <div className="rounded border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 px-3 py-2 text-[11px] font-bold text-amber-900 dark:text-amber-200 text-center">
                {locale === 'es'
                  ? activeDoc.nonFiscalNoticeEs
                  : activeDoc.nonFiscalNoticeEn}
              </div>

              <div className="text-center border-b border-dashed border-slate-300 dark:border-slate-700 pb-3">
                <div className="font-display text-sm font-bold">{erpState.company.name}</div>
                <div className="font-mono-num text-[11px] text-slate-500">
                  RNC {erpState.company.rnc}
                </div>
                <div className="mt-2 font-mono-num text-sm font-bold text-emerald-700 dark:text-emerald-400">
                  {activeDoc.number}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300">
                  {locale === 'es' ? activeDoc.titleEs : activeDoc.titleEn}
                </div>
                <div className="text-[11px] text-slate-500 font-mono-num mt-0.5">
                  {activeDoc.date} · Ref: {activeDoc.referenceCode}
                </div>
              </div>

              <div className="text-xs space-y-1.5">
                <div className="flex justify-between text-slate-500">
                  <span>{locale === 'es' ? 'Contraparte:' : 'Party:'}</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {activeDoc.counterparty}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                  {activeDoc.lines.map((line, i) => (
                    <div key={i} className="flex justify-between gap-2">
                      <span className="text-slate-700 dark:text-slate-300">{line.label}</span>
                      <MoneyCell amount={line.amount} locale={locale} />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700 font-bold text-sm">
                  <span>{locale === 'es' ? 'Total documento' : 'Document total'}</span>
                  <MoneyCell amount={activeDoc.amount} locale={locale} size="lg" emphasize />
                </div>
              </div>

              <div className="text-[11px] text-center text-slate-500 pt-2 border-t border-dashed border-slate-200 dark:border-slate-700">
                {locale === 'es'
                  ? erpState.business.receiptFooterEs
                  : erpState.business.receiptFooterEn}
              </div>

              <button
                type="button"
                onClick={() =>
                  notifySuccess(
                    locale === 'es'
                      ? `Comprobante ${activeDoc.number} preparado para impresión interna (Solo demo).`
                      : `Receipt ${activeDoc.number} prepared for internal print (Demo only).`
                  )
                }
                className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>
                  {locale === 'es' ? 'Imprimir comprobante interno' : 'Print internal receipt'}
                </span>
              </button>
            </div>
          ) : (
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-center text-xs text-slate-500">
              <FileText className="w-6 h-6 mx-auto mb-2 text-slate-400" />
              {t.common.noResults}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
