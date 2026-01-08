-- =====================================================
-- BOOKMARK TABLES SETUP FOR SUPABASE
-- =====================================================
-- Copy and paste this entire file into Supabase Dashboard → SQL Editor → New Query
-- Then click "Run" to create all tables at once

-- =====================================================
-- 1. ARTICLE BOOKMARKS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.article_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  url TEXT NOT NULL,
  image_url TEXT,
  published_at TEXT,
  source_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, url)
);

-- Enable Row Level Security
ALTER TABLE public.article_bookmarks ENABLE ROW LEVEL SECURITY;

-- Policies for article_bookmarks
CREATE POLICY "Users can view their own article bookmarks"
  ON public.article_bookmarks
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own article bookmarks"
  ON public.article_bookmarks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own article bookmarks"
  ON public.article_bookmarks
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_article_bookmarks_user_id ON public.article_bookmarks(user_id);

-- =====================================================
-- 2. QUESTION BOOKMARKS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.question_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  question_user_id TEXT NOT NULL,
  question_user_name TEXT,
  profile_picture_url TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  upvotes INTEGER DEFAULT 0,
  answer_count INTEGER DEFAULT 0,
  question_created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  question_updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_resolved BOOLEAN DEFAULT FALSE,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, question_id)
);

-- Enable Row Level Security
ALTER TABLE public.question_bookmarks ENABLE ROW LEVEL SECURITY;

-- Policies for question_bookmarks
CREATE POLICY "Users can view their own question bookmarks"
  ON public.question_bookmarks
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own question bookmarks"
  ON public.question_bookmarks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own question bookmarks"
  ON public.question_bookmarks
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_question_bookmarks_user_id ON public.question_bookmarks(user_id);

-- =====================================================
-- 3. RESOURCE BOOKMARKS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.resource_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  phone TEXT,
  location TEXT,
  address TEXT,
  website TEXT,
  email TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  resource_created_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, resource_id)
);

-- Enable Row Level Security
ALTER TABLE public.resource_bookmarks ENABLE ROW LEVEL SECURITY;

-- Policies for resource_bookmarks
CREATE POLICY "Users can view their own resource bookmarks"
  ON public.resource_bookmarks
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own resource bookmarks"
  ON public.resource_bookmarks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own resource bookmarks"
  ON public.resource_bookmarks
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_resource_bookmarks_user_id ON public.resource_bookmarks(user_id);

-- =====================================================
-- DONE! 
-- =====================================================
-- After running this, you should see 3 new tables in Table Editor:
-- - article_bookmarks
-- - question_bookmarks  
-- - resource_bookmarks
