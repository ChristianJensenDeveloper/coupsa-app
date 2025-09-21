import { supabase } from './supabase';

// Extend Window interface for analytics warning tracking
declare global {
  interface Window {
    analyticsWarningShown?: boolean;
  }
}

// Types for analytics data
export interface UserSession {
  id: string;
  user_id?: string;
  session_id: string;
  ip_address?: string;
  country?: string;
  country_code?: string;
  user_agent?: string;
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  device_type?: 'mobile' | 'desktop' | 'tablet';
  browser?: string;
  os?: string;
  started_at: string;
  ended_at?: string;
  page_views: number;
  total_time_spent: number;
  deals_viewed: number;
  deals_swiped_right: number;
  deals_swiped_left: number;
  deals_clicked: number;
  affiliate_clicks: number;
}

export interface UserAction {
  id: string;
  user_id?: string;
  session_id?: string;
  deal_id?: string;
  firm_id?: string;
  action_type: 'page_view' | 'deal_view' | 'deal_swipe_right' | 'deal_swipe_left' | 
              'deal_save' | 'deal_unsave' | 'deal_click' | 'affiliate_click' | 
              'deal_share' | 'profile_view' | 'category_filter' | 'search' |
              'login' | 'logout' | 'signup';
  page_url?: string;
  referrer?: string;
  category?: string;
  search_query?: string;
  action_data?: Record<string, any>;
  ip_address?: string;
  country?: string;
  country_code?: string;
  user_agent?: string;
  device_type?: string;
  browser?: string;
  created_at: string;
  time_on_page?: number;
  experiment_id?: string;
  variant?: string;
}

export interface DealAnalytics {
  id: string;
  deal_id: string;
  firm_id: string;
  date: string;
  impressions: number;
  unique_views: number;
  view_time_total: number;
  view_time_avg: number;
  swipes_right: number;
  swipes_left: number;
  saves: number;
  unsaves: number;
  clicks: number;
  affiliate_clicks: number;
  shares: number;
  conversion_rate: number;
  click_through_rate: number;
  affiliate_conversion_rate: number;
  top_countries: Record<string, number>;
  updated_at: string;
}

export interface AnalyticsDashboard {
  overview: {
    total_users: number;
    total_sessions: number;
    total_page_views: number;
    avg_session_duration: number;
    total_deals_viewed: number;
    total_affiliate_clicks: number;
  };
  country_distribution: Array<{
    country: string;
    sessions: number;
    percentage: number;
  }>;
  top_performing_deals: Array<{
    deal_id: string;
    title: string;
    firm_name: string;
    impressions: number;
    saves: number;
    conversion_rate: number;
  }>;
}

// Utility functions to detect device/browser info
export function getDeviceType(): 'mobile' | 'desktop' | 'tablet' {
  if (typeof window === 'undefined') return 'desktop';
  
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
}

export function getBrowser(): string {
  if (typeof window === 'undefined') return 'unknown';
  
  const ua = navigator.userAgent;
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Safari')) return 'Safari';
  if (ua.includes('Edge')) return 'Edge';
  if (ua.includes('Opera')) return 'Opera';
  return 'Other';
}

export function getOS(): string {
  if (typeof window === 'undefined') return 'unknown';
  
  const ua = navigator.userAgent;
  if (ua.includes('Windows')) return 'Windows';
  if (ua.includes('Mac')) return 'macOS';
  if (ua.includes('Linux')) return 'Linux';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('iOS')) return 'iOS';
  return 'Other';
}

