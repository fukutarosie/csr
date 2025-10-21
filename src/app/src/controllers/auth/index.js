/**
 * Auth Controllers - Central Export
 * Provides modular authentication controllers for the application
 */

export { loginController } from './loginController';
export { logoutController } from './logoutController';
export { tokenController } from './tokenController';
export { sessionController } from './sessionController';

// For backward compatibility with existing code
import { loginController } from './loginController';
import { logoutController } from './logoutController';
import { tokenController } from './tokenController';
import { sessionController } from './sessionController';

/**
 * Legacy authController for backward compatibility
 * Maps old API to new modular controllers
 */
class AuthController {
  // Login operations
  async login(credentials) {
    return loginController.login(credentials);
  }

  isLoggedIn() {
    return loginController.isLoggedIn();
  }

  // Logout operations
  logout() {
    logoutController.logout();
  }

  logoutAndRedirect(router) {
    logoutController.logoutAndRedirect(router);
  }

  // Session operations
  isAuthenticated() {
    return sessionController.isAuthenticated();
  }

  getCurrentUser() {
    return sessionController.getCurrentUser();
  }

  getUserRole() {
    return sessionController.getUserRole();
  }

  getUserDashboardRoute() {
    return sessionController.getUserDashboardRoute();
  }

  updateCurrentUser(data) {
    return sessionController.updateCurrentUser(data);
  }

  verifySession() {
    return sessionController.verifySession();
  }

  // Token operations
  getAccessToken() {
    return tokenController.getAccessToken();
  }

  setAccessToken(token) {
    return tokenController.setAccessToken(token);
  }

  getRefreshToken() {
    return tokenController.getRefreshToken();
  }

  setRefreshToken(token) {
    return tokenController.setRefreshToken(token);
  }

  async refreshAccessToken() {
    return tokenController.refreshAccessToken();
  }

  async authenticatedFetch(url, options) {
    return tokenController.authenticatedFetch(url, options);
  }

  // User data operations
  setUser(user) {
    return sessionController.setUser(user);
  }
}

export const authController = new AuthController();
export default authController;

