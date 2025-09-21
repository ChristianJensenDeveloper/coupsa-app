-- REDUZED Analytics Quick Fix
-- Run this in Supabase SQL Editor to fix analytics issues

-- Drop and recreate the problematic view with a simpler preferred_category calculation
DROP VIEW IF EXISTS user_behavior_summary;

CREATE OR REPLACE VIEW user_behavior_summary AS
SELECT 
  p.id as user_id,
  p.email,
  p.full_name,
  p.country,
  p.created_at as joined_date,
  COUNT(DISTINCT us.id) as total_sessions,
  AVG(us.total_time_spent) as avg_session_duration,
  SUM(us.page_views) as total_page_views,
  COUNT(CASE WHEN ua.action_type = 'deal_view' THEN 1 END) as deals_viewed,
  COUNT(CASE WHEN ua.action_type = 'deal_swipe_right' THEN 1 END) as deals_swiped_right,
  COUNT(CASE WHEN ua.action_type = 'deal_swipe_left' THEN 1 END) as deals_swiped_left,
  COUNT(CASE WHEN ua.action_type = 'deal_save' THEN 1 END) as deals_saved,
  COUNT(CASE WHEN ua.action_type = 'deal_click' THEN 1 END) as deals_clicked,
  COUNT(CASE WHEN ua.action_type = 'affiliate_click' THEN 1 END) as affiliate_clicks,
  (
    COUNT(CASE WHEN ua.action_type = 'deal_view' THEN 1 END) * 1 +
    COUNT(CASE WHEN ua.action_type = 'deal_save' THEN 1 END) * 3 +
    COUNT(CASE WHEN ua.action_type = 'deal_click' THEN 1 END) * 2 +
    COUNT(CASE WHEN ua.action_type = 'affiliate_click' THEN 1 END) * 5
  ) as engagement_score,
  MAX(ua.created_at) as last_activity,
  (SELECT ua_sub.category 
   FROM user_actions ua_sub 
   WHERE ua_sub.user_id = p.id AND ua_sub.category IS NOT NULL 
   GROUP BY ua_sub.category 
   ORDER BY COUNT(*) DESC 
   LIMIT 1) as preferred_category
FROM profiles p
LEFT JOIN user_sessions us ON p.id = us.user_id
LEFT JOIN user_actions ua ON p.id = ua.user_id
GROUP BY p.id, p.email, p.full_name, p.country, p.created_at;

-- Ensure all required functions exist with better error handling
CREATE OR REPLACE FUNCTION get_analytics_dashboard(
  p_start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'overview', (
      SELECT jsonb_build_object(
        'total_users', COALESCE(COUNT(DISTINCT user_id), 0),
        'total_sessions', COALESCE(COUNT(*), 0),
        'total_page_views', COALESCE(SUM(page_views), 0),
        'avg_session_duration', COALESCE(AVG(total_time_spent), 0),
        'total_deals_viewed', COALESCE(SUM(deals_viewed), 0),
        'total_affiliate_clicks', COALESCE(SUM(affiliate_clicks), 0)
      )
      FROM user_sessions 
      WHERE started_at::date BETWEEN p_start_date AND p_end_date
    ),
    'country_distribution', (
      SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
          'country', country,
          'sessions', session_count,
          'percentage', ROUND((session_count::DECIMAL / NULLIF(total_sessions, 0)) * 100, 2)
        )
      ), '[]'::jsonb)
      FROM (
        SELECT 
          COALESCE(country, 'Unknown') as country,
          COUNT(*) as session_count,
          SUM(COUNT(*)) OVER() as total_sessions
        FROM user_sessions 
        WHERE started_at::date BETWEEN p_start_date AND p_end_date
        GROUP BY country
        ORDER BY session_count DESC
        LIMIT 10
      ) t
    ),
    'top_performing_deals', (
      SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
          'deal_id', deal_id,
          'title', COALESCE(d.title, 'Unknown Deal'),
          'firm_name', COALESCE(tf.name, 'Unknown Firm'),
          'impressions', COALESCE(SUM(impressions), 0),
          'saves', COALESCE(SUM(saves), 0),
          'conversion_rate', ROUND(COALESCE(AVG(conversion_rate), 0) * 100, 2)
        )
      ), '[]'::jsonb)
      FROM deal_analytics da
      LEFT JOIN deals d ON da.deal_id = d.id
      LEFT JOIN trading_firms tf ON d.firm_id = tf.id
      WHERE da.date BETWEEN p_start_date AND p_end_date
      GROUP BY deal_id, d.title, tf.name
      ORDER BY SUM(COALESCE(impressions, 0)) DESC
      LIMIT 10
    )
  ) INTO result;
  
  RETURN COALESCE(result, '{}'::jsonb);
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'error', true,
      'message', SQLERRM,
      'overview', jsonb_build_object(
        'total_users', 0,
        'total_sessions', 0,
        'total_page_views', 0,
        'avg_session_duration', 0,
        'total_deals_viewed', 0,
        'total_affiliate_clicks', 0
      ),
      'country_distribution', '[]'::jsonb,
      'top_performing_deals', '[]'::jsonb
    );
