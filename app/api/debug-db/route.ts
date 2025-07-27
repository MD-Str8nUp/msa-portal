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

    // Check what tables exist using RPC call
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_table_names');

    // Get users from users table if it exists
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, role, status')
      .limit(5);

    // Get all profiles to see different user types
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, name, role, temp_password')
      .limit(15);

    return NextResponse.json({
      success: true,
      tables: tables?.map((t: any) => t.table_name) || [],
      tablesError: tablesError?.message,
      users: users || [],
      usersError: usersError?.message,
      profiles: profiles || [],
      profilesError: profilesError?.message
    });

  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error
    }, { status: 500 });
  }
}