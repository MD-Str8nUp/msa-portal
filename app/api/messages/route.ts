import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const conversationWith = searchParams.get('conversationWith');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    console.log('💬 Fetching messages...', { userId, conversationWith, unreadOnly });

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameter: userId'
      }, { status: 400 });
    }

    // Build where clause
    let whereClause: any = {};
    
    if (conversationWith) {
      // Get messages between two specific users
      whereClause = {
        OR: [
          { senderId: userId, receiverId: conversationWith },
          { senderId: conversationWith, receiverId: userId }
        ]
      };
    } else {
      // Get all messages for user
      whereClause = {
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ]
      };
    }
    
    if (unreadOnly) {
      whereClause.read = false;
      whereClause.receiverId = userId;
    }

    // Get total count
    const totalMessages = await prisma.message.count({ where: whereClause });

    // Get paginated messages
    const messages = await prisma.message.findMany({
      where: whereClause,
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true
          }
        }
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Get unread count for user
    const unreadCount = await prisma.message.count({
      where: {
        receiverId: userId,
        read: false
      }
    });

    console.log('✅ Messages retrieved:', messages.length);

    return NextResponse.json({
      success: true,
      data: messages,
      unreadCount,
      pagination: {
        page,
        limit,
        total: totalMessages,
        totalPages: Math.ceil(totalMessages / limit)
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Messages API error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch messages',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { content, senderId, receiverId } = body;
    
    console.log('📤 Sending new message...');

    // Validate required fields
    if (!content || !senderId || !receiverId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: content, senderId, receiverId'
      }, { status: 400 });
    }

    // Verify users exist
    const [sender, receiver] = await Promise.all([
      prisma.user.findUnique({ where: { id: senderId } }),
      prisma.user.findUnique({ where: { id: receiverId } })
    ]);

    if (!sender || !receiver) {
      return NextResponse.json({
        success: false,
        error: 'Sender or receiver not found'
      }, { status: 404 });
    }

    // Create message
    const newMessage = await prisma.message.create({
      data: {
        content,
        senderId,
        receiverId,
        read: false
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        }
      }
    });

    console.log('✅ Message sent:', newMessage.id);

    return NextResponse.json({
      success: true,
      data: newMessage,
      message: `Message sent to ${receiver.name}`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Message creation error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to send message',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { messageIds, markAsRead } = body;
    
    console.log('📝 Updating messages...', { messageIds, markAsRead });

    // Validate required fields
    if (!messageIds || !Array.isArray(messageIds)) {
      return NextResponse.json({
        success: false,
        error: 'Missing required field: messageIds (array)'
      }, { status: 400 });
    }

    // Update messages
    const result = await prisma.message.updateMany({
      where: {
        id: {
          in: messageIds
        }
      },
      data: {
        read: markAsRead !== false // Default to true if not specified
      }
    });

    console.log('✅ Messages updated:', result.count);

    return NextResponse.json({
      success: true,
      data: {
        updatedCount: result.count
      },
      message: `${result.count} messages marked as ${markAsRead === false ? 'unread' : 'read'}`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Message update error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to update messages',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');
    
    console.log('🗑️ Deleting message:', { id, userId });

    if (!id || !userId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: id, userId'
      }, { status: 400 });
    }

    // Verify message belongs to user (as sender or receiver)
    const message = await prisma.message.findUnique({
      where: { id },
      include: {
        sender: { select: { name: true } },
        receiver: { select: { name: true } }
      }
    });

    if (!message) {
      return NextResponse.json({
        success: false,
        error: 'Message not found'
      }, { status: 404 });
    }

    if (message.senderId !== userId && message.receiverId !== userId) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized to delete this message'
      }, { status: 403 });
    }

    await prisma.message.delete({
      where: { id }
    });

    console.log('✅ Message deleted:', id);

    return NextResponse.json({
      success: true,
      message: 'Message deleted successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Message deletion error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to delete message',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}