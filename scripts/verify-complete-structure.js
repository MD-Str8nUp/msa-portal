const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://munqzgxhluteurttlydq.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11bnF6Z3hobHV0ZXVydHRseWRxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzg4OTI3MSwiZXhwIjoyMDYzNDY1MjcxfQ.qsEXF-9rtg1z4FAiJHVqjn7WiP_N6G3ObjjuHy5dPho';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Expected structure based on your format
const expectedStructure = [
  { cohort: 'Joeys', group: 'Joeys A (5yrs)', leader1: 'Ghofran', leader2: 'Batoul Rabii', teamLeader: 'Hawraa El Husseini' },
  { cohort: 'Joeys', group: 'Joeys B (6yrs) - 1', leader1: 'Rehab Kassem', leader2: 'Jana Boussi', teamLeader: 'Hawraa El Husseini' },
  { cohort: 'Joeys', group: 'Joeys B (6yrs) - 2', leader1: 'Fatima G', leader2: 'Ayah Merhi', teamLeader: 'Hawraa El Husseini' },
  { cohort: 'Joeys', group: 'Joeys C Girls (7yrs)', leader1: 'Hodah Ayache', leader2: 'Aminah Reslan', teamLeader: 'Hawraa El Husseini' },
  { cohort: 'Joeys', group: 'Joeys C Boys (7yrs)', leader1: 'Ali Makki', leader2: 'Hassan Hijazi', teamLeader: 'Hawraa El Husseini' },
  { cohort: 'Cubs', group: 'Cubs A Girls (8-9)', leader1: 'Fay Jaafar', leader2: 'Renee Reda', teamLeader: 'Abbas Ramadan' },
  { cohort: 'Cubs', group: 'Cubs A Boys (8)', leader1: 'Taha Dirani', leader2: 'Mohamed Wehbi', teamLeader: 'Abbas Ramadan' },
  { cohort: 'Cubs', group: 'Cubs B Girls (10)', leader1: 'Zeinab Sleiman', leader2: 'Ghadeer Haidar', teamLeader: 'Abbas Ramadan' },
  { cohort: 'Cubs', group: 'Cubs B Boys (9)', leader1: 'Hussein Ramadan', leader2: 'Mohamed Allouch', teamLeader: 'Abbas Ramadan' },
  { cohort: 'Cubs', group: 'Cubs C Girls (11)', leader1: 'Fatima Issa', leader2: 'Aminah Bahmad', teamLeader: 'Abbas Ramadan' },
  { cohort: 'Cubs', group: 'Cubs C Boys (10)', leader1: 'Hassan Sleiman', leader2: 'Hussein M.A', teamLeader: 'Abbas Ramadan' },
  { cohort: 'Cubs', group: 'Cubs Boys D (11)', leader1: 'Mohamed Kobeissi', leader2: 'Haidar Alawie', teamLeader: 'Abbas Ramadan' },
  { cohort: 'Cubs', group: 'Cubs Boys D2 (11)', leader1: 'Mohamad Ali Hijazi', leader2: null, teamLeader: 'Abbas Ramadan' },
  { cohort: 'Scouts', group: 'Scouts A Girls', leader1: 'Samar Droubi', leader2: 'Mariam Droubi', teamLeader: 'Sayed Mohamed' },
  { cohort: 'Scouts', group: 'Scouts A Boys (12)', leader1: 'Hussein Darwich', leader2: 'M.A Droubi', teamLeader: 'Sayed Mohamed' },
  { cohort: 'Scouts', group: 'Scouts B Boys (13)', leader1: 'Ali Chour', leader2: null, teamLeader: 'Sayed Mohamed' },
  { cohort: 'Scouts', group: 'Scout Boys C (14-15)', leader1: 'Hamzah Bibawi', leader2: null, teamLeader: 'Sayed Mohamed' }
];

function normalizeLeaderName(user) {
  if (!user) return null;
  const name = `${user.first_name || ''}${user.last_name ? ' ' + user.last_name : ''}`.trim();
  
  // Handle special cases for name matching
  if (name === 'Hussein MA') return 'Hussein M.A';
  if (name === 'MA Droubi') return 'M.A Droubi';
  
  return name;
}

