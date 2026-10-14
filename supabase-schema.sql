-- =========================================================================
-- PN NEET DIW — Supabase PostgreSQL Schema
-- Run this in your Supabase Dashboard: SQL Editor -> New Query -> Run
-- =========================================================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin')),
  avatar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TESTS TABLE
CREATE TABLE IF NOT EXISTS public.tests (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  chapter TEXT DEFAULT 'General',
  duration INTEGER NOT NULL DEFAULT 15,
  start_at TIMESTAMPTZ,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS public.questions (
  id BIGSERIAL PRIMARY KEY,
  test_id BIGINT REFERENCES public.tests(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  answer INTEGER NOT NULL CHECK (answer >= 0 AND answer <= 3)
);

-- 4. ATTEMPTS TABLE (Test Results & Reviews)
CREATE TABLE IF NOT EXISTS public.attempts (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES public.users(id) ON DELETE CASCADE,
  test_id BIGINT REFERENCES public.tests(id) ON DELETE SET NULL,
  score INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL DEFAULT 0,
  review JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. RESOURCES TABLE (PDF Notes & Video Lectures)
CREATE TABLE IF NOT EXISTS public.resources (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT NOT NULL DEFAULT 'General',
  type TEXT NOT NULL CHECK (type IN ('note', 'video')),
  url TEXT NOT NULL,
  filename TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. COMMUNITY POSTS TABLE (Doubts, Discussions & Photos)
CREATE TABLE IF NOT EXISTS public.community (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES public.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL DEFAULT '',
  image TEXT,
  comments JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. STUDY PLANS TABLE (Calendar)
CREATE TABLE IF NOT EXISTS public.plans (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subject TEXT NOT NULL DEFAULT 'General',
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ,
  done BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. LIVE CLASS STATE TABLE
CREATE TABLE IF NOT EXISTS public.live_class (
  id INTEGER PRIMARY KEY DEFAULT 1,
  active BOOLEAN DEFAULT FALSE,
  title TEXT,
  teacher TEXT,
  teacher_id BIGINT,
  started_at TIMESTAMPTZ
);

INSERT INTO public.live_class (id, active)
VALUES (1, false)
ON CONFLICT (id) DO NOTHING;

-- Storage Bucket setup (if not already created)
INSERT INTO storage.buckets (id, name, public)
VALUES ('pnneet-uploads', 'pnneet-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to uploads bucket
CREATE POLICY IF NOT EXISTS "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'pnneet-uploads');

-- Allow authenticated/service role insert access
CREATE POLICY IF NOT EXISTS "Service Role Uploads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'pnneet-uploads');
