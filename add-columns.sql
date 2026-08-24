-- Add customer data columns to analyzed_sessions
ALTER TABLE analyzed_sessions ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE analyzed_sessions ADD COLUMN IF NOT EXISTS customer_phone TEXT;
ALTER TABLE analyzed_sessions ADD COLUMN IF NOT EXISTS customer_phone2 TEXT;
ALTER TABLE analyzed_sessions ADD COLUMN IF NOT EXISTS customer_wilaya TEXT;
ALTER TABLE analyzed_sessions ADD COLUMN IF NOT EXISTS customer_commune TEXT;
ALTER TABLE analyzed_sessions ADD COLUMN IF NOT EXISTS customer_address TEXT;
ALTER TABLE analyzed_sessions ADD COLUMN IF NOT EXISTS product_name TEXT;
ALTER TABLE analyzed_sessions ADD COLUMN IF NOT EXISTS product_quantity INTEGER;
ALTER TABLE analyzed_sessions ADD COLUMN IF NOT EXISTS order_total DECIMAL;
