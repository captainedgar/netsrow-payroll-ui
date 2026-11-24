import {
  CommercialCatalog,
  CommercialModuleCode,
  CommercialSelectionState,
  QuoteBreakdown,
} from '../types/commercial';
import { Locale } from '../types/payroll';

export function formatDopCents(cents: number, locale: Locale): string {
  const amount = cents / 100;
  const formatted = new Intl.NumberFormat(locale === 'es' ? 'es-DO' : 'en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  return `RD$${formatted}`;
}

export function validateCommercialDependencies(
  selectedPlanIncluded: CommercialModuleCode[],
  selectedAddons: CommercialModuleCode[],
  catalog: CommercialCatalog
): {
  valid: boolean;
  missing: { module: CommercialModuleCode; requires: CommercialModuleCode[] }[];
} {
  const activeSet = new Set<CommercialModuleCode>([
    ...selectedPlanIncluded,
    ...selectedAddons,
  ]);
  const missing: { module: CommercialModuleCode; requires: CommercialModuleCode[] }[] = [];

  selectedAddons.forEach((code) => {
    const modDef = catalog.modules.find((m) => m.code === code);
    if (!modDef) return;
    const unmet = modDef.dependsOn.filter((dep) => !activeSet.has(dep));
    if (unmet.length > 0) {
      missing.push({ module: code, requires: unmet });
    }
  });

  return { valid: missing.length === 0, missing };
}

export function computeQuoteBreakdown(
  selection: CommercialSelectionState,
  catalog: CommercialCatalog
): QuoteBreakdown {
  const plan =
    catalog.plans.find((p) => p.id === selection.planId) ?? catalog.plans[0];
  const includedSet = new Set<CommercialModuleCode>(plan.includedModules);

  const pendingQuoteItems: { labelEs: string; labelEn: string }[] = [];
  let softwareMonthlyCents = plan.monthlyPriceCents;

  let hasPendingSoftwarePricing = false;
  let oneTimeAccumulator = 0;
  let hasPendingOneTime = false;

  const billedAddons: QuoteBreakdown['billedAddons'] = [];
  selection.selectedAddons.forEach((code) => {
    if (includedSet.has(code)) return;
    const modDef = catalog.modules.find((m) => m.code === code);
    if (!modDef || modDef.status === 'IN_DEVELOPMENT') return;

    if (code === 'E_INVOICING') {
      const eiSpec = catalog.electronicInvoicing;
      const eiMonthly =
        eiSpec.confirmedMonthlyPriceCents ?? modDef.monthlyPriceCents;
      const eiOneTime = eiSpec.confirmedOneTimeImplementationCents;

      if (eiMonthly === null) {
        hasPendingSoftwarePricing = true;
        billedAddons.push({
          code: modDef.code,
          nameEs: modDef.nameEs,
          nameEn: modDef.nameEn,
          monthlyPriceCents: null,
          priceStatus: 'QUOTE_REQUIRED',
        });
        pendingQuoteItems.push({
          labelEs: `Cuota mensual: ${modDef.nameEs}`,
          labelEn: `Monthly fee: ${modDef.nameEn}`,
        });
      } else {
        softwareMonthlyCents += eiMonthly;
        billedAddons.push({
          code: modDef.code,
          nameEs: modDef.nameEs,
          nameEn: modDef.nameEn,
          monthlyPriceCents: eiMonthly,
          priceStatus: 'DEFINED',
        });
      }

      if (eiOneTime === null) {
        hasPendingOneTime = true;
        pendingQuoteItems.push({
          labelEs: `Implementación única: ${modDef.nameEs}`,
          labelEn: `One-time setup: ${modDef.nameEn}`,
        });
      } else {
        oneTimeAccumulator += eiOneTime;
      }
      return;
    }

    if (modDef.priceStatus === 'QUOTE_REQUIRED' || modDef.monthlyPriceCents === null) {
      hasPendingSoftwarePricing = true;
      billedAddons.push({
        code: modDef.code,
        nameEs: modDef.nameEs,
        nameEn: modDef.nameEn,
        monthlyPriceCents: null,
        priceStatus: 'QUOTE_REQUIRED',
      });
      pendingQuoteItems.push({
        labelEs: `Módulo: ${modDef.nameEs}`,
        labelEn: `Module: ${modDef.nameEn}`,
      });
      return;
    }

    softwareMonthlyCents += modDef.monthlyPriceCents;
    billedAddons.push({
      code: modDef.code,
      nameEs: modDef.nameEs,
      nameEn: modDef.nameEn,
      monthlyPriceCents: modDef.monthlyPriceCents,
      priceStatus: 'DEFINED',
    });
  });

  let equipmentMonthlyCents: number | null = 0;
  let installmentsCount = 0;
  let isUpfrontHardware = false;
  let hasPendingEquipment = false;

  if (selection.mode === 'POS_BUNDLE') {
    const hw =
      catalog.hardwareOptions.find((h) => h.id === selection.hardwareId) ??
      catalog.hardwareOptions[0];
    const payOpt =
      hw.paymentOptions.find((p) => p.id === selection.paymentOptionId) ??
      hw.paymentOptions[0];

    const multiQtyNeedsQuote = selection.hardwareQuantity > hw.maxSelfServiceQuantity;

    if (payOpt.type === 'QUOTE_REQUIRED' || multiQtyNeedsQuote) {
      hasPendingEquipment = true;
      equipmentMonthlyCents = null;
      installmentsCount = 0;
      pendingQuoteItems.push({
        labelEs: `Equipos: ${hw.nameEs} (x${selection.hardwareQuantity})`,
        labelEn: `Hardware: ${hw.nameEn} (x${selection.hardwareQuantity})`,
      });
    } else if (payOpt.type === 'INSTALLMENTS' && payOpt.monthlyInstallmentCents !== null) {
      equipmentMonthlyCents = payOpt.monthlyInstallmentCents * selection.hardwareQuantity;
      installmentsCount = payOpt.installmentsCount;
      if (payOpt.downPaymentCents && payOpt.downPaymentCents > 0) {
        oneTimeAccumulator += payOpt.downPaymentCents * selection.hardwareQuantity;
      }
    } else if (payOpt.type === 'UPFRONT' && payOpt.upfrontPriceCents !== null) {
      isUpfrontHardware = true;
      equipmentMonthlyCents = 0;
      installmentsCount = 0;
      oneTimeAccumulator += payOpt.upfrontPriceCents * selection.hardwareQuantity;
    }
  } else {
    equipmentMonthlyCents = 0;
    installmentsCount = 0;
  }

  // Installation service
  const inst = catalog.installationOptions.find((i) => i.id === selection.installationId);
  if (inst && inst.applicableModes.includes(selection.mode)) {
    if (inst.priceStatus === 'QUOTE_REQUIRED' || inst.oneTimePriceCents === null) {
      hasPendingOneTime = true;
      pendingQuoteItems.push({
        labelEs: `Instalación: ${inst.nameEs}`,
        labelEn: `Installation: ${inst.nameEn}`,
      });
    } else {
      oneTimeAccumulator += inst.oneTimePriceCents;
    }
  }

  // Training service
  const trn = catalog.trainingOptions.find((t) => t.id === selection.trainingId);
  if (trn && trn.applicableModes.includes(selection.mode)) {
    if (trn.priceStatus === 'QUOTE_REQUIRED' || trn.oneTimePriceCents === null) {
      hasPendingOneTime = true;
      pendingQuoteItems.push({
        labelEs: `Capacitación: ${trn.nameEs}`,
        labelEn: `Training: ${trn.nameEn}`,
      });
    } else {
      oneTimeAccumulator += trn.oneTimePriceCents;
    }
  }

  const hasPendingOneTimePricing =
    hasPendingOneTime || (isUpfrontHardware && hasPendingEquipment);

  const oneTimeChargesCents = hasPendingOneTimePricing ? null : oneTimeAccumulator;

  const knownMonthlyDuringInstallmentsCents =
    softwareMonthlyCents + (equipmentMonthlyCents ?? 0);

  const totalDuringInstallmentsCents =
    hasPendingEquipment || equipmentMonthlyCents === null
      ? null
      : knownMonthlyDuringInstallmentsCents;

  const initialPaymentCents =
    hasPendingOneTimePricing || hasPendingEquipment || oneTimeChargesCents === null
      ? null
      : oneTimeChargesCents;

  return {
    softwareMonthlyCents,
    equipmentMonthlyCents,
    installmentsCount,
    oneTimeChargesCents,
    knownOneTimeChargesCents: oneTimeAccumulator,
    knownMonthlyDuringInstallmentsCents,
    totalDuringInstallmentsCents,
    totalAfterInstallmentsCents: softwareMonthlyCents,
    initialPaymentCents,
    pendingQuoteItems,
    hasPendingPricing: pendingQuoteItems.length > 0,
    hasPendingSoftwarePricing,
    hasPendingOneTimePricing,
    isUpfrontHardware,
    includedModulesInPlan: plan.includedModules,
    billedAddons,
  };
}
