#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const TEST_PASSWORD = 'MSA@2025!';

async function checkPasswordState() {
  console.log('🔍 Checking current password state in database...\n');
  
  try {
    // Get sample users to check their password state
    const { data: users, error } = await supabase
      .from('users')
      .select('email, password, first_name, last_name')
      .limit(5);
    
    if (error) {
      console.error('❌ Error fetching users:', error.message);
      return;
    }
    
    if (!users || users.length === 0) {
      console.error('❌ No users found');
      return;
    }
    
    console.log(`📊 Checking ${users.length} sample users:\n`);
    
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      console.log(`${i + 1}. ${user.first_name} ${user.last_name} (${user.email})`);
      
      if (!user.password) {
        console.log('   ❌ No password set');
      } else {
        console.log(`   🔐 Password hash: ${user.password.substring(0, 20)}...`);
        console.log(`   📏 Hash length: ${user.password.length} characters`);
        
        // Check if it looks like a bcrypt hash
        const isBcryptFormat = user.password.startsWith('$2a$') || user.password.startsWith('$2b$');
        console.log(`   🧪 Bcrypt format: ${isBcryptFormat ? '✅ Yes' : '❌ No'}`);
        
        // Test password comparison
        try {
          const isValid = await bcrypt.compare(TEST_PASSWORD, user.password);
          console.log(`   🔑 Password '${TEST_PASSWORD}' valid: ${isValid ? '✅ Yes' : '❌ No'}`);
          
          // If bcrypt fails, try simple comparison
          if (!isValid) {
            const isPlainText = (TEST_PASSWORD === user.password);
            console.log(`   📝 Plain text match: ${isPlainText ? '✅ Yes' : '❌ No'}`);
          }
        } catch (bcryptError) {
          console.log(`   ❌ Bcrypt error: ${bcryptError.message}`);
        }
      }
      console.log('   ---');
    }
    
    // Test creating a fresh hash
    console.log('🧪 Testing fresh password hash creation...');
    const freshHash = await bcrypt.hash(TEST_PASSWORD, 10);
    console.log(`Fresh hash: ${freshHash}`);
    
    const freshHashValid = await bcrypt.compare(TEST_PASSWORD, freshHash);
    console.log(`Fresh hash validation: ${freshHashValid ? '✅ Works' : '❌ Failed'}`);
    
    // Test a simple password
    console.log('\n🧪 Testing simple password "test123"...');
    const simpleHash = await bcrypt.hash('test123', 10);
    const simpleValid = await bcrypt.compare('test123', simpleHash);
    console.log(`Simple password validation: ${simpleValid ? '✅ Works' : '❌ Failed'}`);
    
  } catch (error) {
    console.error('❌ Password state check failed:', error);
  }
}

checkPasswordState();