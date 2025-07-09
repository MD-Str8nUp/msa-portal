import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import * as crypto from 'crypto';

interface AuthResult {
  authenticated: boolean;
  user?: any;
  error?: string;
}

// Verify a token (matching the pattern from login route)
function verifyToken(token: string): { valid: boolean; userId?: string } {
  try {
    const [header, payload, signature] = token.split('.');
    
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
      return { valid: false };
    }
    
    const expectedSignature = crypto
      .createHmac('sha256', secret)
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

// Verify authentication for API routes
export async function verifyAuth(request: NextRequest): Promise<AuthResult> {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { authenticated: false, error: 'No token provided' };
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const tokenResult = verifyToken(token);
    
    if (!tokenResult.valid || !tokenResult.userId) {
      return { authenticated: false, error: 'Invalid token' };
    }
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: tokenResult.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        isParent: true,
        isLeader: true,
        isExecutive: true,
        isSupport: true,
        createdAt: true,
        lastSeen: true,
        isOnline: true,
        leaderGroups: {
          select: {
            group: {
              select: {
                id: true,
                name: true
              }
            },
            role: true
          }
        }
      }
    });
    
    if (!user) {
      return { authenticated: false, error: 'User not found' };
    }
    
    // Update last seen
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastSeen: new Date(),
        isOnline: true
      }
    });
    
    return { authenticated: true, user };
  } catch (error) {
    console.error('Auth verification error:', error);
    return { authenticated: false, error: 'Authentication failed' };
  }
}

// Verify specific role access
export async function verifyRole(request: NextRequest, requiredRole: string): Promise<AuthResult> {
  const authResult = await verifyAuth(request);
  
  if (!authResult.authenticated) {
    return authResult;
  }
  
  const user = authResult.user;
  
  // Check role-based access
  switch (requiredRole) {
    case 'executive':
      if (user.role !== 'executive' && !user.isExecutive) {
        return { authenticated: false, error: 'Executive access required' };
      }
      break;
    case 'leader':
      if (user.role !== 'leader' && !user.isLeader && !user.isExecutive) {
        return { authenticated: false, error: 'Leader access required' };
      }
      break;
    case 'parent':
      if (user.role !== 'parent' && !user.isParent) {
        return { authenticated: false, error: 'Parent access required' };
      }
      break;
    case 'support':
      if (user.role !== 'support' && !user.isSupport) {
        return { authenticated: false, error: 'Support access required' };
      }
      break;
  }
  
  return authResult;
}

// Generate a simple JWT token (for consistency)
export function generateToken(userId: string): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const payload = Buffer.from(JSON.stringify({ 
    sub: userId, 
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 // 24 hours
  })).toString('base64');
  
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error('NEXTAUTH_SECRET environment variable is required for JWT signing');
  }
  
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${header}.${payload}`)
    .digest('base64');
  
  return `${header}.${payload}.${signature}`;
}