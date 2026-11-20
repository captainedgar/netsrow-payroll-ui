import {
  Employee,
  EmployeeBreakdown,
  PayrollNovelty,
  PayrollPeriod,
  PayrollRun,
  SalaryTranche,
  StatutoryCheckItem,
} from '../types/payroll';

export const SEED_EMPLOYEES: Employee[] = [
  {
    id: 'emp-1',
    code: 'EMP-0104',
    fullName: 'Juan Carlos Méndez Peña',
    cedula: '001-1893421-9',
    departmentEs: 'Tecnología',
    departmentEn: 'Technology',
    positionEs: 'Senior Dev',
    positionEn: 'Senior Dev',
    hireDate: '2022-04-10',
    status: 'ACTIVE',
    baseMonthlySalary: 36000,
    afpProvider: 'AFP Popular',
    arsProvider: 'ARS Humano',
    tssRegistered: true,
    salaryHistory: [
      {
        id: 'sal-101',
        effectiveDate: '2026-10-16',
        previousSalary: 30000,
        newSalary: 36000,
        reasonEs: 'Promoción a Senior Dev (tramo proporcional aplicado)',
        reasonEn: 'Promotion to Senior Dev (proportional tranche applied)',
        authorizedBy: 'Dirección Tecnología',
      },
      {
        id: 'sal-100',
        effectiveDate: '2024-01-01',
        previousSalary: 26000,
        newSalary: 30000,
        reasonEs: 'Ajuste anual por desempeño',
        reasonEn: 'Annual performance adjustment',
        authorizedBy: 'Gerencia RRHH',
      },
    ],
    isrBackground: [
      {
        id: 'isr-101',
        fiscalYear: 2026,
        periodLabelEs: 'Acumulado Ene–Sep 2026',
        periodLabelEn: 'YTD Jan–Sep 2026',
        annualizedTaxableIncome: 254043,
        accumulatedIsrWithheld: 0,
        dgiiBracketEs: 'Exento (≤ RD$34,685.00 mensual)',
        dgiiBracketEn: 'Exempt (≤ RD$34,685.00 monthly)',
        ir3Reference: 'IR3-2026-09-104',
      },
    ],
  },
  {
    id: 'emp-2',
    code: 'EMP-0089',
    fullName: 'María Elena Gómez Tavárez',
    cedula: '001-1489203-7',
    departmentEs: 'Operaciones',
    departmentEn: 'Operations',
    positionEs: 'Especialista de Operaciones',
    positionEn: 'Operations Specialist',
    hireDate: '2021-03-15',
    status: 'ACTIVE',
    baseMonthlySalary: 68500,
    afpProvider: 'AFP Crecer',
    arsProvider: 'ARS Universal',
    tssRegistered: true,
    salaryHistory: [
      {
        id: 'sal-201',
        effectiveDate: '2025-07-01',
        previousSalary: 60000,
        newSalary: 68500,
        reasonEs: 'Revisión de escala operativa',
        reasonEn: 'Operations scale review',
        authorizedBy: 'Dirección Operaciones',
      },
    ],
    isrBackground: [
      {
        id: 'isr-201',
        fiscalYear: 2026,
        periodLabelEs: 'Acumulado Ene–Sep 2026',
        periodLabelEn: 'YTD Jan–Sep 2026',
        annualizedTaxableIncome: 580064.85,
        accumulatedIsrWithheld: 45773.76,
        dgiiBracketEs: 'Escala 20% (RD$52,027.43 – RD$72,260.25)',
        dgiiBracketEn: '20% Bracket (RD$52,027.43 – RD$72,260.25)',
        ir3Reference: 'IR3-2026-09-089',
      },
    ],
  },
  {
    id: 'emp-3',
    code: 'EMP-0112',
    fullName: 'Pedro Luis Santana Ramírez',
    cedula: '031-0482190-4',
    departmentEs: 'Logística',
    departmentEn: 'Logistics',
    positionEs: 'Supervisor de Almacén',
    positionEn: 'Warehouse Supervisor',
    hireDate: '2020-11-10',
    status: 'ACTIVE',
    baseMonthlySalary: 48000,
    afpProvider: 'AFP Siembra',
    arsProvider: 'ARS Senasa Contributivo',
    tssRegistered: true,
    salaryHistory: [
      {
        id: 'sal-301',
        effectiveDate: '2025-04-01',
        previousSalary: 42000,
        newSalary: 48000,
        reasonEs: 'Supervisión de centro de distribución',
        reasonEn: 'Distribution center supervision grade',
        authorizedBy: 'Gerencia Logística',
      },
    ],
    isrBackground: [
      {
        id: 'isr-301',
        fiscalYear: 2026,
        periodLabelEs: 'Acumulado Ene–Sep 2026',
        periodLabelEn: 'YTD Jan–Sep 2026',
        annualizedTaxableIncome: 406468.8,
        accumulatedIsrWithheld: 14132.5,
        dgiiBracketEs: 'Escala 15% (RD$34,685.01 – RD$52,027.42)',
        dgiiBracketEn: '15% Bracket (RD$34,685.01 – RD$52,027.42)',
        ir3Reference: 'IR3-2026-09-112',
      },
    ],
  },
  {
    id: 'emp-4',
    code: 'EMP-0145',
    fullName: 'Yomaira De la Cruz Núñez',
    cedula: '001-1934011-9',
    departmentEs: 'Producto',
    departmentEn: 'Product',
    positionEs: 'Diseñadora UX Senior',
    positionEn: 'Senior UX Designer',
    hireDate: '2023-02-20',
    status: 'ACTIVE',
    baseMonthlySalary: 95000,
    afpProvider: 'AFP Popular',
    arsProvider: 'ARS Humano',
    tssRegistered: true,
    salaryHistory: [
      {
        id: 'sal-401',
        effectiveDate: '2026-01-15',
        previousSalary: 82000,
        newSalary: 95000,
        reasonEs: 'Ajuste de mercado UX Producto',
        reasonEn: 'UX Product market adjustment',
        authorizedBy: 'VP Producto',
      },
    ],
    isrBackground: [
      {
        id: 'isr-401',
        fiscalYear: 2026,
        periodLabelEs: 'Acumulado Ene–Sep 2026',
        periodLabelEn: 'YTD Jan–Sep 2026',
        annualizedTaxableIncome: 804469.5,
        accumulatedIsrWithheld: 98316.1,
        dgiiBracketEs: 'Escala 25% (> RD$72,260.25)',
        dgiiBracketEn: '25% Bracket (> RD$72,260.25)',
        ir3Reference: 'IR3-2026-09-145',
      },
    ],
  },
  {
    id: 'emp-5',
    code: 'EMP-0052',
    fullName: 'Carolina Méndez Cabrera',
    cedula: '047-0194821-3',
    departmentEs: 'Finanzas y Contraloría',
    departmentEn: 'Finance & Controllership',
    positionEs: 'Gerente Financiera',
    positionEn: 'Finance Manager',
    hireDate: '2019-09-05',
    status: 'ACTIVE',
    baseMonthlySalary: 145000,
    afpProvider: 'AFP Reservas',
    arsProvider: 'ARS Reservas',
    tssRegistered: true,
    salaryHistory: [
      {
        id: 'sal-501',
        effectiveDate: '2026-01-01',
        previousSalary: 130000,
        newSalary: 145000,
        reasonEs: 'Ajuste anual por desempeño e inflación',
        reasonEn: 'Annual merit & inflation adjustment',
        authorizedBy: 'Dirección General',
      },
    ],
    isrBackground: [
      {
        id: 'isr-501',
        fiscalYear: 2026,
        periodLabelEs: 'Acumulado Ene–Sep 2026',
        periodLabelEn: 'YTD Jan–Sep 2026',
        annualizedTaxableIncome: 1228197,
        accumulatedIsrWithheld: 194508.15,
        dgiiBracketEs: 'Escala 25% (> RD$72,260.25)',
        dgiiBracketEn: '25% Bracket (> RD$72,260.25)',
        ir3Reference: 'IR3-2026-09-052',
      },
    ],
  },
  {
    id: 'emp-6',
    code: 'EMP-0168',
    fullName: 'José Luis Peralta Polanco',
    cedula: '001-1850234-6',
    departmentEs: 'Soporte Técnico',
    departmentEn: 'Technical Support',
    positionEs: 'Analista Mesa de Ayuda',
    positionEn: 'Helpdesk Analyst',
    hireDate: '2024-05-14',
    status: 'ACTIVE',
    baseMonthlySalary: 32000,
    afpProvider: 'AFP Popular',
    arsProvider: 'ARS Humano',
    tssRegistered: true,
    salaryHistory: [
      {
        id: 'sal-601',
        effectiveDate: '2025-05-14',
        previousSalary: 28000,
        newSalary: 32000,
        reasonEs: 'Revisión tras primer año',
        reasonEn: 'First-year tenure review',
        authorizedBy: 'Gerencia Soporte',
      },
    ],
    isrBackground: [
      {
        id: 'isr-601',
        fiscalYear: 2026,
        periodLabelEs: 'Acumulado Ene–Sep 2026',
        periodLabelEn: 'YTD Jan–Sep 2026',
        annualizedTaxableIncome: 270979.2,
        accumulatedIsrWithheld: 0,
        dgiiBracketEs: 'Exento (≤ RD$34,685.00 mensual)',
        dgiiBracketEn: 'Exempt (≤ RD$34,685.00 monthly)',
        ir3Reference: 'IR3-2026-09-168',
      },
    ],
  },
  {
    id: 'emp-7',
    code: 'EMP-0174',
    fullName: 'Marisol Bautista Rodríguez',
    cedula: '002-0139482-2',
    departmentEs: 'Administración',
    departmentEn: 'Administration',
    positionEs: 'Asistente Administrativa',
    positionEn: 'Administrative Assistant',
    hireDate: '2025-01-20',
    status: 'ACTIVE',
    baseMonthlySalary: 29500,
    afpProvider: 'AFP Crecer',
    arsProvider: 'ARS Senasa Contributivo',
    tssRegistered: true,
    salaryHistory: [
      {
        id: 'sal-701',
        effectiveDate: '2026-01-20',
        previousSalary: 27000,
        newSalary: 29500,
        reasonEs: 'Ajuste anual por convenio',
        reasonEn: 'Annual policy adjustment',
        authorizedBy: 'Administración',
      },
    ],
    isrBackground: [
      {
        id: 'isr-701',
        fiscalYear: 2026,
        periodLabelEs: 'Acumulado Ene–Sep 2026',
        periodLabelEn: 'YTD Jan–Sep 2026',
        annualizedTaxableIncome: 249808.95,
        accumulatedIsrWithheld: 0,
        dgiiBracketEs: 'Exento (≤ RD$34,685.00 mensual)',
        dgiiBracketEn: 'Exempt (≤ RD$34,685.00 monthly)',
        ir3Reference: 'IR3-2026-09-174',
      },
    ],
  },
  {
    id: 'emp-8',
    code: 'EMP-0190',
    fullName: 'Héctor Darío Guzmán',
    cedula: '056-0142098-5',
    departmentEs: 'Logística y Almacén',
    departmentEn: 'Logistics & Warehouse',
    positionEs: 'Coordinador de Despacho',
    positionEn: 'Dispatch Coordinator',
    hireDate: '2023-08-01',
    status: 'LEAVE',
    baseMonthlySalary: 35500,
    afpProvider: 'AFP Siembra',
    arsProvider: 'ARS Universal',
    tssRegistered: true,
    salaryHistory: [
      {
        id: 'sal-801',
        effectiveDate: '2024-08-01',
        previousSalary: 32500,
        newSalary: 35500,
        reasonEs: 'Recategorización operativa',
        reasonEn: 'Operations grade upgrade',
        authorizedBy: 'Gerencia Logística',
      },
    ],
    isrBackground: [
      {
        id: 'isr-801',
        fiscalYear: 2026,
        periodLabelEs: 'Acumulado Ene–Sep 2026',
        periodLabelEn: 'YTD Jan–Sep 2026',
        annualizedTaxableIncome: 300617.7,
        accumulatedIsrWithheld: 0,
        dgiiBracketEs: 'Exento (≤ RD$34,685.00 mensual)',
        dgiiBracketEn: 'Exempt (≤ RD$34,685.00 monthly)',
        ir3Reference: 'IR3-2026-09-190',
      },
    ],
  },
];

