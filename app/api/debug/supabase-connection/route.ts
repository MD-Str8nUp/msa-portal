import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    console.log('🔗 Supabase Connection Debug Started');
    
    // Test environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing Supabase environment variables',
        details: {
          hasUrl: !!supabaseUrl,
          hasKey: !!supabaseKey
        }
      }, { status: 500 });
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('🔗 Testing basic connection...');
    
    // Test basic connection by querying users table
    const { data: usersTest, error: usersError } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });

    console.log('🔗 Users table test result:', { usersTest, usersError });

    // Test specific user lookup
    const { data: specificUser, error: specificError } = await supabase
      .from('users')
      .select('id, email, role, password')
      .limit(1)
      .single();

    console.log('🔗 Specific user test result:', { 
      hasData: !!specificUser, 
      hasPassword: !!specificUser?.password,
      error: specificError 
    });

    return NextResponse.json({
      success: true,
      connection_tests: {
        environment_variables: {
          url_available: !!supabaseUrl,
          key_available: !!supabaseKey,
          url_format_valid: supabaseUrl?.startsWith('https://') || false
        },
        database_access: {
          users_table_accessible: !usersError,
          users_count: usersTest || 0,
          users_error: usersError?.message || null,
          sample_user_found: !!specificUser,
          sample_user_has_password: !!specificUser?.password,
          specific_error: specificError?.message || null
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Supabase connection test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Supabase connection test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
