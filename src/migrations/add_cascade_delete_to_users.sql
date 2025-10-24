-- Migration: Add CASCADE DELETE to users.role_id foreign key
-- Purpose: When a role is deleted, automatically delete all users with that role
-- Date: 2025-10-24
-- WARNING: This enables cascading deletes - deleting a role will delete all associated users!

-- Drop existing foreign key constraint
ALTER TABLE users 
DROP CONSTRAINT IF EXISTS users_role_id_fkey;

-- Add new foreign key constraint with ON DELETE CASCADE
ALTER TABLE users
ADD CONSTRAINT users_role_id_fkey 
FOREIGN KEY (role_id) 
REFERENCES roles(id) 
ON DELETE CASCADE;

-- Verify the constraint was added
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
    JOIN information_schema.referential_constraints AS rc
      ON tc.constraint_name = rc.constraint_name
WHERE tc.table_name = 'users' 
  AND tc.constraint_type = 'FOREIGN KEY'
  AND kcu.column_name = 'role_id';

-- Expected output: delete_rule should show 'CASCADE'
