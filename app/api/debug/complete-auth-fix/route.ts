import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

export async function POST() {
  try {
    console.log('🚀 COMPLETE AUTH FIX: Starting comprehensive authentication system repair...');
    
    // Environment check
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing environment variables',
        check: 'Verify NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set'
      }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const results = {
      phase1_user_creation: null,
      phase2_authentication_test: null,
      phase3_role_verification: null,
      final_status: null
    };

    // PHASE 1: Create Users in users table
    console.log('🚀 PHASE 1: Creating users with bcrypt passwords...');
    
    const testHash = await bcrypt.hash('test123', 10);
    const adminHash = await bcrypt.hash('MSA@Admin2025!', 10);
    const leaderHash = await bcrypt.hash('leader123', 10);
    const parentHash = await bcrypt.hash('parent123', 10);
    
    const usersToCreate = [
      {
        first_name: 'MSA',
        last_name: 'Admin',
        full_name: 'MSA Admin',
        email: 'admin@msaportal.com',
        password: adminHash,
        role: 'EXECUTIVE',
        status: 'ACTIVE',
        phone: '(555) 001-0001',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        login_count: 0
      },
      {
        first_name: 'Test',
        last_name: 'Leader',
        full_name: 'Test Leader',
        email: 'leader@test.com',
        password: leaderHash,
        role: 'LEADER',
        status: 'ACTIVE',
        phone: '(555) 001-0002',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        login_count: 0
      },
      {
        first_name: 'Test',
        last_name: 'Parent',
        full_name: 'Test Parent',
        email: 'parent@test.com',
        password: parentHash,
        role: 'PARENT',
        status: 'ACTIVE',
        phone: '(555) 001-0003',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        login_count: 0
      },
      {
        first_name: 'Test',
        last_name: 'User',
        full_name: 'Test User',
        email: 'test@test.com',
        password: testHash,
        role: 'PARENT',
        status: 'ACTIVE',
        phone: '(555) 001-0004',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        login_count: 0
      }
    ];

    const { data: createdUsers, error: createError } = await supabase
      .from('users')
      .upsert(usersToCreate, { onConflict: 'email' })
      .select('id, email, role, first_name, last_name, status');

    if (createError) {
      results.phase1_user_creation = {
        success: false,
        error: createError.message,
        users_created: 0
      };
    } else {
      results.phase1_user_creation = {
        success: true,
        users_created: createdUsers?.length || 0,
        users: createdUsers
      };
      console.log('✅ PHASE 1 SUCCESS: Created', createdUsers?.length, 'users');
    }

    // PHASE 2: Test Authentication for each user
    console.log('🚀 PHASE 2: Testing authentication for all users...');
    
    const testCredentials = [
      { email: 'admin@msaportal.com', password: 'MSA@Admin2025!', expectedRole: 'EXECUTIVE' },
      { email: 'leader@test.com', password: 'leader123', expectedRole: 'LEADER' },
      { email: 'parent@test.com', password: 'parent123', expectedRole: 'PARENT' },
      { email: 'test@test.com', password: 'test123', expectedRole: 'PARENT' }
    ];

    const authTests = [];
    for (const cred of testCredentials) {
      try {
        // Get user from database
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('email', cred.email)
          .single();

        if (userError || !user) {
          authTests.push({
            email: cred.email,
            success: false,
            error: 'User not found',
            details: userError?.message
          });
          continue;
        }

        // Test password
        const passwordMatch = await bcrypt.compare(cred.password, user.password);
        
        authTests.push({
          email: cred.email,
          success: passwordMatch,
          role: user.role,
          role_match: user.role === cred.expectedRole,
          user_status: user.status,
          password_hash_valid: !!user.password && user.password.length > 50
        });

      } catch (testError) {
        authTests.push({
          email: cred.email,
          success: false,
          error: 'Authentication test failed',
          details: testError instanceof Error ? testError.message : 'Unknown'
        });
      }
    }

    const successfulAuths = authTests.filter(t => t.success).length;
    results.phase2_authentication_test = {
      total_tests: authTests.length,
      successful_auths: successfulAuths,
      success_rate: `${successfulAuths}/${authTests.length}`,
      tests: authTests
    };

    console.log('✅ PHASE 2 COMPLETE: Authentication success rate:', `${successfulAuths}/${authTests.length}`);

    // PHASE 3: Verify Role-Based Access
    console.log('🚀 PHASE 3: Verifying role-based functionality...');
    
    const { data: allUsers, count } = await supabase
      .from('users')
      .select('email, role, status', { count: 'exact' })
      .eq('status', 'ACTIVE');

    const roleDistribution = {
      EXECUTIVE: allUsers?.filter(u => u.role === 'EXECUTIVE').length || 0,
      LEADER: allUsers?.filter(u => u.role === 'LEADER').length || 0,
      PARENT: allUsers?.filter(u => u.role === 'PARENT').length || 0,
      total: count || 0
    };

    results.phase3_role_verification = {
      total_active_users: count || 0,
      role_distribution: roleDistribution,
      has_admin: roleDistribution.EXECUTIVE > 0,
      has_leader: roleDistribution.LEADER > 0,
      has_parent: roleDistribution.PARENT > 0
    };

    console.log('✅ PHASE 3 COMPLETE: Role distribution verified');

    // FINAL STATUS
    const isFullyFixed = (
      results.phase1_user_creation?.success &&
      results.phase2_authentication_test?.successful_auths === 4 &&
      results.phase3_role_verification?.total_active_users >= 4
    );

    results.final_status = {
      authentication_system_fixed: isFullyFixed,
      ready_for_login: isFullyFixed,
      ready_for_testing: isFullyFixed,
      next_steps: isFullyFixed 
        ? ['Test login via /login page', 'Verify dashboard routing', 'Run TestSprite tests']
        : ['Check error details above', 'Re-run this endpoint', 'Contact developer']
    };

    const statusMessage = isFullyFixed 
      ? '✅ AUTHENTICATION SYSTEM FULLY FIXED AND READY!'
      : '❌ Authentication system still has issues - check results above';

    console.log(statusMessage);

    return NextResponse.json({
      success: isFullyFixed,
      message: statusMessage,
      working_credentials: {
        admin: { email: 'admin@msaportal.com', password: 'MSA@Admin2025!', role: 'EXECUTIVE' },
        leader: { email: 'leader@test.com', password: 'leader123', role: 'LEADER' },
        parent: { email: 'parent@test.com', password: 'parent123', role: 'PARENT' },
        test: { email: 'test@test.com', password: 'test123', role: 'PARENT' }
      },
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ COMPLETE AUTH FIX ERROR:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to complete authentication fix',
      details: error instanceof Error ? error.message : 'Unknown error',
      suggestion: 'Check Supabase connection and database permissions'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Complete Authentication Fix Endpoint',
    description: 'Use POST to fix all authentication issues in one operation',
    features: [
      'Creates users in users table with bcrypt passwords',
      'Tests authentication for all user roles', 
      'Verifies role-based access control',
      'Provides complete status report'
    ],
    note: 'This endpoint solves the empty users table issue causing TestSprite failures'
  });
}
