#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkActualSchema() {
  console.log('🔍 Checking actual database schema...\n');
  
  try {
    // Get a sample user to see what columns actually exist
    const { data: sampleUsers, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Could not access users table:', error.message);
      return;
    }
    
    if (sampleUsers && sampleUsers.length > 0) {
      console.log('📋 Actual users table columns:');
      Object.keys(sampleUsers[0]).forEach(column => {
        const value = sampleUsers[0][column];
        const type = value === null ? 'null' : typeof value;
        console.log(`   - ${column}: ${type} (sample: ${value})`);
      });
    } else {
      console.log('📋 Users table exists but is empty');
    }
    
  } catch (error) {
    console.error('❌ Schema check failed:', error.message);
  }
}

checkActualSchema();