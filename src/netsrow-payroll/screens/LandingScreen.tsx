import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  Banknote,
  BookOpen,
  Boxes,
  Calculator,
  Check,
  ChevronDown,
  FileCheck2,
  FileText,
  FolderTree,
  Landmark,
  MonitorSmartphone,
  PackageCheck,
  ReceiptText,
  ShoppingBag,
  Store,
  Users,
  WalletCards,
} from 'lucide-react';
import { CommercialFooter } from '../components/CommercialFooter';
import { CommercialHeader } from '../components/CommercialHeader';
import { ScrollReveal } from '../components/ScrollReveal';
import { SoftwarePreviewFrame } from '../components/SoftwarePreviewFrame';
import { useCommercial } from '../context/CommercialContext';
import { COMMERCIAL_IMAGE_ASSETS } from '../data/marketingAssets';
import { formatDopCents } from '../services/commercialPricing';
import { CommercialModuleCode } from '../types/commercial';

const MODULE_ICONS: Record<
  CommercialModuleCode,
  React.ComponentType<{ className?: string }>
> = {
  POS: Store,
  SALES: ReceiptText,
  CASHBOX: Banknote,
  CUSTOMERS: Users,
  CATALOG: FolderTree,
  INVENTORY: Boxes,
  PAYROLL: WalletCards,
  ACCOUNTING: BookOpen,
  PURCHASES_AP: ShoppingBag,
  ACCOUNTS_RECEIVABLE: Calculator,
  TREASURY: Landmark,
  E_INVOICING: FileCheck2,
};

