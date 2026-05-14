-- Migration: Coupon Rules Enhancement
-- Adds columns to support targeted coupons, expiration dates, and product restrictions

ALTER TABLE public.coupons 
    ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS applicable_products INTEGER[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS allowed_docs TEXT[] DEFAULT '{}';
