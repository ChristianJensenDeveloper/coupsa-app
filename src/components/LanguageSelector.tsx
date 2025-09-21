import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Globe } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useStrings } from './useStrings';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  rtl?: boolean;
}

// Complete list of all supported languages (same as in LanguageSetupMVP)
const ALL_AVAILABLE_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)', nativeName: 'Português (Brasil)', flag: '🇧🇷' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', flag: '🇬🇷' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština', flag: '🇨🇿' },
  { code: 'zh-CN', name: 'Simplified Chinese', nativeName: '简体中文', flag: '🇨🇳' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', rtl: true },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' }
];

interface LanguageSelectorProps {
  className?: string;
  compact?: boolean;
}

export function LanguageSelector({ className = '', compact = false }: LanguageSelectorProps) {
  const { languageConfig } = useStrings();
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [availableLanguages, setAvailableLanguages] = useState<Language[]>([]);

  // Load enabled languages from admin configuration
  useEffect(() => {
    if (languageConfig?.enabledLanguages) {
      // Filter to only show enabled languages
      const enabledLanguages = ALL_AVAILABLE_LANGUAGES.filter(lang => 
        languageConfig.enabledLanguages.includes(lang.code)
      );
      setAvailableLanguages(enabledLanguages);
    } else {
      // Fallback to English if no config is loaded
      setAvailableLanguages(ALL_AVAILABLE_LANGUAGES.filter(lang => lang.code === 'en'));
    }
  }, [languageConfig]);

  // Load saved language preference on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('coupza-user-language');
    if (savedLanguage && availableLanguages.some(lang => lang.code === savedLanguage)) {
      setSelectedLanguage(savedLanguage);
    }
  }, [availableLanguages]);

  const handleLanguageChange = (languageCode: string) => {
    const language = availableLanguages.find(lang => lang.code === languageCode);
    setSelectedLanguage(languageCode);
    
    if (language) {
      // Save to localStorage
      localStorage.setItem('coupza-user-language', languageCode);
      
      toast.success(`Language changed to ${language.name}`);
      
      // Update document direction for RTL languages
      if (language.rtl) {
        document.documentElement.dir = 'rtl';
      } else {
        document.documentElement.dir = 'ltr';
      }
      
      // In a real app, you would:
      // 1. Update the global app language state
      // 2. Reload UI strings from the appropriate locale
      // 3. Re-fetch localized content
      console.log(`Language changed to: ${language.code} (${language.name})`);
    }
  };

  if (compact) {
    return (
      <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
        <SelectTrigger className={`w-40 ${className}`}>
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            <SelectValue />
          </div>
        </SelectTrigger>
        <SelectContent className="rounded-xl border-0 shadow-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
          {availableLanguages.map(lang => (
            <SelectItem key={lang.code} value={lang.code}>
              <div className="flex items-center gap-2">
                <span className="text-lg">{lang.flag}</span>
                <span className="text-xs uppercase font-mono">{lang.code}</span>
                <span>{lang.nativeName}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  // Show loading state if languages are not loaded yet
  if (availableLanguages.length === 0) {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-blue-500" />
          <Label className="font-medium">Language</Label>
        </div>
        <div className="w-full h-10 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse"></div>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Loading available languages...
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-2">
        <Globe className="w-5 h-5 text-blue-500" />
        <Label className="font-medium">Language</Label>
      </div>
      
      <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <SelectValue placeholder="Select your language" />
        </SelectTrigger>
        <SelectContent className="rounded-xl border-0 shadow-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
          {availableLanguages.map(lang => (
            <SelectItem key={lang.code} value={lang.code} className="rounded-lg">
              <div className="flex items-center gap-3 py-1">
                <span className="text-xl">{lang.flag}</span>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{lang.name}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-mono bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                      {lang.code}
                    </span>
                  </div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">{lang.nativeName}</span>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <div className="space-y-2">
        <p className="text-xs text-slate-600 dark:text-slate-400">
          We'll show UI and deals in your selected language when available.
        </p>
        {availableLanguages.length > 1 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-700/30">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              <strong>{availableLanguages.length} languages available</strong> - configured by admin. 
              {languageConfig?.autoTranslate && ' Auto-translation is enabled for new content.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}