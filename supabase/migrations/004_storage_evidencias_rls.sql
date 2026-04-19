-- =========================================================
-- 004: Storage RLS policies for 'evidencias' bucket
-- =========================================================

-- Allow authenticated users to upload evidence files
CREATE POLICY "Authenticated users can upload evidence"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'evidencias');

-- Allow authenticated users to read evidence files
CREATE POLICY "Authenticated users can read evidence"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'evidencias');

-- Allow authenticated users to delete their own evidence
CREATE POLICY "Authenticated users can delete evidence"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'evidencias');

-- Allow public read (bucket is public, needed for getPublicUrl)
CREATE POLICY "Public read access for evidencias"
ON storage.objects FOR SELECT
TO anon
USING (bucket_id = 'evidencias');
