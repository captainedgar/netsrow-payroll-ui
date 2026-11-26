import React, { useMemo } from 'react';
import { ShieldCheck, Wallet } from 'lucide-react';
import { DataTable, DataTableColumn } from '../components/DataTable';
import { ErpPageHeader } from '../components/ErpUiPrimitives';
import { StatusBadge } from '../components/StatusBadge';
import { usePayrollWorkspace } from '../context/PayrollWorkspaceContext';
import { ConceptTreatmentRule, WorkRiskRule } from '../types/erp';

export const PayrollConfigScreen: React.FC = () => {
  const {
    activeScreen,
    setActiveScreen,
    erpState,
    locale,
    t,
    updateWorkRiskRule,
    updateConceptTreatmentRule,
  } = usePayrollWorkspace();

  const mode = useMemo(
    () => (activeScreen === 'concept_treatment' ? 'concepts' : 'work_risk'),
    [activeScreen]
  );

  const branchMap = useMemo(
    () => new Map(erpState.branches.map((b) => [b.id, b.name])),
    [erpState.branches]
  );

  const riskCols: DataTableColumn<WorkRiskRule>[] = [
    {
      key: 'branch',
      header: locale === 'es' ? 'Sucursal' : 'Branch',
      render: (r) => (
        <span className="font-semibold text-xs">{branchMap.get(r.branchId) ?? r.branchId}</span>
      ),
    },
    {
      key: 'dept',
      header: locale === 'es' ? 'Departamento' : 'Department',
      minWidthClass: 'min-w-[200px]',
      render: (r) => (
        <span className="text-xs">{locale === 'es' ? r.departmentEs : r.departmentEn}</span>
      ),
    },
    {
      key: 'level',
      header: locale === 'es' ? 'Nivel SRL' : 'Risk level',
      render: (r) => (
        <select
          value={r.riskLevel}
          onChange={(e) => {
            const lvl = e.target.value as WorkRiskRule['riskLevel'];
            const rate = lvl === 'I' ? 1.1 : lvl === 'II' ? 1.2 : 1.35;
            updateWorkRiskRule({ ...r, riskLevel: lvl, srlRatePercent: rate });
          }}
          className="nr-focus-ring nr-transition h-8 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] px-2 text-xs font-semibold text-[var(--nr-text)]"
        >
          <option value="I">Nivel I (1.10%)</option>
          <option value="II">Nivel II (1.20%)</option>
          <option value="III">Nivel III (1.35%)</option>
        </select>
      ),
    },
    {
      key: 'rate',
      header: locale === 'es' ? 'Tasa patronal SRL' : 'Employer SRL %',
      align: 'right',
      render: (r) => (
        <span className="font-mono-num font-bold text-[var(--nr-primary)]">
          {r.srlRatePercent.toFixed(2)}%
        </span>
      ),
    },
  ];

  const conceptCols: DataTableColumn<ConceptTreatmentRule>[] = [
    {
      key: 'code',
      header: t.common.code,
      render: (c) => <span className="font-mono-num text-xs font-bold">{c.conceptCode}</span>,
    },
    {
      key: 'label',
      header: locale === 'es' ? 'Concepto de nómina' : 'Payroll concept',
      minWidthClass: 'min-w-[200px]',
      render: (c) => (
        <div>
          <div className="font-semibold text-xs text-[var(--nr-text)]">
            {locale === 'es' ? c.labelEs : c.labelEn}
          </div>
          <div className="text-[11px] text-[var(--nr-text-secondary)]">{c.category}</div>
        </div>
      ),
    },
    {
      key: 'tss',
      header: 'TSS (SFS/AFP)',
      render: (c) => (
        <button
          type="button"
          onClick={() => updateConceptTreatmentRule({ ...c, subjectToTss: !c.subjectToTss })}
          className="cursor-pointer"
        >
          <StatusBadge
            label={c.subjectToTss ? (locale === 'es' ? 'Cotizable' : 'Taxable') : 'Exento'}
            tone={c.subjectToTss ? 'emerald' : 'neutral'}
          />
        </button>
      ),
    },
    {
      key: 'isr',
      header: 'ISR DGII',
      render: (c) => (
        <button
          type="button"
          onClick={() => updateConceptTreatmentRule({ ...c, subjectToIsr: !c.subjectToIsr })}
          className="cursor-pointer"
        >
          <StatusBadge
            label={c.subjectToIsr ? (locale === 'es' ? 'Gravado' : 'Taxable') : 'Exento'}
            tone={c.subjectToIsr ? 'emerald' : 'neutral'}
          />
        </button>
      ),
    },
    {
      key: 'infotep',
      header: 'INFOTEP (1%)',
      render: (c) => (
        <button
          type="button"
          onClick={() =>
            updateConceptTreatmentRule({ ...c, subjectToInfotep: !c.subjectToInfotep })
          }
          className="cursor-pointer"
        >
          <StatusBadge
            label={c.subjectToInfotep ? (locale === 'es' ? 'Aplica' : 'Applies') : 'Exento'}
            tone={c.subjectToInfotep ? 'emerald' : 'neutral'}
          />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <ErpPageHeader
        title={mode === 'work_risk' ? t.navigation.workRisk : t.navigation.conceptTreatment}
        subtitle={
          mode === 'work_risk'
            ? locale === 'es'
              ? 'Configuración de tasas de Seguro de Riesgos Laborales (SRL) por sucursal y departamento.'
              : 'Occupational Risk Insurance (SRL) rate rules by branch and department.'
            : locale === 'es'
              ? 'Haz clic en las etiquetas de TSS, ISR o INFOTEP para activar o desactivar la base imponible de cada concepto.'
              : 'Click TSS, ISR, or INFOTEP badges to toggle taxability rules per payroll concept.'
        }
        badge={<StatusBadge label={t.topBar.demoOnlyTag} tone="amber" />}
      />

      <div className="flex items-center gap-1 border-b border-[var(--nr-border)]">
        <button
          type="button"
          onClick={() => setActiveScreen('work_risk')}
          className={`nr-focus-ring nr-transition inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold border-b-2 ${
            mode === 'work_risk'
              ? 'border-[var(--nr-primary)] text-[var(--nr-primary)]'
              : 'border-transparent text-[var(--nr-text-secondary)] hover:text-[var(--nr-text)]'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{t.navigation.workRisk}</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveScreen('concept_treatment')}
          className={`nr-focus-ring nr-transition inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold border-b-2 ${
            mode === 'concepts'
              ? 'border-[var(--nr-primary)] text-[var(--nr-primary)]'
              : 'border-transparent text-[var(--nr-text-secondary)] hover:text-[var(--nr-text)]'
          }`}
        >
          <Wallet className="w-3.5 h-3.5" />
          <span>{t.navigation.conceptTreatment}</span>
        </button>
      </div>

      {mode === 'work_risk' ? (
        <DataTable
          columns={riskCols}
          rows={erpState.workRiskRules}
          getRowKey={(r) => r.id}
          emptyMessage={t.common.noResults}
        />
      ) : (
        <DataTable
          columns={conceptCols}
          rows={erpState.conceptTreatmentRules}
          getRowKey={(c) => c.id}
          emptyMessage={t.common.noResults}
        />
      )}
    </div>
  );
};
