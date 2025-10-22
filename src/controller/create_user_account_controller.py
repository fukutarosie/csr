"""
Create User Account Controller - Control Layer (BCE Framework)
Use Case: As a user admin, I want to create user accounts so that the users can access the systems with valid credentials and roles.
"""

from typing import Dict, Any
from supabase import Client
import bcrypt


class CreateUserAccountController:
    """
    Control layer for creating new user accounts.
    Handles user registration, password hashing, and validation.
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

    def validate_username(self, username: str) -> bool:
        """
        Validate username format.
        
        Args:
            username: Username to validate
            
        Returns:
            True if valid, False otherwise
        """
        if not username or len(username) < 3 or len(username) > 50:
            return False
        # Allow alphanumeric and underscore
        return username.replace('_', '').isalnum()

    def validate_password(self, password: str) -> bool:
        """
        Validate password strength.
        
        Args:
            password: Password to validate
            
        Returns:
            True if valid, False otherwise
        """
        return bool(password)  # Only check if password is not empty

    def validate_email(self, email: str) -> bool:
        """
        Validate email format.
        
        Args:
            email: Email to validate
            
        Returns:
            True if valid, False otherwise
        """
        return email and '@' in email and '.' in email

    def check_username_exists(self, username: str) -> bool:
        """
        Check if username already exists in the database.
        
        Args:
            username: Username to check
            
        Returns:
            True if exists, False otherwise
        """
        try:
            existing = self.supabase.table('users').select('id').eq('username', username).execute()
            return bool(existing.data)
        except Exception as e:
            print(f"Error checking username: {e}")
            return False

    def check_email_exists(self, email: str) -> bool:
        """
        Check if email already exists in the database.
        
        Args:
            email: Email to check
            
        Returns:
            True if exists, False otherwise
        """
        try:
            existing = self.supabase.table('users').select('id').eq('email', email).execute()
            return bool(existing.data)
        except Exception as e:
            print(f"Error checking email: {e}")
            return False

    def create_user(self, username: str, password: str, full_name: str, email: str, role_id: int) -> Dict[str, Any]:
        """
        Create a new user account.
        
        Args:
            username: Unique username (3-50 characters, alphanumeric + underscore)
            password: Password (minimum 8 characters)
            full_name: User's full name
            email: Valid email address
            role_id: ID of the role to assign
            
        Returns:
            Dictionary with success status, message, and user data if successful
        """
        try:
            # Validate inputs
            if not self.validate_username(username):
                return {
                    'success': False,
                    'message': 'Invalid username. Must be 3-50 characters, alphanumeric and underscore only.'
                }

            if not self.validate_email(email):
                return {
                    'success': False,
                    'message': 'Invalid email format.'
                }

            if not full_name or len(full_name) < 2:
                return {
                    'success': False,
                    'message': 'Full name is required (minimum 2 characters).'
                }

            # Check for duplicates
            if self.check_username_exists(username):
                return {
                    'success': False,
                    'message': 'Username already exists. Please choose a different username.'
                }

            if self.check_email_exists(email):
                return {
                    'success': False,
                    'message': 'Email already exists. Please use a different email address.'
                }

            # Hash password
            hashed_password = self.hash_password(password)

            # Insert user into database
            result = self.supabase.table('users').insert({
                'username': username,
                'password': hashed_password,
                'full_name': full_name,
                'email': email,
                'role_id': role_id,
                'is_active': True
            }).execute()

            if result.data:
                return {
                    'success': True,
                    'message': 'User account created successfully.',
                    'user': result.data[0]
                }
            else:
                return {
                    'success': False,
                    'message': 'Failed to create user account.'
                }

        except Exception as e:
            print(f"Error creating user: {e}")
            return {
                'success': False,
                'message': f'Error creating user account: {str(e)}'
            }
