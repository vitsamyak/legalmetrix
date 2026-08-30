-- ==============================================================================
-- LegalMetrix AI: Safely Update Products & Inspections Tables
-- ==============================================================================

-- 1. Ensure `products` table has the unique constraint for (name, brand)
-- We use an anonymous DO block to avoid errors if the constraint already exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'products_name_brand_unique'
    ) THEN
        ALTER TABLE public.products ADD CONSTRAINT products_name_brand_unique UNIQUE (name, brand);
    END IF;
END $$;

-- 2. Ensure `inspections` table has the new `human_id` column
-- ADD COLUMN IF NOT EXISTS is safe in Postgres 9.6+
ALTER TABLE public.inspections ADD COLUMN IF NOT EXISTS human_id TEXT;

-- 3. Update or recreate the trigger for `human_id` generation
CREATE OR REPLACE FUNCTION public.set_inspection_human_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.human_id IS NULL THEN
    NEW.human_id := 'INS-' || UPPER(SUBSTRING(NEW.id::text FROM 1 FOR 6));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_inspection_human_id ON public.inspections;
CREATE TRIGGER trigger_set_inspection_human_id
  BEFORE INSERT ON public.inspections
  FOR EACH ROW
  EXECUTE FUNCTION public.set_inspection_human_id();

-- 4. Safely manage RLS Policies for Products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view products" ON public.products;
CREATE POLICY "Authenticated users can view products"
  ON public.products FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can insert products" ON public.products;
CREATE POLICY "Authenticated users can insert products"
  ON public.products FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update products" ON public.products;
CREATE POLICY "Authenticated users can update products"
  ON public.products FOR UPDATE USING (auth.role() = 'authenticated');

-- 5. Safely manage RLS Policies for Inspections
ALTER TABLE public.inspections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own inspections" ON public.inspections;
CREATE POLICY "Users can view own inspections"
  ON public.inspections FOR SELECT USING (auth.uid() = inspector_id);

DROP POLICY IF EXISTS "Users can insert own inspections" ON public.inspections;
CREATE POLICY "Users can insert own inspections"
  ON public.inspections FOR INSERT WITH CHECK (auth.uid() = inspector_id);

DROP POLICY IF EXISTS "Users can update own inspections" ON public.inspections;
CREATE POLICY "Users can update own inspections"
  ON public.inspections FOR UPDATE USING (auth.uid() = inspector_id) WITH CHECK (auth.uid() = inspector_id);
