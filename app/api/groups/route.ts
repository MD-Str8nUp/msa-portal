import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const leaderId = searchParams.get('leaderId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    console.log('Groups API: Fetching groups with filters:', { search, type, status, leaderId, page, limit });

    const supabase = getAdminClient();
    // Query scout_groups table with scouts data
    let query = supabase
      .from('scout_groups')
      .select(`
        *,
        scouts(id, first_name, last_name, age, gender)
      `);

    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (type) {
      query = query.eq('division', type);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (leaderId) {
      query = query.eq('leader_id', leaderId);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: groups, error, count } = await query
      .range(from, to)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Groups API: Error fetching groups:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch groups'
      }, { status: 500 });
    }

    console.log('Groups API: Groups fetched successfully');

    return NextResponse.json({
      success: true,
      data: {
        groups: groups || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          pages: Math.ceil((count || 0) / limit)
        }
      }
    });

  } catch (error) {
    console.error('Groups API: Error in groups GET:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = getAdminClient();
    const {
      name,
      description,
      type = 'SCOUTS',
      status = 'ACTIVE',
      location,
      meetingTime,
      capacity
    } = body;

    console.log('Groups API: Creating new group:', { name, type });

    if (!name) {
      return NextResponse.json({
        success: false,
        error: 'Group name is required'
      }, { status: 400 });
    }

    // Create group
    const { data: newGroup, error } = await supabase
      .from('scout_groups')
      .insert({
        name,
        description,
        division: type,
        status,
        location,
        meeting_time: meetingTime,
        capacity,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Groups API: Error creating group:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to create group'
      }, { status: 500 });
    }

    console.log('Groups API: Group created successfully');

    return NextResponse.json({
      success: true,
      message: 'Group created successfully',
      data: newGroup
    }, { status: 201 });

  } catch (error) {
    console.error('Groups API: Error in groups POST:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}