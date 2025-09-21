import { useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Copy, Download, Send, Calendar, Clock, Trophy, TrendingUp, DollarSign, Mail, Eye, Smartphone, Monitor, Image, Palette } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { Coupon } from "./types";

interface EmailTemplatePreviewProps {
  deals: Coupon[];
  onSendTest?: (templateType: string, email: string) => void;
  availableLanguages?: string[];
  emailLanguages?: Array<{ code: string; name: string; flag: string }>;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  description: string;
  icon: any;
  color: string;
  day: string;
  category?: string;
}

const emailTemplates: EmailTemplate[] = [
  {
    id: 'monday-cfd',
    name: 'Monday CFD Deals',
    subject: 'This Week\'s CFD Challenge Deals',
    description: 'Weekly CFD prop trading deals and opportunities',
    icon: TrendingUp,
    color: 'bg-blue-500',
    day: 'Monday',
    category: 'CFD Prop'
  },
  {
    id: 'tuesday-futures',
    name: 'Tuesday Futures Deals',
    subject: 'This Week\'s Futures Challenge Deals',
    description: 'Latest futures prop trading discounts and bonuses',
    icon: DollarSign,
    color: 'bg-blue-500',
    day: 'Tuesday',
    category: 'Futures Prop'
  },
  {
    id: 'thursday-expiring',
    name: 'Thursday Expiring Deals',
    subject: 'Deals Expiring This Weekend',
    description: 'Time-sensitive deals ending soon',
    icon: Clock,
    color: 'bg-blue-500',
    day: 'Thursday'
  }
];

