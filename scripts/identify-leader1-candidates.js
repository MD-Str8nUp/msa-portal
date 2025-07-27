#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function identifyLeader1Candidates() {
  console.log('🔍 Identifying potential LEADER1 candidates (leaders who are also parents)...\n');
  
  try {
    // Step 1: Get all leaders
    console.log('📋 Step 1: Getting all leaders...');
    const { data: leaders, error: leadersError } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'leader');
    
    if (leadersError) {
      console.error('❌ Error fetching leaders:', leadersError.message);
      return;
    }
    
    console.log(`📊 Found ${leaders.length} total leaders.`);
    
    // Step 2: Check leaders who are marked as also parents
    const leadersAlsoParents = leaders.filter(leader => leader.is_also_parent === true);
    console.log(`👥 Leaders marked as also parents: ${leadersAlsoParents.length}`);
    
    if (leadersAlsoParents.length > 0) {
      console.log('\\n✅ Leaders who are also parents:');
      leadersAlsoParents.forEach((leader, index) => {
        console.log(`${index + 1}. ${leader.first_name} ${leader.last_name} (${leader.email})`);
      });
    }
    
    // Step 3: Check scouts table to find leaders who have children
    console.log('\\n🔍 Step 2: Checking scouts table for parent relationships...');
    const { data: scouts, error: scoutsError } = await supabase
      .from('scouts')
      .select('parent_id, first_name, last_name');
    
    if (scoutsError) {
      console.log('⚠️  Could not access scouts table:', scoutsError.message);
    } else if (scouts && scouts.length > 0) {
      console.log(`📊 Found ${scouts.length} scouts in database.`);
      
      // Find leaders who are parents (have children in scouts table)
      const parentIds = [...new Set(scouts.map(scout => scout.parent_id))];
      const leaderParents = leaders.filter(leader => parentIds.includes(leader.id));
      
      console.log(`👨‍👩‍👧‍👦 Leaders who have children in scouts: ${leaderParents.length}`);
      
      if (leaderParents.length > 0) {
        console.log('\\n📋 Leader-Parents found via scouts table:');
        leaderParents.forEach((leader, index) => {
          const childrenCount = scouts.filter(scout => scout.parent_id === leader.id).length;
          console.log(`${index + 1}. ${leader.first_name} ${leader.last_name} (${leader.email}) - ${childrenCount} children`);
        });
      }
      
      // Combine both lists
      const allLeaderParentIds = new Set([
        ...leadersAlsoParents.map(l => l.id),
        ...leaderParents.map(l => l.id)
      ]);
      
      const uniqueLeaderParents = leaders.filter(leader => allLeaderParentIds.has(leader.id));
      
      console.log(`\\n🎯 Total unique LEADER1 candidates: ${uniqueLeaderParents.length}`);
      
      if (uniqueLeaderParents.length > 0) {
        console.log('\\n👤 Complete LEADER1 candidate list:');
        uniqueLeaderParents.forEach((leader, index) => {
          const childrenCount = scouts.filter(scout => scout.parent_id === leader.id).length;
          const isMarkedParent = leader.is_also_parent ? '✓' : '○';
          console.log(`${index + 1}. ${leader.first_name} ${leader.last_name}`);
          console.log(`   Email: ${leader.email}`);
          console.log(`   Marked as parent: ${isMarkedParent}`);
          console.log(`   Children count: ${childrenCount}`);
          console.log('   ---');
        });
      }
    } else {
      console.log('📊 No scouts found in database.');
    }
    
    // Step 4: Create recommendation
    console.log('\\n📝 LEADER1 Creation Recommendation:');
    
    const totalCandidates = leadersAlsoParents.length + (scouts ? leaders.filter(leader => 
      scouts.some(scout => scout.parent_id === leader.id)
    ).length : 0);
    
    if (totalCandidates > 0) {
      console.log(`✅ Proceed with creating LEADER1 table and populating with ${totalCandidates} candidates.`);
      console.log('📋 Next steps:');
      console.log('   1. Run supabase/create-leader1-table.sql in Supabase');
      console.log('   2. Run scripts/setup-leader1-system.js to populate the table');
    } else {
      console.log('⚠️  No clear LEADER1 candidates found.');
      console.log('📋 Options:');
      console.log('   1. Create dedicated LEADER1 users manually');
      console.log('   2. Promote some existing leaders to LEADER1 status');
      console.log('   3. Update user records to mark leaders as parents');
    }
    
  } catch (error) {
    console.error('❌ Identification failed:', error);
  }
}

identifyLeader1Candidates();