export const SEED_NOVELTIES: PayrollNovelty[] = [
  // Noviembre 2026 (DRAFT - Editable)
  {
    id: 'nov-1101',
    periodId: 'per-2026-11',
    employeeId: 'emp-1',
    date: '2026-11-12',
    conceptCode: 'OVERTIME_35',
    category: 'EARNING',
    amount: 2500,
    noteEs: 'Horas extras diurnas (10 hrs)',
    noteEn: 'Daytime overtime (10 hrs)',
  },
  {
    id: 'nov-1102',
    periodId: 'per-2026-11',
    employeeId: 'emp-1',
    date: '2026-11-18',
    conceptCode: 'PERFORMANCE_BONUS',
    category: 'EARNING',
    amount: 2000,
    noteEs: 'Bono de productividad mensual',
    noteEn: 'Monthly productivity bonus',
  },
  {
    id: 'nov-1103',
    periodId: 'per-2026-11',
    employeeId: 'emp-1',
    date: '2026-11-20',
    conceptCode: 'LOAN_DEDUCTION',
    category: 'DEDUCTION',
    amount: 1200,
    noteEs: 'Descuento Cooperativa NetsRow',
    noteEn: 'NetsRow Co-op loan installment',
  },
  {
    id: 'nov-1104',
    periodId: 'per-2026-11',
    employeeId: 'emp-3',
    date: '2026-11-16',
    conceptCode: 'OVERTIME_35',
    category: 'EARNING',
    amount: 2000,
    noteEs: 'Inventario nocturno almacén',
    noteEn: 'Warehouse inventory overtime',
  },

  // Octubre 2026 (IN_REVIEW - Read-only, STATUTORY_REVIEW Lista para revisión final)
  {
    id: 'nov-1001',
    periodId: 'per-2026-10',
    employeeId: 'emp-1',
    date: '2026-10-18',
    conceptCode: 'OVERTIME_35',
    category: 'EARNING',
    amount: 2500,
    noteEs: 'Horas extras diurnas (10 hrs)',
    noteEn: 'Daytime overtime (10 hrs)',
  },
  {
    id: 'nov-1002',
    periodId: 'per-2026-10',
    employeeId: 'emp-1',
    date: '2026-10-20',
    conceptCode: 'PERFORMANCE_BONUS',
    category: 'EARNING',
    amount: 2000,
    noteEs: 'Bono de productividad',
    noteEn: 'Productivity bonus',
  },
  {
    id: 'nov-1003',
    periodId: 'per-2026-10',
    employeeId: 'emp-1',
    date: '2026-10-22',
    conceptCode: 'LOAN_DEDUCTION',
    category: 'DEDUCTION',
    amount: 1200,
    noteEs: 'Descuento Cooperativa NetsRow',
    noteEn: 'NetsRow Co-op loan installment',
  },
  {
    id: 'nov-1004',
    periodId: 'per-2026-10',
    employeeId: 'emp-2',
    date: '2026-10-25',
    conceptCode: 'LOAN_DEDUCTION',
    category: 'DEDUCTION',
    amount: 500,
    noteEs: 'Cuota cooperativa mensual',
    noteEn: 'Monthly co-op installment',
  },
  {
    id: 'nov-1005',
    periodId: 'per-2026-10',
    employeeId: 'emp-4',
    date: '2026-10-26',
    conceptCode: 'LOAN_DEDUCTION',
    category: 'DEDUCTION',
    amount: 2500,
    noteEs: 'Cuota préstamo empleado',
    noteEn: 'Employee loan installment',
  },

  // Agosto 2026 (IN_REVIEW - SIMULATED run awaiting Calcular TSS e ISR, includes 2 incidences!)
  {
    id: 'nov-0801',
    periodId: 'per-2026-08',
    employeeId: 'emp-1',
    date: '2026-08-19',
    conceptCode: 'OVERTIME_35',
    category: 'EARNING',
    amount: 2500,
    noteEs: 'Horas extras diurnas (10 hrs)',
    noteEn: 'Daytime overtime (10 hrs)',
  },
  {
    id: 'nov-0802',
    periodId: 'per-2026-08',
    employeeId: 'emp-1',
    date: '2026-08-21',
    conceptCode: 'PERFORMANCE_BONUS',
    category: 'EARNING',
    amount: 2000,
    noteEs: 'Bono de productividad',
    noteEn: 'Productivity bonus',
  },
  {
    id: 'nov-0803',
    periodId: 'per-2026-08',
    employeeId: 'emp-1',
    date: '2026-08-25',
    conceptCode: 'LOAN_DEDUCTION',
    category: 'DEDUCTION',
    amount: 1200,
    noteEs: 'Descuento Cooperativa NetsRow',
    noteEn: 'NetsRow Co-op loan installment',
  },
  {
    id: 'nov-0804',
    periodId: 'per-2026-08',
    employeeId: 'emp-3',
    date: '2026-08-22',
    conceptCode: 'COMMISSION',
    category: 'EARNING',
    amount: 2000,
    noteEs: 'Incentivo despacho agosto',
    noteEn: 'August dispatch incentive',
  },

  // Septiembre 2026 (APPROVED - Read-only)
  {
    id: 'nov-0901',
    periodId: 'per-2026-09',
    employeeId: 'emp-4',
    date: '2026-09-19',
    conceptCode: 'PERFORMANCE_BONUS',
    category: 'EARNING',
    amount: 10000,
    noteEs: 'Bono lanzamiento portal cliente',
    noteEn: 'Client portal release bonus',
  },
  {
    id: 'nov-0902',
    periodId: 'per-2026-09',
    employeeId: 'emp-2',
    date: '2026-09-25',
    conceptCode: 'LOAN_DEDUCTION',
    category: 'DEDUCTION',
    amount: 500,
    noteEs: 'Cuota cooperativa mensual',
    noteEn: 'Monthly co-op installment',
  },

  // Julio 2026 (IN_REVIEW - INCOMPLETE_CHECKS STATUTORY_REVIEW)
  {
    id: 'nov-0701',
    periodId: 'per-2026-07',
    employeeId: 'emp-5',
    date: '2026-07-17',
    conceptCode: 'OVERTIME_35',
    category: 'EARNING',
    amount: 4200,
    noteEs: 'Horas extra auditoría TSS',
    noteEn: 'Overtime TSS audit support',
  },
];

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function computeMonthlyIsr(taxableBase: number): {
  isr: number;
  bracket: 'EXEMPT' | '15%' | '20%' | '25%';
} {
  if (taxableBase <= 34685) {
    return { isr: 0, bracket: 'EXEMPT' };
  }
  if (taxableBase <= 52027.42) {
    return { isr: round2((taxableBase - 34685) * 0.15), bracket: '15%' };
  }
  if (taxableBase <= 72260.25) {
    return {
      isr: round2(2601.36 + (taxableBase - 52027.42) * 0.2),
      bracket: '20%',
    };
  }
  return {
    isr: round2(6647.93 + (taxableBase - 72260.25) * 0.25),
    bracket: '25%',
  };
}

