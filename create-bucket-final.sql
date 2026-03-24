-- Add missing document URL columns to nikah_applications
ALTER TABLE public.nikah_applications
  ADD COLUMN IF NOT EXISTS hiv_test_url text,
  ADD COLUMN IF NOT EXISTS groom_birth_cert_url text,
  ADD COLUMN IF NOT EXISTS bride_birth_cert_url text,
  ADD COLUMN IF NOT EXISTS groom_passport_photo_url text,
  ADD COLUMN IF NOT EXISTS bride_passport_photo_url text;

-- Create storage bucket for nikah documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('nikah-documents', 'nikah-documents', false)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for nikah-documents bucket
CREATE POLICY "Users can upload nikah documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'nikah-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own nikah documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'nikah-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Super admins can view all nikah documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'nikah-documents' AND public.user_has_role(auth.uid(), 'super_admin'));
