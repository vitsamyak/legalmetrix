-- ==============================================================================
-- LegalMetrix AI: Phase 1 - Fix Evidence Storage RLS Policies
-- ==============================================================================

-- 1. Ensure the Private Storage Bucket for Evidence Images exists (idempotent)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('evidence_images', 'evidence_images', false) 
ON CONFLICT (id) DO NOTHING;

-- 2. Drop the old policies if they exist to ensure idempotency
DROP POLICY IF EXISTS "Authenticated users can upload evidence" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own evidence" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload evidence for their inspections" ON storage.objects;
DROP POLICY IF EXISTS "Users can read evidence for their inspections" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete evidence for their inspections" ON storage.objects;

-- 3. Create robust SELECT policy
-- Users can only read objects in 'evidence_images' if the object path's first segment 
-- matches an inspection_id that they own.
CREATE POLICY "Users can read evidence for their inspections"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'evidence_images' AND
  EXISTS (
    SELECT 1 FROM public.inspections i
    WHERE i.id::text = (string_to_array(name, '/'))[1]
    AND i.inspector_id = auth.uid()
  )
);

-- 4. Create robust INSERT policy
-- Users can only upload objects into 'evidence_images' if the object path's first segment
-- matches an inspection_id that they own.
-- Note: Supabase Storage requires SELECT access to INSERT objects (it returns the object metadata).
CREATE POLICY "Users can upload evidence for their inspections"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'evidence_images' AND
  EXISTS (
    SELECT 1 FROM public.inspections i
    WHERE i.id::text = (string_to_array(name, '/'))[1]
    AND i.inspector_id = auth.uid()
  )
);

-- 5. Create robust DELETE policy
-- Users can only delete objects if they own the related inspection.
CREATE POLICY "Users can delete evidence for their inspections"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'evidence_images' AND
  EXISTS (
    SELECT 1 FROM public.inspections i
    WHERE i.id::text = (string_to_array(name, '/'))[1]
    AND i.inspector_id = auth.uid()
  )
);
