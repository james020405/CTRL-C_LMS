-- =============================================
-- ACTIVITIES STORAGE BUCKET
-- Run this in Supabase SQL Editor
-- =============================================

-- Create activities bucket for file attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('activities', 'activities', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing policies for activities bucket
DROP POLICY IF EXISTS "Authenticated users can upload activity files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update activity files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete activity files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view activity files" ON storage.objects;

-- Allow authenticated users to upload files to activities bucket
CREATE POLICY "Authenticated users can upload activity files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'activities');

-- Allow authenticated users to update their files
CREATE POLICY "Authenticated users can update activity files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'activities');

-- Allow authenticated users to delete files
CREATE POLICY "Authenticated users can delete activity files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'activities');

-- Allow anyone to view/download files (public bucket)
CREATE POLICY "Anyone can view activity files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'activities');

-- Also add the attachment_url column if it doesn't exist
ALTER TABLE activities ADD COLUMN IF NOT EXISTS attachment_url TEXT;

-- Verify
SELECT * FROM storage.buckets WHERE id = 'activities';
