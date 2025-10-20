/**
 * Authentication Controller (Boundary Layer - BCE Framework)
 * Frontend controller for managing authentication state and API calls
 */


const API_BASE_URL = 'http://localhost:8000';

class AuthController {
  USER_STORAGE_KEY = 'user';
  ACCESS_TOKEN_KEY = 'access_token';
  REFRESH_TOKEN_KEY = 'refresh_token';

  async login(credentials) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        return { success: false, message: data.message || 'Invalid username or password' };
      }
      // Store tokens and user
      if (data.access_token) this.setAccessToken(data.access_token);
      if (data.refresh_token) this.setRefreshToken(data.refresh_token);
      if (data.user) this.setUser(data.user);
      return { success: true, message: data.message, user: data.user };
    } catch (error) {
      return { success: false, message: 'Failed to connect to server. Make sure the backend is running.' };
    }
  }

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.USER_STORAGE_KEY);
      localStorage.removeItem(this.ACCESS_TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    }
  }

  isAuthenticated() {
    if (typeof window === 'undefined') return false;
    return !!this.getAccessToken();
  }

  getCurrentUser() {
    if (typeof window === 'undefined') return null;
    const userData = localStorage.getItem(this.USER_STORAGE_KEY);
    if (!userData) return null;
    try { return JSON.parse(userData); } catch { return null; }
  }

  setUser(user) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(user));
    }
  }

  getUserDashboardRoute() {
    const user = this.getCurrentUser();
    return user ? user.dashboard_route : null;
  }

  getUserRole() {
    const user = this.getCurrentUser();
    return user ? user.role_code : null;
  }

  setAccessToken(token) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
    }
  }

  getAccessToken() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  setRefreshToken(token) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
    }
  }

  getRefreshToken() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  async refreshAccessToken() {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return false;
    try {
      const response = await fetch(`${API_BASE_URL}/api/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      const data = await response.json();
      if (data.access_token) {
        this.setAccessToken(data.access_token);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  async authenticatedFetch(url, options = {}) {
    let token = this.getAccessToken();
    const authOptions = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
        'Authorization': token ? `Bearer ${token}` : undefined,
      },
    };
    let response = await fetch(url, authOptions);
    if (response.status === 401) {
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        token = this.getAccessToken();
        authOptions.headers['Authorization'] = `Bearer ${token}`;
        response = await fetch(url, authOptions);
      } else {
        this.logout();
      }
    }
    return response;
  }

  updateCurrentUser(updatedData) {
    const user = this.getCurrentUser();
    if (user) {
      this.setUser({ ...user, ...updatedData });
    }
  }

  async verifySession() {
    const user = this.getCurrentUser();
    if (!user) return false;
    try {
      const response = await this.authenticatedFetch(`${API_BASE_URL}/api/verify/${user.id}`);
      const data = await response.json();
      if (!response.ok || !data.exists) {
        this.logout();
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }
}

export const authController = new AuthController();
export default authController;

