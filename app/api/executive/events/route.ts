import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyRole } from "@/lib/auth-server";

// GET /api/executive/events - Get all events with advanced filtering and analytics
export async function GET(request: NextRequest) {
  try {
    // Verify executive access
    const authResult = await verifyRole(request, 'executive');
    if (!authResult.authenticated) {
      return NextResponse.json({ error: authResult.error || "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status'); // upcoming, past, ongoing
    const groupId = searchParams.get('groupId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const requiresPermission = searchParams.get('requiresPermission');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    console.log('📅 Fetching events for executive portal...', { search, status, groupId });

    // Build where clause
    const whereClause: any = {};
    const now = new Date();

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (status) {
      switch (status) {
        case 'upcoming':
          whereClause.startDate = { gt: now };
          break;
        case 'past':
          whereClause.endDate = { lt: now };
          break;
        case 'ongoing':
          whereClause.AND = [
            { startDate: { lte: now } },
            { endDate: { gte: now } }
          ];
          break;
      }
    }

    if (groupId) {
      whereClause.groupId = groupId;
    }

    if (startDate) {
      whereClause.startDate = { gte: new Date(startDate) };
    }

    if (endDate) {
      whereClause.endDate = { lte: new Date(endDate) };
    }

    if (requiresPermission === 'true') {
      whereClause.requiresPermissionSlip = true;
    } else if (requiresPermission === 'false') {
      whereClause.requiresPermissionSlip = false;
    }

    // Get total count
    const totalEvents = await prisma.event.count({ where: whereClause });

    // Get paginated events with attendance stats
    const events = await prisma.event.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        description: true,
        location: true,
        startDate: true,
        endDate: true,
        requiresPermissionSlip: true,
        createdAt: true,
        updatedAt: true,
        group: {
          select: {
            id: true,
            name: true,
            _count: {
              select: {
                scouts: true
              }
            }
          }
        },
        _count: {
          select: {
            attendances: true
          }
        },
        attendances: {
          select: {
            status: true
          }
        }
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        startDate: 'desc'
      }
    });

    // Calculate attendance statistics for each event
    const eventsWithStats = events.map(event => {
      const attendanceStats = {
        total: event._count.attendances,
        present: event.attendances.filter(a => a.status === 'present').length,
        absent: event.attendances.filter(a => a.status === 'absent').length,
        excused: event.attendances.filter(a => a.status === 'excused').length,
        attendanceRate: 0
      };

      if (attendanceStats.total > 0) {
        attendanceStats.attendanceRate = Math.round(
          (attendanceStats.present / attendanceStats.total) * 100
        );
      }

      // Determine event status
      let eventStatus = 'upcoming';
      if (event.endDate < now) {
        eventStatus = 'completed';
      } else if (event.startDate <= now && event.endDate >= now) {
        eventStatus = 'ongoing';
      }

      return {
        id: event.id,
        title: event.title,
        description: event.description,
        location: event.location,
        startDate: event.startDate,
        endDate: event.endDate,
        requiresPermissionSlip: event.requiresPermissionSlip,
        createdAt: event.createdAt,
        updatedAt: event.updatedAt,
        group: event.group,
        status: eventStatus,
        attendanceStats,
        maxCapacity: event.group?._count.scouts || 0
      };
    });

    console.log('✅ Events retrieved:', eventsWithStats.length);

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
      error: 'Failed to fetch events',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// POST /api/executive/events - Create a new event
export async function POST(request: NextRequest) {
  try {
    // Verify executive access
    const authResult = await verifyRole(request, 'executive');
    if (!authResult.authenticated) {
      return NextResponse.json({ error: authResult.error || "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      location,
      startDate,
      endDate,
      groupId,
      requiresPermissionSlip = false,
      notifyParents = true,
      notifyLeaders = true
    } = body;

    console.log('📅 Creating new event:', { title, location, groupId });

    // Validate required fields
    if (!title || !description || !location || !startDate || !endDate) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: title, description, location, startDate, endDate'
      }, { status: 400 });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return NextResponse.json({
        success: false,
        error: 'End date must be after start date'
      }, { status: 400 });
    }

    if (start < new Date()) {
      return NextResponse.json({
        success: false,
        error: 'Start date cannot be in the past'
      }, { status: 400 });
    }

    // Validate group if specified
    if (groupId) {
      const group = await prisma.group.findUnique({
        where: { id: groupId }
      });

      if (!group) {
        return NextResponse.json({
          success: false,
          error: 'Invalid group ID'
        }, { status: 400 });
      }
    }

    // Create the event
    const newEvent = await prisma.event.create({
      data: {
        title,
        description,
        location,
        startDate: start,
        endDate: end,
        groupId,
        requiresPermissionSlip
      },
      include: {
        group: {
          select: {
            id: true,
            name: true,
            _count: {
              select: {
                scouts: true,
                groupLeaders: true
              }
            }
          }
        }
      }
    });

    // Create notifications if requested
    if (notifyParents || notifyLeaders) {
      const notifications = [];

      if (groupId) {
        // Notify specific group members
        if (notifyParents) {
          const parents = await prisma.user.findMany({
            where: {
              scouts: {
                some: {
                  groupId: groupId
                }
              }
            },
            select: { id: true }
          });

          notifications.push(...parents.map(parent => ({
            senderId: authResult.user.id,
            receiverId: parent.id,
            content: `New event "${title}" has been scheduled for ${new Date(startDate).toLocaleDateString()}. ${requiresPermissionSlip ? 'Permission slip required.' : ''}`
          })));
        }

        if (notifyLeaders) {
          const leaders = await prisma.user.findMany({
            where: {
              leaderGroups: {
                some: {
                  groupId: groupId
                }
              }
            },
            select: { id: true }
          });

          notifications.push(...leaders.map(leader => ({
            senderId: authResult.user.id,
            receiverId: leader.id,
            content: `New event "${title}" scheduled for ${newEvent.group?.name || 'your group'} on ${new Date(startDate).toLocaleDateString()}.`
          })));
        }
      } else {
        // Academy-wide event - notify all leaders
        if (notifyLeaders) {
          const allLeaders = await prisma.user.findMany({
            where: {
              OR: [
                { isLeader: true },
                { role: 'leader' }
              ]
            },
            select: { id: true }
          });

          notifications.push(...allLeaders.map(leader => ({
            senderId: authResult.user.id,
            receiverId: leader.id,
            content: `Academy-wide event "${title}" scheduled for ${new Date(startDate).toLocaleDateString()}.`
          })));
        }
      }

      // Create notification messages
      if (notifications.length > 0) {
        await prisma.message.createMany({
          data: notifications
        });
      }
    }

    console.log('✅ New event created:', newEvent.id);

    return NextResponse.json({
      success: true,
      data: newEvent,
      message: `Event "${title}" created successfully`,
      notificationsSent: notifyParents || notifyLeaders,
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

// PUT /api/executive/events - Update an event
export async function PUT(request: NextRequest) {
  try {
    // Verify executive access
    const authResult = await verifyRole(request, 'executive');
    if (!authResult.authenticated) {
      return NextResponse.json({ error: authResult.error || "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      id,
      title,
      description,
      location,
      startDate,
      endDate,
      groupId,
      requiresPermissionSlip,
      notifyChanges = true
    } = body;

    console.log('📝 Updating event:', { id, title });

    // Validate required fields
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Missing required field: id'
      }, { status: 400 });
    }

    // Check if event exists
    const existingEvent = await prisma.event.findUnique({
      where: { id },
      include: {
        group: true,
        _count: {
          select: {
            attendances: true
          }
        }
      }
    });

    if (!existingEvent) {
      return NextResponse.json({
        success: false,
        error: 'Event not found'
      }, { status: 404 });
    }

    // Build update data
    const updateData: any = {};
    const changes: string[] = [];

    if (title && title !== existingEvent.title) {
      updateData.title = title;
      changes.push(`Title changed to "${title}"`);
    }
    if (description && description !== existingEvent.description) {
      updateData.description = description;
      changes.push('Description updated');
    }
    if (location && location !== existingEvent.location) {
      updateData.location = location;
      changes.push(`Location changed to "${location}"`);
    }
    if (startDate) {
      const start = new Date(startDate);
      if (start.getTime() !== existingEvent.startDate.getTime()) {
        updateData.startDate = start;
        changes.push(`Start date changed to ${start.toLocaleDateString()}`);
      }
    }
    if (endDate) {
      const end = new Date(endDate);
      if (end.getTime() !== existingEvent.endDate.getTime()) {
        updateData.endDate = end;
        changes.push(`End date changed to ${end.toLocaleDateString()}`);
      }
    }
    if (typeof requiresPermissionSlip === 'boolean' && requiresPermissionSlip !== existingEvent.requiresPermissionSlip) {
      updateData.requiresPermissionSlip = requiresPermissionSlip;
      changes.push(requiresPermissionSlip ? 'Permission slip now required' : 'Permission slip no longer required');
    }
    if (groupId !== undefined && groupId !== existingEvent.groupId) {
      updateData.groupId = groupId;
      changes.push(groupId ? 'Event reassigned to different group' : 'Event changed to academy-wide');
    }

    // Validate dates if changed
    if (updateData.startDate || updateData.endDate) {
      const start = updateData.startDate || existingEvent.startDate;
      const end = updateData.endDate || existingEvent.endDate;

      if (start >= end) {
        return NextResponse.json({
          success: false,
          error: 'End date must be after start date'
        }, { status: 400 });
      }
    }

    // Update the event
    const updatedEvent = await prisma.event.update({
      where: { id },
      data: updateData,
      include: {
        group: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Send notifications about changes if requested and there are changes
    if (notifyChanges && changes.length > 0) {
      const changesSummary = changes.join(', ');
      
      // Get affected users
      const affectedUsers = await prisma.user.findMany({
        where: {
          OR: [
            // Parents of scouts in the group
            ...(updatedEvent.groupId ? [{
              scouts: {
                some: {
                  groupId: updatedEvent.groupId
                }
              }
            }] : []),
            // Leaders of the group
            ...(updatedEvent.groupId ? [{
              leaderGroups: {
                some: {
                  groupId: updatedEvent.groupId
                }
              }
            }] : []),
            // All leaders for academy-wide events
            ...(!updatedEvent.groupId ? [{
              OR: [
                { isLeader: true },
                { role: 'leader' }
              ]
            }] : [])
          ]
        },
        select: { id: true }
      });

      if (affectedUsers.length > 0) {
        await prisma.message.createMany({
          data: affectedUsers.map(user => ({
            senderId: authResult.user.id,
            receiverId: user.id,
            content: `Event "${updatedEvent.title}" has been updated: ${changesSummary}`
          }))
        });
      }
    }

    console.log('✅ Event updated:', updatedEvent.id);

    return NextResponse.json({
      success: true,
      data: updatedEvent,
      changes: changes,
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

// DELETE /api/executive/events - Cancel an event
export async function DELETE(request: NextRequest) {
  try {
    // Verify executive access
    const authResult = await verifyRole(request, 'executive');
    if (!authResult.authenticated) {
      return NextResponse.json({ error: authResult.error || "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const notifyCancellation = searchParams.get('notify') !== 'false';

    console.log('🗑️ Cancelling event:', { id, notifyCancellation });

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameter: id'
      }, { status: 400 });
    }

    // Get event details before deletion
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        group: true,
        _count: {
          select: {
            attendances: true
          }
        }
      }
    });

    if (!event) {
      return NextResponse.json({
        success: false,
        error: 'Event not found'
      }, { status: 404 });
    }

    // Check if event has already started
    if (event.startDate <= new Date()) {
      return NextResponse.json({
        success: false,
        error: 'Cannot delete events that have already started or completed'
      }, { status: 409 });
    }

    // Send cancellation notifications before deletion
    if (notifyCancellation) {
      const affectedUsers = await prisma.user.findMany({
        where: {
          OR: [
            // Parents of scouts in the group
            ...(event.groupId ? [{
              scouts: {
                some: {
                  groupId: event.groupId
                }
              }
            }] : []),
            // Leaders of the group
            ...(event.groupId ? [{
              leaderGroups: {
                some: {
                  groupId: event.groupId
                }
              }
            }] : []),
            // All leaders for academy-wide events
            ...(!event.groupId ? [{
              OR: [
                { isLeader: true },
                { role: 'leader' }
              ]
            }] : [])
          ]
        },
        select: { id: true }
      });

      if (affectedUsers.length > 0) {
        await prisma.message.createMany({
          data: affectedUsers.map(user => ({
            senderId: authResult.user.id,
            receiverId: user.id,
            content: `Event "${event.title}" scheduled for ${event.startDate.toLocaleDateString()} has been cancelled.`
          }))
        });
      }
    }

    // Delete the event (attendances will be cascade deleted)
    await prisma.event.delete({
      where: { id }
    });

    console.log('✅ Event cancelled:', id);

    return NextResponse.json({
      success: true,
      message: `Event "${event.title}" cancelled successfully`,
      attendancesCancelled: event._count.attendances,
      notificationsSent: notifyCancellation,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Event cancellation error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to cancel event',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}