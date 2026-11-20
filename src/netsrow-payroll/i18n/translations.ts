import {
  DemoRoleKey,
  EmployeeStatus,
  Locale,
  NoveltyCategory,
  NoveltyConceptCode,
  PeriodStatus,
  RunCondition,
  RunPhase,
} from '../types/payroll';

export interface Translations {
  brandName: string;
  brandSubtitle: string;
  entityName: string;
  entityRnc: string;
  navigation: {
    operationSection: string;
    financeSection: string;
    payrollGroup: string;
    payrollConfigSection: string;
    settingsSection: string;
    overview: string;
    pos: string;
    salesAr: string;
    customers: string;
    cashbox: string;
    inventory: string;
    catalog: string;
    internalDocs: string;
    accounting: string;
    periods: string;
    employees: string;
    novelties: string;
    payrollReview: string;
    runHistory: string;
    workRisk: string;
    conceptTreatment: string;
    business: string;
    company: string;
    branches: string;
    usersRoles: string;
    collapseSidebar: string;
    expandSidebar: string;
    openMenu: string;
  };
  topBar: {
    entityLabel: string;
    activePeriodLabel: string;
    noPeriodSelected: string;
    demoControlBadge: string;
    demoRoleLabel: string;
    roleAdmin: string;
    roleSupervisor: string;
    roleTitleAdmin: string;
    roleTitleSupervisor: string;
    languageLabel: string;
    themeLight: string;
    themeDark: string;
    openBreakdown: string;
    simBannerPrefix: string;
    statutoryBannerPrefix: string;
    approvedBannerPrefix: string;
    draftBannerPrefix: string;
  };
  common: {
    pending: string;
    pendingShort: string;
    readOnly: string;
    editable: string;
    search: string;
    all: string;
    save: string;
    cancel: string;
    edit: string;
    delete: string;
    add: string;
    close: string;
    viewDetails: string;
    openPeriod: string;
    noResults: string;
    loading: string;
    activeRun: string;
    historicalRun: string;
    backToPeriods: string;
    backToReview: string;
    employeesCount: string;
    date: string;
    status: string;
    actions: string;
    amount: string;
    employee: string;
    code: string;
    cedula: string;
    department: string;
    notes: string;
    daysSuffix: string;
  };
  statuses: Record<PeriodStatus, string>;
  runPhases: Record<RunPhase, string>;
  runConditions: Record<RunCondition, string>;
  employeeStatuses: Record<EmployeeStatus, string>;
  noveltyCategories: Record<NoveltyCategory, string>;
  noveltyConcepts: Record<NoveltyConceptCode, string>;
  periodsScreen: {
    title: string;
    subtitle: string;
    monthlyOnlyNote: string;
    periodColumn: string;
    dateRangeColumn: string;
    noveltiesColumn: string;
    runStateColumn: string;
    provisionalSubtotal: string;
    calculatedNet: string;
    filterStatus: string;
    openInReview: string;
    viewNovelties: string;
    activeSelected: string;
    totalPeriods: string;
    draftPeriods: string;
    inReviewPeriods: string;
    approvedPeriods: string;
  };
  employeesScreen: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    hireDate: string;
    baseSalary: string;
    tssCoverage: string;
    tssRegistered: string;
    tssPending: string;
    inspectRecord: string;
    totalEmployees: string;
    activeEmployees: string;
    onLeaveOrSuspended: string;
    dossierTitle: string;
    dossierSubtitle: string;
    generalProfileTitle: string;
    salaryHistoryTitle: string;
    isrBackgroundTitle: string;
    positionLabel: string;
    afpLabel: string;
    arsLabel: string;
    noSalaryHistory: string;
    noIsrBackground: string;
  };
  noveltiesScreen: {
    title: string;
    subtitle: string;
    addNovelty: string;
    editNovelty: string;
    draftEditableBanner: string;
    reviewLockedBanner: string;
    approvedLockedBanner: string;
    periodSelectorLabel: string;
    filterEmployeeOrConcept: string;
    concept: string;
    category: string;
    selectEmployee: string;
    amountPlaceholder: string;
    noteLabel: string;
    emptyState: string;
    earningsTotal: string;
    deductionsTotal: string;
    recordsCount: string;
    goToReviewCta: string;
  };
  reviewScreen: {
    breadcrumbModule: string;
    breadcrumbPeriods: string;
    breadcrumbReview: string;
    titlePrefix: string;
    monthlyPeriodTag: string;
    statusLabel: string;
    runTypeLabel: string;
    workflowStepperTitle: string;
    stepDraft: string;
    stepInReview: string;
    stepSimulation: string;
    stepStatutory: string;
    stepApprove: string;
    ctaSendToReview: string;
    ctaReturnToDraft: string;
    ctaSimulate: string;
    ctaCalculateStatutory: string;
    ctaApprovePayroll: string;
    simulating: string;
    calculatingStatutory: string;
    approving: string;
    tabs: {
      all: string;
      simulation: string;
      statutory: string;
      breakdown: string;
      history: string;
    };
    kpiEmployeesIncluded: string;
    kpiIncidences: string;
    kpiIncidencesDetected: string;
    kpiIncidencesNone: string;
    kpiProvisionalSubtotal: string;
    kpiWorkerDeductions: string;
    kpiEmployerContributions: string;
    kpiCalculatedNet: string;
    preLegalBadge: string;
    pendingTssIsrNote: string;
    noRunYetTitle: string;
    noRunYetDesc: string;
    historicalBannerTitle: string;
    historicalBannerDesc: string;
    selectCurrentRunBtn: string;
    approvedBannerTitle: string;
    approvedBannerDesc: string;
    readyConditionBanner: string;
    incompleteConditionBanner: string;
    approvalBlockedPermission: string;
    approvalBlockedHistorical: string;
    approvalBlockedIncomplete: string;
    simulationSummaryTitle: string;
    simulationSummaryDesc: string;
    statutorySummaryTitle: string;
    statutorySummaryDesc: string;
    statutoryChecksTitle: string;
    workerDeductionsTitle: string;
    employerContributionsTitle: string;
    breakdownSectionTitle: string;
    historyTitle: string;
    historyEmpty: string;
    runLabel: string;
    executedBy: string;
    approvedBy: string;
    inspectRun: string;
    currentlyViewing: string;
    breakdownSearchPlaceholder: string;
    showOnlyIncidences: string;
    colEmployee: string;
    colBaseCalc: string;
    colExtraEarnings: string;
    colRegDeductions: string;
    colProvisional: string;
    colWorkerDed: string;
    colEmployerContrib: string;
    colNet: string;
    viewHistoryLink: string;
    deferredOpsTitle: string;
    deferredOpsDesc: string;
    deferredPayment: string;
    deferredExports: string;
    deferredAccounting: string;
  };
  breakdownPanel: {
    title: string;
    subtitle: string;
    noEmployeeSelected: string;
    tabPayroll: string;
    tabSalaryHistory: string;
    tabIsrBackground: string;
    section1Title: string;
    section1Badge: string;
    registeredMonthlySalary: string;
    trancheAmount: string;
    subtotalCalculatedSalary: string;
    section2Title: string;
    recordsSuffix: string;
    noNoveltiesForEmployee: string;
    section3Title: string;
    provisionalBeforeRetentions: string;
    provisionalFormulaHint: string;
    tssEmployeeTitle: string;
    tssEmployeeFormula: string;
    isrDgiiTitle: string;
    isrDgiiFormula: string;
    sfsEmployee: string;
    afpEmployee: string;
    isrWithheld: string;
    workerDeductionsTotal: string;
    employerSectionTitle: string;
    employerFormula: string;
    employerBadgeInformative: string;
    employerBadgeComputed: string;
    sfsEmployer: string;
    afpEmployer: string;
    srlEmployer: string;
    infotepEmployer: string;
    employerContributionsTotal: string;
    calculatedNet: string;
    pendingCalculationBadge: string;
    pendingStatutoryNote: string;
    pendingSimulationNote: string;
    isrExemptNote: string;
    approvedReadOnlyNote: string;
    permissionRestrictedTitle: string;
    permissionRestrictedSalary: string;
    permissionRestrictedIsr: string;
    previousSalary: string;
    newSalary: string;
    taxableIncome: string;
    withheldIsr: string;
  };
  placeholderScreen: {
    referenceBadge: string;
    descriptionPrefix: string;
    returnToPayroll: string;
    openPeriods: string;
    modules: Record<
      | 'overview'
      | 'pos'
      | 'sales_ar'
      | 'customers'
      | 'cashbox'
      | 'inventory'
      | 'catalog'
      | 'internal_docs'
      | 'accounting'
      | 'work_risk'
      | 'concept_treatment'
      | 'business'
      | 'company'
      | 'branches'
      | 'users_roles',
      { title: string; summary: string; capabilities: string[] }
    >;
  };
}

