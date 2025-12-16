# Q&A Forum Database Setup

## Supabase Tables Required

Execute these SQL commands in your Supabase SQL Editor:

### 1. Questions Table

```sql
-- Create questions table
CREATE TABLE questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT,
  profile_picture_url TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  upvotes INTEGER DEFAULT 0,
  answer_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_resolved BOOLEAN DEFAULT FALSE,
  tags TEXT[] DEFAULT '{}'
);

-- Create index for better query performance
CREATE INDEX idx_questions_category ON questions(category);
CREATE INDEX idx_questions_user_id ON questions(user_id);
CREATE INDEX idx_questions_created_at ON questions(created_at DESC);
CREATE INDEX idx_questions_upvotes ON questions(upvotes DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for questions
-- Everyone can view questions
CREATE POLICY "Questions are viewable by everyone" ON questions
  FOR SELECT USING (true);

-- Authenticated users can insert questions
CREATE POLICY "Authenticated users can create questions" ON questions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Users can update their own questions
CREATE POLICY "Users can update their own questions" ON questions
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own questions
CREATE POLICY "Users can delete their own questions" ON questions
  FOR DELETE USING (auth.uid() = user_id);
```

### 2. Answers Table

```sql
-- Create answers table
CREATE TABLE answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT,
  profile_picture_url TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_accepted BOOLEAN DEFAULT FALSE,
  parent_answer_id UUID REFERENCES answers(id) ON DELETE CASCADE
);

-- Create index for better query performance
CREATE INDEX idx_answers_question_id ON answers(question_id);
CREATE INDEX idx_answers_user_id ON answers(user_id);
CREATE INDEX idx_answers_created_at ON answers(created_at DESC);
CREATE INDEX idx_answers_is_accepted ON answers(is_accepted);
CREATE INDEX idx_answers_parent_answer_id ON answers(parent_answer_id);

-- Enable Row Level Security (RLS)
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for answers
-- Everyone can view answers
CREATE POLICY "Answers are viewable by everyone" ON answers
  FOR SELECT USING (true);

-- Authenticated users can insert answers
CREATE POLICY "Authenticated users can create answers" ON answers
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Users can update their own answers
CREATE POLICY "Users can update their own answers" ON answers
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own answers
CREATE POLICY "Users can delete their own answers" ON answers
  FOR DELETE USING (auth.uid() = user_id);
```

### 3. Question Votes Table

```sql
-- Create question_votes table
CREATE TABLE question_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(question_id, user_id)
);

-- Create index for better query performance
CREATE INDEX idx_question_votes_question_id ON question_votes(question_id);
CREATE INDEX idx_question_votes_user_id ON question_votes(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE question_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for question_votes
-- Everyone can view votes
CREATE POLICY "Question votes are viewable by everyone" ON question_votes
  FOR SELECT USING (true);

-- Authenticated users can insert votes
CREATE POLICY "Authenticated users can vote on questions" ON question_votes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Users can delete their own votes
CREATE POLICY "Users can remove their own votes" ON question_votes
  FOR DELETE USING (auth.uid() = user_id);
```

### 4. Answer Votes Table

```sql
-- Create answer_votes table
CREATE TABLE answer_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  answer_id UUID NOT NULL REFERENCES answers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(answer_id, user_id)
);

-- Create index for better query performance
CREATE INDEX idx_answer_votes_answer_id ON answer_votes(answer_id);
CREATE INDEX idx_answer_votes_user_id ON answer_votes(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE answer_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for answer_votes
-- Everyone can view votes
CREATE POLICY "Answer votes are viewable by everyone" ON answer_votes
  FOR SELECT USING (true);

-- Authenticated users can insert votes
CREATE POLICY "Authenticated users can vote on answers" ON answer_votes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Users can delete their own votes
CREATE POLICY "Users can remove their own votes" ON answer_votes
  FOR DELETE USING (auth.uid() = user_id);
```

### 5. Reports Table