export function buildStatutoryChecks(
  phase: 'SIMULATED' | 'STATUTORY_REVIEW',
  condition: PayrollRun['condition'],
  employeeCount: number
): StatutoryCheckItem[] {
  if (phase === 'SIMULATED') {
    return [
      {
        id: 'chk-tss',
        labelEs: 'Cálculo SFS (3.04% / 7.09%) y AFP (2.87% / 7.10%)',
        labelEn: 'SFS (3.04% / 7.09%) & AFP (2.87% / 7.10%) computation',
        passed: false,
        detailEs: 'Pendiente de ejecutar «Calcular TSS e ISR»',
        detailEn: 'Pending «Calculate TSS & ISR» execution',
      },
      {
        id: 'chk-isr',
        labelEs: 'Escala mensual DGII ISR y verificación exentos (RD$0.00)',
        labelEn: 'Monthly DGII ISR brackets & exempt check (RD$0.00)',
        passed: false,
        detailEs: 'Pendiente de ejecutar «Calcular TSS e ISR»',
        detailEn: 'Pending «Calculate TSS & ISR» execution',
      },
      {
        id: 'chk-infotep',
        labelEs: 'Aportes patronales SRL (1.10%) e INFOTEP (1.00%)',
        labelEn: 'Employer SRL (1.10%) & INFOTEP (1.00%) contributions',
        passed: false,
        detailEs: 'Pendiente de ejecutar «Calcular TSS e ISR»',
        detailEn: 'Pending «Calculate TSS & ISR» execution',
      },
    ];
  }

  const allPassed = condition !== 'INCOMPLETE_CHECKS';

  return [
    {
      id: 'chk-tss',
      labelEs: 'Cálculo SFS (3.04% / 7.09%) y AFP (2.87% / 7.10%)',
      labelEn: 'SFS (3.04% / 7.09%) & AFP (2.87% / 7.10%) computation',
      passed: true,
      detailEs: `${employeeCount}/${employeeCount} colaboradores cotizantes validados`,
      detailEn: `${employeeCount}/${employeeCount} enrolled employees validated`,
    },
    {
      id: 'chk-isr',
      labelEs: 'Escala mensual DGII ISR y verificación exentos (RD$0.00)',
      labelEn: 'Monthly DGII ISR brackets & exempt check (RD$0.00)',
      passed: allPassed,
      detailEs: allPassed
        ? 'Tramos 15%, 20%, 25% y exentos (RD$0.00) verificados'
        : '1 observación de validación IR-3 pendiente de recálculo',
      detailEn: allPassed
        ? '15%, 20%, 25% brackets and exempt (RD$0.00) verified'
        : '1 IR-3 validation observation pending recalculation',
    },
    {
      id: 'chk-infotep',
      labelEs: 'Aportes patronales SRL (1.10%) e INFOTEP (1.00%)',
      labelEn: 'Employer SRL (1.10%) & INFOTEP (1.00%) contributions',
      passed: true,
      detailEs: 'Base patronal conciliada sin diferencias',
      detailEn: 'Employer contribution base reconciled with zero variance',
    },
  ];
}

