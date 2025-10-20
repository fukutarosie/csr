"""
FastAPI Backend Application
Provides REST API endpoints for authentication
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from controller.auth_controller import auth_controller
from controller.user_account_controller import UserAccountController
from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()

# Initialize user account controller
supabase_client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))
user_account_controller = UserAccountController(supabase_client)

app = FastAPI(title="Auth API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
    ],  # Next.js frontend (dev ports)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class LoginRequest(BaseModel):
    """Login request model"""
    username: str
    password: str


class LoginResponse(BaseModel):
    """Login response model"""
    success: bool
    message: str
    user: Optional[dict] = None


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
        auth_response = await auth_controller.login(request.username, request.password)
        
        # Convert user to dict if it exists
        user_dict = None
        if auth_response.user:
            user_dict = auth_response.user.to_dict()
        
        return LoginResponse(
            success=auth_response.success,
            message=auth_response.message,
            user=user_dict
        )
        
    except Exception as e:
        print(f"Login endpoint error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


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
async def create_user(request: CreateUserRequest):
    """
    Create a new user account
    
    Args:
        request: User creation data
    
    Returns:
        Creation result with user data
    """
    try:
        result = await user_account_controller.create_user(
            username=request.username,
            password=request.password,
            full_name=request.full_name,
            email=request.email,
            role_id=request.role_id
        )
        
        if not result['success']:
            raise HTTPException(status_code=400, detail=result['message'])
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/users")
async def get_all_users():
    """
    Get all users
    
    Returns:
        List of all users
    """
    try:
        users = await user_account_controller.get_all_users()
        return {
            "success": True,
            "users": [user.to_dict() for user in users]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/users/{user_id}")
async def get_user_by_id(user_id: int):
    """
    Get user by ID
    
    Args:
        user_id: User ID
    
    Returns:
        User data
    """
    try:
        user = await user_account_controller.get_user(user_id)
        
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
async def update_user(user_id: int, request: UpdateUserRequest):
    """
    Update user information
    
    Args:
        user_id: User ID to update
        request: Update data
    
    Returns:
        Update result
    """
    try:
        result = await user_account_controller.update_user(
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
async def delete_user(user_id: int):
    """
    Delete a user account
    
    Args:
        user_id: User ID to delete
    
    Returns:
        Deletion result
    """
    try:
        result = await user_account_controller.delete_user(user_id)
        
        if not result['success']:
            raise HTTPException(status_code=404, detail=result['message'])
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/users/search")
async def search_users(request: SearchRequest):
    """
    Search for users by username, name, or email
    
    Args:
        request: Search query
    
    Returns:
        List of matching users
    """
    try:
        users = await user_account_controller.search_users(request.query)
        return {
            "success": True,
            "users": [user.to_dict() for user in users]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/roles")
async def get_all_roles():
    """
    Get all available roles
    
    Returns:
        List of roles
    """
    try:
        roles = await user_account_controller.get_all_roles()
        return {
            "success": True,
            "roles": roles
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

