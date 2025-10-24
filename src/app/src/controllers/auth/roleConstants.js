/**
 * BCE Architecture - CONTROL Layer
 * 
 * Role Constants and Utilities
 * Centralizes role definitions and role-related logic
 */

import { API_CONFIG, getApiUrl } from '@/config/api';

export const ROLES = {
  USER_ADMIN: 'USER_ADMIN',
  PIN: 'PIN',
  CSR_REP: 'CSR_REP',
  PLATFORM_MGMT: 'PLATFORM_MGMT'
};

export const ROLE_LABELS = {
  [ROLES.USER_ADMIN]: 'User Admin',
  [ROLES.PIN]: 'PIN',
  [ROLES.CSR_REP]: 'CSR Rep',
  [ROLES.PLATFORM_MGMT]: 'Platform Management'
};

// For login form
export const getRolesList = () => {
  return Object.entries(ROLES).map(([key, value]) => ({
    label: ROLE_LABELS[value],
    value: value
  }));
};

// For dashboard
export const getBackendRoles = async () => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No access token available');
    }

    const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.ROLES), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to fetch roles');
    }

    const data = await response.json();
    if (!data.success || !data.roles) {
      throw new Error('Invalid response format from roles API');
    }

    return data.roles;
  } catch (error) {
    console.error('Error fetching roles:', error);
    throw error;
  }
};

export const getRoleNameByCode = (roleCode) => {
  return ROLE_LABELS[roleCode] || roleCode;
};

export default {
  ROLES,
  ROLE_LABELS,
  getRolesList,
  getBackendRoles,
  getRoleNameByCode
};