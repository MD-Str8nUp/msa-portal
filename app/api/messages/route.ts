import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { mockMessageService } from '@/lib/mock/data';

export async function GET(req: NextRequest) {
  // If database is disabled, return mock data
  if (process.env.DISABLE_DATABASE === 'true') {
    const mockMessages = mockMessageService.getMessages('user-1'); // Default to user-1 for now
    return Response.json(mockMessages);
  }

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
    console.error('Error fetching messages, falling back to mock data:', error);
    const mockMessages = mockMessageService.getMessages('user-1'); // Default fallback
    return Response.json(mockMessages);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { content, senderId, receiverId } = await req.json();
    
    if (!content || !senderId || !receiverId) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // If database is disabled, simulate message creation
    if (process.env.DISABLE_DATABASE === 'true') {
      const mockMessage = {
        id: `msg-${Date.now()}`,
        content,
        senderId,
        receiverId,
        read: false,
        createdAt: new Date().toISOString(),
        sender: { id: senderId, name: 'Mock User', avatar: null },
        receiver: { id: receiverId, name: 'Mock Recipient', avatar: null }
      };
      return Response.json(mockMessage, { status: 201 });
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
    console.error('Error creating message, returning mock:', error);
    const { content: reqContent, senderId: reqSenderId, receiverId: reqReceiverId } = await req.json();
    const mockMessage = {
      id: `msg-${Date.now()}`,
      content: reqContent || 'Mock message',
      senderId: reqSenderId || 'user-1',
      receiverId: reqReceiverId || 'user-2',
      read: false,
      createdAt: new Date().toISOString(),
      sender: { id: 'user-1', name: 'Mock User', avatar: null },
      receiver: { id: 'user-2', name: 'Mock Recipient', avatar: null }
    };
    return Response.json(mockMessage, { status: 201 });
  }
}
