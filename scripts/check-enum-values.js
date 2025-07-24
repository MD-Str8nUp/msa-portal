#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;  
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkEnumValues() {
  console.log('🔍 Checking enum values and database structure...');
  
  try {
    // Try to get existing users to see what role values exist
    const { data: users, error } = await supabase
      .from('users')
      .select('role')
      .limit(10);
      
    if (users && users.length > 0) {
      console.log('✅ Existing user roles:', [...new Set(users.map(u => u.role))]);
    } else {
      console.log('⚠️  No existing users found');
    }
    
    // Try to get existing groups to see structure
    const { data: groups, error: groupError } = await supabase
      .from('groups')
      .select('*')
      .limit(3);
      
    if (groups && groups.length > 0) {
      console.log('✅ Existing groups:', groups.map(g => ({ id: g.id, name: g.name })));
    } else {
      console.log('⚠️  No existing groups found');
    }
    
    // Let's try creating a simple test record to see what works
    console.log('🔧 Testing role creation...');
    
    const testRoles = ['parent', 'leader', 'executive', 'admin'];
    for (const role of testRoles) {
      try {
        const { data, error } = await supabase
          .from('users')
          .insert({
            first_name: 'Test',
            last_name: 'User',
            email: `test-${role}@test.com`,
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
    
  } catch (error) {
    console.error('❌ Check failed:', error);
  }
}

checkEnumValues();