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

async function createAuthUsers() {
  try {
    console.log('🔐 Creating Supabase Auth users...');

    const testUsers = [
      {
        email: 'admin@msa.com',
        password: 'password',
        role: 'executive',
        name: 'Admin User'
      },
      {
        email: 'leader@msa.com', 
        password: 'password',
        role: 'leader',
        name: 'Leader User'
      },
      {
        email: 'parent@msa.com',
        password: 'password', 
        role: 'parent',
        name: 'Parent User'
      },
      {
        email: 'amal_aouli281@hotmail.com',
        password: 'password',
        role: 'parent',
        name: 'Amal Aouli'
      },
      {
        email: 'sarah.droubi@hotmail.com',
        password: 'password',
        role: 'executive', 
        name: 'Sarah Droubi'
      }
    ];

    for (const user of testUsers) {
      console.log(`Creating auth user: ${user.email}`);
      
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          name: user.name,
          role: user.role
        }
      });

      if (authError) {
        console.error(`❌ Error creating auth user ${user.email}:`, authError.message);
        continue;
      }

      console.log(`✅ Auth user created: ${user.email} (ID: ${authData.user.id})`);

      // Create/update user record in users table
      const { error: dbError } = await supabase
        .from('users')
        .upsert({
          id: authData.user.id,
          email: user.email,
          first_name: user.name.split(' ')[0],
          last_name: user.name.split(' ')[1] || '',
          role: user.role,
          current_view_mode: user.role
        });

      if (dbError) {
        console.error(`❌ Error creating/updating user record ${user.email}:`, dbError.message);
      } else {
        console.log(`✅ User record created/updated: ${user.email}`);
      }
    }

    console.log('🎉 Auth users creation complete!');
    console.log('\n📝 Test Login Credentials:');
    testUsers.forEach(user => {
      console.log(`   ${user.role.toUpperCase()}: ${user.email} / password`);
    });

  } catch (error) {
    console.error('💥 Error creating auth users:', error);
  }
}

createAuthUsers();
