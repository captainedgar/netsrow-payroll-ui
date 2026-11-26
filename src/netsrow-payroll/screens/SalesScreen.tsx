import React, { useMemo, useState } from 'react';
import { FileCheck2, FileText, Plus } from 'lucide-react';
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
    setSelectedEcfId,
    setEcfDraftPrefill,
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

  const activeFilterCount = (query.trim() ? 1 : 0) + (methodFilter !== 'ALL' ? 1 : 0);

  const columns: DataTableColumn<SaleRecord>[] = [
    {
      key: 'number',
      header: locale === 'es' ? 'Nro. Venta' : 'Sale #',
      stickyLeft: true,
      render: (s) => {
        const linkedEcf = s.eInvoiceId
          ? erpState.eInvoicing.invoices.find((i) => i.id === s.eInvoiceId)
          : null;
        return (
          <div>
            <span className="font-mono-num text-xs font-semibold text-[var(--nr-primary)]">
              {s.number}
            </span>
            {linkedEcf && (
              <div className="font-mono-num text-[10px] font-semibold text-[var(--nr-text-secondary)]">
                {linkedEcf.eNcf}
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'date',
      header: t.common.date,
      render: (s) => (
        <span className="font-mono-num text-xs text-[var(--nr-text-secondary)]">{s.date}</span>
      ),
    },
    {
      key: 'customer',
      header: locale === 'es' ? 'Cliente' : 'Customer',
      minWidthClass: 'min-w-[180px]',
      render: (s) => (
        <span className="font-semibold text-xs text-[var(--nr-text)]">{s.customerName}</span>
      ),
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
          className="nr-focus-ring nr-transition inline-flex items-center gap-1 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] hover:border-[var(--nr-primary)] px-2.5 py-1 text-xs font-semibold text-[var(--nr-text)]"
        >
          <FileText className="w-3 h-3 text-[var(--nr-primary)]" />
          <span>{locale === 'es' ? 'Comprobante' : 'Receipt'}</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <ErpPageHeader
        title={t.navigation.salesAr}
        subtitle={
          locale === 'es'
            ? 'Historial de ventas del POS, detalle de artículos y emisión de comprobantes internos no fiscales.'
            : 'POS sales history, itemized detail, and internal non-fiscal receipt issuance.'
        }
        badge={<StatusBadge label={t.topBar.demoOnlyTag} tone="amber" />}
        actions={
          <button
            type="button"
            onClick={() => setActiveScreen('pos')}
            className="nr-focus-ring nr-transition inline-flex items-center gap-1.5 h-10 px-4 rounded-lg bg-[var(--nr-primary)] hover:bg-[var(--nr-primary-hover)] text-xs font-semibold text-[var(--nr-primary-fg)] whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{locale === 'es' ? 'Nueva venta POS' : 'New POS sale'}</span>
          </button>
        }
      />

      <ErpFilterBar
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder={
          locale === 'es' ? 'Buscar por número o cliente…' : 'Search by sale # or customer…'
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
          setMethodFilter('ALL');
        }}
      >
        <select
          aria-label={locale === 'es' ? 'Filtrar por método de pago' : 'Filter by payment method'}
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value)}
          className="nr-focus-ring nr-transition h-10 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-3 text-xs font-semibold text-[var(--nr-text)]"
        >
          <option value="ALL">{t.common.all}</option>
          <option value="CASH">{locale === 'es' ? 'Efectivo' : 'Cash'}</option>
          <option value="CARD">{locale === 'es' ? 'Tarjeta' : 'Card'}</option>
          <option value="TRANSFER">{locale === 'es' ? 'Transferencia' : 'Transfer'}</option>
          <option value="CREDIT">{locale === 'es' ? 'Crédito' : 'Credit'}</option>
        </select>
      </ErpFilterBar>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-7">
          {filteredSales.length === 0 ? (
            <ErpStatePanel
              variant="empty"
              title={t.common.noResults}
              description={
                locale === 'es'
                  ? 'No se encontraron ventas con los criterios actuales.'
                  : 'No sales match your active filters.'
              }
              actionLabel={activeFilterCount > 0 ? (locale === 'es' ? 'Limpiar filtros' : 'Clear filters') : undefined}
              onAction={
                activeFilterCount > 0
                  ? () => {
                      setQuery('');
                      setMethodFilter('ALL');
                    }
                  : undefined
              }
            />
          ) : (
            <DataTable
              columns={columns}
              rows={filteredSales}
              getRowKey={(s) => s.id}
              selectedRowKey={activeSale?.id ?? null}
              onRowClick={(s) => setSelectedSaleId(s.id)}
              emptyMessage={t.common.noResults}
            />
          )}
        </div>

        <div className="xl:col-span-5">
          <ErpSurfaceCard padding="md" className="space-y-4">
            {!activeSale ? (
              <ErpStatePanel
                variant="empty"
                title={locale === 'es' ? 'Sin venta seleccionada' : 'No sale selected'}
                description={
                  locale === 'es'
                    ? 'Selecciona una venta en la tabla para consultar el detalle y emitir su comprobante.'
                    : 'Select a sale from the list to inspect line items and print a receipt.'
                }
              />
            ) : (
              <>
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-[var(--nr-border)]">
                  <div className="min-w-0">
                    <div className="font-mono-num text-sm font-bold text-[var(--nr-primary)]">
                      {activeSale.number}
                    </div>
                    <div className="text-xs font-semibold text-[var(--nr-text)] mt-0.5 truncate">
                      {activeSale.customerName}
                    </div>
                    <div className="text-[11px] text-[var(--nr-text-secondary)] font-mono-num">
                      {activeSale.date} · {activeSale.cashierName}
                    </div>
                  </div>
                  <StatusBadge label={methodLabel(activeSale.paymentMethod)} tone="emerald" />
                </div>

                <div className="space-y-2">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--nr-text-secondary)]">
                    {locale === 'es' ? 'Artículos vendidos' : 'Sold items'}
                  </div>
                  <div className="divide-y divide-[var(--nr-border)] text-xs">
                    {activeSale.items.map((item, idx) => (
                      <div key={idx} className="py-2 flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="font-medium text-[var(--nr-text)] truncate">
                            {locale === 'es' ? item.nameEs : item.nameEn}
                          </div>
                          <div className="font-mono-num text-[11px] text-[var(--nr-text-secondary)]">
                            {item.sku} · {item.quantity} x RD${item.unitPrice.toFixed(2)}
                          </div>
                        </div>
                        <MoneyCell amount={item.lineTotal} locale={locale} />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] p-3 space-y-1.5 text-xs">
                  <div className="flex justify-between text-[var(--nr-text-secondary)]">
                    <span>Subtotal</span>
                    <MoneyCell amount={activeSale.subtotal} locale={locale} />
                  </div>
                  {activeSale.discountAmount > 0 && (
                    <div className="flex justify-between text-[var(--nr-warning)]">
                      <span>
                        {locale === 'es'
                          ? `Descuento (${activeSale.discountPercent}%)`
                          : `Discount (${activeSale.discountPercent}%)`}
                      </span>
                      <MoneyCell amount={-activeSale.discountAmount} locale={locale} />
                    </div>
                  )}
                  <div className="flex justify-between text-[var(--nr-text-secondary)]">
                    <span>ITBIS</span>
                    <MoneyCell amount={activeSale.taxAmount} locale={locale} />
                  </div>
                  <div className="flex justify-between pt-2 border-t border-[var(--nr-border)] font-bold text-sm text-[var(--nr-text)]">
                    <span>Total</span>
                    <MoneyCell amount={activeSale.total} locale={locale} size="lg" emphasize />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => openSaleReceiptDoc(activeSale.id)}
                    className="nr-focus-ring nr-transition h-10 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] hover:bg-[var(--nr-surface-muted)] text-xs font-semibold text-[var(--nr-text)] flex items-center justify-center gap-1.5 px-3"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span className="truncate">
                      {locale === 'es' ? 'Recibo no fiscal' : 'Non-fiscal receipt'}
                    </span>
                  </button>

                  {activeSale.eInvoiceId ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedEcfId(activeSale.eInvoiceId ?? null);
                        setActiveScreen('e_invoicing_docs');
                      }}
                      className="nr-focus-ring nr-transition h-10 rounded-lg bg-[var(--nr-primary)] hover:bg-[var(--nr-primary-hover)] text-xs font-semibold text-[var(--nr-primary-fg)] flex items-center justify-center gap-1.5 px-3"
                    >
                      <FileCheck2 className="w-3.5 h-3.5" />
                      <span className="truncate">
                        {locale === 'es' ? 'Ver e-CF DGII' : 'View DGII e-CF'}
                      </span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        const cust = erpState.customers.find(
                          (c) => c.id === activeSale.customerId
                        );
                        setEcfDraftPrefill({
                          ecfType: cust?.taxId ? '31' : '32',
                          saleId: activeSale.id,
                          buyerId: cust?.id,
                          buyerName: cust?.name ?? activeSale.customerName,
                          buyerRnc: cust?.taxId ?? '',
                          buyerType: cust?.type ?? 'INDIVIDUAL',
                          paymentMethod: activeSale.paymentMethod,
                          discountAmount: activeSale.discountAmount,
                          items: activeSale.items.map((it) => ({
                            productId: it.productId,
                            sku: it.sku,
                            descriptionEs: it.nameEs,
                            descriptionEn: it.nameEn,
                            unitCode: 'UND',
                            quantity: it.quantity,
                            unitPrice: it.unitPrice,
                            taxableItbis: it.taxableItbis,
                          })),
                        });
                        setActiveScreen('e_invoicing_issue');
                      }}
                      className="nr-focus-ring nr-transition h-10 rounded-lg bg-[var(--nr-primary)] hover:bg-[var(--nr-primary-hover)] text-xs font-semibold text-[var(--nr-primary-fg)] flex items-center justify-center gap-1.5 px-3"
                    >
                      <FileCheck2 className="w-3.5 h-3.5" />
                      <span className="truncate">
                        {locale === 'es' ? 'Emitir e-CF DGII' : 'Issue DGII e-CF'}
                      </span>
                    </button>
                  )}
                </div>
              </>
            )}
          </ErpSurfaceCard>
        </div>
      </div>
    </div>
  );
};

