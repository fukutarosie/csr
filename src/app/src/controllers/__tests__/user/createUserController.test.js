/**
 * Unit Tests for createUserController
 */

import { createUserController } from '../../user/createUserController';
import { tokenController } from '../../auth/tokenController';

jest.mock('../../auth/tokenController');

global.fetch = jest.fn();

describe('createUserController', () => {
  const mockUserData = {
    username: 'newuser',
    password: 'password123',
    full_name: 'New User',
    email: 'user@example.com',
    role_id: 2
  };

  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn();
  });

  describe('createUser', () => {
    it('should successfully create a user', async () => {
      // Arrange
      const mockResponse = {
        success: true,
        user: { id: 5, ...mockUserData }
      };

      tokenController.authenticatedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      // Act
      const response = await createUserController.createUser(mockUserData);

      // Assert
      expect(tokenController.authenticatedFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/users',
        {
          method: 'POST',
          body: JSON.stringify(mockUserData)
        }
      );
      expect(response.ok).toBe(true);
    });

    it('should handle creation errors', async () => {
      // Arrange
      tokenController.authenticatedFetch.mockRejectedValueOnce(new Error('Network error'));

      // Act & Assert
      await expect(createUserController.createUser(mockUserData)).rejects.toThrow('Network error');
    });
  });

  describe('validateUserData', () => {
    it('should validate correct user data', () => {
      // Act
      const result = createUserController.validateUserData(mockUserData);

      // Assert
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject username less than 3 characters', () => {
      // Arrange
      const invalidData = { ...mockUserData, username: 'ab' };

      // Act
      const result = createUserController.validateUserData(invalidData);

      // Assert
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Username must be at least 3 characters long');
    });

    it('should reject password less than 6 characters', () => {
      // Arrange
      const invalidData = { ...mockUserData, password: '12345' };

      // Act
      const result = createUserController.validateUserData(invalidData);

      // Assert
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must be at least 6 characters long');
    });

    it('should reject empty full name', () => {
      // Arrange
      const invalidData = { ...mockUserData, full_name: '   ' };

      // Act
      const result = createUserController.validateUserData(invalidData);

      // Assert
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Full name is required');
    });

    it('should reject missing role_id', () => {
      // Arrange
      const invalidData = { ...mockUserData, role_id: null };

      // Act
      const result = createUserController.validateUserData(invalidData);

      // Assert
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Role is required');
    });

    it('should reject invalid email format', () => {
      // Arrange
      const invalidData = { ...mockUserData, email: 'invalidemail' };

      // Act
      const result = createUserController.validateUserData(invalidData);

      // Assert
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid email format');
    });

    it('should accept valid email formats', () => {
      // Arrange
      const validEmails = [
        'user@example.com',
        'test.user@example.co.uk',
        'user+tag@example.com'
      ];

      // Act & Assert
      validEmails.forEach(email => {
        const result = createUserController.validateUserData({
          ...mockUserData,
          email
        });
        expect(result.valid).toBe(true);
      });
    });

    it('should allow optional email', () => {
      // Arrange
      const dataWithoutEmail = { ...mockUserData };
      delete dataWithoutEmail.email;

      // Act
      const result = createUserController.validateUserData(dataWithoutEmail);

      // Assert
      expect(result.valid).toBe(true);
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct email formats', () => {
      const validEmails = [
        'test@example.com',
        'user.name@example.com',
        'user+tag@example.co.uk'
      ];

      validEmails.forEach(email => {
        expect(createUserController.isValidEmail(email)).toBe(true);
      });
    });

    it('should reject invalid email formats', () => {
      const invalidEmails = [
        'notanemail',
        '@example.com',
        'user@',
        'user@.com',
        'user @example.com'
      ];

      invalidEmails.forEach(email => {
        expect(createUserController.isValidEmail(email)).toBe(false);
      });
    });
  });
});

