"""
User Account Controller - Control Layer (BCE Framework)
Handles user account management operations (CRUD + Search)
"""

from typing import Optional, List, Dict, Any
from supabase import Client
from entity.user import User
from datetime import datetime
import bcrypt



# CreateUserAccountController: Handles user creation
class CreateUserAccountController:
    def __init__(self, supabase_client: Client):
        self.supabase = supabase_client

    def hash_password(self, password: str) -> str:
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')

    async def create_user(self, username: str, password: str, full_name: str, email: str, role_id: int) -> Dict[str, Any]:
        try:
            existing = self.supabase.table('users').select('id').eq('username', username).execute()
            if existing.data:
                return {'success': False, 'message': 'Username already exists'}
            hashed_password = self.hash_password(password)
            result = self.supabase.table('users').insert({
                'username': username,
                'password': hashed_password,
                'full_name': full_name,
                'email': email,
                'role_id': role_id,
                'is_active': True
            }).execute()
            if result.data:
                return {'success': True, 'message': 'User created successfully', 'user': result.data[0]}
            else:
                return {'success': False, 'message': 'Failed to create user'}
        except Exception as e:
            return {'success': False, 'message': f'Error creating user: {str(e)}'}

# ViewUserAccountController: Handles user retrieval/search
class ViewUserAccountController:
    def __init__(self, supabase_client: Client):
        self.supabase = supabase_client

    async def get_user(self, user_id: int) -> Optional[User]:
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
            print(f"Error fetching user: {e}")
            return None

    async def get_all_users(self) -> List[User]:
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
            print(f"Error fetching users: {e}")
            return []

    async def search_users(self, query: str) -> List[User]:
        try:
            # If query is empty or whitespace, return all users
            if not query or not query.strip():
                return await self.get_all_users()

            query_str = f"%{query}%"
            usernames = self.supabase.from_('user_details').select('*').ilike('username', query_str).execute()
            fullnames = self.supabase.from_('user_details').select('*').ilike('full_name', query_str).execute()
            emails = self.supabase.from_('user_details').select('*').ilike('email', query_str).execute()

            # Merge results, avoid duplicates by id
            seen = set()
            users = []
            for result in [usernames, fullnames, emails]:
                if result.data:
                    for user_data in result.data:
                        uid = user_data['id']
                        if uid not in seen:
                            seen.add(uid)
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
            print(f"Error searching users: {e}")
            return []

    async def get_all_roles(self) -> List[Dict[str, Any]]:
        try:
            result = self.supabase.table('roles').select('*').order('id').execute()
            return result.data if result.data else []
        except Exception as e:
            print(f"Error fetching roles: {e}")
            return []

# UpdateUserAccountController: Handles user updates
class UpdateUserAccountController:
    def __init__(self, supabase_client: Client):
        self.supabase = supabase_client

    async def update_user(self, user_id: int, full_name: Optional[str] = None, email: Optional[str] = None, role_id: Optional[int] = None, is_active: Optional[bool] = None) -> Dict[str, Any]:
        try:
            update_data = {}
            if full_name is not None:
                update_data['full_name'] = full_name
            if email is not None:
                update_data['email'] = email
            if role_id is not None:
                update_data['role_id'] = role_id
            if is_active is not None:
                update_data['is_active'] = is_active
            if not update_data:
                return {'success': False, 'message': 'No fields to update'}
            result = self.supabase.table('users').update(update_data).eq('id', user_id).execute()
            if result.data:
                return {'success': True, 'message': 'User updated successfully', 'user': result.data[0]}
            else:
                return {'success': False, 'message': 'User not found or update failed'}
        except Exception as e:
            return {'success': False, 'message': f'Error updating user: {str(e)}'}

# SuspendUserAccountController: Handles user suspension
class SuspendUserAccountController:
    def __init__(self, supabase_client: Client):
        self.supabase = supabase_client

    async def suspend_user(self, user_id: int) -> Dict[str, Any]:
        try:
            result = self.supabase.table('users').update({'is_active': False}).eq('id', user_id).execute()
            if result.data:
                return {'success': True, 'message': 'User suspended successfully'}
            else:
                return {'success': False, 'message': 'User not found or suspend failed'}
        except Exception as e:
            return {'success': False, 'message': f'Error suspending user: {str(e)}'}
