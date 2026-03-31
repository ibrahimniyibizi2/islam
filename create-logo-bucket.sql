-- Create public bucket for logos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'logo', 
  'logo', 
  true, 
  5242880, -- 5MB
  ARRAY['image/png', 'image/jpeg', 'image/svg+xml']
) ON CONFLICT (id) DO NOTHING;

-- Set public access policy
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'logo');

-- Allow authenticated users to upload to logo bucket
CREATE POLICY "Authenticated users can upload logos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'logo' AND 
  auth.role() = 'authenticated'
);

-- Allow authenticated users to update logo objects
CREATE POLICY "Authenticated users can update logos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'logo' AND 
  auth.role() = 'authenticated'
);
