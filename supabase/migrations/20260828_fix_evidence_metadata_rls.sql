-- ==============================================================================
-- LegalMetrix AI: Fix inspection_evidence RLS
-- ==============================================================================

-- 1. Drop existing policies to ensure idempotency
DROP POLICY IF EXISTS "Users can view evidence for their inspections" ON public.inspection_evidence;
DROP POLICY IF EXISTS "Users can insert evidence for their inspections" ON public.inspection_evidence;
DROP POLICY IF EXISTS "Users can update evidence for their inspections" ON public.inspection_evidence;
DROP POLICY IF EXISTS "Users can delete evidence for their inspections" ON public.inspection_evidence;

-- 2. Create robust SELECT policy
CREATE POLICY "Users can view evidence for their inspections"
ON public.inspection_evidence FOR SELECT TO authenticated
USING (
  inspection_id IN (
    SELECT id FROM public.inspections WHERE inspector_id = auth.uid()
  )
);

-- 3. Create robust INSERT policy
CREATE POLICY "Users can insert evidence for their inspections"
ON public.inspection_evidence FOR INSERT TO authenticated
WITH CHECK (
  inspection_id IN (
    SELECT id FROM public.inspections WHERE inspector_id = auth.uid()
  )
);

-- 4. Create robust UPDATE policy
CREATE POLICY "Users can update evidence for their inspections"
ON public.inspection_evidence FOR UPDATE TO authenticated
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

-- 5. Create robust DELETE policy
CREATE POLICY "Users can delete evidence for their inspections"
ON public.inspection_evidence FOR DELETE TO authenticated
USING (
  inspection_id IN (
    SELECT id FROM public.inspections WHERE inspector_id = auth.uid()
  )
);
