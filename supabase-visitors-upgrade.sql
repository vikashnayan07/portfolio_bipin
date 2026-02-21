-- =============================================
-- VISITOR ANALYTICS SCHEMA UPGRADE
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. Add new columns to existing visitors table
ALTER TABLE visitors
  ADD COLUMN IF NOT EXISTS session_id TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS device_type TEXT DEFAULT 'desktop' CHECK (device_type IN ('mobile', 'desktop', 'tablet')),
  ADD COLUMN IF NOT EXISTS country TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS blog_slug TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS is_unique BOOLEAN DEFAULT true;

-- 2. Create indexes for fast analytics queries
CREATE INDEX IF NOT EXISTS idx_visitors_created_at ON visitors(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_visitors_page ON visitors(page);
CREATE INDEX IF NOT EXISTS idx_visitors_session_id ON visitors(session_id);
CREATE INDEX IF NOT EXISTS idx_visitors_blog_slug ON visitors(blog_slug);
CREATE INDEX IF NOT EXISTS idx_visitors_device_type ON visitors(device_type);
CREATE INDEX IF NOT EXISTS idx_visitors_ip_hash ON visitors(ip_hash);

-- 3. Create a function to get total unique visitors count (for public counter)
CREATE OR REPLACE FUNCTION get_visitor_count()
RETURNS BIGINT AS $$
  SELECT COUNT(DISTINCT COALESCE(NULLIF(ip_hash, ''), id::text))
  FROM visitors
  WHERE page = '/' OR page = '' OR blog_slug IS NULL;
$$ LANGUAGE sql SECURITY DEFINER;

-- 4. Create a function to get analytics summary (for admin dashboard)
CREATE OR REPLACE FUNCTION get_analytics_summary()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_visits', (SELECT COUNT(*) FROM visitors),
    'unique_visitors', (SELECT COUNT(DISTINCT COALESCE(NULLIF(ip_hash, ''), id::text)) FROM visitors),
    'today_visits', (SELECT COUNT(*) FROM visitors WHERE created_at >= CURRENT_DATE),
    'today_unique', (SELECT COUNT(DISTINCT COALESCE(NULLIF(ip_hash, ''), id::text)) FROM visitors WHERE created_at >= CURRENT_DATE),
    'this_week', (SELECT COUNT(*) FROM visitors WHERE created_at >= date_trunc('week', CURRENT_DATE)),
    'this_month', (SELECT COUNT(*) FROM visitors WHERE created_at >= date_trunc('month', CURRENT_DATE)),
    'mobile_count', (SELECT COUNT(*) FROM visitors WHERE device_type = 'mobile'),
    'desktop_count', (SELECT COUNT(*) FROM visitors WHERE device_type = 'desktop'),
    'tablet_count', (SELECT COUNT(*) FROM visitors WHERE device_type = 'tablet')
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create a function to get daily visit data for chart (last 30 days)
CREATE OR REPLACE FUNCTION get_daily_visits(days_back INT DEFAULT 30)
RETURNS TABLE(visit_date DATE, visit_count BIGINT, unique_count BIGINT) AS $$
  SELECT
    DATE(created_at) as visit_date,
    COUNT(*) as visit_count,
    COUNT(DISTINCT COALESCE(NULLIF(ip_hash, ''), id::text)) as unique_count
  FROM visitors
  WHERE created_at >= CURRENT_DATE - (days_back || ' days')::INTERVAL
  GROUP BY DATE(created_at)
  ORDER BY visit_date ASC;
$$ LANGUAGE sql SECURITY DEFINER;

-- 6. Create a function to get top blog posts by views
CREATE OR REPLACE FUNCTION get_top_blogs(limit_count INT DEFAULT 5)
RETURNS TABLE(slug TEXT, view_count BIGINT, unique_views BIGINT) AS $$
  SELECT
    blog_slug as slug,
    COUNT(*) as view_count,
    COUNT(DISTINCT COALESCE(NULLIF(ip_hash, ''), id::text)) as unique_views
  FROM visitors
  WHERE blog_slug IS NOT NULL AND blog_slug != ''
  GROUP BY blog_slug
  ORDER BY view_count DESC
  LIMIT limit_count;
$$ LANGUAGE sql SECURITY DEFINER;

-- 7. Grant execute permissions to anon and authenticated roles
GRANT EXECUTE ON FUNCTION get_visitor_count() TO anon;
GRANT EXECUTE ON FUNCTION get_visitor_count() TO authenticated;
GRANT EXECUTE ON FUNCTION get_analytics_summary() TO authenticated;
GRANT EXECUTE ON FUNCTION get_daily_visits(INT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_top_blogs(INT) TO authenticated;

-- 8. Enable realtime on visitors for live dashboard updates
ALTER PUBLICATION supabase_realtime ADD TABLE visitors;
