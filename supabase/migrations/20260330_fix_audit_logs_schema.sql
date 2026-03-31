-- Migration: Add details column to audit_logs table
-- Created: 2026-03-30

-- Check if audit_logs table exists and add details column if missing
DO $$
BEGIN
    -- Check if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
        -- Check if details column exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'audit_logs' AND column_name = 'details') THEN
            ALTER TABLE audit_logs ADD COLUMN details JSONB;
            RAISE NOTICE 'Added details column to audit_logs table';
        ELSE
            RAISE NOTICE 'details column already exists in audit_logs table';
        END IF;
    ELSE
        -- Create audit_logs table with all required columns
        CREATE TABLE audit_logs (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            action TEXT NOT NULL,
            details JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Add RLS policy for audit_logs
        ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
        
        RAISE NOTICE 'Created audit_logs table with details column';
    END IF;
END $$;

-- Also add other common columns if they don't exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
        -- Add user_id column if missing
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'audit_logs' AND column_name = 'user_id') THEN
            ALTER TABLE audit_logs ADD COLUMN user_id UUID REFERENCES auth.users(id);
        END IF;
        
        -- Add table_name column if missing
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'audit_logs' AND column_name = 'table_name') THEN
            ALTER TABLE audit_logs ADD COLUMN table_name TEXT;
        END IF;
        
        -- Add record_id column if missing
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'audit_logs' AND column_name = 'record_id') THEN
            ALTER TABLE audit_logs ADD COLUMN record_id UUID;
        END IF;
    END IF;
END $$;

-- Create index on action for faster queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

COMMENT ON TABLE audit_logs IS 'Audit trail for all application changes';
