-- MSA Portal Authentication Schema Fix
-- Run this in your Supabase SQL Editor

-- Add missing authentication columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS password TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT;

-- Update existing null values
UPDATE users SET status = 'ACTIVE' WHERE status IS NULL;
UPDATE users SET login_count = 0 WHERE login_count IS NULL;
UPDATE users SET updated_at = NOW() WHERE updated_at IS NULL;

-- Set default password for all users (MSA@2025!)
UPDATE users SET password = '$2b$10$WxQb.PM7esp.3ZPiJcAU0.bGC./N8PtX8sH7tOA9.2FdyhVOndqNm' WHERE password IS NULL;

-- Normalize roles
UPDATE users SET role = 'PARENT' WHERE role = 'parent';
UPDATE users SET role = 'LEADER' WHERE role = 'leader';
UPDATE users SET role = 'ADMIN' WHERE role = 'exec';

-- Create LEADER1 users if they don't exist
INSERT INTO users (
  first_name, last_name, full_name, email, username, role, password, status, login_count,
  is_also_leader, is_also_parent, current_view_mode, created_at
) VALUES 
(
  'Senior', 'Leader', 'Senior Leader', 'leader1@msaportal.com', 'seniorleader', 'LEADER1',
  '$2b$10$WxQb.PM7esp.3ZPiJcAU0.bGC./N8PtX8sH7tOA9.2FdyhVOndqNm', 'ACTIVE', 0,
  false, false, 'leader1', NOW()
),
(
  'Head', 'Leader', 'Head Leader', 'head.leader@msaportal.com', 'headleader', 'LEADER1',
  '$2b$10$WxQb.PM7esp.3ZPiJcAU0.bGC./N8PtX8sH7tOA9.2FdyhVOndqNm', 'ACTIVE', 0,
  false, false, 'leader1', NOW()
)
ON CONFLICT (email) DO UPDATE SET
  role = EXCLUDED.role,
  password = EXCLUDED.password,
  status = EXCLUDED.status,
  current_view_mode = EXCLUDED.current_view_mode;

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_users_updated_at 
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for authentication
CREATE INDEX IF NOT EXISTS idx_users_email_auth ON users(email, password);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- Verify the changes
SELECT 
  role,
  COUNT(*) as user_count,
  COUNT(CASE WHEN password IS NOT NULL THEN 1 END) as users_with_passwords,
  COUNT(CASE WHEN status = 'ACTIVE' THEN 1 END) as active_users
FROM users 
GROUP BY role
ORDER BY role;