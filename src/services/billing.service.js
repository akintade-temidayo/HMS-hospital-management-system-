import { api } from './api';

export const billingService = {
  createInvoice: async (payload) => {
    const response = await api.post('/billings/invoices', payload);
    return response.data;
  },

  getInvoices: async (params) => {
    const response = await api.get('/billings/invoices', { params });
    return response.data;
  },

  payInvoice: async (invoiceId, payload) => {
    const response = await api.patch(`/billings/invoices/${invoiceId}/pay`, payload);
    return response.data;
  },

  createExpense: async (payload) => {
    const response = await api.post('/billings/expenses', payload);
    return response.data;
  },

  getExpenses: async (params) => {
    const response = await api.get('/billings/expenses', { params });
    return response.data;
  },

  getEncounterLedger: async (encounterId) => {
    const response = await api.get(`/billing/encounters/${encounterId}/ledger`);
    return response.data;
  },

  logPayment: async (payload) => {
    const response = await api.post('/billing/payments', payload);
    return response.data;
  },

  getDebts: async () => {
    const response = await api.get('/admin/billing/debts');
    return response.data;
  },

  getDashboardSummary: async () => {
    const response = await api.get('/analytics/cmd-dashboard');
    return response.data;
  },
};
