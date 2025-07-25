const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

// Supabase configuration
const supabaseUrl = 'https://munqzgxhluteurttlydq.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11bnF6Z3hobHV0ZXVydHRseWRxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzg4OTI3MSwiZXhwIjoyMDYzNDY1MjcxfQ.qsEXF-9rtg1z4FAiJHVqjn7WiP_N6G3ObjjuHy5dPho';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// List of 35 specific leaders who need LEADER accounts
const leaders = [
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

function parseNameToEmailParts(fullName) {
  // Handle special cases
  if (fullName === 'Abir') {
    return { firstName: 'Abir', lastName: '', email: 'abir' };
  }
  if (fullName === 'Ali Abbas (Helper)') {
    return { firstName: 'Ali', lastName: 'Abbas', email: 'ali.abbas' };
  }
  if (fullName === 'Ghofran') {
    return { firstName: 'Ghofran', lastName: '', email: 'ghofran' };
  }
  if (fullName === 'Fatima G') {
    return { firstName: 'Fatima', lastName: 'G', email: 'fatima.g' };
  }
  if (fullName === 'Hussein M.A') {
    return { firstName: 'Hussein', lastName: 'MA', email: 'hussein.ma' };
  }
  if (fullName === 'M.A Droubi') {
    return { firstName: 'MA', lastName: 'Droubi', email: 'ma.droubi' };
  }
  if (fullName === 'Mohamad Ali Hijazi') {
    return { firstName: 'Mohamad Ali', lastName: 'Hijazi', email: 'mohamad.ali.hijazi' };
  }
  if (fullName === 'Nour Maliki') {
    return { firstName: 'Nour', lastName: 'Maliki', email: 'nour.maliki' };
  }
  if (fullName === 'Zahraa Dirani') {
    return { firstName: 'Zahraa', lastName: 'Dirani', email: 'zahraa.dirani' };
  }
  
  // Standard case - split by space
  const parts = fullName.trim().split(' ');
  if (parts.length >= 2) {
    const firstName = parts[0];
    const lastName = parts.slice(1).join(' ');
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(/\s+/g, '.')}`;
    return { firstName, lastName, email };
  } else {
    // Single name case
    return { firstName: parts[0], lastName: '', email: parts[0].toLowerCase() };
  }
}

async function createLeaders() {
  console.log('🚀 Starting to create 35 LEADER accounts...\n');

  const results = {
    created: [],
    errors: [],
    skipped: []
  };

  for (const leaderName of leaders) {
    try {
      const { firstName, lastName, email } = parseNameToEmailParts(leaderName);
      const fullEmail = `${email}@msaportal.com`;
      
      console.log(`Creating leader: ${leaderName} -> ${fullEmail}`);

      // Hash the temporary password
      const hashedPassword = await bcrypt.hash('leader123', 10);

      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id, email')
        .eq('email', fullEmail)
        .single();

      if (existingUser) {
        console.log(`⚠️  User already exists: ${fullEmail}`);
        results.skipped.push({ name: leaderName, email: fullEmail, reason: 'Already exists' });
        continue;
      }

      // Create the user account
      const { data: newUser, error } = await supabase
        .from('users')
        .insert([{
          email: fullEmail,
          username: email,
          first_name: firstName,
          last_name: lastName,
          role: 'leader',
          password: hashedPassword,
          phone: null,
          status: 'ACTIVE'
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      console.log(`✅ Created: ${leaderName} (${fullEmail})`);
      results.created.push({
        name: leaderName,
        email: fullEmail,
        id: newUser.id,
        role: 'LEADER'
      });

    } catch (error) {
      console.error(`❌ Error creating ${leaderName}:`, error.message);
      results.errors.push({
        name: leaderName,
        error: error.message
      });
    }

    // Small delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Summary report
  console.log('\n📊 LEADER CREATION SUMMARY');
  console.log('==========================');
  console.log(`✅ Successfully created: ${results.created.length}`);
  console.log(`⚠️  Skipped (already exist): ${results.skipped.length}`);
  console.log(`❌ Errors: ${results.errors.length}`);
  console.log(`📝 Total processed: ${leaders.length} (35 leaders)`);

  if (results.created.length > 0) {
    console.log('\n🔑 CREATED LEADERS:');
    results.created.forEach(leader => {
      console.log(`   ${leader.name} -> ${leader.email}`);
    });
  }

  if (results.errors.length > 0) {
    console.log('\n❌ ERRORS:');
    results.errors.forEach(error => {
      console.log(`   ${error.name}: ${error.error}`);
    });
  }

  console.log('\n🔐 LOGIN CREDENTIALS:');
  console.log('Email: [firstname.lastname]@msaportal.com');
  console.log('Password: leader123');
  console.log('Role: LEADER');
}

// Run the script
if (require.main === module) {
  createLeaders()
    .then(() => {
      console.log('\n✨ Leader creation process completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { createLeaders };