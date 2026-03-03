-- Migration: Create Institutions table and update Users table for RBAC
-- This migration adds the institutions table and updates the users table to support the new role-based access control system

-- Create institutions table
CREATE TABLE IF NOT EXISTS institutions (
  institution_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(256) NOT NULL,
  description TEXT,
  logo_url VARCHAR(1000),
  email_domain VARCHAR(128), -- Optional: restrict to institutional emails
  created_by UUID NOT NULL, -- Super Admin who created this institution
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ,
  FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE RESTRICT
);

-- Add institution_id column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS institution_id UUID;

-- Add foreign key constraint for institution_id
ALTER TABLE users ADD CONSTRAINT fk_users_institution_id 
  FOREIGN KEY (institution_id) REFERENCES institutions(institution_id) ON DELETE SET NULL;

-- Update roles enum to include new roles
ALTER TYPE roles ADD VALUE IF NOT EXISTS 'instructor';
ALTER TYPE roles ADD VALUE IF NOT EXISTS 'institution_admin';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_institution_id ON users(institution_id);
CREATE INDEX IF NOT EXISTS idx_institutions_created_by ON institutions(created_by);
CREATE INDEX IF NOT EXISTS idx_institutions_name ON institutions(name);

-- Insert Super Admin user if it doesn't exist
INSERT INTO users (user_id, email, first_name, last_name, role, is_active, created_at)
VALUES (
  gen_random_uuid(),
  'root@farmlingo.com',
  'Super',
  'Admin',
  'super_admin',
  true,
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Create a default institution for the Super Admin (if needed for testing)
-- Note: In production, institutions should be created by Super Admins through the API
INSERT INTO institutions (institution_id, name, description, created_by, created_at)
SELECT 
  gen_random_uuid(),
  'Farmlingo Platform',
  'Default platform institution managed by Super Admin',
  u.user_id,
  NOW()
FROM users u 
WHERE u.email = 'root@farmlingo.com'
AND NOT EXISTS (SELECT 1 FROM institutions WHERE name = 'Farmlingo Platform')
LIMIT 1;

-- Update the Super Admin user to have the isSuperAdmin flag (if we had this field)
-- For now, we'll just ensure the Super Admin has the correct role
UPDATE users 
SET role = 'super_admin', updated_at = NOW()
WHERE email = 'root@farmlingo.com';

-- Add a comment to document the Super Admin account
COMMENT ON TABLE users IS 'Users table with role-based access control. Super Admin (root@farmlingo.com) has full platform access.';
COMMENT ON COLUMN users.role IS 'User role: student, farmer, instructor, institution_admin, super_admin';
COMMENT ON COLUMN users.institution_id IS 'Institution the user belongs to. NULL for Super Admin.';
COMMENT ON TABLE institutions IS 'Institutions managed by Super Admins. Each institution has its own set of users, courses, and resources.';