// Generate unique session ID
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Get user's IP and location with multiple fallback methods
export async function getUserLocation(): Promise<{
  ip: string | null;
  country: string;
  country_code: string;
}> {
  // First try external API (fast timeout to avoid blocking)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500); // Even shorter timeout
    
    const response = await fetch('https://ipapi.co/json/', {
      signal: controller.signal,
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
      }
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json();
      
      // Validate the response more strictly
      if (data && typeof data === 'object' && data.ip && 
          typeof data.ip === 'string' && 
          data.ip !== 'unknown' && 
          data.ip !== '' &&
          data.ip !== 'null' &&
          data.ip !== 'undefined') {
        
        // Double-check it looks like a valid IP
        const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
        
        if (ipRegex.test(data.ip)) {
          return {
            ip: data.ip,
            country: data.country_name || 'Unknown',
            country_code: data.country_code || 'XX'
          };
        }
      }
    }
  } catch (error) {
    // Silently continue to browser-based detection
    // Don't log warnings for external service failures as this is expected
  }
  
  // Fallback to browser-based detection (never returns IP)
  return getBrowserLocation();
}

// Alternative location detection using browser APIs and timezone
export async function getBrowserLocation(): Promise<{
  ip: string | null;
  country: string;
  country_code: string;
}> {
  try {
    // Try to get timezone-based country detection
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    let country = 'Unknown';
    let countryCode = 'XX';
    
    if (timezone) {
      // Enhanced timezone to country mapping
      const timezoneCountryMap: Record<string, { country: string; code: string }> = {
        // North America
        'America/New_York': { country: 'United States', code: 'US' },
        'America/Chicago': { country: 'United States', code: 'US' },
        'America/Denver': { country: 'United States', code: 'US' },
        'America/Los_Angeles': { country: 'United States', code: 'US' },
        'America/Phoenix': { country: 'United States', code: 'US' },
        'America/Toronto': { country: 'Canada', code: 'CA' },
        'America/Vancouver': { country: 'Canada', code: 'CA' },
        'America/Montreal': { country: 'Canada', code: 'CA' },
        'America/Mexico_City': { country: 'Mexico', code: 'MX' },
        
        // Europe
        'Europe/London': { country: 'United Kingdom', code: 'GB' },
        'Europe/Paris': { country: 'France', code: 'FR' },
        'Europe/Berlin': { country: 'Germany', code: 'DE' },
        'Europe/Rome': { country: 'Italy', code: 'IT' },
        'Europe/Madrid': { country: 'Spain', code: 'ES' },  
        'Europe/Amsterdam': { country: 'Netherlands', code: 'NL' },
        'Europe/Brussels': { country: 'Belgium', code: 'BE' },
        'Europe/Zurich': { country: 'Switzerland', code: 'CH' },
        'Europe/Vienna': { country: 'Austria', code: 'AT' },
        'Europe/Stockholm': { country: 'Sweden', code: 'SE' },
        'Europe/Oslo': { country: 'Norway', code: 'NO' },
        'Europe/Copenhagen': { country: 'Denmark', code: 'DK' },
        'Europe/Warsaw': { country: 'Poland', code: 'PL' },
        'Europe/Prague': { country: 'Czech Republic', code: 'CZ' },
        'Europe/Budapest': { country: 'Hungary', code: 'HU' },
        'Europe/Athens': { country: 'Greece', code: 'GR' },
        'Europe/Dublin': { country: 'Ireland', code: 'IE' },
        'Europe/Lisbon': { country: 'Portugal', code: 'PT' },
        'Europe/Helsinki': { country: 'Finland', code: 'FI' },
        'Europe/Moscow': { country: 'Russia', code: 'RU' },
        
        // Asia Pacific
        'Asia/Tokyo': { country: 'Japan', code: 'JP' },
        'Asia/Shanghai': { country: 'China', code: 'CN' },
        'Asia/Hong_Kong': { country: 'Hong Kong', code: 'HK' },
        'Asia/Seoul': { country: 'South Korea', code: 'KR' },
        'Asia/Singapore': { country: 'Singapore', code: 'SG' },
        'Asia/Bangkok': { country: 'Thailand', code: 'TH' },
        'Asia/Manila': { country: 'Philippines', code: 'PH' },
        'Asia/Jakarta': { country: 'Indonesia', code: 'ID' },
        'Asia/Kuala_Lumpur': { country: 'Malaysia', code: 'MY' },
        'Asia/Dubai': { country: 'UAE', code: 'AE' },
        'Asia/Kolkata': { country: 'India', code: 'IN' },
        'Asia/Mumbai': { country: 'India', code: 'IN' },
        'Asia/Karachi': { country: 'Pakistan', code: 'PK' },
        
        // Australia/Oceania
        'Australia/Sydney': { country: 'Australia', code: 'AU' },
        'Australia/Melbourne': { country: 'Australia', code: 'AU' },
        'Australia/Brisbane': { country: 'Australia', code: 'AU' },
        'Australia/Perth': { country: 'Australia', code: 'AU' },
        'Pacific/Auckland': { country: 'New Zealand', code: 'NZ' },
        
        // South America
        'America/Sao_Paulo': { country: 'Brazil', code: 'BR' },
        'America/Buenos_Aires': { country: 'Argentina', code: 'AR' },
        'America/Lima': { country: 'Peru', code: 'PE' },
        'America/Santiago': { country: 'Chile', code: 'CL' },
        'America/Bogota': { country: 'Colombia', code: 'CO' },
        
        // Africa
        'Africa/Cairo': { country: 'Egypt', code: 'EG' },
        'Africa/Lagos': { country: 'Nigeria', code: 'NG' },
        'Africa/Johannesburg': { country: 'South Africa', code: 'ZA' },
        'Africa/Nairobi': { country: 'Kenya', code: 'KE' },
      };
      
      const countryInfo = timezoneCountryMap[timezone];
      if (countryInfo) {
        country = countryInfo.country;
        countryCode = countryInfo.code;
      } else {
        // Try to extract country from timezone string for unmapped timezones
        const timezoneParts = timezone.split('/');
        if (timezoneParts.length >= 2) {
          const region = timezoneParts[0];
          const city = timezoneParts[1];
          
          // Basic region mapping
          const regionMap: Record<string, string> = {
            'Europe': 'Europe',
            'America': city.includes('Toronto') || city.includes('Montreal') ? 'Canada' : 'Americas',
            'Asia': 'Asia',
            'Africa': 'Africa',
            'Australia': 'Australia',
            'Pacific': 'Pacific'
          };
          
          country = regionMap[region] || 'Unknown';
        }
      }
    }
    
    // Try to get language preference as additional hint
    try {
      const language = navigator.language || navigator.languages?.[0];
      if (language && country === 'Unknown') {
        const langCountryMap: Record<string, { country: string; code: string }> = {
          'en-US': { country: 'United States', code: 'US' },
          'en-GB': { country: 'United Kingdom', code: 'GB' },
          'en-CA': { country: 'Canada', code: 'CA' },
          'en-AU': { country: 'Australia', code: 'AU' },
          'fr-FR': { country: 'France', code: 'FR' },
          'de-DE': { country: 'Germany', code: 'DE' },
          'es-ES': { country: 'Spain', code: 'ES' },
          'it-IT': { country: 'Italy', code: 'IT' },
          'ja-JP': { country: 'Japan', code: 'JP' },
          'ko-KR': { country: 'South Korea', code: 'KR' },
          'zh-CN': { country: 'China', code: 'CN' },
          'pt-BR': { country: 'Brazil', code: 'BR' },
          'ru-RU': { country: 'Russia', code: 'RU' },
        };
        
        const langInfo = langCountryMap[language];
        if (langInfo) {
          country = langInfo.country;
          countryCode = langInfo.code;
        }
      }
    } catch (langError) {
      // Ignore language detection errors
    }
    
    return {
      ip: null, // Browser-based detection doesn't provide IP
      country,
      country_code: countryCode
    };
  } catch (error) {
    return {
      ip: null,
      country: 'Unknown',
      country_code: 'XX'
    };
  }
}

