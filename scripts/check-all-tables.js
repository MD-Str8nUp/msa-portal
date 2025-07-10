const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkAllTables() {
  try {
    console.log('🔍 Checking all tables in the database...');
    
    const tables = [
      'groups', 'users', 'scouts', 'events', 'applications', 'attendances',
      'badges', 'badge_scouts', 'files', 'announcements', 'messages'
    ];
    
    for (const table of tables) {
      console.log(`\n🔍 Checking table: ${table}`);
      
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ Table ${table}: ${error.message}`);
      } else {
        console.log(`✅ Table ${table}: exists (${data.length} sample records)`);
        
        // Try to insert a test record to see the structure
        const testData = {};
        if (table === 'events') {
          testData.title = 'Test Event';
          testData.description = 'Test Description';
          testData.location = 'Test Location';
          testData.start_date = new Date().toISOString();
          testData.end_date = new Date().toISOString();
        }
        
        if (Object.keys(testData).length > 0) {
          const { data: insertData, error: insertError } = await supabase
            .from(table)
            .insert([testData])
            .select();
          
          if (insertError) {
            console.log(`   ⚠️  Insert test failed: ${insertError.message}`);
          } else {
            console.log(`   ✅ Insert test passed, structure seems correct`);
            
            // Clean up test data
            if (insertData && insertData.length > 0) {
              await supabase
                .from(table)
                .delete()
                .eq('id', insertData[0].id);
            }
          }
        }
      }
    }
    
    // Check what we have in groups table
    console.log('\n📊 Current groups:');
    const { data: groups, error: groupsError } = await supabase
      .from('groups')
      .select('*');
    
    if (!groupsError && groups) {
      console.log(groups);
    }
    
  } catch (error) {
    console.error('❌ Check failed:', error);
  }
}

checkAllTables();
