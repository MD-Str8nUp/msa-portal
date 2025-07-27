import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase';
import * as bcrypt from 'bcryptjs';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const role = searchParams.get('role');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    console.log('👥 Fetching users with filters:', { search, role, status, page, limit });

    const supabase = getAdminClient();
    let query = supabase
      .from('users')
      .select(`
        *,
        user_groups:user_groups(
          group:groups(id, name, type)
        ),
        scouts:scouts(count)
      `);

    // Apply filters
    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    if (role) {
      query = query.eq('role', role);
    }

    if (status) {
      query = query.eq('status', status);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: users, error, count } = await query
      .range(from, to)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching users:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch users'
      }, { status: 500 });
    }

    console.log('✅ Users fetched successfully');

    return NextResponse.json({
      success: true,
      data: {
        users: users || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          pages: Math.ceil((count || 0) / limit)
        }
      }
    });

  } catch (error) {
    console.error('❌ Error in users GET:', error);
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
      email,
      firstName,
      lastName,
      phone,
      password,
      role = 'PARENT',
      status = 'ACTIVE',
      avatar,
      groupIds = []
    } = body;

    console.log('➕ Creating new user:', { email, firstName, lastName, role });

    if (!email || !firstName || !lastName || !password) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: email, firstName, lastName, password'
      }, { status: 400 });
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json({
        success: false,
        error: 'User with this email already exists'
      }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        email,
        first_name: firstName,
        last_name: lastName,
        phone,
        password: hashedPassword,
        role,
        status,
        avatar,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating user:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to create user'
      }, { status: 500 });
    }

    // Add user to groups if specified
    if (groupIds.length > 0) {
      const userGroupInserts = groupIds.map((groupId: string) => ({
        user_id: newUser.id,
        group_id: groupId,
        role: 'MEMBER',
        created_at: new Date().toISOString()
      }));

      const { error: groupError } = await supabase
        .from('user_groups')
        .insert(userGroupInserts);

      if (groupError) {
        console.error('❌ Error adding user to groups:', groupError);
      }
    }

    console.log('✅ User created successfully');

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      data: newUser
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Error in users POST:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, password, ...updateData } = body;
    const supabase = getAdminClient();

    console.log('🔄 Updating user:', { id });

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required'
      }, { status: 400 });
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
        default:
          dbData[key] = value;
      }
    }

    // Hash password if provided
    if (password) {
      dbData.password = await bcrypt.hash(password, 10);
    }

    dbData.updated_at = new Date().toISOString();

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(dbData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating user:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to update user'
      }, { status: 500 });
    }

    console.log('✅ User updated successfully');

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    });

  } catch (error) {
    console.error('❌ Error in users PUT:', error);
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
    const supabase = getAdminClient();

    console.log('🗑️ Deleting user:', { id });

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required'
      }, { status: 400 });
    }

    // Check if user has scouts
    const { data: scouts } = await supabase
      .from('scouts')
      .select('id')
      .eq('parent_id', id)
      .limit(1);

    if (scouts && scouts.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Cannot delete user with active scouts'
      }, { status: 400 });
    }

    // Delete user (this will cascade delete user_groups)
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Error deleting user:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to delete user'
      }, { status: 500 });
    }

    console.log('✅ User deleted successfully');

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error in users DELETE:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
