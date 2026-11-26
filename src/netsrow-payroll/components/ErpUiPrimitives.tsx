import React, { useEffect, useRef } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Inbox,
  Loader2,
  Lock,
  Search,
  X,
} from 'lucide-react';

export interface ErpPageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  variant?: 'default' | 'hero';
  eyebrow?: string;
}

export const ErpPageHeader: React.FC<ErpPageHeaderProps> = ({
  title,
  subtitle,
  badge,
  actions,
  variant = 'default',
  eyebrow,
}) => {
  if (variant === 'hero') {
    return (
      <header className="nr-gradient-navy rounded-2xl border border-slate-800/90 p-5 sm:p-6 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 min-w-0">
            {eyebrow && (
              <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-300">
                {eyebrow}
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="font-display text-[26px] sm:text-[30px] font-bold tracking-tight leading-tight text-white">
                {title}
              </h1>
              {badge}
            </div>
            {subtitle && (
              <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>
          )}
        </div>
      </header>
    );
  }

  return (
    <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-1">
      <div className="min-w-0 space-y-1">
        {eyebrow && (
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--nr-primary)]">
            {eyebrow}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="font-display text-[26px] sm:text-[30px] font-bold tracking-tight leading-tight text-[var(--nr-text)]">
            {title}
          </h1>
          {badge}
        </div>
        {subtitle && (
          <p className="text-xs sm:text-sm text-[var(--nr-text-secondary)] max-w-3xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>
      )}
    </header>
  );
};

export interface ErpSurfaceCardProps {
  children: React.ReactNode;
  className?: string;
  elevated?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const ErpSurfaceCard: React.FC<ErpSurfaceCardProps> = ({
  children,
  className = '',
  elevated = false,
  padding = 'md',
}) => {
  const padClass =
    padding === 'none'
      ? ''
      : padding === 'sm'
        ? 'p-3 sm:p-4'
        : padding === 'lg'
          ? 'p-5 sm:p-6'
          : 'p-4 sm:p-5';

  return (
    <div
      className={`rounded-xl border border-[var(--nr-border)] ${
        elevated ? 'bg-[var(--nr-surface-elevated)]' : 'bg-[var(--nr-surface)]'
      } ${padClass} ${className}`}
    >
      {children}
    </div>
  );
};

export interface ErpFilterBarProps {
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
  children?: React.ReactNode;
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
  clearLabel?: string;
  activeFilterCount?: number;
  activeFilterLabel?: string;
}

export const ErpFilterBar: React.FC<ErpFilterBarProps> = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Buscar…',
  children,
  hasActiveFilters = false,
  onClearFilters,
  clearLabel = 'Limpiar filtros',
  activeFilterCount,
  activeFilterLabel,
}) => {
  return (
    <div className="rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface)] p-3 flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 flex-1 min-w-0">
        {onSearchChange !== undefined && (
          <div className="relative flex-1 min-w-0 max-w-md">
            <Search
              className="w-4 h-4 text-[var(--nr-text-secondary)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchValue ?? ''}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="nr-focus-ring nr-transition w-full h-10 pl-9 pr-3 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] text-sm text-[var(--nr-text)] placeholder:text-[var(--nr-text-secondary)]/75"
            />
          </div>
        )}
        {children && (
          <div className="flex flex-wrap items-center gap-2">{children}</div>
        )}
      </div>

      {hasActiveFilters && onClearFilters && (
        <div className="flex items-center gap-2 shrink-0">
          {typeof activeFilterCount === 'number' && activeFilterCount > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md border border-[var(--nr-success-border)] bg-[var(--nr-success-bg)] text-[11px] font-semibold text-[var(--nr-success)]">
              {activeFilterLabel ?? `${activeFilterCount}`}
            </span>
          )}
          <button
            type="button"
            onClick={onClearFilters}
            className="nr-focus-ring nr-transition inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-muted)] hover:border-[var(--nr-primary)] text-xs font-semibold text-[var(--nr-text)] whitespace-nowrap"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{clearLabel}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export interface ErpStatePanelProps {
  variant: 'loading' | 'empty' | 'error' | 'restricted' | 'pending' | 'success';
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const ErpStatePanel: React.FC<ErpStatePanelProps> = ({
  variant,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  const styles: Record<
    ErpStatePanelProps['variant'],
    { border: string; iconWrap: string; icon: React.ReactNode }
  > = {
    loading: {
      border: 'border-[var(--nr-border)] bg-[var(--nr-surface)]',
      iconWrap: 'bg-[var(--nr-surface-muted)] text-[var(--nr-primary)]',
      icon: <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />,
    },
    empty: {
      border: 'border-[var(--nr-border)] bg-[var(--nr-surface)]',
      iconWrap: 'bg-[var(--nr-surface-muted)] text-[var(--nr-text-secondary)]',
      icon: <Inbox className="w-5 h-5" aria-hidden="true" />,
    },
    error: {
      border: 'border-[var(--nr-error-border)] bg-[var(--nr-error-bg)]',
      iconWrap: 'bg-[var(--nr-surface)] text-[var(--nr-error)] border border-[var(--nr-error-border)]',
      icon: <AlertTriangle className="w-5 h-5" aria-hidden="true" />,
    },
    restricted: {
      border: 'border-[var(--nr-border)] bg-[var(--nr-surface)]',
      iconWrap: 'bg-[var(--nr-warning-bg)] text-[var(--nr-warning)] border border-[var(--nr-warning-border)]',
      icon: <Lock className="w-5 h-5" aria-hidden="true" />,
    },
    pending: {
      border: 'border-[var(--nr-warning-border)] bg-[var(--nr-warning-bg)]',
      iconWrap: 'bg-[var(--nr-surface)] text-[var(--nr-warning)] border border-[var(--nr-warning-border)]',
      icon: <Clock className="w-5 h-5" aria-hidden="true" />,
    },
    success: {
      border: 'border-[var(--nr-success-border)] bg-[var(--nr-success-bg)]',
      iconWrap: 'bg-[var(--nr-surface)] text-[var(--nr-success)] border border-[var(--nr-success-border)]',
      icon: <CheckCircle2 className="w-5 h-5" aria-hidden="true" />,
    },
  };

  const cfg = styles[variant];

  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={`rounded-xl border p-6 text-center flex flex-col items-center justify-center gap-3 ${cfg.border} ${className}`}
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cfg.iconWrap}`}
      >
        {cfg.icon}
      </div>
      <div className="space-y-1 max-w-md">
        <div className="font-display text-sm font-bold text-[var(--nr-text)]">
          {title}
        </div>
        {description && (
          <p className="text-xs text-[var(--nr-text-secondary)] leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="nr-focus-ring nr-transition inline-flex items-center justify-center h-9 px-4 rounded-lg bg-[var(--nr-primary)] hover:bg-[var(--nr-primary-hover)] text-xs font-semibold text-[var(--nr-primary-fg)]"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export interface ErpModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidthClass?: string;
  closeLabel?: string;
}

export const ErpModal: React.FC<ErpModalProps> = ({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidthClass = 'max-w-lg',
  closeLabel = 'Cerrar',
}) => {
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });
    return () => {
      window.removeEventListener('keydown', handleKey);
      previousFocusRef.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="nr-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`w-full ${maxWidthClass} rounded-2xl border border-[var(--nr-border)] bg-[var(--nr-surface)] text-[var(--nr-text)] shadow-2xl max-h-[90dvh] flex flex-col overflow-hidden`}
      >
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-[var(--nr-border)] shrink-0">
          <div className="min-w-0">
            <h2
              id="nr-modal-title"
              className="font-display text-base sm:text-lg font-bold tracking-tight text-[var(--nr-text)]"
            >
              {title}
            </h2>
            {subtitle && (
              <p className="mt-0.5 text-xs text-[var(--nr-text-secondary)]">
                {subtitle}
              </p>
            )}
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="nr-focus-ring nr-transition p-1.5 rounded-lg text-[var(--nr-text-secondary)] hover:text-[var(--nr-text)] hover:bg-[var(--nr-surface-muted)] shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1 min-h-0">{children}</div>

        {footer && (
          <div className="flex flex-wrap items-center justify-end gap-2 px-5 py-3.5 border-t border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export interface ErpConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: 'primary' | 'danger';
  isConfirming?: boolean;
}

export const ErpConfirmDialog: React.FC<ErpConfirmDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancelar',
  tone = 'primary',
  isConfirming = false,
}) => (
  <ErpModal
    open={open}
    onClose={onClose}
    title={title}
    maxWidthClass="max-w-md"
    footer={
      <>
        <button
          type="button"
          onClick={onClose}
          disabled={isConfirming}
          className="nr-focus-ring nr-transition h-9 px-3.5 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface)] text-xs font-semibold text-[var(--nr-text)] hover:bg-[var(--nr-surface-muted)]"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isConfirming}
          className={`nr-focus-ring nr-transition inline-flex items-center gap-1.5 h-9 px-4 rounded-lg text-xs font-semibold disabled:opacity-50 ${
            tone === 'danger'
              ? 'bg-[var(--nr-error)] text-white hover:opacity-90'
              : 'bg-[var(--nr-primary)] hover:bg-[var(--nr-primary-hover)] text-[var(--nr-primary-fg)]'
          }`}
        >
          {isConfirming && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          <span>{confirmLabel}</span>
        </button>
      </>
    }
  >
    <p className="text-xs sm:text-sm text-[var(--nr-text-secondary)] leading-relaxed">
      {description}
    </p>
  </ErpModal>
);
