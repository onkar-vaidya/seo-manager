-- Create team_members table
CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    role TEXT DEFAULT 'editor' CHECK (role IN ('admin', 'editor', 'viewer')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add assignment columns to video_seo
ALTER TABLE video_seo 
ADD COLUMN IF NOT EXISTS assigned_to TEXT,
ADD COLUMN IF NOT EXISTS worked_by TEXT;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_video_seo_assigned_to ON video_seo(assigned_to);
CREATE INDEX IF NOT EXISTS idx_video_seo_worked_by ON video_seo(worked_by);

-- Insert team members
INSERT INTO team_members (name, role, is_active) VALUES
    ('Onkar', 'admin', true),
    ('Mahesh', 'editor', true),
    ('Akash', 'editor', true),
    ('Akshay', 'editor', true)
ON CONFLICT (name) DO NOTHING;

-- Disable RLS for team_members (development only)
ALTER TABLE team_members DISABLE ROW LEVEL SECURITY;
