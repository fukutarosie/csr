-- ========================================
-- MULTI-ROLE AUTHENTICATION DATABASE SETUP
-- BCE Framework - Entity Layer
-- ========================================
-- Run this SQL in your Supabase SQL Editor

-- Drop existing tables if they exist
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- ========================================
-- ROLES TABLE (Entity)
-- ========================================
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    role_code VARCHAR(20) UNIQUE NOT NULL,
    description TEXT,
    dashboard_route VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Insert 4 user roles
INSERT INTO roles (role_name, role_code, description, dashboard_route) VALUES
('User Admin', 'USER_ADMIN', 'System administrator with full access', '/dashboard/admin'),
('PIN', 'PIN', 'Product Innovation Narrator', '/dashboard/pin'),
('CSR Rep', 'CSR_REP', 'Customer Service Representative', '/dashboard/csr'),
('Platform Management', 'PLATFORM_MGMT', 'Platform management team', '/dashboard/platform');

-- ========================================
-- USERS TABLE (Entity)
-- ========================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    email VARCHAR(100),
    full_name VARCHAR(100) NOT NULL,
    role_id INTEGER NOT NULL REFERENCES roles(id),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role_id ON users(role_id);

-- ========================================
-- INSERT TEST USERS
-- ========================================

-- User Admin
INSERT INTO users (username, password, email, full_name, role_id) VALUES
('admin', 'admin123', 'admin@company.com', 'System Administrator', 
 (SELECT id FROM roles WHERE role_code = 'USER_ADMIN'));

-- PIN
INSERT INTO users (username, password, email, full_name, role_id) VALUES
('pin_user', 'pin123', 'pin@company.com', 'John Innovation', 
 (SELECT id FROM roles WHERE role_code = 'PIN'));

-- CSR Rep
INSERT INTO users (username, password, email, full_name, role_id) VALUES
('csr_rep', 'csr123', 'csr@company.com', 'Jane Support', 
 (SELECT id FROM roles WHERE role_code = 'CSR_REP'));

-- Platform Management
INSERT INTO users (username, password, email, full_name, role_id) VALUES
('platform_mgr', 'platform123', 'platform@company.com', 'Mike Manager', 
 (SELECT id FROM roles WHERE role_code = 'PLATFORM_MGMT'));

-- ========================================
-- USER_DETAILS VIEW (for easy querying)
-- ========================================
CREATE OR REPLACE VIEW user_details AS
SELECT 
    u.id,
    u.username,
    u.email,
    u.full_name,
    u.is_active,
    u.last_login,
    r.role_name,
    r.role_code,
    r.dashboard_route,
    u.created_at
FROM users u
JOIN roles r ON u.role_id = r.id;

-- ========================================
-- VERIFICATION
-- ========================================
-- Check roles
SELECT * FROM roles ORDER BY id;

-- Check users
SELECT id, username, full_name, role_id FROM users ORDER BY id;

-- Check user details with roles
SELECT * FROM user_details ORDER BY id;

