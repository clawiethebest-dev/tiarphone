-- جدول لحفظ العملاء اللي ما كملوا الشراء
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS abandoned_checkouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone VARCHAR(20) NOT NULL,
  name VARCHAR(255),
  product_id VARCHAR(100),
  product_name VARCHAR(255),
  product_price DECIMAL(10,2),
  wilaya_name VARCHAR(100),
  lang VARCHAR(10) DEFAULT 'ar',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed BOOLEAN DEFAULT FALSE,
  reminder_sent BOOLEAN DEFAULT FALSE,
  reminder_sent_at TIMESTAMP WITH TIME ZONE,
  
  -- Index for faster queries
  CONSTRAINT idx_phone_completed UNIQUE (phone, completed)
);

-- Index for cron job queries
CREATE INDEX IF NOT EXISTS idx_abandoned_pending 
ON abandoned_checkouts (completed, reminder_sent, created_at)
WHERE completed = FALSE AND reminder_sent = FALSE;

-- Enable Row Level Security
ALTER TABLE abandoned_checkouts ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users (or anon for now)
CREATE POLICY "Allow all" ON abandoned_checkouts
FOR ALL USING (true);
