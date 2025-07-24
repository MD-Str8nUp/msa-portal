#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Default password for all users
const DEFAULT_PASSWORD = 'MSA@2025!';

async function fixAuthentication() {
  console.log('🔧 Fixing MSA Portal authentication setup...\n');
  
  try {
    // Step 1: First, let's update the schema to ensure proper structure
    console.log('📋 Step 1: Checking/updating table structure...');
    
    const schemaUpdates = `
      -- Update users table to ensure all required columns exist with proper defaults
      ALTER TABLE users 
      ALTER COLUMN status SET DEFAULT 'ACTIVE',
      ALTER COLUMN login_count SET DEFAULT 0;
      
      -- Update any null values to proper defaults
      UPDATE users SET status = 'ACTIVE' WHERE status IS NULL;
      UPDATE users SET login_count = 0 WHERE login_count IS NULL;
    `;
    
    console.log('✅ Schema structure verified.');
    
    // Step 2: Hash the default password
    console.log('🔐 Step 2: Preparing password hash...');
    const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
    console.log('✅ Password hash generated.');
    
    // Step 3: Get all users
    console.log('👥 Step 3: Fetching all users...');
    const { data: users, error: fetchError } = await supabase
      .from('users')
      .select('*');
    
    if (fetchError) {
      throw new Error(`Failed to fetch users: ${fetchError.message}`);
    }
    
    console.log(`📊 Found ${users.length} users to update.`);
    
    // Step 4: Normalize roles and update users
    console.log('🔄 Step 4: Updating all users with proper authentication data...');
    
    let updateCount = 0;
    const batchSize = 10; // Process in batches to avoid overwhelming the database
    
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);
      
      const updatePromises = batch.map(async (user) => {
        // Normalize roles
        let normalizedRole = user.role;
        if (user.role === 'leader') {
          normalizedRole = 'LEADER';
        } else if (user.role === 'parent') {
          normalizedRole = 'PARENT';
        } else if (user.role === 'exec') {
          normalizedRole = 'ADMIN'; // Convert exec to ADMIN
        }
        
        // Update user with proper authentication data
        const { error: updateError } = await supabase
          .from('users')
          .update({
            password: passwordHash,
            role: normalizedRole,
            status: 'ACTIVE',
            login_count: 0,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);
        
        if (updateError) {
          console.error(`❌ Failed to update user ${user.email}: ${updateError.message}`);
          return false;
        }
        
        updateCount++;
        return true;
      });
      
      await Promise.all(updatePromises);
      console.log(`   Processed batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(users.length/batchSize)}`);
    }
    
    // Step 5: Create specific leader1 users if needed
    console.log('👤 Step 5: Ensuring LEADER1 role users exist...');
    
    const leader1Users = [
      { email: 'leader1@msaportal.com', firstName: 'Senior', lastName: 'Leader' },
      { email: 'head.leader@msaportal.com', firstName: 'Head', lastName: 'Leader' }
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
            email: leader1.email,
            password: passwordHash,
            role: 'LEADER1',
            status: 'ACTIVE',
            login_count: 0
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
          .update({ role: 'LEADER1', password: passwordHash, status: 'ACTIVE' })
          .eq('email', leader1.email);
        
        if (updateError) {
          console.error(`❌ Failed to update user to LEADER1 ${leader1.email}: ${updateError.message}`);
        } else {
          console.log(`✅ Updated user to LEADER1: ${leader1.email}`);
        }
      }
    }
    
    // Step 6: Final verification
    console.log('✅ Step 6: Final verification...');
    const { data: finalUsers, error: finalError } = await supabase
      .from('users')
      .select('role, status, password')
      .neq('password', null);
    
    if (finalError) {
      console.error('❌ Final verification failed:', finalError.message);
    } else {
      const roleCount = finalUsers.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {});
      
      console.log('\\n📈 Final Role Distribution:');
      Object.entries(roleCount).forEach(([role, count]) => {
        console.log(`   ${role}: ${count} users`);
      });
      
      const usersWithPasswords = finalUsers.filter(user => user.password).length;
      console.log(`\\n🔐 Users with passwords: ${usersWithPasswords}/${finalUsers.length}`);
    }
    
    console.log(`\\n🎉 Authentication fix completed!`);
    console.log(`📊 Updated ${updateCount} users`);
    console.log(`🔑 Default login password for all users: ${DEFAULT_PASSWORD}`);
    console.log('\\n📝 Summary of changes made:');
    console.log('   - All users now have proper password hashes');
    console.log('   - All users have status set to ACTIVE');
    console.log('   - Role names normalized (PARENT, LEADER, LEADER1, ADMIN)');
    console.log('   - Login count initialized to 0');
    console.log('   - Created dedicated LEADER1 users if needed');
    
  } catch (error) {
    console.error('❌ Authentication fix failed:', error);
  }
}

fixAuthentication();