function buildTranchesForEmployee(
  emp: Employee,
  periodId: string
): { calculatedBase: number; tranches: SalaryTranche[] } {
  // Show proportional 2-tranche promotion split on EMP-0104 (Juan Carlos Méndez Peña)
  if (emp.id === 'emp-1' && (periodId === 'per-2026-10' || periodId === 'per-2026-08')) {
    return {
      calculatedBase: 33000,
      tranches: [
        {
          id: 'tr-1',
          titleEs: 'Tramo 1 (01 – 15 del mes)',
          titleEn: 'Tranche 1 (01 – 15 of month)',
          days: 15,
          registeredMonthlySalary: 30000,
          computedAmount: 15000,
        },
        {
          id: 'tr-2',
          titleEs: 'Tramo 2 (16 – 30 del mes)',
          titleEn: 'Tranche 2 (16 – 30 of month)',
          days: 15,
          registeredMonthlySalary: 36000,
          computedAmount: 18000,
          badgeEs: 'PROMOCIÓN',
          badgeEn: 'PROMOTION',
        },
      ],
    };
  }

  return {
    calculatedBase: emp.baseMonthlySalary,
    tranches: [
      {
        id: 'tr-full',
        titleEs: 'Tramo completo (01 – 30 del mes)',
        titleEn: 'Full month tranche (01 – 30)',
        days: 30,
        registeredMonthlySalary: emp.baseMonthlySalary,
        computedAmount: emp.baseMonthlySalary,
      },
    ],
  };
}

