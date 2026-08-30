-- ==============================================================================
-- Add evidence fingerprint to inspections table
-- ==============================================================================

ALTER TABLE public.inspections ADD COLUMN IF NOT EXISTS evidence_fingerprint TEXT;
