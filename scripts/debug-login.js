const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

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

async function debugLogin() {
  try {
    console.log('🔍 Debugging login process...\n');

    // Test credentials
    const email = 'test@test.com';
    const password = 'test123';

    console.log('1️⃣ Testing authentication with Supabase Auth...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      console.error('❌ Authentication failed:', authError.message);
      return;
    }

    console.log('✅ Authentication successful!');
    console.log('   User ID:', authData.user.id);
    console.log('   Email:', authData.user.email);

    console.log('\n2️⃣ Checking if user exists in users table...');
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (userError) {
      console.error('❌ Error fetching user from users table:', userError.message);
      
      if (userError.code === 'PGRST116') {
        console.log('\n🚨 PROBLEM FOUND: User exists in Supabase Auth but NOT in users table!');
        console.log('   This is why login is failing.');
        
        console.log('\n3️⃣ Creating user record in users table...');
        const { data: insertData, error: insertError } = await supabaseAdmin
          .from('users')
          .insert([
            {
              id: authData.user.id,
              email: authData.user.email,
              username: 'testuser',
              first_name: 'Test',
              last_name: 'User',
              role: 'parent',
              current_view_mode: 'parent',
              is_also_leader: false,
              is_also_parent: true
            }
          ])
          .select()
          .single();

        if (insertError) {
          console.error('❌ Error inserting user:', insertError.message);
        } else {
          console.log('✅ User record created in users table!');
          console.log('   User details:', insertData);
        }
      }
      return;
    }

    console.log('✅ User found in users table!');
    console.log('   User details:', userData);

    console.log('\n🎉 Login should work now! Try logging in with:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

debugLogin();
