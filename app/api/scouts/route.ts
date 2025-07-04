import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { mockScoutService } from '@/lib/mock/data';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const parentId = url.searchParams.get('parentId');
  const groupId = url.searchParams.get('groupId');
  
  // If database is disabled, return mock data
  if (process.env.DISABLE_DATABASE === 'true') {
    const mockScouts = mockScoutService.getScouts(parentId || undefined, groupId || undefined);
    return Response.json(mockScouts);
  }

  try {
    let scouts;
    
    if (parentId) {
      scouts = await prisma.scout.findMany({
        where: { parentId },
        include: {
          group: true,
          achievements: true
        }
      });
    } else if (groupId) {
      scouts = await prisma.scout.findMany({
        where: { groupId },
        include: {
          parent: true,
          achievements: true
        }
      });
    } else {
      scouts = await prisma.scout.findMany({
        include: {
          parent: true,
          group: true,
          achievements: true
        }
      });
    }
    
    return Response.json(scouts);
  } catch (error) {
    console.error('Error fetching scouts, falling back to mock data:', error);
    const mockScouts = mockScoutService.getScouts(parentId || undefined, groupId || undefined);
    return Response.json(mockScouts);
  }
}

export async function POST(req: NextRequest) {
  try {
    const scoutData = await req.json();
    
    if (!scoutData.name || !scoutData.parentId || !scoutData.groupId) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // If database is disabled, use mock service
    if (process.env.DISABLE_DATABASE === 'true') {
      const newScout = mockScoutService.addScout(scoutData);
      return Response.json(newScout, { status: 201 });
    }
    
    const scout = await prisma.scout.create({
      data: scoutData,
      include: {
        parent: true,
        group: true
      }
    });
    
    return Response.json(scout, { status: 201 });
  } catch (error) {
    console.error('Error creating scout, falling back to mock:', error);
    try {
      const scoutData = await req.json();
      const newScout = mockScoutService.addScout(scoutData);
      return Response.json(newScout, { status: 201 });
    } catch (parseError) {
      return Response.json({ error: 'Invalid request data' }, { status: 400 });
    }
  }
}
