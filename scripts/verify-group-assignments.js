const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://munqzgxhluteurttlydq.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11bnF6Z3hobHV0ZXVydHRseWRxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzg4OTI3MSwiZXhwIjoyMDYzNDY1MjcxfQ.qsEXF-9rtg1z4FAiJHVqjn7WiP_N6G3ObjjuHy5dPho';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Expected assignments based on original data
const expectedAssignments = {
  'Joeys A (5yrs)': ['Ghofran', 'Batoul Rabii'],
  'Joeys B (6yrs) - 1': ['Rehab Kassem', 'Jana Boussi'],
  'Joeys B (6yrs) - 2': ['Fatima G', 'Ayah Merhi'],
  'Joeys C Girls (7yrs)': ['Hodah Ayache', 'Aminah Reslan'],
  'Joeys C Boys (7yrs)': ['Ali Makki', 'Hassan Hijazi'],
  'Cubs A Girls (8-9)': ['Fay Jaafar', 'Renee Reda'],
  'Cubs A Boys (8)': ['Taha Dirani', 'Mohamed Wehbi'],
  'Cubs B Girls (10)': ['Zeinab Sleiman', 'Ghadeer Haidar'],
  'Cubs B Boys (9)': ['Hussein Ramadan', 'Mohamed Allouch'],
  'Cubs C Girls (11)': ['Fatima Issa', 'Aminah Bahmad'],
  'Cubs C Boys (10)': ['Hassan Sleiman', 'Hussein M.A'],
  'Cubs Boys D (11)': ['Mohamed Kobeissi', 'Haidar Alawie'],
  'Cubs Boys D2 (11)': ['Mohamad Ali Hijazi'],
  'Scouts A Girls': ['Samar Droubi', 'Mariam Droubi'],
  'Scouts A Boys (12)': ['Hussein Darwich', 'M.A Droubi'],
  'Scouts B Boys (13)': ['Ali Chour'],
  'Scout Boys C (14-15)': ['Hamzah Bibawi']
};

async function verifyGroupAssignments() {
  try {
    console.log('🔍 Verifying group-leader assignments...\n');

    // Get all scout groups with their leader assignments
    const { data: groups, error: groupsError } = await supabase
      .from('scout_groups')
      .select(`
        id,
        name,
        division,
        leader_id,
        users!scout_groups_leader_id_fkey(first_name, last_name, email)
      `)
      .order('division')
      .order('name');

    if (groupsError) throw groupsError;

    console.log('📋 CURRENT GROUP ASSIGNMENTS:');
    console.log('=============================\n');

    let correctAssignments = 0;
    let incorrectAssignments = 0;
    let missingAssignments = 0;

    // Check each group
    for (const group of groups) {
      const expectedLeaders = expectedAssignments[group.name];
      
      if (!expectedLeaders) {
        console.log(`⚠️  ${group.name}: No expected assignment data`);
        continue;
      }

      console.log(`🏕️  ${group.name} (${group.division})`);
      
      if (group.leader_id && group.users) {
        const leaderName = `${group.users.first_name || ''}${group.users.last_name ? ' ' + group.users.last_name : ''}`.trim();
        const expectedPrimary = expectedLeaders[0];
        
        if (leaderName === expectedPrimary || 
            (expectedPrimary === 'Ghofran' && leaderName === 'Ghofran') ||
            (expectedPrimary === 'Hussein M.A' && leaderName === 'Hussein MA') ||
            (expectedPrimary === 'M.A Droubi' && leaderName === 'MA Droubi')) {
          console.log(`   ✅ Primary: ${leaderName} (${group.users.email}) - CORRECT`);
          correctAssignments++;
        } else {
          console.log(`   ❌ Primary: ${leaderName} (${group.users.email}) - WRONG! Should be: ${expectedPrimary}`);
          incorrectAssignments++;
        }
        
        // Note about co-leaders
        if (expectedLeaders.length > 1) {
          console.log(`   📝 Expected co-leader(s): ${expectedLeaders.slice(1).join(', ')}`);
        }
      } else {
        console.log(`   ❌ No leader assigned! Should be: ${expectedLeaders.join(' + ')}`);
        missingAssignments++;
      }
      
      console.log('');
    }

    // Summary
    console.log('📊 ASSIGNMENT VERIFICATION SUMMARY');
    console.log('==================================');
    console.log(`✅ Correct assignments: ${correctAssignments}`);
    console.log(`❌ Incorrect assignments: ${incorrectAssignments}`);
    console.log(`❓ Missing assignments: ${missingAssignments}`);
    console.log(`📝 Total groups checked: ${groups.length}`);

    if (incorrectAssignments > 0 || missingAssignments > 0) {
      console.log('\n⚠️  ISSUES FOUND - Group assignments need to be fixed!');
    } else {
      console.log('\n✅ ALL ASSIGNMENTS CORRECT!');
    }

    // Show which specific groups are our 17 target groups
    console.log('\n🎯 TARGET GROUPS (17 total):');
    Object.keys(expectedAssignments).forEach((groupName, index) => {
      const group = groups.find(g => g.name === groupName);
      if (group) {
        console.log(`   ${index + 1}. ✅ ${groupName}`);
      } else {
        console.log(`   ${index + 1}. ❌ ${groupName} - GROUP NOT FOUND!`);
      }
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

verifyGroupAssignments();