// Session Management
export async function startUserSession(
  userId?: string,
  referrer?: string,
  utmParams?: {
    source?: string;
    medium?: string;
    campaign?: string;
  }
): Promise<{ sessionId: string; error?: any }> {
  try {
    const sessionId = generateSessionId();
    
    // Check if user_sessions table exists before trying to use it
    const { error: tableCheckError } = await supabase
      .from('user_sessions')
      .select('count', { count: 'exact', head: true })
      .limit(0);

    if (tableCheckError) {
      // Silently skip session tracking if analytics not configured
      return { sessionId, error: { type: 'analytics_not_configured', message: 'Analytics tables not found' } };
    }

    // Get location with proper null handling
    let location = { ip: null as string | null, country: 'Unknown', country_code: 'XX' };
    try {
      const locationResult = await getUserLocation();
      // Ensure IP is null if it's empty, undefined, or "unknown"
      location = {
        ip: locationResult.ip && locationResult.ip !== 'unknown' ? locationResult.ip : null,
        country: locationResult.country || 'Unknown',
        country_code: locationResult.country_code || 'XX'
      };
    } catch (error) {
      // Silently use defaults if location fails
      location = { ip: null, country: 'Unknown', country_code: 'XX' };
    }
    
    const sessionData: Partial<UserSession> = {
      user_id: userId,
      session_id: sessionId,
      ip_address: location.ip, // Will be null when location fails
      country: location.country,
      country_code: location.country_code,
      user_agent: typeof window !== 'undefined' ? navigator.userAgent : 'unknown',
      referrer: referrer || (typeof document !== 'undefined' ? document.referrer : undefined),
      utm_source: utmParams?.source,
      utm_medium: utmParams?.medium,
      utm_campaign: utmParams?.campaign,
      device_type: getDeviceType(),
      browser: getBrowser(),
      os: getOS(),
      page_views: 0,
      total_time_spent: 0,
      deals_viewed: 0,
      deals_swiped_right: 0,
      deals_swiped_left: 0,
      deals_clicked: 0,
      affiliate_clicks: 0
    };

    const { error } = await supabase
      .from('user_sessions')
      .insert(sessionData);

    if (error) throw error;

    return { sessionId };
  } catch (error) {
    // Only log actual database errors, not configuration issues
    if (error instanceof Error && !error.message.includes('not found')) {
      console.error('Failed to start user session:', error);
    }
    return { sessionId: generateSessionId(), error };
  }
}

