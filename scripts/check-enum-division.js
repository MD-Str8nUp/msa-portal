#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;  
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkDivisionEnum() {
  console.log('🔍 Checking division enum values...');
  
  try {
    // Get existing scouts to see what division values exist
    const { data: scouts, error } = await supabase
      .from('scouts')
      .select('division')
      .limit(10);
      
    if (scouts && scouts.length > 0) {
      const uniqueDivisions = [...new Set(scouts.map(s => s.division))];
      console.log('✅ Existing division values:', uniqueDivisions);
    }
    
    // Test creating scout with different division values
    const testDivisions = ['joeys', 'cubs', 'scouts', 'Joeys', 'Cubs', 'Scouts'];
    
    for (const division of testDivisions) {
      try {
        const { data, error } = await supabase
          .from('scouts')
          .insert({
            first_name: 'Test',
            last_name: 'Scout',
            age: 8,
            group_id: '5b40dfcc-93c5-4804-99b3-d72b58e5f6a9', // Using existing scout group
            parent_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479', // Fake parent ID for test
            division: division
          })
          .select()
          .single();
          
        if (error) {
          console.log(`❌ Division "${division}": ${error.message}`);
        } else {
          console.log(`✅ Division "${division}": Works!`);
          // Clean up test record
          await supabase.from('scouts').delete().eq('id', data.id);
        }
      } catch (err) {
        console.log(`❌ Division "${division}": ${err.message}`);
      }
    }
    
    // Check available scout groups that correspond to Joeys age range
    const { data: scoutGroups } = await supabase
      .from('scout_groups')
      .select('*');
      
    console.log('\n📋 All scout groups:');
    scoutGroups.forEach(g => {
      console.log(`   - ${g.name} (${g.id})`);
    });
    
  } catch (error) {
    console.error('❌ Check failed:', error);
  }
}

checkDivisionEnum();