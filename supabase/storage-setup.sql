-- TransSupply Storage Setup
-- Run this in Supabase SQL Editor AFTER creating the bucket via Dashboard

-- Step 1: Create the bucket via Supabase Dashboard
-- Go to: Storage -> New Bucket -> Name: "order-photos" -> Public: ON

-- Step 2: Run these policies in SQL Editor

-- Allow authenticated users to upload files
CREATE POLICY "Allow authenticated uploads" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'order-photos');

-- Allow authenticated users to update their uploads
CREATE POLICY "Allow authenticated updates" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'order-photos');

-- Allow authenticated users to delete files
CREATE POLICY "Allow authenticated deletes" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'order-photos');

-- Allow public read access (for displaying photos)
CREATE POLICY "Allow public read access" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'order-photos');

-- Alternative: If you want to create the bucket programmatically
-- (Note: This requires the service_role key, not anon key)
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('order-photos', 'order-photos', true)
-- ON CONFLICT (id) DO NOTHING;
