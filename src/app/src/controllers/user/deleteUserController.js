/**
 * Delete User Controller - Handles User Deletion/Suspension
 * Part of User Management System (BCE Framework - Boundary/Control Layer)
 */

import { tokenController } from '../auth/tokenController';

const API_BASE_URL = 'http://localhost:8000';

class DeleteUserController {
  /**
   * Delete (suspend) user account
   * Note: This is a soft delete that sets is_active to false
   * @param {number} userId
   * @returns {Promise<Response>}
   */
  async deleteUser(userId) {
    try {
      const response = await tokenController.authenticatedFetch(
        `${API_BASE_URL}/api/users/${userId}`,
        {
          method: 'DELETE',
        }
      );

      return response;
    } catch (error) {
      console.error('Delete user error:', error);
      throw error;
    }
  }

  /**
   * Suspend user account (alias for deleteUser)
   * @param {number} userId
   * @returns {Promise<Response>}
   */
  async suspendUser(userId) {
    return this.deleteUser(userId);
  }

  /**
   * Confirm deletion with user ID verification
   * @param {number} userId
   * @param {string} confirmUsername - Username to confirm deletion
   * @param {string} actualUsername - Actual username from user object
   * @returns {boolean}
   */
  confirmDeletion(userId, confirmUsername, actualUsername) {
    if (!userId || !confirmUsername || !actualUsername) {
      return false;
    }

    return confirmUsername.trim().toLowerCase() === actualUsername.trim().toLowerCase();
  }

  /**
   * Parse delete response
   * @param {Response} response
   * @returns {Promise<Object>}
   */
  async parseDeleteResponse(response) {
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('User not found');
      }
      if (response.status === 403) {
        throw new Error('Insufficient permissions to delete user');
      }
      throw new Error('Failed to delete user');
    }

    const data = await response.json();
    return {
      success: data.success || false,
      message: data.message || 'User suspended successfully',
    };
  }
}

export const deleteUserController = new DeleteUserController();
export default deleteUserController;

