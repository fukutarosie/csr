/**
 * Token Controller - Manages JWT Token Storage and Retrieval
 * Part of Authentication System (BCE Framework - Boundary/Control Layer)
 */

class TokenController {
  ACCESS_TOKEN_KEY = 'access_token';
  REFRESH_TOKEN_KEY = 'refresh_token';

  // ==================== ACCESS TOKEN ====================
  
  setAccessToken(token) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
    }
  }

  getAccessToken() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  removeAccessToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    }
  }

  // ==================== REFRESH TOKEN ====================
  
  setRefreshToken(token) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
    }
  }

  getRefreshToken() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  removeRefreshToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    }
  }

  // ==================== TOKEN VALIDATION ====================
  
  hasValidToken() {
    return !!this.getAccessToken();
  }

  clearAllTokens() {
    this.removeAccessToken();
    this.removeRefreshToken();
  }

  // ==================== TOKEN REFRESH ====================
  
  async refreshAccessToken() {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return false;

    try {
      const response = await fetch('http://localhost:8000/api/refresh', {
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
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  // ==================== AUTHENTICATED FETCH ====================
  
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

    // If token expired, try to refresh
    if (response.status === 401) {
      const refreshed = await this.refreshAccessToken();
      
      if (refreshed) {
        // Retry with new token
        token = this.getAccessToken();
        authOptions.headers['Authorization'] = `Bearer ${token}`;
        response = await fetch(url, authOptions);
      } else {
        // Refresh failed - need to logout
        this.clearAllTokens();
        throw new Error('Session expired. Please login again.');
      }
    }

    return response;
  }
}

export const tokenController = new TokenController();
export default tokenController;

