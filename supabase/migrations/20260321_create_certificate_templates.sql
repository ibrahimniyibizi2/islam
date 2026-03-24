-- Certificate Templates Table for Supabase
-- This table stores customizable certificate settings

CREATE TABLE IF NOT EXISTS certificate_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'Default Nikah Certificate',
  is_active BOOLEAN DEFAULT true,
  
  -- Colors & Theme
  primary_color TEXT DEFAULT '#166534', -- green-800
  secondary_color TEXT DEFAULT '#d97706', -- amber-600
  accent_color TEXT DEFAULT '#f59e0b', -- amber-500
  background_gradient_start TEXT DEFAULT '#fffbeb', -- amber-50
  background_gradient_end TEXT DEFAULT '#ffffff', -- white
  border_style TEXT DEFAULT 'double', -- single, double, dashed
  
  -- Text Content
  header_title TEXT DEFAULT 'REPUBLIC OF RWANDA',
  organization_name TEXT DEFAULT 'RWANDA ISLAMIC COMMUNITY',
  certificate_type TEXT DEFAULT 'Official Marriage Certificate',
  footer_text TEXT DEFAULT 'This certificate is issued under the authority of the Rwanda Islamic Community and is valid for all legal purposes.',
  legal_notice TEXT DEFAULT 'Any alteration or forgery of this document is a criminal offense.',
  
  -- Organization Details
  organization_logo_url TEXT,
  organization_stamp_url TEXT,
  chief_registrar_name TEXT,
  chief_registrar_title TEXT DEFAULT 'Chief Registrar',
  
  -- Layout Settings
  show_photos BOOLEAN DEFAULT true,
  show_qr_code BOOLEAN DEFAULT true,
  show_barcode BOOLEAN DEFAULT false,
  show_nfc_indicator BOOLEAN DEFAULT false,
  photo_frame_style TEXT DEFAULT 'rounded', -- rounded, square, circle
  show_watermark BOOLEAN DEFAULT true,
  watermark_text TEXT,
  
  -- Security Features (toggle on/off)
  enable_guilloche_pattern BOOLEAN DEFAULT true,
  enable_holographic_seal BOOLEAN DEFAULT true,
  enable_official_stamp BOOLEAN DEFAULT true,
  enable_security_thread BOOLEAN DEFAULT true,
  enable_uv_reactive BOOLEAN DEFAULT true,
  enable_metallic_strip BOOLEAN DEFAULT true,
  enable_digital_signature BOOLEAN DEFAULT true,
  enable_machine_readable_zone BOOLEAN DEFAULT true,
  enable_microprint BOOLEAN DEFAULT true,
  enable_security_fibers BOOLEAN DEFAULT true,
  enable_color_shifting_ink BOOLEAN DEFAULT true,
  enable_anti_copy_pattern BOOLEAN DEFAULT true,
  
  -- Certificate Number Format
  certificate_prefix TEXT DEFAULT 'RCN',
  certificate_format TEXT DEFAULT 'PREFIX-YEAR-RANDOM6', -- PREFIX-YEAR-RANDOM6, UUID, CUSTOM
  
  -- Custom Fields (JSON for flexibility)
  custom_fields JSONB DEFAULT '[]',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Only one active template allowed
  CONSTRAINT only_one_active_template UNIQUE (is_active) 
  DEFERRABLE INITIALLY DEFERRED
);

-- Create index for active template lookup
CREATE INDEX IF NOT EXISTS idx_certificate_templates_active ON certificate_templates(is_active) WHERE is_active = true;

-- Insert default template
INSERT INTO certificate_templates (
  name,
  is_active,
  header_title,
  organization_name,
  certificate_type,
  footer_text,
  legal_notice,
  watermark_text,
  custom_fields
) VALUES (
  'Default Nikah Certificate',
  true,
  'REPUBLIC OF RWANDA',
  'RWANDA ISLAMIC COMMUNITY',
  'Official Marriage Certificate',
  'This certificate is issued under the authority of the Rwanda Islamic Community and is valid for all legal purposes.',
  'Any alteration or forgery of this document is a criminal offense.',
  'OFFICIAL',
  '[]'
)
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE certificate_templates ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Super admins can manage certificate templates"
  ON certificate_templates
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

CREATE POLICY "Anyone can read active certificate templates"
  ON certificate_templates
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Function to update timestamp
CREATE OR REPLACE FUNCTION update_certificate_template_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-updating timestamp
DROP TRIGGER IF EXISTS update_certificate_template_timestamp ON certificate_templates;
CREATE TRIGGER update_certificate_template_timestamp
  BEFORE UPDATE ON certificate_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_certificate_template_timestamp();
