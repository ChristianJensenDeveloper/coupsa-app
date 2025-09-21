# REDUZED Analytics & Tracking Database Schema

## Overview
This schema provides comprehensive tracking for user behavior, prop firm performance, and global analytics suitable for funding/valuation purposes.

## Enhanced Database Schema

### 1. User Sessions & Tracking
```sql
-- User sessions for detailed analytics
CREATE TABLE public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  ip_address INET,
  country TEXT,
  country_code TEXT,
  user_agent TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  device_type TEXT, -- 'mobile', 'desktop', 'tablet'
  browser TEXT,
  os TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  page_views INTEGER DEFAULT 0,
  total_time_spent INTEGER DEFAULT 0, -- seconds
  deals_viewed INTEGER DEFAULT 0,
  deals_swiped_right INTEGER DEFAULT 0,
  deals_swiped_left INTEGER DEFAULT 0,
  deals_clicked INTEGER DEFAULT 0,
  affiliate_clicks INTEGER DEFAULT 0
);

-- Indexes for performance
CREATE INDEX idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX idx_user_sessions_country ON public.user_sessions(country);
CREATE INDEX idx_user_sessions_date ON public.user_sessions(started_at);
CREATE INDEX idx_user_sessions_session_id ON public.user_sessions(session_id);
```

### 2. Enhanced User Actions
```sql
-- Drop and recreate user_actions with enhanced tracking
DROP TABLE IF EXISTS public.user_actions CASCADE;

CREATE TABLE public.user_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  session_id TEXT,
  deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL,
  firm_id UUID REFERENCES public.trading_firms(id) ON DELETE SET NULL,
  
  -- Action details
  action_type TEXT NOT NULL CHECK (action_type IN (
    'page_view', 'deal_view', 'deal_swipe_right', 'deal_swipe_left', 
    'deal_save', 'deal_unsave', 'deal_click', 'affiliate_click', 
    'deal_share', 'profile_view', 'category_filter', 'search',
    'login', 'logout', 'signup'
  )),
  
  -- Context data
  page_url TEXT,
  referrer TEXT,
  category TEXT,
  search_query TEXT,
  action_data JSONB DEFAULT '{}',
  
  -- Tracking data
  ip_address INET,
  country TEXT,
  country_code TEXT,
  user_agent TEXT,
  device_type TEXT,
  browser TEXT,
  
  -- Timing
  created_at TIMESTAMPTZ DEFAULT NOW(),
  time_on_page INTEGER, -- seconds spent before action
  
  -- A/B testing
  experiment_id TEXT,
  variant TEXT
);

-- Enhanced indexes
CREATE INDEX idx_user_actions_user_date ON public.user_actions(user_id, created_at);
CREATE INDEX idx_user_actions_deal_date ON public.user_actions(deal_id, created_at);
CREATE INDEX idx_user_actions_firm_date ON public.user_actions(firm_id, created_at);
CREATE INDEX idx_user_actions_type_date ON public.user_actions(action_type, created_at);
CREATE INDEX idx_user_actions_country_date ON public.user_actions(country, created_at);
CREATE INDEX idx_user_actions_session ON public.user_actions(session_id);
```

### 3. Deal Performance Analytics
```sql
-- Track detailed deal performance
CREATE TABLE public.deal_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES public.deals(id) ON DELETE CASCADE,
  firm_id UUID REFERENCES public.trading_firms(id) ON DELETE CASCADE,
  
  -- Daily metrics (updated daily via cron)
  date DATE NOT NULL,
  
  -- View metrics
  impressions INTEGER DEFAULT 0,
  unique_views INTEGER DEFAULT 0,
  view_time_total INTEGER DEFAULT 0, -- total seconds
  view_time_avg DECIMAL DEFAULT 0,
  
  -- Interaction metrics
  swipes_right INTEGER DEFAULT 0,
  swipes_left INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  unsaves INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  affiliate_clicks INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  
  -- Conversion metrics
  conversion_rate DECIMAL DEFAULT 0, -- saves/impressions
  click_through_rate DECIMAL DEFAULT 0, -- clicks/impressions
  affiliate_conversion_rate DECIMAL DEFAULT 0, -- affiliate_clicks/clicks
  
  -- Geographic data
  top_countries JSONB DEFAULT '{}', -- {"US": 45, "IN": 30, "GB": 25}
  
  -- Updated timestamp
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(deal_id, date)
);

-- Indexes for analytics queries
CREATE INDEX idx_deal_analytics_deal_date ON public.deal_analytics(deal_id, date);
CREATE INDEX idx_deal_analytics_firm_date ON public.deal_analytics(firm_id, date);
CREATE INDEX idx_deal_analytics_date ON public.deal_analytics(date);
```

