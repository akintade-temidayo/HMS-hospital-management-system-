import { api } from './api';

export const patientService = {
  createPatient: async (payload) => {
    const response = await api.post('/patients', payload);
    return response.data;
  },

  searchPatients: async (query, limit = 10) => {
    const response = await api.get('/patients/search', { params: { query, limit } });
    return response.data;
  },

  getArchivedPatients: async (params) => {
    const response = await api.get('/patients/archive', { params });
    return response.data;
  },

  restorePatient: async (patientId, payload = {}) => {
    const response = await api.patch(`/patients/${encodeURIComponent(patientId)}/restore`, payload);
    return response?.data?.data ?? response?.data ?? null;
  },

  getPatientSummary: async (patientId) => {
    const response = await api.get(`/patients/${patientId}/summary`);
    return response.data;
  },

  getPatient360: async (patientId) => {
    const response = await api.get(`/patients/${patientId}/360`);
    return response.data;
  },

  updateAdmissionStatus: async (patientId, payload) => {
    const response = await api.patch(`/patients/${patientId}/admission`, payload);
    return response.data;
  },

  addPatientEntry: async (patientId, entry) => {
    const isFormData = typeof FormData !== 'undefined' && entry instanceof FormData;
    const formData = isFormData ? entry : new FormData();

    if (!isFormData) {
      Object.entries(entry || {}).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        if (typeof Blob !== 'undefined' && value instanceof Blob) {
          formData.append(key, value);
          return;
        }
        formData.append(key, typeof value === 'string' ? value : JSON.stringify(value));
      });
    }

    const response = await api.post(`/patients/${encodeURIComponent(patientId)}/entries`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updateClinicalRecord: async (patientId, recordId, payload) => {
    const response = await api.put(`/patients/${patientId}/records/${recordId}`, payload);
    return response.data;
  },

  mergeTemporaryPatient: async (payload) => {
    const response = await api.post('/patients/merge', payload);
    return response.data;
  },
};
