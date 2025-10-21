"""
Suspend User Account Controller - Control Layer (BCE Framework)
Use Case: As a user admin, I want to suspend user accounts so that inactive users are removed or access is restricted when necessary.
"""

from typing import Dict, Any
from supabase import Client


class SuspendUserAccountController:
    """
    Control layer for suspending and activating user accounts.
    Handles user account status management.
    """
    
    def __init__(self, supabase_client: Client):
        self.supabase = supabase_client

    def get_user_status(self, user_id: int) -> Dict[str, Any]:
        """
        Get current user account status.
        
        Args:
            user_id: ID of the user
            
        Returns:
            Dictionary with user ID, username, and is_active status
        """
        try:
            result = self.supabase.table('users').select('id, username, is_active').eq('id', user_id).execute()
            if result.data:
                return {
                    'success': True,
                    'user': result.data[0]
                }
            else:
                return {
                    'success': False,
                    'message': 'User not found.'
                }
        except Exception as e:
            print(f"Error getting user status: {e}")
            return {
                'success': False,
                'message': f'Error retrieving user status: {str(e)}'
            }

    def suspend_user(self, user_id: int) -> Dict[str, Any]:
        """
        Suspend a user account (set is_active to False).
        
        Args:
            user_id: ID of the user to suspend
            
        Returns:
            Dictionary with success status, message, and updated user data if successful
            
        Note:
        - Suspended users cannot log in
        - User data is preserved for potential reactivation
        - Consider checking if user is the last admin before suspending
        """
        try:
            # Check if user exists
            user_check = self.supabase.table('users').select('id, username, is_active').eq('id', user_id).execute()
            if not user_check.data:
                return {
                    'success': False,
                    'message': 'User not found.'
                }

            user_data = user_check.data[0]

            # Check if already suspended
            if not user_data.get('is_active', True):
                return {
                    'success': False,
                    'message': f'User "{user_data.get("username")}" is already suspended.'
                }

            # Update user status to inactive
            result = self.supabase.table('users').update({
                'is_active': False
            }).eq('id', user_id).execute()

            if result.data:
                return {
                    'success': True,
                    'message': f'User "{user_data.get("username")}" has been suspended successfully.',
                    'user': result.data[0]
                }
            else:
                return {
                    'success': False,
                    'message': 'Failed to suspend user account.'
                }

        except Exception as e:
            print(f"Error suspending user: {e}")
            return {
                'success': False,
                'message': f'Error suspending user account: {str(e)}'
            }

    def activate_user(self, user_id: int) -> Dict[str, Any]:
        """
        Activate a suspended user account (set is_active to True).
        
        Args:
            user_id: ID of the user to activate
            
        Returns:
            Dictionary with success status, message, and updated user data if successful
        """
        try:
            # Check if user exists
            user_check = self.supabase.table('users').select('id, username, is_active').eq('id', user_id).execute()
            if not user_check.data:
                return {
                    'success': False,
                    'message': 'User not found.'
                }

            user_data = user_check.data[0]

            # Check if already active
            if user_data.get('is_active', True):
                return {
                    'success': False,
                    'message': f'User "{user_data.get("username")}" is already active.'
                }

            # Update user status to active
            result = self.supabase.table('users').update({
                'is_active': True
            }).eq('id', user_id).execute()

            if result.data:
                return {
                    'success': True,
                    'message': f'User "{user_data.get("username")}" has been activated successfully.',
                    'user': result.data[0]
                }
            else:
                return {
                    'success': False,
                    'message': 'Failed to activate user account.'
                }

        except Exception as e:
            print(f"Error activating user: {e}")
            return {
                'success': False,
                'message': f'Error activating user account: {str(e)}'
            }

    def toggle_user_status(self, user_id: int) -> Dict[str, Any]:
        """
        Toggle user account status (active <-> suspended).
        
        Args:
            user_id: ID of the user
            
        Returns:
            Dictionary with success status, message, and updated user data if successful
        """
        try:
            # Get current status
            status_result = self.get_user_status(user_id)
            if not status_result.get('success'):
                return status_result

            current_status = status_result['user'].get('is_active', True)

            # Toggle status
            if current_status:
                return self.suspend_user(user_id)
            else:
                return self.activate_user(user_id)

        except Exception as e:
            print(f"Error toggling user status: {e}")
            return {
                'success': False,
                'message': f'Error toggling user status: {str(e)}'
            }

    def bulk_suspend_users(self, user_ids: list) -> Dict[str, Any]:
        """
        Suspend multiple user accounts at once.
        
        Args:
            user_ids: List of user IDs to suspend
            
        Returns:
            Dictionary with success count and failure details
        """
        results = {
            'success_count': 0,
            'failure_count': 0,
            'failures': []
        }

        for user_id in user_ids:
            result = self.suspend_user(user_id)
            if result.get('success'):
                results['success_count'] += 1
            else:
                results['failure_count'] += 1
                results['failures'].append({
                    'user_id': user_id,
                    'message': result.get('message')
                })

        return results
