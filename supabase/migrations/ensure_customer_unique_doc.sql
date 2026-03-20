-- Migration: Add unique constraint to doc column in customers table

-- 1. Clean up existing duplicates based on doc (keeping the one with highest total_spent or most recent id/created_at)
DELETE FROM public.customers
WHERE id IN (
    SELECT id
    FROM (
        SELECT id,
               ROW_NUMBER() OVER (PARTITION BY doc ORDER BY total_spent DESC, created_at DESC) as rn
        FROM public.customers
        WHERE doc IS NOT NULL AND doc != ''
    ) t
    WHERE t.rn > 1
);

-- 2. Add the unique constraint to allow upsert by doc
ALTER TABLE public.customers ADD CONSTRAINT customers_doc_unique UNIQUE (doc);
