const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function createTestUser() {
  try {
    console.log('🔐 Creating simple test user...');

    // Create a simple test user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'test@test.com',
      password: 'test123',
      email_confirm: true,
      user_metadata: {
        name: 'Test User',
        role: 'parent'
      }
    });

    if (authError) {
      console.error('❌ Error creating auth user:', authError.message);
      return;
    }

    console.log(`✅ Test user created: test@test.com / test123`);
    console.log(`   User ID: ${authData.user.id}`);
    console.log('   Try logging in with these credentials!');

  } catch (error) {
    console.error('💥 Error:', error);
  }
}

createTestUser();
