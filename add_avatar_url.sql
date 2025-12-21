-- Run this in your Supabase SQL Editor

ALTER TABLE team_members 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Optional: Create storage bucket if not strictly using public/ folder (but we are using /public/avatars so just URL string is fine)
