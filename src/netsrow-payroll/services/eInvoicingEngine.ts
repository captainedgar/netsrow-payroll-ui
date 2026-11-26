import {
  EcfStatus,
  EcfTypeCode,
  EcfTypeMeta,
  ElectronicInvoice,
} from '../types/einvoicing';
import { ActivityStatusType, CompanyProfile } from '../types/erp';
import { Locale } from '../types/payroll';

/**
 * Official 10 e-CF types defined in DGII Guía del Contribuyente No. 6 (Page 3).
 */
export const ECF_TYPE_CATALOG: EcfTypeMeta[] = [
  {
    code: '31',
    prefix: 'E31',
    nameEs: 'Factura de Crédito Fiscal Electrónica',
    nameEn: 'Electronic Tax Credit Invoice',
    shortEs: 'Crédito Fiscal',
    shortEn: 'Tax Credit',
    requiresBuyerRnc: true,
    requiresModifiedEcf: false,
    category: 'INGRESO',
    descriptionEs:
      'Sustenta gastos y costos para ISR o créditos fiscales de ITBIS entre contribuyentes con RNC.',
    descriptionEn:
      'Supports deductible expenses and ITBIS tax credits between registered RNC taxpayers.',
  },
  {
    code: '32',
    prefix: 'E32',
    nameEs: 'Factura de Consumo Electrónica',
    nameEn: 'Electronic Consumer Invoice',
    shortEs: 'Consumo',
    shortEn: 'Consumer',
    requiresBuyerRnc: false,
    requiresModifiedEcf: false,
    category: 'INGRESO',
    descriptionEs:
      'Acredita transferencia de bienes o servicios a consumidores finales. No otorga crédito fiscal.',
    descriptionEn:
      'Covers goods or services sold to final consumers. Not valid for business ITBIS credit.',
  },
  {
    code: '33',
    prefix: 'E33',
    nameEs: 'Nota de Débito Electrónica',
    nameEn: 'Electronic Debit Note',
    shortEs: 'Nota de Débito',
    shortEn: 'Debit Note',
    requiresBuyerRnc: true,
    requiresModifiedEcf: true,
    category: 'AJUSTE',
    descriptionEs:
      'Recupera costos adicionales o cargos posteriores que modifican un e-CF emitido previamente.',
    descriptionEn:
      'Applies upward adjustments or additional charges referencing an existing e-CF.',
  },
  {
    code: '34',
    prefix: 'E34',
    nameEs: 'Nota de Crédito Electrónica',
    nameEn: 'Electronic Credit Note',
    shortEs: 'Nota de Crédito',
    shortEn: 'Credit Note',
    requiresBuyerRnc: false,
    requiresModifiedEcf: true,
    category: 'AJUSTE',
    descriptionEs:
      'Anula o reduce operaciones, aplica devoluciones o descuentos sobre un e-CF existente.',
    descriptionEn:
      'Voids or reduces amounts, returns, or post-sale discounts referencing an existing e-CF.',
  },
  {
    code: '41',
    prefix: 'E41',
    nameEs: 'Comprobante de Compras Electrónico',
    nameEn: 'Electronic Purchase Voucher',
    shortEs: 'Compras',
    shortEn: 'Purchases',
    requiresBuyerRnc: true,
    requiresModifiedEcf: false,
    category: 'GASTO',
    descriptionEs:
      'Sustenta compras de bienes o servicios a personas físicas no registradas como contribuyentes.',
    descriptionEn:
      'Documents purchases from unregistered individuals or informal local suppliers.',
  },
  {
    code: '43',
    prefix: 'E43',
    nameEs: 'Comprobante para Gastos Menores Electrónico',
    nameEn: 'Electronic Petty Cash / Minor Expenses',
    shortEs: 'Gastos Menores',
    shortEn: 'Minor Expenses',
    requiresBuyerRnc: false,
    requiresModifiedEcf: false,
    category: 'GASTO',
    descriptionEs:
      'Respalda gastos menores del personal (peajes, pasajes, consumibles) sin NCF del proveedor.',
    descriptionEn:
      'Substantiates minor operational expenses (tolls, transit, incidentals) without vendor NCF.',
  },
  {
    code: '44',
    prefix: 'E44',
    nameEs: 'Comprobante para Regímenes Especiales Electrónico',
    nameEn: 'Electronic Special Regimes Invoice',
    shortEs: 'Regímenes Especiales',
    shortEn: 'Special Regimes',
    requiresBuyerRnc: true,
    requiresModifiedEcf: false,
    category: 'ESPECIAL',
    descriptionEs:
      'Ventas exentas de ITBIS/ISC a zonas francas, leyes de incentivo turístico o regímenes especiales.',
    descriptionEn:
      'Tax-exempt sales to Free Trade Zones, tourism incentive entities, or special regimes.',
  },
  {
    code: '45',
    prefix: 'E45',
    nameEs: 'Comprobante Gubernamental Electrónico',
    nameEn: 'Electronic Government Invoice',
    shortEs: 'Gubernamental',
    shortEn: 'Government',
    requiresBuyerRnc: true,
    requiresModifiedEcf: false,
    category: 'ESPECIAL',
    descriptionEs:
      'Facturación de bienes y servicios prestados a instituciones del Estado dominicano.',
    descriptionEn:
      'Billing for goods and services supplied to Dominican government entities.',
  },
  {
    code: '46',
    prefix: 'E46',
    nameEs: 'Comprobante para Exportaciones Electrónico',
    nameEn: 'Electronic Export Invoice',
    shortEs: 'Exportación',
    shortEn: 'Export',
    requiresBuyerRnc: false,
    requiresModifiedEcf: false,
    category: 'ESPECIAL',
    descriptionEs:
      'Documenta ventas de bienes exportados fuera del territorio aduanero dominicano.',
    descriptionEn:
      'Documents goods exported outside Dominican Republic customs territory.',
  },
  {
    code: '47',
    prefix: 'E47',
    nameEs: 'Comprobante para Pagos al Exterior Electrónico',
    nameEn: 'Electronic Foreign Payments Voucher',
    shortEs: 'Pagos Exterior',
    shortEn: 'Foreign Payments',
    requiresBuyerRnc: false,
    requiresModifiedEcf: false,
    category: 'GASTO',
    descriptionEs:
      'Sustenta pagos de rentas o servicios prestados por personas o entidades domiciliadas en el exterior.',
    descriptionEn:
      'Substantiates service payments and withholdings remitted to foreign non-resident entities.',
  },
];

