import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

export async function POST() {
  try {
    console.log('🔧 FIXING AUTHENTICATION - Creating users in correct table...');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing environment variables'
      }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Create proper bcrypt hashes for known passwords
    const testPassword = await bcrypt.hash('test123', 10);
    const adminPassword = await bcrypt.hash('MSA@Admin2025!', 10);
    const leaderPassword = await bcrypt.hash('Leader@2025!', 10);
    const parentPassword = await bcrypt.hash('Parent@2025!', 10);
    
    console.log('🔧 Password hashes created');

    // Clear existing users first to avoid conflicts
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all users
    
    if (deleteError) {
      console.log('🔧 Delete error (may be expected):', deleteError.message);
    }

    // Create test users with all required fields
    const testUsers = [
      {
        first_name: 'Test',
        last_name: 'User',
        email: 'test@test.com',
        password: testPassword,
        role: 'PARENT',
        phone: '(555) 000-0001'
      },
      {
        first_name: 'MSA',
        last_name: 'Administrator',
        email: 'admin@msaportal.com',
        password: adminPassword,
        role: 'EXECUTIVE',
        phone: '(555) 000-0002'
      },
      {
        first_name: 'Scout',
        last_name: 'Leader',
        email: 'leader@msaportal.com',
        password: leaderPassword,
        role: 'LEADER',
        phone: '(555) 000-0003'
      },
      {
        first_name: 'Scout',
        last_name: 'Parent',
        email: 'parent@msaportal.com',
        password: parentPassword,
        role: 'PARENT',
        phone: '(555) 000-0004'
      }
    ];

    console.log('🔧 Inserting', testUsers.length, 'users into users table...');

    const { data: insertedUsers, error: insertError } = await supabase
      .from('users')
      .insert(testUsers)
      .select('id, email, role, first_name, last_name');

    if (insertError) {
      console.error('🔧 Insert error:', insertError);
      return NextResponse.json({
        success: false,
        error: 'Failed to insert users',
        details: insertError.message,
        hint: 'Check database schema constraints'
      }, { status: 500 });
    }

    console.log('🔧 Successfully created', insertedUsers?.length || 0, 'users');

    // Test authentication immediately
    console.log('🔧 Testing authentication with test@test.com...');
    
    const { data: testUser, error: queryError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'test@test.com')
      .single();

    let authTest = { success: false };
    if (!queryError && testUser) {
      try {
        const passwordMatch = await bcrypt.compare('test123', testUser.password);
        authTest = {
          success: true,
          user_found: true,
          password_match: passwordMatch,
          user_id: testUser.id,
          user_role: testUser.role
        } as any;
      } catch (bcryptError) {
        authTest = {
          success: false,
          user_found: true,
          bcrypt_error: bcryptError instanceof Error ? bcryptError.message : 'Unknown'
        } as any;
      }
    } else {
      authTest = {
        success: false,
        user_found: false,
        query_error: queryError?.message
      } as any;
    }

    // Count total users
    const { count } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      success: true,
      message: 'Authentication system fixed - users created in correct table',
      results: {
        users_created: insertedUsers?.length || 0,
        total_users: count || 0,
        authentication_test: authTest,
        test_credentials: {
          'test@test.com': 'test123',
          'admin@msaportal.com': 'MSA@Admin2025!',
          'leader@msaportal.com': 'Leader@2025!',
          'parent@msaportal.com': 'Parent@2025!'
        },
        next_steps: [
          'Try logging in at: https://msa-portal11.vercel.app/login',
          'Use any of the test credentials above',
          'Authentication should now work properly'
        ]
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Fix auth error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fix authentication',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Authentication fix endpoint. Use POST to create users in correct table.',
    problem: 'Users table is empty, causing all login attempts to fail',
    solution: 'Creates test users with proper bcrypt hashes in users table'
  });
}
