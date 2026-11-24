import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  PauseCircle,
  PlayCircle,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { DataTable, DataTableColumn } from '../components/DataTable';
import { MoneyCell } from '../components/MoneyCell';
import { StatusBadge } from '../components/StatusBadge';
import { usePlatform } from '../context/PlatformContext';
import { computeTenantMonthlyBreakdown } from '../data/platformSeed';
import { validateModuleDependencies } from '../services/mockPlatformClient';
import { SaasModuleCode, TenantRecord, TenantStatus } from '../types/platform';

const PAGE_SIZE = 5;

export const PlatformTenantsScreen: React.FC = () => {
  const {
    platformState,
    locale,
    pt,
    selectedTenantId,
    setSelectedTenantId,
    updateTenantSubscription,
    changeTenantStatus,
    isMutating,
  } = usePlatform();

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | TenantStatus>('ALL');
  const [planFilter, setPlanFilter] = useState('ALL');
  const [page, setPage] = useState(1);

  // Plan & Module edit modal + confirmation step
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [draftPlanId, setDraftPlanId] = useState('');
  const [draftModules, setDraftModules] = useState<SaasModuleCode[]>([]);
  const [draftEffectiveDate, setDraftEffectiveDate] = useState('2026-12-01');
  const [draftReason, setDraftReason] = useState('');
  const [planConfirmStep, setPlanConfirmStep] = useState(false);

  // Suspend / Reactivate modal
  const [statusModalAction, setStatusModalAction] = useState<'ACTIVE' | 'SUSPENDED' | null>(
    null
  );
  const [statusReason, setStatusReason] = useState('');

  const filteredTenants = useMemo(() => {
    const q = query.trim().toLowerCase();
    return platformState.tenants.filter((t) => {
      if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
      if (planFilter !== 'ALL' && t.planId !== planFilter) return false;
      if (!q) return true;
      return (
        t.name.toLowerCase().includes(q) ||
        t.code.toLowerCase().includes(q) ||
        t.rnc.toLowerCase().includes(q)
      );
    });
  }, [platformState.tenants, query, statusFilter, planFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredTenants.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedTenants = useMemo(
    () =>
      filteredTenants.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [filteredTenants, safePage]
  );

  const selectedTenant = useMemo(
    () => platformState.tenants.find((t) => t.id === selectedTenantId) ?? null,
    [platformState.tenants, selectedTenantId]
  );

  const selectedBreakdown = useMemo(() => {
    if (!selectedTenant) return null;
    return computeTenantMonthlyBreakdown(
      selectedTenant,
      platformState.modules,
      platformState.plans
    );
  }, [selectedTenant, platformState.modules, platformState.plans]);

  const tenantAuditEvents = useMemo(() => {
    if (!selectedTenant) return [];
    return platformState.auditEvents.filter((e) => e.tenantId === selectedTenant.id);
  }, [selectedTenant, platformState.auditEvents]);

  const openPlanEditor = (ten: TenantRecord) => {
    setDraftPlanId(ten.planId);
    setDraftModules([...ten.enabledModules]);
    setDraftEffectiveDate('2026-12-01');
    setDraftReason('');
    setPlanConfirmStep(false);
    setPlanModalOpen(true);
  };

  const handlePlanChangeSelect = (nextPlanId: string) => {
    setDraftPlanId(nextPlanId);
    const plan = platformState.plans.find((p) => p.id === nextPlanId);
    if (plan) {
      const merged = new Set<SaasModuleCode>([
        'CORE_ERP',
        ...plan.includedModules,
        ...draftModules,
      ]);
      setDraftModules(Array.from(merged));
    }
    setPlanConfirmStep(false);
  };

  const toggleDraftModule = (code: SaasModuleCode) => {
    if (code === 'CORE_ERP') return;
    const plan = platformState.plans.find((p) => p.id === draftPlanId);
    if (plan?.includedModules.includes(code)) return;

    setDraftModules((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
    setPlanConfirmStep(false);
  };

  const draftDependencyCheck = useMemo(
    () => validateModuleDependencies(draftModules, platformState.modules),
    [draftModules, platformState.modules]
  );

  const draftPricePreview = useMemo(() => {
    if (!selectedTenant) return null;
    const plan = platformState.plans.find((p) => p.id === draftPlanId);
    if (!plan) return null;
    const includedSet = new Set<SaasModuleCode>(plan.includedModules);
    const baseDop =
      plan.id === selectedTenant.planId
        ? selectedTenant.contractedBasePriceDop
        : plan.monthlyBasePriceDop;
    let addonsDop = 0;
    const addonNames: string[] = [];
    draftModules.forEach((code) => {
      if (includedSet.has(code)) return;
      const modDef = platformState.modules.find((m) => m.code === code);
      if (modDef && modDef.monthlyPriceDop > 0) {
        const fee = selectedTenant.addonPricesDop[code] ?? modDef.monthlyPriceDop;
        addonsDop += fee;
        addonNames.push(locale === 'es' ? modDef.nameEs : modDef.nameEn);
      }
    });
    const nextTotal = baseDop + addonsDop;
    const prevTotal = selectedBreakdown?.totalDop ?? 0;
    return {
      plan,
      baseDop,
      addonsDop,
      addonNames,
      nextTotal,
      delta: nextTotal - prevTotal,
    };
  }, [
    selectedTenant,
    selectedBreakdown,
    draftPlanId,
    draftModules,
    platformState.plans,
    platformState.modules,
    locale,
  ]);

  const addMissingDependencies = () => {
    const next = new Set<SaasModuleCode>(draftModules);
    draftDependencyCheck.missing.forEach((m) =>
      m.requires.forEach((req) => next.add(req))
    );
    setDraftModules(Array.from(next));
  };

  const confirmPlanSave = async () => {
    if (!selectedTenant || !draftReason.trim() || !draftDependencyCheck.valid) return;
    await updateTenantSubscription({
      tenantId: selectedTenant.id,
      nextPlanId: draftPlanId,
      nextEnabledModules: draftModules,
      effectiveDate: draftEffectiveDate,
      reason: draftReason.trim(),
    });
    setPlanModalOpen(false);
  };

  const confirmStatusSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenant || !statusModalAction || !statusReason.trim()) return;
    await changeTenantStatus({
      tenantId: selectedTenant.id,
      nextStatus: statusModalAction,
      reason: statusReason.trim(),
    });
    setStatusModalAction(null);
    setStatusReason('');
  };

  const statusTone = (status: TenantStatus) =>
    status === 'ACTIVE' ? 'emerald' : status === 'TRIAL' ? 'amber' : 'crimson';

  const statusIcon = (status: TenantStatus) =>
    status === 'ACTIVE' ? 'approved' : status === 'TRIAL' ? 'review' : 'lock';

  const columns: DataTableColumn<TenantRecord>[] = [
    {
      key: 'code',
      header: locale === 'es' ? 'Identificador' : 'Code',
      stickyLeft: true,
      render: (t) => (
        <div>
          <div className="font-mono-num text-xs font-bold text-emerald-700 dark:text-emerald-400">
            {t.code}
          </div>
          <div className="font-mono-num text-[11px] text-slate-500">{t.rnc}</div>
        </div>
      ),
    },
    {
      key: 'name',
      header: locale === 'es' ? 'Empresa' : 'Company',
      minWidthClass: 'min-w-[200px]',
      render: (t) => (
        <div>
          <div className="font-semibold text-slate-900 dark:text-slate-100">{t.name}</div>
          <div className="text-[11px] text-slate-500">
            {t.ownerName} · {t.accountManagerName}
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: locale === 'es' ? 'Estado' : 'Status',
      render: (t) => (
        <StatusBadge
          label={pt.tenantStatuses[t.status]}
          tone={statusTone(t.status)}
          icon={statusIcon(t.status)}
        />
      ),
    },
    {
      key: 'plan',
      header: locale === 'es' ? 'Plan actual' : 'Current plan',
      render: (t) => (
        <div>
          <div className="text-xs font-semibold">
            {locale === 'es' ? t.planNameSnapshotEs : t.planNameSnapshotEn}
          </div>
          <div className="text-[11px] text-slate-500">
            {t.enabledModules.includes('PAYROLL')
              ? locale === 'es'
                ? 'Con Nómina DO'
                : 'Payroll enabled'
              : locale === 'es'
                ? 'Sin Nómina'
                : 'No Payroll'}
          </div>
        </div>
      ),
    },
    {
      key: 'total',
      header: locale === 'es' ? 'Cuota mensual' : 'Monthly fee',
      align: 'right',
      render: (t) => {
        const b = computeTenantMonthlyBreakdown(
          t,
          platformState.modules,
          platformState.plans
        );
        return <MoneyCell amount={b.totalDop} locale={locale} emphasize />;
      },
    },
    {
      key: 'actions',
      header: locale === 'es' ? 'Detalle' : 'Detail',
      align: 'right',
      render: (t) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedTenantId(t.id);
          }}
          className="rounded border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap"
        >
          {locale === 'es' ? 'Ver empresa' : 'View company'}
        </button>
      ),
    },
  ];

  // Detail Screen View
  if (selectedTenant && selectedBreakdown) {
    const selectedPlanObj = platformState.plans.find(
      (p) => p.id === selectedTenant.planId
    );
    return (
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setSelectedTenantId(null)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{locale === 'es' ? 'Volver al listado de empresas' : 'Back to companies'}</span>
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => openPlanEditor(selectedTenant)}
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>
                {locale === 'es'
                  ? 'Cambiar plan / módulos'
                  : 'Change plan / modules'}
              </span>
            </button>

            {selectedTenant.status !== 'SUSPENDED' ? (
              <button
                type="button"
                onClick={() => {
                  setStatusReason('');
                  setStatusModalAction('SUSPENDED');
                }}
                className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/40 text-xs font-semibold text-red-700 dark:text-red-300 hover:bg-red-100"
              >
                <PauseCircle className="w-3.5 h-3.5" />
                <span>{locale === 'es' ? 'Suspender empresa' : 'Suspend'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setStatusReason('');
                  setStatusModalAction('ACTIVE');
                }}
                className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-xs font-semibold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100"
              >
                <PlayCircle className="w-3.5 h-3.5" />
                <span>{locale === 'es' ? 'Reactivar empresa' : 'Reactivate'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Commercial Identity & Price Breakdown */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
          <div className="xl:col-span-7 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <div className="font-mono-num text-xs font-semibold text-slate-500">
                  {selectedTenant.code} · RNC {selectedTenant.rnc}
                </div>
                <h1 className="font-display text-xl font-bold mt-0.5">
                  {selectedTenant.name}
                </h1>
                <div className="text-xs text-slate-500 mt-0.5">
                  {locale === 'es' ? selectedTenant.sectorEs : selectedTenant.sectorEn}
                </div>
              </div>
              <StatusBadge
                label={pt.tenantStatuses[selectedTenant.status]}
                tone={statusTone(selectedTenant.status)}
                icon={statusIcon(selectedTenant.status)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block">
                  {locale === 'es' ? 'Contacto propietario' : 'Account owner'}
                </span>
                <span className="font-semibold">{selectedTenant.ownerName}</span>
                <div className="font-mono-num text-[11px] text-slate-500">
                  {selectedTenant.ownerEmail}
                </div>
              </div>
              <div>
                <span className="text-slate-500 block">
                  {locale === 'es' ? 'Responsable de cuenta' : 'Account manager'}
                </span>
                <span className="font-semibold">{selectedTenant.accountManagerName}</span>
                <div className="text-[11px] text-slate-500">
                  {selectedTenant.branchCount}{' '}
                  {locale === 'es' ? 'sucursales declaradas' : 'declared branches'}
                </div>
              </div>
              <div>
                <span className="text-slate-500 block">
                  {locale === 'es' ? 'Vigencia actual' : 'Effective date'}
                </span>
                <span className="font-mono-num font-semibold">
                  {selectedTenant.effectiveDate}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">
                  {locale === 'es' ? 'Próxima renovación' : 'Next renewal'}
                </span>
                <span className="font-mono-num font-semibold">
                  {selectedTenant.renewalDate}
                </span>
              </div>
            </div>

            {/* Enabled Modules */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {locale === 'es' ? 'Módulos habilitados' : 'Enabled modules'}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {platformState.modules.map((mod) => {
                  const enabled = selectedTenant.enabledModules.includes(mod.code);
                  const included = selectedPlanObj?.includedModules.includes(mod.code);
                  return (
                    <div
                      key={mod.code}
                      className={`rounded border px-3 py-2 text-xs flex items-center justify-between gap-2 ${
                        enabled
                          ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20'
                          : 'border-slate-200 dark:border-slate-800 opacity-60'
                      }`}
                    >
                      <span className="font-medium truncate">
                        {locale === 'es' ? mod.nameEs : mod.nameEn}
                      </span>
                      <StatusBadge
                        label={
                          !enabled
                            ? locale === 'es'
                              ? 'Inactivo'
                              : 'Off'
                            : included
                              ? locale === 'es'
                                ? 'Incluido'
                                : 'Included'
                              : locale === 'es'
                                ? 'Adicional'
                                : 'Add-on'
                        }
                        tone={enabled ? 'emerald' : 'neutral'}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Monthly Price Breakdown & Commercial Isolation Notice */}
          <div className="xl:col-span-5 space-y-4">
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-sm font-bold">
                  {locale === 'es'
                    ? 'Desglose mensual contratado'
                    : 'Contracted monthly breakdown'}
                </h2>
                <StatusBadge
                  label={
                    locale === 'es'
                      ? selectedTenant.planNameSnapshotEs
                      : selectedTenant.planNameSnapshotEn
                  }
                  tone="neutral"
                />
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                <div className="py-2 flex justify-between">
                  <span>
                    {locale === 'es' ? 'Cuota base del plan' : 'Base plan fee'}
                  </span>
                  <MoneyCell amount={selectedBreakdown.baseDop} locale={locale} />
                </div>

                {selectedBreakdown.addons.length === 0 ? (
                  <div className="py-2 text-slate-500">
                    {locale === 'es'
                      ? 'Sin complementos adicionales facturados aparte.'
                      : 'No separately billed add-on modules.'}
                  </div>
                ) : (
                  selectedBreakdown.addons.map((ad) => (
                    <div key={ad.code} className="py-2 flex justify-between">
                      <span>
                        + {locale === 'es' ? ad.nameEs : ad.nameEn}
                      </span>
                      <MoneyCell amount={ad.priceDop} locale={locale} />
                    </div>
                  ))
                )}

                <div className="pt-2.5 flex justify-between font-bold text-sm">
                  <span>{locale === 'es' ? 'Total mensual (RD$)' : 'Monthly total (RD$)'}</span>
                  <MoneyCell amount={selectedBreakdown.totalDop} locale={locale} size="lg" emphasize />
                </div>
              </div>

              <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                {locale === 'es'
                  ? 'Por aislamiento de privacidad SaaS, este detalle comercial no expone salarios, nóminas, ventas ni credenciales del cliente.'
                  : 'For SaaS tenant privacy, commercial details never expose client salaries, payrolls, sales, or credentials.'}
              </p>
            </div>

            {/* Tenant Audit Activity */}
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
              <h2 className="font-display text-sm font-bold">
                {locale === 'es' ? 'Actividad reciente de la empresa' : 'Company audit activity'}
              </h2>
              {tenantAuditEvents.length === 0 ? (
                <p className="text-xs text-slate-500">
                  {locale === 'es'
                    ? 'Sin eventos registrados todavía.'
                    : 'No audit events recorded yet.'}
                </p>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {tenantAuditEvents.slice(0, 5).map((ev) => (
                    <div key={ev.id} className="py-2 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <StatusBadge label={pt.auditEvents[ev.eventType]} tone="neutral" />
                        <span className="font-mono-num text-[11px] text-slate-500">
                          {ev.timestamp}
                        </span>
                      </div>
                      <div className="font-medium">
                        {locale === 'es' ? ev.summaryEs : ev.summaryEn}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {locale === 'es' ? 'Motivo:' : 'Reason:'} {ev.reason}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Change Plan / Toggle Modules Modal with Price Delta & Confirmation */}
        {planModalOpen && draftPricePreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60">
            <div className="w-full max-w-xl rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 shrink-0">
                <h2 className="font-display text-base font-bold">
                  {locale === 'es'
                    ? `Plan y módulos · ${selectedTenant.name}`
                    : `Plan & modules · ${selectedTenant.name}`}
                </h2>
                <button
                  type="button"
                  onClick={() => setPlanModalOpen(false)}
                  className="p-1 text-slate-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 space-y-4 overflow-y-auto">
                {!planConfirmStep ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold mb-1">
                          {locale === 'es' ? 'Plan asignado' : 'Assigned plan'}
                        </label>
                        <select
                          value={draftPlanId}
                          onChange={(e) => handlePlanChangeSelect(e.target.value)}
                          className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 text-xs font-semibold"
                        >
                          {platformState.plans
                            .filter((p) => p.status === 'ACTIVE')
                            .map((p) => (
                              <option key={p.id} value={p.id}>
                                {locale === 'es' ? p.nameEs : p.nameEn} (RD$
                                {p.monthlyBasePriceDop.toLocaleString()})
                              </option>
                            ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1">
                          {locale === 'es' ? 'Fecha efectiva' : 'Effective date'}
                        </label>
                        <input
                          type="date"
                          value={draftEffectiveDate}
                          onChange={(e) => setDraftEffectiveDate(e.target.value)}
                          className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 text-xs font-mono-num"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-semibold mb-2">
                        {locale === 'es'
                          ? 'Módulos habilitados (incluidos en plan vs complementos)'
                          : 'Enabled modules (included vs paid add-ons)'}
                      </div>
                      <div className="space-y-2">
                        {platformState.modules.map((mod) => {
                          const includedInPlan =
                            draftPricePreview.plan.includedModules.includes(mod.code);
                          const checked = draftModules.includes(mod.code);
                          return (
                            <label
                              key={mod.code}
                              className="flex items-center justify-between gap-3 rounded border border-slate-200 dark:border-slate-800 px-3 py-2 text-xs cursor-pointer"
                            >
                              <div className="flex items-center gap-2.5">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  disabled={mod.isCore || includedInPlan}
                                  onChange={() => toggleDraftModule(mod.code)}
                                />
                                <div>
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
                              </div>
                              <span className="font-mono-num font-semibold whitespace-nowrap">
                                {includedInPlan
                                  ? locale === 'es'
                                    ? 'Incluido'
                                    : 'Included'
                                  : mod.monthlyPriceDop === 0
                                    ? 'RD$0.00'
                                    : `+RD$${mod.monthlyPriceDop.toLocaleString()}`}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {!draftDependencyCheck.valid && (
                      <div className="rounded border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 p-3 text-xs text-amber-900 dark:text-amber-200 space-y-2">
                        <div className="flex items-center gap-2 font-bold">
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                          <span>
                            {locale === 'es'
                              ? 'Dependencia de módulos requerida:'
                              : 'Required module dependency:'}
                          </span>
                        </div>
                        <ul className="list-disc pl-5 space-y-0.5">
                          {draftDependencyCheck.missing.map((m) => (
                            <li key={m.module}>
                              {m.module} → {m.requires.join(', ')}
                            </li>
                          ))}
                        </ul>
                        <button
                          type="button"
                          onClick={addMissingDependencies}
                          className="h-8 px-3 rounded bg-amber-700 text-white text-xs font-semibold"
                        >
                          {locale === 'es'
                            ? 'Incluir dependencias requeridas'
                            : 'Include required dependencies'}
                        </button>
                      </div>
                    )}

                    <div className="rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-3 text-xs space-y-1">
                      <div className="flex justify-between">
                        <span>{locale === 'es' ? 'Total mensual anterior' : 'Previous monthly'}</span>
                        <MoneyCell amount={selectedBreakdown.totalDop} locale={locale} />
                      </div>
                      <div className="flex justify-between font-bold">
                        <span>{locale === 'es' ? 'Nuevo total mensual' : 'New monthly total'}</span>
                        <MoneyCell amount={draftPricePreview.nextTotal} locale={locale} emphasize />
                      </div>
                      <div className="flex justify-between">
                        <span>{locale === 'es' ? 'Diferencia de precio' : 'Price delta'}</span>
                        <span className="font-mono-num font-bold">
                          {draftPricePreview.delta >= 0 ? '+' : ''}RD$
                          {draftPricePreview.delta.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1">
                        {locale === 'es'
                          ? 'Motivo del cambio (obligatorio para Auditoría)'
                          : 'Reason for change (required for Audit)'}
                      </label>
                      <input
                        required
                        value={draftReason}
                        onChange={(e) => setDraftReason(e.target.value)}
                        placeholder={
                          locale === 'es'
                            ? 'Ej. Solicitud del cliente para habilitar Nómina DO'
                            : 'e.g. Client request to activate Payroll DO'
                        }
                        className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm"
                      />
                    </div>
                  </>
                ) : (
                  <div className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30 p-4 space-y-2.5 text-xs">
                    <div className="flex items-center gap-2 font-bold text-sm text-emerald-900 dark:text-emerald-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>
                        {locale === 'es'
                          ? 'Confirmar cambio comercial'
                          : 'Confirm commercial change'}
                      </span>
                    </div>
                    <div>
                      <strong>{locale === 'es' ? 'Empresa afectada:' : 'Company:'}</strong>{' '}
                      {selectedTenant.name} ({selectedTenant.code})
                    </div>
                    <div>
                      <strong>{locale === 'es' ? 'Cambio:' : 'Change:'}</strong>{' '}
                      {locale === 'es'
                        ? draftPricePreview.plan.nameEs
                        : draftPricePreview.plan.nameEn}{' '}
                      · Módulos: {draftModules.join(', ')}
                    </div>
                    <div>
                      <strong>{locale === 'es' ? 'Fecha efectiva:' : 'Effective date:'}</strong>{' '}
                      <span className="font-mono-num">{draftEffectiveDate}</span>
                    </div>
                    <div>
                      <strong>{locale === 'es' ? 'Diferencia de precio:' : 'Price delta:'}</strong>{' '}
                      <span className="font-mono-num font-bold">
                        {draftPricePreview.delta >= 0 ? '+' : ''}RD$
                        {draftPricePreview.delta.toLocaleString()} (Nuevo total RD$
                        {draftPricePreview.nextTotal.toLocaleString()}/mes)
                      </span>
                    </div>
                    <div>
                      <strong>{locale === 'es' ? 'Motivo:' : 'Reason:'}</strong> {draftReason}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 px-4 py-3 border-t border-slate-200 dark:border-slate-800 shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    planConfirmStep ? setPlanConfirmStep(false) : setPlanModalOpen(false)
                  }
                  className="h-9 px-3.5 rounded border border-slate-300 dark:border-slate-700 text-xs font-semibold"
                >
                  {planConfirmStep
                    ? locale === 'es'
                      ? 'Editar'
                      : 'Edit'
                    : locale === 'es'
                      ? 'Cancelar'
                      : 'Cancel'}
                </button>
                {!planConfirmStep ? (
                  <button
                    type="button"
                    disabled={!draftReason.trim() || !draftDependencyCheck.valid}
                    onClick={() => setPlanConfirmStep(true)}
                    className="h-9 px-4 rounded bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-xs font-semibold text-white"
                  >
                    {locale === 'es' ? 'Revisar resumen' : 'Review summary'}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isMutating}
                    onClick={confirmPlanSave}
                    className="h-9 px-4 rounded bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-xs font-semibold text-white"
                  >
                    {locale === 'es' ? 'Confirmar y guardar' : 'Confirm & save'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Suspend / Reactivate Confirmation Modal */}
        {statusModalAction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60">
            <div className="w-full max-w-md rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
                <h2 className="font-display text-base font-bold">
                  {statusModalAction === 'SUSPENDED'
                    ? locale === 'es'
                      ? 'Confirmar suspensión de empresa'
                      : 'Confirm company suspension'
                    : locale === 'es'
                      ? 'Confirmar reactivación de empresa'
                      : 'Confirm company reactivation'}
                </h2>
                <button
                  type="button"
                  onClick={() => setStatusModalAction(null)}
                  className="p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={confirmStatusSave} className="p-4 space-y-3 text-xs">
                <div className="rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-3 space-y-1">
                  <div>
                    <strong>{locale === 'es' ? 'Empresa:' : 'Company:'}</strong>{' '}
                    {selectedTenant.name}
                  </div>
                  <div>
                    <strong>{locale === 'es' ? 'Cambio:' : 'Change:'}</strong>{' '}
                    {pt.tenantStatuses[selectedTenant.status]} →{' '}
                    {pt.tenantStatuses[statusModalAction]}
                  </div>
                  <div className="text-slate-500">
                    {locale === 'es'
                      ? 'Los registros contables, ventas y nóminas históricas de la empresa se conservan intactos.'
                      : 'All tenant historical operational records are preserved.'}
                  </div>
                </div>
                <div>
                  <label className="block font-semibold mb-1">
                    {locale === 'es' ? 'Motivo obligatorio' : 'Mandatory reason'}
                  </label>
                  <input
                    required
                    value={statusReason}
                    onChange={(e) => setStatusReason(e.target.value)}
                    placeholder={
                      statusModalAction === 'SUSPENDED'
                        ? locale === 'es'
                          ? 'Ej. Falta de pago mayor a 15 días'
                          : 'e.g. Overdue invoice > 15 days'
                        : locale === 'es'
                          ? 'Ej. Pago validado por administración'
                          : 'e.g. Payment validated by administration'
                    }
                    className="w-full h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setStatusModalAction(null)}
                    className="h-9 px-3.5 rounded border border-slate-300 dark:border-slate-700 font-semibold"
                  >
                    {locale === 'es' ? 'Cancelar' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={isMutating || !statusReason.trim()}
                    className={`h-9 px-4 rounded font-semibold text-white ${
                      statusModalAction === 'SUSPENDED'
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-emerald-600 hover:bg-emerald-700'
                    }`}
                  >
                    {locale === 'es' ? 'Confirmar' : 'Confirm'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
          {pt.platformNav.tenants}
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          {locale === 'es'
            ? 'Busca, filtra y abre cualquier empresa para asignar plan, activar módulos o gestionar suspensión.'
            : 'Search, filter, and open any company to assign plans, toggle add-ons, or manage suspension.'}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder={
              locale === 'es'
                ? 'Buscar por nombre, EMP-... o RNC…'
                : 'Search by name, code, or RNC…'
            }
            className="w-full h-9 pl-9 pr-3 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as 'ALL' | TenantStatus);
              setPage(1);
            }}
            className="h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs font-semibold"
          >
            <option value="ALL">
              {locale === 'es' ? 'Todos los estados' : 'All statuses'}
            </option>
            <option value="ACTIVE">{pt.tenantStatuses.ACTIVE}</option>
            <option value="TRIAL">{pt.tenantStatuses.TRIAL}</option>
            <option value="SUSPENDED">{pt.tenantStatuses.SUSPENDED}</option>
          </select>

          <select
            value={planFilter}
            onChange={(e) => {
              setPlanFilter(e.target.value);
              setPage(1);
            }}
            className="h-9 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs font-semibold"
          >
            <option value="ALL">
              {locale === 'es' ? 'Todos los planes' : 'All plans'}
            </option>
            {platformState.plans.map((p) => (
              <option key={p.id} value={p.id}>
                {locale === 'es' ? p.nameEs : p.nameEn}
              </option>
            ))}
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={pagedTenants}
        getRowKey={(t) => t.id}
        onRowClick={(t) => setSelectedTenantId(t.id)}
        emptyMessage={
          locale === 'es'
            ? 'No hay empresas que coincidan con el filtro.'
            : 'No matching companies found.'
        }
      />

      {/* Pagination */}
      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
        <span className="font-mono-num">
          {locale === 'es'
            ? `Mostrando ${pagedTenants.length} de ${filteredTenants.length} empresas · Página ${safePage} de ${totalPages}`
            : `Showing ${pagedTenants.length} of ${filteredTenants.length} companies · Page ${safePage} of ${totalPages}`}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={safePage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="inline-flex items-center gap-1 h-8 px-2.5 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-40"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>{locale === 'es' ? 'Anterior' : 'Prev'}</span>
          </button>
          <button
            type="button"
            disabled={safePage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="inline-flex items-center gap-1 h-8 px-2.5 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-40"
          >
            <span>{locale === 'es' ? 'Siguiente' : 'Next'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
