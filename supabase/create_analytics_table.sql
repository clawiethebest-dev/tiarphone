-- Analytics Events Table for Tiar Boutique
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/wlyizmzzapmtwdrvmsff/sql

CREATE TABLE IF NOT EXISTS analytics_events (
  id BIGSERIAL PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL,
  visitor_id VARCHAR(100),
  session_id VARCHAR(100),
  page TEXT,
  url TEXT,
  referrer TEXT,
  product_id VARCHAR(50),
  product_name TEXT,
  product_price DECIMAL(10,2),
  quantity INTEGER,
  cart_total DECIMAL(10,2),
  search_query TEXT,
  button_id VARCHAR(100),
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(200),
  utm_term VARCHAR(200),
  utm_content VARCHAR(200),
  fbclid TEXT,
  gclid TEXT,
  ttclid TEXT,
  device VARCHAR(20),
  language VARCHAR(10),
  screen_width INTEGER,
  screen_height INTEGER,
  ip_address VARCHAR(45),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_visitor_id ON analytics_events(visitor_id);
CREATE INDEX IF NOT EXISTS idx_analytics_product_id ON analytics_events(product_id);
CREATE INDEX IF NOT EXISTS idx_analytics_utm_source ON analytics_events(utm_source);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Allow insert from anon (for tracking)
CREATE POLICY "Allow anonymous insert" ON analytics_events
  FOR INSERT TO anon
  WITH CHECK (true);

-- Allow select for authenticated (admin dashboard)
CREATE POLICY "Allow authenticated select" ON analytics_events
  FOR SELECT TO authenticated
  USING (true);

-- Allow service role full access
CREATE POLICY "Service role full access" ON analytics_events
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);
