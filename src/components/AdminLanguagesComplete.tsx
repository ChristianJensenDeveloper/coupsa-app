import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { toast } from 'sonner@2.0.3';
import { 
  Settings, 
  Languages, 
  Globe, 
  Edit, 
  RotateCw, 
  Check, 
  X, 
  AlertTriangle, 
  Monitor, 
  Smartphone, 
  Eye,
  Trash2,
  RefreshCw,
  FileDown,
  FileUp,
  Save,
  Zap,
  Ruler,
  AlertCircle
} from 'lucide-react';
import { TextLengthManager } from './TextLengthManager';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  rtl?: boolean;
}

const AVAILABLE_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)', nativeName: 'Português (Brasil)' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '简体中文' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', rtl: true },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' }
];

export function AdminLanguagesComplete() {
  // State
  const [defaultLanguage, setDefaultLanguage] = useState('en');
  const [enabledLanguages, setEnabledLanguages] = useState(['es', 'pt-BR', 'fr', 'de', 'it', 'pl', 'nl', 'el', 'cs', 'hi', 'ru', 'zh-CN', 'ar', 'tr']);
  const [autoTranslate, setAutoTranslate] = useState(true);
  const [translationProvider, setTranslationProvider] = useState('auto');
  const [glossary, setGlossary] = useState('Coupza\nProp\nBroker\nFTMO\nTopStep\nCFD\nForex');
  const [previewLanguage, setPreviewLanguage] = useState('en');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [lengthIssues, setLengthIssues] = useState<any[]>([]);

  // Simulate getting length issues after translation
  const handleTranslateAllOffers = async () => {
    toast.info(`Auto-translating offers to ${enabledLanguages.length} languages...`);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock length issues data
    const mockIssues = [
      {
        key: 'offer.title',
        sourceText: '90% Off CFD Challenge Fee',
        translatedText: 'Obtenga un 90% de descuento en su primer desafío de trading prop CFD con capital virtual',
        sourceLength: 25,
        translatedLength: 89,
        overflowPercentage: 256,
        locale: 'es',
        severity: 'critical' as const,
        context: 'offer_title'
      },
      {
        key: 'offer.description',
        sourceText: 'Get 90% discount on your first CFD prop trading challenge.',
        translatedText: 'Obtenga un 90% de descuento en su primer desafío de trading prop CFD con capital virtual de $100K.',
        sourceLength: 59,
        translatedLength: 103,
        overflowPercentage: 75,
        locale: 'es',
        severity: 'error' as const,
        context: 'description'
      },
      {
        key: 'button.go_to_offer',
        sourceText: 'Go To Offer',
        translatedText: 'Ir a la Oferta Completa',
        sourceLength: 11,
        translatedLength: 23,
        overflowPercentage: 109,
        locale: 'es',
        severity: 'warning' as const,
        context: 'button'
      }
    ];
    setLengthIssues(mockIssues);
    
    toast.success('All offers translated successfully!');
    if (mockIssues.length > 0) {
      toast.warning(`${mockIssues.length} length issues detected - check Length Issues tab`);
    }
  };

  const handleResolveLengthIssue = (key: string, locale: string, newText: string, strategy: string) => {
    setLengthIssues(prev => prev.filter(issue => !(issue.key === key && issue.locale === locale)));
    toast.success(`Length issue resolved for ${key} (${locale})`);
  };

  const handleLanguageToggle = (langCode: string) => {
    setEnabledLanguages(prev => 
      prev.includes(langCode) 
        ? prev.filter(code => code !== langCode)
        : [...prev, langCode]
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Languages className="w-5 h-5 text-white" />
            </div>
            Languages
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Let users view Coupza in their language. Auto-translate UI and offers; allow manual fixes where needed.
          </p>
        </div>
      </div>

      <Tabs defaultValue="global" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="global">Global Settings</TabsTrigger>
          <TabsTrigger value="ui-strings">UI Strings</TabsTrigger>
          <TabsTrigger value="offers">Offers Translation</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
          <TabsTrigger value="length-issues" className="relative">
            Length Issues
            {lengthIssues.length > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {lengthIssues.length}
              </div>
            )}
          </TabsTrigger>
          <TabsTrigger value="preview">Preview & QA</TabsTrigger>
        </TabsList>

        {/* Global Settings */}
        <TabsContent value="global" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Global Language Settings
              </CardTitle>
              <CardDescription>
                Configure default language, enabled languages, and translation settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Default Language */}
              <div className="space-y-2">
                <Label>Default Language</Label>
                <Select value={defaultLanguage} onValueChange={setDefaultLanguage}>
                  <SelectTrigger className="w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_LANGUAGES.map(lang => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name} ({lang.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Enabled Languages */}
              <div className="space-y-3">
                <Label>Enabled Languages</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {AVAILABLE_LANGUAGES.filter(lang => lang.code !== defaultLanguage).map(lang => (
                    <div key={lang.code} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{lang.name}</div>
                        <div className="text-xs text-slate-500">{lang.nativeName}</div>
                      </div>
                      <Switch
                        checked={enabledLanguages.includes(lang.code)}
                        onCheckedChange={() => handleLanguageToggle(lang.code)}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {enabledLanguages.map(code => {
                    const lang = AVAILABLE_LANGUAGES.find(l => l.code === code);
                    return (
                      <Badge key={code} variant="secondary" className="text-xs">
                        {lang?.name} ({code})
                      </Badge>
                    );
                  })}
                </div>
              </div>

              {/* Auto-Translate */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label>Auto-Translate</Label>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    When on, new/updated offers are machine-translated to enabled languages.
                  </p>
                </div>
                <Switch checked={autoTranslate} onCheckedChange={setAutoTranslate} />
              </div>

              {/* Translation Provider */}
              <div className="space-y-2">
                <Label>Translation Provider</Label>
                <Select value={translationProvider} onValueChange={setTranslationProvider}>
                  <SelectTrigger className="w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto (recommended)</SelectItem>
                    <SelectItem value="provider-a">Provider A</SelectItem>
                    <SelectItem value="provider-b">Provider B</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Glossary */}
              <div className="space-y-2">
                <Label>Glossary / Do-Not-Translate</Label>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Terms kept as-is across languages. One term per line.
                </p>
                <Textarea
                  value={glossary}
                  onChange={(e) => setGlossary(e.target.value)}
                  placeholder="Coupza&#10;Prop&#10;Broker&#10;Brand names..."
                  className="min-h-32"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={() => toast.success('Settings saved!')}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Settings
                </Button>
                <Button variant="outline" onClick={() => toast.info('Settings reset to defaults')}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset to Defaults
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* UI Strings */}
        <TabsContent value="ui-strings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>UI Strings Management</CardTitle>
              <CardDescription>
                Manage static UI text translations used throughout the application.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 dark:text-slate-400">
                UI strings translation interface would be implemented here...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Offers Translation */}
        <TabsContent value="offers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Offers Translation
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleTranslateAllOffers}>
                    <Zap className="w-4 h-4 mr-2" />
                    Translate All
                  </Button>
                  <Button variant="outline">
                    Translate Selected
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                Manage deal translations with status tracking and bulk operations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Click "Translate All" to simulate translation and generate length issues...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Automation Rules */}
        <TabsContent value="automation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Automation Rules</CardTitle>
              <CardDescription>
                Configure automated translation workflows and fallback behavior.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 dark:text-slate-400">
                Automation rules interface would be implemented here...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Length Issues Tab */}
        <TabsContent value="length-issues" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ruler className="w-5 h-5" />
                Translation Length Issues
              </CardTitle>
              <CardDescription>
                Identify and fix translations that exceed recommended character limits. 
                Long translations can break UI layouts and affect user experience.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TextLengthManager
                issues={lengthIssues}
                onResolveLengthIssue={handleResolveLengthIssue}
              />

              {/* Guidelines Section */}
              {lengthIssues.length > 0 && (
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Translation Length Guidelines
                  </h3>
                  <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="font-medium mb-1">Recommended Limits:</div>
                        <ul className="space-y-1 text-xs">
                          <li>• Buttons: ≤110% of English</li>
                          <li>• Menu items: ≤115% of English</li>
                          <li>• Titles: ≤130% of English</li>
                          <li>• Descriptions: ≤150% of English</li>
                        </ul>
                      </div>
                      <div>
                        <div className="font-medium mb-1">Quick Fixes:</div>
                        <ul className="space-y-1 text-xs">
                          <li>• Use abbreviations (info, max, min)</li>
                          <li>• Remove filler words (please, click)</li>
                          <li>• Use active voice</li>
                          <li>• Consider icons + shorter text</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Prevention Tips */}
              <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-3">
                  Prevention Tips for Translators
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-600 dark:text-slate-400">
                  <div>
                    <div className="font-medium text-slate-900 dark:text-slate-100 mb-1">
                      Context Awareness
                    </div>
                    <p className="text-xs">
                      Understand where text appears (buttons need shorter text than descriptions)
                    </p>
                  </div>
                  <div>
                    <div className="font-medium text-slate-900 dark:text-slate-100 mb-1">
                      Cultural Adaptation
                    </div>
                    <p className="text-xs">
                      Adapt content culturally while keeping length constraints in mind
                    </p>
                  </div>
                  <div>
                    <div className="font-medium text-slate-900 dark:text-slate-100 mb-1">
                      Iterative Refinement
                    </div>
                    <p className="text-xs">
                      Start with accurate translation, then refine for optimal length
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preview & QA */}
        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Preview & Quality Assurance
              </CardTitle>
              <CardDescription>
                Preview how translations appear to users and check for quality issues.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Preview Controls */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="space-y-1">
                    <Label>Preview Language</Label>
                    <Select value={previewLanguage} onValueChange={setPreviewLanguage}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English (EN)</SelectItem>
                        {enabledLanguages.map(lang => (
                          <SelectItem key={lang} value={lang}>
                            {AVAILABLE_LANGUAGES.find(l => l.code === lang)?.name} ({lang.toUpperCase()})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-1">
                    <Label>Device</Label>
                    <div className="flex border rounded-lg p-1">
                      <Button
                        size="sm"
                        variant={previewDevice === 'desktop' ? 'default' : 'ghost'}
                        onClick={() => setPreviewDevice('desktop')}
                        className="rounded-md"
                      >
                        <Monitor className="w-4 h-4 mr-1" />
                        Desktop
                      </Button>
                      <Button
                        size="sm"
                        variant={previewDevice === 'mobile' ? 'default' : 'ghost'}
                        onClick={() => setPreviewDevice('mobile')}
                        className="rounded-md"
                      >
                        <Smartphone className="w-4 h-4 mr-1" />
                        Mobile
                      </Button>
                    </div>
                  </div>
                </div>

                {/* RTL Toggle for Arabic */}
                {previewLanguage === 'ar' && (
                  <div className="flex items-center gap-2">
                    <Label>RTL Preview</Label>
                    <Switch defaultChecked />
                  </div>
                )}
              </div>

              {/* Preview Panel */}
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-slate-50 dark:bg-slate-800 p-3 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="ml-2 text-sm font-mono text-slate-600 dark:text-slate-400">
                        coupza.com - {AVAILABLE_LANGUAGES.find(l => l.code === previewLanguage)?.name}
                      </span>
                    </div>
                    <Badge className="text-xs">
                      Preview Mode
                    </Badge>
                  </div>
                </div>
                
                <div className={`p-6 ${previewDevice === 'mobile' ? 'max-w-sm mx-auto' : ''} ${previewLanguage === 'ar' ? 'text-right' : ''}`}>
                  {/* Mock preview content */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h1 className="text-xl font-bold">
                        {previewLanguage === 'es' ? 'COUPZA - Buscador de Ofertas' : 
                         previewLanguage === 'pt-BR' ? 'COUPZA - Localizador de Ofertas' :
                         previewLanguage === 'ar' ? 'كوبزا - محرك البحث عن العروض' :
                         'COUPZA - Deal Finder'}
                      </h1>
                      <Button size="sm">
                        {previewLanguage === 'es' ? 'Perfil' :
                         previewLanguage === 'pt-BR' ? 'Perfil' :
                         previewLanguage === 'ar' ? 'الملف الشخصي' :
                         'Profile'}
                      </Button>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium mb-2">
                        {previewLanguage === 'es' ? '90% de Descuento en Tarifa de Desafío CFD' :
                         previewLanguage === 'pt-BR' ? '90% de Desconto na Taxa do Desafio CFD' :
                         previewLanguage === 'ar' ? 'خصم 90% على رسوم تحدي CFD' :
                         '90% Off CFD Challenge Fee'}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                        {previewLanguage === 'es' ? 'Obtenga un 90% de descuento en su primer desafío de trading prop CFD...' :
                         previewLanguage === 'pt-BR' ? 'Obtenha 90% de desconto no seu primeiro desafio de prop trading CFD...' :
                         previewLanguage === 'ar' ? 'احصل على خصم 90% على أول تحدي تداول CFD الخاص بك...' :
                         'Get 90% discount on your first CFD prop trading challenge...'}
                      </p>
                      <div className="flex gap-2">
                        <Button size="sm">
                          {previewLanguage === 'es' ? 'Ir a la Oferta Completa' :
                           previewLanguage === 'pt-BR' ? 'Ir para Oferta' :
                           previewLanguage === 'ar' ? 'اذهب إلى العرض' :
                           'Go To Offer'}
                        </Button>
                        <Button size="sm" variant="outline">
                          {previewLanguage === 'es' ? 'Guardar' :
                           previewLanguage === 'pt-BR' ? 'Salvar' :
                           previewLanguage === 'ar' ? 'حفظ' :
                           'Save'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}