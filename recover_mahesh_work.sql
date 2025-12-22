-- Recovery script to attribute anonymous work
-- Goal: Attribute "Mahesh" to the bulk of older videos and ensure "Onkar" (or current user) is preserved.

-- 1. Check current breakdown
SELECT worked_by, count(*) as count
FROM video_seo 
WHERE is_seo_done = true 
GROUP BY worked_by;

-- 2. Preview potential updates (Check NULLs)
SELECT count(*) as unassigned_completed_videos
FROM video_seo 
WHERE is_seo_done = true 
AND worked_by IS NULL;

-- 3. (Optional) If you can separate by date, use a date cutoff.
-- Example: Updates before Today to Mahesh, Today to Onkar
-- UPDATE video_seo SET worked_by = 'Mahesh' WHERE is_seo_done = true AND worked_by IS NULL AND created_at < '2024-12-22';
-- UPDATE video_seo SET worked_by = 'Onkar' WHERE is_seo_done = true AND worked_by IS NULL AND created_at >= '2024-12-22';

-- 4. Bulk Update to Mahesh (Use this if the 50 "Onkar" videos are ALREADY attributed to him, or if you want to assign ALL leftovers to Mahesh)
UPDATE video_seo 
SET worked_by = 'Mahesh' 
WHERE is_seo_done = true 
AND worked_by IS NULL;

-- 5. Helper: If you need to forcefully set a specific video or range to Onkar
-- UPDATE video_seo SET worked_by = 'Onkar' WHERE video_id = 'specific_id';

-- 6. Final verification
SELECT worked_by, count(*) as final_count
FROM video_seo 
WHERE is_seo_done = true 
GROUP BY worked_by;
