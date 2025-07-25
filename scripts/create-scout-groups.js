const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://munqzgxhluteurttlydq.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11bnF6Z3hobHV0ZXVydHRseWRxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzg4OTI3MSwiZXhwIjoyMDYzNDY1MjcxfQ.qsEXF-9rtg1z4FAiJHVqjn7WiP_N6G3ObjjuHy5dPho';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Define the 17 scout groups with their details
const scoutGroups = [
  // JOEYS GROUPS (5 total)
  {
    name: 'Joeys A (5yrs)',
    division: 'Joeys',
    age_min: 5,
    age_max: 5,
    meeting_day: 'Saturday',
    meeting_time: '10:00 AM',
    capacity: 18,
    gender: null // Mixed
  },
  {
    name: 'Joeys B (6yrs) - 1',
    division: 'Joeys',
    age_min: 6,
    age_max: 6,
    meeting_day: 'Saturday',
    meeting_time: '10:00 AM',
    capacity: 18,
    gender: null // Mixed
  },
  {
    name: 'Joeys B (6yrs) - 2',
    division: 'Joeys',
    age_min: 6,
    age_max: 6,
    meeting_day: 'Saturday',
    meeting_time: '11:00 AM',
    capacity: 18,
    gender: null // Mixed
  },
  {
    name: 'Joeys C Girls (7yrs)',
    division: 'Joeys',
    age_min: 7,
    age_max: 7,
    meeting_day: 'Saturday',
    meeting_time: '10:00 AM',
    capacity: 18,
    gender: 'Female'
  },
  {
    name: 'Joeys C Boys (7yrs)',
    division: 'Joeys',
    age_min: 7,
    age_max: 7,
    meeting_day: 'Saturday',
    meeting_time: '11:00 AM',
    capacity: 18,
    gender: 'Male'
  },
  
  // CUBS GROUPS (8 total)
  {
    name: 'Cubs A Girls (8-9)',
    division: 'Cubs',
    age_min: 8,
    age_max: 9,
    meeting_day: 'Saturday',
    meeting_time: '10:00 AM',
    capacity: 18,
    gender: 'Female'
  },
  {
    name: 'Cubs A Boys (8)',
    division: 'Cubs',
    age_min: 8,
    age_max: 8,
    meeting_day: 'Saturday',
    meeting_time: '11:00 AM',
    capacity: 18,
    gender: 'Male'
  },
  {
    name: 'Cubs B Girls (10)',
    division: 'Cubs',
    age_min: 10,
    age_max: 10,
    meeting_day: 'Saturday',
    meeting_time: '10:00 AM',
    capacity: 18,
    gender: 'Female'
  },
  {
    name: 'Cubs B Boys (9)',
    division: 'Cubs',
    age_min: 9,
    age_max: 9,
    meeting_day: 'Saturday',
    meeting_time: '11:00 AM',
    capacity: 18,
    gender: 'Male'
  },
  {
    name: 'Cubs C Girls (11)',
    division: 'Cubs',
    age_min: 11,
    age_max: 11,
    meeting_day: 'Saturday',
    meeting_time: '10:00 AM',
    capacity: 18,
    gender: 'Female'
  },
  {
    name: 'Cubs C Boys (10)',
    division: 'Cubs',
    age_min: 10,
    age_max: 10,
    meeting_day: 'Saturday',
    meeting_time: '11:00 AM',
    capacity: 18,
    gender: 'Male'
  },
  {
    name: 'Cubs Boys D (11)',
    division: 'Cubs',
    age_min: 11,
    age_max: 11,
    meeting_day: 'Saturday',
    meeting_time: '12:00 PM',
    capacity: 18,
    gender: 'Male'
  },
  {
    name: 'Cubs Boys D2 (11)',
    division: 'Cubs',
    age_min: 11,
    age_max: 11,
    meeting_day: 'Saturday',
    meeting_time: '1:00 PM',
    capacity: 18,
    gender: 'Male'
  },
  
  // SCOUTS GROUPS (4 total)
  {
    name: 'Scouts A Girls',
    division: 'Scouts',
    age_min: 12,
    age_max: 15,
    meeting_day: 'Saturday',
    meeting_time: '10:00 AM',
    capacity: 18,
    gender: 'Female'
  },
  {
    name: 'Scouts A Boys (12)',
    division: 'Scouts',
    age_min: 12,
    age_max: 12,
    meeting_day: 'Saturday',
    meeting_time: '11:00 AM',
    capacity: 18,
    gender: 'Male'
  },
  {
    name: 'Scouts B Boys (13)',
    division: 'Scouts',
    age_min: 13,
    age_max: 13,
    meeting_day: 'Saturday',
    meeting_time: '12:00 PM',
    capacity: 18,
    gender: 'Male'
  },
  {
    name: 'Scout Boys C (14-15)',
    division: 'Scouts',
    age_min: 14,
    age_max: 15,
    meeting_day: 'Saturday',
    meeting_time: '1:00 PM',
    capacity: 18,
    gender: 'Male'
  }
];

