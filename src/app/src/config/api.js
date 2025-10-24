/**
 * API Configuration
 * Centralizes API endpoint configuration
 */

export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
  ENDPOINTS: {
    LOGIN: '/api/login',
    USERS: '/api/users',
    ROLES: '/api/roles',
    REFRESH: '/api/refresh',
    VERIFY: '/api/verify'
  }
};

export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

export default API_CONFIG;