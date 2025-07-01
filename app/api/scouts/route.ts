import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const parentId = url.searchParams.get('parentId');
    const groupId = url.searchParams.get('groupId');
    
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
    console.error('Error fetching scouts:', error);
    return Response.json({ error: 'Failed to fetch scouts' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const scoutData = await req.json();
    
    if (!scoutData.name || !scoutData.parentId || !scoutData.groupId) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
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
    console.error('Error creating scout:', error);
    return Response.json({ error: 'Failed to create scout' }, { status: 500 });
  }
}