export async function endUserSession(sessionId: string): Promise<{ error?: any }> {
  try {
    const { error } = await supabase
      .from('user_sessions')
      .update({ ended_at: new Date().toISOString() })
      .eq('session_id', sessionId);

    if (error) throw error;
    return {};
  } catch (error) {
    console.error('Failed to end user session:', error);
    return { error };
  }
}

// Enhanced User Action Tracking
export async function trackUserAction(
  actionType: UserAction['action_type'],
  params: {
    userId?: string;
    sessionId?: string;
    dealId?: string;
    firmId?: string;
    pageUrl?: string;
    category?: string;
    searchQuery?: string;
    timeOnPage?: number;
    actionData?: Record<string, any>;
    experimentId?: string;
    variant?: string;
  } = {}
): Promise<{ error?: any }> {
  try {
    // Check if analytics tables and functions exist
    const { error: tableCheckError } = await supabase
      .from('user_actions')
      .select('count', { count: 'exact', head: true })
      .limit(0);

    if (tableCheckError) {
      // Silently skip action tracking if analytics not configured
      return { error: { type: 'analytics_not_configured', message: 'Analytics tables not found' } };
    }

    // Get location data with proper null handling
    let location = { ip: null as string | null, country: 'Unknown', country_code: 'XX' };
    try {
      const locationResult = await getUserLocation();
      // Ensure IP is null if it's empty, undefined, or "unknown"
      location = {
        ip: locationResult.ip && locationResult.ip !== 'unknown' ? locationResult.ip : null,
        country: locationResult.country || 'Unknown',
        country_code: locationResult.country_code || 'XX'
      };
    } catch (error) {
      // Silently use defaults if location fails
      location = { ip: null, country: 'Unknown', country_code: 'XX' };
    }
    
    const actionData: Partial<UserAction> = {
      user_id: params.userId,
      session_id: params.sessionId,
      deal_id: params.dealId,
      firm_id: params.firmId,
      action_type: actionType,
      page_url: params.pageUrl || (typeof window !== 'undefined' ? window.location.href : undefined),
      referrer: typeof document !== 'undefined' ? document.referrer : undefined,
      category: params.category,
      search_query: params.searchQuery,
      action_data: params.actionData || {},
      ip_address: location.ip, // This will be null when location fails
      country: location.country,
      country_code: location.country_code,
      user_agent: typeof window !== 'undefined' ? navigator.userAgent : 'unknown',
      device_type: getDeviceType(),
      browser: getBrowser(),
      time_on_page: params.timeOnPage,
      experiment_id: params.experimentId,
      variant: params.variant
    };

    // Try to use the enhanced tracking function first, fall back to direct insert
    const { error: rpcError } = await supabase.rpc('track_user_action_enhanced', {
      p_action_type: actionType,
      p_user_id: params.userId || null,
      p_session_id: params.sessionId || null,
      p_deal_id: params.dealId || null,
      p_firm_id: params.firmId || null,
      p_page_url: actionData.page_url || null,
      p_category: params.category || null,
      p_search_query: params.searchQuery || null,
      p_ip_address: location.ip, // Pass null directly, not string
      p_country: location.country || null,
      p_country_code: location.country_code || null,
      p_user_agent: actionData.user_agent || null,
      p_device_type: actionData.device_type || null,
      p_browser: actionData.browser || null,
      p_time_on_page: params.timeOnPage || null,
      p_action_data: actionData.action_data || {}
    });

    if (rpcError) {
      // If the function doesn't exist, fall back to direct insert
      // Only log this once instead of for every action
      if (!window.analyticsWarningShown) {
        console.info('Using basic analytics tracking (enhanced features not available)');
        window.analyticsWarningShown = true;
      }
      const { error: insertError } = await supabase
        .from('user_actions')
        .insert(actionData);
      
      if (insertError) throw insertError;
    }

    return {};
  } catch (error) {
    // Only log actual database errors, not configuration issues
    if (error instanceof Error && !error.message.includes('not found')) {
      console.error('Failed to track user action:', error);
    }
    return { error };
  }
}

