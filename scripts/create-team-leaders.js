const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabaseUrl = 'https://munqzgxhluteurttlydq.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11bnF6Z3hobHV0ZXVydHRseWRxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzg4OTI3MSwiZXhwIjoyMDYzNDY1MjcxfQ.qsEXF-9rtg1z4FAiJHVqjn7WiP_N6G3ObjjuHy5dPho';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Team leaders who should have a higher role (could be LEADER1 or similar)
const teamLeaders = [
  {
    name: 'Hawraa El Husseini',
    email: 'hawraa.elhusseini@msaportal.com',
    firstName: 'Hawraa',
    lastName: 'El Husseini',
    cohort: 'Joeys'
  },
  {
    name: 'Abbas Ramadan',
    email: 'abbas.ramadan@msaportal.com', 
    firstName: 'Abbas',
    lastName: 'Ramadan',
    cohort: 'Cubs'
  },
  {
    name: 'Sayed Mohamed',
    email: 'sayed.mohamed@msaportal.com',
    firstName: 'Sayed', 
    lastName: 'Mohamed',
    cohort: 'Scouts'
  }
];

async function createTeamLeaders() {
  console.log('🚀 Creating team leaders...\n');

  const results = {
    created: [],
    updated: [],
    errors: []
  };

  for (const teamLeader of teamLeaders) {
    try {
      console.log(`Processing team leader: ${teamLeader.name}`);

      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id, email, role')
        .eq('email', teamLeader.email)
        .single();

      if (existingUser) {
        // Update existing user to ensure they have leader role
        const { error: updateError } = await supabase
          .from('users')
          .update({ 
            role: 'leader',
            first_name: teamLeader.firstName,
            last_name: teamLeader.lastName
          })
          .eq('id', existingUser.id);

        if (updateError) {
          throw updateError;
        }

        console.log(`✅ Updated existing: ${teamLeader.name} -> leader role`);
        results.updated.push({
          name: teamLeader.name,
          email: teamLeader.email,
          cohort: teamLeader.cohort
        });
      } else {
        // Create new user
        const hashedPassword = await bcrypt.hash('leader123', 10);

        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert([{
            email: teamLeader.email,
            username: teamLeader.email.split('@')[0],
            first_name: teamLeader.firstName,
            last_name: teamLeader.lastName,
            role: 'leader',
            password: hashedPassword,
            phone: null,
            status: 'ACTIVE'
          }])
          .select()
          .single();

        if (createError) {
          throw createError;
        }

        console.log(`✅ Created: ${teamLeader.name} (${teamLeader.email})`);
        results.created.push({
          name: teamLeader.name,
          email: teamLeader.email,
          cohort: teamLeader.cohort,
          id: newUser.id
        });
      }

    } catch (error) {
      console.error(`❌ Error processing ${teamLeader.name}:`, error.message);
      results.errors.push({
        name: teamLeader.name,
        error: error.message
      });
    }

    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n📊 TEAM LEADER CREATION SUMMARY');
  console.log('===============================');
  console.log(`✅ Created: ${results.created.length}`);
  console.log(`🔄 Updated: ${results.updated.length}`);
  console.log(`❌ Errors: ${results.errors.length}`);

  if (results.created.length > 0) {
    console.log('\n🆕 CREATED TEAM LEADERS:');
    results.created.forEach(leader => {
      console.log(`   ${leader.name} (${leader.cohort} Team Leader) -> ${leader.email}`);
    });
  }

  if (results.updated.length > 0) {
    console.log('\n🔄 UPDATED TEAM LEADERS:');
    results.updated.forEach(leader => {
      console.log(`   ${leader.name} (${leader.cohort} Team Leader) -> ${leader.email}`);
    });
  }

  if (results.errors.length > 0) {
    console.log('\n❌ ERRORS:');
    results.errors.forEach(error => {
      console.log(`   ${error.name}: ${error.error}`);
    });
  }

  console.log('\n🎯 TEAM LEADER STRUCTURE:');
  console.log('Joeys Team Leader: Hawraa El Husseini');
  console.log('Cubs Team Leader: Abbas Ramadan');  
  console.log('Scouts Team Leader: Sayed Mohamed');

  console.log('\n🔐 LOGIN CREDENTIALS:');
  console.log('Email: [firstname.lastname]@msaportal.com');
  console.log('Password: leader123');
  console.log('Role: leader');

  return results;
}

// Run the script
if (require.main === module) {
  createTeamLeaders()
    .then((results) => {
      console.log('\n✨ Team leader creation completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { createTeamLeaders };