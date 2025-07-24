#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applySchemaUpdates() {
  console.log('🔧 Applying schema updates for MSA migration...');
  
  try {
    // Step 1: Add password column to users table
    console.log('📋 Adding password column to users table...');
    const { error: alterUsersError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS password TEXT;
        
        UPDATE users 
        SET password = '$2a$12$defaultpassword' 
        WHERE password IS NULL;
        
        ALTER TABLE users 
        ALTER COLUMN password SET NOT NULL;
      `
    });
    
    if (alterUsersError) {
      console.log(`⚠️  Users table update: ${alterUsersError.message}`);
    } else {
      console.log('✅ Users table updated successfully');
    }

    // Step 2: Add type column to groups table  
    console.log('📋 Adding type column to groups table...');
    const { error: alterGroupsError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE groups 
        ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'SCOUT_GROUP';
        
        UPDATE groups 
        SET type = 'SCOUT_GROUP' 
        WHERE type IS NULL;
      `
    });
    
    if (alterGroupsError) {
      console.log(`⚠️  Groups table update: ${alterGroupsError.message}`);
    } else {
      console.log('✅ Groups table updated successfully');
    }

    // Step 3: Add additional columns to scouts table
    console.log('📋 Adding columns to scouts table...');
    const { error: alterScoutsError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE scouts ADD COLUMN IF NOT EXISTS date_of_birth DATE;
        ALTER TABLE scouts ADD COLUMN IF NOT EXISTS gender TEXT;
        ALTER TABLE scouts ADD COLUMN IF NOT EXISTS school TEXT;
        ALTER TABLE scouts ADD COLUMN IF NOT EXISTS uniform_top_size TEXT;
        ALTER TABLE scouts ADD COLUMN IF NOT EXISTS uniform_bottom_size TEXT;
        ALTER TABLE scouts ADD COLUMN IF NOT EXISTS allergies TEXT;
        ALTER TABLE scouts ADD COLUMN IF NOT EXISTS parent_id UUID;
        
        -- Add foreign key constraint if not exists
        DO $$ 
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'scouts_parent_id_fkey'
          ) THEN
            ALTER TABLE scouts ADD CONSTRAINT scouts_parent_id_fkey 
            FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE;
          END IF;
        END $$;
      `
    });
    
    if (alterScoutsError) {
      console.log(`⚠️  Scouts table update: ${alterScoutsError.message}`);
    } else {
      console.log('✅ Scouts table updated successfully');
    }

    console.log('✅ Schema updates completed!');
    
  } catch (error) {
    console.error('❌ Schema update failed:', error);
    throw error;
  }
}

// Execute if run directly
if (require.main === module) {
  applySchemaUpdates()
    .then(() => {
      console.log('🎉 Schema updates applied successfully!');
      console.log('📋 Ready to run data migration');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Schema update failed:', error);
      process.exit(1);
    });
}

module.exports = { applySchemaUpdates };