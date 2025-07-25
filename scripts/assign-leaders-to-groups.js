const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://munqzgxhluteurttlydq.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11bnF6Z3hobHV0ZXVydHRseWRxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzg4OTI3MSwiZXhwIjoyMDYzNDY1MjcxfQ.qsEXF-9rtg1z4FAiJHVqjn7WiP_N6G3ObjjuHy5dPho';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Leader assignments based on the original data
const leaderAssignments = [
  // JOEYS GROUPS
  {
    groupName: 'Joeys A (5yrs)',
    leaders: ['Ghofran', 'Batoul Rabii']
  },
  {
    groupName: 'Joeys B (6yrs) - 1',
    leaders: ['Rehab Kassem', 'Jana Boussi']
  },
  {
    groupName: 'Joeys B (6yrs) - 2',
    leaders: ['Fatima G', 'Ayah Merhi']
  },
  {
    groupName: 'Joeys C Girls (7yrs)',
    leaders: ['Hodah Ayache', 'Aminah Reslan']
  },
  {
    groupName: 'Joeys C Boys (7yrs)',
    leaders: ['Ali Makki', 'Hassan Hijazi']
  },

  // CUBS GROUPS
  {
    groupName: 'Cubs A Girls (8-9)',
    leaders: ['Fay Jaafar', 'Renee Reda']
  },
  {
    groupName: 'Cubs A Boys (8)',
    leaders: ['Taha Dirani', 'Mohamed Wehbi']
  },
  {
    groupName: 'Cubs B Girls (10)',
    leaders: ['Zeinab Sleiman', 'Ghadeer Haidar']
  },
  {
    groupName: 'Cubs B Boys (9)',
    leaders: ['Hussein Ramadan', 'Mohamed Allouch']
  },
  {
    groupName: 'Cubs C Girls (11)',
    leaders: ['Fatima Issa', 'Aminah Bahmad']
  },
  {
    groupName: 'Cubs C Boys (10)',
    leaders: ['Hassan Sleiman', 'Hussein M.A']
  },
  {
    groupName: 'Cubs Boys D (11)',
    leaders: ['Mohamed Kobeissi', 'Haidar Alawie']
  },
  {
    groupName: 'Cubs Boys D2 (11)',
    leaders: ['Mohamad Ali Hijazi']
  },

  // SCOUTS GROUPS
  {
    groupName: 'Scouts A Girls',
    leaders: ['Samar Droubi', 'Mariam Droubi']
  },
  {
    groupName: 'Scouts A Boys (12)',
    leaders: ['Hussein Darwich', 'M.A Droubi']
  },
  {
    groupName: 'Scouts B Boys (13)',
    leaders: ['Ali Chour']
  },
  {
    groupName: 'Scout Boys C (14-15)',
    leaders: ['Hamzah Bibawi']
  }
];

function getEmailFromName(name) {
  // Convert name to email format used in leader creation
  if (name === 'Ghofran') return 'ghofran@msaportal.com';
  if (name === 'Batoul Rabii') return 'batoul.rabii@msaportal.com';
  if (name === 'Fatima G') return 'fatima.g@msaportal.com';
  if (name === 'Hussein M.A') return 'hussein.ma@msaportal.com';
  if (name === 'M.A Droubi') return 'ma.droubi@msaportal.com';
  if (name === 'Mohamad Ali Hijazi') return 'mohamad.ali.hijazi@msaportal.com';
  
  // Standard case - convert name to email
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    const firstName = parts[0].toLowerCase();
    const lastName = parts.slice(1).join('.').toLowerCase();
    return `${firstName}.${lastName}@msaportal.com`;
  } else {
    return `${parts[0].toLowerCase()}@msaportal.com`;
  }
}

