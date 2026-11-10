import { api } from './api';

export const inventoryService = {
  getItems: async () => {
    const response = await api.get('/inventory/items');
    return response.data;
  },

  getPrescriptions: async () => {
    const response = await api.get('/prescriptions');
    return response.data;
  },

  createItem: async (payload) => {
    const response = await api.post('/inventory/items', payload);
    return response.data;
  },

  restockItem: async (itemId, payload) => {
    const response = await api.patch(`/inventory/items/${encodeURIComponent(itemId)}/restock`, payload);
    return response.data;
  },

  issuePrescription: async (payload) => {
    const response = await api.post('/prescriptions', payload);
    return response.data;
  },

  dispensePrescription: async (prescriptionId, payload) => {
    const response = await api.post(`/prescriptions/${encodeURIComponent(prescriptionId)}/dispense`, payload);
    return response.data;
  },
};