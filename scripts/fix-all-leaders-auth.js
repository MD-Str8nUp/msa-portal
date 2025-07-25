const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://munqzgxhluteurttlydq.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11bnF6Z3hobHV0ZXVydHRseWRxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzg4OTI3MSwiZXhwIjoyMDYzNDY1MjcxfQ.qsEXF-9rtg1z4FAiJHVqjn7WiP_N6G3ObjjuHy5dPho';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixAllLeadersAuth() {
  console.log('🔧 Fixing authentication for ALL leaders...\n');

  try {
    // Get all leaders
    const { data: leaders, error: leadersError } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'leader');

    if (leadersError) throw leadersError;

    console.log(`Found ${leaders.length} leaders to fix authentication for\n`);

    const results = {
      created: [],
      updated: [],
      errors: []
    };

    for (const leader of leaders) {
      try {
        console.log(`Processing: ${leader.first_name} ${leader.last_name || ''} (${leader.email})`);

        // Create auth user for this leader
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email: leader.email,
          password: 'leader123',
          email_confirm: true,
          user_metadata: {
            role: 'leader',
            first_name: leader.first_name,
            last_name: leader.last_name
          }
        });

        if (authError) {
          if (authError.message.includes('already registered') || authError.message.includes('already exists')) {
            console.log('   ⚠️  Auth user already exists - skipping');
            results.updated.push({
              name: `${leader.first_name} ${leader.last_name || ''}`.trim(),
              email: leader.email
            });
          } else {
            throw authError;
          }
        } else {
          console.log('   ✅ Created auth user');
          results.created.push({
            name: `${leader.first_name} ${leader.last_name || ''}`.trim(),
            email: leader.email
          });
        }

      } catch (error) {
        console.error(`   ❌ Error: ${error.message}`);
        results.errors.push({
          email: leader.email,
          error: error.message
        });
      }
      
      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Summary
    console.log('\n📊 AUTHENTICATION FIX SUMMARY');
    console.log('==============================');
    console.log(`✅ Successfully created: ${results.created.length}`);
    console.log(`⚠️  Already existed: ${results.updated.length}`);
    console.log(`❌ Errors: ${results.errors.length}`);
    console.log(`📝 Total leaders: ${leaders.length}`);

    if (results.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      results.errors.forEach(error => {
        console.log(`   ${error.email}: ${error.error}`);
      });
    }

    console.log('\n🔐 ALL LEADERS CAN NOW LOG IN WITH:');
    console.log('Email: [their leader email]@msaportal.com');
    console.log('Password: leader123');

    // Now assign scouts to groups based on age
    console.log('\n👦👧 Now assigning scouts to groups...');
    await assignScoutsToGroups();

    return results;

  } catch (error) {
    console.error('💥 Fatal error:', error.message);
    throw error;
  }
}

