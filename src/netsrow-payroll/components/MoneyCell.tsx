import React from 'react';
import { formatCurrencyOrPending } from '../i18n/translations';
import { Locale } from '../types/payroll';

export interface MoneyCellProps {
  amount: number | null | undefined;
  locale: Locale;
  pendingLabel?: string;
  size?: 'sm' | 'md' | 'lg';
  emphasize?: boolean;
  className?: string;
}

/**
 * Renders Dominican Pesos (RD$) with tabular monospace digits,
 * explicitly distinguishing verified RD$0.00 from uncalculated Pending (null).
 */
export const MoneyCell: React.FC<MoneyCellProps> = ({
  amount,
  locale,
  pendingLabel,
  size = 'md',
  emphasize = false,
  className = '',
}) => {
  const { text, isPending, isZero } = formatCurrencyOrPending(
    amount,
    locale,
    pendingLabel
  );

  const sizeClass =
    size === 'lg'
      ? 'text-lg sm:text-xl font-bold'
      : size === 'sm'
        ? 'text-xs font-medium'
        : 'text-[13px] font-semibold';

  if (isPending) {
    return (
      <span
        className={`inline-flex items-center font-sans text-xs font-medium italic text-[var(--nr-text-secondary)] ${className}`}
      >
        {text}
      </span>
    );
  }

  const toneClass = emphasize
    ? 'text-[var(--nr-primary)]'
    : isZero
      ? 'text-[var(--nr-text-secondary)]'
      : 'text-[var(--nr-text)]';

  return (
    <span
      data-tabular="true"
      className={`font-mono-num whitespace-nowrap tabular-nums ${sizeClass} ${toneClass} ${className}`}
    >
      {text}
    </span>
  );
};
