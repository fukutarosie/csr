"""
Search User Account Controller - Control Layer (BCE Framework)
Use Case: As a user admin, I want to search for user accounts so that specific users are quickly located.
"""

from typing import List
from supabase import Client
from entity.user import User


class SearchUserAccountController:
    """
    Control layer for searching user accounts.
    Handles user search operations across multiple fields.
    """
    
    def __init__(self, supabase_client: Client):
        self.supabase = supabase_client

    def search_users(self, query: str) -> List[User]:
        """
        Search for users by username or full name.
        
        Args:
            query: Search query string (searches username, full_name, and email)
            
        Returns:
            List of matching User objects
            
        Note:
        - Case-insensitive search
        - Searches across username, full_name, and email fields
        - Returns all users if query is empty
        - Removes duplicate results
        """
        try:
            # If query is empty or whitespace, return all users
            if not query or not query.strip():
                return self._get_all_users()

            # Prepare search pattern for ILIKE (case-insensitive)
            query_str = f"%{query}%"

            # Search across multiple fields
            usernames = self.supabase.from_('user_details').select('*').ilike('username', query_str).execute()
            fullnames = self.supabase.from_('user_details').select('*').ilike('full_name', query_str).execute()
            emails = self.supabase.from_('user_details').select('*').ilike('email', query_str).execute()

            # Merge results and remove duplicates by user ID
            seen_ids = set()
            users = []

            for result in [usernames, fullnames, emails]:
                if result.data:
                    for user_data in result.data:
                        user_id = user_data['id']
                        if user_id not in seen_ids:
                            seen_ids.add(user_id)
                            users.append(self._create_user_from_data(user_data))

            return users

        except Exception as e:
            print(f"Error searching users: {e}")
            return []

    def search_users_by_username(self, username: str) -> List[User]:
        """
        Search for users specifically by username.
        
        Args:
            username: Username search query
            
        Returns:
            List of matching User objects
        """
        try:
            if not username or not username.strip():
                return []

            query_str = f"%{username}%"
            result = self.supabase.from_('user_details').select('*').ilike('username', query_str).execute()

            users = []
            if result.data:
                for user_data in result.data:
                    users.append(self._create_user_from_data(user_data))

            return users

        except Exception as e:
            print(f"Error searching users by username: {e}")
            return []

    def search_users_by_full_name(self, full_name: str) -> List[User]:
        """
        Search for users specifically by full name.
        
        Args:
            full_name: Full name search query
            
        Returns:
            List of matching User objects
        """
        try:
            if not full_name or not full_name.strip():
                return []

            query_str = f"%{full_name}%"
            result = self.supabase.from_('user_details').select('*').ilike('full_name', query_str).execute()

            users = []
            if result.data:
                for user_data in result.data:
                    users.append(self._create_user_from_data(user_data))

            return users

        except Exception as e:
            print(f"Error searching users by full name: {e}")
            return []

    def search_users_by_email(self, email: str) -> List[User]:
        """
        Search for users specifically by email.
        
        Args:
            email: Email search query
            
        Returns:
            List of matching User objects
        """
        try:
            if not email or not email.strip():
                return []

            query_str = f"%{email}%"
            result = self.supabase.from_('user_details').select('*').ilike('email', query_str).execute()

            users = []
            if result.data:
                for user_data in result.data:
                    users.append(self._create_user_from_data(user_data))

            return users

        except Exception as e:
            print(f"Error searching users by email: {e}")
            return []

    def search_users_by_role(self, query: str, role_code: str) -> List[User]:
        """
        Search for users within a specific role.
        
        Args:
            query: Search query string
            role_code: Role code to filter by
            
        Returns:
            List of matching User objects with the specified role
        """
        try:
            if not query or not query.strip():
                # Return all users with the specified role
                result = self.supabase.from_('user_details').select('*').eq('role_code', role_code).execute()
                users = []
                if result.data:
                    for user_data in result.data:
                        users.append(self._create_user_from_data(user_data))
                return users

            query_str = f"%{query}%"

            # Search within specific role
            usernames = self.supabase.from_('user_details').select('*').eq('role_code', role_code).ilike('username', query_str).execute()
            fullnames = self.supabase.from_('user_details').select('*').eq('role_code', role_code).ilike('full_name', query_str).execute()
            emails = self.supabase.from_('user_details').select('*').eq('role_code', role_code).ilike('email', query_str).execute()

            # Merge and deduplicate
            seen_ids = set()
            users = []

            for result in [usernames, fullnames, emails]:
                if result.data:
                    for user_data in result.data:
                        user_id = user_data['id']
                        if user_id not in seen_ids:
                            seen_ids.add(user_id)
                            users.append(self._create_user_from_data(user_data))

            return users

        except Exception as e:
            print(f"Error searching users by role: {e}")
            return []

    def search_active_users(self, query: str) -> List[User]:
        """
        Search for active (non-suspended) users only.
        
        Args:
            query: Search query string
            
        Returns:
            List of matching active User objects
        """
        try:
            all_results = self.search_users(query)
            return [user for user in all_results if user.is_active]
        except Exception as e:
            print(f"Error searching active users: {e}")
            return []

    def search_suspended_users(self, query: str) -> List[User]:
        """
        Search for suspended (inactive) users only.
        
        Args:
            query: Search query string
            
        Returns:
            List of matching suspended User objects
        """
        try:
            all_results = self.search_users(query)
            return [user for user in all_results if not user.is_active]
        except Exception as e:
            print(f"Error searching suspended users: {e}")
            return []

    def _get_all_users(self) -> List[User]:
        """
        Helper method to retrieve all users.
        
        Returns:
            List of all User objects
        """
        try:
            result = self.supabase.from_('user_details').select('*').order('id').execute()
            users = []
            if result.data:
                for user_data in result.data:
                    users.append(self._create_user_from_data(user_data))
            return users
        except Exception as e:
            print(f"Error fetching all users: {e}")
            return []

    def _create_user_from_data(self, user_data: dict) -> User:
        """
        Helper method to create User object from database data.
        
        Args:
            user_data: Dictionary containing user data from database
            
        Returns:
            User object
        """
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