export function buildBreakdowns(
  employees: Employee[],
  novelties: PayrollNovelty[],
  periodId: string,
  phase: 'SIMULATED' | 'STATUTORY_REVIEW',
  incompleteFlag = false,
  includeSimulatedIncidences = false
): EmployeeBreakdown[] {
  const periodNovelties = novelties.filter((n) => n.periodId === periodId);

  return employees.map((emp) => {
    const empNovelties = periodNovelties.filter((n) => n.employeeId === emp.id);
    const earningsNovelties = round2(
      empNovelties
        .filter((n) => n.category === 'EARNING')
        .reduce((acc, n) => acc + n.amount, 0)
    );
    const deductionsNovelties = round2(
      empNovelties
        .filter((n) => n.category === 'DEDUCTION')
        .reduce((acc, n) => acc + n.amount, 0)
    );

    const { calculatedBase, tranches } = buildTranchesForEmployee(emp, periodId);
    const provisionalSubtotal = round2(calculatedBase + earningsNovelties);

    let complianceFlag: EmployeeBreakdown['complianceFlag'] = 'OK';
    let incidenceNoteEs: string | undefined;
    let incidenceNoteEn: string | undefined;

    if (includeSimulatedIncidences && emp.id === 'emp-2') {
      complianceFlag = 'IR3_WARNING';
      incidenceNoteEs = 'Requiere validar ajuste en tramo salarial (Importe: RD$8,500.00)';
      incidenceNoteEn = 'Requires salary tranche adjustment check (Amount: RD$8,500.00)';
    } else if (includeSimulatedIncidences && emp.id === 'emp-3') {
      complianceFlag = 'TSS_PENDING';
      incidenceNoteEs = 'Riesgo laboral SRL pendiente de asignación en sucursal';
      incidenceNoteEn = 'Occupational risk SRL branch assignment pending';
    } else if (incompleteFlag && emp.id === 'emp-2') {
      complianceFlag = 'IR3_WARNING';
      incidenceNoteEs = 'Observación IR-3 detectada: recalcular TSS e ISR';
      incidenceNoteEn = 'IR-3 validation warning: recalculate TSS & ISR';
    }

    if (phase === 'SIMULATED') {
      return {
        employeeId: emp.id,
        employeeCode: emp.code,
        employeeName: emp.fullName,
        cedula: emp.cedula,
        positionEs: emp.positionEs,
        positionEn: emp.positionEn,
        departmentEs: emp.departmentEs,
        departmentEn: emp.departmentEn,
        baseSalary: emp.baseMonthlySalary,
        calculatedBaseSalary: calculatedBase,
        salaryTranches: tranches,
        earningsNovelties,
        deductionsNovelties,
        provisionalSubtotal,
        sfsEmployee: null,
        afpEmployee: null,
        isrWithheld: null,
        workerDeductionsTotal: null,
        sfsEmployer: null,
        afpEmployer: null,
        srlEmployer: null,
        infotepEmployer: null,
        employerContributionsTotal: null,
        calculatedNet: null,
        isrBracketCode: null,
        complianceFlag,
        incidenceNoteEs,
        incidenceNoteEn,
      };
    }

    const sfsEmployee = round2(provisionalSubtotal * 0.0304);
    const afpEmployee = round2(provisionalSubtotal * 0.0287);
    const taxableBase = Math.max(0, round2(provisionalSubtotal - sfsEmployee - afpEmployee));
    const { isr, bracket } = computeMonthlyIsr(taxableBase);

    const workerDeductionsTotal = round2(
      sfsEmployee + afpEmployee + isr + deductionsNovelties
    );

    const sfsEmployer = round2(provisionalSubtotal * 0.0709);
    const afpEmployer = round2(provisionalSubtotal * 0.071);
    const srlEmployer = round2(provisionalSubtotal * 0.011);
    const infotepEmployer = round2(provisionalSubtotal * 0.01);
    const employerContributionsTotal = round2(
      sfsEmployer + afpEmployer + srlEmployer + infotepEmployer
    );

    const calculatedNet = round2(provisionalSubtotal - workerDeductionsTotal);

    return {
      employeeId: emp.id,
      employeeCode: emp.code,
      employeeName: emp.fullName,
      cedula: emp.cedula,
      positionEs: emp.positionEs,
      positionEn: emp.positionEn,
      departmentEs: emp.departmentEs,
      departmentEn: emp.departmentEn,
      baseSalary: emp.baseMonthlySalary,
      calculatedBaseSalary: calculatedBase,
      salaryTranches: tranches,
      earningsNovelties,
      deductionsNovelties,
      provisionalSubtotal,
      sfsEmployee,
      afpEmployee,
      isrWithheld: isr,
      workerDeductionsTotal,
      sfsEmployer,
      afpEmployer,
      srlEmployer,
      infotepEmployer,
      employerContributionsTotal,
      calculatedNet,
      isrBracketCode: bracket,
      complianceFlag,
      incidenceNoteEs,
      incidenceNoteEn,
    };
  });
}

