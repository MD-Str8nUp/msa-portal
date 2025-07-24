#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;  
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateSchemaManually() {
  console.log('🔧 Manually updating schema...');
  
  try {
    // Check current structure first
    console.log('📋 Checking users table structure...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
      
    if (userData && userData.length > 0) {
      console.log('✅ Users table columns:', Object.keys(userData[0]));
      
      // Check if password column exists
      if (!userData[0].hasOwnProperty('password')) {
        console.log('❌ Password column missing from users table');
        console.log('🔧 Please run this SQL in your Supabase SQL Editor:');
        console.log(`
ALTER TABLE users ADD COLUMN password TEXT;
UPDATE users SET password = '$2a$12$defaultpassword' WHERE password IS NULL;
ALTER TABLE users ALTER COLUMN password SET NOT NULL;
        `);
      } else {
        console.log('✅ Password column exists');
      }
    }
    
    // Check groups table
    console.log('📋 Checking groups table structure...');
    const { data: groupData, error: groupError } = await supabase
      .from('groups')
      .select('*')
      .limit(1);
      
    if (groupData && groupData.length > 0) {
      console.log('✅ Groups table columns:', Object.keys(groupData[0]));
      
      if (!groupData[0].hasOwnProperty('type')) {
        console.log('❌ Type column missing from groups table');
        console.log('🔧 Please run this SQL in your Supabase SQL Editor:');
        console.log(`
ALTER TABLE groups ADD COLUMN type TEXT DEFAULT 'SCOUT_GROUP';
        `);
      } else {
        console.log('✅ Type column exists');
      }
    }
    
    // Check scouts table
    console.log('📋 Checking scouts table structure...');
    const { data: scoutData, error: scoutError } = await supabase
      .from('scouts')
      .select('*')
      .limit(1);
      
    if (scoutData && scoutData.length > 0) {
      console.log('✅ Scouts table columns:', Object.keys(scoutData[0]));
      
      const requiredColumns = ['date_of_birth', 'gender', 'school', 'uniform_top_size', 'uniform_bottom_size', 'allergies', 'parent_id'];
      const missingColumns = requiredColumns.filter(col => !scoutData[0].hasOwnProperty(col));
      
      if (missingColumns.length > 0) {
        console.log('❌ Missing columns from scouts table:', missingColumns);
        console.log('🔧 Please run this SQL in your Supabase SQL Editor:');
        console.log(`
ALTER TABLE scouts ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE scouts ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE scouts ADD COLUMN IF NOT EXISTS school TEXT;
ALTER TABLE scouts ADD COLUMN IF NOT EXISTS uniform_top_size TEXT;
ALTER TABLE scouts ADD COLUMN IF NOT EXISTS uniform_bottom_size TEXT;
ALTER TABLE scouts ADD COLUMN IF NOT EXISTS allergies TEXT;
ALTER TABLE scouts ADD COLUMN IF NOT EXISTS parent_id UUID;
        `);
      } else {
        console.log('✅ All required columns exist');
      }
    }
    
  } catch (error) {
    console.error('❌ Schema check failed:', error);
  }
}

updateSchemaManually();