export function getEcfTypeMeta(code: EcfTypeCode): EcfTypeMeta {
  return (
    ECF_TYPE_CATALOG.find((item) => item.code === code) ?? ECF_TYPE_CATALOG[0]
  );
}

/**
 * Exact DGII e-NCF format (Page 2):
 * "E" + 2-digit e-CF type + 10-digit sequence (13 chars total).
 */
export function formatENcf(ecfType: EcfTypeCode, sequenceNumber: number): string {
  const safeSeq = Math.max(1, Math.floor(sequenceNumber));
  return `E${ecfType}${String(safeSeq).padStart(10, '0')}`;
}

export function cleanTaxId(raw: string): string {
  return raw.replace(/[^0-9]/g, '');
}

export function validateDominicanTaxId(raw: string): {
  valid: boolean;
  digits: string;
  kind: 'RNC' | 'CEDULA' | 'INVALID';
} {
  const digits = cleanTaxId(raw);
  if (digits.length === 9) {
    return { valid: true, digits, kind: 'RNC' };
  }
  if (digits.length === 11) {
    return { valid: true, digits, kind: 'CEDULA' };
  }
  return { valid: false, digits, kind: 'INVALID' };
}

export function formatTaxIdDisplay(raw: string): string {
  const digits = cleanTaxId(raw);
  if (digits.length === 9) {
    return `${digits.slice(0, 1)}-${digits.slice(1, 3)}-${digits.slice(3, 8)}-${digits.slice(8)}`;
  }
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 10)}-${digits.slice(10)}`;
  }
  return raw || '—';
}

export function buildDeterministicSecurityCode(seed: string): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  let code = '';
  for (let i = 0; i < 6; i += 1) {
    const idx = Math.abs((hash >>> (i * 5)) ^ (hash + i * 31)) % alphabet.length;
    code += alphabet[idx];
  }
  return code;
}

export function buildTrackId(ecfType: EcfTypeCode, eNcf: string): string {
  let hash = 5381;
  for (let i = 0; i < eNcf.length; i += 1) {
    hash = (hash * 33) ^ eNcf.charCodeAt(i);
  }
  const suffix = Math.abs(hash % 900000) + 100000;
  return `TRK-DGII-E${ecfType}-${suffix}`;
}

export function buildEcfQrUrl(params: {
  emitterRnc: string;
  buyerRnc: string;
  eNcf: string;
  issueDate: string;
  totalAmount: number;
  digitalSignatureDate: string;
  securityCode: string;
}): string {
  const rncEmisor = cleanTaxId(params.emitterRnc);
  const rncComprador = cleanTaxId(params.buyerRnc);
  const dateOnly = params.issueDate.slice(0, 10);
  const qs = new URLSearchParams({
    RncEmisor: rncEmisor,
    ...(rncComprador ? { RncComprador: rncComprador } : {}),
    ENCF: params.eNcf,
    FechaEmision: dateOnly,
    MontoTotal: params.totalAmount.toFixed(2),
    FechaFirma: params.digitalSignatureDate,
    CodigoSeguridad: params.securityCode,
  });
  return `https://ecf.dgii.gov.do/ecf/ConsultaTimbre?${qs.toString()}`;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function buildEcfXml(
  invoice: Omit<ElectronicInvoice, 'xmlContent'>,
  company: CompanyProfile
): string {
  const emitterRnc = cleanTaxId(company.rnc);
  const buyerRnc = cleanTaxId(invoice.buyerRnc);
  const dateOnly = invoice.issueDate.slice(0, 10).split('-').reverse().join('-');

  const linesXml = invoice.items
    .map(
      (item, idx) => `    <Item>
      <NumeroLinea>${idx + 1}</NumeroLinea>
      <IndicadorFacturacion>${item.taxableItbis ? '1' : '4'}</IndicadorFacturacion>
      <NombreItem>${escapeXml(item.descriptionEs)}</NombreItem>
      <CantidadItem>${item.quantity.toFixed(2)}</CantidadItem>
      <UnidadMedida>${escapeXml(item.unitCode)}</UnidadMedida>
      <PrecioUnitarioItem>${item.unitPrice.toFixed(2)}</PrecioUnitarioItem>
      <MontoItem>${item.lineSubtotal.toFixed(2)}</MontoItem>
    </Item>`
    )
    .join('\n');

  const refBlock = invoice.modifiedENcf
    ? `\n  <InformacionReferencia>\n    <NCFModificado>${escapeXml(invoice.modifiedENcf)}</NCFModificado>\n    <CodigoModificacion>${invoice.modificationCode ?? '01'}</CodigoModificacion>\n  </InformacionReferencia>`
    : '';

  return `<?xml version="1.0" encoding="utf-8"?>
<ECF>
  <Encabezado>
    <Version>1.0</Version>
    <IdDoc>
      <TipoeCF>${invoice.ecfType}</TipoeCF>
      <eNCF>${escapeXml(invoice.eNcf)}</eNCF>
      <FechaVencimientoSecuencia>${invoice.expirationDate}</FechaVencimientoSecuencia>
      <TipoPago>${invoice.paymentMethod === 'CREDIT' ? '2' : '1'}</TipoPago>
    </IdDoc>
    <Emisor>
      <RNCEmisor>${emitterRnc}</RNCEmisor>
      <RazonSocialEmisor>${escapeXml(company.name)}</RazonSocialEmisor>
      <DireccionEmisor>${escapeXml(company.address)}</DireccionEmisor>
      <FechaEmision>${dateOnly}</FechaEmision>
    </Emisor>
    <Comprador>
      ${buyerRnc ? `<RNCComprador>${buyerRnc}</RNCComprador>` : '<!-- Consumidor Final -->'}
      <RazonSocialComprador>${escapeXml(invoice.buyerName)}</RazonSocialComprador>
    </Comprador>
    <Totales>
      <MontoGravadoTotal>${invoice.subtotalTaxable.toFixed(2)}</MontoGravadoTotal>
      <MontoExento>${invoice.subtotalExempt.toFixed(2)}</MontoExento>
      <TotalITBIS>${invoice.itbisTotal.toFixed(2)}</TotalITBIS>
      <MontoTotal>${invoice.totalAmount.toFixed(2)}</MontoTotal>
    </Totales>
  </Encabezado>
  <DetallesItems>
${linesXml}
  </DetallesItems>${refBlock}
  <FechaHoraFirma>${escapeXml(invoice.digitalSignatureDate)}</FechaHoraFirma>
  <Signature xmlns="http://www.w3.org/2000/09/xmldsig#">
    <SignatureValue>DEMO-RSA-${escapeXml(invoice.securityCode)}-${escapeXml(invoice.certificateSerial)}</SignatureValue>
  </Signature>
</ECF>`;
}