export async function trackDealView(
  dealId: string,
  params: {
    userId?: string;
    sessionId?: string;
    firmId?: string;
    category?: string;
    timeOnPage?: number;
  } = {}
): Promise<{ error?: any }> {
  return trackUserAction('deal_view', {
    ...params,
    dealId,
    actionData: { view_timestamp: new Date().toISOString() }
  });
}

export async function trackDealSwipe(
  dealId: string,
  direction: 'right' | 'left',
  params: {
    userId?: string;
    sessionId?: string;
    firmId?: string;
    category?: string;
    timeOnPage?: number;
  } = {}
): Promise<{ error?: any }> {
  const actionType = direction === 'right' ? 'deal_swipe_right' : 'deal_swipe_left';
  
  return trackUserAction(actionType, {
    ...params,
    dealId,
    actionData: { 
      direction,
      swipe_timestamp: new Date().toISOString()
    }
  });
}

export async function trackDealSave(
  dealId: string,
  params: {
    userId?: string;
    sessionId?: string;
    firmId?: string;
    category?: string;
  } = {}
): Promise<{ error?: any }> {
  return trackUserAction('deal_save', {
    ...params,
    dealId,
    actionData: { save_timestamp: new Date().toISOString() }
  });
}

export async function trackDealClick(
  dealId: string,
  clickType: 'deal_details' | 'affiliate_link',
  params: {
    userId?: string;
    sessionId?: string;
    firmId?: string;
    category?: string;
    destinationUrl?: string;
  } = {}
): Promise<{ error?: any }> {
  const actionType = clickType === 'affiliate_link' ? 'affiliate_click' : 'deal_click';
  
  return trackUserAction(actionType, {
    ...params,
    dealId,
    actionData: { 
      click_type: clickType,
      destination_url: params.destinationUrl,
      click_timestamp: new Date().toISOString()
    }
  });
}

