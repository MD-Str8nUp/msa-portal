#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const TEST_PASSWORD = 'MSA@2025!';

async function testCurrentAuth() {
  console.log('🧪 Testing current authentication setup...\n');
  
  try {
    // Get sample users for each role
    const { data: users, error } = await supabase
      .from('users')
      .select('email, role, password, status')
      .in('role', ['parent', 'leader', 'exec'])
      .eq('status', 'ACTIVE')
      .limit(6);
    
    if (error) {
      console.error('❌ Failed to fetch users:', error.message);
      return;
    }
    
    console.log(`📊 Found ${users.length} users to test.`);
    
    // Group users by role
    const usersByRole = users.reduce((acc, user) => {
      if (!acc[user.role]) acc[user.role] = [];
      acc[user.role].push(user);
      return acc;
    }, {});
    
    console.log('\\n🔍 Testing login for each role:');
    
    let successfulLogins = 0;
    let totalTests = 0;
    
    for (const [role, roleUsers] of Object.entries(usersByRole)) {
      console.log(`\\n👤 Testing ${role.toUpperCase()} role:`);
      
      // Test first 2 users of each role
      const testUsers = roleUsers.slice(0, 2);
      
      for (const testUser of testUsers) {
        totalTests++;
        
        if (!testUser.password) {
          console.log(`   ❌ ${testUser.email}: No password set`);
          continue;
        }
        
        try {
          const isPasswordValid = await bcrypt.compare(TEST_PASSWORD, testUser.password);
          
          if (isPasswordValid) {
            console.log(`   ✅ ${testUser.email}: Login successful`);
            successfulLogins++;
            
            // Update last_login to simulate successful login
            await supabase
              .from('users')
              .update({ 
                last_login: new Date().toISOString(),
                login_count: 1 
              })
              .eq('email', testUser.email);
              
          } else {
            console.log(`   ❌ ${testUser.email}: Invalid password`);
          }
        } catch (bcryptError) {
          console.log(`   ❌ ${testUser.email}: Password verification failed`);
        }
      }
    }
    
    // Final summary
    console.log('\\n📈 Authentication Test Results:');
    console.log(`   Successful logins: ${successfulLogins}/${totalTests}`);
    console.log(`   Success rate: ${Math.round((successfulLogins/totalTests) * 100)}%`);
    console.log(`   Default password: ${TEST_PASSWORD}`);
    
    // Show role distribution
    console.log('\\n📊 Role Distribution:');
    Object.entries(usersByRole).forEach(([role, roleUsers]) => {
      console.log(`   ${role}: ${roleUsers.length} users tested`);
    });
    
    // Create some leader1 test users
    console.log('\\n👤 Creating test LEADER1 users...');
    
    const passwordHash = await bcrypt.hash(TEST_PASSWORD, 10);
    
    const leader1TestUsers = [
      {
        email: 'senior.leader@msaportal.com',
        first_name: 'Senior',
        last_name: 'Leader',
        username: 'seniorleader',
        role: 'leader1',
        password: passwordHash,
        status: 'ACTIVE',
        login_count: 0,
        is_also_leader: true,
        is_also_parent: false,
        current_view_mode: 'leader' // Use existing enum value
      }
    ];
    
    for (const user of leader1TestUsers) {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', user.email)
        .single();
      
      if (!existingUser) {
        const { error: insertError } = await supabase
          .from('users')
          .insert(user);
        
        if (insertError) {
          console.error(`❌ Failed to create test LEADER1 user: ${insertError.message}`);
        } else {
          console.log(`✅ Created test LEADER1 user: ${user.email}`);
        }
      } else {
        console.log(`⚠️  Test LEADER1 user already exists: ${user.email}`);
      }
    }
    
    console.log('\\n🎉 Authentication testing completed!');
    
  } catch (error) {
    console.error('❌ Authentication test failed:', error);
  }
}

testCurrentAuth();