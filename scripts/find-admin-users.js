#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function findAdminUsers() {
  console.log('🔍 Looking for admin users in database...\n');
  
  try {
    // Search for users with admin-like roles
    const { data: adminUsers, error } = await supabase
      .from('users')
      .select('*')
      .in('role', ['admin', 'ADMIN', 'executive', 'EXECUTIVE', 'exec', 'EXEC']);
    
    if (error) {
      console.error('❌ Error searching for admin users:', error.message);
      return;
    }
    
    console.log(`📊 Found ${adminUsers.length} admin/executive users:\n`);
    
    if (adminUsers.length === 0) {
      console.log('❌ No admin users found!');
    } else {
      adminUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.first_name} ${user.last_name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Status: ${user.status}`);
        console.log(`   Password: ${user.password ? 'Set' : 'Missing'}`);
        console.log('   ---');
      });
    }
    
    // Search for the specific admin@msaportal.com
    console.log('🔍 Searching for admin@msaportal.com specifically...');
    const { data: specificAdmin, error: specificError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'admin@msaportal.com')
      .single();
    
    if (specificError || !specificAdmin) {
      console.log('❌ admin@msaportal.com not found in database');
      console.log('🔧 Will need to create this user');
    } else {
      console.log('✅ admin@msaportal.com found:');
      console.log(`   Name: ${specificAdmin.first_name} ${specificAdmin.last_name}`);
      console.log(`   Role: ${specificAdmin.role}`);
      console.log(`   Status: ${specificAdmin.status}`);
      console.log(`   Password: ${specificAdmin.password ? 'Set' : 'Missing'}`);
    }
    
    // Also search for any users with 'admin' in their email
    console.log('\n🔍 Searching for users with "admin" in email...');
    const { data: adminEmails, error: emailError } = await supabase
      .from('users')
      .select('email, first_name, last_name, role')
      .ilike('email', '%admin%');
    
    if (!emailError && adminEmails.length > 0) {
      console.log(`Found ${adminEmails.length} users with "admin" in email:`);
      adminEmails.forEach(user => {
        console.log(`   - ${user.email} (${user.role})`);
      });
    } else {
      console.log('No users with "admin" in email found');
    }
    
  } catch (error) {
    console.error('❌ Search failed:', error);
  }
}

findAdminUsers();