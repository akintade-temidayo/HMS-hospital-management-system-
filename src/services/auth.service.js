import { api } from './api';

export const authService = {
  /**
   * Validates hospital code and retrieves branding assets (colors, logo) prior to login/signup.
   * Endpoint: GET /auth/lookup-hospital/:code[cite: 5, 8]
   */
  lookupHospital: async (code) => {
    const response = await api.get(`/auth/lookup-hospital/${code}`);
    return response.data;
  },

  /**
   * Registers a new hospital facility and creates the primary CMD (Chief Medical Director) account.
   * Endpoint: POST /auth/register-hospital[cite: 1, 7]
   */
  registerHospital: async (payload) => {
    const response = await api.post('/auth/register-hospital', payload);
    return response.data;
  },

  /**
   * Registers a new staff member under a verified hospital code (status defaults to PENDING).
   * Endpoint: POST /auth/register-staff[cite: 1, 8]
   */
  registerStaff: async (payload) => {
    const response = await api.post('/auth/register-staff', payload);
    return response.data;
  },

  /**
   * Authenticates user session and returns user metadata along with access/refresh tokens.
   * Endpoint: POST /auth/login[cite: 1, 8]
   */
  login: async (payload) => {
    const response = await api.post('/auth/login', payload);
    return response.data;
  },

  /**
   * Triggers a single-use six-digit reset code to the user's email.
   * Endpoint: POST /auth/forgot-password[cite: 1, 8]
   */
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  /**
   * Resets the user account password using the email code/token.
   * Endpoint: POST /auth/reset-password[cite: 1, 9]
   */
  resetPassword: async (payload) => {
    const response = await api.post('/auth/reset-password', payload);
    return response.data;
  },
};