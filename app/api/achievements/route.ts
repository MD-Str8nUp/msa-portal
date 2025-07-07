import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const scoutId = searchParams.get('scoutId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    console.log('🏆 Fetching achievements data...', { scoutId, page, limit });

    // Build where clause
    const whereClause = scoutId ? { scoutId } : {};

    // Get total count
    const totalAchievements = await prisma.achievement.count({ where: whereClause });

    // Get paginated achievements
    const achievements = await prisma.achievement.findMany({
      where: whereClause,
      include: {
        scout: {
          select: {
            id: true,
            name: true,
            group: {
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
        dateEarned: 'desc'
      }
    });

    console.log('✅ Achievements retrieved:', achievements.length);

    return NextResponse.json({
      success: true,
      data: achievements,
      pagination: {
        page,
        limit,
        total: totalAchievements,
        totalPages: Math.ceil(totalAchievements / limit)
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Achievements API error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch achievements data',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, scoutId, dateEarned } = body;
    
    console.log('🏆 Creating new achievement:', { name, scoutId });

    // Validate required fields
    if (!name || !scoutId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: name, scoutId'
      }, { status: 400 });
    }

    // Verify scout exists
    const scout = await prisma.scout.findUnique({
      where: { id: scoutId }
    });

    if (!scout) {
      return NextResponse.json({
        success: false,
        error: 'Scout not found'
      }, { status: 404 });
    }

    // Create achievement
    const newAchievement = await prisma.achievement.create({
      data: {
        name,
        description: description || `Awarded ${name} badge`,
        scoutId,
        dateEarned: dateEarned ? new Date(dateEarned) : new Date()
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

    console.log('✅ New achievement created:', newAchievement.id);

    return NextResponse.json({
      success: true,
      data: newAchievement,
      message: `Achievement "${name}" awarded to ${scout.name}`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Achievement creation error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to create achievement',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, description, dateEarned } = body;
    
    console.log('📝 Updating achievement:', { id });

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
    if (description !== undefined) updateData.description = description;
    if (dateEarned) updateData.dateEarned = new Date(dateEarned);

    const updatedAchievement = await prisma.achievement.update({
      where: { id },
      data: updateData,
      include: {
        scout: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    console.log('✅ Achievement updated:', updatedAchievement.id);

    return NextResponse.json({
      success: true,
      data: updatedAchievement,
      message: `Achievement "${updatedAchievement.name}" updated successfully`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Achievement update error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to update achievement',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    console.log('🗑️ Deleting achievement:', { id });

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameter: id'
      }, { status: 400 });
    }

    // Get achievement details before deletion
    const achievement = await prisma.achievement.findUnique({
      where: { id },
      include: {
        scout: {
          select: {
            name: true
          }
        }
      }
    });

    if (!achievement) {
      return NextResponse.json({
        success: false,
        error: 'Achievement not found'
      }, { status: 404 });
    }

    await prisma.achievement.delete({
      where: { id }
    });

    console.log('✅ Achievement deleted:', id);

    return NextResponse.json({
      success: true,
      message: `Achievement "${achievement.name}" removed from ${achievement.scout.name}`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Achievement deletion error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to delete achievement',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}