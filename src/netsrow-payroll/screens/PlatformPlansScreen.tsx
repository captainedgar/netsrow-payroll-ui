import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Edit3,
  Layers,
  Plus,
  ShieldCheck,
} from 'lucide-react';
import {
  ErpModal,
  ErpPageHeader,
  ErpSurfaceCard,
} from '../components/ErpUiPrimitives';
import { MoneyCell } from '../components/MoneyCell';
import { StatusBadge } from '../components/StatusBadge';
import { usePlatform } from '../context/PlatformContext';
import { validateModuleDependencies } from '../services/mockPlatformClient';
import { SaasModuleCode, SaasPlan } from '../types/platform';

export const PlatformPlansScreen: React.FC = () => {
  const { platformState, locale, pt, upsertPlan, isMutating } = usePlatform();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [nameEs, setNameEs] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [descriptionEs, setDescriptionEs] = useState('');
  const [monthlyBasePriceDop, setMonthlyBasePriceDop] = useState('4500');
  const [effectiveDate, setEffectiveDate] = useState('2026-12-01');
  const [status, setStatus] = useState<'ACTIVE' | 'ARCHIVED'>('ACTIVE');
  const [includedModules, setIncludedModules] = useState<SaasModuleCode[]>(['CORE_ERP']);
  const [sampleAddonCodes, setSampleAddonCodes] = useState<SaasModuleCode[]>(['PAYROLL']);
  const [reason, setReason] = useState('');

  const openCreateModal = () => {
    setEditingPlanId(null);
    setCode(`PLAN-DEMO-${platformState.plans.length + 1}`);
    setNameEs('');
    setNameEn('');
    setDescriptionEs('');
    setMonthlyBasePriceDop('4800');
    setEffectiveDate('2026-12-01');
    setStatus('ACTIVE');
    setIncludedModules(['CORE_ERP', 'INVENTORY_CATALOG', 'POS_CASHBOX']);
    setSampleAddonCodes(['PAYROLL']);
    setReason('');
    setModalOpen(true);
  };

  const openEditModal = (plan: SaasPlan) => {
    setEditingPlanId(plan.id);
    setCode(plan.code);
    setNameEs(plan.nameEs);
    setNameEn(plan.nameEn);
    setDescriptionEs(plan.descriptionEs);
    setMonthlyBasePriceDop(String(plan.monthlyBasePriceDop));
    setEffectiveDate(plan.effectiveDate);
    setStatus(plan.status);
    setIncludedModules([...plan.includedModules]);
    setSampleAddonCodes(['PAYROLL', 'ACCOUNTING']);
    setReason('');
    setModalOpen(true);
  };

  const toggleIncludedModule = (modCode: SaasModuleCode) => {
    if (modCode === 'CORE_ERP') return;
    setIncludedModules((prev) =>
      prev.includes(modCode) ? prev.filter((c) => c !== modCode) : [...prev, modCode]
    );
  };

  const toggleSampleAddon = (modCode: SaasModuleCode) => {
    setSampleAddonCodes((prev) =>
      prev.includes(modCode) ? prev.filter((c) => c !== modCode) : [...prev, modCode]
    );
  };

  const depCheck = useMemo(
    () => validateModuleDependencies(includedModules, platformState.modules),
    [includedModules, platformState.modules]
  );

  const addMissingDeps = () => {
    const next = new Set<SaasModuleCode>(includedModules);
    depCheck.missing.forEach((m) => m.requires.forEach((req) => next.add(req)));
    setIncludedModules(Array.from(next));
  };

  // Live quote preview: Base Plan + Paid Add-ons without double-counting included modules
  const simulatorPreview = useMemo(() => {
    const base = Math.max(0, Number(monthlyBasePriceDop) || 0);
    const includedSet = new Set<SaasModuleCode>(includedModules);
    const billedAddons: { code: SaasModuleCode; name: string; price: number }[] = [];
    const alreadyIncluded: string[] = [];

    sampleAddonCodes.forEach((modCode) => {
      const def = platformState.modules.find((m) => m.code === modCode);
      if (!def || def.monthlyPriceDop <= 0) return;
      const label = locale === 'es' ? def.nameEs : def.nameEn;
      if (includedSet.has(modCode)) {
        alreadyIncluded.push(label);
      } else {
        billedAddons.push({ code: modCode, name: label, price: def.monthlyPriceDop });
      }
    });

    const addonsSum = billedAddons.reduce((s, a) => s + a.price, 0);
    return {
      base,
      billedAddons,
      alreadyIncluded,
      total: base + addonsSum,
    };
  }, [monthlyBasePriceDop, includedModules, sampleAddonCodes, platformState.modules, locale]);

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depCheck.valid || !code.trim() || !nameEs.trim()) return;
    const baseNum = Math.max(0, Number(monthlyBasePriceDop) || 0);
    const planPayload: SaasPlan = {
      id: editingPlanId ?? `plan-${Date.now()}`,
      code: code.trim().toUpperCase(),
      nameEs: nameEs.trim(),
      nameEn: nameEn.trim() || nameEs.trim(),
      descriptionEs:
        descriptionEs.trim() || 'Plan comercial demo configurable por módulos.',
      descriptionEn:
        descriptionEs.trim() || 'Configurable SaaS demo plan.',
      monthlyBasePriceDop: baseNum,
      effectiveDate,
      status,
      includedModules: Array.from(new Set<SaasModuleCode>(['CORE_ERP', ...includedModules])),
    };
    await upsertPlan(
      planPayload,
      reason.trim() ||
        (editingPlanId
          ? `Actualización de tarifa / módulos en catálogo (${planPayload.code})`
          : `Alta de nuevo plan demo (${planPayload.code})`)
    );
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <ErpPageHeader
        title={pt.platformNav.plans}
        subtitle={
          locale === 'es'
            ? 'Catálogo comercial de planes base y módulos opcionales. Al editar tarifas, las empresas existentes conservan su precio contratado.'
            : 'Commercial catalog of base plans and paid add-on modules. Existing tenant subscriptions keep their agreed rates.'
        }
        actions={
          <button
            type="button"
            onClick={openCreateModal}
            className="nr-focus-ring nr-transition inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-[var(--nr-primary)] hover:bg-[var(--nr-primary-hover)] text-xs font-semibold text-[var(--nr-primary-fg)] whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{locale === 'es' ? 'Nuevo plan demo' : 'New demo plan'}</span>
          </button>
        }
      />

      {/* Rate preservation notice */}
      <ErpSurfaceCard padding="sm" className="flex items-start gap-2.5 text-xs text-[var(--nr-text-secondary)]">
        <ShieldCheck className="w-4 h-4 text-[var(--nr-primary)] shrink-0 mt-0.5" />
        <span>
          {locale === 'es'
            ? 'Regla comercial vigente: los planes incluyen módulos base sin duplicar cobro al combinarlos con complementos. Los cambios de tarifa en catálogo aplican desde su fecha efectiva únicamente a nuevas altas o renovaciones negociadas.'
            : 'Commercial rule: included plan modules are never double-charged as add-ons. Catalog rate changes take effect on the chosen effective date without overwriting existing contracted prices.'}
        </span>
      </ErpSurfaceCard>

      {/* Plans grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {platformState.plans.map((plan) => {
          const activeTenantsCount = platformState.tenants.filter(
            (t) => t.planId === plan.id
          ).length;
          return (
            <ErpSurfaceCard
              key={plan.id}
              className="flex flex-col justify-between gap-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-mono-num text-[11px] font-bold text-[var(--nr-primary)]">
                      {plan.code}
                    </div>
                    <h2 className="font-display text-base font-bold text-[var(--nr-text)] mt-0.5">
                      {locale === 'es' ? plan.nameEs : plan.nameEn}
                    </h2>
                  </div>
                  <StatusBadge
                    label={
                      plan.status === 'ACTIVE'
                        ? locale === 'es'
                          ? 'Vigente'
                          : 'Active'
                        : locale === 'es'
                          ? 'Archivado'
                          : 'Archived'
                    }
                    tone={plan.status === 'ACTIVE' ? 'emerald' : 'neutral'}
                  />
                </div>

                <p className="text-xs text-[var(--nr-text-secondary)]">
                  {locale === 'es' ? plan.descriptionEs : plan.descriptionEn}
                </p>

                <div className="pt-2 border-t border-[var(--nr-border)] flex items-baseline justify-between">
                  <MoneyCell amount={plan.monthlyBasePriceDop} locale={locale} size="lg" emphasize />
                  <span className="text-[11px] font-mono-num text-[var(--nr-text-secondary)]">
                    {locale === 'es' ? 'Vigencia' : 'Eff.'} {plan.effectiveDate}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--nr-text-secondary)]">
                    {locale === 'es' ? 'Módulos incluidos' : 'Included modules'}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {plan.includedModules.map((modCode) => {
                      const def = platformState.modules.find((m) => m.code === modCode);
                      return (
                        <span
                          key={modCode}
                          className="rounded-md border border-[var(--nr-success-border)] bg-[var(--nr-success-bg)] px-2 py-0.5 text-[11px] font-medium text-[var(--nr-success)]"
                        >
                          {def ? (locale === 'es' ? def.nameEs : def.nameEn) : modCode}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--nr-border)] flex items-center justify-between text-xs">
                <span className="text-[var(--nr-text-secondary)] font-mono-num">
                  {activeTenantsCount}{' '}
                  {locale === 'es' ? 'empresas asignadas' : 'assigned companies'}
                </span>
                <button
                  type="button"
                  onClick={() => openEditModal(plan)}
                  className="nr-focus-ring nr-transition inline-flex items-center gap-1 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-2.5 py-1 font-semibold text-[var(--nr-text)] hover:border-[var(--nr-primary)]"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{locale === 'es' ? 'Editar' : 'Edit'}</span>
                </button>
              </div>
            </ErpSurfaceCard>
          );
        })}
      </div>

      {/* Modules & Dependency Matrix */}
      <ErpSurfaceCard padding="none" className="overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--nr-border)] flex items-center gap-2">
          <Layers className="w-4 h-4 text-[var(--nr-primary)]" />
          <h2 className="font-display text-sm font-bold text-[var(--nr-text)]">
            {locale === 'es'
              ? 'Catálogo de módulos y dependencias técnicas'
              : 'Modules & dependency catalog'}
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] text-[var(--nr-text-secondary)]">
                <th className="py-2.5 px-4 text-left font-semibold">
                  {locale === 'es' ? 'Código' : 'Code'}
                </th>
                <th className="py-2.5 px-4 text-left font-semibold">
                  {locale === 'es' ? 'Módulo' : 'Module'}
                </th>
                <th className="py-2.5 px-4 text-left font-semibold">
                  {locale === 'es' ? 'Dependencias requeridas' : 'Dependencies'}
                </th>
                <th className="py-2.5 px-4 text-right font-semibold">
                  {locale === 'es' ? 'Tarifa complemento / mes' : 'Add-on fee / mo'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--nr-border)]">
              {platformState.modules.map((mod) => (
                <tr key={mod.code}>
                  <td className="py-2.5 px-4 font-mono-num font-bold text-[var(--nr-text)] whitespace-nowrap">
                    {mod.code}
                  </td>
                  <td className="py-2.5 px-4">
                    <div className="font-semibold text-[var(--nr-text)]">
                      {locale === 'es' ? mod.nameEs : mod.nameEn}
                    </div>
                    <div className="text-[11px] text-[var(--nr-text-secondary)]">
                      {locale === 'es' ? mod.descriptionEs : mod.descriptionEn}
                    </div>
                  </td>
                  <td className="py-2.5 px-4 font-mono-num text-[11px] text-[var(--nr-text-secondary)]">
                    {mod.dependsOn.length === 0
                      ? locale === 'es'
                        ? 'Ninguna (base)'
                        : 'None (core)'
                      : mod.dependsOn.join(' + ')}
                  </td>
                  <td className="py-2.5 px-4 text-right whitespace-nowrap">
                    {mod.isCore ? (
                      <StatusBadge
                        label={locale === 'es' ? 'Incluido en base' : 'Included core'}
                        tone="emerald"
                      />
                    ) : (
                      <MoneyCell amount={mod.monthlyPriceDop} locale={locale} emphasize />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ErpSurfaceCard>

      {/* Create / Edit Plan Modal */}
      <ErpModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidthClass="max-w-2xl"
        closeLabel={locale === 'es' ? 'Cerrar' : 'Close'}
        title={
          editingPlanId
            ? locale === 'es'
              ? `Editar plan · ${code}`
              : `Edit plan · ${code}`
            : locale === 'es'
              ? 'Crear nuevo plan comercial (Solo demo)'
              : 'Create commercial plan (Demo only)'
        }
        footer={
          <>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="nr-focus-ring nr-transition h-9 px-3.5 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface)] text-xs font-semibold text-[var(--nr-text)]"
            >
              {locale === 'es' ? 'Cancelar' : 'Cancel'}
            </button>
            <button
              type="submit"
              form="platform-plan-form"
              disabled={isMutating || !depCheck.valid}
              className="nr-focus-ring nr-transition h-9 px-4 rounded-lg bg-[var(--nr-primary)] hover:bg-[var(--nr-primary-hover)] disabled:opacity-50 text-xs font-semibold text-[var(--nr-primary-fg)]"
            >
              {locale === 'es' ? 'Guardar plan en catálogo' : 'Save catalog plan'}
            </button>
          </>
        }
      >
        <form id="platform-plan-form" onSubmit={handleSavePlan} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1">
                    {locale === 'es' ? 'Código' : 'Code'}
                  </label>
                  <input
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 font-mono-num uppercase"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold mb-1">
                    {locale === 'es' ? 'Nombre del plan (ES)' : 'Plan name (ES)'}
                  </label>
                  <input
                    required
                    value={nameEs}
                    onChange={(e) => setNameEs(e.target.value)}
                    placeholder={
                      locale === 'es' ? 'Ej. Plan Retail Plus' : 'e.g. Retail Plus Plan'
                    }
                    className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1">
                    {locale === 'es' ? 'Tarifa base mensual (RD$)' : 'Monthly base (RD$)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    required
                    value={monthlyBasePriceDop}
                    onChange={(e) => setMonthlyBasePriceDop(e.target.value)}
                    className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 font-mono-num"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">
                    {locale === 'es' ? 'Fecha efectiva' : 'Effective date'}
                  </label>
                  <input
                    type="date"
                    required
                    value={effectiveDate}
                    onChange={(e) => setEffectiveDate(e.target.value)}
                    className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 font-mono-num"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">
                    {locale === 'es' ? 'Estado catálogo' : 'Catalog status'}
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'ACTIVE' | 'ARCHIVED')}
                    className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 font-semibold"
                  >
                    <option value="ACTIVE">{locale === 'es' ? 'Vigente' : 'Active'}</option>
                    <option value="ARCHIVED">{locale === 'es' ? 'Archivado' : 'Archived'}</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="font-semibold mb-2">
                  {locale === 'es'
                    ? 'Módulos incluidos dentro de la tarifa base:'
                    : 'Modules included in base plan:'}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {platformState.modules.map((mod) => (
                    <label
                      key={mod.code}
                      className="flex items-start gap-2 rounded border border-slate-200 dark:border-slate-800 p-2.5 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={includedModules.includes(mod.code)}
                        disabled={mod.isCore}
                        onChange={() => toggleIncludedModule(mod.code)}
                        className="mt-0.5"
                      />
                      <div className="min-w-0">
                        <div className="font-semibold">
                          {locale === 'es' ? mod.nameEs : mod.nameEn}
                        </div>
                        {mod.dependsOn.length > 0 && (
                          <div className="text-[11px] text-slate-500">
                            {locale === 'es' ? 'Requiere:' : 'Requires:'}{' '}
                            {mod.dependsOn.join(', ')}
                          </div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {!depCheck.valid && (
                <div className="rounded border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 p-3 text-amber-900 dark:text-amber-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>
                      {locale === 'es'
                        ? 'Faltan dependencias técnicas para los módulos elegidos:'
                        : 'Missing dependencies for selected modules:'}
                    </span>
                  </div>
                  <ul className="list-disc pl-5">
                    {depCheck.missing.map((m) => (
                      <li key={m.module}>
                        {m.module} → {m.requires.join(', ')}
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={addMissingDeps}
                    className="h-8 px-3 rounded bg-amber-700 text-white font-semibold"
                  >
                    {locale === 'es'
                      ? 'Incluir dependencias requeridas'
                      : 'Include required dependencies'}
                  </button>
                </div>
              )}

              {/* Live Plan + Add-ons Price Simulator (Zero double-counting) */}
              <div className="rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-3 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-100">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>
                    {locale === 'es'
                      ? 'Simulador comercial (Plan base + complementos sin duplicar)'
                      : 'Quote simulator (Base plan + add-ons without double-counting)'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {platformState.modules
                    .filter((m) => !m.isCore)
                    .map((m) => (
                      <label
                        key={m.code}
                        className="inline-flex items-center gap-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={sampleAddonCodes.includes(m.code)}
                          onChange={() => toggleSampleAddon(m.code)}
                        />
                        <span>
                          {m.code} (RD${m.monthlyPriceDop.toLocaleString()})
                        </span>
                      </label>
                    ))}
                </div>
                <div className="text-[11px] space-y-1 pt-1 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between">
                    <span>{locale === 'es' ? 'Base del plan:' : 'Plan base:'}</span>
                    <span className="font-mono-num">
                      RD${simulatorPreview.base.toLocaleString()}
                    </span>
                  </div>
                  {simulatorPreview.alreadyIncluded.length > 0 && (
                    <div className="text-emerald-700 dark:text-emerald-400">
                      {locale === 'es' ? 'Incluidos sin cargo extra:' : 'Included at no extra fee:'}{' '}
                      {simulatorPreview.alreadyIncluded.join(', ')}
                    </div>
                  )}
                  {simulatorPreview.billedAddons.map((ad) => (
                    <div key={ad.code} className="flex justify-between">
                      <span>+ {ad.name}</span>
                      <span className="font-mono-num">RD${ad.price.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold text-xs pt-1">
                    <span>{locale === 'es' ? 'Total mensual simulado:' : 'Simulated monthly total:'}</span>
                    <MoneyCell amount={simulatorPreview.total} locale={locale} emphasize />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">
                  {locale === 'es' ? 'Motivo para Auditoría' : 'Audit reason'}
                </label>
                <input
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={
                    locale === 'es'
                      ? 'Ej. Actualización de catálogo comercial Q4 (mantiene precios previos)'
                      : 'e.g. Commercial Q4 catalog adjustment (preserves existing prices)'
                  }
                  className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm"
                />
              </div>

            </form>
      </ErpModal>
    </div>
  );
};
