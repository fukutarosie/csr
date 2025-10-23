"""
FastAPI Backend Application
Provides REST API endpoints for authentication
"""

from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from security.jwt_utils import create_access_token, create_refresh_token, decode_token
from controller.auth_controller import auth_controller
from controller.user_account_controller import (
    CreateUserAccountController,
    ViewUserAccountController,
    UpdateUserAccountController,
    SuspendUserAccountController
)
from supabase import create_client
import os
import sys
from dotenv import load_dotenv
from config import load_config

# Load environment variables and configuration
load_dotenv()
config = load_config()

# Initialize CRUD controllers
supabase_client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))
create_user_controller = CreateUserAccountController(supabase_client)
view_user_controller = ViewUserAccountController(supabase_client)
update_user_controller = UpdateUserAccountController(supabase_client)
suspend_user_controller = SuspendUserAccountController(supabase_client)

app = FastAPI(title="Auth API", version="1.0.0")
security_scheme = HTTPBearer()

def get_current_user_claims(credentials: HTTPAuthorizationCredentials = Depends(security_scheme)):
    """Decode and validate bearer token; returns claims or raises 401"""
    token = credentials.credentials if credentials else None
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return payload

def require_role(required_role: str):
    def _checker(claims = Depends(get_current_user_claims)):
        role = claims.get("role")
        if role != required_role:
            raise HTTPException(status_code=403, detail="Forbidden: insufficient role")
        return claims
    return _checker

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=config['CORS_ORIGINS'],  # Dynamically configured origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class LoginRequest(BaseModel):
    """Login request model"""
    username: str
    password: str
    role_code: str = None


class LoginResponse(BaseModel):
    """Login response model"""
    success: bool
    message: str
    user: Optional[dict] = None
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    expires_in: Optional[int] = None


class RefreshRequest(BaseModel):
    refresh_token: str

class RefreshResponse(BaseModel):
    access_token: Optional[str] = None
    expires_in: Optional[int] = None


class CreateUserRequest(BaseModel):
    """Create user request model"""
    username: str
    password: str
    full_name: str
    email: str
    role_id: int


class UpdateUserRequest(BaseModel):
    """Update user request model"""
    full_name: Optional[str] = None
    email: Optional[str] = None
    role_id: Optional[int] = None
    is_active: Optional[bool] = None


class SearchRequest(BaseModel):
    """Search request model"""
    query: str


@app.get("/")
def read_root():
    """Root endpoint"""
    return {
        "message": "Authentication API",
        "version": "1.0.0",
        "endpoints": {
            "POST /api/login": "User login",
            "GET /api/health": "Health check",
            "GET /api/verify/{user_id}": "Verify user exists"
        }
    }


