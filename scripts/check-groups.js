const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkGroupsTable() {
  try {
    console.log('🔍 Checking groups table structure...');
    
    // Try to insert a test record to see what the actual error is
    const { data, error } = await supabase
      .from('groups')
      .insert([
        {
          id: 'test-group',
          name: 'Test Group',
          description: 'Test description'
        }
      ])
      .select();
    
    if (error) {
      console.log('❌ Error inserting test group:', error);
    } else {
      console.log('✅ Test group inserted successfully:', data);
      
      // Clean up - delete the test group
      const { error: deleteError } = await supabase
        .from('groups')
        .delete()
        .eq('id', 'test-group');
      
      if (deleteError) {
        console.log('⚠️  Warning: Could not delete test group:', deleteError);
      } else {
        console.log('🧹 Test group cleaned up successfully');
      }
    }
    
  } catch (error) {
    console.error('❌ Check failed:', error);
  }
}

checkGroupsTable();
