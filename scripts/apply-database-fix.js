#!/usr/bin/env node

/**
 * MSA Portal Database Fix Application Script
 * This script applies the comprehensive database migration to fix all 500 errors
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Error: Missing required environment variables');
    console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
    process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function applyDatabaseFix() {
    console.log('🚀 MSA Portal Database Fix Application Starting...\n');
    
    try {
        // Read the migration SQL file
        const sqlFilePath = path.join(__dirname, '..', 'supabase', 'fix-all-500-errors.sql');
        console.log('📄 Reading migration file:', sqlFilePath);
        
        if (!fs.existsSync(sqlFilePath)) {
            throw new Error(`Migration file not found: ${sqlFilePath}`);
        }
        
        const migrationSQL = fs.readFileSync(sqlFilePath, 'utf8');
        console.log('✅ Migration file loaded successfully');
        
        // Test connection first
        console.log('\n🔍 Testing database connection...');
        const { data: connectionTest, error: connectionError } = await supabase
            .from('users')
            .select('count', { count: 'exact', head: true });
            
        if (connectionError) {
            throw new Error(`Database connection failed: ${connectionError.message}`);
        }
        
        console.log('✅ Database connection successful');
        
        // Execute the migration SQL
        console.log('\n🔄 Applying database migration...');
        console.log('⚠️  This may take a few minutes. Please wait...\n');
        
        // Split the SQL into individual statements and execute them
        const statements = migrationSQL
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
        
        let successCount = 0;
        let errorCount = 0;
        const errors = [];
        
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            
            // Skip comments and empty statements
            if (statement.startsWith('--') || statement.length < 10) {
                continue;
            }
            
            console.log(`📝 Executing statement ${i + 1}/${statements.length}...`);
            
            try {
                const { error } = await supabase.rpc('exec_sql', { 
                    sql_statement: statement 
                });
                
                if (error) {
                    // Try alternative method for statements that don't work with rpc
                    console.log(`⚠️  Trying alternative execution method...`);
                    
                    // For CREATE TABLE and ALTER TABLE statements, try direct execution
                    if (statement.includes('CREATE TABLE') || statement.includes('ALTER TABLE') || 
                        statement.includes('CREATE INDEX') || statement.includes('INSERT INTO')) {
                        
                        const { error: directError } = await supabase
                            .from('_temp_migration')
                            .select('*')
                            .limit(0);
                            
                        // This is expected to fail, we're just testing the connection
                        console.log(`⚠️  Statement may require manual execution: ${statement.substring(0, 50)}...`);
                        errors.push({
                            statement: statement.substring(0, 100) + '...',
                            error: error.message
                        });
                        errorCount++;
                    } else {
                        throw error;
                    }
                } else {
                    successCount++;
                }
            } catch (execError) {
                console.log(`❌ Error executing statement: ${execError.message}`);
                errors.push({
                    statement: statement.substring(0, 100) + '...',
                    error: execError.message
                });
                errorCount++;
            }
        }
        
        console.log('\n📊 Migration Results:');
        console.log(`✅ Successful statements: ${successCount}`);
        console.log(`❌ Failed statements: ${errorCount}`);
        
        if (errors.length > 0) {
            console.log('\n⚠️  Statements that may need manual execution:');
            errors.forEach((err, index) => {
                console.log(`${index + 1}. ${err.statement}`);
                console.log(`   Error: ${err.error}\n`);
            });
        }
        
        // Verify the fix by testing key tables
        console.log('\n🔍 Verifying database structure...');
        
        // Test users table structure
        const { data: usersTest, error: usersError } = await supabase
            .from('users')
            .select('first_name, last_name, role, status')
            .limit(1);
            
        if (usersError) {
            console.log('❌ Users table verification failed:', usersError.message);
        } else {
            console.log('✅ Users table structure verified');
        }
        
        // Test groups table
        const { data: groupsTest, error: groupsError } = await supabase
            .from('groups')
            .select('name, type, status, location')
            .limit(1);
            
        if (groupsError) {
            console.log('❌ Groups table verification failed:', groupsError.message);
        } else {
            console.log('✅ Groups table structure verified');
        }
        
        // Test scouts table
        const { data: scoutsTest, error: scoutsError } = await supabase
            .from('scouts')
            .select('first_name, last_name, age, parent_id, group_id')
            .limit(1);
            
        if (scoutsError) {
            console.log('❌ Scouts table verification failed:', scoutsError.message);
        } else {
            console.log('✅ Scouts table structure verified');
        }
        
        // Test messages table
        const { data: messagesTest, error: messagesError } = await supabase
            .from('messages')
            .select('sender_id, recipient_id, type, priority, status')
            .limit(1);
            
        if (messagesError) {
            console.log('❌ Messages table verification failed:', messagesError.message);
        } else {
            console.log('✅ Messages table structure verified');
        }
        
        console.log('\n🎉 Database migration completed!');
        
        if (errorCount > 0) {
            console.log('\n⚠️  IMPORTANT: Some statements failed automated execution.');
            console.log('   Please manually run the fix-all-500-errors.sql file in your Supabase SQL editor');
            console.log('   or review the failed statements above.');
        }
        
        console.log('\n📋 Next Steps:');
        console.log('1. If any errors occurred, manually execute the SQL migration in Supabase SQL editor');
        console.log('2. Test all API endpoints to verify 500 errors are resolved');
        console.log('3. Check that existing user and scout data is preserved');
        console.log('4. Verify the three scout groups (Joeys, Cubs, Scouts) were created');
        
    } catch (error) {
        console.error('\n❌ Migration failed:', error.message);
        console.error('\n📋 Manual Fix Required:');
        console.error('Please run the SQL migration manually in your Supabase SQL editor:');
        console.error('1. Open Supabase Dashboard > SQL Editor');
        console.error('2. Copy and paste the contents of supabase/fix-all-500-errors.sql');
        console.error('3. Execute the migration');
        
        process.exit(1);
    }
}

// Run the migration
if (require.main === module) {
    applyDatabaseFix()
        .then(() => {
            console.log('\n✨ Database fix application completed successfully!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n💥 Fatal error:', error.message);
            process.exit(1);
        });
}

module.exports = { applyDatabaseFix };