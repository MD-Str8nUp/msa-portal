import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get a sample of real users for testing
    const users = await prisma.user.findMany({
      where: {
        isParent: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        scouts: {
          select: {
            id: true,
            name: true,
            age: true,
            group: {
              select: {
                name: true
              }
            }
          }
        }
      },
      take: 10
    });

    console.log(`✅ Found ${users.length} real parent users`);

    return NextResponse.json({
      success: true,
      message: `Found ${users.length} real parent users`,
      users: users,
      sampleLogin: users.length > 0 ? {
        email: users[0].email,
        password: 'Msa@2025',
        name: users[0].name,
        children: users[0].scouts.length
      } : null
    });

  } catch (error) {
    console.error('❌ Test users error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch test users',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}