@app.get("/api/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "auth-api"}


@app.post("/api/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """
    Login endpoint
    
    Args:
        request: Login credentials (username and password)
    
    Returns:
        Authentication response with user data
    """
    try:
        # Use auth controller to handle login
        auth_response = await auth_controller.login(request.username, request.password, request.role_code)

        # Convert user to dict if it exists
        user_dict = None
        if auth_response.user:
            user_dict = auth_response.user.to_dict()

        # If login successful, issue tokens
        access_token = None
        refresh_token = None
        expires_in = None

        if auth_response.success and user_dict:
            subject = str(user_dict['id'])
            access_token = create_access_token(subject, extra={"role": user_dict.get("role_code")})
            refresh_token = create_refresh_token(subject)
            # Mirror frontend expectation (seconds)
            expires_in = 60 * 60  # 60 minutes default; keep in sync with jwt_utils

        return LoginResponse(
            success=auth_response.success,
            message=auth_response.message,
            user=user_dict,
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=expires_in
        )

    except Exception as e:
        print(f"Login endpoint error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/refresh", response_model=RefreshResponse)
async def refresh_token(request: RefreshRequest):
    """Issue a new access token from a valid refresh token"""
    try:
        payload = decode_token(request.refresh_token)
        if not payload or payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid refresh token")
        subject = payload.get("sub")
        if not subject:
            raise HTTPException(status_code=401, detail="Invalid token subject")
        new_access = create_access_token(subject)
        return RefreshResponse(access_token=new_access, expires_in=60*60)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail="Could not refresh token")


@app.get("/api/verify/{user_id}")
async def verify_user(user_id: int):
    """
    Verify user exists
    
    Args:
        user_id: User ID to verify
    
    Returns:
        Verification status
    """
    try:
        exists = await auth_controller.verify_user(user_id)
        return {
            "exists": exists,
            "user_id": user_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ========================================
# USER ACCOUNT MANAGEMENT ENDPOINTS
# ========================================

@app.post("/api/users")
async def create_user(request: CreateUserRequest, _claims = Depends(require_role("USER_ADMIN"))):
    """
    Create a new user account
    
    Args:
        request: User creation data
    
    Returns:
        Creation result with user data
    """
    try:
        result = await create_user_controller.create_user(
            username=request.username,
            password=request.password,
            full_name=request.full_name,
            email=request.email,
            role_id=request.role_id
        )
        
        if not result['success']:
            # Use 409 Conflict for duplicate username, else 400 Bad Request
            message = result.get('message', '')
            status_code = 409 if isinstance(message, str) and 'exists' in message.lower() else 400
            raise HTTPException(status_code=status_code, detail=message)
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/users")
async def get_all_users(_claims = Depends(require_role("USER_ADMIN"))):
    """
    Get all users
    
    Returns:
        List of all users
    """
    try:
        users = await view_user_controller.get_all_users()
        return {
            "success": True,
            "users": [user.to_dict() for user in users]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/users/{user_id}")
async def get_user_by_id(user_id: int, _claims = Depends(require_role("USER_ADMIN"))):
    """
    Get user by ID
    
    Args:
        user_id: User ID
    
    Returns:
        User data
    """
    try:
        user = await view_user_controller.get_user(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return {
            "success": True,
            "user": user.to_dict()
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.put("/api/users/{user_id}")
async def update_user(user_id: int, request: UpdateUserRequest, _claims = Depends(require_role("USER_ADMIN"))):
    """
    Update user information
    
    Args:
        user_id: User ID to update
        request: Update data
    
    Returns:
        Update result
    """
    try:
        result = await update_user_controller.update_user(
            user_id=user_id,
            full_name=request.full_name,
            email=request.email,
            role_id=request.role_id,
            is_active=request.is_active
        )
        
        if not result['success']:
            raise HTTPException(status_code=400, detail=result['message'])
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/users/{user_id}")
async def delete_user(user_id: int, _claims = Depends(require_role("USER_ADMIN"))):
    """
    Delete a user account
    
    Args:
        user_id: User ID to delete
    
    Returns:
        Deletion result
    """
    try:
        result = await suspend_user_controller.suspend_user(user_id)
        if not result['success']:
            raise HTTPException(status_code=404, detail=result['message'])
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/users/search")
async def search_users(request: SearchRequest, _claims = Depends(require_role("USER_ADMIN"))):
    """
    Search for users by username, name, or email
    
    Args:
        request: Search query
    
    Returns:
        List of matching users
    """
    try:
        users = await view_user_controller.search_users(request.query)
        return {
            "success": True,
            "users": [user.to_dict() for user in users]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/roles")
async def get_all_roles(_claims = Depends(require_role("USER_ADMIN"))):
    """
    Get all available roles
    
    Returns:
        List of roles
    """
    try:
        roles = await view_user_controller.get_all_roles()
        return {
            "success": True,
            "roles": roles
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# DEV-ONLY: Update user without authentication (for local testing)
@app.put("/api/dev/update_user/{user_id}")
async def dev_update_user(user_id: int, request: UpdateUserRequest):
    """Development-only endpoint: update user without auth to assist debugging."""
    try:
        result = await update_user_controller.update_user(
            user_id=user_id,
            full_name=request.full_name,
            email=request.email,
            role_id=request.role_id,
            is_active=request.is_active
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def run_server():
    import uvicorn
    config = uvicorn.Config(app, host="0.0.0.0", port=8000, reload=False)
    server = uvicorn.Server(config)
    await server.serve()


if __name__ == "__main__":
    import asyncio
    # Ensure Windows selector event loop
    if sys.platform == 'win32':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        loop.run_until_complete(run_server())
    finally:
        loop.close()