/**
 * Generates a crisp deterministic 25x25 QR-style matrix with 3 canonical finder squares
 * for visual Representación Impresa (RI) rendering without external dependencies.
 */
export function buildDeterministicQrMatrix(payload: string): boolean[][] {
  const size = 25;
  const grid: boolean[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => false)
  );
  const reserved: boolean[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => false)
  );

  const placeFinder = (top: number, left: number) => {
    for (let r = -1; r <= 7; r += 1) {
      for (let c = -1; c <= 7; c += 1) {
        const rr = top + r;
        const cc = left + c;
        if (rr < 0 || rr >= size || cc < 0 || cc >= size) continue;
        reserved[rr][cc] = true;
        if (r === -1 || r === 7 || c === -1 || c === 7) {
          grid[rr][cc] = false;
        } else {
          const isOuter = r === 0 || r === 6 || c === 0 || c === 6;
          const isInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
          grid[rr][cc] = isOuter || isInner;
        }
      }
    }
  };

  placeFinder(0, 0);
  placeFinder(0, size - 7);
  placeFinder(size - 7, 0);

  // Timing patterns
  for (let i = 8; i < size - 8; i += 1) {
    reserved[6][i] = true;
    grid[6][i] = i % 2 === 0;
    reserved[i][6] = true;
    grid[i][6] = i % 2 === 0;
  }

  // Deterministic pseudo-random fill from payload
  let seed = 2166136261;
  for (let i = 0; i < payload.length; i += 1) {
    seed ^= payload.charCodeAt(i);
    seed = Math.imul(seed, 16777619);
  }

  for (let r = 0; r < size; r += 1) {
    for (let c = 0; c < size; c += 1) {
      if (reserved[r][c]) continue;
      seed ^= (r * 31 + c * 17) & 0xff;
      seed = Math.imul(seed, 16777619);
      grid[r][c] = ((seed >>> 3) & 1) === 1;
    }
  }

  return grid;
}

