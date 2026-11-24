import React from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Circle,
  Clock,
  MonitorSmartphone,
  PackageCheck,
} from 'lucide-react';
import { CommercialFooter } from '../components/CommercialFooter';
import { CommercialHeader } from '../components/CommercialHeader';
import { QuoteRequestForm } from '../components/QuoteRequestForm';
import { QuoteSummaryPanel } from '../components/QuoteSummaryPanel';
import { ConfiguratorStep, useCommercial } from '../context/CommercialContext';
import { formatDopCents } from '../services/commercialPricing';
import { COMMERCIAL_MODULE_LABELS } from '../services/mockCommercialClient';

export const PlansConfiguratorScreen: React.FC = () => {
  const {
    catalog,
    selection,
    dependencyCheck,
    configuratorStep,
    setConfiguratorStep,
    setContractMode,
    selectPlan,
    toggleAddon,
    confirmRequiredDependencies,
    selectHardware,
    setHardwareQuantity,
    selectPaymentOption,
    selectInstallation,
    selectTraining,
    applyPreset,
    locale,
    theme,
    ct,
    navigateTo,
  } = useCommercial();

  const activePlan =
    catalog.plans.find((p) => p.id === selection.planId) ?? catalog.plans[0];
  const activeHardware =
    catalog.hardwareOptions.find((h) => h.id === selection.hardwareId) ??
    catalog.hardwareOptions[0];

  const addonsCatalog = catalog.modules.filter((m) => m.category !== 'CORE');
  const availableInstallations = catalog.installationOptions.filter((i) =>
    i.applicableModes.includes(selection.mode)
  );
  const availableTrainings = catalog.trainingOptions.filter((t) =>
    t.applicableModes.includes(selection.mode)
  );

  const selectedLabel = locale === 'es' ? 'Seleccionado' : 'Selected';
  const availableLabel = locale === 'es' ? 'Disponible' : 'Available';

  const steps: { id: ConfiguratorStep; label: string }[] = [
    { id: 1, label: ct.configurator.step1Title },
    { id: 2, label: ct.configurator.step2Title },
    {
      id: 3,
      label:
        selection.mode === 'POS_BUNDLE'
          ? ct.configurator.step3Title
          : ct.configurator.step3TitleSoftware,
    },
    { id: 4, label: ct.configurator.step4Title },
  ];

  const handleAdvanceFromStep2 = () => {
    if (!dependencyCheck.valid) return;
    setConfiguratorStep(3);
  };

  return (
    <div
      className={`netsrow-commercial-shell min-h-screen flex flex-col ${
        theme === 'dark' ? 'dark' : ''
      }`}
    >
      <CommercialHeader />

      <main className="flex-1 py-8 sm:py-12 pb-28 lg:pb-20">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Header + Preset Scenarios */}
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => navigateTo('/')}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[var(--nr-text-secondary)] hover:text-[var(--nr-primary)] rounded-lg nr-focus-ring nr-transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{ct.configurator.backToHome}</span>
            </button>

            <div className="space-y-1.5">
              <h1 className="font-display text-[28px] sm:text-[36px] font-bold tracking-tight text-[var(--nr-text)] leading-[1.12]">
                {ct.configurator.title}
              </h1>
              <p className="text-sm sm:text-base text-[var(--nr-text-secondary)] max-w-3xl leading-relaxed">
                {ct.configurator.subtitle}
              </p>
            </div>

            {/* Verifiable illustrative presets */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs">
              <span className="font-semibold text-[var(--nr-text-secondary)]">
                {ct.configurator.presetsLabel}
              </span>
              <button
                type="button"
                onClick={() => applyPreset('SOFTWARE_PAYROLL')}
                className="rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface)] hover:border-[var(--nr-primary)] px-3.5 py-2 font-medium text-[var(--nr-text)] nr-focus-ring nr-transition"
              >
                {ct.configurator.presetSoftwarePayroll}
              </button>
              <button
                type="button"
                onClick={() => applyPreset('BUNDLE_INSTALLMENTS')}
                className="rounded-xl border border-[var(--nr-success-border)] bg-[var(--nr-success-bg)] hover:border-[var(--nr-primary)] px-3.5 py-2 font-medium text-[var(--nr-success)] nr-focus-ring nr-transition"
              >
                {ct.configurator.presetBundleInstallments}
              </button>
            </div>
          </div>

          {/* Stepper Navigation */}
          <nav
            aria-label={ct.configurator.title}
            className="grid grid-cols-2 lg:grid-cols-4 gap-2.5"
          >
            {steps.map((st) => {
              const active = configuratorStep === st.id;
              const completed = st.id < configuratorStep;
              const disabled = st.id > 2 && !dependencyCheck.valid;
              return (
                <button
                  key={st.id}
                  type="button"
                  disabled={disabled}
                  aria-current={active ? 'step' : undefined}
                  onClick={() => setConfiguratorStep(st.id)}
                  className={`flex items-center gap-2 rounded-xl border px-3.5 py-3 text-left text-xs sm:text-sm font-semibold nr-focus-ring nr-transition disabled:opacity-45 ${
                    active
                      ? 'border-[var(--nr-primary)] bg-[var(--nr-primary)] text-[var(--nr-primary-fg)]'
                      : completed
                        ? 'border-[var(--nr-success-border)] bg-[var(--nr-success-bg)] text-[var(--nr-success)]'
                        : 'border-[var(--nr-border)] bg-[var(--nr-surface)] text-[var(--nr-text)] hover:border-[var(--nr-primary)]/60'
                  }`}
                >
                  {completed ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : active ? (
                    <Check className="w-4 h-4 shrink-0" />
                  ) : (
                    <Circle className="w-3.5 h-3.5 shrink-0 opacity-50" />
                  )}
                  <span className="block truncate">{st.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Main Grid: Options (8 cols) + Sticky Live Summary (4 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8 space-y-6">
              {/* STEP 1: Contract Mode */}
              {configuratorStep === 1 && (
                <section
                  style={{ boxShadow: 'var(--nr-shadow-config)' }}
                  className="rounded-[20px] border border-[var(--nr-border)] bg-[var(--nr-surface)] p-5 sm:p-7 space-y-6 nr-transition"
                >
                  <div className="space-y-1">
                    <h2 className="font-display text-xl font-bold text-[var(--nr-text)]">
                      {ct.configurator.step1Title}
                    </h2>
                    <p className="text-sm text-[var(--nr-text-secondary)]">
                      {ct.configurator.step1Desc}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      type="button"
                      aria-pressed={selection.mode === 'SOFTWARE_ONLY'}
                      onClick={() => setContractMode('SOFTWARE_ONLY')}
                      className={`text-left rounded-2xl border p-5 space-y-3.5 nr-focus-ring nr-transition ${
                        selection.mode === 'SOFTWARE_ONLY'
                          ? 'border-[var(--nr-primary)] bg-[var(--nr-success-bg)]/55'
                          : 'border-[var(--nr-border)] bg-[var(--nr-bg)] hover:border-[var(--nr-primary)]/50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="w-10 h-10 rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface)] text-[var(--nr-primary)] flex items-center justify-center">
                          <MonitorSmartphone className="w-5 h-5" />
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${
                            selection.mode === 'SOFTWARE_ONLY'
                              ? 'border-[var(--nr-success-border)] bg-[var(--nr-success-bg)] text-[var(--nr-success)]'
                              : 'border-[var(--nr-border)] bg-[var(--nr-surface)] text-[var(--nr-text-secondary)]'
                          }`}
                        >
                          {selection.mode === 'SOFTWARE_ONLY' ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <Circle className="w-3 h-3" />
                          )}
                          <span>
                            {selection.mode === 'SOFTWARE_ONLY'
                              ? selectedLabel
                              : availableLabel}
                          </span>
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="font-display text-base font-bold text-[var(--nr-text)]">
                          {ct.contractModes.softwareTitle}
                        </div>
                        <p className="text-xs sm:text-sm text-[var(--nr-text-secondary)] leading-relaxed">
                          {ct.contractModes.softwareDesc}
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      aria-pressed={selection.mode === 'POS_BUNDLE'}
                      onClick={() => setContractMode('POS_BUNDLE')}
                      className={`text-left rounded-2xl border p-5 space-y-3.5 nr-focus-ring nr-transition ${
                        selection.mode === 'POS_BUNDLE'
                          ? 'border-[var(--nr-primary)] bg-[var(--nr-success-bg)]/55'
                          : 'border-[var(--nr-border)] bg-[var(--nr-bg)] hover:border-[var(--nr-primary)]/50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="w-10 h-10 rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface)] text-[var(--nr-primary)] flex items-center justify-center">
                          <PackageCheck className="w-5 h-5" />
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${
                            selection.mode === 'POS_BUNDLE'
                              ? 'border-[var(--nr-success-border)] bg-[var(--nr-success-bg)] text-[var(--nr-success)]'
                              : 'border-[var(--nr-border)] bg-[var(--nr-surface)] text-[var(--nr-text-secondary)]'
                          }`}
                        >
                          {selection.mode === 'POS_BUNDLE' ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <Circle className="w-3 h-3" />
                          )}
                          <span>
                            {selection.mode === 'POS_BUNDLE'
                              ? selectedLabel
                              : availableLabel}
                          </span>
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="font-display text-base font-bold text-[var(--nr-text)]">
                          {ct.contractModes.bundleTitle}
                        </div>
                        <p className="text-xs sm:text-sm text-[var(--nr-text-secondary)] leading-relaxed">
                          {ct.contractModes.bundleDesc}
                        </p>
                      </div>
                    </button>
                  </div>

                  <div className="flex justify-end pt-2 border-t border-[var(--nr-border)]">
                    <button
                      type="button"
                      onClick={() => setConfiguratorStep(2)}
                      className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-[var(--nr-primary)] hover:bg-[var(--nr-primary-hover)] text-sm font-semibold text-[var(--nr-primary-fg)] nr-focus-ring nr-transition"
                    >
                      <span>{ct.configurator.nextStep}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </section>
              )}

              {/* STEP 2: Base Plan & Optional Modules */}
              {configuratorStep === 2 && (
                <section
                  style={{ boxShadow: 'var(--nr-shadow-config)' }}
                  className="rounded-[20px] border border-[var(--nr-border)] bg-[var(--nr-surface)] p-5 sm:p-7 space-y-6 nr-transition"
                >
                  <div className="space-y-1">
                    <h2 className="font-display text-xl font-bold text-[var(--nr-text)]">
                      {ct.configurator.step2Title}
                    </h2>
                    <p className="text-sm text-[var(--nr-text-secondary)]">
                      {ct.configurator.step2Desc}
                    </p>
                  </div>

                  {/* Base Plan Picker */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {catalog.plans.map((plan) => {
                      const selected = selection.planId === plan.id;
                      return (
                        <button
                          key={plan.id}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => selectPlan(plan.id)}
                          className={`text-left rounded-2xl border p-4 sm:p-5 space-y-2.5 nr-focus-ring nr-transition ${
                            selected
                              ? 'border-[var(--nr-primary)] bg-[var(--nr-success-bg)]/55'
                              : 'border-[var(--nr-border)] bg-[var(--nr-bg)] hover:border-[var(--nr-primary)]/50'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-display text-base font-bold text-[var(--nr-text)]">
                              {locale === 'es' ? plan.nameEs : plan.nameEn}
                            </span>
                            <span className="font-mono-num text-sm sm:text-base font-bold text-[var(--nr-primary)] whitespace-nowrap">
                              {formatDopCents(plan.monthlyPriceCents, locale)}
                              {ct.modulesSection.perMonth}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-[var(--nr-text-secondary)] leading-relaxed">
                            {locale === 'es' ? plan.summaryEs : plan.summaryEn}
                          </p>
                          <div className="flex items-center justify-between gap-2 pt-1">
                            <span className="text-[11px] font-semibold text-[var(--nr-warning)]">
                              {locale === 'es'
                                ? catalog.conditions.illustrativeLabelEs
                                : catalog.conditions.illustrativeLabelEn}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${
                                selected
                                  ? 'border-[var(--nr-success-border)] bg-[var(--nr-success-bg)] text-[var(--nr-success)]'
                                  : 'border-[var(--nr-border)] bg-[var(--nr-surface)] text-[var(--nr-text-secondary)]'
                              }`}
                            >
                              {selected ? (
                                <CheckCircle2 className="w-3 h-3" />
                              ) : (
                                <Circle className="w-3 h-3" />
                              )}
                              <span>{selected ? selectedLabel : availableLabel}</span>
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Included in selected plan */}
                  <div className="space-y-2.5">
                    <div className="text-xs font-semibold uppercase tracking-wide text-[var(--nr-text-secondary)]">
                      {ct.modulesSection.basePlanGroupTitle} (
                      {locale === 'es' ? activePlan.nameEs : activePlan.nameEn})
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {activePlan.includedModules.map((code) => (
                        <span
                          key={code}
                          className="inline-flex items-center gap-1.5 rounded-full border border-[var(--nr-success-border)] bg-[var(--nr-success-bg)] px-3 py-1 text-xs font-semibold text-[var(--nr-success)]"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{COMMERCIAL_MODULE_LABELS[code][locale]}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Optional Add-ons (distinguishes Included / Selected / Add-on / In development via text + icon) */}
                  <div className="space-y-3">
                    <div className="text-xs font-semibold uppercase tracking-wide text-[var(--nr-text-secondary)]">
                      {ct.modulesSection.addonsGroupTitle}
                    </div>
                    <div className="space-y-2.5">
                      {addonsCatalog.map((mod) => {
                        const includedInPlan = activePlan.includedModules.includes(mod.code);
                        const isDev = mod.status === 'IN_DEVELOPMENT';
                        const checked =
                          includedInPlan || selection.selectedAddons.includes(mod.code);

                        return (
                          <label
                            key={mod.code}
                            className={`flex items-start justify-between gap-3 rounded-xl border p-4 text-xs sm:text-sm nr-transition ${
                              isDev
                                ? 'border-[var(--nr-border)] bg-[var(--nr-surface-muted)]/60 opacity-75 cursor-not-allowed'
                                : includedInPlan
                                  ? 'border-[var(--nr-success-border)] bg-[var(--nr-success-bg)]/45 cursor-default'
                                  : checked
                                    ? 'border-[var(--nr-primary)] bg-[var(--nr-success-bg)]/55 cursor-pointer'
                                    : 'border-[var(--nr-border)] bg-[var(--nr-bg)] cursor-pointer hover:border-[var(--nr-primary)]/60'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <input
                                type="checkbox"
                                checked={checked}
                                disabled={includedInPlan || isDev}
                                onChange={() => toggleAddon(mod.code)}
                                className="mt-1 h-4 w-4 accent-[#047857]"
                              />
                              <div className="space-y-1.5">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-display font-bold text-[var(--nr-text)]">
                                    {locale === 'es' ? mod.nameEs : mod.nameEn}
                                  </span>
                                  <span
                                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold border ${
                                      includedInPlan || checked
                                        ? 'border-[var(--nr-success-border)] bg-[var(--nr-success-bg)] text-[var(--nr-success)]'
                                        : isDev
                                          ? 'border-[var(--nr-warning-border)] bg-[var(--nr-warning-bg)] text-[var(--nr-warning)]'
                                          : 'border-[var(--nr-border)] bg-[var(--nr-surface)] text-[var(--nr-text-secondary)]'
                                    }`}
                                  >
                                    {includedInPlan ? (
                                      <>
                                        <Check className="w-3 h-3" />
                                        <span>{ct.modulesSection.statusIncluded}</span>
                                      </>
                                    ) : isDev ? (
                                      <>
                                        <Clock className="w-3 h-3" />
                                        <span>{ct.modulesSection.statusInDev}</span>
                                      </>
                                    ) : checked ? (
                                      <>
                                        <CheckCircle2 className="w-3 h-3" />
                                        <span>{selectedLabel}</span>
                                      </>
                                    ) : (
                                      <>
                                        <Circle className="w-3 h-3" />
                                        <span>{ct.modulesSection.statusAddon}</span>
                                      </>
                                    )}
                                  </span>

                                  {mod.isPrototypeDemoOnly && (
                                    <span className="text-[11px] font-medium text-[var(--nr-warning)]">
                                      · {ct.modulesSection.demoOnlyTag}
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs sm:text-sm text-[var(--nr-text-secondary)] leading-relaxed">
                                  {locale === 'es' ? mod.benefitEs : mod.benefitEn}
                                </div>
                                {mod.dependsOn.length > 0 && (
                                  <div className="text-[11px] text-[var(--nr-text-secondary)]">
                                    {ct.modulesSection.dependsOnLabel}{' '}
                                    {mod.dependsOn
                                      .map((d) => COMMERCIAL_MODULE_LABELS[d][locale])
                                      .join(', ')}
                                  </div>
                                )}
                              </div>
                            </div>

                            <span
                              className={`font-mono-num font-bold whitespace-nowrap shrink-0 ${
                                !includedInPlan &&
                                !isDev &&
                                (mod.priceStatus === 'QUOTE_REQUIRED' ||
                                  mod.monthlyPriceCents === null)
                                  ? 'text-[var(--nr-warning)]'
                                  : 'text-[var(--nr-text)]'
                              }`}
                            >
                              {includedInPlan
                                ? ct.modulesSection.statusIncluded
                                : isDev
                                  ? ct.modulesSection.statusInDev
                                  : mod.priceStatus === 'QUOTE_REQUIRED' ||
                                      mod.monthlyPriceCents === null
                                    ? ct.configurator.summaryPendingAmount
                                    : `+${formatDopCents(mod.monthlyPriceCents, locale)}${ct.modulesSection.perMonth}`}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Electronic Invoicing commercial details when selected or included */}
                  {(activePlan.includedModules.includes('E_INVOICING') ||
                    selection.selectedAddons.includes('E_INVOICING')) && (
                    <div className="rounded-2xl border border-[var(--nr-border)] bg-[var(--nr-bg)] p-4 sm:p-5 space-y-3 text-xs sm:text-sm">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-display font-bold text-[var(--nr-text)]">
                          {ct.nav.electronicInvoicing}
                        </span>
                        <span className="rounded-full border border-[var(--nr-warning-border)] bg-[var(--nr-warning-bg)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--nr-warning)]">
                          {catalog.electronicInvoicing.confirmedMonthlyPriceCents !== null
                            ? ct.modulesSection.statusAddon
                            : ct.configurator.summaryPendingAmount}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface)] p-3 space-y-0.5">
                          <div className="text-[var(--nr-text-secondary)]">
                            {ct.configurator.eInvoicingMonthlyLabel}
                          </div>
                          <div className="font-mono-num font-bold text-[var(--nr-text)]">
                            {catalog.electronicInvoicing.confirmedMonthlyPriceCents !== null
                              ? `${formatDopCents(
                                  catalog.electronicInvoicing.confirmedMonthlyPriceCents,
                                  locale
                                )}${ct.modulesSection.perMonth}`
                              : ct.configurator.summaryPendingAmount}
                          </div>
                        </div>

                        <div className="rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface)] p-3 space-y-0.5">
                          <div className="text-[var(--nr-text-secondary)]">
                            {ct.configurator.eInvoicingSetupLabel}
                          </div>
                          <div className="font-mono-num font-bold text-[var(--nr-text)]">
                            {catalog.electronicInvoicing.confirmedOneTimeImplementationCents !==
                            null
                              ? formatDopCents(
                                  catalog.electronicInvoicing
                                    .confirmedOneTimeImplementationCents,
                                  locale
                                )
                              : ct.configurator.summaryPendingAmount}
                          </div>
                        </div>
                      </div>

                      <div className="text-xs text-[var(--nr-text-secondary)] space-y-1">
                        <div>
                          <strong className="text-[var(--nr-text)]">
                            {ct.configurator.eInvoicingLimitsLabel}:{' '}
                          </strong>
                          {locale === 'es'
                            ? catalog.electronicInvoicing.applicableLimitsEs
                            : catalog.electronicInvoicing.applicableLimitsEn}
                        </div>
                        <div>
                          <strong className="text-[var(--nr-text)]">
                            {ct.eInvoicingSection.scopeLabel}:{' '}
                          </strong>
                          {locale === 'es'
                            ? catalog.electronicInvoicing.scopeEs
                            : catalog.electronicInvoicing.scopeEn}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Dependency Check Alert */}
                  {!dependencyCheck.valid && (
                    <div
                      role="alert"
                      className="rounded-xl border border-[var(--nr-warning-border)] bg-[var(--nr-warning-bg)] p-4 text-xs sm:text-sm text-[var(--nr-warning)] space-y-2.5"
                    >
                      <div className="flex items-center gap-2 font-bold">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>{ct.configurator.dependencyWarningTitle}</span>
                      </div>
                      <ul className="list-disc pl-5 space-y-1">
                        {dependencyCheck.missing.map((m) => (
                          <li key={m.module}>
                            <strong>{COMMERCIAL_MODULE_LABELS[m.module][locale]}</strong> →{' '}
                            {m.requires
                              .map((r) => COMMERCIAL_MODULE_LABELS[r][locale])
                              .join(', ')}
                          </li>
                        ))}
                      </ul>
                      <button
                        type="button"
                        onClick={confirmRequiredDependencies}
                        className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-xs text-white font-semibold nr-focus-ring nr-transition"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{ct.configurator.dependencyConfirmBtn}</span>
                      </button>
                    </div>
                  )}

                  <div className="flex justify-between pt-2 border-t border-[var(--nr-border)]">
                    <button
                      type="button"
                      onClick={() => setConfiguratorStep(1)}
                      className="inline-flex items-center gap-1.5 h-11 px-4 rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface-muted)] hover:border-[var(--nr-primary)] text-xs sm:text-sm font-semibold text-[var(--nr-text)] nr-focus-ring nr-transition"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>{ct.configurator.prevStep}</span>
                    </button>
                    <button
                      type="button"
                      disabled={!dependencyCheck.valid}
                      onClick={handleAdvanceFromStep2}
                      className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-[var(--nr-primary)] hover:bg-[var(--nr-primary-hover)] disabled:opacity-50 text-xs sm:text-sm font-semibold text-[var(--nr-primary-fg)] nr-focus-ring nr-transition"
                    >
                      <span>{ct.configurator.nextStep}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </section>
              )}

              {/* STEP 3: Equipment (if POS_BUNDLE), Installation, Training & Payment */}
              {configuratorStep === 3 && (
                <section
                  style={{ boxShadow: 'var(--nr-shadow-config)' }}
                  className="rounded-[20px] border border-[var(--nr-border)] bg-[var(--nr-surface)] p-5 sm:p-7 space-y-6 nr-transition"
                >
                  <div className="space-y-1">
                    <h2 className="font-display text-xl font-bold text-[var(--nr-text)]">
                      {selection.mode === 'POS_BUNDLE'
                        ? ct.configurator.step3Title
                        : ct.configurator.step3TitleSoftware}
                    </h2>
                    <p className="text-sm text-[var(--nr-text-secondary)]">
                      {selection.mode === 'POS_BUNDLE'
                        ? ct.configurator.step3Desc
                        : ct.configurator.step3DescSoftware}
                    </p>
                  </div>

                  {selection.mode === 'POS_BUNDLE' && (
                    <>
                      {/* Hardware package picker */}
                      <div className="space-y-3">
                        <div className="text-xs font-semibold uppercase tracking-wide text-[var(--nr-text-secondary)]">
                          {ct.nav.posBundle}
                        </div>
                        <div className="space-y-3">
                          {catalog.hardwareOptions.map((hw) => {
                            const selected = hw.id === selection.hardwareId;
                            return (
                              <button
                                key={hw.id}
                                type="button"
                                aria-pressed={selected}
                                onClick={() => selectHardware(hw.id)}
                                className={`w-full text-left rounded-2xl border p-4 sm:p-5 space-y-2.5 nr-focus-ring nr-transition ${
                                  selected
                                    ? 'border-[var(--nr-primary)] bg-[var(--nr-success-bg)]/55'
                                    : 'border-[var(--nr-border)] bg-[var(--nr-bg)] hover:border-[var(--nr-primary)]/50'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <div className="font-display text-sm sm:text-base font-bold text-[var(--nr-text)]">
                                    {locale === 'es' ? hw.nameEs : hw.nameEn}
                                  </div>
                                  <span
                                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border shrink-0 ${
                                      selected
                                        ? 'border-[var(--nr-success-border)] bg-[var(--nr-success-bg)] text-[var(--nr-success)]'
                                        : 'border-[var(--nr-border)] bg-[var(--nr-surface)] text-[var(--nr-text-secondary)]'
                                    }`}
                                  >
                                    {selected ? (
                                      <CheckCircle2 className="w-3 h-3" />
                                    ) : (
                                      <Circle className="w-3 h-3" />
                                    )}
                                    <span>{selected ? selectedLabel : availableLabel}</span>
                                  </span>
                                </div>
                                <ul className="space-y-1 text-xs sm:text-sm text-[var(--nr-text-secondary)]">
                                  {(locale === 'es' ? hw.specsEs : hw.specsEn).map((sp) => (
                                    <li key={sp} className="flex items-start gap-2">
                                      <Check className="w-3.5 h-3.5 text-[var(--nr-primary)] shrink-0 mt-1" />
                                      <span>{sp}</span>
                                    </li>
                                  ))}
                                </ul>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Quantity + Payment Option */}
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                        <div className="sm:col-span-4">
                          <label
                            htmlFor="nr-hardware-qty"
                            className="block text-xs font-semibold text-[var(--nr-text)] mb-1.5"
                          >
                            {ct.configurator.qtyLabel}
                          </label>
                          <input
                            id="nr-hardware-qty"
                            type="number"
                            min="1"
                            max="20"
                            value={selection.hardwareQuantity}
                            onChange={(e) => setHardwareQuantity(Number(e.target.value))}
                            className="w-full h-11 rounded-xl border border-[var(--nr-border)] bg-[var(--nr-bg)] px-3.5 text-sm font-mono-num text-[var(--nr-text)] nr-focus-ring nr-transition"
                          />
                          {selection.hardwareQuantity > activeHardware.maxSelfServiceQuantity && (
                            <p className="mt-1.5 text-[11px] text-[var(--nr-warning)]">
                              {ct.configurator.qtyMultiHint}
                            </p>
                          )}
                        </div>

                        <div className="sm:col-span-8 space-y-2">
                          <div className="text-xs font-semibold text-[var(--nr-text)]">
                            {ct.configurator.paymentMethodLabel}
                          </div>
                          <div className="space-y-2">
                            {activeHardware.paymentOptions.map((opt) => {
                              const checked = selection.paymentOptionId === opt.id;
                              return (
                                <label
                                  key={opt.id}
                                  className={`flex items-center gap-3 rounded-xl border px-3.5 py-3 text-xs sm:text-sm cursor-pointer nr-transition ${
                                    checked
                                      ? 'border-[var(--nr-primary)] bg-[var(--nr-success-bg)]/55'
                                      : 'border-[var(--nr-border)] bg-[var(--nr-bg)] hover:border-[var(--nr-primary)]/50'
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    name="hardware-payment"
                                    checked={checked}
                                    onChange={() => selectPaymentOption(opt.id)}
                                    className="h-4 w-4 accent-[#047857]"
                                  />
                                  <span className="font-medium text-[var(--nr-text)]">
                                    {locale === 'es' ? opt.labelEs : opt.labelEn}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Installation Options */}
                  <div className="space-y-2.5">
                    <div className="text-xs font-semibold uppercase tracking-wide text-[var(--nr-text-secondary)]">
                      {ct.configurator.installationLabel}
                    </div>
                    <div className="space-y-2">
                      {availableInstallations.map((inst) => {
                        const checked = selection.installationId === inst.id;
                        const pending =
                          inst.priceStatus === 'QUOTE_REQUIRED' ||
                          inst.oneTimePriceCents === null;
                        return (
                          <label
                            key={inst.id}
                            className={`flex items-start justify-between gap-3 rounded-xl border p-3.5 text-xs sm:text-sm cursor-pointer nr-transition ${
                              checked
                                ? 'border-[var(--nr-primary)] bg-[var(--nr-success-bg)]/55'
                                : 'border-[var(--nr-border)] bg-[var(--nr-bg)] hover:border-[var(--nr-primary)]/50'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <input
                                type="radio"
                                name="installation-option"
                                checked={checked}
                                onChange={() => selectInstallation(inst.id)}
                                className="mt-1 h-4 w-4 accent-[#047857]"
                              />
                              <div className="space-y-0.5">
                                <div className="font-semibold text-[var(--nr-text)]">
                                  {locale === 'es' ? inst.nameEs : inst.nameEn}
                                </div>
                                <div className="text-xs text-[var(--nr-text-secondary)]">
                                  {locale === 'es' ? inst.scopeEs : inst.scopeEn}
                                </div>
                              </div>
                            </div>
                            <span
                              className={`font-mono-num font-bold whitespace-nowrap shrink-0 ${
                                pending ? 'text-[var(--nr-warning)]' : 'text-[var(--nr-text)]'
                              }`}
                            >
                              {pending
                                ? ct.configurator.summaryPendingAmount
                                : formatDopCents(inst.oneTimePriceCents!, locale)}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Training Options */}
                  <div className="space-y-2.5">
                    <div className="text-xs font-semibold uppercase tracking-wide text-[var(--nr-text-secondary)]">
                      {ct.configurator.trainingLabel}
                    </div>
                    <div className="space-y-2">
                      {availableTrainings.map((trn) => {
                        const checked = selection.trainingId === trn.id;
                        const pending =
                          trn.priceStatus === 'QUOTE_REQUIRED' ||
                          trn.oneTimePriceCents === null;
                        return (
                          <label
                            key={trn.id}
                            className={`flex items-start justify-between gap-3 rounded-xl border p-3.5 text-xs sm:text-sm cursor-pointer nr-transition ${
                              checked
                                ? 'border-[var(--nr-primary)] bg-[var(--nr-success-bg)]/55'
                                : 'border-[var(--nr-border)] bg-[var(--nr-bg)] hover:border-[var(--nr-primary)]/50'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <input
                                type="radio"
                                name="training-option"
                                checked={checked}
                                onChange={() => selectTraining(trn.id)}
                                className="mt-1 h-4 w-4 accent-[#047857]"
                              />
                              <div className="space-y-0.5">
                                <div className="font-semibold text-[var(--nr-text)]">
                                  {locale === 'es' ? trn.nameEs : trn.nameEn}
                                </div>
                                <div className="text-xs text-[var(--nr-text-secondary)]">
                                  {locale === 'es' ? trn.scopeEs : trn.scopeEn}
                                </div>
                              </div>
                            </div>
                            <span
                              className={`font-mono-num font-bold whitespace-nowrap shrink-0 ${
                                pending
                                  ? 'text-[var(--nr-warning)]'
                                  : trn.includedInBundle
                                    ? 'text-[var(--nr-success)]'
                                    : 'text-[var(--nr-text)]'
                              }`}
                            >
                              {pending
                                ? ct.configurator.summaryPendingAmount
                                : trn.includedInBundle
                                  ? ct.modulesSection.statusIncluded
                                  : formatDopCents(trn.oneTimePriceCents!, locale)}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex justify-between pt-2 border-t border-[var(--nr-border)]">
                    <button
                      type="button"
                      onClick={() => setConfiguratorStep(2)}
                      className="inline-flex items-center gap-1.5 h-11 px-4 rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface-muted)] hover:border-[var(--nr-primary)] text-xs sm:text-sm font-semibold text-[var(--nr-text)] nr-focus-ring nr-transition"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>{ct.configurator.prevStep}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfiguratorStep(4)}
                      className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-[var(--nr-primary)] hover:bg-[var(--nr-primary-hover)] text-xs sm:text-sm font-semibold text-[var(--nr-primary-fg)] nr-focus-ring nr-transition"
                    >
                      <span>{ct.configurator.requestQuoteCta}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </section>
              )}

              {/* STEP 4: Quote Request Submission */}
              {configuratorStep === 4 && (
                <QuoteRequestForm onBackToEdit={() => setConfiguratorStep(3)} />
              )}
            </div>

            <div className="lg:col-span-4">
              <QuoteSummaryPanel onProceedToQuote={() => setConfiguratorStep(4)} />
            </div>
          </div>
        </div>
      </main>

      <CommercialFooter />
    </div>
  );
};
