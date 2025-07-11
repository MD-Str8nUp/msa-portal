const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testLoginFromBrowser() {
  try {
    console.log('🔍 Testing browser-like login...\n');

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    console.log('1️⃣ Attempting Supabase Auth login...');
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'test@test.com',
      password: 'test123',
    });

    if (error) {
      console.error('❌ Supabase Auth Error:', error);
      return;
    }

    console.log('✅ Supabase Auth successful!');
    console.log('   User:', data.user.email);
    console.log('   Session:', data.session ? 'Active' : 'None');

    console.log('\n2️⃣ Testing session persistence...');
    const { data: sessionData } = await supabase.auth.getSession();
    console.log('   Session check:', sessionData.session ? 'Valid' : 'Invalid');

    console.log('\n3️⃣ Checking if user details can be fetched...');
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

    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (userError) {
      console.error('❌ User fetch error:', userError);
    } else {
      console.log('✅ User data fetched successfully');
      console.log('   Role:', userData.role);
      console.log('   View Mode:', userData.current_view_mode);
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

testLoginFromBrowser();
