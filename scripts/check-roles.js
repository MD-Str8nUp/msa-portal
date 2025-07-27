#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;  
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAvailableRoles() {
  console.log('🔍 Checking available user roles and table structure...');
  
  try {
    // Get existing users to see what roles exist
    const { data: users, error } = await supabase
      .from('users')
      .select('role')
      .limit(20);
      
    if (users) {
      const uniqueRoles = [...new Set(users.map(u => u.role))];
      console.log('✅ Existing user roles:', uniqueRoles);
    }
    
    // Test different role values
    const testRoles = ['executive', 'admin', 'leader1'];
    
    for (const role of testRoles) {
      try {
        const { data, error } = await supabase
          .from('users')
          .insert({
            first_name: 'Test',
            last_name: 'User',
            username: `test_${role}`,
            email: `test.${role}@test.com`,
            role: role
          })
          .select()
          .single();
          
        if (error) {
          console.log(`❌ Role "${role}": ${error.message}`);
        } else {
          console.log(`✅ Role "${role}": Works!`);
          // Clean up test user
          await supabase.from('users').delete().eq('id', data.id);
        }
      } catch (err) {
        console.log(`❌ Role "${role}": ${err.message}`);
      }
    }
    
    // Check users table structure
    const { data: sampleUser } = await supabase
      .from('users')
      .select('*')
      .limit(1)
      .single();
      
    if (sampleUser) {
      console.log('\n📋 Users table columns:', Object.keys(sampleUser));
    }
    
    // Check scout_groups table structure  
    const { data: sampleGroup } = await supabase
      .from('scout_groups')
      .select('*')
      .limit(1)
      .single();
      
    if (sampleGroup) {
      console.log('📋 Scout_groups table columns:', Object.keys(sampleGroup));
    }
    
  } catch (error) {
    console.error('❌ Check failed:', error);
  }
}

checkAvailableRoles();