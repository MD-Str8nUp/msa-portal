const { createClient } = require('@supabase/supabase-js');

async function checkSchema() {
    const supabaseUrl = "https://munqzgxhluteurttlydq.supabase.co";
    const serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11bnF6Z3hobHV0ZXVydHRseWRxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzg4OTI3MSwiZXhwIjoyMDYzNDY1MjcxfQ.qsEXF-9rtg1z4FAiJHVqjn7WiP_N6G3ObjjuHy5dPho";
    
    console.log('🔍 Checking table schemas...');
    
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    
    try {
        // Check scouts table schema by looking at existing data
        console.log('\n🏕️ Checking scouts table schema...');
        const { data: scoutsData, error: scoutsError } = await supabase
            .from('scouts')
            .select('*')
            .limit(1);
            
        if (scoutsError) {
            console.log('❌ Scouts table error:', scoutsError.message);
        } else {
            console.log('✅ Scouts table columns:');
            if (scoutsData.length > 0) {
                console.log(Object.keys(scoutsData[0]));
            }
        }
        
        // Check events table schema
        console.log('\n📅 Checking events table schema...');
        
        // Try to insert a minimal event to see what columns are required/available
        const { data: eventData, error: eventError } = await supabase
            .from('events')
            .insert({
                title: 'Test Event',
                description: 'Schema test',
                start_date: new Date().toISOString(),
                end_date: new Date(Date.now() + 60 * 60 * 1000).toISOString()
            })
            .select();
            
        if (eventError) {
            console.log('❌ Events table error:', eventError.message);
            console.log('This tells us what columns are required/missing');
        } else {
            console.log('✅ Events table insert successful:');
            console.log('Available columns:', Object.keys(eventData[0]));
            
            // Clean up the test event
            await supabase
                .from('events')
                .delete()
                .eq('id', eventData[0].id);
        }
        
    } catch (error) {
        console.error('💥 Unexpected error:', error);
    }
}

checkSchema().catch(console.error);
