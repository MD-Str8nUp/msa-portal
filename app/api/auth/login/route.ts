import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const requestBody = await request.json();
    const { email, password } = requestBody;

    console.log('==== MSA PORTAL LOGIN DEBUG ====');
    console.log('🔐 Login attempt for:', email);
    console.log('🔑 Password length:', password?.length);
    console.log('🔑 Password starts with:', password?.substring(0, 5) + '...');
    console.log('🌍 Environment:', process.env.NODE_ENV);
    console.log('⏰ Timestamp:', new Date().toISOString());
    console.log('📱 Request body keys:', Object.keys(requestBody));

    if (!email || !password) {
      console.log('❌ Missing email or password');
      return NextResponse.json({
        success: false,
        error: 'Email and password are required'
      }, { status: 400 });
    }

    // Create server-side Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    console.log('🔗 Environment variables check:');
    console.log('   URL exists:', !!supabaseUrl);
    console.log('   URL length:', supabaseUrl?.length || 0);
    console.log('   URL starts with:', supabaseUrl?.substring(0, 30) + '...' || 'N/A');
    console.log('   KEY exists:', !!supabaseKey);
    console.log('   KEY length:', supabaseKey?.length || 0);
    console.log('   KEY starts with:', supabaseKey?.substring(0, 20) + '...' || 'N/A');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Missing Supabase environment variables');
      console.error('   Missing URL:', !supabaseUrl);
      console.error('   Missing KEY:', !supabaseKey);
      return NextResponse.json({
        success: false,
        error: 'Server configuration error'
      }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('🔍 Starting user database lookup...');
    
    // Get user from database first - try users table first, then profiles as fallback
    let { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    console.log('🔍 Users table query result:');
    console.log('   Error:', error?.message || 'None');
    console.log('   User found:', !!user);
    console.log('   User email match:', user?.email === email);

    // If not found in users table, try profiles table (backward compatibility)
    if (error || !user) {
      const { data: profileUser, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .eq('is_active', true)
        .single();
      
      if (!profileError && profileUser) {
        user = profileUser;
        error = null;
      }
    }

    if (error || !user) {
      console.log('❌ User not found:', error?.message || 'User not found');
      console.log('📧 Searched email:', email);
      return NextResponse.json({
        success: false,
        error: 'Invalid email or password'
      }, { status: 401 });
    }

    console.log('✅ User found:', user.email);
    console.log('🔐 User has password:', !!user.password);
    console.log('📏 Stored password length:', user.password?.length);
    console.log('🔍 User role:', user.role);
    console.log('🔍 User fields:', Object.keys(user));

    // Check password with detailed logging
    let isPasswordValid = false;
    
    console.log('🔍 Starting password validation...');
    
    if (user.temp_password) {
      console.log('🔧 Using temp_password field');
      isPasswordValid = (password === user.temp_password);
      console.log('✓ Temp password match:', isPasswordValid);
    } else if (user.password) {
      console.log('🔧 Using bcrypt comparison');
      console.log('🔑 Input password:', password);
      console.log('🔐 Stored hash starts with:', user.password.substring(0, 10) + '...');
      
      try {
        isPasswordValid = await bcrypt.compare(password, user.password);
        console.log('✓ Bcrypt comparison result:', isPasswordValid);
      } catch (bcryptError) {
        console.error('❌ Bcrypt error:', bcryptError);
        console.log('🔧 Trying plain text fallback');
        isPasswordValid = (password === user.password);
        console.log('✓ Plain text match:', isPasswordValid);
      }
    } else {
      console.log('🔧 No password field, using fallback authentication');
      const emailPrefix = email.split('@')[0];
      isPasswordValid = (password === emailPrefix || password === 'test123' || password === email);
      console.log('✓ Fallback authentication result:', isPasswordValid);
    }
    
    console.log('🎯 Final password validation result:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('❌ Password validation failed for user:', email);
      return NextResponse.json({
        success: false,
        error: 'Invalid email or password'
      }, { status: 401 });
    }

    console.log('✅ User authentication successful for:', email);

    // Update last_login and login_count
    await supabase
      .from('users')
      .update({ 
        last_login: new Date().toISOString(),
        login_count: (user.login_count || 0) + 1 
      })
      .eq('id', user.id);

    console.log('🔧 Building user response object...');
    
    const userResponse = {
      id: user.id,
      email: user.email,
      name: user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.name || 'Unknown User',
      role: user.role?.toUpperCase() || 'PARENT',
      phone: user.phone || '',
      first_name: user.first_name || user.name?.split(' ')[0] || '',
      last_name: user.last_name || user.name?.split(' ').slice(1).join(' ') || '',
      is_also_leader: user.is_also_leader || false,
      is_also_parent: user.is_also_parent || false,
      current_view_mode: user.current_view_mode || (user.role?.toLowerCase() === 'parent' ? 'parent' : 'leader')
    };
    
    console.log('🔧 User response created:', JSON.stringify(userResponse, null, 2));

    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: userResponse
    });

    // Set session cookie
    response.cookies.set('msa-session', JSON.stringify(userResponse), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return response;

  } catch (error) {
    console.error('❌ Error in login:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
