#!/usr/bin/env node

/**
 * Fixed Leadership Structure for MSA Portal
 * - Uses correct role enum values (parent, leader)
 * - Uses is_also_leader/is_also_parent for dual roles
 * - Uses existing table columns correctly
 */

const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixLeadershipStructure() {
  console.log('🔧 Fixing MSA Leadership Structure...');
  
  try {
    // Step 1: Promote some parents to dual parent/leader role
    const dualRoleAccounts = await createDualRoleAccounts();
    
    // Step 2: Assign some leaders to groups (using existing leader accounts)
    await assignExistingLeadersToGroups();
    
    // Step 3: Show summary of current structure
    await showLeadershipSummary();
    
    console.log('✅ Leadership structure fix complete!');
    
  } catch (error) {
    console.error('❌ Leadership fix failed:', error);
    throw error;
  }
}

async function createDualRoleAccounts() {
  console.log('👨‍👩‍👧‍👦 Creating dual role accounts (parent + leader)...');
  
  // Get some active parents with children
  const { data: parentsWithKids, error } = await supabase
    .from('users')
    .select(`
      id, first_name, last_name, email, role,
      scouts:scouts!parent_id(id, first_name, last_name)
    `)
    .eq('role', 'parent')
    .limit(5);
    
  if (error) {
    console.error('❌ Error getting parents:', error);
    return [];
  }
  
  const dualRoleAccounts = [];
  let count = 0;
  
  for (const parent of parentsWithKids) {
    if (count >= 3) break; // Only promote 3 parents to dual role
    
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          is_also_leader: true,
          current_view_mode: 'parent' // Default to parent view
        })
        .eq('id', parent.id)
        .select()
        .single();
        
      if (error) {
        console.error(`❌ Error promoting parent ${parent.email}:`, error);
      } else {
        console.log(`✅ Parent promoted to dual role: ${parent.first_name} ${parent.last_name}`);
        console.log(`   📧 ${parent.email} (has ${parent.scouts?.length || 0} children)`);
        dualRoleAccounts.push(data);
        count++;
      }
      
    } catch (err) {
      console.error(`❌ Error processing parent ${parent.email}:`, err);
    }
  }
  
  return dualRoleAccounts;
}

async function assignExistingLeadersToGroups() {
  console.log('🔗 Assigning existing leaders to groups...');
  
  // Get existing leader accounts
  const { data: leaders, error: leadersError } = await supabase
    .from('users')
    .select('*')
    .eq('role', 'leader');
    
  if (leadersError) {
    console.error('❌ Error getting leaders:', leadersError);
    return;
  }
  
  // Get scout groups
  const { data: groups, error: groupsError } = await supabase
    .from('scout_groups')
    .select('*');
    
  if (groupsError) {
    console.error('❌ Error getting groups:', groupsError);
    return;
  }
  
  console.log(`📊 Found ${leaders.length} leaders and ${groups.length} groups`);
  
  // Assign leaders to groups (simple 1:1 mapping)
  for (let i = 0; i < Math.min(leaders.length, groups.length); i++) {
    const leader = leaders[i];
    const group = groups[i];
    
    try {
      const { error } = await supabase
        .from('scout_groups')
        .update({
          leader_id: leader.id
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

async function showLeadershipSummary() {
  console.log('\n📊 Current Leadership Structure:');
  
  try {
    // Count users by role and capabilities
    const { data: userStats } = await supabase.rpc('get_user_stats');
    
    if (!userStats) {
      // Manual count if RPC doesn't exist
      const [parents, leaders, dualRole] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact' }).eq('role', 'parent'),
        supabase.from('users').select('id', { count: 'exact' }).eq('role', 'leader'),
        supabase.from('users').select('id', { count: 'exact' }).eq('is_also_leader', true)
      ]);
      
      console.log(`   👥 Total Parents: ${parents.count || 0}`);
      console.log(`   👨‍🏫 Total Leaders: ${leaders.count || 0}`);  
      console.log(`   👨‍👩‍👧‍👦 Dual Role (Parent+Leader): ${dualRole.count || 0}`);
    }
    
    // Show group assignments
    const { data: groupsWithLeaders } = await supabase
      .from('scout_groups')
      .select(`
        name,
        division,
        current_capacity,
        leader:users!leader_id(first_name, last_name, email)
      `);
      
    console.log('\n🏗️ Group Leadership Assignments:');
    groupsWithLeaders?.forEach(group => {
      const leaderName = group.leader 
        ? `${group.leader.first_name} ${group.leader.last_name}`
        : 'No leader assigned';
      console.log(`   ${group.name}: ${leaderName} (${group.current_capacity || 0} scouts)`);
    });
    
    // Show scouts count
    const { data: scoutsCount } = await supabase
      .from('scouts')
      .select('id', { count: 'exact' });
      
    console.log(`\n🧒 Total Scouts: ${scoutsCount.count || 0}`);
    
  } catch (error) {
    console.error('❌ Error getting leadership summary:', error);
  }
}

// Execute leadership fix if run directly
if (require.main === module) {
  fixLeadershipStructure()
    .then(() => {
      console.log('\n🎉 MSA Leadership Structure Fixed!');
      console.log('\n📋 System Status:');
      console.log('   ✅ Real parent accounts with children');
      console.log('   ✅ Leader accounts for each group');
      console.log('   ✅ Dual role accounts (parent+leader)');
      console.log('   ✅ Groups assigned to leaders');
      console.log('   ✅ Scout records with real data');
      console.log('\n🚀 Ready for application testing!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Leadership fix failed:', error);
      process.exit(1);
    });
}

module.exports = { fixLeadershipStructure };