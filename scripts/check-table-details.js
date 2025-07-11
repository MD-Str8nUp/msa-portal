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

async function checkTableDetails() {
  try {
    console.log('🔍 Checking users table structure...\n');

    // Get table information
    const { data, error } = await supabaseAdmin
      .rpc('sql', {
        query: `
          SELECT 
            column_name, 
            data_type, 
            is_nullable, 
            column_default,
            is_generated,
            generation_expression
          FROM information_schema.columns 
          WHERE table_name = 'users' 
          ORDER BY ordinal_position;
        `
      });

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    console.log('📊 Users table structure:');
    data.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : '(NULLABLE)'} ${col.column_default ? `DEFAULT: ${col.column_default}` : ''}`);
      if (col.is_generated === 'ALWAYS') {
        console.log(`    ↳ Generated: ${col.generation_expression}`);
      }
    });

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

checkTableDetails();
