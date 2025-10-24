# Role Delete Troubleshooting Guide

## What Was Changed:

### 1. Backend (`role_controller.py`)
- Added extensive logging to track delete operations
- Returns `deleted_users` count in response
- Cascades delete to users table before deleting role

### 2. Backend API (`main.py`)
- Updated DELETE endpoint to pass `cascade=True`
- Returns structured response with deleted_users count

### 3. Frontend Controller (`roleController.js`)
- Updated parseRoleResponse to include `deleted_users` field

### 4. Frontend UI (`page.jsx`)
- Added console.log debugging statements
- Calls `loadUsers()` after deleting role to refresh user list
- Displays count of deleted users in success message

## How to Test:

### Step 1: Check Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Click Delete on a role
4. Look for these messages:
   - "Attempting to delete role:" (with role details)
   - "Delete role response:" (raw API response)
   - "Parsed delete result:" (parsed result)

### Step 2: Check Backend Logs
In your backend terminal, you should see:
```
=== DELETE ROLE REQUEST ===
Role ID: X, Cascade: True
Found role: [Role Name] (ID: X)
Found X user(s) with role_id X
⚠️ CASCADE DELETE: Deleting X user(s) with role_id X
  - Will delete user: [username] (ID: X)
✅ Successfully deleted X user(s)
Deleting role X from roles table...
✅ Role and X associated user(s) deleted successfully.
=== DELETE COMPLETE ===
```

### Step 3: Verify Database Changes
After deleting, check:
1. **Manage Roles tab** - The role should be gone
2. **Manage User Accounts tab** - Users with that role should be gone

## Common Issues:

### Issue 1: "Role not found"
- The role ID might be incorrect
- Check console log for the role object being passed

### Issue 2: "Cannot delete role. X user(s) still assigned"
- This should NOT happen since cascade=True
- Check backend logs to see if cascade parameter is being passed

### Issue 3: No error but nothing happens
- Check browser console for JavaScript errors
- Check backend terminal for Python errors
- Verify the API endpoint is being called (Network tab in DevTools)

### Issue 4: Role deleted but users remain
- Check if `loadUsers()` is being called after deletion
- Verify the users table actually has matching role_id records

## Manual Database Check:

Run this in Supabase SQL Editor:
```sql
-- Check if users exist with a specific role_id
SELECT u.id, u.username, u.role_id, r.role_name
FROM users u
LEFT JOIN roles r ON u.role_id = r.id
WHERE r.role_name = 'Content Creator'; -- Change role name

-- Check all roles
SELECT * FROM roles ORDER BY id;

-- Check all users and their roles
SELECT u.id, u.username, r.role_name
FROM users u
LEFT JOIN roles r ON u.role_id = r.id
ORDER BY u.id;
```

## Expected Behavior:

When you delete a role called "Content Creator":
1. Frontend shows warning modal
2. User confirms deletion
3. Backend logs show cascade delete happening
4. Backend deletes all users with role_id matching "Content Creator"
5. Backend deletes the "Content Creator" role
6. Frontend shows success message: "Role and X associated user(s) deleted successfully."
7. Roles table refreshes (role is gone)
8. Users table refreshes (users with that role are gone)

## Quick Fix Checklist:

- [ ] Backend server is running
- [ ] Frontend is connected to http://localhost:8000
- [ ] You're logged in as USER_ADMIN
- [ ] Browser console is open to see errors
- [ ] Backend terminal is visible to see logs
- [ ] You have test data (a role with some users assigned)