async function assignScoutsToGroups() {
  console.log('\n🏕️  Assigning scouts to appropriate groups based on age...\n');

  try {
    // Get all scouts and groups
    const { data: scouts, error: scoutsError } = await supabase
      .from('scouts')
      .select('*');

    const { data: groups, error: groupsError } = await supabase
      .from('scout_groups')
      .select('*')
      .order('division');

    if (scoutsError || groupsError) {
      throw new Error('Failed to fetch scouts or groups');
    }

    console.log(`Found ${scouts.length} scouts and ${groups.length} groups\n`);

    const assignments = {
      assigned: [],
      errors: []
    };

    // Group assignment logic based on age and gender
    for (const scout of scouts) {
      try {
        let targetGroup = null;

        // Determine appropriate group based on age
        if (scout.age >= 5 && scout.age <= 7) {
          // Joeys - ages 5-7
          const joeysGroups = groups.filter(g => g.division === 'Joeys');
          if (scout.age === 5) {
            targetGroup = joeysGroups.find(g => g.name.includes('A (5yrs)'));
          } else if (scout.age === 6) {
            // Distribute between B1 and B2
            const b1Group = joeysGroups.find(g => g.name.includes('B (6yrs) - 1'));
            const b2Group = joeysGroups.find(g => g.name.includes('B (6yrs) - 2'));
            targetGroup = Math.random() > 0.5 ? b1Group : b2Group;
          } else if (scout.age === 7) {
            // Assign based on gender if available
            if (scout.gender === 'Female' || scout.gender === 'female') {
              targetGroup = joeysGroups.find(g => g.name.includes('C Girls (7yrs)'));
            } else if (scout.gender === 'Male' || scout.gender === 'male') {
              targetGroup = joeysGroups.find(g => g.name.includes('C Boys (7yrs)'));
            } else {
              // Random assignment if no gender specified
              const cGroups = joeysGroups.filter(g => g.name.includes('C') && g.name.includes('(7yrs)'));
              targetGroup = cGroups[Math.floor(Math.random() * cGroups.length)];
            }
          }
        } else if (scout.age >= 8 && scout.age <= 11) {
          // Cubs - ages 8-11
          const cubsGroups = groups.filter(g => g.division === 'Cubs');
          
          if (scout.age === 8) {
            targetGroup = scout.gender === 'Female' || scout.gender === 'female' 
              ? cubsGroups.find(g => g.name.includes('A Girls (8-9)'))
              : cubsGroups.find(g => g.name.includes('A Boys (8)'));
          } else if (scout.age === 9) {
            targetGroup = scout.gender === 'Female' || scout.gender === 'female'
              ? cubsGroups.find(g => g.name.includes('A Girls (8-9)'))
              : cubsGroups.find(g => g.name.includes('B Boys (9)'));
          } else if (scout.age === 10) {
            targetGroup = scout.gender === 'Female' || scout.gender === 'female'
              ? cubsGroups.find(g => g.name.includes('B Girls (10)'))
              : cubsGroups.find(g => g.name.includes('C Boys (10)'));
          } else if (scout.age === 11) {
            targetGroup = scout.gender === 'Female' || scout.gender === 'female'
              ? cubsGroups.find(g => g.name.includes('C Girls (11)'))
              : (Math.random() > 0.5 
                  ? cubsGroups.find(g => g.name.includes('Boys D (11)'))
                  : cubsGroups.find(g => g.name.includes('Boys D2 (11)')));
          }
        } else if (scout.age >= 12 && scout.age <= 15) {
          // Scouts - ages 12-15
          const scoutsGroups = groups.filter(g => g.division === 'Scouts');
          
          if (scout.gender === 'Female' || scout.gender === 'female') {
            targetGroup = scoutsGroups.find(g => g.name.includes('A Girls'));
          } else {
            if (scout.age === 12) {
              targetGroup = scoutsGroups.find(g => g.name.includes('A Boys (12)'));
            } else if (scout.age === 13) {
              targetGroup = scoutsGroups.find(g => g.name.includes('B Boys (13)'));
            } else if (scout.age >= 14) {
              targetGroup = scoutsGroups.find(g => g.name.includes('Boys C (14-15)'));
            }
          }
        }

        if (targetGroup) {
          // Assign scout to group
          const { error: assignError } = await supabase
            .from('scouts')
            .update({ group_id: targetGroup.id })
            .eq('id', scout.id);

          if (assignError) {
            throw assignError;
          }

          console.log(`✅ ${scout.first_name} ${scout.last_name} (Age ${scout.age}) -> ${targetGroup.name}`);
          assignments.assigned.push({
            scout: `${scout.first_name} ${scout.last_name}`,
            age: scout.age,
            group: targetGroup.name
          });
        } else {
          console.log(`⚠️  No suitable group found for ${scout.first_name} ${scout.last_name} (Age ${scout.age})`);
        }

      } catch (error) {
        console.error(`❌ Error assigning ${scout.first_name} ${scout.last_name}:`, error.message);
        assignments.errors.push({
          scout: `${scout.first_name} ${scout.last_name}`,
          error: error.message
        });
      }
    }

    console.log('\n📊 SCOUT ASSIGNMENT SUMMARY');
    console.log('============================');
    console.log(`✅ Successfully assigned: ${assignments.assigned.length}`);
    console.log(`❌ Errors: ${assignments.errors.length}`);

    // Show distribution by group
    const groupCounts = {};
    assignments.assigned.forEach(assignment => {
      groupCounts[assignment.group] = (groupCounts[assignment.group] || 0) + 1;
    });

    console.log('\n📈 SCOUTS PER GROUP:');
    Object.entries(groupCounts).forEach(([group, count]) => {
      console.log(`   ${group}: ${count} scouts`);
    });

  } catch (error) {
    console.error('💥 Error assigning scouts:', error.message);
  }
}

// Run the script
if (require.main === module) {
  fixAllLeadersAuth()
    .then(() => {
      console.log('\n✨ Complete leader authentication and scout assignment completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { fixAllLeadersAuth };