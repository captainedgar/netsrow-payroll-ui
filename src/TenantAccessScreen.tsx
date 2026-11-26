import { useEffect, useState, type FormEvent } from 'react';

type Catalog = { company: { name: string }; products: { id: string; name: string }[] };

export function TenantAccessScreen() {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');

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
      .catch(() => { if (!controller.signal.aborted) setError('No se pudo consultar la API.'); })
      .finally(() => { if (!controller.signal.aborted) setBusy(false); });
    return () => controller.abort();
  }, []);

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
        setError('Correo o contraseña incorrectos.');
        return;
      }
      if (!response.ok) throw new Error('login');
      const data = await fetchCatalog();
      if (!data) throw new Error('session');
      setCatalog(data);
    } catch {
      setError('No se pudo iniciar sesión o consultar el catálogo.');
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
      setError('No se pudo cerrar la sesión. Intenta de nuevo.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-lg px-5 py-12 text-slate-900">
      <a href="/" className="text-emerald-800 underline">NetsRow ERP</a>
      <h1 className="mt-6 text-3xl font-bold">{catalog ? catalog.company.name : 'Acceso de prueba'}</h1>
      <p className="mt-2 text-slate-600">Verificación del acceso al catálogo por empresa.</p>
      {error && <p role="alert" className="mt-4 text-red-800">{error}</p>}
      {busy && <p role="status" className="mt-4">Procesando…</p>}
      {catalog ? (
        <>
          <ul className="mt-5 space-y-2">
            {catalog.products.map((product) => (
              <li key={product.id} className="rounded-lg border border-slate-200 bg-white p-3">{product.name}</li>
            ))}
          </ul>
          {!catalog.products.length && <p className="mt-4">No hay productos.</p>}
          <button type="button" disabled={busy} onClick={() => void logout()} className="mt-5 rounded-lg bg-slate-900 px-4 py-2 text-white">Cerrar sesión</button>
        </>
      ) : (
        <form onSubmit={login} className="mt-6 grid gap-4 rounded-xl border border-slate-200 bg-white p-5">
          <label className="grid gap-1">Correo
            <input name="email" type="email" autoComplete="username" required maxLength={254} className="rounded-lg border p-2" />
          </label>
          <label className="grid gap-1">Contraseña
            <input name="password" type="password" autoComplete="current-password" required maxLength={256} className="rounded-lg border p-2" />
          </label>
          <button disabled={busy} className="rounded-lg bg-emerald-700 px-4 py-2 text-white">Iniciar sesión</button>
        </form>
      )}
    </main>
  );
}