### 4. Firm Performance Analytics
```sql
-- Track firm-level performance
CREATE TABLE public.firm_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_id UUID REFERENCES public.trading_firms(id) ON DELETE CASCADE,
  
  -- Time period
  date DATE NOT NULL,
  
  -- Deal portfolio metrics
  total_deals INTEGER DEFAULT 0,
  active_deals INTEGER DEFAULT 0,
  expired_deals INTEGER DEFAULT 0,
  avg_deal_duration DECIMAL DEFAULT 0, -- days
  
  -- Performance metrics
  total_impressions INTEGER DEFAULT 0,
  total_unique_views INTEGER DEFAULT 0,
  total_saves INTEGER DEFAULT 0,
  total_clicks INTEGER DEFAULT 0,
  total_affiliate_clicks INTEGER DEFAULT 0,
  
  -- Calculated metrics
  avg_conversion_rate DECIMAL DEFAULT 0,
  avg_click_through_rate DECIMAL DEFAULT 0,
  avg_affiliate_conversion_rate DECIMAL DEFAULT 0,
  
  -- Revenue estimates (for valuation)
  estimated_affiliate_revenue DECIMAL DEFAULT 0,
  estimated_commission DECIMAL DEFAULT 0,
  
  -- Rankings
  performance_rank INTEGER,
  category_rank INTEGER,
  
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(firm_id, date)
);

CREATE INDEX idx_firm_analytics_firm_date ON public.firm_analytics(firm_id, date);
CREATE INDEX idx_firm_analytics_date ON public.firm_analytics(date);
CREATE INDEX idx_firm_analytics_performance ON public.firm_analytics(avg_conversion_rate, date);
```

### 5. Global Platform Analytics
```sql
-- Platform-wide analytics for business intelligence
CREATE TABLE public.platform_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Time period
  date DATE NOT NULL UNIQUE,
  
  -- User metrics
  total_users INTEGER DEFAULT 0,
  new_users INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  returning_users INTEGER DEFAULT 0,
  user_retention_rate DECIMAL DEFAULT 0,
  
  -- Content metrics
  total_deals INTEGER DEFAULT 0,
  active_deals INTEGER DEFAULT 0,
  new_deals INTEGER DEFAULT 0,
  expired_deals INTEGER DEFAULT 0,
  
  -- Engagement metrics
  total_sessions INTEGER DEFAULT 0,
  avg_session_duration DECIMAL DEFAULT 0,
  total_page_views INTEGER DEFAULT 0,
  avg_pages_per_session DECIMAL DEFAULT 0,
  bounce_rate DECIMAL DEFAULT 0,
  
  -- Deal interaction metrics
  total_deal_views INTEGER DEFAULT 0,
  total_swipes_right INTEGER DEFAULT 0,
  total_swipes_left INTEGER DEFAULT 0,
  total_saves INTEGER DEFAULT 0,
  total_clicks INTEGER DEFAULT 0,
  total_affiliate_clicks INTEGER DEFAULT 0,
  
  -- Geographic distribution
  country_distribution JSONB DEFAULT '{}',
  top_traffic_sources JSONB DEFAULT '{}',
  device_distribution JSONB DEFAULT '{}',
  
  -- Revenue metrics (for valuation)
  estimated_daily_revenue DECIMAL DEFAULT 0,
  estimated_monthly_recurring_revenue DECIMAL DEFAULT 0,
  customer_acquisition_cost DECIMAL DEFAULT 0,
  
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_platform_analytics_date ON public.platform_analytics(date);
```

