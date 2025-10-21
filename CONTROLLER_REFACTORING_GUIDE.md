# Controller Refactoring Guide

## 📋 Overview

The authentication and user management controllers have been refactored into smaller, modular, single-responsibility controllers for better maintainability and code organization.

---

## 🗂️ New Structure

### **Before:**
```
src/app/src/controllers/
├── authController.js        (164 lines - handles everything)
└── userController.js        (46 lines - handles all user operations)
```

### **After:**
```
src/app/src/controllers/
├── auth/
│   ├── index.js                 ← Main export (backward compatible)
│   ├── loginController.js       ← Login operations
│   ├── logoutController.js      ← Logout operations
│   ├── tokenController.js       ← Token management & refresh
│   └── sessionController.js     ← Session state & user data
└── user/
    ├── index.js                 ← Main export (backward compatible)
    ├── createUserController.js  ← Create user
    ├── viewUserController.js    ← View & search users
    ├── updateUserController.js  ← Update user
    ├── deleteUserController.js  ← Delete/suspend user
    └── roleController.js        ← Role management
```

---

## 🔄 Migration Guide

### **Option 1: Keep Using Old API (Backward Compatible)**

No changes needed! The old imports still work:

```javascript
// Old way - still works!
import { authController } from '@/controllers/authController';
import { userController } from '@/controllers/userController';

// Use exactly as before
await authController.login(credentials);
authController.logout();
const users = await userController.getUsers();
```

### **Option 2: Use New Modular Controllers (Recommended)**

Update imports to use specific controllers:

```javascript
// New way - more modular
import { loginController, logoutController } from '@/controllers/auth';
import { viewUserController, createUserController } from '@/controllers/user';

await loginController.login(credentials);
logoutController.logout();
const users = await viewUserController.getAllUsers();
```

---

## 📚 Auth Controllers API

### **1. loginController**
```javascript
import { loginController } from '@/controllers/auth';

// Login user
const result = await loginController.login({
  username: 'admin',
  password: 'admin123',
  role_code: 'USER_ADMIN'
});

// Check if logged in
if (loginController.isLoggedIn()) {
  const user = loginController.getCurrentUser();
  const route = loginController.getDashboardRoute();
}
```

### **2. logoutController**
```javascript
import { logoutController } from '@/controllers/auth';

// Simple logout
logoutController.logout();

// Logout and redirect
logoutController.logoutAndRedirect(router);

// Force logout (security)
logoutController.forceLogout('Token compromised');
```

### **3. tokenController**
```javascript
import { tokenController } from '@/controllers/auth';

// Get tokens
const accessToken = tokenController.getAccessToken();
const refreshToken = tokenController.getRefreshToken();

// Set tokens
tokenController.setAccessToken(newToken);

// Check token validity
if (tokenController.hasValidToken()) {
  // Token exists
}

// Refresh expired token
const refreshed = await tokenController.refreshAccessToken();

// Make authenticated API call with auto-refresh
const response = await tokenController.authenticatedFetch('/api/users', {
  method: 'GET'
});
```

### **4. sessionController**
```javascript
import { sessionController } from '@/controllers/auth';

// Get current user
const user = sessionController.getCurrentUser();

// Get user details
const userId = sessionController.getUserId();
const role = sessionController.getUserRole();
const dashboardRoute = sessionController.getUserDashboardRoute();
const username = sessionController.getUsername();
const fullName = sessionController.getFullName();

// Check authentication
if (sessionController.isAuthenticated()) {
  // User is logged in
}

// Update user data
sessionController.updateCurrentUser({ full_name: 'New Name' });

// Verify session
const valid = await sessionController.verifySession();

// Clear session
sessionController.clearSession();
```

---

## 👥 User Controllers API

### **1. createUserController**
```javascript
import { createUserController } from '@/controllers/user';

// Create user
const response = await createUserController.createUser({
  username: 'newuser',
  password: 'password123',
  full_name: 'New User',
  email: 'user@example.com',
  role_id: 2
});

// Validate before creating
const validation = createUserController.validateUserData(userData);
if (!validation.valid) {
  console.error(validation.errors);
}
```

### **2. viewUserController**
```javascript
import { viewUserController } from '@/controllers/user';

// Get all users
const response = await viewUserController.getAllUsers();
const users = await viewUserController.parseUserListResponse(response);

// Get single user
const response = await viewUserController.getUserById(5);
const user = await viewUserController.parseSingleUserResponse(response);

// Search users
const response = await viewUserController.searchUsers('john');
const results = await viewUserController.parseUserListResponse(response);
```

### **3. updateUserController**
```javascript
import { updateUserController } from '@/controllers/user';

// Update user
const response = await updateUserController.updateUser(userId, {
  full_name: 'Updated Name',
  email: 'new@email.com',
  role_id: 3
});

// Update single field
await updateUserController.updateField(userId, 'email', 'new@email.com');

// Activate/deactivate user
await updateUserController.activateUser(userId);
await updateUserController.deactivateUser(userId);

// Change role
await updateUserController.changeUserRole(userId, newRoleId);

// Validate update data
const validation = updateUserController.validateUpdateData(updateData);
if (!validation.valid) {
  console.error(validation.errors);
}
```