// Analytics retrieval functions
export async function getAnalyticsDashboard(
  startDate?: string,
  endDate?: string
): Promise<{ data?: AnalyticsDashboard; error?: any }> {
  try {
    // Check if analytics tables exist first
    const { error: tableCheckError } = await supabase
      .from('user_sessions')
      .select('count', { count: 'exact', head: true })
      .limit(0);

    if (tableCheckError) {
      // Silently return empty data if analytics not configured
      return { 
        data: {
          overview: {
            total_users: 0,
            total_sessions: 0,
            total_page_views: 0,
            avg_session_duration: 0,
            total_deals_viewed: 0,
            total_affiliate_clicks: 0
          },
          country_distribution: [],
          top_performing_deals: []
        }
      };
    }

    const { data, error } = await supabase.rpc('get_analytics_dashboard', {
      p_start_date: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      p_end_date: endDate || new Date().toISOString().split('T')[0]
    });

    if (error) {
      // If the function doesn't exist, return empty data
      return { 
        data: {
          overview: {
            total_users: 0,
            total_sessions: 0,
            total_page_views: 0,
            avg_session_duration: 0,
            total_deals_viewed: 0,
            total_affiliate_clicks: 0
          },
          country_distribution: [],
          top_performing_deals: []
        }
      };
    }
    
    return { data };
  } catch (error) {
    console.error('Failed to get analytics dashboard:', error);
    return { error };
  }
}

export async function getDealPerformance(
  dealId?: string,
  limit: number = 10
): Promise<{ data?: any[]; error?: any }> {
  try {
    // Check if analytics tables exist first
    const { error: tableCheckError } = await supabase
      .from('deals')
      .select('count', { count: 'exact', head: true })
      .limit(0);

    if (tableCheckError) {
      console.warn('Core tables not available. Returning empty data.');
      return { data: [] };
    }

    let query = supabase
      .from('deal_performance_summary')
      .select('*')
      .order('total_impressions', { ascending: false });

    if (dealId) {
      query = query.eq('id', dealId);
    } else {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      console.warn('Deal performance view not available:', error);
      return { data: [] };
    }
    
    return { data };
  } catch (error) {
    console.error('Failed to get deal performance:', error);
    return { error };
  }
}

export async function getUserBehaviorSummary(
  userId?: string,
  limit: number = 100
): Promise<{ data?: any[]; error?: any }> {
  try {
    // Check if analytics tables exist first
    const { error: tableCheckError } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true })
      .limit(0);

    if (tableCheckError) {
      console.warn('Core tables not available. Returning empty data.');
      return { data: [] };
    }

    let query = supabase
      .from('user_behavior_summary')
      .select('*')
      .order('engagement_score', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    } else {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      console.warn('User behavior view not available:', error);
      return { data: [] };
    }
    
    return { data };
  } catch (error) {
    console.error('Failed to get user behavior summary:', error);
    return { error };
  }
}

export async function getCountryTrafficDistribution(): Promise<{ data?: any[]; error?: any }> {
  try {
    // Check if analytics tables exist first
    const { error: tableCheckError } = await supabase
      .from('user_sessions')
      .select('count', { count: 'exact', head: true })
      .limit(0);

    if (tableCheckError) {
      console.warn('Analytics tables not available. Returning empty data.');
      return { data: [] };
    }

    const { data, error } = await supabase
      .from('country_traffic_distribution')
      .select('*')
      .order('traffic_percentage', { ascending: false })
      .limit(20);

    if (error) {
      console.warn('Country traffic view not available:', error);
      return { data: [] };
    }
    
    return { data };
  } catch (error) {
    console.error('Failed to get country traffic distribution:', error);
    return { error };
  }
}

