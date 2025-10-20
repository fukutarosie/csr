"""
User Entity Model (BCE Framework - Entity Layer)
"""

from typing import Dict, Any, Optional
from datetime import datetime


class User:
    """User entity representing a system user"""
    
    def __init__(
        self,
        id: int,
        username: str,
        full_name: str,
        email: Optional[str] = None,
        role_id: Optional[int] = None,
        role_name: Optional[str] = None,
        role_code: Optional[str] = None,
        dashboard_route: Optional[str] = None,
        is_active: bool = True,
        last_login: Optional[datetime] = None
    ):
        self.id = id
        self.username = username
        self.full_name = full_name
        self.email = email
        self.role_id = role_id
        self.role_name = role_name
        self.role_code = role_code
        self.dashboard_route = dashboard_route
        self.is_active = is_active
        self.last_login = last_login
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert user to dictionary"""
        # Handle last_login - could be datetime object or string from DB
        last_login_str = None
        if self.last_login:
            if isinstance(self.last_login, datetime):
                last_login_str = self.last_login.isoformat()
            else:
                last_login_str = str(self.last_login)
        
        return {
            'id': self.id,
            'username': self.username,
            'full_name': self.full_name,
            'email': self.email,
            'role_id': self.role_id,
            'role_name': self.role_name,
            'role_code': self.role_code,
            'dashboard_route': self.dashboard_route,
            'is_active': self.is_active,
            'last_login': last_login_str
        }
    
    @staticmethod
    def from_db(data: Dict[str, Any]) -> 'User':
        """Create User from database data"""
        return User(
            id=data.get('id'),
            username=data.get('username'),
            full_name=data.get('full_name'),
            email=data.get('email'),
            role_id=data.get('role_id'),
            role_name=data.get('role_name'),
            role_code=data.get('role_code'),
            dashboard_route=data.get('dashboard_route'),
            is_active=data.get('is_active', True),
            last_login=data.get('last_login')
        )

