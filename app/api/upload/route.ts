import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// File validation constants
const ALLOWED_FILE_TYPES = {
  // Documents
  'application/pdf': { extension: 'pdf', maxSize: 10 * 1024 * 1024 }, // 10MB
  'application/msword': { extension: 'doc', maxSize: 10 * 1024 * 1024 },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { extension: 'docx', maxSize: 10 * 1024 * 1024 },
  'text/plain': { extension: 'txt', maxSize: 10 * 1024 * 1024 },
  'application/rtf': { extension: 'rtf', maxSize: 10 * 1024 * 1024 },
  
  // Images
  'image/jpeg': { extension: 'jpg', maxSize: 5 * 1024 * 1024 }, // 5MB
  'image/jpg': { extension: 'jpg', maxSize: 5 * 1024 * 1024 },
  'image/png': { extension: 'png', maxSize: 5 * 1024 * 1024 },
  'image/gif': { extension: 'gif', maxSize: 5 * 1024 * 1024 },
  'image/webp': { extension: 'webp', maxSize: 5 * 1024 * 1024 },
};

const DEFAULT_MAX_SIZE = 2 * 1024 * 1024; // 2MB for other files

interface FileValidation {
  isValid: boolean;
  error?: string;
  fileInfo?: {
    extension: string;
    maxSize: number;
  };
}

function validateFile(file: File): FileValidation {
  // Check if file type is allowed
  if (!ALLOWED_FILE_TYPES[file.type as keyof typeof ALLOWED_FILE_TYPES]) {
    return {
      isValid: false,
      error: `File type '${file.type}' is not allowed. Supported formats: PDF, DOC, DOCX, TXT, RTF, JPG, PNG, GIF, WebP`
    };
  }

  const fileInfo = ALLOWED_FILE_TYPES[file.type as keyof typeof ALLOWED_FILE_TYPES];
  
  // Check file size
  if (file.size > fileInfo.maxSize) {
    const maxSizeMB = fileInfo.maxSize / (1024 * 1024);
    return {
      isValid: false,
      error: `File size (${(file.size / (1024 * 1024)).toFixed(2)}MB) exceeds maximum allowed size of ${maxSizeMB}MB`
    };
  }

  // Check for empty files
  if (file.size === 0) {
    return {
      isValid: false,
      error: 'File is empty'
    };
  }

  return {
    isValid: true,
    fileInfo
  };
}

function sanitizeFileName(fileName: string): string {
  // Remove special characters and spaces, keep only alphanumeric, dots, hyphens, and underscores
  return fileName
    .replace(/[^a-zA-Z0-9.\-_]/g, '_')
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .toLowerCase();
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const type = formData.get('type') as string || 'GENERAL';
    const scoutId = formData.get('scoutId') as string;
    const groupId = formData.get('groupId') as string;
    const uploaderId = formData.get('uploaderId') as string;

    // Validate required fields
    if (!file) {
      return NextResponse.json({
        success: false,
        error: 'No file provided'
      }, { status: 400 });
    }

    if (!title || !uploaderId) {
      return NextResponse.json({
        success: false,
        error: 'Title and uploader ID are required'
      }, { status: 400 });
    }

    // Validate file
    const validation = validateFile(file);
    if (!validation.isValid) {
      return NextResponse.json({
        success: false,
        error: validation.error
      }, { status: 400 });
    }

    // Verify uploader exists
    const { data: uploader, error: uploaderError } = await supabase
      .from('users')
      .select('id, first_name, last_name')
      .eq('id', uploaderId)
      .single();

    if (uploaderError || !uploader) {
      return NextResponse.json({
        success: false,
        error: 'Invalid uploader ID'
      }, { status: 400 });
    }

    // Generate unique filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const sanitizedOriginalName = sanitizeFileName(file.name);
    const fileName = `${timestamp}_${sanitizedOriginalName}`;

    // Convert file to ArrayBuffer for Supabase Storage
    const fileBuffer = await file.arrayBuffer();
    const fileData = new Uint8Array(fileBuffer);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, fileData, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error('❌ Supabase Storage upload error:', uploadError);
      return NextResponse.json({
        success: false,
        error: 'Failed to upload file to storage'
      }, { status: 500 });
    }

    // Get public URL for the uploaded file
    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(fileName);

    if (!urlData?.publicUrl) {
      return NextResponse.json({
        success: false,
        error: 'Failed to get file URL'
      }, { status: 500 });
    }

    // Save document metadata to database
    const { data: newDocument, error: dbError } = await supabase
      .from('documents')
      .insert({
        title,
        description,
        type,
        file_url: urlData.publicUrl,
        file_type: file.type,
        file_size: file.size,
        scout_id: scoutId || null,
        group_id: groupId || null,
        uploaded_by: uploaderId,
        created_at: new Date().toISOString()
      })
      .select(`
        *,
        scout:scouts(id, first_name, last_name),
        group:groups(id, name),
        uploader:users(id, first_name, last_name)
      `)
      .single();

    if (dbError) {
      console.error('❌ Database insert error:', dbError);
      
      // Clean up uploaded file if database insert fails
      await supabase.storage
        .from('documents')
        .remove([fileName]);

      return NextResponse.json({
        success: false,
        error: 'Failed to save document metadata'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        ...newDocument,
        uploadInfo: {
          originalName: file.name,
          storedName: fileName,
          size: file.size,
          type: file.type
        }
      }
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Upload endpoint error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error during file upload'
    }, { status: 500 });
  }
}

// Handle file size limit for Next.js
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}