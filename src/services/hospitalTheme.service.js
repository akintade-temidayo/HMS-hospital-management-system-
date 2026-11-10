import { api } from './api';

export const hospitalThemeService = {
  getByHospitalCode: async (hospitalCode) => {
    const response = await api.get(`/hospitals/${encodeURIComponent(hospitalCode)}/theme`);
    return response.data;
  },

  getCmdTheme: async () => {
    const response = await api.get('/cmd/theme');
    return response.data;
  },

  updateCmdTheme: async (theme) => {
    const response = await api.put('/cmd/theme', { theme });
    return response.data;
  },
};
