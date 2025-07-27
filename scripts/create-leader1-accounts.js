const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://munqzgxhluteurttlydq.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11bnF6Z3hobHV0ZXVydHRseWRxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzg4OTI3MSwiZXhwIjoyMDYzNDY1MjcxfQ.qsEXF-9rtg1z4FAiJHVqjn7WiP_N6G3ObjjuHy5dPho';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createLeader1Accounts() {
  console.log('🔍 Finding leaders who are also parents...\n');

  try {
    // Get all users with leader role
    const { data: leaders, error: leadersError } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'leader');

    if (leadersError) throw leadersError;

    // Get all users with parent role
    const { data: parents, error: parentsError } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'parent');

    if (parentsError) throw parentsError;

    // Get all scouts to see who their parents are
    const { data: scouts, error: scoutsError } = await supabase
      .from('scouts')
      .select('*');

    if (scoutsError) throw scoutsError;

    console.log(`Found ${leaders.length} leaders, ${parents.length} parents, ${scouts.length} scouts\n`);

    // Find leaders who are also parents (by matching email addresses or names)
    const leadersWhoAreParents = [];

    for (const leader of leaders) {
      // Check if this leader's email or name matches any parent
      const matchingParent = parents.find(parent => 
        parent.email === leader.email ||
        (parent.first_name === leader.first_name && parent.last_name === leader.last_name) ||
        parent.email.toLowerCase().includes(leader.first_name?.toLowerCase()) ||
        parent.email.toLowerCase().includes(leader.last_name?.toLowerCase())
      );

      if (matchingParent) {
        // Check if this parent has scouts
        const parentScouts = scouts.filter(scout => scout.parent_id === matchingParent.id);
        
        if (parentScouts.length > 0) {
          leadersWhoAreParents.push({
            leader,
            parent: matchingParent,
            scouts: parentScouts,
            scoutCount: parentScouts.length
          });
        }
      }
    }

    console.log(`📋 LEADERS WHO ARE ALSO PARENTS (${leadersWhoAreParents.length} found):`);
    console.log('============================================\n');

    if (leadersWhoAreParents.length === 0) {
      console.log('❌ No leaders found who are also parents with scouts');
      
      // Let's try a different approach - check by similar names/emails
      console.log('\n🔍 Checking for potential matches by name similarity...\n');
      
      for (const leader of leaders) {
        const leaderName = `${leader.first_name || ''} ${leader.last_name || ''}`.trim();
        console.log(`Leader: ${leaderName} (${leader.email})`);
        
        // Find potential parent matches
        const potentialParents = parents.filter(parent => {
          const parentName = `${parent.first_name || ''} ${parent.last_name || ''}`.trim();
          return (
            leaderName.toLowerCase().includes(parent.first_name?.toLowerCase() || '') ||
            parentName.toLowerCase().includes(leader.first_name?.toLowerCase() || '') ||
            parent.email.toLowerCase().includes(leader.first_name?.toLowerCase() || '') ||
            leader.email.toLowerCase().includes(parent.first_name?.toLowerCase() || '')
          );
        });

        if (potentialParents.length > 0) {
          console.log(`   Potential parent matches:`);
          potentialParents.forEach(parent => {
            const parentName = `${parent.first_name || ''} ${parent.last_name || ''}`.trim();
            const parentScouts = scouts.filter(scout => scout.parent_id === parent.id);
            console.log(`   - ${parentName} (${parent.email}) - ${parentScouts.length} scouts`);
          });
        }
        console.log('');
      }
      
      return { created: [], errors: [] };
    }

    const results = {
      created: [],
      errors: []
    };

    // Create LEADER1 accounts for leaders who are parents
    for (const leaderParent of leadersWhoAreParents) {
      try {
        const leaderName = `${leaderParent.leader.first_name || ''} ${leaderParent.leader.last_name || ''}`.trim();
        const parentName = `${leaderParent.parent.first_name || ''} ${leaderParent.parent.last_name || ''}`.trim();
        
        console.log(`👥 ${leaderName} (Leader) = ${parentName} (Parent)`);
        console.log(`   Leader Email: ${leaderParent.leader.email}`);
        console.log(`   Parent Email: ${leaderParent.parent.email}`);
        console.log(`   Number of Scouts: ${leaderParent.scoutCount}`);
        
        leaderParent.scouts.forEach(scout => {
          console.log(`   - Scout: ${scout.first_name} ${scout.last_name} (Age: ${scout.age})`);
        });

        // Update the leader account to LEADER1 role
        const { error: updateError } = await supabase
          .from('users')
          .update({ role: 'leader1' })
          .eq('id', leaderParent.leader.id);

        if (updateError) {
          throw updateError;
        }

        console.log(`   ✅ Updated to LEADER1 role\n`);

        results.created.push({
          name: leaderName,
          email: leaderParent.leader.email,
          scouts: leaderParent.scouts.map(s => `${s.first_name} ${s.last_name}`),
          scoutCount: leaderParent.scoutCount
        });

      } catch (error) {
        console.error(`❌ Error updating ${leaderParent.leader.email}:`, error.message);
        results.errors.push({
          email: leaderParent.leader.email,
          error: error.message
        });
      }
    }

    // Summary
    console.log('📊 LEADER1 CREATION SUMMARY');
    console.log('============================');
    console.log(`✅ Successfully created: ${results.created.length}`);
    console.log(`❌ Errors: ${results.errors.length}`);

    if (results.created.length > 0) {
      console.log('\n🎯 NEW LEADER1 ACCOUNTS:');
      results.created.forEach(leader => {
        console.log(`   ${leader.name} (${leader.email})`);
        console.log(`     Scouts: ${leader.scouts.join(', ')}`);
        console.log('');
      });
    }

    if (results.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      results.errors.forEach(error => {
        console.log(`   ${error.email}: ${error.error}`);
      });
    }

    console.log('\n🔐 LOGIN CREDENTIALS:');
    console.log('Email: [existing leader email]');
    console.log('Password: leader123');
    console.log('Role: leader1 (upgraded from leader)');

    return results;

  } catch (error) {
    console.error('💥 Fatal error:', error.message);
    throw error;
  }
}

// Run the script
if (require.main === module) {
  createLeader1Accounts()
    .then((results) => {
      console.log('\n✨ LEADER1 account creation completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { createLeader1Accounts };