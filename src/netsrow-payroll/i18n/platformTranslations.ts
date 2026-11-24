import { Locale } from '../types/payroll';
import {
  AuditEventType,
  PaymentStatus,
  SubscriptionStatus,
  SupportTicketCategory,
  SupportTicketStatus,
  TenantStatus,
} from '../types/platform';

export interface PlatformTranslations {
  auth: {
    demoBanner: string;
    tenantLoginTitle: string;
    tenantLoginSubtitle: string;
    platformLoginTitle: string;
    platformLoginSubtitle: string;
    emailLabel: string;
    emailPlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    showPassword: string;
    hidePassword: string;
    signInButton: string;
    signingIn: string;
    logoutButton: string;
    goToPlatformLogin: string;
    goToTenantLogin: string;
    goToRegister: string;
    forgotPasswordDemo: string;
    forgotPasswordTitle: string;
    forgotPasswordDesc: string;
    forgotPasswordSent: string;
    backToLogin: string;
    demoProfilesTitle: string;
    demoProfilesSubtitle: string;
    faultSimLabel: string;
    faultNone: string;
    faultUnavailable: string;
    faultExpired: string;
    twoFactorToggle: string;
    twoFactorTitle: string;
    twoFactorDesc: string;
    twoFactorCodeLabel: string;
    twoFactorVerifyButton: string;
    multiTenantTitle: string;
    multiTenantSubtitle: string;
    selectCompanyButton: string;
    errEmailRequired: string;
    errPasswordRequired: string;
    errInvalidCredentials: string;
    errSessionExpired: string;
    errServiceUnavailable: string;
    errPlatformForbidden: string;
    errTwoFactorInvalid: string;
    restrictedTitle: string;
    restrictedBody: string;
    restrictedReason: string;
    backToMyErp: string;
    registerTitle: string;
    registerSubtitle: string;
    registerSubmit: string;
    registerSuccess: string;
    productHighlightsTitle: string;
    productHighlight1: string;
    productHighlight2: string;
    productHighlight3: string;
  };
  platformNav: {
    brandTitle: string;
    brandSubtitle: string;
    overview: string;
    tenants: string;
    plans: string;
    subscriptions: string;
    support: string;
    audit: string;
    resetDemo: string;
    collapseSidebar: string;
    expandSidebar: string;
    openMenu: string;
    operatorRoleLabel: string;
    demoTag: string;
    contractNote: string;
  };
  tenantStatuses: Record<TenantStatus, string>;
  subscriptionStatuses: Record<SubscriptionStatus, string>;
  paymentStatuses: Record<PaymentStatus, string>;
  ticketStatuses: Record<SupportTicketStatus, string>;
  ticketCategories: Record<SupportTicketCategory, string>;
  auditEvents: Record<AuditEventType, string>;
}

