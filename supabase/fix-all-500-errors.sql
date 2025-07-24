-- MSA Portal Database Fix - Resolve All 500 Errors
-- This migration fixes all schema mismatches between API expectations and database structure
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. FIX USERS TABLE STRUCTURE
-- ==========================================

-- First, check if we need to add missing columns to users table
DO $$
BEGIN
    -- Add first_name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'first_name') THEN
        ALTER TABLE users ADD COLUMN first_name TEXT;
    END IF;
    
    -- Add last_name column if it doesn't exist  
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'last_name') THEN
        ALTER TABLE users ADD COLUMN last_name TEXT;
    END IF;
    
    -- Add phone column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'phone') THEN
        ALTER TABLE users ADD COLUMN phone TEXT;
    END IF;
    
    -- Add status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'status') THEN
        ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE'));
    END IF;

    -- Add last_login column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'last_login') THEN
        ALTER TABLE users ADD COLUMN last_login TIMESTAMP WITH TIME ZONE;
    END IF;

    -- Add login_count column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'login_count') THEN
        ALTER TABLE users ADD COLUMN login_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- If users have a 'name' column, split it into first_name and last_name
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'name') THEN
        -- Update first_name and last_name from name column
        UPDATE users 
        SET 
            first_name = COALESCE(split_part(name, ' ', 1), name),
            last_name = CASE 
                WHEN position(' ' in name) > 0 THEN substring(name from position(' ' in name) + 1)
                ELSE ''
            END
        WHERE first_name IS NULL OR last_name IS NULL;
        
        -- Drop the name column after migration
        ALTER TABLE users DROP COLUMN IF EXISTS name;
    END IF;
END $$;

-- Update role constraints to match API expectations
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('ADMIN', 'LEADER', 'LEADER1', 'EXECUTIVE', 'PARENT', 'SCOUT'));

-- Make first_name and last_name NOT NULL after populating them
ALTER TABLE users ALTER COLUMN first_name SET NOT NULL;
ALTER TABLE users ALTER COLUMN last_name SET NOT NULL;

-- ==========================================
-- 2. FIX GROUPS TABLE STRUCTURE  
-- ==========================================

-- Ensure groups table exists with all required columns
CREATE TABLE IF NOT EXISTS groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL DEFAULT 'SCOUTS',
    description TEXT,
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    location TEXT,
    meeting_time TEXT,
    capacity INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to existing groups table
DO $$
BEGIN
    -- Add status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'groups' AND column_name = 'status') THEN
        ALTER TABLE groups ADD COLUMN status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE'));
    END IF;
    
    -- Add location column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'groups' AND column_name = 'location') THEN
        ALTER TABLE groups ADD COLUMN location TEXT;
    END IF;
    
    -- Add meeting_time column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'groups' AND column_name = 'meeting_time') THEN
        ALTER TABLE groups ADD COLUMN meeting_time TEXT;
    END IF;
    
    -- Add capacity column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'groups' AND column_name = 'capacity') THEN
        ALTER TABLE groups ADD COLUMN capacity INTEGER;
    END IF;
END $$;

-- ==========================================
-- 3. FIX SCOUTS TABLE STRUCTURE
-- ==========================================

-- Ensure scouts table exists with all required columns
CREATE TABLE IF NOT EXISTS scouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    date_of_birth DATE,
    age INTEGER CHECK (age > 0 AND age < 30),
    gender TEXT CHECK (gender IN ('MALE', 'FEMALE', 'OTHER')),
    school TEXT,
    uniform_size_top TEXT,
    uniform_size_bottom TEXT, 
    allergies_medical TEXT,
    rank TEXT NOT NULL DEFAULT 'BEAVER',
    joined_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    parent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to existing scouts table
DO $$
BEGIN
    -- Add first_name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'scouts' AND column_name = 'first_name') THEN
        ALTER TABLE scouts ADD COLUMN first_name TEXT;
    END IF;
    
    -- Add last_name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'scouts' AND column_name = 'last_name') THEN
        ALTER TABLE scouts ADD COLUMN last_name TEXT;
    END IF;
    
    -- Add date_of_birth column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'scouts' AND column_name = 'date_of_birth') THEN
        ALTER TABLE scouts ADD COLUMN date_of_birth DATE;
    END IF;
    
    -- Add gender column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'scouts' AND column_name = 'gender') THEN
        ALTER TABLE scouts ADD COLUMN gender TEXT CHECK (gender IN ('MALE', 'FEMALE', 'OTHER'));
    END IF;
    
    -- Add school column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'scouts' AND column_name = 'school') THEN
        ALTER TABLE scouts ADD COLUMN school TEXT;
    END IF;
    
    -- Add uniform_size_top column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'scouts' AND column_name = 'uniform_size_top') THEN
        ALTER TABLE scouts ADD COLUMN uniform_size_top TEXT;
    END IF;
    
    -- Add uniform_size_bottom column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'scouts' AND column_name = 'uniform_size_bottom') THEN
        ALTER TABLE scouts ADD COLUMN uniform_size_bottom TEXT;
    END IF;
    
    -- Add allergies_medical column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'scouts' AND column_name = 'allergies_medical') THEN
        ALTER TABLE scouts ADD COLUMN allergies_medical TEXT;
    END IF;
    
    -- Add status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'scouts' AND column_name = 'status') THEN
        ALTER TABLE scouts ADD COLUMN status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE'));
    END IF;
