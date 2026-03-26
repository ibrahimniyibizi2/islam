-- Create OTP table for Track Application feature
CREATE TABLE IF NOT EXISTS otps (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  identifier text NOT NULL,
  otp text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  verified boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX idx_otps_identifier ON otps(identifier);
CREATE INDEX idx_otps_expires_at ON otps(expires_at);

-- Add RLS policies
ALTER TABLE otps ENABLE ROW LEVEL SECURITY;

-- Only service role can access OTPs directly
CREATE POLICY "Service role only" ON otps
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- Function to clean up expired OTPs
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void AS $$
BEGIN
  DELETE FROM otps WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql;
