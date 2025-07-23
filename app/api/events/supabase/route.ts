import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const supabase = getAdminClient();
    // Use service role to bypass RLS and get all events
    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .order('start_date');

    if (error) {
      console.error('Error fetching events from Supabase:', error);
      return NextResponse.json(
        { error: 'Failed to fetch events' },
        { status: 500 }
      );
    }

    return NextResponse.json({ events: events || [] });
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
