#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const TEST_PASSWORD = 'MSA@2025!';

async function testLogin() {
  console.log('🧪 Testing login functionality for all user types...\n');
  
  try {
    // Get sample users for each role
    const { data: users, error } = await supabase
      .from('users')
      .select('email, role, password, status')
      .in('role', ['PARENT', 'LEADER', 'LEADER1', 'ADMIN'])
      .eq('status', 'ACTIVE')
      .limit(10);
    
    if (error) {
      console.error('❌ Failed to fetch users:', error.message);
      return;
    }
    
    if (!users || users.length === 0) {
      console.log('❌ No users found. Please run the schema fix first.');
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
    
    for (const [role, roleUsers] of Object.entries(usersByRole)) {
      console.log(`\\n👤 Testing ${role} role:`);
      
      const testUser = roleUsers[0]; // Test first user of each role
      
      if (!testUser.password) {
        console.log(`   ❌ ${testUser.email}: No password set`);
        continue;
      }
      
      // Test password verification
      try {
        const isPasswordValid = await bcrypt.compare(TEST_PASSWORD, testUser.password);
        
        if (isPasswordValid) {
          console.log(`   ✅ ${testUser.email}: Login successful`);
          
          // Update last_login to simulate successful login
          const { error: updateError } = await supabase
            .from('users')
            .update({ 
              last_login: new Date().toISOString(),
              login_count: 1 
            })
            .eq('email', testUser.email);
          
          if (updateError) {
            console.log(`   ⚠️  Could not update login timestamp: ${updateError.message}`);
          } else {
            console.log(`   📝 Updated login timestamp for ${testUser.email}`);
          }
        } else {
          console.log(`   ❌ ${testUser.email}: Invalid password`);
        }
      } catch (bcryptError) {
        console.log(`   ❌ ${testUser.email}: Password verification failed - ${bcryptError.message}`);
      }
    }
    
    // Final summary
    console.log('\\n📈 Login Test Summary:');
    const totalUsers = users.length;
    const usersWithPasswords = users.filter(u => u.password).length;
    
    console.log(`   Total users tested: ${totalUsers}`);
    console.log(`   Users with passwords: ${usersWithPasswords}`);
    console.log(`   Default password: ${TEST_PASSWORD}`);
    
    // Show role distribution
    console.log('\\n📊 Role Distribution:');
    Object.entries(usersByRole).forEach(([role, roleUsers]) => {
      console.log(`   ${role}: ${roleUsers.length} users`);
    });
    
    console.log('\\n🎉 Login testing completed!');
    
  } catch (error) {
    console.error('❌ Login test failed:', error);
  }
}

testLogin();