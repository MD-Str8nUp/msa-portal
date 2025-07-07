import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');
    const upcoming = searchParams.get('upcoming') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    console.log('📅 Fetching events data...', { groupId, upcoming, page, limit });

    // Build where clause
    const whereClause: any = {};
    
    if (groupId) {
      whereClause.groupId = groupId;
    }
    
    if (upcoming) {
      whereClause.startDate = {
        gte: new Date()
      };
    }

    // Get total count
    const totalEvents = await prisma.event.count({ where: whereClause });

    // Get paginated events
    const events = await prisma.event.findMany({
      where: whereClause,
      include: {
        group: {
          select: {
            id: true,
            name: true
          }
        },
        attendances: {
          select: {
            id: true,
            status: true,
            scout: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        startDate: upcoming ? 'asc' : 'desc'
      }
    });

    // Add attendance stats
    const eventsWithStats = events.map(event => ({
      ...event,
      stats: {
        totalAttendees: event.attendances.length,
        present: event.attendances.filter(a => a.status === 'present').length,
        absent: event.attendances.filter(a => a.status === 'absent').length,
        excused: event.attendances.filter(a => a.status === 'excused').length
      }
    }));

    console.log('✅ Events retrieved:', events.length);

    return NextResponse.json({
      success: true,
      data: eventsWithStats,
      pagination: {
        page,
        limit,
        total: totalEvents,
        totalPages: Math.ceil(totalEvents / limit)
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Events API error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch events data',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      title, 
      description, 
      location, 
      startDate, 
      endDate, 
      groupId,
      requiresPermissionSlip 
    } = body;
    
    console.log('📅 Creating new event:', { title });

    // Validate required fields
    if (!title || !location || !startDate || !endDate) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: title, location, startDate, endDate'
      }, { status: 400 });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start >= end) {
      return NextResponse.json({
        success: false,
        error: 'Start date must be before end date'
      }, { status: 400 });
    }

    // Create event
    const newEvent = await prisma.event.create({
      data: {
        title,
        description: description || '',
        location,
        startDate: start,
        endDate: end,
        groupId: groupId || null,
        requiresPermissionSlip: requiresPermissionSlip || false
      },
      include: {
        group: true
      }
    });

    console.log('✅ New event created:', newEvent.id);

    return NextResponse.json({
      success: true,
      data: newEvent,
      message: `Event "${title}" created successfully`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Event creation error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to create event',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { 
      id,
      title, 
      description, 
      location, 
      startDate, 
      endDate, 
      groupId,
      requiresPermissionSlip 
    } = body;
    
    console.log('📝 Updating event:', { id });

    // Validate required fields
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Missing required field: id'
      }, { status: 400 });
    }

    // Build update data
    const updateData: any = {};
    
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (location) updateData.location = location;
    if (startDate) updateData.startDate = new Date(startDate);
    if (endDate) updateData.endDate = new Date(endDate);
    if (groupId !== undefined) updateData.groupId = groupId;
    if (requiresPermissionSlip !== undefined) updateData.requiresPermissionSlip = requiresPermissionSlip;

    // Validate dates if both provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (start >= end) {
        return NextResponse.json({
          success: false,
          error: 'Start date must be before end date'
        }, { status: 400 });
      }
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: updateData,
      include: {
        group: true
      }
    });

    console.log('✅ Event updated:', updatedEvent.id);

    return NextResponse.json({
      success: true,
      data: updatedEvent,
      message: `Event "${updatedEvent.title}" updated successfully`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Event update error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to update event',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
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
        error: 'Missing required parameter: id'
      }, { status: 400 });
    }

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        attendances: true
      }
    });

    if (!event) {
      return NextResponse.json({
        success: false,
        error: 'Event not found'
      }, { status: 404 });
    }

    // Delete event (cascade will handle attendances)
    await prisma.event.delete({
      where: { id }
    });

    console.log('✅ Event deleted:', id);

    return NextResponse.json({
      success: true,
      message: `Event "${event.title}" deleted successfully`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Event deletion error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to delete event',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}