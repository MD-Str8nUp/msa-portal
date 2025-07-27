#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function comprehensiveDbCheck() {
  console.log('🔍 COMPREHENSIVE SUPABASE DATABASE ANALYSIS');
  console.log('=' .repeat(60));
  
  try {
    // 1. Check what tables exist by trying to query common ones
    const tables = ['users', 'profiles', 'groups', 'scouts', 'user_groups', 'messages', 'events', 'attendance'];
    const tableStatus = {};
    
    console.log('\n📋 1. TABLE EXISTENCE CHECK');
    console.log('-'.repeat(40));
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (error) {
          tableStatus[table] = { exists: false, error: error.message };
          console.log(`❌ ${table}: ${error.message}`);
        } else {
          tableStatus[table] = { 
            exists: true, 
            hasData: data && data.length > 0,
            sampleColumns: data && data[0] ? Object.keys(data[0]) : []
          };
          console.log(`✅ ${table}: EXISTS ${data && data.length > 0 ? `(${data.length} sample row)` : '(empty)'}`);
        }
      } catch (e) {
        tableStatus[table] = { exists: false, error: e.message };
        console.log(`❌ ${table}: ${e.message}`);
      }
    }
    
    // 2. Analyze existing tables in detail
    console.log('\n📊 2. TABLE STRUCTURE ANALYSIS');
    console.log('-'.repeat(40));
    
    // Users table analysis
    if (tableStatus.users?.exists) {
      console.log('\n👥 USERS TABLE:');
      const { data: users } = await supabase.from('users').select('*').limit(3);
      if (users && users[0]) {
        console.log('   Columns:', Object.keys(users[0]).join(', '));
        console.log('   Sample data:');
        users.forEach((user, i) => {
          console.log(`     ${i+1}. ${user.email} (${user.role}) - ${user.first_name} ${user.last_name}`);
        });
      }
      
      // Get role distribution
      const { data: roleData } = await supabase.from('users').select('role');
      const roleCounts = {};
      roleData?.forEach(item => {
        roleCounts[item.role] = (roleCounts[item.role] || 0) + 1;
      });
      console.log('   Role distribution:', roleCounts);
    }
    
    // Profiles table analysis
    if (tableStatus.profiles?.exists) {
      console.log('\n👤 PROFILES TABLE:');
      const { data: profiles } = await supabase.from('profiles').select('*').limit(3);
      if (profiles && profiles[0]) {
        console.log('   Columns:', Object.keys(profiles[0]).join(', '));
        console.log('   Sample data:');
        profiles.forEach((profile, i) => {
          console.log(`     ${i+1}. ${profile.email} (${profile.role}) - ${profile.name}`);
        });
      }
      
      // Get role distribution from profiles
      const { data: profileRoleData } = await supabase.from('profiles').select('role');
      const profileRoleCounts = {};
      profileRoleData?.forEach(item => {
        profileRoleCounts[item.role] = (profileRoleCounts[item.role] || 0) + 1;
      });
      console.log('   Role distribution:', profileRoleCounts);
      
      // Count total profiles
      const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      console.log(`   Total profiles: ${count}`);
    }
    
    // Groups table analysis
    if (tableStatus.groups?.exists) {
      console.log('\n🏕️ GROUPS TABLE:');
      const { data: groups } = await supabase.from('groups').select('*');
      if (groups && groups[0]) {
        console.log('   Columns:', Object.keys(groups[0]).join(', '));
        console.log(`   Total groups: ${groups.length}`);
        console.log('   All groups:');
        groups.forEach((group, i) => {
          console.log(`     ${i+1}. ${group.name} - ${group.description} (Leader: ${group.leader_id || 'none'})`);
        });
      }
    }
    
    // Scouts table analysis
    if (tableStatus.scouts?.exists) {
      console.log('\n🧑‍🤝‍🧑 SCOUTS TABLE:');
      const { data: scouts } = await supabase.from('scouts').select('*').limit(5);
      if (scouts && scouts[0]) {
        console.log('   Columns:', Object.keys(scouts[0]).join(', '));
        console.log('   Sample data:');
        scouts.forEach((scout, i) => {
          console.log(`     ${i+1}. ${scout.first_name} ${scout.last_name} (Group: ${scout.group_id})`);
        });
      }
      
      // Count total scouts
      const { count } = await supabase.from('scouts').select('*', { count: 'exact', head: true });
      console.log(`   Total scouts: ${count}`);
    }
    
    // 3. Check authentication table
    console.log('\n🔐 3. AUTHENTICATION ANALYSIS');
    console.log('-'.repeat(40));
    
    try {
      // Check auth.users (this might not be directly accessible)
      const { data: authUsers, error } = await supabase.auth.admin.listUsers();
      if (authUsers && authUsers.users) {
        console.log(`✅ Found ${authUsers.users.length} users in auth.users`);
        console.log('   Sample auth users:');
        authUsers.users.slice(0, 3).forEach((user, i) => {
          console.log(`     ${i+1}. ${user.email} (ID: ${user.id.substring(0, 8)}...)`);
        });
      }
    } catch (authError) {
      console.log('❌ Could not access auth.users:', authError.message);
    }
    
    // 4. Relationship Analysis
    console.log('\n🔗 4. RELATIONSHIP ANALYSIS');
    console.log('-'.repeat(40));
    
    if (tableStatus.user_groups?.exists) {
      const { data: userGroups } = await supabase.from('user_groups').select('*').limit(5);
      console.log(`✅ user_groups table has ${userGroups?.length || 0} sample relationships`);
    } else {
      console.log('❌ user_groups table missing - leaders cannot be assigned to groups');
    }
    
    // Check leader assignments in groups
    if (tableStatus.groups?.exists) {
      const { data: assignedGroups } = await supabase
        .from('groups')
        .select('*')
        .not('leader_id', 'is', null);
      console.log(`📊 Groups with assigned leaders: ${assignedGroups?.length || 0}`);
    }
    
    // 5. Summary and Recommendations
    console.log('\n📝 5. SUMMARY AND RECOMMENDATIONS');
    console.log('-'.repeat(40));
    
    const existingTables = Object.keys(tableStatus).filter(t => tableStatus[t].exists);
    const missingTables = Object.keys(tableStatus).filter(t => !tableStatus[t].exists);
    
    console.log(`✅ Existing tables (${existingTables.length}): ${existingTables.join(', ')}`);
    console.log(`❌ Missing tables (${missingTables.length}): ${missingTables.join(', ')}`);
    
    console.log('\n🚨 CRITICAL ISSUES FOUND:');
    if (missingTables.includes('user_groups')) {
      console.log('   - user_groups table missing: Cannot assign leaders to groups');
    }
    
    // Check if we have the expected structure for MSA
    const hasProperLeaderStructure = tableStatus.profiles?.exists && tableStatus.groups?.exists;
    if (hasProperLeaderStructure) {
      console.log('✅ Basic leader management structure exists (profiles + groups)');
    } else {
      console.log('❌ Missing basic leader management structure');
    }
    
    console.log('\n🎯 NEXT STEPS NEEDED:');
    if (missingTables.includes('user_groups')) {
      console.log('   1. Create user_groups table for leader-group assignments');
    }
    console.log('   2. Verify all 17 expected scout groups are present');
    console.log('   3. Create/verify all leader accounts with proper roles');
    console.log('   4. Establish leader-to-group assignments');
    
    return {
      tableStatus,
      existingTables,
      missingTables,
      summary: {
        totalTables: existingTables.length,
        criticalIssues: missingTables.length,
        hasLeaderStructure: hasProperLeaderStructure
      }
    };
    
  } catch (error) {
    console.error('❌ Comprehensive check failed:', error);
    return { error: error.message };
  }
}

if (require.main === module) {
  comprehensiveDbCheck()
    .then(() => console.log('\n✅ Database analysis complete!'))
    .catch(console.error);
}

module.exports = { comprehensiveDbCheck };