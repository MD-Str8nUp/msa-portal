#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkDatabase() {
  console.log('🔍 Checking current database structure...');
  
  try {
    // Check existing tables
    const { data: tables, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .neq('table_name', 'schema_migrations');
      
    if (error) {
      console.log('⚠️  Could not query information_schema, trying direct table access...');
      
      // Try checking specific tables
      const testTables = ['users', 'groups', 'scouts'];
      for (const table of testTables) {
        try {
          const { data, error: tableError } = await supabase
            .from(table)
            .select('*')
            .limit(1);
          
          if (tableError) {
            console.log(`❌ Table '${table}': ${tableError.message}`);
          } else {
            console.log(`✅ Table '${table}': Exists`);
          }
        } catch (err) {
          console.log(`❌ Table '${table}': ${err.message}`);
        }
      }
    } else {
      console.log('📋 Existing tables:');
      tables.forEach(table => console.log(`   - ${table.table_name}`));
    }
    
  } catch (error) {
    console.error('❌ Database check failed:', error);
  }
}

checkDatabase();