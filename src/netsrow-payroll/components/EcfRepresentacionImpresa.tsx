import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Code2,
  Copy,
  Download,
  FileText,
  Printer,
  QrCode,
  SearchCheck,
  ShieldCheck,
} from 'lucide-react';
import { usePayrollWorkspace } from '../context/PayrollWorkspaceContext';
import {
  buildDeterministicQrMatrix,
  formatTaxIdDisplay,
  getEcfStatusMeta,
  getEcfTypeMeta,
} from '../services/eInvoicingEngine';
import { ElectronicInvoice } from '../types/einvoicing';
import { ErpModal } from './ErpUiPrimitives';
import { MoneyCell } from './MoneyCell';
import { StatusBadge } from './StatusBadge';

interface EcfRepresentacionImpresaProps {
  invoice: ElectronicInvoice | null;
  open: boolean;
  onClose: () => void;
  onVerifyInLookup?: (invoice: ElectronicInvoice) => void;
}

export const EcfRepresentacionImpresa: React.FC<EcfRepresentacionImpresaProps> = ({
  invoice,
  open,
  onClose,
  onVerifyInLookup,
}) => {
  const { erpState, locale, activeBranch, notifySuccess } = usePayrollWorkspace();
  const [activeTab, setActiveTab] = useState<'ri' | 'xml'>('ri');
  const [copiedXml, setCopiedXml] = useState(false);

  const qrMatrix = useMemo(
    () => (invoice ? buildDeterministicQrMatrix(invoice.qrPayloadUrl) : []),
    [invoice]
  );

  if (!invoice) return null;

  const typeMeta = getEcfTypeMeta(invoice.ecfType);
  const statusMeta = getEcfStatusMeta(invoice.status, locale);
  const branch =
    erpState.branches.find((b) => b.id === invoice.branchId) ?? activeBranch;

  const handleDownloadXml = () => {
    const blob = new Blob([invoice.xmlContent], {
      type: 'application/xml;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${invoice.eNcf}.xml`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    notifySuccess(
      locale === 'es'
        ? `Archivo ${invoice.eNcf}.xml descargado.`
        : `File ${invoice.eNcf}.xml downloaded.`
    );
  };

  const handleCopyXml = async () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(invoice.xmlContent);
        setCopiedXml(true);
        setTimeout(() => setCopiedXml(false), 1800);
      } catch {
        // Ignore clipboard errors in restricted frames
      }
    }
  };

  return (
    <ErpModal
      open={open}
      onClose={onClose}
      title={`${invoice.eNcf} · ${locale === 'es' ? typeMeta.nameEs : typeMeta.nameEn}`}
      closeLabel={locale === 'es' ? 'Cerrar' : 'Close'}
      maxWidthClass="max-w-4xl"
      footer={
        <div className="w-full flex flex-wrap items-center justify-between gap-2">
          <div className="text-[11px] text-[var(--nr-text-secondary)]">
            {locale === 'es'
              ? '*Modelo ilustrativo RI conforme Guía DGII No. 6 (Solo demo)'
              : '*Illustrative Printable RI per DGII Guide No. 6 (Demo only)'}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {onVerifyInLookup && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onVerifyInLookup(invoice);
                }}
                className="nr-focus-ring nr-transition inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface)] hover:bg-[var(--nr-surface-muted)] text-xs font-semibold text-[var(--nr-text)]"
              >
                <SearchCheck className="w-3.5 h-3.5 text-[var(--nr-primary)]" />
                <span>
                  {locale === 'es' ? 'Verificar en Consulta DGII' : 'Verify in DGII Lookup'}
                </span>
              </button>
            )}
            <button
              type="button"
              onClick={handleDownloadXml}
              className="nr-focus-ring nr-transition inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface)] hover:bg-[var(--nr-surface-muted)] text-xs font-semibold text-[var(--nr-text)]"
            >
              <Download className="w-3.5 h-3.5 text-[var(--nr-primary)]" />
              <span>{locale === 'es' ? 'Descargar XML' : 'Download XML'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined' && window.print) {
                  window.print();
                }
              }}
              className="nr-focus-ring nr-transition inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-[var(--nr-primary)] hover:bg-[var(--nr-primary-hover)] text-xs font-semibold text-[var(--nr-primary-fg)]"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{locale === 'es' ? 'Imprimir RI' : 'Print RI'}</span>
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* View switcher: RI vs XML */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-1 p-1 rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)]">
            <button
              type="button"
              onClick={() => setActiveTab('ri')}
              className={`nr-focus-ring nr-transition inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
                activeTab === 'ri'
                  ? 'bg-[var(--nr-primary)] text-[var(--nr-primary-fg)]'
                  : 'text-[var(--nr-text-secondary)] hover:text-[var(--nr-text)]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>
                {locale === 'es' ? 'Representación Impresa (RI)' : 'Printable View (RI)'}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('xml')}
              className={`nr-focus-ring nr-transition inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
                activeTab === 'xml'
                  ? 'bg-[var(--nr-primary)] text-[var(--nr-primary-fg)]'
                  : 'text-[var(--nr-text-secondary)] hover:text-[var(--nr-text)]'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>{locale === 'es' ? 'XML Firmado (DGII)' : 'Signed XML (DGII)'}</span>
            </button>
          </div>

          <StatusBadge
            activityStatus={statusMeta.activityStatus}
            locale={locale}
            label={statusMeta.label}
          />
        </div>

        {activeTab === 'ri' ? (
          <div className="rounded-2xl border border-[var(--nr-border)] bg-[var(--nr-surface-elevated)] p-4 sm:p-6 space-y-5">
            {/* Warning banner if voided or rejected */}
            {(invoice.status === 'ANULADO' || invoice.status === 'RECHAZADO') && (
              <div className="rounded-xl border border-[var(--nr-error-border)] bg-[var(--nr-error-bg)] px-4 py-2.5 text-xs font-bold text-[var(--nr-error)] text-center uppercase tracking-wide">
                {invoice.status === 'ANULADO'
                  ? locale === 'es'
                    ? `COMPROBANTE ANULADO (${invoice.voidedAt ?? ''}) — SIN VALIDEZ FISCAL`
                    : `DOCUMENT VOIDED (${invoice.voidedAt ?? ''}) — NOT VALID FOR TAX PURPOSES`
                  : locale === 'es'
                    ? 'COMPROBANTE RECHAZADO POR DGII — NO VÁLIDO PARA CRÉDITO FISCAL'
                    : 'REJECTED BY DGII — NOT VALID FOR TAX CREDIT'}
              </div>
            )}

            {/* Header Split: Emitter Info vs e-CF Box */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pb-4 border-b border-[var(--nr-border)]">
              <div className="md:col-span-7 space-y-1">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--nr-primary)]">
                  {locale === 'es' ? 'Ejemplo ilustrativo · Emisor Electrónico' : 'Illustrative Example · Electronic Issuer'}
                </div>
                <h3 className="font-display text-lg font-bold text-[var(--nr-text)]">
                  {erpState.company.name}
                </h3>
                <div className="text-xs text-[var(--nr-text-secondary)]">
                  {branch?.name ?? erpState.company.address}
                </div>
                <div className="text-xs text-[var(--nr-text-secondary)]">
                  {erpState.company.address} · {erpState.company.phone}
                </div>
                <div className="font-mono-num text-xs font-semibold text-[var(--nr-text)] pt-1">
                  RNC Emisor: {formatTaxIdDisplay(erpState.company.rnc)}
                </div>
              </div>

              <div className="md:col-span-5 rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface)] p-3.5 space-y-1.5 text-xs">
                <div className="font-bold text-[var(--nr-text)] uppercase leading-snug">
                  {locale === 'es' ? typeMeta.nameEs : typeMeta.nameEn}
                </div>
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-[var(--nr-border)]">
                  <span className="text-[var(--nr-text-secondary)]">e-NCF:</span>
                  <span className="font-mono-num font-bold text-[var(--nr-primary)] text-sm">
                    {invoice.eNcf}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[var(--nr-text-secondary)]">
                    {locale === 'es' ? 'Vencimiento secuencia:' : 'Sequence expires:'}
                  </span>
                  <span className="font-mono-num text-[var(--nr-text)]">
                    {invoice.expirationDate}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[var(--nr-text-secondary)]">
                    {locale === 'es' ? 'Fecha emisión:' : 'Issue date:'}
                  </span>
                  <span className="font-mono-num text-[var(--nr-text)]">
                    {invoice.issueDate}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[var(--nr-text-secondary)]">TrackID:</span>
                  <span className="font-mono-num text-[11px] text-[var(--nr-text-secondary)]">
                    {invoice.trackId}
                  </span>
                </div>
              </div>
            </div>

            {/* Buyer & Reference Data */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface)] p-3.5">
              <div className="space-y-1">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--nr-text-secondary)]">
                  {locale === 'es' ? 'Receptor / Comprador' : 'Recipient / Buyer'}
                </div>
                <div className="font-semibold text-[var(--nr-text)]">
                  {invoice.buyerName}
                </div>
                <div className="font-mono-num text-[var(--nr-text-secondary)]">
                  {invoice.buyerRnc
                    ? `RNC / Cédula: ${formatTaxIdDisplay(invoice.buyerRnc)}`
                    : locale === 'es'
                      ? 'Consumidor Final (Sin RNC requerido)'
                      : 'Final Consumer (No RNC required)'}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--nr-text-secondary)]">
                  {locale === 'es' ? 'Condiciones y Referencia' : 'Terms & Reference'}
                </div>
                <div className="text-[var(--nr-text)]">
                  {locale === 'es' ? 'Forma de pago:' : 'Payment:'}{' '}
                  <span className="font-semibold">{invoice.paymentMethod}</span>
                </div>
                {invoice.modifiedENcf && (
                  <div className="font-mono-num text-[var(--nr-primary)] font-semibold">
                    {locale === 'es' ? 'e-NCF Modificado:' : 'Modified e-NCF:'}{' '}
                    {invoice.modifiedENcf}
                  </div>
                )}
              </div>
            </div>

            {/* Line Items Table */}
            <div className="overflow-x-auto rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface)]">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--nr-border)] bg-[var(--nr-surface-muted)] text-[11px] font-semibold uppercase tracking-wider text-[var(--nr-text-secondary)]">
                    <th className="py-2.5 px-3">{locale === 'es' ? 'Cant.' : 'Qty'}</th>
                    <th className="py-2.5 px-3">{locale === 'es' ? 'Descripción' : 'Description'}</th>
                    <th className="py-2.5 px-3">{locale === 'es' ? 'Unidad' : 'Unit'}</th>
                    <th className="py-2.5 px-3 text-right">{locale === 'es' ? 'Precio' : 'Price'}</th>
                    <th className="py-2.5 px-3 text-right">ITBIS</th>
                    <th className="py-2.5 px-3 text-right">{locale === 'es' ? 'Valor' : 'Amount'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--nr-border)]">
                  {invoice.items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-2.5 px-3 font-mono-num text-[var(--nr-text)]">
                        {item.quantity}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-[var(--nr-text)]">
                        {locale === 'es' ? item.descriptionEs : item.descriptionEn}
                      </td>
                      <td className="py-2.5 px-3 font-mono-num text-[var(--nr-text-secondary)]">
                        {item.unitCode}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono-num">
                        RD${item.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono-num text-[var(--nr-text-secondary)]">
                        RD${item.itbisAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <MoneyCell amount={item.lineTotal} locale={locale} emphasize />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bottom Split: QR Code & Digital Signature + Totals */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
              <div className="md:col-span-7 rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface)] p-3.5 flex items-center gap-4">
                <div className="shrink-0 rounded-lg bg-white p-2 border border-slate-200">
                  <svg
                    viewBox="0 0 25 25"
                    className="w-24 h-24 text-slate-900"
                    role="img"
                    aria-label={`QR ${invoice.eNcf}`}
                  >
                    <rect width="25" height="25" fill="#ffffff" />
                    {qrMatrix.map((row, rIdx) =>
                      row.map((cell, cIdx) =>
                        cell ? (
                          <rect
                            key={`${rIdx}-${cIdx}`}
                            x={cIdx}
                            y={rIdx}
                            width={1}
                            height={1}
                            fill="#0B1728"
                          />
                        ) : null
                      )
                    )}
                  </svg>
                </div>

                <div className="min-w-0 space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5 font-semibold text-[var(--nr-primary)]">
                    <QrCode className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      {locale === 'es'
                        ? 'Timbre Electrónico e-CF'
                        : 'Electronic e-CF Stamp'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[var(--nr-text-secondary)]">
                      {locale === 'es' ? 'Código de Seguridad:' : 'Security Code:'}{' '}
                    </span>
                    <span className="font-mono-num font-bold text-[var(--nr-text)]">
                      {invoice.securityCode}
                    </span>
                  </div>
                  <div>
                    <span className="text-[var(--nr-text-secondary)]">
                      {locale === 'es' ? 'Fecha de Firma Digital:' : 'Digital Signature:'}{' '}
                    </span>
                    <span className="font-mono-num text-[var(--nr-text)]">
                      {invoice.digitalSignatureDate}
                    </span>
                  </div>
                  <div className="text-[11px] text-[var(--nr-text-secondary)] flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[var(--nr-primary)] shrink-0" />
                    <span className="truncate">
                      {invoice.signatureAlgorithm} · {invoice.certificateSerial}
                    </span>
                  </div>
                </div>
              </div>

              <div className="md:col-span-5 rounded-xl border border-[var(--nr-border)] bg-[var(--nr-surface)] p-3.5 space-y-1.5 text-xs flex flex-col justify-center">
                <div className="flex justify-between text-[var(--nr-text-secondary)]">
                  <span>{locale === 'es' ? 'Subtotal gravado' : 'Taxable subtotal'}</span>
                  <MoneyCell amount={invoice.subtotalTaxable} locale={locale} />
                </div>
                <div className="flex justify-between text-[var(--nr-text-secondary)]">
                  <span>{locale === 'es' ? 'Subtotal exento' : 'Exempt subtotal'}</span>
                  <MoneyCell amount={invoice.subtotalExempt} locale={locale} />
                </div>
                {invoice.discountAmount > 0 && (
                  <div className="flex justify-between text-[var(--nr-warning)]">
                    <span>{locale === 'es' ? 'Descuento' : 'Discount'}</span>
                    <MoneyCell amount={-invoice.discountAmount} locale={locale} />
                  </div>
                )}
                <div className="flex justify-between text-[var(--nr-text-secondary)]">
                  <span>{locale === 'es' ? 'Total ITBIS' : 'Total ITBIS'}</span>
                  <MoneyCell amount={invoice.itbisTotal} locale={locale} />
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-[var(--nr-border)] font-bold text-sm text-[var(--nr-text)]">
                  <span>{locale === 'es' ? 'Total RD$' : 'Total RD$'}</span>
                  <MoneyCell amount={invoice.totalAmount} locale={locale} size="lg" emphasize />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs text-[var(--nr-text-secondary)]">
                {locale === 'es'
                  ? 'Estructura XML estándar DGII firmada digitalmente (Simulación demo).'
                  : 'Digitally signed DGII standard XML payload (Demo simulation).'}
              </div>
              <button
                type="button"
                onClick={handleCopyXml}
                className="nr-focus-ring nr-transition inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-[var(--nr-border)] bg-[var(--nr-surface)] hover:bg-[var(--nr-surface-muted)] text-xs font-semibold text-[var(--nr-text)]"
              >
                {copiedXml ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-[var(--nr-success)]" />
                    <span>{locale === 'es' ? 'Copiado' : 'Copied'}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>{locale === 'es' ? 'Copiar XML' : 'Copy XML'}</span>
                  </>
                )}
              </button>
            </div>
            <pre className="rounded-xl border border-[#1E334A] bg-[#081321] text-slate-100 p-4 text-[11px] font-mono-num overflow-x-auto max-h-[420px] leading-relaxed">
              {invoice.xmlContent}
            </pre>
          </div>
        )}
      </div>
    </ErpModal>
  );
};
