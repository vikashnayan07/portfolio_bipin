-- =============================================
-- SUPABASE DATABASE SCHEMA
-- Portfolio Admin Backend for Bipin Kumar
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT DEFAULT 'Bipin Kumar',
  bio TEXT DEFAULT '',
  photo_url TEXT DEFAULT '',
  degree TEXT DEFAULT 'B.Ed',
  university TEXT DEFAULT 'Lalit Narayan Mithila University',
  percentage DECIMAL(5,2) DEFAULT 0,
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  location TEXT DEFAULT 'Bihar, India',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  tech_stack TEXT[] DEFAULT '{}',
  live_url TEXT DEFAULT '',
  github_url TEXT DEFAULT '',
  is_featured BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. BLOG POSTS TABLE
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT DEFAULT '',
  excerpt TEXT DEFAULT '',
  cover_image TEXT DEFAULT '',
  is_published BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  read_time INT DEFAULT 1,
  views INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. CONTACT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT DEFAULT '',
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied')),
  reply TEXT DEFAULT '',
  replied_at TIMESTAMPTZ,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. VISITORS TABLE (analytics)
CREATE TABLE IF NOT EXISTS visitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page TEXT DEFAULT '/',
  referrer TEXT DEFAULT '',
  user_agent TEXT DEFAULT '',
  ip_hash TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;

-- PROFILES: Anyone can read, only authenticated users can update
CREATE POLICY "Public can read profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Auth users can update profiles" ON profiles FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth users can insert profiles" ON profiles FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- PROJECTS: Anyone can read non-deleted, only auth can modify
CREATE POLICY "Public can read active projects" ON projects FOR SELECT USING (is_deleted = false);
CREATE POLICY "Auth users can manage projects" ON projects FOR ALL USING (auth.role() = 'authenticated');

-- BLOG POSTS: Anyone can read published non-deleted, auth can manage all
CREATE POLICY "Public can read published blogs" ON blog_posts FOR SELECT USING (is_published = true AND is_deleted = false);
CREATE POLICY "Auth users can manage blogs" ON blog_posts FOR ALL USING (auth.role() = 'authenticated');

-- CONTACT MESSAGES: Anyone can insert, only auth can read/update
CREATE POLICY "Anyone can send messages" ON contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Auth users can manage messages" ON contact_messages FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Auth users can update messages" ON contact_messages FOR UPDATE USING (auth.role() = 'authenticated');

-- VISITORS: Anyone can insert, only auth can read
CREATE POLICY "Anyone can log visit" ON visitors FOR INSERT WITH CHECK (true);
CREATE POLICY "Auth users can view visitors" ON visitors FOR SELECT USING (auth.role() = 'authenticated');

-- =============================================
-- REALTIME (enable for contact_messages)
-- =============================================
ALTER PUBLICATION supabase_realtime ADD TABLE contact_messages;

-- =============================================
-- UPDATED_AT TRIGGER
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_projects
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_blog_posts
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- STORAGE BUCKET (run separately if needed)
-- =============================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('portfolio', 'portfolio', true);
