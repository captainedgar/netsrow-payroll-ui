import React, { useMemo, useState } from 'react';
import { LifeBuoy, MessageSquarePlus, ShieldCheck } from 'lucide-react';
import {
  ErpPageHeader,
  ErpStatePanel,
  ErpSurfaceCard,
} from '../components/ErpUiPrimitives';
import { StatusBadge } from '../components/StatusBadge';
import { usePlatform } from '../context/PlatformContext';
import { SupportTicketStatus } from '../types/platform';

const OPERATORS = ['Ing. Laura Méndez', 'Lic. Darío Santana'];

export const PlatformSupportScreen: React.FC = () => {
  const {
    platformState,
    locale,
    pt,
    updateSupportTicket,
    openTenantDetail,
    isMutating,
  } = usePlatform();

  const [statusFilter, setStatusFilter] = useState<'ALL' | SupportTicketStatus>('ALL');
  const [selectedTicketId, setSelectedTicketId] = useState<string>(
    platformState.tickets[0]?.id ?? ''
  );
  const [noteInput, setNoteInput] = useState('');

  const filteredTickets = useMemo(
    () =>
      platformState.tickets.filter(
        (t) => statusFilter === 'ALL' || t.status === statusFilter
      ),
    [platformState.tickets, statusFilter]
  );

  const selectedTicket = useMemo(
    () =>
      filteredTickets.find((t) => t.id === selectedTicketId) ??
      filteredTickets[0] ??
      null,
    [filteredTickets, selectedTicketId]
  );

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !noteInput.trim()) return;
    await updateSupportTicket({
      ticketId: selectedTicket.id,
      newInternalNote: noteInput.trim(),
    });
    setNoteInput('');
  };

  return (
    <div className="space-y-5">
      <ErpPageHeader
        title={pt.platformNav.support}
        subtitle={
          locale === 'es'
            ? 'Mesa de soporte SaaS por empresa. Permite asignar operador, actualizar estado y registrar notas internas.'
            : 'SaaS support desk per tenant. Assign operators, update statuses, and record internal notes.'
        }
      />

      {/* Strict SaaS privacy boundary notice */}
      <ErpSurfaceCard padding="sm" className="flex items-start gap-2.5 text-xs text-[var(--nr-text-secondary)]">
        <ShieldCheck className="w-4 h-4 text-[var(--nr-primary)] shrink-0 mt-0.5" />
        <span>
          {locale === 'es'
            ? 'Aislamiento operativo: la consola de soporte SaaS no permite suplantar sesiones ni consultar salarios, nóminas o ventas del cliente.'
            : 'Operational isolation: SaaS support does not impersonate client sessions or expose tenant salaries, payrolls, or sales.'}
        </span>
      </ErpSurfaceCard>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Ticket list */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--nr-text-secondary)]">
              {locale === 'es' ? 'Tickets demo' : 'Demo tickets'}
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'ALL' | SupportTicketStatus)}
              className="nr-focus-ring h-8 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-2.5 text-xs font-semibold text-[var(--nr-text)]"
            >
              <option value="ALL">{locale === 'es' ? 'Todos' : 'All'}</option>
              <option value="OPEN">{pt.ticketStatuses.OPEN}</option>
              <option value="IN_PROGRESS">{pt.ticketStatuses.IN_PROGRESS}</option>
              <option value="RESOLVED">{pt.ticketStatuses.RESOLVED}</option>
            </select>
          </div>

          <div className="space-y-2">
            {filteredTickets.map((tkt) => {
              const active = selectedTicket?.id === tkt.id;
              return (
                <button
                  key={tkt.id}
                  type="button"
                  onClick={() => setSelectedTicketId(tkt.id)}
                  className={`nr-focus-ring nr-transition w-full text-left rounded-xl border p-3.5 space-y-1.5 ${
                    active
                      ? 'border-[var(--nr-primary)] bg-[var(--nr-success-bg)]'
                      : 'border-[var(--nr-border)] bg-[var(--nr-surface)] hover:border-[var(--nr-primary)]/60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono-num text-[11px] font-bold text-[var(--nr-primary)]">
                      {tkt.ticketNumber}
                    </span>
                    <StatusBadge
                      label={pt.ticketStatuses[tkt.status]}
                      tone={
                        tkt.status === 'RESOLVED'
                          ? 'emerald'
                          : tkt.status === 'IN_PROGRESS'
                            ? 'amber'
                            : 'crimson'
                      }
                    />
                  </div>
                  <div className="text-xs font-bold text-[var(--nr-text)]">
                    {locale === 'es' ? tkt.subjectEs : tkt.subjectEn}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[var(--nr-text-secondary)]">
                    <span>{tkt.tenantName}</span>
                    <span>{tkt.assignedTo}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Ticket detail */}
        <div className="lg:col-span-7">
          {selectedTicket ? (
            <ErpSurfaceCard className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-[var(--nr-border)]">
                <div>
                  <div className="flex items-center gap-2">
                    <LifeBuoy className="w-4 h-4 text-[var(--nr-primary)]" />
                    <span className="font-mono-num text-xs font-bold text-[var(--nr-primary)]">
                      {selectedTicket.ticketNumber}
                    </span>
                    <StatusBadge
                      label={pt.ticketCategories[selectedTicket.category]}
                      tone="neutral"
                    />
                  </div>
                  <h2 className="font-display text-base font-bold text-[var(--nr-text)] mt-1">
                    {locale === 'es' ? selectedTicket.subjectEs : selectedTicket.subjectEn}
                  </h2>
                  <button
                    type="button"
                    onClick={() => openTenantDetail(selectedTicket.tenantId)}
                    className="nr-focus-ring text-xs font-semibold text-[var(--nr-primary)] hover:underline mt-0.5 rounded"
                  >
                    {selectedTicket.tenantName}
                  </button>
                </div>

                <span className="font-mono-num text-[11px] text-[var(--nr-text-secondary)]">
                  {selectedTicket.createdAt}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-[var(--nr-text-secondary)] mb-1">
                    {locale === 'es' ? 'Estado del ticket' : 'Ticket status'}
                  </label>
                  <select
                    disabled={isMutating}
                    value={selectedTicket.status}
                    onChange={(e) =>
                      updateSupportTicket({
                        ticketId: selectedTicket.id,
                        status: e.target.value as SupportTicketStatus,
                      })
                    }
                    className="nr-focus-ring w-full h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-2.5 font-semibold text-[var(--nr-text)]"
                  >
                    <option value="OPEN">{pt.ticketStatuses.OPEN}</option>
                    <option value="IN_PROGRESS">{pt.ticketStatuses.IN_PROGRESS}</option>
                    <option value="RESOLVED">{pt.ticketStatuses.RESOLVED}</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[var(--nr-text-secondary)] mb-1">
                    {locale === 'es' ? 'Operador asignado' : 'Assigned operator'}
                  </label>
                  <select
                    disabled={isMutating}
                    value={selectedTicket.assignedTo}
                    onChange={(e) =>
                      updateSupportTicket({
                        ticketId: selectedTicket.id,
                        assignedTo: e.target.value,
                      })
                    }
                    className="nr-focus-ring w-full h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-2.5 font-semibold text-[var(--nr-text)]"
                  >
                    {OPERATORS.map((op) => (
                      <option key={op} value={op}>
                        {op}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Internal notes */}
              <div className="pt-3 border-t border-[var(--nr-border)] space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-[var(--nr-text-secondary)]">
                  {locale === 'es' ? 'Notas internas de seguimiento' : 'Internal support notes'}
                </div>

                {selectedTicket.internalNotes.length === 0 ? (
                  <p className="text-xs text-[var(--nr-text-secondary)]">
                    {locale === 'es'
                      ? 'Sin notas internas todavía.'
                      : 'No internal notes recorded yet.'}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selectedTicket.internalNotes.map((n) => (
                      <div
                        key={n.id}
                        className="rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] p-3 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between text-[11px] text-[var(--nr-text-secondary)]">
                          <span className="font-semibold text-[var(--nr-text)]">
                            {n.author}
                          </span>
                          <span className="font-mono-num">{n.timestamp}</span>
                        </div>
                        <p className="text-[var(--nr-text-secondary)]">{n.text}</p>
                      </div>
                    ))}
                  </div>
                )}

                <form onSubmit={handleAddNote} className="flex flex-col sm:flex-row gap-2">
                  <input
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    placeholder={
                      locale === 'es'
                        ? 'Agregar nota interna de operador…'
                        : 'Add internal operator note…'
                    }
                    className="nr-focus-ring nr-transition flex-1 h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-3 text-xs text-[var(--nr-text)]"
                  />
                  <button
                    type="submit"
                    disabled={isMutating || !noteInput.trim()}
                    className="nr-focus-ring nr-transition inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-lg bg-[var(--nr-primary)] hover:bg-[var(--nr-primary-hover)] disabled:opacity-50 text-xs font-semibold text-[var(--nr-primary-fg)] whitespace-nowrap"
                  >
                    <MessageSquarePlus className="w-3.5 h-3.5" />
                    <span>{locale === 'es' ? 'Guardar nota' : 'Save note'}</span>
                  </button>
                </form>
              </div>
            </ErpSurfaceCard>
          ) : (
            <ErpStatePanel
              variant="empty"
              title={
                locale === 'es'
                  ? 'No hay tickets para este filtro.'
                  : 'No matching tickets.'
              }
            />
          )}
        </div>
      </div>
    </div>
  );
};
