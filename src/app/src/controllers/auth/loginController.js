/**
 * BCE Architecture - CONTROL Layer
 * 
 * Controller: loginController
 * Layer: Control (Business Logic)
 * 
 * This controller represents the Control layer in the BCE pattern.
 * It coordinates authentication workflow between the Boundary (UI) and Entity (data storage) layers.
 * 
 * Responsibilities:
 * - Coordinate authentication workflow
 * - Communicate with backend API
 * - Manage authentication state via tokenController and sessionController
 * - Determine user dashboard routing
 * 
 * Dependencies:
 * - Control: tokenController (JWT management)
 * - Control: sessionController (session management)
 */

import { tokenController } from './tokenController';
import { sessionController } from './sessionController';

import { API_CONFIG, getApiUrl } from '@/config/api';

// Log the API URL being used (helpful for debugging)
console.log('API Base URL:', API_CONFIG.BASE_URL);

class LoginController {
  /**
   * Authenticate user with credentials
   * @param {Object} credentials - { username, password, role_code }
   * @returns {Promise<Object>} - { success, message, user }
   */
  async login(credentials) {
    try {
      // Send login request to backend
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.LOGIN), {
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

