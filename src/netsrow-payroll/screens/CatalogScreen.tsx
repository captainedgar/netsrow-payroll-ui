import React, { useMemo, useState } from 'react';
import { Edit3, Plus } from 'lucide-react';
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
import {
  CatalogProduct,
  PriceList,
  ProductBrand,
  ProductCategory,
  UnitOfMeasure,
} from '../types/erp';

type CatalogSection = 'products' | 'categories' | 'brands' | 'units' | 'pricelists';

export const CatalogScreen: React.FC<{ live?: boolean; productContent?: React.ReactNode; productActions?: React.ReactNode }> = ({ live, productContent, productActions }) => {
  const {
    activeScreen,
    setActiveScreen,
    erpState,
    locale,
    t,
    upsertProduct,
    upsertCategory,
    upsertBrand,
    upsertUnit,
    upsertPriceList,
  } = usePayrollWorkspace();

  const activeSection: CatalogSection = useMemo(() => {
    if (activeScreen === 'catalog_categories') return 'categories';
    if (activeScreen === 'catalog_brands') return 'brands';
    if (activeScreen === 'catalog_units') return 'units';
    if (activeScreen === 'catalog_pricelists') return 'pricelists';
    return 'products';
  }, [activeScreen]);

  const setSection = (sec: CatalogSection) => {
    const map: Record<CatalogSection, typeof activeScreen> = {
      products: 'catalog_products',
      categories: 'catalog_categories',
      brands: 'catalog_brands',
      units: 'catalog_units',
      pricelists: 'catalog_pricelists',
    };
    setActiveScreen(map[sec]);
  };

  const [query, setQuery] = useState('');
  const [catFilter, setCatFilter] = useState('ALL');
  const [isSaving, setIsSaving] = useState(false);

  // Product modal state
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editProd, setEditProd] = useState<CatalogProduct | null>(null);
  const [pSku, setPSku] = useState('');
  const [pName, setPName] = useState('');
  const [pCat, setPCat] = useState('');
  const [pBrand, setPBrand] = useState('');
  const [pUnit, setPUnit] = useState('');
  const [pCost, setPCost] = useState('');
  const [pPrice, setPPrice] = useState('');
  const [pMinStock, setPMinStock] = useState('5');
  const [pTaxable, setPTaxable] = useState(true);

  // Simple entity modal for categories/brands/units/pricelists
  const [auxModalOpen, setAuxModalOpen] = useState(false);
  const [auxEditId, setAuxEditId] = useState<string | null>(null);
  const [auxCode, setAuxCode] = useState('');
  const [auxName, setAuxName] = useState('');
  const [auxExtra, setAuxExtra] = useState('');

  const catMap = useMemo(
    () => new Map(erpState.categories.map((c) => [c.id, c])),
    [erpState.categories]
  );
  const brandMap = useMemo(
    () => new Map(erpState.brands.map((b) => [b.id, b])),
    [erpState.brands]
  );
  const unitMap = useMemo(
    () => new Map(erpState.units.map((u) => [u.id, u])),
    [erpState.units]
  );

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return erpState.products.filter((p) => {
      if (catFilter !== 'ALL' && p.categoryId !== catFilter) return false;
      if (!q) return true;
      return (
        p.sku.toLowerCase().includes(q) ||
        p.nameEs.toLowerCase().includes(q) ||
        p.nameEn.toLowerCase().includes(q)
      );
    });
  }, [erpState.products, query, catFilter]);

  const openNewProduct = () => {
    setEditProd(null);
    setPSku(`SKU-${1001 + erpState.products.length}`);
    setPName('');
    setPCat(erpState.categories[0]?.id ?? '');
    setPBrand(erpState.brands[0]?.id ?? '');
    setPUnit(erpState.units[0]?.id ?? '');
    setPCost('');
    setPPrice('');
    setPMinStock('10');
    setPTaxable(true);
    setProductModalOpen(true);
  };

  const openEditProduct = (prod: CatalogProduct) => {
    setEditProd(prod);
    setPSku(prod.sku);
    setPName(locale === 'es' ? prod.nameEs : prod.nameEn);
    setPCat(prod.categoryId);
    setPBrand(prod.brandId);
    setPUnit(prod.unitId);
    setPCost(String(prod.cost));
    setPPrice(String(prod.price));
    setPMinStock(String(prod.minStock));
    setPTaxable(prod.taxableItbis);
    setProductModalOpen(true);
  };

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const cost = Number(pCost);
    const price = Number(pPrice);
    const minStock = Number(pMinStock) || 5;
    if (!pSku.trim() || !pName.trim() || Number.isNaN(price) || price <= 0) return;
    setIsSaving(true);
    try {
      await upsertProduct({
        id: editProd?.id ?? `prd-${Date.now()}`,
        sku: pSku.trim(),
        nameEs: pName.trim(),
        nameEn: pName.trim(),
        categoryId: pCat || erpState.categories[0]?.id || '',
        brandId: pBrand || erpState.brands[0]?.id || '',
        unitId: pUnit || erpState.units[0]?.id || '',
        cost: Number.isNaN(cost) ? 0 : cost,
        price,
        taxableItbis: pTaxable,
        stock: editProd?.stock ?? 15,
        minStock,
        active: editProd?.active ?? true,
      });
      setProductModalOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  const openNewAux = () => {
    setAuxEditId(null);
    setAuxCode('');
    setAuxName('');
    setAuxExtra(activeSection === 'pricelists' ? '10' : 'República Dominicana');
    setAuxModalOpen(true);
  };

  const openEditAux = (id: string, code: string, name: string, extra: string) => {
    setAuxEditId(id);
    setAuxCode(code);
    setAuxName(name);
    setAuxExtra(extra);
    setAuxModalOpen(true);
  };

  const saveAux = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auxCode.trim() || !auxName.trim()) return;
    setIsSaving(true);
    try {
      if (activeSection === 'categories') {
        await upsertCategory({
          id: auxEditId ?? `cat-${Date.now()}`,
          code: auxCode.trim().toUpperCase(),
          nameEs: auxName.trim(),
          nameEn: auxName.trim(),
          active: true,
        });
      } else if (activeSection === 'brands') {
        await upsertBrand({
          id: auxEditId ?? `brd-${Date.now()}`,
          code: auxCode.trim().toUpperCase(),
          name: auxName.trim(),
          origin: auxExtra.trim() || 'República Dominicana',
          active: true,
        });
      } else if (activeSection === 'units') {
        await upsertUnit({
          id: auxEditId ?? `unt-${Date.now()}`,
          code: auxCode.trim().toUpperCase(),
          nameEs: auxName.trim(),
          nameEn: auxName.trim(),
          allowDecimals: auxExtra === 'true',
        });
      } else if (activeSection === 'pricelists') {
        await upsertPriceList({
          id: auxEditId ?? `pl-${Date.now()}`,
          code: auxCode.trim().toUpperCase(),
          nameEs: auxName.trim(),
          nameEn: auxName.trim(),
          discountPercent: Number(auxExtra) || 0,
          isDefault: false,
          active: true,
        });
      }
      setAuxModalOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  const activeFilterCount = (query.trim() ? 1 : 0) + (catFilter !== 'ALL' ? 1 : 0);
  const editButtonClass =
    'nr-focus-ring nr-transition inline-flex items-center gap-1 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] hover:border-[var(--nr-primary)] px-2.5 py-1 text-xs font-medium text-[var(--nr-text)]';

  const productCols: DataTableColumn<CatalogProduct>[] = [
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
        <div>
          <div className="font-semibold text-[var(--nr-text)]">
            {locale === 'es' ? p.nameEs : p.nameEn}
          </div>
          <div className="text-[11px] text-[var(--nr-text-secondary)]">
            {brandMap.get(p.brandId)?.name ?? '—'} ·{' '}
            {unitMap.get(p.unitId)?.code ?? 'UND'}
          </div>
        </div>
      ),
    },
    {
      key: 'cat',
      header: t.navigation.catalogCategories,
      render: (p) => {
        const c = catMap.get(p.categoryId);
        return (
          <span className="text-xs text-[var(--nr-text-secondary)]">
            {c ? (locale === 'es' ? c.nameEs : c.nameEn) : '—'}
          </span>
        );
      },
    },
    {
      key: 'itbis',
      header: 'ITBIS',
      render: (p) => (
        <StatusBadge
          label={p.taxableItbis ? '18%' : locale === 'es' ? 'Exento' : 'Exempt'}
          tone={p.taxableItbis ? 'neutral' : 'emerald'}
        />
      ),
    },
    {
      key: 'stock',
      header: 'Stock',
      align: 'right',
      render: (p) => (
        <span
          className={`font-mono-num text-xs font-bold ${
            p.stock <= p.minStock ? 'text-[var(--nr-warning)]' : 'text-[var(--nr-text)]'
          }`}
        >
          {p.stock}
        </span>
      ),
    },
    {
      key: 'price',
      header: locale === 'es' ? 'Precio venta' : 'Sale price',
      align: 'right',
      render: (p) => <MoneyCell amount={p.price} locale={locale} emphasize />,
    },
    {
      key: 'actions',
      header: t.common.actions,
      align: 'right',
      render: (p) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            openEditProduct(p);
          }}
          className={editButtonClass}
        >
          <Edit3 className="w-3 h-3" />
          <span>{t.common.edit}</span>
        </button>
      ),
    },
  ];

  const categoryCols: DataTableColumn<ProductCategory>[] = [
    {
      key: 'code',
      header: t.common.code,
      render: (c) => <span className="font-mono-num font-semibold">{c.code}</span>,
    },
    {
      key: 'name',
      header: locale === 'es' ? 'Nombre' : 'Name',
      render: (c) => (
        <span className="font-semibold">{locale === 'es' ? c.nameEs : c.nameEn}</span>
      ),
    },
    {
      key: 'count',
      header: locale === 'es' ? 'Productos' : 'Products',
      align: 'right',
      render: (c) => (
        <span className="font-mono-num">
          {erpState.products.filter((p) => p.categoryId === c.id).length}
        </span>
      ),
    },
    {
      key: 'actions',
      header: t.common.actions,
      align: 'right',
      render: (c) => (
        <button
          type="button"
          onClick={() => openEditAux(c.id, c.code, locale === 'es' ? c.nameEs : c.nameEn, '')}
          className="inline-flex items-center gap-1 rounded border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-xs font-medium"
        >
          <Edit3 className="w-3 h-3" />
          <span>{t.common.edit}</span>
        </button>
      ),
    },
  ];

  const brandCols: DataTableColumn<ProductBrand>[] = [
    {
      key: 'code',
      header: t.common.code,
      render: (b) => <span className="font-mono-num font-semibold">{b.code}</span>,
    },
    {
      key: 'name',
      header: locale === 'es' ? 'Marca' : 'Brand',
      render: (b) => <span className="font-semibold">{b.name}</span>,
    },
    {
      key: 'origin',
      header: locale === 'es' ? 'Origen' : 'Origin',
      render: (b) => <span className="text-xs text-slate-600 dark:text-slate-400">{b.origin}</span>,
    },
    {
      key: 'actions',
      header: t.common.actions,
      align: 'right',
      render: (b) => (
        <button
          type="button"
          onClick={() => openEditAux(b.id, b.code, b.name, b.origin)}
          className="inline-flex items-center gap-1 rounded border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-xs font-medium"
        >
          <Edit3 className="w-3 h-3" />
          <span>{t.common.edit}</span>
        </button>
      ),
    },
  ];

  const unitCols: DataTableColumn<UnitOfMeasure>[] = [
    {
      key: 'code',
      header: t.common.code,
      render: (u) => <span className="font-mono-num font-semibold">{u.code}</span>,
    },
    {
      key: 'name',
      header: locale === 'es' ? 'Unidad' : 'Unit',
      render: (u) => <span className="font-semibold">{locale === 'es' ? u.nameEs : u.nameEn}</span>,
    },
    {
      key: 'decimals',
      header: locale === 'es' ? 'Permite decimales' : 'Allow decimals',
      render: (u) => (
        <StatusBadge
          label={u.allowDecimals ? (locale === 'es' ? 'Sí' : 'Yes') : 'No'}
          tone={u.allowDecimals ? 'emerald' : 'neutral'}
        />
      ),
    },
    {
      key: 'actions',
      header: t.common.actions,
      align: 'right',
      render: (u) => (
        <button
          type="button"
          onClick={() =>
            openEditAux(u.id, u.code, locale === 'es' ? u.nameEs : u.nameEn, String(u.allowDecimals))
          }
          className="inline-flex items-center gap-1 rounded border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-xs font-medium"
        >
          <Edit3 className="w-3 h-3" />
          <span>{t.common.edit}</span>
        </button>
      ),
    },
  ];

  const priceListCols: DataTableColumn<PriceList>[] = [
    {
      key: 'code',
      header: t.common.code,
      render: (pl) => <span className="font-mono-num font-semibold">{pl.code}</span>,
    },
    {
      key: 'name',
      header: locale === 'es' ? 'Lista de precios' : 'Price list',
      render: (pl) => (
        <span className="font-semibold">{locale === 'es' ? pl.nameEs : pl.nameEn}</span>
      ),
    },
    {
      key: 'discount',
      header: locale === 'es' ? 'Descuento' : 'Discount',
      align: 'right',
      render: (pl) => <span className="font-mono-num">{pl.discountPercent}%</span>,
    },
    {
      key: 'default',
      header: t.common.status,
      render: (pl) => (
        <StatusBadge
          label={
            pl.isDefault
              ? locale === 'es'
                ? 'Predeterminada'
                : 'Default'
              : locale === 'es'
                ? 'Activa'
                : 'Active'
          }
          tone={pl.isDefault ? 'emerald' : 'neutral'}
        />
      ),
    },
    {
      key: 'actions',
      header: t.common.actions,
      align: 'right',
      render: (pl) => (
        <button
          type="button"
          onClick={() =>
            openEditAux(
              pl.id,
              pl.code,
              locale === 'es' ? pl.nameEs : pl.nameEn,
              String(pl.discountPercent)
            )
          }
          className="inline-flex items-center gap-1 rounded border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-xs font-medium"
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
        title={t.navigation.catalog}
        subtitle={
          locale === 'es'
            ? 'Administra las 5 secciones del catálogo comercial de NetsRow ERP.'
            : 'Manage all 5 commercial catalog sections in NetsRow ERP.'
        }
        badge={!live && <StatusBadge label={t.topBar.demoOnlyTag} tone="amber" />}
        actions={live ? (activeSection === 'products' && productActions) : (
          <button
            type="button"
            onClick={activeSection === 'products' ? openNewProduct : openNewAux}
            className="nr-focus-ring nr-transition inline-flex items-center gap-1.5 h-10 px-4 rounded-lg bg-[var(--nr-primary)] hover:bg-[var(--nr-primary-hover)] text-xs font-semibold text-[var(--nr-primary-fg)] whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>
              {activeSection === 'products'
                ? locale === 'es'
                  ? 'Nuevo producto'
                  : 'New product'
                : t.common.add}
            </span>
          </button>
        )}
      />

      {/* 5 Sections Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-1 border-b border-[var(--nr-border)]">
        {(
          [
            { id: 'products', label: t.navigation.catalogProducts },
            { id: 'categories', label: t.navigation.catalogCategories },
            { id: 'brands', label: t.navigation.catalogBrands },
            { id: 'units', label: t.navigation.catalogUnits },
            { id: 'pricelists', label: t.navigation.catalogPriceLists },
          ] as { id: CatalogSection; label: string }[]
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSection(tab.id)}
            className={`nr-focus-ring nr-transition px-3.5 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap ${
              activeSection === tab.id
                ? 'border-[var(--nr-primary)] text-[var(--nr-primary)]'
                : 'border-transparent text-[var(--nr-text-secondary)] hover:text-[var(--nr-text)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeSection === 'products' && (live ? productContent : (
        <>
          <ErpFilterBar
            searchValue={query}
            onSearchChange={setQuery}
            searchPlaceholder={
              locale === 'es' ? 'Buscar por SKU o nombre…' : 'Search by SKU or name…'
            }
            hasActiveFilters={activeFilterCount > 0}
            activeFilterCount={activeFilterCount}
            clearLabel={locale === 'es' ? 'Limpiar' : 'Clear'}
            onClearFilters={() => {
              setQuery('');
              setCatFilter('ALL');
            }}
          >
            <select
              aria-label={t.navigation.catalogCategories}
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value)}
              className="nr-focus-ring nr-transition h-10 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-3 text-xs font-semibold text-[var(--nr-text)]"
            >
              <option value="ALL">{t.common.all}</option>
              {erpState.categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {locale === 'es' ? c.nameEs : c.nameEn}
                </option>
              ))}
            </select>
          </ErpFilterBar>

          {filteredProducts.length === 0 ? (
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
                      setCatFilter('ALL');
                    }
                  : undefined
              }
            />
          ) : (
            <DataTable
              columns={productCols}
              rows={filteredProducts}
              getRowKey={(r) => r.id}
              emptyMessage={t.common.noResults}
            />
          )}
        </>
      ))}

      {live && activeSection !== 'products' && (
        <p className="text-sm text-[var(--nr-text-secondary)]">
          {locale === 'es' ? 'Administración pendiente de conexión.' : 'Management is awaiting integration.'}
        </p>
      )}

      {activeSection === 'categories' && (
        <DataTable
          columns={categoryCols}
          rows={erpState.categories}
          getRowKey={(r) => r.id}
          emptyMessage={t.common.noResults}
        />
      )}

      {activeSection === 'brands' && (
        <DataTable
          columns={brandCols}
          rows={erpState.brands}
          getRowKey={(r) => r.id}
          emptyMessage={t.common.noResults}
        />
      )}

      {activeSection === 'units' && (
        <DataTable
          columns={unitCols}
          rows={erpState.units}
          getRowKey={(r) => r.id}
          emptyMessage={t.common.noResults}
        />
      )}

      {activeSection === 'pricelists' && (
        <DataTable
          columns={priceListCols}
          rows={erpState.priceLists}
          getRowKey={(r) => r.id}
          emptyMessage={t.common.noResults}
        />
      )}

      {/* Product Create/Edit Modal */}
      <ErpModal
        open={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        title={
          editProd
            ? locale === 'es'
              ? 'Editar producto'
              : 'Edit product'
            : locale === 'es'
              ? 'Nuevo producto'
              : 'New product'
        }
        maxWidthClass="max-w-lg"
        closeLabel={t.common.cancel}
      >
        <form onSubmit={saveProduct} className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--nr-text)] mb-1">SKU</label>
              <input
                value={pSku}
                onChange={(e) => setPSku(e.target.value)}
                required
                className="nr-focus-ring w-full h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-2.5 text-sm font-mono-num text-[var(--nr-text)]"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-[var(--nr-text)] mb-1">
                {locale === 'es' ? 'Nombre del producto' : 'Product name'}
              </label>
              <input
                value={pName}
                onChange={(e) => setPName(e.target.value)}
                required
                className="nr-focus-ring w-full h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-2.5 text-sm text-[var(--nr-text)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--nr-text)] mb-1">
                {t.navigation.catalogCategories}
              </label>
              <select
                value={pCat}
                onChange={(e) => setPCat(e.target.value)}
                className="nr-focus-ring w-full h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-2 text-xs text-[var(--nr-text)]"
              >
                {erpState.categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {locale === 'es' ? c.nameEs : c.nameEn}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--nr-text)] mb-1">
                {t.navigation.catalogBrands}
              </label>
              <select
                value={pBrand}
                onChange={(e) => setPBrand(e.target.value)}
                className="nr-focus-ring w-full h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-2 text-xs text-[var(--nr-text)]"
              >
                {erpState.brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--nr-text)] mb-1">
                {t.navigation.catalogUnits}
              </label>
              <select
                value={pUnit}
                onChange={(e) => setPUnit(e.target.value)}
                className="nr-focus-ring w-full h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-2 text-xs text-[var(--nr-text)]"
              >
                {erpState.units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.code}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--nr-text)] mb-1">
                {locale === 'es' ? 'Costo RD$' : 'Cost RD$'}
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={pCost}
                onChange={(e) => setPCost(e.target.value)}
                className="nr-focus-ring w-full h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-2.5 text-sm font-mono-num text-[var(--nr-text)]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--nr-text)] mb-1">
                {locale === 'es' ? 'Precio RD$' : 'Price RD$'}
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                required
                value={pPrice}
                onChange={(e) => setPPrice(e.target.value)}
                className="nr-focus-ring w-full h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-2.5 text-sm font-mono-num text-[var(--nr-text)]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--nr-text)] mb-1">
                {locale === 'es' ? 'Stock mínimo' : 'Min stock'}
              </label>
              <input
                type="number"
                min="0"
                value={pMinStock}
                onChange={(e) => setPMinStock(e.target.value)}
                className="nr-focus-ring w-full h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-2.5 text-sm font-mono-num text-[var(--nr-text)]"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs font-medium text-[var(--nr-text)] cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={pTaxable}
              onChange={(e) => setPTaxable(e.target.checked)}
              className="accent-[var(--nr-primary)]"
            />
            <span>{locale === 'es' ? 'Aplica ITBIS (18%)' : 'Subject to ITBIS (18%)'}</span>
          </label>

          <div className="flex justify-end gap-2 pt-3 border-t border-[var(--nr-border)]">
            <button
              type="button"
              onClick={() => setProductModalOpen(false)}
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

      {/* Auxiliary Section Create/Edit Modal */}
      <ErpModal
        open={auxModalOpen}
        onClose={() => setAuxModalOpen(false)}
        title={auxEditId ? t.common.edit : t.common.add}
        maxWidthClass="max-w-md"
        closeLabel={t.common.cancel}
      >
        <form onSubmit={saveAux} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-[var(--nr-text)] mb-1">
              {t.common.code}
            </label>
            <input
              value={auxCode}
              onChange={(e) => setAuxCode(e.target.value)}
              required
              className="nr-focus-ring w-full h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-2.5 text-sm font-mono-num text-[var(--nr-text)]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--nr-text)] mb-1">
              {locale === 'es' ? 'Nombre' : 'Name'}
            </label>
            <input
              value={auxName}
              onChange={(e) => setAuxName(e.target.value)}
              required
              className="nr-focus-ring w-full h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-2.5 text-sm text-[var(--nr-text)]"
            />
          </div>
          {(activeSection === 'brands' || activeSection === 'pricelists') && (
            <div>
              <label className="block text-xs font-semibold text-[var(--nr-text)] mb-1">
                {activeSection === 'pricelists'
                  ? locale === 'es'
                    ? 'Descuento (%)'
                    : 'Discount (%)'
                  : locale === 'es'
                    ? 'Origen'
                    : 'Origin'}
              </label>
              <input
                value={auxExtra}
                onChange={(e) => setAuxExtra(e.target.value)}
                className="nr-focus-ring w-full h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-2.5 text-sm text-[var(--nr-text)]"
              />
            </div>
          )}
          <div className="flex justify-end gap-2 pt-3 border-t border-[var(--nr-border)]">
            <button
              type="button"
              onClick={() => setAuxModalOpen(false)}
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
