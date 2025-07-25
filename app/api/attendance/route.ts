import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const scoutId = searchParams.get('scoutId');
    const eventId = searchParams.get('eventId');
    const date = searchParams.get('date');
    const groupId = searchParams.get('groupId');
    
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

    if (date) {
      query = query.eq('date', date);
    }

    if (groupId) {
      query = query.eq('group_id', groupId);
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
    const { 
      scout_id, 
      scoutId, 
      event_id, 
      eventId, 
      status = 'PRESENT', 
      notes, 
      date,
      group_id,
      groupId,
      leader_id,
      leaderId 
    } = body;

    // Support both snake_case and camelCase
    const finalScoutId = scout_id || scoutId;
    const finalEventId = event_id || eventId;
    const finalGroupId = group_id || groupId;
    const finalLeaderId = leader_id || leaderId;
    const finalDate = date || new Date().toISOString().split('T')[0];

    if (!finalScoutId) {
      return NextResponse.json({
        success: false,
        error: 'Scout ID is required'
      }, { status: 400 });
    }

    // Check if attendance record already exists for this scout and date
    const { data: existingRecord } = await supabase
      .from('attendance')
      .select('id')
      .eq('scout_id', finalScoutId)
      .eq('date', finalDate)
      .maybeSingle();

    let result;
    if (existingRecord) {
      // Update existing record
      const { data: updatedAttendance, error } = await supabase
        .from('attendance')
        .update({
          status,
          notes,
          group_id: finalGroupId,
          leader_id: finalLeaderId,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingRecord.id)
        .select(`
          *,
          scout:scouts(id, first_name, last_name)
        `)
        .single();
      
      result = { data: updatedAttendance, error };
    } else {
      // Create new record
      const { data: newAttendance, error } = await supabase
        .from('attendance')
        .insert({
          scout_id: finalScoutId,
          event_id: finalEventId,
          status,
          notes,
          date: finalDate,
          group_id: finalGroupId,
          leader_id: finalLeaderId,
          created_at: new Date().toISOString()
        })
        .select(`
          *,
          scout:scouts(id, first_name, last_name)
        `)
        .single();
      
      result = { data: newAttendance, error };
    }

    if (result.error) {
      console.error('❌ Error saving attendance:', result.error);
      return NextResponse.json({
        success: false,
        error: 'Failed to save attendance record'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: existingRecord ? 'Attendance updated successfully' : 'Attendance recorded successfully',
      data: result.data
    }, { status: existingRecord ? 200 : 201 });

  } catch (error) {
    console.error('❌ Error in attendance POST:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
