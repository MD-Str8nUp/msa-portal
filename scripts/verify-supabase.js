const { createClient } = require('@supabase/supabase-js');

// Test the Supabase connection
async function verifySupabase() {
    const supabaseUrl = "https://munqzgxhluteurttlydq.supabase.co";
    const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11bnF6Z3hobHV0ZXVydHRseWRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4ODkyNzEsImV4cCI6MjA2MzQ2NTI3MX0.eUe393-WnrurxjW7jNqnYWdSLV5kqPrUcXRPauRwY5k";
    
    console.log('🔍 Testing Supabase connection...');
    console.log('URL:', supabaseUrl);
    console.log('Anon Key:', supabaseAnonKey.substring(0, 20) + '...');
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    try {
        // Test 1: Check auth service availability
        console.log('\n📡 Testing auth service...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
            console.log('❌ Session check error:', sessionError.message);
        } else {
            console.log('✅ Auth service accessible, no active session (expected)');
        }
        
        // Test 2: Try to sign in with test credentials
        console.log('\n🔐 Testing login with test credentials...');
        const { data, error } = await supabase.auth.signInWithPassword({
            email: 'test@test.com',
            password: 'test123'
        });
        
        if (error) {
            console.log('❌ Login error:', error.message);
            console.log('Full error:', error);
        } else {
            console.log('✅ Login successful!');
            console.log('User ID:', data.user?.id);
            console.log('User email:', data.user?.email);
            
            // Test 3: Check user in database
            console.log('\n👤 Checking user in database...');
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('*')
                .eq('id', data.user.id)
                .single();
                
            if (userError) {
                console.log('❌ User fetch error:', userError.message);
            } else {
                console.log('✅ User found in database:', userData);
            }
            
            // Clean up - sign out
            await supabase.auth.signOut();
            console.log('🚪 Signed out');
        }
        
    } catch (error) {
        console.error('💥 Unexpected error:', error);
    }
}

verifySupabase().catch(console.error);