```sql
-- Create reports table for reporting inappropriate content
CREATE TABLE reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_type TEXT NOT NULL, -- 'question' or 'answer'
  content_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  additional_info TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'pending', -- 'pending', 'reviewed', 'resolved'
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ
);

-- Create index for better query performance
CREATE INDEX idx_reports_content_type ON reports(content_type);
CREATE INDEX idx_reports_content_id ON reports(content_id);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reports
-- Users can view their own reports
CREATE POLICY "Users can view their own reports" ON reports
  FOR SELECT USING (auth.uid() = user_id);

-- Authenticated users can insert reports
CREATE POLICY "Authenticated users can report content" ON reports
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

### 6. Database Functions

```sql
-- Function to increment question upvotes
CREATE OR REPLACE FUNCTION increment_question_upvotes(question_id_param UUID)
RETURNS void AS $$
BEGIN
  UPDATE questions
  SET upvotes = upvotes + 1
  WHERE id = question_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrement question upvotes
CREATE OR REPLACE FUNCTION decrement_question_upvotes(question_id_param UUID)
RETURNS void AS $$
BEGIN
  UPDATE questions
  SET upvotes = GREATEST(upvotes - 1, 0)
  WHERE id = question_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment answer upvotes
CREATE OR REPLACE FUNCTION increment_answer_upvotes(answer_id_param UUID)
RETURNS void AS $$
BEGIN
  UPDATE answers
  SET upvotes = upvotes + 1
  WHERE id = answer_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrement answer upvotes
CREATE OR REPLACE FUNCTION decrement_answer_upvotes(answer_id_param UUID)
RETURNS void AS $$
BEGIN
  UPDATE answers
  SET upvotes = GREATEST(upvotes - 1, 0)
  WHERE id = answer_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment answer count on question
CREATE OR REPLACE FUNCTION increment_answer_count(question_id_param UUID)
RETURNS void AS $$
BEGIN
  UPDATE questions
  SET answer_count = answer_count + 1
  WHERE id = question_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrement answer count on question
CREATE OR REPLACE FUNCTION decrement_answer_count(question_id_param UUID)
RETURNS void AS $$
BEGIN
  UPDATE questions
  SET answer_count = GREATEST(answer_count - 1, 0)
  WHERE id = question_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Setup Instructions

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your OncoSense project

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Execute SQL Commands**
   - Copy and paste each section above
   - Run each section separately
   - Wait for "Success" confirmation before proceeding

4. **Verify Tables**
   - Go to "Table Editor" in the left sidebar
   - You should see: `questions`, `answers`, `question_votes`, `answer_votes`, `reports`

5. **Test the Setup**
   - Run your Flutter app
   - Try creating a question
   - Try posting an answer
   - Try upvoting

## Features Enabled

✅ Questions with categories, tags, and anonymous posting
✅ Answers with upvoting and best answer marking
✅ Reply to answers (nested replies)
✅ Upvote questions and answers
✅ Report inappropriate content
✅ User authentication required for posting
✅ Row Level Security enabled
✅ Automatic vote counting
✅ Automatic answer counting

## Security

- Row Level Security (RLS) is enabled on all tables
- Users can only edit/delete their own content
- Everyone can view questions and answers
- Only authenticated users can post, vote, or report

## Next Steps

After setting up the database:
1. Test forum functionality in your app
2. Monitor database performance in Supabase dashboard
3. Adjust RLS policies if needed
4. Add additional indexes for better performance if needed

---

## Migration: Add Profile Picture Support (If Tables Already Exist)

If you already have the questions and answers tables created, run this SQL to add profile picture support:

```sql
-- Add profile_picture_url column to questions table
ALTER TABLE questions ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;

-- Add profile_picture_url column to answers table
ALTER TABLE answers ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;
```

After running this migration:
1. New questions/answers will automatically include profile pictures
2. Existing questions/answers will show anonymous icons or user initials
3. Profile pictures are only shown for non-anonymous posts
