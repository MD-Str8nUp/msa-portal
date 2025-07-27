#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const DEFAULT_PASSWORD = 'MSA@2025!';

async function applyProperSchema() {
  console.log('🔧 Applying proper authentication schema and fixing all users...\n');
  
  try {
    console.log('📋 Step 1: Adding missing authentication columns...');
    
    // Add missing columns for authentication
    const schemaSQL = `
      -- Add missing authentication columns
      ALTER TABLE users ADD COLUMN IF NOT EXISTS password TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE'));
      ALTER TABLE users ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
      ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT;
      
      -- Update existing null values
      UPDATE users SET status = 'ACTIVE' WHERE status IS NULL;
      UPDATE users SET login_count = 0 WHERE login_count IS NULL;
      UPDATE users SET updated_at = NOW() WHERE updated_at IS NULL;
    `;
    
    // Execute schema updates via raw SQL (we need to use Supabase's SQL editor for this)
    console.log('⚠️  Schema updates need to be applied via Supabase SQL editor. Continuing with user updates...');
    
    // Step 2: Generate password hash
    console.log('🔐 Step 2: Preparing password hash...');
    const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
    console.log('✅ Password hash generated.');
    
    // Step 3: Get all users and update them
    console.log('👥 Step 3: Fetching and updating all users...');
    const { data: users, error: fetchError } = await supabase
      .from('users')
      .select('*');
    
    if (fetchError) {
      throw new Error(`Failed to fetch users: ${fetchError.message}`);
    }
    
    console.log(`📊 Found ${users.length} users to update.`);
    
    let updateCount = 0;
    let errors = [];
    
    // Update users in smaller batches with available columns only
    for (const user of users) {
      try {
        // Normalize the role
        let normalizedRole = user.role;
        if (user.role === 'leader') normalizedRole = 'LEADER';
        else if (user.role === 'parent') normalizedRole = 'PARENT';
        else if (user.role === 'exec') normalizedRole = 'ADMIN';
        else normalizedRole = user.role.toUpperCase();
        
        // Try to update with only the columns we know exist for sure
        // First try with password column (might be missing)
        let updateData = {
          role: normalizedRole
        };
        
        // Try to add password if the column exists
        try {
          updateData.password = passwordHash;
          
          const { error: updateError } = await supabase
            .from('users')
            .update(updateData)
            .eq('id', user.id);
          
          if (updateError) {
            errors.push(`${user.email}: ${updateError.message}`);
          } else {
            updateCount++;
          }
        } catch (passwordError) {
          // If password column doesn't exist, just update the role
          const { error: roleUpdateError } = await supabase
            .from('users')
            .update({ role: normalizedRole })
            .eq('id', user.id);
          
          if (roleUpdateError) {
            errors.push(`${user.email}: ${roleUpdateError.message}`);
          } else {
            updateCount++;
          }
        }
        
      } catch (userError) {
        errors.push(`${user.email}: ${userError.message}`);
      }
    }
    
    // Step 4: Create dedicated LEADER1 users
    console.log('👤 Step 4: Creating LEADER1 users...');
    
    const leader1Users = [
      { email: 'leader1@msaportal.com', firstName: 'Senior', lastName: 'Leader' },
      { email: 'head.leader@msaportal.com', firstName: 'Head', lastName: 'Leader' }
    ];
    
    for (const leader1 of leader1Users) {
      try {
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('email', leader1.email)
          .single();
        
        if (!existingUser) {
          const newUser = {
            first_name: leader1.firstName,
            last_name: leader1.lastName,
            full_name: `${leader1.firstName} ${leader1.lastName}`,
            email: leader1.email,
            username: leader1.email.split('@')[0],
            role: 'LEADER1',
            is_also_leader: false,
            is_also_parent: false,
            current_view_mode: 'leader1'
          };
          
          // Try to add password if column exists
          try {
            newUser.password = passwordHash;
          } catch (e) {
            // Password column might not exist yet
          }
          
          const { error: insertError } = await supabase
            .from('users')
            .insert(newUser);
          
          if (insertError) {
            console.error(`❌ Failed to create LEADER1 user ${leader1.email}: ${insertError.message}`);
          } else {
            console.log(`✅ Created LEADER1 user: ${leader1.email}`);
          }
        }
      } catch (error) {
        console.error(`❌ Error with LEADER1 user ${leader1.email}: ${error.message}`);
      }
    }
    
    // Final verification
    console.log('✅ Step 5: Final verification...');
    const { data: finalUsers, error: finalError } = await supabase
      .from('users')
      .select('role, email');
    
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
    }
    
    console.log(`\\n🎉 User update completed!`);
    console.log(`📊 Successfully updated ${updateCount} users`);
    console.log(`🔑 Default login password: ${DEFAULT_PASSWORD}`);
    
    if (errors.length > 0) {
      console.log(`\\n⚠️  ${errors.length} errors occurred:`);
      errors.slice(0, 5).forEach(error => console.log(`   - ${error}`));
      if (errors.length > 5) {
        console.log(`   ... and ${errors.length - 5} more errors`);
      }
    }
    
    console.log('\\n📝 IMPORTANT: You need to run the following SQL in Supabase SQL Editor:');
    console.log(`
      -- Add missing authentication columns
      ALTER TABLE users ADD COLUMN IF NOT EXISTS password TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE'));
      ALTER TABLE users ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
      ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT;
      
      -- Update existing null values
      UPDATE users SET status = 'ACTIVE' WHERE status IS NULL;
      UPDATE users SET login_count = 0 WHERE login_count IS NULL;
      UPDATE users SET updated_at = NOW() WHERE updated_at IS NULL;
      UPDATE users SET password = '${passwordHash}' WHERE password IS NULL;
    `);
    
  } catch (error) {
    console.error('❌ Schema application failed:', error);
  }
}

applyProperSchema();