export function buildRunObject(params: {
  id: string;
  periodId: string;
  runNumber: number;
  phase: 'SIMULATED' | 'STATUTORY_REVIEW';
  condition: PayrollRun['condition'];
  isCurrent: boolean;
  isReadOnly: boolean;
  executedAt: string;
  executedBy: string;
  approvedAt: string | null;
  approvedBy: string | null;
  employees: Employee[];
  novelties: PayrollNovelty[];
  notesEs: string;
  notesEn: string;
  includeSimulatedIncidences?: boolean;
}): PayrollRun {
  const breakdowns = buildBreakdowns(
    params.employees,
    params.novelties,
    params.periodId,
    params.phase,
    params.condition === 'INCOMPLETE_CHECKS',
    Boolean(params.includeSimulatedIncidences)
  );
  const incidencesCount = breakdowns.filter((b) => b.complianceFlag !== 'OK').length;
  const provisionalSubtotalTotal = round2(
    breakdowns.reduce((acc, b) => acc + (b.provisionalSubtotal ?? 0), 0)
  );
  const statutoryChecks = buildStatutoryChecks(
    params.phase,
    params.condition,
    breakdowns.length
  );

  if (params.phase === 'SIMULATED') {
    return {
      id: params.id,
      periodId: params.periodId,
      runNumber: params.runNumber,
      phase: 'SIMULATED',
      condition: params.condition,
      isCurrent: params.isCurrent,
      isReadOnly: params.isReadOnly,
      executedAt: params.executedAt,
      executedBy: params.executedBy,
      approvedAt: null,
      approvedBy: null,
      employeeCount: breakdowns.length,
      incidencesCount,
      provisionalSubtotalTotal,
      workerDeductionsTotal: null,
      employerContributionsTotal: null,
      calculatedNetTotal: null,
      tssEmployeeTotal: null,
      isrTotal: null,
      statutoryChecks,
      breakdowns,
      notesEs: params.notesEs,
      notesEn: params.notesEn,
    };
  }

  const workerDeductionsTotal = round2(
    breakdowns.reduce((acc, b) => acc + (b.workerDeductionsTotal ?? 0), 0)
  );
  const employerContributionsTotal = round2(
    breakdowns.reduce((acc, b) => acc + (b.employerContributionsTotal ?? 0), 0)
  );
  const calculatedNetTotal = round2(
    breakdowns.reduce((acc, b) => acc + (b.calculatedNet ?? 0), 0)
  );
  const tssEmployeeTotal = round2(
    breakdowns.reduce((acc, b) => acc + (b.sfsEmployee ?? 0) + (b.afpEmployee ?? 0), 0)
  );
  const isrTotal = round2(
    breakdowns.reduce((acc, b) => acc + (b.isrWithheld ?? 0), 0)
  );

  return {
    id: params.id,
    periodId: params.periodId,
    runNumber: params.runNumber,
    phase: 'STATUTORY_REVIEW',
    condition: params.condition,
    isCurrent: params.isCurrent,
    isReadOnly: params.isReadOnly,
    executedAt: params.executedAt,
    executedBy: params.executedBy,
    approvedAt: params.approvedAt,
    approvedBy: params.approvedBy,
    employeeCount: breakdowns.length,
    incidencesCount,
    provisionalSubtotalTotal,
    workerDeductionsTotal,
    employerContributionsTotal,
    calculatedNetTotal,
    tssEmployeeTotal,
    isrTotal,
    statutoryChecks,
    breakdowns,
    notesEs: params.notesEs,
    notesEn: params.notesEn,
  };
}