export const TRANSLATIONS: Record<Locale, Translations> = {
  es: {
    brandName: 'NetsRow',
    brandSubtitle: 'NETSROW ERP · ERP SUITE',
    entityName: 'Grupo Ramos, S.A.',
    entityRnc: 'RNC 1-01-08532-4',
    navigation: {
      operationSection: 'Operación',
      financeSection: 'Finanzas',
      payrollGroup: 'Nómina',
      payrollConfigSection: 'Configuración',
      settingsSection: 'Configuración',
      overview: 'Inicio',
      pos: 'POS',
      salesAr: 'Ventas',
      customers: 'Clientes',
      cashbox: 'Caja',
      inventory: 'Inventario',
      catalog: 'Catálogo',
      internalDocs: 'Documentos internos',
      accounting: 'Contabilidad',
      periods: 'Períodos',
      employees: 'Empleados',
      novelties: 'Novedades',
      payrollReview: 'Revisión de nómina',
      runHistory: 'Historial de corridas',
      workRisk: 'Riesgo laboral',
      conceptTreatment: 'Tratamiento conceptos',
      business: 'Negocio',
      company: 'Empresa',
      branches: 'Sucursales',
      usersRoles: 'Usuarios y Roles',
      collapseSidebar: 'Contraer menú',
      expandSidebar: 'Expandir menú',
      openMenu: 'Abrir navegación',
    },
    topBar: {
      entityLabel: 'Entidad',
      activePeriodLabel: 'Período',
      noPeriodSelected: 'Sin período seleccionado',
      demoControlBadge: 'Control demo',
      demoRoleLabel: 'Perfil demo',
      roleAdmin: 'Admin Nómina (Demo)',
      roleSupervisor: 'Consulta (Sin historial/aprobación)',
      roleTitleAdmin: 'Encargada de Nómina',
      roleTitleSupervisor: 'Consulta (Solo lectura)',
      languageLabel: 'Idioma',
      themeLight: 'Claro',
      themeDark: 'Oscuro',
      openBreakdown: 'Desglose de nómina',
      simBannerPrefix: 'SIMULACIÓN ACTIVA',
      statutoryBannerPrefix: 'REVISIÓN TSS E ISR',
      approvedBannerPrefix: 'NÓMINA APROBADA',
      draftBannerPrefix: 'PERÍODO EN BORRADOR',
    },
    common: {
      pending: 'Pendiente de cálculo',
      pendingShort: 'Pendiente',
      readOnly: 'Solo lectura',
      editable: 'Editable',
      search: 'Buscar',
      all: 'Todos',
      save: 'Guardar',
      cancel: 'Cancelar',
      edit: 'Editar',
      delete: 'Eliminar',
      add: 'Agregar',
      close: 'Cerrar',
      viewDetails: 'Ver detalle',
      openPeriod: 'Abrir en revisión',
      noResults: 'No se encontraron registros con los filtros aplicados.',
      loading: 'Procesando solicitud…',
      activeRun: 'VIGENTE',
      historicalRun: 'HISTÓRICA',
      backToPeriods: 'Ir a Períodos',
      backToReview: 'Ir a Revisión de nómina',
      employeesCount: 'colaboradores',
      date: 'Fecha',
      status: 'Estado',
      actions: 'Acciones',
      amount: 'Importe',
      employee: 'Empleado',
      code: 'Código',
      cedula: 'Cédula',
      department: 'Departamento',
      notes: 'Observaciones',
      daysSuffix: 'días',
    },
    statuses: {
      DRAFT: 'Borrador',
      IN_REVIEW: 'En revisión',
      APPROVED: 'Aprobada',
    },
    runPhases: {
      SIMULATED: 'Simulación',
      STATUTORY_REVIEW: 'Revisión TSS e ISR',
    },
    runConditions: {
      SIMULATION_COMPLETED: 'Simulación Vigente',
      INCOMPLETE_CHECKS: 'Revisión TSS e ISR incompleta',
      READY_FOR_FINAL_REVIEW: 'Lista para revisión final',
      APPROVED: 'Aprobada',
    },
    employeeStatuses: {
      ACTIVE: 'Activo',
      LEAVE: 'Licencia',
      SUSPENDED: 'Suspendido',
    },
    noveltyCategories: {
      EARNING: 'Ingreso',
      DEDUCTION: 'Deducción',
    },
    noveltyConcepts: {
      OVERTIME_35: 'Horas extras diurnas (35%)',
      COMMISSION: 'Comisión por ventas',
      PERFORMANCE_BONUS: 'Bono de productividad',
      LOAN_DEDUCTION: 'Descuento Cooperativa NetsRow',
      UNPAID_ABSENCE: 'Ausencia no remunerada',
      TRANSPORT_ALLOWANCE: 'Subsidio de transporte',
    },
    periodsScreen: {
      title: 'Períodos mensuales de nómina',
      subtitle:
        'Listado exclusivamente mensual de ciclos de nómina. Abre un período para enlazar con Revisión de nómina o gestionar novedades.',
      monthlyOnlyNote: 'Períodos exclusivamente mensuales (RD)',
      periodColumn: 'Período mensual',
      dateRangeColumn: 'Rango de fechas',
      noveltiesColumn: 'Novedades',
      runStateColumn: 'Condición de corrida vigente',
      provisionalSubtotal: 'Subtotal provisional',
      calculatedNet: 'Neto calculado',
      filterStatus: 'Filtrar estado',
      openInReview: 'Abrir en revisión',
      viewNovelties: 'Novedades',
      activeSelected: 'Seleccionado',
      totalPeriods: 'Períodos mensuales',
      draftPeriods: 'En borrador',
      inReviewPeriods: 'En revisión',
      approvedPeriods: 'Aprobados',
    },
    employeesScreen: {
      title: 'Empleados y expediente',
      subtitle:
        'Busca por código (EMP-...) o nombre. Selecciona un colaborador para ver su expediente, historial salarial, antecedentes ISR y «Desglose de nómina».',
      searchPlaceholder: 'Buscar por código (EMP-...) o nombre…',
      hireDate: 'Fecha de ingreso',
      baseSalary: 'Salario base mensual',
      tssCoverage: 'Afiliación TSS',
      tssRegistered: 'Inscrito TSS',
      tssPending: 'Pendiente TSS',
      inspectRecord: 'Ver expediente',
      totalEmployees: 'Total en plantilla',
      activeEmployees: 'Activos en nómina',
      onLeaveOrSuspended: 'Licencia / Suspendidos',
      dossierTitle: 'Expediente del colaborador seleccionado',
      dossierSubtitle:
        'Ficha laboral, historial salarial y antecedentes de ISR visibles según los permisos de sesión.',
      generalProfileTitle: 'Ficha general y afiliación TSS',
      salaryHistoryTitle: 'Historial salarial',
      isrBackgroundTitle: 'Antecedentes de ISR (DGII / IR-3)',
      positionLabel: 'Cargo',
      afpLabel: 'AFP',
      arsLabel: 'ARS',
      noSalaryHistory: 'Sin movimientos salariales previos registrados.',
      noIsrBackground: 'Sin antecedentes de ISR registrados.',
    },
    noveltiesScreen: {
      title: 'Novedades del período',
      subtitle:
        'Crea y edita novedades cuando el período está en Borrador; consúltalas en solo lectura cuando pasa a En revisión o Aprobada.',
      addNovelty: 'Registrar novedad',
      editNovelty: 'Editar novedad',
      draftEditableBanner:
        'Período en Borrador: puedes crear, editar o eliminar novedades. La simulación se ejecuta explícitamente en Revisión de nómina.',
      reviewLockedBanner:
        'Período En revisión: las novedades se muestran en solo lectura durante la evaluación de corridas.',
      approvedLockedBanner:
        'Período Aprobado: cerrado en solo lectura definitiva. No se admiten cambios.',
      periodSelectorLabel: 'Período mensual',
      filterEmployeeOrConcept: 'Filtrar por código, nombre o concepto…',
      concept: 'Concepto',
      category: 'Tipo',
      selectEmployee: 'Seleccionar empleado',
      amountPlaceholder: '0.00',
      noteLabel: 'Detalle / Justificación',
      emptyState: 'No hay novedades registradas para este período mensual.',
      earningsTotal: 'Total ingresos variables',
      deductionsTotal: 'Total deducciones variables',
      recordsCount: 'Novedades registradas',
      goToReviewCta: 'Ir a Revisión de nómina',
    },
    reviewScreen: {
      breadcrumbModule: 'Nómina',
      breadcrumbPeriods: 'Períodos',
      breadcrumbReview: 'Revisión de nómina',
      titlePrefix: 'Nómina',
      monthlyPeriodTag: 'Período mensual',
      statusLabel: 'Estado',
      runTypeLabel: 'Corrida',
      workflowStepperTitle: 'Flujo controlado',
      stepDraft: '1. Borrador',
      stepInReview: '2. En revisión',
      stepSimulation: '3. Simular cálculo',
      stepStatutory: '4. Calcular TSS e ISR',
      stepApprove: '5. Aprobar nómina',
      ctaSendToReview: 'Enviar a revisión',
      ctaReturnToDraft: 'Devolver a borrador',
      ctaSimulate: 'Simular cálculo',
      ctaCalculateStatutory: 'Calcular TSS e ISR',
      ctaApprovePayroll: 'Aprobar nómina',
      simulating: 'Simulando…',
      calculatingStatutory: 'Calculando TSS e ISR…',
      approving: 'Aprobando…',
      tabs: {
        all: 'Vista completa (Stitch)',
        simulation: 'Simulación',
        statutory: 'Revisión TSS e ISR',
        breakdown: 'Desglose individual',
        history: 'Historial',
      },
      kpiEmployeesIncluded: 'EMPLEADOS INCLUIDOS',
      kpiIncidences: 'INCIDENCIAS / CÁLCULOS',
      kpiIncidencesDetected: 'detectadas',
      kpiIncidencesNone: 'Sin incidencias bloqueantes',
      kpiProvisionalSubtotal: 'SUBTOTAL PROVISIONAL',
      kpiWorkerDeductions: 'DEDUCCIONES TRABAJADOR',
      kpiEmployerContributions: 'APORTES PATRONALES',
      kpiCalculatedNet: 'NETO CALCULADO',
      preLegalBadge: 'PRE-LEGAL',
      pendingTssIsrNote: 'Pendiente retenciones TSS / ISR',
      noRunYetTitle: 'Sin corrida ejecutada para este período',
      noRunYetDesc:
        'Envía el período a revisión y ejecuta «Simular cálculo» para generar los tramos salariales y el subtotal provisional.',
      historicalBannerTitle: 'Consultando corrida histórica (solo lectura)',
      historicalBannerDesc:
        'Visualizas una corrida anterior. Vuelve a la corrida vigente para calcular TSS e ISR o aprobar la nómina.',
      selectCurrentRunBtn: 'Volver a corrida vigente',
      approvedBannerTitle: 'Nómina aprobada — Período y corrida en solo lectura',
      approvedBannerDesc:
        'La corrida STATUTORY_REVIEW vigente fue aprobada y bloqueada definitivamente.',
      readyConditionBanner:
        'Condición de corrida STATUTORY_REVIEW vigente: Lista para revisión final',
      incompleteConditionBanner:
        'Corrida STATUTORY_REVIEW con observaciones pendientes: recalcula «Calcular TSS e ISR» antes de aprobar.',
      approvalBlockedPermission:
        'El perfil actual no tiene permiso para aprobar nómina.',
      approvalBlockedHistorical:
        'Solo se aprueba la corrida STATUTORY_REVIEW vigente.',
      approvalBlockedIncomplete:
        'Se requiere una corrida STATUTORY_REVIEW completa («Lista para revisión final»).',
      simulationSummaryTitle: 'Resumen de Simulación',
      simulationSummaryDesc:
        'Calcula salario proporcional por tramos y novedades del período. Las retenciones legales y el neto quedan Pendientes hasta ejecutar «Calcular TSS e ISR».',
      statutorySummaryTitle: 'Revisión de TSS, DGII ISR e INFOTEP',
      statutorySummaryDesc:
        'Separa deducciones del trabajador y aportes patronales. Un empleado exento de ISR muestra explícitamente RD$0.00.',
      statutoryChecksTitle: 'Lista de verificación normativa TSS e ISR',
      workerDeductionsTitle: 'Deducciones del trabajador (TSS + DGII ISR)',
      employerContributionsTitle: 'Aportes patronales (TSS + SRL + INFOTEP)',
      breakdownSectionTitle: 'Desglose individual',
      historyTitle: 'HISTORIAL DE CORRIDAS:',
      historyEmpty: 'Aún no existen corridas registradas para este período.',
      runLabel: 'Corrida',
      executedBy: 'Ejecutada por',
      approvedBy: 'Aprobada por',
      inspectRun: 'Inspeccionar',
      currentlyViewing: 'En pantalla',
      breakdownSearchPlaceholder: 'Buscar por nombre o código…',
      showOnlyIncidences: 'Mostrar solo incidencias',
      colEmployee: 'EMPLEADO',
      colBaseCalc: 'SALARIO BASE CALC.',
      colExtraEarnings: 'INGRESOS ADIC.',
      colRegDeductions: 'DEDUCCIONES REG.',
      colProvisional: 'SUBTOTAL PROV.',
      colWorkerDed: 'DED. TRABAJADOR',
      colEmployerContrib: 'APORTES PATRONALES',
      colNet: 'NETO CALCULADO',
      viewHistoryLink: 'Ver historial',
      deferredOpsTitle: 'Operaciones posteriores diferidas (Fase 2)',
      deferredOpsDesc:
        'Pago bancario, exportaciones de archivos TSS / IR-3 y contabilización ERP quedan para una fase posterior.',
      deferredPayment: 'Pago / Dispersión bancaria',
      deferredExports: 'Exportaciones TSS / IR-3',
      deferredAccounting: 'Contabilización ERP',
    },
    breakdownPanel: {
      title: 'Desglose de nómina',
      subtitle: 'Detalle individual según corrida seleccionada',
      noEmployeeSelected: 'Selecciona un empleado para visualizar su desglose.',
      tabPayroll: 'Desglose de nómina',
      tabSalaryHistory: 'Historial salarial',
      tabIsrBackground: 'Antecedentes ISR',
      section1Title: '1. TRAMOS SALARIALES APLICADOS',
      section1Badge: 'Cálculo proporcional',
      registeredMonthlySalary: 'Salario mensual registrado:',
      trancheAmount: 'Importe tramo:',
      subtotalCalculatedSalary: 'Subtotal Salario Calculado:',
      section2Title: '2. NOVEDADES DEL PERÍODO',
      recordsSuffix: 'registros',
      noNoveltiesForEmployee: 'Sin novedades variables en este período.',
      section3Title: '3. RETENCIONES FISCALES Y TSS (RD)',
      provisionalBeforeRetentions: 'Subtotal provisional antes de retenciones:',
      provisionalFormulaHint: 'Salario base calculado + ingresos adicionales',
      tssEmployeeTitle: 'TSS Empleado',
      tssEmployeeFormula: 'SFS 3.04% + AFP 2.87%',
      isrDgiiTitle: 'ISR DGII',
      isrDgiiFormula: 'Escala progresiva código tributario',
      sfsEmployee: 'SFS Trabajador (3.04%)',
      afpEmployee: 'AFP Trabajador (2.87%)',
      isrWithheld: 'ISR Retenido',
      workerDeductionsTotal: 'Total deducciones trabajador',
      employerSectionTitle: 'Aportes Patronales',
      employerFormula: 'TSS Patronal (SFS 7.09% + AFP 7.10% + SRL 1.10% + Infotep 1%)',
      employerBadgeInformative: 'INFORMATIVO / PENDIENTE',
      employerBadgeComputed: 'CALCULADO',
      sfsEmployer: 'SFS Patronal (7.09%)',
      afpEmployer: 'AFP Patronal (7.10%)',
      srlEmployer: 'Riesgos Laborales SRL (1.10%)',
      infotepEmployer: 'INFOTEP (1.00%)',
      employerContributionsTotal: 'Total aportes patronales',
      calculatedNet: 'Neto calculado a pagar',
      pendingCalculationBadge: 'Pendiente de cálculo',
      pendingStatutoryNote:
        'Para liquidar retenciones de ley, deducciones definitivas y aportes patronales, ejecuta la acción Calcular TSS e ISR en la barra superior.',
      pendingSimulationNote:
        'Aún no existe corrida simulada. Ejecuta «Simular cálculo» en la barra superior.',
      isrExemptNote: 'Exento según escala mensual DGII (RD$0.00 verificado).',
      approvedReadOnlyNote: 'Corrida aprobada y cerrada en solo lectura.',
      permissionRestrictedTitle: 'Acceso restringido por permisos de sesión',
      permissionRestrictedSalary:
        'Tu perfil actual no tiene permiso para consultar el historial salarial confidencial del colaborador.',
      permissionRestrictedIsr:
        'Tu perfil actual no tiene permiso para consultar los antecedentes fiscales de ISR / IR-3.',
      previousSalary: 'Salario anterior',
      newSalary: 'Nuevo salario',
      taxableIncome: 'Renta neta imponible',
      withheldIsr: 'ISR retenido',
    },
    placeholderScreen: {
      referenceBadge: 'Módulo de referencia NetsRow ERP',
      descriptionPrefix:
        'Esta vista mantiene el árbol de navegación global de NetsRow ERP. Los flujos activos del prototipo residen en Nómina.',
      returnToPayroll: 'Volver a Revisión de nómina',
      openPeriods: 'Ir a Períodos',
      modules: {
        overview: {
          title: 'Inicio · Resumen Ejecutivo',
          summary: 'Panel general de operación y finanzas de Grupo Ramos, S.A. en NetsRow ERP.',
          capabilities: [
            'Indicadores operativos de ventas, caja e inventario',
            'Estado del período mensual de nómina vigente',
            'Alertas de vencimientos TSS e IR-3',
          ],
        },
        pos: {
          title: 'Punto de Venta (POS)',
          summary: 'Facturación rápida en sucursales y cierre diario de cajas.',
          capabilities: ['Emisión de tickets e-CF', 'Control de turnos de cajeros', 'Sincronización de inventario'],
        },
        sales_ar: {
          title: 'Ventas y Facturación',
          summary: 'Gestión comercial, cotizaciones, facturación electrónica e-CF y comisiones.',
          capabilities: ['Comprobantes fiscales DGII', 'Cuentas por cobrar', 'Base de comisiones para Novedades'],
        },
        customers: {
          title: 'Clientes',
          summary: 'Directorio maestro de clientes corporativos y condiciones de crédito.',
          capabilities: ['Validación de RNC / Cédula', 'Límites de crédito', 'Estado de cuenta'],
        },
        cashbox: {
          title: 'Caja y Tesorería',
          summary: 'Control de arqueos, egresos y transferencias bancarias (pago de nómina diferido a Fase 2).',
          capabilities: ['Arqueo de efectivo y tarjetas', 'Lotes bancarios ACH (Fase 2)', 'Conciliación diaria'],
        },
        inventory: {
          title: 'Inventario',
          summary: 'Existencias por almacén, transferencias y costos promedio.',
          capabilities: ['Kardex por sucursal', 'Órdenes de traslado', 'Alertas de reposición'],
        },
        catalog: {
          title: 'Catálogo de Productos',
          summary: 'Maestro de artículos, listas de precios e impuestos ITBIS.',
          capabilities: ['SKU y códigos de barra', 'Listas de precios por canal', 'Reglas fiscales'],
        },
        internal_docs: {
          title: 'Documentos Internos',
          summary: 'Repositorio de memorandos, aprobaciones y documentación administrativa.',
          capabilities: ['Actas internas', 'Soportes de novedades', 'Archivo digital'],
        },
        accounting: {
          title: 'Contabilidad General',
          summary: 'Plan de cuentas y contabilización automática de nómina (diferida a Fase 2).',
          capabilities: ['Asientos contables de nómina (Fase 2)', 'Provisión de prestaciones', 'Balances y estados financieros'],
        },
        work_risk: {
          title: 'Configuración de Nómina · Riesgo Laboral',
          summary: 'Parametrización de tasas de Seguro de Riesgos Laborales (SRL) por sucursal y clasificación de riesgo TSS.',
          capabilities: ['Tasa base SRL 1.10% + factor de riesgo', 'Asignación por departamento/puesto', 'Validación previa al cálculo TSS'],
        },
        concept_treatment: {
          title: 'Configuración de Nómina · Tratamiento de Conceptos',
          summary: 'Reglas de gravabilidad TSS (SFS/AFP), ISR DGII y salario cotizable por concepto de novedad.',
          capabilities: ['Conceptos gravables vs exentos', 'Reglas para horas extras, bonos y comisiones', 'Mapeo de deducciones voluntarias'],
        },
        business: {
          title: 'Configuración · Negocio',
          summary: 'Parámetros fiscales de República Dominicana y calendario de ciclos mensuales.',
          capabilities: ['Régimen fiscal DGII', 'Moneda base RD$', 'Calendario mensual de nómina'],
        },
        company: {
          title: 'Configuración · Empresa',
          summary: 'Datos legales de Grupo Ramos, S.A. (RNC 1-01-08532-4) y registros patronales TSS.',
          capabilities: ['RNC y razón social', 'Código de empleador TSS', 'Firmantes autorizados'],
        },
        branches: {
          title: 'Configuración · Sucursales',
          summary: 'Centros de trabajo, puntos de venta y centros de costo.',
          capabilities: ['Sucursales operativas', 'Centros de costo para nómina', 'Responsables locales'],
        },
        users_roles: {
          title: 'Configuración · Usuarios y Roles',
          summary: 'Matriz real de permisos de sesión (historial salarial, antecedentes ISR y aprobación de nómina).',
          capabilities: ['Control RBAC por módulo', 'Permisos granulares de nómina', 'Bitácora de auditoría'],
        },
      },
    },
  },
  en: {
    brandName: 'NetsRow',
    brandSubtitle: 'NETSROW ERP · ERP SUITE',
    entityName: 'Grupo Ramos, S.A.',
    entityRnc: 'RNC 1-01-08532-4',
    navigation: {
      operationSection: 'Operations',
      financeSection: 'Finance',
      payrollGroup: 'Payroll',
      payrollConfigSection: 'Settings',
      settingsSection: 'System Settings',
      overview: 'Home',
      pos: 'POS',
      salesAr: 'Sales',
      customers: 'Customers',
      cashbox: 'Cashier',
      inventory: 'Inventory',
      catalog: 'Catalog',
      internalDocs: 'Internal Docs',
      accounting: 'Accounting',
      periods: 'Periods',
      employees: 'Employees',
      novelties: 'Adjustments',
      payrollReview: 'Payroll Review',
      runHistory: 'Run History',
      workRisk: 'Occupational Risk',
      conceptTreatment: 'Concept Rules',
      business: 'Business',
      company: 'Company',
      branches: 'Branches',
      usersRoles: 'Users & Roles',
      collapseSidebar: 'Collapse sidebar',
      expandSidebar: 'Expand sidebar',
      openMenu: 'Open navigation',
    },
    topBar: {
      entityLabel: 'Entity',
      activePeriodLabel: 'Period',
      noPeriodSelected: 'No period selected',
      demoControlBadge: 'Demo control',
      demoRoleLabel: 'Demo profile',
      roleAdmin: 'Payroll Admin (Demo)',
      roleSupervisor: 'Viewer (No salary/ISR/approval)',
      roleTitleAdmin: 'Payroll Manager',
      roleTitleSupervisor: 'Viewer (Read-only)',
      languageLabel: 'Language',
      themeLight: 'Light',
      themeDark: 'Dark',
      openBreakdown: 'Payroll Breakdown',
      simBannerPrefix: 'ACTIVE SIMULATION',
      statutoryBannerPrefix: 'TSS & ISR REVIEW',
      approvedBannerPrefix: 'PAYROLL APPROVED',
      draftBannerPrefix: 'DRAFT PERIOD',
    },
    common: {
      pending: 'Pending calculation',
      pendingShort: 'Pending',
      readOnly: 'Read-only',
      editable: 'Editable',
      search: 'Search',
      all: 'All',
      save: 'Save',
      cancel: 'Cancel',
      edit: 'Edit',
      delete: 'Delete',
      add: 'Add',
      close: 'Close',
      viewDetails: 'View details',
      openPeriod: 'Open in review',
      noResults: 'No records match the current filters.',
      loading: 'Processing request…',
      activeRun: 'CURRENT',
      historicalRun: 'HISTORICAL',
      backToPeriods: 'Go to Periods',
      backToReview: 'Go to Payroll Review',
      employeesCount: 'employees',
      date: 'Date',
      status: 'Status',
      actions: 'Actions',
      amount: 'Amount',
      employee: 'Employee',
      code: 'Code',
      cedula: 'National ID',
      department: 'Department',
      notes: 'Notes',
      daysSuffix: 'days',
    },
    statuses: {
      DRAFT: 'Draft',
      IN_REVIEW: 'In Review',
      APPROVED: 'Approved',
    },
    runPhases: {
      SIMULATED: 'Simulation',
      STATUTORY_REVIEW: 'TSS & ISR Review',
    },
    runConditions: {
      SIMULATION_COMPLETED: 'Active Simulation',
      INCOMPLETE_CHECKS: 'Incomplete TSS & ISR review',
      READY_FOR_FINAL_REVIEW: 'Ready for final review',
      APPROVED: 'Approved',
    },
    employeeStatuses: {
      ACTIVE: 'Active',
      LEAVE: 'On Leave',
      SUSPENDED: 'Suspended',
    },
    noveltyCategories: {
      EARNING: 'Earning',
      DEDUCTION: 'Deduction',
    },
    noveltyConcepts: {
      OVERTIME_35: 'Daytime overtime (35%)',
      COMMISSION: 'Sales commission',
      PERFORMANCE_BONUS: 'Productivity bonus',
      LOAN_DEDUCTION: 'NetsRow Co-op loan deduction',
      UNPAID_ABSENCE: 'Unpaid absence',
      TRANSPORT_ALLOWANCE: 'Transport allowance',
    },
    periodsScreen: {
      title: 'Monthly Payroll Periods',
      subtitle:
        'Exclusively monthly payroll cycles. Open any period to link directly to Payroll Review or manage its adjustments.',
      monthlyOnlyNote: 'Exclusively monthly periods (DR)',
      periodColumn: 'Monthly period',
      dateRangeColumn: 'Date range',
      noveltiesColumn: 'Adjustments',
      runStateColumn: 'Current run condition',
      provisionalSubtotal: 'Provisional subtotal',
      calculatedNet: 'Calculated net',
      filterStatus: 'Filter status',
      openInReview: 'Open review',
      viewNovelties: 'Adjustments',
      activeSelected: 'Selected',
      totalPeriods: 'Monthly periods',
      draftPeriods: 'In Draft',
      inReviewPeriods: 'In Review',
      approvedPeriods: 'Approved',
    },
    employeesScreen: {
      title: 'Employees & Personnel File',
      subtitle:
        'Search by employee code (EMP-...) or name. Select any employee to view their personnel file, salary history, ISR background, and «Payroll Breakdown».',
      searchPlaceholder: 'Search by code (EMP-...) or name…',
      hireDate: 'Hire date',
      baseSalary: 'Base monthly salary',
      tssCoverage: 'TSS Enrollment',
      tssRegistered: 'TSS Enrolled',
      tssPending: 'TSS Pending',
      inspectRecord: 'Open file',
      totalEmployees: 'Total headcount',
      activeEmployees: 'Active on payroll',
      onLeaveOrSuspended: 'Leave / Suspended',
      dossierTitle: 'Selected Employee Personnel File',
      dossierSubtitle:
        'Employment summary, salary history, and ISR background governed by session permissions.',
      generalProfileTitle: 'General Profile & TSS Enrollment',
      salaryHistoryTitle: 'Salary History',
      isrBackgroundTitle: 'ISR Tax Background (DGII / IR-3)',
      positionLabel: 'Position',
      afpLabel: 'AFP',
      arsLabel: 'ARS',
      noSalaryHistory: 'No prior salary adjustments recorded.',
      noIsrBackground: 'No ISR background records available.',
    },
    noveltiesScreen: {
      title: 'Period Adjustments',
      subtitle:
        'Create and edit adjustments while the period is in Draft; inspect read-only once In Review or Approved.',
      addNovelty: 'Add adjustment',
      editNovelty: 'Edit adjustment',
      draftEditableBanner:
        'Period in Draft: you can create, edit, or delete adjustments. Simulation is triggered explicitly in Payroll Review.',
      reviewLockedBanner:
        'Period In Review: adjustments are locked read-only while payroll runs are evaluated.',
      approvedLockedBanner:
        'Period Approved: closed permanently in read-only mode. No edits allowed.',
      periodSelectorLabel: 'Monthly period',
      filterEmployeeOrConcept: 'Filter by code, name, or concept…',
      concept: 'Concept',
      category: 'Type',
      selectEmployee: 'Select employee',
      amountPlaceholder: '0.00',
      noteLabel: 'Detail / Justification',
      emptyState: 'No adjustments recorded for this monthly period.',
      earningsTotal: 'Total variable earnings',
      deductionsTotal: 'Total variable deductions',
      recordsCount: 'Recorded adjustments',
      goToReviewCta: 'Go to Payroll Review',
    },
    reviewScreen: {
      breadcrumbModule: 'Payroll',
      breadcrumbPeriods: 'Periods',
      breadcrumbReview: 'Payroll Review',
      titlePrefix: 'Payroll',
      monthlyPeriodTag: 'Monthly period',
      statusLabel: 'Status',
      runTypeLabel: 'Run',
      workflowStepperTitle: 'Controlled workflow',
      stepDraft: '1. Draft',
      stepInReview: '2. In Review',
      stepSimulation: '3. Simulate Calculation',
      stepStatutory: '4. Calculate TSS & ISR',
      stepApprove: '5. Approve Payroll',
      ctaSendToReview: 'Submit for review',
      ctaReturnToDraft: 'Return to draft',
      ctaSimulate: 'Simulate calculation',
      ctaCalculateStatutory: 'Calculate TSS & ISR',
      ctaApprovePayroll: 'Approve payroll',
      simulating: 'Simulating…',
      calculatingStatutory: 'Calculating TSS & ISR…',
      approving: 'Approving…',
      tabs: {
        all: 'Full View (Stitch)',
        simulation: 'Simulation',
        statutory: 'TSS & ISR Review',
        breakdown: 'Individual Breakdown',
        history: 'Run History',
      },
      kpiEmployeesIncluded: 'EMPLOYEES INCLUDED',
      kpiIncidences: 'INCIDENCES / CHECKS',
      kpiIncidencesDetected: 'detected',
      kpiIncidencesNone: 'No blocking issues',
      kpiProvisionalSubtotal: 'PROVISIONAL SUBTOTAL',
      kpiWorkerDeductions: 'EMPLOYEE DEDUCTIONS',
      kpiEmployerContributions: 'EMPLOYER CONTRIBUTIONS',
      kpiCalculatedNet: 'CALCULATED NET',
      preLegalBadge: 'PRE-LEGAL',
      pendingTssIsrNote: 'TSS / ISR withholdings pending',
      noRunYetTitle: 'No calculation run executed for this period',
      noRunYetDesc:
        'Submit the period for review and click «Simulate calculation» to compute salary tranches and provisional subtotal.',
      historicalBannerTitle: 'Viewing historical run (read-only)',
      historicalBannerDesc:
        'You are inspecting an earlier run. Switch back to the current run to compute TSS & ISR or approve payroll.',
      selectCurrentRunBtn: 'Switch to current run',
      approvedBannerTitle: 'Payroll Approved — Period and run are read-only',
      approvedBannerDesc:
        'The current STATUTORY_REVIEW run has been approved and sealed permanently.',
      readyConditionBanner:
        'Current STATUTORY_REVIEW run condition: Ready for final review',
      incompleteConditionBanner:
        'STATUTORY_REVIEW run has pending checks: recalculate «Calculate TSS & ISR» before approving.',
      approvalBlockedPermission:
        'Current session lacks payroll approval permissions.',
      approvalBlockedHistorical:
        'Only the current STATUTORY_REVIEW run can be approved.',
      approvalBlockedIncomplete:
        'Requires a complete STATUTORY_REVIEW run («Ready for final review»).',
      simulationSummaryTitle: 'Simulation Summary',
      simulationSummaryDesc:
        'Computes proportional salary tranches and period adjustments. Statutory withholdings and net pay remain Pending until «Calculate TSS & ISR» runs.',
      statutorySummaryTitle: 'TSS, DGII ISR & INFOTEP Statutory Review',
      statutorySummaryDesc:
        'Separates worker deductions from employer contributions. Tax-exempt employees explicitly display RD$0.00.',
      statutoryChecksTitle: 'Statutory TSS & ISR compliance checklist',
      workerDeductionsTitle: 'Employee deductions (TSS + DGII ISR)',
      employerContributionsTitle: 'Employer contributions (TSS + SRL + INFOTEP)',
      breakdownSectionTitle: 'Individual Breakdown',
      historyTitle: 'RUN HISTORY:',
      historyEmpty: 'No calculation runs recorded for this period yet.',
      runLabel: 'Run',
      executedBy: 'Executed by',
      approvedBy: 'Approved by',
      inspectRun: 'Inspect',
      currentlyViewing: 'Viewing',
      breakdownSearchPlaceholder: 'Search by name or code…',
      showOnlyIncidences: 'Show only incidences',
      colEmployee: 'EMPLOYEE',
      colBaseCalc: 'CALC. BASE SALARY',
      colExtraEarnings: 'EXTRA EARNINGS',
      colRegDeductions: 'REG. DEDUCTIONS',
      colProvisional: 'PROVISIONAL SUB.',
      colWorkerDed: 'WORKER DED.',
      colEmployerContrib: 'EMPLOYER CONTRIB.',
      colNet: 'CALCULATED NET',
      viewHistoryLink: 'View history',
      deferredOpsTitle: 'Downstream operations deferred (Phase 2)',
      deferredOpsDesc:
        'Bank wire disbursement, TSS / IR-3 file exports, and ERP GL posting are out of scope for this delivery.',
      deferredPayment: 'Bank disbursement',
      deferredExports: 'TSS / IR-3 exports',
      deferredAccounting: 'ERP GL posting',
    },
    breakdownPanel: {
      title: 'Payroll Breakdown',
      subtitle: 'Individual details for the selected run',
      noEmployeeSelected: 'Select an employee to view their breakdown.',
      tabPayroll: 'Payroll Breakdown',
      tabSalaryHistory: 'Salary history',
      tabIsrBackground: 'ISR background',
      section1Title: '1. APPLIED SALARY TRANCHES',
      section1Badge: 'Proportional calculation',
      registeredMonthlySalary: 'Registered monthly salary:',
      trancheAmount: 'Tranche amount:',
      subtotalCalculatedSalary: 'Calculated Salary Subtotal:',
      section2Title: '2. PERIOD ADJUSTMENTS',
      recordsSuffix: 'records',
      noNoveltiesForEmployee: 'No variable adjustments for this period.',
      section3Title: '3. TAX & TSS WITHHOLDINGS (DR)',
      provisionalBeforeRetentions: 'Provisional subtotal before withholdings:',
      provisionalFormulaHint: 'Calculated base salary + extra earnings',
      tssEmployeeTitle: 'Employee TSS',
      tssEmployeeFormula: 'SFS 3.04% + AFP 2.87%',
      isrDgiiTitle: 'DGII ISR',
      isrDgiiFormula: 'Progressive tax code scale',
      sfsEmployee: 'Employee SFS (3.04%)',
      afpEmployee: 'Employee AFP (2.87%)',
      isrWithheld: 'ISR Withheld',
      workerDeductionsTotal: 'Total employee deductions',
      employerSectionTitle: 'Employer Contributions',
      employerFormula: 'Employer TSS (SFS 7.09% + AFP 7.10% + SRL 1.10% + Infotep 1%)',
      employerBadgeInformative: 'INFORMATIVE / PENDING',
      employerBadgeComputed: 'COMPUTED',
      sfsEmployer: 'Employer SFS (7.09%)',
      afpEmployer: 'Employer AFP (7.10%)',
      srlEmployer: 'Occupational Risk SRL (1.10%)',
      infotepEmployer: 'INFOTEP (1.00%)',
      employerContributionsTotal: 'Total employer contributions',
      calculatedNet: 'Calculated net pay',
      pendingCalculationBadge: 'Pending calculation',
      pendingStatutoryNote:
        'To settle statutory withholdings, final deductions, and employer contributions, execute Calculate TSS & ISR in the top bar.',
      pendingSimulationNote:
        'No simulated run yet. Execute «Simulate calculation» in the top bar.',
      isrExemptNote: 'Exempt under monthly DGII bracket (verified RD$0.00).',
      approvedReadOnlyNote: 'Run approved and locked in read-only mode.',
      permissionRestrictedTitle: 'Restricted by session permissions',
      permissionRestrictedSalary:
        'Your current session lacks permission to view confidential salary history.',
      permissionRestrictedIsr:
        'Your current session lacks permission to view confidential ISR / IR-3 tax records.',
      previousSalary: 'Previous salary',
      newSalary: 'New salary',
      taxableIncome: 'Taxable income',
      withheldIsr: 'ISR withheld',
    },
    placeholderScreen: {
      referenceBadge: 'NetsRow ERP reference module',
      descriptionPrefix:
        'This view preserves the NetsRow ERP global module tree as navigation reference. Active workflows live in Payroll.',
      returnToPayroll: 'Return to Payroll Review',
      openPeriods: 'Go to Periods',
      modules: {
        overview: {
          title: 'Home · Executive Overview',
          summary: 'Operational and financial overview for Grupo Ramos, S.A. inside NetsRow ERP.',
          capabilities: [
            'Sales, cashier, and inventory operational KPIs',
            'Active monthly payroll cycle status',
            'DGII & TSS filing deadline alerts',
          ],
        },
        pos: {
          title: 'Point of Sale (POS)',
          summary: 'Fast branch checkout and daily register closing.',
          capabilities: ['e-CF receipt issuance', 'Cashier shift controls', 'Real-time stock sync'],
        },
        sales_ar: {
          title: 'Sales & Billing',
          summary: 'Commercial orders, DGII e-CF invoicing, and sales commission tracking.',
          capabilities: ['DGII NCF / e-CF billing', 'Accounts receivable aging', 'Commission feed for Payroll Adjustments'],
        },
        customers: {
          title: 'Customers',
          summary: 'Corporate customer directory and credit policy controls.',
          capabilities: ['RNC / National ID verification', 'Credit limits', 'Account statements'],
        },
        cashbox: {
          title: 'Cashier & Treasury',
          summary: 'Register counts and bank transfers (payroll disbursement deferred to Phase 2).',
          capabilities: ['Cash & card reconciliation', 'ACH bank batches (Phase 2)', 'Daily settlements'],
        },
        inventory: {
          title: 'Inventory',
          summary: 'Warehouse stock balances, transfers, and average costing.',
          capabilities: ['Multi-branch ledger', 'Stock transfers', 'Reorder alerts'],
        },
        catalog: {
          title: 'Product Catalog',
          summary: 'Item master, price lists, and ITBIS tax classifications.',
          capabilities: ['SKU & barcodes', 'Channel price tiers', 'Tax rules'],
        },
        internal_docs: {
          title: 'Internal Documents',
          summary: 'Central repository for memos, approvals, and administrative files.',
          capabilities: ['Internal memos', 'Adjustment supporting docs', 'Digital archive'],
        },
        accounting: {
          title: 'General Ledger & Accounting',
          summary: 'Chart of accounts and automated payroll GL posting (deferred to Phase 2).',
          capabilities: ['Payroll GL journal entries (Phase 2)', 'Statutory accruals', 'Financial statements'],
        },
        work_risk: {
          title: 'Payroll Settings · Occupational Risk',
          summary: 'SRL occupational risk rate rules by branch and TSS risk classification.',
          capabilities: ['Base SRL 1.10% + risk factor', 'Department/role assignment', 'Pre-TSS validation'],
        },
        concept_treatment: {
          title: 'Payroll Settings · Concept Rules',
          summary: 'TSS (SFS/AFP) and DGII ISR taxability rules per adjustment concept.',
          capabilities: ['Taxable vs exempt flags', 'Overtime, bonus & commission rules', 'Voluntary deduction mapping'],
        },
        business: {
          title: 'Settings · Business',
          summary: 'Dominican Republic fiscal configuration and monthly payroll calendars.',
          capabilities: ['DGII tax regime', 'Base currency RD$', 'Monthly payroll calendar'],
        },
        company: {
          title: 'Settings · Company',
          summary: 'Legal profile for Grupo Ramos, S.A. (RNC 1-01-08532-4) and TSS employer registry.',
          capabilities: ['RNC & legal name', 'TSS employer registration', 'Authorized signatories'],
        },
        branches: {
          title: 'Settings · Branches',
          summary: 'Workplaces, POS locations, and payroll cost centers.',
          capabilities: ['Operating branches', 'Payroll cost centers', 'Local managers'],
        },
        users_roles: {
          title: 'Settings · Users & Roles',
          summary: 'Production session permission matrix (salary history, ISR records, payroll approval).',
          capabilities: ['Module RBAC controls', 'Granular payroll permissions', 'Audit trail'],
        },
      },
    },
  },
};

