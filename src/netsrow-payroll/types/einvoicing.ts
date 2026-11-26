export type EcfTypeCode =
  | '31'
  | '32'
  | '33'
  | '34'
  | '41'
  | '43'
  | '44'
  | '45'
  | '46'
  | '47';

export type EcfStatus =
  | 'ACEPTADO'
  | 'ACEPTADO_CONDICIONAL'
  | 'EN_PROCESO'
  | 'RECHAZADO'
  | 'ANULADO';

export type EcfEmissionMethod =
  | 'PROVEEDOR_CERTIFICADO'
  | 'DESARROLLO_PROPIO'
  | 'FACTURADOR_GRATUITO';

export type EcfEnvironment = 'PRECERTIFICACION' | 'PRODUCCION';

export type EcfTaxpayerGroup =
  | 'GRANDES_NACIONALES'
  | 'GRANDES_LOCALES_MEDIANOS'
  | 'PEQUENOS_MICRO';

export type EcfSimulationOutcome =
  | 'AUTO_ACCEPTED'
  | 'CONDITIONAL'
  | 'IN_PROCESS'
  | 'REJECTED';

export type EcfBuyerType =
  | 'CORPORATE'
  | 'INDIVIDUAL'
  | 'SUPPLIER'
  | 'GOVERNMENT'
  | 'FOREIGN';

export interface EcfTypeMeta {
  code: EcfTypeCode;
  prefix: `E${EcfTypeCode}`;
  nameEs: string;
  nameEn: string;
  shortEs: string;
  shortEn: string;
  requiresBuyerRnc: boolean;
  requiresModifiedEcf: boolean;
  category: 'INGRESO' | 'AJUSTE' | 'GASTO' | 'ESPECIAL';
  descriptionEs: string;
  descriptionEn: string;
}

export interface EcfLineItem {
  id: string;
  productId?: string;
  sku?: string;
  descriptionEs: string;
  descriptionEn: string;
  unitCode: string;
  quantity: number;
  unitPrice: number;
  taxableItbis: boolean;
  itbisRate: number;
  itbisAmount: number;
  lineSubtotal: number;
  lineTotal: number;
}

export interface ElectronicInvoice {
  id: string;
  eNcf: string;
  ecfType: EcfTypeCode;
  trackId: string;
  securityCode: string;
  digitalSignatureDate: string;
  signatureAlgorithm: string;
  certificateSerial: string;
  status: EcfStatus;
  statusMessageEs: string;
  statusMessageEn: string;
  observationEs?: string;
  observationEn?: string;
  issueDate: string;
  expirationDate: string;
  branchId: string;
  saleId?: string | null;
  modifiedENcf?: string;
  modificationCode?: '01' | '02' | '03';
  buyerId?: string;
  buyerName: string;
  buyerRnc: string;
  buyerType: EcfBuyerType;
  paymentMethod: 'CASH' | 'CARD' | 'TRANSFER' | 'CREDIT';
  items: EcfLineItem[];
  subtotalTaxable: number;
  subtotalExempt: number;
  discountAmount: number;
  itbisTotal: number;
  totalAmount: number;
  qrPayloadUrl: string;
  xmlContent: string;
  voidReason?: string;
  voidedAt?: string;
}

export interface EcfSequenceRange {
  id: string;
  ecfType: EcfTypeCode;
  prefix: `E${EcfTypeCode}`;
  fromSeq: number;
  toSeq: number;
  nextSeq: number;
  authorizationNumber: string;
  expirationDate: string;
  branchId: string;
  active: boolean;
  alertThreshold: number;
}

export interface EcfDigitalCertificate {
  alias: string;
  issuer: string;
  holderName: string;
  holderRnc: string;
  serialNumber: string;
  validFrom: string;
  validTo: string;
  status: 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED';
}

export interface EcfChecklistItem {
  id: string;
  group: 'AUTHORIZATION' | 'FREE_TOOL';
  stepNumber: number;
  titleEs: string;
  titleEn: string;
  detailEs: string;
  detailEn: string;
  completed: boolean;
}

export interface EcfConfigState {
  environment: EcfEnvironment;
  emissionMethod: EcfEmissionMethod;
  taxpayerGroup: EcfTaxpayerGroup;
  certificate: EcfDigitalCertificate;
  freeToolMonthlyLimit: number;
  autoSubmitPosEcf: boolean;
  checklist: EcfChecklistItem[];
}

export interface EInvoicingState {
  config: EcfConfigState;
  sequences: EcfSequenceRange[];
  invoices: ElectronicInvoice[];
}
