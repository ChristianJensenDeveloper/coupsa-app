import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { AnalyticsSession } from '../lib/analytics-database';

interface AnalyticsContextType {
  session: AnalyticsSession | null;
  trackPageView: (pageUrl?: string) => Promise<void>;
  trackDealView: (dealId: string, firmId?: string, category?: string) => Promise<void>;
  trackDealSwipe: (dealId: string, direction: 'right' | 'left', firmId?: string, category?: string) => Promise<void>;
  trackDealSave: (dealId: string, firmId?: string, category?: string) => Promise<void>;
  trackDealClick: (dealId: string, firmId?: string, category?: string, destinationUrl?: string) => Promise<void>;
  trackAffiliateClick: (dealId: string, firmId?: string, category?: string, destinationUrl?: string) => Promise<void>;
  trackSearch: (query: string, category?: string) => Promise<void>;
  trackCategoryFilter: (category: string) => Promise<void>;
  trackLogin: () => Promise<void>;
  trackLogout: () => Promise<void>;
  trackSignup: () => Promise<void>;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

interface AnalyticsProviderProps {
  children: React.ReactNode;
  userId?: string;
}

export function AnalyticsProvider({ children, userId }: AnalyticsProviderProps) {
  const [session, setSession] = useState<AnalyticsSession | null>(null);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const sessionStarted = useRef(false);

  // Initialize analytics session
  useEffect(() => {
    if (!sessionStarted.current) {
      sessionStarted.current = true;
      initializeSession();
    }
  }, []);

  // Update user ID when user logs in/out
  useEffect(() => {
    if (session && userId !== session.getUserId()) {
      if (userId) {
        session.setUserId(userId);
        session.trackAction('login').catch(error => {
          console.warn('Failed to track login:', error);
        });
      } else {
        session.trackAction('logout').catch(error => {
          console.warn('Failed to track logout:', error);
        });
      }
    }
  }, [userId, session]);

  const initializeSession = async () => {
    try {
      const analyticsSession = new AnalyticsSession(userId);
      
      // Extract UTM parameters from URL
      const urlParams = new URLSearchParams(window.location.search);
      const utmParams = {
        source: urlParams.get('utm_source') || undefined,
        medium: urlParams.get('utm_medium') || undefined,
        campaign: urlParams.get('utm_campaign') || undefined,
      };

      const referrer = document.referrer || undefined;
      
      const result = await analyticsSession.start(referrer, utmParams);
      
      // Check if analytics is configured
      if (result.error?.type === 'analytics_not_configured') {
        // Silently disable analytics if not configured
        setAnalyticsEnabled(false);
      } else {
        setAnalyticsEnabled(true);
      }
      
      setSession(analyticsSession);

      // Track initial page view (only if analytics is enabled)
      if (!result.error || result.error.type !== 'analytics_not_configured') {
        await analyticsSession.trackPageView().catch(() => {
          // Silently ignore page view tracking errors
        });
      }

      // Set up beforeunload to end session
      const handleBeforeUnload = () => {
        analyticsSession.end().catch(() => {
          // Silently ignore session end errors
        });
      };

      window.addEventListener('beforeunload', handleBeforeUnload);

      // Set up visibility change to track user engagement
      const handleVisibilityChange = () => {
        if (document.hidden) {
          // User switched away from tab
          analyticsSession.trackAction('page_view', {
            actionData: { visibility: 'hidden' }
          }).catch(() => {
            // Silently ignore visibility tracking errors
          });
        } else {
          // User returned to tab
          analyticsSession.trackAction('page_view', {
            actionData: { visibility: 'visible' }
          }).catch(() => {
            // Silently ignore visibility tracking errors
          });
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    } catch (error) {
      // Silently handle initialization errors
      setAnalyticsEnabled(false);
      
      // Still create a basic session for tracking purposes, but without external dependencies
      try {
        const basicSession = new AnalyticsSession(userId);
        setSession(basicSession);
      } catch (basicError) {
        // Silently ignore basic session creation errors
      }
    }
  };

  const trackPageView = async (pageUrl?: string) => {
    if (session && analyticsEnabled) {
      await session.trackPageView(pageUrl).catch(() => {
        // Silently ignore tracking errors
      });
    }
  };

  const trackDealView = async (dealId: string, firmId?: string, category?: string) => {
    if (session && analyticsEnabled) {
      await session.trackDealView(dealId, firmId, category).catch(() => {
        // Silently ignore tracking errors
      });
    }
  };

  const trackDealSwipe = async (dealId: string, direction: 'right' | 'left', firmId?: string, category?: string) => {
    if (session && analyticsEnabled) {
      await session.trackDealSwipe(dealId, direction, firmId, category).catch(() => {
        // Silently ignore tracking errors
      });
    }
  };

  const trackDealSave = async (dealId: string, firmId?: string, category?: string) => {
    if (session && analyticsEnabled) {
      await session.trackDealSave(dealId, firmId, category).catch(() => {
        // Silently ignore tracking errors
      });
    }
  };

  const trackDealClick = async (dealId: string, firmId?: string, category?: string, destinationUrl?: string) => {
    if (session && analyticsEnabled) {
      await session.trackDealClick(dealId, firmId, category, destinationUrl).catch(() => {
        // Silently ignore tracking errors
      });
    }
  };

  const trackAffiliateClick = async (dealId: string, firmId?: string, category?: string, destinationUrl?: string) => {
    if (session && analyticsEnabled) {
      await session.trackAffiliateClick(dealId, firmId, category, destinationUrl).catch(() => {
        // Silently ignore tracking errors
      });
    }
  };

  const trackSearch = async (query: string, category?: string) => {
    if (session && analyticsEnabled) {
      await session.trackAction('search', {
        searchQuery: query,
        category,
        actionData: { search_query: query, category }
      }).catch(() => {
        // Silently ignore tracking errors
      });
    }
  };

  const trackCategoryFilter = async (category: string) => {
    if (session && analyticsEnabled) {
      await session.trackAction('category_filter', {
        category,
        actionData: { selected_category: category }
      }).catch(() => {
        // Silently ignore tracking errors
      });
    }
  };

  const trackLogin = async () => {
    if (session && analyticsEnabled) {
      await session.trackAction('login').catch(() => {
        // Silently ignore tracking errors
      });
    }
  };

  const trackLogout = async () => {
    if (session && analyticsEnabled) {
      await session.trackAction('logout').catch(() => {
        // Silently ignore tracking errors
      });
    }
  };

  const trackSignup = async () => {
    if (session && analyticsEnabled) {
      await session.trackAction('signup').catch(() => {
        // Silently ignore tracking errors
      });
    }
  };

  const value: AnalyticsContextType = {
    session,
    trackPageView,
    trackDealView,
    trackDealSwipe,
    trackDealSave,
    trackDealClick,
    trackAffiliateClick,
    trackSearch,
    trackCategoryFilter,
    trackLogin,
    trackLogout,
    trackSignup
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
}

// Custom hook for tracking page changes
export function usePageTracking(currentPage: string) {
  const { trackPageView } = useAnalytics();
  const previousPage = useRef<string>('');

  useEffect(() => {
    if (currentPage !== previousPage.current) {
      trackPageView(`/${currentPage}`);
      previousPage.current = currentPage;
    }
  }, [currentPage, trackPageView]);
}

// Custom hook for tracking deal interactions
export function useDealTracking() {
  const { trackDealView, trackDealSwipe, trackDealSave, trackDealClick, trackAffiliateClick } = useAnalytics();

  const trackDealInteraction = {
    view: (dealId: string, firmId?: string, category?: string) => trackDealView(dealId, firmId, category),
    swipe: (dealId: string, direction: 'right' | 'left', firmId?: string, category?: string) => 
      trackDealSwipe(dealId, direction, firmId, category),
    save: (dealId: string, firmId?: string, category?: string) => trackDealSave(dealId, firmId, category),
    click: (dealId: string, firmId?: string, category?: string, destinationUrl?: string) => 
      trackDealClick(dealId, firmId, category, destinationUrl),
    affiliateClick: (dealId: string, firmId?: string, category?: string, destinationUrl?: string) => 
      trackAffiliateClick(dealId, firmId, category, destinationUrl)
  };

  return trackDealInteraction;
}

// Custom hook for tracking search and filters
export function useSearchTracking() {
  const { trackSearch, trackCategoryFilter } = useAnalytics();
  
  const trackSearchInteraction = {
    search: (query: string, category?: string) => trackSearch(query, category),
    categoryFilter: (category: string) => trackCategoryFilter(category)
  };

  return trackSearchInteraction;
}

// Custom hook for tracking authentication events
export function useAuthTracking() {
  const { trackLogin, trackLogout, trackSignup } = useAnalytics();
  
  const trackAuthAction = {
    login: () => trackLogin(),
    logout: () => trackLogout(),
    signup: () => trackSignup()
  };

  return trackAuthAction;
}