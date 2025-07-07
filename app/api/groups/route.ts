import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const withStats = searchParams.get('withStats') === 'true';
    const leaderId = searchParams.get('leaderId');
    
    console.log('📊 Fetching groups data...', { withStats, leaderId });

    const whereClause = leaderId ? {
      groupLeaders: {
        some: {
          userId: leaderId
        }
      }
    } : {};

    const groups = await prisma.group.findMany({
      where: whereClause,
      include: {
        scouts: withStats,
        groupLeaders: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true
              }
            }
          }
        },
        events: {
          where: {
            startDate: {
              gte: new Date()
            }
          },
          take: 5,
          orderBy: {
            startDate: 'asc'
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Calculate stats if requested
    const groupsWithStats = groups.map(group => {
      const stats = withStats ? {
        totalScouts: group.scouts.length,
        activeScouts: group.scouts.filter(s => s.createdAt > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)).length,
        totalLeaders: group.groupLeaders.length,
        upcomingEvents: group.events.length
      } : undefined;

      return {
        ...group,
        stats,
        // Remove scouts array from response if stats were calculated
        scouts: withStats ? undefined : group.scouts
      };
    });

    console.log('✅ Groups retrieved:', groups.length);

    return NextResponse.json({
      success: true,
      data: groupsWithStats,
      count: groups.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Groups API error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch groups data',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description } = body;
    
    console.log('📦 Creating new group:', { name });

    // Validate required fields
    if (!name) {
      return NextResponse.json({
        success: false,
        error: 'Missing required field: name'
      }, { status: 400 });
    }

    // Check if group already exists
    const existingGroup = await prisma.group.findUnique({
      where: { name }
    });

    if (existingGroup) {
      return NextResponse.json({
        success: false,
        error: 'Group with this name already exists'
      }, { status: 409 });
    }

    const newGroup = await prisma.group.create({
      data: {
        name,
        description: description || `${name} scout group`
      }
    });

    console.log('✅ New group created:', newGroup.id);

    return NextResponse.json({
      success: true,
      data: newGroup,
      message: `Group "${name}" created successfully`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Group creation error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to create group',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, description } = body;
    
    console.log('📝 Updating group:', { id });

    // Validate required fields
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Missing required field: id'
      }, { status: 400 });
    }

    const updatedGroup = await prisma.group.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description && { description })
      }
    });

    console.log('✅ Group updated:', updatedGroup.id);

    return NextResponse.json({
      success: true,
      data: updatedGroup,
      message: `Group "${updatedGroup.name}" updated successfully`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Group update error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to update group',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    console.log('🗑️ Deleting group:', { id });

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameter: id'
      }, { status: 400 });
    }

    // Check if group has scouts
    const group = await prisma.group.findUnique({
      where: { id },
      include: {
        scouts: true
      }
    });

    if (!group) {
      return NextResponse.json({
        success: false,
        error: 'Group not found'
      }, { status: 404 });
    }

    if (group.scouts.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Cannot delete group with active scouts. Please reassign scouts first.'
      }, { status: 409 });
    }

    await prisma.group.delete({
      where: { id }
    });

    console.log('✅ Group deleted:', id);

    return NextResponse.json({
      success: true,
      message: `Group "${group.name}" deleted successfully`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Group deletion error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to delete group',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}