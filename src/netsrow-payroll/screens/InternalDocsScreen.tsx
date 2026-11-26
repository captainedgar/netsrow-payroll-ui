import React, { useMemo, useState } from 'react';
import { Printer } from 'lucide-react';
import { DataTable, DataTableColumn } from '../components/DataTable';
import {
  ErpFilterBar,
  ErpPageHeader,
  ErpStatePanel,
  ErpSurfaceCard,
} from '../components/ErpUiPrimitives';
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

  const activeFilterCount = (query.trim() ? 1 : 0) + (typeFilter !== 'ALL' ? 1 : 0);

  const columns: DataTableColumn<InternalDocument>[] = [
    {
      key: 'number',
      header: locale === 'es' ? 'Número' : 'Doc #',
      stickyLeft: true,
      render: (d) => (
        <span className="font-mono-num text-xs font-semibold text-[var(--nr-primary)]">
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
          <div className="font-semibold text-xs text-[var(--nr-text)]">
            {locale === 'es' ? d.titleEs : d.titleEn}
          </div>
          <div className="text-[11px] text-[var(--nr-text-secondary)]">
            {d.counterparty} · <span className="font-mono-num">{d.date}</span>
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
      <ErpPageHeader
        title={t.navigation.internalDocs}
        subtitle={
          locale === 'es'
            ? 'Archivo de comprobantes internos no fiscales emitidos desde POS, ajustes de inventario y cierres de caja.'
            : 'Repository of non-fiscal internal receipts issued from POS sales, stock adjustments, and cashbox closings.'
        }
        badge={<StatusBadge label={t.topBar.demoOnlyTag} tone="amber" />}
      />

      <ErpFilterBar
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder={
          locale === 'es' ? 'Buscar comprobante o referencia…' : 'Search doc # or ref…'
        }
        hasActiveFilters={activeFilterCount > 0}
        activeFilterCount={activeFilterCount}
        clearLabel={locale === 'es' ? 'Limpiar' : 'Clear'}
        onClearFilters={() => {
          setQuery('');
          setTypeFilter('ALL');
        }}
      >
        <select
          aria-label={locale === 'es' ? 'Filtrar por tipo de documento' : 'Filter by document type'}
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="nr-focus-ring nr-transition h-10 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-3 text-xs font-semibold text-[var(--nr-text)]"
        >
          <option value="ALL">{t.common.all}</option>
          <option value="NON_FISCAL_RECEIPT">NON_FISCAL_RECEIPT</option>
          <option value="CASH_CLOSING">CASH_CLOSING</option>
          <option value="STOCK_ADJUSTMENT">STOCK_ADJUSTMENT</option>
        </select>
      </ErpFilterBar>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-7">
          {filteredDocs.length === 0 ? (
            <ErpStatePanel
              variant="empty"
              title={t.common.noResults}
              actionLabel={
                activeFilterCount > 0
                  ? locale === 'es'
                    ? 'Limpiar filtros'
                    : 'Clear filters'
                  : undefined
              }
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
              rows={filteredDocs}
              getRowKey={(d) => d.id}
              selectedRowKey={activeDoc?.id ?? null}
              onRowClick={(d) => setSelectedDocumentId(d.id)}
              emptyMessage={t.common.noResults}
            />
          )}
        </div>

        <div className="xl:col-span-5">
          {activeDoc ? (
            <ErpSurfaceCard padding="md" className="space-y-4">
              <div className="rounded-lg border border-[var(--nr-warning-border)] bg-[var(--nr-warning-bg)] px-3 py-2 text-[11px] font-bold text-[var(--nr-warning)] text-center">
                {locale === 'es'
                  ? activeDoc.nonFiscalNoticeEs
                  : activeDoc.nonFiscalNoticeEn}
              </div>

              <div className="text-center border-b border-dashed border-[var(--nr-border)] pb-3">
                <div className="font-display text-sm font-bold text-[var(--nr-text)]">
                  {erpState.company.name}
                </div>
                <div className="font-mono-num text-[11px] text-[var(--nr-text-secondary)]">
                  RNC {erpState.company.rnc}
                </div>
                <div className="mt-2 font-mono-num text-sm font-bold text-[var(--nr-primary)]">
                  {activeDoc.number}
                </div>
                <div className="text-xs text-[var(--nr-text)]">
                  {locale === 'es' ? activeDoc.titleEs : activeDoc.titleEn}
                </div>
                <div className="text-[11px] text-[var(--nr-text-secondary)] font-mono-num mt-0.5">
                  {activeDoc.date} · Ref: {activeDoc.referenceCode}
                </div>
              </div>

              <div className="text-xs space-y-1.5">
                <div className="flex justify-between text-[var(--nr-text-secondary)]">
                  <span>{locale === 'es' ? 'Contraparte:' : 'Party:'}</span>
                  <span className="font-semibold text-[var(--nr-text)]">
                    {activeDoc.counterparty}
                  </span>
                </div>
                <div className="pt-2 border-t border-[var(--nr-border)] space-y-1.5">
                  {activeDoc.lines.map((line, i) => (
                    <div key={i} className="flex justify-between gap-2">
                      <span className="text-[var(--nr-text-secondary)]">{line.label}</span>
                      <MoneyCell amount={line.amount} locale={locale} />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between pt-2 border-t border-[var(--nr-border)] font-bold text-sm text-[var(--nr-text)]">
                  <span>{locale === 'es' ? 'Total documento' : 'Document total'}</span>
                  <MoneyCell amount={activeDoc.amount} locale={locale} size="lg" emphasize />
                </div>
              </div>

              <div className="text-[11px] text-center text-[var(--nr-text-secondary)] pt-2 border-t border-dashed border-[var(--nr-border)]">
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
                className="nr-focus-ring nr-transition w-full h-10 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] hover:border-[var(--nr-primary)] text-xs font-semibold text-[var(--nr-text)] flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>
                  {locale === 'es' ? 'Imprimir comprobante interno' : 'Print internal receipt'}
                </span>
              </button>
            </ErpSurfaceCard>
          ) : (
            <ErpStatePanel variant="empty" title={t.common.noResults} />
          )}
        </div>
      </div>
    </div>
  );
};

