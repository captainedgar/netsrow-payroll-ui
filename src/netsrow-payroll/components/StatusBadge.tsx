import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileEdit,
  Lock,
  ShieldCheck,
} from 'lucide-react';

export type BadgeTone = 'neutral' | 'amber' | 'emerald' | 'crimson' | 'navy';

export interface StatusBadgeProps {
  label: string;
  tone?: BadgeTone;
  icon?: 'draft' | 'review' | 'approved' | 'ready' | 'warning' | 'lock';
  className?: string;
}

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral:
    'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  amber:
    'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/70',
  emerald:
    'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/70',
  crimson:
    'bg-red-50 text-red-800 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800/70',
  navy:
    'bg-slate-900 text-white border-slate-800 dark:bg-slate-700 dark:text-slate-100 dark:border-slate-600',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  tone = 'neutral',
  icon,
  className = '',
}) => {
  const renderIcon = () => {
    const iconCls = 'w-3 h-3 shrink-0';
    switch (icon) {
      case 'draft':
        return <FileEdit className={iconCls} aria-hidden="true" />;
      case 'review':
        return <Clock className={iconCls} aria-hidden="true" />;
      case 'ready':
        return <ShieldCheck className={iconCls} aria-hidden="true" />;
      case 'approved':
        return <CheckCircle2 className={iconCls} aria-hidden="true" />;
      case 'warning':
        return <AlertTriangle className={iconCls} aria-hidden="true" />;
      case 'lock':
        return <Lock className={iconCls} aria-hidden="true" />;
      default:
        return null;
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded px-2 py-0.5 border text-[11px] font-semibold leading-4 whitespace-nowrap shrink-0 ${TONE_CLASSES[tone]} ${className}`}
    >
      {renderIcon()}
      <span>{label}</span>
    </span>
  );
};
