"""
AuthResponse Entity Model (BCE Framework - Entity Layer)
"""

from typing import Dict, Any, Optional
from .user import User


class AuthResponse:
    """Authentication response entity"""
    
    def __init__(self, success: bool, message: str, user: Optional[User] = None):
        self.success = success
        self.message = message
        self.user = user
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert response to dictionary"""
        result = {
            'success': self.success,
            'message': self.message
        }
        if self.user:
            result['user'] = self.user.to_dict()
        return result

