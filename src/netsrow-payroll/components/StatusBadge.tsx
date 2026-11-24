import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileEdit,
  Lock,
  ShieldCheck,
} from 'lucide-react';
import { ActivityStatusType } from '../types/erp';
import { Locale } from '../types/payroll';

export type BadgeTone = 'neutral' | 'amber' | 'emerald' | 'crimson' | 'navy';
export type BadgeIcon =
  | 'draft'
  | 'review'
  | 'approved'
  | 'ready'
  | 'warning'
  | 'lock';

export type { ActivityStatusType };

export interface StatusBadgePreset {
  tone: BadgeTone;
  icon: BadgeIcon;
  defaultLabelEs: string;
  defaultLabelEn: string;
}

const ACTIVITY_STATUS_PRESETS: Record<ActivityStatusType, StatusBadgePreset> = {
  // Green (Approved / Ready / Active / Open)
  approved: {
    tone: 'emerald',
    icon: 'approved',
    defaultLabelEs: 'Aprobada',
    defaultLabelEn: 'Approved',
  },
  ready: {
    tone: 'emerald',
    icon: 'ready',
    defaultLabelEs: 'Lista para revisión',
    defaultLabelEn: 'Ready for review',
  },
  completed: {
    tone: 'emerald',
    icon: 'approved',
    defaultLabelEs: 'Completado',
    defaultLabelEn: 'Completed',
  },
  active: {
    tone: 'emerald',
    icon: 'approved',
    defaultLabelEs: 'Activo',
    defaultLabelEn: 'Active',
  },
  open: {
    tone: 'emerald',
    icon: 'ready',
    defaultLabelEs: 'Abierta',
    defaultLabelEn: 'Open',
  },
  ok: {
    tone: 'emerald',
    icon: 'approved',
    defaultLabelEs: 'Sin alertas',
    defaultLabelEn: 'All clear',
  },

  // Yellow / Amber (Pending / In Review / Simulated / Warning / Locked)
  pending: {
    tone: 'amber',
    icon: 'review',
    defaultLabelEs: 'Pendiente',
    defaultLabelEn: 'Pending',
  },
  in_review: {
    tone: 'amber',
    icon: 'review',
    defaultLabelEs: 'En revisión',
    defaultLabelEn: 'In review',
  },
  simulated: {
    tone: 'amber',
    icon: 'review',
    defaultLabelEs: 'Simulación',
    defaultLabelEn: 'Simulated',
  },
  warning: {
    tone: 'amber',
    icon: 'warning',
    defaultLabelEs: 'Advertencia',
    defaultLabelEn: 'Warning',
  },
  leave: {
    tone: 'amber',
    icon: 'review',
    defaultLabelEs: 'En licencia',
    defaultLabelEn: 'On leave',
  },
  locked: {
    tone: 'amber',
    icon: 'lock',
    defaultLabelEs: 'Bloqueado',
    defaultLabelEn: 'Locked',
  },
  closed: {
    tone: 'amber',
    icon: 'lock',
    defaultLabelEs: 'Cerrada',
    defaultLabelEn: 'Closed',
  },

  // Red / Crimson (Alert / Error / Critical / Incomplete / Suspended)
  alert: {
    tone: 'crimson',
    icon: 'warning',
    defaultLabelEs: 'Alerta',
    defaultLabelEn: 'Alert',
  },
  error: {
    tone: 'crimson',
    icon: 'warning',
    defaultLabelEs: 'Error',
    defaultLabelEn: 'Error',
  },
  critical: {
    tone: 'crimson',
    icon: 'warning',
    defaultLabelEs: 'Crítico',
    defaultLabelEn: 'Critical',
  },
  suspended: {
    tone: 'crimson',
    icon: 'warning',
    defaultLabelEs: 'Suspendido',
    defaultLabelEn: 'Suspended',
  },
  incomplete: {
    tone: 'crimson',
    icon: 'warning',
    defaultLabelEs: 'Incompleto',
    defaultLabelEn: 'Incomplete',
  },

  // Neutral / Navy (Draft / Update)
  draft: {
    tone: 'neutral',
    icon: 'draft',
    defaultLabelEs: 'Borrador',
    defaultLabelEn: 'Draft',
  },
  update: {
    tone: 'navy',
    icon: 'draft',
    defaultLabelEs: 'Actualización',
    defaultLabelEn: 'Update',
  },
  neutral: {
    tone: 'neutral',
    icon: 'draft',
    defaultLabelEs: 'Informativo',
    defaultLabelEn: 'Info',
  },
};

const ALIAS_MAP: Record<string, ActivityStatusType> = {
  approved: 'approved',
  aprobada: 'approved',
  aprobado: 'approved',
  ready: 'ready',
  ready_for_final_review: 'ready',
  completed: 'completed',
  active: 'active',
  open: 'open',
  ok: 'ok',
  pending: 'pending',
  pendiente: 'pending',
  in_review: 'in_review',
  simulated: 'simulated',
  simulation_completed: 'simulated',
  warning: 'warning',
  tss_pending: 'warning',
  leave: 'leave',
  locked: 'locked',
  lock: 'locked',
  closed: 'closed',
  alert: 'alert',
  alerta: 'alert',
  error: 'error',
  critical: 'critical',
  suspended: 'suspended',
  incomplete: 'incomplete',
  incomplete_checks: 'incomplete',
  ir3_warning: 'alert',
  draft: 'draft',
  borrador: 'draft',
  update: 'update',
  neutral: 'neutral',
};

export function resolveStatusBadgePreset(
  activityStatus?: ActivityStatusType | string
): StatusBadgePreset | null {
  if (!activityStatus) return null;
  const normalized = activityStatus.trim().toLowerCase().replace(/[\s-]+/g, '_');
  const key = ALIAS_MAP[normalized];
  if (!key) return null;
  return ACTIVITY_STATUS_PRESETS[key];
}

export interface StatusBadgeProps {
  /** Custom display text; optional when activityStatus is provided */
  label?: string;
  /** Semantic activity/status type (e.g. 'approved', 'pending', 'alert') */
  activityStatus?: ActivityStatusType | string;
  /** Locale used for fallback label when only activityStatus is passed */
  locale?: Locale;
  /** Explicit visual tone override */
  tone?: BadgeTone;
  /** Explicit icon override */
  icon?: BadgeIcon;
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
  activityStatus,
  locale = 'es',
  tone,
  icon,
  className = '',
}) => {
  const preset = resolveStatusBadgePreset(activityStatus);
  const resolvedTone: BadgeTone = tone ?? preset?.tone ?? 'neutral';
  const resolvedIcon: BadgeIcon | undefined = icon ?? preset?.icon;
  const resolvedLabel =
    label ??
    (preset
      ? locale === 'es'
        ? preset.defaultLabelEs
        : preset.defaultLabelEn
      : activityStatus ?? '');

  const renderIcon = () => {
    const iconCls = 'w-3 h-3 shrink-0';
    switch (resolvedIcon) {
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
      data-status-tone={resolvedTone}
      data-activity-status={activityStatus ?? undefined}
      className={`inline-flex items-center gap-1.5 rounded px-2 py-0.5 border text-[11px] font-semibold leading-4 whitespace-nowrap shrink-0 ${TONE_CLASSES[resolvedTone]} ${className}`}
    >
      {renderIcon()}
      <span>{resolvedLabel}</span>
    </span>
  );
};