export function getEcfStatusMeta(
  status: EcfStatus,
  locale: Locale
): {
  label: string;
  activityStatus: ActivityStatusType;
  validForFiscalCredit: boolean;
  guideExplanation: string;
} {
  switch (status) {
    case 'ACEPTADO':
      return {
        label: locale === 'es' ? 'Aceptado' : 'Accepted',
        activityStatus: 'approved',
        validForFiscalCredit: true,
        guideExplanation:
          locale === 'es'
            ? 'Válido para fines tributarios según validación estándar XML/firma DGII.'
            : 'Valid for fiscal purposes under DGII XML/signature validation.',
      };
    case 'ACEPTADO_CONDICIONAL':
      return {
        label: locale === 'es' ? 'Aceptado condicional' : 'Conditionally accepted',
        activityStatus: 'warning',
        validForFiscalCredit: true,
        guideExplanation:
          locale === 'es'
            ? 'Válido para fines tributarios, pero incluye observaciones no bloqueantes que deben corregirse en futuras emisiones.'
            : 'Valid for fiscal purposes, with non-blocking warnings to correct in future filings.',
      };
    case 'EN_PROCESO':
      return {
        label: locale === 'es' ? 'En proceso' : 'In process',
        activityStatus: 'pending',
        validForFiscalCredit: false,
        guideExplanation:
          locale === 'es'
            ? 'Recibido por DGII con TrackID; requiere consultar nuevamente el estado para conocer su validación definitiva.'
            : 'Received by DGII with TrackID; query TrackID again to retrieve final validation status.',
      };
    case 'RECHAZADO':
      return {
        label: locale === 'es' ? 'Rechazado' : 'Rejected',
        activityStatus: 'alert',
        validForFiscalCredit: false,
        guideExplanation:
          locale === 'es'
            ? 'No es válido para fines tributarios ni puede utilizarse para sustentar crédito fiscal. Debe corregirse y reemitirse.'
            : 'Not valid for fiscal purposes or tax credits. Must be corrected and reissued.',
      };
    case 'ANULADO':
      return {
        label: locale === 'es' ? 'Anulado' : 'Voided',
        activityStatus: 'closed',
        validForFiscalCredit: false,
        guideExplanation:
          locale === 'es'
            ? 'Comprobante anulado mediante el formato de anulación de e-NCF ante la DGII. Sin validez tributaria.'
            : 'Voided via DGII e-NCF cancellation format. No longer valid for tax credit.',
      };
  }
}
