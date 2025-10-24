"""
Update User Account Controller - Control Layer (BCE Framework)
Use Case: As a user admin, I want to update user accounts so that information stays current and changes are applied when required.
"""

from typing import Optional, Dict, Any
from supabase import Client
import bcrypt


class UpdateUserAccountController:
    """
    Control layer for updating user accounts.
    Handles user profile updates and modifications.
    """
    
    def __init__(self, supabase_client: Client):
        self.supabase = supabase_client

    def hash_password(self, password: str) -> str:
        """
        Hash a password using bcrypt.
        
        Args:
            password: Plain text password
            
        Returns:
            Hashed password string
        """
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')

    def check_username_conflict(self, user_id: int, username: str) -> bool:
        """
        Check if username already exists for a different user.
        
        Args:
            user_id: Current user's ID (to exclude from check)
            username: Username to check
            
        Returns:
            True if conflict exists, False otherwise
        """
        try:
            existing = self.supabase.table('users').select('id').eq('username', username).neq('id', user_id).execute()
            return bool(existing.data)
        except Exception as e:
            print(f"Error checking username conflict: {e}")
            return False

    def check_email_conflict(self, user_id: int, email: str) -> bool:
        """
        Check if email already exists for a different user.
        
        Args:
            user_id: Current user's ID (to exclude from check)
            email: Email to check
            
        Returns:
            True if conflict exists, False otherwise
        """
        try:
            existing = self.supabase.table('users').select('id').eq('email', email).neq('id', user_id).execute()
            return bool(existing.data)
        except Exception as e:
            print(f"Error checking email conflict: {e}")
            return False

    def validate_email(self, email: str) -> bool:
        """
        Validate email format.
        
        Args:
            email: Email to validate
            
        Returns:
            True if valid, False otherwise
        """
        return email and '@' in email and '.' in email

    def update_user(
        self,
        user_id: int,
        username: Optional[str] = None,
        password: Optional[str] = None,
        full_name: Optional[str] = None,
        email: Optional[str] = None,
        role_id: Optional[int] = None,
        is_active: Optional[bool] = None
    ) -> Dict[str, Any]:
        """
        Update user account information.
        
        Args:
            user_id: ID of the user to update
            username: New username (optional)
            password: New password (optional, will be hashed)
            full_name: New full name (optional)
            email: New email (optional)
            role_id: New role ID (optional)
            is_active: New active status (optional)
            
        Returns:
            Dictionary with success status, message, and updated user data if successful
        """
        try:
            # Check if user exists
            user_check = self.supabase.table('users').select('id').eq('id', user_id).execute()
            if not user_check.data:
                return {
                    'success': False,
                    'message': 'User not found.'
                }

            # Build update data dictionary
            update_data = {}

            # Validate and add fields to update
            if username is not None:
                if self.check_username_conflict(user_id, username):
                    return {
                        'success': False,
                        'message': 'Username already exists. Please choose a different username.'
                    }
                update_data['username'] = username

            if password is not None and password.strip():
                update_data['password'] = self.hash_password(password)

            if full_name is not None:
                if len(full_name) < 2:
                    return {
                        'success': False,
                        'message': 'Full name must be at least 2 characters.'
                    }
                update_data['full_name'] = full_name

            if email is not None:
                if not self.validate_email(email):
                    return {
                        'success': False,
                        'message': 'Invalid email format.'
                    }
                if self.check_email_conflict(user_id, email):
                    return {
                        'success': False,
                        'message': 'Email already exists. Please use a different email address.'
                    }
                update_data['email'] = email

            if role_id is not None:
                update_data['role_id'] = role_id

            if is_active is not None:
                update_data['is_active'] = is_active

            # If no fields to update
            if not update_data:
                return {
                    'success': False,
                    'message': 'No fields provided for update.'
                }

            # Perform update
            result = self.supabase.table('users').update(update_data).eq('id', user_id).execute()

            if result.data:
                return {
                    'success': True,
                    'message': 'User account updated successfully.',
                    'user': result.data[0]
                }
            else:
                return {
                    'success': False,
                    'message': 'Failed to update user account.'
                }

        except Exception as e:
            print(f"Error updating user: {e}")
            return {
                'success': False,
                'message': f'Error updating user account: {str(e)}'
            }

    def update_profile(self, user_id: int, full_name: str, email: str) -> Dict[str, Any]:
        """
        Update user profile (simplified method for self-service profile updates).
        
        Args:
            user_id: ID of the user
            full_name: New full name
            email: New email
            
        Returns:
            Dictionary with success status and message
        """
        return self.update_user(
            user_id=user_id,
            full_name=full_name,
            email=email
        )

    def change_password(self, user_id: int, new_password: str) -> Dict[str, Any]:
        """
        Change user password (simplified method for password changes).
        
        Args:
            user_id: ID of the user
            new_password: New password (plain text)
            
        Returns:
            Dictionary with success status and message
        """
        return self.update_user(
            user_id=user_id,
            password=new_password
        )
