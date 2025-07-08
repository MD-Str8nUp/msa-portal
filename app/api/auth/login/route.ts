import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as crypto from 'crypto';
import bcrypt from 'bcryptjs';

// Generate a simple JWT token
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

// Verify a token
function verifyToken(token: string): { valid: boolean; userId?: string } {
  try {
    const [header, payload, signature] = token.split('.');
    
    const expectedSignature = crypto
      .createHmac('sha256', process.env.NEXTAUTH_SECRET || 'fallback-secret')
      .update(`${header}.${payload}`)
      .digest('base64');
    
    if (signature !== expectedSignature) {
      return { valid: false };
    }
    
    const decodedPayload = JSON.parse(Buffer.from(payload, 'base64').toString());
    
    if (decodedPayload.exp < Math.floor(Date.now() / 1000)) {
      return { valid: false };
    }
    
    return { valid: true, userId: decodedPayload.sub };
  } catch (error) {
    return { valid: false };
  }
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    
    if (!email || !password) {
      return Response.json({ error: 'Email and password are required' }, { status: 400 });
    }
    
    // Check if user exists in database
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      return Response.json({ error: 'Invalid email or password' }, { status: 401 });
    }
    
    // Check if password matches using bcrypt
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return Response.json({ error: 'Invalid email or password' }, { status: 401 });
    }
    
    // Generate token
    const token = generateToken(user.id);
    
    // Update user's online status
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isOnline: true,
        lastSeen: new Date()
      }
    });
    
    // Return user and token
    return Response.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    return Response.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
