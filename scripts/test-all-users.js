#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testAllUsers() {
  console.log('🧪 Testing login for all users...\n');
  
  try {
    // Get all users
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, role, password, status')
      .limit(10); // Test first 10 users
    
    if (error) {
      console.error('❌ Failed to fetch users:', error.message);
      return;
    }
    
    console.log(`📊 Found ${users.length} users to test\n`);
    
    for (const user of users) {
      console.log(`\n🧪 Testing user: ${user.email}`);
      console.log(`   Name: ${user.first_name} ${user.last_name}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Status: ${user.status}`);
      console.log(`   Has Password: ${!!user.password}`);
      
      if (!user.password) {
        console.log('   ⚠️  No password set - skipping');
        continue;
      }
      
      // Test with default password
      try {
        const testPassword = 'MSA@2025!';
        const isValid = await bcrypt.compare(testPassword, user.password);
        console.log(`   Password Test: ${isValid ? '✅ Valid' : '❌ Invalid'}`);
        
        if (isValid) {
          // Test API login
          const fetch = require('node-fetch');
          const response = await fetch('http://localhost:3004/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: user.email,
              password: testPassword
            })
          });
          
          const result = await response.json();
          console.log(`   API Test: ${result.success ? '✅ Success' : '❌ Failed - ' + result.error}`);
        }
        
      } catch (testError) {
        console.log(`   ❌ Test error: ${testError.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testAllUsers();