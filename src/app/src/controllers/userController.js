// UserController - Control Layer for User Management (BCE Framework)
import { authController } from './authController';

const API_BASE_URL = 'http://localhost:8000';

class UserController {
  async getUsers() {
    return await authController.authenticatedFetch(`${API_BASE_URL}/api/users`);
  }

  async createUser(userData) {
    return await authController.authenticatedFetch(`${API_BASE_URL}/api/users`, {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async updateUser(userId, userData) {
    return await authController.authenticatedFetch(`${API_BASE_URL}/api/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  }

  async deleteUser(userId) {
    return await authController.authenticatedFetch(`${API_BASE_URL}/api/users/${userId}`, {
      method: 'DELETE'
    });
  }

  async searchUsers(query) {
    // Search by username or full_name
    return await authController.authenticatedFetch(`${API_BASE_URL}/api/users/search`, {
      method: 'POST',
      body: JSON.stringify({ query })
    });
  }

  async getRoles() {
    return await authController.authenticatedFetch(`${API_BASE_URL}/api/roles`);
  }
}

export const userController = new UserController();
export default userController;
