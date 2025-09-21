import { useState } from "react";
import { EmailTemplatePreview } from "./EmailTemplatePreview";
import { EmailScheduler } from "./EmailScheduler";
import { EmailCampaignEditor, EmailCampaign } from "./EmailCampaignEditor";
import { EmailCampaignHistory } from "./EmailCampaignHistory";
import { EmailFlowBuilderAdvanced, EmailFlow } from "./EmailFlowBuilderAdvanced";
import { EmailTemplateManager, EmailTemplate } from "./EmailTemplateManager";
import { EmailSystemGuide } from "./EmailSystemGuide";
import { EmailBannerManager } from "./EmailBannerManager";
import { WeeklyEmailTemplateEditor } from "./WeeklyEmailTemplateEditor";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { Mail, Calendar, BarChart3, Settings, Users, Download, Upload, RefreshCw, Edit, Plus, History, Zap, FileText, HelpCircle, Globe, Languages, Target, ArrowLeft, Image, Clock } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { Coupon } from "./types";

interface EmailManagementProps {
  deals: Coupon[];
}

// Language configuration for emails
interface EmailLanguageSettings {
  defaultLanguage: string;
  enabledLanguages: string[];
  autoTranslateEmails: boolean;
  userLanguagePreference: 'auto' | 'english_only' | 'local_only';
  fallbackToEnglish: boolean;
}

// Available languages for emails
const EMAIL_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)', nativeName: 'Português (Brasil)', flag: '🇧🇷' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '简体中文', flag: '🇨🇳' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' }
];

// Enhanced email campaign with language support
interface LocalizedEmailCampaign extends EmailCampaign {
  language?: string;
  languageSettings?: {
    targetLanguages: string[];
    autoTranslate: boolean;
    translateSubject: boolean;
    translateContent: boolean;
  };
}

// Mock campaign data - in real app this would come from backend
const mockCampaigns: EmailCampaign[] = [
  {
    id: '1',
    name: 'Monday CFD Deals - Week 1',
    subject: 'This Week\'s CFD Challenge Deals',
    fromName: 'REDUZED Team',
    fromEmail: 'deals@reduzed.com',
    templateType: 'monday-cfd',
    status: 'sent',
    sentDate: '2025-01-01T09:00:00Z',
    recipientCount: 1247,
    openRate: 24.3,
    clickRate: 3.8,
    ctr: 15.6,
    revenue: 2847,
    createdAt: '2024-12-28T10:00:00Z',
    updatedAt: '2025-01-01T09:00:00Z',
    content: {
      preheader: 'Save big on CFD prop trading challenges this week',
      customMessage: '',
      includeDeals: true,
      dealCategories: ['CFD Prop'],
      ctaText: 'View All CFD Deals',
      ctaUrl: 'https://reduzed.com/deals?category=cfd'
    }
  },
  {
    id: '2',
    name: 'Tuesday Futures Deals - Week 1',
    subject: 'Don\'t Miss This Week\'s Futures Discounts',
    fromName: 'REDUZED Team',
    fromEmail: 'deals@reduzed.com',
    templateType: 'tuesday-futures',
    status: 'sent',
    sentDate: '2025-01-02T10:00:00Z',
    recipientCount: 1247,
    openRate: 22.1,
    clickRate: 4.2,
    ctr: 19.0,
    revenue: 3156,
    createdAt: '2024-12-29T11:00:00Z',
    updatedAt: '2025-01-02T10:00:00Z',
    content: {
      preheader: 'Futures prop trading deals you can\'t miss',
      customMessage: 'Happy New Year! Start 2025 with these amazing futures deals.',
      includeDeals: true,
      dealCategories: ['Futures Prop'],
      ctaText: 'Get Futures Deals',
      ctaUrl: 'https://reduzed.com/deals?category=futures'
    }
  },
  {
    id: '3',
    name: 'Thursday Urgent - Expiring Deals',
    subject: '⏰ 5 Deals Expiring This Weekend',
    fromName: 'REDUZED Alerts',
    fromEmail: 'alerts@reduzed.com',
    templateType: 'thursday-expiring',
    status: 'scheduled',
    scheduledDate: '2025-01-09T08:00:00Z',
    recipientCount: 1247,
    createdAt: '2025-01-06T14:00:00Z',
    updatedAt: '2025-01-06T14:30:00Z',
    content: {
      preheader: 'Don\'t miss out - these deals expire in 2 days!',
      customMessage: 'Quick reminder: These exclusive deals won\'t be around much longer.',
      includeDeals: true,
      dealCategories: ['CFD Prop', 'Futures Prop', 'Broker Bonuses'],
      ctaText: 'Save Before Expiry',
      ctaUrl: 'https://reduzed.com/deals?filter=expiring'
    }
  },
  {
    id: '4',
    name: 'Black Friday Special Campaign',
    subject: 'Black Friday: 95% Off All Challenges',
    fromName: 'REDUZED Team',
    fromEmail: 'deals@reduzed.com',
    templateType: 'custom',
    status: 'sent',
    sentDate: '2024-11-29T12:00:00Z',
    recipientCount: 1189,
    openRate: 31.5,
    clickRate: 6.7,
    ctr: 21.3,
    revenue: 8942,
    createdAt: '2024-11-25T09:00:00Z',
    updatedAt: '2024-11-29T12:00:00Z',
    content: {
      preheader: 'Biggest savings of the year - limited time only!',
      customMessage: 'Black Friday is here! Get the biggest discounts we\'ve ever offered.',
      includeDeals: true,
      dealCategories: ['CFD Prop', 'Futures Prop'],
      ctaText: 'Get Black Friday Deals',
      ctaUrl: 'https://reduzed.com/black-friday'
    }
  },
  {
    id: '5',
    name: 'Welcome Series - Part 1',
    subject: 'Welcome to REDUZED - Your Deal Finder',
    fromName: 'Sarah from REDUZED',
    fromEmail: 'team@reduzed.com',
    templateType: 'custom',
    status: 'draft',
    recipientCount: 1247,
    createdAt: '2025-01-05T16:00:00Z',
    updatedAt: '2025-01-06T10:15:00Z',
    content: {
      preheader: 'Thanks for joining! Here\'s how to save money on trading.',
      customMessage: 'Welcome to REDUZED! I\'m Sarah, and I\'m excited to help you save money on your trading journey.',
      includeDeals: true,
      dealCategories: ['CFD Prop', 'Futures Prop', 'Broker Bonuses'],
      ctaText: 'Explore Deals',
      ctaUrl: 'https://reduzed.com/deals'
    }
  }
];

