import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

// Mock achievements data
const mockAchievements = [
  {
    id: 'ach-1',
    name: 'First Aid Badge',
    description: 'Completed first aid training',
    dateEarned: new Date('2024-05-10'),
    scoutId: 'scout-1',
    badgeType: 'skill'
  },
  {
    id: 'ach-2',
    name: 'Camping Badge',
    description: 'Completed overnight camping trip',
    dateEarned: new Date('2024-04-15'),
    scoutId: 'scout-1',
    badgeType: 'activity'
  },
  {
    id: 'ach-3',
    name: 'Leadership Badge',
    description: 'Led a group activity successfully',
    dateEarned: new Date('2024-03-20'),
    scoutId: 'scout-2',
    badgeType: 'leadership'
  }
];

export async function GET(req: NextRequest) {
  // Check if database is disabled or in fallback mode
  if (process.env.DISABLE_DATABASE === 'true') {
    const url = new URL(req.url);
    const scoutId = url.searchParams.get('scoutId');
    
    let achievements = mockAchievements;
    if (scoutId) {
      achievements = mockAchievements.filter(ach => ach.scoutId === scoutId);
    }
    
    return Response.json(achievements);
  }

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
    console.error('Error fetching achievements, falling back to mock data:', error);
    // Return mock data instead of error
    const url = new URL(req.url);
    const scoutId = url.searchParams.get('scoutId');
    
    let achievements = mockAchievements;
    if (scoutId) {
      achievements = mockAchievements.filter(ach => ach.scoutId === scoutId);
    }
    
    return Response.json(achievements);
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
