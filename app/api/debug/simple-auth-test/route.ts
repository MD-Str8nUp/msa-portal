import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    console.log('🧪 Simple Auth Test Started');
    console.log('🧪 Test email:', email);
    console.log('🧪 Test password length:', password?.length);

    // Environment check
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing environment variables',
        stage: 'environment_check'
      }, { status: 500 });
    }

    console.log('🧪 Environment variables OK');

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('🧪 Supabase client created');

    // Test 1: Direct hardcoded user test
    if (email === 'test@example.com' && password === 'test123') {
      console.log('🧪 Hardcoded test user - SUCCESS');
      return NextResponse.json({
        success: true,
        message: 'Hardcoded test successful',
        stage: 'hardcoded_test',
        user: {
          id: 'test-123',
          email: 'test@example.com',
          name: 'Test User',
          role: 'PARENT'
        }
      });
    }

    // Test 2: Database query without authentication
    console.log('🧪 Testing database query...');
    
    const { data: allUsers, error: queryError } = await supabase
      .from('users')
      .select('id, email, role')
      .limit(5);

    if (queryError) {
      console.error('🧪 Database query failed:', queryError);
      return NextResponse.json({
        success: false,
        error: 'Database query failed',
        stage: 'database_query',
        details: queryError.message
      }, { status: 500 });
    }

    console.log('🧪 Database query successful. Found', allUsers?.length, 'users');

    // Test 3: Lookup specific user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (userError || !user) {
      console.log('🧪 User not found in database');
      return NextResponse.json({
        success: false,
        error: 'User not found',
        stage: 'user_lookup',
        available_users: allUsers?.map(u => u.email) || [],
        details: userError?.message
      }, { status: 404 });
    }

    console.log('🧪 User found:', user.email);
    console.log('🧪 User has password field:', !!user.password);
    console.log('🧪 Password starts with:', user.password?.substring(0, 10));

    // Test 4: Simple password tests
    const passwordTests = {
      plain_text_match: password === user.password,
      temp_password_match: password === user.temp_password,
      test123_match: password === 'test123',
      email_prefix_match: password === email.split('@')[0]
    };

    console.log('🧪 Password tests:', passwordTests);

    // Test 5: Bcrypt test if available
    let bcryptTest = null;
    if (user.password && user.password.startsWith('$2')) {
      try {
        bcryptTest = await bcrypt.compare(password, user.password);
        console.log('🧪 Bcrypt test result:', bcryptTest);
      } catch (bcryptError) {
        console.error('🧪 Bcrypt test error:', bcryptError);
        bcryptTest = 'ERROR: ' + (bcryptError instanceof Error ? bcryptError.message : 'Unknown');
      }
    }

    // Determine if authentication should succeed
    const authSuccess = passwordTests.plain_text_match || 
                       passwordTests.temp_password_match || 
                       passwordTests.test123_match || 
                       passwordTests.email_prefix_match ||
                       bcryptTest === true;

    console.log('🧪 Final auth result:', authSuccess);

    return NextResponse.json({
      success: authSuccess,
      message: authSuccess ? 'Authentication successful' : 'Authentication failed',
      stage: 'complete',
      debug_info: {
        user_found: true,
        user_email: user.email,
        user_role: user.role,
        has_password: !!user.password,
        has_temp_password: !!user.temp_password,
        password_tests: passwordTests,
        bcrypt_test: bcryptTest,
        total_users_in_db: allUsers?.length
      },
      user: authSuccess ? {
        id: user.id,
        email: user.email,
        name: user.full_name || `${user.first_name} ${user.last_name}` || user.name,
        role: user.role?.toUpperCase() || 'PARENT'
      } : null
    });

  } catch (error) {
    console.error('❌ Simple auth test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Simple auth test failed',
      stage: 'exception',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Simple auth test endpoint. Use POST with { email, password }',
    test_credentials: {
      hardcoded: 'test@example.com / test123',
      instructions: 'Try any real user email from your database'
    }
  });
}
