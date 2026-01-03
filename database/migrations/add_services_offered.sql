-- Add services_offered column to clients table
-- This allows each photographer to select which services they offer

ALTER TABLE clients
ADD COLUMN IF NOT EXISTS services_offered text[] DEFAULT ARRAY['wedding', 'engagement', 'elopement'];

-- Add gallery_timeline column if not exists (for FAQ customization)
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS gallery_timeline text DEFAULT '4-6 weeks';

-- Comment
COMMENT ON COLUMN clients.services_offered IS 'Array of service types this photographer offers (wedding, engagement, portrait, corporate, family, maternity, elopement, other)';
COMMENT ON COLUMN clients.gallery_timeline IS 'Client-specific gallery delivery timeline for FAQ answers';

-- Example: Update demo client with all services
UPDATE clients
SET services_offered = ARRAY['wedding', 'engagement', 'elopement', 'portrait', 'corporate', 'family', 'maternity', 'other']
WHERE client_token = 'c8082d26-223f-4eee-af1b-001c197fa3d8';
