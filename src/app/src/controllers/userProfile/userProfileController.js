/**
 * User Profile Controller - Handles User Profile (Role) Management
 * Part of User Management System (BCE Framework - Boundary/Control Layer)
 */

import { tokenController } from '../auth/tokenController';

const API_BASE_URL = 'http://localhost:8000';

class UserProfileController {
  /**
   * Get all roles
   * @returns {Promise<Response>}
   */
  async getAllRoles() {
    try {
      const response = await tokenController.authenticatedFetch(
        `${API_BASE_URL}/api/roles`,
        {
          method: 'GET',
        }
      );

      return response;
    } catch (error) {
      console.error('Get all roles error:', error);
      throw error;
    }
  }

  /**
   * Parse roles response
   * @param {Response} response
   * @returns {Promise<Array>}
   */
  async parseRolesResponse(response) {
    try {
      const data = await response.json();
      if (data.success && data.roles) {
        return data.roles;
      }
      return [];
    } catch (error) {
      console.error('Parse roles response error:', error);
      return [];
    }
  }

  /**
   * Get role by ID
   * @param {number} roleId
   * @returns {Promise<Response>}
   */
  async getRoleById(roleId) {
    try {
      const response = await tokenController.authenticatedFetch(
        `${API_BASE_URL}/api/roles/${roleId}`,
        {
          method: 'GET',
        }
      );

      return response;
    } catch (error) {
      console.error('Get role by ID error:', error);
      throw error;
    }
  }

  /**
   * Create a new role
   * @param {Object} roleData - { role_name, role_code, dashboard_route, description? }
   * @returns {Promise<Response>}
   */
  async createRole(roleData) {
    try {
      const response = await tokenController.authenticatedFetch(
        `${API_BASE_URL}/api/roles`,
        {
          method: 'POST',
          body: JSON.stringify(roleData),
        }
      );

      return response;
    } catch (error) {
      console.error('Create role error:', error);
      throw error;
    }
  }

  /**
   * Update role information
   * @param {number} roleId
   * @param {Object} roleData - { role_name?, role_code?, dashboard_route?, description?, is_active? }
   * @returns {Promise<Response>}
   */
  async updateRole(roleId, roleData) {
    try {
      const response = await tokenController.authenticatedFetch(
        `${API_BASE_URL}/api/roles/${roleId}`,
        {
          method: 'PUT',
          body: JSON.stringify(roleData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to update role');
      }

      return data;
    } catch (error) {
      console.error('Update role error:', error);
      throw new Error(error.message || 'Error updating role');
    }
  }

  /**
   * Toggle role active status (suspend/activate)
   * @param {number} roleId
   * @returns {Promise<Response>}
   */
  async toggleRoleStatus(roleId) {
    try {
      const response = await tokenController.authenticatedFetch(
        `${API_BASE_URL}/api/roles/${roleId}/toggle-status`,
        {
          method: 'PUT',
        }
      );

      return response;
    } catch (error) {
      console.error('Toggle role status error:', error);
      throw error;
    }
  }

  /**
   * Delete a role (hard delete - use with caution)
   * @param {number} roleId
   * @returns {Promise<Response>}
   */
  async deleteRole(roleId) {
    try {
      const response = await tokenController.authenticatedFetch(
        `${API_BASE_URL}/api/roles/${roleId}`,
        {
          method: 'DELETE',
        }
      );

      return response;
    } catch (error) {
      console.error('Delete role error:', error);
      throw error;
    }
  }

  /**
   * Search roles by name or code
   * @param {string} query
   * @returns {Promise<Response>}
   */
  async searchRoles(query) {
    try {
      const response = await tokenController.authenticatedFetch(
        `${API_BASE_URL}/api/roles/search`,
        {
          method: 'POST',
          body: JSON.stringify({ query }),
        }
      );

      return response;
    } catch (error) {
      console.error('Search roles error:', error);
      throw error;
    }
  }

  /**
   * Validate role data before creation
   * @param {Object} roleData
   * @returns {Object} - { valid: boolean, errors: string[] }
   */
  validateRoleData(roleData) {
    const errors = [];

    if (!roleData.role_name || roleData.role_name.trim() === '') {
      errors.push('Role name is required');
    }

    if (!roleData.role_code || roleData.role_code.trim() === '') {
      errors.push('Role code is required');
    } else if (!/^[A-Z_]+$/.test(roleData.role_code)) {
      errors.push('Role code must contain only uppercase letters and underscores');
    }

    if (!roleData.dashboard_route || roleData.dashboard_route.trim() === '') {
      errors.push('Dashboard route is required');
    } else if (!roleData.dashboard_route.startsWith('/')) {
      errors.push('Dashboard route must start with /');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate role update data
   * @param {Object} roleData
   * @returns {Object} - { valid: boolean, errors: string[] }
   */
  validateUpdateData(roleData) {
    const errors = [];

    if (roleData.role_name !== undefined && roleData.role_name.trim() === '') {
      errors.push('Role name cannot be empty');
    }

    if (roleData.role_code !== undefined) {
      if (roleData.role_code.trim() === '') {
        errors.push('Role code cannot be empty');
      } else if (!/^[A-Z_]+$/.test(roleData.role_code)) {
        errors.push('Role code must contain only uppercase letters and underscores');
      }
    }

    if (roleData.dashboard_route !== undefined) {
      if (roleData.dashboard_route.trim() === '') {
        errors.push('Dashboard route cannot be empty');
      } else if (!roleData.dashboard_route.startsWith('/')) {
        errors.push('Dashboard route must start with /');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Parse create/update/delete role response
   * @param {Response} response
   * @returns {Promise<Object>}
   */
  async parseRoleResponse(response) {
    try {
      const data = await response.json();
      return {
        success: data.success || false,
        message: data.message || '',
        role: data.role || null,
        deleted_users: data.deleted_users || 0
      };
    } catch (error) {
      console.error('Parse role response error:', error);
      return {
        success: false,
        message: 'Failed to parse response',
        role: null,
        deleted_users: 0
      };
    }
  }
}

export const userProfileController = new UserProfileController();
export default userProfileController;
