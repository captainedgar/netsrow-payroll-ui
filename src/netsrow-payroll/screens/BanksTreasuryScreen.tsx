import React, { useMemo, useState } from 'react';
import { CheckCircle2, Landmark, Plus, RefreshCw } from 'lucide-react';
import { DataTable, DataTableColumn } from '../components/DataTable';
import {
  ErpModal,
  ErpPageHeader,
  ErpSurfaceCard,
} from '../components/ErpUiPrimitives';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    setIsSubmitting(true);
    try {
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
    } finally {
      setIsSubmitting(false);
    }
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
            <div className="font-semibold text-xs text-[var(--nr-text)]">
              {b?.bankName ?? tx.bankAccountId}
            </div>
            <div className="font-mono-num text-[11px] text-[var(--nr-text-secondary)]">
              {tx.reference}
            </div>
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
          className="nr-focus-ring nr-transition inline-flex items-center gap-1 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface)] px-2.5 py-1 text-xs font-semibold text-[var(--nr-text)] hover:border-[var(--nr-primary)] hover:bg-[var(--nr-surface-muted)]"
        >
          <RefreshCw className="w-3 h-3 text-[var(--nr-primary)]" />
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
      <ErpPageHeader
        title={t.navigation.banksTreasury}
        subtitle={
          locale === 'es'
            ? 'Saldos bancarios, registro de depósitos/transferencias y conciliación bancaria interactiva.'
            : 'Bank account balances, deposit/transfer entries, and interactive bank reconciliation.'
        }
        badge={<StatusBadge label={t.topBar.demoOnlyTag} tone="amber" />}
        actions={
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="nr-focus-ring nr-transition inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-[var(--nr-primary)] hover:bg-[var(--nr-primary-hover)] text-xs font-semibold text-[var(--nr-primary-fg)] whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{locale === 'es' ? 'Nuevo movimiento bancario' : 'New bank movement'}</span>
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {erpState.bankAccounts.map((bank) => {
          const pendingCount = erpState.bankTransactions.filter(
            (tx) => tx.bankAccountId === bank.id && !tx.reconciled
          ).length;
          return (
            <ErpSurfaceCard key={bank.id} padding="md">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl border border-[var(--nr-success-border)] bg-[var(--nr-success-bg)] text-[var(--nr-success)] flex items-center justify-center shrink-0">
                    <Landmark className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-[var(--nr-text)]">
                      {bank.bankName}
                    </div>
                    <div className="font-mono-num text-xs text-[var(--nr-text-secondary)]">
                      {bank.accountNumber} · {bank.currency}
                    </div>
                    <div className="mt-1 text-[11px] text-[var(--nr-text-secondary)] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-[var(--nr-success)]" />
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
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--nr-text-secondary)]">
                    {locale === 'es' ? 'Saldo en libro' : 'Ledger balance'}
                  </div>
                  <MoneyCell amount={bank.ledgerBalance} locale={locale} size="lg" emphasize />
                </div>
              </div>
            </ErpSurfaceCard>
          );
        })}
      </div>

      <DataTable
        columns={columns}
        rows={erpState.bankTransactions}
        getRowKey={(tx) => tx.id}
        emptyMessage={t.common.noResults}
      />

      <ErpModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={locale === 'es' ? 'Movimiento bancario (Solo demo)' : 'New bank transaction'}
        maxWidthClass="max-w-md"
        closeLabel={t.common.close}
        footer={
          <>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              disabled={isSubmitting}
              className="nr-focus-ring nr-transition h-9 px-3.5 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface)] text-xs font-semibold text-[var(--nr-text)] hover:bg-[var(--nr-surface-muted)]"
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              form="nr-bank-tx-form"
              disabled={isSubmitting}
              className="nr-focus-ring nr-transition h-9 px-4 rounded-lg bg-[var(--nr-primary)] hover:bg-[var(--nr-primary-hover)] text-xs font-semibold text-[var(--nr-primary-fg)] disabled:opacity-50"
            >
              {t.common.save}
            </button>
          </>
        }
      >
        <form id="nr-bank-tx-form" onSubmit={handleCreateTx} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-[var(--nr-text)] mb-1">
              {locale === 'es' ? 'Cuenta bancaria' : 'Bank account'}
            </label>
            <select
              value={bankAccountId}
              onChange={(e) => setBankAccountId(e.target.value)}
              className="nr-focus-ring nr-transition w-full h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-2.5 text-xs text-[var(--nr-text)]"
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
              <label className="block text-xs font-semibold text-[var(--nr-text)] mb-1">
                {locale === 'es' ? 'Tipo' : 'Type'}
              </label>
              <select
                value={txType}
                onChange={(e) => setTxType(e.target.value as BankTransaction['type'])}
                className="nr-focus-ring nr-transition w-full h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-2.5 text-xs text-[var(--nr-text)]"
              >
                <option value="DEPOSIT">DEPOSIT (+)</option>
                <option value="WITHDRAWAL">WITHDRAWAL (-)</option>
                <option value="TRANSFER">TRANSFER (+)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--nr-text)] mb-1">
                {locale === 'es' ? 'Importe RD$' : 'Amount RD$'}
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="nr-focus-ring nr-transition w-full h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-2.5 text-sm font-mono-num text-[var(--nr-text)]"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--nr-text)] mb-1">
              {locale === 'es' ? 'Referencia' : 'Reference'}
            </label>
            <input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="DEP-9901"
              className="nr-focus-ring nr-transition w-full h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-2.5 text-sm font-mono-num text-[var(--nr-text)]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--nr-text)] mb-1">
              {locale === 'es' ? 'Descripción' : 'Description'}
            </label>
            <input
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                locale === 'es' ? 'Depósito ventas del día' : 'Daily sales deposit'
              }
              className="nr-focus-ring nr-transition w-full h-9 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-2.5 text-sm text-[var(--nr-text)]"
            />
          </div>
        </form>
      </ErpModal>
    </div>
  );
};
