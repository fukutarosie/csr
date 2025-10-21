"""
Login Controller - Control Layer (BCE Framework)
Use Case: As a user admin, I want to log in to the system so that I can access my account and use the features securely.
"""

from typing import Optional
from supabase import Client
from entity.user import User
from entity.auth_response import AuthResponse
import bcrypt
from datetime import datetime, timedelta
from jose import jwt
import os


class LoginController:
    """
    Control layer for user login functionality.
    Handles authentication, password verification, and token generation.
    """
    
    def __init__(self, supabase_client: Client):
        self.supabase = supabase_client
        self.SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-this")
        self.ALGORITHM = "HS256"
        self.ACCESS_TOKEN_EXPIRE_MINUTES = 60

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify a password against a bcrypt hash"""
        try:
            return bcrypt.checkpw(
                plain_password.encode('utf-8'),
                hashed_password.encode('utf-8')
            )
        except Exception as e:
            print(f"Password verification error: {e}")
            return False

    def create_access_token(self, data: dict) -> str:
        """Create a JWT access token"""
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(minutes=self.ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, self.SECRET_KEY, algorithm=self.ALGORITHM)
        return encoded_jwt

    def login(self, username: str, password: str, role_code: Optional[str] = None) -> AuthResponse:
        """
        Authenticate user and generate access token.
        
        Args:
            username: User's username
            password: User's password (plain text)
            role_code: Optional role code to filter login by specific role
            
        Returns:
            AuthResponse with success status, message, token, and user data
        """
        try:
            # Query using user_details view to get user with role info
            query = self.supabase.table("user_details").select("*").eq("username", username)
            if role_code:
                query = query.eq("role_code", role_code)
            response = query.execute()

            if not response.data or len(response.data) == 0:
                return AuthResponse(
                    success=False,
                    message="Invalid username, password, or role"
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

            # Create JWT token
            access_token = self.create_access_token(
                data={
                    "sub": str(user.id),
                    "username": user.username,
                    "role_code": user.role_code
                }
            )

            return AuthResponse(
                success=True,
                message="Login successful",
                token=access_token,
                user=user
            )

        except Exception as e:
            print(f"Login error: {e}")
            return AuthResponse(
                success=False,
                message="An error occurred during login. Please try again."
            )
