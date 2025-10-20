"""
FastAPI Backend Application
Provides REST API endpoints for authentication
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from controller.auth_controller import auth_controller

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
        
        return LoginResponse(
            success=auth_response.success,
            message=auth_response.message,
            user=auth_response.user.to_dict() if auth_response.user else None
        )
        
    except Exception as e:
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


@app.get("/api/user/{user_id}")
async def get_user(user_id: int):
    """
    Get user by ID
    
    Args:
        user_id: User ID
    
    Returns:
        User data
    """
    try:
        user = await auth_controller.get_user_by_id(user_id)
        
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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

