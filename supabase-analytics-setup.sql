-- =============================================
-- Tiar Phone Analytics - Supabase Setup
-- =============================================
-- Run this SQL in your Supabase SQL Editor
-- Go to: https://supabase.com/dashboard → Your Project → SQL Editor
-- =============================================

-- Create analytics_events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL,
  visitor_id VARCHAR(100),
  session_id VARCHAR(100),
  page TEXT,
  url TEXT,
  referrer TEXT,

  -- Product data
  product_id VARCHAR(100),
  product_name TEXT,
  product_price DECIMAL(10,2),
  quantity INTEGER,
  cart_total DECIMAL(10,2),

  -- Search
  search_query TEXT,
  button_id VARCHAR(100),

  -- UTM Parameters (for tracking ad campaigns)
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(200),
  utm_term VARCHAR(200),
  utm_content VARCHAR(200),

  -- Ad Click IDs
  fbclid VARCHAR(200),  -- Facebook
  gclid VARCHAR(200),   -- Google
  ttclid VARCHAR(200),  -- TikTok

  -- Device info
  device VARCHAR(20),
  language VARCHAR(10),
  screen_width INTEGER,
  screen_height INTEGER,
  ip_address VARCHAR(50),

  -- Metadata (JSON)
  metadata JSONB,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_visitor_id ON analytics_events(visitor_id);
CREATE INDEX IF NOT EXISTS idx_analytics_session_id ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_utm_source ON analytics_events(utm_source);
CREATE INDEX IF NOT EXISTS idx_analytics_product_id ON analytics_events(product_id);

-- Enable Row Level Security (RLS)
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Policy: Allow insert from anyone (for tracking)
CREATE POLICY "Allow anonymous inserts" ON analytics_events
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy: Allow select only with service key (for dashboard)
CREATE POLICY "Allow service key select" ON analytics_events
  FOR SELECT
  TO service_role
  USING (true);

-- Also allow anon to select (for dashboard to work with anon key)
CREATE POLICY "Allow anon select" ON analytics_events
  FOR SELECT
  TO anon
  USING (true);

-- =============================================
-- Verify Setup
-- =============================================
-- Run this to check if table was created:
-- SELECT * FROM analytics_events LIMIT 1;

-- =============================================
-- Sample UTM URLs for your ads:
-- =============================================
-- Facebook:
-- https://tiarphone.vercel.app/ar/products/pack-tech-ultimate?utm_source=facebook&utm_medium=paid&utm_campaign=pack_august

-- Instagram:
-- https://tiarphone.vercel.app/ar/products/pack-tech-ultimate?utm_source=instagram&utm_medium=paid&utm_campaign=pack_august

-- TikTok:
-- https://tiarphone.vercel.app/ar/products/pack-tech-ultimate?utm_source=tiktok&utm_medium=paid&utm_campaign=pack_august
