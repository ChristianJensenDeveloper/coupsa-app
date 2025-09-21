import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { ArrowLeft, Cookie, Shield, Settings, BarChart3, Target, Trash2, Download, Info } from 'lucide-react';
import { CookiePreferences, getCookieConsent, clearCookieConsent } from './CookieConsent';
import { useCookies } from './CookieContext';
import { toast } from 'sonner@2.0.3';

interface CookieSettingsProps {
  onBack: () => void;
}

const COOKIE_CATEGORIES = {
  necessary: {
    name: 'Strictly Necessary',
    description: 'Essential for the website to function properly. These cookies cannot be disabled as they are required for basic site functionality.',
    icon: Shield,
    required: true,
    details: [
      'Session management and user authentication',
      'Security tokens and CSRF protection',  
      'Shopping cart and form data',
      'Basic site functionality'
    ],
    examples: [
      'auth_token', 'session_id', 'csrf_token', 'cart_data'
    ]
  },
  functional: {
    name: 'Functional',
    description: 'Enable enhanced functionality and personalization features to improve your experience.',
    icon: Settings,
    required: false,
    details: [
      'Remember your language and region preferences',
      'Store your theme and display settings',
      'Save your notification preferences',
      'Remember your deal filters and preferences'
    ],
    examples: [
      'language', 'theme', 'currency', 'timezone', 'deal_preferences'
    ]
  },
  analytics: {
    name: 'Analytics & Performance',
    description: 'Help us understand how visitors interact with our website to improve performance and user experience.',
    icon: BarChart3,
    required: false,
    details: [
      'Track page views and user interactions',
      'Monitor website performance and errors',
      'Analyze user behavior to improve features',
      'Generate anonymized usage statistics'
    ],
    examples: [
      '_ga', '_gid', '_gat', 'performance_metrics', 'error_tracking'
    ]
  },
  marketing: {
    name: 'Marketing & Advertising',
    description: 'Used to track visitors across websites and display relevant advertisements and content.',
    icon: Target,
    required: false,
    details: [
      'Show relevant deals and offers',
      'Track affiliate link performance',
      'Display personalized content',
      'Retarget visitors with relevant ads'
    ],
    examples: [
      '_fbp', '_fbc', 'google_ads', 'affiliate_tracking', 'retargeting'
    ]
  },
  preferences: {
    name: 'Preference & Personalization',
    description: 'Remember your choices and provide personalized features tailored to your interests.',
    icon: Cookie,
    required: false,
    details: [
      'Remember your saved deals and favorites',
      'Personalize deal recommendations',
      'Store your notification settings',
      'Remember your interaction preferences'
    ],
    examples: [
      'saved_deals', 'user_preferences', 'recommendations', 'notifications'
    ]
  }
};

