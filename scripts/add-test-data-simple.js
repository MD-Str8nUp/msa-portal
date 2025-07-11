const { createClient } = require('@supabase/supabase-js');

async function addTestDataSimple() {
  console.log('🏗️ Adding test data for our test user...');
  
  const supabaseUrl = "https://munqzgxhluteurttlydq.supabase.co";
  const serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11bnF6Z3hobHV0ZXVydHRseWRxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzg4OTI3MSwiZXhwIjoyMDYzNDY1MjcxfQ.qsEXF-9rtg1z4FAiJHVqjn7WiP_N6G3ObjjuHy5dPho";
  
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const testUserId = '8f117bc3-d03b-4a2e-a19e-8751854ca797';
  
  try {
    // Get a group ID
    console.log('📍 Getting scout groups...');
    const { data: groups, error: groupError } = await supabase
      .from('scout_groups')
      .select('*')
      .eq('division', 'Cubs')
      .limit(1);
    
    if (groupError) {
      console.log('❌ Error getting groups:', groupError.message);
      return;
    }
    
    const groupId = groups?.[0]?.id || '39e7f563-3bd2-4f90-be81-8b2f0137ff73';
    console.log('✅ Using group:', groups?.[0]?.name || 'Cubs B', 'ID:', groupId);
    
    // Check if scout already exists
    console.log('\n🔍 Checking if test scout already exists...');
    const { data: existingScouts } = await supabase
      .from('scouts')
      .select('*')
      .eq('parent_id', testUserId);
    
    if (existingScouts && existingScouts.length > 0) {
      console.log('✅ Test scout already exists:', existingScouts[0].first_name, existingScouts[0].last_name);
    } else {
      // Add a test scout
      console.log('🏕️ Adding test scout...');
      const { data: scout, error: scoutError } = await supabase
        .from('scouts')
        .insert({
          parent_id: testUserId,
          group_id: groupId,
          first_name: 'Ahmad',
          last_name: 'Test',
          date_of_birth: '2015-06-15',
          age: 10,
          gender: 'Male',
          school: 'Test School',
          division: 'Cubs',
          allergies: 'None',
          uniform_top: 'Size 12',
          uniform_bottom: 'Size 12',
          application_id: 'TEST_001'
        })
        .select();
      
      if (scoutError) {
        console.log('❌ Error adding scout:', scoutError.message);
        console.log('Full error:', scoutError);
      } else {
        console.log('✅ Scout added successfully:', scout[0].first_name, scout[0].last_name);
      }
    }
    
    // Add sample events
    console.log('\n📅 Adding sample events...');
    const events = [
      {
        title: 'Weekly Cubs Meeting',
        description: 'Regular weekly meeting for Cubs division',
        start_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
        location: 'Scout Hall',
        event_type: 'meeting'
      },
      {
        title: 'Scout Camp Weekend',
        description: 'Weekend camping trip',
        start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Blue Mountains',
        event_type: 'camp'
      }
    ];
    
    for (const event of events) {
      // Check if event already exists
      const { data: existingEvent } = await supabase
        .from('events')
        .select('title')
        .eq('title', event.title)
        .limit(1);
      
      if (existingEvent && existingEvent.length > 0) {
        console.log(`✅ Event already exists: ${event.title}`);
      } else {
        const { error } = await supabase.from('events').insert(event);
        if (error) {
          console.log(`❌ Error adding event: ${event.title}`, error.message);
        } else {
          console.log(`✅ Event added: ${event.title}`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
  
  console.log('\n🎉 Test data setup complete!');
}

addTestDataSimple().catch(console.error);
