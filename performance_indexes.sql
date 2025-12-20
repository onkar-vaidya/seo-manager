-- Add indexes for better query performance

-- Video SEO table indexes
CREATE INDEX IF NOT EXISTS idx_video_seo_channel_id ON video_seo(channel_id);
CREATE INDEX IF NOT EXISTS idx_video_seo_created_at ON video_seo(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_video_seo_video_id ON video_seo(video_id);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_video_seo_channel_created ON video_seo(channel_id, created_at DESC);

-- Channels table index
CREATE INDEX IF NOT EXISTS idx_channels_created_at ON channels(created_at DESC);

-- Analyze tables to update statistics
ANALYZE video_seo;
ANALYZE channels;
