/**
 * Unit Tests for updateUserController
 */

import { updateUserController } from '../../user/updateUserController';
import { tokenController } from '../../auth/tokenController';

jest.mock('../../auth/tokenController');

describe('updateUserController', () => {
  const userId = 5;
  const mockUpdateData = {
    full_name: 'Updated Name',
    email: 'updated@example.com',
    role_id: 2,
    is_active: true
  };

  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn();
  });

  describe('updateUser', () => {
    it('should successfully update a user', async () => {
      // Arrange
      tokenController.authenticatedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      // Act
      const response = await updateUserController.updateUser(userId, mockUpdateData);

      // Assert
      expect(tokenController.authenticatedFetch).toHaveBeenCalledWith(
        `http://localhost:8000/api/users/${userId}`,
        {
          method: 'PUT',
          body: JSON.stringify(mockUpdateData)
        }
      );
      expect(response.ok).toBe(true);
    });

    it('should handle update errors', async () => {
      // Arrange
      tokenController.authenticatedFetch.mockRejectedValueOnce(new Error('Update failed'));

      // Act & Assert
      await expect(updateUserController.updateUser(userId, mockUpdateData)).rejects.toThrow();
    });
  });

  describe('updateField', () => {
    it('should update a single field', async () => {
      // Arrange
      tokenController.authenticatedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      // Act
      await updateUserController.updateField(userId, 'full_name', 'New Name');

      // Assert
      expect(tokenController.authenticatedFetch).toHaveBeenCalledWith(
        `http://localhost:8000/api/users/${userId}`,
        {
          method: 'PUT',
          body: JSON.stringify({ full_name: 'New Name' })
        }
      );
    });
  });

  describe('activateUser', () => {
    it('should activate user account', async () => {
      // Arrange
      tokenController.authenticatedFetch.mockResolvedValueOnce({
        ok: true
      });

      // Act
      await updateUserController.activateUser(userId);

      // Assert
      expect(tokenController.authenticatedFetch).toHaveBeenCalledWith(
        `http://localhost:8000/api/users/${userId}`,
        {
          method: 'PUT',
          body: JSON.stringify({ is_active: true })
        }
      );
    });
  });

  describe('deactivateUser', () => {
    it('should deactivate user account', async () => {
      // Arrange
      tokenController.authenticatedFetch.mockResolvedValueOnce({
        ok: true
      });

      // Act
      await updateUserController.deactivateUser(userId);

      // Assert
      expect(tokenController.authenticatedFetch).toHaveBeenCalledWith(
        `http://localhost:8000/api/users/${userId}`,
        {
          method: 'PUT',
          body: JSON.stringify({ is_active: false })
        }
      );
    });
  });

  describe('changeUserRole', () => {
    it('should change user role', async () => {
      // Arrange
      const newRoleId = 3;
      tokenController.authenticatedFetch.mockResolvedValueOnce({
        ok: true
      });

      // Act
      await updateUserController.changeUserRole(userId, newRoleId);

      // Assert
      expect(tokenController.authenticatedFetch).toHaveBeenCalledWith(
        `http://localhost:8000/api/users/${userId}`,
        {
          method: 'PUT',
          body: JSON.stringify({ role_id: newRoleId })
        }
      );
    });
  });

  describe('validateUpdateData', () => {
    it('should validate correct update data', () => {
      // Act
      const result = updateUserController.validateUpdateData(mockUpdateData);

      // Assert
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject empty full name', () => {
      // Arrange
      const invalidData = { full_name: '   ' };

      // Act
      const result = updateUserController.validateUpdateData(invalidData);

      // Assert
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Full name cannot be empty');
    });

    it('should reject invalid email', () => {
      // Arrange
      const invalidData = { email: 'invalidemail' };

      // Act
      const result = updateUserController.validateUpdateData(invalidData);

      // Assert
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid email format');
    });

    it('should reject invalid role_id', () => {
      // Arrange
      const invalidData = { role_id: -1 };

      // Act
      const result = updateUserController.validateUpdateData(invalidData);

      // Assert
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid role ID');
    });

    it('should allow partial updates', () => {
      // Act
      const result1 = updateUserController.validateUpdateData({ full_name: 'Name' });
      const result2 = updateUserController.validateUpdateData({ email: 'test@test.com' });
      const result3 = updateUserController.validateUpdateData({ role_id: 2 });

      // Assert
      expect(result1.valid).toBe(true);
      expect(result2.valid).toBe(true);
      expect(result3.valid).toBe(true);
    });
  });
});

