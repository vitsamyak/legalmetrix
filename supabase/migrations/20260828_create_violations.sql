-- ==============================================================================
-- LegalMetrix AI: Phase 2 - Create Violations Table & Edge Function RLS
-- ==============================================================================

-- 1. Create the violations table
CREATE TABLE IF NOT EXISTS public.violations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inspection_id UUID NOT NULL REFERENCES public.inspections(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    ai_analysis TEXT,
    severity TEXT NOT NULL CHECK (severity IN ('Low', 'Medium', 'High')),
    confidence INTEGER,
    evidence_type TEXT,
    verification_status TEXT DEFAULT 'Pending Review',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE public.violations ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Users can view violations for their inspections
DROP POLICY IF EXISTS "Users can view violations for their inspections" ON public.violations;
CREATE POLICY "Users can view violations for their inspections"
  ON public.violations FOR SELECT TO authenticated
  USING (
    inspection_id IN (
      SELECT id FROM public.inspections WHERE inspector_id = auth.uid()
    )
  );

-- 4. Policy: Users can update violations for their inspections (e.g. verification_status)
DROP POLICY IF EXISTS "Users can update violations for their inspections" ON public.violations;
CREATE POLICY "Users can update violations for their inspections"
  ON public.violations FOR UPDATE TO authenticated
  USING (
    inspection_id IN (
      SELECT id FROM public.inspections WHERE inspector_id = auth.uid()
    )
  )
  WITH CHECK (
    inspection_id IN (
      SELECT id FROM public.inspections WHERE inspector_id = auth.uid()
    )
  );

-- Note: We intentionally do NOT create an INSERT policy for authenticated users.
-- The Edge Function will insert violations using the `service_role` key to securely bypass RLS,
-- ensuring that only the AI backend can generate violations, preventing client-side forgery.

-- 5. Index for performance
CREATE INDEX IF NOT EXISTS idx_violations_inspection_id ON public.violations(inspection_id);
