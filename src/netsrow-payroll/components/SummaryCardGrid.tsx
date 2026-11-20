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
          className={`rounded-md border p-4 transition-colors ${
            item.emphasize
              ? 'bg-emerald-50/70 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800/70'
              : 'bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-700'
          }`}
        >
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {item.label}
          </div>
          <div className="mt-2">
            {item.isCurrency ? (
              <MoneyCell
                amount={item.amount}
                locale={locale}
                pendingLabel={pendingLabel}
                size="lg"
                emphasize={item.emphasize}
              />
            ) : (
              <span className="font-mono-num text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
                {item.valueText ?? '—'}
              </span>
            )}
          </div>
          {item.helperText && (
            <div className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
              {item.helperText}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
