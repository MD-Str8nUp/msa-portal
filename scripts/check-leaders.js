const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://munqzgxhluteurttlydq.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11bnF6Z3hobHV0ZXVydHRseWRxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzg4OTI3MSwiZXhwIjoyMDYzNDY1MjcxfQ.qsEXF-9rtg1z4FAiJHVqjn7WiP_N6G3ObjjuHy5dPho';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkLeaders() {
  try {
    console.log('🔍 Checking for leaders in Supabase database...\n');

    // Check for leaders in users table
    const { data: leaders, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'leader')
      .order('first_name');

    if (error) throw error;

    console.log('📋 LEADERS IN DATABASE:');
    console.log('======================');
    console.log(`Total leaders found: ${leaders.length}`);
    console.log('');
    
    if (leaders.length > 0) {
      leaders.forEach((leader, index) => {
        const name = `${leader.first_name || ''}${leader.last_name ? ' ' + leader.last_name : ''}`.trim();
        console.log(`${index + 1}. ${name} (${leader.email}) - Role: ${leader.role}`);
      });
    } else {
      console.log('❌ No leaders found with role="leader"');
    }

    // Also check what other roles exist
    const { data: allUsers, error: allError } = await supabase
      .from('users')
      .select('role')
      .limit(100);

    if (!allError) {
      const uniqueRoles = [...new Set(allUsers.map(u => u.role))];
      console.log('\n🏷️  All roles in database:', uniqueRoles);
      
      // Count by role
      const roleCounts = {};
      allUsers.forEach(u => {
        roleCounts[u.role] = (roleCounts[u.role] || 0) + 1;
      });
      
      console.log('\n📊 User count by role:');
      Object.entries(roleCounts).forEach(([role, count]) => {
        console.log(`   ${role}: ${count} users`);
      });
    }

    // Check scout groups
    const { data: groups, error: groupsError } = await supabase
      .from('scout_groups')
      .select('id, name, leader_id');

    if (!groupsError) {
      console.log(`\n🏕️  Scout groups found: ${groups.length}`);
      const groupsWithLeaders = groups.filter(g => g.leader_id);
      console.log(`   Groups with assigned leaders: ${groupsWithLeaders.length}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkLeaders();