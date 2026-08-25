-- Fix orders table - add missing columns
-- Run this in Supabase SQL Editor

-- Add missing columns if they don't exist
ALTER TABLE orders ADD COLUMN IF NOT EXISTS phone2 TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS wilaya_id INTEGER DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS commune_id INTEGER DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_fee NUMERIC DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS subtotal NUMERIC DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS products_text TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking TEXT;

-- Update status column to allow 'pending' value
-- (status should be: pending, new, confirmed, shipped, delivered, cancelled)
