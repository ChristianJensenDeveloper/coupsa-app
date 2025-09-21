import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { toast } from 'sonner@2.0.3';
import { Languages, Globe, Save, HelpCircle, Eye } from 'lucide-react';
import { useStrings } from './useStrings';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  isDefault?: boolean;
}

const AVAILABLE_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', isDefault: true },
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
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' }
];

interface LanguageConfig {
  enabledLanguages: string[];
  autoTranslate: boolean;
  glossary: string[];
  previewLanguage: string;
}

const DEFAULT_CONFIG: LanguageConfig = {
  enabledLanguages: ['en'],
  autoTranslate: true,
  glossary: [
    'REDUZED', 'Prop challenge', 'Broker', 'FTMO', 'TopStep', 'Apex', 'SurgeTrader', 
    'IC Markets', 'Pepperstone', 'XM', 'eToro', 'Plus500', 'Capital.com', 'AXI', 
    'OANDA', 'Forex', 'CFD', 'Futures', 'MT4', 'MT5', 'CTrader'
  ],
  previewLanguage: 'en'
};

export function LanguageSetupMVP() {
  const { languageConfig, updateLanguageConfig } = useStrings();
  const [enabledLanguages, setEnabledLanguages] = useState<string[]>(['en']); // English is default and always enabled
  const [autoTranslate, setAutoTranslate] = useState(true);
  const [glossary, setGlossary] = useState('REDUZED\nProp challenge\nBroker\nFTMO\nTopStep\nApex\nSurgeTrader\nIC Markets\nPepperstone\nXM\neToro\nPlus500\nCapital.com\nAXI\nOANDA\nForex\nCFD\nFutures\nMT4\nMT5\nCTrader');
  const [previewLanguage, setPreviewLanguage] = useState('en');
  const [isLoading, setIsLoading] = useState(false);

  // Load saved configuration on component mount
  useEffect(() => {
    const loadSavedConfig = () => {
      try {
        // First check if config is already loaded in context
        if (languageConfig) {
          setEnabledLanguages(languageConfig.enabledLanguages);
          setAutoTranslate(languageConfig.autoTranslate);
          setGlossary(languageConfig.glossary.join('\n'));
          setPreviewLanguage(languageConfig.previewLanguage);
          return;
        }

        // Otherwise load from localStorage
        const savedConfig = localStorage.getItem('reduzed-language-config');
        if (savedConfig) {
          const config: LanguageConfig = JSON.parse(savedConfig);
          setEnabledLanguages(config.enabledLanguages || DEFAULT_CONFIG.enabledLanguages);
          setAutoTranslate(config.autoTranslate ?? DEFAULT_CONFIG.autoTranslate);
          setGlossary(config.glossary?.join('\n') || DEFAULT_CONFIG.glossary.join('\n'));
          setPreviewLanguage(config.previewLanguage || DEFAULT_CONFIG.previewLanguage);
          
          // Update context as well
          updateLanguageConfig(config);
        }
      } catch (error) {
        console.warn('Failed to load language configuration:', error);
        // Reset to defaults if parsing fails
        resetToDefaults();
      }
    };

    loadSavedConfig();
  }, [languageConfig, updateLanguageConfig]);

  const resetToDefaults = () => {
    setEnabledLanguages(DEFAULT_CONFIG.enabledLanguages);
    setAutoTranslate(DEFAULT_CONFIG.autoTranslate);
    setGlossary(DEFAULT_CONFIG.glossary.join('\n'));
    setPreviewLanguage(DEFAULT_CONFIG.previewLanguage);
  };

  const handleLanguageToggle = (languageCode: string) => {
    if (languageCode === 'en') return; // English cannot be disabled
    
    setEnabledLanguages(prev => 
      prev.includes(languageCode)
        ? prev.filter(code => code !== languageCode)
        : [...prev, languageCode]
    );
  };

  const handleSave = async () => {
    setIsLoading(true);
    
    try {
      const config: LanguageConfig = {
        enabledLanguages,
        autoTranslate,
        glossary: glossary.split('\n').filter(term => term.trim() !== ''),
        previewLanguage
      };
      
      // Save to localStorage
      localStorage.setItem('reduzed-language-config', JSON.stringify(config));
      
      // Update the global context
      updateLanguageConfig(config);
      
      // Also save to global app settings if needed
      const globalSettings = JSON.parse(localStorage.getItem('reduzed-app-settings') || '{}');
      globalSettings.languageConfig = config;
      localStorage.setItem('reduzed-app-settings', JSON.stringify(globalSettings));
      
      // Log for debugging
      console.log('Language configuration saved:', config);
      
      // Simulate a small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast.success(`Configuration saved! ${enabledLanguages.length} languages enabled.`);
    } catch (error) {
      console.error('Failed to save language configuration:', error);
      toast.error('Failed to save configuration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedCount = enabledLanguages.length;
  const nonDefaultLanguages = AVAILABLE_LANGUAGES.filter(lang => !lang.isDefault);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-slate-700/30 shadow-lg p-6">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Languages className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    Supported Languages
                  </h1>
                </div>
              </div>
              <p className="text-slate-600 dark:text-slate-400">
                Choose which languages REDUZED will support initially.
              </p>
            </div>
          </div>

          {/* Main Configuration Card */}
          <Card className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-white/30 dark:border-slate-700/30 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-500" />
                Language Configuration
              </CardTitle>
              <CardDescription>
                Configure the languages that will be available to your users. English is enabled by default and cannot be disabled.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Enabled Languages Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-medium">Enabled Languages</Label>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {selectedCount} language{selectedCount !== 1 ? 's' : ''} selected
                  </div>
                </div>

                {/* English (Default) */}
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🇺🇸</span>
                      <div>
                        <div className="font-medium text-slate-900 dark:text-slate-100">
                          English
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          Default language • Always enabled
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-full">
                        DEFAULT
                      </span>
                      <Switch checked={true} disabled className="opacity-50" />
                    </div>
                  </div>
                </div>

                {/* Other Languages */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {nonDefaultLanguages.map(language => (
                    <div
                      key={language.code}
                      className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                        enabledLanguages.includes(language.code)
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                      onClick={() => handleLanguageToggle(language.code)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{language.flag}</span>
                          <div>
                            <div className="font-medium text-slate-900 dark:text-slate-100">
                              {language.name}
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                              {language.nativeName}
                            </div>
                          </div>
                        </div>
                        <Switch
                          checked={enabledLanguages.includes(language.code)}
                          onCheckedChange={() => handleLanguageToggle(language.code)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Auto-Translate Section */}
              <div className="space-y-4">
                <Label className="text-lg font-medium">Translation Settings</Label>
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="font-medium text-slate-900 dark:text-slate-100">
                          Auto-Translate
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          Automatically translate new offers/UI to enabled languages
                        </div>
                      </div>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="w-4 h-4 text-slate-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            When enabled, new content will be automatically translated to all enabled languages using machine translation. You can review and edit translations later.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Switch
                      checked={autoTranslate}
                      onCheckedChange={setAutoTranslate}
                    />
                  </div>
                </div>
              </div>

              {/* Glossary Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Label className="text-lg font-medium">Glossary / Do-Not-Translate</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="w-4 h-4 text-slate-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        Terms that should remain in English across all languages. Include brand names, technical terms, and product names that should not be translated.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="space-y-2">
                  <Textarea
                    value={glossary}
                    onChange={(e) => setGlossary(e.target.value)}
                    placeholder="Enter terms that should not be translated, one per line..."
                    className="min-h-32 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    One term per line. These terms will remain unchanged during translation.
                  </p>
                </div>
              </div>

              {/* Preview Language Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Label className="text-lg font-medium">Preview Language (Internal QA)</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="w-4 h-4 text-slate-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        Set the default language for previewing translations in the admin panel during quality assurance testing.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Eye className="w-5 h-5 text-slate-500" />
                      <div>
                        <div className="font-medium text-slate-900 dark:text-slate-100">
                          QA Preview Language
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          Default language for admin preview and testing
                        </div>
                      </div>
                    </div>
                    <Select value={previewLanguage} onValueChange={setPreviewLanguage}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {AVAILABLE_LANGUAGES
                          .filter(lang => enabledLanguages.includes(lang.code))
                          .map(lang => (
                            <SelectItem key={lang.code} value={lang.code}>
                              <div className="flex items-center gap-2">
                                <span>{lang.flag}</span>
                                <span>{lang.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Summary Section */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Configuration Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="font-medium text-blue-800 dark:text-blue-200">Languages</div>
                    <div className="text-blue-700 dark:text-blue-300">
                      {selectedCount} enabled
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-blue-800 dark:text-blue-200">Auto-Translate</div>
                    <div className="text-blue-700 dark:text-blue-300">
                      {autoTranslate ? 'Enabled' : 'Disabled'}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-blue-800 dark:text-blue-200">Glossary Terms</div>
                    <div className="text-blue-700 dark:text-blue-300">
                      {glossary.split('\n').filter(term => term.trim() !== '').length} terms
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <Button
                  variant="outline"
                  onClick={() => {
                    resetToDefaults();
                    toast.info('Settings reset to defaults');
                  }}
                  className="rounded-xl"
                  disabled={isLoading}
                >
                  Reset to Defaults
                </Button>
                <Button
                  onClick={handleSave}
                  className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl"
                  disabled={isLoading}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? 'Saving...' : 'Save Configuration'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Help Section */}
          <Card className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-white/30 dark:border-slate-700/30 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Next Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-xs mt-0.5">1</div>
                  <div>
                    <div className="font-medium text-slate-900 dark:text-slate-100">Configure your languages</div>
                    <div>Select the languages you want to support initially. You can add more languages later.</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-xs mt-0.5">2</div>
                  <div>
                    <div className="font-medium text-slate-900 dark:text-slate-100">Review auto-translations</div>
                    <div>When auto-translate is enabled, review machine translations before publishing.</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-xs mt-0.5">3</div>
                  <div>
                    <div className="font-medium text-slate-900 dark:text-slate-100">Test with QA preview</div>
                    <div>Use the preview language setting to test how content appears to users.</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
}