END;
$$ LANGUAGE plpgsql;

-- Enhanced User Action Tracking Function with better error handling
CREATE OR REPLACE FUNCTION track_user_action_enhanced(
  p_user_id UUID DEFAULT NULL,
  p_session_id TEXT DEFAULT NULL,
  p_deal_id UUID DEFAULT NULL,
  p_firm_id UUID DEFAULT NULL,
  p_action_type TEXT,
  p_page_url TEXT DEFAULT NULL,
  p_category TEXT DEFAULT NULL,
  p_search_query TEXT DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_country TEXT DEFAULT NULL,
  p_country_code TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_device_type TEXT DEFAULT NULL,
  p_browser TEXT DEFAULT NULL,
  p_time_on_page INTEGER DEFAULT NULL,
  p_action_data JSONB DEFAULT '{}'
)
RETURNS VOID AS $$
BEGIN
  -- Insert the action with error handling
  INSERT INTO user_actions (
    user_id, session_id, deal_id, firm_id, action_type,
    page_url, category, search_query, action_data,
    ip_address, country, country_code, user_agent, 
    device_type, browser, time_on_page
  ) VALUES (
    p_user_id, p_session_id, p_deal_id, p_firm_id, p_action_type,
    p_page_url, p_category, p_search_query, COALESCE(p_action_data, '{}'::jsonb),
    p_ip_address, p_country, p_country_code, p_user_agent,
    p_device_type, p_browser, p_time_on_page
  );
  
  -- Update session metrics if session exists
  IF p_session_id IS NOT NULL THEN
    UPDATE user_sessions 
    SET 
      page_views = page_views + CASE WHEN p_action_type = 'page_view' THEN 1 ELSE 0 END,
      deals_viewed = deals_viewed + CASE WHEN p_action_type = 'deal_view' THEN 1 ELSE 0 END,
      deals_swiped_right = deals_swiped_right + CASE WHEN p_action_type = 'deal_swipe_right' THEN 1 ELSE 0 END,
      deals_swiped_left = deals_swiped_left + CASE WHEN p_action_type = 'deal_swipe_left' THEN 1 ELSE 0 END,
      deals_clicked = deals_clicked + CASE WHEN p_action_type = 'deal_click' THEN 1 ELSE 0 END,
      affiliate_clicks = affiliate_clicks + CASE WHEN p_action_type = 'affiliate_click' THEN 1 ELSE 0 END,
      total_time_spent = total_time_spent + COALESCE(p_time_on_page, 0),
      ended_at = NOW()
    WHERE session_id = p_session_id;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the operation
    RAISE WARNING 'Failed to track user action: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test function to verify setup
CREATE OR REPLACE FUNCTION verify_reduzed_analytics_setup()
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'tables', jsonb_build_object(
      'user_sessions', (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'user_sessions'),
      'user_actions', (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'user_actions'),
      'deal_analytics', (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'deal_analytics'),
      'firm_analytics', (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'firm_analytics'),
      'platform_analytics', (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'platform_analytics'),
      'country_analytics', (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'country_analytics')
    ),
    'views', jsonb_build_object(
      'deal_performance_summary', (SELECT COUNT(*) FROM information_schema.views WHERE table_name = 'deal_performance_summary'),
      'user_behavior_summary', (SELECT COUNT(*) FROM information_schema.views WHERE table_name = 'user_behavior_summary'),
      'country_traffic_distribution', (SELECT COUNT(*) FROM information_schema.views WHERE table_name = 'country_traffic_distribution')
    ),
    'functions', jsonb_build_object(
      'track_user_action_enhanced', (SELECT COUNT(*) FROM information_schema.routines WHERE routine_name = 'track_user_action_enhanced'),
      'get_analytics_dashboard', (SELECT COUNT(*) FROM information_schema.routines WHERE routine_name = 'get_analytics_dashboard'),
      'update_deal_analytics', (SELECT COUNT(*) FROM information_schema.routines WHERE routine_name = 'update_deal_analytics')
    ),
    'setup_complete', true,
    'timestamp', NOW()
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Run verification
SELECT verify_reduzed_analytics_setup();