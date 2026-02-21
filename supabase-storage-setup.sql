-- ============================================================
-- Supabase Storage Setup for Portfolio
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Create the storage bucket (if not already created)
-- Note: The bucket may already exist from profile photo uploads.
-- If you get "already exists" error, skip this step.
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio', 'portfolio', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Allow public READ access to all files in the portfolio bucket
CREATE POLICY "Public read access on portfolio bucket"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'portfolio');

-- 3. Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload to portfolio bucket"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'portfolio');

-- 4. Allow authenticated users to update/replace files
CREATE POLICY "Authenticated users can update portfolio files"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'portfolio');

-- 5. Allow authenticated users to delete files
CREATE POLICY "Authenticated users can delete portfolio files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'portfolio');

-- ============================================================
-- Enable Realtime for profiles table (needed for useProfile hook)
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;

-- Verify
SELECT * FROM storage.buckets WHERE id = 'portfolio';