END $$;

-- Migrate data from 'name' column to first_name/last_name if needed
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'scouts' AND column_name = 'name') THEN
        -- Update first_name and last_name from name column
        UPDATE scouts 
        SET 
            first_name = COALESCE(split_part(name, ' ', 1), name),
            last_name = CASE 
                WHEN position(' ' in name) > 0 THEN substring(name from position(' ' in name) + 1)
                ELSE ''
            END
        WHERE first_name IS NULL OR last_name IS NULL;
        
        -- Drop the name column after migration
        ALTER TABLE scouts DROP COLUMN name;
    END IF;
END $$;

-- Make first_name and last_name NOT NULL after populating them
ALTER TABLE scouts ALTER COLUMN first_name SET NOT NULL;
ALTER TABLE scouts ALTER COLUMN last_name SET NOT NULL;

-- ==========================================
-- 4. FIX MESSAGES TABLE STRUCTURE
-- ==========================================

-- Ensure messages table exists with all required columns
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject TEXT,
    content TEXT NOT NULL,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type TEXT DEFAULT 'MESSAGE' CHECK (type IN ('MESSAGE', 'ANNOUNCEMENT', 'NOTIFICATION')),
    priority TEXT DEFAULT 'NORMAL' CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'URGENT')),
    status TEXT DEFAULT 'SENT' CHECK (status IN ('DRAFT', 'SENT', 'READ', 'ARCHIVED')),
    is_read BOOLEAN DEFAULT false,
    group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to existing messages table
DO $$
BEGIN
    -- Add type column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'type') THEN
        ALTER TABLE messages ADD COLUMN type TEXT DEFAULT 'MESSAGE' CHECK (type IN ('MESSAGE', 'ANNOUNCEMENT', 'NOTIFICATION'));
    END IF;
    
    -- Add priority column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'priority') THEN
        ALTER TABLE messages ADD COLUMN priority TEXT DEFAULT 'NORMAL' CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'URGENT'));
    END IF;
    
    -- Add status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'status') THEN
        ALTER TABLE messages ADD COLUMN status TEXT DEFAULT 'SENT' CHECK (status IN ('DRAFT', 'SENT', 'READ', 'ARCHIVED'));
    END IF;
END $$;

-- ==========================================
-- 5. CREATE MISSING TABLES
-- ==========================================

-- Events table
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    location TEXT NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
    requires_permission_slip BOOLEAN DEFAULT false,
    max_attendees INTEGER,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'CANCELLED', 'COMPLETED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Attendance table  
CREATE TABLE IF NOT EXISTS attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scout_id UUID NOT NULL REFERENCES scouts(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PRESENT', 'ABSENT', 'EXCUSED')),
    notes TEXT,
    recorded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(scout_id, event_id)
);

-- Achievements/Badges table
CREATE TABLE IF NOT EXISTS achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'BADGE',
    requirements TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scout Achievements (junction table)
CREATE TABLE IF NOT EXISTS scout_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scout_id UUID NOT NULL REFERENCES scouts(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    date_earned TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    awarded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(scout_id, achievement_id)
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER,
    description TEXT,
    type TEXT NOT NULL DEFAULT 'GENERAL',
    uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 6. CREATE PROPER SCOUT GROUPS
-- ==========================================

-- Insert the three main scout groups with proper age ranges
INSERT INTO groups (name, type, description, status, location, meeting_time, capacity) VALUES 
    ('Joeys', 'SCOUTS', 'For ages 5-7 - Introduction to scouting fundamentals', 'ACTIVE', 'MSA Community Hall', 'Saturday 10:00 AM', 20),
    ('Cubs', 'SCOUTS', 'For ages 8-11 - Intermediate scouting activities', 'ACTIVE', 'MSA Community Hall', 'Saturday 11:00 AM', 25),
    ('Scouts', 'SCOUTS', 'For ages 12-15 - Advanced scouting and leadership development', 'ACTIVE', 'MSA Community Hall', 'Saturday 12:00 PM', 30)
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    status = EXCLUDED.status,
    location = EXCLUDED.location,
    meeting_time = EXCLUDED.meeting_time,
    capacity = EXCLUDED.capacity,
    updated_at = NOW();

-- ==========================================
-- 7. CREATE INDEXES FOR PERFORMANCE
-- ==========================================

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- Scouts table indexes  
CREATE INDEX IF NOT EXISTS idx_scouts_parent_id ON scouts(parent_id);
CREATE INDEX IF NOT EXISTS idx_scouts_group_id ON scouts(group_id);
CREATE INDEX IF NOT EXISTS idx_scouts_age ON scouts(age);
CREATE INDEX IF NOT EXISTS idx_scouts_status ON scouts(status);

-- Groups table indexes
CREATE INDEX IF NOT EXISTS idx_groups_type ON groups(type);
CREATE INDEX IF NOT EXISTS idx_groups_status ON groups(status);

-- Messages table indexes
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_type ON messages(type);
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);

