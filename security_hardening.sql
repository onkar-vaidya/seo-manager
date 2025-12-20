-- SECURITY HARDENING
-- Enable Row Level Security (RLS) on all tables to prevent public access

-- 1. Enable RLS
ALTER TABLE video_seo ENABLE ROW LEVEL SECURITY;
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- 2. Create Policies for "video_seo"
-- Allow full access (select, insert, update, delete) only to authenticated users
CREATE POLICY "Enable all for authenticated users" ON video_seo
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 3. Create Policies for "channels"
CREATE POLICY "Enable all for authenticated users" ON channels
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 4. Create Policies for "team_members"
CREATE POLICY "Enable all for authenticated users" ON team_members
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 5. Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
