import { api } from './api';

export const encounterService = {
  createEncounter: async (payload) => {
    const response = await api.post('/encounters', payload);
    return response.data;
  },

  getDepartmentQueue: async (params) => {
    const response = await api.get('/queues/department', { params });
    return response.data;
  },

  transitionQueueStatus: async (encounterId, payload) => {
    const response = await api.patch(`/encounters/${encounterId}/transition-status`, payload);
    return response.data;
  },

  archiveEncounter: async (encounterId, payload) => {
    const response = await api.patch(`/encounters/${encounterId}/archive`, payload);
    return response.data;
  },

  getArchivedEncounters: async (params) => {
    const response = await api.get('/encounters/archived', { params });
    return response.data;
  },

  restoreEncounter: async (encounterId, payload) => {
    const response = await api.post(`/encounters/${encounterId}/restore`, payload);
    return response.data;
  },

  logVitals: async (encounterId, payload) => {
    const response = await api.post(`/encounters/${encounterId}/vitals`, payload);
    return response.data;
  },

  saveClinicalNotes: async (encounterId, payload) => {
    const response = await api.post(`/encounters/${encounterId}/notes`, payload);
    return response.data;
  },

  getEncounterHistory: async (encounterId) => {
    const response = await api.get(`/encounters/${encounterId}/history`);
    return response.data;
  },

  submitDischargeClearance: async (encounterId, payload) => {
    const response = await api.post(`/encounters/${encounterId}/discharge-clearance`, payload);
    return response.data;
  },
};