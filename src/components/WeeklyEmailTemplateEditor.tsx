import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Switch } from "./ui/switch";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { Save, Eye, ArrowLeft, Calendar, Mail, TrendingUp, DollarSign, Clock, Plus, Edit, Copy, Trash2, Smartphone, Monitor, Globe } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { Coupon } from "./types";

// Weekly email template structure
export interface WeeklyEmailTemplate {
  id: string;
  name: string;
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  type: 'cfd-deals' | 'futures-deals' | 'expiring-deals' | 'broker-bonuses' | 'custom';
  isActive: boolean;
  sendTime: string; // HH:MM format
  timezone: string;
  subject: {
    default: string;
    variants: string[];
  };
  content: {
    headerMessage: string;
    dealIntro: string;
    ctaText: string;
    footerMessage: string;
    includeExpiring: boolean;
    includeBrokerDeals: boolean;
    maxDeals: number;
    dealCategories: string[];
  };
  branding: {
    showLogo: boolean;
    showCompanyName: boolean;
    showTagline: boolean;
    showFooterBranding: boolean;
    customLogoUrl?: string;
    customCompanyName?: string;
    customTagline?: string;
  };
  bannerId?: string;
  language: string;
  createdAt: string;
  updatedAt: string;
  lastSent?: string;
  recipientCount?: number;
  performance?: {
    openRate: number;
    clickRate: number;
    revenue: number;
  };
}

interface WeeklyEmailTemplateEditorProps {
  onBack: () => void;
  deals: Coupon[];
  availableLanguages?: string[];
}

// Default weekly templates
const defaultWeeklyTemplates: WeeklyEmailTemplate[] = [
  {
    id: 'monday-cfd',
    name: 'Monday CFD Deals',
    day: 'monday',
    type: 'cfd-deals',
    isActive: true,
    sendTime: '09:00',
    timezone: 'UTC',
    subject: {
      default: "This Week's CFD Challenge Deals",
      variants: [
        "New CFD Prop Trading Discounts Available",
        "Monday CFD Deals - Save Money This Week",
        "🎯 CFD Challenge Deals - Up to 90% Off"
      ]
    },
    content: {
      headerMessage: "Start your week with exclusive CFD prop trading deals",
      dealIntro: "We've curated the best CFD prop trading discounts to help you save money on your next challenge.",
      ctaText: "View All CFD Deals",
      footerMessage: "Save money on your next prop trading challenge",
      includeExpiring: false,
      includeBrokerDeals: false,
      maxDeals: 4,
      dealCategories: ['CFD Prop']
    },
    branding: {
      showLogo: true,
      showCompanyName: true,
      showTagline: true,
      showFooterBranding: true,
      customCompanyName: 'REDUZED',
      customTagline: 'AI Deal Finder'
    },
    bannerId: 'reduzed-primary',
    language: 'en',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    recipientCount: 1247,
    performance: {
      openRate: 34.2,
      clickRate: 8.7,
      revenue: 2840
    }
  },
  {
    id: 'tuesday-futures',
    name: 'Tuesday Futures Deals',
    day: 'tuesday',
    type: 'futures-deals',
    isActive: true,
    sendTime: '09:00',
    timezone: 'UTC',
    subject: {
      default: "This Week's Futures Challenge Deals",
      variants: [
        "Futures Prop Trading Discounts Inside",
        "Tuesday Futures Deals - Don't Miss Out",
        "🚀 Futures Trading Opportunities"
      ]
    },
    content: {
      headerMessage: "Discover the best futures prop trading opportunities",
      dealIntro: "This week's hand-picked futures trading deals from top prop firms.",
      ctaText: "View All Futures Deals",
      footerMessage: "Your futures trading success starts here",
      includeExpiring: false,
      includeBrokerDeals: false,
      maxDeals: 4,
      dealCategories: ['Futures Prop']
    },
    branding: {
      showLogo: true,
      showCompanyName: true,
      showTagline: true,
      showFooterBranding: true,
      customCompanyName: 'REDUZED',
      customTagline: 'AI Deal Finder'
    },
    bannerId: 'reduzed-primary',
    language: 'en',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    recipientCount: 1134,
    performance: {
      openRate: 31.8,
      clickRate: 7.3,
      revenue: 2120
    }
  },
  {
    id: 'thursday-expiring',
    name: 'Thursday Expiring Deals',
    day: 'thursday',
    type: 'expiring-deals',
    isActive: true,
    sendTime: '10:00',
    timezone: 'UTC',
    subject: {
      default: "⏰ Deals Expiring This Weekend",
      variants: [
        "Last Chance - Deals End Soon",
        "48 Hours Left - Grab These Deals",
        "⚠️ Don't Miss Out - Deals Expiring"
      ]
    },
    content: {
      headerMessage: "Don't miss out on these time-sensitive deals",
      dealIntro: "These exclusive offers are expiring this weekend. Act fast to secure your discount!",
      ctaText: "Get Deals Now",
      footerMessage: "Limited time offers - claim before they expire",
      includeExpiring: true,
      includeBrokerDeals: true,
      maxDeals: 5,
      dealCategories: ['CFD Prop', 'Futures Prop', 'Broker Bonuses']
    },
    branding: {
      showLogo: true,
      showCompanyName: true,
      showTagline: true,
      showFooterBranding: true,
      customCompanyName: 'REDUZED',
      customTagline: 'AI Deal Finder'
    },
    bannerId: 'urgent-expiry',
    language: 'en',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    recipientCount: 1389,
    performance: {
      openRate: 42.1,
      clickRate: 12.4,
      revenue: 3650
    }
  }
];

