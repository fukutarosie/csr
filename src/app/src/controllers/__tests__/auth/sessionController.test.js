/**
 * Unit Tests for sessionController
 */

import { sessionController } from '../../auth/sessionController';
import { tokenController } from '../../auth/tokenController';

jest.mock('../../auth/tokenController');

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

describe('sessionController', () => {
  const mockUser = {
    id: 1,
    username: 'testuser',
    full_name: 'Test User',
    role_code: 'USER_ADMIN',
    dashboard_route: '/dashboard/admin'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    console.error = jest.fn();
  });

  describe('User Data Management', () => {
    it('should set user data', () => {
      // Act
      sessionController.setUser(mockUser);

      // Assert
      expect(localStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockUser));
    });

    it('should get current user', () => {
      // Arrange
      localStorageMock.setItem('user', JSON.stringify(mockUser));

      // Act
      const user = sessionController.getCurrentUser();

      // Assert
      expect(user).toEqual(mockUser);
    });

    it('should return null when no user data', () => {
      // Act
      const user = sessionController.getCurrentUser();

      // Assert
      expect(user).toBeNull();
    });

    it('should handle invalid JSON gracefully', () => {
      // Arrange
      localStorageMock.setItem('user', 'invalid json');

      // Act
      const user = sessionController.getCurrentUser();

      // Assert
      expect(console.error).toHaveBeenCalled();
      expect(user).toBeNull();
    });

    it('should remove user data', () => {
      // Arrange
      localStorageMock.setItem('user', JSON.stringify(mockUser));

      // Act
      sessionController.removeUser();

      // Assert
      expect(localStorage.removeItem).toHaveBeenCalledWith('user');
    });

    it('should update current user', () => {
      // Arrange
      localStorageMock.setItem('user', JSON.stringify(mockUser));

      // Act
      sessionController.updateCurrentUser({ full_name: 'Updated Name' });

      // Assert
      expect(localStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify({
        ...mockUser,
        full_name: 'Updated Name'
      }));
    });

    it('should not update if no user exists', () => {
      // Act
      sessionController.updateCurrentUser({ full_name: 'Updated Name' });

      // Assert
      expect(localStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('Session Status', () => {
    it('should return true when authenticated', () => {
      // Arrange
      tokenController.hasValidToken.mockReturnValue(true);
      localStorageMock.setItem('user', JSON.stringify(mockUser));

      // Act
      const result = sessionController.isAuthenticated();

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when no token', () => {
      // Arrange
      tokenController.hasValidToken.mockReturnValue(false);
      localStorageMock.setItem('user', JSON.stringify(mockUser));

      // Act
      const result = sessionController.isAuthenticated();

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when no user', () => {
      // Arrange
      tokenController.hasValidToken.mockReturnValue(true);

      // Act
      const result = sessionController.isAuthenticated();

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('User Information Getters', () => {
    beforeEach(() => {
      localStorageMock.setItem('user', JSON.stringify(mockUser));
    });

    it('should get user role', () => {
      const role = sessionController.getUserRole();
      expect(role).toBe('USER_ADMIN');
    });

    it('should get user dashboard route', () => {
      const route = sessionController.getUserDashboardRoute();
      expect(route).toBe('/dashboard/admin');
    });

    it('should get user ID', () => {
      const id = sessionController.getUserId();
      expect(id).toBe(1);
    });

    it('should get username', () => {
      const username = sessionController.getUsername();
      expect(username).toBe('testuser');
    });

    it('should get full name', () => {
      const fullName = sessionController.getFullName();
      expect(fullName).toBe('Test User');
    });

    it('should return null for all getters when no user', () => {
      localStorageMock.clear();
      expect(sessionController.getUserRole()).toBeNull();
      expect(sessionController.getUserDashboardRoute()).toBeNull();
      expect(sessionController.getUserId()).toBeNull();
      expect(sessionController.getUsername()).toBeNull();
      expect(sessionController.getFullName()).toBeNull();
    });
  });

  describe('Session Verification', () => {
    beforeEach(() => {
      localStorageMock.setItem('user', JSON.stringify(mockUser));
      tokenController.authenticatedFetch = jest.fn();
    });

    it('should verify valid session', async () => {
      // Arrange
      tokenController.authenticatedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ exists: true })
      });

      // Act
      const result = await sessionController.verifySession();

      // Assert
      expect(result).toBe(true);
      expect(tokenController.authenticatedFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/verify/1'
      );
    });

    it('should clear session if verification fails', async () => {
      // Arrange
      tokenController.authenticatedFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ exists: false })
      });

      // Act
      const result = await sessionController.verifySession();

      // Assert
      expect(result).toBe(false);
      expect(localStorage.removeItem).toHaveBeenCalledWith('user');
    });

    it('should return false when no user', async () => {
      // Arrange
      localStorageMock.clear();

      // Act
      const result = await sessionController.verifySession();

      // Assert
      expect(result).toBe(false);
      expect(tokenController.authenticatedFetch).not.toHaveBeenCalled();
    });

    it('should handle network errors', async () => {
      // Arrange
      tokenController.authenticatedFetch.mockRejectedValueOnce(new Error('Network error'));

      // Act
      const result = await sessionController.verifySession();

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('Clear Session', () => {
    it('should clear all session data', () => {
      // Arrange
      localStorageMock.setItem('user', JSON.stringify(mockUser));

      // Act
      sessionController.clearSession();

      // Assert
      expect(localStorage.removeItem).toHaveBeenCalledWith('user');
      expect(tokenController.clearAllTokens).toHaveBeenCalled();
    });
  });
});

