const API_BASE_URL = 'http://localhost:8000';

class AuthController {
  USER_STORAGE_KEY = 'user';

  /**
   * Login user with username and password
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.username - Username
   * @param {string} credentials.password - Password
   * @returns {Promise<Object>} Auth response with success status, message, and user data
   */
  async login(credentials) {
    try {
      const { username, password } = credentials;

      // Call Python backend API
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return {
          success: false,
          message: data.message || 'Invalid username or password',
        };
      }

      // Extract user data
      const user = data.user;

      // Store user in localStorage
      this.setUser(user);

      return {
        success: true,
        message: data.message,
        user,
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
   * Logout current user
   */
  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.USER_STORAGE_KEY);
    }
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} True if user is authenticated
   */
  isAuthenticated() {
    if (typeof window === 'undefined') return false;
    
    const user = localStorage.getItem(this.USER_STORAGE_KEY);
    return user !== null;
  }

  /**
   * Get current logged in user
   * @returns {Object|null} User object or null
   */
  getCurrentUser() {
    if (typeof window === 'undefined') return null;

    const userData = localStorage.getItem(this.USER_STORAGE_KEY);
    
    if (!userData) return null;

    try {
      return JSON.parse(userData);
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }

  /**
   * Store user data in localStorage
   * Stores complete user profile including role information
   * @param {Object} user - User object to store
   * @param {number} user.id - User ID
   * @param {string} user.username - Username
   * @param {string} user.full_name - Full name
   * @param {string} user.role_name - Role name (e.g., "User Admin")
   * @param {string} user.role_code - Role code (e.g., "USER_ADMIN")
   * @param {string} user.dashboard_route - Dashboard route (e.g., "/dashboard/admin")
   * @private
   */
  setUser(user) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(user));
    }
  }

  /**
   * Get user's dashboard route based on role
   * @returns {string|null} Dashboard route or null
   */
  getUserDashboardRoute() {
    const user = this.getCurrentUser();
    return user ? user.dashboard_route : null;
  }

  /**
   * Get user's role code
   * @returns {string|null} Role code or null
   */
  getUserRole() {
    const user = this.getCurrentUser();
    return user ? user.role_code : null;
  }

  /**
   * Verify if stored user session is still valid
   * @returns {Promise<boolean>} True if session is valid
   */
  async verifySession() {
    const user = this.getCurrentUser();
    
    if (!user) return false;

    try {
      // Verify user still exists in database via backend API
      const response = await fetch(`${API_BASE_URL}/api/verify/${user.id}`);
      const data = await response.json();

      if (!response.ok || !data.exists) {
        this.logout();
        return false;
      }

      return true;
    } catch (error) {
      console.error('Session verification error:', error);
      return false;
    }
  }
}

// Export singleton instance
export const authController = new AuthController();
