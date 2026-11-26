import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Eye,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { DataTable, DataTableColumn } from '../components/DataTable';
import {
  ErpModal,
  ErpPageHeader,
  ErpSurfaceCard,
} from '../components/ErpUiPrimitives';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    setIsSubmitting(true);
    try {
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveJournalEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(jeAmount);
    if (!amt || amt <= 0 || jeDebitAcc === jeCreditAcc) return;
    setIsSubmitting(true);
    try {
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const accountCols: DataTableColumn<GlAccount>[] = [
    {
      key: 'code',
      header: t.common.code,
      stickyLeft: true,
      render: (a) => (
        <span className="font-mono-num text-xs font-bold text-[var(--nr-primary)]">
          {a.code}
        </span>
      ),
    },
    {
      key: 'name',
      header: locale === 'es' ? 'Cuenta contable' : 'GL Account',
      minWidthClass: 'min-w-[200px]',
      render: (a) => (
        <span className="font-semibold text-[var(--nr-text)]">
          {locale === 'es' ? a.nameEs : a.nameEn}
        </span>
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
          className="nr-focus-ring nr-transition rounded-lg border border-[var(--nr-success-border)] bg-[var(--nr-success-bg)] px-2.5 py-1 text-xs font-semibold text-[var(--nr-success)] hover:opacity-90"
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
          className="nr-focus-ring nr-transition h-8 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-2 text-xs font-semibold text-[var(--nr-text)]"
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
          <div className="font-mono-num text-xs font-bold text-[var(--nr-primary)]">
            {r.entryNumber}
          </div>
          <div className="font-mono-num text-[11px] text-[var(--nr-text-secondary)]">
            {r.reference}
          </div>
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
          className="nr-focus-ring nr-transition inline-flex items-center gap-1 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface)] px-2.5 py-1 text-xs font-semibold text-[var(--nr-text)] hover:border-[var(--nr-primary)] hover:bg-[var(--nr-surface-muted)]"
        >
          <Eye className="w-3 h-3 text-[var(--nr-primary)]" />
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
        <span className="font-mono-num text-xs font-bold text-[var(--nr-primary)]">
          {r.code}
        </span>
      ),
    },
    {
      key: 'name',
      header: locale === 'es' ? 'Cuenta' : 'Account',
      minWidthClass: 'min-w-[200px]',
      render: (r) => <span className="font-semibold text-xs text-[var(--nr-text)]">{r.name}</span>,
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
            <div className="font-semibold text-xs text-[var(--nr-text)]">
              {acc ? `${acc.code} · ${locale === 'es' ? acc.nameEs : acc.nameEn}` : it.accountId}
            </div>
            <div className="font-mono-num text-[11px] text-[var(--nr-text-secondary)]">
              {it.reference}
            </div>
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
          className="nr-focus-ring nr-transition inline-flex items-center gap-1 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface)] px-2.5 py-1 text-xs font-semibold text-[var(--nr-text)] hover:border-[var(--nr-primary)] hover:bg-[var(--nr-surface-muted)]"
        >
          <RefreshCw className="w-3 h-3 text-[var(--nr-primary)]" />
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
      <ErpPageHeader
        title={t.navigation.accounting}
        subtitle={
          locale === 'es'
            ? 'Plan de cuentas, Diario, Mayor general y Balanza de comprobación alimentados por los mismos asientos contables.'
            : 'Chart of accounts, Journal, General Ledger, and Trial Balance powered by the exact same journal entries.'
        }
        badge={<StatusBadge label={t.topBar.demoOnlyTag} tone="amber" />}
        actions={
          <>
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
                className="nr-focus-ring nr-transition inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface)] hover:border-[var(--nr-primary)] text-xs font-semibold text-[var(--nr-text)] whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>{locale === 'es' ? 'Nueva cuenta' : 'New account'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setJeModalOpen(true)}
              className="nr-focus-ring nr-transition inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-[var(--nr-primary)] hover:bg-[var(--nr-primary-hover)] text-xs font-semibold text-[var(--nr-primary-fg)] whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>{locale === 'es' ? 'Nuevo asiento' : 'New journal entry'}</span>
            </button>
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-1 border-b border-[var(--nr-border)]">
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
              <ErpSurfaceCard key={je.id} padding="md" className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono-num text-xs font-bold text-[var(--nr-primary)]">
                      {je.number}
                    </span>
                    <StatusBadge label={je.sourceModule} tone="neutral" />
                    <span className="font-mono-num text-xs text-[var(--nr-text-secondary)]">
                      {je.date} · Ref: {je.reference}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-[var(--nr-text)]">
                    {locale === 'es' ? je.memoEs : je.memoEn}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-[var(--nr-border)] text-[var(--nr-text-secondary)]">
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
                    <tbody className="divide-y divide-[var(--nr-border)]">
                      {je.lines.map((line) => {
                        const acc = accountMap.get(line.accountId);
                        return (
                          <tr key={line.id}>
                            <td className="py-1.5">
                              <button
                                type="button"
                                onClick={() => openAccountLedger(line.accountId)}
                                className="nr-focus-ring font-mono-num font-semibold text-[var(--nr-primary)] hover:underline"
                              >
                                {acc ? `${acc.code} · ${locale === 'es' ? acc.nameEs : acc.nameEn}` : line.accountId}
                              </button>
                            </td>
                            <td className="py-1.5 text-[var(--nr-text-secondary)]">
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
                      <tr className="bg-[var(--nr-surface-muted)] font-bold">
                        <td colSpan={2} className="py-1.5 px-2 text-right text-[var(--nr-text)]">
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
              </ErpSurfaceCard>
            );
          })}
        </div>
      )}

      {activeTab === 'ledger' && (
        <div className="space-y-4">
          <ErpSurfaceCard padding="md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1 max-w-md">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--nr-text-secondary)] mb-1">
                  {locale === 'es' ? 'Cuenta en Mayor general' : 'General Ledger Account'}
                </label>
                <select
                  value={ledgerAccount?.id ?? ''}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className="nr-focus-ring nr-transition w-full h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-3 text-xs font-semibold text-[var(--nr-text)]"
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
                    <span className="text-[var(--nr-text-secondary)] block">
                      {locale === 'es' ? 'Naturaleza' : 'Normal side'}
                    </span>
                    <span className="font-bold text-[var(--nr-text)]">
                      {ledgerAccount.normalSide}
                    </span>
                  </div>
                  <div>
                    <span className="text-[var(--nr-text-secondary)] block">
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
          </ErpSurfaceCard>

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
          <div className="rounded-xl border border-[var(--nr-success-border)] bg-[var(--nr-success-bg)] p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 font-semibold text-[var(--nr-success)]">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>
                {locale === 'es'
                  ? 'Haz clic en cualquier cuenta de la Balanza para abrir su Mayor general y consultar el asiento de origen.'
                  : 'Click any account row to open its General Ledger and inspect the source journal entry.'}
              </span>
            </div>
            <div className="flex items-center gap-4 font-mono-num text-[var(--nr-text)] font-semibold">
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

      <ErpModal
        open={Boolean(inspectEntry)}
        onClose={() => setInspectEntry(null)}
        title={
          inspectEntry
            ? `${locale === 'es' ? 'Asiento de origen' : 'Source journal entry'} · ${inspectEntry.number}`
            : ''
        }
        subtitle={
          inspectEntry
            ? `${inspectEntry.date} · ${inspectEntry.sourceModule} · Ref: ${inspectEntry.reference}`
            : undefined
        }
        maxWidthClass="max-w-2xl"
        closeLabel={t.common.close}
        footer={
          <button
            type="button"
            onClick={() => setInspectEntry(null)}
            className="nr-focus-ring nr-transition h-9 px-4 rounded-lg bg-[var(--nr-primary)] hover:bg-[var(--nr-primary-hover)] text-xs font-semibold text-[var(--nr-primary-fg)]"
          >
            {t.common.close}
          </button>
        }
      >
        {inspectEntry && (
          <div className="space-y-3">
            <p className="text-xs font-medium text-[var(--nr-text-secondary)]">
              {locale === 'es' ? inspectEntry.memoEs : inspectEntry.memoEn}
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[var(--nr-border)] text-[var(--nr-text-secondary)]">
                    <th className="py-1.5 text-left font-semibold">
                      {locale === 'es' ? 'Cuenta' : 'Account'}
                    </th>
                    <th className="py-1.5 text-left font-semibold">
                      {locale === 'es' ? 'Concepto' : 'Detail'}
                    </th>
                    <th className="py-1.5 text-right font-semibold">
                      {locale === 'es' ? 'Débito' : 'Debit'}
                    </th>
                    <th className="py-1.5 text-right font-semibold">
                      {locale === 'es' ? 'Crédito' : 'Credit'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--nr-border)]">
                  {inspectEntry.lines.map((line) => {
                    const acc = accountMap.get(line.accountId);
                    return (
                      <tr key={line.id}>
                        <td className="py-2 font-mono-num font-semibold text-[var(--nr-text)]">
                          {acc ? `${acc.code} · ${locale === 'es' ? acc.nameEs : acc.nameEn}` : line.accountId}
                        </td>
                        <td className="py-2 text-[var(--nr-text-secondary)]">
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
            </div>
          </div>
        )}
      </ErpModal>

      <ErpModal
        open={accModalOpen}
        onClose={() => setAccModalOpen(false)}
        title={locale === 'es' ? 'Nueva cuenta contable' : 'New GL account'}
        maxWidthClass="max-w-md"
        closeLabel={t.common.close}
        footer={
          <>
            <button
              type="button"
              onClick={() => setAccModalOpen(false)}
              disabled={isSubmitting}
              className="nr-focus-ring nr-transition h-9 px-3.5 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface)] text-xs font-semibold text-[var(--nr-text)] hover:bg-[var(--nr-surface-muted)]"
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              form="nr-gl-account-form"
              disabled={isSubmitting}
              className="nr-focus-ring nr-transition h-9 px-4 rounded-lg bg-[var(--nr-primary)] hover:bg-[var(--nr-primary-hover)] text-xs font-semibold text-[var(--nr-primary-fg)] disabled:opacity-50"
            >
              {t.common.save}
            </button>
          </>
        }
      >
        <form id="nr-gl-account-form" onSubmit={saveAccount} className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--nr-text)] mb-1">
                {t.common.code}
              </label>
              <input
                required
                value={accCode}
                onChange={(e) => setAccCode(e.target.value)}
                placeholder="6201"
                className="nr-focus-ring nr-transition w-full h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-2.5 text-sm font-mono-num text-[var(--nr-text)]"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-[var(--nr-text)] mb-1">
                {locale === 'es' ? 'Tipo' : 'Type'}
              </label>
              <select
                value={accType}
                onChange={(e) => setAccType(e.target.value as AccountType)}
                className="nr-focus-ring nr-transition w-full h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-2 text-xs font-semibold text-[var(--nr-text)]"
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
            <label className="block text-xs font-semibold text-[var(--nr-text)] mb-1">
              {locale === 'es' ? 'Nombre de la cuenta' : 'Account name'}
            </label>
            <input
              required
              value={accName}
              onChange={(e) => setAccName(e.target.value)}
              className="nr-focus-ring nr-transition w-full h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-2.5 text-sm text-[var(--nr-text)]"
            />
          </div>
        </form>
      </ErpModal>

      <ErpModal
        open={jeModalOpen}
        onClose={() => setJeModalOpen(false)}
        title={locale === 'es' ? 'Nuevo asiento contable (Solo demo)' : 'New journal entry'}
        maxWidthClass="max-w-md"
        closeLabel={t.common.close}
        footer={
          <>
            <button
              type="button"
              onClick={() => setJeModalOpen(false)}
              disabled={isSubmitting}
              className="nr-focus-ring nr-transition h-9 px-3.5 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface)] text-xs font-semibold text-[var(--nr-text)] hover:bg-[var(--nr-surface-muted)]"
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              form="nr-journal-entry-form"
              disabled={isSubmitting}
              className="nr-focus-ring nr-transition h-9 px-4 rounded-lg bg-[var(--nr-primary)] hover:bg-[var(--nr-primary-hover)] text-xs font-semibold text-[var(--nr-primary-fg)] disabled:opacity-50"
            >
              {t.common.save}
            </button>
          </>
        }
      >
        <form id="nr-journal-entry-form" onSubmit={saveJournalEntry} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--nr-text)] mb-1">
                {t.common.date}
              </label>
              <input
                type="date"
                required
                value={jeDate}
                onChange={(e) => setJeDate(e.target.value)}
                className="nr-focus-ring nr-transition w-full h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-2.5 text-sm font-mono-num text-[var(--nr-text)]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--nr-text)] mb-1">
                {locale === 'es' ? 'Período' : 'Period'}
              </label>
              <select
                value={jePeriodId}
                onChange={(e) => setJePeriodId(e.target.value)}
                className="nr-focus-ring nr-transition w-full h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-2 text-xs text-[var(--nr-text)]"
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
            <label className="block text-xs font-semibold text-[var(--nr-text)] mb-1">
              {locale === 'es' ? 'Cuenta Débito' : 'Debit Account'}
            </label>
            <select
              value={jeDebitAcc}
              onChange={(e) => setJeDebitAcc(e.target.value)}
              className="nr-focus-ring nr-transition w-full h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-2 text-xs text-[var(--nr-text)]"
            >
              {erpState.glAccounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.code} · {locale === 'es' ? a.nameEs : a.nameEn}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--nr-text)] mb-1">
              {locale === 'es' ? 'Cuenta Crédito' : 'Credit Account'}
            </label>
            <select
              value={jeCreditAcc}
              onChange={(e) => setJeCreditAcc(e.target.value)}
              className="nr-focus-ring nr-transition w-full h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-2 text-xs text-[var(--nr-text)]"
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
              <label className="block text-xs font-semibold text-[var(--nr-text)] mb-1">
                {locale === 'es' ? 'Importe RD$' : 'Amount RD$'}
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                required
                value={jeAmount}
                onChange={(e) => setJeAmount(e.target.value)}
                className="nr-focus-ring nr-transition w-full h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-2.5 text-sm font-mono-num text-[var(--nr-text)]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--nr-text)] mb-1">
                {locale === 'es' ? 'Referencia' : 'Reference'}
              </label>
              <input
                value={jeReference}
                onChange={(e) => setJeReference(e.target.value)}
                placeholder="MAN-001"
                className="nr-focus-ring nr-transition w-full h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-2.5 text-sm font-mono-num text-[var(--nr-text)]"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--nr-text)] mb-1">
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
              className="nr-focus-ring nr-transition w-full h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-2.5 text-sm text-[var(--nr-text)]"
            />
          </div>
        </form>
      </ErpModal>
    </div>
  );
};
