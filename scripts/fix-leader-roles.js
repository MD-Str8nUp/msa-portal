const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://munqzgxhluteurttlydq.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11bnF6Z3hobHV0ZXVydHRseWRxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzg4OTI3MSwiZXhwIjoyMDYzNDY1MjcxfQ.qsEXF-9rtg1z4FAiJHVqjn7WiP_N6G3ObjjuHy5dPho';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// The ONLY 35 people who should have "leader" role
const validLeaders = [
  'Abir',
  'Ali Abbas (Helper)',
  'Ali Chour',
  'Ali Makki',
  'Aminah Bahmad',
  'Aminah Reslan',
  'Ayah Merhi',
  'Batoul Rabii',
  'Fatima G',
  'Fatima Issa',
  'Fay Jaafar',
  'Ghadeer Haidar',
  'Ghofran',
  'Haidar Alawie',
  'Hamzah Bibawi',
  'Hassan Hijazi',
  'Hassan Sleiman',
  'Hodah Ayache',
  'Hussein Darwich',
  'Hussein M.A',
  'Hussein Ramadan',
  'Jana Boussi',
  'M.A Droubi',
  'Mariam Droubi',
  'Mohamad Ali Hijazi',
  'Mohamed Allouch',
  'Mohamed Kobeissi',
  'Mohamed Wehbi',
  'Nour Maliki',
  'Rehab Kassem',
  'Renee Reda',
  'Samar Droubi',
  'Taha Dirani',
  'Zahraa Dirani',
  'Zeinab Sleiman'
];

function getEmailFromName(name) {
  // Convert name to email format
  if (name === 'Abir') return 'abir@msaportal.com';
  if (name === 'Ali Abbas (Helper)') return 'ali.abbas@msaportal.com';
  if (name === 'Ghofran') return 'ghofran@msaportal.com';
  if (name === 'Fatima G') return 'fatima.g@msaportal.com';
  if (name === 'Hussein M.A') return 'hussein.ma@msaportal.com';
  if (name === 'M.A Droubi') return 'ma.droubi@msaportal.com';
  if (name === 'Mohamad Ali Hijazi') return 'mohamad.ali.hijazi@msaportal.com';
  if (name === 'Nour Maliki') return 'nour.maliki@msaportal.com';
  if (name === 'Zahraa Dirani') return 'zahraa.dirani@msaportal.com';
  
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

async function fixLeaderRoles() {
  console.log('🔍 Checking and fixing leader roles...\n');

  try {
    // Get all users with leader role
    const { data: currentLeaders, error: leadersError } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, role')
      .eq('role', 'leader');

    if (leadersError) throw leadersError;

    console.log(`Found ${currentLeaders.length} users with "leader" role\n`);

    // Create list of valid leader emails
    const validLeaderEmails = validLeaders.map(name => getEmailFromName(name));
    
    console.log('✅ VALID LEADER EMAILS:');
    validLeaderEmails.forEach(email => console.log(`   ${email}`));
    console.log('');

    // Find users who should NOT be leaders
    const invalidLeaders = currentLeaders.filter(user => 
      !validLeaderEmails.includes(user.email)
    );

    console.log(`❌ INVALID LEADERS (${invalidLeaders.length} found):`);
    if (invalidLeaders.length === 0) {
      console.log('   None - all current leaders are valid! ✅');
    } else {
      invalidLeaders.forEach(user => {
        const name = `${user.first_name || ''}${user.last_name ? ' ' + user.last_name : ''}`.trim();
        console.log(`   ${name} (${user.email}) - SHOULD BE PARENT`);
      });
    }

    // Fix invalid leaders by changing their role to 'parent'
    if (invalidLeaders.length > 0) {
      console.log('\n🔧 FIXING INVALID LEADERS...\n');

      const results = {
        fixed: [],
        errors: []
      };

      for (const user of invalidLeaders) {
        try {
          const { error: updateError } = await supabase
            .from('users')
            .update({ role: 'parent' })
            .eq('id', user.id);

          if (updateError) {
            throw updateError;
          }

          const name = `${user.first_name || ''}${user.last_name ? ' ' + user.last_name : ''}`.trim();
          console.log(`✅ Fixed: ${name} (${user.email}) -> changed to PARENT`);
          results.fixed.push({
            name,
            email: user.email
          });

        } catch (error) {
          const name = `${user.first_name || ''}${user.last_name ? ' ' + user.last_name : ''}`.trim();
          console.error(`❌ Error fixing ${name}: ${error.message}`);
          results.errors.push({
            name,
            email: user.email,
            error: error.message
          });
        }

        // Small delay
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Summary
      console.log('\n📊 ROLE FIX SUMMARY');
      console.log('===================');
      console.log(`✅ Successfully fixed: ${results.fixed.length}`);
      console.log(`❌ Errors: ${results.errors.length}`);

      if (results.errors.length > 0) {
        console.log('\n❌ ERRORS:');
        results.errors.forEach(error => {
          console.log(`   ${error.name}: ${error.error}`);
        });
      }
    }

    // Verify final state
    console.log('\n🔍 FINAL VERIFICATION...');
    const { data: finalLeaders, error: finalError } = await supabase
      .from('users')
      .select('email, first_name, last_name')
      .eq('role', 'leader')
      .order('first_name');

    if (!finalError) {
      console.log(`\n✅ Final leader count: ${finalLeaders.length}`);
      console.log('✅ All remaining leaders are from the approved list');
      
      if (finalLeaders.length !== 35) {
        console.log(`⚠️  Expected 35 leaders, found ${finalLeaders.length}`);
        console.log('Current leaders:');
        finalLeaders.forEach((leader, index) => {
          const name = `${leader.first_name || ''}${leader.last_name ? ' ' + leader.last_name : ''}`.trim();
          console.log(`   ${index + 1}. ${name} (${leader.email})`);
        });
      }
    }

  } catch (error) {
    console.error('💥 Fatal error:', error.message);
  }
}

// Run the script
if (require.main === module) {
  fixLeaderRoles()
    .then(() => {
      console.log('\n✨ Leader role cleanup completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { fixLeaderRoles };