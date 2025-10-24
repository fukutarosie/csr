/**
 * BCE Architecture - BOUNDARY Layer
 * 
 * Component: UserAdminDashboard
 * Layer: Boundary (User Interface)
 * 
 * Responsibilities:
 * - Display admin dashboard interface
 * - Show user management tables and forms
 * - Capture user management actions (create, update, delete)
 * - Delegate business operations to Control layer controllers
 * 
 * Dependencies:
 * - Control: sessionController, logoutController (authentication)
 * - Control: viewUserController, createUserController, updateUserController, deleteUserController (user management)
 * - Control: userProfileController (role management)
 * 
 * BCE Flow:
 * User Action → Dashboard (Boundary) → Specific Controller (Control) → Backend API
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { sessionController, logoutController } from '@/controllers/auth';
import { 
  viewUserController, 
  createUserController,
  updateUserController,
  deleteUserController
} from '@/controllers/user';
import { getBackendRoles } from '@/controllers/auth/roleConstants';
import userProfileController from '@/controllers/userProfile/userProfileController';

export default function UserAdminDashboard() {
  const [user, setUser] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState('manage-accounts');
  const router = useRouter();

  // User Account Management State
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  // Modal-scoped errors
  const [createError, setCreateError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    full_name: '',
    email: '',
    role_id: '',
    is_active: true
  });

  // Role Management State
  const [roleSearchQuery, setRoleSearchQuery] = useState('');
  const [showCreateRoleModal, setShowCreateRoleModal] = useState(false);
  const [showEditRoleModal, setShowEditRoleModal] = useState(false);
  const [showDeleteRoleConfirm, setShowDeleteRoleConfirm] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [createRoleError, setCreateRoleError] = useState('');
  
  // Role Form State
  const [roleFormData, setRoleFormData] = useState({
    role_name: '',
    role_code: '',
    description: '',
    dashboard_route: ''
  });

  useEffect(() => {
    const initializeDashboard = async () => {
      if (!sessionController.isAuthenticated()) {
        router.push('/');
        return;
      }

      const currentUser = sessionController.getCurrentUser();
      
      if (currentUser.role_code !== 'USER_ADMIN') {
        router.push(currentUser.dashboard_route || '/');
        return;
      }

      setUser(currentUser);
      
      try {
        // Load roles first
        await loadRoles();
        // Then load users once roles are available
        await loadUsers();
      } catch (err) {
        console.error('Dashboard initialization error:', err);
      }
    };

    initializeDashboard();
  }, [router]);

  const loadUsers = async () => {
      try {
        // NEW MODULAR APPROACH
        const response = await viewUserController.getAllUsers();
        const users = await viewUserController.parseUserListResponse(response);
        setUsers(users);
      } catch (err) {
        setError('Error loading users');
        console.error('Load users error:', err);
      }
  };

  const loadRoles = async () => {
      try {
        // Load roles from role management API for comprehensive role data
        const response = await userProfileController.getAllRoles();
        const rolesData = await userProfileController.parseRolesResponse(response);
        
        if (rolesData.length > 0) {
          setRoles(rolesData);
        } else {
          // Fallback to role constants if API fails
          const roles = await getBackendRoles();
          setRoles(roles);
        }
      } catch (err) {
        // Fallback to role constants on error
        try {
          const roles = await getBackendRoles();
          setRoles(roles);
        } catch (fallbackErr) {
          setError('Error loading roles');
          console.error('Load roles error:', err, fallbackErr);
        }
      }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadUsers();
      return;
    }
    try {
      // NEW MODULAR APPROACH
      const response = await viewUserController.searchUsers(searchQuery);
      const users = await viewUserController.parseUserListResponse(response);
      setUsers(users);
    } catch (err) {
      setError('Search failed');
      console.error('Search error:', err);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setCreateError('');
    setSuccess('');
    
    // NEW MODULAR APPROACH - Validate before creating
    const validation = createUserController.validateUserData(formData);
    if (!validation.valid) {
      setCreateError(validation.errors.join(', '));
      setLoading(false);
      return;
    }
    
    try {
      const response = await createUserController.createUser(formData);
      const data = await response.json();
      if (response.ok && data.success) {
        setSuccess('User created successfully');
        setShowCreateModal(false);
        loadUsers();
        resetForm();
      } else {
        setCreateError(data.detail || data.message || 'Failed to create user');
      }
    } catch (err) {
      setCreateError('Error creating user');
      console.error('Create user error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    const updateData = {
      full_name: formData.full_name,
      email: formData.email,
      role_id: formData.role_id ? parseInt(formData.role_id) : null,
      is_active: formData.is_active
    };
    
    // NEW MODULAR APPROACH - Validate before updating
    const validation = updateUserController.validateUpdateData(updateData);
    if (!validation.valid) {
      setError(validation.errors.join(', '));
      setLoading(false);
      return;
    }
    
    try {
      const response = await updateUserController.updateUser(selectedUser.id, updateData);
      const data = await response.json();
      if (data.success) {
        setSuccess('User updated successfully');
        setShowEditModal(false);
        loadUsers();
        resetForm();
      } else {
        setError(data.message || 'Failed to update user');
      }
    } catch (err) {
      setError('Error updating user');
      console.error('Update user error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      // NEW MODULAR APPROACH
      const response = await deleteUserController.deleteUser(selectedUser.id);
      const result = await deleteUserController.parseDeleteResponse(response);
      
      if (result.success) {
        setSuccess(result.message);
        setShowDeleteConfirm(false);
        loadUsers();
        setSelectedUser(null);
      } else {
        setError('Failed to suspend user');
      }
    } catch (err) {
      setError(err.message || 'Error suspending user');
      console.error('Delete user error:', err);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      full_name: user.full_name,
      email: user.email,
      role_id: user.role_id,
      is_active: user.is_active
    });
    setShowEditModal(true);
  };

  const openDeleteConfirm = (user) => {
    setSelectedUser(user);
    setShowDeleteConfirm(true);
  };

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      full_name: '',
      email: '',
      role_id: '',
      is_active: true
    });
    setSelectedUser(null);
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    // NEW MODULAR APPROACH
    logoutController.logoutAndRedirect(router);
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  // Role Management Functions
  const handleRoleSearch = () => {
    if (!roleSearchQuery.trim()) {
      // Show all roles
      return roles;
    }
    // Filter roles based on search query
    return roles.filter(role => 
      role.role_name.toLowerCase().includes(roleSearchQuery.toLowerCase()) ||
      role.role_code.toLowerCase().includes(roleSearchQuery.toLowerCase())
    );
  };

  const handleCreateRole = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setCreateRoleError('');
    setSuccess('');
    
    // Validation
    const validation = userProfileController.validateRoleData(roleFormData);
    if (!validation.valid) {
      setCreateRoleError(validation.errors.join(', '));
      setLoading(false);
      return;
    }
    
    try {
      const response = await userProfileController.createRole(roleFormData);
      const result = await userProfileController.parseRoleResponse(response);
      
      if (result.success) {
        setSuccess(result.message || 'Role created successfully');
        setShowCreateRoleModal(false);
        await loadRoles();
        resetRoleForm();
      } else {
        setCreateRoleError(result.message || 'Error creating role');
      }
    } catch (err) {
      setCreateRoleError('Error creating role');
      console.error('Create role error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    console.log('=== UPDATE ROLE ===');
    console.log('Selected Role:', selectedRole);
    console.log('Form Data:', roleFormData);
    
    // Validation
    const validation = userProfileController.validateUpdateData(roleFormData);
    console.log('Validation Result:', validation);
    
    if (!validation.valid) {
      setError(validation.errors.join(', '));
      setLoading(false);
      return;
    }
    
    try {
      const result = await userProfileController.updateRole(selectedRole.id, roleFormData);
      console.log('Update Response:', result);
      
      if (result.success) {
        setSuccess(result.message || 'Role updated successfully');
        setShowEditRoleModal(false);
        await loadRoles();
        resetRoleForm();
      } else {
        setError(result.message || 'Error updating role');
      }
    } catch (err) {
      setError(err.message || 'Error updating role');
      console.error('Update role error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRole = async () => {
    if (!selectedRole) {
      setError('No role selected');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    console.log('Attempting to delete role:', selectedRole);
    
    try {
      const response = await userProfileController.deleteRole(selectedRole.id);
      console.log('Delete role response:', response);
      
      const result = await userProfileController.parseRoleResponse(response);
      console.log('Parsed delete result:', result);
      
      if (result.success) {
        const message = result.deleted_users 
          ? `Role and ${result.deleted_users} associated user(s) deleted successfully.`
          : result.message || 'Role deleted successfully';
        
        setSuccess(message);
        setShowDeleteRoleConfirm(false);
        await loadRoles();
        await loadUsers(); // Reload users to reflect deleted accounts
        setSelectedRole(null);
      } else {
        setError(result.message || 'Error deleting role');
      }
    } catch (err) {
      setError(err.message || 'Error deleting role');
      console.error('Delete role error:', err);
    } finally {
      setLoading(false);
    }
  };

  const openEditRoleModal = (role) => {
    setSelectedRole(role);
    setRoleFormData({
      role_name: role.role_name,
      role_code: role.role_code,
      description: role.description || '',
      dashboard_route: role.dashboard_route,
      is_active: role.is_active !== undefined ? role.is_active : true
    });
    setShowEditRoleModal(true);
  };

  const openDeleteRoleConfirm = (role) => {
    setSelectedRole(role);
    setShowDeleteRoleConfirm(true);
  };

  const resetRoleForm = () => {
    setRoleFormData({
      role_name: '',
      role_code: '',
      description: '',
      dashboard_route: ''
    });
    setSelectedRole(null);
  };

  const filteredRoles = handleRoleSearch();

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">User Admin Dashboard</h1>
            <p className="text-indigo-100 mt-1">System Administration Portal</p>
          </div>
          <button
            onClick={handleLogoutClick}
            className="bg-white hover:bg-gray-100 text-indigo-600 font-semibold px-6 py-2 rounded-lg transition duration-200 shadow-md"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Welcome, {user.full_name}!
          </h2>
          <p className="text-gray-600">
            Role: <span className="font-medium text-indigo-600">{user.role_name}</span>
          </p>
        </div>

        {/* Alert Messages */}
        {error && error !== 'Error loading roles' && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
            {success}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('manage-accounts')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                  activeTab === 'manage-accounts'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Manage User Accounts
              </button>

              <button
                onClick={() => setActiveTab('manage-profile')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                  activeTab === 'manage-profile'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Manage Roles
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'manage-accounts' && (
              <div>
                {/* Search and Create */}
                <div className="flex gap-4 mb-6">
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      placeholder="Search by username or full name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                    />
                    <button
                      onClick={handleSearch}
                      className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition"
                    >
                      Search
                    </button>
                  </div>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
                  >
                    + Create User
                  </button>
                </div>

                {/* Users Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{u.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{u.username}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{u.full_name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{u.role_name}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              u.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {u.is_active ? 'Active' : 'Suspended'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => openEditModal(u)}
                              className="text-indigo-600 hover:text-indigo-900 mr-4"
                            >
                              Update
                            </button>
                            <button
                              onClick={() => openDeleteConfirm(u)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Suspend
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'manage-profile' && (
              <div>
                {/* Search and Create Role */}
                <div className="flex gap-4 mb-6">
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      placeholder="Search by role name or code..."
                      value={roleSearchQuery}
                      onChange={(e) => setRoleSearchQuery(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                    />
                    <button
                      onClick={() => setRoleSearchQuery(roleSearchQuery)}
                      className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition"
                    >
                      Search
                    </button>
                  </div>
                  <button
                    onClick={() => setShowCreateRoleModal(true)}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
                  >
                    + Create Role
                  </button>
                </div>

                {/* Roles Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role Code</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dashboard Route</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredRoles.map((role) => (
                        <tr key={role.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{role.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{role.role_name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{role.role_code}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{role.dashboard_route}</td>
                          <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{role.description || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              role.is_active !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {role.is_active !== false ? 'Active' : 'Suspended'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => openEditRoleModal(role)}
                              className="text-indigo-600 hover:text-indigo-900 mr-4"
                            >
                              Update
                            </button>
                            <button
                              onClick={() => openDeleteRoleConfirm(role)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Create New User</h3>
            {createError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {createError}
              </div>
            )}
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  value={formData.role_id}
                  onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900"
                >
                  <option value="">Select a role</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>{role.role_name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowCreateModal(false); resetForm(); }}
                  className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Update User: {selectedUser.username}</h3>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  value={formData.role_id}
                  onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900"
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>{role.role_name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="mr-2"
                />
                <label className="text-sm font-medium text-gray-700">Active</label>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); resetForm(); }}
                  className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Confirm Suspend</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to suspend user <strong>{selectedUser.username}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={handleDeleteUser}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition disabled:opacity-50"
              >
                {loading ? 'Suspending...' : 'Suspend'}
              </button>
              <button
                onClick={() => { setShowDeleteConfirm(false); setSelectedUser(null); }}
                className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Confirm Logout</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to logout?</p>
            <div className="flex gap-4">
              <button
                onClick={confirmLogout}
                className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
              >
                Logout
              </button>
              <button
                onClick={cancelLogout}
                className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Role Modal */}
      {showCreateRoleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Create New Role</h3>
            {createRoleError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {createRoleError}
              </div>
            )}
            <form onSubmit={handleCreateRole} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role Name</label>
                <input
                  type="text"
                  value={roleFormData.role_name}
                  onChange={(e) => setRoleFormData({ ...roleFormData, role_name: e.target.value })}
                  required
                  placeholder="e.g., User Admin"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role Code</label>
                <input
                  type="text"
                  value={roleFormData.role_code}
                  onChange={(e) => setRoleFormData({ ...roleFormData, role_code: e.target.value })}
                  required
                  placeholder="e.g., USER_ADMIN"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dashboard Route</label>
                <input
                  type="text"
                  value={roleFormData.dashboard_route}
                  onChange={(e) => setRoleFormData({ ...roleFormData, dashboard_route: e.target.value })}
                  required
                  placeholder="e.g., /dashboard/admin"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={roleFormData.description}
                  onChange={(e) => setRoleFormData({ ...roleFormData, description: e.target.value })}
                  rows="3"
                  placeholder="Role description..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowCreateRoleModal(false); resetRoleForm(); }}
                  className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {showEditRoleModal && selectedRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Update Role: {selectedRole.role_name}</h3>
            <form onSubmit={handleUpdateRole} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role Name</label>
                <input
                  type="text"
                  value={roleFormData.role_name}
                  onChange={(e) => setRoleFormData({ ...roleFormData, role_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role Code</label>
                <input
                  type="text"
                  value={roleFormData.role_code}
                  onChange={(e) => setRoleFormData({ ...roleFormData, role_code: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dashboard Route</label>
                <input
                  type="text"
                  value={roleFormData.dashboard_route}
                  onChange={(e) => setRoleFormData({ ...roleFormData, dashboard_route: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={roleFormData.description}
                  onChange={(e) => setRoleFormData({ ...roleFormData, description: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={roleFormData.is_active}
                  onChange={(e) => setRoleFormData({ ...roleFormData, is_active: e.target.checked })}
                  className="mr-2"
                />
                <label className="text-sm font-medium text-gray-700">Active</label>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowEditRoleModal(false); resetRoleForm(); }}
                  className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Role Confirmation Modal */}
      {showDeleteRoleConfirm && selectedRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h3 className="text-xl font-bold text-red-600 mb-4">⚠️ WARNING: Cascading Delete</h3>
            <div className="mb-6 space-y-3">
              <p className="text-gray-800 font-semibold">
                You are about to <strong className="text-red-600">permanently delete</strong> the role:
              </p>
              <p className="text-lg font-bold text-indigo-600 pl-4">
                "{selectedRole.role_name}"
              </p>
              <div className="bg-red-50 border-l-4 border-red-600 p-4 mt-4">
                <p className="text-red-800 font-semibold mb-2">
                  ⚠️ ALL USER ACCOUNTS WITH THIS ROLE WILL ALSO BE DELETED!
                </p>
                <p className="text-red-700 text-sm">
                  This action is <strong>IRREVERSIBLE</strong> and will permanently remove:
                </p>
                <ul className="list-disc list-inside text-red-700 text-sm mt-2 pl-2">
                  <li>The role from the system</li>
                  <li>All user accounts assigned to this role</li>
                  <li>All data associated with these users</li>
                </ul>
              </div>
              <p className="text-gray-600 text-sm mt-4">
                Are you absolutely sure you want to proceed?
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleDeleteRole}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition disabled:opacity-50"
              >
                {loading ? 'Deleting...' : 'Yes, Delete Everything'}
              </button>
              <button
                onClick={() => { setShowDeleteRoleConfirm(false); setSelectedRole(null); }}
                className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

