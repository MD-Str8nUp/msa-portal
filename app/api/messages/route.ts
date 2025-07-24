import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    console.log('Messages API: Fetching messages with filters:', { userId, type, page, limit });

    const supabase = getAdminClient();
    let query = supabase
      .from('messages')
      .select('*');

    // Apply filters
    if (userId) {
      query = query.or(`sender_id.eq.${userId},recipient_id.eq.${userId}`);
    }

    if (type) {
      query = query.eq('type', type);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: messages, error, count } = await query
      .range(from, to)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Messages API: Error fetching messages:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch messages'
      }, { status: 500 });
    }

    console.log('Messages API: Messages fetched successfully');

    return NextResponse.json({
      success: true,
      data: {
        messages: messages || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          pages: Math.ceil((count || 0) / limit)
        }
      }
    });

  } catch (error) {
    console.error('Messages API: Error in messages GET:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = getAdminClient();
    const {
      senderId,
      recipientId,
      subject,
      content,
      type = 'MESSAGE',
      priority = 'NORMAL'
    } = body;

    console.log('Messages API: Creating new message:', { senderId, recipientId, subject });

    if (!senderId || !recipientId || !content) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: senderId, recipientId, content'
      }, { status: 400 });
    }

    // Create message
    const { data: newMessage, error } = await supabase
      .from('messages')
      .insert({
        sender_id: senderId,
        recipient_id: recipientId,
        subject,
        content,
        type,
        priority,
        status: 'SENT',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Messages API: Error creating message:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to create message'
      }, { status: 500 });
    }

    console.log('Messages API: Message created successfully');

    return NextResponse.json({
      success: true,
      message: 'Message created successfully',
      data: newMessage
    }, { status: 201 });

  } catch (error) {
    console.error('Messages API: Error in messages POST:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}