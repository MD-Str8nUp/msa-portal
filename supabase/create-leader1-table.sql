-- Create LEADER1 table for leaders who are also parents
-- Run this in your Supabase SQL Editor

-- Create LEADER1 table
CREATE TABLE IF NOT EXISTS leader1_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  full_name TEXT NOT NULL,
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
  login_count INTEGER DEFAULT 0,
  last_login TIMESTAMP WITH TIME ZONE,
  is_primary_leader BOOLEAN DEFAULT false,
  leadership_level TEXT DEFAULT 'SENIOR' CHECK (leadership_level IN ('SENIOR', 'HEAD', 'ASSISTANT')),
  assigned_groups TEXT[], -- Array of group names they lead
  parent_responsibilities TEXT[], -- Array of parent duties
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id),
  UNIQUE(email)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_leader1_user_id ON leader1_users(user_id);
CREATE INDEX IF NOT EXISTS idx_leader1_email ON leader1_users(email);
CREATE INDEX IF NOT EXISTS idx_leader1_status ON leader1_users(status);
CREATE INDEX IF NOT EXISTS idx_leader1_leadership_level ON leader1_users(leadership_level);

-- Enable Row Level Security
ALTER TABLE leader1_users ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for service role access
CREATE POLICY "Service role can do everything on leader1_users" ON leader1_users
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE TRIGGER update_leader1_users_updated_at 
BEFORE UPDATE ON leader1_users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create a view for easy querying of leader1 users with their base user info
CREATE OR REPLACE VIEW leader1_users_view AS
SELECT 
  l1.*,
  u.role as base_role,
  u.is_also_leader,
  u.is_also_parent,
  u.current_view_mode,
  u.address
FROM leader1_users l1
JOIN users u ON l1.user_id = u.id;

-- Insert initial LEADER1 users (those who are leaders and also parents)
-- We'll populate this via script after creating the table