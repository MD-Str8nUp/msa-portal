import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    console.log('👥 Fetching users data...', { role, search, page, limit });

    // Build where clause
    const whereClause: any = {};
    
    if (role) {
      if (role === 'parent') {
        whereClause.isParent = true;
      } else if (role === 'leader') {
        whereClause.isLeader = true;
      } else if (role === 'executive') {
        whereClause.isExecutive = true;
      } else if (role === 'support') {
        whereClause.isSupport = true;
      } else {
        whereClause.role = role;
      }
    }
    
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Get total count
    const totalUsers = await prisma.user.count({ where: whereClause });

    // Get paginated users
    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        isParent: true,
        isLeader: true,
        isExecutive: true,
        isSupport: true,
        createdAt: true,
        lastSeen: true,
        isOnline: true,
        scouts: {
          select: {
            id: true,
            name: true,
            age: true,
            group: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        leaderGroups: {
          select: {
            group: {
              select: {
                id: true,
                name: true
              }
            },
            role: true
          }
        }
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        name: 'asc'
      }
    });

    console.log('✅ Users retrieved:', users.length);

    return NextResponse.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total: totalUsers,
        totalPages: Math.ceil(totalUsers / limit)
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Users API error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch users data',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, role, isParent, isLeader, isExecutive, isSupport } = body;
    
    console.log('👤 Creating new user:', { name, email, role });

    // Validate required fields
    if (!name || !email || !password || !role) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: name, email, password, role'
      }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({
        success: false,
        error: 'User with this email already exists'
      }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role,
        isParent: isParent || role === 'parent',
        isLeader: isLeader || role === 'leader',
        isExecutive: isExecutive || role === 'executive',
        isSupport: isSupport || role === 'support',
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${name}`
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        isParent: true,
        isLeader: true,
        isExecutive: true,
        isSupport: true,
        createdAt: true
      }
    });

    console.log('✅ New user created:', newUser.id);

    return NextResponse.json({
      success: true,
      data: newUser,
      message: `User "${name}" created successfully`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ User creation error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to create user',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, email, password, role, isParent, isLeader, isExecutive, isSupport } = body;
    
    console.log('📝 Updating user:', { id });

    // Validate required fields
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Missing required field: id'
      }, { status: 400 });
    }

    // Build update data
    const updateData: any = {};
    
    if (name) updateData.name = name;
    if (email) updateData.email = email.toLowerCase();
    if (password) updateData.password = await bcrypt.hash(password, 10);
    if (role) updateData.role = role;
    if (typeof isParent === 'boolean') updateData.isParent = isParent;
    if (typeof isLeader === 'boolean') updateData.isLeader = isLeader;
    if (typeof isExecutive === 'boolean') updateData.isExecutive = isExecutive;
    if (typeof isSupport === 'boolean') updateData.isSupport = isSupport;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        isParent: true,
        isLeader: true,
        isExecutive: true,
        isSupport: true,
        updatedAt: true
      }
    });

    console.log('✅ User updated:', updatedUser.id);

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: `User "${updatedUser.name}" updated successfully`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ User update error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to update user',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    console.log('🗑️ Deleting user:', { id });

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameter: id'
      }, { status: 400 });
    }

    // Check if user has scouts (if parent)
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        scouts: true
      }
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }

    if (user.scouts.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Cannot delete parent with active scouts. Please reassign scouts first.'
      }, { status: 409 });
    }

    await prisma.user.delete({
      where: { id }
    });

    console.log('✅ User deleted:', id);

    return NextResponse.json({
      success: true,
      message: `User "${user.name}" deleted successfully`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ User deletion error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to delete user',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}