// Banner options for email templates
const bannerOptions = [
  { id: 'none', name: 'No Banner', type: 'none' },
  { id: 'reduzed-primary', name: 'REDUZED Primary Blue', type: 'logo_text', backgroundColor: '#3b82f6', textColor: '#ffffff' },
  { id: 'reduzed-minimal', name: 'REDUZED Minimal', type: 'color_only', backgroundColor: '#f8fafc', textColor: '#1e293b' },
  { id: 'reduzed-gradient', name: 'REDUZED Gradient', type: 'logo_text', backgroundColor: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', textColor: '#ffffff' },
  { id: 'deals-promo', name: 'Deals Promo Banner', type: 'full_custom' },
  { id: 'urgent-expiry', name: 'Urgent Expiry Alert', type: 'full_custom' }
];

export function EmailTemplatePreview({ deals, onSendTest, availableLanguages, emailLanguages }: EmailTemplatePreviewProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('monday-cfd');
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('mobile');
  const [testEmail, setTestEmail] = useState('');
  const [selectedBanner, setSelectedBanner] = useState<string>('reduzed-primary');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');

  const currentTemplate = emailTemplates.find(t => t.id === selectedTemplate)!;

  // Filter deals based on template type
  const getFilteredDeals = (template: EmailTemplate) => {
    if (template.id === 'thursday-expiring') {
      // Get deals expiring soon (within 7 days)
      const weekFromNow = new Date();
      weekFromNow.setDate(weekFromNow.getDate() + 7);
      
      return deals
        .filter(deal => {
          const endDate = new Date(deal.endDate);
          return endDate <= weekFromNow && endDate > new Date();
        })
        .slice(0, 5);
    } else if (template.category) {
      return deals
        .filter(deal => deal.category === template.category)
        .slice(0, 4);
    }
    return deals.slice(0, 4);
  };

  const getBrokerDeals = () => {
    return deals
      .filter(deal => deal.category === 'Broker Bonuses')
      .slice(0, 2);
  };

  const templateDeals = getFilteredDeals(currentTemplate);
  const brokerDeals = getBrokerDeals();

  const handleCopyHTML = () => {
    // In a real implementation, this would generate actual HTML
    toast.success("Email HTML copied to clipboard!");
  };

  const handleSendTest = () => {
    if (!testEmail) {
      toast.error("Please enter an email address");
      return;
    }
    onSendTest?.(selectedTemplate, testEmail);
    toast.success(`Test email sent to ${testEmail}`);
    setTestEmail('');
  };

  const renderBanner = () => {
    const banner = bannerOptions.find(b => b.id === selectedBanner);
    
    if (!banner || banner.type === 'none') {
      return null;
    }

    if (banner.id === 'deals-promo') {
      return (
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-5 text-center text-white">
          <h2 className="text-xl font-bold mb-1">🎯 EXCLUSIVE DEALS INSIDE</h2>
          <p className="text-sm opacity-90">Save money on your next prop trading challenge</p>
        </div>
      );
    }

    if (banner.id === 'urgent-expiry') {
      return (
        <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 text-center text-white border-l-4 border-white">
          <div className="flex items-center justify-center gap-3">
            <span className="text-2xl">⏰</span>
            <div>
              <h3 className="font-bold">DEAL EXPIRES SOON</h3>
              <p className="text-sm opacity-90">Don't miss out on this exclusive offer</p>
            </div>
          </div>
        </div>
      );
    }

    if (banner.type === 'color_only') {
      return (
        <div 
          className="p-5 text-center"
          style={{ 
            background: banner.backgroundColor,
            color: banner.textColor 
          }}
        >
          <div className="font-bold text-lg">REDUZED</div>
          <div className="text-sm opacity-90">AI Deal Finder</div>
        </div>
      );
    }

    // Default logo_text banner
    return (
      <div 
        className="p-6 text-center"
        style={{ 
          background: banner.backgroundColor,
          color: banner.textColor 
        }}
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <span className="font-bold">R</span>
          </div>
          <div>
            <div className="font-bold">REDUZED</div>
            <div className="text-sm opacity-90">AI Deal Finder</div>
          </div>
        </div>
        
        <h1 className="font-bold mb-2">
          {currentTemplate.id === 'monday-cfd' && "This Week's CFD Deals"}
          {currentTemplate.id === 'tuesday-futures' && "This Week's Futures Deals"}
          {currentTemplate.id === 'thursday-expiring' && "⏰ Deals Expiring Soon"}
        </h1>
        
        <p className="text-sm opacity-90">
          {templateDeals.length} verified deals
        </p>
      </div>
    );
  };

  const renderEmailContent = () => {
    const containerWidth = viewMode === 'mobile' ? 'max-w-sm' : 'max-w-2xl';
    
    return (
      <div className={`${containerWidth} mx-auto bg-white rounded-lg shadow-lg overflow-hidden`}>
        {/* Banner Section */}
        {renderBanner()}

        {/* Clean Deals Section */}
        <div className="p-6">
          <div className="space-y-4">
            {templateDeals.map((deal, index) => (
              <div key={deal.id} className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-start gap-4">
                  {/* Simple logo */}
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-slate-700">
                      {deal.merchant.charAt(0)}
                    </span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <div className="font-bold text-slate-900">{deal.merchant}</div>
                        <div className="text-sm text-slate-600">{deal.title}</div>
                      </div>
                      <div className="bg-blue-500 text-white text-sm px-3 py-1 rounded-full font-medium flex-shrink-0">
                        {deal.discount}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="text-slate-500">
                        {currentTemplate.id === 'thursday-expiring' ? (
                          <span className="text-orange-600 font-medium">
                            ⏰ Expires {deal.validUntil}
                          </span>
                        ) : (
                          <span>Valid until {deal.validUntil}</span>
                        )}
                      </div>
                      <div className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs">
                        {deal.code}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Simple CTA */}
          <div className="mt-6 text-center">
            <div className="bg-blue-500 text-white px-6 py-3 rounded-lg font-medium inline-block">
              {currentTemplate.id === 'thursday-expiring' ? 'Get Deals Now' : 'View All Deals'}
            </div>
          </div>

          {/* Broker section if available */}
          {brokerDeals.length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-200">
              <h3 className="font-bold text-slate-900 mb-4 text-center">
                Broker Deals Available
              </h3>
              
              <div className="space-y-3">
                {brokerDeals.map((deal) => (
                  <div key={deal.id} className="bg-slate-50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                          <span className="text-xs font-bold text-slate-600">
                            {deal.merchant.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-slate-900 text-sm">{deal.merchant}</div>
                          <div className="text-xs text-slate-600">{deal.title}</div>
                        </div>
                      </div>
                      <div className="text-blue-500 font-medium text-sm">
                        {deal.discount}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Simple Footer */}
        <div className="bg-slate-50 p-6 text-center border-t border-slate-200">
          <div className="text-sm text-slate-700 mb-2">
            <strong>REDUZED</strong> - Save Money on Trading
          </div>
          <div className="text-xs text-slate-500">
            <a href="#" className="hover:text-blue-500">Unsubscribe</a> | 
            <a href="#" className="hover:text-blue-500"> Privacy</a>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Template Selection */}
      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-xl">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3">
            <Mail className="w-6 h-6 text-blue-500" />
            Email Template Preview System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTemplate} onValueChange={setSelectedTemplate}>
            <TabsList className="grid w-full grid-cols-3 bg-slate-100">
              {emailTemplates.map((template) => (
                <TabsTrigger 
                  key={template.id} 
                  value={template.id}
                  className="flex items-center gap-2 data-[state=active]:bg-white"
                >
                  <template.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{template.day}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {emailTemplates.map((template) => (
              <TabsContent key={template.id} value={template.id} className="mt-6">
                <div className="bg-white rounded-2xl p-4 mb-6 border border-slate-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 ${template.color} rounded-2xl flex items-center justify-center`}>
                      <template.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 mb-1">{template.name}</h3>
                      <p className="text-sm text-slate-600 mb-3">{template.description}</p>
                      <div className="text-sm">
                        <strong>Subject:</strong> {template.subject.replace('{{date}}', 'Jan 6, 2025')}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Email Controls */}
      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="w-5 h-5 text-blue-500" />
            Email Customization
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Banner Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Email Banner</label>
              <select 
                value={selectedBanner} 
                onChange={(e) => setSelectedBanner(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-sm bg-white"
              >
                {bannerOptions.map(banner => (
                  <option key={banner.id} value={banner.id}>
                    {banner.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Language Selection */}
            {availableLanguages && emailLanguages && (
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Email Language</label>
                <select 
                  value={selectedLanguage} 
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-sm bg-white"
                >
                  {availableLanguages.map(langCode => {
                    const lang = emailLanguages.find(l => l.code === langCode);
                    return (
                      <option key={langCode} value={langCode}>
                        {lang?.flag} {lang?.name}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}

            {/* View Mode */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">View Mode</label>
              <div className="flex items-center bg-slate-100 rounded-lg p-1">
                <Button
                  size="sm"
                  variant={viewMode === 'mobile' ? 'default' : 'ghost'}
                  onClick={() => setViewMode('mobile')}
                  className="h-8 px-3 rounded-md flex-1"
                >
                  <Smartphone className="w-4 h-4 mr-1" />
                  Mobile
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === 'desktop' ? 'default' : 'ghost'}
                  onClick={() => setViewMode('desktop')}
                  className="h-8 px-3 rounded-md flex-1"
                >
                  <Monitor className="w-4 h-4 mr-1" />
                  Desktop
                </Button>
              </div>
            </div>
          </div>

          {/* Current Banner Preview */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">Banner Preview</label>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              {renderBanner() || (
                <div className="flex items-center justify-center h-12 bg-slate-100 text-slate-500 text-sm">
                  No Banner Selected
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-700">Quick Actions:</span>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleCopyHTML}>
            <Copy className="w-4 h-4 mr-2" />
            Copy HTML
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Email Preview */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-100 to-slate-200 p-6">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Eye className="w-5 h-5 text-slate-600" />
            <span className="font-semibold text-slate-700">Live Preview</span>
          </div>
          <div className="text-sm text-slate-500">
            {templateDeals.length} deals • {viewMode === 'mobile' ? 'Mobile' : 'Desktop'} view
          </div>
        </div>
        
        {renderEmailContent()}
      </Card>

      {/* Test Email Section */}
      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Send className="w-5 h-5 text-blue-500" />
            Send Test Email
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <input
              type="email"
              placeholder="Enter email address for test"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button onClick={handleSendTest} className="bg-blue-500 hover:bg-blue-600">
              <Send className="w-4 h-4 mr-2" />
              Send Test
            </Button>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Test emails help you verify templates before sending to your subscriber list
          </p>
        </CardContent>
      </Card>
    </div>
  );
}