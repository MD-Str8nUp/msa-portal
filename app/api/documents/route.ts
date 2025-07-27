import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const scoutId = searchParams.get('scoutId');
    const groupId = searchParams.get('groupId');
    
    let query = supabase
      .from('documents')
      .select(`
        *,
        scout:scouts(id, first_name, last_name),
        group:groups(id, name),
        uploader:users(id, first_name, last_name)
      `);

    if (type) {
      query = query.eq('type', type);
    }
    
    if (scoutId) {
      query = query.eq('scout_id', scoutId);
    }
    
    if (groupId) {
      query = query.eq('group_id', groupId);
    }

    const { data: documents, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching documents:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch documents'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: documents || []
    });

  } catch (error) {
    console.error('❌ Error in documents GET:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      title, 
      description, 
      type = 'GENERAL', 
      url, 
      scoutId, 
      groupId, 
      uploaderId 
    } = body;

    if (!title || !url || !uploaderId) {
      return NextResponse.json({
        success: false,
        error: 'Title, URL, and uploader ID are required'
      }, { status: 400 });
    }

    const { data: newDocument, error } = await supabase
      .from('documents')
      .insert({
        title,
        description,
        type,
        url,
        scout_id: scoutId,
        group_id: groupId,
        uploader_id: uploaderId,
        uploaded_at: new Date().toISOString()
      })
      .select(`
        *,
        scout:scouts(id, first_name, last_name),
        group:groups(id, name),
        uploader:users(id, first_name, last_name)
      `)
      .single();

    if (error) {
      console.error('❌ Error creating document:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to create document'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Document uploaded successfully',
      data: newDocument
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Error in documents POST:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