// Firm analytics
export async function getFirmAnalytics(
  firmId?: string,
  startDate?: string,
  endDate?: string
): Promise<{ data?: any[]; error?: any }> {
  try {
    // Check if analytics tables exist first
    const { error: tableCheckError } = await supabase
      .from('trading_firms')
      .select('count', { count: 'exact', head: true })
      .limit(0);

    if (tableCheckError) {
      console.warn('Core tables not available. Returning empty data.');
      return { data: [] };
    }

    let query = supabase
      .from('firm_analytics')
      .select(`
        *,
        trading_firms (
          name,
          category,
          verification_status
        )
      `)
      .order('date', { ascending: false });

    if (firmId) {
      query = query.eq('firm_id', firmId);
    }

    if (startDate) {
      query = query.gte('date', startDate);
    }

    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data, error } = await query.limit(100);

    if (error) {
      console.warn('Firm analytics not available:', error);
      return { data: [] };
    }
    
    return { data };
  } catch (error) {
    console.error('Failed to get firm analytics:', error);
    return { error };
  }
}

// Utility function to run daily analytics update
export async function runDailyAnalyticsUpdate(): Promise<{ error?: any }> {
  try {
    // Check if analytics tables exist first
    const { error: tableCheckError } = await supabase
      .from('deal_analytics')
      .select('count', { count: 'exact', head: true })
      .limit(0);

    if (tableCheckError) {
      console.warn('Analytics tables not set up yet. Skipping daily update.');
      return { error: { type: 'analytics_not_configured', message: 'Analytics tables not found' } };
    }

    const { error } = await supabase.rpc('update_deal_analytics');
    
    if (error) {
      console.warn('Analytics update function not available:', error);
      return { error };
    }
    
    return {};
  } catch (error) {
    console.error('Failed to run daily analytics update:', error);
    return { error };
  }
}

// Session helper for React components
export class AnalyticsSession {
  private sessionId: string | null = null;
  private userId: string | null = null;
  private startTime: number = Date.now();
  private lastActionTime: number = Date.now();

  constructor(userId?: string) {
    this.userId = userId || null;
  }

  async start(referrer?: string, utmParams?: { source?: string; medium?: string; campaign?: string }) {
    const result = await startUserSession(this.userId || undefined, referrer, utmParams);
    this.sessionId = result.sessionId;
    this.startTime = Date.now();
    this.lastActionTime = Date.now();
    return result;
  }

  async end() {
    if (this.sessionId) {
      return endUserSession(this.sessionId);
    }
    return {};
  }

  async trackAction(
    actionType: UserAction['action_type'],
    params: Parameters<typeof trackUserAction>[1] = {}
  ) {
    const timeOnPage = Math.floor((Date.now() - this.lastActionTime) / 1000);
    this.lastActionTime = Date.now();

    return trackUserAction(actionType, {
      ...params,
      userId: this.userId || undefined,
      sessionId: this.sessionId || undefined,
      timeOnPage
    });
  }

  async trackPageView(pageUrl?: string) {
    return this.trackAction('page_view', { pageUrl });
  }

  async trackDealView(dealId: string, firmId?: string, category?: string) {
    return this.trackAction('deal_view', { dealId, firmId, category });
  }

  async trackDealSwipe(dealId: string, direction: 'right' | 'left', firmId?: string, category?: string) {
    const actionType = direction === 'right' ? 'deal_swipe_right' : 'deal_swipe_left';
    return this.trackAction(actionType, { dealId, firmId, category });
  }

  async trackDealSave(dealId: string, firmId?: string, category?: string) {
    return this.trackAction('deal_save', { dealId, firmId, category });
  }

  async trackDealClick(dealId: string, firmId?: string, category?: string, destinationUrl?: string) {
    return this.trackAction('deal_click', { 
      dealId, 
      firmId, 
      category,
      actionData: { destination_url: destinationUrl }
    });
  }

  async trackAffiliateClick(dealId: string, firmId?: string, category?: string, destinationUrl?: string) {
    return this.trackAction('affiliate_click', { 
      dealId, 
      firmId, 
      category,
      actionData: { destination_url: destinationUrl }
    });
  }

  getSessionId(): string | null {
    return this.sessionId;
  }

  getUserId(): string | null {
    return this.userId;
  }

  setUserId(userId: string) {
    this.userId = userId;
  }
}