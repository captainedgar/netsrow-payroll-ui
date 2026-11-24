import React, { useEffect, useState } from 'react';
import { AlertTriangle, ArrowRight, ChevronDown, ChevronUp, X } from 'lucide-react';
import { useCommercial } from '../context/CommercialContext';
import { formatDopCents } from '../services/commercialPricing';

export interface QuoteSummaryPanelProps {
  onProceedToQuote?: () => void;
  showQuoteCta?: boolean;
}

export const QuoteSummaryPanel: React.FC<QuoteSummaryPanelProps> = ({
  onProceedToQuote,
  showQuoteCta = true,
}) => {
  const {
    catalog,
    selection,
    breakdown,
    dependencyCheck,
    configuratorStep,
    setConfiguratorStep,
    locale,
    ct,
  } = useCommercial();

  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileOpen]);

  const activePlan =
    catalog.plans.find((p) => p.id === selection.planId) ?? catalog.plans[0];

  const handleRequestQuote = () => {
    setMobileOpen(false);
    if (onProceedToQuote) {
      onProceedToQuote();
    } else {
      setConfiguratorStep(4);
    }
  };

  const hasInstallments =
    selection.mode === 'POS_BUNDLE' && breakdown.installmentsCount > 0;

  const hasAnyMonthlyPending =
    breakdown.hasPendingSoftwarePricing ||
    (hasInstallments && breakdown.totalDuringInstallmentsCents === null);

  const primaryMonthlyDisplay = hasAnyMonthlyPending
    ? ct.configurator.summaryPendingAmount
    : hasInstallments
      ? `${formatDopCents(breakdown.totalDuringInstallmentsCents!, locale)}${ct.modulesSection.perMonth}`
      : `${formatDopCents(breakdown.softwareMonthlyCents, locale)}${ct.modulesSection.perMonth}`;

  const knownMonthlyHeadlineCents = hasInstallments
    ? breakdown.knownMonthlyDuringInstallmentsCents
    : breakdown.softwareMonthlyCents;

  const renderLines = () => (
    <div className="space-y-4 text-sm">
      {/* Emphasized Monthly Headline: differentiates known subtotal vs final total when pending */}
      <div className="rounded-2xl border border-[var(--nr-border)] bg-[var(--nr-bg)] p-4 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-medium text-[var(--nr-text-secondary)]">
            {hasInstallments
              ? ct.configurator.summaryDuringInstallments
              : ct.configurator.summarySoftwareMonthly}
          </span>
          <span className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-[var(--nr-warning-bg)] text-[var(--nr-warning)] border border-[var(--nr-warning-border)]">
            {locale === 'es'
              ? catalog.conditions.illustrativeLabelEs
              : catalog.conditions.illustrativeLabelEn}
          </span>
        </div>

        {breakdown.hasPendingPricing ? (
          <div className="space-y-1.5">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-[var(--nr-text-secondary)]">
                {ct.configurator.summaryKnownSubtotal}
              </div>
              <div className="font-mono-num text-xl sm:text-2xl font-bold tracking-tight text-[var(--nr-text)] whitespace-nowrap">
                {formatDopCents(knownMonthlyHeadlineCents, locale)}
                {ct.modulesSection.perMonth}
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[var(--nr-border)] text-xs">
              <span className="font-semibold text-[var(--nr-text-secondary)]">
                {ct.configurator.summaryFinalTotal}:
              </span>
              <span className="font-mono-num font-bold text-[var(--nr-warning)] whitespace-nowrap">
                {ct.configurator.summaryPendingAmount}
              </span>
            </div>
          </div>
        ) : (
          <div className="font-mono-num text-2xl sm:text-[26px] font-bold tracking-tight text-[var(--nr-primary)] whitespace-nowrap">
            {primaryMonthlyDisplay}
          </div>
        )}

        <div className="text-xs font-medium text-[var(--nr-text)]">
          {locale === 'es' ? activePlan.nameEs : activePlan.nameEn} ·{' '}
          <span className="text-[var(--nr-text-secondary)]">
            {selection.mode === 'POS_BUNDLE'
              ? ct.contractModes.bundleTitle
              : ct.contractModes.softwareTitle}
          </span>
        </div>
      </div>

      {/* Add-ons selected */}
      {breakdown.billedAddons.length > 0 && (
        <div className="pb-3 border-b border-[var(--nr-border)] space-y-1.5 text-xs">
          {breakdown.billedAddons.map((ad) => (
            <div key={ad.code} className="flex items-center justify-between gap-3">
              <span className="text-[var(--nr-text-secondary)] truncate">
                + {locale === 'es' ? ad.nameEs : ad.nameEn}
              </span>
              <span
                className={`font-mono-num whitespace-nowrap font-semibold ${
                  ad.priceStatus === 'QUOTE_REQUIRED' || ad.monthlyPriceCents === null
                    ? 'text-[var(--nr-warning)]'
                    : 'text-[var(--nr-text)]'
                }`}
              >
                {ad.priceStatus === 'QUOTE_REQUIRED' || ad.monthlyPriceCents === null
                  ? ct.configurator.summaryPendingAmount
                  : `${formatDopCents(ad.monthlyPriceCents, locale)}${ct.modulesSection.perMonth}`}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Itemized breakdown: Software, Equipment installments & count, One-time charges */}
      <div className="space-y-2.5 text-xs sm:text-[13px]">
        <div className="flex items-start justify-between gap-3">
          <span className="text-[var(--nr-text-secondary)]">
            {ct.configurator.summarySoftwareMonthly}
            {breakdown.hasPendingSoftwarePricing && ` (${ct.configurator.summaryKnownSubtotal})`}
          </span>
          <span className="font-mono-num font-semibold text-[var(--nr-text)] whitespace-nowrap">
            {formatDopCents(breakdown.softwareMonthlyCents, locale)}
            {ct.modulesSection.perMonth}
          </span>
        </div>

        {selection.mode === 'POS_BUNDLE' && (
          <div className="flex items-start justify-between gap-3">
            <span className="text-[var(--nr-text-secondary)]">
              {ct.configurator.summaryEquipmentMonthly}
              {breakdown.installmentsCount > 0 &&
                ` (${breakdown.installmentsCount} ${ct.configurator.summaryInstallmentsSuffix})`}
            </span>
            <span className="font-mono-num font-semibold text-[var(--nr-text)] whitespace-nowrap">
              {breakdown.equipmentMonthlyCents === null
                ? ct.configurator.summaryPendingAmount
                : breakdown.isUpfrontHardware
                  ? locale === 'es'
                    ? 'Pago único'
                    : 'Upfront'
                  : `${formatDopCents(breakdown.equipmentMonthlyCents, locale)}${ct.modulesSection.perMonth}`}
            </span>
          </div>
        )}

        <div className="flex items-start justify-between gap-3">
          <span className="text-[var(--nr-text-secondary)]">
            {ct.configurator.summaryOneTimeCharges}
            {breakdown.hasPendingOneTimePricing && ` (${ct.configurator.summaryKnownSubtotal})`}
          </span>
          <span className="font-mono-num font-semibold text-[var(--nr-text)] whitespace-nowrap">
            {breakdown.oneTimeChargesCents === null
              ? `${formatDopCents(breakdown.knownOneTimeChargesCents, locale)} + ${ct.configurator.summaryPendingAmount}`
              : formatDopCents(breakdown.oneTimeChargesCents, locale)}
          </span>
        </div>
      </div>

      {/* Dedicated After-Installments Monthly Line + Initial Due */}
      <div className="pt-3 border-t border-[var(--nr-border)] space-y-2.5 text-xs sm:text-[13px]">
        <div className="rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface-muted)] px-3 py-2.5 flex flex-wrap items-center justify-between gap-2">
          <span className="font-semibold text-[var(--nr-text)]">
            {ct.configurator.summaryAfterInstallments}
            {breakdown.hasPendingSoftwarePricing && ` (${ct.configurator.summaryKnownSubtotal})`}
          </span>
          <span className="font-mono-num font-bold text-[var(--nr-text)] whitespace-nowrap">
            {formatDopCents(breakdown.totalAfterInstallmentsCents, locale)}
            {ct.modulesSection.perMonth}
            {breakdown.hasPendingSoftwarePricing ? ` + ${ct.configurator.summaryPendingAmount}` : ''}
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 px-0.5">
          <span className="text-[var(--nr-text-secondary)]">
            {ct.configurator.summaryInitialTotal}
          </span>
          <span className="font-mono-num font-bold text-[var(--nr-text)] whitespace-nowrap">
            {breakdown.initialPaymentCents === null
              ? `${formatDopCents(breakdown.knownOneTimeChargesCents, locale)} + ${ct.configurator.summaryPendingAmount}`
              : formatDopCents(breakdown.initialPaymentCents, locale)}
          </span>
        </div>
      </div>

      {/* Pending items explicit disclosure */}
      {breakdown.hasPendingPricing && (
        <div className="rounded-xl border border-[var(--nr-warning-border)] bg-[var(--nr-warning-bg)] p-3 text-xs text-[var(--nr-warning)] space-y-1.5">
          <div className="flex items-center gap-2 font-semibold">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{ct.configurator.summaryPendingNotice}</span>
          </div>
          <ul className="list-disc pl-5 space-y-0.5">
            {breakdown.pendingQuoteItems.map((it) => (
              <li key={it.labelEs}>{locale === 'es' ? it.labelEs : it.labelEn}</li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-[11px] text-[var(--nr-text-secondary)] leading-relaxed">
        {locale === 'es' ? catalog.conditions.taxesNoteEs : catalog.conditions.taxesNoteEn}
      </p>

      {showQuoteCta && configuratorStep !== 4 && (
        <button
          type="button"
          disabled={!dependencyCheck.valid}
          onClick={handleRequestQuote}
          className="w-full h-11 rounded-xl bg-[var(--nr-primary)] hover:bg-[var(--nr-primary-hover)] disabled:opacity-50 text-sm font-semibold text-[var(--nr-primary-fg)] flex items-center justify-center gap-2 nr-focus-ring nr-transition"
        >
          <span>{ct.configurator.requestQuoteCta}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar Summary */}
      <aside
        style={{ boxShadow: 'var(--nr-shadow-config)' }}
        className="hidden lg:block lg:sticky lg:top-24 rounded-[20px] border border-[var(--nr-border)] bg-[var(--nr-surface)] p-6 space-y-4 nr-transition"
      >
        <h2 className="font-display text-base font-bold text-[var(--nr-text)]">
          {ct.configurator.summaryTitle}
        </h2>
        {renderLines()}
      </aside>

      {/* Mobile Bottom Sticky Bar (compact, full readable totals without clipping) */}
      <div className="lg:hidden fixed inset-x-0 bottom-0 z-30 border-t border-[var(--nr-border)] bg-[var(--nr-surface)] px-4 py-3 shadow-lg">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[11px] text-[var(--nr-text-secondary)] truncate">
              {breakdown.hasPendingPricing
                ? ct.configurator.summaryKnownSubtotal
                : hasInstallments
                  ? ct.configurator.summaryDuringInstallments
                  : ct.configurator.summarySoftwareMonthly}
            </div>
            <div className="font-mono-num text-sm sm:text-base font-bold text-[var(--nr-primary)] whitespace-nowrap">
              {`${formatDopCents(knownMonthlyHeadlineCents, locale)}${ct.modulesSection.perMonth}`}
              {breakdown.hasPendingPricing ? ` · ${ct.configurator.summaryPendingAmount}` : ''}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface-muted)] hover:border-[var(--nr-primary)] text-xs font-semibold text-[var(--nr-text)] whitespace-nowrap shrink-0 nr-focus-ring nr-transition"
          >
            <span>{ct.configurator.summaryOpenMobile}</span>
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Mobile Expandable Breakdown Drawer */}
      {mobileOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={ct.configurator.summaryTitle}
          className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end bg-slate-950/65"
        >
          <div className="bg-[var(--nr-surface)] border-t border-[var(--nr-border)] rounded-t-[20px] p-5 max-h-[85vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-base font-bold text-[var(--nr-text)]">
                {ct.configurator.summaryTitle}
              </h2>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label={ct.configurator.summaryCloseMobile}
                className="inline-flex items-center gap-1 h-9 px-2.5 rounded-xl border border-[var(--nr-border)] text-xs font-semibold text-[var(--nr-text-secondary)] hover:text-[var(--nr-text)] nr-focus-ring nr-transition"
              >
                <ChevronDown className="w-4 h-4" />
                <X className="w-4 h-4" />
              </button>
            </div>
            {renderLines()}
          </div>
        </div>
      )}
    </>
  );
};
