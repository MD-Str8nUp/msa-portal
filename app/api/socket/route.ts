import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Socket.io doesn't work well with Vercel's serverless functions
  // For production, consider using a separate WebSocket service or Vercel's Edge Runtime
  return NextResponse.json({ 
    message: 'Socket endpoint - Consider using a dedicated WebSocket service for production',
    status: 'disabled' 
  });
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
}
