import { useEffect, useState } from 'react';
import type { CommercialCatalog } from './netsrow-payroll/types/commercial';

type CatalogResponse = { mode: 'demo'; catalog: CommercialCatalog };

export function FoundationScreen() {
  const [catalog, setCatalog] = useState<CommercialCatalog | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCatalog() {
      try {
        const response = await fetch('/api/demo/catalog', { signal: controller.signal });
        if (!response.ok) throw new Error('Catalog unavailable');
        const data: CatalogResponse = await response.json();
        if (data.mode !== 'demo' || !Array.isArray(data.catalog?.plans)) {
          throw new Error('Invalid catalog');
        }
        if (!controller.signal.aborted) setCatalog(data.catalog);
      } catch {
        if (!controller.signal.aborted) setError(true);
      }
    }

    void loadCatalog();
    return () => controller.abort();
  }, []);

  return (
    <main className="mx-auto max-w-3xl px-5 py-12 text-slate-900">
      <a href="/" className="text-sm font-medium text-emerald-800 underline">
        Volver a NetsRow
      </a>
      <h1 className="mt-6 text-3xl font-bold">Catálogo de prueba</h1>
      <p className="mt-2 text-slate-600">Planes ilustrativos consultados desde la base de NetsRow.</p>
      {error && <p role="alert" className="mt-6 text-red-800">No se pudo cargar el catálogo. Comprueba la API y PostgreSQL.</p>}
      {!error && !catalog && <p role="status" className="mt-6">Cargando catálogo…</p>}
      {catalog && (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {catalog.plans.map((plan) => (
            <li key={plan.id} className="rounded-xl border border-slate-200 bg-white p-5">
              <h2 className="font-semibold">{plan.nameEs}</h2>
              <p className="mt-2 text-sm text-slate-600">{plan.summaryEs}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
