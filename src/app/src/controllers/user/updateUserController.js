/**
 * Update User Controller - Handles User Updates
 * Part of User Management System (BCE Framework - Boundary/Control Layer)
 */

import { tokenController } from '../auth/tokenController';

const API_BASE_URL = 'http://localhost:8000';

class UpdateUserController {
  /**
   * Update user information
   * @param {number} userId
   * @param {Object} userData - { full_name?, email?, role_id?, is_active? }
   * @returns {Promise<Response>}
   */
  async updateUser(userId, userData) {
    try {
      const response = await tokenController.authenticatedFetch(
        `${API_BASE_URL}/api/users/${userId}`,
        {
          method: 'PUT',
          body: JSON.stringify(userData),
        }
      );

      return response;
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  }

  /**
   * Update only specific fields
   * @param {number} userId
   * @param {string} field - Field name to update
   * @param {any} value - New value
   * @returns {Promise<Response>}
   */
  async updateField(userId, field, value) {
    const updateData = { [field]: value };
    return this.updateUser(userId, updateData);
  }

  /**
   * Activate user account
   * @param {number} userId
   * @returns {Promise<Response>}
   */
  async activateUser(userId) {
    return this.updateField(userId, 'is_active', true);
  }

  /**
   * Deactivate user account (soft suspend)
   * @param {number} userId
   * @returns {Promise<Response>}
   */
  async deactivateUser(userId) {
    return this.updateField(userId, 'is_active', false);
  }

  /**
   * Change user role
   * @param {number} userId
   * @param {number} newRoleId
   * @returns {Promise<Response>}
   */
  async changeUserRole(userId, newRoleId) {
    return this.updateField(userId, 'role_id', newRoleId);
  }

  /**
   * Validate update data
   * @param {Object} userData
   * @returns {Object} - { valid: boolean, errors: string[] }
   */
  validateUpdateData(userData) {
    const errors = [];

    if (userData.full_name !== undefined && userData.full_name.trim().length === 0) {
      errors.push('Full name cannot be empty');
    }

    if (userData.email !== undefined && userData.email && !this.isValidEmail(userData.email)) {
      errors.push('Invalid email format');
    }

    // Only validate role_id when it is explicitly provided (not null/undefined)
    if (userData.role_id != null) {
      if (!Number.isInteger(userData.role_id) || userData.role_id < 1) {
        errors.push('Invalid role ID');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate email format
   * @param {string} email
   * @returns {boolean}
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

export const updateUserController = new UpdateUserController();
export default updateUserController;

