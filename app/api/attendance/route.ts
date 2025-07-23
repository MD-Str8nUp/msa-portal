import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const scoutId = searchParams.get('scoutId');
    const eventId = searchParams.get('eventId');
    
    let query = supabase
      .from('attendance')
      .select(`
        *,
        scout:scouts(id, first_name, last_name),
        event:events(id, title, start_date)
      `);

    if (scoutId) {
      query = query.eq('scout_id', scoutId);
    }
    
    if (eventId) {
      query = query.eq('event_id', eventId);
    }

    const { data: attendance, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching attendance:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch attendance'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: attendance || []
    });

  } catch (error) {
    console.error('❌ Error in attendance GET:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { scoutId, eventId, status = 'PRESENT', notes } = body;

    if (!scoutId || !eventId) {
      return NextResponse.json({
        success: false,
        error: 'Scout ID and Event ID are required'
      }, { status: 400 });
    }

    const { data: newAttendance, error } = await supabase
      .from('attendance')
      .insert({
        scout_id: scoutId,
        event_id: eventId,
        status,
        notes,
        date: new Date().toISOString()
      })
      .select(`
        *,
        scout:scouts(id, first_name, last_name),
        event:events(id, title, start_date)
      `)
      .single();

    if (error) {
      console.error('❌ Error creating attendance:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to create attendance record'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Attendance recorded successfully',
      data: newAttendance
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Error in attendance POST:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
