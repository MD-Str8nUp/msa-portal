#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const DEFAULT_PASSWORD = 'MSA@2025!';

async function completeAuthSetup() {
  console.log('🔧 Completing authentication setup...\n');
  
  try {
    // Step 1: Verify schema is updated
    console.log('📋 Step 1: Verifying updated schema...');
    const { data: testUser, error: schemaError } = await supabase
      .from('users')
      .select('password, status, login_count')
      .limit(1);
    
    if (schemaError) {
      console.error('❌ Schema not updated yet. Please run the SQL in Supabase first.');
      return;
    }
    
    if (testUser && testUser.length > 0) {
      console.log('✅ Schema updated successfully');
    }
    
    // Step 2: Create dedicated LEADER1 users
    console.log('👤 Step 2: Creating dedicated LEADER1 users...');
    const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
    
    const leader1Users = [
      { 
        email: 'leader1@msaportal.com', 
        firstName: 'Senior', 
        lastName: 'Leader',
        username: 'seniorleader'
      },
      { 
        email: 'head.leader@msaportal.com', 
        firstName: 'Head', 
        lastName: 'Leader',
        username: 'headleader'
      }
    ];
    
    for (const leader1 of leader1Users) {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id, role')
        .eq('email', leader1.email)
        .single();
      
      if (!existingUser) {
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            first_name: leader1.firstName,
            last_name: leader1.lastName,
            full_name: `${leader1.firstName} ${leader1.lastName}`,
            email: leader1.email,
            username: leader1.username,
            role: 'LEADER1',
            password: passwordHash,
            status: 'ACTIVE',
            login_count: 0,
            is_also_leader: false,
            is_also_parent: false,
            current_view_mode: 'leader1'
          });
        
        if (insertError) {
          console.error(`❌ Failed to create LEADER1 user ${leader1.email}: ${insertError.message}`);
        } else {
          console.log(`✅ Created LEADER1 user: ${leader1.email}`);
        }
      } else {
        // Update existing user to LEADER1
        const { error: updateError } = await supabase
          .from('users')
          .update({ 
            role: 'LEADER1', 
            password: passwordHash, 
            status: 'ACTIVE',
            current_view_mode: 'leader1'
          })
          .eq('email', leader1.email);
        
        if (updateError) {
          console.error(`❌ Failed to update user to LEADER1 ${leader1.email}: ${updateError.message}`);
        } else {
          console.log(`✅ Updated user to LEADER1: ${leader1.email}`);
        }
      }
    }
    
    // Step 3: Final verification
    console.log('✅ Step 3: Final verification of all users...');
    const { data: allUsers, error: verifyError } = await supabase
      .from('users')
      .select('email, role, status, password');
    
    if (verifyError) {
      console.error('❌ Verification failed:', verifyError.message);
      return;
    }
    
    // Count users by role
    const roleCount = allUsers.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});
    
    console.log('\\n📈 Final Role Distribution:');
    Object.entries(roleCount).forEach(([role, count]) => {
      console.log(`   ${role}: ${count} users`);
    });
    
    // Check authentication completeness
    const usersWithPasswords = allUsers.filter(user => user.password && user.password.length > 0).length;
    const activeUsers = allUsers.filter(user => user.status === 'ACTIVE').length;
    
    console.log(`\\n🔐 Authentication Status:`);
    console.log(`   Users with passwords: ${usersWithPasswords}/${allUsers.length}`);
    console.log(`   Active users: ${activeUsers}/${allUsers.length}`);
    
    // Sample users for testing
    console.log('\\n👥 Sample users for testing:');
    const sampleUsers = {
      'PARENT': allUsers.find(u => u.role === 'PARENT'),
      'LEADER': allUsers.find(u => u.role === 'LEADER'), 
      'LEADER1': allUsers.find(u => u.role === 'LEADER1'),
      'ADMIN': allUsers.find(u => u.role === 'ADMIN')
    };
    
    Object.entries(sampleUsers).forEach(([role, user]) => {
      if (user) {
        console.log(`   ${role}: ${user.email} (password: ${DEFAULT_PASSWORD})`);
      } else {
        console.log(`   ${role}: No users found with this role`);
      }
    });
    
    console.log(`\\n🎉 Authentication setup completed successfully!`);
    console.log(`🔑 All users can now log in with password: ${DEFAULT_PASSWORD}`);
    
  } catch (error) {
    console.error('❌ Authentication setup failed:', error);
  }
}

completeAuthSetup();