#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const DEFAULT_PASSWORD = 'MSA@2025!';

async function createAdminUser() {
  console.log('👤 Creating admin@msaportal.com user...\n');
  
  try {
    // Generate password hash
    const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
    console.log('🔐 Generated password hash');
    
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'admin@msaportal.com')
      .single();
    
    if (existingUser) {
      console.log('⚠️  User already exists, updating...');
      
      const { error: updateError } = await supabase
        .from('users')
        .update({
          password: passwordHash,
          status: 'ACTIVE',
          role: 'exec', // Using 'exec' role since that's what exists
          updated_at: new Date().toISOString()
        })
        .eq('email', 'admin@msaportal.com');
      
      if (updateError) {
        console.error('❌ Failed to update user:', updateError.message);
        return;
      }
      
      console.log('✅ Updated existing admin@msaportal.com user');
    } else {
      console.log('📝 Creating new admin user...');
      
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          first_name: 'Admin',
          last_name: 'User',
          email: 'admin@msaportal.com',
          username: 'admin',
          role: 'exec', // Using 'exec' role since that's the admin role
          password: passwordHash,
          status: 'ACTIVE',
          login_count: 0,
          is_also_leader: false,
          is_also_parent: false,
          current_view_mode: 'parent',
          phone: '(555) 123-4567'
        });
      
      if (insertError) {
        console.error('❌ Failed to create user:', insertError.message);
        return;
      }
      
      console.log('✅ Created new admin@msaportal.com user');
    }
    
    // Verify the user was created/updated properly
    console.log('\n🔍 Verifying admin user...');
    const { data: verifyUser, error: verifyError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'admin@msaportal.com')
      .single();
    
    if (verifyError || !verifyUser) {
      console.error('❌ Verification failed:', verifyError?.message);
      return;
    }
    
    console.log('✅ Admin user verified:');
    console.log(`   Name: ${verifyUser.first_name} ${verifyUser.last_name}`);
    console.log(`   Email: ${verifyUser.email}`);
    console.log(`   Role: ${verifyUser.role}`);
    console.log(`   Status: ${verifyUser.status}`);
    console.log(`   Password set: ${!!verifyUser.password}`);
    
    // Test the password
    console.log('\n🧪 Testing password...');
    const isPasswordValid = await bcrypt.compare(DEFAULT_PASSWORD, verifyUser.password);
    console.log(`Password validation: ${isPasswordValid ? '✅ Success' : '❌ Failed'}`);
    
    console.log('\n🎉 Admin user setup completed!');
    console.log(`📧 Email: admin@msaportal.com`);
    console.log(`🔑 Password: ${DEFAULT_PASSWORD}`);
    console.log(`👤 Role: ${verifyUser.role}`);
    
  } catch (error) {
    console.error('❌ Admin user creation failed:', error);
  }
}

createAdminUser();