-- Migration: Add LEADER1 role to users table
-- Purpose: Enable dual-mode functionality for leaders who are also parents
-- Date: 2025-07-23
-- Story: MSA-001

-- Drop existing constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Add new constraint with LEADER1 role
ALTER TABLE users ADD CONSTRAINT users_role_check 
CHECK (role IN ('ADMIN', 'LEADER', 'LEADER1', 'PARENT', 'SCOUT'));

-- Add column for tracking current view mode for LEADER1 users
ALTER TABLE users ADD COLUMN IF NOT EXISTS current_view_mode TEXT 
CHECK (current_view_mode IS NULL OR current_view_mode IN ('leader', 'parent'));

-- Add column for tracking dual role status
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_also_parent BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_also_leader BOOLEAN DEFAULT FALSE;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_view_mode ON users(current_view_mode) WHERE current_view_mode IS NOT NULL;

-- Insert test LEADER1 user
INSERT INTO users (first_name, last_name, email, password, role, status, is_also_parent, is_also_leader) VALUES 
  ('Ahmed', 'Hassan', 'ahmed.leader1@msaportal.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'LEADER1', 'ACTIVE', true, true)
ON CONFLICT (email) DO NOTHING;

-- Add comment for documentation
COMMENT ON COLUMN users.current_view_mode IS 'For LEADER1 users: tracks whether they are currently viewing as leader or parent';
COMMENT ON COLUMN users.is_also_parent IS 'Indicates if user has parent responsibilities in addition to other roles';
COMMENT ON COLUMN users.is_also_leader IS 'Indicates if user has leader responsibilities in addition to other roles';

-- Verification query (should return the new constraint)
-- SELECT conname, pg_get_constraintdef(oid) FROM pg_constraint WHERE conname = 'users_role_check';