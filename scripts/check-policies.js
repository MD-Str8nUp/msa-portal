const { createClient } = require('@supabase/supabase-js');

async function checkPolicies() {
    const supabaseUrl = "https://munqzgxhluteurttlydq.supabase.co";
    const serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11bnF6Z3hobHV0ZXVydHRseWRxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzg4OTI3MSwiZXhwIjoyMDYzNDY1MjcxfQ.qsEXF-9rtg1z4FAiJHVqjn7WiP_N6G3ObjjuHy5dPho";
    
    console.log('🔍 Checking RLS policies on users table...');
    
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    
    try {
        // Query the policies on the users table
        const { data, error } = await supabase
            .from('pg_policies')
            .select('*')
            .eq('tablename', 'users');
            
        if (error) {
            console.log('❌ Error querying policies:', error.message);
            // Try alternative approach
            console.log('\n🔄 Trying to query users table directly...');
            const { data: testData, error: testError } = await supabase
                .from('users')
                .select('count(*)', { count: 'exact' });
                
            if (testError) {
                console.log('❌ Users table error:', testError.message);
            } else {
                console.log('✅ Users table accessible with service role');
            }
        } else {
            console.log('✅ Policies found:', data);
        }
        
    } catch (error) {
        console.error('💥 Unexpected error:', error);
    }
}

checkPolicies().catch(console.error);
