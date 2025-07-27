const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://munqzgxhluteurttlydq.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11bnF6Z3hobHV0ZXVydHRseWRxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzg4OTI3MSwiZXhwIjoyMDYzNDY1MjcxfQ.qsEXF-9rtg1z4FAiJHVqjn7WiP_N6G3ObjjuHy5dPho';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function showAllUsers() {
  try {
    console.log('👥 ALL USERS IN DATABASE:\n');

    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('role')
      .order('first_name');

    if (error) throw error;

    // Group by role
    const usersByRole = {
      'exec': users.filter(u => u.role === 'exec'),
      'leader': users.filter(u => u.role === 'leader'),
      'parent': users.filter(u => u.role === 'parent')
    };

    Object.entries(usersByRole).forEach(([role, roleUsers]) => {
      if (roleUsers.length > 0) {
        console.log(`\n🏷️  ${role.toUpperCase()} USERS (${roleUsers.length}):`);
        console.log(''.padEnd(50, '='));
        
        roleUsers.forEach((user, index) => {
          const name = `${user.first_name || ''}${user.last_name ? ' ' + user.last_name : ''}`.trim();
          console.log(`${(index + 1).toString().padStart(3)}. ${name.padEnd(25)} (${user.email})`);
        });
      }
    });

    console.log(`\n📊 TOTAL USERS: ${users.length}`);
    console.log(`   Executives: ${usersByRole.exec.length}`);
    console.log(`   Leaders: ${usersByRole.leader.length}`);
    console.log(`   Parents: ${usersByRole.parent.length}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

showAllUsers();