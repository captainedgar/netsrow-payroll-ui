import { Locale } from '../types/payroll';

export interface CommercialTranslations {
  nav: {
    features: string;
    plans: string;
    electronicInvoicing: string;
    posBundle: string;
    faq: string;
    erpAccess: string;
    openMenu: string;
    closeMenu: string;
  };
  hero: {
    regionNote: string;
    headline: string;
    subtitle: string;
    emailPlaceholder: string;
    emailValidationHint: string;
    primaryCta: string;
    secondaryCta: string;
    trustPoints: string[];
    bottomTrustLead: string;
    bottomTrustDetail: string;
    bottomTrustLink: string;
    previewTabPos: string;
    previewTabDash: string;
    previewDemoNote: string;
  };
  contractModes: {
    sectionTitle: string;
    sectionSubtitle: string;
    softwareTitle: string;
    softwareBadge: string;
    softwareDesc: string;
    softwarePoints: string[];
    softwareCta: string;
    bundleTitle: string;
    bundleBadge: string;
    bundleDesc: string;
    bundlePoints: string[];
    bundleCta: string;
    eInvoicingTitle: string;
    eInvoicingBadge: string;
    eInvoicingDesc: string;
    eInvoicingPoints: string[];
    eInvoicingCta: string;
    eInvoicingSecondaryLink: string;
  };
  modulesSection: {
    title: string;
    subtitle: string;
    basePlanGroupTitle: string;
    addonsGroupTitle: string;
    statusIncluded: string;
    statusAddon: string;
    statusInDev: string;
    consultPrice: string;
    demoOnlyTag: string;
    dependsOnLabel: string;
    configureCta: string;
    perMonth: string;
  };
  eInvoicingSection: {
    title: string;
    subtitle: string;
    cta: string;
    previewBadge: string;
    whatIsTitle: string;
    whatIsText: string;
    flowTitle: string;
    flowSteps: { title: string; desc: string }[];
    consultTitle: string;
    consultPoints: string[];
    verifiedNote: string;
    flowStep1Label: string;
    flowStep1Value: string;
    flowStep2Label: string;
    flowStep2Value: string;
    flowStep3Label: string;
    detailsTitle: string;
    docTypesLabel: string;
    statesLabel: string;
    providerLabel: string;
    timelineLabel: string;
    scopeLabel: string;
  };
  bundleSection: {
    title: string;
    subtitle: string;
    specsTitle: string;
    conditionsTitle: string;
    trainingTitle: string;
    trainingSubtitle: string;
    warrantyLabel: string;
    dispatchLabel: string;
    supportLabel: string;
    ctaConfigureBundle: string;
  };
  configurator: {
    title: string;
    subtitle: string;
    backToHome: string;
    presetsLabel: string;
    presetSoftwarePayroll: string;
    presetBundleInstallments: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3TitleSoftware: string;
    step3Desc: string;
    step3DescSoftware: string;
    step4Title: string;
    step4Desc: string;
    nextStep: string;
    prevStep: string;
    editConfigBtn: string;
    qtyLabel: string;
    qtyMultiHint: string;
    dependencyWarningTitle: string;
    dependencyConfirmBtn: string;
    paymentMethodLabel: string;
    installationLabel: string;
    trainingLabel: string;
    summaryTitle: string;
    summarySoftwareMonthly: string;
    summaryEquipmentMonthly: string;
    summaryInstallmentsSuffix: string;
    summaryOneTimeCharges: string;
    summaryDuringInstallments: string;
    summaryAfterInstallments: string;
    summaryInitialTotal: string;
    summaryKnownSubtotal: string;
    summaryFinalTotal: string;
    summaryPendingNotice: string;
    summaryPendingAmount: string;
    summaryOpenMobile: string;
    summaryCloseMobile: string;
    requestQuoteCta: string;
    eInvoicingMonthlyLabel: string;
    eInvoicingSetupLabel: string;
    eInvoicingLimitsLabel: string;
  };
  quoteForm: {
    title: string;
    subtitle: string;
    nameLabel: string;
    namePlaceholder: string;
    businessLabel: string;
    businessPlaceholder: string;
    contactLabel: string;
    contactPlaceholder: string;
    businessTypeLabel: string;
    businessTypePlaceholder: string;
    branchesLabel: string;
    commentsLabel: string;
    commentsPlaceholder: string;
    eInvoicingQuestionsTitle: string;
    eInvoicingAlreadyLabel: string;
    eInvoicingAlreadyEmpty: string;
    eInvoicingAlreadyYes: string;
    eInvoicingAlreadyNo: string;
    eInvoicingAlreadyUnsure: string;
    eInvoicingBranchesLabel: string;
    eInvoicingBranchesPlaceholder: string;
    attachedConfigTitle: string;
    submitButton: string;
    submitting: string;
    errNameRequired: string;
    errBusinessRequired: string;
    errContactRequired: string;
    errServerGeneric: string;
    simFaultLabel: string;
    simFaultNone: string;
    simFaultError: string;
    confirmedDemoTitle: string;
    confirmedDemoNote: string;
    quoteRefLabel: string;
    newConfigButton: string;
    whatsappCta: string;
  };
  faqSection: {
    title: string;
    subtitle: string;
    pendingTag: string;
    closingTitle: string;
    closingSubtitle: string;
  };
  footer: {
    tagline: string;
    productCol: string;
    accessCol: string;
    superadminLink: string;
    clientLoginLink: string;
    registerDemoLink: string;
    demoDisclaimer: string;
  };
}

export const COMMERCIAL_TRANSLATIONS: Record<Locale, CommercialTranslations> = {
  es: {
    nav: {
      features: 'Funcionalidades',
      plans: 'Planes',
      electronicInvoicing: 'Facturación electrónica',
      posBundle: 'Paquete completo',
      faq: 'Preguntas frecuentes',
      erpAccess: 'Acceder al ERP',
      openMenu: 'Abrir menú',
      closeMenu: 'Cerrar menú',
    },
    hero: {
      regionNote: 'ERP y punto de venta para empresas de República Dominicana · Vista comercial demo',
      headline: 'Ventas, inventario y facturación electrónica en un solo lugar.',
      subtitle:
        'Gestiona punto de venta, caja, inventarios, nómina, contabilidad y comprobantes electrónicos (e-CF) desde una misma plataforma, en software o paquete completo.',
      emailPlaceholder: 'Tu correo de trabajo o WhatsApp',
      emailValidationHint: 'Escribe un correo o WhatsApp válido, por ejemplo ana@tuempresa.do',
      primaryCta: 'Configura tu plan',
      secondaryCta: 'Ver paquete completo',
      trustPoints: [
        'POS, caja, inventario y e-CF',
        'Nómina RD, contabilidad y CxC/CxP',
        'Cotización en RD$ y demo al instante',
      ],
      bottomTrustLead: 'Todo tu negocio en regla desde un solo sistema',
      bottomTrustDetail: 'con punto de venta, nómina, contabilidad y configuración modular de facturación electrónica (e-CF).',
      bottomTrustLink: 'Ver facturación electrónica',
      previewTabPos: 'Terminal POS',
      previewTabDash: 'Tablero ERP',
      previewDemoNote: 'Solo demo · Datos ficticios',
    },
    contractModes: {
      sectionTitle: 'Lo que ofrecemos',
      sectionSubtitle:
        'Elige solo la suscripción en la nube, arma un paquete completo de mostrador o incorpora facturación electrónica a tu solución NetsRow.',
      softwareTitle: 'A. Solo software',
      softwareBadge: 'Si ya cuentas con computadora o tablet',
      softwareDesc:
        'Comienza con el plan comercial base en la nube y activa únicamente los módulos opcionales que necesite tu operación.',
      softwarePoints: [
        'Suscripción mensual transparente en RD$',
        'Incluye POS, Ventas, Caja, Clientes, Catálogo e Inventario',
        'Capacitación adicional disponible como cargo único si aplica',
      ],
      softwareCta: 'Cotizar solo software',
      bundleTitle: 'B. Paquete completo de punto de venta',
      bundleBadge: 'Para montar tu mostrador desde cero',
      bundleDesc:
        'Combina software NetsRow con computadora, impresora térmica de recibos, lector, instalación y capacitación inicial.',
      bundlePoints: [
        'Pago único de equipo o cuotas mensuales según disponibilidad',
        'Especificaciones ilustrativas confirmadas antes del despacho',
        'Al completar las cuotas, conservas únicamente el pago del software',
      ],
      bundleCta: 'Configurar paquete completo',
      eInvoicingTitle: 'Facturación electrónica para tu negocio',
      eInvoicingBadge: 'Solución modular · Por cotizar',
      eInvoicingDesc:
        'Configura la facturación electrónica de tu empresa como parte de tu solución NetsRow. Te ayudamos a definir qué comprobantes necesitas, cómo incorporarlos a tu operación y qué capacitación necesita tu equipo.',
      eInvoicingPoints: [
        'Definimos qué comprobantes necesitas según tu negocio',
        'Incorporación al flujo operativo de ventas y caja',
        'Disponible con Solo software o Paquete completo',
      ],
      eInvoicingCta: 'Cotizar facturación electrónica',
      eInvoicingSecondaryLink: 'Ver cómo funciona',
    },
    modulesSection: {
      title: 'Módulos pensados para comercios y MiPymes dominicanas',
      subtitle:
        'Cada módulo muestra su disponibilidad actual y tarifa mensual ilustrativa. Las funciones marcadas «Solo demo» operan con datos ficticios en esta vista previa.',
      basePlanGroupTitle: 'Incluidos en el Plan Comercial Base',
      addonsGroupTitle: 'Complementos configurables y hoja de ruta',
      statusIncluded: 'Incluido',
      statusAddon: 'Complemento disponible',
      statusInDev: 'En desarrollo',
      consultPrice: 'Consultar precio',
      demoOnlyTag: 'Solo demo',
      dependsOnLabel: 'Requiere:',
      configureCta: 'Armar combinación en /planes',
      perMonth: '/mes',
    },
    eInvoicingSection: {
      title: 'Facturación electrónica para tu negocio',
      subtitle:
        'Incluye facturación electrónica en tu cotización de NetsRow. Cuéntanos cómo vendes hoy para definir el alcance, la configuración y el acompañamiento que necesita tu negocio.',
      cta: 'Cotizar facturación electrónica',
      previewBadge: 'Ejemplo ilustrativo',
      whatIsTitle: '¿Qué es un e-CF y cómo se distingue del recibo interno?',
      whatIsText:
        'Un Comprobante Fiscal Electrónico (e-CF), descrito en la Guía del Contribuyente No. 6 de la DGII, es un documento digital con validez tributaria emitido en formato estándar y firmado digitalmente. En cambio, el recibo interno de venta es un soporte operativo no fiscal de mostrador.',
      flowTitle: 'Flujo general del comprobante electrónico',
      flowSteps: [
        {
          title: '1. Emisión y firma digital',
          desc: 'Se genera el comprobante electrónico a partir de la venta y se firma digitalmente.',
        },
        {
          title: '2. Envío para validación',
          desc: 'El comprobante se envía para su validación antes de quedar registrado oficialmente.',
        },
        {
          title: '3. Entrega al cliente',
          desc: 'Se entrega al comprador en formato digital o representación impresa según su canal.',
        },
      ],
      consultTitle: 'Qué puedes consultar al cotizar con NetsRow',
      consultPoints: [
        'Alcance de la implementación por cajas y sucursales',
        'Tipos de comprobantes que necesita tu operación',
        'Configuración operativa y capacitación para tu equipo',
      ],
      verifiedNote:
        'Alcance comercial transparente: los tipos de e-CF soportados, proveedor autorizado, integración y estados disponibles se confirman en tu propuesta formal según la capacidad vigente de NetsRow.',
      flowStep1Label: '1. Venta en mostrador',
      flowStep1Value: 'Venta #VTA-0104 · Recibo interno vs e-CF',
      flowStep2Label: '2. Emisión, firma y validación',
      flowStep2Value: 'Flujo electrónico asociado a la operación',
      flowStep3Label: '3. Entrega y seguimiento',
      detailsTitle: 'Alcance definido junto a tu cotización',
      docTypesLabel: 'Comprobantes',
      statesLabel: 'Estados de flujo',
      providerLabel: 'Proveedor',
      timelineLabel: 'Plazos',
      scopeLabel: 'Alcance',
    },
    bundleSection: {
      title: 'Paquete completo de punto de venta para mostrador',
      subtitle:
        'Prepara tu estación de cobro con software configurado, impresora térmica 80 mm y capacitación práctica para tu personal.',
      specsTitle: 'Contenido del paquete ilustrativo',
      conditionsTitle: 'Condiciones configurables de entrega y soporte',
      trainingTitle: 'Instalación y capacitación en tu comercio',
      trainingSubtitle:
        'Te acompañamos en la puesta en marcha de impresora, carga inicial de productos y práctica de apertura y cierre de caja.',
      warrantyLabel: 'Garantía',
      dispatchLabel: 'Despacho e instalación',
      supportLabel: 'Soporte operativo',
      ctaConfigureBundle: 'Configurar paquete completo en /planes',
    },
    configurator: {
      title: 'Configurador de planes y paquete POS',
      subtitle:
        'Ajusta modalidad, módulos, equipamiento y servicios. El resumen muestra importes ilustrativos en RD$ y señala cualquier partida pendiente de cotización.',
      backToHome: 'Volver a la portada',
      presetsLabel: 'Ejemplos verificables (Ejemplo ilustrativo):',
      presetSoftwarePayroll: 'Ejemplo: Base RD$1,500 + Nómina RD$600 = RD$2,100/mes',
      presetBundleInstallments:
        'Ejemplo: Paquete + Nómina + 6 cuotas RD$2,000 + Inst. RD$1,000',
      step1Title: '1. Modalidad',
      step1Desc: 'Elige «Solo software» si ya tienes equipos o «Paquete completo» para incluir hardware e instalación.',
      step2Title: '2. Plan y módulos',
      step2Desc: 'Selecciona tu plan base y activa módulos opcionales sin cobrar dos veces lo ya incluido.',
      step3Title: '3. Equipo, instalación y cuotas',
      step3TitleSoftware: '3. Instalación y capacitación opcional',
      step3Desc: 'Define el kit de hardware, cantidad, forma de pago disponible, instalación y capacitación.',
      step3DescSoftware: 'Elige si deseas asistencia inicial o capacitación operativa como cargo único.',
      step4Title: '4. Revisar y solicitar cotización',
      step4Desc: 'Verifica tu desglose completo y envía tus datos de contacto para recibir confirmación.',
      nextStep: 'Continuar',
      prevStep: 'Paso anterior',
      editConfigBtn: 'Volver a modificar configuración',
      qtyLabel: 'Cantidad de estaciones',
      qtyMultiHint:
        'Para más de 1 estación o varias sucursales, el precio y plazo se confirman en cotización formal.',
      dependencyWarningTitle: 'Dependencia de módulos requerida antes de continuar',
      dependencyConfirmBtn: 'Confirmar módulos requeridos',
      paymentMethodLabel: 'Forma de pago del equipo',
      installationLabel: 'Instalación',
      trainingLabel: 'Capacitación',
      summaryTitle: 'Resumen ilustrativo de cotización',
      summarySoftwareMonthly: 'a) Suscripción mensual de software',
      summaryEquipmentMonthly: 'b) Cuota mensual de equipo',
      summaryInstallmentsSuffix: 'cuotas',
      summaryOneTimeCharges: 'c) Cargos únicos (instalación / capacitación / equipo contado)',
      summaryDuringInstallments: 'd) Total mensual durante las cuotas',
      summaryAfterInstallments: 'e) Total mensual al terminar las cuotas',
      summaryInitialTotal: 'f) Total a pagar al inicio',
      summaryKnownSubtotal: 'Subtotal conocido',
      summaryFinalTotal: 'Total definitivo',
      summaryPendingNotice: 'Partidas por cotizar (no sumadas como RD$0.00):',
      summaryPendingAmount: 'Por cotizar',
      summaryOpenMobile: 'Ver desglose completo',
      summaryCloseMobile: 'Cerrar desglose',
      requestQuoteCta: 'Solicitar cotización',
      eInvoicingMonthlyLabel: 'Cuota mensual (Facturación electrónica)',
      eInvoicingSetupLabel: 'Cargo único de implementación',
      eInvoicingLimitsLabel: 'Límites aplicables',
    },
    quoteForm: {
      title: 'Solicitar cotización comercial',
      subtitle:
        'Adjuntaremos automáticamente tu configuración y el desglose visible. En esta vista previa el envío es simulado (Solo demo).',
      nameLabel: 'Nombre completo *',
      namePlaceholder: 'Ej. Carmen Rosa Pérez',
      businessLabel: 'Nombre del negocio *',
      businessPlaceholder: 'Ej. Mini Market La Esperanza',
      contactLabel: 'Correo electrónico o WhatsApp *',
      contactPlaceholder: 'dueno@negocio.do o 809-555-0190',
      businessTypeLabel: 'Tipo de negocio (opcional)',
      businessTypePlaceholder: 'Colmado, farmacia, ferretería, tienda…',
      branchesLabel: 'Número de sucursales (opcional)',
      commentsLabel: 'Comentarios adicionales (opcional)',
      commentsPlaceholder: 'Cuéntanos horarios, impresoras existentes o necesidades de nómina.',
      eInvoicingQuestionsTitle: 'Preguntas opcionales sobre facturación electrónica',
      eInvoicingAlreadyLabel: '¿Ya emites comprobantes electrónicos?',
      eInvoicingAlreadyEmpty: 'Prefiero definirlo en cotización',
      eInvoicingAlreadyYes: 'Sí, ya emito actualmente',
      eInvoicingAlreadyNo: 'No, sería primera implementación',
      eInvoicingAlreadyUnsure: 'En evaluación / no estoy seguro',
      eInvoicingBranchesLabel: '¿Cuántas sucursales necesitan emitir?',
      eInvoicingBranchesPlaceholder: 'Ej. 1',
      attachedConfigTitle: 'Configuración adjunta a la solicitud',
      submitButton: 'Enviar solicitud de cotización',
      submitting: 'Enviando solicitud…',
      errNameRequired: 'Ingresa tu nombre completo.',
      errBusinessRequired: 'Ingresa el nombre de tu negocio.',
      errContactRequired: 'Ingresa un correo electrónico válido o número de WhatsApp (mínimo 7 dígitos).',
      errServerGeneric: 'No pudimos registrar la solicitud en este intento. Intenta nuevamente.',
      simFaultLabel: 'Simular error de envío (Demo):',
      simFaultNone: 'Envío normal',
      simFaultError: 'Fallo temporal del servidor',
      confirmedDemoTitle: 'Solicitud registrada en modo demostración (Solo demo)',
      confirmedDemoNote:
        'Esta vista previa utiliza un cliente simulado: no se envió correo ni se generó compromiso real de cobro. En producción el servidor validará precios, disponibilidad y confirmará recepción.',
      quoteRefLabel: 'Referencia demo:',
      newConfigButton: 'Modificar configuración',
      whatsappCta: 'Continuar por WhatsApp',
    },
    faqSection: {
      title: 'Preguntas frecuentes',
      subtitle: 'Respuestas claras sobre módulos, capacitación, instalación, cuotas y sucursales.',
      pendingTag: 'Condición pendiente de definición comercial:',
      closingTitle: '¿Listo para estimar tu configuración ideal?',
      closingSubtitle:
        'Arma tu combinación de software o paquete completo de punto de venta en menos de dos minutos.',
    },
    footer: {
      tagline: 'Software comercial, caja, inventario y nómina diseñado para negocios de República Dominicana.',
      productCol: 'Sitio comercial',
      accessCol: 'Accesos de plataforma',
      superadminLink: 'Administración NetsRow (/platform/login)',
      clientLoginLink: 'Acceder al ERP (/login)',
      registerDemoLink: 'Registro demo (/register)',
      demoDisclaimer: 'Vista previa comercial con precios y equipos ilustrativos (Solo demo).',
    },
  },
  en: {
    nav: {
      features: 'Features',
      plans: 'Plans',
      electronicInvoicing: 'Electronic invoicing',
      posBundle: 'POS Bundle',
      faq: 'FAQ',
      erpAccess: 'Sign in to ERP',
      openMenu: 'Open menu',
      closeMenu: 'Close menu',
    },
    hero: {
      regionNote: 'ERP and point of sale for Dominican businesses · Demo preview',
      headline: 'Sales, inventory, and electronic invoicing in one place.',
      subtitle:
        'Run point of sale, cashbox, inventory, payroll, accounting, and modular e-CF electronic invoicing from one unified platform—software only or full POS bundle.',
      emailPlaceholder: 'Your work email or WhatsApp',
      emailValidationHint: 'Enter a valid email or WhatsApp number, e.g. ana@yourcompany.do',
      primaryCta: 'Configure your plan',
      secondaryCta: 'See full POS bundle',
      trustPoints: [
        'POS, cashbox, inventory & e-CF',
        'DR payroll, accounting & AR/AP',
        'Transparent RD$ quote & live demo',
      ],
      bottomTrustLead: 'Complete operational control in one ERP',
      bottomTrustDetail: 'with POS, payroll, accounting, and modular e-CF electronic invoicing readiness.',
      bottomTrustLink: 'Explore electronic invoicing',
      previewTabPos: 'POS Terminal',
      previewTabDash: 'ERP Overview',
      previewDemoNote: 'Demo only · Fictional data',
    },
    contractModes: {
      sectionTitle: 'What we offer',
      sectionSubtitle:
        'Choose cloud software only, build a complete counter POS bundle, or incorporate electronic invoicing into your NetsRow solution.',
      softwareTitle: 'A. Software only',
      softwareBadge: 'Already have a computer or tablet',
      softwareDesc:
        'Start with our cloud retail base plan and turn on only the optional modules your business needs.',
      softwarePoints: [
        'Clear monthly subscription in RD$',
        'Includes POS, Sales, Cashbox, Customers, Catalog & Inventory',
        'Optional guided training available as a one-time fee',
      ],
      softwareCta: 'Quote software only',
      bundleTitle: 'B. Complete POS bundle',
      bundleBadge: 'Built to launch a counter from day one',
      bundleDesc:
        'Combine NetsRow software with computer, thermal receipt printer, scanner, installation, and initial training.',
      bundlePoints: [
        'One-time hardware payment or monthly installments where available',
        'Illustrative hardware specs confirmed before dispatch',
        'Once installments finish, only the software subscription remains',
      ],
      bundleCta: 'Configure full POS bundle',
      eInvoicingTitle: 'Electronic invoicing for your business',
      eInvoicingBadge: 'Modular add-on · To be quoted',
      eInvoicingDesc:
        'Configure electronic invoicing for your business as part of your NetsRow solution. We help you define which receipts you need, how to integrate them into your daily operation, and what training your team requires.',
      eInvoicingPoints: [
        'Define which fiscal receipts fit your business model',
        'Guided integration with POS & sales plus team training',
        'Available with Software only or Complete POS bundle',
      ],
      eInvoicingCta: 'Quote electronic invoicing',
      eInvoicingSecondaryLink: 'See how it works',
    },
    modulesSection: {
      title: 'Modules designed for Dominican retail & SMBs',
      subtitle:
        'Each module card displays availability and illustrative monthly pricing. Capabilities marked «Demo only» run on simulated data in this preview.',
      basePlanGroupTitle: 'Included in the Commercial Base Plan',
      addonsGroupTitle: 'Configurable add-ons & roadmap',
      statusIncluded: 'Included',
      statusAddon: 'Available add-on',
      statusInDev: 'In development',
      consultPrice: 'Request pricing',
      demoOnlyTag: 'Demo only',
      dependsOnLabel: 'Requires:',
      configureCta: 'Configure in /planes',
      perMonth: '/mo',
    },
    eInvoicingSection: {
      title: 'Electronic invoicing for your business',
      subtitle:
        'Include electronic invoicing in your NetsRow quote. Tell us how you sell today so we can define the scope, setup, and onboarding your business needs.',
      cta: 'Quote electronic invoicing',
      previewBadge: 'Illustrative example',
      whatIsTitle: 'What is an e-CF and how does it differ from an internal receipt?',
      whatIsText:
        'Under DGII Taxpayer Guide No. 6, an Electronic Fiscal Receipt (e-CF) is a tax-valid digital document issued in standard format with a digital signature. By contrast, an internal sale receipt is a non-fiscal operational slip for counter tracking.',
      flowTitle: 'General electronic receipt workflow',
      flowSteps: [
        {
          title: '1. Issuance & digital signature',
          desc: 'The electronic receipt is generated from the sale and digitally signed.',
        },
        {
          title: '2. Submission for validation',
          desc: 'The document is transmitted for validation before official acceptance.',
        },
        {
          title: '3. Customer delivery',
          desc: 'Delivered to the buyer digitally or as a printed copy per channel.',
        },
      ],
      consultTitle: 'What you can define with NetsRow',
      consultPoints: [
        'Implementation scope across registers and branches',
        'Receipt types required by your commercial operation',
        'Operational setup in POS / Sales and staff training',
      ],
      verifiedNote:
        'Transparent scope: supported e-CF document types, authorized provider, integration scope, and available statuses are confirmed in your formal commercial proposal.',
      flowStep1Label: '1. Counter sale',
      flowStep1Value: 'Sale #VTA-0104 · Internal slip vs e-CF',
      flowStep2Label: '2. Issuance, signing & validation',
      flowStep2Value: 'Electronic workflow linked to the sale',
      flowStep3Label: '3. Delivery & tracking',
      detailsTitle: 'Scope defined alongside your quote',
      docTypesLabel: 'Receipt types',
      statesLabel: 'Workflow states',
      providerLabel: 'Provider',
      timelineLabel: 'Timeline',
      scopeLabel: 'Scope',
    },
    bundleSection: {
      title: 'Complete counter POS bundle',
      subtitle:
        'Launch your checkout counter with configured software, 80mm thermal printer, and practical team training.',
      specsTitle: 'Illustrative bundle contents',
      conditionsTitle: 'Configurable delivery and support conditions',
      trainingTitle: 'On-site installation and store training',
      trainingSubtitle:
        'We guide your team through printer setup, initial product loading, and shift open/close workflows.',
      warrantyLabel: 'Warranty',
      dispatchLabel: 'Dispatch & setup',
      supportLabel: 'Operational support',
      ctaConfigureBundle: 'Configure bundle in /planes',
    },
    configurator: {
      title: 'Plan & POS Bundle Configurator',
      subtitle:
        'Adjust mode, modules, hardware, and services. The summary shows illustrative RD$ amounts and separates any items requiring custom quoting.',
      backToHome: 'Back to overview',
      presetsLabel: 'Verifiable examples (Illustrative example):',
      presetSoftwarePayroll: 'Example: Base RD$1,500 + Payroll RD$600 = RD$2,100/mo',
      presetBundleInstallments:
        'Example: Bundle + Payroll + 6x RD$2,000 + Install RD$1,000',
      step1Title: '1. Mode',
      step1Desc: 'Choose «Software only» if you own hardware, or «Complete POS bundle» to add equipment and installation.',
      step2Title: '2. Plan & modules',
      step2Desc: 'Select your base plan and toggle add-ons without double-charging included modules.',
      step3Title: '3. Hardware, setup & installments',
      step3TitleSoftware: '3. Optional setup & training',
      step3Desc: 'Choose hardware kit, quantity, payment term, installation, and training.',
      step3DescSoftware: 'Select optional guided onboarding or training as a one-time fee.',
      step4Title: '4. Review & request quote',
      step4Desc: 'Inspect your full cost breakdown and send your contact details for follow-up.',
      nextStep: 'Continue',
      prevStep: 'Previous step',
      editConfigBtn: 'Edit configuration',
      qtyLabel: 'Station quantity',
      qtyMultiHint:
        'For more than 1 station or multiple branches, pricing and terms are finalized via custom quote.',
      dependencyWarningTitle: 'Required module dependency before continuing',
      dependencyConfirmBtn: 'Confirm required modules',
      paymentMethodLabel: 'Hardware payment option',
      installationLabel: 'Installation',
      trainingLabel: 'Training',
      summaryTitle: 'Illustrative quote summary',
      summarySoftwareMonthly: 'a) Monthly software subscription',
      summaryEquipmentMonthly: 'b) Monthly hardware installment',
      summaryInstallmentsSuffix: 'installments',
      summaryOneTimeCharges: 'c) One-time fees (setup / training / upfront hardware)',
      summaryDuringInstallments: 'd) Monthly total during installments',
      summaryAfterInstallments: 'e) Monthly total after installments end',
      summaryInitialTotal: 'f) Total due upfront',
      summaryKnownSubtotal: 'Known subtotal',
      summaryFinalTotal: 'Final total',
      summaryPendingNotice: 'Items to be quoted (not summed as RD$0.00):',
      summaryPendingAmount: 'To be quoted',
      summaryOpenMobile: 'View full breakdown',
      summaryCloseMobile: 'Close breakdown',
      requestQuoteCta: 'Request quote',
      eInvoicingMonthlyLabel: 'Monthly fee (Electronic invoicing)',
      eInvoicingSetupLabel: 'One-time implementation fee',
      eInvoicingLimitsLabel: 'Applicable limits',
    },
    quoteForm: {
      title: 'Request commercial quote',
      subtitle:
        'Your selected plan, modules, hardware, and visible breakdown are attached automatically. Submissions in this preview are simulated (Demo only).',
      nameLabel: 'Full name *',
      namePlaceholder: 'e.g. Carmen Rosa Pérez',
      businessLabel: 'Business name *',
      businessPlaceholder: 'e.g. Mini Market La Esperanza',
      contactLabel: 'Email or WhatsApp *',
      contactPlaceholder: 'owner@business.do or 809-555-0190',
      businessTypeLabel: 'Business type (optional)',
      businessTypePlaceholder: 'Grocery, pharmacy, hardware store, retail…',
      branchesLabel: 'Number of branches (optional)',
      commentsLabel: 'Additional comments (optional)',
      commentsPlaceholder: 'Share store hours, existing printers, or payroll needs.',
      eInvoicingQuestionsTitle: 'Optional electronic invoicing details',
      eInvoicingAlreadyLabel: 'Do you already issue electronic receipts?',
      eInvoicingAlreadyEmpty: 'Prefer to define during quoting',
      eInvoicingAlreadyYes: 'Yes, already issuing',
      eInvoicingAlreadyNo: 'No, first-time setup',
      eInvoicingAlreadyUnsure: 'Evaluating / not sure',
      eInvoicingBranchesLabel: 'How many branches need to issue?',
      eInvoicingBranchesPlaceholder: 'e.g. 1',
      attachedConfigTitle: 'Configuration attached to quote',
      submitButton: 'Submit quote request',
      submitting: 'Submitting request…',
      errNameRequired: 'Please enter your full name.',
      errBusinessRequired: 'Please enter your business name.',
      errContactRequired: 'Enter a valid email or WhatsApp phone number (at least 7 digits).',
      errServerGeneric: 'Could not submit the request right now. Please try again.',
      simFaultLabel: 'Simulate submission fault (Demo):',
      simFaultNone: 'Normal submit',
      simFaultError: 'Temporary server error',
      confirmedDemoTitle: 'Request logged in demo mode (Demo only)',
      confirmedDemoNote:
        'This preview uses a simulated client: no real email was sent and no financial commitment was created. In production, the server validates rates, stock, and confirms receipt.',
      quoteRefLabel: 'Demo reference:',
      newConfigButton: 'Modify configuration',
      whatsappCta: 'Continue on WhatsApp',
    },
    faqSection: {
      title: 'Frequently asked questions',
      subtitle: 'Clear answers on modules, training, installation, installment terms, and multi-branch quotes.',
      pendingTag: 'Condition pending commercial confirmation:',
      closingTitle: 'Ready to estimate your setup?',
      closingSubtitle:
        'Build your software plan or complete POS hardware bundle in under two minutes.',
    },
    footer: {
      tagline: 'Commercial POS, cashbox, inventory, and payroll software built for Dominican businesses.',
      productCol: 'Commercial site',
      accessCol: 'Platform access',
      superadminLink: 'NetsRow Admin (/platform/login)',
      clientLoginLink: 'Sign in to ERP (/login)',
      registerDemoLink: 'Demo registration (/register)',
      demoDisclaimer: 'Commercial preview with illustrative pricing and equipment (Demo only).',
    },
  },
};
