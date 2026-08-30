-- ==============================================================================
-- LegalMetrix AI: Phase 1 - Evidence Storage and Table Setup
-- ==============================================================================

-- 1. Create the Private Storage Bucket for Evidence Images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('evidence_images', 'evidence_images', false) 
ON CONFLICT (id) DO NOTHING;

-- 2. Set up RLS for Storage Objects (evidence_images)
-- Allow authenticated users to upload files to the bucket
CREATE POLICY "Authenticated users can upload evidence" 
  ON storage.objects FOR INSERT TO authenticated 
  WITH CHECK (bucket_id = 'evidence_images');

-- Allow users to view their own uploaded evidence files
CREATE POLICY "Users can view their own evidence" 
  ON storage.objects FOR SELECT TO authenticated 
  USING (bucket_id = 'evidence_images' AND auth.uid() = owner);

-- 3. Create the inspection_evidence table
CREATE TABLE IF NOT EXISTS public.inspection_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inspection_id UUID NOT NULL REFERENCES public.inspections(id) ON DELETE CASCADE,
    evidence_type TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_name TEXT,
    mime_type TEXT,
    file_size BIGINT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Enable RLS on inspection_evidence
ALTER TABLE public.inspection_evidence ENABLE ROW LEVEL SECURITY;

-- 5. Policies for inspection_evidence
-- Users can view evidence that belongs to inspections they own
CREATE POLICY "Users can view evidence for their inspections" 
  ON public.inspection_evidence FOR SELECT TO authenticated 
  USING (
    EXISTS (
        SELECT 1 FROM public.inspections i
        WHERE i.id = inspection_evidence.inspection_id
        AND i.inspector_id = auth.uid()
    )
);

-- Users can insert evidence for inspections they own
CREATE POLICY "Users can insert evidence for their inspections" 
  ON public.inspection_evidence FOR INSERT TO authenticated 
  WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.inspections i
        WHERE i.id = inspection_id
        AND i.inspector_id = auth.uid()
    )
);

-- Index for faster joins
CREATE INDEX IF NOT EXISTS idx_inspection_evidence_inspection_id 
  ON public.inspection_evidence(inspection_id);
