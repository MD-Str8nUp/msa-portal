import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');
    const parentId = searchParams.get('parentId');
    
    console.log('📊 Fetching scouts data...', { groupId, parentId });

    const scouts = await prisma.scout.findMany({
      where: {
        ...(groupId && { groupId }),
        ...(parentId && { parentId })
      },
      include: {
        parent: {
          select: {
            name: true,
            email: true
          }
        },
        group: {
          select: {
            name: true,
            description: true
          }
        },
        achievements: {
          select: {
            name: true,
            description: true,
            dateEarned: true
          },
          orderBy: {
            dateEarned: 'desc'
          }
        },
        attendance: {
          take: 5,
          orderBy: {
            date: 'desc'
          },
          include: {
            event: {
              select: {
                title: true,
                startDate: true
              }
            }
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    console.log('✅ Database scouts retrieved:', scouts.length, 'records');

    return NextResponse.json({
      success: true,
      data: scouts,
      count: scouts.length,
      source: 'database',
      timestamp: new Date().toISOString(),
      message: scouts.length > 0 ? `Found ${scouts.length} scouts in Mi'raj Scouts Academy` : 'No scouts found - ready to add new members!'
    });

  } catch (error) {
    console.error('❌ Scouts API error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch scouts data',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, age, rank, parentId, groupId } = body;
    
    console.log('👦 Creating new scout:', { name, age, rank });

    // Validate required fields
    if (!name || !age || !parentId || !groupId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: name, age, parentId, groupId'
      }, { status: 400 });
    }

    const newScout = await prisma.scout.create({
      data: {
        name,
        age: parseInt(age),
        rank: rank || 'Scout',
        parentId,
        groupId,
        joinedDate: new Date()
      },
      include: {
        parent: {
          select: {
            name: true,
            email: true
          }
        },
        group: {
          select: {
            name: true
          }
        }
      }
    });

    console.log('✅ New scout created:', newScout.id);

    return NextResponse.json({
      success: true,
      data: newScout,
      message: `Welcome ${name} to Mi'raj Scouts Academy!`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Scout creation error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to create scout',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
