import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

export async function POST() {
  try {
    console.log('👥 Creating test users for authentication debugging...');
    
    // Environment check
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing environment variables'
      }, { status: 500 });
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('👥 Creating bcrypt hashes...');
    
    // Create password hashes
    const testHash = await bcrypt.hash('test123', 10);
    const adminHash = await bcrypt.hash('MSA@Admin2025!', 10);
    
    console.log('👥 Test hash created:', testHash.substring(0, 20) + '...');
    console.log('👥 Admin hash created:', adminHash.substring(0, 20) + '...');

    // Test users to create
    const testUsers = [
      {
        first_name: 'Test',
        last_name: 'User',
        email: 'test@test.com',
        password: testHash,
        role: 'PARENT',
        status: 'ACTIVE',
        phone: '(555) 000-0001'
      },
      {
        first_name: 'Admin',
        last_name: 'User', 
        email: 'admin@msaportal.com',
        password: adminHash,
        role: 'EXECUTIVE',
        status: 'ACTIVE',
        phone: '(555) 000-0002'
      },
      {
        first_name: 'Test',
        last_name: 'Leader',
        email: 'leader@test.com',
        password: testHash,
        role: 'LEADER',
        status: 'ACTIVE',
        phone: '(555) 000-0003'
      },
      {
        first_name: 'Test',
        last_name: 'Parent',
        email: 'parent@test.com',
        password: testHash,
        role: 'PARENT',
        status: 'ACTIVE',
        phone: '(555) 000-0004'
      }
    ];

    console.log('👥 Inserting', testUsers.length, 'test users...');

    // Insert test users
    const { data: insertedUsers, error: insertError } = await supabase
      .from('users')
      .upsert(testUsers, { 
        onConflict: 'email',
        ignoreDuplicates: false 
      })
      .select('id, email, role, first_name, last_name');

    if (insertError) {
      console.error('👥 Insert error:', insertError);
      return NextResponse.json({
        success: false,
        error: 'Failed to insert users',
        details: insertError.message
      }, { status: 500 });
    }

    console.log('👥 Successfully created/updated', insertedUsers?.length || 0, 'users');

    // Verify users were created by counting
    const { count, error: countError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('👥 Count error:', countError);
    } else {
      console.log('👥 Total users in database:', count);
    }

    // Test authentication with one of the created users
    console.log('👥 Testing authentication with test@test.com...');
    
    const { data: testUser, error: testError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'test@test.com')
      .single();

    let authTestResult = null;
    if (!testError && testUser) {
      try {
        const passwordMatch = await bcrypt.compare('test123', testUser.password);
        authTestResult = {
          user_found: true,
          password_match: passwordMatch,
          user_role: testUser.role
        };
      } catch (bcryptTestError) {
        authTestResult = {
          user_found: true,
          password_match: false,
          bcrypt_error: bcryptTestError instanceof Error ? bcryptTestError.message : 'Unknown'
        };
      }
    } else {
      authTestResult = {
        user_found: false,
        error: testError?.message
      };
    }

    return NextResponse.json({
      success: true,
      message: 'Test users created/updated successfully',
      results: {
        users_created: insertedUsers?.length || 0,
        total_users_in_db: count || 0,
        test_credentials: {
          'test@test.com': 'test123',
          'admin@msaportal.com': 'MSA@Admin2025!',
          'leader@test.com': 'test123',
          'parent@test.com': 'test123'
        },
        authentication_test: authTestResult,
        created_users: insertedUsers || []
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Create test users error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create test users',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Create test users endpoint. Use POST to create test users.',
    note: 'This will create test users needed for authentication debugging'
  });
}
