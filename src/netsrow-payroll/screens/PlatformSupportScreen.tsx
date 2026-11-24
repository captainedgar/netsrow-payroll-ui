import React, { useMemo, useState } from 'react';
import { LifeBuoy, MessageSquarePlus, ShieldCheck } from 'lucide-react';
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
      <div>
        <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
          {pt.platformNav.support}
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          {locale === 'es'
            ? 'Mesa de soporte SaaS por empresa. Permite asignar operador, actualizar estado y registrar notas internas.'
            : 'SaaS support desk per tenant. Assign operators, update statuses, and record internal notes.'}
        </p>
      </div>

      {/* Strict SaaS privacy boundary notice */}
      <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <span>
          {locale === 'es'
            ? 'Aislamiento operativo: la consola de soporte SaaS no permite suplantar sesiones ni consultar salarios, nóminas o ventas del cliente.'
            : 'Operational isolation: SaaS support does not impersonate client sessions or expose tenant salaries, payrolls, or sales.'}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Ticket list */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {locale === 'es' ? 'Tickets demo' : 'Demo tickets'}
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'ALL' | SupportTicketStatus)}
              className="h-8 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 text-xs font-semibold"
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
                  className={`w-full text-left rounded-lg border p-3.5 transition-colors space-y-1.5 ${
                    active
                      ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/30'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono-num text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
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
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {locale === 'es' ? tkt.subjectEs : tkt.subjectEn}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
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
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <LifeBuoy className="w-4 h-4 text-emerald-600" />
                    <span className="font-mono-num text-xs font-bold text-emerald-700 dark:text-emerald-400">
                      {selectedTicket.ticketNumber}
                    </span>
                    <StatusBadge
                      label={pt.ticketCategories[selectedTicket.category]}
                      tone="neutral"
                    />
                  </div>
                  <h2 className="font-display text-base font-bold mt-1">
                    {locale === 'es' ? selectedTicket.subjectEs : selectedTicket.subjectEn}
                  </h2>
                  <button
                    type="button"
                    onClick={() => openTenantDetail(selectedTicket.tenantId)}
                    className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline mt-0.5"
                  >
                    {selectedTicket.tenantName}
                  </button>
                </div>

                <span className="font-mono-num text-[11px] text-slate-500">
                  {selectedTicket.createdAt}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-500 mb-1">
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
                    className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 font-semibold"
                  >
                    <option value="OPEN">{pt.ticketStatuses.OPEN}</option>
                    <option value="IN_PROGRESS">{pt.ticketStatuses.IN_PROGRESS}</option>
                    <option value="RESOLVED">{pt.ticketStatuses.RESOLVED}</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-500 mb-1">
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
                    className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 font-semibold"
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
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {locale === 'es' ? 'Notas internas de seguimiento' : 'Internal support notes'}
                </div>

                {selectedTicket.internalNotes.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    {locale === 'es'
                      ? 'Sin notas internas todavía.'
                      : 'No internal notes recorded yet.'}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selectedTicket.internalNotes.map((n) => (
                      <div
                        key={n.id}
                        className="rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-3 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {n.author}
                          </span>
                          <span className="font-mono-num">{n.timestamp}</span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300">{n.text}</p>
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
                    className="flex-1 h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs"
                  />
                  <button
                    type="submit"
                    disabled={isMutating || !noteInput.trim()}
                    className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-xs font-semibold text-white whitespace-nowrap"
                  >
                    <MessageSquarePlus className="w-3.5 h-3.5" />
                    <span>{locale === 'es' ? 'Guardar nota' : 'Save note'}</span>
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center text-xs text-slate-500">
              {locale === 'es' ? 'No hay tickets para este filtro.' : 'No matching tickets.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
