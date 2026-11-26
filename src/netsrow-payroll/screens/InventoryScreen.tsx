import React, { useMemo, useState } from 'react';
import { AlertTriangle, Plus } from 'lucide-react';
import { DataTable, DataTableColumn } from '../components/DataTable';
import {
  ErpFilterBar,
  ErpModal,
  ErpPageHeader,
  ErpStatePanel,
} from '../components/ErpUiPrimitives';
import { MoneyCell } from '../components/MoneyCell';
import { StatusBadge } from '../components/StatusBadge';
import { usePayrollWorkspace } from '../context/PayrollWorkspaceContext';
import { CatalogProduct, InventoryMovement } from '../types/erp';

type InventoryTab = 'stock' | 'alerts' | 'movements';

export const InventoryScreen: React.FC = () => {
  const {
    activeScreen,
    setActiveScreen,
    erpState,
    activeBranch,
    locale,
    t,
    registerInventoryAdjustment,
  } = usePayrollWorkspace();

  const activeTab: InventoryTab = useMemo(() => {
    if (activeScreen === 'inventory_alerts') return 'alerts';
    if (activeScreen === 'inventory_movements') return 'movements';
    return 'stock';
  }, [activeScreen]);

  const setTab = (tab: InventoryTab) => {
    const map: Record<InventoryTab, typeof activeScreen> = {
      stock: 'inventory_stock',
      alerts: 'inventory_alerts',
      movements: 'inventory_movements',
    };
    setActiveScreen(map[tab]);
  };

  const [query, setQuery] = useState('');
  const [adjOpen, setAdjOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adjProductId, setAdjProductId] = useState(erpState.products[0]?.id ?? '');
  const [adjDirection, setAdjDirection] = useState<'IN' | 'OUT'>('IN');
  const [adjQuantity, setAdjQuantity] = useState('5');
  const [adjReason, setAdjReason] = useState('');

  const productMap = useMemo(
    () => new Map(erpState.products.map((p) => [p.id, p])),
    [erpState.products]
  );

  const lowStock = useMemo(
    () => erpState.products.filter((p) => p.stock <= p.minStock),
    [erpState.products]
  );

  const filteredProducts = useMemo(() => {
    const source = activeTab === 'alerts' ? lowStock : erpState.products;
    const q = query.trim().toLowerCase();
    if (!q) return source;
    return source.filter(
      (p) =>
        p.sku.toLowerCase().includes(q) ||
        p.nameEs.toLowerCase().includes(q) ||
        p.nameEn.toLowerCase().includes(q)
    );
  }, [activeTab, lowStock, erpState.products, query]);

  const openAdjustFor = (productId?: string) => {
    setAdjProductId(productId || erpState.products[0]?.id || '');
    setAdjDirection('IN');
    setAdjQuantity('5');
    setAdjReason('');
    setAdjOpen(true);
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await registerInventoryAdjustment({
        productId: adjProductId,
        direction: adjDirection,
        quantity: Number(adjQuantity) || 0,
        reason: adjReason.trim(),
      });
      setAdjOpen(false);
      setTab('movements');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stockCols: DataTableColumn<CatalogProduct>[] = [
    {
      key: 'sku',
      header: 'SKU',
      stickyLeft: true,
      render: (p) => (
        <span className="font-mono-num text-xs font-semibold text-[var(--nr-primary)]">
          {p.sku}
        </span>
      ),
    },
    {
      key: 'name',
      header: locale === 'es' ? 'Producto' : 'Product',
      minWidthClass: 'min-w-[200px]',
      render: (p) => (
        <span className="font-semibold text-[var(--nr-text)]">
          {locale === 'es' ? p.nameEs : p.nameEn}
        </span>
      ),
    },
    {
      key: 'stock',
      header: locale === 'es' ? 'Existencia' : 'On Hand',
      align: 'right',
      render: (p) => (
        <span
          className={`font-mono-num font-bold ${
            p.stock <= p.minStock ? 'text-[var(--nr-warning)]' : 'text-[var(--nr-text)]'
          }`}
        >
          {p.stock}
        </span>
      ),
    },
    {
      key: 'min',
      header: locale === 'es' ? 'Stock mín.' : 'Min stock',
      align: 'right',
      render: (p) => (
        <span className="font-mono-num text-xs text-[var(--nr-text-secondary)]">{p.minStock}</span>
      ),
    },
    {
      key: 'val',
      header: locale === 'es' ? 'Valorización costo' : 'Cost value',
      align: 'right',
      render: (p) => <MoneyCell amount={p.stock * p.cost} locale={locale} />,
    },
    {
      key: 'status',
      header: t.common.status,
      render: (p) => (
        <StatusBadge
          label={
            p.stock <= p.minStock
              ? locale === 'es'
                ? 'Stock bajo'
                : 'Low stock'
              : locale === 'es'
                ? 'Normal'
                : 'Healthy'
          }
          tone={p.stock <= p.minStock ? 'amber' : 'emerald'}
          icon={p.stock <= p.minStock ? 'warning' : 'approved'}
        />
      ),
    },
    {
      key: 'actions',
      header: t.common.actions,
      align: 'right',
      render: (p) => (
        <button
          type="button"
          onClick={() => openAdjustFor(p.id)}
          className="nr-focus-ring nr-transition rounded-lg border border-[var(--nr-success-border)] bg-[var(--nr-success-bg)] hover:border-[var(--nr-primary)] px-2.5 py-1 text-xs font-semibold text-[var(--nr-success)]"
        >
          {locale === 'es' ? 'Ajustar' : 'Adjust'}
        </button>
      ),
    },
  ];

  const movementCols: DataTableColumn<InventoryMovement>[] = [
    {
      key: 'date',
      header: t.common.date,
      stickyLeft: true,
      render: (m) => (
        <span className="font-mono-num text-xs text-[var(--nr-text-secondary)]">{m.date}</span>
      ),
    },
    {
      key: 'product',
      header: locale === 'es' ? 'Producto' : 'Product',
      render: (m) => {
        const p = productMap.get(m.productId);
        return (
          <div>
            <div className="font-semibold text-xs text-[var(--nr-text)]">
              {p ? (locale === 'es' ? p.nameEs : p.nameEn) : m.productId}
            </div>
            <div className="font-mono-num text-[11px] text-[var(--nr-text-secondary)]">
              {m.reference}
            </div>
          </div>
        );
      },
    },
    {
      key: 'type',
      header: locale === 'es' ? 'Movimiento' : 'Type',
      render: (m) => (
        <StatusBadge
          label={m.type}
          tone={m.quantityDelta >= 0 ? 'emerald' : 'amber'}
        />
      ),
    },
    {
      key: 'delta',
      header: locale === 'es' ? 'Cantidad' : 'Delta',
      align: 'right',
      render: (m) => (
        <span
          className={`font-mono-num font-bold ${
            m.quantityDelta >= 0 ? 'text-[var(--nr-primary)]' : 'text-[var(--nr-error)]'
          }`}
        >
          {m.quantityDelta >= 0 ? `+${m.quantityDelta}` : m.quantityDelta}
        </span>
      ),
    },
    {
      key: 'after',
      header: locale === 'es' ? 'Stock resultante' : 'Stock after',
      align: 'right',
      render: (m) => (
        <span className="font-mono-num font-semibold text-[var(--nr-text)]">{m.stockAfter}</span>
      ),
    },
    {
      key: 'reason',
      header: locale === 'es' ? 'Motivo' : 'Reason',
      render: (m) => (
        <span className="text-xs text-[var(--nr-text-secondary)]">
          {locale === 'es' ? m.reasonEs : m.reasonEn}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <ErpPageHeader
        title={`${t.navigation.inventory} · ${activeBranch?.name ?? ''}`}
        subtitle={
          locale === 'es'
            ? 'Consulta existencias, alertas de reposición y registra ajustes simulados con trazabilidad.'
            : 'Monitor stock on hand, replenishment alerts, and post simulated stock adjustments.'
        }
        badge={<StatusBadge label={t.topBar.demoOnlyTag} tone="amber" />}
        actions={
          <button
            type="button"
            onClick={() => openAdjustFor()}
            className="nr-focus-ring nr-transition inline-flex items-center gap-1.5 h-10 px-4 rounded-lg bg-[var(--nr-primary)] hover:bg-[var(--nr-primary-hover)] text-xs font-semibold text-[var(--nr-primary-fg)] whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{locale === 'es' ? 'Registrar ajuste simulado' : 'Record adjustment'}</span>
          </button>
        }
      />

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-1 border-b border-[var(--nr-border)]">
        {(
          [
            { id: 'stock', label: t.navigation.inventoryStock },
            {
              id: 'alerts',
              label: `${t.navigation.inventoryAlerts} (${lowStock.length})`,
            },
            {
              id: 'movements',
              label: `${t.navigation.inventoryMovements} (${erpState.inventoryMovements.length})`,
            },
          ] as { id: InventoryTab; label: string }[]
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setTab(tab.id)}
            className={`nr-focus-ring nr-transition px-3.5 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-[var(--nr-primary)] text-[var(--nr-primary)]'
                : 'border-transparent text-[var(--nr-text-secondary)] hover:text-[var(--nr-text)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'alerts' && lowStock.length > 0 && (
        <div className="flex items-center gap-2 rounded-xl border border-[var(--nr-warning-border)] bg-[var(--nr-warning-bg)] p-3 text-xs font-medium text-[var(--nr-warning)]">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>
            {locale === 'es'
              ? `${lowStock.length} productos están por debajo o en su stock mínimo configurado.`
              : `${lowStock.length} products are at or below minimum stock threshold.`}
          </span>
        </div>
      )}

      {activeTab !== 'movements' ? (
        <>
          <ErpFilterBar
            searchValue={query}
            onSearchChange={setQuery}
            searchPlaceholder={
              locale === 'es' ? 'Buscar producto o SKU…' : 'Search product or SKU…'
            }
            hasActiveFilters={query.trim().length > 0}
            activeFilterCount={query.trim() ? 1 : 0}
            clearLabel={locale === 'es' ? 'Limpiar' : 'Clear'}
            onClearFilters={() => setQuery('')}
          />

          {filteredProducts.length === 0 ? (
            <ErpStatePanel
              variant="empty"
              title={t.common.noResults}
              actionLabel={query.trim() ? (locale === 'es' ? 'Limpiar búsqueda' : 'Clear search') : undefined}
              onAction={query.trim() ? () => setQuery('') : undefined}
            />
          ) : (
            <DataTable
              columns={stockCols}
              rows={filteredProducts}
              getRowKey={(p) => p.id}
              emptyMessage={t.common.noResults}
            />
          )}
        </>
      ) : (
        <DataTable
          columns={movementCols}
          rows={erpState.inventoryMovements}
          getRowKey={(m) => m.id}
          emptyMessage={t.common.noResults}
        />
      )}

      <ErpModal
        open={adjOpen}
        onClose={() => setAdjOpen(false)}
        title={
          locale === 'es'
            ? 'Ajuste simulado de inventario'
            : 'Simulated stock adjustment'
        }
        maxWidthClass="max-w-md"
        closeLabel={t.common.cancel}
      >
        <form onSubmit={handleAdjustSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-[var(--nr-text)] mb-1">
              {locale === 'es' ? 'Producto' : 'Product'}
            </label>
            <select
              value={adjProductId}
              onChange={(e) => setAdjProductId(e.target.value)}
              className="nr-focus-ring w-full h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-2.5 text-sm text-[var(--nr-text)]"
            >
              {erpState.products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.sku} · {locale === 'es' ? p.nameEs : p.nameEn} (Stock: {p.stock})
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--nr-text)] mb-1">
                {locale === 'es' ? 'Tipo de ajuste' : 'Adjustment type'}
              </label>
              <select
                value={adjDirection}
                onChange={(e) => setAdjDirection(e.target.value as 'IN' | 'OUT')}
                className="nr-focus-ring w-full h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-2.5 text-sm text-[var(--nr-text)]"
              >
                <option value="IN">{locale === 'es' ? 'Entrada (+)' : 'Stock In (+)'}</option>
                <option value="OUT">{locale === 'es' ? 'Salida (-)' : 'Stock Out (-)'}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--nr-text)] mb-1">
                {locale === 'es' ? 'Cantidad' : 'Quantity'}
              </label>
              <input
                type="number"
                min="1"
                required
                value={adjQuantity}
                onChange={(e) => setAdjQuantity(e.target.value)}
                className="nr-focus-ring w-full h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-2.5 text-sm font-mono-num text-[var(--nr-text)]"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--nr-text)] mb-1">
              {locale === 'es' ? 'Motivo / Justificación' : 'Reason'}
            </label>
            <input
              type="text"
              required
              value={adjReason}
              onChange={(e) => setAdjReason(e.target.value)}
              placeholder={
                locale === 'es' ? 'Ej. Conteo físico mensual' : 'e.g. Monthly cycle count'
              }
              className="nr-focus-ring w-full h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-2.5 text-sm text-[var(--nr-text)]"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-[var(--nr-border)]">
            <button
              type="button"
              onClick={() => setAdjOpen(false)}
              className="nr-focus-ring nr-transition h-9 px-3.5 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface)] text-xs font-semibold text-[var(--nr-text)] hover:bg-[var(--nr-surface-muted)]"
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
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

