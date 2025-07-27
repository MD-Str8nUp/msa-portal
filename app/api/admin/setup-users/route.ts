import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST() {
  try {
    console.log('🔧 Setting up initial users...');
    
    // Create server-side Supabase admin client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Missing Supabase environment variables');
      return NextResponse.json({
        success: false,
        error: 'Server configuration error'
      }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Define users according to BMAD brief requirements
    const usersToCreate = [
      {
        email: 'admin@msaportal.com',
        password: 'MSA@Admin2025!',
        first_name: 'MSA',
        last_name: 'Administrator',
        role: 'EXECUTIVE'
      },
      {
        email: 'leader@msaportal.com', 
        password: 'Leader@2025!',
        first_name: 'Scout',
        last_name: 'Leader',
        role: 'LEADER'
      },
      {
        email: 'leader1@msaportal.com',
        password: 'Leader1@2025!',
        first_name: 'Leader',
        last_name: 'Parent',
        role: 'LEADER1'
      },
      {
        email: 'parent@msaportal.com',
        password: 'Parent@2025!',
        first_name: 'Scout',
        last_name: 'Parent',
        role: 'PARENT'
      }
    ];

    const results = [];

    for (const userData of usersToCreate) {
      try {
        console.log(`Creating user: ${userData.email}`);
        
        // Create user in Supabase Auth
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: userData.email,
          password: userData.password,
          email_confirm: true
        });

        if (authError) {
          console.error(`❌ Auth error for ${userData.email}:`, authError.message);
          results.push({
            email: userData.email,
            success: false,
            error: authError.message
          });
          continue;
        }

        // Create user profile in users table
        const { error: profileError } = await supabaseAdmin
          .from('users')
          .insert({
            id: authData.user!.id,
            first_name: userData.first_name,
            last_name: userData.last_name,
            email: userData.email,
            password: 'hashed_password_placeholder', // Not used for auth
            role: userData.role,
            status: 'ACTIVE'
          });

        if (profileError) {
          console.error(`❌ Profile error for ${userData.email}:`, profileError.message);
          // Clean up auth user if profile creation failed
          await supabaseAdmin.auth.admin.deleteUser(authData.user!.id);
          results.push({
            email: userData.email,
            success: false,
            error: `Profile creation failed: ${profileError.message}`
          });
          continue;
        }

        console.log(`✅ User created successfully: ${userData.email}`);
        results.push({
          email: userData.email,
          success: true,
          role: userData.role
        });

      } catch (error) {
        console.error(`❌ Unexpected error for ${userData.email}:`, error);
        results.push({
          email: userData.email,
          success: false,
          error: 'Unexpected error'
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    
    return NextResponse.json({
      success: true,
      message: `Created ${successCount}/${usersToCreate.length} users`,
      results
    });

  } catch (error) {
    console.error('❌ Error in user setup:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}