export function createSeedPeriods(): PayrollPeriod[] {
  const octRun1 = buildRunObject({
    id: 'run-2026-10-1',
    periodId: 'per-2026-10',
    runNumber: 1,
    phase: 'SIMULATED',
    condition: 'SIMULATION_COMPLETED',
    isCurrent: false,
    isReadOnly: true,
    executedAt: '2026-10-27 09:15',
    executedBy: 'Lic. Altagracia Castillo',
    approvedAt: null,
    approvedBy: null,
    employees: SEED_EMPLOYEES,
    novelties: SEED_NOVELTIES,
    notesEs: 'Simulación inicial con tramos salariales proporcionales.',
    notesEn: 'Initial simulation with proportional salary tranches.',
  });

  const octRun2 = buildRunObject({
    id: 'run-2026-10-2',
    periodId: 'per-2026-10',
    runNumber: 2,
    phase: 'STATUTORY_REVIEW',
    condition: 'READY_FOR_FINAL_REVIEW',
    isCurrent: true,
    isReadOnly: false,
    executedAt: '2026-10-28 14:32',
    executedBy: 'Lic. Altagracia Castillo',
    approvedAt: null,
    approvedBy: null,
    employees: SEED_EMPLOYEES,
    novelties: SEED_NOVELTIES,
    notesEs: 'Revisión TSS e ISR completa; lista para revisión final.',
    notesEn: 'Complete TSS & ISR calculation; ready for final review.',
  });

  const sepRun1 = buildRunObject({
    id: 'run-2026-09-1',
    periodId: 'per-2026-09',
    runNumber: 1,
    phase: 'SIMULATED',
    condition: 'SIMULATION_COMPLETED',
    isCurrent: false,
    isReadOnly: true,
    executedAt: '2026-09-28 10:05',
    executedBy: 'Lic. Altagracia Castillo',
    approvedAt: null,
    approvedBy: null,
    employees: SEED_EMPLOYEES,
    novelties: SEED_NOVELTIES,
    notesEs: 'Simulación mensual septiembre 2026.',
    notesEn: 'Monthly simulation September 2026.',
  });

  const sepRun2 = buildRunObject({
    id: 'run-2026-09-2',
    periodId: 'per-2026-09',
    runNumber: 2,
    phase: 'STATUTORY_REVIEW',
    condition: 'APPROVED',
    isCurrent: true,
    isReadOnly: true,
    executedAt: '2026-09-28 14:20',
    executedBy: 'Lic. Altagracia Castillo',
    approvedAt: '2026-09-29 09:00',
    approvedBy: 'Lic. Altagracia Castillo',
    employees: SEED_EMPLOYEES,
    novelties: SEED_NOVELTIES,
    notesEs: 'Nómina mensual aprobada y sellada.',
    notesEn: 'Monthly payroll approved and sealed.',
  });

  const augRun1 = buildRunObject({
    id: 'run-2026-08-1',
    periodId: 'per-2026-08',
    runNumber: 1,
    phase: 'SIMULATED',
    condition: 'SIMULATION_COMPLETED',
    isCurrent: false,
    isReadOnly: true,
    executedAt: '2026-08-27 17:40',
    executedBy: 'Lic. Altagracia Castillo',
    approvedAt: null,
    approvedBy: null,
    employees: SEED_EMPLOYEES,
    novelties: SEED_NOVELTIES,
    notesEs: 'Simulación inicial v1.',
    notesEn: 'Initial simulation v1.',
  });

  const augRun2 = buildRunObject({
    id: 'run-2026-08-2',
    periodId: 'per-2026-08',
    runNumber: 2,
    phase: 'SIMULATED',
    condition: 'SIMULATION_COMPLETED',
    isCurrent: true,
    isReadOnly: false,
    executedAt: '2026-08-28 14:32',
    executedBy: 'Lic. Altagracia Castillo',
    approvedAt: null,
    approvedBy: null,
    employees: SEED_EMPLOYEES,
    novelties: SEED_NOVELTIES,
    notesEs: 'Simulación vigente con 2 incidencias detectadas; pendiente de Calcular TSS e ISR.',
    notesEn: 'Active simulation with 2 detected incidences; awaiting Calculate TSS & ISR.',
    includeSimulatedIncidences: true,
  });

  const julRun1 = buildRunObject({
    id: 'run-2026-07-1',
    periodId: 'per-2026-07',
    runNumber: 1,
    phase: 'STATUTORY_REVIEW',
    condition: 'INCOMPLETE_CHECKS',
    isCurrent: true,
    isReadOnly: false,
    executedAt: '2026-07-30 15:05',
    executedBy: 'Lic. Altagracia Castillo',
    approvedAt: null,
    approvedBy: null,
    employees: SEED_EMPLOYEES,
    novelties: SEED_NOVELTIES,
    notesEs: 'Revisión TSS e ISR incompleta; recalcular antes de aprobar.',
    notesEn: 'Incomplete TSS & ISR review; recalculate before approval.',
  });

  return [
    {
      id: 'per-2026-11',
      code: '2026-11',
      year: 2026,
      month: 11,
      nameEs: 'Noviembre 2026',
      nameEn: 'November 2026',
      startDate: '2026-11-01',
      endDate: '2026-11-30',
      paymentTargetDate: '2026-11-30',
      status: 'DRAFT',
      employeeCount: SEED_EMPLOYEES.length,
      currentRunId: null,
      runs: [],
    },
    {
      id: 'per-2026-10',
      code: '2026-10',
      year: 2026,
      month: 10,
      nameEs: 'Octubre 2026',
      nameEn: 'October 2026',
      startDate: '2026-10-01',
      endDate: '2026-10-31',
      paymentTargetDate: '2026-10-30',
      status: 'IN_REVIEW',
      employeeCount: SEED_EMPLOYEES.length,
      currentRunId: octRun2.id,
      runs: [octRun2, octRun1],
    },
    {
      id: 'per-2026-09',
      code: '2026-09',
      year: 2026,
      month: 9,
      nameEs: 'Septiembre 2026',
      nameEn: 'September 2026',
      startDate: '2026-09-01',
      endDate: '2026-09-30',
      paymentTargetDate: '2026-09-30',
      status: 'APPROVED',
      employeeCount: SEED_EMPLOYEES.length,
      currentRunId: sepRun2.id,
      runs: [sepRun2, sepRun1],
    },
    {
      id: 'per-2026-08',
      code: '2026-08',
      year: 2026,
      month: 8,
      nameEs: 'Agosto 2026',
      nameEn: 'August 2026',
      startDate: '2026-08-01',
      endDate: '2026-08-31',
      paymentTargetDate: '2026-08-31',
      status: 'IN_REVIEW',
      employeeCount: SEED_EMPLOYEES.length,
      currentRunId: augRun2.id,
      runs: [augRun2, augRun1],
    },
    {
      id: 'per-2026-07',
      code: '2026-07',
      year: 2026,
      month: 7,
      nameEs: 'Julio 2026',
      nameEn: 'July 2026',
      startDate: '2026-07-01',
      endDate: '2026-07-31',
      paymentTargetDate: '2026-07-31',
      status: 'IN_REVIEW',
      employeeCount: SEED_EMPLOYEES.length,
      currentRunId: julRun1.id,
      runs: [julRun1],
    },
  ];
}
