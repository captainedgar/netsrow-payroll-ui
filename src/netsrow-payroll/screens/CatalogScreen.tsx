import React, { useMemo, useState } from 'react';
import { Edit3, Plus, Search, X } from 'lucide-react';
import { DataTable, DataTableColumn } from '../components/DataTable';
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

export const CatalogScreen: React.FC = () => {
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
  };

  const productCols: DataTableColumn<CatalogProduct>[] = [
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
        <div>
          <div className="font-semibold text-slate-900 dark:text-slate-100">
            {locale === 'es' ? p.nameEs : p.nameEn}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
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
          <span className="text-xs text-slate-700 dark:text-slate-300">
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
      header: locale === 'es' ? 'Stock' : 'Stock',
      align: 'right',
      render: (p) => (
        <span
          className={`font-mono-num text-xs font-bold ${
            p.stock <= p.minStock
              ? 'text-amber-700 dark:text-amber-300'
              : 'text-slate-900 dark:text-slate-100'
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
          className="inline-flex items-center gap-1 rounded border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
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
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
              {t.navigation.catalog}
            </h1>
            <StatusBadge label={t.topBar.demoOnlyTag} tone="amber" />
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {locale === 'es'
              ? 'Administra las 5 secciones del catálogo comercial de NetsRow ERP.'
              : 'Manage all 5 commercial catalog sections in NetsRow ERP.'}
          </p>
        </div>

        <button
          type="button"
          onClick={activeSection === 'products' ? openNewProduct : openNewAux}
          className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white whitespace-nowrap shrink-0"
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
      </div>

      {/* 5 Sections Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 dark:border-slate-800">
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
            className={`px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeSection === tab.id
                ? 'border-emerald-600 text-emerald-700 dark:border-emerald-400 dark:text-emerald-300'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeSection === 'products' && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  locale === 'es' ? 'Buscar por SKU o nombre…' : 'Search by SKU or name…'
                }
                className="w-full h-9 pl-9 pr-3 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <select
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value)}
              className="h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs font-semibold text-slate-800 dark:text-slate-200"
            >
              <option value="ALL">{t.common.all}</option>
              {erpState.categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {locale === 'es' ? c.nameEs : c.nameEn}
                </option>
              ))}
            </select>
          </div>

          <DataTable
            columns={productCols}
            rows={filteredProducts}
            getRowKey={(r) => r.id}
            emptyMessage={t.common.noResults}
          />
        </>
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
      {productModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60">
          <div className="w-full max-w-lg rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
              <h2 className="font-display text-base font-bold text-slate-900 dark:text-slate-100">
                {editProd
                  ? locale === 'es'
                    ? 'Editar producto'
                    : 'Edit product'
                  : locale === 'es'
                    ? 'Nuevo producto'
                    : 'New product'}
              </h2>
              <button
                type="button"
                onClick={() => setProductModalOpen(false)}
                className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={saveProduct} className="p-4 space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">SKU</label>
                  <input
                    value={pSku}
                    onChange={(e) => setPSku(e.target.value)}
                    required
                    className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 text-sm font-mono-num"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold mb-1">
                    {locale === 'es' ? 'Nombre del producto' : 'Product name'}
                  </label>
                  <input
                    value={pName}
                    onChange={(e) => setPName(e.target.value)}
                    required
                    className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    {t.navigation.catalogCategories}
                  </label>
                  <select
                    value={pCat}
                    onChange={(e) => setPCat(e.target.value)}
                    className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 text-xs"
                  >
                    {erpState.categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {locale === 'es' ? c.nameEs : c.nameEn}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    {t.navigation.catalogBrands}
                  </label>
                  <select
                    value={pBrand}
                    onChange={(e) => setPBrand(e.target.value)}
                    className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 text-xs"
                  >
                    {erpState.brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    {t.navigation.catalogUnits}
                  </label>
                  <select
                    value={pUnit}
                    onChange={(e) => setPUnit(e.target.value)}
                    className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 text-xs"
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
                  <label className="block text-xs font-semibold mb-1">
                    {locale === 'es' ? 'Costo RD$' : 'Cost RD$'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={pCost}
                    onChange={(e) => setPCost(e.target.value)}
                    className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 text-sm font-mono-num"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    {locale === 'es' ? 'Precio RD$' : 'Price RD$'}
                  </label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    required
                    value={pPrice}
                    onChange={(e) => setPPrice(e.target.value)}
                    className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 text-sm font-mono-num"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    {locale === 'es' ? 'Stock mínimo' : 'Min stock'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={pMinStock}
                    onChange={(e) => setPMinStock(e.target.value)}
                    className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 text-sm font-mono-num"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={pTaxable}
                  onChange={(e) => setPTaxable(e.target.checked)}
                />
                <span>
                  {locale === 'es'
                    ? 'Aplica ITBIS (18%)'
                    : 'Subject to ITBIS (18%)'}
                </span>
              </label>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
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

      {/* Auxiliary Section Create/Edit Modal */}
      {auxModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60">
          <div className="w-full max-w-md rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
              <h2 className="font-display text-base font-bold">
                {auxEditId ? t.common.edit : t.common.add}
              </h2>
              <button
                type="button"
                onClick={() => setAuxModalOpen(false)}
                className="p-1 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={saveAux} className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">{t.common.code}</label>
                <input
                  value={auxCode}
                  onChange={(e) => setAuxCode(e.target.value)}
                  required
                  className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 text-sm font-mono-num"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">
                  {locale === 'es' ? 'Nombre' : 'Name'}
                </label>
                <input
                  value={auxName}
                  onChange={(e) => setAuxName(e.target.value)}
                  required
                  className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 text-sm"
                />
              </div>
              {(activeSection === 'brands' || activeSection === 'pricelists') && (
                <div>
                  <label className="block text-xs font-semibold mb-1">
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
                    className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 text-sm"
                  />
                </div>
              )}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setAuxModalOpen(false)}
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
