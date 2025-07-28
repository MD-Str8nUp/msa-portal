import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const { data: document, error } = await supabase
      .from('documents')
      .select(`
        *,
        scout:scouts(id, first_name, last_name),
        group:groups(id, name),
        uploader:users(id, first_name, last_name)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('❌ Error fetching document:', error);
      return NextResponse.json({
        success: false,
        error: 'Document not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: document
    });

  } catch (error) {
    console.error('❌ Error in document GET:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // First, get the document to find the file URL for cleanup
    const { data: document, error: fetchError } = await supabase
      .from('documents')
      .select('file_url, uploaded_by')
      .eq('id', id)
      .single();

    if (fetchError || !document) {
      return NextResponse.json({
        success: false,
        error: 'Document not found'
      }, { status: 404 });
    }

    // Delete from database first
    const { error: deleteError } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('❌ Error deleting document from database:', deleteError);
      return NextResponse.json({
        success: false,
        error: 'Failed to delete document'
      }, { status: 500 });
    }

    // Extract filename from URL and delete from storage
    if (document.file_url) {
      try {
        // Extract filename from the URL
        const urlParts = document.file_url.split('/');
        const fileName = urlParts[urlParts.length - 1];
        
        // Attempt to delete from Supabase Storage
        const { error: storageError } = await supabase.storage
          .from('documents')
          .remove([fileName]);

        if (storageError) {
          console.warn('⚠️ Could not delete file from storage:', storageError);
          // Don't fail the request if storage deletion fails
        }
      } catch (storageErr) {
        console.warn('⚠️ Error during storage cleanup:', storageErr);
        // Continue - database deletion was successful
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error in document DELETE:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { title, description, type } = body;

    if (!title) {
      return NextResponse.json({
        success: false,
        error: 'Title is required'
      }, { status: 400 });
    }

    const { data: updatedDocument, error } = await supabase
      .from('documents')
      .update({
        title,
        description,
        type,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        scout:scouts(id, first_name, last_name),
        group:groups(id, name),
        uploader:users(id, first_name, last_name)
      `)
      .single();

    if (error) {
      console.error('❌ Error updating document:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to update document'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Document updated successfully',
      data: updatedDocument
    });

  } catch (error) {
    console.error('❌ Error in document PUT:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}