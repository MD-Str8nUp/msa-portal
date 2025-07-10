const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testDatabase() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test connection by trying to query the groups table
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Error querying groups table:', error);
      console.log('💡 This likely means the tables haven\'t been created yet.');
      console.log('📝 Please run the migration SQL in your Supabase SQL Editor first.');
      return;
    }
    
    console.log('✅ Database connection successful!');
    console.log('📊 Groups table query result:', data);
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  }
}

testDatabase();
