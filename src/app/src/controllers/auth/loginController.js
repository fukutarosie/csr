/**
 * Login Controller - Handles User Authentication and Login
 * Part of Authentication System (BCE Framework - Boundary/Control Layer)
 */

import { tokenController } from './tokenController';
import { sessionController } from './sessionController';

const API_BASE_URL = 'http://localhost:8000';

class LoginController {
  /**
   * Authenticate user with credentials
   * @param {Object} credentials - { username, password, role_code }
   * @returns {Promise<Object>} - { success, message, user }
   */
  async login(credentials) {
    try {
      // Send login request to backend
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      // Check if login was successful
      if (!response.ok || !data.success) {
        return {
          success: false,
          message: data.message || 'Invalid username or password',
        };
      }

      // Store authentication data
      if (data.access_token) {
        tokenController.setAccessToken(data.access_token);
      }

      if (data.refresh_token) {
        tokenController.setRefreshToken(data.refresh_token);
      }

      if (data.user) {
        sessionController.setUser(data.user);
      }

      return {
        success: true,
        message: data.message || 'Login successful',
        user: data.user,
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Failed to connect to server. Make sure the backend is running.',
      };
    }
  }

  /**
   * Check if user is currently logged in
   * @returns {boolean}
   */
  isLoggedIn() {
    return sessionController.isAuthenticated();
  }

  /**
   * Get current logged in user
   * @returns {Object|null}
   */
  getCurrentUser() {
    return sessionController.getCurrentUser();
  }

  /**
   * Get dashboard route for current user
   * @returns {string|null}
   */
  getDashboardRoute() {
    return sessionController.getUserDashboardRoute();
  }
}

export const loginController = new LoginController();
export default loginController;

