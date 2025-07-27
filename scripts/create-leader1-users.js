#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const DEFAULT_PASSWORD = 'MSA@2025!';

async function createLeader1Users() {
  console.log('👤 Creating LEADER1 users with correct schema...\n');
  
  try {
    const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
    
    // Check what columns actually exist by getting a sample user
    const { data: sampleUser } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (sampleUser && sampleUser.length > 0) {
      console.log('📋 Available columns:', Object.keys(sampleUser[0]).join(', '));
    }
    
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
        // Create user with only the columns that exist
        const newUser = {
          first_name: leader1.firstName,
          last_name: leader1.lastName,
          email: leader1.email,
          username: leader1.username,
          role: 'leader1',
          password: passwordHash,
          status: 'ACTIVE',
          login_count: 0,
          is_also_leader: false,
          is_also_parent: false,
          current_view_mode: 'leader1'
        };
        
        // Don't include full_name since it seems to be auto-generated
        const { error: insertError } = await supabase
          .from('users')
          .insert(newUser);
        
        if (insertError) {
          console.error(`❌ Failed to create LEADER1 user ${leader1.email}: ${insertError.message}`);
        } else {
          console.log(`✅ Created LEADER1 user: ${leader1.email}`);
        }
      } else {
        // Update existing user to leader1 role
        const { error: updateError } = await supabase
          .from('users')
          .update({ 
            role: 'leader1',
            password: passwordHash,
            status: 'ACTIVE',
            current_view_mode: 'leader1'
          })
          .eq('email', leader1.email);
        
        if (updateError) {
          console.error(`❌ Failed to update user to LEADER1 ${leader1.email}: ${updateError.message}`);
        } else {
          console.log(`✅ Updated existing user to LEADER1: ${leader1.email}`);
        }
      }
    }
    
    // Final check
    const { data: finalUsers } = await supabase
      .from('users')
      .select('email, role')
      .eq('role', 'leader1');
    
    if (finalUsers && finalUsers.length > 0) {
      console.log('\\n✅ LEADER1 users created:');
      finalUsers.forEach(user => {
        console.log(`   - ${user.email}`);
      });
    } else {
      console.log('\\n⚠️  No LEADER1 users found.');
    }
    
  } catch (error) {
    console.error('❌ LEADER1 user creation failed:', error);
  }
}

createLeader1Users();