import React from 'react';
import { Locale } from '../types/payroll';
import { MoneyCell } from './MoneyCell';

export interface SummaryCardItem {
  id: string;
  label: string;
  helperText?: string;
  amount?: number | null;
  valueText?: string;
  isCurrency?: boolean;
  emphasize?: boolean;
}

export interface SummaryCardGridProps {
  items: SummaryCardItem[];
  locale: Locale;
  pendingLabel?: string;
  columns?: 3 | 4;
}

export const SummaryCardGrid: React.FC<SummaryCardGridProps> = ({
  items,
  locale,
  pendingLabel,
  columns = 4,
}) => {
  const gridCols =
    columns === 3
      ? 'grid-cols-1 sm:grid-cols-3'
      : 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4';

  return (
    <div className={`grid ${gridCols} gap-3 sm:gap-4`}>
      {items.map((item) => (
        <div
          key={item.id}
          className={`nr-transition rounded-xl border p-4 ${
            item.emphasize
              ? 'bg-[var(--nr-success-bg)] border-[var(--nr-success-border)]'
              : 'bg-[var(--nr-surface)] border-[var(--nr-border)]'
          }`}
        >
          <div className="text-xs font-medium text-[var(--nr-text-secondary)]">
            {item.label}
          </div>
          <div className="mt-2 min-w-0">
            {item.isCurrency ? (
              <MoneyCell
                amount={item.amount}
                locale={locale}
                pendingLabel={pendingLabel}
                size="lg"
                emphasize={item.emphasize}
              />
            ) : (
              <span
                data-tabular="true"
                className="font-mono-num text-lg sm:text-xl font-bold text-[var(--nr-text)]"
              >
                {item.valueText ?? '—'}
              </span>
            )}
          </div>
          {item.helperText && (
            <div className="mt-1.5 text-[11px] text-[var(--nr-text-secondary)]">
              {item.helperText}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
