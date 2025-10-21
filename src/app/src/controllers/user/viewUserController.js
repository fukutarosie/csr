/**
 * View User Controller - Handles User Retrieval and Search
 * Part of User Management System (BCE Framework - Boundary/Control Layer)
 */

import { tokenController } from '../auth/tokenController';

const API_BASE_URL = 'http://localhost:8000';

class ViewUserController {
  /**
   * Get all users
   * @returns {Promise<Response>}
   */
  async getAllUsers() {
    try {
      const response = await tokenController.authenticatedFetch(
        `${API_BASE_URL}/api/users`
      );

      return response;
    } catch (error) {
      console.error('Get all users error:', error);
      throw error;
    }
  }

  /**
   * Get a single user by ID
   * @param {number} userId
   * @returns {Promise<Response>}
   */
  async getUserById(userId) {
    try {
      const response = await tokenController.authenticatedFetch(
        `${API_BASE_URL}/api/users/${userId}`
      );

      return response;
    } catch (error) {
      console.error('Get user by ID error:', error);
      throw error;
    }
  }

  /**
   * Search users by query
   * @param {string} query - Search term for username, full_name, or email
   * @returns {Promise<Response>}
   */
  async searchUsers(query) {
    try {
      const response = await tokenController.authenticatedFetch(
        `${API_BASE_URL}/api/users/search`,
        {
          method: 'POST',
          body: JSON.stringify({ query }),
        }
      );

      return response;
    } catch (error) {
      console.error('Search users error:', error);
      throw error;
    }
  }

  /**
   * Parse user list response
   * @param {Response} response
   * @returns {Promise<Array>}
   */
  async parseUserListResponse(response) {
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }

    const data = await response.json();
    return data.users || [];
  }

  /**
   * Parse single user response
   * @param {Response} response
   * @returns {Promise<Object>}
   */
  async parseSingleUserResponse(response) {
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('User not found');
      }
      throw new Error('Failed to fetch user');
    }

    const data = await response.json();
    return data.user || null;
  }
}

export const viewUserController = new ViewUserController();
export default viewUserController;

