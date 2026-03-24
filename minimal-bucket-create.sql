-- Minimal bucket creation - just create the bucket
-- Run this first, then we can add policies separately if needed

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'nikah-documents', 
  'nikah-documents', 
  true, 
  10485760, -- 10MB in bytes
  ARRAY['image/jpeg', 'image/png', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Check if bucket was created
SELECT * FROM storage.buckets WHERE name = 'nikah-documents';
