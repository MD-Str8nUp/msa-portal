import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyRole } from "@/lib/auth-server";
import bcrypt from 'bcryptjs';

// GET /api/executive/leaders - Get all leaders with their group assignments
export async function GET(request: NextRequest) {
  try {
    // Verify executive access
    const authResult = await verifyRole(request, 'executive');
    if (!authResult.authenticated) {
      return NextResponse.json({ error: authResult.error || "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const groupId = searchParams.get('groupId');
    const status = searchParams.get('status'); // active, inactive
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    console.log('👥 Fetching leaders for executive portal...', { search, groupId, status });

    // Build where clause
    const whereClause: any = {
      OR: [
        { isLeader: true },
        { role: 'leader' },
        { leaderGroups: { some: {} } }
      ]
    };

    if (search) {
      whereClause.AND = [
        {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } }
          ]
        }
      ];
    }

    if (groupId) {
      whereClause.leaderGroups = {
        some: {
          groupId: groupId
        }
      };
    }

    if (status === 'active') {
      whereClause.isOnline = true;
    } else if (status === 'inactive') {
      whereClause.isOnline = false;
    }

    // Get total count
    const totalLeaders = await prisma.user.count({ where: whereClause });

    // Get paginated leaders
    const leaders = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        isLeader: true,
        isParent: true,
        createdAt: true,
        lastSeen: true,
        isOnline: true,
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
                    scouts: true
                  }
                }
              }
            }
          }
        }
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [
        { isOnline: 'desc' },
        { name: 'asc' }
      ]
    });

    // Format response with additional stats
    const formattedLeaders = leaders.map(leader => ({
      ...leader,
      groupCount: leader.leaderGroups.length,
      totalScouts: leader.leaderGroups.reduce(
        (sum, lg) => sum + (lg.group._count?.scouts || 0), 
        0
      ),
      primaryGroup: leader.leaderGroups[0]?.group || null,
      status: leader.isOnline ? 'active' : 'inactive',
      lastActive: leader.lastSeen
    }));

    console.log('✅ Leaders retrieved:', formattedLeaders.length);

    return NextResponse.json({
      success: true,
      data: formattedLeaders,
      pagination: {
        page,
        limit,
        total: totalLeaders,
        totalPages: Math.ceil(totalLeaders / limit)
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Leaders API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch leaders',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// POST /api/executive/leaders - Create a new leader
export async function POST(request: NextRequest) {
  try {
    // Verify executive access
    const authResult = await verifyRole(request, 'executive');
    if (!authResult.authenticated) {
      return NextResponse.json({ error: authResult.error || "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { 
      name, 
      email, 
      password, 
      groupIds = [], 
      leaderRole = 'leader',
      isAlsoParent = false 
    } = body;

    console.log('👤 Creating new leader:', { name, email, groupIds, isAlsoParent });

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: name, email, password'
      }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return NextResponse.json({
        success: false,
        error: 'A user with this email already exists'
      }, { status: 409 });
    }

    // Validate group IDs if provided
    if (groupIds.length > 0) {
      const groups = await prisma.group.findMany({
        where: { id: { in: groupIds } }
      });

      if (groups.length !== groupIds.length) {
        return NextResponse.json({
          success: false,
          error: 'One or more invalid group IDs provided'
        }, { status: 400 });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user and group assignments in a transaction
    const newLeader = await prisma.$transaction(async (tx) => {
      // Create the user
      const user = await tx.user.create({
        data: {
          name,
          email: email.toLowerCase(),
          password: hashedPassword,
          role: isAlsoParent ? 'parent_leader' : 'leader',
          isLeader: true,
          isParent: isAlsoParent,
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${name}`,
          isOnline: false
        }
      });

      // Create group assignments
      if (groupIds.length > 0) {
        await tx.userGroup.createMany({
          data: groupIds.map((groupId: string) => ({
            userId: user.id,
            groupId,
            role: leaderRole
          }))
        });
      }

      // Fetch the complete user with groups
      return await tx.user.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatar: true,
          isLeader: true,
          isParent: true,
          createdAt: true,
          leaderGroups: {
            select: {
              role: true,
              group: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        }
      });
    });

    console.log('✅ New leader created:', newLeader?.id);

    return NextResponse.json({
      success: true,
      data: newLeader,
      message: `Leader "${name}" created successfully`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Leader creation error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create leader',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// PUT /api/executive/leaders - Update a leader
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
      name, 
      email, 
      password,
      isActive,
      groupAssignments // Array of { groupId, role }
    } = body;

    console.log('📝 Updating leader:', { id, name, email });

    // Validate required fields
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Missing required field: id'
      }, { status: 400 });
    }

    // Check if leader exists
    const existingLeader = await prisma.user.findUnique({
      where: { id },
      include: { leaderGroups: true }
    });

    if (!existingLeader || (!existingLeader.isLeader && existingLeader.role !== 'leader')) {
      return NextResponse.json({
        success: false,
        error: 'Leader not found'
      }, { status: 404 });
    }

    // Build update data
    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email.toLowerCase();
    if (password) updateData.password = await bcrypt.hash(password, 10);
    if (typeof isActive === 'boolean') updateData.isOnline = isActive;

    // Update leader and group assignments in a transaction
    const updatedLeader = await prisma.$transaction(async (tx) => {
      // Update user data
      await tx.user.update({
        where: { id },
        data: updateData
      });

      // Update group assignments if provided
      if (groupAssignments && Array.isArray(groupAssignments)) {
        // Remove all existing assignments
        await tx.userGroup.deleteMany({
          where: { userId: id }
        });

        // Create new assignments
        if (groupAssignments.length > 0) {
          await tx.userGroup.createMany({
            data: groupAssignments.map((assignment: any) => ({
              userId: id,
              groupId: assignment.groupId,
              role: assignment.role || 'leader'
            }))
          });
        }
      }

      // Fetch updated leader with groups
      return await tx.user.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatar: true,
          isLeader: true,
          isParent: true,
          isOnline: true,
          updatedAt: true,
          leaderGroups: {
            select: {
              role: true,
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
              }
            }
          }
        }
      });
    });

    console.log('✅ Leader updated:', updatedLeader?.id);

    return NextResponse.json({
      success: true,
      data: updatedLeader,
      message: `Leader "${updatedLeader?.name}" updated successfully`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Leader update error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update leader',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// DELETE /api/executive/leaders - Remove a leader
export async function DELETE(request: NextRequest) {
  try {
    // Verify executive access
    const authResult = await verifyRole(request, 'executive');
    if (!authResult.authenticated) {
      return NextResponse.json({ error: authResult.error || "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const reassignToId = searchParams.get('reassignTo'); // Optional: reassign groups to another leader

    console.log('🗑️ Removing leader:', { id, reassignToId });

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameter: id'
      }, { status: 400 });
    }

    // Check if leader exists
    const leader = await prisma.user.findUnique({
      where: { id },
      include: { 
        leaderGroups: {
          include: {
            group: true
          }
        },
        scouts: true // Check if they're also a parent
      }
    });

    if (!leader || (!leader.isLeader && leader.role !== 'leader')) {
      return NextResponse.json({
        success: false,
        error: 'Leader not found'
      }, { status: 404 });
    }

    // Handle group reassignment or removal
    await prisma.$transaction(async (tx) => {
      if (reassignToId && leader.leaderGroups.length > 0) {
        // Verify reassignment target is a valid leader
        const newLeader = await tx.user.findUnique({
          where: { id: reassignToId }
        });

        if (!newLeader || (!newLeader.isLeader && newLeader.role !== 'leader')) {
          throw new Error('Invalid reassignment target');
        }

        // Reassign groups
        for (const lg of leader.leaderGroups) {
          // Check if new leader already has this group
          const existing = await tx.userGroup.findUnique({
            where: {
              userId_groupId: {
                userId: reassignToId,
                groupId: lg.groupId
              }
            }
          });

          if (!existing) {
            await tx.userGroup.create({
              data: {
                userId: reassignToId,
                groupId: lg.groupId,
                role: lg.role
              }
            });
          }
        }
      }

      // Remove leader's group assignments
      await tx.userGroup.deleteMany({
        where: { userId: id }
      });

      // If leader is also a parent with scouts, just remove leader role
      if (leader.scouts.length > 0) {
        await tx.user.update({
          where: { id },
          data: {
            isLeader: false,
            role: 'parent'
          }
        });
      } else {
        // Otherwise, delete the user entirely
        await tx.user.delete({
          where: { id }
        });
      }
    });

    console.log('✅ Leader removed:', id);

    return NextResponse.json({
      success: true,
      message: leader.scouts.length > 0 
        ? `Leader role removed from "${leader.name}" (kept as parent)`
        : `Leader "${leader.name}" deleted successfully`,
      reassigned: reassignToId ? true : false,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Leader removal error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to remove leader',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}