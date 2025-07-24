import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    console.log('🔐 Testing auth for:', email, 'with password:', password);

    // Test direct query to profiles table
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      return NextResponse.json({
        success: false,
        error: 'User not found',
        details: error.message
      });
    }

    // Check password match
    const passwordMatch = profile.temp_password === password;

    return NextResponse.json({
      success: true,
      userFound: !!profile,
      passwordMatch,
      userDetails: {
        email: profile.email,
        name: profile.name,
        role: profile.role,
        temp_password: profile.temp_password,
        is_active: profile.is_active
      }
    });

  } catch (error) {
    console.error('❌ Test auth error:', error);
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      details: error.message
    }, { status: 500 });
  }
}