export function formatCurrencyOrPending(
  amount: number | null | undefined,
  locale: Locale,
  pendingText?: string
): { text: string; isPending: boolean; isZero: boolean } {
  if (amount === null || amount === undefined || Number.isNaN(amount)) {
    return {
      text: pendingText ?? TRANSLATIONS[locale].common.pending,
      isPending: true,
      isZero: false,
    };
  }
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return {
    text: `RD$${formatted}`,
    isPending: false,
    isZero: amount === 0,
  };
}

export function formatDateLocalized(isoDate: string, locale: Locale): string {
  if (!isoDate) return '—';
  const [y, m, d] = isoDate.split('-').map(Number);
  if (!y || !m || !d) return isoDate;
  const dt = new Date(Date.UTC(y, m - 1, d));
  return new Intl.DateTimeFormat(locale === 'es' ? 'es-DO' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    timeZone: 'UTC',
  }).format(dt);
}

export function getDemoPermissions(role: DemoRoleKey) {
  if (role === 'payroll_admin') {
    return {
      canViewSalaryHistory: true,
      canViewIsrBackground: true,
      canEditNovelties: true,
      canSubmitForReview: true,
      canRunSimulation: true,
      canRunStatutoryReview: true,
      canApprovePayroll: true,
    };
  }
  return {
    canViewSalaryHistory: false,
    canViewIsrBackground: false,
    canEditNovelties: false,
    canSubmitForReview: false,
    canRunSimulation: false,
    canRunStatutoryReview: false,
    canApprovePayroll: false,
  };
}
