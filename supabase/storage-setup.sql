-- TransSupply Storage Setup
-- Run this in Supabase SQL Editor AFTER creating the bucket via Dashboard

-- Step 1: Create the bucket via Supabase Dashboard
-- Go to: Storage -> New Bucket -> Name: "order-photos" -> Public: ON

-- Step 2: Run these policies in SQL Editor

-- Since this app uses mock authentication (not Supabase Auth),
-- we allow all operations via anon key for the order-photos bucket

-- Allow anyone to upload files (anon key)
CREATE POLICY "Allow public uploads" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'order-photos');

-- Allow anyone to update files
CREATE POLICY "Allow public updates" ON storage.objects
  FOR UPDATE TO anon, authenticated
  USING (bucket_id = 'order-photos');

-- Allow anyone to delete files
CREATE POLICY "Allow public deletes" ON storage.objects
  FOR DELETE TO anon, authenticated
  USING (bucket_id = 'order-photos');

-- Allow public read access (for displaying photos)
CREATE POLICY "Allow public read access" ON storage.objects
  FOR SELECT TO anon, authenticated, public
  USING (bucket_id = 'order-photos');

-- NOTE: If you get "policy already exists" errors, first drop existing policies:
-- DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
-- DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
-- DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;
-- DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
