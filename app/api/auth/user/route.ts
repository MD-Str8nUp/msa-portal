import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required'
      }, { status: 400 });
    }

    // Get user data
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        *,
        user_groups:user_groups(
          group:groups(id, name, type)
        ),
        scouts:scouts(id, first_name, last_name, age, group:groups(name))
      `)
      .eq('id', userId)
      .single();

    if (error || !user) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      data: userWithoutPassword
    });

  } catch (error) {
    console.error('❌ Error fetching user:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
