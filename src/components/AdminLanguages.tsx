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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { toast } from 'sonner@2.0.3';
import { 
  Settings, 
  Languages, 
  Globe, 
  Download, 
  Upload, 
  Edit, 
  RotateCw, 
  Check, 
  X, 
  AlertTriangle, 
  Monitor, 
  Smartphone, 
  Eye,
  Plus,
  Trash2,
  RefreshCw,
  FileDown,
  FileUp,
  Save,
  ChevronRight,
  Zap,
  Ruler,
  AlertCircle
} from 'lucide-react';
import { TextLengthManager } from './TextLengthManager';
import { detectLengthIssues, validateTextLength, generateTranslationGuidelines } from './LengthValidationUtils';

// Types for language management
interface Language {
  code: string;
  name: string;
  nativeName: string;
  rtl?: boolean;
}

interface UIString {
  key: string;
  en: string;
  es?: string;
  'pt-BR'?: string;
  hi?: string;
  ru?: string;
  'zh-CN'?: string;
  ar?: string;
  status: 'complete' | 'partial' | 'missing';
}

interface OfferTranslation {
  offerId: string;
  locale: string;
  title: string;
  description: string;
  terms: string;
  status: 'machine' | 'edited' | 'verified';
  updatedAt: string;
  needsUpdate?: boolean;
}

interface Offer {
  id: string;
  title: string;
  description: string;
  terms: string;
  company: string;
  lastUpdated: string;
  localesReady: string[];
  needsUpdate: boolean;
}

// Available languages
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

// Mock data
const mockUIStrings: UIString[] = [
  { key: 'nav.home', en: 'Home', es: 'Inicio', 'pt-BR': 'Início', hi: 'होम', ru: 'Главная', 'zh-CN': '首页', ar: 'الرئيسية', status: 'complete' },
  { key: 'nav.deals', en: 'Deals', es: 'Ofertas', 'pt-BR': 'Ofertas', hi: 'डील्स', ru: 'Предложения', 'zh-CN': '优惠', ar: 'العروض', status: 'complete' },
  { key: 'nav.profile', en: 'Profile', es: 'Perfil', 'pt-BR': 'Perfil', hi: 'प्रोफ़ाइल', ru: 'Профиль', 'zh-CN': '个人资料', ar: 'الملف الشخصي', status: 'complete' },
  { key: 'button.save', en: 'Save', es: 'Guardar', 'pt-BR': 'Salvar', hi: 'सेव करें', status: 'partial' },
  { key: 'button.cancel', en: 'Cancel', status: 'missing' },
  { key: 'form.email', en: 'Email Address', es: 'Correo Electrónico', 'pt-BR': 'Endereço de Email', status: 'partial' },
  { key: 'error.required', en: 'This field is required', status: 'missing' },
  { key: 'success.saved', en: 'Changes saved successfully', es: 'Cambios guardados exitosamente', status: 'partial' }
];

const mockOffers: Offer[] = [
  {
    id: '1',
    title: '90% Off CFD Challenge Fee',
    description: 'Get 90% discount on your first CFD prop trading challenge. Start trading with $100K virtual capital.',
    terms: 'Valid for new users only. One-time use per account. Must pass phase 1 within 30 days.',
    company: 'PropTrader Elite',
    lastUpdated: '2025-01-02T10:30:00Z',
    localesReady: ['en', 'es', 'pt-BR'],
    needsUpdate: false
  },
  {
    id: '2',
    title: 'Free Reset on Futures Challenge',
    description: 'Get one free reset on your futures prop trading evaluation. Second chance to prove your skills.',
    terms: 'Valid within 14 days of initial failure. One reset per customer. Cannot combine with other offers.',
    company: 'FuturesFund Pro',
    lastUpdated: '2025-01-02T09:15:00Z',
    localesReady: ['en'],
    needsUpdate: true
  },
  {
    id: '3',
    title: '$500 Welcome Bonus',
    description: 'Claim your $500 welcome bonus when you deposit $1000 or more. Start trading with extra capital.',
    terms: 'Minimum deposit $1000. Bonus must be traded 20x before withdrawal. T&Cs apply.',
    company: 'TradeMaster',
    lastUpdated: '2025-01-01T14:20:00Z',
    localesReady: ['en', 'es', 'pt-BR', 'hi', 'ru'],
    needsUpdate: false
  }
];