export const LandingScreen: React.FC = () => {
  const {
    catalog,
    locale,
    theme,
    ct,
    navigateTo,
    openConfiguratorWithPreset,
    quoteDraft,
    updateQuoteDraft,
  } = useCommercial();

  const [openFaqId, setOpenFaqId] = useState<string>(catalog.faqs[0]?.id ?? '');
  const [bundleImgError, setBundleImgError] = useState(false);
  const [trainingImgError, setTrainingImgError] = useState(false);
  const [heroContact, setHeroContact] = useState<string>(quoteDraft.contactEmailOrWhatsapp);
  const [heroContactError, setHeroContactError] = useState(false);
  const [arrivedSectionId, setArrivedSectionId] = useState<string>('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let timerId: number | undefined;

    const handleSectionArrive = (event: Event) => {
      const custom = event as CustomEvent<{ id?: string }>;
      const targetId = custom.detail?.id;
      if (!targetId) return;
      setArrivedSectionId(targetId);
      if (timerId) window.clearTimeout(timerId);
      timerId = window.setTimeout(() => {
        setArrivedSectionId('');
      }, 900);
    };

    window.addEventListener('netsrow:section-arrive', handleSectionArrive);
    return () => {
      if (timerId) window.clearTimeout(timerId);
      window.removeEventListener('netsrow:section-arrive', handleSectionArrive);
    };
  }, []);

  const handleHeroStart = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = heroContact.trim();
    if (!trimmed) {
      setHeroContactError(false);
      navigateTo('/planes');
      return;
    }
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
    const digitsOnly = trimmed.replace(/\D/g, '');
    const isValidPhone = digitsOnly.length >= 7;
    if (!isValidEmail && !isValidPhone) {
      setHeroContactError(true);
      return;
    }
    setHeroContactError(false);
    updateQuoteDraft({ contactEmailOrWhatsapp: trimmed });
    navigateTo('/planes');
  };

  const baseModules = catalog.modules.filter((m) => m.category === 'CORE');
  const addonAndRoadmapModules = catalog.modules.filter((m) => m.category !== 'CORE');
  const mainBundleHardware = catalog.hardwareOptions[0];
  const basePlan = catalog.plans[0];
  const mainInstallment = mainBundleHardware.paymentOptions[0];

  const posBundleAsset = COMMERCIAL_IMAGE_ASSETS.posBundleCounter;
  const trainingAsset = COMMERCIAL_IMAGE_ASSETS.retailTrainingSetup;

  return (
    <div
      className={`netsrow-commercial-shell min-h-screen flex flex-col ${
        theme === 'dark' ? 'dark' : ''
      }`}
    >
      <CommercialHeader />

      <main className="flex-1">
        {/* 1. HERO SECTION: Centered Editorial Hierarchy + Layered Midnight Navy & Emerald Gradients + Laptop Product Showcase */}
        <section
          style={{
            background:
              'linear-gradient(180deg, #060F1C 0%, #09182B 46%, #0E233A 82%, #071220 100%)',
          }}
          className="relative overflow-hidden border-b border-slate-800/80 text-white"
        >
          {/* Upper zenith radial emerald aura for typographic focus */}
          <div
            aria-hidden="true"
            style={{
              background:
                'radial-gradient(60% 42% at 50% 6%, rgba(16, 185, 129, 0.14) 0%, rgba(16, 185, 129, 0) 100%)',
            }}
            className="pointer-events-none absolute inset-0"
          />

          {/* Subtle architectural top hairline sheen */}
          <div
            aria-hidden="true"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)',
              backgroundSize: '64px 64px',
              maskImage:
                'radial-gradient(ellipse 70% 50% at 50% 15%, #000 10%, transparent 80%)',
              WebkitMaskImage:
                'radial-gradient(ellipse 70% 50% at 50% 15%, #000 10%, transparent 80%)',
            }}
            className="pointer-events-none absolute inset-0"
          />

          {/* Grounded lower stage plane underneath the laptop */}
          <div
            aria-hidden="true"
            style={{
              background:
                'linear-gradient(180deg, rgba(6, 15, 28, 0) 0%, rgba(5, 13, 24, 0.72) 55%, #050C17 100%)',
            }}
            className="pointer-events-none absolute inset-x-0 bottom-0 h-44 sm:h-52 border-t border-white/[0.04]"
          />

          <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 lg:pt-16 pb-12 sm:pb-14">
            {/* Centered Editorial Copy + Inline CTA Bar */}
            <div className="max-w-[820px] mx-auto text-center space-y-5">
              <p className="text-xs sm:text-[13px] font-medium text-emerald-300/90 tracking-[0.015em]">
                {ct.hero.regionNote}
              </p>

              <h1 className="font-display text-[34px] sm:text-[46px] lg:text-[56px] font-bold tracking-[-0.028em] leading-[1.07] [text-wrap:balance] bg-gradient-to-b from-white via-white to-slate-300 bg-clip-text text-transparent">
                {ct.hero.headline}
              </h1>

              <p className="max-w-[700px] mx-auto text-[15px] sm:text-[17px] lg:text-[18px] text-slate-300/95 leading-[1.6] font-normal tracking-[-0.005em] [text-wrap:balance]">
                {ct.hero.subtitle}
              </p>

              {/* Inline Action Dock + Secondary CTA */}
              <div className="pt-2 space-y-3">
                <form
                  onSubmit={handleHeroStart}
                  noValidate
                  className="max-w-[660px] mx-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3"
                >
                  <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center rounded-2xl sm:rounded-full border border-white/15 bg-white/[0.06] backdrop-blur-md p-1.5 shadow-[0_10px_32px_rgba(2,8,18,0.45)] focus-within:border-emerald-400/70 focus-within:bg-white/[0.09] nr-transition">
                    <input
                      type="text"
                      value={heroContact}
                      onChange={(e) => {
                        setHeroContact(e.target.value);
                        if (heroContactError) setHeroContactError(false);
                      }}
                      placeholder={ct.hero.emailPlaceholder}
                      aria-label={ct.hero.emailPlaceholder}
                      aria-invalid={heroContactError}
                      aria-describedby={heroContactError ? 'hero-contact-hint' : undefined}
                      className="flex-1 min-w-0 bg-transparent px-4 py-2.5 sm:py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none"
                    />
                    <button
                      type="submit"
                      style={{
                        background:
                          'linear-gradient(180deg, #10B981 0%, #047857 100%)',
                      }}
                      className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl sm:rounded-full text-sm font-semibold text-white hover:brightness-110 active:scale-[0.985] whitespace-nowrap shrink-0 shadow-[0_2px_14px_rgba(16,185,129,0.32)] nr-focus-ring nr-transition"
                    >
                      <span>{ct.hero.primaryCta}</span>
                      <ArrowRight className="w-4 h-4 shrink-0" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigateTo('/#paquete-completo')}
                    className="inline-flex items-center justify-center h-[54px] sm:h-[58px] px-5 rounded-2xl sm:rounded-full border border-white/15 bg-white/[0.05] hover:bg-white/[0.11] active:scale-[0.985] text-sm font-semibold text-slate-100 whitespace-nowrap shrink-0 nr-focus-ring nr-transition"
                  >
                    {ct.hero.secondaryCta}
                  </button>
                </form>

                {heroContactError && (
                  <p
                    id="hero-contact-hint"
                    role="alert"
                    className="text-xs font-medium text-amber-300"
                  >
                    {ct.hero.emailValidationHint}
                  </p>
                )}

                {/* 3 Concise Trust Checkmarks */}
                <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-1 text-xs sm:text-[13px] text-slate-300">
                  {ct.hero.trustPoints.map((ptText) => (
                    <li key={ptText} className="inline-flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{ptText}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Centered Framed ERP Product Stage with Proper Laptop Lid, Bottom Chin, Hinge & Aluminum Deck */}
            <div className="relative mt-10 sm:mt-12 max-w-[1060px] mx-auto">
              <div
                aria-hidden="true"
                style={{
                  background:
                    'radial-gradient(62% 55% at 50% 46%, rgba(16, 185, 129, 0.22) 0%, rgba(13, 148, 136, 0.08) 46%, rgba(8, 19, 33, 0) 76%)',
                }}
                className="pointer-events-none absolute -inset-x-6 -top-8 -bottom-4"
              />

              {/* Laptop Display Lid (narrower than deck, distinct bottom bezel chin) */}
              <div className="relative mx-3 sm:mx-8 lg:mx-10 rounded-t-[20px] sm:rounded-t-[26px] border border-white/15 bg-gradient-to-b from-[#1A2A3F] via-[#0B1422] to-[#070E18] px-2.5 pt-2.5 pb-3.5 sm:px-3.5 sm:pt-3 sm:pb-5 shadow-[0_30px_76px_-14px_rgba(0,0,0,0.8)]">
                {/* Top camera lens hardware detail */}
                <div
                  aria-hidden="true"
                  className="mx-auto mb-2 sm:mb-2.5 w-1.5 h-1.5 rounded-full bg-slate-600/80 ring-1 ring-white/10"
                />

                {/* Crisp Screen Viewport rounded on all 4 corners */}
                <div className="rounded-[10px] sm:rounded-[14px] overflow-hidden border border-white/15 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]">
                  <SoftwarePreviewFrame />
                </div>

                {/* Distinct Bottom Glass Bezel Chin separating screen from base */}
                <div
                  aria-hidden="true"
                  className="mt-2 sm:mt-2.5 flex items-center justify-center"
                >
                  <span className="font-display text-[9px] sm:text-[10px] font-semibold tracking-[0.22em] uppercase text-slate-500/80">
                    NetsRow
                  </span>
                </div>
              </div>

              {/* Recessed Dark Hinge Gap between Screen Lid and Base Deck */}
              <div
                aria-hidden="true"
                className="relative mx-8 sm:mx-16 h-1.5 rounded-t-sm bg-[#03070D] border-x border-t border-white/10"
              />

              {/* Sculpted Metallic Unibody Base Deck */}
              <div
                aria-hidden="true"
                className="relative h-3.5 sm:h-4 w-full rounded-b-[18px] bg-gradient-to-b from-[#4B5B72] via-[#243247] to-[#0B1320] border-t border-white/30 shadow-[0_22px_44px_rgba(0,0,0,0.75)] flex items-start justify-center"
              >
                <div className="w-16 sm:w-28 h-1.5 rounded-b-md bg-[#0A121F] border-x border-b border-white/10" />
              </div>

              {/* Grounded Bottom Callout Strip */}
              <div className="mt-7 flex justify-center">
                <div className="inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-xl border border-white/10 bg-[#081321]/90 backdrop-blur-sm px-4 py-2.5 text-xs sm:text-sm text-slate-300 text-center shadow-lg">
                  <strong className="font-semibold text-white">
                    {ct.hero.bottomTrustLead}
                  </strong>
                  <span>{ct.hero.bottomTrustDetail}</span>
                  <button
                    type="button"
                    onClick={() => navigateTo('/#facturacion-electronica')}
                    className="inline-flex items-center gap-1 font-semibold text-emerald-300 hover:text-emerald-200 hover:underline rounded nr-focus-ring nr-transition"
                  >
                    <span>{ct.hero.bottomTrustLink}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. LO QUE OFRECEMOS: Solo software, Paquete completo, Facturación electrónica */}
        <section
          id="formas-contratar"
          className="relative scroll-mt-20 py-14 sm:py-16 lg:py-24 border-b border-[var(--nr-border)] bg-[var(--nr-bg)]"
        >
          <div
            className={`max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10 ${
              arrivedSectionId === 'formas-contratar' ? 'nr-arrival-active' : ''
            }`}
          >
            <ScrollReveal>
              <div className="max-w-2xl space-y-3">
                <h2 className="font-display text-[26px] sm:text-[34px] lg:text-[38px] font-bold tracking-tight text-[var(--nr-text)] leading-[1.14] [text-wrap:balance]">
                  {ct.contractModes.sectionTitle}
                </h2>
                <p className="text-base sm:text-lg text-[var(--nr-text-secondary)] leading-relaxed">
                  {ct.contractModes.sectionSubtitle}
                </p>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
              {/* Card A: Software Only */}
              <ScrollReveal delayMs={0} className="flex">
                <article className="w-full rounded-[20px] border border-[var(--nr-border)] bg-[var(--nr-surface)] hover:border-[var(--nr-primary)]/45 hover:shadow-md p-6 sm:p-7 flex flex-col justify-between gap-6 nr-interactive-card">
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="w-11 h-11 rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface-muted)] text-[var(--nr-text)] flex items-center justify-center shrink-0">
                      <MonitorSmartphone className="w-5 h-5" />
                    </div>
                    <span className="rounded-full border border-[var(--nr-border)] bg-[var(--nr-surface-muted)] px-3 py-1 text-[11px] font-medium text-[var(--nr-text-secondary)] text-right">
                      {ct.contractModes.softwareBadge}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-display text-xl font-bold text-[var(--nr-text)]">
                      {ct.contractModes.softwareTitle}
                    </h3>
                    <p className="text-sm text-[var(--nr-text-secondary)] leading-relaxed">
                      {ct.contractModes.softwareDesc}
                    </p>
                  </div>

                  {/* Base monthly rate callout */}
                  <div className="rounded-xl border border-[var(--nr-border)] bg-[var(--nr-bg)] px-4 py-3 flex flex-wrap items-baseline justify-between gap-2">
                    <div>
                      <span className="text-xs text-[var(--nr-text-secondary)] block">
                        {locale === 'es' ? basePlan.nameEs : basePlan.nameEn}
                      </span>
                      <span className="font-mono-num text-lg sm:text-xl font-bold text-[var(--nr-text)] whitespace-nowrap">
                        {formatDopCents(basePlan.monthlyPriceCents, locale)}
                        {ct.modulesSection.perMonth}
                      </span>
                    </div>
                    <span className="rounded-full border border-[var(--nr-warning-border)] bg-[var(--nr-warning-bg)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--nr-warning)]">
                      {locale === 'es'
                        ? catalog.conditions.illustrativeLabelEs
                        : catalog.conditions.illustrativeLabelEn}
                    </span>
                  </div>

                  <ul className="space-y-2.5 text-sm text-[var(--nr-text)] pt-1">
                    {ct.contractModes.softwarePoints.map((ptText) => (
                      <li key={ptText} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-[var(--nr-primary)] shrink-0 mt-1" />
                        <span>{ptText}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => openConfiguratorWithPreset('SOFTWARE_ONLY')}
                  className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface-muted)] hover:border-[var(--nr-primary)] active:scale-[0.985] text-sm font-semibold text-[var(--nr-text)] nr-focus-ring nr-transition"
                >
                  <span>{ct.contractModes.softwareCta}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                </article>
              </ScrollReveal>

              {/* Card B: Complete POS Bundle */}
              <ScrollReveal delayMs={70} className="flex">
                <article className="w-full rounded-[20px] border border-[var(--nr-primary)]/45 bg-[var(--nr-surface)] hover:border-[var(--nr-primary)] hover:shadow-md p-6 sm:p-7 flex flex-col justify-between gap-6 nr-interactive-card">
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="w-11 h-11 rounded-xl border border-[var(--nr-success-border)] bg-[var(--nr-success-bg)] text-[var(--nr-success)] flex items-center justify-center shrink-0">
                      <PackageCheck className="w-5 h-5" />
                    </div>
                    <span className="rounded-full border border-[var(--nr-success-border)] bg-[var(--nr-success-bg)] px-3 py-1 text-[11px] font-semibold text-[var(--nr-success)] text-right">
                      {ct.contractModes.bundleBadge}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-display text-xl font-bold text-[var(--nr-text)]">
                      {ct.contractModes.bundleTitle}
                    </h3>
                    <p className="text-sm text-[var(--nr-text-secondary)] leading-relaxed">
                      {ct.contractModes.bundleDesc}
                    </p>
                  </div>

                  {/* Hardware bundle snapshot with illustrative image */}
                  <div className="rounded-xl border border-[var(--nr-border)] bg-[var(--nr-bg)] p-3 flex items-center gap-3">
                    <div className="w-16 h-12 rounded-lg overflow-hidden border border-[var(--nr-border)] bg-[var(--nr-surface-muted)] shrink-0">
                      {!bundleImgError ? (
                        <img
                          src={posBundleAsset.src}
                          width={posBundleAsset.width}
                          height={posBundleAsset.height}
                          alt={locale === 'es' ? posBundleAsset.altEs : posBundleAsset.altEn}
                          referrerPolicy="no-referrer"
                          onError={() => setBundleImgError(true)}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[var(--nr-primary)]">
                          <PackageCheck className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs text-[var(--nr-text-secondary)] truncate">
                        {locale === 'es' ? mainBundleHardware.nameEs : mainBundleHardware.nameEn}
                      </div>
                      <div className="font-mono-num text-sm font-bold text-[var(--nr-primary)] whitespace-nowrap">
                        {mainInstallment.monthlyInstallmentCents !== null
                          ? `${mainInstallment.installmentsCount} × ${formatDopCents(
                              mainInstallment.monthlyInstallmentCents,
                              locale
                            )}${ct.modulesSection.perMonth}`
                          : ct.configurator.summaryPendingAmount}
                      </div>
                    </div>
                  </div>

                  <ul className="space-y-2.5 text-sm text-[var(--nr-text)] pt-1">
                    {ct.contractModes.bundlePoints.map((ptText) => (
                      <li key={ptText} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-[var(--nr-primary)] shrink-0 mt-1" />
                        <span>{ptText}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => openConfiguratorWithPreset('POS_BUNDLE')}
                  className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-[var(--nr-primary)] hover:bg-[var(--nr-primary-hover)] active:scale-[0.985] text-sm font-semibold text-[var(--nr-primary-fg)] nr-focus-ring nr-transition"
                >
                  <span>{ct.contractModes.bundleCta}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                </article>
              </ScrollReveal>

              {/* Card C: Electronic Invoicing Offer Card */}
              <ScrollReveal delayMs={140} className="flex">
                <article
                  data-testid="offer-card-electronic-invoicing"
                  className="w-full rounded-[20px] border border-[var(--nr-primary)]/40 bg-[var(--nr-surface)] hover:border-[var(--nr-primary)] hover:shadow-md p-6 sm:p-7 flex flex-col justify-between gap-6 nr-interactive-card"
                >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="w-11 h-11 rounded-xl border border-[var(--nr-success-border)] bg-[var(--nr-success-bg)] text-[var(--nr-success)] flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <span className="rounded-full border border-[var(--nr-success-border)] bg-[var(--nr-success-bg)] px-3 py-1 text-[11px] font-semibold text-[var(--nr-success)] text-right">
                      {catalog.electronicInvoicing.confirmedMonthlyPriceCents !== null
                        ? `${formatDopCents(
                            catalog.electronicInvoicing.confirmedMonthlyPriceCents,
                            locale
                          )}${ct.modulesSection.perMonth}`
                        : ct.contractModes.eInvoicingBadge}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-display text-xl font-bold text-[var(--nr-text)]">
                      {ct.contractModes.eInvoicingTitle}
                    </h3>
                    <p className="text-sm text-[var(--nr-text-secondary)] leading-relaxed">
                      {ct.contractModes.eInvoicingDesc}
                    </p>
                  </div>

                  <div className="rounded-xl border border-[var(--nr-border)] bg-[var(--nr-bg)] px-4 py-3 flex flex-wrap items-baseline justify-between gap-2">
                    <div>
                      <span className="text-xs text-[var(--nr-text-secondary)] block">
                        {ct.nav.electronicInvoicing}
                      </span>
                      <span className="font-mono-num text-base sm:text-lg font-bold text-[var(--nr-text)] whitespace-nowrap">
                        {catalog.electronicInvoicing.confirmedMonthlyPriceCents !== null
                          ? `${formatDopCents(
                              catalog.electronicInvoicing.confirmedMonthlyPriceCents,
                              locale
                            )}${ct.modulesSection.perMonth}`
                          : ct.configurator.summaryPendingAmount}
                      </span>
                    </div>
                    <span className="text-[11px] font-medium text-[var(--nr-text-secondary)]">
                      {locale === 'es' ? 'Solo software / Paquete' : 'Software / Bundle'}
                    </span>
                  </div>

                  <ul className="space-y-2.5 text-sm text-[var(--nr-text)] pt-1">
                    {ct.contractModes.eInvoicingPoints.map((ptText) => (
                      <li key={ptText} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-[var(--nr-primary)] shrink-0 mt-1" />
                        <span>{ptText}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={() => openConfiguratorWithPreset('KEEP', 'E_INVOICING')}
                    className="w-full inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-[var(--nr-primary)] hover:bg-[var(--nr-primary-hover)] text-sm font-semibold text-[var(--nr-primary-fg)] nr-focus-ring nr-transition"
                  >
                    <span>{ct.contractModes.eInvoicingCta}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <a
                    href="#facturacion-electronica"
                    onClick={(e) => {
                      e.preventDefault();
                      navigateTo('/#facturacion-electronica');
                    }}
                    className="block w-full text-center py-1.5 text-xs sm:text-sm font-semibold text-[var(--nr-primary)] hover:underline rounded-lg nr-focus-ring nr-transition"
                  >
                    {ct.contractModes.eInvoicingSecondaryLink}
                  </a>
                </div>
                </article>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* 3. FEATURED ELECTRONIC INVOICING SECTION: Plain-language DGII Guide No. 6 explanation & Ejemplo ilustrativo flow */}
        <section
          id="facturacion-electronica"
          className="relative scroll-mt-20 py-14 sm:py-16 lg:py-24 border-b border-[var(--nr-border)] bg-[var(--nr-surface)]"
        >
          <div
            className={`max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start ${
              arrivedSectionId === 'facturacion-electronica' ? 'nr-arrival-active' : ''
            }`}
          >
            {/* Left Plain-Language Guide & CTA */}
            <ScrollReveal direction="left" className="lg:col-span-6 space-y-6">
              <div className="space-y-3">
                <h2 className="font-display text-[26px] sm:text-[34px] lg:text-[38px] font-bold tracking-tight text-[var(--nr-text)] leading-[1.14] [text-wrap:balance]">
                  {ct.eInvoicingSection.title}
                </h2>
                <p className="text-base sm:text-lg text-[var(--nr-text-secondary)] leading-relaxed">
                  {ct.eInvoicingSection.subtitle}
                </p>
              </div>

              {/* 1) What is an e-CF vs internal slip */}
              <div className="rounded-2xl border border-[var(--nr-border)] bg-[var(--nr-bg)] p-4 sm:p-5 space-y-2">
                <h3 className="font-display text-sm sm:text-base font-bold text-[var(--nr-text)]">
                  {ct.eInvoicingSection.whatIsTitle}
                </h3>
                <p className="text-xs sm:text-sm text-[var(--nr-text-secondary)] leading-relaxed">
                  {ct.eInvoicingSection.whatIsText}
                </p>
              </div>

              {/* 2) General workflow */}
              <div className="space-y-3">
                <h3 className="font-display text-sm sm:text-base font-bold text-[var(--nr-text)]">
                  {ct.eInvoicingSection.flowTitle}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {ct.eInvoicingSection.flowSteps.map((step) => (
                    <div
                      key={step.title}
                      className="rounded-xl border border-[var(--nr-border)] bg-[var(--nr-bg)] p-3.5 space-y-1.5"
                    >
                      <div className="text-xs font-bold text-[var(--nr-primary)]">
                        {step.title}
                      </div>
                      <p className="text-xs text-[var(--nr-text-secondary)] leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3) What to consult with NetsRow */}
              <div className="space-y-2.5">
                <h3 className="font-display text-sm sm:text-base font-bold text-[var(--nr-text)]">
                  {ct.eInvoicingSection.consultTitle}
                </h3>
                <ul className="space-y-2 text-xs sm:text-sm text-[var(--nr-text)]">
                  {ct.eInvoicingSection.consultPoints.map((pt) => (
                    <li key={pt} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-[var(--nr-primary)] shrink-0 mt-0.5" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-[var(--nr-text-secondary)] leading-relaxed pt-1">
                  {ct.eInvoicingSection.verifiedNote}
                </p>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => openConfiguratorWithPreset('KEEP', 'E_INVOICING')}
                  className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-[var(--nr-primary)] hover:bg-[var(--nr-primary-hover)] active:scale-[0.985] text-sm sm:text-base font-semibold text-[var(--nr-primary-fg)] nr-focus-ring nr-transition"
                >
                  <span>{ct.eInvoicingSection.cta}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </ScrollReveal>

            {/* Right Compact Visual Flow Illustration (Ejemplo ilustrativo) */}
            <ScrollReveal direction="right" delayMs={80} className="lg:col-span-6">
              <div
                style={{ boxShadow: 'var(--nr-shadow-config)' }}
                className="rounded-[20px] border border-[var(--nr-border)] bg-[var(--nr-bg)] p-5 sm:p-6 space-y-4 nr-interactive-card"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[var(--nr-border)]">
                  <span className="inline-flex items-center gap-2 font-display text-sm font-bold text-[var(--nr-text)]">
                    <FileCheck2 className="w-4 h-4 text-[var(--nr-primary)]" />
                    <span>{ct.nav.electronicInvoicing}</span>
                  </span>
                  <span className="rounded-full border border-[var(--nr-warning-border)] bg-[var(--nr-warning-bg)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--nr-warning)]">
                    {ct.eInvoicingSection.previewBadge}
                  </span>
                </div>

                {/* Compact Flow: Sale -> Signing & Validation -> Customer Receipt */}
                <div className="space-y-3">
                  <div className="rounded-2xl border border-[var(--nr-border)] bg-[var(--nr-surface)] p-4 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="text-[11px] font-semibold text-[var(--nr-primary)]">
                        {ct.eInvoicingSection.flowStep1Label}
                      </div>
                      <div className="font-display text-sm font-bold text-[var(--nr-text)]">
                        {ct.eInvoicingSection.flowStep1Value}
                      </div>
                    </div>
                    <span className="font-mono-num text-sm font-bold text-[var(--nr-text)] whitespace-nowrap">
                      RD$1,281.80
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                    {(locale === 'es'
                      ? catalog.electronicInvoicing.submissionStatesEs
                      : catalog.electronicInvoicing.submissionStatesEn
                    ).map((st, idx) => (
                      <div
                        key={st}
                        className="rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface)] px-3 py-2.5 flex items-start gap-2"
                      >
                        <Check className="w-3.5 h-3.5 text-[var(--nr-primary)] shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[11px] font-semibold text-[var(--nr-text-secondary)] block">
                            0{idx + 1}
                          </span>
                          <span className="font-medium text-[var(--nr-text)]">{st}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Mock receipt compact card explicitly marked Ejemplo ilustrativo (no QR, no unverified DGII seal) */}
                  <div className="rounded-2xl border border-dashed border-[var(--nr-border)] bg-[var(--nr-surface)] p-4 space-y-2.5 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-display font-bold text-[var(--nr-text)]">
                        {ct.eInvoicingSection.flowStep2Value}
                      </span>
                      <span className="text-[11px] font-semibold text-[var(--nr-warning)]">
                        {ct.eInvoicingSection.previewBadge}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[var(--nr-text-secondary)]">
                      <div>
                        <strong className="text-[var(--nr-text)]">
                          {ct.eInvoicingSection.docTypesLabel}:{' '}
                        </strong>
                        {(locale === 'es'
                          ? catalog.electronicInvoicing.documentTypesEs
                          : catalog.electronicInvoicing.documentTypesEn
                        ).join(' · ')}
                      </div>
                      <div>
                        <strong className="text-[var(--nr-text)]">
                          {ct.eInvoicingSection.providerLabel}:{' '}
                        </strong>
                        {locale === 'es'
                          ? catalog.electronicInvoicing.providerLabelEs
                          : catalog.electronicInvoicing.providerLabelEn}
                      </div>
                    </div>
                    <div className="pt-2 border-t border-[var(--nr-border)] flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[var(--nr-text-secondary)]">
                        {locale === 'es'
                          ? catalog.electronicInvoicing.timelineEs
                          : catalog.electronicInvoicing.timelineEn}
                      </span>
                      <span className="font-mono-num font-bold text-[var(--nr-warning)]">
                        {catalog.electronicInvoicing.confirmedMonthlyPriceCents !== null
                          ? formatDopCents(
                              catalog.electronicInvoicing.confirmedMonthlyPriceCents,
                              locale
                            )
                          : ct.configurator.summaryPendingAmount}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* 4. MODULES GRID: 3 columns desktop, 1 column mobile, alternating bg */}
        <section
          id="funcionalidades"
          className="relative scroll-mt-20 py-14 sm:py-16 lg:py-24 border-b border-[var(--nr-border)] bg-[var(--nr-bg)]"
        >
          <div
            className={`max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12 ${
              arrivedSectionId === 'funcionalidades' ? 'nr-arrival-active' : ''
            }`}
          >
            <ScrollReveal>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="max-w-2xl space-y-3">
                  <h2 className="font-display text-[26px] sm:text-[34px] lg:text-[38px] font-bold tracking-tight text-[var(--nr-text)] leading-[1.14] [text-wrap:balance]">
                    {ct.modulesSection.title}
                  </h2>
                  <p className="text-base sm:text-lg text-[var(--nr-text-secondary)] leading-relaxed">
                    {ct.modulesSection.subtitle}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => navigateTo('/planes')}
                  className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-[var(--nr-primary)] hover:bg-[var(--nr-primary-hover)] active:scale-[0.985] text-sm font-semibold text-[var(--nr-primary-fg)] whitespace-nowrap shrink-0 nr-focus-ring nr-transition"
                >
                  <span>{ct.modulesSection.configureCta}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </ScrollReveal>

            {/* Included Base Plan Modules */}
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[var(--nr-border)]">
                <h3 className="font-display text-lg font-bold text-[var(--nr-text)]">
                  {ct.modulesSection.basePlanGroupTitle}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="font-mono-num text-sm font-bold text-[var(--nr-primary)] whitespace-nowrap">
                    {formatDopCents(basePlan.monthlyPriceCents, locale)}
                    {ct.modulesSection.perMonth}
                  </span>
                  <span className="rounded-full border border-[var(--nr-warning-border)] bg-[var(--nr-warning-bg)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--nr-warning)]">
                    {locale === 'es'
                      ? catalog.conditions.illustrativeLabelEs
                      : catalog.conditions.illustrativeLabelEn}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {baseModules.map((mod, idx) => {
                  const IconComponent = MODULE_ICONS[mod.code];
                  return (
                    <ScrollReveal key={mod.code} delayMs={(idx % 3) * 60} className="flex">
                      <div className="w-full rounded-2xl border border-[var(--nr-border)] bg-[var(--nr-bg)] hover:border-[var(--nr-primary)]/40 hover:bg-[var(--nr-surface)] p-6 flex flex-col justify-between gap-4 nr-interactive-card">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <div className="w-9 h-9 rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface)] text-[var(--nr-primary)] flex items-center justify-center">
                              <IconComponent className="w-4 h-4" />
                            </div>
                            <span className="inline-flex items-center gap-1 rounded-full border border-[var(--nr-success-border)] bg-[var(--nr-success-bg)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--nr-success)]">
                              <Check className="w-3 h-3" />
                              <span>{ct.modulesSection.statusIncluded}</span>
                            </span>
                          </div>

                          <div className="space-y-1.5">
                            <h4 className="font-display text-base font-bold text-[var(--nr-text)]">
                              {locale === 'es' ? mod.nameEs : mod.nameEn}
                            </h4>
                            <p className="text-sm text-[var(--nr-text-secondary)] leading-relaxed">
                              {locale === 'es' ? mod.benefitEs : mod.benefitEn}
                            </p>
                          </div>
                        </div>
                      </div>
                    </ScrollReveal>
                  );
                })}
              </div>
            </div>

            {/* Optional Add-ons & In Development */}
            <div className="space-y-5">
              <div className="pb-3 border-b border-[var(--nr-border)]">
                <h3 className="font-display text-lg font-bold text-[var(--nr-text)]">
                  {ct.modulesSection.addonsGroupTitle}
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {addonAndRoadmapModules.map((mod, idx) => {
                  const IconComponent = MODULE_ICONS[mod.code];
                  const isDev = mod.status === 'IN_DEVELOPMENT';
                  const priceLabel = isDev
                    ? ct.modulesSection.statusInDev
                    : mod.priceStatus === 'QUOTE_REQUIRED' || mod.monthlyPriceCents === null
                      ? ct.configurator.summaryPendingAmount
                      : `+${formatDopCents(mod.monthlyPriceCents, locale)}${ct.modulesSection.perMonth}`;

                  return (
                    <ScrollReveal key={mod.code} delayMs={(idx % 3) * 60} className="flex">
                      <div className="w-full rounded-2xl border border-[var(--nr-border)] bg-[var(--nr-surface)] hover:border-[var(--nr-primary)]/45 hover:shadow-sm p-6 flex flex-col justify-between gap-5 nr-interactive-card">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="w-9 h-9 rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface-muted)] text-[var(--nr-text)] flex items-center justify-center shrink-0">
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <span className="font-mono-num text-sm font-bold text-[var(--nr-text)] whitespace-nowrap">
                            {priceLabel}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${
                              isDev
                                ? 'border-[var(--nr-warning-border)] bg-[var(--nr-warning-bg)] text-[var(--nr-warning)]'
                                : 'border-[var(--nr-success-border)] bg-[var(--nr-success-bg)] text-[var(--nr-success)]'
                            }`}
                          >
                            {isDev ? ct.modulesSection.statusInDev : ct.modulesSection.statusAddon}
                          </span>
                          {mod.isPrototypeDemoOnly && (
                            <span className="text-[11px] font-medium text-[var(--nr-text-secondary)]">
                              {ct.modulesSection.demoOnlyTag}
                            </span>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <h4 className="font-display text-base font-bold text-[var(--nr-text)]">
                            {locale === 'es' ? mod.nameEs : mod.nameEn}
                          </h4>
                          <p className="text-sm text-[var(--nr-text-secondary)] leading-relaxed">
                            {locale === 'es' ? mod.benefitEs : mod.benefitEn}
                          </p>
                        </div>
                      </div>

                      {!isDev && (
                        <button
                          type="button"
                          onClick={() => openConfiguratorWithPreset('SOFTWARE_ONLY', mod.code)}
                          className="self-start inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--nr-primary)] hover:underline nr-focus-ring rounded-lg"
                        >
                          <span>{ct.hero.primaryCta}</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )}
                      </div>
                    </ScrollReveal>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* 5. COMPLETE POS PACKAGE & TRAINING VISUALS */}
        <section
          id="paquete-completo"
          className="relative scroll-mt-20 py-14 sm:py-16 lg:py-24 border-b border-[var(--nr-border)] bg-[var(--nr-surface)]"
        >
          <div
            className={`max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-16 ${
              arrivedSectionId === 'paquete-completo' ? 'nr-arrival-active' : ''
            }`}
          >
            {/* Commercial Counter Hardware + Software Showcase */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              <ScrollReveal direction="left" className="lg:col-span-6 space-y-3">
                <div className="group aspect-video w-full rounded-[20px] overflow-hidden border border-[var(--nr-border)] bg-[var(--nr-surface-muted)]">
                  {!bundleImgError ? (
                    <img
                      src={posBundleAsset.src}
                      width={posBundleAsset.width}
                      height={posBundleAsset.height}
                      alt={locale === 'es' ? posBundleAsset.altEs : posBundleAsset.altEn}
                      referrerPolicy="no-referrer"
                      onError={() => setBundleImgError(true)}
                      className="w-full h-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-xs text-[var(--nr-text-secondary)]">
                      <PackageCheck className="w-8 h-8 text-[var(--nr-primary)] mb-2" />
                      <span>
                        {locale === 'es' ? posBundleAsset.altEs : posBundleAsset.altEn}
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-[var(--nr-text-secondary)] leading-relaxed">
                  {locale === 'es' ? posBundleAsset.captionEs : posBundleAsset.captionEn}
                </p>
              </ScrollReveal>

              <ScrollReveal direction="right" delayMs={80} className="lg:col-span-6 space-y-6">
                <div className="space-y-3">
                  <h2 className="font-display text-[26px] sm:text-[34px] font-bold tracking-tight text-[var(--nr-text)] leading-[1.14] [text-wrap:balance]">
                    {ct.bundleSection.title}
                  </h2>
                  <p className="text-base text-[var(--nr-text-secondary)] leading-relaxed">
                    {ct.bundleSection.subtitle}
                  </p>
                </div>

                <div className="space-y-2.5">
                  <div className="text-xs font-semibold uppercase tracking-wide text-[var(--nr-text-secondary)]">
                    {ct.bundleSection.specsTitle}
                  </div>
                  <ul className="space-y-2.5 text-sm sm:text-[15px] text-[var(--nr-text)]">
                    {(locale === 'es'
                      ? mainBundleHardware.specsEs
                      : mainBundleHardware.specsEn
                    ).map((spec) => (
                      <li key={spec} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-[var(--nr-primary)] shrink-0 mt-1" />
                        <span>{spec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl border border-[var(--nr-border)] bg-[var(--nr-surface)] p-5 space-y-2.5 text-xs sm:text-sm">
                  <div className="font-display font-bold text-[var(--nr-text)]">
                    {ct.bundleSection.conditionsTitle}
                  </div>
                  <div className="text-[var(--nr-text-secondary)]">
                    <strong className="text-[var(--nr-text)]">
                      {ct.bundleSection.warrantyLabel}:{' '}
                    </strong>
                    {locale === 'es'
                      ? catalog.conditions.warrantyEs
                      : catalog.conditions.warrantyEn}
                  </div>
                  <div className="text-[var(--nr-text-secondary)]">
                    <strong className="text-[var(--nr-text)]">
                      {ct.bundleSection.dispatchLabel}:{' '}
                    </strong>
                    {locale === 'es'
                      ? catalog.conditions.dispatchEs
                      : catalog.conditions.dispatchEn}
                  </div>
                  <div className="text-[var(--nr-text-secondary)]">
                    <strong className="text-[var(--nr-text)]">
                      {ct.bundleSection.supportLabel}:{' '}
                    </strong>
                    {locale === 'es'
                      ? catalog.conditions.supportEs
                      : catalog.conditions.supportEn}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => openConfiguratorWithPreset('POS_BUNDLE')}
                  className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl bg-[var(--nr-primary)] hover:bg-[var(--nr-primary-hover)] active:scale-[0.985] text-sm font-semibold text-[var(--nr-primary-fg)] nr-focus-ring nr-transition"
                >
                  <span>{ct.bundleSection.ctaConfigureBundle}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </ScrollReveal>
            </div>

            {/* Installation & Store Training Visual Block */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center pt-10 border-t border-[var(--nr-border)]">
              <ScrollReveal direction="left" className="order-2 lg:order-1 lg:col-span-6 space-y-5">
                <div className="space-y-2.5">
                  <h3 className="font-display text-2xl sm:text-[28px] font-bold tracking-tight text-[var(--nr-text)] leading-[1.18] [text-wrap:balance]">
                    {ct.bundleSection.trainingTitle}
                  </h3>
                  <p className="text-base text-[var(--nr-text-secondary)] leading-relaxed">
                    {ct.bundleSection.trainingSubtitle}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {catalog.installationOptions
                    .filter((i) => i.id !== 'inst-none')
                    .map((inst) => (
                      <div
                        key={inst.id}
                        className="rounded-2xl border border-[var(--nr-border)] bg-[var(--nr-surface)] hover:border-[var(--nr-primary)]/40 p-4 flex flex-col justify-between gap-3 nr-interactive-card"
                      >
                        <div className="space-y-1.5">
                          <div className="font-display text-sm font-bold text-[var(--nr-text)]">
                            {locale === 'es' ? inst.nameEs : inst.nameEn}
                          </div>
                          <p className="text-xs sm:text-sm text-[var(--nr-text-secondary)] leading-relaxed">
                            {locale === 'es' ? inst.scopeEs : inst.scopeEn}
                          </p>
                        </div>
                        <div className="font-mono-num text-sm font-bold text-[var(--nr-primary)] whitespace-nowrap">
                          {inst.oneTimePriceCents !== null
                            ? formatDopCents(inst.oneTimePriceCents, locale)
                            : ct.configurator.summaryPendingAmount}
                        </div>
                      </div>
                    ))}
                </div>
              </ScrollReveal>

              <ScrollReveal direction="right" delayMs={80} className="order-1 lg:order-2 lg:col-span-6 space-y-3">
                <div className="group aspect-[4/3] w-full rounded-[20px] overflow-hidden border border-[var(--nr-border)] bg-[var(--nr-surface-muted)]">
                  {!trainingImgError ? (
                    <img
                      src={trainingAsset.src}
                      width={trainingAsset.width}
                      height={trainingAsset.height}
                      alt={locale === 'es' ? trainingAsset.altEs : trainingAsset.altEn}
                      referrerPolicy="no-referrer"
                      onError={() => setTrainingImgError(true)}
                      className="w-full h-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-xs text-[var(--nr-text-secondary)]">
                      <MonitorSmartphone className="w-8 h-8 text-[var(--nr-primary)] mb-2" />
                      <span>
                        {locale === 'es' ? trainingAsset.altEs : trainingAsset.altEn}
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-[var(--nr-text-secondary)] leading-relaxed">
                  {locale === 'es' ? trainingAsset.captionEs : trainingAsset.captionEn}
                </p>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* 6. FAQ SECTION */}
        <section
          id="faq"
          className="relative scroll-mt-20 py-14 sm:py-16 lg:py-24 border-b border-[var(--nr-border)] bg-[var(--nr-bg)]"
        >
          <div
            className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 ${
              arrivedSectionId === 'faq' ? 'nr-arrival-active' : ''
            }`}
          >
            <ScrollReveal>
              <div className="space-y-3">
                <h2 className="font-display text-[26px] sm:text-[34px] font-bold tracking-tight text-[var(--nr-text)] leading-[1.14]">
                  {ct.faqSection.title}
                </h2>
                <p className="text-base text-[var(--nr-text-secondary)] leading-relaxed">
                  {ct.faqSection.subtitle}
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delayMs={60}>
              <div className="divide-y divide-[var(--nr-border)] border-y border-[var(--nr-border)]">
                {catalog.faqs.map((item) => {
                  const isOpen = openFaqId === item.id;
                  const pendingText =
                    locale === 'es'
                      ? item.pendingDefinitionEs
                      : item.pendingDefinitionEn;
                  return (
                    <div key={item.id} className="py-5">
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        onClick={() => setOpenFaqId(isOpen ? '' : item.id)}
                        className="w-full flex items-center justify-between gap-4 text-left font-display text-base sm:text-lg font-semibold text-[var(--nr-text)] hover:text-[var(--nr-primary)] rounded-xl nr-focus-ring nr-transition"
                      >
                        <span>{locale === 'es' ? item.questionEs : item.questionEn}</span>
                        <ChevronDown
                          className={`w-5 h-5 text-[var(--nr-text-secondary)] shrink-0 nr-transition ${
                            isOpen ? 'rotate-180 text-[var(--nr-primary)]' : ''
                          }`}
                        />
                      </button>
                      <div
                        aria-hidden={!isOpen}
                        className={`grid transition-[grid-template-rows,opacity,margin] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                          isOpen
                            ? 'grid-rows-[1fr] opacity-100 mt-3.5'
                            : 'grid-rows-[0fr] opacity-0 mt-0'
                        }`}
                      >
                        <div className="overflow-hidden min-h-0 space-y-3 text-sm sm:text-base text-[var(--nr-text-secondary)] leading-relaxed">
                          <p>{locale === 'es' ? item.answerEs : item.answerEn}</p>
                          {pendingText && (
                            <div className="rounded-xl border border-[var(--nr-warning-border)] bg-[var(--nr-warning-bg)] px-3.5 py-2.5 text-xs sm:text-sm text-[var(--nr-warning)]">
                              <strong>{ct.faqSection.pendingTag}</strong> {pendingText}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* 6. CLOSING CTA: Mirrors the dark hero gradient */}
        <section className="nr-hero-surface py-16 sm:py-20 text-white">
          <ScrollReveal className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-3 max-w-2xl">
              <h2 className="font-display text-[26px] sm:text-[34px] font-bold tracking-tight text-white [text-wrap:balance]">
                {ct.faqSection.closingTitle}
              </h2>
              <p className="text-base text-slate-300 leading-relaxed">
                {ct.faqSection.closingSubtitle}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => navigateTo('/planes')}
                className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-[#047857] hover:bg-[#065F46] active:scale-[0.985] dark:bg-[#34D399] dark:hover:bg-[#10B981] text-sm sm:text-base font-semibold text-white dark:text-[#052E24] whitespace-nowrap nr-focus-ring nr-transition"
              >
                <span>{ct.hero.primaryCta}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => navigateTo('/login')}
                className="inline-flex items-center justify-center h-12 px-5 rounded-xl border border-slate-600/80 bg-white/[0.06] hover:bg-white/[0.12] active:scale-[0.985] text-sm sm:text-base font-semibold text-slate-100 whitespace-nowrap nr-focus-ring nr-transition"
              >
                {ct.nav.erpAccess}
              </button>
            </div>
          </ScrollReveal>
        </section>
      </main>

      <CommercialFooter />
    </div>
  );
};
