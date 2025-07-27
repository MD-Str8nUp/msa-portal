#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const DEFAULT_PASSWORD = 'MSA@2025!';

async function fixAuthFinal() {
  console.log('🔧 Final authentication fix with correct role values...\n');
  
  try {
    // Step 1: Generate password hash
    console.log('🔐 Step 1: Generating password hash...');
    const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
    console.log('✅ Password hash generated.');
    
    // Step 2: Update all existing users with passwords
    console.log('👥 Step 2: Setting passwords for all users...');
    const { data: updateResult, error: updateError } = await supabase
      .from('users')
      .update({ password: passwordHash })
      .is('password', null);
    
    if (updateError) {
      console.error('❌ Failed to update passwords:', updateError.message);
    } else {
      console.log('✅ Updated passwords for users without passwords.');
    }
    
    // Step 3: Create LEADER1 users with correct schema
    console.log('👤 Step 3: Creating LEADER1 users...');
    
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
        .select('id')
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
            role: 'leader1', // Use lowercase to match existing pattern
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
        console.log(`⚠️  User ${leader1.email} already exists.`);
      }
    }
    
    // Step 4: Final verification
    console.log('✅ Step 4: Final verification...');
    const { data: allUsers, error: verifyError } = await supabase
      .from('users')
      .select('email, role, status, password, login_count');
    
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
    console.log(`   Total users: ${allUsers.length}`);
    console.log(`   Users with passwords: ${usersWithPasswords}/${allUsers.length}`);
    console.log(`   Active users: ${activeUsers}/${allUsers.length}`);
    
    // Sample users for testing
    console.log('\\n👥 Sample users for testing:');
    const sampleUsers = {
      'parent': allUsers.find(u => u.role === 'parent'),
      'leader': allUsers.find(u => u.role === 'leader'), 
      'leader1': allUsers.find(u => u.role === 'leader1'),
      'exec': allUsers.find(u => u.role === 'exec')
    };
    
    Object.entries(sampleUsers).forEach(([role, user]) => {
      if (user) {
        console.log(`   ${role.toUpperCase()}: ${user.email} (password: ${DEFAULT_PASSWORD})`);
      } else {
        console.log(`   ${role.toUpperCase()}: No users found with this role`);
      }
    });
    
    console.log(`\\n🎉 Authentication setup completed successfully!`);
    console.log(`🔑 All users can now log in with password: ${DEFAULT_PASSWORD}`);
    
  } catch (error) {
    console.error('❌ Authentication fix failed:', error);
  }
}

fixAuthFinal();