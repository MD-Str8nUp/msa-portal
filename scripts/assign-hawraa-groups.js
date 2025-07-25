const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://munqzgxhluteurttlydq.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11bnF6Z3hobHV0ZXVydHRseWRxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzg4OTI3MSwiZXhwIjoyMDYzNDY1MjcxfQ.qsEXF-9rtg1z4FAiJHVqjn7WiP_N6G3ObjjuHy5dPho';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function assignHawraaToGroups() {
  const hawraaId = 'c09aa158-bff4-4e20-9a14-eedbfdf58153';
  
  // According to original data, Hawraa should lead these groups:
  const hawraaGroups = [
    'Joeys A (5yrs)',
    'Joeys B (6yrs) - 1', 
    'Joeys B (6yrs) - 2'
  ];
  
  console.log('🔧 Assigning Hawraa to her groups...\n');
  
  for (const groupName of hawraaGroups) {
    const { data: group, error: findError } = await supabase
      .from('scout_groups')
      .select('*')
      .eq('name', groupName)
      .single();
      
    if (findError || !group) {
      console.log('❌ Could not find group:', groupName);
      continue;
    }
    
    // Update the group to have Hawraa as leader
    const { error: updateError } = await supabase
      .from('scout_groups')
      .update({ leader_id: hawraaId })
      .eq('id', group.id);
      
    if (updateError) {
      console.log('❌ Error assigning', groupName, ':', updateError.message);
    } else {
      console.log('✅ Assigned Hawraa to:', groupName);
    }
  }
  
  // Verify the assignments
  console.log('\n📋 Verification - Hawraa\'s groups:');
  const { data: verifyGroups } = await supabase
    .from('scout_groups')
    .select('name, current_capacity')
    .eq('leader_id', hawraaId);
    
  if (verifyGroups && verifyGroups.length > 0) {
    verifyGroups.forEach(group => {
      console.log('   ✅', group.name, `(${group.current_capacity} scouts)`);
    });
    
    const totalScouts = verifyGroups.reduce((sum, group) => sum + (group.current_capacity || 0), 0);
    console.log(`\n📊 Total: ${verifyGroups.length} groups, ${totalScouts} scouts`);
  } else {
    console.log('   ❌ No groups found for Hawraa');
  }
}

// Run the script
if (require.main === module) {
  assignHawraaToGroups()
    .then(() => {
      console.log('\n✨ Hawraa group assignment completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { assignHawraaToGroups };