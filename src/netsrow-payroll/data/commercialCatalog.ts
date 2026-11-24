import { CommercialCatalog, CommercialSelectionState } from '../types/commercial';

export const SEED_COMMERCIAL_CATALOG: CommercialCatalog = {
  plans: [
    {
      id: 'plan-comercial-base',
      code: 'COM-BASE',
      nameEs: 'Plan Comercial Base',
      nameEn: 'Commercial Base Plan',
      summaryEs:
        'Núcleo operativo para negocios en crecimiento: punto de venta, caja por turno, ventas, clientes, catálogo e inventario.',
      summaryEn:
        'Core operations for growing businesses: point of sale, shift cashbox, sales, customers, catalog, and inventory.',
      monthlyPriceCents: 150000, // RD$1,500.00/mes (Ejemplo ilustrativo)
      includedModules: [
        'POS',
        'SALES',
        'CASHBOX',
        'CUSTOMERS',
        'CATALOG',
        'INVENTORY',
      ],
      isIllustrative: true,
    },
    {
      id: 'plan-gestion-integral',
      code: 'COM-GESTION',
      nameEs: 'Plan Gestión Integral',
      nameEn: 'Integrated Management Plan',
      summaryEs:
        'Incluye la operación comercial base más Contabilidad general, Compras con cuentas por pagar y Cuentas por cobrar.',
      summaryEn:
        'Includes core retail operations plus General Accounting, Purchases & AP, and Accounts Receivable.',
      monthlyPriceCents: 260000, // RD$2,600.00/mes (Ejemplo ilustrativo)
      includedModules: [
        'POS',
        'SALES',
        'CASHBOX',
        'CUSTOMERS',
        'CATALOG',
        'INVENTORY',
        'ACCOUNTING',
        'PURCHASES_AP',
        'ACCOUNTS_RECEIVABLE',
      ],
      isIllustrative: true,
    },
  ],
  modules: [
    {
      code: 'POS',
      nameEs: 'Punto de Venta (POS)',
      nameEn: 'Point of Sale (POS)',
      benefitEs: 'Registra un cobro rápido y consulta el movimiento automático en Caja.',
      benefitEn: 'Ring up sales quickly and track automatic cashbox register entries.',
      category: 'CORE',
      status: 'INCLUDED',
      priceStatus: 'DEFINED',
      monthlyPriceCents: 0,
      dependsOn: ['CASHBOX', 'CATALOG'],
    },
    {
      code: 'SALES',
      nameEs: 'Ventas e historial',
      nameEn: 'Sales & history',
      benefitEs:
        'Emite comprobantes internos no fiscales y consulta el detalle de cada venta.',
      benefitEn:
        'Issue non-fiscal internal receipts and inspect complete transaction history.',
      category: 'CORE',
      status: 'INCLUDED',
      priceStatus: 'DEFINED',
      monthlyPriceCents: 0,
      dependsOn: [],
    },
    {
      code: 'CASHBOX',
      nameEs: 'Caja y turnos',
      nameEn: 'Cashbox & shifts',
      benefitEs:
        'Controla apertura, ingresos, egresos menores y cierre cuadrado por turno.',
      benefitEn:
        'Manage shift opening, cash inflows, petty expenses, and balanced closing.',
      category: 'CORE',
      status: 'INCLUDED',
      priceStatus: 'DEFINED',
      monthlyPriceCents: 0,
      dependsOn: [],
    },
    {
      code: 'CUSTOMERS',
      nameEs: 'Clientes',
      nameEn: 'Customers',
      benefitEs:
        'Mantén el directorio comercial con RNC/cédula, historial de compras y contacto.',
      benefitEn:
        'Keep a customer directory with tax ID, purchase history, and contact details.',
      category: 'CORE',
      status: 'INCLUDED',
      priceStatus: 'DEFINED',
      monthlyPriceCents: 0,
      dependsOn: [],
    },
    {
      code: 'CATALOG',
      nameEs: 'Catálogo comercial',
      nameEn: 'Commercial catalog',
      benefitEs:
        'Organiza productos, categorías, marcas, unidades de medida y listas de precios.',
      benefitEn:
        'Organize products, categories, brands, units of measure, and price lists.',
      category: 'CORE',
      status: 'INCLUDED',
      priceStatus: 'DEFINED',
      monthlyPriceCents: 0,
      dependsOn: [],
    },
    {
      code: 'INVENTORY',
      nameEs: 'Inventario operativo',
      nameEn: 'Operational inventory',
      benefitEs:
        'Consulta existencias en tiempo real, alertas de stock mínimo y ajustes auditables.',
      benefitEn:
        'Monitor real-time stock levels, low-stock alerts, and auditable adjustments.',
      category: 'CORE',
      status: 'INCLUDED',
      priceStatus: 'DEFINED',
      monthlyPriceCents: 0,
      dependsOn: ['CATALOG'],
    },
    {
      code: 'PAYROLL',
      nameEs: 'Nómina DO (TSS e ISR)',
      nameEn: 'Payroll DO (TSS & ISR)',
      benefitEs:
        'Gestiona períodos mensuales, novedades, tramos salariales y cálculo TSS/ISR (Solo demo).',
      benefitEn:
        'Manage monthly cycles, adjustments, salary tranches, and TSS/ISR calculation (Demo only).',
      category: 'ADDON',
      status: 'ADDON_AVAILABLE',
      priceStatus: 'DEFINED',
      monthlyPriceCents: 60000, // RD$600.00/mes (Ejemplo ilustrativo)
      dependsOn: [],
      isPrototypeDemoOnly: true,
    },
    {
      code: 'ACCOUNTING',
      nameEs: 'Contabilidad general',
      nameEn: 'General accounting',
      benefitEs:
        'Revisa el diario general, el mayor por cuenta, la balanza de comprobación y conciliación.',
      benefitEn:
        'Review general journal, account ledger, trial balance, and reconciliation.',
      category: 'ADDON',
      status: 'ADDON_AVAILABLE',
      priceStatus: 'DEFINED',
      monthlyPriceCents: 50000, // RD$500.00/mes (Ejemplo ilustrativo)
      dependsOn: ['POS', 'CASHBOX'],
      isPrototypeDemoOnly: true,
    },
    {
      code: 'PURCHASES_AP',
      nameEs: 'Compras y cuentas por pagar',
      nameEn: 'Purchases & accounts payable',
      benefitEs:
        'Registra facturas de suplidores a crédito, fechas de vencimiento y pagos parciales.',
      benefitEn:
        'Record supplier credit bills, due dates, and partial or full payments.',
      category: 'ADDON',
      status: 'ADDON_AVAILABLE',
      priceStatus: 'DEFINED',
      monthlyPriceCents: 40000, // RD$400.00/mes (Ejemplo ilustrativo)
      dependsOn: ['INVENTORY'],
      isPrototypeDemoOnly: true,
    },
    {
      code: 'ACCOUNTS_RECEIVABLE',
      nameEs: 'Cuentas por cobrar',
      nameEn: 'Accounts receivable',
      benefitEs:
        'Controla ventas a crédito por cliente, límites autorizados y seguimiento de cobros.',
      benefitEn:
        'Track customer credit sales, approved limits, and receivables collection.',
      category: 'ADDON',
      status: 'ADDON_AVAILABLE',
      priceStatus: 'DEFINED',
      monthlyPriceCents: 35000, // RD$350.00/mes (Ejemplo ilustrativo)
      dependsOn: ['SALES', 'CUSTOMERS'],
      isPrototypeDemoOnly: true,
    },
    {
      code: 'TREASURY',
      nameEs: 'Tesorería y bancos',
      nameEn: 'Treasury & banking',
      benefitEs:
        'Centraliza cuentas bancarias empresariales, transferencias y conciliación multi-banco.',
      benefitEn:
        'Centralize business bank accounts, transfers, and multi-bank reconciliation.',
      category: 'ADDON',
      status: 'ADDON_AVAILABLE',
      priceStatus: 'QUOTE_REQUIRED',
      monthlyPriceCents: null,
      dependsOn: ['ACCOUNTING'],
      isPrototypeDemoOnly: true,
    },
    {
      code: 'E_INVOICING',
      nameEs: 'Facturación electrónica',
      nameEn: 'Electronic invoicing',
      benefitEs:
        'Inclúyela en tu cotización para definir alcance, comprobantes, sucursales y acompañamiento de implementación.',
      benefitEn:
        'Include it in your quote to define document scope, branches, setup, and rollout support.',
      category: 'ADDON',
      status: 'ADDON_AVAILABLE',
      priceStatus: 'QUOTE_REQUIRED',
      monthlyPriceCents: null,
      dependsOn: ['SALES'],
      isPrototypeDemoOnly: false,
    },
  ],
  hardwareOptions: [
    {
      id: 'hw-estacion-completa',
      nameEs: 'Estación POS completa (Equipo ilustrativo)',
      nameEn: 'Complete POS workstation (Illustrative hardware)',
      specsEs: [
        '1 computadora de mostrador todo-en-uno o escritorio (especificación ilustrativa)',
        '1 impresora térmica de recibos 80 mm USB/red (sin marca confirmada hasta cotización)',
        '1 lector de códigos de barras alámbrico con soporte',
      ],
      specsEn: [
        '1 counter all-in-one or desktop PC (illustrative specification)',
        '1 80mm thermal receipt printer USB/LAN (brand/model confirmed on quote)',
        '1 wired barcode scanner with counter stand',
      ],
      defaultQuantity: 1,
      maxSelfServiceQuantity: 1,
      isIllustrativeHardware: true,
      paymentOptions: [
        {
          id: 'pay-6-installments',
          labelEs: '6 cuotas mensuales de RD$2,000.00 (Ejemplo ilustrativo)',
          labelEn: '6 monthly installments of RD$2,000.00 (Illustrative example)',
          type: 'INSTALLMENTS',
          installmentsCount: 6,
          monthlyInstallmentCents: 200000, // RD$2,000.00/mes
          upfrontPriceCents: null,
          downPaymentCents: 0,
          interestNoteEs: null,
          interestNoteEn: null,
          isIllustrative: true,
        },
        {
          id: 'pay-upfront-kit',
          labelEs: 'Pago único de equipo: RD$11,500.00 (Ejemplo ilustrativo)',
          labelEn: 'Single hardware payment: RD$11,500.00 (Illustrative example)',
          type: 'UPFRONT',
          installmentsCount: 0,
          monthlyInstallmentCents: null,
          upfrontPriceCents: 1150000, // RD$11,500.00
          downPaymentCents: null,
          interestNoteEs: null,
          interestNoteEn: null,
          isIllustrative: true,
        },
      ],
    },
    {
      id: 'hw-perifericos',
      nameEs: 'Kit Impresora térmica + Lector (Equipo ilustrativo)',
      nameEn: 'Thermal printer + Scanner kit (Illustrative hardware)',
      specsEs: [
        'Para comercios que ya disponen de PC o laptop Windows compatible',
        '1 impresora térmica de recibos 80 mm + 1 lector de códigos de barras',
      ],
      specsEn: [
        'For shops that already own a compatible Windows PC or laptop',
        '1 80mm thermal receipt printer + 1 barcode scanner',
      ],
      defaultQuantity: 1,
      maxSelfServiceQuantity: 1,
      isIllustrativeHardware: true,
      paymentOptions: [
        {
          id: 'pay-3-installments',
          labelEs: '3 cuotas mensuales de RD$2,000.00 (Ejemplo ilustrativo)',
          labelEn: '3 monthly installments of RD$2,000.00 (Illustrative example)',
          type: 'INSTALLMENTS',
          installmentsCount: 3,
          monthlyInstallmentCents: 200000,
          upfrontPriceCents: null,
          downPaymentCents: 0,
          interestNoteEs: null,
          interestNoteEn: null,
          isIllustrative: true,
        },
        {
          id: 'pay-upfront-peripherals',
          labelEs: 'Pago único de kit: RD$5,800.00 (Ejemplo ilustrativo)',
          labelEn: 'Single kit payment: RD$5,800.00 (Illustrative example)',
          type: 'UPFRONT',
          installmentsCount: 0,
          monthlyInstallmentCents: null,
          upfrontPriceCents: 580000,
          downPaymentCents: null,
          interestNoteEs: null,
          interestNoteEn: null,
          isIllustrative: true,
        },
      ],
    },
    {
      id: 'hw-custom-multisucursal',
      nameEs: 'Equipamiento para múltiples cajas o sucursales',
      nameEn: 'Multi-register or multi-branch hardware bundle',
      specsEs: [
        '2 o más estaciones de cobro, gavetas de efectivo y balanzas opcionales',
        'Precio, plazos y disponibilidad sujetos a cotización formal',
      ],
      specsEn: [
        '2 or more checkout stations, cash drawers, and optional scales',
        'Pricing, installment terms, and stock confirmed via formal quote',
      ],
      defaultQuantity: 2,
      maxSelfServiceQuantity: 5,
      isIllustrativeHardware: true,
      paymentOptions: [
        {
          id: 'pay-quote-multi',
          labelEs: 'Cotizar plazo y condiciones según sucursales',
          labelEn: 'Request quote for terms and multi-branch pricing',
          type: 'QUOTE_REQUIRED',
          installmentsCount: 0,
          monthlyInstallmentCents: null,
          upfrontPriceCents: null,
          downPaymentCents: null,
          interestNoteEs: null,
          interestNoteEn: null,
          isIllustrative: false,
        },
      ],
    },
  ],
  installationOptions: [
    {
      id: 'inst-none',
      kind: 'INSTALLATION',
      nameEs: 'Autoconfiguración asistida por guía digital',
      nameEn: 'Self-guided digital onboarding',
      scopeEs: 'Acceso web inmediato con guía paso a paso para catálogo y apertura de caja.',
      scopeEn: 'Immediate web access with step-by-step catalog and cashbox onboarding guide.',
      applicableModes: ['SOFTWARE_ONLY'],
      priceStatus: 'DEFINED',
      oneTimePriceCents: 0,
      isIllustrative: true,
    },
    {
      id: 'inst-estandar',
      kind: 'INSTALLATION',
      nameEs: 'Instalación de estación POS e impresora térmica',
      nameEn: 'POS station & thermal printer installation',
      scopeEs:
        'Configuración de equipo, drivers de impresora 80 mm, carga de catálogo base y pruebas de cobro en mostrador.',
      scopeEn:
        'Workstation setup, 80mm thermal printer drivers, starter catalog setup, and counter checkout testing.',
      applicableModes: ['POS_BUNDLE', 'SOFTWARE_ONLY'],
      priceStatus: 'DEFINED',
      oneTimePriceCents: 100000, // RD$1,000.00 cargo único (Ejemplo ilustrativo)
      isIllustrative: true,
    },
    {
      id: 'inst-multisucursal',
      kind: 'INSTALLATION',
      nameEs: 'Instalación coordinada multisucursal',
      nameEn: 'Multi-branch coordinated installation',
      scopeEs:
        'Despliegue en varias cajas o sucursales fuera del área metropolitana; importe definido en cotización.',
      scopeEn:
        'Rollout across multiple registers or branches; exact fee confirmed during formal quote.',
      applicableModes: ['POS_BUNDLE'],
      priceStatus: 'QUOTE_REQUIRED',
      oneTimePriceCents: null,
      isIllustrative: false,
    },
  ],
  trainingOptions: [
    {
      id: 'trn-ninguna',
      kind: 'TRAINING',
      nameEs: 'Guía rápida digital (sin sesión adicional)',
      nameEn: 'Digital quick-start guide (no extra session)',
      scopeEs: 'Manual operativo incluido para consulta interna del equipo.',
      scopeEn: 'Included operational guide for internal team reference.',
      applicableModes: ['SOFTWARE_ONLY'],
      priceStatus: 'DEFINED',
      oneTimePriceCents: 0,
      isIllustrative: true,
    },
    {
      id: 'trn-incluida-paquete',
      kind: 'TRAINING',
      nameEs: 'Capacitación inicial de caja y ventas (incluida en paquete)',
      nameEn: 'Initial POS & register training (included in bundle)',
      scopeEs:
        'Sesión práctica de 90 minutos: apertura de caja, ventas POS, descuentos e inventario.',
      scopeEn:
        '90-minute hands-on session covering cashbox opening, POS checkout, discounts, and stock.',
      applicableModes: ['POS_BUNDLE'],
      priceStatus: 'DEFINED',
      oneTimePriceCents: 0,
      includedInBundle: true,
      isIllustrative: true,
    },
    {
      id: 'trn-remota-adicional',
      kind: 'TRAINING',
      nameEs: 'Capacitación operativa guiada (sesión única)',
      nameEn: 'Guided operational training (single session)',
      scopeEs:
        'Sesión de 2 horas para administradores y cajeros sobre ventas, cierre de caja y reportes.',
      scopeEn:
        '2-hour session for managers and cashiers on checkout, cash register closing, and reports.',
      applicableModes: ['SOFTWARE_ONLY', 'POS_BUNDLE'],
      priceStatus: 'DEFINED',
      oneTimePriceCents: 120000, // RD$1,200.00 cargo único
      isIllustrative: true,
    },
    {
      id: 'trn-presencial-extendida',
      kind: 'TRAINING',
      nameEs: 'Capacitación presencial extendida por turnos',
      nameEn: 'Extended on-site shift training',
      scopeEs:
        'Acompañamiento presencial en tienda para múltiples cajeros; tarifa sujeta a ubicación y alcance.',
      scopeEn:
        'On-site store training across cashier shifts; fee confirmed based on location and scope.',
      applicableModes: ['POS_BUNDLE', 'SOFTWARE_ONLY'],
      priceStatus: 'QUOTE_REQUIRED',
      oneTimePriceCents: null,
      isIllustrative: false,
    },
  ],
  conditions: {
    warrantyEs:
      'Garantía de hardware configurable según fabricante confirmado en la propuesta comercial (pendiente de especificación final en este ejemplo).',
    warrantyEn:
      'Hardware warranty terms depend on confirmed manufacturer specs in your formal proposal.',
    dispatchEs:
      'Despacho e instalación coordinados tras confirmar disponibilidad de inventario y dirección en República Dominicana.',
    dispatchEn:
      'Dispatch and installation are scheduled upon confirming inventory availability and delivery address in the Dominican Republic.',
    supportEs:
      'Soporte técnico operativo de NetsRow incluido mientras la suscripción de software esté vigente.',
    supportEn:
      'NetsRow operational software support is included while your software subscription remains active.',
    taxesNoteEs:
      'Los importes ilustrativos no incluyen impuestos locales aplicables (ITBIS) ni cargos no definidos expresamente en tu cotización formal.',
    taxesNoteEn:
      'Illustrative figures exclude applicable local taxes (ITBIS) and any fees not explicitly stated in your formal quote.',
    installmentEndNoteEs:
      'Al completar las cuotas del equipo, dejas de pagar la cuota de hardware y continúas únicamente con tu suscripción mensual de software vigente.',
    installmentEndNoteEn:
      'Once equipment installments finish, hardware billing stops and only your active monthly software subscription remains.',
    illustrativeLabelEs: 'Ejemplo ilustrativo',
    illustrativeLabelEn: 'Illustrative example',
    whatsappCommercialNumber: null,
  },
  electronicInvoicing: {
    isIllustrativePreview: true,
    confirmedMonthlyPriceCents: null,
    confirmedOneTimeImplementationCents: null,
    applicableLimitsEs: 'Límites de volumen y sucursales definidos en propuesta formal según operación.',
    applicableLimitsEn: 'Document volume and branch limits confirmed in your formal proposal.',
    documentTypesEs: ['Tipos de comprobantes por definir según perfil comercial'],
    documentTypesEn: ['Receipt types defined by business profile in formal quote'],
    submissionStatesEs: ['Venta registrada en NetsRow', 'Preparación de comprobante', 'Seguimiento según alcance contratado'],
    submissionStatesEn: ['Sale recorded in NetsRow', 'Receipt prepared', 'Tracking per contracted scope'],
    providerLabelEs: 'Proveedor e integración confirmados al cotizar',
    providerLabelEn: 'Provider and integration confirmed during quoting',
    timelineEs: 'Plazo de habilitación definido tras revisar cómo vendes hoy',
    timelineEn: 'Onboarding timeline confirmed after reviewing your current sales flow',
    scopeEs: 'Configuración inicial por sucursal, pruebas de emisión y acompañamiento operativo.',
    scopeEn: 'Per-branch initial setup, issuance testing, and operational rollout support.',
  },
  faqs: [
    {
      id: 'faq-add-modules',
      questionEs: '¿Cómo puedo agregar módulos adicionales después de contratar?',
      questionEn: 'How can I add extra modules after signing up?',
      answerEs:
        'Puedes iniciar con el Plan Comercial Base y solicitar luego Contabilidad, Nómina DO, Compras o Cuentas por cobrar. La activación se refleja en tu empresa según el tarifario acordado.',
      answerEn:
        'You can start with the Commercial Base Plan and request Accounting, Payroll DO, Purchases, or Receivables later. Once enabled, the module unlocks right inside your ERP workspace.',
      pendingDefinitionEs:
        'El prorrateo en cambios a mitad de mes se detalla en la propuesta comercial.',
      pendingDefinitionEn:
        'Mid-cycle proration rules are confirmed on your commercial proposal.',
    },
    {
      id: 'faq-training',
      questionEs: '¿Qué incluye la capacitación inicial y cuándo tiene costo adicional?',
      questionEn: 'What does initial training include and when is there an extra fee?',
      answerEs:
        'En el paquete completo incluimos una sesión inicial práctica de 90 minutos sobre ventas POS, apertura/cierre de caja e inventario. En modalidad Solo software puedes contratar una sesión guiada como cargo único o solicitar capacitación presencial.',
      answerEn:
        'The complete POS bundle includes a 90-minute hands-on session covering POS checkout, register open/close, and stock. On Software Only, you can add a one-time guided session or request on-site training.',
    },
    {
      id: 'faq-installation',
      questionEs: '¿Cómo se solicita y coordina la instalación en el negocio?',
      questionEn: 'How do I request and schedule on-site installation?',
      answerEs:
        'Selecciona la opción de instalación en el configurador de /planes y envía tu solicitud de cotización con el nombre de tu negocio y contacto. Un asesor confirma fecha y cobertura antes de agendar.',
      answerEn:
        'Select installation inside the /planes configurator and submit your quote request with your business details. An advisor confirms coverage and schedule before booking.',
      pendingDefinitionEs:
        'Los traslados fuera del área de cobertura estándar se cotizan según provincia.',
      pendingDefinitionEn:
        'Travel fees outside standard coverage areas are quoted by province.',
    },
    {
      id: 'faq-after-installments',
      questionEs: '¿Qué sucede cuando termino de pagar las cuotas del equipo?',
      questionEn: 'What happens once the hardware installments are paid off?',
      answerEs:
        'Cuando completas todas las cuotas pactadas (por ejemplo, 6 cuotas ilustrativas de RD$2,000), el cargo mensual de equipo desaparece y solo pagas la suscripción mensual de tus módulos de software vigentes.',
      answerEn:
        'Once all agreed installments finish (for example, 6 illustrative payments of RD$2,000), the equipment fee stops and you only pay your ongoing monthly software subscription.',
    },
    {
      id: 'faq-multibranch',
      questionEs: '¿Cómo se cotizan equipos para más de una sucursal o varias cajas?',
      questionEn: 'How is hardware quoted for multiple branches or checkout stations?',
      answerEs:
        'En el paso 3 del configurador puedes seleccionar equipamiento para múltiples cajas o aumentar la cantidad. El sistema marca el equipamiento e instalación multisucursal como «Por cotizar» para preparar una propuesta a medida.',
      answerEn:
        'In Step 3 of the configurator, select multi-branch hardware or increase station quantity. The configurator marks multi-branch equipment and installation as «To be quoted» for a tailored proposal.',
      pendingDefinitionEs:
        'Descuentos por volumen, garantías extendidas y tiempos de despacho por sucursal se confirman en la cotización formal.',
      pendingDefinitionEn:
        'Volume pricing, extended warranties, and branch dispatch timelines are finalized in the formal quote.',
    },
  ],
};

export const DEFAULT_COMMERCIAL_SELECTION: CommercialSelectionState = {
  mode: 'SOFTWARE_ONLY',
  planId: 'plan-comercial-base',
  selectedAddons: [],
  hardwareId: 'hw-estacion-completa',
  hardwareQuantity: 1,
  paymentOptionId: 'pay-6-installments',
  installationId: 'inst-none',
  trainingId: 'trn-ninguna',
};

export const PRESET_SOFTWARE_WITH_PAYROLL: CommercialSelectionState = {
  mode: 'SOFTWARE_ONLY',
  planId: 'plan-comercial-base',
  selectedAddons: ['PAYROLL'],
  hardwareId: 'hw-estacion-completa',
  hardwareQuantity: 1,
  paymentOptionId: 'pay-6-installments',
  installationId: 'inst-none',
  trainingId: 'trn-ninguna',
};

export const PRESET_POS_BUNDLE_INSTALLMENTS: CommercialSelectionState = {
  mode: 'POS_BUNDLE',
  planId: 'plan-comercial-base',
  selectedAddons: ['PAYROLL'],
  hardwareId: 'hw-estacion-completa',
  hardwareQuantity: 1,
  paymentOptionId: 'pay-6-installments',
  installationId: 'inst-estandar',
  trainingId: 'trn-incluida-paquete',
};
