import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST() {
  try {
    // Get the first parent user for demo login
    const demoParent = await prisma.user.findFirst({
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
      }
    });

    if (!demoParent) {
      return NextResponse.json({
        success: false,
        error: 'No parent users found in database'
      }, { status: 404 });
    }

    // Auto-login this user by generating a token
    const crypto = require('crypto');
    
    function generateToken(userId: string): string {
      const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
      const payload = Buffer.from(JSON.stringify({ 
        sub: userId, 
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 // 24 hours
      })).toString('base64');
      
      const signature = crypto
        .createHmac('sha256', process.env.NEXTAUTH_SECRET || 'fallback-secret')
        .update(`${header}.${payload}`)
        .digest('base64');
      
      return `${header}.${payload}.${signature}`;
    }

    const token = generateToken(demoParent.id);

    // Update user's online status
    await prisma.user.update({
      where: { id: demoParent.id },
      data: {
        isOnline: true,
        lastSeen: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Demo login successful',
      user: {
        id: demoParent.id,
        name: demoParent.name,
        email: demoParent.email,
        role: demoParent.role
      },
      token,
      children: demoParent.scouts,
      loginInstructions: {
        email: demoParent.email,
        password: 'Msa@2025',
        note: 'All imported users have the password: Msa@2025'
      }
    });

  } catch (error) {
    console.error('❌ Demo login error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to create demo login',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}