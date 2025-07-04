import { NextRequest } from 'next/server';
import * as crypto from 'crypto';

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

export async function GET(req: NextRequest) {
  try {
    // Get authorization header
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Response.json({ valid: false }, { status: 401 });
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const { valid } = verifyToken(token);
    
    if (!valid) {
      return Response.json({ valid: false }, { status: 401 });
    }
    
    return Response.json({ valid: true });
  } catch (error) {
    console.error('Token validation error:', error);
    return Response.json({ valid: false }, { status: 500 });
  }
}
