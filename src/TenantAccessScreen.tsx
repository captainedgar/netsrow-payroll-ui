import { DataTable } from './netsrow-payroll/components/DataTable';
import { ErpFilterBar, ErpModal, ErpPageHeader } from './netsrow-payroll/components/ErpUiPrimitives';
import { Plus } from 'lucide-react';
import { PayrollWorkspaceProvider } from './netsrow-payroll/context/PayrollWorkspaceContext';
import { usePlatform } from './netsrow-payroll/context/PlatformContext';
import { NetsRowPayrollWorkspace } from './netsrow-payroll/screens/NetsRowPayrollWorkspace';
import { TenantLoginScreen } from './netsrow-payroll/screens/TenantLoginScreen';
import { MockPayrollClient } from './netsrow-payroll/services/mockPayrollClient';
import { useEffect, useState, useMemo, type FormEvent } from 'react';

type Product = { id: string; name: string };
type Catalog = { company: { name: string }; products: Product[]; canManageCatalog: boolean };

type TenantAccessProps = {
  locale?: 'es' | 'en';
  route?: '/login' | '/erp';
  onNavigate?: (route: '/login' | '/erp') => void;
};

export function TenantAccessScreen({ locale = 'es', route, onNavigate }: TenantAccessProps) {
  const es = locale === 'es';
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [busy, setBusy] = useState(true);
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState('');
  const [productModal, setProductModal] = useState(false);
  const previewClient = useMemo(() => new MockPayrollClient(), []);
  const platform = usePlatform();
  const [error, setError] = useState<'catalog' | 'logout' | 'create' | 'permission' | ''>('');

  async function fetchCatalog(signal?: AbortSignal) {
    const response = await fetch('/api/tenant/catalog', { signal });
    if (response.status === 401) return null;
    if (!response.ok) throw new Error('catalog');
    return (await response.json()) as Catalog;
  }

  useEffect(() => {
    const controller = new AbortController();
    fetchCatalog(controller.signal)
      .then((data) => { if (!controller.signal.aborted) setCatalog(data); })
      .catch(() => { if (!controller.signal.aborted) setError('catalog'); })
      .finally(() => { if (!controller.signal.aborted) { setReady(true); setBusy(false); } });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (busy || error || !onNavigate) return;
    if (catalog && route === '/login') onNavigate('/erp');
    if (!catalog && route === '/erp') onNavigate('/login');
  }, [busy, catalog, error, onNavigate, route]);

  async function login(email: string, password: string) {
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/tenant/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Netsrow-Client': 'web' },
        body: JSON.stringify({ email, password }),
      });
      if (response.status === 401) {
        return 'invalid' as const;
      }
      if (!response.ok) throw new Error('login');
      const data = await fetchCatalog();
      if (!data) throw new Error('session');
      setCatalog(data);
      return null;
    } catch {
      return 'unavailable' as const;
    } finally {
      setBusy(false);
    }
  }

  async function createProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const name = new FormData(form).get('name');
    if (typeof name !== 'string' || !name.trim()) {
      setError('create');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/tenant/catalog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Netsrow-Client': 'web' },
        body: JSON.stringify({ name }),
      });
      if (response.status === 401) {
        setCatalog(null);
        setProductModal(false);
        return;
      }
      if (response.status === 403) {
        setError('permission');
        return;
      }
      if (!response.ok) throw new Error('create');
      const product = (await response.json()) as Product;
      setCatalog((current) => current && { ...current, products: [product, ...current.products] });
      form.reset();
      setQuery('');
      setProductModal(false);
    } catch {
      setError('create');
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/tenant/logout', {
        method: 'POST', headers: { 'X-Netsrow-Client': 'web' },
      });
      if (!response.ok) throw new Error('logout');
      setCatalog(null);
      setProductModal(false);
      setQuery('');
    } catch {
      setError('logout');
    } finally {
      setBusy(false);
    }
  }

  const messages = {
    create: es ? 'No se pudo guardar el producto. Verifica el nombre.' : 'Could not save the product. Check its name.',
    permission: es ? 'Tu cuenta no puede registrar productos.' : 'Your account cannot add products.',
    logout: es ? 'No se pudo cerrar la sesión. Intenta de nuevo.' : 'Could not sign out. Try again.',
  };

  if (route !== '/erp' || !catalog) {
    return <TenantLoginScreen serverLogin={login} serverBusy={busy || !ready} serviceUnavailable={error === 'catalog'} />;
  }

  const newProduct = es ? 'Nuevo producto' : 'New product';
  const productName = es ? 'Nombre del producto' : 'Product name';
  const rows = catalog.products.filter((item) => item.name.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));

  return (
    <PayrollWorkspaceProvider
      apiClient={previewClient}
      loadPreviewData={false}
      enableDemoRoleControl={false}
      initialScreen="catalog_products"
      externalLocale={locale}
      externalTheme={platform.theme}
      onLocaleChange={platform.setLocale}
      onThemeChange={platform.setTheme}
      onLogout={busy ? undefined : () => void logout()}
    >
      <NetsRowPayrollWorkspace companyName={catalog.company.name}
        sessionError={error === 'logout' ? messages.logout : undefined} liveCatalog={
        <div className="space-y-5">
          <ErpPageHeader
            title={es ? 'Catálogo' : 'Catalog'}
            subtitle={catalog.canManageCatalog
              ? (es ? 'Productos de tu empresa' : 'Company products')
              : (es ? 'Productos de tu empresa · Solo lectura' : 'Company products · Read only')}
            actions={catalog.canManageCatalog && (
              <button type="button" onClick={() => { setError(''); setProductModal(true); }}
                className="nr-focus-ring nr-transition inline-flex items-center gap-1.5 h-10 px-4 rounded-lg bg-[var(--nr-primary)] hover:bg-[var(--nr-primary-hover)] text-xs font-semibold text-[var(--nr-primary-fg)]">
                <Plus className="w-4 h-4" />{newProduct}
              </button>
            )}
          />
          <ErpFilterBar
            searchValue={query}
            onSearchChange={setQuery}
            searchPlaceholder={es ? 'Buscar por nombre…' : 'Search by name…'}
            hasActiveFilters={Boolean(query)}
            activeFilterCount={query ? 1 : 0}
            clearLabel={es ? 'Limpiar' : 'Clear'}
            onClearFilters={() => setQuery('')}
          />
          <DataTable rows={rows} getRowKey={(item) => item.id}
            columns={[{ key: 'name', header: productName, render: (item) => item.name }]}
            emptyMessage={es ? 'No hay productos.' : 'No products.'}
          />
          <ErpModal open={productModal} onClose={() => setProductModal(false)} title={newProduct}
            maxWidthClass="max-w-lg" closeLabel={es ? 'Cancelar' : 'Cancel'}>
            <form onSubmit={createProduct} className="space-y-3">
              {(error === 'create' || error === 'permission') && (
                <p role="alert" className="text-[var(--nr-error)]">{messages[error]}</p>
              )}
              <label className="grid gap-1 text-xs font-semibold">
                {productName}
                <input name="name" required maxLength={120}
                  className="nr-focus-ring h-10 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-3 text-sm" />
              </label>
              <button type="submit" disabled={busy}
                className="nr-focus-ring nr-transition h-10 px-4 rounded-lg bg-[var(--nr-primary)] text-xs font-semibold text-[var(--nr-primary-fg)] disabled:opacity-60">
                {es ? 'Registrar producto' : 'Add product'}
              </button>
            </form>
          </ErpModal>
        </div>
      } />
    </PayrollWorkspaceProvider>
  );
}
