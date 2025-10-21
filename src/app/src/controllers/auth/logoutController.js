/**
 * Logout Controller - Handles User Logout and Session Cleanup
 * Part of Authentication System (BCE Framework - Boundary/Control Layer)
 */

import { sessionController } from './sessionController';

class LogoutController {
  /**
   * Logout user and clear all session data
   * @returns {void}
   */
  logout() {
    try {
      // Clear all authentication data
      sessionController.clearSession();
      
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if there's an error, try to clear session
      sessionController.clearSession();
    }
  }

  /**
   * Logout and redirect to login page
   * @param {Object} router - Next.js router instance
   * @returns {void}
   */
  logoutAndRedirect(router) {
    this.logout();
    
    if (router && typeof router.push === 'function') {
      router.push('/');
    } else if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  }

  /**
   * Force logout (for security issues like token compromise)
   * @param {string} reason - Reason for forced logout
   * @returns {void}
   */
  forceLogout(reason = 'Security check failed') {
    console.warn(`Forced logout: ${reason}`);
    this.logout();
  }
}

export const logoutController = new LogoutController();
export default logoutController;

