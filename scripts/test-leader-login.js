const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://munqzgxhluteurttlydq.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11bnF6Z3hobHV0ZXVydHRseWRxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzg4OTI3MSwiZXhwIjoyMDYzNDY1MjcxfQ.qsEXF-9rtg1z4FAiJHVqjn7WiP_N6G3ObjjuHy5dPho';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testLeaderLogin() {
  console.log('🔍 Testing leader login and group access...\n');

  try {
    // Test with a specific leader - let's use Ghofran who should have Joeys A group
    const testLeaderEmail = 'ghofran@msaportal.com';
    
    console.log(`Testing login for: ${testLeaderEmail}`);
    
    // 1. Check if the leader exists
    const { data: leader, error: leaderError } = await supabase
      .from('users')
      .select('*')
      .eq('email', testLeaderEmail)
      .single();

    if (leaderError) {
      console.log('❌ Leader not found:', leaderError.message);
      return;
    }

    console.log('✅ Leader found:');
    console.log(`   Name: ${leader.first_name} ${leader.last_name || ''}`);
    console.log(`   Email: ${leader.email}`);
    console.log(`   Role: ${leader.role}`);
    console.log(`   ID: ${leader.id}\n`);

    // 2. Check what groups this leader is assigned to
    const { data: groups, error: groupsError } = await supabase
      .from('scout_groups')
      .select('*')
      .eq('leader_id', leader.id);

    console.log('🏕️  Groups where leader is PRIMARY:');
    if (groupsError) {
      console.log('❌ Error fetching groups:', groupsError.message);
    } else if (groups.length === 0) {
      console.log('❌ No groups found for this leader');
    } else {
      groups.forEach(group => {
        console.log(`   ✅ ${group.name} (${group.division}) - ID: ${group.id}`);
      });
    }

    // 3. Check scouts in the leader's groups
    if (groups.length > 0) {
      console.log('\n👦👧 Scouts in leader\'s groups:');
      for (const group of groups) {
        const { data: scouts, error: scoutsError } = await supabase
          .from('scouts')
          .select('*')
          .eq('group_id', group.id);

        if (scoutsError) {
          console.log(`❌ Error fetching scouts for ${group.name}:`, scoutsError.message);
        } else {
          console.log(`\n   📋 ${group.name}:`);
          if (scouts.length === 0) {
            console.log('      ❌ No scouts assigned to this group');
          } else {
            scouts.forEach(scout => {
              console.log(`      ✅ ${scout.first_name} ${scout.last_name} (Age: ${scout.age})`);
            });
          }
        }
      }
    }

    // 4. Check authentication setup
    console.log('\n🔐 Authentication Test:');
    
    // Try to authenticate with the leader credentials
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: testLeaderEmail,
      password: 'leader123'
    });

    if (authError) {
      console.log('❌ Authentication failed:', authError.message);
      console.log('   This means the leader cannot log in to the app');
    } else {
      console.log('✅ Authentication successful');
      console.log(`   User ID: ${authData.user.id}`);
      
      // Sign out immediately
      await supabase.auth.signOut();
    }

    // 5. Check what the frontend APIs would return
    console.log('\n🌐 Frontend API Simulation:');
    
    // Simulating what /api/groups would return for this leader
    const { data: apiGroups, error: apiError } = await supabase
      .from('scout_groups')
      .select(`
        *,
        scouts(id, first_name, last_name, age, gender)
      `)
      .eq('leader_id', leader.id);

    if (apiError) {
      console.log('❌ API simulation failed:', apiError.message);
    } else {
      console.log('📊 API would return:');
      console.log(`   Groups: ${apiGroups.length}`);
      apiGroups.forEach(group => {
        console.log(`   - ${group.name}: ${group.scouts?.length || 0} scouts`);
      });
    }

    // 6. Summary and recommendations
    console.log('\n📋 DIAGNOSIS SUMMARY:');
    console.log('=====================');
    
    if (leader.role !== 'leader') {
      console.log('❌ Issue: User role is not "leader"');
    } else {
      console.log('✅ User has correct "leader" role');
    }

    if (groups.length === 0) {
      console.log('❌ Issue: Leader is not assigned to any groups');
      console.log('   Solution: Need to set leader_id in scout_groups table');
    } else {
      console.log(`✅ Leader is assigned to ${groups.length} group(s)`);
    }

    // Check for scouts
    let totalScouts = 0;
    for (const group of groups) {
      const { data: scouts } = await supabase
        .from('scouts')
        .select('id')
        .eq('group_id', group.id);
      totalScouts += scouts?.length || 0;
    }

    if (totalScouts === 0) {
      console.log('❌ Issue: No scouts assigned to leader\'s groups');
      console.log('   Solution: Need to assign scouts to the groups');
    } else {
      console.log(`✅ Leader has ${totalScouts} scouts across their groups`);
    }

  } catch (error) {
    console.error('💥 Fatal error:', error.message);
  }
}

// Run the test
if (require.main === module) {
  testLeaderLogin()
    .then(() => {
      console.log('\n✨ Leader login test completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { testLeaderLogin };