### 6. Country Analytics (for Traffic Distribution)
```sql
-- Detailed country-level analytics
CREATE TABLE public.country_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Location data
  country TEXT NOT NULL,
  country_code TEXT NOT NULL,
  date DATE NOT NULL,
  
  -- User metrics
  total_users INTEGER DEFAULT 0,
  new_users INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  
  -- Engagement metrics
  total_sessions INTEGER DEFAULT 0,
  avg_session_duration DECIMAL DEFAULT 0,
  total_page_views INTEGER DEFAULT 0,
  
  -- Deal metrics
  deals_viewed INTEGER DEFAULT 0,
  deals_saved INTEGER DEFAULT 0,
  deals_clicked INTEGER DEFAULT 0,
  affiliate_clicks INTEGER DEFAULT 0,
  
  -- Conversion metrics
  conversion_rate DECIMAL DEFAULT 0,
  click_through_rate DECIMAL DEFAULT 0,
  
  -- Popular categories in this country
  popular_categories JSONB DEFAULT '{}',
  
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(country, date)
);

CREATE INDEX idx_country_analytics_country_date ON public.country_analytics(country, date);
CREATE INDEX idx_country_analytics_date ON public.country_analytics(date);
```

## Analytics Views for Easy Querying

### 1. Real-time Deal Performance View
```sql
CREATE OR REPLACE VIEW deal_performance_summary AS
SELECT 
  d.id,
  d.title,
  d.category,
  tf.name as firm_name,
  tf.category as firm_category,
  
  -- Current metrics (last 30 days)
  COALESCE(SUM(da.impressions), 0) as total_impressions,
  COALESCE(SUM(da.unique_views), 0) as total_unique_views,
  COALESCE(SUM(da.saves), 0) as total_saves,
  COALESCE(SUM(da.clicks), 0) as total_clicks,
  COALESCE(SUM(da.affiliate_clicks), 0) as total_affiliate_clicks,
  
  -- Calculated rates
  CASE 
    WHEN SUM(da.impressions) > 0 
    THEN ROUND((SUM(da.saves)::DECIMAL / SUM(da.impressions)) * 100, 2)
    ELSE 0 
  END as conversion_rate_percentage,
  
  CASE 
    WHEN SUM(da.impressions) > 0 
    THEN ROUND((SUM(da.clicks)::DECIMAL / SUM(da.impressions)) * 100, 2)
    ELSE 0 
  END as click_through_rate_percentage,
  
  -- Deal status
  CASE 
    WHEN d.end_date > NOW() AND d.is_active = true THEN 'Active'
    WHEN d.end_date <= NOW() THEN 'Expired'
    ELSE 'Inactive'
  END as status,
  
  d.created_at,
  d.end_date

FROM deals d
LEFT JOIN trading_firms tf ON d.firm_id = tf.id
LEFT JOIN deal_analytics da ON d.id = da.deal_id 
  AND da.date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY d.id, d.title, d.category, tf.name, tf.category, d.created_at, d.end_date, d.is_active;
```

