const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://munqzgxhluteurttlydq.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11bnF6Z3hobHV0ZXVydHRseWRxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzg4OTI3MSwiZXhwIjoyMDYzNDY1MjcxfQ.qsEXF-9rtg1z4FAiJHVqjn7WiP_N6G3ObjjuHy5dPho';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// List of 27 leaders who are also parents (from previous analysis)
const leadersWhoAreParents = [
  { email: 'abir@msaportal.com', name: 'Abir', scouts: ['Muhammad Ali Hammoud'] },
  { email: 'ali.abbas@msaportal.com', name: 'Ali Abbas', scouts: ['Mohammed Kdouh'] },
  { email: 'ali.chour@msaportal.com', name: 'Ali Chour', scouts: ['Mohammed Kdouh'] },
  { email: 'ali.makki@msaportal.com', name: 'Ali Makki', scouts: ['Mohammed Kdouh'] },
  { email: 'aminah.reslan@msaportal.com', name: 'Aminah Reslan', scouts: ['Hadi Reslan'] },
  { email: 'batoul.rabii@msaportal.com', name: 'Batoul Rabii', scouts: ['Abbas Rammal'] },
  { email: 'fatima.g@msaportal.com', name: 'Fatima G', scouts: ['Maryam Mouhanna'] },
  { email: 'fatima.issa@msaportal.com', name: 'Fatima Issa', scouts: ['Sami Missilmani'] },
  { email: 'fay.jaafar@msaportal.com', name: 'Fay Jaafar', scouts: ['Hussa Nasour'] },
  { email: 'ghadeer.haidar@msaportal.com', name: 'Ghadeer Haidar', scouts: ['Idris Haidar'] },
  { email: 'ghofran@msaportal.com', name: 'Ghofran', scouts: ['Muhammad Ali Hammoud'] },
  { email: 'haidar.alawie@msaportal.com', name: 'Haidar Alawie', scouts: ['Idris Haidar'] },
  { email: 'hassan.hijazi@msaportal.com', name: 'Hassan Hijazi', scouts: ['Sahara Hamka', 'Ali Hamka'] },
  { email: 'hassan.sleiman@msaportal.com', name: 'Hassan Sleiman', scouts: ['Sahara Hamka', 'Ali Hamka'] },
  { email: 'hussein.ma@msaportal.com', name: 'Hussein M.A', scouts: ['Muhammad Ali Hammoud'] },
  { email: 'hussein.ramadan@msaportal.com', name: 'Hussein Ramadan', scouts: ['Zainab Ramadan'] },
  { email: 'jana.boussi@msaportal.com', name: 'Jana Boussi', scouts: ['Malak Boussi'] },
  { email: 'ma.droubi@msaportal.com', name: 'M.A Droubi', scouts: ['Muhammad Ali Hammoud'] },
  { email: 'mariam.droubi@msaportal.com', name: 'Mariam Droubi', scouts: ['Ali Chahine'] },
  { email: 'mohamad.ali.hijazi@msaportal.com', name: 'Mohamad Ali Hijazi', scouts: ['Hadi Hijazi'] },
  { email: 'mohamed.allouch@msaportal.com', name: 'Mohamed Allouch', scouts: ['Mahdi Allouch'] },
  { email: 'renee.reda@msaportal.com', name: 'Renee Reda', scouts: ['Mahdi Salim'] },
  { email: 'taha.dirani@msaportal.com', name: 'Taha Dirani', scouts: ['Ali Dirani'] },
  { email: 'zahraa.dirani@msaportal.com', name: 'Zahraa Dirani', scouts: ['Ali Dirani'] },
  { email: 'zeinab.sleiman@msaportal.com', name: 'Zeinab Sleiman', scouts: ['Maryam Krayani'] },
  { email: 'abbas.ramadan@msaportal.com', name: 'Abbas Ramadan', scouts: ['Zainab Ramadan'] },
  { email: 'hodah.ayache@msaportal.com', name: 'Hodah Ayache', scouts: ['Talia Nahle'] }
];

async function markLeadersWhoAreParents() {
  console.log('🏷️  Marking leaders who are also parents...\n');

  const results = {
    marked: [],
    errors: []
  };

  try {
    // Check if the users table has a field we can use to mark them
    // We'll use the phone field or create a note in an existing field
    
    for (const leaderParent of leadersWhoAreParents) {
      try {
        console.log(`Processing: ${leaderParent.name} (${leaderParent.email})`);
        console.log(`   Scouts: ${leaderParent.scouts.join(', ')}`);

        // For now, let's add a note to indicate they are both leader and parent
        // We could use a custom field or update an existing field
        
        // Option 1: Keep them as 'leader' role but add a note
        const { error: updateError } = await supabase
          .from('users')
          .update({ 
            phone: leaderParent.scouts.length > 1 ? 
              `LEADER+PARENT (${leaderParent.scouts.length} scouts)` : 
              `LEADER+PARENT (${leaderParent.scouts[0]})`
          })
          .eq('email', leaderParent.email);

        if (updateError) {
          throw updateError;
        }

        console.log(`   ✅ Marked as LEADER+PARENT\n`);

        results.marked.push({
          name: leaderParent.name,
          email: leaderParent.email,
          scouts: leaderParent.scouts
        });

      } catch (error) {
        console.error(`❌ Error updating ${leaderParent.email}:`, error.message);
        results.errors.push({
          email: leaderParent.email,
          error: error.message
        });
      }
    }

    // Summary
    console.log('📊 LEADER+PARENT MARKING SUMMARY');
    console.log('=================================');
    console.log(`✅ Successfully marked: ${results.marked.length}`);
    console.log(`❌ Errors: ${results.errors.length}`);

    if (results.marked.length > 0) {
      console.log('\n🎯 LEADERS WHO ARE ALSO PARENTS:');
      console.log('================================');
      
      // Group by number of scouts
      const singleScout = results.marked.filter(l => l.scouts.length === 1);
      const multipleScouts = results.marked.filter(l => l.scouts.length > 1);
      
      console.log(`\n👨‍👩‍👧 Leaders with 1 scout (${singleScout.length}):`);
      singleScout.forEach(leader => {
        console.log(`   ${leader.name} -> Parent of: ${leader.scouts[0]}`);
      });
      
      if (multipleScouts.length > 0) {
        console.log(`\n👨‍👩‍👧‍👦 Leaders with multiple scouts (${multipleScouts.length}):`);
        multipleScouts.forEach(leader => {
          console.log(`   ${leader.name} -> Parent of: ${leader.scouts.join(', ')}`);
        });
      }
    }

    if (results.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      results.errors.forEach(error => {
        console.log(`   ${error.email}: ${error.error}`);
      });
    }

    console.log('\n📋 SPECIAL STATUS SUMMARY:');
    console.log('===========================');
    console.log(`🏷️  Total leaders who are also parents: ${results.marked.length}`);
    console.log(`👨‍👧 These leaders have both leadership AND parental responsibilities`);
    console.log(`📝 Status marked in phone field: "LEADER+PARENT (scout name)"`);
    console.log(`🔑 They maintain "leader" role with special parent status noted`);

    console.log('\n🔐 LOGIN CREDENTIALS (unchanged):');
    console.log('Email: [existing leader email]');
    console.log('Password: leader123');
    console.log('Role: leader (with parent status noted)');

    return results;

  } catch (error) {
    console.error('💥 Fatal error:', error.message);
    throw error;
  }
}

// Run the script
if (require.main === module) {
  markLeadersWhoAreParents()
    .then((results) => {
      console.log('\n✨ Leader+Parent marking completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { markLeadersWhoAreParents };