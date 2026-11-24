import React, { useMemo, useState } from 'react';
import { Lock, Search, ShieldCheck } from 'lucide-react';
import { DataTable, DataTableColumn } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { usePlatform } from '../context/PlatformContext';
import { AuditEventType, PlatformAuditEvent } from '../types/platform';

export const PlatformAuditScreen: React.FC = () => {
  const { platformState, locale, pt, openTenantDetail } = usePlatform();

  const [tenantFilter, setTenantFilter] = useState('ALL');
  const [eventFilter, setEventFilter] = useState<'ALL' | AuditEventType>('ALL');
  const [query, setQuery] = useState('');

  const filteredEvents = useMemo(() => {
    const q = query.trim().toLowerCase();
    return platformState.auditEvents.filter((ev) => {
      if (tenantFilter !== 'ALL' && ev.tenantId !== tenantFilter) return false;
      if (eventFilter !== 'ALL' && ev.eventType !== eventFilter) return false;
      if (!q) return true;
      return (
        ev.operatorName.toLowerCase().includes(q) ||
        ev.reason.toLowerCase().includes(q) ||
        (ev.tenantName ?? '').toLowerCase().includes(q) ||
        ev.summaryEs.toLowerCase().includes(q)
      );
    });
  }, [platformState.auditEvents, tenantFilter, eventFilter, query]);

  const columns: DataTableColumn<PlatformAuditEvent>[] = [
    {
      key: 'timestamp',
      header: locale === 'es' ? 'Fecha y hora' : 'Timestamp',
      stickyLeft: true,
      render: (ev) => (
        <span className="font-mono-num text-xs whitespace-nowrap text-slate-700 dark:text-slate-300">
          {ev.timestamp}
        </span>
      ),
    },
    {
      key: 'operator',
      header: locale === 'es' ? 'Operador' : 'Operator',
      render: (ev) => (
        <div>
          <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
            {ev.operatorName}
          </div>
          <div className="font-mono-num text-[11px] text-slate-500">
            {ev.operatorEmail}
          </div>
        </div>
      ),
    },
    {
      key: 'tenant',
      header: locale === 'es' ? 'Empresa' : 'Company',
      render: (ev) =>
        ev.tenantId && ev.tenantName ? (
          <button
            type="button"
            onClick={() => openTenantDetail(ev.tenantId!)}
            className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline text-left"
          >
            {ev.tenantName}
          </button>
        ) : (
          <span className="text-xs text-slate-500">
            {locale === 'es' ? 'Catálogo SaaS' : 'SaaS Catalog'}
          </span>
        ),
    },
    {
      key: 'type',
      header: locale === 'es' ? 'Evento' : 'Event',
      render: (ev) => (
        <StatusBadge
          label={pt.auditEvents[ev.eventType]}
          tone={
            ev.eventType === 'SUSPEND'
              ? 'crimson'
              : ev.eventType === 'REACTIVATE' || ev.eventType === 'PAYMENT_CONFIRM'
                ? 'emerald'
                : 'neutral'
          }
        />
      ),
    },
    {
      key: 'summary',
      header: locale === 'es' ? 'Detalle y motivo' : 'Summary & reason',
      minWidthClass: 'min-w-[260px]',
      render: (ev) => (
        <div className="text-xs space-y-0.5">
          <div className="font-medium text-slate-900 dark:text-slate-100">
            {locale === 'es' ? ev.summaryEs : ev.summaryEn}
          </div>
          <div className="text-[11px] text-slate-500">
            {locale === 'es' ? 'Motivo:' : 'Reason:'} {ev.reason}
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
            {pt.platformNav.audit}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {locale === 'es'
              ? 'Bitácora administrativa de solo lectura para cambios de planes, módulos, suspensiones y confirmaciones manuales.'
              : 'Read-only administrative log for plan changes, modules, suspensions, and manual confirmations.'}
          </p>
        </div>

        <StatusBadge
          label={locale === 'es' ? 'Solo lectura · Inmutable' : 'Read-only · Immutable'}
          tone="neutral"
          icon="lock"
        />
      </div>

      {/* Privacy compliance notice */}
      <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <span>
          {locale === 'es'
            ? 'Política de registro: la auditoría nunca almacena contraseñas, tokens de sesión, salarios, nóminas ni ventas de las empresas.'
            : 'Audit policy: logs never record passwords, session tokens, employee salaries, payroll totals, or tenant sales.'}
        </span>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              locale === 'es'
                ? 'Buscar por operador, motivo o resumen…'
                : 'Search by operator, reason, or summary…'
            }
            className="w-full h-9 pl-9 pr-3 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={tenantFilter}
            onChange={(e) => setTenantFilter(e.target.value)}
            className="h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs font-semibold"
          >
            <option value="ALL">
              {locale === 'es' ? 'Todas las empresas' : 'All companies'}
            </option>
            {platformState.tenants.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          <select
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value as 'ALL' | AuditEventType)}
            className="h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs font-semibold"
          >
            <option value="ALL">
              {locale === 'es' ? 'Todos los eventos' : 'All event types'}
            </option>
            {(Object.keys(pt.auditEvents) as AuditEventType[]).map((evt) => (
              <option key={evt} value={evt}>
                {pt.auditEvents[evt]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={filteredEvents}
        getRowKey={(ev) => ev.id}
        emptyMessage={
          locale === 'es'
            ? 'No hay eventos de auditoría para los filtros seleccionados.'
            : 'No audit events match the selected filters.'
        }
      />

      <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
        <Lock className="w-3.5 h-3.5" />
        <span>
          {locale === 'es'
            ? `Mostrando ${filteredEvents.length} eventos registrados en la sesión demo.`
            : `Showing ${filteredEvents.length} audit events recorded in demo session.`}
        </span>
      </div>
    </div>
  );
};
