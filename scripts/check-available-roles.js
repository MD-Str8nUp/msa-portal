#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkRoles() {
  console.log('🔍 Checking available roles in database...\n');
  
  try {
    // Get all unique roles from users table
    const { data: users, error } = await supabase
      .from('users')
      .select('role, email, first_name, last_name');
    
    if (error) {
      console.error('❌ Error fetching users:', error.message);
      return;
    }
    
    // Count users by role
    const roleCounts = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});
    
    console.log('📊 Available roles and user counts:');
    Object.entries(roleCounts).forEach(([role, count]) => {
      console.log(`   ${role}: ${count} users`);
    });
    
    // Look for potential admin users
    console.log('\n🔍 Looking for potential admin users:');
    const potentialAdmins = users.filter(user => 
      user.role === 'exec' || 
      user.email.includes('admin') || 
      user.email.includes('executive')
    );
    
    if (potentialAdmins.length > 0) {
      console.log('Found potential admin users:');
      potentialAdmins.forEach(user => {
        console.log(`   - ${user.first_name} ${user.last_name} (${user.email}) - Role: ${user.role}`);
      });
    } else {
      console.log('No potential admin users found');
    }
    
    // Check if admin@msaportal.com exists
    console.log('\n🔍 Checking for admin@msaportal.com...');
    const adminUser = users.find(user => user.email === 'admin@msaportal.com');
    if (adminUser) {
      console.log(`✅ Found: ${adminUser.first_name} ${adminUser.last_name} (${adminUser.role})`);
    } else {
      console.log('❌ admin@msaportal.com does not exist');
    }
    
  } catch (error) {
    console.error('❌ Role check failed:', error);
  }
}

checkRoles();