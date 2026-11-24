import React, { useMemo, useState } from 'react';
import { CheckCircle2, Landmark, Plus, RefreshCw, X } from 'lucide-react';
import { DataTable, DataTableColumn } from '../components/DataTable';
import { MoneyCell } from '../components/MoneyCell';
import { StatusBadge } from '../components/StatusBadge';
import { usePayrollWorkspace } from '../context/PayrollWorkspaceContext';
import { BankTransaction } from '../types/erp';

export const BanksTreasuryScreen: React.FC = () => {
  const {
    erpState,
    locale,
    t,
    addBankTransaction,
    toggleBankReconciled,
  } = usePayrollWorkspace();

  const [modalOpen, setModalOpen] = useState(false);
  const [bankAccountId, setBankAccountId] = useState(erpState.bankAccounts[0]?.id ?? '');
  const [txType, setTxType] = useState<BankTransaction['type']>('DEPOSIT');
  const [reference, setReference] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('15000');

  const accountMap = useMemo(
    () => new Map(erpState.bankAccounts.map((b) => [b.id, b])),
    [erpState.bankAccounts]
  );

  const handleCreateTx = async (e: React.FormEvent) => {
    e.preventDefault();
    const raw = Number(amount) || 0;
    if (raw <= 0 || !description.trim()) return;
    const signed = txType === 'WITHDRAWAL' ? -Math.abs(raw) : Math.abs(raw);
    await addBankTransaction({
      bankAccountId: bankAccountId || erpState.bankAccounts[0]?.id || '',
      date: '2026-11-24',
      type: txType,
      reference: reference.trim() || `TRF-${Date.now().toString().slice(-4)}`,
      descriptionEs: description.trim(),
      descriptionEn: description.trim(),
      amount: signed,
    });
    setModalOpen(false);
    setReference('');
    setDescription('');
  };

  const columns: DataTableColumn<BankTransaction>[] = [
    {
      key: 'date',
      header: t.common.date,
      stickyLeft: true,
      render: (tx) => <span className="font-mono-num text-xs">{tx.date}</span>,
    },
    {
      key: 'bank',
      header: locale === 'es' ? 'Cuenta bancaria' : 'Bank account',
      render: (tx) => {
        const b = accountMap.get(tx.bankAccountId);
        return (
          <div>
            <div className="font-semibold text-xs">{b?.bankName ?? tx.bankAccountId}</div>
            <div className="font-mono-num text-[11px] text-slate-500">{tx.reference}</div>
          </div>
        );
      },
    },
    {
      key: 'desc',
      header: locale === 'es' ? 'Descripción' : 'Description',
      minWidthClass: 'min-w-[200px]',
      render: (tx) => (
        <span className="text-xs">{locale === 'es' ? tx.descriptionEs : tx.descriptionEn}</span>
      ),
    },
    {
      key: 'amount',
      header: locale === 'es' ? 'Importe' : 'Amount',
      align: 'right',
      render: (tx) => (
        <MoneyCell amount={tx.amount} locale={locale} emphasize={tx.amount > 0} />
      ),
    },
    {
      key: 'rec',
      header: t.common.status,
      render: (tx) => (
        <StatusBadge
          label={
            tx.reconciled
              ? locale === 'es'
                ? 'Conciliado'
                : 'Reconciled'
              : locale === 'es'
                ? 'Pendiente'
                : 'Pending'
          }
          tone={tx.reconciled ? 'emerald' : 'amber'}
          icon={tx.reconciled ? 'approved' : 'warning'}
        />
      ),
    },
    {
      key: 'actions',
      header: t.common.actions,
      align: 'right',
      render: (tx) => (
        <button
          type="button"
          onClick={() => toggleBankReconciled(tx.id)}
          className="inline-flex items-center gap-1 rounded border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          <RefreshCw className="w-3 h-3 text-emerald-600" />
          <span>
            {tx.reconciled
              ? locale === 'es'
                ? 'Revertir'
                : 'Unmatch'
              : locale === 'es'
                ? 'Conciliar'
                : 'Reconcile'}
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
              {t.navigation.banksTreasury}
            </h1>
            <StatusBadge label={t.topBar.demoOnlyTag} tone="amber" />
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {locale === 'es'
              ? 'Saldos bancarios, registro de depósitos/transferencias y conciliación bancaria interactiva.'
              : 'Bank account balances, deposit/transfer entries, and interactive bank reconciliation.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{locale === 'es' ? 'Nuevo movimiento bancario' : 'New bank movement'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {erpState.bankAccounts.map((bank) => {
          const pendingCount = erpState.bankTransactions.filter(
            (tx) => tx.bankAccountId === bank.id && !tx.reconciled
          ).length;
          return (
            <div
              key={bank.id}
              className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex items-center justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-sm">{bank.bankName}</div>
                  <div className="font-mono-num text-xs text-slate-500">
                    {bank.accountNumber} · {bank.currency}
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>
                      {pendingCount === 0
                        ? locale === 'es'
                          ? 'Todo conciliado'
                          : 'Fully reconciled'
                        : locale === 'es'
                          ? `${pendingCount} por conciliar`
                          : `${pendingCount} pending`}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[11px] font-semibold uppercase text-slate-500">
                  {locale === 'es' ? 'Saldo en libro' : 'Ledger balance'}
                </div>
                <MoneyCell amount={bank.ledgerBalance} locale={locale} size="lg" emphasize />
              </div>
            </div>
          );
        })}
      </div>

      <DataTable
        columns={columns}
        rows={erpState.bankTransactions}
        getRowKey={(tx) => tx.id}
        emptyMessage={t.common.noResults}
      />

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60">
          <div className="w-full max-w-md rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
              <h2 className="font-display text-base font-bold">
                {locale === 'es' ? 'Movimiento bancario (Solo demo)' : 'New bank transaction'}
              </h2>
              <button type="button" onClick={() => setModalOpen(false)} className="p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateTx} className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">
                  {locale === 'es' ? 'Cuenta bancaria' : 'Bank account'}
                </label>
                <select
                  value={bankAccountId}
                  onChange={(e) => setBankAccountId(e.target.value)}
                  className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 text-xs"
                >
                  {erpState.bankAccounts.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.bankName} · {b.accountNumber}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    {locale === 'es' ? 'Tipo' : 'Type'}
                  </label>
                  <select
                    value={txType}
                    onChange={(e) => setTxType(e.target.value as BankTransaction['type'])}
                    className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 text-xs"
                  >
                    <option value="DEPOSIT">DEPOSIT (+)</option>
                    <option value="WITHDRAWAL">WITHDRAWAL (-)</option>
                    <option value="TRANSFER">TRANSFER (+)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    {locale === 'es' ? 'Importe RD$' : 'Amount RD$'}
                  </label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 text-sm font-mono-num"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">
                  {locale === 'es' ? 'Referencia' : 'Reference'}
                </label>
                <input
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="DEP-9901"
                  className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 text-sm font-mono-num"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">
                  {locale === 'es' ? 'Descripción' : 'Description'}
                </label>
                <input
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={
                    locale === 'es' ? 'Depósito ventas del día' : 'Daily sales deposit'
                  }
                  className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
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