### 2. User Behavior Summary View
```sql
CREATE OR REPLACE VIEW user_behavior_summary AS
SELECT 
  p.id as user_id,
  p.email,
  p.full_name,
  p.country,
  p.created_at as joined_date,
  
  -- Session metrics
  COUNT(DISTINCT us.id) as total_sessions,
  AVG(us.total_time_spent) as avg_session_duration,
  SUM(us.page_views) as total_page_views,
  
  -- Deal interaction metrics
  COUNT(CASE WHEN ua.action_type = 'deal_view' THEN 1 END) as deals_viewed,
  COUNT(CASE WHEN ua.action_type = 'deal_swipe_right' THEN 1 END) as deals_swiped_right,
  COUNT(CASE WHEN ua.action_type = 'deal_swipe_left' THEN 1 END) as deals_swiped_left,
  COUNT(CASE WHEN ua.action_type = 'deal_save' THEN 1 END) as deals_saved,
  COUNT(CASE WHEN ua.action_type = 'deal_click' THEN 1 END) as deals_clicked,
  COUNT(CASE WHEN ua.action_type = 'affiliate_click' THEN 1 END) as affiliate_clicks,
  
  -- Engagement score (custom calculation)
  (
    COUNT(CASE WHEN ua.action_type = 'deal_view' THEN 1 END) * 1 +
    COUNT(CASE WHEN ua.action_type = 'deal_save' THEN 1 END) * 3 +
    COUNT(CASE WHEN ua.action_type = 'deal_click' THEN 1 END) * 2 +
    COUNT(CASE WHEN ua.action_type = 'affiliate_click' THEN 1 END) * 5
  ) as engagement_score,
  
  -- Last activity
  MAX(ua.created_at) as last_activity,
  
  -- Preferred categories (most viewed)
  mode() WITHIN GROUP (ORDER BY ua.category) as preferred_category

FROM profiles p
LEFT JOIN user_sessions us ON p.id = us.user_id
LEFT JOIN user_actions ua ON p.id = ua.user_id
GROUP BY p.id, p.email, p.full_name, p.country, p.created_at;
```

### 3. Country Traffic Distribution View
```sql
CREATE OR REPLACE VIEW country_traffic_distribution AS
SELECT 
  country,
  country_code,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(*) as total_sessions,
  SUM(page_views) as total_page_views,
  AVG(total_time_spent) as avg_session_duration,
  
  -- Calculate percentage of total traffic
  ROUND(
    (COUNT(*)::DECIMAL / (SELECT COUNT(*) FROM user_sessions)) * 100, 
    2
  ) as traffic_percentage,
  
  -- Deal engagement by country
  SUM(deals_viewed) as total_deals_viewed,
  SUM(deals_swiped_right) as total_saves,
  SUM(affiliate_clicks) as total_affiliate_clicks,
  
  -- Last 30 days activity
  COUNT(CASE WHEN started_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as recent_sessions

FROM user_sessions
WHERE country IS NOT NULL
GROUP BY country, country_code
ORDER BY total_sessions DESC;
```

## Analytics Functions

### 1. Update Deal Analytics (to be run daily via cron)
```sql
CREATE OR REPLACE FUNCTION update_deal_analytics()
RETURNS VOID AS $$
DECLARE
  target_date DATE := CURRENT_DATE - INTERVAL '1 day';
BEGIN
  INSERT INTO deal_analytics (
    deal_id, firm_id, date,
    impressions, unique_views, saves, clicks, affiliate_clicks,
    conversion_rate, click_through_rate, affiliate_conversion_rate
  )
  SELECT 
    d.id as deal_id,
    d.firm_id,
    target_date,
    
    -- Metrics from user_actions
    COUNT(CASE WHEN ua.action_type = 'deal_view' THEN 1 END) as impressions,
    COUNT(DISTINCT CASE WHEN ua.action_type = 'deal_view' THEN ua.user_id END) as unique_views,
    COUNT(CASE WHEN ua.action_type = 'deal_save' THEN 1 END) as saves,
    COUNT(CASE WHEN ua.action_type = 'deal_click' THEN 1 END) as clicks,
    COUNT(CASE WHEN ua.action_type = 'affiliate_click' THEN 1 END) as affiliate_clicks,
    
    -- Calculate rates
    CASE 
      WHEN COUNT(CASE WHEN ua.action_type = 'deal_view' THEN 1 END) > 0 
      THEN COUNT(CASE WHEN ua.action_type = 'deal_save' THEN 1 END)::DECIMAL / 
           COUNT(CASE WHEN ua.action_type = 'deal_view' THEN 1 END)
      ELSE 0 
    END as conversion_rate,
    
    CASE 
      WHEN COUNT(CASE WHEN ua.action_type = 'deal_view' THEN 1 END) > 0 
      THEN COUNT(CASE WHEN ua.action_type = 'deal_click' THEN 1 END)::DECIMAL / 
           COUNT(CASE WHEN ua.action_type = 'deal_view' THEN 1 END)
      ELSE 0 
    END as click_through_rate,
    
    CASE 
      WHEN COUNT(CASE WHEN ua.action_type = 'deal_click' THEN 1 END) > 0 
      THEN COUNT(CASE WHEN ua.action_type = 'affiliate_click' THEN 1 END)::DECIMAL / 
           COUNT(CASE WHEN ua.action_type = 'deal_click' THEN 1 END)
      ELSE 0 
    END as affiliate_conversion_rate
    
  FROM deals d
  LEFT JOIN user_actions ua ON d.id = ua.deal_id 
    AND ua.created_at::date = target_date
  GROUP BY d.id, d.firm_id
  
  ON CONFLICT (deal_id, date) 
  DO UPDATE SET
    impressions = EXCLUDED.impressions,
    unique_views = EXCLUDED.unique_views,
    saves = EXCLUDED.saves,
    clicks = EXCLUDED.clicks,
    affiliate_clicks = EXCLUDED.affiliate_clicks,
    conversion_rate = EXCLUDED.conversion_rate,
    click_through_rate = EXCLUDED.click_through_rate,
    affiliate_conversion_rate = EXCLUDED.affiliate_conversion_rate,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;
```