async function createScoutGroups() {
  console.log('🚀 Starting to create 17 scout groups...\n');

  const results = {
    created: [],
    errors: [],
    skipped: []
  };

  for (const group of scoutGroups) {
    try {
      console.log(`Creating group: ${group.name}`);

      // Check if group already exists
      const { data: existingGroup } = await supabase
        .from('scout_groups')
        .select('id, name')
        .eq('name', group.name)
        .single();

      if (existingGroup) {
        console.log(`⚠️  Group already exists: ${group.name}`);
        results.skipped.push({ name: group.name, reason: 'Already exists' });
        continue;
      }

      // Create the scout group
      const { data: newGroup, error } = await supabase
        .from('scout_groups')
        .insert([{
          name: group.name,
          division: group.division,
          meeting_day: group.meeting_day,
          meeting_time: group.meeting_time,
          max_capacity: group.capacity,
          current_capacity: 0
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      console.log(`✅ Created: ${group.name} (ID: ${newGroup.id})`);
      results.created.push({
        name: group.name,
        id: newGroup.id,
        division: group.division,
        ages: `${group.age_min}-${group.age_max}`,
        gender: group.gender || 'Mixed'
      });

    } catch (error) {
      console.error(`❌ Error creating ${group.name}:`, error.message);
      results.errors.push({
        name: group.name,
        error: error.message
      });
    }

    // Small delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Summary report
  console.log('\n📊 SCOUT GROUPS CREATION SUMMARY');
  console.log('=================================');
  console.log(`✅ Successfully created: ${results.created.length}`);
  console.log(`⚠️  Skipped (already exist): ${results.skipped.length}`);
  console.log(`❌ Errors: ${results.errors.length}`);
  console.log(`📝 Total processed: ${scoutGroups.length} (17 groups)`);

  if (results.created.length > 0) {
    console.log('\n🏕️ CREATED GROUPS:');
    console.log('JOEYS:');
    results.created.filter(g => g.division === 'Joeys').forEach(group => {
      console.log(`   ${group.name} (Ages ${group.ages}, ${group.gender})`);
    });
    console.log('CUBS:');
    results.created.filter(g => g.division === 'Cubs').forEach(group => {
      console.log(`   ${group.name} (Ages ${group.ages}, ${group.gender})`);
    });
    console.log('SCOUTS:');
    results.created.filter(g => g.division === 'Scouts').forEach(group => {
      console.log(`   ${group.name} (Ages ${group.ages}, ${group.gender})`);
    });
  }

  if (results.errors.length > 0) {
    console.log('\n❌ ERRORS:');
    results.errors.forEach(error => {
      console.log(`   ${error.name}: ${error.error}`);
    });
  }

  console.log('\n📍 MEETING DETAILS:');
  console.log('Location: MSA Community Hall');
  console.log('Days: Saturdays');
  console.log('Times: 10:00 AM - 1:00 PM (staggered)');
  console.log('Capacity: 18 members per group');

  return results;
}

// Run the script
if (require.main === module) {
  createScoutGroups()
    .then((results) => {
      console.log('\n✨ Scout groups creation process completed!');
      if (results.created.length > 0) {
        console.log(`🎯 Ready for leader assignments to ${results.created.length} groups`);
      }
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { createScoutGroups };