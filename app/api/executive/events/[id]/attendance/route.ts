import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyRole } from "@/lib/auth-server";

// GET /api/executive/events/[id]/attendance - Get attendance for an event
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify executive access
    const authResult = await verifyRole(request, 'executive');
    if (!authResult.authenticated) {
      return NextResponse.json({ error: authResult.error || "Unauthorized" }, { status: 401 });
    }

    const eventId = params.id;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // present, absent, excused
    const groupBy = searchParams.get('groupBy'); // status, scout, date

    console.log('📊 Fetching attendance for event:', eventId);

    // Get event details
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        group: {
          select: {
            id: true,
            name: true,
            scouts: {
              select: {
                id: true,
                name: true,
                age: true,
                parent: {
                  select: {
                    id: true,
                    name: true,
                    email: true
                  }
                }
              }
            }
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

    // Build attendance query
    const whereClause: any = { eventId };
    if (status) {
      whereClause.status = status;
    }

    // Get attendance records
    const attendance = await prisma.attendance.findMany({
      where: whereClause,
      include: {
        scout: {
          select: {
            id: true,
            name: true,
            age: true,
            rank: true,
            parent: {
              select: {
                id: true,
                name: true,
                email: true,
                isOnline: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      },
      orderBy: [
        { status: 'asc' },
        { scout: { name: 'asc' } }
      ]
    });

    // Get list of scouts who haven't been marked yet
    const markedScoutIds = attendance.map(a => a.scoutId);
    const unmarkedScouts = event.group?.scouts.filter(
      scout => !markedScoutIds.includes(scout.id)
    ) || [];

    // Calculate statistics
    const stats = {
      total: (event.group?.scouts.length || 0),
      marked: attendance.length,
      unmarked: unmarkedScouts.length,
      present: attendance.filter(a => a.status === 'present').length,
      absent: attendance.filter(a => a.status === 'absent').length,
      excused: attendance.filter(a => a.status === 'excused').length,
      attendanceRate: 0
    };

    if (stats.marked > 0) {
      stats.attendanceRate = Math.round((stats.present / stats.marked) * 100);
    }

    // Group attendance data if requested
    let groupedData = null;
    if (groupBy === 'status') {
      groupedData = {
        present: attendance.filter(a => a.status === 'present'),
        absent: attendance.filter(a => a.status === 'absent'),
        excused: attendance.filter(a => a.status === 'excused'),
        unmarked: unmarkedScouts
      };
    }

    console.log('✅ Attendance data retrieved:', attendance.length);

    return NextResponse.json({
      success: true,
      data: {
        event: {
          id: event.id,
          title: event.title,
          date: event.startDate,
          group: event.group ? {
            id: event.group.id,
            name: event.group.name
          } : null
        },
        attendance: attendance,
        unmarkedScouts: unmarkedScouts,
        statistics: stats,
        groupedData: groupedData
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Event attendance API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch event attendance',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// POST /api/executive/events/[id]/attendance - Mark attendance for multiple scouts
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify executive access
    const authResult = await verifyRole(request, 'executive');
    if (!authResult.authenticated) {
      return NextResponse.json({ error: authResult.error || "Unauthorized" }, { status: 401 });
    }

    const eventId = params.id;
    const body = await request.json();
    const { attendanceRecords } = body; // Array of { scoutId, status }

    console.log('✏️ Marking attendance for event:', eventId);

    // Validate input
    if (!Array.isArray(attendanceRecords) || attendanceRecords.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Invalid input: attendanceRecords must be a non-empty array'
      }, { status: 400 });
    }

    // Verify event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        group: {
          select: {
            scouts: {
              select: { id: true }
            }
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

    // Validate scout IDs belong to the event's group
    const validScoutIds = event.group?.scouts.map(s => s.id) || [];
    const invalidRecords = attendanceRecords.filter(
      record => !validScoutIds.includes(record.scoutId)
    );

    if (invalidRecords.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Some scout IDs do not belong to this event\'s group',
        invalidScoutIds: invalidRecords.map(r => r.scoutId)
      }, { status: 400 });
    }

    // Process attendance records
    const results = {
      created: 0,
      updated: 0,
      errors: [] as any[]
    };

    for (const record of attendanceRecords) {
      try {
        // Check if attendance already exists
        const existing = await prisma.attendance.findFirst({
          where: {
            eventId: eventId,
            scoutId: record.scoutId
          }
        });

        if (existing) {
          // Update existing attendance
          await prisma.attendance.update({
            where: { id: existing.id },
            data: {
              status: record.status,
              userId: authResult.user.id,
              date: new Date()
            }
          });
          results.updated++;
        } else {
          // Create new attendance
          await prisma.attendance.create({
            data: {
              eventId: eventId,
              scoutId: record.scoutId,
              userId: authResult.user.id,
              status: record.status,
              date: new Date()
            }
          });
          results.created++;
        }
      } catch (error) {
        results.errors.push({
          scoutId: record.scoutId,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    console.log('✅ Attendance marked:', { created: results.created, updated: results.updated });

    return NextResponse.json({
      success: true,
      data: results,
      message: `Attendance marked for ${results.created + results.updated} scouts`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Attendance marking error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to mark attendance',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// PUT /api/executive/events/[id]/attendance - Update attendance status
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify executive access
    const authResult = await verifyRole(request, 'executive');
    if (!authResult.authenticated) {
      return NextResponse.json({ error: authResult.error || "Unauthorized" }, { status: 401 });
    }

    const eventId = params.id;
    const body = await request.json();
    const { scoutId, status, note } = body;

    console.log('📝 Updating attendance:', { eventId, scoutId, status });

    // Validate required fields
    if (!scoutId || !status) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: scoutId, status'
      }, { status: 400 });
    }

    // Validate status
    if (!['present', 'absent', 'excused'].includes(status)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid status. Must be: present, absent, or excused'
      }, { status: 400 });
    }

    // Find attendance record
    const attendance = await prisma.attendance.findFirst({
      where: {
        eventId: eventId,
        scoutId: scoutId
      },
      include: {
        scout: true,
        event: true
      }
    });

    if (!attendance) {
      return NextResponse.json({
        success: false,
        error: 'Attendance record not found'
      }, { status: 404 });
    }

    // Update attendance
    const updated = await prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        status: status,
        userId: authResult.user.id,
        date: new Date()
      },
      include: {
        scout: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    console.log('✅ Attendance updated:', updated.id);

    return NextResponse.json({
      success: true,
      data: updated,
      message: `Updated ${updated.scout.name}'s attendance to ${status}`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Attendance update error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update attendance',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// DELETE /api/executive/events/[id]/attendance - Clear attendance for an event
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify executive access
    const authResult = await verifyRole(request, 'executive');
    if (!authResult.authenticated) {
      return NextResponse.json({ error: authResult.error || "Unauthorized" }, { status: 401 });
    }

    const eventId = params.id;
    const { searchParams } = new URL(request.url);
    const scoutId = searchParams.get('scoutId');

    console.log('🗑️ Clearing attendance:', { eventId, scoutId });

    // Verify event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      return NextResponse.json({
        success: false,
        error: 'Event not found'
      }, { status: 404 });
    }

    if (scoutId) {
      // Delete specific scout's attendance
      const deleted = await prisma.attendance.deleteMany({
        where: {
          eventId: eventId,
          scoutId: scoutId
        }
      });

      console.log('✅ Scout attendance cleared:', deleted.count);

      return NextResponse.json({
        success: true,
        message: `Cleared attendance for scout`,
        recordsDeleted: deleted.count,
        timestamp: new Date().toISOString()
      });
    } else {
      // Clear all attendance for the event
      const deleted = await prisma.attendance.deleteMany({
        where: {
          eventId: eventId
        }
      });

      console.log('✅ All event attendance cleared:', deleted.count);

      return NextResponse.json({
        success: true,
        message: `Cleared all attendance for event "${event.title}"`,
        recordsDeleted: deleted.count,
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('❌ Attendance clearing error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to clear attendance',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}