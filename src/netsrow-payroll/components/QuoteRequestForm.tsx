import { serverQuoteIntake } from "../services/httpCommercialClient";
import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  MessageCircle,
  Send,
  ShieldAlert,
} from 'lucide-react';
import { useCommercial } from '../context/CommercialContext';
import { formatDopCents } from '../services/commercialPricing';
import {
  buildWhatsAppQuoteUrl,
  formatQuoteSummaryMessage,
  validateQuoteContact,
} from '../services/mockCommercialClient';
import {
  CommercialFaultMode,
  ElectronicInvoicingExperience,
} from '../types/commercial';

export interface QuoteRequestFormProps {
  onBackToEdit?: () => void;
}

export const QuoteRequestForm: React.FC<QuoteRequestFormProps> = ({
  onBackToEdit,
}) => {
  const {
    catalog,
    selection,
    quoteDraft,
    updateQuoteDraft,
    isSubmittingQuote,
    quoteError,
    clearQuoteError,
    lastSubmission,
    clearSubmission,
    faultMode,
    setFaultMode,
    submitQuote,
    setConfiguratorStep,
    locale,
    ct,
  } = useCommercial();

  const [fieldErrors, setFieldErrors] = useState<{
    name?: boolean;
    business?: boolean;
    contact?: boolean;
  }>({});

  const activePlan =
    catalog.plans.find((p) => p.id === selection.planId) ?? catalog.plans[0];
  const activeHardware = catalog.hardwareOptions.find(
    (h) => h.id === selection.hardwareId
  );
  const activePayment = activeHardware?.paymentOptions.find(
    (p) => p.id === selection.paymentOptionId
  );
  const activeInstallation = catalog.installationOptions.find(
    (i) => i.id === selection.installationId
  );
  const activeTraining = catalog.trainingOptions.find(
    (t) => t.id === selection.trainingId
  );
  const includesEInvoicing =
    activePlan.includedModules.includes('E_INVOICING') ||
    selection.selectedAddons.includes('E_INVOICING');

  const formatEInvoicingExpLabel = (val?: ElectronicInvoicingExperience) => {
    if (val === 'YES') return ct.quoteForm.eInvoicingAlreadyYes;
    if (val === 'NO') return ct.quoteForm.eInvoicingAlreadyNo;
    if (val === 'UNSURE') return ct.quoteForm.eInvoicingAlreadyUnsure;
    return '';
  };

  const handleBack = () => {
    clearSubmission();
    if (onBackToEdit) {
      onBackToEdit();
    } else {
      setConfiguratorStep(selection.mode === 'POS_BUNDLE' ? 3 : 2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearQuoteError();
    const errs = {
      name: !quoteDraft.contactName.trim(),
      business: !quoteDraft.businessName.trim(),
      contact: !validateQuoteContact(quoteDraft.contactEmailOrWhatsapp),
    };
    setFieldErrors(errs);
    if (errs.name || errs.business || errs.contact) return;

    try {
      await submitQuote();
    } catch {
      // Error surfaced via quoteError banner
    }
  };

  if (lastSubmission && !lastSubmission.isDemoConfirmation) {
    return (
      <section role="status" className="rounded-2xl border border-[var(--nr-success-border)] bg-[var(--nr-surface)] p-6 space-y-3">
        <h3 className="font-display text-xl font-bold">
          {locale === 'es' ? lastSubmission.messageEs : lastSubmission.messageEn}
        </h3>
        <p className="font-mono break-all">{lastSubmission.quoteReference}</p>
        <button type="button" onClick={handleBack} className="underline nr-focus-ring">
          {ct.quoteForm.newConfigButton}
        </button>
      </section>
    );
  }

  if (lastSubmission) {
    const waText = formatQuoteSummaryMessage(lastSubmission.payload, catalog);
    const waUrl = buildWhatsAppQuoteUrl(
      catalog.conditions.whatsappCommercialNumber,
      waText
    );

    return (
      <div
        style={{ boxShadow: 'var(--nr-shadow-config)' }}
        className="rounded-[20px] border border-[var(--nr-success-border)] bg-[var(--nr-surface)] p-6 sm:p-8 space-y-5 nr-transition"
      >
        <div className="flex items-start gap-3.5">
          <CheckCircle2 className="w-6 h-6 text-[var(--nr-success)] shrink-0 mt-0.5" />
          <div className="space-y-1.5">
            <span className="inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-[var(--nr-warning-bg)] text-[var(--nr-warning)] border border-[var(--nr-warning-border)]">
              {ct.modulesSection.demoOnlyTag}
            </span>
            <h3 className="font-display text-xl font-bold text-[var(--nr-text)]">
              {ct.quoteForm.confirmedDemoTitle}
            </h3>
            <p className="text-sm text-[var(--nr-text-secondary)] leading-relaxed">
              {ct.quoteForm.confirmedDemoNote}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--nr-border)] bg-[var(--nr-bg)] p-4 text-sm space-y-2.5">
          <div className="flex flex-wrap justify-between gap-2">
            <span className="text-[var(--nr-text-secondary)]">{ct.quoteForm.quoteRefLabel}</span>
            <span className="font-mono-num font-bold text-[var(--nr-primary)]">
              {lastSubmission.quoteReference}
            </span>
          </div>
          <div className="flex flex-wrap justify-between gap-2">
            <span className="text-[var(--nr-text-secondary)]">{ct.quoteForm.businessLabel}</span>
            <span className="font-semibold text-[var(--nr-text)]">
              {lastSubmission.payload.contact.businessName}
            </span>
          </div>
          <div className="flex flex-wrap justify-between gap-2">
            <span className="text-[var(--nr-text-secondary)]">
              {ct.configurator.summarySoftwareMonthly}
            </span>
            <span className="font-mono-num font-bold text-[var(--nr-text)] whitespace-nowrap">
              {formatDopCents(lastSubmission.payload.breakdown.softwareMonthlyCents, locale)}
              {ct.modulesSection.perMonth}
            </span>
          </div>
          {lastSubmission.payload.breakdown.installmentsCount > 0 && (
            <div className="flex flex-wrap justify-between gap-2">
              <span className="text-[var(--nr-text-secondary)]">
                {ct.configurator.summaryDuringInstallments}
              </span>
              <span className="font-mono-num font-bold text-[var(--nr-primary)] whitespace-nowrap">
                {lastSubmission.payload.breakdown.totalDuringInstallmentsCents === null
                  ? ct.configurator.summaryPendingAmount
                  : `${formatDopCents(
                      lastSubmission.payload.breakdown.totalDuringInstallmentsCents,
                      locale
                    )}${ct.modulesSection.perMonth}`}
              </span>
            </div>
          )}
          {lastSubmission.payload.selection.selectedAddons.includes('E_INVOICING') && (
            <div className="pt-2 border-t border-[var(--nr-border)] space-y-1 text-xs">
              <div className="flex flex-wrap justify-between gap-2">
                <span className="text-[var(--nr-text-secondary)]">
                  {ct.nav.electronicInvoicing}
                </span>
                <span className="font-mono-num font-semibold text-[var(--nr-warning)]">
                  {ct.configurator.summaryPendingAmount}
                </span>
              </div>
              {lastSubmission.payload.contact.alreadyIssuesElectronicReceipts && (
                <div className="flex flex-wrap justify-between gap-2">
                  <span className="text-[var(--nr-text-secondary)]">
                    {ct.quoteForm.eInvoicingAlreadyLabel}
                  </span>
                  <span className="font-medium text-[var(--nr-text)]">
                    {formatEInvoicingExpLabel(
                      lastSubmission.payload.contact.alreadyIssuesElectronicReceipts
                    )}
                  </span>
                </div>
              )}
              {lastSubmission.payload.contact.eInvoicingBranchesCount && (
                <div className="flex flex-wrap justify-between gap-2">
                  <span className="text-[var(--nr-text-secondary)]">
                    {ct.quoteForm.eInvoicingBranchesLabel}
                  </span>
                  <span className="font-mono-num font-medium text-[var(--nr-text)]">
                    {lastSubmission.payload.contact.eInvoicingBranchesCount}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 h-11 px-5 rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface)] hover:bg-[var(--nr-surface-muted)] text-sm font-semibold text-[var(--nr-text)] nr-focus-ring nr-transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{ct.quoteForm.newConfigButton}</span>
          </button>

          {waUrl && (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-[var(--nr-primary)] hover:bg-[var(--nr-primary-hover)] text-sm font-semibold text-[var(--nr-primary-fg)] nr-focus-ring nr-transition"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{ct.quoteForm.whatsappCta}</span>
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{ boxShadow: 'var(--nr-shadow-config)' }}
      className="rounded-[20px] border border-[var(--nr-border)] bg-[var(--nr-surface)] p-6 sm:p-7 space-y-5 nr-transition"
    >
      <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-[var(--nr-border)]">
        <div>
          <h2 className="font-display text-xl font-bold text-[var(--nr-text)]">
            {ct.quoteForm.title}
          </h2>
          <p className="mt-1 text-sm text-[var(--nr-text-secondary)]">
            {serverQuoteIntake
              ? (locale === 'es'
                ? 'Tu solicitud se guarda en el servidor. Los importes del configurador son de muestra y la oferta final queda por cotizar.'
                : 'Your request is saved on the server. Configurator amounts are examples and the final offer requires a quote.')
              : ct.quoteForm.subtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface)] hover:bg-[var(--nr-surface-muted)] text-xs font-semibold text-[var(--nr-text)] whitespace-nowrap nr-focus-ring nr-transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{ct.configurator.editConfigBtn}</span>
        </button>
      </div>

      {/* Attached Configuration Summary */}
      <div className="rounded-2xl border border-[var(--nr-border)] bg-[var(--nr-bg)] p-4 text-xs sm:text-[13px] space-y-2">
        <div className="font-semibold text-[var(--nr-text)]">
          {ct.quoteForm.attachedConfigTitle}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[var(--nr-text-secondary)]">
          <div>
            <span>{ct.configurator.step1Title}: </span>
            <strong className="text-[var(--nr-text)]">
              {selection.mode === 'POS_BUNDLE'
                ? ct.contractModes.bundleTitle
                : ct.contractModes.softwareTitle}
            </strong>
          </div>
          <div>
            <span>{ct.nav.plans}: </span>
            <strong className="text-[var(--nr-text)]">
              {locale === 'es' ? activePlan.nameEs : activePlan.nameEn}
            </strong>
          </div>
          {selection.mode === 'POS_BUNDLE' && activeHardware && (
            <div>
              <span>{ct.nav.posBundle}: </span>
              <strong className="text-[var(--nr-text)]">
                {selection.hardwareQuantity} ×{' '}
                {locale === 'es' ? activeHardware.nameEs : activeHardware.nameEn}
              </strong>
            </div>
          )}
          {selection.mode === 'POS_BUNDLE' && activePayment && (
            <div>
              <span>{ct.configurator.paymentMethodLabel}: </span>
              <strong className="text-[var(--nr-text)]">
                {locale === 'es' ? activePayment.labelEs : activePayment.labelEn}
              </strong>
            </div>
          )}
          {activeInstallation && (
            <div>
              <span>{ct.configurator.installationLabel}: </span>
              <span className="text-[var(--nr-text)]">
                {locale === 'es' ? activeInstallation.nameEs : activeInstallation.nameEn}
              </span>
            </div>
          )}
          {activeTraining && (
            <div>
              <span>{ct.configurator.trainingLabel}: </span>
              <span className="text-[var(--nr-text)]">
                {locale === 'es' ? activeTraining.nameEs : activeTraining.nameEn}
              </span>
            </div>
          )}
          {includesEInvoicing && (
            <div className="sm:col-span-2 pt-1 border-t border-[var(--nr-border)] flex flex-wrap items-center justify-between gap-2">
              <span>{ct.nav.electronicInvoicing}: </span>
              <span className="font-mono-num font-semibold text-[var(--nr-warning)]">
                {catalog.electronicInvoicing.confirmedMonthlyPriceCents !== null
                  ? formatDopCents(
                      catalog.electronicInvoicing.confirmedMonthlyPriceCents,
                      locale
                    )
                  : ct.configurator.summaryPendingAmount}
              </span>
            </div>
          )}
        </div>
      </div>

      {quoteError && (
        <div
          role="alert"
          className="rounded-xl border border-[var(--nr-error-border)] bg-[var(--nr-error-bg)] p-3.5 text-sm text-[var(--nr-error)] flex items-start gap-2.5"
        >
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{quoteError}</span>
        </div>
      )}

      {/* Tighter internal form rhythm (space-y-3.5 / gap-3.5) */}
      <form onSubmit={handleSubmit} noValidate className="space-y-3.5 text-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label
              htmlFor="quote-contact-name"
              className="block text-sm font-medium text-[var(--nr-text)] mb-1"
            >
              {ct.quoteForm.nameLabel}
            </label>
            <input
              id="quote-contact-name"
              type="text"
              required
              value={quoteDraft.contactName}
              onChange={(e) => {
                updateQuoteDraft({ contactName: e.target.value });
                if (fieldErrors.name) setFieldErrors((p) => ({ ...p, name: false }));
              }}
              placeholder={ct.quoteForm.namePlaceholder}
              className="w-full h-11 rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface)] px-3.5 text-sm text-[var(--nr-text)] placeholder:text-[var(--nr-text-secondary)]/70 nr-focus-ring nr-transition"
            />
            {fieldErrors.name && (
              <p className="mt-1 text-xs text-[var(--nr-error)]">
                {ct.quoteForm.errNameRequired}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="quote-business-name"
              className="block text-sm font-medium text-[var(--nr-text)] mb-1"
            >
              {ct.quoteForm.businessLabel}
            </label>
            <input
              id="quote-business-name"
              type="text"
              required
              value={quoteDraft.businessName}
              onChange={(e) => {
                updateQuoteDraft({ businessName: e.target.value });
                if (fieldErrors.business) {
                  setFieldErrors((p) => ({ ...p, business: false }));
                }
              }}
              placeholder={ct.quoteForm.businessPlaceholder}
              className="w-full h-11 rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface)] px-3.5 text-sm text-[var(--nr-text)] placeholder:text-[var(--nr-text-secondary)]/70 nr-focus-ring nr-transition"
            />
            {fieldErrors.business && (
              <p className="mt-1 text-xs text-[var(--nr-error)]">
                {ct.quoteForm.errBusinessRequired}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="sm:col-span-2">
            <label
              htmlFor="quote-contact-channel"
              className="block text-sm font-medium text-[var(--nr-text)] mb-1"
            >
              {ct.quoteForm.contactLabel}
            </label>
            <input
              id="quote-contact-channel"
              type="text"
              required
              value={quoteDraft.contactEmailOrWhatsapp}
              onChange={(e) => {
                updateQuoteDraft({ contactEmailOrWhatsapp: e.target.value });
                if (fieldErrors.contact) setFieldErrors((p) => ({ ...p, contact: false }));
              }}
              placeholder={ct.quoteForm.contactPlaceholder}
              className="w-full h-11 rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface)] px-3.5 text-sm text-[var(--nr-text)] placeholder:text-[var(--nr-text-secondary)]/70 nr-focus-ring nr-transition"
            />
            {fieldErrors.contact && (
              <p className="mt-1 text-xs text-[var(--nr-error)]">
                {ct.quoteForm.errContactRequired}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="quote-branches"
              className="block text-sm font-medium text-[var(--nr-text)] mb-1"
            >
              {ct.quoteForm.branchesLabel}
            </label>
            <input
              id="quote-branches"
              type="number"
              min="1"
              max="50"
              value={quoteDraft.branchCount}
              onChange={(e) => updateQuoteDraft({ branchCount: e.target.value })}
              className="w-full h-11 rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface)] px-3.5 text-sm font-mono-num text-[var(--nr-text)] nr-focus-ring nr-transition"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label
              htmlFor="quote-business-type"
              className="block text-sm font-medium text-[var(--nr-text)] mb-1"
            >
              {ct.quoteForm.businessTypeLabel}
            </label>
            <input
              id="quote-business-type"
              type="text"
              value={quoteDraft.businessType}
              onChange={(e) => updateQuoteDraft({ businessType: e.target.value })}
              placeholder={ct.quoteForm.businessTypePlaceholder}
              className="w-full h-11 rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface)] px-3.5 text-sm text-[var(--nr-text)] placeholder:text-[var(--nr-text-secondary)]/70 nr-focus-ring nr-transition"
            />
          </div>

          <div>
            <label
              htmlFor="quote-comments"
              className="block text-sm font-medium text-[var(--nr-text)] mb-1"
            >
              {ct.quoteForm.commentsLabel}
            </label>
            <input
              id="quote-comments"
              type="text"
              value={quoteDraft.comments}
              onChange={(e) => updateQuoteDraft({ comments: e.target.value })}
              placeholder={ct.quoteForm.commentsPlaceholder}
              className="w-full h-11 rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface)] px-3.5 text-sm text-[var(--nr-text)] placeholder:text-[var(--nr-text-secondary)]/70 nr-focus-ring nr-transition"
            />
          </div>
        </div>

        {/* Optional Electronic Invoicing questions when E_INVOICING is selected */}
        {includesEInvoicing && (
          <div className="rounded-2xl border border-[var(--nr-border)] bg-[var(--nr-bg)] p-4 space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-[var(--nr-text-secondary)]">
              {ct.quoteForm.eInvoicingQuestionsTitle}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label
                  htmlFor="quote-ei-already"
                  className="block text-sm font-medium text-[var(--nr-text)] mb-1"
                >
                  {ct.quoteForm.eInvoicingAlreadyLabel}
                </label>
                <select
                  id="quote-ei-already"
                  value={quoteDraft.alreadyIssuesElectronicReceipts ?? ''}
                  onChange={(e) =>
                    updateQuoteDraft({
                      alreadyIssuesElectronicReceipts: e.target
                        .value as ElectronicInvoicingExperience,
                    })
                  }
                  className="w-full h-11 rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface)] px-3 text-sm text-[var(--nr-text)] nr-focus-ring nr-transition"
                >
                  <option value="">{ct.quoteForm.eInvoicingAlreadyEmpty}</option>
                  <option value="YES">{ct.quoteForm.eInvoicingAlreadyYes}</option>
                  <option value="NO">{ct.quoteForm.eInvoicingAlreadyNo}</option>
                  <option value="UNSURE">{ct.quoteForm.eInvoicingAlreadyUnsure}</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="quote-ei-branches"
                  className="block text-sm font-medium text-[var(--nr-text)] mb-1"
                >
                  {ct.quoteForm.eInvoicingBranchesLabel}
                </label>
                <input
                  id="quote-ei-branches"
                  type="number"
                  min="1"
                  max="100"
                  value={quoteDraft.eInvoicingBranchesCount ?? ''}
                  onChange={(e) =>
                    updateQuoteDraft({ eInvoicingBranchesCount: e.target.value })
                  }
                  placeholder={ct.quoteForm.eInvoicingBranchesPlaceholder}
                  className="w-full h-11 rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface)] px-3.5 text-sm font-mono-num text-[var(--nr-text)] placeholder:text-[var(--nr-text-secondary)]/70 nr-focus-ring nr-transition"
                />
              </div>
            </div>
          </div>
        )}

        {!serverQuoteIntake && (
        <div className="rounded-xl border border-[var(--nr-warning-border)] bg-[var(--nr-warning-bg)] p-3 flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--nr-warning)]">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{ct.quoteForm.simFaultLabel}</span>
          </span>
          <select
            value={faultMode}
            onChange={(e) => setFaultMode(e.target.value as CommercialFaultMode)}
            className="h-9 rounded-xl border border-[var(--nr-warning-border)] bg-[var(--nr-surface)] px-3 text-xs text-[var(--nr-text)] nr-focus-ring"
          >
            <option value="NONE">{ct.quoteForm.simFaultNone}</option>
            <option value="SERVER_ERROR">{ct.quoteForm.simFaultError}</option>
          </select>
        </div>

        )}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSubmittingQuote}
            className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl bg-[var(--nr-primary)] hover:bg-[var(--nr-primary-hover)] disabled:opacity-60 text-sm font-semibold text-[var(--nr-primary-fg)] nr-focus-ring nr-transition"
          >
            {isSubmittingQuote ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{ct.quoteForm.submitting}</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>{ct.quoteForm.submitButton}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