export const PLATFORM_TRANSLATIONS: Record<Locale, PlatformTranslations> = {
  es: {
    auth: {
      demoBanner: 'Vista previa demo · Datos ficticios',
      tenantLoginTitle: 'Acceso a NetsRow ERP',
      tenantLoginSubtitle:
        'Inicia sesión con tu cuenta empresarial para administrar operación, finanzas y nómina según los módulos contratados.',
      platformLoginTitle: 'Administración de NetsRow',
      platformLoginSubtitle:
        'Consola exclusiva para operadores de plataforma. Gestiona empresas, planes, módulos y auditoría SaaS.',
      emailLabel: 'Correo electrónico',
      emailPlaceholder: 'usuario@empresa.do',
      passwordLabel: 'Contraseña',
      passwordPlaceholder: 'Ingresa tu contraseña',
      showPassword: 'Mostrar contraseña',
      hidePassword: 'Ocultar contraseña',
      signInButton: 'Iniciar sesión',
      signingIn: 'Validando acceso…',
      logoutButton: 'Cerrar sesión',
      goToPlatformLogin: 'Acceso Superadmin (/platform/login)',
      goToTenantLogin: 'Acceso de empresa (/login)',
      goToRegister: 'Solicitar registro de empresa (/register)',
      forgotPasswordDemo: '¿Olvidaste tu contraseña? (Demo)',
      forgotPasswordTitle: 'Recuperación de contraseña (Solo demo)',
      forgotPasswordDesc:
        'En el entorno productivo, NetsRow envía un enlace de restablecimiento temporal verificado por el servidor. Esta vista simula el envío sin credenciales reales.',
      forgotPasswordSent:
        'Solicitud simulada registrada para el correo indicado (Solo demo).',
      backToLogin: 'Volver al inicio de sesión',
      demoProfilesTitle: 'Perfiles ficticios de demostración',
      demoProfilesSubtitle:
        'Control exclusivo de demostración (no presente en producción). Haz clic para cargar correo y clave ficticia:',
      faultSimLabel: 'Simular estado del servicio:',
      faultNone: 'Operativo normal',
      faultUnavailable: 'Servicio inaccesible (503)',
      faultExpired: 'Sesión expirada (401)',
      twoFactorToggle: 'Simular verificación adicional 2FA (Solo demo)',
      twoFactorTitle: 'Verificación adicional de operador (Solo demo)',
      twoFactorDesc:
        'Paso demostrativo de segundo factor para acceso a plataforma. Ingresa el código ficticio 246810.',
      twoFactorCodeLabel: 'Código de verificación (6 dígitos)',
      twoFactorVerifyButton: 'Verificar y acceder a /platform',
      multiTenantTitle: 'Selecciona tu empresa autorizada',
      multiTenantSubtitle:
        'El servidor confirmó acceso multiempresa para esta cuenta. Elige el contexto operativo:',
      selectCompanyButton: 'Entrar al ERP',
      errEmailRequired: 'Ingresa un correo electrónico válido.',
      errPasswordRequired: 'Ingresa tu contraseña (mínimo 6 caracteres).',
      errInvalidCredentials:
        'Credenciales inválidas. Verifica tu correo y contraseña e inténtalo nuevamente.',
      errSessionExpired:
        'Tu sesión anterior expiró por seguridad. Inicia sesión nuevamente para continuar.',
      errServiceUnavailable:
        'El servicio de autenticación de NetsRow no está disponible en este momento (503). Intenta nuevamente en unos minutos.',
      errPlatformForbidden:
        'Acceso denegado: tu cuenta pertenece a una empresa cliente y no posee permisos de operador de plataforma.',
      errTwoFactorInvalid:
        'Código de verificación incorrecto. Usa el código demo 246810.',
      restrictedTitle: 'Acceso restringido',
      restrictedBody:
        'El área de Administración de NetsRow (/platform) está reservada exclusivamente para operadores autorizados de la plataforma.',
      restrictedReason:
        'Tu sesión actual corresponde a una cuenta de empresa cliente. Ser dueño o administrador de una empresa no concede acceso a la consola de plataforma.',
      backToMyErp: 'Volver a mi ERP',
      registerTitle: 'Registro de nueva empresa (Solo demo)',
      registerSubtitle:
        'Vista de demostración para alta comercial en NetsRow ERP. No crea cuentas reales ni procesa cobros.',
      registerSubmit: 'Enviar solicitud demo',
      registerSuccess:
        'Solicitud demo registrada. Usa uno de los perfiles ficticios en /login para explorar el ERP.',
      productHighlightsTitle: 'Plataforma SaaS multiempresa para República Dominicana',
      productHighlight1: 'Operación comercial unificada: POS, caja, inventario y facturación interna.',
      productHighlight2: 'Contabilidad general integrada: diario, mayor, balanza y conciliación.',
      productHighlight3: 'Módulo opcional de Nómina DO con cálculo proporcional, TSS e ISR.',
    },
    platformNav: {
      brandTitle: 'Administración de NetsRow',
      brandSubtitle: 'PLATAFORMA SAAS · SUPERADMIN',
      overview: 'Inicio',
      tenants: 'Empresas',
      plans: 'Planes y módulos',
      subscriptions: 'Suscripciones',
      support: 'Soporte',
      audit: 'Auditoría',
      resetDemo: 'Restablecer datos demo',
      collapseSidebar: 'Contraer menú',
      expandSidebar: 'Expandir menú',
      openMenu: 'Abrir menú de plataforma',
      operatorRoleLabel: 'Operador Plataforma',
      demoTag: 'Solo demo',
      contractNote: 'Contrato API SaaS pendiente de integración HTTP',
    },
    tenantStatuses: {
      ACTIVE: 'Activa',
      TRIAL: 'En prueba',
      SUSPENDED: 'Suspendida',
    },
    subscriptionStatuses: {
      ACTIVE: 'Vigente',
      TRIALING: 'En período de prueba',
      PAST_DUE: 'Vencida',
      SUSPENDED: 'Suspendida',
    },
    paymentStatuses: {
      PAID: 'Al día',
      PENDING_CONFIRMATION: 'Pendiente de confirmar',
      OVERDUE: 'Pago vencido',
    },
    ticketStatuses: {
      OPEN: 'Abierto',
      IN_PROGRESS: 'En curso',
      RESOLVED: 'Resuelto',
    },
    ticketCategories: {
      BILLING: 'Facturación y pagos',
      ACCESS: 'Accesos y roles',
      MODULE: 'Módulos y planes',
      TECHNICAL: 'Soporte técnico',
    },
    auditEvents: {
      PLAN_CHANGE: 'Cambio de plan',
      MODULE_TOGGLE: 'Cambio de módulo',
      PRICE_CHANGE: 'Ajuste de precio',
      SUSPEND: 'Suspensión',
      REACTIVATE: 'Reactivación',
      PAYMENT_CONFIRM: 'Confirmación manual de pago',
      PLAN_CATALOG_EDIT: 'Edición catálogo de planes',
    },
  },
  en: {
    auth: {
      demoBanner: 'Demo preview · Fictional data',
      tenantLoginTitle: 'NetsRow ERP Sign In',
      tenantLoginSubtitle:
        'Sign in with your business account to manage operations, finance, and payroll according to your contracted modules.',
      platformLoginTitle: 'NetsRow Platform Administration',
      platformLoginSubtitle:
        'Exclusive console for platform operators. Manage tenant companies, plans, modules, and SaaS audit logs.',
      emailLabel: 'Email address',
      emailPlaceholder: 'user@company.do',
      passwordLabel: 'Password',
      passwordPlaceholder: 'Enter your password',
      showPassword: 'Show password',
      hidePassword: 'Hide password',
      signInButton: 'Sign in',
      signingIn: 'Verifying access…',
      logoutButton: 'Sign out',
      goToPlatformLogin: 'Superadmin Sign In (/platform/login)',
      goToTenantLogin: 'Company Sign In (/login)',
      goToRegister: 'Request company onboarding (/register)',
      forgotPasswordDemo: 'Forgot password? (Demo)',
      forgotPasswordTitle: 'Password recovery (Demo only)',
      forgotPasswordDesc:
        'In production, NetsRow sends a server-verified reset link. This view simulates the request without real credentials.',
      forgotPasswordSent: 'Simulated recovery request logged for this email (Demo only).',
      backToLogin: 'Back to sign in',
      demoProfilesTitle: 'Fictional demo accounts',
      demoProfilesSubtitle:
        'Demo-only control (omitted in production). Click a profile to load its fictional credentials:',
      faultSimLabel: 'Simulate service state:',
      faultNone: 'Normal operation',
      faultUnavailable: 'Service unreachable (503)',
      faultExpired: 'Session expired (401)',
      twoFactorToggle: 'Simulate extra 2FA verification (Demo only)',
      twoFactorTitle: 'Operator second-factor check (Demo only)',
      twoFactorDesc:
        'Demonstrates additional platform security verification. Enter fictional code 246810.',
      twoFactorCodeLabel: 'Verification code (6 digits)',
      twoFactorVerifyButton: 'Verify and open /platform',
      multiTenantTitle: 'Choose your authorized company',
      multiTenantSubtitle:
        'The server confirmed multi-company membership. Select the workspace context:',
      selectCompanyButton: 'Enter ERP',
      errEmailRequired: 'Please enter a valid email address.',
      errPasswordRequired: 'Please enter your password (minimum 6 characters).',
      errInvalidCredentials:
        'Invalid credentials. Please verify your email and password and try again.',
      errSessionExpired:
        'Your previous session expired for security. Please sign in again to continue.',
      errServiceUnavailable:
        'NetsRow authentication service is currently unreachable (503). Please try again shortly.',
      errPlatformForbidden:
        'Access denied: this account belongs to a client tenant and lacks platform operator privileges.',
      errTwoFactorInvalid:
        'Incorrect verification code. Use demo code 246810.',
      restrictedTitle: 'Restricted access',
      restrictedBody:
        'NetsRow Platform Administration (/platform) is reserved exclusively for authorized platform operators.',
      restrictedReason:
        'Your current session belongs to a client business account. Being a business owner or company admin does not grant platform access.',
      backToMyErp: 'Back to my ERP',
      registerTitle: 'New business registration (Demo only)',
      registerSubtitle:
        'Demonstration onboarding form for NetsRow ERP. Does not create real accounts or process payments.',
      registerSubmit: 'Submit demo request',
      registerSuccess:
        'Demo request recorded. Use one of the fictional accounts in /login to explore the ERP.',
      productHighlightsTitle: 'Multi-tenant SaaS ERP for the Dominican Republic',
      productHighlight1: 'Unified commercial ops: POS, cashbox, inventory, and internal receipts.',
      productHighlight2: 'Integrated general accounting: journal, ledger, trial balance, reconciliation.',
      productHighlight3: 'Optional Payroll DO module with proportional salary, TSS, and ISR.',
    },
    platformNav: {
      brandTitle: 'NetsRow Administration',
      brandSubtitle: 'SAAS PLATFORM · SUPERADMIN',
      overview: 'Overview',
      tenants: 'Companies',
      plans: 'Plans & Modules',
      subscriptions: 'Subscriptions',
      support: 'Support',
      audit: 'Audit Log',
      resetDemo: 'Reset demo data',
      collapseSidebar: 'Collapse menu',
      expandSidebar: 'Expand menu',
      openMenu: 'Open platform menu',
      operatorRoleLabel: 'Platform Operator',
      demoTag: 'Demo only',
      contractNote: 'SaaS API contract ready for HTTP integration',
    },
    tenantStatuses: {
      ACTIVE: 'Active',
      TRIAL: 'Trial',
      SUSPENDED: 'Suspended',
    },
    subscriptionStatuses: {
      ACTIVE: 'Active',
      TRIALING: 'Trialing',
      PAST_DUE: 'Past due',
      SUSPENDED: 'Suspended',
    },
    paymentStatuses: {
      PAID: 'Paid',
      PENDING_CONFIRMATION: 'Pending confirmation',
      OVERDUE: 'Overdue',
    },
    ticketStatuses: {
      OPEN: 'Open',
      IN_PROGRESS: 'In progress',
      RESOLVED: 'Resolved',
    },
    ticketCategories: {
      BILLING: 'Billing & payments',
      ACCESS: 'Access & roles',
      MODULE: 'Modules & plans',
      TECHNICAL: 'Technical support',
    },
    auditEvents: {
      PLAN_CHANGE: 'Plan change',
      MODULE_TOGGLE: 'Module toggle',
      PRICE_CHANGE: 'Price adjustment',
      SUSPEND: 'Suspension',
      REACTIVATE: 'Reactivation',
      PAYMENT_CONFIRM: 'Manual payment confirmation',
      PLAN_CATALOG_EDIT: 'Plan catalog edit',
    },
  },
};
