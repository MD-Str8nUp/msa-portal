#!/usr/bin/env node

/**
 * Create Leadership Structure for MSA Portal
 * 1. Create leader accounts for each scout group
 * 2. Promote some parents to Leader1 role (dual parent/leader)
 * 3. Create executive accounts
 * 4. Assign leaders to their respective groups
 */

const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Generate secure password
const generatePassword = () => Math.random().toString(36).slice(-8);

async function createLeadershipStructure() {
  console.log('👑 Creating MSA Leadership Structure...');
  
  try {
    // Step 1: Get existing scout groups and parent accounts
    const [scoutGroups, parentAccounts] = await Promise.all([
      getScoutGroups(),
      getParentAccounts()
    ]);
    
    // Step 2: Create leader accounts for each group
    const leaderAccounts = await createGroupLeaders(scoutGroups);
    
    // Step 3: Promote some parents to Leader1 (dual role)
    const leader1Accounts = await promoteParentsToLeader1(parentAccounts);
    
    // Step 4: Create executive accounts
    const executiveAccounts = await createExecutiveAccounts();
    
    // Step 5: Assign leaders to their groups
    await assignLeadersToGroups(leaderAccounts, scoutGroups);
    
    console.log('✅ Leadership structure creation complete!');
    
    // Summary
    console.log('\n📊 Leadership Structure Summary:');
    console.log(`   👥 Parent Accounts: ${parentAccounts.length}`);
    console.log(`   👨‍🏫 Leader Accounts: ${leaderAccounts.length}`);
    console.log(`   👨‍👩‍👧‍👦 Leader1 Accounts: ${leader1Accounts.length}`);
    console.log(`   👔 Executive Accounts: ${executiveAccounts.length}`);
    console.log(`   🏗️ Scout Groups: ${scoutGroups.length}`);
    
  } catch (error) {
    console.error('❌ Leadership creation failed:', error);
    throw error;
  }
}

async function getScoutGroups() {
  console.log('📋 Getting scout groups...');
  
  const { data: groups, error } = await supabase
    .from('scout_groups')
    .select('*');
    
  if (error) {
    console.error('❌ Error getting scout groups:', error);
    return [];
  }
  
  console.log(`✅ Found ${groups.length} scout groups`);
  return groups;
}

async function getParentAccounts() {
  console.log('👨‍👩‍👧‍👦 Getting parent accounts...');
  
  const { data: parents, error } = await supabase
    .from('users')
    .select('*')
    .eq('role', 'parent');
    
  if (error) {
    console.error('❌ Error getting parent accounts:', error);
    return [];
  }
  
  console.log(`✅ Found ${parents.length} parent accounts`);
  return parents;
}

async function createGroupLeaders(scoutGroups) {
  console.log('👨‍🏫 Creating group leaders...');
  
  const leaderAccounts = [];
  
  // Create a leader for each scout group
  for (const group of scoutGroups) {
    try {
      // Check if leader already exists for this group
      const { data: existingLeader } = await supabase
        .from('users')
        .select('id')
        .eq('role', 'leader')
        .ilike('first_name', `%${group.name}%`)
        .single();
        
      if (existingLeader) {
        console.log(`✅ Leader already exists for ${group.name}`);
        leaderAccounts.push(existingLeader);
        continue;
      }
      
      const password = generatePassword();
      const hashedPassword = await bcrypt.hash(password, 12);
      
      const leaderData = {
        first_name: `Leader`,
        last_name: group.name,
        username: `leader_${group.name.toLowerCase().replace(' ', '_')}`,
        email: `leader.${group.name.toLowerCase().replace(' ', '.')}@msa-portal.com`,
        role: 'leader',
        phone: `+61 400 ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 900) + 100}`,
        created_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('users')
        .insert(leaderData)
        .select()
        .single();
        
      if (error) {
        console.error(`❌ Error creating leader for ${group.name}:`, error);
      } else {
        console.log(`✅ Leader created for ${group.name}: ${leaderData.email}`);
        console.log(`   🔑 Password: ${password}`);
        leaderAccounts.push(data);
      }
      
    } catch (err) {
      console.error(`❌ Error processing leader for ${group.name}:`, err);
    }
  }
  
  return leaderAccounts;
}

async function promoteParentsToLeader1(parentAccounts) {
  console.log('⬆️ Promoting parents to Leader1 role...');
  
  const leader1Accounts = [];
  
  // Select some active parents to become Leader1 (parents who are also leaders)
  const candidateParents = parentAccounts.slice(0, 3); // Promote first 3 parents
  
  for (const parent of candidateParents) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          role: 'leader1',
          current_view_mode: 'parent', // Default view mode
          updated_at: new Date().toISOString()
        })
        .eq('id', parent.id)
        .select()
        .single();
        
      if (error) {
        console.error(`❌ Error promoting parent ${parent.email}:`, error);
      } else {
        console.log(`✅ Parent promoted to Leader1: ${parent.first_name} ${parent.last_name} (${parent.email})`);
        leader1Accounts.push(data);
      }
      
    } catch (err) {
      console.error(`❌ Error processing parent ${parent.email}:`, err);
    }
  }
  
  return leader1Accounts;
}

