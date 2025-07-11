const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function checkSchema() {
  try {
    console.log('🔍 Checking users table schema...');

    // Try to get the first user to see what columns exist
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Error:', error.message);
      
      // Check if table exists by trying to create a simple insert
      console.log('\n🔧 Checking table structure...');
      const { error: insertError } = await supabaseAdmin
        .from('users')
        .insert([{ test: 'test' }]);
      
      if (insertError) {
        console.log('Table structure issue:', insertError.message);
      }
      
      return;
    }

    console.log('✅ Users table exists');
    if (data && data.length > 0) {
      console.log('📊 Sample user columns:', Object.keys(data[0]));
      console.log('📋 Sample user data:', data[0]);
    } else {
      console.log('📭 Users table is empty');
      
      // Let's try to see what columns the table expects
      const { error: testError } = await supabaseAdmin
        .from('users')
        .insert([{}]);
      
      if (testError) {
        console.log('Expected columns from error:', testError.message);
      }
    }

  } catch (error) {
    console.error('💥 Error:', error);
  }
}

checkSchema();
