-- Fix RLS policies for users table to prevent infinite recursion
-- This script should be run in the Supabase SQL editor

-- First, disable RLS temporarily to allow cleanup
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies on users table
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Enable read access for users based on user_id" ON users;
DROP POLICY IF EXISTS "Enable insert for users based on user_id" ON users;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON users;
DROP POLICY IF EXISTS "Select users" ON users;
DROP POLICY IF EXISTS "Insert users" ON users;
DROP POLICY IF EXISTS "Update users" ON users;
DROP POLICY IF EXISTS "users_select_own" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;
DROP POLICY IF EXISTS "users_insert_auth" ON users;

-- Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies
-- Policy 1: Users can read their own record
CREATE POLICY "users_select_policy" ON users 
FOR SELECT 
USING (auth.uid() = id);

-- Policy 2: Users can update their own record  
CREATE POLICY "users_update_policy" ON users 
FOR UPDATE 
USING (auth.uid() = id);

-- Policy 3: Allow authenticated users to insert their own record
CREATE POLICY "users_insert_policy" ON users 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON users TO authenticated;
GRANT SELECT, INSERT, UPDATE ON users TO anon;

-- Verify the policies were created
SELECT tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'users';
