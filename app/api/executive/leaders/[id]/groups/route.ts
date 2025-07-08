import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyRole } from "@/lib/auth-server";

// GET /api/executive/leaders/[id]/groups - Get all group assignments for a leader
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

    const leaderId = params.id;
    console.log('👥 Fetching group assignments for leader:', leaderId);

    // Get leader with all group assignments
    const leader = await prisma.user.findUnique({
      where: { id: leaderId },
      select: {
        id: true,
        name: true,
        email: true,
        leaderGroups: {
          select: {
            id: true,
            role: true,
            createdAt: true,
            group: {
              select: {
                id: true,
                name: true,
                description: true,
                _count: {
                  select: {
                    scouts: true,
                    events: true
                  }
                }
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });

    if (!leader) {
      return NextResponse.json({
        success: false,
        error: 'Leader not found'
      }, { status: 404 });
    }

    // Get available groups (not assigned to this leader)
    const assignedGroupIds = leader.leaderGroups.map(lg => lg.group.id);
    const availableGroups = await prisma.group.findMany({
      where: {
        id: { notIn: assignedGroupIds }
      },
      select: {
        id: true,
        name: true,
        description: true,
        _count: {
          select: {
            scouts: true,
            groupLeaders: true
          }
        }
      }
    });

    console.log('✅ Group assignments retrieved:', leader.leaderGroups.length);

    return NextResponse.json({
      success: true,
      data: {
        leader: {
          id: leader.id,
          name: leader.name,
          email: leader.email
        },
        assignments: leader.leaderGroups,
        availableGroups: availableGroups
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Leader groups API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch leader groups',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// POST /api/executive/leaders/[id]/groups - Assign a leader to a group
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

    const leaderId = params.id;
    const body = await request.json();
    const { groupId, role = 'leader' } = body;

    console.log('➕ Assigning leader to group:', { leaderId, groupId, role });

    // Validate required fields
    if (!groupId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required field: groupId'
      }, { status: 400 });
    }

    // Verify leader exists and is a leader
    const leader = await prisma.user.findUnique({
      where: { id: leaderId }
    });

    if (!leader || (!leader.isLeader && leader.role !== 'leader')) {
      return NextResponse.json({
        success: false,
        error: 'Leader not found or user is not a leader'
      }, { status: 404 });
    }

    // Verify group exists
    const group = await prisma.group.findUnique({
      where: { id: groupId }
    });

    if (!group) {
      return NextResponse.json({
        success: false,
        error: 'Group not found'
      }, { status: 404 });
    }

    // Check if assignment already exists
    const existingAssignment = await prisma.userGroup.findUnique({
      where: {
        userId_groupId: {
          userId: leaderId,
          groupId: groupId
        }
      }
    });

    if (existingAssignment) {
      return NextResponse.json({
        success: false,
        error: 'Leader is already assigned to this group'
      }, { status: 409 });
    }

    // Create the assignment
    const assignment = await prisma.userGroup.create({
      data: {
        userId: leaderId,
        groupId: groupId,
        role: role
      },
      select: {
        id: true,
        role: true,
        createdAt: true,
        group: {
          select: {
            id: true,
            name: true,
            description: true
          }
        }
      }
    });

    console.log('✅ Leader assigned to group:', assignment.id);

    return NextResponse.json({
      success: true,
      data: assignment,
      message: `Leader "${leader.name}" assigned to group "${group.name}"`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Leader group assignment error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to assign leader to group',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// PUT /api/executive/leaders/[id]/groups - Update a leader's role in a group
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

    const leaderId = params.id;
    const body = await request.json();
    const { groupId, role } = body;

    console.log('📝 Updating leader role in group:', { leaderId, groupId, role });

    // Validate required fields
    if (!groupId || !role) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: groupId, role'
      }, { status: 400 });
    }

    // Find the assignment
    const assignment = await prisma.userGroup.findUnique({
      where: {
        userId_groupId: {
          userId: leaderId,
          groupId: groupId
        }
      },
      include: {
        user: true,
        group: true
      }
    });

    if (!assignment) {
      return NextResponse.json({
        success: false,
        error: 'Assignment not found'
      }, { status: 404 });
    }

    // Update the role
    const updatedAssignment = await prisma.userGroup.update({
      where: {
        userId_groupId: {
          userId: leaderId,
          groupId: groupId
        }
      },
      data: { role },
      select: {
        id: true,
        role: true,
        createdAt: true,
        group: {
          select: {
            id: true,
            name: true,
            description: true
          }
        }
      }
    });

    console.log('✅ Leader role updated:', updatedAssignment.id);

    return NextResponse.json({
      success: true,
      data: updatedAssignment,
      message: `Updated role to "${role}" for "${assignment.user.name}" in "${assignment.group.name}"`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Leader role update error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update leader role',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// DELETE /api/executive/leaders/[id]/groups - Remove a leader from a group
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

    const leaderId = params.id;
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');

    console.log('🗑️ Removing leader from group:', { leaderId, groupId });

    if (!groupId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameter: groupId'
      }, { status: 400 });
    }

    // Find the assignment
    const assignment = await prisma.userGroup.findUnique({
      where: {
        userId_groupId: {
          userId: leaderId,
          groupId: groupId
        }
      },
      include: {
        user: true,
        group: true
      }
    });

    if (!assignment) {
      return NextResponse.json({
        success: false,
        error: 'Assignment not found'
      }, { status: 404 });
    }

    // Check if this is the last leader for the group
    const otherLeaders = await prisma.userGroup.count({
      where: {
        groupId: groupId,
        userId: { not: leaderId }
      }
    });

    if (otherLeaders === 0) {
      return NextResponse.json({
        success: false,
        error: 'Cannot remove the last leader from a group. Please assign another leader first.'
      }, { status: 409 });
    }

    // Remove the assignment
    await prisma.userGroup.delete({
      where: {
        userId_groupId: {
          userId: leaderId,
          groupId: groupId
        }
      }
    });

    console.log('✅ Leader removed from group');

    return NextResponse.json({
      success: true,
      message: `Removed "${assignment.user.name}" from "${assignment.group.name}"`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Leader removal from group error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to remove leader from group',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}