### 2. Track User Action with Enhanced Analytics
```sql
CREATE OR REPLACE FUNCTION track_user_action_enhanced(
  p_user_id UUID,
  p_session_id TEXT,
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
  -- Insert the action
  INSERT INTO user_actions (
    user_id, session_id, deal_id, firm_id, action_type,
    page_url, category, search_query, action_data,
    ip_address, country, country_code, user_agent, 
    device_type, browser, time_on_page
  ) VALUES (
    p_user_id, p_session_id, p_deal_id, p_firm_id, p_action_type,
    p_page_url, p_category, p_search_query, p_action_data,
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 3. Get Analytics Dashboard Data
```sql
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
        'total_users', COUNT(DISTINCT user_id),
        'total_sessions', COUNT(*),
        'total_page_views', SUM(page_views),
        'avg_session_duration', AVG(total_time_spent),
        'total_deals_viewed', SUM(deals_viewed),
        'total_affiliate_clicks', SUM(affiliate_clicks)
      )
      FROM user_sessions 
      WHERE started_at::date BETWEEN p_start_date AND p_end_date
    ),
    'country_distribution', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'country', country,
          'sessions', session_count,
          'percentage', ROUND((session_count::DECIMAL / total_sessions) * 100, 2)
        )
      )
      FROM (
        SELECT 
          country,
          COUNT(*) as session_count,
          SUM(COUNT(*)) OVER() as total_sessions
        FROM user_sessions 
        WHERE started_at::date BETWEEN p_start_date AND p_end_date
          AND country IS NOT NULL
        GROUP BY country
        ORDER BY session_count DESC
        LIMIT 10
      ) t
    ),
    'top_performing_deals', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'deal_id', deal_id,
          'title', d.title,
          'firm_name', tf.name,
          'impressions', SUM(impressions),
          'saves', SUM(saves),
          'conversion_rate', ROUND(AVG(conversion_rate) * 100, 2)
        )
      )
      FROM deal_analytics da
      JOIN deals d ON da.deal_id = d.id
      JOIN trading_firms tf ON d.firm_id = tf.id
      WHERE da.date BETWEEN p_start_date AND p_end_date
      GROUP BY deal_id, d.title, tf.name
      ORDER BY SUM(impressions) DESC
      LIMIT 10
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;
```

This comprehensive analytics schema provides:

1. **Complete user behavior tracking** - every swipe, click, save, and interaction
2. **Detailed firm performance metrics** - for each prop firm and their deals
3. **Geographic analytics** - traffic distribution by country for business intelligence
4. **Real-time performance views** - for quick dashboard queries
5. **Structured data relationships** - perfect for funding/valuation analysis
6. **Automated daily analytics updates** - via cron jobs

The schema captures everything needed to understand user engagement, firm performance, and platform growth - essential for investor presentations and business valuations.