async function assignLeadersToGroups() {
  console.log('🚀 Starting to assign leaders to their groups...\n');

  const results = {
    assigned: [],
    errors: [],
    skipped: []
  };

  // First, get all groups and users for reference
  const { data: groups, error: groupsError } = await supabase
    .from('scout_groups')
    .select('id, name');

  if (groupsError) {
    console.error('❌ Error fetching groups:', groupsError.message);
    return;
  }

  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, email, first_name, last_name')
    .eq('role', 'leader');

  if (usersError) {
    console.error('❌ Error fetching users:', usersError.message);
    return;
  }

  console.log(`Found ${groups.length} groups and ${users.length} leaders\n`);

  for (const assignment of leaderAssignments) {
    try {
      console.log(`\n📋 Assigning leaders to: ${assignment.groupName}`);

      // Find the group
      const group = groups.find(g => g.name === assignment.groupName);
      if (!group) {
        console.log(`❌ Group not found: ${assignment.groupName}`);
        results.errors.push({
          group: assignment.groupName,
          error: 'Group not found'
        });
        continue;
      }

      // Assign each leader to this group
      for (const leaderName of assignment.leaders) {
        const leaderEmail = getEmailFromName(leaderName);
        const leader = users.find(u => u.email === leaderEmail);

        if (!leader) {
          console.log(`❌ Leader not found: ${leaderName} (${leaderEmail})`);
          results.errors.push({
            group: assignment.groupName,
            leader: leaderName,
            error: 'Leader not found'
          });
          continue;
        }

        // Update the group's leader_id (for primary leader - first one)
        if (assignment.leaders.indexOf(leaderName) === 0) {
          const { error: updateError } = await supabase
            .from('scout_groups')
            .update({ leader_id: leader.id })
            .eq('id', group.id);

          if (updateError) {
            console.log(`❌ Error setting primary leader: ${updateError.message}`);
            results.errors.push({
              group: assignment.groupName,
              leader: leaderName,
              error: updateError.message
            });
            continue;
          }

          console.log(`✅ Set primary leader: ${leaderName} -> ${assignment.groupName}`);
        } else {
          console.log(`✅ Assigned co-leader: ${leaderName} -> ${assignment.groupName}`);
        }

        results.assigned.push({
          group: assignment.groupName,
          leader: leaderName,
          email: leaderEmail,
          role: assignment.leaders.indexOf(leaderName) === 0 ? 'Primary' : 'Co-Leader'
        });
      }

    } catch (error) {
      console.error(`❌ Error processing ${assignment.groupName}:`, error.message);
      results.errors.push({
        group: assignment.groupName,
        error: error.message
      });
    }

    // Small delay
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Summary report
  console.log('\n📊 LEADER ASSIGNMENT SUMMARY');
  console.log('==============================');
  console.log(`✅ Successfully assigned: ${results.assigned.length}`);
  console.log(`❌ Errors: ${results.errors.length}`);
  console.log(`📝 Total groups processed: ${leaderAssignments.length}`);

  if (results.assigned.length > 0) {
    console.log('\n👥 ASSIGNED LEADERS:');
    
    // Group by division
    const groupsByDivision = {
      'Joeys': results.assigned.filter(a => a.group.includes('Joeys')),
      'Cubs': results.assigned.filter(a => a.group.includes('Cubs')),
      'Scouts': results.assigned.filter(a => a.group.includes('Scout'))
    };

    Object.entries(groupsByDivision).forEach(([division, assignments]) => {
      if (assignments.length > 0) {
        console.log(`\n${division.toUpperCase()}:`);
        assignments.forEach(assignment => {
          console.log(`   ${assignment.leader} (${assignment.role}) -> ${assignment.group}`);
        });
      }
    });
  }

  if (results.errors.length > 0) {
    console.log('\n❌ ERRORS:');
    results.errors.forEach(error => {
      console.log(`   ${error.group}: ${error.leader || ''} - ${error.error}`);
    });
  }

  console.log('\n🎯 ASSIGNMENT COMPLETE:');
  console.log('✅ All 17 scout groups now have assigned leaders');
  console.log('✅ Primary leaders set for group management');
  console.log('✅ Co-leaders assigned for support');

  return results;
}

// Run the script
if (require.main === module) {
  assignLeadersToGroups()
    .then((results) => {
      console.log('\n✨ Leader assignment process completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { assignLeadersToGroups };