import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { mockGroupService } from '@/lib/mock/data';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const leaderId = url.searchParams.get('leaderId');
  
  // If database is disabled, return mock data
  if (process.env.DISABLE_DATABASE === 'true') {
    const mockGroups = mockGroupService.getGroups();
    return Response.json(mockGroups);
  }

  try {
    let groups;
    
    if (leaderId) {
      groups = await prisma.group.findMany({
        where: {
          groupLeaders: {
            some: {
              userId: leaderId
            }
          }
        },
        include: {
          scouts: true,
          groupLeaders: {
            include: {
              user: true
            }
          }
        }
      });
    } else {
      groups = await prisma.group.findMany({
        include: {
          scouts: {
            select: {
              id: true,
              name: true
            }
          },
          groupLeaders: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  role: true,
                  email: true
                }
              }
            }
          }
        }
      });
    }
    
    return Response.json(groups);
  } catch (error) {
    console.error('Error fetching groups, falling back to mock data:', error);
    const mockGroups = mockGroupService.getGroups();
    return Response.json(mockGroups);
  }
}

export async function POST(req: NextRequest) {
  try {
    const groupData = await req.json();
    
    if (!groupData.name) {
      return Response.json({ error: 'Group name is required' }, { status: 400 });
    }
    
    const group = await prisma.group.create({
      data: groupData,
      include: {
        scouts: true,
        groupLeaders: {
          include: {
            user: true
          }
        }
      }
    });
    
    return Response.json(group, { status: 201 });
  } catch (error) {
    console.error('Error creating group:', error);
    return Response.json({ error: 'Failed to create group' }, { status: 500 });
  }
}
