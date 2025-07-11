const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function testInsert() {
  try {
    console.log('🔍 Testing user insertion...\n');

    const testUser = {
      id: '8f117bc3-d03b-4a2e-a19e-8751854ca797', // Use the existing auth user ID
      email: 'test@test.com',
      username: 'testuser',
      first_name: 'Test',
      last_name: 'User',
      role: 'parent',
      current_view_mode: 'parent',
      is_also_leader: false,
      is_also_parent: true
    };

    console.log('1️⃣ Trying insert without full_name...');
    let { data, error } = await supabaseAdmin
      .from('users')
      .insert([testUser])
      .select()
      .single();

    if (error) {
      console.log('❌ Insert failed:', error.message);
      
      // Try with full_name
      console.log('\n2️⃣ Trying insert with full_name...');
      testUser.full_name = `${testUser.first_name} ${testUser.last_name}`;
      
      ({ data, error } = await supabaseAdmin
        .from('users')
        .insert([testUser])
        .select()
        .single());
        
      if (error) {
        console.log('❌ Insert with full_name failed:', error.message);
        
        // Try without specifying full_name at all (maybe it's generated)
        console.log('\n3️⃣ Trying insert without full_name field...');
        delete testUser.full_name;
        
        ({ data, error } = await supabaseAdmin
          .from('users')
          .insert([testUser])
          .select()
          .single());
          
        if (error) {
          console.log('❌ All insert attempts failed:', error.message);
        } else {
          console.log('✅ Insert successful without full_name field!');
          console.log('📋 Inserted user:', data);
        }
      } else {
        console.log('✅ Insert successful with full_name!');
        console.log('📋 Inserted user:', data);
      }
    } else {
      console.log('✅ Insert successful without full_name!');
      console.log('📋 Inserted user:', data);
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

testInsert();
