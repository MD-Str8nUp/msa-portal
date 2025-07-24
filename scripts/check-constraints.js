#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;  
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkConstraints() {
  console.log('🔍 Checking foreign key constraints...');
  
  try {
    // Check what the scouts table looks like
    const { data: scoutSample, error } = await supabase
      .from('scouts')
      .select('*')
      .limit(1);
      
    if (scoutSample && scoutSample.length > 0) {
      console.log('✅ Scouts table structure:', Object.keys(scoutSample[0]));
    }
    
    // Check what tables exist for groups
    const tables = ['groups', 'scout_groups'];
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('id, name')
        .limit(3);
        
      if (error) {
        console.log(`❌ Table "${table}": ${error.message}`);
      } else {
        console.log(`✅ Table "${table}": ${data.length} records`);
        if (data.length > 0) {
          console.log(`   Sample data:`, data);
        }
      }
    }
    
    // Try to check if scout_groups table exists with different approach
    const { data: scoutGroups, error: sgError } = await supabase
      .from('scout_groups') 
      .select('*')
      .limit(1);
      
    console.log('🔧 scout_groups table:', sgError ? 'Does not exist' : 'Exists');
    
  } catch (error) {
    console.error('❌ Check failed:', error);
  }
}

checkConstraints();