-- Events table indexes
CREATE INDEX IF NOT EXISTS idx_events_group_id ON events(group_id);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);

-- Attendance table indexes
CREATE INDEX IF NOT EXISTS idx_attendance_scout_id ON attendance(scout_id);
CREATE INDEX IF NOT EXISTS idx_attendance_event_id ON attendance(event_id);

-- Achievement table indexes
CREATE INDEX IF NOT EXISTS idx_scout_achievements_scout_id ON scout_achievements(scout_id);
CREATE INDEX IF NOT EXISTS idx_scout_achievements_achievement_id ON scout_achievements(achievement_id);

-- Documents table indexes
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_documents_group_id ON documents(group_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(type);

-- ==========================================
-- 8. ENABLE ROW LEVEL SECURITY & POLICIES
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE scouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE scout_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Service role can do everything on users" ON users;
DROP POLICY IF EXISTS "Service role can do everything on groups" ON groups;
DROP POLICY IF EXISTS "Service role can do everything on scouts" ON scouts;
DROP POLICY IF EXISTS "Service role can do everything on events" ON events;
DROP POLICY IF EXISTS "Service role can do everything on attendance" ON attendance;
DROP POLICY IF EXISTS "Service role can do everything on achievements" ON achievements;
DROP POLICY IF EXISTS "Service role can do everything on scout_achievements" ON scout_achievements;
DROP POLICY IF EXISTS "Service role can do everything on documents" ON documents;
DROP POLICY IF EXISTS "Service role can do everything on messages" ON messages;

-- Create comprehensive RLS policies for service role (API access)
CREATE POLICY "Service role can do everything on users" ON users
    FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can do everything on groups" ON groups
    FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can do everything on scouts" ON scouts
    FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can do everything on events" ON events
    FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can do everything on attendance" ON attendance
    FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can do everything on achievements" ON achievements
    FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can do everything on scout_achievements" ON scout_achievements
    FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can do everything on documents" ON documents
    FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can do everything on messages" ON messages
    FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- ==========================================
-- 9. CREATE UPDATE TRIGGERS
-- ==========================================

-- Create or replace function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for all tables with updated_at column
CREATE OR REPLACE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_groups_updated_at 
    BEFORE UPDATE ON groups FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_scouts_updated_at 
    BEFORE UPDATE ON scouts FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_events_updated_at 
    BEFORE UPDATE ON events FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_attendance_updated_at 
    BEFORE UPDATE ON attendance FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_achievements_updated_at 
    BEFORE UPDATE ON achievements FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_documents_updated_at 
    BEFORE UPDATE ON documents FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_messages_updated_at 
    BEFORE UPDATE ON messages FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 10. INSERT SAMPLE DATA FOR TESTING
-- ==========================================

-- Insert test admin and leader users if they don't exist
INSERT INTO users (first_name, last_name, email, password, role, status, phone) VALUES 
    ('Admin', 'User', 'admin@msaportal.com', '$2a$10$rZ.5vG4yP8k9aF7qjFz3vuJGqL5WQjGQnF3Ub6qMhN8oPzXvJ2K9m', 'ADMIN', 'ACTIVE', '+1234567890'),
    ('Sarah', 'Droubi', 'sarah.droubi@msaportal.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'LEADER1', 'ACTIVE', '+1234567891'),
    ('Test', 'Parent', 'parent@test.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'PARENT', 'ACTIVE', '+1234567892'),
    ('Test', 'Leader', 'leader@test.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'LEADER', 'ACTIVE', '+1234567893')
ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    role = EXCLUDED.role,
    status = EXCLUDED.status,
    phone = EXCLUDED.phone,
    updated_at = NOW();

-- ==========================================
-- MIGRATION COMPLETE
-- ==========================================

-- Display completion message
DO $$
BEGIN
    RAISE NOTICE 'MSA Portal Database Fix Complete!';
    RAISE NOTICE 'Fixed Issues:';
    RAISE NOTICE '1. Users table now has first_name, last_name, phone, status columns';
    RAISE NOTICE '2. Scouts table now has all required columns including uniform sizes and medical info';
    RAISE NOTICE '3. Groups table now has status, location, meeting_time, capacity columns';
    RAISE NOTICE '4. Messages table now has type, priority, status columns';
    RAISE NOTICE '5. Created proper scout groups: Joeys, Cubs, Scouts';
    RAISE NOTICE '6. Updated role system to support PARENT, LEADER, LEADER1, EXECUTIVE';
    RAISE NOTICE '7. All tables have proper indexes and RLS policies';
    RAISE NOTICE '8. Created missing tables: events, attendance, achievements, etc.';
    RAISE NOTICE 'All API endpoints should now work without 500 errors!';
END $$;