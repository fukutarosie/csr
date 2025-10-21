/**
 * Unit Tests for loginController
 */

import { loginController } from '../../auth/loginController';
import { tokenController } from '../../auth/tokenController';
import { sessionController } from '../../auth/sessionController';

// Mock the dependencies
jest.mock('../../auth/tokenController');
jest.mock('../../auth/sessionController');

// Mock fetch
global.fetch = jest.fn();

describe('loginController', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    fetch.mockClear();
  });

  describe('login', () => {
    const mockCredentials = {
      username: 'testuser',
      password: 'password123',
      role_code: 'USER_ADMIN'
    };

    const mockUser = {
      id: 1,
      username: 'testuser',
      full_name: 'Test User',
      role_code: 'USER_ADMIN',
      dashboard_route: '/dashboard/admin'
    };

    it('should successfully login with valid credentials', async () => {
      // Arrange
      const mockResponse = {
        success: true,
        message: 'Login successful',
        user: mockUser,
        access_token: 'mock_access_token',
        refresh_token: 'mock_refresh_token'
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      // Act
      const result = await loginController.login(mockCredentials);

      // Assert
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/login',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mockCredentials)
        }
      );
      expect(tokenController.setAccessToken).toHaveBeenCalledWith('mock_access_token');
      expect(tokenController.setRefreshToken).toHaveBeenCalledWith('mock_refresh_token');
      expect(sessionController.setUser).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual({
        success: true,
        message: 'Login successful',
        user: mockUser
      });
    });

    it('should return error for invalid credentials', async () => {
      // Arrange
      const mockResponse = {
        success: false,
        message: 'Invalid username or password'
      };

      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => mockResponse
      });

      // Act
      const result = await loginController.login(mockCredentials);

      // Assert
      expect(tokenController.setAccessToken).not.toHaveBeenCalled();
      expect(tokenController.setRefreshToken).not.toHaveBeenCalled();
      expect(sessionController.setUser).not.toHaveBeenCalled();
      expect(result).toEqual({
        success: false,
        message: 'Invalid username or password'
      });
    });

    it('should handle network errors gracefully', async () => {
      // Arrange
      fetch.mockRejectedValueOnce(new Error('Network error'));

      // Act
      const result = await loginController.login(mockCredentials);

      // Assert
      expect(result).toEqual({
        success: false,
        message: 'Failed to connect to server. Make sure the backend is running.'
      });
    });

    it('should not store tokens if login fails', async () => {
      // Arrange
      const mockResponse = {
        success: false,
        message: 'Account suspended'
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      // Act
      await loginController.login(mockCredentials);

      // Assert
      expect(tokenController.setAccessToken).not.toHaveBeenCalled();
      expect(tokenController.setRefreshToken).not.toHaveBeenCalled();
      expect(sessionController.setUser).not.toHaveBeenCalled();
    });
  });

  describe('isLoggedIn', () => {
    it('should return true when user is authenticated', () => {
      // Arrange
      sessionController.isAuthenticated.mockReturnValue(true);

      // Act
      const result = loginController.isLoggedIn();

      // Assert
      expect(result).toBe(true);
      expect(sessionController.isAuthenticated).toHaveBeenCalled();
    });

    it('should return false when user is not authenticated', () => {
      // Arrange
      sessionController.isAuthenticated.mockReturnValue(false);

      // Act
      const result = loginController.isLoggedIn();

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user when available', () => {
      // Arrange
      const mockUser = {
        id: 1,
        username: 'testuser',
        full_name: 'Test User'
      };
      sessionController.getCurrentUser.mockReturnValue(mockUser);

      // Act
      const result = loginController.getCurrentUser();

      // Assert
      expect(result).toEqual(mockUser);
      expect(sessionController.getCurrentUser).toHaveBeenCalled();
    });

    it('should return null when no user is logged in', () => {
      // Arrange
      sessionController.getCurrentUser.mockReturnValue(null);

      // Act
      const result = loginController.getCurrentUser();

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('getDashboardRoute', () => {
    it('should return dashboard route for logged in user', () => {
      // Arrange
      sessionController.getUserDashboardRoute.mockReturnValue('/dashboard/admin');

      // Act
      const result = loginController.getDashboardRoute();

      // Assert
      expect(result).toBe('/dashboard/admin');
      expect(sessionController.getUserDashboardRoute).toHaveBeenCalled();
    });

    it('should return null when no user is logged in', () => {
      // Arrange
      sessionController.getUserDashboardRoute.mockReturnValue(null);

      // Act
      const result = loginController.getDashboardRoute();

      // Assert
      expect(result).toBeNull();
    });
  });
});

