-- ==============================================================================
-- Add OCR columns to inspection_evidence
-- ==============================================================================

ALTER TABLE public.inspection_evidence 
ADD COLUMN IF NOT EXISTS extracted_text TEXT,
ADD COLUMN IF NOT EXISTS ocr_status TEXT DEFAULT 'pending';
