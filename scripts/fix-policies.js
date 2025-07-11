const { createClient } = require('@supabase/supabase-js');

async function fixPolicies() {
    const supabaseUrl = "https://munqzgxhluteurttlydq.supabase.co";
    const serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11bnF6Z3hobHV0ZXVydHRseWRxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzg4OTI3MSwiZXhwIjoyMDYzNDY1MjcxfQ.qsEXF-9rtg1z4FAiJHVqjn7WiP_N6G3ObjjuHy5dPho";
    
    console.log('🔧 Fixing RLS policies on users table...');
    
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    
    try {
        // First, let's test basic access with service role
        console.log('📊 Testing service role access...');
        const { data: testData, error: testError } = await supabase
            .from('users')
            .select('id, email, full_name, role')
            .limit(5);
            
        if (testError) {
            console.log('❌ Service role error:', testError.message);
        } else {
            console.log('✅ Service role can access users table');
            console.log('Users found:', testData.length);
        }
        
        // Drop all existing policies and recreate simple ones
        console.log('\n🗑️ Dropping existing policies...');
        
        const dropPolicies = [
            'DROP POLICY IF EXISTS "Users can view their own profile" ON users;',
            'DROP POLICY IF EXISTS "Users can update their own profile" ON users;',
            'DROP POLICY IF EXISTS "Enable read access for users based on user_id" ON users;',
            'DROP POLICY IF EXISTS "Enable insert for users based on user_id" ON users;',
            'DROP POLICY IF EXISTS "Enable update for users based on user_id" ON users;',
            'DROP POLICY IF EXISTS "Select users" ON users;',
            'DROP POLICY IF EXISTS "Insert users" ON users;',
            'DROP POLICY IF EXISTS "Update users" ON users;'
        ];
        
        for (const dropPolicy of dropPolicies) {
            try {
                const { error } = await supabase.rpc('exec_sql', { sql: dropPolicy });
                if (error && !error.message.includes('does not exist')) {
                    console.log('⚠️ Drop policy error:', error.message);
                }
            } catch (e) {
                // Continue even if policy doesn't exist
            }
        }
        
        // Create simple, non-recursive policies
        console.log('✅ Creating new simple policies...');
        
        const newPolicies = [
            // Simple select policy: users can read their own record
            `CREATE POLICY "users_select_own" ON users FOR SELECT USING (auth.uid() = id);`,
            
            // Simple update policy: users can update their own record
            `CREATE POLICY "users_update_own" ON users FOR UPDATE USING (auth.uid() = id);`,
            
            // Simple insert policy: allow authenticated users to insert
            `CREATE POLICY "users_insert_auth" ON users FOR INSERT WITH CHECK (auth.uid() = id);`
        ];
        
        for (const policy of newPolicies) {
            try {
                const { error } = await supabase.rpc('exec_sql', { sql: policy });
                if (error) {
                    console.log('❌ Create policy error:', error.message);
                } else {
                    console.log('✅ Policy created successfully');
                }
            } catch (e) {
                console.log('❌ Policy creation failed:', e.message);
            }
        }
        
        console.log('\n🧪 Testing user access after policy fix...');
        
        // Test with regular authentication
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: 'test@test.com',
            password: 'test123'
        });
        
        if (authError) {
            console.log('❌ Auth error:', authError.message);
            return;
        }
        
        console.log('✅ Auth successful, testing user query...');
        
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', authData.user.id)
            .single();
            
        if (userError) {
            console.log('❌ User query error:', userError.message);
        } else {
            console.log('✅ User query successful!');
            console.log('User data:', userData);
        }
        
        await supabase.auth.signOut();
        
    } catch (error) {
        console.error('💥 Unexpected error:', error);
    }
}

fixPolicies().catch(console.error);
