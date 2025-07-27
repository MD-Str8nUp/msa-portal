import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'Email is required'
      }, { status: 400 });
    }

    // Create server-side Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Get user from users table (not profiles)
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('status', 'ACTIVE')
      .single();

    if (error || !user) {
      console.log('❌ User not found or inactive:', email, error?.message);
      return NextResponse.json({
        success: false,
        error: 'User not found or inactive'
      }, { status: 404 });
    }

    // Map to expected user structure for AuthContext
    const userResponse = {
      id: user.id,
      email: user.email,
      name: user.full_name || `${user.first_name} ${user.last_name}` || user.name,
      role: user.role?.toUpperCase() || 'PARENT',
      phone: user.phone,
      first_name: user.first_name || user.name?.split(' ')[0] || '',
      last_name: user.last_name || user.name?.split(' ').slice(1).join(' ') || '',
      is_also_leader: user.is_also_leader || false,
      is_also_parent: user.is_also_parent || false,
      current_view_mode: user.current_view_mode || 'parent',
      status: user.status
    };

    return NextResponse.json({
      success: true,
      user: userResponse
    });

  } catch (error) {
    console.error('❌ Error fetching user:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}