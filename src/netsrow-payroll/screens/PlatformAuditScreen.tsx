import React, { useMemo, useState } from 'react';
import { Lock, ShieldCheck } from 'lucide-react';
import { DataTable, DataTableColumn } from '../components/DataTable';
import {
  ErpFilterBar,
  ErpPageHeader,
  ErpSurfaceCard,
} from '../components/ErpUiPrimitives';
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
        <span className="font-mono-num text-xs whitespace-nowrap text-[var(--nr-text-secondary)]">
          {ev.timestamp}
        </span>
      ),
    },
    {
      key: 'operator',
      header: locale === 'es' ? 'Operador' : 'Operator',
      render: (ev) => (
        <div>
          <div className="text-xs font-semibold text-[var(--nr-text)]">
            {ev.operatorName}
          </div>
          <div className="font-mono-num text-[11px] text-[var(--nr-text-secondary)]">
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
            className="nr-focus-ring text-xs font-semibold text-[var(--nr-primary)] hover:underline text-left rounded"
          >
            {ev.tenantName}
          </button>
        ) : (
          <span className="text-xs text-[var(--nr-text-secondary)]">
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
          <div className="font-medium text-[var(--nr-text)]">
            {locale === 'es' ? ev.summaryEs : ev.summaryEn}
          </div>
          <div className="text-[11px] text-[var(--nr-text-secondary)]">
            {locale === 'es' ? 'Motivo:' : 'Reason:'} {ev.reason}
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <ErpPageHeader
        title={pt.platformNav.audit}
        subtitle={
          locale === 'es'
            ? 'Bitácora administrativa de solo lectura para cambios de planes, módulos, suspensiones y confirmaciones manuales.'
            : 'Read-only administrative log for plan changes, modules, suspensions, and manual confirmations.'
        }
        badge={
          <StatusBadge
            label={locale === 'es' ? 'Solo lectura · Inmutable' : 'Read-only · Immutable'}
            tone="neutral"
            icon="lock"
          />
        }
      />

      {/* Privacy compliance notice */}
      <ErpSurfaceCard padding="sm" className="flex items-start gap-2.5 text-xs text-[var(--nr-text-secondary)]">
        <ShieldCheck className="w-4 h-4 text-[var(--nr-primary)] shrink-0 mt-0.5" />
        <span>
          {locale === 'es'
            ? 'Política de registro: la auditoría nunca almacena contraseñas, tokens de sesión, salarios, nóminas ni ventas de las empresas.'
            : 'Audit policy: logs never record passwords, session tokens, employee salaries, payroll totals, or tenant sales.'}
        </span>
      </ErpSurfaceCard>

      {/* Filters */}
      <ErpFilterBar
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder={
          locale === 'es'
            ? 'Buscar por operador, motivo o resumen…'
            : 'Search by operator, reason, or summary…'
        }
        hasActiveFilters={Boolean(query.trim()) || tenantFilter !== 'ALL' || eventFilter !== 'ALL'}
        onClearFilters={() => {
          setQuery('');
          setTenantFilter('ALL');
          setEventFilter('ALL');
        }}
        clearLabel={locale === 'es' ? 'Limpiar' : 'Clear'}
      >
        <select
          value={tenantFilter}
          onChange={(e) => setTenantFilter(e.target.value)}
          className="nr-focus-ring h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-3 text-xs font-semibold text-[var(--nr-text)]"
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
          className="nr-focus-ring h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-3 text-xs font-semibold text-[var(--nr-text)]"
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
      </ErpFilterBar>

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

      <div className="flex items-center gap-1.5 text-[11px] text-[var(--nr-text-secondary)]">
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
