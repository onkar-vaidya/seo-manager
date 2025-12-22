-- Final Verification of Counts
-- 1. Get the total number of videos marked as done
SELECT count(*) as total_seo_done FROM video_seo WHERE is_seo_done = true;

-- 2. Get the breakdown again to ensure it sums up to the total
SELECT worked_by, count(*) 
FROM video_seo 
WHERE is_seo_done = true 
GROUP BY worked_by;

-- 3. Check if there are any still NULL (should be 0)
SELECT count(*) as still_null_worker
FROM video_seo 
WHERE is_seo_done = true 
AND worked_by IS NULL;
