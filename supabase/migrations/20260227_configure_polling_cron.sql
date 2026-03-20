-- Migration: Configure CerControl Polling Cron
-- Date: 2026-02-27
-- Description: Sets up scheduled polling for CerControl API using pg_cron and pg_net.

-- 1. Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Hot Polling: Every 10 minutes
-- Scans recent orders (first 2 pages)
SELECT cron.schedule(
  'certcontrol-hot-polling',
  '*/10 * * * *',
  $$
  SELECT net.http_get(
    url := 'https://minhaip.supabase.co/functions/v1/certcontrol-sync?mode=hot',
    headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || COALESCE(current_setting('vault.service_role_key', true), 'TOKEN_NOT_FOUND')
    )
  );
  $$
);

-- 3. Full Polling: Daily at 03:00 AM
-- Scans all orders
SELECT cron.schedule(
  'certcontrol-full-polling',
  '0 3 * * *',
  $$
  SELECT net.http_get(
    url := 'https://minhaip.supabase.co/functions/v1/certcontrol-sync?mode=full',
    headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || COALESCE(current_setting('vault.service_role_key', true), 'TOKEN_NOT_FOUND')
    )
  );
  $$
);

-- Note: In production, the Project URL and Service Role Key should be properly configured.
-- If 'vault.service_role_key' is not available in your environment, you may need to hardcode 
-- or use a different method to pass the secret.
