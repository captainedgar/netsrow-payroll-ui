import { ActivityFeedItem, ActivityStatusType, ErpDemoState } from '../types/erp';
import {
  Employee,
  Locale,
  PayrollNovelty,
  PayrollPeriod,
  PayrollRun,
} from '../types/payroll';
import { SaasModuleCode, TenantStatus } from '../types/platform';

function normalizeTimestamp(raw: string): string {
  const trimmed = raw.trim();
  if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}/.test(trimmed)) {
    return trimmed.slice(0, 16);
  }
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(trimmed)) {
    return `${trimmed.slice(0, 10)} ${trimmed.slice(11, 16)}`;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return `${trimmed} 00:00`;
  }
  return trimmed;
}

function formatMoney(amount: number, locale: Locale): string {
  return `RD$${new Intl.NumberFormat(locale === 'es' ? 'es-DO' : 'en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)}`;
}

function getRunStatusMeta(run: PayrollRun): {
  statusType: ActivityStatusType;
  badgeLabelEs: string;
  badgeLabelEn: string;
  badgeTone: ActivityFeedItem['badgeTone'];
  badgeIcon: ActivityFeedItem['badgeIcon'];
} {
  if (run.condition === 'APPROVED') {
    return {
      statusType: 'approved',
      badgeLabelEs: 'Aprobada',
      badgeLabelEn: 'Approved',
      badgeTone: 'emerald',
      badgeIcon: 'approved',
    };
  }
  if (run.condition === 'READY_FOR_FINAL_REVIEW') {
    return {
      statusType: 'ready',
      badgeLabelEs: 'Lista para revisión final',
      badgeLabelEn: 'Ready for final review',
      badgeTone: 'emerald',
      badgeIcon: 'ready',
    };
  }
  if (run.condition === 'INCOMPLETE_CHECKS') {
    return {
      statusType: 'incomplete',
      badgeLabelEs: 'Validación incompleta',
      badgeLabelEn: 'Incomplete checks',
      badgeTone: 'crimson',
      badgeIcon: 'warning',
    };
  }
  return {
    statusType: 'pending',
    badgeLabelEs: 'Simulación',
    badgeLabelEn: 'Simulated',
    badgeTone: 'amber',
    badgeIcon: 'review',
  };
}

export interface BuildRecentActivityParams {
  periods: PayrollPeriod[];
  employees: Employee[];
  novelties: PayrollNovelty[];
  erpState: ErpDemoState;
  canViewSalaryHistory: boolean;
  enabledModules?: SaasModuleCode[];
  tenantStatus?: TenantStatus;
}

