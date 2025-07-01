import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const messages = await prisma.message.findMany({
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
        receiver: { select: { id: true, name: true, avatar: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return Response.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return Response.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { content, senderId, receiverId } = await req.json();
    
    if (!content || !senderId || !receiverId) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const message = await prisma.message.create({
      data: {
        content,
        senderId,
        receiverId
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
        receiver: { select: { id: true, name: true, avatar: true } }
      }
    });
    
    return Response.json(message, { status: 201 });
  } catch (error) {
    console.error('Error creating message:', error);
    return Response.json({ error: 'Failed to create message' }, { status: 500 });
  }
}
