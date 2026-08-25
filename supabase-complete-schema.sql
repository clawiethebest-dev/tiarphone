-- ==============================================================================
-- TIAR BOUTIQUE - COMPLETE SUPABASE DATABASE SCHEMA & SETUP
-- Run this script in the Supabase SQL Editor (https://supabase.com/dashboard)
-- ==============================================================================

-- 1. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  order_number TEXT,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  phone2 TEXT,
  wilaya TEXT,
  wilaya_id INTEGER,
  commune TEXT,
  commune_id INTEGER,
  address TEXT,
  notes TEXT,
  products JSONB,
  products_text TEXT,
  subtotal DECIMAL(10, 2),
  delivery_fee DECIMAL(10, 2),
  delivery_type TEXT DEFAULT 'home',
  total DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'new', -- 'new', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'
  tracking TEXT,
  traffic_source TEXT,
  landing_page TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all columns exist on existing orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS phone2 TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS wilaya_id INTEGER;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS commune_id INTEGER;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS products JSONB;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS products_text TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10, 2);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_fee DECIMAL(10, 2);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_type TEXT DEFAULT 'home';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS traffic_source TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS landing_page TEXT;

-- 2. RAW EVENT LOGS (FULL VISITOR SPY TRACKING)
CREATE TABLE IF NOT EXISTS raw_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  server_timestamp TIMESTAMPTZ DEFAULT NOW(),
  page TEXT,
  referrer TEXT,
  user_agent TEXT,
  screen_size TEXT,
  action TEXT NOT NULL,
  element TEXT,
  element_text TEXT,
  element_id TEXT,
  element_class TEXT,
  data JSONB DEFAULT '{}'::jsonb,
  error_message TEXT,
  error_stack TEXT,
  ip TEXT,
  analyzed_at TIMESTAMPTZ
);

-- 3. ANALYZED SESSIONS (VISITOR JOURNEY & ABANDONED RECOVERY CRM)
CREATE TABLE IF NOT EXISTS analyzed_sessions (
  session_id TEXT PRIMARY KEY,
  first_seen TIMESTAMPTZ,
  last_seen TIMESTAMPTZ,
  pages_viewed TEXT[] DEFAULT '{}',
  products_viewed TEXT[] DEFAULT '{}',
  added_to_cart TEXT[] DEFAULT '{}',
  checkout_started BOOLEAN DEFAULT FALSE,
  phone_entered BOOLEAN DEFAULT FALSE,
  order_attempted BOOLEAN DEFAULT FALSE,
  order_completed BOOLEAN DEFAULT FALSE,
  order_error TEXT,
  total_clicks INTEGER DEFAULT 0,
  max_scroll_depth INTEGER DEFAULT 0,
  errors TEXT[] DEFAULT '{}',
  device_type TEXT DEFAULT 'mobile',
  ip TEXT,
  journey_summary TEXT,
  lost_order BOOLEAN DEFAULT FALSE,
  customer_name TEXT,
  customer_phone TEXT,
  customer_phone2 TEXT,
  customer_wilaya TEXT,
  customer_commune TEXT,
  customer_address TEXT,
  product_name TEXT,
  product_quantity INTEGER DEFAULT 1,
  order_total DECIMAL(10, 2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all customer recovery columns exist
ALTER TABLE analyzed_sessions ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE analyzed_sessions ADD COLUMN IF NOT EXISTS customer_phone TEXT;
ALTER TABLE analyzed_sessions ADD COLUMN IF NOT EXISTS customer_phone2 TEXT;
ALTER TABLE analyzed_sessions ADD COLUMN IF NOT EXISTS customer_wilaya TEXT;
ALTER TABLE analyzed_sessions ADD COLUMN IF NOT EXISTS customer_commune TEXT;
ALTER TABLE analyzed_sessions ADD COLUMN IF NOT EXISTS customer_address TEXT;
ALTER TABLE analyzed_sessions ADD COLUMN IF NOT EXISTS product_name TEXT;
ALTER TABLE analyzed_sessions ADD COLUMN IF NOT EXISTS product_quantity INTEGER DEFAULT 1;
ALTER TABLE analyzed_sessions ADD COLUMN IF NOT EXISTS order_total DECIMAL(10, 2);

-- 4. ABANDONED CHECKOUTS
CREATE TABLE IF NOT EXISTS abandoned_checkouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(20) NOT NULL,
  name VARCHAR(255),
  product_id VARCHAR(100),
  product_name VARCHAR(255),
  product_price DECIMAL(10, 2),
  wilaya_name VARCHAR(100),
  lang VARCHAR(10) DEFAULT 'ar',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed BOOLEAN DEFAULT FALSE,
  reminder_sent BOOLEAN DEFAULT FALSE,
  reminder_sent_at TIMESTAMPTZ,
  CONSTRAINT idx_phone_completed UNIQUE (phone, completed)
);

-- 5. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  long_description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  category TEXT DEFAULT 'packets',
  images JSONB DEFAULT '[]'::jsonb,
  specifications JSONB DEFAULT '{}'::jsonb,
  in_stock BOOLEAN DEFAULT TRUE,
  stock INTEGER DEFAULT 50,
  featured BOOLEAN DEFAULT FALSE,
  deal BOOLEAN DEFAULT FALSE,
  rating DECIMAL(2, 1) DEFAULT 5.0,
  reviews_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES FOR MAXIMUM SPEED & HIGH TRAFFIC (UP TO MILLIONS OF ROWS)
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_raw_logs_session_id ON raw_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_raw_logs_timestamp ON raw_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_raw_logs_action ON raw_logs(action);
CREATE INDEX IF NOT EXISTS idx_analyzed_sessions_last_seen ON analyzed_sessions(last_seen DESC);
CREATE INDEX IF NOT EXISTS idx_analyzed_sessions_lost_order ON analyzed_sessions(lost_order);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE raw_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyzed_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE abandoned_checkouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Allow all operations (public reads & authenticated/service key access)
CREATE POLICY "Allow all on orders" ON orders FOR ALL USING (true);
CREATE POLICY "Allow all on raw_logs" ON raw_logs FOR ALL USING (true);
CREATE POLICY "Allow all on analyzed_sessions" ON analyzed_sessions FOR ALL USING (true);
CREATE POLICY "Allow all on abandoned_checkouts" ON abandoned_checkouts FOR ALL USING (true);
CREATE POLICY "Allow all on products" ON products FOR ALL USING (true);
