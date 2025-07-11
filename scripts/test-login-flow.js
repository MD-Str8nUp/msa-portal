const { createClient } = require('@supabase/supabase-js');

async function testCompleteLoginFlow() {
    const supabaseUrl = "https://munqzgxhluteurttlydq.supabase.co";
    const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11bnF6Z3hobHV0ZXVydHRseWRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4ODkyNzEsImV4cCI6MjA2MzQ2NTI3MX0.eUe393-WnrurxjW7jNqnYWdSLV5kqPrUcXRPauRwY5k";
    
    console.log('🔄 Testing complete login flow...');
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    try {
        // Step 1: Login
        console.log('1️⃣ Step 1: Attempting login...');
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: 'test@test.com',
            password: 'test123'
        });
        
        if (authError) {
            console.log('❌ Login failed:', authError.message);
            return;
        }
        
        console.log('✅ Login successful!');
        console.log('   User ID:', authData.user.id);
        console.log('   User email:', authData.user.email);
        
        // Step 2: Fetch user details via API (simulating what the app does)
        console.log('2️⃣ Step 2: Fetching user details via API...');
        const fetch = (await import('node-fetch')).default;
        
        const response = await fetch(`http://localhost:3000/api/user?userId=${authData.user.id}`);
        
        if (!response.ok) {
            console.log('❌ API request failed:', response.status, response.statusText);
            return;
        }
        
        const userData = await response.json();
        console.log('✅ User details fetched successfully!');
        console.log('   Full name:', userData.user.full_name);
        console.log('   Role:', userData.user.role);
        console.log('   Current view mode:', userData.user.current_view_mode);
        
        // Step 3: Determine redirect URL
        console.log('3️⃣ Step 3: Determining redirect...');
        let redirectUrl;
        switch (userData.user.role) {
            case "parent":
                redirectUrl = "/parent/dashboard";
                break;
            case "leader":
                redirectUrl = "/leader/dashboard";
                break;
            case "exec":
            case "executive":
                redirectUrl = "/executive/dashboard";
                break;
            default:
                redirectUrl = "/parent/dashboard";
        }
        
        console.log('🎯 Should redirect to:', redirectUrl);
        
        // Step 4: Test if the redirect URL exists
        console.log('4️⃣ Step 4: Testing redirect URL...');
        const redirectResponse = await fetch(`http://localhost:3000${redirectUrl}`);
        
        if (redirectResponse.ok) {
            console.log('✅ Dashboard page accessible!');
            console.log('🎉 Complete login flow should work!');
        } else {
            console.log('❌ Dashboard page not accessible:', redirectResponse.status);
        }
        
        // Clean up
        await supabase.auth.signOut();
        console.log('🚪 Signed out');
        
    } catch (error) {
        console.error('💥 Unexpected error:', error);
    }
}

testCompleteLoginFlow().catch(console.error);
