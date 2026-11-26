import React, { useMemo, useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  FileText,
  Landmark,
  Loader2,
  Lock,
  Plus,
  Unlock,
} from 'lucide-react';
import { DataTable, DataTableColumn } from '../components/DataTable';
import {
  ErpConfirmDialog,
  ErpModal,
  ErpPageHeader,
  ErpStatePanel,
  ErpSurfaceCard,
} from '../components/ErpUiPrimitives';
import { MoneyCell } from '../components/MoneyCell';
import { StatusBadge } from '../components/StatusBadge';
import { usePayrollWorkspace } from '../context/PayrollWorkspaceContext';
import { CashMovement, CashRegisterSession } from '../types/erp';

type CashboxTab = 'shift' | 'movements' | 'closing';

export const CashboxScreen: React.FC = () => {
  const {
    activeScreen,
    setActiveScreen,
    erpState,
    activeBranch,
    locale,
    t,
    openCashbox,
    closeCashbox,
    recordCashMovement,
    setSelectedDocumentId,
  } = usePayrollWorkspace();

  const activeTab: CashboxTab = useMemo(() => {
    if (activeScreen === 'cashbox_movements') return 'movements';
    if (activeScreen === 'cashbox_closing') return 'closing';
    return 'shift';
  }, [activeScreen]);

  const setTab = (tab: CashboxTab) => {
    const map: Record<CashboxTab, typeof activeScreen> = {
      shift: 'cashbox_shift',
      movements: 'cashbox_movements',
      closing: 'cashbox_closing',
    };
    setActiveScreen(map[tab]);
  };

  const openSession = useMemo(
    () => erpState.cashSessions.find((s) => s.status === 'OPEN') ?? null,
    [erpState.cashSessions]
  );

  const [openingAmount, setOpeningAmount] = useState('5000');
  const [countedCash, setCountedCash] = useState('');
  const [movOpen, setMovOpen] = useState(false);
  const [movType, setMovType] = useState<'INCOME' | 'EXPENSE'>('INCOME');
  const [movAmount, setMovAmount] = useState('');
  const [movNote, setMovNote] = useState('');
  const [closeConfirmOpen, setCloseConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const effectiveCountedCash = useMemo(() => {
    if (!openSession) return 0;
    if (countedCash.trim() === '') return openSession.expectedCash;
    const parsed = Number(countedCash);
    return Number.isNaN(parsed) ? 0 : parsed;
  }, [openSession, countedCash]);

  const liveVariance = useMemo(() => {
    if (!openSession) return 0;
    return Math.round((effectiveCountedCash - openSession.expectedCash) * 100) / 100;
  }, [openSession, effectiveCountedCash]);

  const handleOpenShift = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const val = Number(openingAmount);
      await openCashbox(Number.isNaN(val) ? 0 : val);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmCloseShift = async () => {
    if (!openSession) return;
    setIsSubmitting(true);
    try {
      await closeCashbox(effectiveCountedCash);
      setCountedCash('');
      setCloseConfirmOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await recordCashMovement(movType, Number(movAmount) || 0, movNote.trim());
      setMovOpen(false);
      setMovAmount('');
      setMovNote('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const movementCols: DataTableColumn<CashMovement>[] = [
    {
      key: 'ts',
      header: locale === 'es' ? 'Fecha / Hora' : 'Timestamp',
      stickyLeft: true,
      render: (m) => (
        <span className="font-mono-num text-xs text-[var(--nr-text-secondary)]">
          {m.timestamp}
        </span>
      ),
    },
    {
      key: 'ref',
      header: locale === 'es' ? 'Referencia' : 'Reference',
      render: (m) => (
        <span className="font-mono-num text-xs font-semibold text-[var(--nr-primary)]">
          {m.reference}
        </span>
      ),
    },
    {
      key: 'type',
      header: locale === 'es' ? 'Tipo' : 'Type',
      render: (m) => {
        const tone =
          m.type === 'EXPENSE'
            ? 'crimson'
            : m.type === 'SALE_CASH' || m.type === 'INCOME'
              ? 'emerald'
              : 'neutral';
        return <StatusBadge label={m.type} tone={tone} />;
      },
    },
    {
      key: 'note',
      header: locale === 'es' ? 'Detalle' : 'Detail',
      minWidthClass: 'min-w-[200px]',
      render: (m) => (
        <span className="text-xs text-[var(--nr-text)]">
          {locale === 'es' ? m.noteEs : m.noteEn}
        </span>
      ),
    },
    {
      key: 'amount',
      header: locale === 'es' ? 'Importe' : 'Amount',
      align: 'right',
      render: (m) => (
        <MoneyCell
          amount={m.type === 'EXPENSE' ? -m.amount : m.amount}
          locale={locale}
          emphasize={m.type === 'SALE_CASH' || m.type === 'INCOME'}
        />
      ),
    },
  ];

  const sessionCols: DataTableColumn<CashRegisterSession>[] = [
    {
      key: 'opened',
      header: locale === 'es' ? 'Apertura' : 'Opened',
      stickyLeft: true,
      render: (s) => (
        <div>
          <div className="font-mono-num text-xs font-semibold text-[var(--nr-text)]">
            {s.openedAt}
          </div>
          <div className="text-[11px] text-[var(--nr-text-secondary)]">{s.cashierName}</div>
        </div>
      ),
    },
    {
      key: 'status',
      header: t.common.status,
      render: (s) => (
        <StatusBadge
          label={
            s.status === 'OPEN'
              ? locale === 'es'
                ? 'Turno abierto'
                : 'Open shift'
              : locale === 'es'
                ? 'Cerrada'
                : 'Closed'
          }
          tone={s.status === 'OPEN' ? 'emerald' : 'neutral'}
          icon={s.status === 'OPEN' ? 'approved' : 'lock'}
        />
      ),
    },
    {
      key: 'opening',
      header: locale === 'es' ? 'Fondo inicial' : 'Opening float',
      align: 'right',
      render: (s) => <MoneyCell amount={s.openingAmount} locale={locale} />,
    },
    {
      key: 'sales',
      header: locale === 'es' ? 'Ventas efectivo' : 'Cash sales',
      align: 'right',
      render: (s) => <MoneyCell amount={s.cashSalesTotal} locale={locale} emphasize />,
    },
    {
      key: 'expected',
      header: locale === 'es' ? 'Esperado' : 'Expected',
      align: 'right',
      render: (s) => <MoneyCell amount={s.expectedCash} locale={locale} />,
    },
    {
      key: 'counted',
      header: locale === 'es' ? 'Contado' : 'Counted',
      align: 'right',
      render: (s) => <MoneyCell amount={s.countedCash} locale={locale} />,
    },
    {
      key: 'variance',
      header: locale === 'es' ? 'Diferencia' : 'Variance',
      align: 'right',
      render: (s) => <MoneyCell amount={s.variance} locale={locale} />,
    },
  ];

  const lastClosingDoc = useMemo(
    () => erpState.internalDocs.find((d) => d.type === 'CASH_CLOSING') ?? null,
    [erpState.internalDocs]
  );

  return (
    <div className="space-y-5">
      <ErpPageHeader
        title={`${t.navigation.cashbox} · ${activeBranch?.name ?? ''}`}
        subtitle={
          locale === 'es'
            ? 'Control de apertura de turno, ingresos/egresos de caja, cobros en efectivo del POS y arqueo de cierre.'
            : 'Shift opening, manual cash inflows/outflows, POS cash sales sync, and register closing reconciliation.'
        }
        badge={<StatusBadge label={t.topBar.demoOnlyTag} tone="amber" />}
        actions={
          openSession ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setMovType('INCOME');
                  setMovOpen(true);
                }}
                className="nr-focus-ring nr-transition inline-flex items-center gap-1.5 h-10 px-3.5 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface)] hover:border-[var(--nr-primary)] text-xs font-semibold text-[var(--nr-text)]"
              >
                <ArrowDownLeft className="w-3.5 h-3.5 text-[var(--nr-primary)]" />
                <span>{locale === 'es' ? 'Ingreso / Egreso' : 'Cash In / Out'}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveScreen('pos')}
                className="nr-focus-ring nr-transition inline-flex items-center gap-1.5 h-10 px-4 rounded-lg bg-[var(--nr-primary)] hover:bg-[var(--nr-primary-hover)] text-xs font-semibold text-[var(--nr-primary-fg)]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{locale === 'es' ? 'Ir a vender en POS' : 'Open POS'}</span>
              </button>
            </>
          ) : undefined
        }
      />

      {/* Submenu Tabs */}
      <div className="flex flex-wrap items-center gap-1 border-b border-[var(--nr-border)]">
        {(
          [
            { id: 'shift', label: t.navigation.cashboxShift },
            {
              id: 'movements',
              label: `${t.navigation.cashboxMovements} (${erpState.cashMovements.length})`,
            },
            { id: 'closing', label: t.navigation.cashboxClosing },
          ] as { id: CashboxTab; label: string }[]
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setTab(tab.id)}
            className={`nr-focus-ring nr-transition px-3.5 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-[var(--nr-primary)] text-[var(--nr-primary)]'
                : 'border-transparent text-[var(--nr-text-secondary)] hover:text-[var(--nr-text)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active Shift / Open Box */}
      {activeTab === 'shift' && (
        <div className="space-y-5">
          {!openSession ? (
            <ErpSurfaceCard
              padding="lg"
              className="border-[var(--nr-warning-border)] bg-[var(--nr-surface)]"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl border border-[var(--nr-warning-border)] bg-[var(--nr-warning-bg)] flex items-center justify-center text-[var(--nr-warning)] shrink-0">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-display text-base font-bold text-[var(--nr-text)]">
                      {locale === 'es'
                        ? 'Caja cerrada actualmente'
                        : 'Cash register currently closed'}
                    </h2>
                    <p className="text-xs text-[var(--nr-text-secondary)] mt-0.5">
                      {locale === 'es'
                        ? 'Abre un turno con el fondo inicial para habilitar cobros en efectivo desde el POS.'
                        : 'Open a shift with an initial cash float to enable cash sales in POS.'}
                    </p>
                  </div>
                </div>

                <form onSubmit={handleOpenShift} className="flex flex-wrap items-end gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--nr-text-secondary)] mb-1">
                      {locale === 'es' ? 'Fondo inicial (RD$)' : 'Opening float (RD$)'}
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={openingAmount}
                      onChange={(e) => setOpeningAmount(e.target.value)}
                      className="nr-focus-ring w-40 h-10 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-3 text-sm font-mono-num text-[var(--nr-text)]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="nr-focus-ring nr-transition inline-flex items-center gap-1.5 h-10 px-4 rounded-lg bg-[var(--nr-primary)] hover:bg-[var(--nr-primary-hover)] text-xs font-semibold text-[var(--nr-primary-fg)] disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Unlock className="w-3.5 h-3.5" />
                    )}
                    <span>{locale === 'es' ? 'Abrir caja' : 'Open cashbox'}</span>
                  </button>
                </form>
              </div>
            </ErpSurfaceCard>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
              <div className="rounded-xl border border-[var(--nr-success-border)] bg-[var(--nr-success-bg)] p-4">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--nr-success)]">
                  {locale === 'es' ? 'Estado del turno' : 'Shift status'}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <StatusBadge
                    label={locale === 'es' ? 'Caja abierta' : 'Register open'}
                    tone="emerald"
                    icon="approved"
                  />
                </div>
                <div className="mt-2 text-[11px] text-[var(--nr-text-secondary)] font-mono-num">
                  {openSession.openedAt}
                </div>
              </div>

              <ErpSurfaceCard padding="sm">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--nr-text-secondary)]">
                  {locale === 'es' ? 'Fondo inicial' : 'Opening float'}
                </div>
                <div className="mt-2">
                  <MoneyCell amount={openSession.openingAmount} locale={locale} size="lg" />
                </div>
              </ErpSurfaceCard>

              <ErpSurfaceCard padding="sm">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--nr-text-secondary)]">
                  {locale === 'es' ? 'Ventas en efectivo' : 'Cash sales'}
                </div>
                <div className="mt-2">
                  <MoneyCell amount={openSession.cashSalesTotal} locale={locale} size="lg" emphasize />
                </div>
              </ErpSurfaceCard>

              <ErpSurfaceCard padding="sm">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--nr-text-secondary)]">
                  {locale === 'es' ? 'Ingresos / Egresos' : 'In / Out'}
                </div>
                <div className="mt-2 flex items-center gap-2 text-sm font-mono-num font-bold">
                  <span className="text-[var(--nr-primary)]">
                    +{openSession.otherIncomesTotal.toFixed(2)}
                  </span>
                  <span className="text-[var(--nr-text-secondary)]">/</span>
                  <span className="text-[var(--nr-error)]">
                    -{openSession.expensesTotal.toFixed(2)}
                  </span>
                </div>
              </ErpSurfaceCard>

              <ErpSurfaceCard padding="sm">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--nr-text-secondary)]">
                  {locale === 'es' ? 'Efectivo esperado' : 'Expected cash'}
                </div>
                <div className="mt-2">
                  <MoneyCell amount={openSession.expectedCash} locale={locale} size="lg" emphasize />
                </div>
              </ErpSurfaceCard>
            </div>
          )}

          <div>
            <h2 className="font-display text-sm font-bold text-[var(--nr-text)] mb-2.5">
              {locale === 'es' ? 'Historial de turnos de caja' : 'Cash register shift history'}
            </h2>
            <DataTable
              columns={sessionCols}
              rows={erpState.cashSessions}
              getRowKey={(s) => s.id}
              emptyMessage={t.common.noResults}
            />
          </div>
        </div>
      )}

      {/* Movements Tab */}
      {activeTab === 'movements' && (
        <DataTable
          columns={movementCols}
          rows={erpState.cashMovements}
          getRowKey={(m) => m.id}
          emptyMessage={t.common.noResults}
        />
      )}

      {/* Closing Tab */}
      {activeTab === 'closing' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <ErpSurfaceCard padding="md" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-bold text-[var(--nr-text)]">
                {locale === 'es' ? 'Cierre y arqueo de caja' : 'Register closing & cash count'}
              </h2>
              <Landmark className="w-4 h-4 text-[var(--nr-primary)]" />
            </div>

            {!openSession ? (
              <ErpStatePanel
                variant="pending"
                title={locale === 'es' ? 'Sin turno abierto' : 'No open shift'}
                description={
                  locale === 'es'
                    ? 'No hay un turno abierto para cerrar. Abre una caja en la pestaña «Apertura y turno» para iniciar operaciones.'
                    : 'There is no open shift to close. Open a cashbox shift first.'
                }
                actionLabel={locale === 'es' ? 'Ir a Apertura de caja' : 'Go to Shift Opening'}
                onAction={() => setTab('shift')}
              />
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setCloseConfirmOpen(true);
                }}
                className="space-y-4"
              >
                <div className="rounded-lg border border-[var(--nr-border)] divide-y divide-[var(--nr-border)] text-xs">
                  <div className="flex justify-between p-2.5">
                    <span className="text-[var(--nr-text-secondary)]">
                      {locale === 'es' ? 'Fondo inicial' : 'Opening float'}
                    </span>
                    <MoneyCell amount={openSession.openingAmount} locale={locale} />
                  </div>
                  <div className="flex justify-between p-2.5">
                    <span className="text-[var(--nr-text-secondary)]">
                      {locale === 'es' ? 'Ventas en efectivo POS' : 'POS cash sales'}
                    </span>
                    <MoneyCell amount={openSession.cashSalesTotal} locale={locale} />
                  </div>
                  <div className="flex justify-between p-2.5">
                    <span className="text-[var(--nr-text-secondary)]">
                      {locale === 'es' ? 'Otros ingresos' : 'Other cash inflows'}
                    </span>
                    <MoneyCell amount={openSession.otherIncomesTotal} locale={locale} />
                  </div>
                  <div className="flex justify-between p-2.5">
                    <span className="text-[var(--nr-text-secondary)]">
                      {locale === 'es' ? 'Egresos registrados' : 'Recorded expenses'}
                    </span>
                    <MoneyCell amount={-openSession.expensesTotal} locale={locale} />
                  </div>
                  <div className="flex justify-between p-2.5 bg-[var(--nr-surface-elevated)] font-bold text-[var(--nr-text)]">
                    <span>{locale === 'es' ? 'Total efectivo esperado' : 'Expected total cash'}</span>
                    <MoneyCell amount={openSession.expectedCash} locale={locale} emphasize />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--nr-text)] mb-1">
                    {locale === 'es'
                      ? 'Efectivo físico contado (RD$)'
                      : 'Counted physical cash (RD$)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder={openSession.expectedCash.toFixed(2)}
                    value={countedCash}
                    onChange={(e) => setCountedCash(e.target.value)}
                    className="nr-focus-ring w-full h-10 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-3 text-sm font-mono-num text-[var(--nr-text)]"
                  />
                  <div className="mt-1.5 flex items-center justify-between text-xs">
                    <span className="text-[var(--nr-text-secondary)]">
                      {locale === 'es' ? 'Diferencia de arqueo:' : 'Cash variance:'}
                    </span>
                    <span
                      className={`font-mono-num font-bold ${
                        liveVariance === 0
                          ? 'text-[var(--nr-primary)]'
                          : 'text-[var(--nr-warning)]'
                      }`}
                    >
                      RD$ {liveVariance.toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="nr-focus-ring nr-transition w-full h-10 rounded-lg bg-[var(--nr-primary)] hover:bg-[var(--nr-primary-hover)] text-xs font-semibold text-[var(--nr-primary-fg)] flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {locale === 'es'
                      ? 'Confirmar cierre de caja y emitir acta'
                      : 'Confirm cashbox closing & issue report'}
                  </span>
                </button>
              </form>
            )}
          </ErpSurfaceCard>

          <ErpSurfaceCard padding="md" className="space-y-4">
            <h2 className="font-display text-base font-bold text-[var(--nr-text)]">
              {locale === 'es' ? 'Último cierre de caja emitido' : 'Latest closing report'}
            </h2>
            {lastClosingDoc ? (
              <div className="space-y-3">
                <div className="rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] p-3 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono-num font-bold text-[var(--nr-primary)]">
                      {lastClosingDoc.number}
                    </span>
                    <span className="font-mono-num text-[var(--nr-text-secondary)]">
                      {lastClosingDoc.date}
                    </span>
                  </div>
                  <div className="font-semibold text-[var(--nr-text)]">
                    {locale === 'es' ? lastClosingDoc.titleEs : lastClosingDoc.titleEn}
                  </div>
                  <div className="text-[11px] text-[var(--nr-warning)] font-semibold">
                    {locale === 'es'
                      ? lastClosingDoc.nonFiscalNoticeEs
                      : lastClosingDoc.nonFiscalNoticeEn}
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  {lastClosingDoc.lines.map((line, i) => (
                    <div
                      key={i}
                      className="flex justify-between py-1.5 border-b border-[var(--nr-border)] text-[var(--nr-text)]"
                    >
                      <span>{line.label}</span>
                      <MoneyCell amount={line.amount} locale={locale} />
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedDocumentId(lastClosingDoc.id);
                    setActiveScreen('internal_docs');
                  }}
                  className="nr-focus-ring nr-transition inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] hover:border-[var(--nr-primary)] text-xs font-semibold text-[var(--nr-text)]"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>
                    {locale === 'es'
                      ? 'Ver en Documentos internos'
                      : 'View in Internal Documents'}
                  </span>
                </button>
              </div>
            ) : (
              <ErpStatePanel variant="empty" title={t.common.noResults} />
            )}
          </ErpSurfaceCard>
        </div>
      )}

      {/* Manual Movement Modal */}
      <ErpModal
        open={movOpen}
        onClose={() => setMovOpen(false)}
        title={locale === 'es' ? 'Registrar movimiento de caja' : 'Record cash movement'}
        maxWidthClass="max-w-md"
        closeLabel={t.common.cancel}
      >
        <form onSubmit={handleAddMovement} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setMovType('INCOME')}
              className={`nr-focus-ring nr-transition h-10 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 ${
                movType === 'INCOME'
                  ? 'border-[var(--nr-primary)] bg-[var(--nr-success-bg)] text-[var(--nr-success)]'
                  : 'border-[var(--nr-border)] bg-[var(--nr-surface)] text-[var(--nr-text)]'
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>{locale === 'es' ? 'Ingreso (+)' : 'Cash In (+)'}</span>
            </button>
            <button
              type="button"
              onClick={() => setMovType('EXPENSE')}
              className={`nr-focus-ring nr-transition h-10 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 ${
                movType === 'EXPENSE'
                  ? 'border-[var(--nr-error-border)] bg-[var(--nr-error-bg)] text-[var(--nr-error)]'
                  : 'border-[var(--nr-border)] bg-[var(--nr-surface)] text-[var(--nr-text)]'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>{locale === 'es' ? 'Egreso (-)' : 'Cash Out (-)'}</span>
            </button>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--nr-text)] mb-1">
              {locale === 'es' ? 'Importe (RD$)' : 'Amount (RD$)'}
            </label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              required
              value={movAmount}
              onChange={(e) => setMovAmount(e.target.value)}
              className="nr-focus-ring w-full h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-3 text-sm font-mono-num text-[var(--nr-text)]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--nr-text)] mb-1">
              {locale === 'es' ? 'Concepto / Nota' : 'Note'}
            </label>
            <input
              type="text"
              required
              value={movNote}
              onChange={(e) => setMovNote(e.target.value)}
              placeholder={
                locale === 'es' ? 'Ej. Pago mensajería local' : 'e.g. Local courier fee'
              }
              className="nr-focus-ring w-full h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-3 text-sm text-[var(--nr-text)]"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-[var(--nr-border)]">
            <button
              type="button"
              onClick={() => setMovOpen(false)}
              className="nr-focus-ring nr-transition h-9 px-3.5 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface)] text-xs font-semibold text-[var(--nr-text)] hover:bg-[var(--nr-surface-muted)]"
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="nr-focus-ring nr-transition h-9 px-4 rounded-lg bg-[var(--nr-primary)] hover:bg-[var(--nr-primary-hover)] text-xs font-semibold text-[var(--nr-primary-fg)] disabled:opacity-50"
            >
              {t.common.save}
            </button>
          </div>
        </form>
      </ErpModal>

      <ErpConfirmDialog
        open={closeConfirmOpen}
        onClose={() => setCloseConfirmOpen(false)}
        onConfirm={handleConfirmCloseShift}
        title={locale === 'es' ? 'Confirmar cierre de caja' : 'Confirm register closing'}
        description={
          locale === 'es'
            ? `Se cerrará el turno actual con RD$ ${effectiveCountedCash.toFixed(2)} contados (diferencia RD$ ${liveVariance.toFixed(2)}) y se emitirá el acta interna de cierre.`
            : `The current shift will close with RD$ ${effectiveCountedCash.toFixed(2)} counted (variance RD$ ${liveVariance.toFixed(2)}) and generate the closing report.`
        }
        confirmLabel={locale === 'es' ? 'Cerrar caja' : 'Close cashbox'}
        cancelLabel={t.common.cancel}
        isConfirming={isSubmitting}
      />
    </div>
  );
};

