import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create service role client that bypasses RLS
const supabaseServiceRole = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get('parentId');
    
    if (!parentId) {
      return NextResponse.json(
        { error: 'Parent ID is required' },
        { status: 400 }
      );
    }

    // Use service role to bypass RLS and get scouts by parent
    const { data: scouts, error } = await supabaseServiceRole
      .from('scouts')
      .select(`
        *,
        group:scout_groups!group_id(name, division, meeting_day, meeting_time)
      `)
      .eq('parent_id', parentId)
      .order('first_name');

    if (error) {
      console.error('Error fetching scouts by parent:', error);
      return NextResponse.json(
        { error: 'Failed to fetch scouts' },
        { status: 500 }
      );
    }

    return NextResponse.json({ scouts: scouts || [] });
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
