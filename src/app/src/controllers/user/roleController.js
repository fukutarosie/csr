/**
 * Role Controller - Handles Role Management
 * Part of User Management System (BCE Framework - Boundary/Control Layer)
 */

import { tokenController } from '../auth/tokenController';

const API_BASE_URL = 'http://localhost:8000';

class RoleController {
  /**
   * Get all available roles
   * @returns {Promise<Response>}
   */
  async getAllRoles() {
    try {
      const response = await tokenController.authenticatedFetch(
        `${API_BASE_URL}/api/roles`
      );

      return response;
    } catch (error) {
      console.error('Get roles error:', error);
      throw error;
    }
  }

  /**
   * Parse roles response
   * @param {Response} response
   * @returns {Promise<Array>}
   */
  async parseRolesResponse(response) {
    if (!response.ok) {
      throw new Error('Failed to fetch roles');
    }

    const data = await response.json();
    return data.roles || [];
  }

  /**
   * Get role name by code
   * @param {Array} roles
   * @param {string} roleCode
   * @returns {string|null}
   */
  getRoleNameByCode(roles, roleCode) {
    const role = roles.find(r => r.role_code === roleCode);
    return role ? role.role_name : null;
  }

  /**
   * Get role by ID
   * @param {Array} roles
   * @param {number} roleId
   * @returns {Object|null}
   */
  getRoleById(roles, roleId) {
    return roles.find(r => r.id === roleId) || null;
  }

  /**
   * Get dashboard route by role code
   * @param {Array} roles
   * @param {string} roleCode
   * @returns {string|null}
   */
  getDashboardRouteByCode(roles, roleCode) {
    const role = roles.find(r => r.role_code === roleCode);
    return role ? role.dashboard_route : null;
  }

  /**
   * Format roles for dropdown/select component
   * @param {Array} roles
   * @returns {Array} - [{ value, label }]
   */
  formatRolesForSelect(roles) {
    return roles.map(role => ({
      value: role.id,
      label: role.role_name,
      code: role.role_code,
      route: role.dashboard_route,
    }));
  }
}

export const roleController = new RoleController();
export default roleController;