export function AdminLanguages() {
  // Global settings state
  const [defaultLanguage, setDefaultLanguage] = useState('en');
  const [enabledLanguages, setEnabledLanguages] = useState(['es', 'pt-BR', 'fr', 'de', 'it', 'pl', 'nl', 'el', 'cs', 'hi', 'ru', 'zh-CN', 'ar', 'tr']);
  const [autoTranslate, setAutoTranslate] = useState(true);
  const [translationProvider, setTranslationProvider] = useState('auto');
  const [glossary, setGlossary] = useState('REDUZED\nProp\nBroker\nFTMO\nTopStep\nCFD\nForex');

  // UI strings state
  const [uiStrings, setUIStrings] = useState<UIString[]>(mockUIStrings);
  const [editingString, setEditingString] = useState<UIString | null>(null);

  // Offers state
  const [offers, setOffers] = useState<Offer[]>(mockOffers);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [activeLocale, setActiveLocale] = useState('en');
  const [offerTranslations, setOfferTranslations] = useState<Record<string, OfferTranslation>>({});

  // Preview state
  const [previewLanguage, setPreviewLanguage] = useState('en');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  // Length validation state
  const [lengthIssues, setLengthIssues] = useState<any[]>([]);
  const [showLengthManager, setShowLengthManager] = useState(false);

  const handleLanguageToggle = (langCode: string) => {
    setEnabledLanguages(prev => 
      prev.includes(langCode) 
        ? prev.filter(code => code !== langCode)
        : [...prev, langCode]
    );
  };

  const handleAutoTranslateString = async (stringKey: string) => {
    toast.info(`Auto-translating "${stringKey}" to ${enabledLanguages.length} languages...`);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setUIStrings(prev => prev.map(str => 
      str.key === stringKey 
        ? { ...str, status: 'complete' as const, es: str.es || 'Translated', 'pt-BR': str['pt-BR'] || 'Translated' }
        : str
    ));
    
    toast.success(`"${stringKey}" translated successfully!`);
  };

  const handleTranslateAllOffers = async () => {
    toast.info(`Auto-translating ${offers.length} offers to ${enabledLanguages.length} languages...`);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setOffers(prev => prev.map(offer => ({
      ...offer,
      localesReady: ['en', ...enabledLanguages],
      needsUpdate: false
    })));
    
    // Simulate length validation after translation
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
      }
    ];
    setLengthIssues(mockIssues);
    
    toast.success('All offers translated successfully!');
    if (mockIssues.length > 0) {
      toast.warning(`${mockIssues.length} length issues detected - check Quality tab`);
    }
  };

  const handleTranslateSelectedOffers = async (offerIds: string[]) => {
    toast.info(`Translating ${offerIds.length} selected offers...`);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setOffers(prev => prev.map(offer => 
      offerIds.includes(offer.id)
        ? { ...offer, localesReady: ['en', ...enabledLanguages], needsUpdate: false }
        : offer
    ));
    
    toast.success(`${offerIds.length} offers translated successfully!`);
  };

  const handleResolveLengthIssue = (key: string, locale: string, newText: string, strategy: string) => {
    setLengthIssues(prev => prev.filter(issue => !(issue.key === key && issue.locale === locale)));
    
    // Here you would normally update the actual translation in your system
    console.log('Resolving length issue:', { key, locale, newText, strategy });
    
    toast.success(`Length issue resolved for ${key} (${locale})`);
  };

  const handleExportStrings = () => {
    const csvContent = [
      ['Key', 'English', ...enabledLanguages].join(','),
      ...uiStrings.map(str => [
        str.key,
        str.en,
        ...enabledLanguages.map(lang => str[lang as keyof UIString] || '')
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reduzed-ui-strings.csv';
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('UI strings exported to CSV!');
  };

  const handleImportStrings = () => {
    toast.info('Import functionality would open file picker...');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'partial': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'missing': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'machine': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'edited': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
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
            Let users view REDUZED in their language. Auto-translate UI and offers; allow manual fixes where needed.
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
                  placeholder="REDUZED&#10;Prop&#10;Broker&#10;Brand names..."
                  className="min-h-32"
                />
              </div>

              {/* Regional Formats Preview */}
              <div className="space-y-2">
                <Label>Regional Formats (Preview)</Label>
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-2">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="font-medium">Numbers</div>
                      <div className="text-slate-600 dark:text-slate-400">1,234.56</div>
                    </div>
                    <div>
                      <div className="font-medium">Dates</div>
                      <div className="text-slate-600 dark:text-slate-400">Jan 2, 2025</div>
                    </div>
                    <div>
                      <div className="font-medium">Currency</div>
                      <div className="text-slate-600 dark:text-slate-400">$1,234</div>
                    </div>
                    <div>
                      <div className="font-medium">Time</div>
                      <div className="text-slate-600 dark:text-slate-400">2:30 PM</div>
                    </div>
                  </div>
                </div>
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
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  App UI Strings
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleExportStrings}>
                    <FileDown className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleImportStrings}>
                    <FileUp className="w-4 h-4 mr-2" />
                    Import
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                Manage static UI text translations. These are reused throughout the application.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-48">Key</TableHead>
                      <TableHead className="w-64">English</TableHead>
                      {enabledLanguages.slice(0, 3).map(lang => (
                        <TableHead key={lang} className="w-32">
                          {AVAILABLE_LANGUAGES.find(l => l.code === lang)?.code.toUpperCase()}
                        </TableHead>
                      ))}
                      <TableHead className="w-24">Status</TableHead>
                      <TableHead className="w-32">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {uiStrings.map((str) => (
                      <TableRow key={str.key}>
                        <TableCell className="font-mono text-sm">{str.key}</TableCell>
                        <TableCell>{str.en}</TableCell>
                        {enabledLanguages.slice(0, 3).map(lang => (
                          <TableCell key={lang} className="text-sm">
                            {str[lang as keyof UIString] || (
                              <span className="text-slate-400 italic">Missing</span>
                            )}
                          </TableCell>
                        ))}
                        <TableCell>
                          <Badge className={`text-xs ${getStatusColor(str.status)}`}>
                            {str.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingString(str)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleAutoTranslateString(str.key)}
                              className="h-8 w-8 p-0"
                            >
                              <Zap className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                            >
                              <RotateCw className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
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
                  <Button variant="outline" onClick={() => handleTranslateSelectedOffers(['1', '2'])}>
                    Translate Selected
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                Manage deal translations with status tracking and bulk operations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Offers List */}
              <div className="border rounded-lg overflow-hidden mb-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <input type="checkbox" className="rounded" />
                      </TableHead>
                      <TableHead>Offer</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead className="w-36">Last Updated (EN)</TableHead>
                      <TableHead className="w-32">Locales Ready</TableHead>
                      <TableHead className="w-24">Status</TableHead>
                      <TableHead className="w-32">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {offers.map((offer) => (
                      <TableRow key={offer.id}>
                        <TableCell>
                          <input type="checkbox" className="rounded" />
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{offer.title}</div>
                          <div className="text-sm text-slate-600 dark:text-slate-400 truncate max-w-64">
                            {offer.description}
                          </div>
                        </TableCell>
                        <TableCell>{offer.company}</TableCell>
                        <TableCell className="text-sm">
                          {new Date(offer.lastUpdated).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {offer.localesReady.length} / {enabledLanguages.length + 1}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {offer.needsUpdate ? (
                            <Badge className="text-xs bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                              Needs Update
                            </Badge>
                          ) : (
                            <Badge className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                              Up to date
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedOffer(offer)}
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Offer Editor */}
              {selectedOffer && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Edit className="w-5 h-5" />
                      Editing: {selectedOffer.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs value={activeLocale} onValueChange={setActiveLocale}>
                      <TabsList className="grid grid-cols-4 lg:grid-cols-7 mb-6">
                        <TabsTrigger value="en" className="text-xs">
                          EN (source)
                        </TabsTrigger>
                        {enabledLanguages.slice(0, 6).map(lang => (
                          <TabsTrigger key={lang} value={lang} className="text-xs">
                            {lang.toUpperCase()}
                          </TabsTrigger>
                        ))}
                      </TabsList>

                      <TabsContent value="en" className="space-y-4">
                        <div className="space-y-4">
                          <div>
                            <Label>Title (Source)</Label>
                            <Input value={selectedOffer.title} readOnly className="bg-slate-50 dark:bg-slate-800" />
                          </div>
                          <div>
                            <Label>Description (Source)</Label>
                            <Textarea value={selectedOffer.description} readOnly className="bg-slate-50 dark:bg-slate-800" />
                          </div>
                          <div>
                            <Label>Terms & Conditions (Source)</Label>
                            <Textarea value={selectedOffer.terms} readOnly className="bg-slate-50 dark:bg-slate-800" />
                          </div>
                        </div>
                      </TabsContent>

                      {enabledLanguages.slice(0, 6).map(lang => (
                        <TabsContent key={lang} value={lang} className="space-y-4">
                          <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">
                                {AVAILABLE_LANGUAGES.find(l => l.code === lang)?.name} Translation
                              </h3>
                              <Badge className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                ⚙️ Machine
                              </Badge>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <Zap className="w-3 h-3 mr-1" />
                                Auto-translate from EN
                              </Button>
                              <Button size="sm" variant="outline">
                                <RotateCw className="w-3 h-3 mr-1" />
                                Revert to EN
                              </Button>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <div>
                              <Label>Title</Label>
                              <Input placeholder={`Title in ${AVAILABLE_LANGUAGES.find(l => l.code === lang)?.name}...`} />
                            </div>
                            <div>
                              <Label>Description</Label>
                              <Textarea placeholder={`Description in ${AVAILABLE_LANGUAGES.find(l => l.code === lang)?.name}...`} />
                            </div>
                            <div>
                              <Label>Terms & Conditions</Label>
                              <Textarea placeholder={`Terms in ${AVAILABLE_LANGUAGES.find(l => l.code === lang)?.name}...`} />
                            </div>
                            
                            <div className="flex gap-2 pt-4">
                              <Button>
                                <Check className="w-4 h-4 mr-2" />
                                Accept
                              </Button>
                              <Button variant="outline">
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </Button>
                            </div>
                          </div>
                        </TabsContent>
                      ))}
                    </Tabs>

                    <div className="flex justify-between items-center pt-6 border-t">
                      <Button variant="outline" onClick={() => setSelectedOffer(null)}>
                        Close Editor
                      </Button>
                      <div className="flex gap-2">
                        <Button variant="outline">Save</Button>
                        <Button>Save & Publish</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Automation Rules */}
        <TabsContent value="automation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Automation Rules
              </CardTitle>
              <CardDescription>
                Configure automated translation workflows and fallback behavior.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Auto-translation Rules */}
              <div className="p-4 border rounded-lg space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <RotateCw className="w-4 h-4" />
                  When a new offer is created/updated (EN):
                </h3>
                <div className="space-y-3 ml-6">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">
                      If <strong>Auto-Translate = On</strong> → queue machine translations for all <strong>Enabled Languages</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">
                      Apply <strong>Glossary / Do-Not-Translate</strong> rules
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">
                      Mark locales as <strong>Machine</strong> until a human edits
                    </span>
                  </div>
                </div>
              </div>

              {/* Fallback Rules */}
              <div className="p-4 border rounded-lg space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Fallback Behavior
                </h3>
                <div className="space-y-3 ml-6">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-sm">
                      If a locale is missing → show <strong>English</strong> on frontend
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-sm">
                      Optional: Show "Translated content coming soon" message
                    </span>
                  </div>
                </div>
              </div>

              {/* Staleness Detection */}
              <div className="p-4 border rounded-lg space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Staleness Detection
                </h3>
                <div className="space-y-3 ml-6">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-sm">
                      If source (EN) changes → show <strong>Needs Update</strong> badge on all locales
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-sm">
                      Display <strong>Update Translations</strong> button for bulk updates
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Definitions */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <h3 className="font-medium mb-3">Status Badge Definitions</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                        ⚙️ Machine
                      </Badge>
                      <span className="text-sm">Auto-translated, needs review</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                        ✍️ Edited
                      </Badge>
                      <span className="text-sm">Human-reviewed and approved</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                        ✓ Verified
                      </Badge>
                      <span className="text-sm">Quality checked and published</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="text-xs bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                        ⚠ Needs Update
                      </Badge>
                      <span className="text-sm">Source changed, requires re-translation</span>
                    </div>
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
                          {previewLanguage === 'es' ? 'Ir a la Oferta' :
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

              {/* Quality Flags */}
              <div className="space-y-4">
                <h3 className="font-medium">Quality Checks</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-500" />
                      <span className="font-medium text-sm">Length Overflow</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      2 strings exceed 120% of English length
                    </p>
                  </div>
                  
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="font-medium text-sm">Glossary Check</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      All protected terms preserved
                    </p>
                  </div>
                  
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="w-4 h-4 text-blue-500" />
                      <span className="font-medium text-sm">RTL Preview</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Arabic layout verified
                    </p>
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