// Enhanced mock email flows
const mockEmailFlows: EmailFlow[] = [
  {
    id: '1',
    name: 'Welcome Series for New Users',
    description: 'A 3-email welcome sequence to onboard new users and introduce them to REDUZED features.',
    trigger: { 
      type: 'user_signup',
      schedule: {
        enabled: false
      }
    },
    steps: [
      {
        id: 'step-1',
        type: 'email',
        order: 0,
        email: {
          subject: 'Welcome to REDUZED!',
          templateId: 'welcome-1',
          fromName: 'REDUZED Team',
          fromEmail: 'team@reduzed.com',
          personalizations: ['firstName'],
          language: 'en',
          priority: 'high'
        }
      },
      {
        id: 'step-2',
        type: 'delay',
        order: 1,
        delay: { duration: 2, unit: 'days', workingDaysOnly: false }
      },
      {
        id: 'step-3',
        type: 'email',
        order: 2,
        email: {
          subject: 'Your First Deal Awaits!',
          templateId: 'welcome-2',
          fromName: 'REDUZED Team',
          fromEmail: 'deals@reduzed.com',
          personalizations: ['firstName'],
          language: 'en',
          priority: 'normal'
        }
      },
      {
        id: 'step-4',
        type: 'action',
        order: 3,
        action: {
          type: 'add_tag',
          parameters: { tag: 'welcome_completed' }
        }
      }
    ],
    isActive: true,
    stats: { totalSent: 234, openRate: 42.1, clickRate: 8.3, conversionRate: 12.4 },
    createdAt: '2024-12-15T10:00:00Z',
    updatedAt: '2025-01-01T09:00:00Z',
    tags: ['onboarding', 'new-user'],
    priority: 'high'
  },
  {
    id: '2',
    name: 'Deal Expiration Alerts',
    description: 'Automated reminders sent 7 days and 1 day before saved deals expire.',
    trigger: { 
      type: 'deal_expiring', 
      conditions: { 
        days: 7,
        dealCategory: '',
        userSegment: 'active'
      }
    },
    steps: [
      {
        id: 'step-1',
        type: 'email',
        order: 0,
        email: {
          subject: '⏰ {{dealTitle}} expires in 7 days',
          templateId: 'expiry-1',
          fromName: 'REDUZED Alerts',
          fromEmail: 'alerts@reduzed.com',
          personalizations: ['firstName', 'dealTitle', 'merchantName', 'expiryDate'],
          language: 'en',
          priority: 'normal'
        }
      },
      {
        id: 'step-2',
        type: 'delay',
        order: 1,
        delay: { duration: 6, unit: 'days', workingDaysOnly: true }
      },
      {
        id: 'step-3',
        type: 'condition',
        order: 2,
        condition: {
          field: 'deal.isStillValid',
          operator: 'equals',
          value: 'true',
          truePath: ['step-4'],
          falsePath: []
        }
      },
      {
        id: 'step-4',
        type: 'email',
        order: 3,
        email: {
          subject: '🚨 Last Chance: {{dealTitle}} expires tomorrow!',
          templateId: 'expiry-urgent',
          fromName: 'REDUZED Alerts',
          fromEmail: 'alerts@reduzed.com',
          personalizations: ['firstName', 'dealTitle', 'merchantName', 'promoCode'],
          language: 'en',
          priority: 'high'
        }
      }
    ],
    isActive: true,
    stats: { totalSent: 1567, openRate: 38.7, clickRate: 15.2, conversionRate: 23.8 },
    createdAt: '2024-11-20T14:30:00Z',
    updatedAt: '2024-12-20T11:15:00Z',
    tags: ['expiration', 'urgent', 'deals'],
    priority: 'medium'
  },
  {
    id: '3',
    name: 'Re-engagement Campaign',
    description: 'Win back inactive users who haven\'t logged in for 30 days.',
    trigger: { 
      type: 'inactive_user',
      conditions: { 
        days: 30,
        userSegment: 'inactive'
      }
    },
    steps: [
      {
        id: 'step-1',
        type: 'email',
        order: 0,
        email: {
          subject: 'We Miss You! New Deals Waiting',
          templateId: 'inactive-1',
          fromName: 'REDUZED Team',
          fromEmail: 'team@reduzed.com',
          personalizations: ['firstName'],
          language: 'en',
          priority: 'normal'
        }
      },
      {
        id: 'step-2',
        type: 'delay',
        order: 1,
        delay: { duration: 1, unit: 'weeks', workingDaysOnly: false }
      },
      {
        id: 'step-3',
        type: 'webhook',
        order: 2,
        webhook: {
          url: 'https://api.reduzed.com/analytics/track',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: '{"event": "reengagement_email_sent", "user_id": "{{user.id}}"}'
        }
      }
    ],
    isActive: false,
    stats: { totalSent: 89, openRate: 28.1, clickRate: 5.6, conversionRate: 8.9 },
    createdAt: '2024-12-01T10:00:00Z',
    updatedAt: '2024-12-15T14:30:00Z',
    tags: ['reengagement', 'inactive'],
    priority: 'low'
  }
];

