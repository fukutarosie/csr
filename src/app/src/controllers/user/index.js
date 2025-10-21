/**
 * User Controllers - Central Export
 * Provides modular user management controllers for the application
 */

export { createUserController } from './createUserController';
export { viewUserController } from './viewUserController';
export { updateUserController } from './updateUserController';
export { deleteUserController } from './deleteUserController';
export { roleController } from './roleController';

// For backward compatibility with existing code
import { createUserController } from './createUserController';
import { viewUserController } from './viewUserController';
import { updateUserController } from './updateUserController';
import { deleteUserController } from './deleteUserController';
import { roleController } from './roleController';

/**
 * Legacy userController for backward compatibility
 * Maps old API to new modular controllers
 */
class UserController {
  // View operations
  async getUsers() {
    return viewUserController.getAllUsers();
  }

  async getUserById(userId) {
    return viewUserController.getUserById(userId);
  }

  async searchUsers(query) {
    return viewUserController.searchUsers(query);
  }

  // Create operations
  async createUser(userData) {
    return createUserController.createUser(userData);
  }

  // Update operations
  async updateUser(userId, userData) {
    return updateUserController.updateUser(userId, userData);
  }

  // Delete operations
  async deleteUser(userId) {
    return deleteUserController.deleteUser(userId);
  }

  async suspendUser(userId) {
    return deleteUserController.suspendUser(userId);
  }

  // Role operations
  async getRoles() {
    return roleController.getAllRoles();
  }
}

export const userController = new UserController();
export default userController;