// Banner options
const bannerOptions = [
  { id: 'none', name: 'No Banner' },
  { id: 'reduzed-primary', name: 'REDUZED Primary Blue' },
  { id: 'reduzed-minimal', name: 'REDUZED Minimal' },
  { id: 'reduzed-gradient', name: 'REDUZED Gradient' },
  { id: 'deals-promo', name: 'Deals Promo Banner' },
  { id: 'urgent-expiry', name: 'Urgent Expiry Alert' }
];

// Language options
const languageOptions = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)', flag: '🇧🇷' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' }
];

export function WeeklyEmailTemplateEditor({ onBack, deals, availableLanguages }: WeeklyEmailTemplateEditorProps) {
  const [templates, setTemplates] = useState<WeeklyEmailTemplate[]>(defaultWeeklyTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<WeeklyEmailTemplate | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('mobile');
  const [deleteTemplateId, setDeleteTemplateId] = useState<string | null>(null);

  const [formData, setFormData] = useState<WeeklyEmailTemplate>({
    id: '',
    name: '',
    day: 'monday',
    type: 'custom',
    isActive: true,
    sendTime: '09:00',
    timezone: 'UTC',
    subject: {
      default: '',
      variants: []
    },
    content: {
      headerMessage: '',
      dealIntro: '',
      ctaText: 'View All Deals',
      footerMessage: '',
      includeExpiring: false,
      includeBrokerDeals: false,
      maxDeals: 4,
      dealCategories: ['CFD Prop']
    },
    branding: {
      showLogo: true,
      showCompanyName: true,
      showTagline: true,
      showFooterBranding: true,
      customCompanyName: 'REDUZED',
      customTagline: 'AI Deal Finder'
    },
    bannerId: 'reduzed-primary',
    language: 'en',
    createdAt: '',
    updatedAt: ''
  });

  const handleCreateNew = () => {
    setFormData({
      id: Date.now().toString(),
      name: '',
      day: 'monday',
      type: 'custom',
      isActive: true,
      sendTime: '09:00',
      timezone: 'UTC',
      subject: {
        default: '',
        variants: []
      },
      content: {
        headerMessage: '',
        dealIntro: '',
        ctaText: 'View All Deals',
        footerMessage: '',
        includeExpiring: false,
        includeBrokerDeals: false,
        maxDeals: 4,
        dealCategories: ['CFD Prop']
      },
      bannerId: 'reduzed-primary',
      language: 'en',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    setSelectedTemplate(null);
    setIsCreatingNew(true);
  };

  const handleEditTemplate = (template: WeeklyEmailTemplate) => {
    setFormData(template);
    setSelectedTemplate(template);
    setIsCreatingNew(false);
  };

  const handleSave = () => {
    if (!formData.name || !formData.subject.default) {
      toast.error("Please fill in template name and subject");
      return;
    }

    setTemplates(prev => {
      const existing = prev.find(t => t.id === formData.id);
      if (existing) {
        return prev.map(t => t.id === formData.id ? { ...formData, updatedAt: new Date().toISOString() } : t);
      } else {
        return [...prev, formData];
      }
    });
    
    setSelectedTemplate(null);
    setIsCreatingNew(false);
    toast.success("Weekly email template saved successfully");
  };

  const handleDuplicate = (template: WeeklyEmailTemplate) => {
    const duplicatedTemplate = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Copy)`,
      isActive: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastSent: undefined,
      recipientCount: undefined,
      performance: undefined
    };
    setTemplates(prev => [...prev, duplicatedTemplate]);
    toast.success("Template duplicated successfully");
  };

  const handleDelete = (templateId: string) => {
    setTemplates(prev => prev.filter(t => t.id !== templateId));
    setDeleteTemplateId(null);
    toast.success("Template deleted successfully");
  };

  const handleToggleActive = (templateId: string) => {
    setTemplates(prev => prev.map(t => 
      t.id === templateId ? { ...t, isActive: !t.isActive, updatedAt: new Date().toISOString() } : t
    ));
    toast.success("Template status updated");
  };

  const addSubjectVariant = () => {
    setFormData(prev => ({
      ...prev,
      subject: {
        ...prev.subject,
        variants: [...prev.subject.variants, '']
      }
    }));
  };

  const updateSubjectVariant = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      subject: {
        ...prev.subject,
        variants: prev.subject.variants.map((v, i) => i === index ? value : v)
      }
    }));
  };

  const removeSubjectVariant = (index: number) => {
    setFormData(prev => ({
      ...prev,
      subject: {
        ...prev.subject,
        variants: prev.subject.variants.filter((_, i) => i !== index)
      }
    }));
  };

  const getFilteredDeals = (template: WeeklyEmailTemplate) => {
    let filtered = deals.filter(deal => template.content.dealCategories.includes(deal.category));
    
    if (template.content.includeExpiring) {
      // Get deals expiring within 7 days
      const weekFromNow = new Date();
      weekFromNow.setDate(weekFromNow.getDate() + 7);
      filtered = filtered.filter(deal => {
        const endDate = new Date(deal.endDate);
        return endDate <= weekFromNow && endDate > new Date();
      });
    }
    
    return filtered.slice(0, template.content.maxDeals);
  };

  const renderEmailPreview = (template: WeeklyEmailTemplate) => {
    const filteredDeals = getFilteredDeals(template);
    const containerWidth = previewDevice === 'mobile' ? 'max-w-sm' : 'max-w-2xl';
    
    // Dynamic banner rendering based on bannerId
    const renderBanner = () => {
      if (!template.bannerId || template.bannerId === 'none') {
        return null;
      }

      const bannerStyles = {
        'reduzed-primary': 'bg-gradient-to-r from-blue-500 to-blue-600',
        'reduzed-minimal': 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-900',
        'reduzed-gradient': 'bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600',
        'deals-promo': 'bg-gradient-to-r from-green-500 to-emerald-600',
        'urgent-expiry': 'bg-gradient-to-r from-orange-500 to-red-500'
      };

      const bannerClass = bannerStyles[template.bannerId as keyof typeof bannerStyles] || bannerStyles['reduzed-primary'];
      const isLight = template.bannerId === 'reduzed-minimal';

      return (
        <div className={`${bannerClass} p-6 ${isLight ? 'text-slate-900' : 'text-white'} text-center`}>
          {(template.branding.showLogo || template.branding.showCompanyName || template.branding.showTagline) && (
            <div className="flex items-center justify-center gap-3 mb-4">
              {template.branding.showLogo && (
                <div className={`w-10 h-10 ${isLight ? 'bg-slate-900/10' : 'bg-white/20'} rounded-lg flex items-center justify-center`}>
                  {template.branding.customLogoUrl ? (
                    <img src={template.branding.customLogoUrl} alt="Logo" className="w-6 h-6" />
                  ) : (
                    <span className="font-bold">{template.branding.customCompanyName?.charAt(0) || 'R'}</span>
                  )}
                </div>
              )}
              {(template.branding.showCompanyName || template.branding.showTagline) && (
                <div>
                  {template.branding.showCompanyName && (
                    <div className="font-bold">{template.branding.customCompanyName || 'REDUZED'}</div>
                  )}
                  {template.branding.showTagline && (
                    <div className={`text-sm ${isLight ? 'opacity-70' : 'opacity-90'}`}>
                      {template.branding.customTagline || 'AI Deal Finder'}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          <h1 className="text-xl font-bold mb-2">{template.subject.default}</h1>
          {template.content.headerMessage && (
            <p className={`text-sm ${isLight ? 'opacity-70' : 'opacity-90'}`}>{template.content.headerMessage}</p>
          )}
        </div>
      );
    };
    
    return (
      <div className={`${containerWidth} mx-auto bg-white rounded-lg shadow-lg overflow-hidden`}>
        {/* Dynamic banner rendering */}
        {renderBanner()}

        {/* Header section when no banner */}
        {(!template.bannerId || template.bannerId === 'none') && (
          <div className="bg-slate-50 p-6 text-center border-b border-slate-200">
            {(template.branding.showLogo || template.branding.showCompanyName || template.branding.showTagline) && (
              <div className="flex items-center justify-center gap-3 mb-4">
                {template.branding.showLogo && (
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    {template.branding.customLogoUrl ? (
                      <img src={template.branding.customLogoUrl} alt="Logo" className="w-6 h-6" />
                    ) : (
                      <span className="font-bold text-white">{template.branding.customCompanyName?.charAt(0) || 'R'}</span>
                    )}
                  </div>
                )}
                {(template.branding.showCompanyName || template.branding.showTagline) && (
                  <div>
                    {template.branding.showCompanyName && (
                      <div className="font-bold text-slate-900">{template.branding.customCompanyName || 'REDUZED'}</div>
                    )}
                    {template.branding.showTagline && (
                      <div className="text-sm text-slate-600">{template.branding.customTagline || 'AI Deal Finder'}</div>
                    )}
                  </div>
                )}
              </div>
            )}
            <h1 className="text-xl font-bold text-slate-900 mb-2">{template.subject.default}</h1>
            {template.content.headerMessage && (
              <p className="text-sm text-slate-600">{template.content.headerMessage}</p>
            )}
          </div>
        )}

        <div className="p-6">
          {template.content.dealIntro && (
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
              <p className="text-slate-700">{template.content.dealIntro}</p>
            </div>
          )}

          <div className="space-y-4">
            {filteredDeals.map((deal, index) => (
              <div key={deal.id} className="border border-slate-200 rounded-xl p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                    <span className="text-sm font-bold text-slate-700">
                      {deal.merchant.charAt(0)}
                    </span>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <div className="font-bold text-slate-900">{deal.merchant}</div>
                        <div className="text-sm text-slate-600">{deal.title}</div>
                      </div>
                      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm px-3 py-1.5 rounded-full font-medium shadow-sm">
                        {deal.discount}
                      </div>
                    </div>
                    
                    <div className="text-sm text-slate-500">
                      Valid until {deal.validUntil}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Enhanced CTA Button */}
          <div className="mt-8 text-center">
            <div className="inline-block">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-4 rounded-2xl font-bold text-base shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer relative overflow-hidden group">
                {/* Glass effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Button content */}
                <div className="relative flex items-center justify-center gap-2">
                  <span>{template.content.ctaText}</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
                
                {/* Shine effect */}
                <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
              </div>
            </div>
          </div>

          {template.content.footerMessage && (
            <div className="mt-8 text-center text-sm text-slate-600 border-t border-slate-200 pt-6">
              <div className="bg-slate-50 rounded-lg px-4 py-3 inline-block">
                {template.content.footerMessage}
              </div>
            </div>
          )}
        </div>

        <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-6 text-center border-t border-slate-200">
          {template.branding.showFooterBranding && (
            <div className="text-sm text-slate-700 mb-3">
              <strong>{template.branding.customCompanyName || 'REDUZED'}</strong>
              {template.branding.showTagline && (
                <span> - {template.branding.customTagline || 'AI Deal Finder for Traders'}</span>
              )}
            </div>
          )}
          <div className="text-xs text-slate-500 space-x-3">
            <a href="#" className="hover:text-blue-500 transition-colors">Unsubscribe</a>
            <span>•</span>
            <a href="#" className="hover:text-blue-500 transition-colors">Privacy Policy</a>
            <span>•</span>
            <a href="#" className="hover:text-blue-500 transition-colors">Terms</a>
          </div>
          {template.branding.showFooterBranding && (
            <div className="mt-3 text-xs text-slate-400">
              © 2025 {template.branding.customCompanyName || 'REDUZED'}. All rights reserved.
            </div>
          )}
        </div>
      </div>
    );
  };

  const getDayIcon = (day: string) => {
    const icons = {
      monday: TrendingUp,
      tuesday: DollarSign,
      wednesday: Mail,
      thursday: Clock,
      friday: Calendar,
      saturday: Calendar,
      sunday: Calendar
    };
    return icons[day as keyof typeof icons] || Calendar;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'cfd-deals': return 'bg-blue-100 text-blue-700';
      case 'futures-deals': return 'bg-green-100 text-green-700';
      case 'expiring-deals': return 'bg-orange-100 text-orange-700';
      case 'broker-bonuses': return 'bg-purple-100 text-purple-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  if (selectedTemplate || isCreatingNew) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => { setSelectedTemplate(null); setIsCreatingNew(false); }}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Templates
            </Button>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {isCreatingNew ? 'Create Weekly Email Template' : 'Edit Weekly Email Template'}
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Configure your weekly automated email campaigns
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <div className="flex items-center gap-2">
              <Button
                variant={previewDevice === 'desktop' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPreviewDevice('desktop')}
              >
                <Monitor className="w-4 h-4" />
              </Button>
              <Button
                variant={previewDevice === 'mobile' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPreviewDevice('mobile')}
              >
                <Smartphone className="w-4 h-4" />
              </Button>
            </div>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save Template
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Editor */}
          <div className="space-y-6">
            <Tabs defaultValue="basic" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="schedule">Schedule</TabsTrigger>
                <TabsTrigger value="design">Design</TabsTrigger>
              </TabsList>

              {/* Basic Settings */}
              <TabsContent value="basic" className="space-y-4">
                <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle>Basic Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="name">Template Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Monday CFD Deals"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="day">Send Day</Label>
                        <Select value={formData.day} onValueChange={(value: any) => setFormData(prev => ({ ...prev, day: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="monday">Monday</SelectItem>
                            <SelectItem value="tuesday">Tuesday</SelectItem>
                            <SelectItem value="wednesday">Wednesday</SelectItem>
                            <SelectItem value="thursday">Thursday</SelectItem>
                            <SelectItem value="friday">Friday</SelectItem>
                            <SelectItem value="saturday">Saturday</SelectItem>
                            <SelectItem value="sunday">Sunday</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="type">Email Type</Label>
                        <Select value={formData.type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cfd-deals">CFD Deals</SelectItem>
                            <SelectItem value="futures-deals">Futures Deals</SelectItem>
                            <SelectItem value="expiring-deals">Expiring Deals</SelectItem>
                            <SelectItem value="broker-bonuses">Broker Bonuses</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="subject">Default Subject Line</Label>
                      <Input
                        id="subject"
                        value={formData.subject.default}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          subject: { ...prev.subject, default: e.target.value }
                        }))}
                        placeholder="This Week's Trading Deals"
                      />
                    </div>

                    {/* Subject Variants */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Subject Line Variants (A/B Testing)</Label>
                        <Button size="sm" variant="outline" onClick={addSubjectVariant}>
                          <Plus className="w-3 h-3 mr-1" />
                          Add Variant
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {formData.subject.variants.map((variant, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              value={variant}
                              onChange={(e) => updateSubjectVariant(index, e.target.value)}
                              placeholder="Alternative subject line"
                            />
                            <Button size="sm" variant="outline" onClick={() => removeSubjectVariant(index)}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Active Template</Label>
                        <p className="text-sm text-slate-600">Enable automated sending</p>
                      </div>
                      <Switch
                        checked={formData.isActive}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Content Settings */}
              <TabsContent value="content" className="space-y-4">
                <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle>Email Content</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="headerMessage">Header Message</Label>
                      <Input
                        id="headerMessage"
                        value={formData.content.headerMessage}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          content: { ...prev.content, headerMessage: e.target.value }
                        }))}
                        placeholder="Start your week with exclusive deals"
                      />
                    </div>

                    <div>
                      <Label htmlFor="dealIntro">Deal Introduction</Label>
                      <Textarea
                        id="dealIntro"
                        value={formData.content.dealIntro}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          content: { ...prev.content, dealIntro: e.target.value }
                        }))}
                        placeholder="We've curated the best trading deals for you this week..."
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="ctaText">Call-to-Action Text</Label>
                      <Input
                        id="ctaText"
                        value={formData.content.ctaText}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          content: { ...prev.content, ctaText: e.target.value }
                        }))}
                        placeholder="View All Deals"
                      />
                    </div>

                    <div>
                      <Label htmlFor="footerMessage">Footer Message</Label>
                      <Input
                        id="footerMessage"
                        value={formData.content.footerMessage}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          content: { ...prev.content, footerMessage: e.target.value }
                        }))}
                        placeholder="Save money on your next trading challenge"
                      />
                    </div>

                    <div>
                      <Label>Deal Categories</Label>
                      <div className="space-y-2 mt-2">
                        {['CFD Prop', 'Futures Prop', 'Broker Bonuses'].map((category) => (
                          <div key={category} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={category}
                              checked={formData.content.dealCategories.includes(category)}
                              onChange={(e) => {
                                const categories = formData.content.dealCategories;
                                const newCategories = e.target.checked
                                  ? [...categories, category]
                                  : categories.filter(c => c !== category);
                                setFormData(prev => ({ 
                                  ...prev, 
                                  content: { ...prev.content, dealCategories: newCategories }
                                }));
                              }}
                              className="rounded"
                            />
                            <Label htmlFor={category} className="text-sm">{category}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="maxDeals">Maximum Deals per Email</Label>
                      <Input
                        id="maxDeals"
                        type="number"
                        value={formData.content.maxDeals}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          content: { ...prev.content, maxDeals: parseInt(e.target.value) || 4 }
                        }))}
                        min="1"
                        max="10"
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Include Expiring Deals</Label>
                          <p className="text-sm text-slate-600">Priority for deals ending soon</p>
                        </div>
                        <Switch
                          checked={formData.content.includeExpiring}
                          onCheckedChange={(checked) => setFormData(prev => ({ 
                            ...prev, 
                            content: { ...prev.content, includeExpiring: checked }
                          }))}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Include Broker Deals</Label>
                          <p className="text-sm text-slate-600">Add broker bonuses to the email</p>
                        </div>
                        <Switch
                          checked={formData.content.includeBrokerDeals}
                          onCheckedChange={(checked) => setFormData(prev => ({ 
                            ...prev, 
                            content: { ...prev.content, includeBrokerDeals: checked }
                          }))}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Schedule Settings */}
              <TabsContent value="schedule" className="space-y-4">
                <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle>Schedule Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="sendTime">Send Time</Label>
                        <Input
                          id="sendTime"
                          type="time"
                          value={formData.sendTime}
                          onChange={(e) => setFormData(prev => ({ ...prev, sendTime: e.target.value }))}
                        />
                      </div>

                      <div>
                        <Label htmlFor="timezone">Timezone</Label>
                        <Select value={formData.timezone} onValueChange={(value) => setFormData(prev => ({ ...prev, timezone: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="UTC">UTC</SelectItem>
                            <SelectItem value="EST">EST (Eastern)</SelectItem>
                            <SelectItem value="PST">PST (Pacific)</SelectItem>
                            <SelectItem value="GMT">GMT (London)</SelectItem>
                            <SelectItem value="CET">CET (Central Europe)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Next Send Date</h4>
                      <p className="text-blue-700 dark:text-blue-300 text-sm">
                        This template will next send on {formData.day.charAt(0).toUpperCase() + formData.day.slice(1)} at {formData.sendTime} {formData.timezone}
                      </p>
                    </div>

                    {selectedTemplate?.performance && (
                      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                        <h4 className="font-medium text-green-900 dark:text-green-100 mb-3">Performance Stats</h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center">
                            <div className="text-lg font-bold text-green-700 dark:text-green-300">
                              {selectedTemplate.performance.openRate}%
                            </div>
                            <div className="text-xs text-green-600 dark:text-green-400">Open Rate</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-green-700 dark:text-green-300">
                              {selectedTemplate.performance.clickRate}%
                            </div>
                            <div className="text-xs text-green-600 dark:text-green-400">Click Rate</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-green-700 dark:text-green-300">
                              ${selectedTemplate.performance.revenue}
                            </div>
                            <div className="text-xs text-green-600 dark:text-green-400">Revenue</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Design Settings */}
              <TabsContent value="design" className="space-y-4">
                <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle>Email Banner</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="banner">Banner Style</Label>
                      <Select value={formData.bannerId || 'reduzed-primary'} onValueChange={(value) => setFormData(prev => ({ ...prev, bannerId: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a banner style" />
                        </SelectTrigger>
                        <SelectContent>
                          {bannerOptions.map((banner) => (
                            <SelectItem key={banner.id} value={banner.id}>
                              <div className="flex items-center gap-2">
                                {banner.id === 'none' && <span className="w-3 h-3 bg-slate-300 rounded border"></span>}
                                {banner.id === 'reduzed-primary' && <span className="w-3 h-3 bg-blue-500 rounded"></span>}
                                {banner.id === 'reduzed-minimal' && <span className="w-3 h-3 bg-slate-200 rounded border"></span>}
                                {banner.id === 'reduzed-gradient' && <span className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded"></span>}
                                {banner.id === 'deals-promo' && <span className="w-3 h-3 bg-green-500 rounded"></span>}
                                {banner.id === 'urgent-expiry' && <span className="w-3 h-3 bg-orange-500 rounded"></span>}
                                <span>{banner.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-slate-600 mt-1">
                        Preview updates automatically when banner is changed
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="language">Email Language</Label>
                      <Select value={formData.language} onValueChange={(value) => setFormData(prev => ({ ...prev, language: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {languageOptions.map((lang) => (
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
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle>Branding & Logo Controls</CardTitle>
                    <p className="text-sm text-slate-600">Control company branding visibility in emails</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Logo Controls */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Show Logo</Label>
                          <p className="text-sm text-slate-600">Display logo in header/banner</p>
                        </div>
                        <Switch
                          checked={formData.branding.showLogo}
                          onCheckedChange={(checked) => setFormData(prev => ({ 
                            ...prev, 
                            branding: { ...prev.branding, showLogo: checked }
                          }))}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Show Company Name</Label>
                          <p className="text-sm text-slate-600">Display company name in branding</p>
                        </div>
                        <Switch
                          checked={formData.branding.showCompanyName}
                          onCheckedChange={(checked) => setFormData(prev => ({ 
                            ...prev, 
                            branding: { ...prev.branding, showCompanyName: checked }
                          }))}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Show Tagline</Label>
                          <p className="text-sm text-slate-600">Display company tagline/description</p>
                        </div>
                        <Switch
                          checked={formData.branding.showTagline}
                          onCheckedChange={(checked) => setFormData(prev => ({ 
                            ...prev, 
                            branding: { ...prev.branding, showTagline: checked }
                          }))}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Show Footer Branding</Label>
                          <p className="text-sm text-slate-600">Display branding in email footer</p>
                        </div>
                        <Switch
                          checked={formData.branding.showFooterBranding}
                          onCheckedChange={(checked) => setFormData(prev => ({ 
                            ...prev, 
                            branding: { ...prev.branding, showFooterBranding: checked }
                          }))}
                        />
                      </div>
                    </div>

                    {/* Custom Branding */}
                    {(formData.branding.showCompanyName || formData.branding.showTagline || formData.branding.showFooterBranding) && (
                      <div className="space-y-3 pt-4 border-t border-slate-200">
                        <h4 className="font-medium text-slate-700">Custom Branding Text</h4>
                        
                        {formData.branding.showCompanyName && (
                          <div>
                            <Label htmlFor="customCompanyName">Company Name</Label>
                            <Input
                              id="customCompanyName"
                              value={formData.branding.customCompanyName || ''}
                              onChange={(e) => setFormData(prev => ({ 
                                ...prev, 
                                branding: { ...prev.branding, customCompanyName: e.target.value }
                              }))}
                              placeholder="Your Company Name"
                            />
                          </div>
                        )}

                        {formData.branding.showTagline && (
                          <div>
                            <Label htmlFor="customTagline">Tagline</Label>
                            <Input
                              id="customTagline"
                              value={formData.branding.customTagline || ''}
                              onChange={(e) => setFormData(prev => ({ 
                                ...prev, 
                                branding: { ...prev.branding, customTagline: e.target.value }
                              }))}
                              placeholder="Your Company Tagline"
                            />
                          </div>
                        )}

                        {formData.branding.showLogo && (
                          <div>
                            <Label htmlFor="customLogoUrl">Custom Logo URL (Optional)</Label>
                            <Input
                              id="customLogoUrl"
                              value={formData.branding.customLogoUrl || ''}
                              onChange={(e) => setFormData(prev => ({ 
                                ...prev, 
                                branding: { ...prev.branding, customLogoUrl: e.target.value }
                              }))}
                              placeholder="https://yoursite.com/logo.png"
                            />
                            <p className="text-xs text-slate-500 mt-1">
                              Leave empty to use company name initial
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* White Label Option */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
                      <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">Quick Actions</h4>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setFormData(prev => ({ 
                            ...prev, 
                            branding: { 
                              ...prev.branding, 
                              showLogo: false, 
                              showCompanyName: false, 
                              showTagline: false, 
                              showFooterBranding: false 
                            }
                          }))}
                        >
                          Remove All Branding
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setFormData(prev => ({ 
                            ...prev, 
                            branding: { 
                              ...prev.branding, 
                              showLogo: true, 
                              showCompanyName: true, 
                              showTagline: true, 
                              showFooterBranding: true 
                            }
                          }))}
                        >
                          Show All Branding
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Live Preview */}
          <div className="space-y-6">
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-xl sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-blue-500" />
                  Live Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {formData.subject.default ? (
                    renderEmailPreview(formData)
                  ) : (
                    <div className="text-center py-12 text-slate-500">
                      <Mail className="w-8 h-8 mx-auto mb-3 opacity-50" />
                      <p>Configure template settings to see preview</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            Weekly Email Templates
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Edit your Monday CFD deals, Tuesday Futures deals, and other weekly email campaigns
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Email Management
          </Button>
          <Button onClick={handleCreateNew}>
            <Plus className="w-4 h-4 mr-2" />
            Create Template
          </Button>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {templates.map((template) => {
          const DayIcon = getDayIcon(template.day);
          
          return (
            <Card key={template.id} className="border-0 shadow-lg bg-white/70 backdrop-blur-xl hover:shadow-xl transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center`}>
                      <DayIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={template.isActive ? "default" : "secondary"} className="text-xs">
                          {template.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Badge className={`text-xs ${getTypeColor(template.type)} border-0`}>
                          {template.type.replace('-', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Template Info */}
                <div className="space-y-2">
                  <div className="text-sm">
                    <strong>Subject:</strong> {template.subject.default}
                  </div>
                  <div className="text-sm text-slate-600">
                    <strong>Schedule:</strong> {template.day.charAt(0).toUpperCase() + template.day.slice(1)}s at {template.sendTime}
                  </div>
                  <div className="text-sm text-slate-600">
                    <strong>Categories:</strong> {template.content.dealCategories.join(', ')}
                  </div>
                </div>

                {/* Performance Stats */}
                {template.performance && (
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-200">
                    <div className="text-center">
                      <div className="text-sm font-bold text-slate-900">
                        {template.performance.openRate}%
                      </div>
                      <div className="text-xs text-slate-600">Open</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-bold text-slate-900">
                        {template.performance.clickRate}%
                      </div>
                      <div className="text-xs text-slate-600">Click</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-bold text-slate-900">
                        ${template.performance.revenue}
                      </div>
                      <div className="text-xs text-slate-600">Revenue</div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-3">
                  <Button 
                    size="sm" 
                    onClick={() => handleEditTemplate(template)}
                    className="flex-1"
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleToggleActive(template.id)}
                  >
                    <Clock className="w-3 h-3" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleDuplicate(template)}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setDeleteTemplateId(template.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>

                {template.lastSent && (
                  <div className="text-xs text-slate-500 text-center">
                    Last sent: {new Date(template.lastSent).toLocaleDateString()}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTemplateId} onOpenChange={(open) => !open && setDeleteTemplateId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Weekly Email Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this template? This will stop all automated emails for this schedule.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteTemplateId && handleDelete(deleteTemplateId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Template
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}