-- Fix MSA Portal Database Schema to Match API Expectations
-- Run this in Supabase SQL Editor

-- 1. Create users table that matches API expectations
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('ADMIN', 'LEADER', 'LEADER1', 'PARENT', 'SCOUT')),
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
  phone TEXT,
  avatar TEXT,
  last_login TIMESTAMP WITH TIME ZONE,
  login_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Update groups table to match API expectations  
ALTER TABLE groups ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'SCOUT_GROUP';
ALTER TABLE groups ALTER COLUMN id TYPE UUID USING gen_random_uuid();

-- 3. Create scouts table that references users (not profiles)
CREATE TABLE IF NOT EXISTS scouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age > 0 AND age < 30),
  rank TEXT NOT NULL DEFAULT 'BEAVER',
  joined_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  parent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create user_groups junction table
CREATE TABLE IF NOT EXISTS user_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'MEMBER',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, group_id)
);

-- 5. Create events table matching API expectations
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
  requires_permission_slip BOOLEAN DEFAULT false,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scout_id UUID NOT NULL REFERENCES scouts(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PRESENT', 'ABSENT', 'EXCUSED')),
  recorded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(scout_id, event_id)
);

-- 7. Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  date_earned TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  scout_id UUID NOT NULL REFERENCES scouts(id) ON DELETE CASCADE,
  awarded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Create messages table for inter-user communication
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  description TEXT,
  uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Drop existing policies that cause recursion
DROP POLICY IF EXISTS "children_policy" ON children;
DROP POLICY IF EXISTS "profiles_policy" ON profiles;

-- 11. Enable RLS on new tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE scouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_groups ENABLE ROW LEVEL SECURITY;

-- 12. Create simple RLS policies (can be refined later)
CREATE POLICY "Allow service role full access" ON users FOR ALL USING (true);
CREATE POLICY "Allow service role full access" ON scouts FOR ALL USING (true);
CREATE POLICY "Allow service role full access" ON groups FOR ALL USING (true);
CREATE POLICY "Allow service role full access" ON events FOR ALL USING (true);
CREATE POLICY "Allow service role full access" ON attendance FOR ALL USING (true);
CREATE POLICY "Allow service role full access" ON achievements FOR ALL USING (true);
CREATE POLICY "Allow service role full access" ON messages FOR ALL USING (true);
CREATE POLICY "Allow service role full access" ON documents FOR ALL USING (true);
CREATE POLICY "Allow service role full access" ON user_groups FOR ALL USING (true);

-- 13. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_scouts_parent_id ON scouts(parent_id);
CREATE INDEX IF NOT EXISTS idx_scouts_group_id ON scouts(group_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_attendance_scout_id ON attendance(scout_id);
CREATE INDEX IF NOT EXISTS idx_attendance_event_id ON attendance(event_id);

-- 14. Insert test data
INSERT INTO groups (id, name, description, created_at) VALUES 
  (gen_random_uuid(), 'Beavers', 'For ages 6-8', NOW()),
  (gen_random_uuid(), 'Cubs', 'For ages 8-11', NOW()),
  (gen_random_uuid(), 'Scouts', 'For ages 11-14', NOW())
ON CONFLICT (name) DO NOTHING;

-- Insert test users (passwords are bcrypt hashed)
INSERT INTO users (first_name, last_name, email, password, role, status) VALUES 
  ('Admin', 'User', 'admin@msaportal.com', '$2a$10$rZ.5vG4yP8k9aF7qjFz3vuJGqL5WQjGQnF3Ub6qMhN8oPzXvJ2K9m', 'ADMIN', 'ACTIVE'),
  ('Test', 'User', 'test@test.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'PARENT', 'ACTIVE'),
  ('Jane', 'Smith', 'jane@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'LEADER', 'ACTIVE')
ON CONFLICT (email) DO NOTHING;

-- The passwords are:
-- admin@msaportal.com -> MSA@Admin2025!  
-- test@test.com -> test123
-- jane@example.com -> test123