// Mock email templates
const mockEmailTemplates: EmailTemplate[] = [
  {
    id: 'welcome-1',
    name: 'Welcome Email - Simple',
    subject: 'Welcome to REDUZED!',
    type: 'welcome',
    category: 'Automated',
    htmlContent: `<div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
      <div style="background: #3b82f6; padding: 40px 20px; text-align: center; color: white;">
        <h1>Welcome to REDUZED!</h1>
        <p>Your AI Deal Finder for Trading</p>
      </div>
      <div style="padding: 30px 20px;">
        <h2>Hi {{firstName}},</h2>
        <p>Welcome to REDUZED! We're excited to help you save money on your next trading challenge.</p>
      </div>
    </div>`,
    variables: ['firstName'],
    isActive: true,
    usageCount: 234,
    createdAt: '2024-12-01T10:00:00Z',
    updatedAt: '2024-12-15T14:30:00Z'
  },
  {
    id: 'expiry-1',
    name: 'Deal Expiring - 7 Days Warning',
    subject: '⏰ {{dealTitle}} expires in 7 days',
    type: 'expiring',
    category: 'Automated',
    htmlContent: `<div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
      <div style="background: linear-gradient(135deg, #f97316, #dc2626); padding: 40px 20px; text-align: center; color: white;">
        <h1>⏰ Deal Expires Soon!</h1>
        <p>Don't miss out on this exclusive offer</p>
      </div>
      <div style="padding: 30px 20px;">
        <h2>Hi {{firstName}},</h2>
        <p>Your saved deal from <strong>{{merchantName}}</strong> expires in <strong>7 days</strong>!</p>
      </div>
    </div>`,
    variables: ['firstName', 'dealTitle', 'merchantName', 'expiryDate'],
    isActive: true,
    usageCount: 1567,
    createdAt: '2024-11-20T09:00:00Z',
    updatedAt: '2024-12-10T16:45:00Z'
  }
];

