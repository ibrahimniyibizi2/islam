-- Create documents bucket for shahada passport photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/jpg']
)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS for the bucket
UPDATE storage.buckets SET public = true WHERE id = 'documents';

-- Create policy to allow authenticated users to upload
CREATE POLICY "Allow authenticated uploads" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'documents');

-- Create policy to allow authenticated users to read
CREATE POLICY "Allow authenticated read" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'documents');

-- Create policy to allow public read access
CREATE POLICY "Allow public read" ON storage.objects
  FOR SELECT TO anon
  USING (bucket_id = 'documents');
