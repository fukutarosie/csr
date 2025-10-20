"""
Role Entity Model (BCE Framework - Entity Layer)
"""

from typing import Dict, Any


class Role:
    """Role entity representing a user role"""
    
    def __init__(
        self,
        id: int,
        role_name: str,
        role_code: str,
        dashboard_route: str,
        description: str = None
    ):
        self.id = id
        self.role_name = role_name
        self.role_code = role_code
        self.dashboard_route = dashboard_route
        self.description = description
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert role to dictionary"""
        return {
            'id': self.id,
            'role_name': self.role_name,
            'role_code': self.role_code,
            'dashboard_route': self.dashboard_route,
            'description': self.description
        }
    
    @staticmethod
    def from_db(data: Dict[str, Any]) -> 'Role':
        """Create Role from database data"""
        return Role(
            id=data.get('id'),
            role_name=data.get('role_name'),
            role_code=data.get('role_code'),
            dashboard_route=data.get('dashboard_route'),
            description=data.get('description')
        )

