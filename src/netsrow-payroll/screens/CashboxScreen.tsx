import React, { useMemo, useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  FileText,
  Landmark,
  Lock,
  Plus,
  Unlock,
  X,
} from 'lucide-react';
import { DataTable, DataTableColumn } from '../components/DataTable';
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
    const val = Number(openingAmount);
    await openCashbox(Number.isNaN(val) ? 0 : val);
  };

  const handleCloseShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!openSession) return;
    await closeCashbox(effectiveCountedCash);
    setCountedCash('');
  };

  const handleAddMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    await recordCashMovement(movType, Number(movAmount) || 0, movNote.trim());
    setMovOpen(false);
    setMovAmount('');
    setMovNote('');
  };

  const movementCols: DataTableColumn<CashMovement>[] = [
    {
      key: 'ts',
      header: locale === 'es' ? 'Fecha / Hora' : 'Timestamp',
      stickyLeft: true,
      render: (m) => <span className="font-mono-num text-xs">{m.timestamp}</span>,
    },
    {
      key: 'ref',
      header: locale === 'es' ? 'Referencia' : 'Reference',
      render: (m) => (
        <span className="font-mono-num text-xs font-semibold text-emerald-700 dark:text-emerald-400">
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
        <span className="text-xs text-slate-700 dark:text-slate-300">
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
          <div className="font-mono-num text-xs font-semibold">{s.openedAt}</div>
          <div className="text-[11px] text-slate-500">{s.cashierName}</div>
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
              {t.navigation.cashbox} · {activeBranch?.name ?? ''}
            </h1>
            <StatusBadge label={t.topBar.demoOnlyTag} tone="amber" />
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {locale === 'es'
              ? 'Control de apertura de turno, ingresos/egresos de caja, cobros en efectivo del POS y arqueo de cierre.'
              : 'Shift opening, manual cash inflows/outflows, POS cash sales sync, and register closing reconciliation.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {openSession && (
            <>
              <button
                type="button"
                onClick={() => {
                  setMovType('INCOME');
                  setMovOpen(true);
                }}
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded border border-emerald-600/30 bg-emerald-50 dark:bg-emerald-950/40 text-xs font-semibold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100"
              >
                <ArrowDownLeft className="w-3.5 h-3.5" />
                <span>{locale === 'es' ? 'Ingreso / Egreso' : 'Cash In / Out'}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveScreen('pos')}
                className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{locale === 'es' ? 'Ir a vender en POS' : 'Open POS'}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Submenu Tabs */}
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 dark:border-slate-800">
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
            className={`px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-emerald-600 text-emerald-700 dark:border-emerald-400 dark:text-emerald-300'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
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
            <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-700 dark:text-amber-300 shrink-0">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-display text-base font-bold text-slate-900 dark:text-slate-100">
                      {locale === 'es' ? 'Caja cerrada actualmente' : 'Cash register currently closed'}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {locale === 'es'
                        ? 'Abre un turno con el fondo inicial para habilitar cobros en efectivo desde el POS.'
                        : 'Open a shift with an initial cash float to enable cash sales in POS.'}
                    </p>
                  </div>
                </div>

                <form
                  onSubmit={handleOpenShift}
                  className="flex flex-wrap items-end gap-2.5"
                >
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      {locale === 'es' ? 'Fondo inicial (RD$)' : 'Opening float (RD$)'}
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={openingAmount}
                      onChange={(e) => setOpeningAmount(e.target.value)}
                      className="w-40 h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm font-mono-num"
                    />
                  </div>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 h-9 px-4 rounded bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white"
                  >
                    <Unlock className="w-3.5 h-3.5" />
                    <span>{locale === 'es' ? 'Abrir caja' : 'Open cashbox'}</span>
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
              <div className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/30 p-4">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                  {locale === 'es' ? 'Estado del turno' : 'Shift status'}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <StatusBadge
                    label={locale === 'es' ? 'Caja abierta' : 'Register open'}
                    tone="emerald"
                    icon="approved"
                  />
                </div>
                <div className="mt-2 text-[11px] text-slate-500 font-mono-num">
                  {openSession.openedAt}
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  {locale === 'es' ? 'Fondo inicial' : 'Opening float'}
                </div>
                <div className="mt-2">
                  <MoneyCell amount={openSession.openingAmount} locale={locale} size="lg" />
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  {locale === 'es' ? 'Ventas en efectivo' : 'Cash sales'}
                </div>
                <div className="mt-2">
                  <MoneyCell amount={openSession.cashSalesTotal} locale={locale} size="lg" emphasize />
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  {locale === 'es' ? 'Ingresos / Egresos' : 'In / Out'}
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs font-mono-num">
                  <span className="text-emerald-700 dark:text-emerald-400">
                    +{openSession.otherIncomesTotal.toFixed(2)}
                  </span>
                  <span className="text-slate-400">/</span>
                  <span className="text-red-600 dark:text-red-400">
                    -{openSession.expensesTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  {locale === 'es' ? 'Efectivo esperado' : 'Expected cash'}
                </div>
                <div className="mt-2">
                  <MoneyCell amount={openSession.expectedCash} locale={locale} size="lg" emphasize />
                </div>
              </div>
            </div>
          )}

          <div>
            <h2 className="font-display text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">
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
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-bold">
                {locale === 'es' ? 'Cierre y arqueo de caja' : 'Register closing & cash count'}
              </h2>
              <Landmark className="w-4 h-4 text-emerald-600" />
            </div>

            {!openSession ? (
              <div className="rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-4 text-xs text-slate-600 dark:text-slate-300 space-y-3">
                <p>
                  {locale === 'es'
                    ? 'No hay un turno abierto para cerrar. Abre una caja en la pestaña «Apertura y turno» para iniciar operaciones.'
                    : 'There is no open shift to close. Open a cashbox shift first.'}
                </p>
                <button
                  type="button"
                  onClick={() => setTab('shift')}
                  className="inline-flex items-center gap-1.5 h-8 px-3 rounded bg-emerald-600 text-white font-semibold text-xs"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>{locale === 'es' ? 'Ir a Apertura de caja' : 'Go to Shift Opening'}</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleCloseShift} className="space-y-4">
                <div className="rounded border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  <div className="flex justify-between p-2.5">
                    <span>{locale === 'es' ? 'Fondo inicial' : 'Opening float'}</span>
                    <MoneyCell amount={openSession.openingAmount} locale={locale} />
                  </div>
                  <div className="flex justify-between p-2.5">
                    <span>{locale === 'es' ? 'Ventas en efectivo POS' : 'POS cash sales'}</span>
                    <MoneyCell amount={openSession.cashSalesTotal} locale={locale} />
                  </div>
                  <div className="flex justify-between p-2.5">
                    <span>{locale === 'es' ? 'Otros ingresos' : 'Other cash inflows'}</span>
                    <MoneyCell amount={openSession.otherIncomesTotal} locale={locale} />
                  </div>
                  <div className="flex justify-between p-2.5">
                    <span>{locale === 'es' ? 'Egresos registrados' : 'Recorded expenses'}</span>
                    <MoneyCell amount={-openSession.expensesTotal} locale={locale} />
                  </div>
                  <div className="flex justify-between p-2.5 bg-slate-50 dark:bg-slate-800/60 font-bold">
                    <span>{locale === 'es' ? 'Total efectivo esperado' : 'Expected total cash'}</span>
                    <MoneyCell amount={openSession.expectedCash} locale={locale} emphasize />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">
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
                    className="w-full h-10 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm font-mono-num"
                  />
                  <div className="mt-1.5 flex items-center justify-between text-xs">
                    <span className="text-slate-500">
                      {locale === 'es' ? 'Diferencia de arqueo:' : 'Cash variance:'}
                    </span>
                    <span
                      className={`font-mono-num font-bold ${
                        liveVariance === 0
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : 'text-amber-700 dark:text-amber-300'
                      }`}
                    >
                      RD$ {liveVariance.toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full h-10 rounded bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white flex items-center justify-center gap-2"
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
          </div>

          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
            <h2 className="font-display text-base font-bold">
              {locale === 'es' ? 'Último cierre de caja emitido' : 'Latest closing report'}
            </h2>
            {lastClosingDoc ? (
              <div className="space-y-3">
                <div className="rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-3 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono-num font-bold text-emerald-700 dark:text-emerald-400">
                      {lastClosingDoc.number}
                    </span>
                    <span className="font-mono-num text-slate-500">{lastClosingDoc.date}</span>
                  </div>
                  <div className="font-semibold">
                    {locale === 'es' ? lastClosingDoc.titleEs : lastClosingDoc.titleEn}
                  </div>
                  <div className="text-[11px] text-amber-700 dark:text-amber-300 font-semibold">
                    {locale === 'es'
                      ? lastClosingDoc.nonFiscalNoticeEs
                      : lastClosingDoc.nonFiscalNoticeEn}
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  {lastClosingDoc.lines.map((line, i) => (
                    <div key={i} className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
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
                  className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
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
              <p className="text-xs text-slate-500">{t.common.noResults}</p>
            )}
          </div>
        </div>
      )}

      {/* Manual Movement Modal */}
      {movOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60">
          <div className="w-full max-w-md rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
              <h2 className="font-display text-base font-bold">
                {locale === 'es' ? 'Registrar movimiento de caja' : 'Record cash movement'}
              </h2>
              <button type="button" onClick={() => setMovOpen(false)} className="p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddMovement} className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMovType('INCOME')}
                  className={`h-9 rounded border text-xs font-semibold flex items-center justify-center gap-1.5 ${
                    movType === 'INCOME'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                      : 'border-slate-300 dark:border-slate-700'
                  }`}
                >
                  <ArrowDownLeft className="w-3.5 h-3.5" />
                  <span>{locale === 'es' ? 'Ingreso (+)' : 'Cash In (+)'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMovType('EXPENSE')}
                  className={`h-9 rounded border text-xs font-semibold flex items-center justify-center gap-1.5 ${
                    movType === 'EXPENSE'
                      ? 'border-red-600 bg-red-50 text-red-800 dark:bg-red-950/50 dark:text-red-300'
                      : 'border-slate-300 dark:border-slate-700'
                  }`}
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>{locale === 'es' ? 'Egreso (-)' : 'Cash Out (-)'}</span>
                </button>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">
                  {locale === 'es' ? 'Importe (RD$)' : 'Amount (RD$)'}
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  value={movAmount}
                  onChange={(e) => setMovAmount(e.target.value)}
                  className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm font-mono-num"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">
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
                  className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setMovOpen(false)}
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
