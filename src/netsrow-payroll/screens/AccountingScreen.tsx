import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Eye,
  Plus,
  RefreshCw,
  X,
} from 'lucide-react';
import { DataTable, DataTableColumn } from '../components/DataTable';
import { MoneyCell } from '../components/MoneyCell';
import { StatusBadge } from '../components/StatusBadge';
import { usePayrollWorkspace } from '../context/PayrollWorkspaceContext';
import {
  AccountingPeriod,
  AccountingReconciliationItem,
  AccountType,
  GlAccount,
  JournalEntry,
} from '../types/erp';

type AccountingTab =
  | 'accounts'
  | 'periods'
  | 'journal'
  | 'ledger'
  | 'trial_balance'
  | 'reconciliation';

interface LedgerRow {
  id: string;
  entryId: string;
  entryNumber: string;
  date: string;
  reference: string;
  description: string;
  debit: number;
  credit: number;
  runningBalance: number;
}

interface TrialBalanceRow {
  accountId: string;
  code: string;
  name: string;
  type: AccountType;
  totalDebit: number;
  totalCredit: number;
  endingDebit: number;
  endingCredit: number;
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export const AccountingScreen: React.FC = () => {
  const {
    activeScreen,
    setActiveScreen,
    erpState,
    locale,
    t,
    selectedAccountId,
    setSelectedAccountId,
    openAccountLedger,
    upsertGlAccount,
    setAccountingPeriodStatus,
    createJournalEntry,
    toggleReconciliationItem,
  } = usePayrollWorkspace();

  const activeTab: AccountingTab = useMemo(() => {
    if (activeScreen === 'accounting_periods') return 'periods';
    if (activeScreen === 'accounting_journal') return 'journal';
    if (activeScreen === 'accounting_ledger') return 'ledger';
    if (activeScreen === 'accounting_trial_balance') return 'trial_balance';
    if (activeScreen === 'accounting_reconciliation') return 'reconciliation';
    return 'accounts';
  }, [activeScreen]);

  const setTab = (tab: AccountingTab) => {
    const map: Record<AccountingTab, typeof activeScreen> = {
      accounts: 'accounting_accounts',
      periods: 'accounting_periods',
      journal: 'accounting_journal',
      ledger: 'accounting_ledger',
      trial_balance: 'accounting_trial_balance',
      reconciliation: 'accounting_reconciliation',
    };
    setActiveScreen(map[tab]);
  };

  // Source journal entry inspection modal
  const [inspectEntry, setInspectEntry] = useState<JournalEntry | null>(null);

  // New/Edit GL Account modal
  const [accModalOpen, setAccModalOpen] = useState(false);
  const [editAccId, setEditAccId] = useState<string | null>(null);
  const [accCode, setAccCode] = useState('');
  const [accName, setAccName] = useState('');
  const [accType, setAccType] = useState<AccountType>('ASSET');

  // New Journal Entry modal
  const [jeModalOpen, setJeModalOpen] = useState(false);
  const [jeDate, setJeDate] = useState('2026-11-24');
  const [jePeriodId, setJePeriodId] = useState(
    erpState.accountingPeriods.find((p) => p.status === 'OPEN')?.id ??
      erpState.accountingPeriods[0]?.id ??
      ''
  );
  const [jeReference, setJeReference] = useState('');
  const [jeMemo, setJeMemo] = useState('');
  const [jeDebitAcc, setJeDebitAcc] = useState(erpState.glAccounts[0]?.id ?? 'acc-1101');
  const [jeCreditAcc, setJeCreditAcc] = useState(erpState.glAccounts[1]?.id ?? 'acc-1102');
  const [jeAmount, setJeAmount] = useState('2500');

  const accountMap = useMemo(
    () => new Map(erpState.glAccounts.map((a) => [a.id, a])),
    [erpState.glAccounts]
  );

  // Shared calculation from the EXACT same journalEntries for Plan, Mayor, and Balanza
  const accountStats = useMemo(() => {
    const stats = new Map<string, { debit: number; credit: number }>();
    erpState.glAccounts.forEach((a) => stats.set(a.id, { debit: 0, credit: 0 }));

    erpState.journalEntries.forEach((je) => {
      je.lines.forEach((line) => {
        const current = stats.get(line.accountId) ?? { debit: 0, credit: 0 };
        stats.set(line.accountId, {
          debit: round2(current.debit + line.debit),
          credit: round2(current.credit + line.credit),
        });
      });
    });
    return stats;
  }, [erpState.glAccounts, erpState.journalEntries]);

  const trialBalanceRows = useMemo<TrialBalanceRow[]>(() => {
    return erpState.glAccounts.map((acc) => {
      const st = accountStats.get(acc.id) ?? { debit: 0, credit: 0 };
      const net = round2(st.debit - st.credit);
      return {
        accountId: acc.id,
        code: acc.code,
        name: locale === 'es' ? acc.nameEs : acc.nameEn,
        type: acc.type,
        totalDebit: st.debit,
        totalCredit: st.credit,
        endingDebit: net > 0 ? net : 0,
        endingCredit: net < 0 ? Math.abs(net) : 0,
      };
    });
  }, [erpState.glAccounts, accountStats, locale]);

  const trialTotals = useMemo(() => {
    return trialBalanceRows.reduce(
      (acc, r) => ({
        debit: round2(acc.debit + r.totalDebit),
        credit: round2(acc.credit + r.totalCredit),
        endDebit: round2(acc.endDebit + r.endingDebit),
        endCredit: round2(acc.endCredit + r.endingCredit),
      }),
      { debit: 0, credit: 0, endDebit: 0, endCredit: 0 }
    );
  }, [trialBalanceRows]);

  const ledgerAccount = useMemo(
    () =>
      accountMap.get(selectedAccountId ?? '') ??
      erpState.glAccounts[0] ??
      null,
    [accountMap, selectedAccountId, erpState.glAccounts]
  );

  const ledgerRows = useMemo<LedgerRow[]>(() => {
    if (!ledgerAccount) return [];
    const chronological = [...erpState.journalEntries].sort((a, b) =>
      a.date.localeCompare(b.date)
    );
    let balance = 0;
    const rows: LedgerRow[] = [];
    chronological.forEach((je) => {
      je.lines.forEach((line) => {
        if (line.accountId !== ledgerAccount.id) return;
        const delta =
          ledgerAccount.normalSide === 'DEBIT'
            ? line.debit - line.credit
            : line.credit - line.debit;
        balance = round2(balance + delta);
        rows.push({
          id: `${je.id}-${line.id}`,
          entryId: je.id,
          entryNumber: je.number,
          date: je.date,
          reference: je.reference,
          description: locale === 'es' ? line.descriptionEs : line.descriptionEn,
          debit: line.debit,
          credit: line.credit,
          runningBalance: balance,
        });
      });
    });
    return rows;
  }, [ledgerAccount, erpState.journalEntries, locale]);

  const saveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accCode.trim() || !accName.trim()) return;
    const normalSide =
      accType === 'ASSET' || accType === 'COST' || accType === 'EXPENSE'
        ? 'DEBIT'
        : 'CREDIT';
    await upsertGlAccount({
      id: editAccId ?? `acc-${Date.now()}`,
      code: accCode.trim(),
      nameEs: accName.trim(),
      nameEn: accName.trim(),
      type: accType,
      normalSide,
      active: true,
    });
    setAccModalOpen(false);
  };

  const saveJournalEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(jeAmount);
    if (!amt || amt <= 0 || jeDebitAcc === jeCreditAcc) return;
    await createJournalEntry({
      date: jeDate,
      periodId: jePeriodId || erpState.accountingPeriods[0]?.id || '',
      reference: jeReference.trim(),
      memo: jeMemo.trim(),
      lines: [
        {
          accountId: jeDebitAcc,
          descriptionEs: jeMemo.trim() || 'Débito asiento manual',
          descriptionEn: jeMemo.trim() || 'Manual entry debit',
          debit: amt,
          credit: 0,
        },
        {
          accountId: jeCreditAcc,
          descriptionEs: jeMemo.trim() || 'Crédito asiento manual',
          descriptionEn: jeMemo.trim() || 'Manual entry credit',
          debit: 0,
          credit: amt,
        },
      ],
    });
    setJeModalOpen(false);
    setJeReference('');
    setJeMemo('');
  };

  const accountCols: DataTableColumn<GlAccount>[] = [
    {
      key: 'code',
      header: t.common.code,
      stickyLeft: true,
      render: (a) => (
        <span className="font-mono-num text-xs font-bold text-emerald-700 dark:text-emerald-400">
          {a.code}
        </span>
      ),
    },
    {
      key: 'name',
      header: locale === 'es' ? 'Cuenta contable' : 'GL Account',
      minWidthClass: 'min-w-[200px]',
      render: (a) => (
        <span className="font-semibold">{locale === 'es' ? a.nameEs : a.nameEn}</span>
      ),
    },
    {
      key: 'type',
      header: locale === 'es' ? 'Naturaleza' : 'Type',
      render: (a) => <StatusBadge label={`${a.type} · ${a.normalSide}`} tone="neutral" />,
    },
    {
      key: 'debit',
      header: locale === 'es' ? 'Débitos' : 'Debits',
      align: 'right',
      render: (a) => (
        <MoneyCell amount={accountStats.get(a.id)?.debit ?? 0} locale={locale} />
      ),
    },
    {
      key: 'credit',
      header: locale === 'es' ? 'Créditos' : 'Credits',
      align: 'right',
      render: (a) => (
        <MoneyCell amount={accountStats.get(a.id)?.credit ?? 0} locale={locale} />
      ),
    },
    {
      key: 'actions',
      header: t.common.actions,
      align: 'right',
      render: (a) => (
        <button
          type="button"
          onClick={() => openAccountLedger(a.id)}
          className="rounded border border-emerald-600/30 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-300"
        >
          {locale === 'es' ? 'Ver Mayor' : 'Ledger'}
        </button>
      ),
    },
  ];

  const periodCols: DataTableColumn<AccountingPeriod>[] = [
    {
      key: 'code',
      header: t.common.code,
      render: (p) => <span className="font-mono-num font-bold">{p.code}</span>,
    },
    {
      key: 'name',
      header: locale === 'es' ? 'Período contable' : 'Accounting period',
      render: (p) => (
        <span className="font-semibold">{locale === 'es' ? p.nameEs : p.nameEn}</span>
      ),
    },
    {
      key: 'status',
      header: t.common.status,
      render: (p) => (
        <StatusBadge
          label={p.status}
          tone={
            p.status === 'OPEN'
              ? 'emerald'
              : p.status === 'CLOSING'
                ? 'amber'
                : 'neutral'
          }
          icon={p.status === 'CLOSED' ? 'lock' : 'approved'}
        />
      ),
    },
    {
      key: 'actions',
      header: t.common.actions,
      align: 'right',
      render: (p) => (
        <select
          value={p.status}
          onChange={(e) =>
            setAccountingPeriodStatus(p.id, e.target.value as AccountingPeriod['status'])
          }
          className="h-8 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 text-xs font-semibold"
        >
          <option value="OPEN">OPEN</option>
          <option value="CLOSING">CLOSING</option>
          <option value="CLOSED">CLOSED</option>
        </select>
      ),
    },
  ];

  const ledgerCols: DataTableColumn<LedgerRow>[] = [
    {
      key: 'date',
      header: t.common.date,
      stickyLeft: true,
      render: (r) => <span className="font-mono-num text-xs">{r.date}</span>,
    },
    {
      key: 'entry',
      header: locale === 'es' ? 'Asiento' : 'Journal #',
      render: (r) => (
        <div>
          <div className="font-mono-num text-xs font-bold text-emerald-700 dark:text-emerald-400">
            {r.entryNumber}
          </div>
          <div className="font-mono-num text-[11px] text-slate-500">{r.reference}</div>
        </div>
      ),
    },
    {
      key: 'desc',
      header: locale === 'es' ? 'Descripción' : 'Description',
      minWidthClass: 'min-w-[200px]',
      render: (r) => <span className="text-xs">{r.description}</span>,
    },
    {
      key: 'debit',
      header: locale === 'es' ? 'Débito' : 'Debit',
      align: 'right',
      render: (r) => <MoneyCell amount={r.debit} locale={locale} />,
    },
    {
      key: 'credit',
      header: locale === 'es' ? 'Crédito' : 'Credit',
      align: 'right',
      render: (r) => <MoneyCell amount={r.credit} locale={locale} />,
    },
    {
      key: 'bal',
      header: locale === 'es' ? 'Saldo' : 'Balance',
      align: 'right',
      render: (r) => <MoneyCell amount={r.runningBalance} locale={locale} emphasize />,
    },
    {
      key: 'origin',
      header: t.common.actions,
      align: 'right',
      render: (r) => (
        <button
          type="button"
          onClick={() => {
            const je = erpState.journalEntries.find((j) => j.id === r.entryId) ?? null;
            setInspectEntry(je);
          }}
          className="inline-flex items-center gap-1 rounded border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          <Eye className="w-3 h-3 text-emerald-600" />
          <span>{locale === 'es' ? 'Asiento origen' : 'Source entry'}</span>
        </button>
      ),
    },
  ];

  const trialCols: DataTableColumn<TrialBalanceRow>[] = [
    {
      key: 'code',
      header: t.common.code,
      stickyLeft: true,
      render: (r) => (
        <span className="font-mono-num text-xs font-bold text-emerald-700 dark:text-emerald-400">
          {r.code}
        </span>
      ),
    },
    {
      key: 'name',
      header: locale === 'es' ? 'Cuenta' : 'Account',
      minWidthClass: 'min-w-[200px]',
      render: (r) => <span className="font-semibold text-xs">{r.name}</span>,
    },
    {
      key: 'deb',
      header: locale === 'es' ? 'Sumas Débito' : 'Total Debit',
      align: 'right',
      render: (r) => <MoneyCell amount={r.totalDebit} locale={locale} />,
    },
    {
      key: 'cred',
      header: locale === 'es' ? 'Sumas Crédito' : 'Total Credit',
      align: 'right',
      render: (r) => <MoneyCell amount={r.totalCredit} locale={locale} />,
    },
    {
      key: 'endD',
      header: locale === 'es' ? 'Saldo Deudor' : 'Debit Bal.',
      align: 'right',
      render: (r) => <MoneyCell amount={r.endingDebit} locale={locale} emphasize={r.endingDebit > 0} />,
    },
    {
      key: 'endC',
      header: locale === 'es' ? 'Saldo Acreedor' : 'Credit Bal.',
      align: 'right',
      render: (r) => <MoneyCell amount={r.endingCredit} locale={locale} emphasize={r.endingCredit > 0} />,
    },
  ];

  const recCols: DataTableColumn<AccountingReconciliationItem>[] = [
    {
      key: 'date',
      header: t.common.date,
      render: (it) => <span className="font-mono-num text-xs">{it.date}</span>,
    },
    {
      key: 'acc',
      header: locale === 'es' ? 'Cuenta / Ref.' : 'Account / Ref.',
      render: (it) => {
        const acc = accountMap.get(it.accountId);
        return (
          <div>
            <div className="font-semibold text-xs">
              {acc ? `${acc.code} · ${locale === 'es' ? acc.nameEs : acc.nameEn}` : it.accountId}
            </div>
            <div className="font-mono-num text-[11px] text-slate-500">{it.reference}</div>
          </div>
        );
      },
    },
    {
      key: 'desc',
      header: locale === 'es' ? 'Concepto' : 'Description',
      render: (it) => (
        <span className="text-xs">{locale === 'es' ? it.descriptionEs : it.descriptionEn}</span>
      ),
    },
    {
      key: 'book',
      header: locale === 'es' ? 'Libro' : 'Book',
      align: 'right',
      render: (it) => <MoneyCell amount={it.bookAmount} locale={locale} />,
    },
    {
      key: 'status',
      header: t.common.status,
      render: (it) => (
        <StatusBadge
          label={
            it.status === 'MATCHED'
              ? locale === 'es'
                ? 'Conciliado'
                : 'Matched'
              : locale === 'es'
                ? 'Pendiente'
                : 'Pending'
          }
          tone={it.status === 'MATCHED' ? 'emerald' : 'amber'}
          icon={it.status === 'MATCHED' ? 'approved' : 'warning'}
        />
      ),
    },
    {
      key: 'actions',
      header: t.common.actions,
      align: 'right',
      render: (it) => (
        <button
          type="button"
          onClick={() => toggleReconciliationItem(it.id)}
          className="inline-flex items-center gap-1 rounded border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          <RefreshCw className="w-3 h-3" />
          <span>
            {it.status === 'MATCHED'
              ? locale === 'es'
                ? 'Marcar pendiente'
                : 'Mark pending'
              : locale === 'es'
                ? 'Conciliar'
                : 'Match'}
          </span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
              {t.navigation.accounting}
            </h1>
            <StatusBadge label={t.topBar.demoOnlyTag} tone="amber" />
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {locale === 'es'
              ? 'Plan de cuentas, Diario, Mayor general y Balanza de comprobación alimentados por los mismos asientos contables.'
              : 'Chart of accounts, Journal, General Ledger, and Trial Balance powered by the exact same journal entries.'}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {activeTab === 'accounts' && (
            <button
              type="button"
              onClick={() => {
                setEditAccId(null);
                setAccCode('');
                setAccName('');
                setAccType('ASSET');
                setAccModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white"
            >
              <Plus className="w-4 h-4" />
              <span>{locale === 'es' ? 'Nueva cuenta' : 'New account'}</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setJeModalOpen(true)}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white"
          >
            <Plus className="w-4 h-4" />
            <span>{locale === 'es' ? 'Nuevo asiento' : 'New journal entry'}</span>
          </button>
        </div>
      </div>

      {/* 6 Submenu Tabs */}
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 dark:border-slate-800">
        {(
          [
            { id: 'accounts', label: t.navigation.accountingAccounts },
            { id: 'periods', label: t.navigation.accountingPeriods },
            {
              id: 'journal',
              label: `${t.navigation.accountingJournal} (${erpState.journalEntries.length})`,
            },
            { id: 'ledger', label: t.navigation.accountingLedger },
            { id: 'trial_balance', label: t.navigation.accountingTrialBalance },
            { id: 'reconciliation', label: t.navigation.accountingReconciliation },
          ] as { id: AccountingTab; label: string }[]
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

      {activeTab === 'accounts' && (
        <DataTable
          columns={accountCols}
          rows={erpState.glAccounts}
          getRowKey={(a) => a.id}
          emptyMessage={t.common.noResults}
        />
      )}

      {activeTab === 'periods' && (
        <DataTable
          columns={periodCols}
          rows={erpState.accountingPeriods}
          getRowKey={(p) => p.id}
          emptyMessage={t.common.noResults}
        />
      )}

      {activeTab === 'journal' && (
        <div className="space-y-3">
          {erpState.journalEntries.map((je) => {
            const totalD = round2(je.lines.reduce((s, l) => s + l.debit, 0));
            const totalC = round2(je.lines.reduce((s, l) => s + l.credit, 0));
            return (
              <div
                key={je.id}
                className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono-num text-xs font-bold text-emerald-700 dark:text-emerald-400">
                      {je.number}
                    </span>
                    <StatusBadge label={je.sourceModule} tone="neutral" />
                    <span className="font-mono-num text-xs text-slate-500">
                      {je.date} · Ref: {je.reference}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    {locale === 'es' ? je.memoEs : je.memoEn}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                        <th className="py-1.5 text-left font-semibold">
                          {locale === 'es' ? 'Cuenta' : 'Account'}
                        </th>
                        <th className="py-1.5 text-left font-semibold">
                          {locale === 'es' ? 'Detalle' : 'Line memo'}
                        </th>
                        <th className="py-1.5 text-right font-semibold">
                          {locale === 'es' ? 'Débito' : 'Debit'}
                        </th>
                        <th className="py-1.5 text-right font-semibold">
                          {locale === 'es' ? 'Crédito' : 'Credit'}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {je.lines.map((line) => {
                        const acc = accountMap.get(line.accountId);
                        return (
                          <tr key={line.id}>
                            <td className="py-1.5">
                              <button
                                type="button"
                                onClick={() => openAccountLedger(line.accountId)}
                                className="font-mono-num font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
                              >
                                {acc ? `${acc.code} · ${locale === 'es' ? acc.nameEs : acc.nameEn}` : line.accountId}
                              </button>
                            </td>
                            <td className="py-1.5 text-slate-600 dark:text-slate-300">
                              {locale === 'es' ? line.descriptionEs : line.descriptionEn}
                            </td>
                            <td className="py-1.5 text-right">
                              <MoneyCell amount={line.debit} locale={locale} />
                            </td>
                            <td className="py-1.5 text-right">
                              <MoneyCell amount={line.credit} locale={locale} />
                            </td>
                          </tr>
                        );
                      })}
                      <tr className="bg-slate-50 dark:bg-slate-800/50 font-bold">
                        <td colSpan={2} className="py-1.5 px-2 text-right">
                          {locale === 'es' ? 'Totales cuadrados' : 'Balanced totals'}
                        </td>
                        <td className="py-1.5 text-right">
                          <MoneyCell amount={totalD} locale={locale} emphasize />
                        </td>
                        <td className="py-1.5 text-right">
                          <MoneyCell amount={totalC} locale={locale} emphasize />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'ledger' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
            <div className="flex-1 max-w-md">
              <label className="block text-[11px] font-semibold uppercase text-slate-500 mb-1">
                {locale === 'es' ? 'Cuenta en Mayor general' : 'General Ledger Account'}
              </label>
              <select
                value={ledgerAccount?.id ?? ''}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs font-semibold"
              >
                {erpState.glAccounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.code} · {locale === 'es' ? a.nameEs : a.nameEn}
                  </option>
                ))}
              </select>
            </div>
            {ledgerAccount && (
              <div className="flex items-center gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block">
                    {locale === 'es' ? 'Naturaleza' : 'Normal side'}
                  </span>
                  <span className="font-bold">{ledgerAccount.normalSide}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">
                    {locale === 'es' ? 'Saldo actual' : 'Current balance'}
                  </span>
                  <MoneyCell
                    amount={ledgerRows[ledgerRows.length - 1]?.runningBalance ?? 0}
                    locale={locale}
                    size="lg"
                    emphasize
                  />
                </div>
              </div>
            )}
          </div>

          <DataTable
            columns={ledgerCols}
            rows={ledgerRows}
            getRowKey={(r) => r.id}
            emptyMessage={t.common.noResults}
          />
        </div>
      )}

      {activeTab === 'trial_balance' && (
        <div className="space-y-4">
          <div className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30 p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 font-semibold text-emerald-900 dark:text-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {locale === 'es'
                  ? 'Haz clic en cualquier cuenta de la Balanza para abrir su Mayor general y consultar el asiento de origen.'
                  : 'Click any account row to open its General Ledger and inspect the source journal entry.'}
              </span>
            </div>
            <div className="flex items-center gap-4 font-mono-num">
              <span>
                {locale === 'es' ? 'Débitos:' : 'Debits:'} RD${trialTotals.debit.toFixed(2)}
              </span>
              <span>
                {locale === 'es' ? 'Créditos:' : 'Credits:'} RD${trialTotals.credit.toFixed(2)}
              </span>
            </div>
          </div>

          <DataTable
            columns={trialCols}
            rows={trialBalanceRows}
            getRowKey={(r) => r.accountId}
            onRowClick={(r) => openAccountLedger(r.accountId)}
            emptyMessage={t.common.noResults}
          />
        </div>
      )}

      {activeTab === 'reconciliation' && (
        <DataTable
          columns={recCols}
          rows={erpState.reconciliationItems}
          getRowKey={(it) => it.id}
          emptyMessage={t.common.noResults}
        />
      )}

      {/* Inspect Source Journal Entry Modal */}
      {inspectEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60">
          <div className="w-full max-w-2xl rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <div className="font-mono-num text-sm font-bold text-emerald-700 dark:text-emerald-400">
                  {locale === 'es' ? 'Asiento de origen' : 'Source journal entry'} ·{' '}
                  {inspectEntry.number}
                </div>
                <div className="text-xs text-slate-500">
                  {inspectEntry.date} · {inspectEntry.sourceModule} · Ref: {inspectEntry.reference}
                </div>
              </div>
              <button type="button" onClick={() => setInspectEntry(null)} className="p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                {locale === 'es' ? inspectEntry.memoEs : inspectEntry.memoEn}
              </p>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                    <th className="py-1.5 text-left">{locale === 'es' ? 'Cuenta' : 'Account'}</th>
                    <th className="py-1.5 text-left">{locale === 'es' ? 'Concepto' : 'Detail'}</th>
                    <th className="py-1.5 text-right">{locale === 'es' ? 'Débito' : 'Debit'}</th>
                    <th className="py-1.5 text-right">{locale === 'es' ? 'Crédito' : 'Credit'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {inspectEntry.lines.map((line) => {
                    const acc = accountMap.get(line.accountId);
                    return (
                      <tr key={line.id}>
                        <td className="py-2 font-mono-num font-semibold">
                          {acc ? `${acc.code} · ${locale === 'es' ? acc.nameEs : acc.nameEn}` : line.accountId}
                        </td>
                        <td className="py-2">
                          {locale === 'es' ? line.descriptionEs : line.descriptionEn}
                        </td>
                        <td className="py-2 text-right">
                          <MoneyCell amount={line.debit} locale={locale} />
                        </td>
                        <td className="py-2 text-right">
                          <MoneyCell amount={line.credit} locale={locale} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setInspectEntry(null)}
                  className="h-9 px-4 rounded bg-emerald-600 text-xs font-semibold text-white"
                >
                  {t.common.close}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New GL Account Modal */}
      {accModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60">
          <div className="w-full max-w-md rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
              <h2 className="font-display text-base font-bold">
                {locale === 'es' ? 'Nueva cuenta contable' : 'New GL account'}
              </h2>
              <button type="button" onClick={() => setAccModalOpen(false)} className="p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={saveAccount} className="p-4 space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">{t.common.code}</label>
                  <input
                    required
                    value={accCode}
                    onChange={(e) => setAccCode(e.target.value)}
                    placeholder="6201"
                    className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 text-sm font-mono-num"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold mb-1">
                    {locale === 'es' ? 'Tipo' : 'Type'}
                  </label>
                  <select
                    value={accType}
                    onChange={(e) => setAccType(e.target.value as AccountType)}
                    className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 text-xs font-semibold"
                  >
                    <option value="ASSET">ASSET</option>
                    <option value="LIABILITY">LIABILITY</option>
                    <option value="EQUITY">EQUITY</option>
                    <option value="REVENUE">REVENUE</option>
                    <option value="COST">COST</option>
                    <option value="EXPENSE">EXPENSE</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">
                  {locale === 'es' ? 'Nombre de la cuenta' : 'Account name'}
                </label>
                <input
                  required
                  value={accName}
                  onChange={(e) => setAccName(e.target.value)}
                  className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setAccModalOpen(false)}
                  className="h-9 px-3.5 rounded border border-slate-300 dark:border-slate-700 text-xs font-semibold"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 rounded bg-emerald-600 text-xs font-semibold text-white"
                >
                  {t.common.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Journal Entry Modal */}
      {jeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60">
          <div className="w-full max-w-md rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
              <h2 className="font-display text-base font-bold">
                {locale === 'es' ? 'Nuevo asiento contable (Solo demo)' : 'New journal entry'}
              </h2>
              <button type="button" onClick={() => setJeModalOpen(false)} className="p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={saveJournalEntry} className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">{t.common.date}</label>
                  <input
                    type="date"
                    required
                    value={jeDate}
                    onChange={(e) => setJeDate(e.target.value)}
                    className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 text-sm font-mono-num"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    {locale === 'es' ? 'Período' : 'Period'}
                  </label>
                  <select
                    value={jePeriodId}
                    onChange={(e) => setJePeriodId(e.target.value)}
                    className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 text-xs"
                  >
                    {erpState.accountingPeriods.map((ap) => (
                      <option key={ap.id} value={ap.id}>
                        {locale === 'es' ? ap.nameEs : ap.nameEn}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">
                  {locale === 'es' ? 'Cuenta Débito' : 'Debit Account'}
                </label>
                <select
                  value={jeDebitAcc}
                  onChange={(e) => setJeDebitAcc(e.target.value)}
                  className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 text-xs"
                >
                  {erpState.glAccounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.code} · {locale === 'es' ? a.nameEs : a.nameEn}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">
                  {locale === 'es' ? 'Cuenta Crédito' : 'Credit Account'}
                </label>
                <select
                  value={jeCreditAcc}
                  onChange={(e) => setJeCreditAcc(e.target.value)}
                  className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 text-xs"
                >
                  {erpState.glAccounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.code} · {locale === 'es' ? a.nameEs : a.nameEn}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    {locale === 'es' ? 'Importe RD$' : 'Amount RD$'}
                  </label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    required
                    value={jeAmount}
                    onChange={(e) => setJeAmount(e.target.value)}
                    className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 text-sm font-mono-num"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    {locale === 'es' ? 'Referencia' : 'Reference'}
                  </label>
                  <input
                    value={jeReference}
                    onChange={(e) => setJeReference(e.target.value)}
                    placeholder="MAN-001"
                    className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 text-sm font-mono-num"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">
                  {locale === 'es' ? 'Concepto' : 'Memo'}
                </label>
                <input
                  required
                  value={jeMemo}
                  onChange={(e) => setJeMemo(e.target.value)}
                  placeholder={
                    locale === 'es'
                      ? 'Ej. Traslado de caja a banco'
                      : 'e.g. Cash deposit to bank'
                  }
                  className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setJeModalOpen(false)}
                  className="h-9 px-3.5 rounded border border-slate-300 dark:border-slate-700 text-xs font-semibold"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 rounded bg-emerald-600 text-xs font-semibold text-white"
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
