/**
 * Session Controller - Manages User Session State
 * Part of Authentication System (BCE Framework - Boundary/Control Layer)
 */

import { tokenController } from './tokenController';

class SessionController {
  USER_STORAGE_KEY = 'user';

  // ==================== USER DATA MANAGEMENT ====================
  
  setUser(user) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(user));
    }
  }

  getCurrentUser() {
    if (typeof window === 'undefined') return null;
    
    const userData = localStorage.getItem(this.USER_STORAGE_KEY);
    if (!userData) return null;
    
    try {
      return JSON.parse(userData);
    } catch (error) {
      console.error('Failed to parse user data:', error);
      return null;
    }
  }

  removeUser() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.USER_STORAGE_KEY);
    }
  }

  updateCurrentUser(updatedData) {
    const user = this.getCurrentUser();
    if (user) {
      this.setUser({ ...user, ...updatedData });
    }
  }

  // ==================== SESSION STATUS ====================
  
  isAuthenticated() {
    if (typeof window === 'undefined') return false;
    return tokenController.hasValidToken() && !!this.getCurrentUser();
  }

  // ==================== USER INFORMATION ====================
  
  getUserRole() {
    const user = this.getCurrentUser();
    return user ? user.role_code : null;
  }

  getUserDashboardRoute() {
    const user = this.getCurrentUser();
    return user ? user.dashboard_route : null;
  }

  getUserId() {
    const user = this.getCurrentUser();
    return user ? user.id : null;
  }

  getUsername() {
    const user = this.getCurrentUser();
    return user ? user.username : null;
  }

  getFullName() {
    const user = this.getCurrentUser();
    return user ? user.full_name : null;
  }

  // ==================== SESSION VERIFICATION ====================
  
  async verifySession() {
    const user = this.getCurrentUser();
    if (!user) return false;

    try {
      const response = await tokenController.authenticatedFetch(
        `http://localhost:8000/api/verify/${user.id}`
      );
      
      const data = await response.json();
      
      if (!response.ok || !data.exists) {
        this.clearSession();
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Session verification failed:', error);
      return false;
    }
  }

  // ==================== CLEAR SESSION ====================
  
  clearSession() {
    this.removeUser();
    tokenController.clearAllTokens();
  }
}

export const sessionController = new SessionController();
export default sessionController;

