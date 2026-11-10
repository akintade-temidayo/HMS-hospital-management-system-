import { api } from './api';

export const governanceService = {
  createReport: async (payload) => {
    const response = await api.post('/governance/reports', payload);
    return response.data;
  },

  getReports: async (params) => {
    const response = await api.get('/governance/reports', { params });
    return response.data;
  },

  getPolicies: async () => {
    const response = await api.get('/governance/policies');
    return response.data;
  },

  createPolicy: async (payload) => {
    const response = await api.post('/governance/policies', payload);
    return response.data;
  },

  updatePolicy: async (policyId, payload) => {
    const response = await api.patch(`/governance/policies/${policyId}`, payload);
    return response.data;
  },

  deletePolicy: async (policyId) => {
    const response = await api.delete(`/governance/policies/${policyId}`);
    return response.data;
  },

  createBudget: async (payload) => {
    const response = await api.post('/governance/budgets', payload);
    return response.data;
  },

  getBudgets: async (params) => {
    const response = await api.get('/governance/budgets', { params });
    return response.data;
  },

  updateBudget: async (budgetId, payload) => {
    const response = await api.patch(`/governance/budgets/${budgetId}`, payload);
    return response.data;
  },

  disableUserAccount: async (userId) => {
    const response = await api.patch(`/governance/users/${userId}/disable`);
    return response.data;
  },

  deactivateDepartment: async (departmentId) => {
    const response = await api.delete(`/governance/departments/${departmentId}`);
    return response.data;
  },
};