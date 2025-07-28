import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get('parentId');
    
    if (!parentId) {
      return NextResponse.json(
        { error: 'Parent ID is required' },
        { status: 400 }
      );
    }

    // Use service role to bypass RLS and get scouts by parent
    const { data: scouts, error } = await supabase
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
