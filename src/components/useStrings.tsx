import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

export interface StringData {
  [key: string]: string;
}

// Default strings that can be overridden
const DEFAULT_STRINGS: StringData = {
  // App Core
  'app.title': 'REDUZED',
  'app.tagline': 'AI Deal Finder',
  
  // Home Page
  'home.headline': 'Stop Overpaying for Your Prop Challenge',
  'home.subheading': 'AI scans prop firms & brokers to find the best deal.',
  
  // Navigation
  'navigation.deals': 'Deals',
  'navigation.my_deals': 'My Deals',
  'navigation.profile': 'Profile',
  'navigation.preferences': 'Preferences',
  'navigation.settings': 'Settings',
  'navigation.faq': 'FAQ',
  'navigation.admin_panel': 'Admin Panel',
  'navigation.sign_in': 'Sign In',
  
  // Categories
  'categories.all': 'All',
  'categories.cfd_prop': 'CFD Prop',
  'categories.futures_prop': 'Futures Prop',
  'categories.broker_bonuses': 'Broker Bonuses',
  
  // Buttons
  'buttons.save': 'Save',
  'buttons.go_to_offer': 'Go To Offer',
  'buttons.copy_code': 'Copy Code',
  'buttons.reset': 'Reset',
  'buttons.show_all_deals': 'Show All Deals',
  
  // Actions
  'actions.pass': 'Pass',
  'actions.save': 'Save',
  
  // Status
  'status.progress': 'Progress',
  'status.social_scanning': 'Social scanning',
  'status.real_time': 'Real time',
  'status.live_count': '15 live',
  
  // Notifications
  'notifications.saved_to_deals': 'saved to "My Deals"',
  'notifications.already_saved': 'Already in your deals folder!',
  'notifications.deal_dismissed': 'Deal dismissed',
  'notifications.all_deals_viewed': "You've seen all deals! Starting over...",
  'notifications.expired_cleared': 'Expired deals cleared!',
  'notifications.deal_removed': 'Deal removed from saved!',
  'notifications.logged_out': 'Logged out successfully',
  
  // Dialogs
  'dialogs.wait_dont_miss': "Wait, don't miss out!",
  'dialogs.save_instead': "You're about to dismiss this exclusive deal. Why not save it for later instead?",
  'dialogs.save_to_deals': 'Save to My Deals',
  'dialogs.go_back': 'Go Back',
  'dialogs.reject': 'Reject',
  'dialogs.rejected_disclaimer': "Rejected deals won't be shown again. You can always find more deals by browsing different categories.",
  
  // Empty States
  'empty_states.no_deals_found': 'No deals found',
  'empty_states.adjust_filters': 'Try adjusting your filters or check back later for new deals.',
  'empty_states.show_all_deals': 'Show All Deals',
  'empty_states.reset': 'Reset',
  
  // Forms & Inputs
  'forms.search_placeholder': 'Search deals...',
  'forms.filter_by_category': 'Filter by category',
  
  // Profile & Account
  'profile.welcome': 'Welcome back',
  'profile.sign_out': 'Sign Out',
  'profile.account_settings': 'Account Settings',
  
  // Deal Details
  'deals.valid_until': 'Valid until',
  'deals.terms_conditions': 'Terms & Conditions',
  'deals.merchant': 'Merchant',
  'deals.category': 'Category',
  'deals.discount': 'Discount',
  'deals.verification_badge': 'Verified',
  'deals.expires_today': 'Today',
  'deals.expired': 'Expired',
  
  // Admin
  'admin.dashboard': 'Dashboard',
  'admin.manage_deals': 'Manage Deals',
  'admin.manage_users': 'Manage Users',
  'admin.settings': 'Settings',
  'admin.analytics': 'Analytics',
  
  // Error Messages
  'errors.generic': 'Something went wrong. Please try again.',
  'errors.network': 'Network error. Please check your connection.',
  'errors.not_found': 'Content not found.',
  'errors.unauthorized': 'You need to sign in to continue.',
  
  // Loading States
  'loading.deals': 'Loading deals...',
  'loading.please_wait': 'Please wait...',
  'loading.saving': 'Saving...',
  
  // Success Messages
  'success.saved': 'Saved successfully',
  'success.updated': 'Updated successfully',
  'success.deleted': 'Deleted successfully'
};

