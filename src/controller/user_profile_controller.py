"""
User Profile Controller - Control Layer (BCE Framework)
Use Case: As a user admin, I want to manage user profiles (roles) so that access control can be maintained.
"""

from typing import Optional, Dict, Any, List
from supabase import Client


class UserProfileController:
    """
    Control layer for managing system roles.
    Handles role CRUD operations.
    """
    
    def __init__(self, supabase_client: Client):
        """
        Initialize controller with Supabase client.
        
        Args:
            supabase_client: Supabase client instance
        """
        self.supabase = supabase_client
    
    def get_all_roles(self) -> List[Dict[str, Any]]:
        """
        Retrieve all roles from the database.
        
        Returns:
            List of role dictionaries
        """
        try:
            result = self.supabase.table('roles').select('*').order('id').execute()
            if result.data:
                return result.data
            return []
        except Exception as e:
            print(f"Error getting roles: {e}")
            raise Exception(f'Error retrieving roles: {str(e)}')
    
    def get_role_by_id(self, role_id: int) -> Optional[Dict[str, Any]]:
        """
        Retrieve a specific role by ID.
        
        Args:
            role_id: ID of the role to retrieve
            
        Returns:
            Role dictionary if found, None otherwise
        """
        try:
            result = self.supabase.table('roles').select('*').eq('id', role_id).execute()
            if result.data and len(result.data) > 0:
                return result.data[0]
            return None
        except Exception as e:
            print(f"Error getting role by ID: {e}")
            raise Exception(f'Error retrieving role: {str(e)}')
    
    def get_role_by_code(self, role_code: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve a specific role by code.
        
        Args:
            role_code: Code of the role to retrieve
            
        Returns:
            Role dictionary if found, None otherwise
        """
        try:
            result = self.supabase.table('roles').select('*').eq('role_code', role_code).execute()
            if result.data and len(result.data) > 0:
                return result.data[0]
            return None
        except Exception as e:
            print(f"Error getting role by code: {e}")
            raise Exception(f'Error retrieving role: {str(e)}')
    
    def create_role(
        self,
        role_name: str,
        role_code: str,
        dashboard_route: str,
        description: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Create a new role.
        
        Args:
            role_name: Display name of the role
            role_code: Unique code for the role
            dashboard_route: Frontend route for the role's dashboard
            description: Optional description of the role
            
        Returns:
            Dictionary with success status, message, and role data
        """
        try:
            # Validate required fields
            if not role_name or not role_code or not dashboard_route:
                return {
                    'success': False,
                    'message': 'Role name, code, and dashboard route are required.'
                }
            
            # Check if role code already exists
            existing_role = self.get_role_by_code(role_code)
            if existing_role:
                return {
                    'success': False,
                    'message': f'Role with code "{role_code}" already exists.'
                }
            
            # Check if role name already exists
            result = self.supabase.table('roles').select('*').eq('role_name', role_name).execute()
            if result.data and len(result.data) > 0:
                return {
                    'success': False,
                    'message': f'Role with name "{role_name}" already exists.'
                }
            
            # Create role
            role_data = {
                'role_name': role_name,
                'role_code': role_code.upper(),
                'dashboard_route': dashboard_route,
                'description': description
            }
            
            result = self.supabase.table('roles').insert(role_data).execute()
            
            if result.data and len(result.data) > 0:
                return {
                    'success': True,
                    'message': 'Role created successfully.',
                    'role': result.data[0]
                }
            else:
                return {
                    'success': False,
                    'message': 'Failed to create role.'
                }
        except Exception as e:
            print(f"Error creating role: {e}")
            return {
                'success': False,
                'message': f'Error creating role: {str(e)}'
            }
    
    def update_role(
        self,
        role_id: int,
        role_name: Optional[str] = None,
        role_code: Optional[str] = None,
        dashboard_route: Optional[str] = None,
        description: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Update an existing role.
        
        Args:
            role_id: ID of the role to update
            role_name: New role name (optional)
            role_code: New role code (optional)
            dashboard_route: New dashboard route (optional)
            description: New description (optional)
            
        Returns:
            Dictionary with success status, message, and updated role data
        """
        try:
            # Check if role exists
            existing_role = self.get_role_by_id(role_id)
            if not existing_role:
                return {
                    'success': False,
                    'message': 'Role not found.'
                }
            
            update_data = {}
            
            # Check for duplicate role name
            if role_name is not None and role_name != existing_role.get('role_name'):
                result = self.supabase.table('roles').select('*').eq('role_name', role_name).execute()
                if result.data and len(result.data) > 0:
                    return {
                        'success': False,
                        'message': f'Role with name "{role_name}" already exists.'
                    }
                update_data['role_name'] = role_name
            
            # Check for duplicate role code
            if role_code is not None and role_code.upper() != existing_role.get('role_code'):
                result = self.supabase.table('roles').select('*').eq('role_code', role_code.upper()).execute()
                if result.data and len(result.data) > 0:
                    return {
                        'success': False,
                        'message': f'Role with code "{role_code}" already exists.'
                    }
                update_data['role_code'] = role_code.upper()
            
            if dashboard_route is not None:
                update_data['dashboard_route'] = dashboard_route
            
            if description is not None:
                update_data['description'] = description
            
            # If no fields to update
            if not update_data:
                return {
                    'success': False,
                    'message': 'No fields provided for update.'
                }
            
            # Perform update
            result = self.supabase.table('roles').update(update_data).eq('id', role_id).execute()
            
            if result.data and len(result.data) > 0:
                return {
                    'success': True,
                    'message': 'Role updated successfully.',
                    'role': result.data[0]
                }
            else:
                return {
                    'success': False,
                    'message': 'Failed to update role.'
                }
        except Exception as e:
            print(f"Error updating role: {e}")
            return {
                'success': False,
                'message': f'Error updating role: {str(e)}'
            }
    
    def toggle_role_status(self, role_id: int) -> Dict[str, Any]:
        """
        Toggle role active status (suspend/activate).
        
        Args:
            role_id: ID of the role to toggle
            
        Returns:
            Dictionary with success status and message
        """
        try:
            # Check if role exists
            existing_role = self.get_role_by_id(role_id)
            if not existing_role:
                return {
                    'success': False,
                    'message': 'Role not found.'
                }
            
            # Toggle is_active status
            new_status = not existing_role.get('is_active', True)
            
            result = self.supabase.table('roles').update({
                'is_active': new_status
            }).eq('id', role_id).execute()
            
            if result.data and len(result.data) > 0:
                action = 'activated' if new_status else 'suspended'
                return {
                    'success': True,
                    'message': f'Role {action} successfully.',
                    'role': result.data[0]
                }
            else:
                return {
                    'success': False,
                    'message': 'Failed to update role status.'
                }
        except Exception as e:
            print(f"Error toggling role status: {e}")
            return {
                'success': False,
                'message': f'Error updating role status: {str(e)}'
            }
    
    def delete_role(self, role_id: int, cascade: bool = True) -> Dict[str, Any]:
        """
        Delete a role (hard delete - use with caution).
        WARNING: If cascade=True, this will also delete all users assigned to this role!
        
        Args:
            role_id: ID of the role to delete
            cascade: If True, delete all users with this role first (default: True)
            
        Returns:
            Dictionary with success status, message, and deleted_users count
        """
        try:
            print(f"\n=== DELETE ROLE REQUEST ===")
            print(f"Role ID: {role_id}, Cascade: {cascade}")
            
            # Check if role exists
            existing_role = self.get_role_by_id(role_id)
            if not existing_role:
                print(f"Role {role_id} not found")
                return {
                    'success': False,
                    'message': 'Role not found.',
                    'deleted_users': 0
                }
            
            print(f"Found role: {existing_role.get('role_name')} (ID: {role_id})")
            
            # Check if any users have this role
            users_with_role = self.supabase.table('users').select('id, username').eq('role_id', role_id).execute()
            user_count = len(users_with_role.data) if users_with_role.data else 0
            print(f"Found {user_count} user(s) with role_id {role_id}")
            
            if user_count > 0:
                if cascade:
                    # DELETE ALL USERS WITH THIS ROLE FIRST (CASCADE DELETE)
                    print(f"⚠️ CASCADE DELETE: Deleting {user_count} user(s) with role_id {role_id}")
                    for user in users_with_role.data:
                        print(f"  - Will delete user: {user.get('username')} (ID: {user.get('id')})")
                    
                    delete_users_result = self.supabase.table('users').delete().eq('role_id', role_id).execute()
                    print(f"✅ Successfully deleted {user_count} user(s)")
                    print(f"Delete users result: {delete_users_result}")
                else:
                    # Prevent deletion if cascade is False
                    print(f"❌ Cannot delete: {user_count} users still assigned (cascade=False)")
                    return {
                        'success': False,
                        'message': f'Cannot delete role. {user_count} user(s) still assigned to this role.',
                        'deleted_users': 0
                    }
            
            # Delete role
            print(f"Deleting role {role_id} from roles table...")
            result = self.supabase.table('roles').delete().eq('id', role_id).execute()
            print(f"Role delete result: {result}")
            
            message = f'Role deleted successfully.'
            if user_count > 0 and cascade:
                message = f'Role and {user_count} associated user(s) deleted successfully.'
            
            print(f"✅ {message}")
            print(f"=== DELETE COMPLETE ===\n")
            
            return {
                'success': True,
                'message': message,
                'deleted_users': user_count
            }
        except Exception as e:
            print(f"❌ Error deleting role: {e}")
            import traceback
            traceback.print_exc()
            return {
                'success': False,
                'message': f'Error deleting role: {str(e)}',
                'deleted_users': 0
            }
    
    def search_roles(self, query: str) -> List[Dict[str, Any]]:
        """
        Search roles by name or code.
        
        Args:
            query: Search query string
            
        Returns:
            List of matching role dictionaries
        """
        try:
            # Search in role_name and role_code
            result = self.supabase.table('roles').select('*').or_(
                f'role_name.ilike.%{query}%,role_code.ilike.%{query}%'
            ).order('id').execute()
            
            if result.data:
                return result.data
            return []
        except Exception as e:
            print(f"Error searching roles: {e}")
            raise Exception(f'Error searching roles: {str(e)}')
