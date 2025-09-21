import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CookiePreferences, getCookieConsent, hasConsentFor } from './CookieConsent';

interface CookieContextType {
  preferences: CookiePreferences | null;
  hasConsent: boolean;
  canUseAnalytics: boolean;
  canUseMarketing: boolean;
  canUseFunctional: boolean;
  canUsePreferences: boolean;
  updatePreferences: (preferences: CookiePreferences) => void;
  clearAllCookies: () => void;
}

const CookieContext = createContext<CookieContextType | undefined>(undefined);

interface CookieProviderProps {
  children: ReactNode;
}

export function CookieProvider({ children }: CookieProviderProps) {
  const [preferences, setPreferences] = useState<CookiePreferences | null>(null);
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    const consent = getCookieConsent();
    if (consent) {
      setPreferences(consent);
      setHasConsent(true);
      
      // Initialize analytics if consent given
      if (consent.analytics) {
        initializeAnalytics();
      }
      
      // Initialize marketing cookies if consent given
      if (consent.marketing) {
        initializeMarketing();
      }
    }
  }, []);

  const updatePreferences = (newPreferences: CookiePreferences) => {
    setPreferences(newPreferences);
    setHasConsent(true);
    
    // Handle analytics
    if (newPreferences.analytics && !preferences?.analytics) {
      initializeAnalytics();
    } else if (!newPreferences.analytics && preferences?.analytics) {
      clearAnalyticsCookies();
    }
    
    // Handle marketing
    if (newPreferences.marketing && !preferences?.marketing) {
      initializeMarketing();
    } else if (!newPreferences.marketing && preferences?.marketing) {
      clearMarketingCookies();
    }
  };

  const clearAllCookies = () => {
    // Clear all non-essential cookies
    clearAnalyticsCookies();
    clearMarketingCookies();
    clearFunctionalCookies();
    clearPreferenceCookies();
    
    setPreferences({
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
      preferences: false
    });
  };

  const initializeAnalytics = () => {
    // Initialize Google Analytics or other analytics tools
    console.log('Initializing analytics...');
    
    // Example: Google Analytics 4
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('consent', 'update', {
        analytics_storage: 'granted'
      });
    }
  };

  const initializeMarketing = () => {
    // Initialize marketing tools (pixels, retargeting, etc.)
    console.log('Initializing marketing tools...');
    
    // Example: Facebook Pixel
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('consent', 'grant');
    }
  };

  const clearAnalyticsCookies = () => {
    console.log('Clearing analytics cookies...');
    
    // Clear Google Analytics cookies
    const analyticsCookies = [
      '_ga', '_ga_*', '_gid', '_gat', '_gat_*', 
      '__utma', '__utmb', '__utmc', '__utmt', '__utmz'
    ];
    
    analyticsCookies.forEach(cookieName => {
      deleteCookie(cookieName);
    });

    // Update gtag consent
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('consent', 'update', {
        analytics_storage: 'denied'
      });
    }
  };

  const clearMarketingCookies = () => {
    console.log('Clearing marketing cookies...');
    
    // Clear common marketing cookies
    const marketingCookies = [
      '_fbp', '_fbc', 'fr', 'tr', // Facebook
      'IDE', 'DSID', 'FLC', '1P_JAR', // Google Ads
      'MUID', 'MUIDB', // Microsoft
      '_tt_enable_cookie', '_ttp', // TikTok
      'li_at', 'li_oatml', // LinkedIn
    ];
    
    marketingCookies.forEach(cookieName => {
      deleteCookie(cookieName);
    });

    // Update consent for marketing tools
    if (typeof window !== 'undefined') {
      if ((window as any).gtag) {
        (window as any).gtag('consent', 'update', {
          ad_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied'
        });
      }
      
      if ((window as any).fbq) {
        (window as any).fbq('consent', 'revoke');
      }
    }
  };

  const clearFunctionalCookies = () => {
    console.log('Clearing functional cookies...');
    
    // Clear functional cookies (but keep necessary ones)
    const functionalCookies = [
      'theme', 'language', 'currency', 'timezone'
    ];
    
    functionalCookies.forEach(cookieName => {
      deleteCookie(cookieName);
    });
  };

  const clearPreferenceCookies = () => {
    console.log('Clearing preference cookies...');
    
    // Clear preference cookies
    const preferenceCookies = [
      'user_preferences', 'notification_settings', 'display_settings'
    ];
    
    preferenceCookies.forEach(cookieName => {
      deleteCookie(cookieName);
    });
  };

  const deleteCookie = (name: string) => {
    // Delete cookie for current domain
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    
    // Delete cookie for parent domain
    const domain = window.location.hostname;
    const parentDomain = domain.startsWith('www.') ? domain.substring(4) : domain;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${parentDomain};`;
    
    // Handle wildcard cookies (e.g., _ga_*)
    if (name.includes('*')) {
      const baseName = name.replace('*', '');
      const allCookies = document.cookie.split(';');
      
      allCookies.forEach(cookie => {
        const cookieName = cookie.split('=')[0].trim();
        if (cookieName.startsWith(baseName)) {
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${parentDomain};`;
        }
      });
    }
  };

  const value: CookieContextType = {
    preferences,
    hasConsent,
    canUseAnalytics: hasConsentFor('analytics'),
    canUseMarketing: hasConsentFor('marketing'),
    canUseFunctional: hasConsentFor('functional'),
    canUsePreferences: hasConsentFor('preferences'),
    updatePreferences,
    clearAllCookies
  };

  return (
    <CookieContext.Provider value={value}>
      {children}
    </CookieContext.Provider>
  );
}

export function useCookies() {
  const context = useContext(CookieContext);
  if (context === undefined) {
    throw new Error('useCookies must be used within a CookieProvider');
  }
  return context;
}

// Utility hook for conditional analytics tracking
export function useAnalytics() {
  const { canUseAnalytics } = useCookies();

  const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
    if (!canUseAnalytics) {
      console.log('Analytics tracking blocked by cookie preferences');
      return;
    }

    // Track with Google Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, parameters);
    }

    // Track with other analytics tools
    console.log('Analytics event:', eventName, parameters);
  };

  const trackPageView = (path: string, title?: string) => {
    if (!canUseAnalytics) {
      console.log('Page view tracking blocked by cookie preferences');
      return;
    }

    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('config', 'GA_MEASUREMENT_ID', {
        page_path: path,
        page_title: title
      });
    }

    console.log('Page view:', path, title);
  };

  return {
    trackEvent,
    trackPageView,
    canTrack: canUseAnalytics
  };
}