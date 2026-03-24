-- Create system_settings table for persistent configuration storage
CREATE TABLE IF NOT EXISTS system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section text NOT NULL, -- 'general', 'security', 'notifications', etc.
  settings jsonb NOT NULL DEFAULT '{}',
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  UNIQUE(section)
);

-- Enable RLS
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for super_admin access
CREATE POLICY "Super admins can manage system settings" ON system_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role_id = (SELECT id FROM roles WHERE name = 'super_admin' LIMIT 1)
    )
  );

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_system_settings_section ON system_settings(section);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_system_settings_updated_at 
    BEFORE UPDATE ON system_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default settings
INSERT INTO system_settings (section, settings) VALUES
('general', '{
  "siteName": "Rwanda Islamic",
  "logoUrl": "",
  "primaryColor": "#059669",
  "secondaryColor": "#64748b",
  "defaultLanguage": "en",
  "timezone": "Africa/Kigali"
}'::jsonb),
('security', '{
  "passwordMinLength": 8,
  "passwordRequireUppercase": true,
  "passwordRequireLowercase": true,
  "passwordRequireNumbers": true,
  "passwordRequireSpecialChars": true,
  "twoFactorEnabled": false,
  "sessionTimeout": 24,
  "maxLoginAttempts": 5,
  "lockoutDuration": 15
}'::jsonb),
('notifications', '{
  "emailProvider": "supabase",
  "smsProvider": "pindo",
  "emailTemplates": {
    "welcome": true,
    "certificate": true,
    "approval": true,
    "rejection": true
  },
  "smsEnabled": true,
  "emailEnabled": true,
  "certificateDelivery": true
}'::jsonb),
('roles', '{
  "defaultPermissions": {
    "masjid_admin": ["users.read", "masjids.read", "masjids.update", "certificates.read", "certificates.create"],
    "imam": ["users.read", "masjids.read", "certificates.read", "certificates.create", "prayers.read", "prayers.create"],
    "mufti": ["users.read", "masjids.read", "certificates.read", "certificates.create", "fatwas.read", "fatwas.create"],
    "public_user": ["masjids.read", "certificates.read"]
  },
  "preventSystemRoleEdit": true,
  "requirePermissionEscalationConfirmation": true
}'::jsonb),
('audit', '{
  "logLevel": "info",
  "retentionDays": 90,
  "enableUserTracking": true,
  "enableSystemTracking": true,
  "enableSecurityTracking": true
}'::jsonb),
('integrations', '{
  "sms": {
    "provider": "pindo",
    "apiKey": "",
    "senderId": "",
    "webhookUrl": ""
  },
  "email": {
    "provider": "smtp",
    "smtpHost": "",
    "smtpPort": 587,
    "smtpUser": "",
    "smtpPassword": "",
    "smtpSecure": true
  },
  "externalApis": {
    "supabaseFunctions": true,
    "webhookEndpoints": [],
    "apiKeys": []
  }
}'::jsonb),
('guardrails', '{
  "preventLastSuperAdminRemoval": true,
  "requireMasjidIdForRoles": true,
  "allowedCertificateLanguages": ["en", "fr", "rw"],
  "certificateFormats": ["pdf", "png"],
  "maxDailyCertificates": 100,
  "requireApprovalForNewMasjids": true
}'::jsonb),
('system', '{
  "maintenanceMode": false,
  "maintenanceMessage": "System is currently under maintenance. Please try again later.",
  "enableHealthMonitoring": true,
  "enableErrorReporting": true,
  "enablePerformanceMonitoring": true
}'::jsonb)
ON CONFLICT (section) DO NOTHING;
