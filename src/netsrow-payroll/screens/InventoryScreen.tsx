import React, { useMemo, useState } from 'react';
import { AlertTriangle, Plus, Search, X } from 'lucide-react';
import { DataTable, DataTableColumn } from '../components/DataTable';
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
    await registerInventoryAdjustment({
      productId: adjProductId,
      direction: adjDirection,
      quantity: Number(adjQuantity) || 0,
      reason: adjReason.trim(),
    });
    setAdjOpen(false);
    setTab('movements');
  };

  const stockCols: DataTableColumn<CatalogProduct>[] = [
    {
      key: 'sku',
      header: 'SKU',
      stickyLeft: true,
      render: (p) => (
        <span className="font-mono-num text-xs font-semibold text-emerald-700 dark:text-emerald-400">
          {p.sku}
        </span>
      ),
    },
    {
      key: 'name',
      header: locale === 'es' ? 'Producto' : 'Product',
      minWidthClass: 'min-w-[200px]',
      render: (p) => (
        <span className="font-semibold text-slate-900 dark:text-slate-100">
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
            p.stock <= p.minStock ? 'text-amber-700 dark:text-amber-300' : ''
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
      render: (p) => <span className="font-mono-num text-xs">{p.minStock}</span>,
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
          className="rounded border border-emerald-600/30 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50"
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
      render: (m) => <span className="font-mono-num text-xs">{m.date}</span>,
    },
    {
      key: 'product',
      header: locale === 'es' ? 'Producto' : 'Product',
      render: (m) => {
        const p = productMap.get(m.productId);
        return (
          <div>
            <div className="font-semibold text-xs">
              {p ? (locale === 'es' ? p.nameEs : p.nameEn) : m.productId}
            </div>
            <div className="font-mono-num text-[11px] text-slate-500">{m.reference}</div>
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
            m.quantityDelta >= 0
              ? 'text-emerald-700 dark:text-emerald-400'
              : 'text-red-600 dark:text-red-400'
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
      render: (m) => <span className="font-mono-num font-semibold">{m.stockAfter}</span>,
    },
    {
      key: 'reason',
      header: locale === 'es' ? 'Motivo' : 'Reason',
      render: (m) => (
        <span className="text-xs text-slate-600 dark:text-slate-300">
          {locale === 'es' ? m.reasonEs : m.reasonEn}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
              {t.navigation.inventory} · {activeBranch?.name ?? ''}
            </h1>
            <StatusBadge label={t.topBar.demoOnlyTag} tone="amber" />
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {locale === 'es'
              ? 'Consulta existencias, alertas de reposición y registra ajustes simulados con trazabilidad.'
              : 'Monitor stock on hand, replenishment alerts, and post simulated stock adjustments.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => openAdjustFor()}
          className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{locale === 'es' ? 'Registrar ajuste simulado' : 'Record adjustment'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 dark:border-slate-800">
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
            className={`px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-emerald-600 text-emerald-700 dark:border-emerald-400 dark:text-emerald-300'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'alerts' && lowStock.length > 0 && (
        <div className="flex items-center gap-2 rounded-md border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 p-3 text-xs text-amber-900 dark:text-amber-200">
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
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                locale === 'es' ? 'Buscar producto o SKU…' : 'Search product or SKU…'
              }
              className="w-full h-9 pl-9 pr-3 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>
          <DataTable
            columns={stockCols}
            rows={filteredProducts}
            getRowKey={(p) => p.id}
            emptyMessage={t.common.noResults}
          />
        </>
      ) : (
        <DataTable
          columns={movementCols}
          rows={erpState.inventoryMovements}
          getRowKey={(m) => m.id}
          emptyMessage={t.common.noResults}
        />
      )}

      {/* Adjustment Modal */}
      {adjOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60">
          <div className="w-full max-w-md rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
              <h2 className="font-display text-base font-bold">
                {locale === 'es' ? 'Ajuste simulado de inventario' : 'Simulated stock adjustment'}
              </h2>
              <button type="button" onClick={() => setAdjOpen(false)} className="p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAdjustSubmit} className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">
                  {locale === 'es' ? 'Producto' : 'Product'}
                </label>
                <select
                  value={adjProductId}
                  onChange={(e) => setAdjProductId(e.target.value)}
                  className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 text-sm"
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
                  <label className="block text-xs font-semibold mb-1">
                    {locale === 'es' ? 'Tipo de ajuste' : 'Adjustment type'}
                  </label>
                  <select
                    value={adjDirection}
                    onChange={(e) => setAdjDirection(e.target.value as 'IN' | 'OUT')}
                    className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 text-sm"
                  >
                    <option value="IN">
                      {locale === 'es' ? 'Entrada (+)' : 'Stock In (+)'}
                    </option>
                    <option value="OUT">
                      {locale === 'es' ? 'Salida (-)' : 'Stock Out (-)'}
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    {locale === 'es' ? 'Cantidad' : 'Quantity'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={adjQuantity}
                    onChange={(e) => setAdjQuantity(e.target.value)}
                    className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 text-sm font-mono-num"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">
                  {locale === 'es' ? 'Motivo / Justificación' : 'Reason'}
                </label>
                <input
                  type="text"
                  required
                  value={adjReason}
                  onChange={(e) => setAdjReason(e.target.value)}
                  placeholder={
                    locale === 'es'
                      ? 'Ej. Conteo físico mensual'
                      : 'e.g. Monthly cycle count'
                  }
                  className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setAdjOpen(false)}
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
