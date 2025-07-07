import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Mock data for development when database is unavailable
const mockAttendanceData = [
  {
    id: '1',
    scoutId: 'scout-1',
    userId: 'user-1',
    eventId: 'event-1',
    status: 'present',
    date: new Date('2025-01-06'),
    scout: {
      id: 'scout-1',
      name: 'Ahmed Al-Rashid',
      age: 10,
      rank: 'Eagle Scout',
      group: { name: 'Eagle Scouts' }
    },
    event: {
      id: 'event-1',
      title: 'Weekly Meeting',
      startDate: new Date('2025-01-06T18:00:00'),
      location: 'Community Centre'
    }
  },
  {
    id: '2',
    scoutId: 'scout-2', 
    userId: 'user-1',
    eventId: 'event-1',
    status: 'present',
    date: new Date('2025-01-06'),
    scout: {
      id: 'scout-2',
      name: 'Omar Hassan',
      age: 9,
      rank: 'Scout',
      group: { name: 'Eagle Scouts' }
    },
    event: {
      id: 'event-1',
      title: 'Weekly Meeting',
      startDate: new Date('2025-01-06T18:00:00'),
      location: 'Community Centre'
    }
  }
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    const groupId = searchParams.get('groupId');
    
    console.log('📊 Fetching attendance data...', { eventId, groupId });

    // Try database first
    try {
      await prisma.$connect();
      
      const attendance = await prisma.attendance.findMany({
        where: {
          ...(eventId && { eventId }),
          ...(groupId && { 
            scout: {
              groupId: groupId
            }
          })
        },
        include: {
          scout: {
            include: {
              group: {
                select: {
                  name: true
                }
              }
            }
          },
          event: {
            select: {
              title: true,
              startDate: true,
              location: true
            }
          }
        },
        orderBy: {
          date: 'desc'
        }
      });

      console.log('✅ Database attendance retrieved:', attendance.length, 'records');
      
      return NextResponse.json({
        success: true,
        data: attendance,
        source: 'database',
        timestamp: new Date().toISOString()
      });

    } catch (dbError) {
      console.warn('⚠️ Database unavailable, using mock data:', dbError);
      
      // Filter mock data based on query parameters
      let filteredData = mockAttendanceData;
      
      if (eventId) {
        filteredData = filteredData.filter(record => record.eventId === eventId);
      }
      
      return NextResponse.json({
        success: true,
        data: filteredData,
        source: 'mock_data',
        message: 'Using mock data - database connection unavailable',
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('❌ Attendance API error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch attendance data',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { scoutId, eventId, status, userId } = body;
    
    console.log('📝 Taking attendance:', { scoutId, eventId, status, userId });

    // Try database first
    try {
      await prisma.$connect();
      
      // Check if attendance record already exists
      const existingRecord = await prisma.attendance.findFirst({
        where: {
          scoutId,
          eventId
        }
      });

      let attendanceRecord;
      
      if (existingRecord) {
        // Update existing record
        attendanceRecord = await prisma.attendance.update({
          where: {
            id: existingRecord.id
          },
          data: {
            status,
            date: new Date()
          },
          include: {
            scout: {
              include: {
                group: true
              }
            },
            event: true
          }
        });
        
        console.log('✅ Attendance updated:', attendanceRecord.id);
      } else {
        // Create new record
        attendanceRecord = await prisma.attendance.create({
          data: {
            scoutId,
            eventId,
            userId,
            status,
            date: new Date()
          },
          include: {
            scout: {
              include: {
                group: true
              }
            },
            event: true
          }
        });
        
        console.log('✅ Attendance created:', attendanceRecord.id);
      }

      return NextResponse.json({
        success: true,
        data: attendanceRecord,
        source: 'database',
        action: existingRecord ? 'updated' : 'created',
        timestamp: new Date().toISOString()
      });

    } catch (dbError) {
      console.warn('⚠️ Database unavailable for attendance creation:', dbError);
      
      // Return mock success response
      const mockResponse = {
        id: `mock-${Date.now()}`,
        scoutId,
        eventId,
        userId,
        status,
        date: new Date(),
        scout: mockAttendanceData[0]?.scout,
        event: mockAttendanceData[0]?.event
      };
      
      return NextResponse.json({
        success: true,
        data: mockResponse,
        source: 'mock_data',
        message: 'Mock attendance recorded - database connection unavailable',
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('❌ Attendance creation error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to record attendance',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
