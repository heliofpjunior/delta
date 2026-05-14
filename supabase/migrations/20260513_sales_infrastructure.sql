-- Sales Infrastructure Migration
-- Adds support for Campaigns, Coupons, and Sales Links

-- 1. Profiles Update
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_public_store_active BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS store_slug TEXT UNIQUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS store_branding JSONB DEFAULT '{ "logo": null, "primary_color": "#3B82F6", "bio": "" }'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS custom_prices JSONB DEFAULT '{}'::jsonb; -- In case it's not in schema.sql but used in code

-- 2. Campaigns
CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vendedor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Coupons
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vendedor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
    code TEXT UNIQUE NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL,
    discount_type TEXT DEFAULT 'fixed' CHECK (discount_type IN ('fixed', 'percent')),
    min_purchase DECIMAL(10,2) DEFAULT 0,
    max_discount DECIMAL(10,2),
    usage_limit INTEGER,
    usage_count INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Sales Links (Custom URLs for specific products/prices)
CREATE TABLE IF NOT EXISTS public.sales_links (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vendedor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
    product_id INTEGER REFERENCES public.products(id) ON DELETE CASCADE,
    custom_price DECIMAL(10,2) NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    clicks INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_links ENABLE ROW LEVEL SECURITY;

-- Explicit grants for anonymous public sales pages.
GRANT SELECT ON public.profiles TO anon, authenticated;
GRANT SELECT ON public.products TO anon, authenticated;
GRANT SELECT ON public.coupons TO anon, authenticated;
GRANT SELECT ON public.sales_links TO anon, authenticated;

-- Public storefronts need to read the vendor profile by store_slug.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'profiles'
          AND policyname = 'Public can view active storefront profiles.'
    ) THEN
        CREATE POLICY "Public can view active storefront profiles." ON public.profiles
            FOR SELECT USING (is_public_store_active = true);
    END IF;
END $$;

-- Policies for Campaigns
CREATE POLICY "Users can manage their own campaigns." ON public.campaigns
    FOR ALL USING (auth.uid() = vendedor_id);

-- Policies for Coupons
CREATE POLICY "Users can manage their own coupons." ON public.coupons
    FOR ALL USING (auth.uid() = vendedor_id);

CREATE POLICY "Public can view active coupons." ON public.coupons
    FOR SELECT USING (active = true);

-- Policies for Sales Links
CREATE POLICY "Users can manage their own sales links." ON public.sales_links
    FOR ALL USING (auth.uid() = vendedor_id);

CREATE POLICY "Public can view active sales links." ON public.sales_links
    FOR SELECT USING (active = true);

-- 5. RPC Functions
CREATE OR REPLACE FUNCTION public.increment_link_clicks(link_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.sales_links
    SET clicks = clicks + 1
    WHERE id = link_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.increment_link_clicks(UUID) TO anon, authenticated;

-- 6. Views for Analytics (Optional but helpful)
CREATE OR REPLACE VIEW public.vendor_sales_stats AS
SELECT 
    vendedor_id,
    COUNT(id) as total_links,
    SUM(clicks) as total_clicks
FROM public.sales_links
GROUP BY vendedor_id;
