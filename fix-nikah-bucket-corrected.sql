-- Fix nikah bucket name - CORRECTED VERSION
-- This script creates the correct bucket without trying to delete the old one

-- Create the correct nikah-documents storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'nikah-documents', 
  'nikah-documents', 
  true, 
  10485760, -- 10MB in bytes
  ARRAY['image/jpeg', 'image/png', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security for storage objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated reads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload Access" ON storage.objects;
DROP POLICY IF EXISTS "User Update Access" ON storage.objects;
DROP POLICY IF EXISTS "User Delete Access" ON storage.objects;

-- Allow public read access to files in nikah-documents bucket
CREATE POLICY "Public Read Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'nikah-documents');

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated Upload Access" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'nikah-documents' AND 
    auth.role() = 'authenticated'
  );

-- Allow users to update their own files
CREATE POLICY "User Update Access" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'nikah-documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to delete their own files
CREATE POLICY "User Delete Access" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'nikah-documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Grant necessary permissions
GRANT ALL ON storage.buckets TO authenticated;
GRANT ALL ON storage.objects TO authenticated;

-- Verify bucket creation
SELECT * FROM storage.buckets WHERE name = 'nikah-documents';
