import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const { email, password, role, name } = await request.json();

    if (!email || !password || !role || !name) {
      return NextResponse.json({
        success: false,
        error: 'Email, password, role, and name are required'
      }, { status: 400 });
    }

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

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (authError) {
      console.error('❌ Auth user creation error:', authError.message);
      return NextResponse.json({
        success: false,
        error: authError.message
      }, { status: 400 });
    }

    if (!authData.user) {
      return NextResponse.json({
        success: false,
        error: 'Failed to create auth user'
      }, { status: 500 });
    }

    // Create user profile in users table
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        full_name: name,
        role: role.toUpperCase(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (profileError) {
      console.error('❌ Profile creation error:', profileError.message);
      // Try to clean up the auth user if profile creation failed
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({
        success: false,
        error: `Profile creation failed: ${profileError.message}`
      }, { status: 500 });
    }

    console.log('✅ User created successfully:', email);

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        name,
        role
      }
    });

  } catch (error) {
    console.error('❌ Error creating user:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}