-- =====================================================
-- JOURNEY DATA TABLES SETUP FOR SUPABASE
-- =====================================================
-- Copy and paste this entire file into Supabase Dashboard → SQL Editor → New Query
-- Then click "Run" to create all tables at once

-- =====================================================
-- 1. JOURNEY ENTRIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.journey_entries (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  mood_level INTEGER NOT NULL CHECK (mood_level >= 1 AND mood_level <= 5),
  pain_level INTEGER NOT NULL CHECK (pain_level >= 0 AND pain_level <= 10),
  energy_level INTEGER NOT NULL CHECK (energy_level >= 1 AND energy_level <= 10),
  sleep_quality INTEGER NOT NULL CHECK (sleep_quality >= 1 AND sleep_quality <= 5),
  symptoms TEXT[] DEFAULT '{}',
  notes TEXT,
  appointment_notes TEXT,
  has_appointment BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_journey_entries_user_id ON public.journey_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journey_entries_date ON public.journey_entries(date DESC);
CREATE INDEX IF NOT EXISTS idx_journey_entries_user_date ON public.journey_entries(user_id, date DESC);

-- =====================================================
-- 2. JOURNEY TREATMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.journey_treatments (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  total_sessions INTEGER DEFAULT 0,
  completed_sessions INTEGER DEFAULT 0,
  side_effects TEXT[] DEFAULT '{}',
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_journey_treatments_user_id ON public.journey_treatments(user_id);
CREATE INDEX IF NOT EXISTS idx_journey_treatments_is_active ON public.journey_treatments(is_active);
CREATE INDEX IF NOT EXISTS idx_journey_treatments_user_active ON public.journey_treatments(user_id, is_active);

-- =====================================================
-- 3. JOURNEY MILESTONES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.journey_milestones (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL,
  date_achieved TIMESTAMP WITH TIME ZONE NOT NULL,
  days_count INTEGER,
  is_celebrated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_journey_milestones_user_id ON public.journey_milestones(user_id);
CREATE INDEX IF NOT EXISTS idx_journey_milestones_date ON public.journey_milestones(date_achieved DESC);
CREATE INDEX IF NOT EXISTS idx_journey_milestones_user_date ON public.journey_milestones(user_id, date_achieved DESC);

-- =====================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================
-- Enable RLS on all tables
ALTER TABLE public.journey_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journey_treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journey_milestones ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- JOURNEY ENTRIES POLICIES
-- =====================================================
-- Users can view their own entries
CREATE POLICY "Users can view own journey entries"
  ON public.journey_entries
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own entries
CREATE POLICY "Users can insert own journey entries"
  ON public.journey_entries
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own entries
CREATE POLICY "Users can update own journey entries"
  ON public.journey_entries
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own entries
CREATE POLICY "Users can delete own journey entries"
  ON public.journey_entries
  FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- JOURNEY TREATMENTS POLICIES
-- =====================================================
-- Users can view their own treatments
CREATE POLICY "Users can view own treatments"
  ON public.journey_treatments
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own treatments
CREATE POLICY "Users can insert own treatments"
  ON public.journey_treatments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own treatments
CREATE POLICY "Users can update own treatments"
  ON public.journey_treatments
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own treatments
CREATE POLICY "Users can delete own treatments"
  ON public.journey_treatments
  FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- JOURNEY MILESTONES POLICIES
-- =====================================================
-- Users can view their own milestones
CREATE POLICY "Users can view own milestones"
  ON public.journey_milestones
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own milestones
CREATE POLICY "Users can insert own milestones"
  ON public.journey_milestones
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own milestones
CREATE POLICY "Users can update own milestones"
  ON public.journey_milestones
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own milestones
CREATE POLICY "Users can delete own milestones"
  ON public.journey_milestones
  FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- 5. UPDATED_AT TRIGGER FUNCTION
-- =====================================================
-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all tables
CREATE TRIGGER update_journey_entries_updated_at
  BEFORE UPDATE ON public.journey_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journey_treatments_updated_at
  BEFORE UPDATE ON public.journey_treatments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journey_milestones_updated_at
  BEFORE UPDATE ON public.journey_milestones
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================
-- After running this SQL, your tables are ready to use.
-- The Flutter app will automatically start using these tables.