export function EmailManagement({ deals }: EmailManagementProps) {
  const [activeTab, setActiveTab] = useState('campaigns');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentView, setCurrentView] = useState<'list' | 'edit' | 'create' | 'flows' | 'templates' | 'guide' | 'languages' | 'banners' | 'weekly-templates'>('list');
  const [editingCampaign, setEditingCampaign] = useState<EmailCampaign | null>(null);
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>(mockCampaigns);
  const [emailFlows, setEmailFlows] = useState<EmailFlow[]>(mockEmailFlows);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>(mockEmailTemplates);
  const [deleteCampaignId, setDeleteCampaignId] = useState<string | null>(null);

  // Language settings state
  const [emailLanguageSettings, setEmailLanguageSettings] = useState<EmailLanguageSettings>({
    defaultLanguage: 'en',
    enabledLanguages: ['en', 'es', 'pt-BR', 'fr', 'de'],
    autoTranslateEmails: true,
    userLanguagePreference: 'auto',
    fallbackToEnglish: true
  });

  const handleSendTest = (templateType: string, email: string) => {
    // In real implementation, this would call your backend API
    console.log('Sending test email:', templateType, 'to', email);
    toast.success(`Test email sent to ${email}`);
  };

  const handleCampaignToggle = (campaignId: string, isActive: boolean) => {
    // In real implementation, this would update your backend
    console.log('Campaign toggle:', campaignId, isActive);
  };

  const handleTimeChange = (campaignId: string, time: string) => {
    // In real implementation, this would update your backend
    console.log('Time change:', campaignId, time);
  };

  // Campaign management handlers
  const handleCreateCampaign = () => {
    setEditingCampaign(null);
    setCurrentView('create');
  };

  const handleEditCampaign = (campaign: EmailCampaign) => {
    setEditingCampaign(campaign);
    setCurrentView('edit');
  };

  const handleSaveCampaign = (campaign: EmailCampaign) => {
    setCampaigns(prev => {
      const existing = prev.find(c => c.id === campaign.id);
      if (existing) {
        return prev.map(c => c.id === campaign.id ? campaign : c);
      } else {
        return [...prev, campaign];
      }
    });
    setCurrentView('list');
    setEditingCampaign(null);
  };

  const handlePublishCampaign = (campaign: EmailCampaign) => {
    setCampaigns(prev => {
      const existing = prev.find(c => c.id === campaign.id);
      if (existing) {
        return prev.map(c => c.id === campaign.id ? campaign : c);
      } else {
        return [...prev, campaign];
      }
    });
    setCurrentView('list');
    setEditingCampaign(null);
  };

  const handleDeleteCampaign = (campaignId: string) => {
    setCampaigns(prev => prev.filter(c => c.id !== campaignId));
    setDeleteCampaignId(null);
  };

  const handleDuplicateCampaign = (campaign: EmailCampaign) => {
    setCampaigns(prev => [...prev, campaign]);
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setEditingCampaign(null);
  };

  // Email flow handlers
  const handleSaveEmailFlow = (flow: EmailFlow) => {
    setEmailFlows(prev => {
      const existing = prev.find(f => f.id === flow.id);
      if (existing) {
        return prev.map(f => f.id === flow.id ? flow : f);
      } else {
        return [...prev, flow];
      }
    });
  };

  const handleDeleteEmailFlow = (flowId: string) => {
    setEmailFlows(prev => prev.filter(f => f.id !== flowId));
  };

  const handleToggleEmailFlow = (flowId: string, isActive: boolean) => {
    setEmailFlows(prev => prev.map(f => 
      f.id === flowId ? { ...f, isActive, updatedAt: new Date().toISOString() } : f
    ));
  };

  // Email template handlers
  const handleSaveEmailTemplate = (template: EmailTemplate) => {
    setEmailTemplates(prev => {
      const existing = prev.find(t => t.id === template.id);
      if (existing) {
        return prev.map(t => t.id === template.id ? template : t);
      } else {
        return [...prev, template];
      }
    });
  };

  const handleDeleteEmailTemplate = (templateId: string) => {
    setEmailTemplates(prev => prev.filter(t => t.id !== templateId));
  };

  const handleDuplicateEmailTemplate = (template: EmailTemplate) => {
    setEmailTemplates(prev => [...prev, template]);
  };

  // Language settings handlers
  const handleLanguageToggle = (langCode: string) => {
    setEmailLanguageSettings(prev => ({
      ...prev,
      enabledLanguages: prev.enabledLanguages.includes(langCode)
        ? prev.enabledLanguages.filter(code => code !== langCode)
        : [...prev.enabledLanguages, langCode]
    }));
  };

  const handleTranslateEmailCampaign = async (campaignId: string, targetLanguages: string[]) => {
    toast.info(`Translating email campaign to ${targetLanguages.length} languages...`);
    
    // Simulate API call to translation service
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setCampaigns(prev => prev.map(campaign => 
      campaign.id === campaignId 
        ? { 
            ...campaign, 
            // Add language metadata (in real implementation, you'd store translated versions)
            languageSettings: {
              targetLanguages,
              autoTranslate: true,
              translateSubject: true,
              translateContent: true
            }
          } 
        : campaign
    ));
    
    toast.success(`Email campaign translated to ${targetLanguages.length} languages!`);
  };

  const handleBulkTranslateEmails = async () => {
    const activeLanguages = emailLanguageSettings.enabledLanguages.filter(lang => lang !== emailLanguageSettings.defaultLanguage);
    
    toast.info(`Translating all email templates and campaigns to ${activeLanguages.length} languages...`);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    toast.success('All email content translated successfully!');
  };

  const handleRefreshData = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
    toast.success("Deal data refreshed");
  };

  const handleExportSubscribers = () => {
    toast.info("Exporting subscriber list...");
  };

  const handleImportSubscribers = () => {
    toast.info("Opening import dialog...");
  };

  // Analytics data (would come from backend)
  const analyticsData = {
    totalSent: 3741,
    totalOpens: 976,
    totalClicks: 187,
    openRate: 26.1,
    clickRate: 5.0,
    growthRate: 12.5
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Email Management</h1>
          <p className="text-slate-600 mt-1">
            {currentView === 'list' ? 'Control your weekly deal campaigns from one place' :
             currentView === 'create' ? 'Create a new email campaign' :
             'Edit your email campaign'}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {currentView === 'list' && (
            <>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRefreshData}
                disabled={isRefreshing}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
              </Button>
              
              <Button onClick={handleCreateCampaign}>
                <Plus className="w-4 h-4 mr-2" />
                Create Campaign
              </Button>
            </>
          )}
          
          <Badge className="bg-green-100 text-green-700 border-green-200">
            {deals.length} Active Deals
          </Badge>
        </div>
      </div>

      {/* Show different views based on currentView */}
      {currentView === 'edit' || currentView === 'create' ? (
        <EmailCampaignEditor
          campaign={editingCampaign || undefined}
          deals={deals}
          onSave={handleSaveCampaign}
          onDelete={currentView === 'edit' ? handleDeleteCampaign : undefined}
          onPublish={handlePublishCampaign}
          onBack={handleBackToList}
          isNew={currentView === 'create'}
        />
      ) : currentView === 'flows' ? (
        <EmailFlowBuilderAdvanced
          flows={emailFlows}
          onSaveFlow={handleSaveEmailFlow}
          onDeleteFlow={handleDeleteEmailFlow}
          onToggleFlow={handleToggleEmailFlow}
          onDuplicateFlow={(flow) => setEmailFlows(prev => [...prev, flow])}
          onBack={() => setCurrentView('list')}
        />
      ) : currentView === 'templates' ? (
        <EmailTemplateManager
          templates={emailTemplates}
          onSaveTemplate={handleSaveEmailTemplate}
          onDeleteTemplate={handleDeleteEmailTemplate}
          onDuplicateTemplate={handleDuplicateEmailTemplate}
          onBack={() => setCurrentView('list')}
        />
      ) : currentView === 'guide' ? (
        <EmailSystemGuide
          onClose={() => setCurrentView('list')}
        />
      ) : currentView === 'weekly-templates' ? (
        <WeeklyEmailTemplateEditor
          onBack={() => setCurrentView('list')}
          deals={deals}
          availableLanguages={emailLanguageSettings.enabledLanguages}
        />
      ) : currentView === 'banners' ? (
        <EmailBannerManager
          onBack={() => setCurrentView('list')}
        />
      ) : currentView === 'languages' ? (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Languages className="w-5 h-5 text-white" />
                </div>
                Email Languages
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Configure multi-language email campaigns and choose how to handle user language preferences
              </p>
            </div>
            <Button onClick={() => setCurrentView('list')} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Campaigns
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Global Email Language Settings */}
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-500" />
                  Global Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Default Language */}
                <div className="space-y-2">
                  <Label>Default Email Language</Label>
                  <Select 
                    value={emailLanguageSettings.defaultLanguage} 
                    onValueChange={(value) => setEmailLanguageSettings(prev => ({ ...prev, defaultLanguage: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EMAIL_LANGUAGES.map(lang => (
                        <SelectItem key={lang.code} value={lang.code}>
                          <div className="flex items-center gap-2">
                            <span>{lang.flag}</span>
                            <span>{lang.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500">Fallback language when user's preferred language isn't available</p>
                </div>

                {/* User Language Preference Strategy */}
                <div className="space-y-2">
                  <Label>Email Language Strategy</Label>
                  <Select 
                    value={emailLanguageSettings.userLanguagePreference} 
                    onValueChange={(value: 'auto' | 'english_only' | 'local_only') => 
                      setEmailLanguageSettings(prev => ({ ...prev, userLanguagePreference: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">
                        <div className="space-y-1">
                          <div className="font-medium">Auto-detect (Recommended)</div>
                          <div className="text-xs text-slate-500">Send emails in user's browser language if available</div>
                        </div>
                      </SelectItem>
                      <SelectItem value="english_only">
                        <div className="space-y-1">
                          <div className="font-medium">English Only</div>
                          <div className="text-xs text-slate-500">All emails sent in English regardless of user preference</div>
                        </div>
                      </SelectItem>
                      <SelectItem value="local_only">
                        <div className="space-y-1">
                          <div className="font-medium">Local Language Only</div>
                          <div className="text-xs text-slate-500">Only send emails if user's language is available</div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Auto-Translate Toggle */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <Label>Auto-Translate New Campaigns</Label>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Automatically translate new email campaigns to enabled languages
                    </p>
                  </div>
                  <Switch 
                    checked={emailLanguageSettings.autoTranslateEmails} 
                    onCheckedChange={(checked) => setEmailLanguageSettings(prev => ({ ...prev, autoTranslateEmails: checked }))}
                  />
                </div>

                {/* Fallback to English */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <Label>Fallback to English</Label>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Send English version if user's language translation isn't available
                    </p>
                  </div>
                  <Switch 
                    checked={emailLanguageSettings.fallbackToEnglish} 
                    onCheckedChange={(checked) => setEmailLanguageSettings(prev => ({ ...prev, fallbackToEnglish: checked }))}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button onClick={() => toast.success('Language settings saved!')}>
                    Save Settings
                  </Button>
                  <Button variant="outline" onClick={handleBulkTranslateEmails}>
                    <Zap className="w-4 h-4 mr-2" />
                    Translate All Content
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Enabled Languages */}
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-500" />
                  Enabled Languages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 gap-3">
                    {EMAIL_LANGUAGES.map(lang => (
                      <div key={lang.code} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{lang.flag}</span>
                          <div>
                            <div className="font-medium text-sm">{lang.name}</div>
                            <div className="text-xs text-slate-500">{lang.nativeName}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {lang.code === emailLanguageSettings.defaultLanguage && (
                            <Badge variant="secondary" className="text-xs">Default</Badge>
                          )}
                          <Switch
                            checked={emailLanguageSettings.enabledLanguages.includes(lang.code)}
                            onCheckedChange={() => handleLanguageToggle(lang.code)}
                            disabled={lang.code === emailLanguageSettings.defaultLanguage}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Summary */}
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg mt-4">
                    <div className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                      Email Coverage Summary
                    </div>
                    <div className="text-sm text-blue-700 dark:text-blue-200">
                      <div>✓ {emailLanguageSettings.enabledLanguages.length} languages enabled</div>
                      <div>✓ Emails will be sent in user's preferred language when available</div>
                      <div>✓ {emailLanguageSettings.fallbackToEnglish ? 'English fallback enabled' : 'No fallback - emails only sent in available languages'}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Email Language Analytics */}
          <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-500" />
                Language Performance Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {emailLanguageSettings.enabledLanguages.slice(0, 4).map(langCode => {
                  const lang = EMAIL_LANGUAGES.find(l => l.code === langCode);
                  const mockStats = {
                    openRate: Math.floor(Math.random() * 20) + 15,
                    clickRate: Math.floor(Math.random() * 8) + 2,
                    subscribers: Math.floor(Math.random() * 300) + 50
                  };
                  
                  return (
                    <div key={langCode} className="p-4 border rounded-lg text-center">
                      <div className="text-2xl mb-2">{lang?.flag}</div>
                      <div className="font-medium text-sm">{lang?.name}</div>
                      <div className="text-xs text-slate-500 mb-3">{mockStats.subscribers} subscribers</div>
                      <div className="space-y-1">
                        <div className="text-xs">
                          <span className="font-medium">{mockStats.openRate}%</span> open rate
                        </div>
                        <div className="text-xs">
                          <span className="font-medium">{mockStats.clickRate}%</span> click rate
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          {/* Main Tabs and Quick Actions */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex-1 w-full">
              <div className="grid w-full grid-cols-4 bg-white/70 backdrop-blur-xl border border-white/30 shadow-lg rounded-lg overflow-hidden">
                <Button
                  variant={activeTab === 'campaigns' ? 'default' : 'ghost'}
                  onClick={() => setActiveTab('campaigns')}
                  className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 rounded-none py-3 sm:py-2 px-2 sm:px-4 text-xs sm:text-sm"
                >
                  <History className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">Campaigns</span>
                </Button>
                <Button
                  variant={activeTab === 'templates' ? 'default' : 'ghost'}
                  onClick={() => setActiveTab('templates')}
                  className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 rounded-none py-3 sm:py-2 px-2 sm:px-4 text-xs sm:text-sm"
                >
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">Templates</span>
                </Button>
                <Button
                  variant={activeTab === 'scheduler' ? 'default' : 'ghost'}
                  onClick={() => setActiveTab('scheduler')}
                  className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 rounded-none py-3 sm:py-2 px-2 sm:px-4 text-xs sm:text-sm"
                >
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">Scheduler</span>
                </Button>
                <Button
                  variant={activeTab === 'subscribers' ? 'default' : 'ghost'}
                  onClick={() => setActiveTab('subscribers')}
                  className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 rounded-none py-3 sm:py-2 px-2 sm:px-4 text-xs sm:text-sm"
                >
                  <Users className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">Subscribers</span>
                </Button>
              </div>
            </div>
            
            {/* Quick Action Buttons */}
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setCurrentView('weekly-templates')}>
                <Clock className="w-4 h-4 mr-2" />
                Weekly Templates
              </Button>
              <Button variant="outline" onClick={() => setCurrentView('banners')}>
                <Image className="w-4 h-4 mr-2" />
                Banners
              </Button>
              <Button variant="outline" onClick={() => setCurrentView('languages')}>
                <Languages className="w-4 h-4 mr-2" />
                Languages
              </Button>
              <Button variant="outline" onClick={() => setCurrentView('guide')}>
                <HelpCircle className="w-4 h-4 mr-2" />
                Setup Guide
              </Button>
              <Button variant="outline" onClick={() => setCurrentView('flows')}>
                <Zap className="w-4 h-4 mr-2" />
                Email Flows
              </Button>
              <Button variant="outline" onClick={() => setCurrentView('templates')}>
                <FileText className="w-4 h-4 mr-2" />
                Templates
              </Button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'campaigns' && (
            <div className="mt-6 space-y-4">
              {/* Email System Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Language Settings Summary */}
                <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Languages className="w-5 h-5 text-blue-500" />
                        <div>
                          <div className="font-medium text-blue-900 dark:text-blue-100">
                            Language Settings
                          </div>
                          <div className="text-sm text-blue-700 dark:text-blue-200">
                            {emailLanguageSettings.enabledLanguages.length} languages • 
                            {emailLanguageSettings.userLanguagePreference === 'auto' ? 'Auto-detect' : 
                             emailLanguageSettings.userLanguagePreference === 'english_only' ? 'English Only' : 'Local Only'}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setCurrentView('languages')}>
                          <Settings className="w-3 h-3 mr-1" />
                          Configure
                        </Button>
                        {emailLanguageSettings.autoTranslateEmails && (
                          <Badge variant="secondary" className="text-xs">
                            Auto-translate ON
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Banner Settings Summary */}
                <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Image className="w-5 h-5 text-purple-500" />
                        <div>
                          <div className="font-medium text-purple-900 dark:text-purple-100">
                            Email Banners
                          </div>
                          <div className="text-sm text-purple-700 dark:text-purple-200">
                            Control banner design for all emails
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setCurrentView('banners')}>
                        <Settings className="w-3 h-3 mr-1" />
                        Manage
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Weekly Templates Quick Access */}
              <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-green-500" />
                      <div>
                        <div className="font-medium text-green-900 dark:text-green-100">
                          Weekly Email Templates
                        </div>
                        <div className="text-sm text-green-700 dark:text-green-200">
                          Edit Monday CFD, Tuesday Futures & more
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setCurrentView('weekly-templates')}>
                      <Edit className="w-3 h-3 mr-1" />
                      Edit Templates
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <EmailCampaignHistory
                campaigns={campaigns}
                onEditCampaign={handleEditCampaign}
                onDeleteCampaign={(id) => setDeleteCampaignId(id)}
                onDuplicateCampaign={handleDuplicateCampaign}
                onCreateNew={handleCreateCampaign}
                onTranslateCampaign={handleTranslateEmailCampaign}
                emailLanguageSettings={emailLanguageSettings}
              />
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="mt-6 space-y-4">
              {/* Template Language Options */}
              <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-slate-500" />
                        <Label>Preview Language:</Label>
                      </div>
                      <Select defaultValue="en">
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {emailLanguageSettings.enabledLanguages.map(langCode => {
                            const lang = EMAIL_LANGUAGES.find(l => l.code === langCode);
                            return (
                              <SelectItem key={langCode} value={langCode}>
                                <div className="flex items-center gap-2">
                                  <span>{lang?.flag}</span>
                                  <span>{lang?.name}</span>
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => toast.info('Translating all templates...')}>
                      <Zap className="w-3 h-3 mr-1" />
                      Translate Templates
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <EmailTemplatePreview 
                deals={deals} 
                onSendTest={handleSendTest}
                availableLanguages={emailLanguageSettings.enabledLanguages}
                emailLanguages={EMAIL_LANGUAGES}
              />
            </div>
          )}

          {activeTab === 'scheduler' && (
            <div className="mt-6">
              <EmailScheduler 
                onCampaignToggle={handleCampaignToggle}
                onTimeChange={handleTimeChange}
              />
            </div>
          )}

          {activeTab === 'subscribers' && (
            <div className="mt-6">
              <div className="space-y-6">
                {/* Subscriber Actions */}
                <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-blue-500" />
                      Subscriber Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button onClick={handleExportSubscribers} className="flex-1">
                        <Download className="w-4 h-4 mr-2" />
                        Export Subscribers
                      </Button>
                      <Button variant="outline" onClick={handleImportSubscribers} className="flex-1">
                        <Upload className="w-4 h-4 mr-2" />
                        Import Subscribers
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Subscriber Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-xl">
                    <CardContent className="p-6 text-center">
                      <div className="text-3xl font-bold text-slate-900 mb-2">1,247</div>
                      <div className="text-sm text-slate-600">Total Subscribers</div>
                      <div className="text-xs text-green-600 mt-1">↗ +156 this month</div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-xl">
                    <CardContent className="p-6 text-center">
                      <div className="text-3xl font-bold text-slate-900 mb-2">1,189</div>
                      <div className="text-sm text-slate-600">Active Subscribers</div>
                      <div className="text-xs text-slate-500 mt-1">95.3% engagement</div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-xl">
                    <CardContent className="p-6 text-center">
                      <div className="text-3xl font-bold text-slate-900 mb-2">58</div>
                      <div className="text-sm text-slate-600">Unsubscribed</div>
                      <div className="text-xs text-slate-500 mt-1">4.7% churn rate</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Subscription Preferences */}
                <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle>Subscription Preferences</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200">
                        <div>
                          <h4 className="font-semibold text-slate-900">CFD Deals</h4>
                          <p className="text-sm text-slate-600">Subscribers who want CFD prop trading deals</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-slate-900">892</p>
                          <p className="text-sm text-slate-600">71.5%</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200">
                        <div>
                          <h4 className="font-semibold text-slate-900">Futures Deals</h4>
                          <p className="text-sm text-slate-600">Subscribers who want futures prop trading deals</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-slate-900">734</p>
                          <p className="text-sm text-slate-600">58.9%</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200">
                        <div>
                          <h4 className="font-semibold text-slate-900">Broker Bonuses</h4>
                          <p className="text-sm text-slate-600">Subscribers who want broker bonus offers</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-slate-900">623</p>
                          <p className="text-sm text-slate-600">50.0%</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200">
                        <div>
                          <h4 className="font-semibold text-slate-900">Expiring Deals</h4>
                          <p className="text-sm text-slate-600">Subscribers who want urgent deal alerts</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-slate-900">1,034</p>
                          <p className="text-sm text-slate-600">82.9%</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </>
      )}

      {/* Delete Campaign Dialog */}
      <AlertDialog open={!!deleteCampaignId} onOpenChange={(open) => !open && setDeleteCampaignId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Campaign</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this campaign? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteCampaignId && handleDeleteCampaign(deleteCampaignId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Campaign
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}