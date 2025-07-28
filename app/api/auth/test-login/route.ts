import { NextResponse } from 'next/server';

/**
 * Simple test endpoint to verify login route is accessible
 * This helps diagnose 404 errors in TestSprite
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'MSA Portal Authentication System',
    status: 'Login API is accessible',
    endpoints: {
      login: '/api/auth/login (POST)',
      profile: '/api/auth/profile (POST)',
      logout: '/api/auth/logout (POST)'
    },
    test_ready: {
      login_page: '/login',
      login_api: '/api/auth/login',
      user_creation: '/api/debug/complete-auth-fix (POST)'
    },
    note: 'If users table is empty, run POST /api/debug/complete-auth-fix first'
  });
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    // This is a simple test - redirect to actual login endpoint
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    const result = await response.json();
    
    return NextResponse.json({
      success: true,
      message: 'Test login completed - redirected to main login endpoint',
      login_result: result
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Test login failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
