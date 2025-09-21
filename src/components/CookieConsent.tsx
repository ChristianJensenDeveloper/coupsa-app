import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Switch } from './ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Badge } from './ui/badge';
import { Cookie, Settings, Shield, BarChart3, Target, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface CookiePreferences {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

interface CookieConsentProps {
  onConsentChange?: (preferences: CookiePreferences) => void;
}

const COOKIE_CATEGORIES = {
  necessary: {
    name: 'Strictly Necessary',
    description: 'Essential for the website to function properly. Cannot be disabled.',
    icon: Shield,
    required: true,
    cookies: [
      'Authentication tokens',
      'Session management',
      'Security cookies',
      'CSRF protection'
    ]
  },
  functional: {
    name: 'Functional',
    description: 'Enable enhanced functionality and personalization.',
    icon: Settings,
    required: false,
    cookies: [
      'Language preferences',
      'Theme settings',
      'User preferences',
      'Feature toggles'
    ]
  },
  analytics: {
    name: 'Analytics',
    description: 'Help us understand how visitors interact with our website.',
    icon: BarChart3,
    required: false,
    cookies: [
      'Google Analytics',
      'Page view tracking',
      'User behavior analysis',
      'Performance monitoring'
    ]
  },
  marketing: {
    name: 'Marketing',
    description: 'Used to track visitors and display relevant ads.',
    icon: Target,
    required: false,
    cookies: [
      'Advertising cookies',
      'Social media pixels',
      'Retargeting',
      'Affiliate tracking'
    ]
  },
  preferences: {
    name: 'Preference',
    description: 'Remember your choices and provide personalized features.',
    icon: Cookie,
    required: false,
    cookies: [
      'Deal preferences',
      'Notification settings',
      'Display preferences',
      'Personalization data'
    ]
  }
};

const STORAGE_KEY = 'koocao_cookie_consent';
const CONSENT_VERSION = '1.0';

export function CookieConsent({ onConsentChange }: CookieConsentProps) {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    functional: false,
    analytics: false,
    marketing: false,
    preferences: false
  });
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    // Check if user has already given consent
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const { preferences: storedPrefs, version, timestamp } = JSON.parse(stored);
        
        // Check if consent is still valid (within 12 months)
        const twelveMonthsAgo = Date.now() - (365 * 24 * 60 * 60 * 1000);
        if (version === CONSENT_VERSION && timestamp > twelveMonthsAgo) {
          setPreferences(storedPrefs);
          setHasInteracted(true);
          onConsentChange?.(storedPrefs);
          return;
        }
      } catch (error) {
        console.warn('Invalid cookie consent data:', error);
      }
    }
    
    // Show banner after a brief delay for better UX
    const timer = setTimeout(() => setShowBanner(true), 1000);
    return () => clearTimeout(timer);
  }, [onConsentChange]);

  const savePreferences = (newPreferences: CookiePreferences) => {
    const consentData = {
      preferences: newPreferences,
      version: CONSENT_VERSION,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.hostname
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consentData));
    setPreferences(newPreferences);
    setHasInteracted(true);
    onConsentChange?.(newPreferences);
  };

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
      preferences: true
    };
    savePreferences(allAccepted);
    setShowBanner(false);
  };

  const handleRejectOptional = () => {
    const onlyNecessary = {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
      preferences: false
    };
    savePreferences(onlyNecessary);
    setShowBanner(false);
  };

  const handleSaveCustom = () => {
    savePreferences(preferences);
    setShowSettings(false);
    setShowBanner(false);
  };

  const handleCategoryToggle = (category: keyof CookiePreferences) => {
    if (category === 'necessary') return; // Cannot disable necessary cookies
    
    setPreferences(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // Don't render if user has already interacted and banner is hidden
  if (hasInteracted && !showBanner && !showSettings) {
    return null;
  }

  return (
    <>
      {/* Cookie Banner */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[100] p-4"
          >
            <Card className="max-w-4xl mx-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-slate-200/50 dark:border-slate-700/50 shadow-2xl">
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                      <Cookie className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                      We value your privacy
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                      We use cookies to enhance your browsing experience, serve personalized content, 
                      and analyze our traffic. Some cookies are essential for the website to function, 
                      while others help us improve your experience and show you relevant deals.
                    </p>
                    
                    <div className="flex flex-wrap gap-3">
                      <Button 
                        onClick={handleAcceptAll}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Accept All Cookies
                      </Button>
                      <Button 
                        onClick={handleRejectOptional}
                        variant="outline"
                        className="border-slate-300 dark:border-slate-600"
                      >
                        Reject Optional
                      </Button>
                      <Button 
                        onClick={() => setShowSettings(true)}
                        variant="ghost"
                        className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Customize
                      </Button>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => setShowBanner(false)}
                    variant="ghost"
                    size="sm"
                    className="flex-shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cookie Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Cookie className="w-5 h-5 text-blue-600" />
              Cookie Preferences
            </DialogTitle>
            <DialogDescription>
              Choose which cookies you're comfortable with. You can change these settings at any time.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {Object.entries(COOKIE_CATEGORIES).map(([key, category]) => {
              const IconComponent = category.icon;
              const isEnabled = preferences[key as keyof CookiePreferences];
              
              return (
                <div key={key} className="flex items-start gap-4 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="flex-shrink-0">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isEnabled 
                        ? 'bg-blue-100 dark:bg-blue-900/30' 
                        : 'bg-slate-100 dark:bg-slate-800'
                    }`}>
                      <IconComponent className={`w-5 h-5 ${
                        isEnabled 
                          ? 'text-blue-600 dark:text-blue-400' 
                          : 'text-slate-400'
                      }`} />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-slate-900 dark:text-slate-100">
                          {category.name}
                        </h4>
                        {category.required && (
                          <Badge variant="secondary" className="text-xs">
                            Required
                          </Badge>
                        )}
                      </div>
                      <Switch
                        checked={isEnabled}
                        onCheckedChange={() => handleCategoryToggle(key as keyof CookiePreferences)}
                        disabled={category.required}
                      />
                    </div>
                    
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                      {category.description}
                    </p>
                    
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                        Examples:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {category.cookies.map((cookie) => (
                          <Badge key={cookie} variant="outline" className="text-xs">
                            {cookie}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-1">
                  Your Data Rights
                </h4>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  You have the right to access, update, or delete your personal data at any time. 
                  You can also withdraw consent for optional cookies through your browser settings 
                  or by contacting us directly.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button 
              onClick={() => setShowSettings(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveCustom}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Save Preferences
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Cookie management utilities
export const getCookieConsent = (): CookiePreferences | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const { preferences, version, timestamp } = JSON.parse(stored);
      
      // Check if consent is still valid (within 12 months)
      const twelveMonthsAgo = Date.now() - (365 * 24 * 60 * 60 * 1000);
      if (version === CONSENT_VERSION && timestamp > twelveMonthsAgo) {
        return preferences;
      }
    }
  } catch (error) {
    console.warn('Error reading cookie consent:', error);
  }
  return null;
};

export const hasConsentFor = (category: keyof CookiePreferences): boolean => {
  const consent = getCookieConsent();
  return consent ? consent[category] : false;
};

export const clearCookieConsent = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};