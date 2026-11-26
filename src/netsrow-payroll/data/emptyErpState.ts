import type { ErpDemoState } from '../types/erp';

export function createEmptyErpState(companyName: string): ErpDemoState {
  return {
    business: {
      currencyCode: 'DOP', currencySymbol: 'RD$', standardItbisRate: 0,
      payrollCycleLabelEs: '', payrollCycleLabelEn: '', allowNegativeStock: false,
      receiptFooterEs: '', receiptFooterEn: '',
    },
    company: { name: companyName, rnc: '', tssEmployerCode: '', address: '', phone: '', email: '' },
    branches: [], activeBranchId: '', users: [], roles: [],
    categories: [], brands: [], units: [], priceLists: [], products: [],
    customers: [], inventoryMovements: [], cashSessions: [], cashMovements: [], sales: [],
    internalDocs: [], suppliers: [], purchases: [], bankAccounts: [], bankTransactions: [],
    glAccounts: [], accountingPeriods: [], journalEntries: [], reconciliationItems: [],
    workRiskRules: [], conceptTreatmentRules: [],
    eInvoicing: {
      config: {
        environment: 'PRECERTIFICACION', emissionMethod: 'PROVEEDOR_CERTIFICADO',
        taxpayerGroup: 'PEQUENOS_MICRO', autoSubmitPosEcf: false, freeToolMonthlyLimit: 0, checklist: [],
        certificate: {
          alias: '', issuer: '', holderName: '', holderRnc: '',
          serialNumber: '', validFrom: '', validTo: '', status: 'EXPIRED',
        },
      },
      invoices: [], sequences: [],
    },
  };
}