export function buildRecentActivityFeed({
  periods,
  employees,
  novelties,
  erpState,
  canViewSalaryHistory,
  enabledModules,
  tenantStatus = 'ACTIVE',
}: BuildRecentActivityParams): ActivityFeedItem[] {
  const items: ActivityFeedItem[] = [];
  const hasPayrollModule = !enabledModules || enabledModules.includes('PAYROLL');
  const hasInventoryModule =
    !enabledModules || enabledModules.includes('INVENTORY_CATALOG');
  const hasPosModule = !enabledModules || enabledModules.includes('POS_CASHBOX');

  const employeeById = new Map(employees.map((e) => [e.id, e]));
  const periodById = new Map(periods.map((p) => [p.id, p]));

  // 1. Payroll Runs (executed & approved runs chronologically)
  if (hasPayrollModule) {
    periods.forEach((period) => {
      period.runs.forEach((run) => {
        const meta = getRunStatusMeta(run);
        const eventTimestamp = run.approvedAt ?? run.executedAt;
        const actor = run.approvedBy ?? run.executedBy;

        const amountSummaryEs =
          run.calculatedNetTotal !== null
            ? `Neto: ${formatMoney(run.calculatedNetTotal, 'es')}`
            : run.provisionalSubtotalTotal !== null
              ? `Subtotal provisional: ${formatMoney(run.provisionalSubtotalTotal, 'es')}`
              : 'Sin importes calculados';

        const amountSummaryEn =
          run.calculatedNetTotal !== null
            ? `Net pay: ${formatMoney(run.calculatedNetTotal, 'en')}`
            : run.provisionalSubtotalTotal !== null
              ? `Provisional subtotal: ${formatMoney(run.provisionalSubtotalTotal, 'en')}`
              : 'Pending calculation';

        items.push({
          id: `act-run-${run.id}`,
          category: 'PAYROLL_RUN',
          statusType: meta.statusType,
          sortTimestamp: normalizeTimestamp(eventTimestamp),
          displayTime: eventTimestamp,
          periodCode: period.code,
          titleEs:
            run.condition === 'APPROVED'
              ? `Corrida #${run.runNumber} aprobada · ${period.nameEs}`
              : run.phase === 'STATUTORY_REVIEW'
                ? `Revisión TSS e ISR #${run.runNumber} · ${period.nameEs}`
                : `Simulación de nómina #${run.runNumber} · ${period.nameEs}`,
          titleEn:
            run.condition === 'APPROVED'
              ? `Payroll Run #${run.runNumber} approved · ${period.nameEn}`
              : run.phase === 'STATUTORY_REVIEW'
                ? `TSS & ISR Review #${run.runNumber} · ${period.nameEn}`
                : `Payroll Simulation #${run.runNumber} · ${period.nameEn}`,
          descriptionEs: `${run.employeeCount} colaboradores · ${amountSummaryEs}${
            run.incidencesCount > 0
              ? ` · ${run.incidencesCount} incidencia(s)`
              : ''
          }`,
          descriptionEn: `${run.employeeCount} employees · ${amountSummaryEn}${
            run.incidencesCount > 0 ? ` · ${run.incidencesCount} incidence(s)` : ''
          }`,
          actorOrSubject: actor,
          badgeLabelEs: meta.badgeLabelEs,
          badgeLabelEn: meta.badgeLabelEn,
          badgeTone: meta.badgeTone,
          badgeIcon: meta.badgeIcon,
          targetScreen: 'payroll_review',
          periodId: period.id,
          runId: run.id,
        });
      });

      // Draft period waiting for first run
      if (period.status === 'DRAFT' && period.runs.length === 0) {
        items.push({
          id: `act-period-draft-${period.id}`,
          category: 'PAYROLL_RUN',
          statusType: 'draft',
          sortTimestamp: normalizeTimestamp(`${period.startDate} 08:30`),
          displayTime: period.startDate,
          periodCode: period.code,
          titleEs: `Período abierto en borrador · ${period.nameEs}`,
          titleEn: `Draft payroll period opened · ${period.nameEn}`,
          descriptionEs: `${period.employeeCount} colaboradores asignados. Pendiente de enviar a revisión y simular.`,
          descriptionEn: `${period.employeeCount} assigned employees. Ready for novelties and review.`,
          actorOrSubject: erpState.company.name,
          badgeLabelEs: 'Borrador',
          badgeLabelEn: 'Draft',
          badgeTone: 'neutral',
          badgeIcon: 'draft',
          targetScreen: 'periods',
          periodId: period.id,
        });
      }
    });

    // 2. Employee Updates (salary history adjustments, status changes, and novelties)
    employees.forEach((emp) => {
      emp.salaryHistory.forEach((sal) => {
        const diff = sal.newSalary - sal.previousSalary;
        const pct =
          sal.previousSalary > 0
            ? Math.round((diff / sal.previousSalary) * 100)
            : 0;
        items.push({
          id: `act-sal-${emp.id}-${sal.id}`,
          category: 'EMPLOYEE_UPDATE',
          statusType: 'approved',
          sortTimestamp: normalizeTimestamp(`${sal.effectiveDate} 09:00`),
          displayTime: sal.effectiveDate,
          periodCode: sal.effectiveDate.slice(0, 7),
          titleEs: `Actualización salarial · ${emp.fullName} (${emp.code})`,
          titleEn: `Salary update · ${emp.fullName} (${emp.code})`,
          descriptionEs: canViewSalaryHistory
            ? `${sal.reasonEs} · ${formatMoney(sal.previousSalary, 'es')} → ${formatMoney(sal.newSalary, 'es')} (+${pct}%)`
            : `${sal.reasonEs} · Detalle monetario restringido por permisos`,
          descriptionEn: canViewSalaryHistory
            ? `${sal.reasonEn} · ${formatMoney(sal.previousSalary, 'en')} → ${formatMoney(sal.newSalary, 'en')} (+${pct}%)`
            : `${sal.reasonEn} · Monetary detail restricted by role permissions`,
          actorOrSubject: sal.authorizedBy,
          badgeLabelEs: 'Ajuste salarial',
          badgeLabelEn: 'Salary update',
          badgeTone: 'emerald',
          badgeIcon: 'ready',
          targetScreen: 'employees',
          employeeId: emp.id,
        });
      });

      if (emp.status !== 'ACTIVE') {
        items.push({
          id: `act-emp-status-${emp.id}`,
          category: 'EMPLOYEE_UPDATE',
          statusType: emp.status === 'LEAVE' ? 'leave' : 'alert',
          sortTimestamp: normalizeTimestamp('2026-11-15 08:00'),
          displayTime: '2026-11-15',
          periodCode: '2026-11',
          titleEs: `Estado laboral · ${emp.fullName} (${emp.code})`,
          titleEn: `Employee status · ${emp.fullName} (${emp.code})`,
          descriptionEs: `${emp.positionEs} · ${emp.departmentEs}`,
          descriptionEn: `${emp.positionEn} · ${emp.departmentEn}`,
          actorOrSubject: emp.code,
          badgeLabelEs: emp.status === 'LEAVE' ? 'En licencia' : 'Suspendido',
          badgeLabelEn: emp.status === 'LEAVE' ? 'On leave' : 'Suspended',
          badgeTone: emp.status === 'LEAVE' ? 'amber' : 'crimson',
          badgeIcon: emp.status === 'LEAVE' ? 'review' : 'warning',
          targetScreen: 'employees',
          employeeId: emp.id,
        });
      }
    });

    // Payroll Novelties (most recent employee earning/deduction updates)
    novelties.forEach((nov) => {
      const emp = employeeById.get(nov.employeeId);
      const period = periodById.get(nov.periodId);
      if (!emp) return;
      const sign = nov.category === 'EARNING' ? '+' : '-';
      items.push({
        id: `act-nov-${nov.id}`,
        category: 'EMPLOYEE_UPDATE',
        statusType: nov.category === 'EARNING' ? 'update' : 'pending',
        sortTimestamp: normalizeTimestamp(`${nov.date} 11:30`),
        displayTime: nov.date,
        periodCode: period?.code ?? nov.date.slice(0, 7),
        titleEs: `Novedad registrada · ${emp.fullName} (${emp.code})`,
        titleEn: `Payroll adjustment · ${emp.fullName} (${emp.code})`,
        descriptionEs: `${nov.noteEs} · ${sign}${formatMoney(nov.amount, 'es')} (${period?.nameEs ?? nov.periodId})`,
        descriptionEn: `${nov.noteEn} · ${sign}${formatMoney(nov.amount, 'en')} (${period?.nameEn ?? nov.periodId})`,
        actorOrSubject: emp.departmentEs,
        badgeLabelEs: nov.category === 'EARNING' ? 'Ingreso' : 'Deducción',
        badgeLabelEn: nov.category === 'EARNING' ? 'Earning' : 'Deduction',
        badgeTone: nov.category === 'EARNING' ? 'navy' : 'amber',
        badgeIcon: 'draft',
        targetScreen: 'novelties',
        periodId: nov.periodId,
        employeeId: emp.id,
      });
    });

    // 3. System Alerts — Payroll compliance incidences across active/latest runs
    periods.forEach((period) => {
      const currentRun =
        period.runs.find((r) => r.id === period.currentRunId) ?? period.runs[0];
      if (!currentRun) return;
      currentRun.breakdowns
        .filter((b) => b.complianceFlag !== 'OK')
        .forEach((b) => {
          const isHigh = b.complianceFlag === 'IR3_WARNING';
          items.push({
            id: `act-alert-pay-${period.id}-${b.employeeId}`,
            category: 'SYSTEM_ALERT',
            statusType: isHigh ? 'alert' : 'warning',
            sortTimestamp: normalizeTimestamp(currentRun.executedAt),
            displayTime: currentRun.executedAt,
            periodCode: period.code,
            titleEs: `Incidencia en nómina · ${b.employeeName} (${b.employeeCode})`,
            titleEn: `Payroll alert · ${b.employeeName} (${b.employeeCode})`,
            descriptionEs:
              b.incidenceNoteEs ??
              `Observación detectada en ${period.nameEs}.`,
            descriptionEn:
              b.incidenceNoteEn ??
              `Compliance flag detected in ${period.nameEn}.`,
            actorOrSubject: `TSS / DGII · ${period.code}`,
            badgeLabelEs: isHigh ? 'Alerta IR-3' : 'TSS pendiente',
            badgeLabelEn: isHigh ? 'IR-3 Alert' : 'TSS Pending',
            badgeTone: isHigh ? 'crimson' : 'amber',
            badgeIcon: 'warning',
            targetScreen: 'payroll_review',
            periodId: period.id,
            runId: currentRun.id,
            employeeId: b.employeeId,
          });
        });
    });
  }

  // 3b. System Alerts — Low-stock inventory alerts & recent manual adjustments
  if (hasInventoryModule) {
    erpState.products
      .filter((p) => p.active && p.stock <= p.minStock)
      .forEach((prod) => {
        const critical = prod.stock <= Math.max(4, Math.floor(prod.minStock * 0.4));
        items.push({
          id: `act-alert-stock-${prod.id}`,
          category: 'SYSTEM_ALERT',
          statusType: critical ? 'alert' : 'warning',
          sortTimestamp: normalizeTimestamp('2026-11-22 10:15'),
          displayTime: '2026-11-22 10:15',
          titleEs: `Alerta de inventario · ${prod.nameEs} (${prod.sku})`,
          titleEn: `Inventory alert · ${prod.nameEn} (${prod.sku})`,
          descriptionEs: `Existencia actual: ${prod.stock} uds (mínimo configurado: ${prod.minStock} uds).`,
          descriptionEn: `Current stock: ${prod.stock} units (configured minimum: ${prod.minStock} units).`,
          actorOrSubject: 'Inventario',
          badgeLabelEs: critical ? 'Stock crítico' : 'Stock bajo',
          badgeLabelEn: critical ? 'Critical stock' : 'Low stock',
          badgeTone: critical ? 'crimson' : 'amber',
          badgeIcon: 'warning',
          targetScreen: 'inventory_alerts',
        });
      });

    erpState.inventoryMovements
      .filter((m) => m.type === 'ADJUSTMENT_IN' || m.type === 'ADJUSTMENT_OUT')
      .slice(0, 4)
      .forEach((mov) => {
        const prod = erpState.products.find((p) => p.id === mov.productId);
        items.push({
          id: `act-alert-mov-${mov.id}`,
          category: 'SYSTEM_ALERT',
          statusType: mov.type === 'ADJUSTMENT_OUT' ? 'warning' : 'draft',
          sortTimestamp: normalizeTimestamp(mov.date),
          displayTime: mov.date,
          titleEs: `Ajuste de stock · ${prod?.nameEs ?? mov.productId} (${mov.quantityDelta > 0 ? `+${mov.quantityDelta}` : mov.quantityDelta})`,
          titleEn: `Stock adjustment · ${prod?.nameEn ?? mov.productId} (${mov.quantityDelta > 0 ? `+${mov.quantityDelta}` : mov.quantityDelta})`,
          descriptionEs: `${mov.reasonEs} · Existencia resultante: ${mov.stockAfter} uds (${mov.reference})`,
          descriptionEn: `${mov.reasonEn} · Resulting stock: ${mov.stockAfter} units (${mov.reference})`,
          actorOrSubject: mov.actorName,
          badgeLabelEs: 'Ajuste inventario',
          badgeLabelEn: 'Stock adjust',
          badgeTone: mov.type === 'ADJUSTMENT_OUT' ? 'amber' : 'neutral',
          badgeIcon: 'draft',
          targetScreen: 'inventory_movements',
        });
      });
  }

  // 3c. System Alerts — Cashbox closed or closing variance
  if (hasPosModule) {
    const openSession = erpState.cashSessions.find((s) => s.status === 'OPEN');
    if (!openSession) {
      items.push({
        id: 'act-alert-cashbox-closed',
        category: 'SYSTEM_ALERT',
        statusType: 'locked',
        sortTimestamp: normalizeTimestamp('2026-11-24 08:00'),
        displayTime: '2026-11-24 08:00',
        titleEs: 'Caja registradora cerrada para el turno actual',
        titleEn: 'Cash register closed for current shift',
        descriptionEs:
          'Se requiere apertura de caja para registrar ventas en efectivo desde el POS.',
        descriptionEn:
          'Register opening is required before processing cash sales in POS.',
        actorOrSubject: 'POS / Caja',
        badgeLabelEs: 'Caja cerrada',
        badgeLabelEn: 'Register closed',
        badgeTone: 'amber',
        badgeIcon: 'lock',
        targetScreen: 'cashbox_shift',
      });
    }

    erpState.cashSessions
      .filter((s) => s.status === 'CLOSED' && s.variance !== null && s.variance !== 0)
      .forEach((s) => {
        const closedStamp = s.closedAt ?? s.openedAt;
        items.push({
          id: `act-alert-cashvar-${s.id}`,
          category: 'SYSTEM_ALERT',
          statusType: 'alert',
          sortTimestamp: normalizeTimestamp(closedStamp),
          displayTime: closedStamp,
          titleEs: `Descuadre en cierre de caja · ${s.cashierName}`,
          titleEn: `Cash register closing variance · ${s.cashierName}`,
          descriptionEs: `Diferencia detectada de ${formatMoney(s.variance ?? 0, 'es')} respecto al esperado.`,
          descriptionEn: `Detected variance of ${formatMoney(s.variance ?? 0, 'en')} vs. expected cash.`,
          actorOrSubject: s.cashierName,
          badgeLabelEs: 'Diferencia caja',
          badgeLabelEn: 'Cash variance',
          badgeTone: 'crimson',
          badgeIcon: 'warning',
          targetScreen: 'cashbox_closing',
        });
      });
  }

  // 3d. Tenant SaaS subscription notice if TRIAL or SUSPENDED
  if (tenantStatus !== 'ACTIVE') {
    items.push({
      id: `act-alert-tenant-${tenantStatus}`,
      category: 'SYSTEM_ALERT',
      statusType: tenantStatus === 'TRIAL' ? 'pending' : 'alert',
      sortTimestamp: normalizeTimestamp('2026-11-24 09:00'),
      displayTime: '2026-11-24',
      titleEs:
        tenantStatus === 'TRIAL'
          ? 'Suscripción en período de prueba SaaS'
          : 'Suscripción suspendida temporalmente',
      titleEn:
        tenantStatus === 'TRIAL'
          ? 'Tenant subscription in SaaS trial'
          : 'Tenant subscription temporarily suspended',
      descriptionEs:
        tenantStatus === 'TRIAL'
          ? 'La empresa opera en evaluación comercial con módulos activos según plan.'
          : 'Algunas operaciones pueden estar limitadas hasta confirmar pago.',
      descriptionEn:
        tenantStatus === 'TRIAL'
          ? 'Company operates on an active trial with contracted modules enabled.'
          : 'Operations may be restricted pending billing confirmation.',
      actorOrSubject: 'NetsRow SaaS',
      badgeLabelEs: tenantStatus === 'TRIAL' ? 'Prueba' : 'Suspendida',
      badgeLabelEn: tenantStatus === 'TRIAL' ? 'Trial' : 'Suspended',
      badgeTone: tenantStatus === 'TRIAL' ? 'amber' : 'crimson',
      badgeIcon: tenantStatus === 'TRIAL' ? 'review' : 'lock',
      targetScreen: 'company',
    });
  }

  // Sort strictly newest-first (descending by YYYY-MM-DD HH:mm)
  items.sort((a, b) => b.sortTimestamp.localeCompare(a.sortTimestamp));

  return items;
}
