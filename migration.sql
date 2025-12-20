-- ============================================
-- Database Schema Simplification Migration
-- ============================================

-- STEP 1: Create new simplified table
-- ============================================

CREATE TABLE IF NOT EXISTS video_seo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
    video_id TEXT UNIQUE NOT NULL,
    
    -- Titles
    old_title TEXT NOT NULL,
    title_v1 TEXT,
    title_v2 TEXT,
    title_v3 TEXT,
    
    -- Shared content
    description TEXT,
    tags TEXT[], -- Array of tags
    
    -- Metadata
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_video_seo_channel ON video_seo(channel_id);
CREATE INDEX IF NOT EXISTS idx_video_seo_video_id ON video_seo(video_id);

-- Disable RLS for development (you can enable later if needed)
ALTER TABLE video_seo DISABLE ROW LEVEL SECURITY;


-- STEP 2: Migrate existing data
-- ============================================

INSERT INTO video_seo (
    channel_id,
    video_id,
    old_title,
    title_v1,
    title_v2,
    title_v3,
    description,
    tags,
    published_at,
    created_at
)
SELECT 
    v.channel_id,
    v.video_id,
    COALESCE(v0.title, v.video_title) as old_title,
    v1.title as title_v1,
    v2.title as title_v2,
    v3.title as title_v3,
    COALESCE(v0.description, '') as description,
    CASE 
        WHEN v0.tags IS NOT NULL THEN 
            ARRAY(SELECT jsonb_array_elements_text(v0.tags))
        ELSE 
            ARRAY[]::TEXT[]
    END as tags,
    v.published_at,
    v.created_at
FROM videos v
LEFT JOIN seo_versions v0 ON v.id = v0.video_id AND v0.version_number = 0
LEFT JOIN seo_versions v1 ON v.id = v1.video_id AND v1.version_number = 1
LEFT JOIN seo_versions v2 ON v.id = v2.video_id AND v2.version_number = 2
LEFT JOIN seo_versions v3 ON v.id = v3.video_id AND v3.version_number = 3
ON CONFLICT (video_id) DO NOTHING;


-- STEP 3: Verify migration
-- ============================================

-- Check counts match
SELECT 
    (SELECT COUNT(*) FROM videos) as old_videos_count,
    (SELECT COUNT(*) FROM video_seo) as new_video_seo_count;

-- Sample data check
SELECT * FROM video_seo LIMIT 5;


-- STEP 4: Drop old tables (ONLY AFTER VERIFYING!)
-- ============================================
-- CAUTION: This is irreversible! Make sure you've verified the migration first.

-- Drop old tables now that migration is complete:

DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS seo_versions CASCADE;
DROP TABLE IF EXISTS videos CASCADE;


-- ============================================
-- ROLLBACK (if something goes wrong)
-- ============================================

-- To rollback, simply drop the new table:
-- DROP TABLE IF EXISTS video_seo CASCADE;
