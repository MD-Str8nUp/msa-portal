import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Get all users to see what's in the database
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, role, status, password')
      .limit(10);

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      users: users?.map(user => ({
        ...user,
        password: user.password ? `${user.password.substring(0, 10)}...` : 'NO PASSWORD'
      }))
    });

  } catch (error) {
    console.error('Error in test-users:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}