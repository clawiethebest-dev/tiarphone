-- Raw logs table - stores every user action
CREATE TABLE IF NOT EXISTS raw_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
  data JSONB,
  error_message TEXT,
  error_stack TEXT,
  ip TEXT,
  analyzed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_raw_logs_session ON raw_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_raw_logs_timestamp ON raw_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_raw_logs_action ON raw_logs(action);
CREATE INDEX IF NOT EXISTS idx_raw_logs_analyzed ON raw_logs(analyzed_at);

-- Analyzed sessions table - AI-processed session summaries
CREATE TABLE IF NOT EXISTS analyzed_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT UNIQUE NOT NULL,
  first_seen TIMESTAMPTZ NOT NULL,
  last_seen TIMESTAMPTZ NOT NULL,
  pages_viewed TEXT[],
  products_viewed TEXT[],
  added_to_cart TEXT[],
  checkout_started BOOLEAN DEFAULT FALSE,
  phone_entered BOOLEAN DEFAULT FALSE,
  order_attempted BOOLEAN DEFAULT FALSE,
  order_completed BOOLEAN DEFAULT FALSE,
  order_error TEXT,
  total_clicks INTEGER DEFAULT 0,
  max_scroll_depth INTEGER DEFAULT 0,
  errors TEXT[],
  device_type TEXT,
  ip TEXT,
  journey_summary TEXT,
  lost_order BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_analyzed_sessions_first_seen ON analyzed_sessions(first_seen);
CREATE INDEX IF NOT EXISTS idx_analyzed_sessions_lost_order ON analyzed_sessions(lost_order);
CREATE INDEX IF NOT EXISTS idx_analyzed_sessions_order_completed ON analyzed_sessions(order_completed);

-- Add order_number column to orders if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'orders' AND column_name = 'order_number') THEN
    ALTER TABLE orders ADD COLUMN order_number TEXT;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE raw_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyzed_sessions ENABLE ROW LEVEL SECURITY;

-- Allow inserts from anon (for client-side logging)
CREATE POLICY "Allow anonymous inserts" ON raw_logs
  FOR INSERT WITH CHECK (true);

-- Allow reads for authenticated/service role
CREATE POLICY "Allow service role full access" ON raw_logs
  FOR ALL USING (true);

CREATE POLICY "Allow service role full access" ON analyzed_sessions
  FOR ALL USING (true);
