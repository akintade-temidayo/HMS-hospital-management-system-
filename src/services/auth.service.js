import { api } from './api';

export const authService = {
  /**
   * Validates hospital code and retrieves branding assets (colors, logo) prior to login/signup.
   * Endpoint: GET /auth/lookup-hospital/:code
   */
  lookupHospital: async (code) => {
    const response = await api.get(`/auth/lookup-hospital/${code}`);
    return response.data;
  },

  /**
   * Registers a new hospital facility and creates the primary CMD (Chief Medical Director) account.
   * Endpoint: POST /auth/register-hospital
   */
  registerHospital: async (payload) => {
    const response = await api.post('/auth/register-hospital', payload);
    return response.data;
  },

  /**
   * Registers a new staff member under a verified hospital code (status defaults to PENDING).
   * Endpoint: POST /auth/register-staff
   */
  registerStaff: async (payload) => {
    const response = await api.post('/auth/register-staff', payload);
    return response.data;
  },

  /**
   * Authenticates user session and returns user metadata along with access/refresh tokens.
   * Endpoint: POST /auth/login
   */
  login: async (payload) => {
    const response = await api.post('/auth/login', payload);
    return response.data;
  },

  /**
   * Triggers a single-use six-digit reset code to the user's email.
   * Endpoint: POST /auth/forgot-password
   */
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  /**
   * Resets the user account password using the email code/token.
   * Endpoint: POST /auth/reset-password
   */
  resetPassword: async (payload) => {
    const response = await api.post('/auth/reset-password', payload);
    return response.data;
  },
};