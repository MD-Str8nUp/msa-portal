import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    console.log('Groups API: Fetching groups with filters:', { search, type, status, page, limit });

    const supabase = getAdminClient();
    // Try basic groups query first
    let query = supabase
      .from('groups')
      .select('*');

    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (type) {
      query = query.eq('type', type);
    }

    if (status) {
      query = query.eq('status', status);
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
      .from('groups')
      .insert({
        name,
        description,
        type,
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