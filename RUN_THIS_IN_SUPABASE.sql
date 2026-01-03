-- =====================================================
-- TechMayne Chatbot - Database Migration
-- Run this in Supabase SQL Editor
-- =====================================================

-- Step 1: Add customization columns to clients table
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS services_offered text[] DEFAULT ARRAY['wedding', 'engagement', 'elopement'];

ALTER TABLE clients
ADD COLUMN IF NOT EXISTS gallery_timeline text DEFAULT '4-6 weeks';

-- Step 2: Update demo client with all services (for testing)
UPDATE clients
SET services_offered = ARRAY['wedding', 'engagement', 'elopement', 'portrait', 'corporate', 'family', 'maternity', 'other'],
    gallery_timeline = '4-6 weeks'
WHERE client_token = 'c8082d26-223f-4eee-af1b-001c197fa3d8';

-- Step 3: Verify the changes
SELECT
  business_name,
  services_offered,
  gallery_timeline,
  starting_price
FROM clients
WHERE client_token = 'c8082d26-223f-4eee-af1b-001c197fa3d8';

-- =====================================================
-- Expected Result:
-- business_name    | services_offered                | gallery_timeline | starting_price
-- "Your Business"  | {wedding,engagement,portrait...} | 4-6 weeks       | $2,500
-- =====================================================

-- DONE! Now deploy your backend changes and test the chatbot.
