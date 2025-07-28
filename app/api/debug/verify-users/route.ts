import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    console.log('🔍 VERIFYING USERS: Checking users table status...');
    
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

    // Check users table
    const { data: users, error: usersError, count } = await supabase
      .from('users')
      .select('id, email, role, first_name, last_name, status, created_at', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (usersError) {
      console.error('🔍 Users query error:', usersError);
      return NextResponse.json({
        success: false,
        error: 'Failed to query users table',
        details: usersError.message
      }, { status: 500 });
    }

    // Check if any users have passwords
    const { data: usersWithPasswords, error: passwordError } = await supabase
      .from('users')
      .select('email, password')
      .not('password', 'is', null);

    const passwordStats = {
      users_with_passwords: usersWithPasswords?.length || 0,
      users_without_passwords: (count || 0) - (usersWithPasswords?.length || 0)
    };

    // Test authentication setup readiness
    const authReadiness = {
      table_exists: !usersError,
      has_users: (count || 0) > 0,
      has_passwords: (usersWithPasswords?.length || 0) > 0,
      ready_for_authentication: !usersError && (count || 0) > 0 && (usersWithPasswords?.length || 0) > 0
    };

    console.log('🔍 Verification complete:');
    console.log('  - Total users:', count);
    console.log('  - Users with passwords:', usersWithPasswords?.length || 0);
    console.log('  - Auth ready:', authReadiness.ready_for_authentication);

    return NextResponse.json({
      success: true,
      message: 'Users table verification complete',
      results: {
        total_users: count || 0,
        password_stats: passwordStats,
        auth_readiness: authReadiness,
        users: users || [],
        sample_users: users?.slice(0, 5) || []
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Verify users error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to verify users table',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
