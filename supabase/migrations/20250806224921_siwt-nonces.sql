-- SIWT

-- Create SIWT nonces table for preventing replay attacks
CREATE TABLE IF NOT EXISTS siwt_nonces (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nonce TEXT NOT NULL,
  address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- Add Status Tracking & Validation Constraints
ALTER TABLE siwt_nonces ADD COLUMN status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'used', 'expired'));

-- Ensure expires_at is always in the future when created
ALTER TABLE siwt_nonces ADD CONSTRAINT check_expires_future 
  CHECK (expires_at > created_at);

-- Ensure used_at is not before created_at
ALTER TABLE siwt_nonces ADD CONSTRAINT check_used_after_created 
  CHECK (used_at IS NULL OR used_at >= created_at);

-- Create indexes for performance
CREATE UNIQUE INDEX IF NOT EXISTS idx_siwt_nonces_nonce_unique ON siwt_nonces(nonce);
CREATE INDEX IF NOT EXISTS idx_siwt_nonces_nonce_address ON siwt_nonces(nonce, address);
CREATE INDEX IF NOT EXISTS idx_siwt_nonces_expires_at ON siwt_nonces(expires_at);

-- Index for checking unused nonces (time-based filtering should be done in queries)
CREATE INDEX IF NOT EXISTS idx_siwt_nonces_unused 
  ON siwt_nonces(nonce, expires_at) WHERE used_at IS NULL;

-- Create a function to clean up expired nonces
CREATE OR REPLACE FUNCTION cleanup_expired_nonces()
RETURNS void AS $$
BEGIN
  -- Remove expired nonces OR used nonces older than 24 hours
  DELETE FROM siwt_nonces 
  WHERE expires_at < NOW() 
     OR (used_at IS NOT NULL AND used_at < NOW() - INTERVAL '24 hours');
END;
$$ LANGUAGE plpgsql;

-- Note: To enable automatic cleanup, you would need to:
-- 1. Enable pg_cron extension in your Supabase project
-- 2. Uncomment the following lines:
-- SELECT cron.schedule(
--   'cleanup-expired-nonces', 
--   '0 * * * *', -- Every hour
--   'SELECT cleanup_expired_nonces();'
-- );

-- Add RLS policies
ALTER TABLE siwt_nonces ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to insert nonces (for login challenges)
CREATE POLICY "Anyone can create nonces" ON siwt_nonces
  FOR INSERT WITH CHECK (true);

-- Allow anonymous users to read their own nonces (for verification)
CREATE POLICY "Anyone can read nonces" ON siwt_nonces
  FOR SELECT USING (true);

-- Allow anonymous users to update nonces (marking as used)
CREATE POLICY "Anyone can update nonces" ON siwt_nonces
  FOR UPDATE USING (true);

-- Only service role can delete (or allow cleanup via function)
CREATE POLICY "Service role can delete nonces" ON siwt_nonces
  FOR DELETE USING (auth.role() = 'service_role');