interface LanguageConfig {
  enabledLanguages: string[];
  autoTranslate: boolean;
  glossary: string[];
  previewLanguage: string;
}

interface StringContextType {
  strings: StringData;
  updateString: (key: string, value: string) => void;
  updateStrings: (newStrings: Partial<StringData>) => void;
  resetString: (key: string) => void;
  resetAllStrings: () => void;
  getString: (key: string, fallback?: string) => string;
  languageConfig: LanguageConfig | null;
  updateLanguageConfig: (config: LanguageConfig) => void;
}

const StringContext = createContext<StringContextType | undefined>(undefined);

interface StringProviderProps {
  children: ReactNode;
  initialStrings?: Partial<StringData>;
}

export function StringProvider({ children, initialStrings = {} }: StringProviderProps) {
  const [strings, setStrings] = useState<StringData>({
    ...DEFAULT_STRINGS,
    ...initialStrings
  });
  
  const [languageConfig, setLanguageConfig] = useState<LanguageConfig | null>(null);

  // Load strings and language config from localStorage on mount
  useEffect(() => {
    // Load strings
    const savedStrings = localStorage.getItem('reduzed-strings');
    if (savedStrings) {
      try {
        const parsed = JSON.parse(savedStrings);
        setStrings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.warn('Failed to parse saved strings:', error);
      }
    }

    // Load language configuration
    const savedLanguageConfig = localStorage.getItem('reduzed-language-config');
    if (savedLanguageConfig) {
      try {
        const parsed = JSON.parse(savedLanguageConfig);
        setLanguageConfig(parsed);
      } catch (error) {
        console.warn('Failed to parse saved language config:', error);
      }
    }
  }, []);

  // Save strings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('reduzed-strings', JSON.stringify(strings));
  }, [strings]);

  // Save language config to localStorage when it changes
  useEffect(() => {
    if (languageConfig) {
      localStorage.setItem('reduzed-language-config', JSON.stringify(languageConfig));
    }
  }, [languageConfig]);

  const updateString = (key: string, value: string) => {
    setStrings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const updateStrings = (newStrings: Partial<StringData>) => {
    setStrings(prev => ({
      ...prev,
      ...newStrings
    }));
  };

  const resetString = (key: string) => {
    if (DEFAULT_STRINGS[key]) {
      setStrings(prev => ({
        ...prev,
        [key]: DEFAULT_STRINGS[key]
      }));
    }
  };

  const resetAllStrings = () => {
    setStrings({ ...DEFAULT_STRINGS });
  };

  const getString = (key: string, fallback?: string): string => {
    return strings[key] || fallback || key;
  };

  const updateLanguageConfig = (config: LanguageConfig) => {
    setLanguageConfig(config);
  };

  const value: StringContextType = {
    strings,
    updateString,
    updateStrings,
    resetString,
    resetAllStrings,
    getString,
    languageConfig,
    updateLanguageConfig
  };

  return (
    <StringContext.Provider value={value}>
      {children}
    </StringContext.Provider>
  );
}

// Hook to use strings in components
export function useStrings() {
  const context = useContext(StringContext);
  if (context === undefined) {
    throw new Error('useStrings must be used within a StringProvider');
  }
  return context;
}

// Convenience hook to get a specific string
export function useString(key: string, fallback?: string): string {
  const { getString } = useStrings();
  return getString(key, fallback);
}

// Convenience hook to get multiple strings at once
export function useStringMap(keys: string[]): Record<string, string> {
  const { getString } = useStrings();
  return keys.reduce((acc, key) => {
    acc[key] = getString(key);
    return acc;
  }, {} as Record<string, string>);
}

// Higher-order component to inject strings as props
export function withStrings<P extends object>(
  Component: React.ComponentType<P & { strings: StringData }>
) {
  return function WrappedComponent(props: P) {
    const { strings } = useStrings();
    return <Component {...props} strings={strings} />;
  };
}

// Utility function for string interpolation
export function interpolateString(template: string, variables: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return variables[key]?.toString() || match;
  });
}

// Hook for string interpolation
export function useInterpolatedString(key: string, variables: Record<string, string | number>, fallback?: string): string {
  const { getString } = useStrings();
  const template = getString(key, fallback);
  return interpolateString(template, variables);
}