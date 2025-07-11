const { createClient } = require('@supabase/supabase-js');

async function testWithoutRLS() {
    const supabaseUrl = "https://munqzgxhluteurttlydq.supabase.co";
    const serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11bnF6Z3hobHV0ZXVydHRseWRxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzg4OTI3MSwiZXhwIjoyMDYzNDY1MjcxfQ.qsEXF-9rtg1z4FAiJHVqjn7WiP_N6G3ObjjuHy5dPho";
    
    console.log('🛡️ Testing login without RLS policies...');
    
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    
    try {
        // Test login with anon key first
        const anonSupabase = createClient(supabaseUrl, "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11bnF6Z3hobHV0ZXVydHRseWRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4ODkyNzEsImV4cCI6MjA2MzQ2NTI3MX0.eUe393-WnrurxjW7jNqnYWdSLV5kqPrUcXRPauRwY5k");
        
        console.log('🔐 Testing login...');
        const { data: authData, error: authError } = await anonSupabase.auth.signInWithPassword({
            email: 'test@test.com',
            password: 'test123'
        });
        
        if (authError) {
            console.log('❌ Auth error:', authError.message);
            return;
        }
        
        console.log('✅ Login successful!');
        console.log('User ID:', authData.user.id);
        
        // Now try to query the user with service role (bypasses RLS)
        console.log('📊 Querying user with service role (bypasses RLS)...');
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', authData.user.id)
            .single();
            
        if (userError) {
            console.log('❌ Service role user query error:', userError.message);
        } else {
            console.log('✅ Service role can access user data:');
            console.log('  - Full name:', userData.full_name);
            console.log('  - Role:', userData.role);
            console.log('  - Email:', userData.email);
        }
        
        // Try with the authenticated user's token
        console.log('🔍 Trying with authenticated user token...');
        const userSupabase = createClient(supabaseUrl, "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11bnF6Z3hobHV0ZXVydHRseWRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4ODkyNzEsImV4cCI6MjA2MzQ2NTI3MX0.eUe393-WnrurxjW7jNqnYWdSLV5kqPrUcXRPauRwY5k");
        
        // Set the session
        await userSupabase.auth.setSession({
            access_token: authData.session.access_token,
            refresh_token: authData.session.refresh_token
        });
        
        const { data: userDataAuth, error: userErrorAuth } = await userSupabase
            .from('users')
            .select('*')
            .eq('id', authData.user.id)
            .single();
            
        if (userErrorAuth) {
            console.log('❌ Authenticated user query error:', userErrorAuth.message);
            console.log('This confirms the RLS policy issue');
        } else {
            console.log('✅ Authenticated user can access their data!');
        }
        
        await anonSupabase.auth.signOut();
        
    } catch (error) {
        console.error('💥 Unexpected error:', error);
    }
}

testWithoutRLS().catch(console.error);
