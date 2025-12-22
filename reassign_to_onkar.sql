-- Reassign the latest videos from Mahesh to Onkar
-- User indicates they did ~53 videos recently, but some might be attributed to Mahesh.

-- 1. Check the 30 latest videos assigned to Mahesh (these are likely Onkar's)
SELECT id, old_title, worked_by, updated_at 
FROM video_seo 
WHERE worked_by = 'Mahesh' 
ORDER BY updated_at DESC 
LIMIT 30;

-- 2. If the timestamps looks like YOUR work time (e.g. today/recent), run this to move them:
-- (Adjust the LIMIT to match exactly how many are missing, e.g. 53 - 30 = 23)

WITH recent_mahesh_videos AS (
    SELECT id 
    FROM video_seo 
    WHERE worked_by = 'Mahesh'
    ORDER BY updated_at DESC
    LIMIT 23
)
UPDATE video_seo
SET worked_by = 'Onkar'
WHERE id IN (SELECT id FROM recent_mahesh_videos);

-- 3. Verify the new counts
SELECT worked_by, count(*) 
FROM video_seo 
WHERE is_seo_done = true 
GROUP BY worked_by;
