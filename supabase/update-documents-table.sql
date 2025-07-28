-- Update documents table to include missing scout_id column
-- This ensures compatibility with the existing API that expects scout_id

-- Add scout_id column if it doesn't exist
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS scout_id UUID REFERENCES scouts(id) ON DELETE SET NULL;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_documents_scout_id ON documents(scout_id);

-- Create Supabase Storage bucket for documents if it doesn't exist
-- This needs to be run in Supabase dashboard SQL editor with appropriate permissions
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  true,
  10485760, -- 10MB limit
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/rtf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policy for storage bucket
-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'documents' AND 
    auth.role() = 'authenticated'
  );

-- Allow public read access to documents
CREATE POLICY "Public can view documents" ON storage.objects
  FOR SELECT USING (bucket_id = 'documents');

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete their own documents" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );