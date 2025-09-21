import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { Settings2, Globe, Download, Trash2, Shield, Eye, Cookie, MapPin, Mail, ExternalLink, AlertTriangle, Bell, MessageSquare, Smartphone } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { LanguageSelector } from "./LanguageSelector";
import { useStrings } from "./useStrings";

interface SettingsProps {
  user?: {
    consents?: {
      emailMarketing?: boolean;
      smsMarketing?: boolean;
      whatsappMarketing?: boolean;
      pushNotifications?: boolean;
    };
    notificationPreferences?: {
      smsNotifications?: boolean;
      whatsappNotifications?: boolean;
      updatedAt?: string;
    };
  };
  onNavigateToPage?: (page: 'terms' | 'privacy') => void;
}

export function Settings({ user, onNavigateToPage }: SettingsProps) {
  const { languageConfig } = useStrings();
  const [language, setLanguage] = useState("English");
  const [analytics, setAnalytics] = useState(true);
  
  // Privacy settings state - initialize from user data if available
  const [emailMarketing, setEmailMarketing] = useState(user?.consents?.emailMarketing ?? false);
  const [cookiesAnalytics, setCookiesAnalytics] = useState(true);
  const [personalization, setPersonalization] = useState(true);
  
  // Notification settings state
  const [smsNotifications, setSmsNotifications] = useState(user?.notificationPreferences?.smsNotifications ?? false);
  const [whatsappNotifications, setWhatsappNotifications] = useState(user?.notificationPreferences?.whatsappNotifications ?? false);
  const [region, setRegion] = useState("United States");
  
  // Dialog states
  const [isDeleteAccountDialogOpen, setIsDeleteAccountDialogOpen] = useState(false);
  const [isCookiePreferencesOpen, setIsCookiePreferencesOpen] = useState(false);

  const handleClearData = () => {
    toast.success("App data cleared successfully");
  };

  const handleExportData = () => {
    // Simulate data export
    const exportData = {
      profile: {
        email: "user@example.com",
        region: region,
        joinedAt: "2024-12-01T00:00:00Z"
      },
      consents: {
        emailMarketing: emailMarketing,
        cookiesAnalytics: cookiesAnalytics,
        personalization: personalization
      },
      notificationPreferences: {
        smsNotifications: smsNotifications,
        whatsappNotifications: whatsappNotifications,
        updatedAt: new Date().toISOString()
      },
      activityLogs: [
        { action: "viewed_deal", timestamp: "2025-01-02T10:30:00Z", dealId: "ftmo-30-off" },
        { action: "saved_deal", timestamp: "2025-01-02T10:35:00Z", dealId: "topstep-free-trial" }
      ]
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'koocao-user-data.json';
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success("Your data has been downloaded");
  };

  const handleDeleteAccount = () => {
    // Simulate account deletion
    toast.success("Account deletion request submitted. You will receive a confirmation email.");
    setIsDeleteAccountDialogOpen(false);
  };

  const handleOpenPrivacyPolicy = () => {
    if (onNavigateToPage) {
      onNavigateToPage('privacy');
    } else {
      window.open('https://koocao.com/privacy-policy', '_blank');
    }
  };

  const handleOpenTermsOfService = () => {
    if (onNavigateToPage) {
      onNavigateToPage('terms');
    } else {
      window.open('https://koocao.com/terms-of-service', '_blank');
    }
  };

  const handleOpenCookiePolicy = () => {
    window.open('https://koocao.com/cookie-policy', '_blank');
  };

  const handleContactPrivacySupport = () => {
    window.open('mailto:privacy@koocao.com', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 -m-3 p-3 sm:p-4">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-5">
        {/* Header */}
        <div className="text-center mb-4 sm:mb-6">
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-slate-700/30 shadow-lg p-4 sm:p-6">
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-slate-900 via-blue-500 to-blue-500 dark:from-white dark:via-blue-400 dark:to-blue-400 bg-clip-text text-transparent mb-1">
              Settings
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Customize your app experience and manage your data
            </p>
          </div>
        </div>

        {/* Language Settings */}
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-slate-700/30 shadow-lg p-6">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-2">
              <Globe className="w-5 h-5 text-blue-500 dark:text-blue-400" />
              Language & Localization
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Select your preferred language for the app interface
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
              <LanguageSelector />
            </div>

            {/* Language Configuration Status */}
            {languageConfig && (
              <div className="space-y-3">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700/30">
                  <div className="flex items-start gap-3">
                    <Globe className="w-5 h-5 text-blue-500 dark:text-blue-400 mt-0.5" />
                    <div className="space-y-2 text-sm">
                      <p className="text-blue-800 dark:text-blue-200 font-medium">
                        Platform Language Support
                      </p>
                      <div className="space-y-1 text-blue-700 dark:text-blue-300">
                        <p>• <strong>{languageConfig.enabledLanguages?.length || 1} languages</strong> enabled by admin</p>
                        <p>• Auto-translate: {languageConfig.autoTranslate ? 'Enabled' : 'Disabled'}</p>
                        {languageConfig.glossary && languageConfig.glossary.length > 0 && (
                          <p>• {languageConfig.glossary.length} protected terms in glossary</p>
                        )}
                      </div>
                      <p className="text-xs text-blue-600 dark:text-blue-400 italic">
                        Language options are managed by the platform administrator.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Available Languages Preview */}
                {languageConfig.enabledLanguages && languageConfig.enabledLanguages.length > 1 && (
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-3">
                      Available Languages ({languageConfig.enabledLanguages.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {languageConfig.enabledLanguages.map(langCode => {
                        // Find the language info from our available languages
                        const languageFlags: Record<string, string> = {
                          'en': '🇺🇸 English',
                          'es': '🇪🇸 Español', 
                          'pt-BR': '🇧🇷 Português',
                          'fr': '🇫🇷 Français',
                          'de': '🇩🇪 Deutsch',
                          'it': '🇮🇹 Italiano',
                          'pl': '🇵🇱 Polski',
                          'nl': '🇳🇱 Nederlands',
                          'el': '🇬🇷 Ελληνικά',
                          'cs': '🇨🇿 Čeština',
                          'zh-CN': '🇨🇳 简体中文',
                          'hi': '🇮🇳 हिन्दी',
                          'ar': '🇸🇦 العربية',
                          'ru': '🇷🇺 Русский',
                          'tr': '🇹🇷 Türkçe'
                        };
                        
                        return (
                          <Badge 
                            key={langCode}
                            variant="secondary" 
                            className="text-xs bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300"
                          >
                            {languageFlags[langCode] || `${langCode.toUpperCase()}`}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Notifications Settings */}
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-slate-700/30 shadow-lg p-6">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-2">
              <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Notifications
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Control how you receive important updates from KOOCAO
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
              <div className="flex items-center gap-3">
                <Smartphone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <div>
                  <Label className="text-slate-900 dark:text-slate-100">SMS Notifications</Label>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Saved deal reminders & new deal alerts via SMS</p>
                </div>
              </div>
              <Switch
                checked={smsNotifications}
                onCheckedChange={(checked) => {
                  setSmsNotifications(checked);
                  toast.success(`SMS notifications ${checked ? 'enabled' : 'disabled'}`);
                }}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-4 h-4 text-green-600 dark:text-green-400" />
                <div>
                  <Label className="text-slate-900 dark:text-slate-100">WhatsApp Notifications</Label>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Exclusive deals & account updates via WhatsApp</p>
                </div>
              </div>
              <Switch
                checked={whatsappNotifications}
                onCheckedChange={(checked) => {
                  setWhatsappNotifications(checked);
                  toast.success(`WhatsApp notifications ${checked ? 'enabled' : 'disabled'}`);
                }}
              />
            </div>
            
            {/* Helper text */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700/30">
              <div className="flex items-start gap-3">
                <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="space-y-2 text-sm">
                  <p className="text-blue-800 dark:text-blue-200 font-medium">
                    We'll only send important updates:
                  </p>
                  <ul className="text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• Saved deal expiry reminders (10 minutes before)</li>
                    <li>• New deal alerts for your preferred categories</li>
                    <li>• Flash sales and limited-time offers</li>
                  </ul>
                  <p className="text-xs text-blue-600 dark:text-blue-400 italic">
                    You can opt out anytime. Standard messaging rates may apply.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-slate-700/30 shadow-lg p-6">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Privacy
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Control your data and privacy preferences
            </p>
          </div>
          
          <div className="space-y-6">
            {/* Data Rights Actions */}
            <div className="space-y-3">
              <h4 className="font-medium text-slate-900 dark:text-slate-100">Data Rights</h4>
              
              <Button 
                variant="outline" 
                className="w-full justify-start rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 h-12" 
                onClick={handleExportData}
              >
                <Download className="w-4 h-4 mr-2" />
                Download My Data
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl border-red-200 dark:border-red-800 h-12"
                onClick={() => setIsDeleteAccountDialogOpen(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete My Account & Data
              </Button>
            </div>

            {/* Manage Consents */}
            <div className="space-y-4">
              <h4 className="font-medium text-slate-900 dark:text-slate-100">Manage Consents</h4>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    <div>
                      <div className="flex items-center gap-2">
                        <Label className="text-slate-900 dark:text-slate-100">Email Marketing</Label>
                        {user?.consents?.emailMarketing && (
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300">
                            Signup Consent
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Receive deal alerts and newsletters</p>
                    </div>
                  </div>
                  <Switch
                    checked={emailMarketing}
                    onCheckedChange={setEmailMarketing}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
                  <div className="flex items-center gap-3">
                    <Eye className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    <div>
                      <Label className="text-slate-900 dark:text-slate-100">Cookies & Analytics</Label>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Help us improve the app</p>
                    </div>
                  </div>
                  <Switch
                    checked={cookiesAnalytics}
                    onCheckedChange={setCookiesAnalytics}
                  />
                </div>


              </div>
            </div>

            {/* Personalization & Region */}
            <div className="space-y-4">
              <h4 className="font-medium text-slate-900 dark:text-slate-100">Personalization</h4>
              
              <div className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  <div>
                    <Label className="text-slate-900 dark:text-slate-100">Personalized Deals</Label>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Use region & activity to personalize offers</p>
                  </div>
                </div>
                <Switch
                  checked={personalization}
                  onCheckedChange={setPersonalization}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  <div>
                    <Label className="text-slate-900 dark:text-slate-100">Region</Label>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Used to show relevant partner offers available in your region</p>
                  </div>
                </div>
                <Select value={region} onValueChange={setRegion}>
                  <SelectTrigger className="w-40 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-0 shadow-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
                    <SelectItem value="United States">United States</SelectItem>
                    <SelectItem value="Canada">Canada</SelectItem>
                    <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                    <SelectItem value="Germany">Germany</SelectItem>
                    <SelectItem value="France">France</SelectItem>
                    <SelectItem value="Australia">Australia</SelectItem>
                    <SelectItem value="Singapore">Singapore</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Cookie Preferences & Links */}
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 h-12"
                onClick={() => setIsCookiePreferencesOpen(true)}
              >
                <Cookie className="w-4 h-4 mr-2" />
                Cookie Preferences
              </Button>
            </div>

            {/* Signup Consent Summary */}
            {user?.consents && (
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <h5 className="font-medium text-slate-900 dark:text-slate-100 mb-3">Signup Consents</h5>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700/30">
                  <div className="space-y-2 text-sm">
                    <p className="text-blue-800 dark:text-blue-200 font-medium">
                      During signup, you consented to receive:
                    </p>
                    <ul className="text-blue-700 dark:text-blue-300 space-y-1 ml-4">
                      {user.consents.emailMarketing && <li>• Email newsletters and deal alerts</li>}
                      {user.consents.smsMarketing && <li>• SMS urgent notifications and updates</li>}
                      {user.consents.whatsappMarketing && <li>• WhatsApp exclusive deals and account updates</li>}
                      {user.consents.pushNotifications && <li>• Push notifications and promotional materials</li>}
                    </ul>
                    {user.consents.consentDate && (
                      <p className="text-xs text-blue-600 dark:text-blue-400 italic mt-2">
                        Consented on: {new Date(user.consents.consentDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Informational Links */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="grid grid-cols-1 gap-2 text-sm">
                <Button 
                  variant="ghost" 
                  className="justify-start h-8 px-0 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
                  onClick={handleOpenPrivacyPolicy}
                >
                  Privacy Policy
                  <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
                <Button 
                  variant="ghost" 
                  className="justify-start h-8 px-0 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
                  onClick={handleOpenTermsOfService}
                >
                  Terms of Service
                  <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
                <Button 
                  variant="ghost" 
                  className="justify-start h-8 px-0 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
                  onClick={handleOpenCookiePolicy}
                >
                  Cookie Policy
                  <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
                <Button 
                  variant="ghost" 
                  className="justify-start h-8 px-0 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
                  onClick={handleContactPrivacySupport}
                >
                  Contact Privacy Support
                  <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* General Settings */}
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-slate-700/30 shadow-lg p-6">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-2">
              <Settings2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              General
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              App preferences and data management
            </p>
          </div>
          <div className="space-y-4">
            <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl border-red-200 dark:border-red-800 h-12" onClick={handleClearData}>
              <Trash2 className="w-4 h-4 mr-2" />
              Clear App Data
            </Button>
          </div>
        </div>

        {/* App Information */}
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-slate-700/30 shadow-lg p-6">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              App Information
            </h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
              <span className="text-sm text-slate-600 dark:text-slate-400">Version</span>
              <Badge variant="secondary" className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300">1.0.0</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
              <span className="text-sm text-slate-600 dark:text-slate-400">Build</span>
              <Badge variant="outline" className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300">2025.01.001</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
              <span className="text-sm text-slate-600 dark:text-slate-400">Last Updated</span>
              <span className="text-sm text-slate-900 dark:text-slate-100">January 2, 2025</span>
            </div>
          </div>
        </div>

        {/* Legal Links */}
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 h-12" onClick={handleOpenPrivacyPolicy}>
            Privacy Policy
          </Button>
          <Button variant="outline" className="rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 h-12" onClick={handleOpenTermsOfService}>
            Terms of Service
          </Button>
        </div>
      </div>

      {/* Delete Account Confirmation Dialog */}
      <AlertDialog open={isDeleteAccountDialogOpen} onOpenChange={setIsDeleteAccountDialogOpen}>
        <AlertDialogContent className="max-w-lg border-0 shadow-2xl bg-white dark:bg-slate-900 rounded-3xl overflow-hidden p-0">
          <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 px-8 pt-8 pb-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-red-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
            <AlertDialogTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Delete Account & Data
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 dark:text-slate-400 text-base leading-relaxed">
              This action is permanent and cannot be undone. All your data, saved deals, and account information will be completely removed.
            </AlertDialogDescription>
          </div>
          
          <div className="px-8 pb-8">
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 mb-6">
              <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">What will be deleted:</h4>
              <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                <li>• Your profile and account information</li>
                <li>• All saved deals and preferences</li>
                <li>• Activity logs and analytics data</li>
                <li>• All consent records</li>
              </ul>
            </div>

            <AlertDialogFooter className="flex-col gap-3 sm:flex-row">
              <AlertDialogCancel 
                className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold py-3 rounded-2xl border-0 transition-all duration-200"
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAccount}
                className="w-full sm:w-auto bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 border-0"
              >
                Delete My Account
              </AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cookie Preferences Dialog */}
      <Dialog open={isCookiePreferencesOpen} onOpenChange={setIsCookiePreferencesOpen}>
        <DialogContent className="max-w-2xl rounded-2xl border-0 shadow-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent">
              Cookie Preferences
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              Manage how we use cookies and similar technologies to improve your experience.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 max-h-[60vh] overflow-y-auto">
            {/* Essential Cookies */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-slate-100">Essential Cookies</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Required for the app to function properly</p>
                </div>
                <Switch checked={true} disabled />
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                These cookies are necessary for the website to function and cannot be switched off.
              </div>
            </div>

            {/* Analytics Cookies */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-slate-100">Analytics Cookies</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Help us understand how you use the app</p>
                </div>
                <Switch 
                  checked={cookiesAnalytics} 
                  onCheckedChange={setCookiesAnalytics}
                />
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                Used to collect anonymous information about your usage to help us improve the app.
              </div>
            </div>

            {/* Marketing Cookies */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-slate-100">Marketing Cookies</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Personalize ads and content</p>
                </div>
                <Switch 
                  checked={personalization} 
                  onCheckedChange={setPersonalization}
                />
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                Used to deliver more relevant deals and offers based on your preferences.
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => setIsCookiePreferencesOpen(false)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg border-0 rounded-xl"
            >
              Save Preferences
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}