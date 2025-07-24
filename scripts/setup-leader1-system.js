#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const DEFAULT_PASSWORD = 'MSA@2025!';

async function setupLeader1System() {
  console.log('🔧 Setting up LEADER1 system for leaders who are also parents...\n');
  
  try {
    // Step 1: Check if leader1_users table exists
    console.log('📋 Step 1: Checking if leader1_users table exists...');
    
    const { data: tableCheck, error: tableError } = await supabase
      .from('leader1_users')
      .select('*')
      .limit(1);
    
    if (tableError && tableError.message.includes('does not exist')) {
      console.error('❌ leader1_users table does not exist. Please run the SQL schema first:');
      console.log('   Run supabase/create-leader1-table.sql in Supabase SQL Editor');
      return;
    } else if (tableError) {
      console.error('❌ Error checking table:', tableError.message);
      return;
    }
    
    console.log('✅ leader1_users table exists.');
    
    // Step 2: Find users who are leaders and also parents
    console.log('👥 Step 2: Identifying leaders who are also parents...');
    
    const { data: potentialLeader1Users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'leader')
      .eq('is_also_parent', true);
    
    if (usersError) {
      console.error('❌ Error fetching users:', usersError.message);
      return;
    }
    
    console.log(`📊 Found ${potentialLeader1Users.length} leaders who are also parents.`);
    
    if (potentialLeader1Users.length === 0) {
      // If no users have is_also_parent=true, let's check for any leaders with children in scouts table
      console.log('🔍 Checking for leaders who might be parents via scouts table...');
      
      const { data: allLeaders } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'leader');
      
      const { data: scouts } = await supabase
        .from('scouts')
        .select('parent_id');
      
      if (scouts && scouts.length > 0) {
        const parentIds = scouts.map(scout => scout.parent_id);
        const leaderParents = allLeaders.filter(leader => parentIds.includes(leader.id));
        
        console.log(`📊 Found ${leaderParents.length} leaders who have children in scouts.`);
        
        if (leaderParents.length > 0) {
          potentialLeader1Users.push(...leaderParents);
        }
      }
    }
    
    // Step 3: Create LEADER1 users
    console.log('👤 Step 3: Creating LEADER1 user records...');
    
    const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
    let createdCount = 0;
    let updatedCount = 0;
    let errors = [];
    
    for (const user of potentialLeader1Users) {
      try {
        // Check if already exists in leader1_users
        const { data: existingLeader1 } = await supabase
          .from('leader1_users')
          .select('id')
          .eq('user_id', user.id)
          .single();
        
        const leader1Data = {
          user_id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          full_name: user.full_name || `${user.first_name} ${user.last_name}`,
          username: user.username,
          password: passwordHash,
          phone: user.phone,
          status: 'ACTIVE',
          login_count: 0,
          is_primary_leader: false,
          leadership_level: 'SENIOR',
          assigned_groups: [],
          parent_responsibilities: []
        };
        
        if (!existingLeader1) {
          // Create new LEADER1 user
          const { error: insertError } = await supabase
            .from('leader1_users')
            .insert(leader1Data);
          
          if (insertError) {
            errors.push(`Create ${user.email}: ${insertError.message}`);
          } else {
            console.log(`✅ Created LEADER1 user: ${user.email}`);
            createdCount++;
          }
        } else {
          // Update existing LEADER1 user
          const { error: updateError } = await supabase
            .from('leader1_users')
            .update(leader1Data)
            .eq('user_id', user.id);
          
          if (updateError) {
            errors.push(`Update ${user.email}: ${updateError.message}`);
          } else {
            console.log(`🔄 Updated LEADER1 user: ${user.email}`);
            updatedCount++;
          }
        }
        
      } catch (userError) {
        errors.push(`${user.email}: ${userError.message}`);
      }
    }
    
    // Step 4: Create additional dedicated LEADER1 users
    console.log('👑 Step 4: Creating dedicated senior LEADER1 users...');
    
    const dedicatedLeader1Users = [
      {
        email: 'senior.leader@msaportal.com',
        first_name: 'Senior',
        last_name: 'Leader',
        username: 'seniorleader',
        leadership_level: 'HEAD',
        is_primary_leader: true
      },
      {
        email: 'head.coordinator@msaportal.com',
        first_name: 'Head',
        last_name: 'Coordinator',
        username: 'headcoordinator',
        leadership_level: 'HEAD',
        is_primary_leader: true
      }
    ];
    
    for (const dedicatedUser of dedicatedLeader1Users) {
      try {
        // First create in users table if not exists
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('email', dedicatedUser.email)
          .single();
        
        let userId = existingUser?.id;
        
        if (!existingUser) {
          const { data: newUser, error: userError } = await supabase
            .from('users')
            .insert({
              first_name: dedicatedUser.first_name,
              last_name: dedicatedUser.last_name,
              full_name: `${dedicatedUser.first_name} ${dedicatedUser.last_name}`,
              email: dedicatedUser.email,
              username: dedicatedUser.username,
              role: 'leader',
              password: passwordHash,
              status: 'ACTIVE',
              login_count: 0,
              is_also_leader: true,
              is_also_parent: false,
              current_view_mode: 'leader'
            })
            .select()
            .single();
          
          if (userError) {
            console.error(`❌ Failed to create base user ${dedicatedUser.email}: ${userError.message}`);
            continue;
          }
          
          userId = newUser.id;
          console.log(`✅ Created base user: ${dedicatedUser.email}`);
        }
        
        // Now create/update in leader1_users
        const { data: existingLeader1 } = await supabase
          .from('leader1_users')
          .select('id')
          .eq('email', dedicatedUser.email)
          .single();
        
        const leader1Data = {
          user_id: userId,
          email: dedicatedUser.email,
          first_name: dedicatedUser.first_name,
          last_name: dedicatedUser.last_name,
          full_name: `${dedicatedUser.first_name} ${dedicatedUser.last_name}`,
          username: dedicatedUser.username,
          password: passwordHash,
          status: 'ACTIVE',
          login_count: 0,
          is_primary_leader: dedicatedUser.is_primary_leader,
          leadership_level: dedicatedUser.leadership_level,
          assigned_groups: ['All Groups'],
          parent_responsibilities: []
        };
        
        if (!existingLeader1) {
          const { error: insertError } = await supabase
            .from('leader1_users')
            .insert(leader1Data);
          
          if (insertError) {
            console.error(`❌ Failed to create LEADER1 ${dedicatedUser.email}: ${insertError.message}`);
          } else {
            console.log(`✅ Created dedicated LEADER1: ${dedicatedUser.email}`);
            createdCount++;
          }
        }
        
      } catch (error) {
        console.error(`❌ Error with dedicated user ${dedicatedUser.email}: ${error.message}`);
      }
    }
    
    // Step 5: Final verification
    console.log('✅ Step 5: Final verification...');
    
    const { data: allLeader1Users, error: verifyError } = await supabase
      .from('leader1_users')
      .select('email, leadership_level, is_primary_leader, status');
    
    if (verifyError) {
      console.error('❌ Verification failed:', verifyError.message);
    } else {
      console.log(`\\n📈 LEADER1 System Summary:`);
      console.log(`   Total LEADER1 users: ${allLeader1Users.length}`);
      console.log(`   New users created: ${createdCount}`);
      console.log(`   Existing users updated: ${updatedCount}`);
      
      const levelCount = allLeader1Users.reduce((acc, user) => {
        acc[user.leadership_level] = (acc[user.leadership_level] || 0) + 1;
        return acc;
      }, {});
      
      console.log('\\n📊 Leadership Level Distribution:');
      Object.entries(levelCount).forEach(([level, count]) => {
        console.log(`   ${level}: ${count} users`);
      });
      
      const primaryLeaders = allLeader1Users.filter(u => u.is_primary_leader).length;
      console.log(`   Primary Leaders: ${primaryLeaders}`);
      
      console.log('\\n👥 Sample LEADER1 Users:');
      allLeader1Users.slice(0, 3).forEach(user => {
        console.log(`   ${user.leadership_level}: ${user.email}`);
      });
    }
    
    if (errors.length > 0) {
      console.log(`\\n⚠️  ${errors.length} errors occurred:`);
      errors.slice(0, 3).forEach(error => console.log(`   - ${error}`));
    }
    
    console.log(`\\n🎉 LEADER1 system setup completed!`);
    console.log(`🔑 All LEADER1 users can log in with password: ${DEFAULT_PASSWORD}`);
    
  } catch (error) {
    console.error('❌ LEADER1 system setup failed:', error);
  }
}

setupLeader1System();