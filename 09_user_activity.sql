-- User Activity Monitoring Table
CREATE TABLE IF NOT EXISTS user_activity (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  -- User info
  user_name TEXT,
  user_age INT,
  user_gender TEXT,
  user_area TEXT,
  -- What they searched
  selected_symptoms TEXT[] NOT NULL DEFAULT '{}',
  custom_symptoms TEXT,
  -- Analysis results metadata
  matched_diseases TEXT[] DEFAULT '{}',
  top_match_score INT,
  rag_source TEXT,                -- 'database' or 'ai-knowledge'
  ai_provider TEXT,               -- 'gemini-2.5-flash' or 'gpt-4o-mini'
  -- Session info
  language TEXT DEFAULT 'en',
  ip_address TEXT,
  user_agent TEXT,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;

-- Only service role can insert (from edge function), no public read
CREATE POLICY "Service role insert" ON user_activity
  FOR INSERT WITH CHECK (true);

-- Create index for fast querying by date
CREATE INDEX idx_user_activity_created_at ON user_activity (created_at DESC);
CREATE INDEX idx_user_activity_area ON user_activity (user_area);
