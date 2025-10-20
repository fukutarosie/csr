"""
Authentication Controller - Control Layer (BCE Framework)
Handles authentication and role-based authorization
"""

from typing import Optional
from supabase import create_client, Client
import os
from dotenv import load_dotenv
import bcrypt
from entity.user import User
from entity.auth_response import AuthResponse

# Load environment variables
load_dotenv()


class AuthController:
    """
    Authentication Controller (Control Layer - BCE Framework)
    Manages user authentication with role-based access
    """
    
    def __init__(self):
        """Initialize Supabase client"""
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_KEY")
        
        if not supabase_url or not supabase_key:
            raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in environment variables")
        
        self.supabase: Client = create_client(supabase_url, supabase_key)
    
    def hash_password(self, password: str) -> str:
        """Hash a password using bcrypt"""
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify a password against a hashed password"""
        try:
            return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
        except Exception as e:
            print(f"Password verification error: {e}")
            return False
    
    async def login(self, username: str, password: str) -> AuthResponse:
        """
        Authenticate user with username and password
        Returns user with role information for dashboard routing
        
        Args:
            username: User's username
            password: User's password
        
        Returns:
            AuthResponse with user data including role and dashboard_route
        """
        try:
            # Query using user_details view to get user with role info
            response = self.supabase.table("user_details").select("*").eq("username", username).execute()
            
            if not response.data or len(response.data) == 0:
                return AuthResponse(
                    success=False,
                    message="Invalid username or password"
                )
            
            # Extract user data
            user_data = response.data[0]
            
            # Check if user is active (not suspended)
            if not user_data.get('is_active', True):
                return AuthResponse(
                    success=False,
                    message="Account has been suspended. Please contact administrator."
                )
            
            # Get password from users table
            password_response = self.supabase.table("users").select("password").eq("username", username).execute()
            
            if not password_response.data:
                return AuthResponse(
                    success=False,
                    message="Invalid username or password"
                )
            
            stored_password = password_response.data[0].get('password')
            
            # Check if password is hashed
            is_hashed = stored_password and stored_password.startswith(('$2b$', '$2a$', '$2y$'))
            
            if is_hashed:
                if not self.verify_password(password, stored_password):
                    return AuthResponse(
                        success=False,
                        message="Invalid username or password"
                    )
            else:
                # Plain text comparison (backward compatibility)
                if password != stored_password:
                    return AuthResponse(
                        success=False,
                        message="Invalid username or password"
                    )
            
            # Update last login
            self.supabase.table("users").update({
                "last_login": "now()"
            }).eq("id", user_data.get('id')).execute()
            
            # Create user object with role information
            user = User.from_db(user_data)
            
            return AuthResponse(
                success=True,
                message="Login successful",
                user=user
            )
            
        except Exception as e:
            print(f"Login error: {e}")
            return AuthResponse(
                success=False,
                message="An error occurred during login. Please try again."
            )
    
    async def verify_user(self, user_id: int) -> bool:
        """Verify if user exists and is active"""
        try:
            response = self.supabase.table("users").select("id, is_active").eq("id", user_id).execute()
            if response.data and len(response.data) > 0:
                return response.data[0].get('is_active', False)
            return False
        except Exception as e:
            print(f"Verify user error: {e}")
            return False
    
    async def get_user_by_id(self, user_id: int) -> Optional[User]:
        """Get user by ID with role information"""
        try:
            response = self.supabase.table("user_details").select("*").eq("id", user_id).execute()
            
            if not response.data or len(response.data) == 0:
                return None
            
            user_data = response.data[0]
            return User.from_db(user_data)
            
        except Exception as e:
            print(f"Get user error: {e}")
            return None


# Create singleton instance
auth_controller = AuthController()
