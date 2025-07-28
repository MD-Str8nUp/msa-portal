import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔍 Environment Debug Check Started');
    
    const envCheck = {
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_SUPABASE_URL: {
        exists: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        length: process.env.NEXT_PUBLIC_SUPABASE_URL?.length || 0,
        starts_with: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) + '...' || 'N/A'
      },
      NEXT_PUBLIC_SUPABASE_ANON_KEY: {
        exists: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        length: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
        starts_with: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...' || 'N/A'
      },
      SUPABASE_SERVICE_ROLE_KEY: {
        exists: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        length: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0,
        starts_with: process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20) + '...' || 'N/A'
      },
      all_env_keys: Object.keys(process.env).filter(key => 
        key.includes('SUPABASE') || key.includes('NEXT_PUBLIC')
      ),
      timestamp: new Date().toISOString()
    };

    console.log('🔍 Environment Check Result:', JSON.stringify(envCheck, null, 2));

    return NextResponse.json({
      success: true,
      environment: envCheck,
      message: 'Environment variables check completed'
    });

  } catch (error) {
    console.error('❌ Environment check error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to check environment variables',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
