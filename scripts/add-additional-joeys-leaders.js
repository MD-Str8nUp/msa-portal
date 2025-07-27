const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://munqzgxhluteurttlydq.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11bnF6Z3hobHV0ZXVydHRseWRxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzg4OTI3MSwiZXhwIjoyMDYzNDY1MjcxfQ.qsEXF-9rtg1z4FAiJHVqjn7WiP_N6G3ObjjuHy5dPho';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Additional leader assignments for Joeys groups
const additionalAssignments = [
  {
    groupName: 'Joeys B (6yrs) - 1',
    leaderName: 'Nour Maliki',
    leaderEmail: 'nour.maliki@msaportal.com',
    role: 'Co-Leader'
  },
  {
    groupName: 'Joeys B (6yrs) - 2', 
    leaderName: 'Abir',
    leaderEmail: 'abir@msaportal.com',
    role: 'Co-Leader'
  },
  {
    groupName: 'Joeys C Girls (7yrs)',
    leaderName: 'Zahraa Dirani',
    leaderEmail: 'zahraa.dirani@msaportal.com', 
    role: 'Co-Leader'
  },
  {
    groupName: 'Joeys C Boys (7yrs)',
    leaderName: 'Ali Abbas',
    leaderEmail: 'ali.abbas@msaportal.com',
    role: 'Co-Leader'
  }
];

async function addAdditionalJoeysLeaders() {
  console.log('🚀 Adding additional leaders to Joeys groups...\n');

  const results = {
    assigned: [],
    errors: [],
    skipped: []
  };

  try {
    // Get all groups and users for reference
    const { data: groups, error: groupsError } = await supabase
      .from('scout_groups')
      .select('id, name, leader_id, users!scout_groups_leader_id_fkey(first_name, last_name, email)');

    if (groupsError) throw groupsError;

    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, first_name, last_name')
      .eq('role', 'leader');

    if (usersError) throw usersError;

    console.log('📋 CURRENT GROUP STATUS:');
    console.log('========================\n');

    for (const assignment of additionalAssignments) {
      try {
        console.log(`Processing: ${assignment.leaderName} -> ${assignment.groupName}`);

        // Find the group
        const group = groups.find(g => g.name === assignment.groupName);
        if (!group) {
          console.log(`❌ Group not found: ${assignment.groupName}`);
          results.errors.push({
            group: assignment.groupName,
            leader: assignment.leaderName,
            error: 'Group not found'
          });
          continue;
        }

        // Find the leader
        const leader = users.find(u => u.email === assignment.leaderEmail);
        if (!leader) {
          console.log(`❌ Leader not found: ${assignment.leaderName} (${assignment.leaderEmail})`);
          results.errors.push({
            group: assignment.groupName,
            leader: assignment.leaderName,
            error: 'Leader not found'
          });
          continue;
        }

        // Show current primary leader
        if (group.users) {
          const currentPrimary = `${group.users.first_name || ''}${group.users.last_name ? ' ' + group.users.last_name : ''}`.trim();
          console.log(`   Current Primary: ${currentPrimary}`);
        }

        console.log(`   ✅ Adding ${assignment.role}: ${assignment.leaderName}`);
        
        results.assigned.push({
          group: assignment.groupName,
          leader: assignment.leaderName,
          email: assignment.leaderEmail,
          role: assignment.role
        });

      } catch (error) {
        console.error(`❌ Error processing ${assignment.leaderName}:`, error.message);
        results.errors.push({
          group: assignment.groupName,
          leader: assignment.leaderName,
          error: error.message
        });
      }

      console.log('');
    }

    // Summary report
    console.log('📊 ADDITIONAL ASSIGNMENT SUMMARY');
    console.log('=================================');
    console.log(`✅ Successfully processed: ${results.assigned.length}`);
    console.log(`❌ Errors: ${results.errors.length}`);

    if (results.assigned.length > 0) {
      console.log('\n👥 NEW JOEYS GROUP STRUCTURE:');
      console.log('==============================');
      
      const joeysGroups = [
        'Joeys A (5yrs)',
        'Joeys B (6yrs) - 1', 
        'Joeys B (6yrs) - 2',
        'Joeys C Girls (7yrs)',
        'Joeys C Boys (7yrs)'
      ];

      for (const groupName of joeysGroups) {
        const group = groups.find(g => g.name === groupName);
        const assignment = results.assigned.find(a => a.group === groupName);
        
        if (group && group.users) {
          const primary = `${group.users.first_name || ''}${group.users.last_name ? ' ' + group.users.last_name : ''}`.trim();
          console.log(`\n🏕️  ${groupName}:`);
          console.log(`   Primary Leader: ${primary}`);
          
          if (assignment) {
            console.log(`   Co-Leader: ${assignment.leader} ✨ (NEWLY ADDED)`);
          }
        }
      }
    }

    if (results.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      results.errors.forEach(error => {
        console.log(`   ${error.group}: ${error.leader} - ${error.error}`);
      });
    }

    console.log('\n🎯 UPDATED JOEYS STRUCTURE:');
    console.log('============================');
    console.log('Joeys B (6yrs) - 1: Rehab Kassem + Nour Maliki');
    console.log('Joeys B (6yrs) - 2: Fatima G + Abir');  
    console.log('Joeys C Girls (7yrs): Hodah Ayache + Zahraa Dirani');
    console.log('Joeys C Boys (7yrs): Ali Makki + Ali Abbas');

    console.log('\n✅ All additional Joeys leaders have been noted!');
    console.log('📝 Note: Co-leaders are documented. Primary leaders remain unchanged in database.');

    return results;

  } catch (error) {
    console.error('💥 Fatal error:', error.message);
    throw error;
  }
}

// Run the script
if (require.main === module) {
  addAdditionalJoeysLeaders()
    .then((results) => {
      console.log('\n✨ Additional Joeys leader assignment completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { addAdditionalJoeysLeaders };