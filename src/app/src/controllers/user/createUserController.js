/**
 * Create User Controller - Handles User Creation
 * Part of User Management System (BCE Framework - Boundary/Control Layer)
 */

import { tokenController } from '../auth/tokenController';

const API_BASE_URL = 'http://localhost:8000';

class CreateUserController {
  /**
   * Create a new user account
   * @param {Object} userData - { username, password, full_name, email, role_id }
   * @returns {Promise<Response>}
   */
  async createUser(userData) {
    try {
      const response = await tokenController.authenticatedFetch(
        `${API_BASE_URL}/api/users`,
        {
          method: 'POST',
          body: JSON.stringify(userData),
        }
      );

      return response;
    } catch (error) {
      console.error('Create user error:', error);
      throw error;
    }
  }

  /**
   * Validate user data before creation
   * @param {Object} userData
   * @returns {Object} - { valid: boolean, errors: string[] }
   */
  validateUserData(userData) {
    const errors = [];

    if (!userData.username || userData.username.trim().length < 3) {
      errors.push('Username must be at least 3 characters long');
    }

    if (!userData.password || userData.password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }

    if (!userData.full_name || userData.full_name.trim().length === 0) {
      errors.push('Full name is required');
    }

    if (!userData.role_id) {
      errors.push('Role is required');
    }

    if (userData.email && !this.isValidEmail(userData.email)) {
      errors.push('Invalid email format');
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

export const createUserController = new CreateUserController();
export default createUserController;

