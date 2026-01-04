-- =====================================================
-- Fix FAQ Row-Level Security Policies
-- This allows the backend to insert/read FAQs
-- Run this in Supabase SQL Editor
-- =====================================================

-- Enable RLS on faq_entries (if not already enabled)
ALTER TABLE faq_entries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow backend to insert FAQs" ON faq_entries;
DROP POLICY IF EXISTS "Allow backend to read FAQs" ON faq_entries;
DROP POLICY IF EXISTS "Allow backend to update FAQs" ON faq_entries;
DROP POLICY IF EXISTS "Allow backend to delete FAQs" ON faq_entries;

-- Allow INSERT from backend (needed for onboarding)
CREATE POLICY "Allow backend to insert FAQs" ON faq_entries
  FOR INSERT
  WITH CHECK (true);

-- Allow SELECT from backend (needed for chatbot to match FAQs)
CREATE POLICY "Allow backend to read FAQs" ON faq_entries
  FOR SELECT
  USING (true);

-- Allow UPDATE from backend (needed for updating FAQs)
CREATE POLICY "Allow backend to update FAQs" ON faq_entries
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Allow DELETE from backend (needed for managing FAQs)
CREATE POLICY "Allow backend to delete FAQs" ON faq_entries
  FOR DELETE
  USING (true);

-- Verify policies were created
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'faq_entries'
ORDER BY policyname;

-- Expected result: 4 policies
-- 1. Allow backend to delete FAQs | PERMISSIVE | {public} | DELETE
-- 2. Allow backend to insert FAQs | PERMISSIVE | {public} | INSERT
-- 3. Allow backend to read FAQs   | PERMISSIVE | {public} | SELECT
-- 4. Allow backend to update FAQs | PERMISSIVE | {public} | UPDATE
