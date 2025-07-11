const { createClient } = require('@supabase/supabase-js');

async function testCompleteLoginFlow() {
    console.log('🔍 Testing complete login flow...');
    
    const supabaseUrl = "https://munqzgxhluteurttlydq.supabase.co";
    const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11bnF6Z3hobHV0ZXVydHRseWRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4ODkyNzEsImV4cCI6MjA2MzQ2NTI3MX0.eUe393-WnrurxjW7jNqnYWdSLV5kqPrUcXRPauRwY5k";
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    try {
        // Step 1: Test authentication
        console.log('\n🔐 Step 1: Testing authentication...');
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: 'test@test.com',
            password: 'test123'
        });
        
        if (authError) {
            console.log('❌ Auth failed:', authError.message);
            return;
        }
        
        console.log('✅ Auth successful!');
        console.log('   User ID:', authData.user.id);
        console.log('   User email:', authData.user.email);
        
        // Step 2: Test API route for user details
        console.log('\n📊 Step 2: Testing API route for user details...');
        
        try {
            const response = await fetch(`http://localhost:3000/api/user?userId=${authData.user.id}`);
            
            if (response.ok) {
                const userData = await response.json();
                console.log('✅ API route working!');
                console.log('   User details:', userData.user);
                console.log('   Role:', userData.user.role);
                
                // Step 3: Determine redirect path
                console.log('\n🎯 Step 3: Determining redirect path...');
                let redirectPath;
                switch (userData.user.role) {
                    case "parent":
                        redirectPath = "/parent/dashboard";
                        break;
                    case "leader":
                        redirectPath = "/leader/dashboard";
                        break;
                    case "exec":
                    case "executive":
                        redirectPath = "/executive/dashboard";
                        break;
                    default:
                        redirectPath = "/parent/dashboard";
                }
                
                console.log('📍 Should redirect to:', redirectPath);
                
                // Step 4: Test if dashboard page is accessible
                console.log('\n🌐 Step 4: Testing dashboard accessibility...');
                const dashboardResponse = await fetch(`http://localhost:3000${redirectPath}`);
                
                if (dashboardResponse.ok) {
                    console.log('✅ Dashboard page is accessible!');
                    console.log('🎉 Complete login flow should work!');
                } else {
                    console.log('❌ Dashboard page not accessible:', dashboardResponse.status);
                }
                
            } else {
                console.log('❌ API route failed:', response.status, response.statusText);
            }
        } catch (fetchError) {
            console.log('❌ API fetch error:', fetchError.message);
        }
        
        // Clean up
        await supabase.auth.signOut();
        console.log('\n🚪 Signed out');
        
    } catch (error) {
        console.error('💥 Unexpected error:', error);
    }
}

testCompleteLoginFlow().catch(console.error);
