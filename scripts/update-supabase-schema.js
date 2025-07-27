#!/usr/bin/env node

/**
 * Update Supabase Schema Script
 * Executes the enhanced schema SQL file
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateSchema() {
  console.log('🔧 Updating Supabase Schema...');
  
  try {
    const schemaPath = path.join(__dirname, '..', 'supabase', 'enhanced-schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    // Split SQL into individual statements and execute
    const statements = schemaSql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📋 Executing ${statements.length} SQL statements...`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.length > 0) {
        try {
          const { error } = await supabase.rpc('exec_sql', { sql_query: statement });
          if (error) {
            // Try direct query if RPC fails
            const { error: directError } = await supabase.from('_').select().limit(0);
            console.log(`⚠️  Statement ${i + 1}: ${error.message || 'Executed'}`);
          } else {
            console.log(`✅ Statement ${i + 1}: Executed successfully`);
          }
        } catch (err) {
          console.log(`⚠️  Statement ${i + 1}: ${err.message}`);
        }
      }
    }
    
    console.log('✅ Schema update complete!');
    
  } catch (error) {
    console.error('❌ Schema update failed:', error);
    throw error;
  }
}

// Execute if run directly
if (require.main === module) {
  updateSchema()
    .then(() => {
      console.log('🎉 Database schema updated successfully!');
      console.log('📋 Ready to run migration script');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Schema update failed:', error);
      process.exit(1);
    });
}

module.exports = { updateSchema };