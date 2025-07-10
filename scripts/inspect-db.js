const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function inspectTables() {
  try {
    console.log('🔍 Inspecting database tables...');
    
    // Query the information schema to get table structure
    const { data, error } = await supabase
      .rpc('exec', {
        query: `
          SELECT 
            table_name,
            column_name,
            data_type,
            is_nullable,
            column_default
          FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name IN ('groups', 'users', 'scouts', 'events')
          ORDER BY table_name, ordinal_position;
        `
      });
    
    if (error) {
      console.log('❌ Error inspecting tables:', error);
      
      // Try a different approach - just query the tables directly
      console.log('🔄 Trying alternative approach...');
      
      const tables = ['groups', 'users', 'scouts', 'events'];
      for (const table of tables) {
        const { data: tableData, error: tableError } = await supabase
          .from(table)
          .select('*')
          .limit(0);
        
        if (tableError) {
          console.log(`❌ Table ${table}:`, tableError.message);
        } else {
          console.log(`✅ Table ${table} exists`);
        }
      }
      return;
    }
    
    console.log('📊 Table structure:', data);
    
  } catch (error) {
    console.error('❌ Inspection failed:', error);
  }
}

inspectTables();
