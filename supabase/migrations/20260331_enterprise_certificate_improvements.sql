-- 🚀 ENTERPRISE-GRADE IMPROVEMENTS FOR CERTIFICATE SYSTEM
-- Migration: Add duplicate prevention, security, and persistence

-- ============================================
-- 1. ADD certificate_sent FLAG (Prevent Duplicates)
-- ============================================

ALTER TABLE shahada_applications 
ADD COLUMN IF NOT EXISTS certificate_sent BOOLEAN DEFAULT FALSE;

ALTER TABLE shahada_applications 
ADD COLUMN IF NOT EXISTS certificate_sent_at TIMESTAMP WITH TIME ZONE;

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_shahada_certificate_sent 
ON shahada_applications(certificate_sent) 
WHERE certificate_sent = TRUE;

-- ============================================
-- 2. CREATE EMAIL LOGS TABLE (Analytics & Debugging)
-- ============================================

CREATE TABLE IF NOT EXISTS email_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES shahada_applications(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  notification_type VARCHAR(50) NOT NULL, -- 'certificate_email', 'whatsapp', 'reminder'
  channel VARCHAR(20) NOT NULL, -- 'email', 'whatsapp', 'sms'
  status VARCHAR(20) NOT NULL, -- 'success', 'failed', 'retry', 'duplicate_prevented'
  recipient VARCHAR(255),
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  pdf_size_bytes INTEGER,
  certificate_url TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_logs_application 
ON email_logs(application_id);

CREATE INDEX IF NOT EXISTS idx_email_logs_status 
ON email_logs(status);

CREATE INDEX IF NOT EXISTS idx_email_logs_created_at 
ON email_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_email_logs_notification_type 
ON email_logs(notification_type);

-- ============================================
-- 3. CREATE STORAGE BUCKET FOR CERTIFICATES
-- ============================================

-- Insert bucket (will be created if not exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'certificates', 
  'certificates', 
  true, -- Public for direct download
  10485760, -- 10MB limit
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on bucket
UPDATE storage.buckets SET public = true WHERE id = 'certificates';

-- ============================================
-- 4. STORAGE POLICIES (Security)
-- ============================================

-- Policy: Anyone can read certificates (public access for downloads)
CREATE POLICY IF NOT EXISTS "Public can read certificates" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'certificates');

-- Policy: Only authenticated users can upload
CREATE POLICY IF NOT EXISTS "Authenticated users can upload certificates" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'certificates' 
  AND auth.role() = 'authenticated'
);

-- Policy: Only admins can delete
CREATE POLICY IF NOT EXISTS "Only admins can delete certificates" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'certificates' 
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  )
);

-- ============================================
-- 5. UPDATE TYPES (Add new columns to TypeScript types)
-- ============================================

COMMENT ON COLUMN shahada_applications.certificate_sent IS 
'Flag to prevent duplicate certificate emails';

COMMENT ON COLUMN shahada_applications.certificate_sent_at IS 
'Timestamp when certificate was sent';

COMMENT ON TABLE email_logs IS 
'Audit log for all certificate notifications (email, WhatsApp, SMS)';

-- ============================================
-- 6. TRIGGER: Auto-update certificate_sent_at
-- ============================================

CREATE OR REPLACE FUNCTION update_certificate_sent_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.certificate_sent = TRUE AND OLD.certificate_sent = FALSE THEN
    NEW.certificate_sent_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_certificate_sent_timestamp ON shahada_applications;

CREATE TRIGGER trigger_certificate_sent_timestamp
  BEFORE UPDATE ON shahada_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_certificate_sent_timestamp();

-- ============================================
-- 7. FUNCTION: Get email statistics
-- ============================================

CREATE OR REPLACE FUNCTION get_certificate_email_stats(
  start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  total_attempts BIGINT,
  successful_sends BIGINT,
  failed_sends BIGINT,
  duplicate_preventions BIGINT,
  success_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_attempts,
    COUNT(*) FILTER (WHERE status = 'success') as successful_sends,
    COUNT(*) FILTER (WHERE status = 'failed') as failed_sends,
    COUNT(*) FILTER (WHERE status = 'duplicate_prevented') as duplicate_preventions,
    ROUND(
      COUNT(*) FILTER (WHERE status = 'success') * 100.0 / NULLIF(COUNT(*), 0), 
      2
    ) as success_rate
  FROM email_logs
  WHERE created_at BETWEEN start_date AND end_date
  AND notification_type = 'certificate_email';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 8. VIEW: Certificate delivery summary
-- ============================================

CREATE OR REPLACE VIEW certificate_delivery_summary AS
SELECT 
  sa.id as application_id,
  sa.first_name,
  sa.last_name,
  sa.email,
  sa.phone,
  sa.status,
  sa.certificate_sent,
  sa.certificate_sent_at,
  sa.certificate_id,
  COUNT(el.id) FILTER (WHERE el.channel = 'email') as email_attempts,
  COUNT(el.id) FILTER (WHERE el.channel = 'whatsapp') as whatsapp_attempts,
  MAX(el.created_at) as last_notification_at,
  BOOL_OR(el.status = 'success' AND el.channel = 'email') as email_delivered,
  BOOL_OR(el.status = 'success' AND el.channel = 'whatsapp') as whatsapp_delivered
FROM shahada_applications sa
LEFT JOIN email_logs el ON sa.id = el.application_id
WHERE sa.status = 'completed'
GROUP BY sa.id, sa.first_name, sa.last_name, sa.email, sa.phone, 
         sa.status, sa.certificate_sent, sa.certificate_sent_at, sa.certificate_id;

-- ============================================
-- VERIFICATION
-- ============================================

-- Check all new columns
SELECT 
  column_name, 
  data_type, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'shahada_applications' 
AND column_name IN ('certificate_sent', 'certificate_sent_at');

-- Check email_logs table
SELECT COUNT(*) as total_logs FROM email_logs;

-- Check storage bucket
SELECT id, name, public FROM storage.buckets WHERE id = 'certificates';
