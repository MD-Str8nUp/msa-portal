#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUsers() {
  console.log('👥 Checking current users and their authentication status...\n');
  
  try {
    // Check users table
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching users:', error.message);
      return;
    }

    console.log(`📊 Found ${users.length} users in the database:\n`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.first_name} ${user.last_name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Status: ${user.status}`);
      console.log(`   Last Login: ${user.last_login || 'Never'}`);
      console.log(`   Login Count: ${user.login_count}`);
      console.log(`   Password Set: ${user.password ? 'Yes' : 'No'}`);
      console.log(`   Created: ${user.created_at}`);
      console.log('   ---');
    });

    // Check role distribution
    const roleCount = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});

    console.log('\n📈 Role Distribution:');
    Object.entries(roleCount).forEach(([role, count]) => {
      console.log(`   ${role}: ${count} users`);
    });

    // Check for any users without passwords
    const usersWithoutPasswords = users.filter(user => !user.password);
    if (usersWithoutPasswords.length > 0) {
      console.log('\n⚠️  Users without passwords:');
      usersWithoutPasswords.forEach(user => {
        console.log(`   - ${user.email} (${user.role})`);
      });
    }

    // Check auth.users table (Supabase Auth)
    console.log('\n🔐 Checking Supabase Auth users...');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.log('⚠️  Could not access auth.users table (this is expected if using custom auth)');
    } else {
      console.log(`Found ${authUsers.users.length} users in auth.users`);
      authUsers.users.forEach((authUser, index) => {
        console.log(`${index + 1}. ${authUser.email} - ${authUser.email_confirmed_at ? 'Confirmed' : 'Unconfirmed'}`);
      });
    }

  } catch (error) {
    console.error('❌ Users check failed:', error);
  }
}

checkUsers();