async function verifyCompleteStructure() {
  try {
    console.log('🔍 Verifying complete MSA portal structure...\n');

    // Get all users and groups
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'leader');

    const { data: groups, error: groupsError } = await supabase
      .from('scout_groups')
      .select(`
        id,
        name,
        division,
        leader_id,
        users!scout_groups_leader_id_fkey(first_name, last_name, email)
      `);

    if (usersError || groupsError) {
      throw new Error('Failed to fetch data');
    }

    console.log('📋 MSA PORTAL STRUCTURE VERIFICATION');
    console.log('====================================\n');
    console.log('Cohort | Group | Leader 1 | Leader 2 | Team Leader');
    console.log(''.padEnd(80, '-'));

    let allCorrect = true;
    const teamLeaderEmails = {
      'Hawraa El Husseini': 'hawraa.elhusseini@msaportal.com',
      'Abbas Ramadan': 'abbas.ramadan@msaportal.com', 
      'Sayed Mohamed': 'sayed.mohamed@msaportal.com'
    };

    for (const expected of expectedStructure) {
      const group = groups.find(g => g.name === expected.group);
      
      let leader1Status = '❌';
      let leader2Status = expected.leader2 ? '❌' : '✅';
      let teamLeaderStatus = '❌';

      // Check Leader 1 (Primary)
      if (group && group.users) {
        const actualLeader1 = normalizeLeaderName(group.users);
        if (actualLeader1 === expected.leader1) {
          leader1Status = '✅';
        }
      }

      // Check Team Leader exists
      const teamLeaderEmail = teamLeaderEmails[expected.teamLeader];
      const teamLeaderExists = users.find(u => u.email === teamLeaderEmail);
      if (teamLeaderExists) {
        teamLeaderStatus = '✅';
      }

      const status = leader1Status === '✅' && leader2Status === '✅' && teamLeaderStatus === '✅' ? '✅' : '❌';
      if (status === '❌') allCorrect = false;

      // Format output to match your table structure
      const cohort = expected.cohort.padEnd(6);
      const groupName = expected.group.padEnd(25);
      const leader1 = expected.leader1.padEnd(15);
      const leader2 = (expected.leader2 || '-').padEnd(15);
      const teamLeader = expected.teamLeader.padEnd(18);

      console.log(`${status} ${cohort} | ${groupName} | ${leader1} | ${leader2} | ${teamLeader}`);
    }

    console.log('\n📊 VERIFICATION SUMMARY');
    console.log('=======================');
    
    // Count totals
    console.log(`📝 Total groups: ${expectedStructure.length}`);
    console.log(`🏕️  Joeys groups: ${expectedStructure.filter(e => e.cohort === 'Joeys').length}`);
    console.log(`🏕️  Cubs groups: ${expectedStructure.filter(e => e.cohort === 'Cubs').length}`);
    console.log(`🏕️  Scouts groups: ${expectedStructure.filter(e => e.cohort === 'Scouts').length}`);

    // Verify team leaders
    console.log('\n👥 TEAM LEADERS VERIFICATION:');
    for (const [name, email] of Object.entries(teamLeaderEmails)) {
      const exists = users.find(u => u.email === email);
      if (exists) {
        console.log(`✅ ${name} (${email}) - EXISTS`);
      } else {
        console.log(`❌ ${name} (${email}) - MISSING`);
        allCorrect = false;
      }
    }

    // Verify total leaders
    console.log('\n📈 LEADER COUNT VERIFICATION:');
    console.log(`Total leaders in database: ${users.length}`);
    console.log(`Expected: 38 (35 group leaders + 3 team leaders)`);
    
    if (users.length === 38) {
      console.log('✅ Leader count correct');
    } else {
      console.log('❌ Leader count incorrect');
      allCorrect = false;
    }

    // Final status
    console.log('\n🎯 FINAL STATUS:');
    if (allCorrect) {
      console.log('✅ ALL STRUCTURE VERIFIED - PERFECT MATCH!');
      console.log('✅ Your MSA Portal matches the exact format requested');
    } else {
      console.log('❌ Structure verification failed - some issues found');
    }

    console.log('\n🔐 LOGIN CREDENTIALS FOR ALL LEADERS:');
    console.log('Email: [firstname.lastname]@msaportal.com');
    console.log('Password: leader123');
    console.log('Role: leader');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

verifyCompleteStructure();