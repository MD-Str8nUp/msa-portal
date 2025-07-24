-- Enhanced MSA Portal Database Schema for Real Data Migration
-- Run this BEFORE executing the migration script

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables to recreate with enhanced structure
DROP TABLE IF EXISTS user_groups CASCADE;
DROP TABLE IF EXISTS scouts CASCADE;
DROP TABLE IF EXISTS groups CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Enhanced Users table with proper 4-role system
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('PARENT', 'LEADER', 'LEADER1', 'EXECUTIVE')),
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
  phone TEXT,
  avatar TEXT,
  current_view_mode TEXT CHECK (current_view_mode IN ('leader', 'parent')), -- For LEADER1 users
  last_login TIMESTAMP WITH TIME ZONE,
  login_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced Groups table
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL DEFAULT 'SCOUT_GROUP',
  description TEXT,
  leader_id UUID REFERENCES users(id) ON DELETE SET NULL,
  meeting_location TEXT,
  meeting_day TEXT,
  meeting_time TEXT,
  max_members INTEGER DEFAULT 30,
  current_members INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced Scouts table with comprehensive data
CREATE TABLE scouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age > 0 AND age < 30),
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('Male', 'Female', 'Other')),
  school TEXT,
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE RESTRICT,
  parent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Medical & Safety Information
  allergies TEXT,
  medical_conditions TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relationship TEXT,
  
  -- Uniform & Equipment
  uniform_top_size TEXT,
  uniform_bottom_size TEXT,
  
  -- Scouting Progress
  rank TEXT DEFAULT 'New Scout',
  join_date DATE DEFAULT CURRENT_DATE,
  badges_earned INTEGER DEFAULT 0,
  attendance_rate DECIMAL(5,2) DEFAULT 100.00,
  
  -- Administrative
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'PENDING')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Groups relationship (many-to-many for leaders managing multiple groups)
CREATE TABLE user_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'MEMBER' CHECK (role IN ('LEADER', 'ASSISTANT', 'MEMBER')),
  assigned_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, group_id)
);

-- Events table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type TEXT DEFAULT 'regular' CHECK (event_type IN ('regular', 'special', 'organization-wide')),
  requires_permission_slip BOOLEAN DEFAULT false,
  max_attendees INTEGER,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES users(id) ON DELETE CASCADE, -- NULL for group messages
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,   -- NULL for direct messages
  subject TEXT,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'direct' CHECK (message_type IN ('direct', 'group', 'announcement')),
  read_status BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Achievements/Badges table
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scout_id UUID NOT NULL REFERENCES scouts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  badge_type TEXT CHECK (badge_type IN ('activity', 'challenge', 'staged', 'special')),
  date_earned DATE DEFAULT CURRENT_DATE,
  awarded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  certificate_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Attendance tracking
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scout_id UUID NOT NULL REFERENCES scouts(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  attended BOOLEAN NOT NULL,
  notes TEXT,
  recorded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(scout_id, event_id)
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_scouts_group_id ON scouts(group_id);
CREATE INDEX idx_scouts_parent_id ON scouts(parent_id);
CREATE INDEX idx_scouts_age ON scouts(age);
CREATE INDEX idx_events_group_id ON events(group_id);
CREATE INDEX idx_events_start_date ON events(start_date);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX idx_achievements_scout_id ON achievements(scout_id);
CREATE INDEX idx_attendance_scout_id ON attendance(scout_id);

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE scouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Basic - can be enhanced later)
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Parents can view their scouts" ON scouts
  FOR SELECT USING (auth.uid() = parent_id);

CREATE POLICY "Leaders can view their group scouts" ON scouts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_groups ug 
      WHERE ug.user_id = auth.uid() 
      AND ug.group_id = scouts.group_id
    )
  );

-- Function to update updated_at timestamp  
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON groups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scouts_updated_at BEFORE UPDATE ON scouts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update group member count
CREATE OR REPLACE FUNCTION update_group_member_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE groups 
        SET current_members = (
            SELECT COUNT(*) FROM scouts WHERE group_id = NEW.group_id AND status = 'ACTIVE'
        )
        WHERE id = NEW.group_id;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        UPDATE groups 
        SET current_members = (
            SELECT COUNT(*) FROM scouts WHERE group_id = NEW.group_id AND status = 'ACTIVE'
        )
        WHERE id = NEW.group_id;
        
        IF OLD.group_id != NEW.group_id THEN
            UPDATE groups 
            SET current_members = (
                SELECT COUNT(*) FROM scouts WHERE group_id = OLD.group_id AND status = 'ACTIVE'
            )
            WHERE id = OLD.group_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE groups 
        SET current_members = (
            SELECT COUNT(*) FROM scouts WHERE group_id = OLD.group_id AND status = 'ACTIVE'
        )
        WHERE id = OLD.group_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update group member counts
CREATE TRIGGER update_group_member_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON scouts
    FOR EACH ROW EXECUTE FUNCTION update_group_member_count();

-- Grant permissions for service role
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Insert initial data for testing
INSERT INTO users (first_name, last_name, email, password, role) VALUES 
('Admin', 'User', 'admin@msa-portal.com', '$2a$12$placeholder', 'EXECUTIVE'),
('Test', 'Leader', 'leader@msa-portal.com', '$2a$12$placeholder', 'LEADER'),
('Test', 'Parent', 'parent@msa-portal.com', '$2a$12$placeholder', 'PARENT');

COMMENT ON TABLE users IS 'User accounts for the 4-role system: PARENT, LEADER, LEADER1, EXECUTIVE';
COMMENT ON TABLE scouts IS 'Scout/child records linked to parent users with comprehensive tracking';
COMMENT ON TABLE groups IS 'Scout groups organized by age divisions (Joeys, Cubs, Scouts)';
COMMENT ON COLUMN users.current_view_mode IS 'For LEADER1 users - tracks whether viewing as leader or parent';
COMMENT ON COLUMN scouts.attendance_rate IS 'Calculated attendance percentage for the scout';