const { createClient } = require('@supabase/supabase-js');

async function checkTables() {
    const supabaseUrl = "https://munqzgxhluteurttlydq.supabase.co";
    const serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11bnF6Z3hobHV0ZXVydHRseWRxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzg4OTI3MSwiZXhwIjoyMDYzNDY1MjcxfQ.qsEXF-9rtg1z4FAiJHVqjn7WiP_N6G3ObjjuHy5dPho";
    
    console.log('🔍 Checking available tables in Supabase...');
    
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    
    try {
        // Check users table (we know this exists)
        console.log('\n📊 Checking users table...');
        const { data: usersData, error: usersError } = await supabase
            .from('users')
            .select('id, email, full_name, role')
            .limit(3);
            
        if (usersError) {
            console.log('❌ Users table error:', usersError.message);
        } else {
            console.log('✅ Users table accessible, sample data:');
            console.log(usersData);
        }
        
        // Check scouts table
        console.log('\n🏕️ Checking scouts table...');
        const { data: scoutsData, error: scoutsError } = await supabase
            .from('scouts')
            .select('*')
            .limit(3);
            
        if (scoutsError) {
            console.log('❌ Scouts table error:', scoutsError.message);
        } else {
            console.log('✅ Scouts table accessible, sample data:');
            console.log(scoutsData);
        }
        
        // Check events table
        console.log('\n📅 Checking events table...');
        const { data: eventsData, error: eventsError } = await supabase
            .from('events')
            .select('*')
            .limit(3);
            
        if (eventsError) {
            console.log('❌ Events table error:', eventsError.message);
        } else {
            console.log('✅ Events table accessible, sample data:');
            console.log(eventsData);
        }
        
        // Check scout_groups table
        console.log('\n👥 Checking scout_groups table...');
        const { data: groupsData, error: groupsError } = await supabase
            .from('scout_groups')
            .select('*')
            .limit(3);
            
        if (groupsError) {
            console.log('❌ Scout_groups table error:', groupsError.message);
        } else {
            console.log('✅ Scout_groups table accessible, sample data:');
            console.log(groupsData);
        }
        
    } catch (error) {
        console.error('💥 Unexpected error:', error);
    }
}

checkTables().catch(console.error);
