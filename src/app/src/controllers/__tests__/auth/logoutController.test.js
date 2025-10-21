/**
 * Unit Tests for logoutController
 */

import { logoutController } from '../../auth/logoutController';
import { sessionController } from '../../auth/sessionController';

jest.mock('../../auth/sessionController');

describe('logoutController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn();
    console.error = jest.fn();
    console.warn = jest.fn();
  });

  describe('logout', () => {
    it('should clear session on logout', () => {
      // Act
      logoutController.logout();

      // Assert
      expect(sessionController.clearSession).toHaveBeenCalled();
    });

    it('should handle errors gracefully', () => {
      // Arrange
      sessionController.clearSession.mockImplementationOnce(() => {
        throw new Error('Session clear error');
      });

      // Act
      logoutController.logout();

      // Assert
      expect(console.error).toHaveBeenCalled();
      expect(sessionController.clearSession).toHaveBeenCalledTimes(2); // Once in try, once in catch
    });
  });

  describe('logoutAndRedirect', () => {
    it('should logout and redirect using router', () => {
      // Arrange
      const mockRouter = {
        push: jest.fn()
      };

      // Act
      logoutController.logoutAndRedirect(mockRouter);

      // Assert
      expect(sessionController.clearSession).toHaveBeenCalled();
      expect(mockRouter.push).toHaveBeenCalledWith('/');
    });

    it('should use window.location if router is not available', () => {
      // Arrange
      delete global.window;
      global.window = { location: { href: '' } };

      // Act
      logoutController.logoutAndRedirect(null);

      // Assert
      expect(sessionController.clearSession).toHaveBeenCalled();
      expect(global.window.location.href).toBe('/');
    });
  });

  describe('forceLogout', () => {
    it('should force logout with reason', () => {
      // Arrange
      const reason = 'Token compromised';

      // Act
      logoutController.forceLogout(reason);

      // Assert
      expect(console.warn).toHaveBeenCalledWith(`Forced logout: ${reason}`);
      expect(sessionController.clearSession).toHaveBeenCalled();
    });

    it('should use default reason if none provided', () => {
      // Act
      logoutController.forceLogout();

      // Assert
      expect(console.warn).toHaveBeenCalledWith('Forced logout: Security check failed');
      expect(sessionController.clearSession).toHaveBeenCalled();
    });
  });
});

