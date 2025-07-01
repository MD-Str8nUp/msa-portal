import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const scoutId = url.searchParams.get('scoutId');
    
    let achievements;
    
    if (scoutId) {
      achievements = await prisma.achievement.findMany({
        where: { scoutId },
        orderBy: { dateEarned: 'desc' }
      });
    } else {
      achievements = await prisma.achievement.findMany({
        orderBy: { dateEarned: 'desc' },
        include: {
          scout: true
        }
      });
    }
    
    return Response.json(achievements);
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return Response.json({ error: 'Failed to fetch achievements' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const achievementData = await req.json();
    
    if (!achievementData.name || !achievementData.scoutId) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const achievement = await prisma.achievement.create({
      data: achievementData,
      include: {
        scout: true
      }
    });
    
    return Response.json(achievement, { status: 201 });
  } catch (error) {
    console.error('Error creating achievement:', error);
    return Response.json({ error: 'Failed to create achievement' }, { status: 500 });
  }
}
