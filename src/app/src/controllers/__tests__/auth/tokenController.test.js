/**
 * Unit Tests for tokenController
 */

import { tokenController } from '../../auth/tokenController';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => { store[key] = value.toString(); }),
    removeItem: jest.fn((key) => { delete store[key]; }),
    clear: jest.fn(() => { store = {}; })
  };
})();

global.localStorage = localStorageMock;
global.window = { localStorage: localStorageMock };
global.fetch = jest.fn();

describe('tokenController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  describe('Access Token Management', () => {
    it('should set access token', () => {
      // Act
      tokenController.setAccessToken('test_access_token');

      // Assert
      expect(localStorage.setItem).toHaveBeenCalledWith('access_token', 'test_access_token');
    });

    it('should get access token', () => {
      // Arrange
      localStorageMock.setItem('access_token', 'test_access_token');

      // Act
      const token = tokenController.getAccessToken();

      // Assert
      expect(token).toBe('test_access_token');
    });

    it('should remove access token', () => {
      // Arrange
      localStorageMock.setItem('access_token', 'test_access_token');

      // Act
      tokenController.removeAccessToken();

      // Assert
      expect(localStorage.removeItem).toHaveBeenCalledWith('access_token');
    });
  });

  describe('Refresh Token Management', () => {
    it('should set refresh token', () => {
      // Act
      tokenController.setRefreshToken('test_refresh_token');

      // Assert
      expect(localStorage.setItem).toHaveBeenCalledWith('refresh_token', 'test_refresh_token');
    });

    it('should get refresh token', () => {
      // Arrange
      localStorageMock.setItem('refresh_token', 'test_refresh_token');

      // Act
      const token = tokenController.getRefreshToken();

      // Assert
      expect(token).toBe('test_refresh_token');
    });

    it('should remove refresh token', () => {
      // Arrange
      localStorageMock.setItem('refresh_token', 'test_refresh_token');

      // Act
      tokenController.removeRefreshToken();

      // Assert
      expect(localStorage.removeItem).toHaveBeenCalledWith('refresh_token');
    });
  });

  describe('hasValidToken', () => {
    it('should return true when access token exists', () => {
      // Arrange
      localStorageMock.setItem('access_token', 'test_token');

      // Act
      const result = tokenController.hasValidToken();

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when no access token', () => {
      // Act
      const result = tokenController.hasValidToken();

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('clearAllTokens', () => {
    it('should clear both access and refresh tokens', () => {
      // Arrange
      localStorageMock.setItem('access_token', 'access');
      localStorageMock.setItem('refresh_token', 'refresh');

      // Act
      tokenController.clearAllTokens();

      // Assert
      expect(localStorage.removeItem).toHaveBeenCalledWith('access_token');
      expect(localStorage.removeItem).toHaveBeenCalledWith('refresh_token');
    });
  });

  describe('refreshAccessToken', () => {
    it('should successfully refresh access token', async () => {
      // Arrange
      localStorageMock.setItem('refresh_token', 'old_refresh_token');
      
      fetch.mockResolvedValueOnce({
        json: async () => ({ access_token: 'new_access_token' })
      });

      // Act
      const result = await tokenController.refreshAccessToken();

      // Assert
      expect(fetch).toHaveBeenCalledWith('http://localhost:8000/api/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: 'old_refresh_token' })
      });
      expect(localStorage.setItem).toHaveBeenCalledWith('access_token', 'new_access_token');
      expect(result).toBe(true);
    });

    it('should return false when no refresh token available', async () => {
      // Act
      const result = await tokenController.refreshAccessToken();

      // Assert
      expect(fetch).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('should return false when refresh fails', async () => {
      // Arrange
      localStorageMock.setItem('refresh_token', 'old_refresh_token');
      fetch.mockResolvedValueOnce({
        json: async () => ({})
      });

      // Act
      const result = await tokenController.refreshAccessToken();

      // Assert
      expect(result).toBe(false);
    });

    it('should handle network errors', async () => {
      // Arrange
      localStorageMock.setItem('refresh_token', 'old_refresh_token');
      fetch.mockRejectedValueOnce(new Error('Network error'));

      // Act
      const result = await tokenController.refreshAccessToken();

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('authenticatedFetch', () => {
    it('should make request with access token', async () => {
      // Arrange
      localStorageMock.setItem('access_token', 'test_token');
      fetch.mockResolvedValueOnce({
        status: 200,
        json: async () => ({ data: 'success' })
      });

      // Act
      const response = await tokenController.authenticatedFetch('http://api.com/data');

      // Assert
      expect(fetch).toHaveBeenCalledWith('http://api.com/data', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test_token'
        }
      });
      expect(response.status).toBe(200);
    });

    it('should refresh token and retry on 401', async () => {
      // Arrange
      localStorageMock.setItem('access_token', 'old_token');
      localStorageMock.setItem('refresh_token', 'refresh_token');
      
      // First call returns 401
      fetch.mockResolvedValueOnce({
        status: 401
      });
      
      // Refresh token call
      fetch.mockResolvedValueOnce({
        json: async () => ({ access_token: 'new_token' })
      });
      
      // Retry call succeeds
      fetch.mockResolvedValueOnce({
        status: 200,
        json: async () => ({ data: 'success' })
      });

      // Act
      const response = await tokenController.authenticatedFetch('http://api.com/data');

      // Assert
      expect(fetch).toHaveBeenCalledTimes(3); // Original + refresh + retry
      expect(response.status).toBe(200);
    });

    it('should throw error if refresh fails', async () => {
      // Arrange
      localStorageMock.setItem('access_token', 'old_token');
      
      // First call returns 401
      fetch.mockResolvedValueOnce({
        status: 401
      });
      
      // Refresh token call fails
      fetch.mockResolvedValueOnce({
        json: async () => ({}) // No access_token returned
      });

      // Act & Assert
      await expect(tokenController.authenticatedFetch('http://api.com/data'))
        .rejects
        .toThrow('Session expired. Please login again.');
    });
  });
});

