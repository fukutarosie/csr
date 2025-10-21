"""
View User Account Controller - Control Layer (BCE Framework)
Use Case: As a user admin, I want to view user accounts so that information is verified and data remains accurate.
"""

from typing import Optional, List
from supabase import Client
from entity.user import User


class ViewUserAccountController:
    """
    Control layer for viewing user accounts.
    Handles retrieval of user information and listing operations.
    """
    
    def __init__(self, supabase_client: Client):
        self.supabase = supabase_client

    def get_user_by_id(self, user_id: int) -> Optional[User]:
        """
        Retrieve a single user by ID.
        
        Args:
            user_id: The user's ID
            
        Returns:
            User object if found, None otherwise
        """
        try:
            result = self.supabase.from_('user_details').select('*').eq('id', user_id).execute()
            if result.data and len(result.data) > 0:
                user_data = result.data[0]
                return User(
                    id=user_data['id'],
                    username=user_data['username'],
                    full_name=user_data['full_name'],
                    email=user_data.get('email'),
                    role_id=user_data.get('role_id'),
                    role_name=user_data.get('role_name'),
                    role_code=user_data.get('role_code'),
                    dashboard_route=user_data.get('dashboard_route'),
                    is_active=user_data.get('is_active', True),
                    last_login=user_data.get('last_login')
                )
            return None
        except Exception as e:
            print(f"Error fetching user by ID: {e}")
            return None

    def get_user_by_username(self, username: str) -> Optional[User]:
        """
        Retrieve a single user by username.
        
        Args:
            username: The user's username
            
        Returns:
            User object if found, None otherwise
        """
        try:
            result = self.supabase.from_('user_details').select('*').eq('username', username).execute()
            if result.data and len(result.data) > 0:
                user_data = result.data[0]
                return User(
                    id=user_data['id'],
                    username=user_data['username'],
                    full_name=user_data['full_name'],
                    email=user_data.get('email'),
                    role_id=user_data.get('role_id'),
                    role_name=user_data.get('role_name'),
                    role_code=user_data.get('role_code'),
                    dashboard_route=user_data.get('dashboard_route'),
                    is_active=user_data.get('is_active', True),
                    last_login=user_data.get('last_login')
                )
            return None
        except Exception as e:
            print(f"Error fetching user by username: {e}")
            return None

    def get_all_users(self) -> List[User]:
        """
        Retrieve all users from the database.
        
        Returns:
            List of User objects, ordered by ID
        """
        try:
            result = self.supabase.from_('user_details').select('*').order('id').execute()
            users = []
            if result.data:
                for user_data in result.data:
                    users.append(User(
                        id=user_data['id'],
                        username=user_data['username'],
                        full_name=user_data['full_name'],
                        email=user_data.get('email'),
                        role_id=user_data.get('role_id'),
                        role_name=user_data.get('role_name'),
                        role_code=user_data.get('role_code'),
                        dashboard_route=user_data.get('dashboard_route'),
                        is_active=user_data.get('is_active', True),
                        last_login=user_data.get('last_login')
                    ))
            return users
        except Exception as e:
            print(f"Error fetching all users: {e}")
            return []

    def get_users_by_role(self, role_code: str) -> List[User]:
        """
        Retrieve all users with a specific role.
        
        Args:
            role_code: Role code to filter by (e.g., 'USER_ADMIN', 'CSR')
            
        Returns:
            List of User objects with the specified role
        """
        try:
            result = self.supabase.from_('user_details').select('*').eq('role_code', role_code).order('id').execute()
            users = []
            if result.data:
                for user_data in result.data:
                    users.append(User(
                        id=user_data['id'],
                        username=user_data['username'],
                        full_name=user_data['full_name'],
                        email=user_data.get('email'),
                        role_id=user_data.get('role_id'),
                        role_name=user_data.get('role_name'),
                        role_code=user_data.get('role_code'),
                        dashboard_route=user_data.get('dashboard_route'),
                        is_active=user_data.get('is_active', True),
                        last_login=user_data.get('last_login')
                    ))
            return users
        except Exception as e:
            print(f"Error fetching users by role: {e}")
            return []

    def get_active_users(self) -> List[User]:
        """
        Retrieve all active (non-suspended) users.
        
        Returns:
            List of active User objects
        """
        try:
            result = self.supabase.from_('user_details').select('*').eq('is_active', True).order('id').execute()
            users = []
            if result.data:
                for user_data in result.data:
                    users.append(User(
                        id=user_data['id'],
                        username=user_data['username'],
                        full_name=user_data['full_name'],
                        email=user_data.get('email'),
                        role_id=user_data.get('role_id'),
                        role_name=user_data.get('role_name'),
                        role_code=user_data.get('role_code'),
                        dashboard_route=user_data.get('dashboard_route'),
                        is_active=user_data.get('is_active', True),
                        last_login=user_data.get('last_login')
                    ))
            return users
        except Exception as e:
            print(f"Error fetching active users: {e}")
            return []

    def get_suspended_users(self) -> List[User]:
        """
        Retrieve all suspended (inactive) users.
        
        Returns:
            List of suspended User objects
        """
        try:
            result = self.supabase.from_('user_details').select('*').eq('is_active', False).order('id').execute()
            users = []
            if result.data:
                for user_data in result.data:
                    users.append(User(
                        id=user_data['id'],
                        username=user_data['username'],
                        full_name=user_data['full_name'],
                        email=user_data.get('email'),
                        role_id=user_data.get('role_id'),
                        role_name=user_data.get('role_name'),
                        role_code=user_data.get('role_code'),
                        dashboard_route=user_data.get('dashboard_route'),
                        is_active=user_data.get('is_active', True),
                        last_login=user_data.get('last_login')
                    ))
            return users
        except Exception as e:
            print(f"Error fetching suspended users: {e}")
            return []

    def get_all_roles(self):
        """
        Retrieve all available roles.
        
        Returns:
            List of role dictionaries
        """
        try:
            result = self.supabase.table('roles').select('*').order('id').execute()
            return result.data if result.data else []
        except Exception as e:
            print(f"Error fetching roles: {e}")
            return []
