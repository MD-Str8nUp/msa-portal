import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');
    const groupIds = searchParams.get('groupIds');
    const status = searchParams.get('status');
    const upcoming = searchParams.get('upcoming') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    console.log('📅 Fetching events with filters:', { groupId, groupIds, status, upcoming, page, limit });

    let query = supabase
      .from('events')
      .select(`
        *,
        group:scout_groups(id, name, division)
      `);

    // Apply filters
    if (groupId) {
      query = query.eq('group_id', groupId);
    } else if (groupIds) {
      const groupIdArray = groupIds.split(',').filter(id => id.trim());
      if (groupIdArray.length > 0) {
        query = query.in('group_id', groupIdArray);
      }
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (upcoming) {
      query = query.gte('start_date', new Date().toISOString());
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: events, error, count } = await query
      .range(from, to)
      .order('start_date', { ascending: upcoming });

    if (error) {
      console.error('❌ Error fetching events:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch events'
      }, { status: 500 });
    }

    console.log('✅ Events fetched successfully');

    return NextResponse.json({
      success: true,
      data: {
        events: events || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          pages: Math.ceil((count || 0) / limit)
        }
      }
    });

  } catch (error) {
    console.error('❌ Error in events GET:', error);
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
      title,
      description,
      startDate,
      endDate,
      location,
      type = 'MEETING',
      status = 'SCHEDULED',
      groupId,
      maxAttendees,
      requiresRsvp = false
    } = body;

    console.log('➕ Creating new event:', { title, type, groupId });

    if (!title || !startDate || !groupId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: title, startDate, groupId'
      }, { status: 400 });
    }

    // Verify group exists
    const { data: group } = await supabase
      .from('scout_groups')
      .select('id')
      .eq('id', groupId)
      .single();

    if (!group) {
      return NextResponse.json({
        success: false,
        error: 'Invalid group ID'
      }, { status: 400 });
    }

    // Create event
    const { data: newEvent, error } = await supabase
      .from('events')
      .insert({
        title,
        description,
        start_date: startDate,
        end_date: endDate,
        location,
        type,
        status,
        group_id: groupId,
        max_attendees: maxAttendees ? parseInt(maxAttendees) : null,
        requires_rsvp: requiresRsvp,
        created_at: new Date().toISOString()
      })
      .select(`
        *,
        group:scout_groups(id, name, division)
      `)
      .single();

    if (error) {
      console.error('❌ Error creating event:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to create event'
      }, { status: 500 });
    }

    console.log('✅ Event created successfully');

    return NextResponse.json({
      success: true,
      message: 'Event created successfully',
      data: newEvent
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Error in events POST:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    console.log('🔄 Updating event:', { id });

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Event ID is required'
      }, { status: 400 });
    }

    // Convert camelCase to snake_case for database
    const dbData: any = {};
    for (const [key, value] of Object.entries(updateData)) {
      switch (key) {
        case 'startDate':
          dbData.start_date = value;
          break;
        case 'endDate':
          dbData.end_date = value;
          break;
        case 'groupId':
          dbData.group_id = value;
          break;
        case 'maxAttendees':
          dbData.max_attendees = value ? parseInt(value as string) : null;
          break;
        case 'requiresRsvp':
          dbData.requires_rsvp = value;
          break;
        default:
          dbData[key] = value;
      }
    }

    dbData.updated_at = new Date().toISOString();

    const { data: updatedEvent, error } = await supabase
      .from('events')
      .update(dbData)
      .eq('id', id)
      .select(`
        *,
        group:scout_groups(id, name, division)
      `)
      .single();

    if (error) {
      console.error('❌ Error updating event:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to update event'
      }, { status: 500 });
    }

    console.log('✅ Event updated successfully');

    return NextResponse.json({
      success: true,
      message: 'Event updated successfully',
      data: updatedEvent
    });

  } catch (error) {
    console.error('❌ Error in events PUT:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    console.log('🗑️ Deleting event:', { id });

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Event ID is required'
      }, { status: 400 });
    }

    // Delete event (this will cascade delete attendance records)
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Error deleting event:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to delete event'
      }, { status: 500 });
    }

    console.log('✅ Event deleted successfully');

    return NextResponse.json({
      success: true,
      message: 'Event deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error in events DELETE:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
