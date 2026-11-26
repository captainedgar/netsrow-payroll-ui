import type { QuoteSubmissionPayload, QuoteSubmissionResult } from '../types/commercial';
import { MockCommercialClient } from './mockCommercialClient';

export const serverQuoteIntake = import.meta.env.VITE_NETSROW_COMMERCIAL_INTAKE === 'true';

export class HttpCommercialClient extends MockCommercialClient {
  async submitQuoteRequest(payload: QuoteSubmissionPayload): Promise<QuoteSubmissionResult> {
    const { locale, selection, contact } = payload;
    const response = await fetch('/api/commercial/quote-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale, selection, contact }),
    });
    if (!response.ok) throw new Error('QUOTE_SUBMIT_FAILED');
    const { quoteReference, submittedAt } = await response.json();
    if (typeof quoteReference !== 'string' || typeof submittedAt !== 'string') {
      throw new Error('QUOTE_SUBMIT_FAILED');
    }

    return {
      quoteReference,
      submittedAt,
      isDemoConfirmation: false,
      messageEs: 'Solicitud recibida. Los importes quedan por cotizar.',
      messageEn: 'Request received. Pricing is pending a quote.',
      payload,
    };
  }
}
