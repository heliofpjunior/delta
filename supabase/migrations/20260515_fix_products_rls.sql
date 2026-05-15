-- Migration: Fix Products RLS Policies
-- Date: 2026-05-15

-- 1. Enable RLS on products table if not already enabled
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies if any (to avoid duplicates)
DROP POLICY IF EXISTS "Enable read access for everyone" ON public.products;
DROP POLICY IF EXISTS "Enable all access for admins" ON public.products;

-- 3. Create policies
-- Anyone (including non-authenticated users if needed for the store) can view products
CREATE POLICY "Enable read access for everyone" ON public.products
  FOR SELECT USING (true);

-- Only admins can insert, update or delete products
CREATE POLICY "Enable all access for admins" ON public.products
  FOR ALL USING (is_admin());
