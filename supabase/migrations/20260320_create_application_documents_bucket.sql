-- Create storage bucket for application documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'application_documents',
  'application_documents',
  true,
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
)
ON CONFLICT (id) DO NOTHING;

-- Create policy to allow authenticated users to upload files
CREATE POLICY "Allow authenticated uploads" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'application_documents');

-- Create policy to allow authenticated users to read files
CREATE POLICY "Allow authenticated reads" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'application_documents');

-- Create policy to allow public reads (for viewing uploaded documents)
CREATE POLICY "Allow public reads" ON storage.objects
  FOR SELECT TO anon
  USING (bucket_id = 'application_documents');
