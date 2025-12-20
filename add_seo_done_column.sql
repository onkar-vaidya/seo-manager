-- Add is_seo_done column to video_seo table
ALTER TABLE video_seo 
ADD COLUMN IF NOT EXISTS is_seo_done BOOLEAN DEFAULT FALSE;

-- Create index for filtering by SEO status
CREATE INDEX IF NOT EXISTS idx_video_seo_is_done ON video_seo(is_seo_done);
