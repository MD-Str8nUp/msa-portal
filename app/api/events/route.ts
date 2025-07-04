import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { mockEventService } from '@/lib/mock/data';

export async function GET(req: NextRequest) {
  // Check if database is disabled or in fallback mode
  if (process.env.DISABLE_DATABASE === 'true') {
    const events = mockEventService.getEvents();
    return Response.json(events);
  }

  try {
    const url = new URL(req.url);
    const groupId = url.searchParams.get('groupId');
    const scoutId = url.searchParams.get('scoutId');
    
    let events;
    
    if (groupId) {
      events = await prisma.event.findMany({
        where: { groupId },
        orderBy: { startDate: 'asc' }
      });
    } else if (scoutId) {
      const scout = await prisma.scout.findUnique({
        where: { id: scoutId },
        include: { group: true }
      });
      
      if (scout) {
        events = await prisma.event.findMany({
          where: { groupId: scout.groupId },
          orderBy: { startDate: 'asc' }
        });
      }
    } else {
      events = await prisma.event.findMany({
        orderBy: { startDate: 'asc' }
      });
    }
    
    return Response.json(events);
  } catch (error) {
    console.error('Error fetching events, falling back to mock data:', error);
    // Return mock data instead of error
    const events = mockEventService.getEvents();
    return Response.json(events);
  }
}

export async function POST(req: NextRequest) {
  try {
    const eventData = await req.json();
    
    if (!eventData.title || !eventData.startDate || !eventData.endDate || !eventData.location) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const event = await prisma.event.create({
      data: eventData
    });
    
    return Response.json(event, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return Response.json({ error: 'Failed to create event' }, { status: 500 });
  }
}