### **4. deleteUserController**
```javascript
import { deleteUserController } from '@/controllers/user';

// Delete (suspend) user
const response = await deleteUserController.deleteUser(userId);
const result = await deleteUserController.parseDeleteResponse(response);

// Confirm deletion
const confirmed = deleteUserController.confirmDeletion(
  userId,
  confirmUsername,
  actualUsername
);

if (confirmed) {
  await deleteUserController.suspendUser(userId);
}
```

### **5. roleController**
```javascript
import { roleController } from '@/controllers/user';

// Get all roles
const response = await roleController.getAllRoles();
const roles = await roleController.parseRolesResponse(response);

// Get role name by code
const roleName = roleController.getRoleNameByCode(roles, 'USER_ADMIN');

// Get role by ID
const role = roleController.getRoleById(roles, 1);

// Get dashboard route
const route = roleController.getDashboardRouteByCode(roles, 'USER_ADMIN');

// Format for select dropdown
const options = roleController.formatRolesForSelect(roles);
// Returns: [{ value: 1, label: 'User Admin', code: 'USER_ADMIN', route: '/dashboard/admin' }]
```

---

## 🎯 Benefits of New Structure

### **1. Single Responsibility Principle**
Each controller handles one specific concern:
- loginController → Only login operations
- logoutController → Only logout operations
- tokenController → Only token management
- sessionController → Only session state

### **2. Better Code Organization**
- Easier to find specific functionality
- Smaller files (50-100 lines vs 164 lines)
- Clear separation of concerns

### **3. Improved Maintainability**
- Changes to login don't affect logout
- Token logic isolated from session logic
- Easier to test individual components

### **4. Enhanced Reusability**
- Use only what you need
- Import specific controllers
- Avoid loading unnecessary code

### **5. Better Type Safety**
- Clearer function signatures
- Focused interfaces
- Easier to document

---

## 📝 Migration Examples

### **Example 1: Login Page**

**Before:**
```javascript
import { authController } from '@/controllers/authController';

const handleLogin = async () => {
  const result = await authController.login(credentials);
  if (result.success) {
    router.push(authController.getUserDashboardRoute());
  }
};
```

**After (New Way):**
```javascript
import { loginController } from '@/controllers/auth';

const handleLogin = async () => {
  const result = await loginController.login(credentials);
  if (result.success) {
    router.push(loginController.getDashboardRoute());
  }
};
```

### **Example 2: Dashboard**

**Before:**
```javascript
import { authController } from '@/controllers/authController';

const user = authController.getCurrentUser();
const handleLogout = () => {
  authController.logout();
  router.push('/');
};
```

**After (New Way):**
```javascript
import { sessionController, logoutController } from '@/controllers/auth';

const user = sessionController.getCurrentUser();
const handleLogout = () => {
  logoutController.logoutAndRedirect(router);
};
```

### **Example 3: User Management**

**Before:**
```javascript
import { userController } from '@/controllers/userController';

const users = await userController.getUsers();
await userController.createUser(newUserData);
await userController.updateUser(userId, updateData);
await userController.deleteUser(userId);
```

**After (New Way):**
```javascript
import { 
  viewUserController, 
  createUserController,
  updateUserController,
  deleteUserController 
} from '@/controllers/user';

const response = await viewUserController.getAllUsers();
const users = await viewUserController.parseUserListResponse(response);

await createUserController.createUser(newUserData);
await updateUserController.updateUser(userId, updateData);
await deleteUserController.deleteUser(userId);
```

---

## 🔧 Quick Reference

### **Import Patterns**

```javascript
// Single controller
import { loginController } from '@/controllers/auth';

// Multiple controllers
import { loginController, logoutController } from '@/controllers/auth';

// All auth controllers
import * as auth from '@/controllers/auth';

// Backward compatible
import { authController } from '@/controllers/auth';
import { userController } from '@/controllers/user';

// Mixed approach
import { loginController } from '@/controllers/auth';
import { authController } from '@/controllers/auth'; // For other methods
```

---

## ✅ Testing the Changes

Run your application and verify:
1. ✅ Login still works
2. ✅ Logout still works
3. ✅ User management operations work
4. ✅ Token refresh works automatically
5. ✅ No console errors

---

## 📞 Support

If you encounter any issues during migration:
1. Check import paths are correct
2. Verify controller methods match the new API
3. Use backward compatible imports if needed
4. Refer to this guide for API reference

---

## 🎓 Best Practices

1. **Use specific controllers** when you know exactly what you need
2. **Use index imports** for backward compatibility
3. **Keep imports organized** - group auth and user imports separately
4. **Add validation** using built-in validate methods
5. **Handle errors** appropriately for each operation

---

**Happy Coding! 🚀**