async function createExecutiveAccounts() {
  console.log('👔 Creating executive accounts...');
  
  const executiveAccounts = [];
  
  const executives = [
    {
      first_name: 'Sarah',
      last_name: 'Executive',
      username: 'sarah_executive',
      email: 'sarah.executive@msa-portal.com',
      role: 'executive'
    },
    {
      first_name: 'Ahmed',
      last_name: 'Director',
      username: 'ahmed_director', 
      email: 'ahmed.director@msa-portal.com',
      role: 'executive'
    }
  ];
  
  for (const exec of executives) {
    try {
      // Check if executive already exists
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('email', exec.email)
        .single();
        
      if (existing) {
        console.log(`✅ Executive already exists: ${exec.email}`);
        executiveAccounts.push(existing);
        continue;
      }
      
      const password = generatePassword();
      const hashedPassword = await bcrypt.hash(password, 12);
      
      const execData = {
        ...exec,
        phone: `+61 400 ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 900) + 100}`,
        created_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('users')
        .insert(execData)
        .select()
        .single();
        
      if (error) {
        console.error(`❌ Error creating executive ${exec.email}:`, error);
      } else {
        console.log(`✅ Executive created: ${exec.first_name} ${exec.last_name} (${exec.email})`);
        console.log(`   🔑 Password: ${password}`);
        executiveAccounts.push(data);
      }
      
    } catch (err) {
      console.error(`❌ Error processing executive ${exec.email}:`, err);
    }
  }
  
  return executiveAccounts;
}

async function assignLeadersToGroups(leaderAccounts, scoutGroups) {
  console.log('🔗 Assigning leaders to groups...');
  
  // Create a mapping between leaders and groups
  for (let i = 0; i < Math.min(leaderAccounts.length, scoutGroups.length); i++) {
    const leader = leaderAccounts[i];
    const group = scoutGroups[i];
    
    try {
      // Update the scout group to have this leader
      const { error } = await supabase
        .from('scout_groups')
        .update({
          leader_id: leader.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', group.id);
        
      if (error) {
        console.error(`❌ Error assigning leader to ${group.name}:`, error);
      } else {
        console.log(`✅ Assigned ${leader.first_name} ${leader.last_name} to lead ${group.name}`);
      }
      
    } catch (err) {
      console.error(`❌ Error processing assignment for ${group.name}:`, err);
    }
  }
}

// Execute leadership creation if run directly
if (require.main === module) {
  createLeadershipStructure()
    .then(() => {
      console.log('🎉 MSA Leadership Structure Complete!');
      console.log('\n📋 Next Steps:');
      console.log('   1. Test login with different user roles');
      console.log('   2. Verify group assignments work properly'); 
      console.log('   3. Test Leader1 toggle functionality');
      console.log('   4. Verify parent-scout relationships');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Leadership creation failed:', error);
      process.exit(1);
    });
}

module.exports = { createLeadershipStructure };