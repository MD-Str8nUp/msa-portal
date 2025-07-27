import { NextRequest, NextResponse } from 'next/server';
import { supabase, getAdminClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');

    const supabase = getAdminClient();
    let query = supabase
      .from('scouts')
      .select(`
        *,
        group:groups(id, name, type),
        parent:users(id, first_name, last_name, email, phone)
      `);

    // Apply filters
    if (groupId) {
      query = query.eq('group_id', groupId);
    }

    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%`);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: scouts, error, count } = await query
      .range(from, to)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching scouts:', error);
      return NextResponse.json(
        { error: 'Failed to fetch scouts' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      scouts: scouts || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Error in scouts GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = getAdminClient();
    
    const {
      firstName,
      lastName,
      dateOfBirth,
      age,
      gender,
      school,
      uniformSizeTop,
      uniformSizeBottom,
      allergiesMedical,
      parentId,
      groupId,
      status = 'ACTIVE'
    } = body;

    // Validate required fields
    if (!firstName || !lastName || !parentId || !groupId) {
      return NextResponse.json(
        { error: 'Missing required fields: firstName, lastName, parentId, groupId' },
        { status: 400 }
      );
    }

    // Verify parent exists
    const { data: parent, error: parentError } = await supabase
      .from('users')
      .select('id')
      .eq('id', parentId)
      .single();

    if (parentError || !parent) {
      return NextResponse.json(
        { error: 'Invalid parent ID' },
        { status: 400 }
      );
    }

    // Verify group exists
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('id')
      .eq('id', groupId)
      .single();

    if (groupError || !group) {
      return NextResponse.json(
        { error: 'Invalid group ID' },
        { status: 400 }
      );
    }

    // Create scout
    const { data: newScout, error } = await supabase
      .from('scouts')
      .insert({
        first_name: firstName,
        last_name: lastName,
        date_of_birth: dateOfBirth,
        age: parseInt(age) || null,
        gender,
        school,
        uniform_size_top: uniformSizeTop,
        uniform_size_bottom: uniformSizeBottom,
        allergies_medical: allergiesMedical,
        parent_id: parentId,
        group_id: groupId,
        status
      })
      .select(`
        *,
        group:groups(id, name, type),
        parent:users(id, first_name, last_name, email, phone)
      `)
      .single();

    if (error) {
      console.error('Error creating scout:', error);
      return NextResponse.json(
        { error: 'Failed to create scout' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Scout created successfully',
      scout: newScout
    }, { status: 201 });

  } catch (error) {
    console.error('Error in scouts POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;
    const supabase = getAdminClient();

    if (!id) {
      return NextResponse.json(
        { error: 'Scout ID is required' },
        { status: 400 }
      );
    }

    // Convert camelCase to snake_case for database
    const dbData: any = {};
    for (const [key, value] of Object.entries(updateData)) {
      switch (key) {
        case 'firstName':
          dbData.first_name = value;
          break;
        case 'lastName':
          dbData.last_name = value;
          break;
        case 'dateOfBirth':
          dbData.date_of_birth = value;
          break;
        case 'uniformSizeTop':
          dbData.uniform_size_top = value;
          break;
        case 'uniformSizeBottom':
          dbData.uniform_size_bottom = value;
          break;
        case 'allergiesMedical':
          dbData.allergies_medical = value;
          break;
        case 'parentId':
          dbData.parent_id = value;
          break;
        case 'groupId':
          dbData.group_id = value;
          break;
        default:
          dbData[key] = value;
      }
    }

    dbData.updated_at = new Date().toISOString();

    const { data: updatedScout, error } = await supabase
      .from('scouts')
      .update(dbData)
      .eq('id', id)
      .select(`
        *,
        group:groups(id, name, type),
        parent:users(id, first_name, last_name, email, phone)
      `)
      .single();

    if (error) {
      console.error('Error updating scout:', error);
      return NextResponse.json(
        { error: 'Failed to update scout' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Scout updated successfully',
      scout: updatedScout
    });

  } catch (error) {
    console.error('Error in scouts PUT:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const supabase = getAdminClient();

    if (!id) {
      return NextResponse.json(
        { error: 'Scout ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('scouts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting scout:', error);
      return NextResponse.json(
        { error: 'Failed to delete scout' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Scout deleted successfully'
    });

  } catch (error) {
    console.error('Error in scouts DELETE:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
