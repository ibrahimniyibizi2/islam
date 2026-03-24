-- Create certificate_templates table
CREATE TABLE IF NOT EXISTS certificate_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'Default Template',
  certificate_prefix TEXT DEFAULT 'RCN',
  certificate_format TEXT DEFAULT 'sequential',
  chief_registrar_name TEXT DEFAULT 'Chief Registrar',
  chief_registrar_title TEXT DEFAULT 'Chief Registrar',
  watermark_text TEXT,
  show_watermark BOOLEAN DEFAULT true,
  enable_anti_copy_pattern BOOLEAN DEFAULT true,
  enable_security_fibers BOOLEAN DEFAULT true,
  enable_metallic_strip BOOLEAN DEFAULT true,
  enable_uv_reactive BOOLEAN DEFAULT true,
  enable_security_thread BOOLEAN DEFAULT true,
  enable_guilloche_pattern BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE certificate_templates ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow read access to certificate_templates" 
  ON certificate_templates FOR SELECT 
  USING (true);

CREATE POLICY "Allow insert access to certificate_templates" 
  ON certificate_templates FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow update access to certificate_templates" 
  ON certificate_templates FOR UPDATE 
  USING (true);

-- Insert default template
INSERT INTO certificate_templates (
  name,
  certificate_prefix,
  certificate_format,
  chief_registrar_name,
  chief_registrar_title,
  watermark_text,
  show_watermark,
  enable_anti_copy_pattern,
  enable_security_fibers,
  enable_metallic_strip,
  enable_uv_reactive,
  enable_security_thread,
  enable_guilloche_pattern,
  is_active
) VALUES (
  'Default RIC Certificate Template',
  'RCN',
  'sequential',
  'Chief Registrar',
  'Chief Registrar',
  'Official RIC Document',
  true,
  true,
  true,
  true,
  true,
  true,
  true,
  true
) ON CONFLICT DO NOTHING;