export function CookieSettings({ onBack }: CookieSettingsProps) {
  const { preferences, updatePreferences, clearAllCookies } = useCookies();
  const [localPreferences, setLocalPreferences] = useState<CookiePreferences>({
    necessary: true,
    functional: false,
    analytics: false,
    marketing: false,
    preferences: false
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [showDetails, setShowDetails] = useState<string | null>(null);

  useEffect(() => {
    const current = preferences || getCookieConsent() || {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
      preferences: false
    };
    setLocalPreferences(current);
  }, [preferences]);

  const handleToggle = (category: keyof CookiePreferences) => {
    if (category === 'necessary') return;
    
    const newPreferences = {
      ...localPreferences,
      [category]: !localPreferences[category]
    };
    
    setLocalPreferences(newPreferences);
    setHasChanges(true);
  };

  const handleSave = () => {
    updatePreferences(localPreferences);
    setHasChanges(false);
    toast.success('Cookie preferences saved successfully');
  };

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
      preferences: true
    };
    setLocalPreferences(allAccepted);
    updatePreferences(allAccepted);
    setHasChanges(false);
    toast.success('All cookies accepted');
  };

  const handleRejectOptional = () => {
    const onlyNecessary = {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
      preferences: false
    };
    setLocalPreferences(onlyNecessary);
    updatePreferences(onlyNecessary);
    setHasChanges(false);
    toast.success('Optional cookies rejected');
  };

  const handleClearAll = () => {
    clearAllCookies();
    clearCookieConsent();
    setLocalPreferences({
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
      preferences: false
    });
    setHasChanges(false);
    toast.success('All non-essential cookies cleared');
  };

  const exportCookieData = () => {
    const data = {
      preferences: localPreferences,
      timestamp: new Date().toISOString(),
      domain: window.location.hostname,
      userAgent: navigator.userAgent
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `koocao-cookie-preferences-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Cookie preferences exported');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-blue-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      <div className="container mx-auto px-4 sm:px-6 py-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button onClick={onBack} variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Cookie Settings</h1>
            <p className="text-slate-600 dark:text-slate-400">Manage your cookie preferences and privacy settings</p>
          </div>
        </div>

        {/* Overview Card */}
        <Card className="p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <Cookie className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Your Privacy Control
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Choose which cookies and tracking technologies you're comfortable with. 
                You can change these settings at any time.
              </p>
              
              {/* Quick Actions */}
              <div className="flex flex-wrap gap-3">
                <Button onClick={handleAcceptAll} className="bg-blue-600 hover:bg-blue-700">
                  Accept All
                </Button>
                <Button onClick={handleRejectOptional} variant="outline">
                  Reject Optional
                </Button>
                <Button onClick={handleClearAll} variant="outline" className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All
                </Button>
                <Button onClick={exportCookieData} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Cookie Categories */}
        <div className="space-y-4 mb-6">
          {Object.entries(COOKIE_CATEGORIES).map(([key, category]) => {
            const IconComponent = category.icon;
            const isEnabled = localPreferences[key as keyof CookiePreferences];
            const isExpanded = showDetails === key;
            
            return (
              <Card key={key} className="overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      isEnabled 
                        ? 'bg-blue-100 dark:bg-blue-900/30' 
                        : 'bg-slate-100 dark:bg-slate-800'
                    }`}>
                      <IconComponent className={`w-6 h-6 ${
                        isEnabled 
                          ? 'text-blue-600 dark:text-blue-400' 
                          : 'text-slate-400'
                      }`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                            {category.name}
                          </h3>
                          {category.required && (
                            <Badge variant="secondary">Required</Badge>
                          )}
                          {isEnabled && !category.required && (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                              Active
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => setShowDetails(isExpanded ? null : key)}
                            variant="ghost"
                            size="sm"
                          >
                            <Info className="w-4 h-4" />
                          </Button>
                          <Switch
                            checked={isEnabled}
                            onCheckedChange={() => handleToggle(key as keyof CookiePreferences)}
                            disabled={category.required}
                          />
                        </div>
                      </div>
                      
                      <p className="text-slate-600 dark:text-slate-400 mb-4">
                        {category.description}
                      </p>

                      {isExpanded && (
                        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                          <div>
                            <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">
                              What this includes:
                            </h4>
                            <ul className="space-y-1">
                              {category.details.map((detail, index) => (
                                <li key={index} className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2">
                                  <span className="w-1 h-1 bg-slate-400 rounded-full mt-2 flex-shrink-0"></span>
                                  {detail}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">
                              Example cookies:
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {category.examples.map((example) => (
                                <Badge key={example} variant="outline" className="text-xs font-mono">
                                  {example}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Save Changes */}
        {hasChanges && (
          <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-blue-900 dark:text-blue-100">
                  You have unsaved changes
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Don't forget to save your cookie preferences
                </p>
              </div>
              <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                Save Changes
              </Button>
            </div>
          </Card>
        )}

        {/* Privacy Information */}
        <Card className="p-6 mt-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">
            Your Privacy Rights
          </h3>
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Under GDPR and other privacy regulations, you have the following rights regarding your data:
            </p>
            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
              <li><strong>Right to Access:</strong> You can request a copy of the personal data we hold about you</li>
              <li><strong>Right to Rectification:</strong> You can ask us to correct any inaccurate data</li>
              <li><strong>Right to Erasure:</strong> You can request deletion of your personal data</li>
              <li><strong>Right to Data Portability:</strong> You can request your data in a portable format</li>
              <li><strong>Right to Withdraw Consent:</strong> You can withdraw consent for optional cookies at any time</li>
            </ul>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-4">
              For questions about our privacy practices or to exercise your rights, contact us at{' '}
              <a href="mailto:privacy@koocao.com" className="text-blue-600 hover:underline">
                privacy@koocao.com
              </a>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}