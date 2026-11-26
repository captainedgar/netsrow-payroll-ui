import { useEffect, useState, type FormEvent } from 'react';

type Catalog = { company: { name: string }; products: { id: string; name: string }[] };

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
  const [error, setError] = useState<'catalog' | 'credentials' | 'login' | 'logout' | ''>('');

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

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/tenant/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Netsrow-Client': 'web' },
        body: JSON.stringify({ email: fields.get('email'), password: fields.get('password') }),
      });
      if (response.status === 401) {
        setError('credentials');
        return;
      }
      if (!response.ok) throw new Error('login');
      const data = await fetchCatalog();
      if (!data) throw new Error('session');
      setCatalog(data);
    } catch {
      setError('login');
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
    } catch {
      setError('logout');
    } finally {
      setBusy(false);
    }
  }

  const messages = {
    catalog: es ? 'No se pudo consultar la API.' : 'Could not reach the API.',
    credentials: es ? 'Correo o contraseña incorrectos.' : 'Invalid email or password.',
    login: es ? 'No se pudo iniciar sesión o consultar el catálogo.' : 'Could not sign in or load the catalog.',
    logout: es ? 'No se pudo cerrar la sesión. Intenta de nuevo.' : 'Could not sign out. Try again.',
  };

  return (
    <main className="mx-auto max-w-lg px-5 py-12 text-slate-900 dark:text-slate-100">
      <a href="/" className="text-emerald-800 dark:text-emerald-300 underline">NetsRow ERP</a>
      <h1 className="mt-6 text-3xl font-bold">{catalog ? catalog.company.name : es ? 'Acceso a tu empresa' : 'Sign in to your company'}</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-300">
        {catalog
          ? (es ? 'Catálogo de tu empresa · Solo lectura' : 'Company catalog · Read only')
          : (es ? 'Ingresa con la cuenta de tu empresa.' : 'Enter your company account credentials.')}
      </p>
      {error && <p role="alert" className="mt-4 text-red-800 dark:text-red-300">{messages[error]}</p>}
      {busy && <p role="status" className="mt-4">{es ? 'Procesando…' : 'Loading…'}</p>}
      {catalog ? (
        <>
          <ul className="mt-5 space-y-2">
            {catalog.products.map((product) => (
              <li key={product.id} className="rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 p-3">{product.name}</li>
            ))}
          </ul>
          {!catalog.products.length && <p className="mt-4">{es ? 'No hay productos.' : 'No products.'}</p>}
          <button type="button" disabled={busy} onClick={() => void logout()} className="mt-5 rounded-lg bg-slate-900 px-4 py-2 text-white">{es ? 'Cerrar sesión' : 'Sign out'}</button>
        </>
      ) : (
        <form onSubmit={login} className="mt-6 grid gap-4 rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 p-5">
          <label className="grid gap-1">{es ? 'Correo' : 'Email'}
            <input name="email" type="email" autoComplete="username" required maxLength={254} className="rounded-lg border p-2 dark:border-slate-600 dark:bg-slate-800" />
          </label>
          <label className="grid gap-1">{es ? 'Contraseña' : 'Password'}
            <input name="password" type="password" autoComplete="current-password" required maxLength={256} className="rounded-lg border p-2 dark:border-slate-600 dark:bg-slate-800" />
          </label>
          <button disabled={busy} className="rounded-lg bg-emerald-700 px-4 py-2 text-white">{es ? 'Iniciar sesión' : 'Sign in'}</button>
        </form>
      )}
    </main>
  );
}
