import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create service role client that bypasses RLS
const supabaseServiceRole = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    // Use service role to bypass RLS and get all events
    const { data: events, error } = await supabaseServiceRole
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
