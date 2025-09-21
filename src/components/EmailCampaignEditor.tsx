import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Switch } from "./ui/switch";
import { Badge } from "./ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { Save, Send, Eye, ArrowLeft, Trash2, Calendar, Mail, User, Clock, Target, Image, Globe } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { Coupon } from "./types";

export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  fromName: string;
  fromEmail: string;
  templateType: 'monday-cfd' | 'tuesday-futures' | 'thursday-expiring' | 'custom';
  status: 'draft' | 'scheduled' | 'sent';
  scheduledDate?: string;
  sentDate?: string;
  recipientCount: number;
  openRate?: number;
  clickRate?: number;
  ctr?: number;
  revenue?: number;
  createdAt: string;
  updatedAt: string;
  bannerId?: string;
  language?: string;
  content?: {
    preheader?: string;
    customMessage?: string;
    includeDeals: boolean;
    dealCategories: string[];
    ctaText: string;
    ctaUrl: string;
  };
}

interface EmailCampaignEditorProps {
  campaign?: EmailCampaign;
  deals: Coupon[];
  onSave: (campaign: EmailCampaign) => void;
  onDelete?: (campaignId: string) => void;
  onPublish: (campaign: EmailCampaign) => void;
  onBack: () => void;
  isNew?: boolean;
}

// Banner options for campaigns
const bannerOptions = [
  { id: 'none', name: 'No Banner', type: 'none' },
  { id: 'reduzed-primary', name: 'REDUZED Primary Blue', type: 'logo_text', backgroundColor: '#3b82f6', textColor: '#ffffff' },
  { id: 'reduzed-minimal', name: 'REDUZED Minimal', type: 'color_only', backgroundColor: '#f8fafc', textColor: '#1e293b' },
  { id: 'reduzed-gradient', name: 'REDUZED Gradient', type: 'logo_text', backgroundColor: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', textColor: '#ffffff' },
  { id: 'deals-promo', name: 'Deals Promo Banner', type: 'full_custom' },
  { id: 'urgent-expiry', name: 'Urgent Expiry Alert', type: 'full_custom' }
];

// Language options
const languageOptions = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)', flag: '🇧🇷' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' }
];

export function EmailCampaignEditor({ 
  campaign, 
  deals, 
  onSave, 
  onDelete, 
  onPublish, 
  onBack, 
  isNew = false 
}: EmailCampaignEditorProps) {
  const [formData, setFormData] = useState<EmailCampaign>({
    id: campaign?.id || Date.now().toString(),
    name: campaign?.name || '',
    subject: campaign?.subject || '',
    fromName: campaign?.fromName || 'REDUZED Team',
    fromEmail: campaign?.fromEmail || 'deals@reduzed.com',
    templateType: campaign?.templateType || 'monday-cfd',
    status: campaign?.status || 'draft',
    scheduledDate: campaign?.scheduledDate || '',
    sentDate: campaign?.sentDate || '',
    recipientCount: campaign?.recipientCount || 1247,
    openRate: campaign?.openRate,
    clickRate: campaign?.clickRate,
    ctr: campaign?.ctr,
    revenue: campaign?.revenue,
    createdAt: campaign?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    bannerId: campaign?.bannerId || 'reduzed-primary',
    language: campaign?.language || 'en',
    content: {
      preheader: campaign?.content?.preheader || '',
      customMessage: campaign?.content?.customMessage || '',
      includeDeals: campaign?.content?.includeDeals ?? true,
      dealCategories: campaign?.content?.dealCategories || ['CFD Prop', 'Futures Prop'],
      ctaText: campaign?.content?.ctaText || 'View All Deals',
      ctaUrl: campaign?.content?.ctaUrl || 'https://reduzed.com/deals'
    }
  });

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Track changes
  useEffect(() => {
    if (!isNew) {
      setHasUnsavedChanges(JSON.stringify(formData) !== JSON.stringify(campaign));
    } else {
      setHasUnsavedChanges(formData.name !== '' || formData.subject !== '');
    }
  }, [formData, campaign, isNew]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      updatedAt: new Date().toISOString()
    }));
  };

  const handleContentChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      content: {
        ...prev.content!,
        [field]: value
      },
      updatedAt: new Date().toISOString()
    }));
  };

  const handleSave = () => {
    if (!formData.name || !formData.subject) {
      toast.error("Please fill in campaign name and subject");
      return;
    }

    onSave(formData);
    setHasUnsavedChanges(false);
    toast.success("Campaign saved as draft");
  };

  const handlePublish = () => {
    if (!formData.name || !formData.subject) {
      toast.error("Please fill in campaign name and subject");
      return;
    }

    const publishedCampaign = {
      ...formData,
      status: 'scheduled' as const,
      scheduledDate: new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 minutes from now
    };

    onPublish(publishedCampaign);
    toast.success("Campaign scheduled for publishing");
  };

  const handleDelete = () => {
    if (onDelete && campaign?.id) {
      onDelete(campaign.id);
      setShowDeleteDialog(false);
      toast.success("Campaign deleted");
      onBack();
    }
  };

  const getTemplateSubjects = () => {
    switch (formData.templateType) {
      case 'monday-cfd':
        return [
          "This Week's CFD Challenge Deals",
          "New CFD Prop Trading Discounts Available",
          "Monday CFD Deals - Save Money This Week"
        ];
      case 'tuesday-futures':
        return [
          "This Week's Futures Challenge Deals",
          "Futures Prop Trading Discounts Inside",
          "Tuesday Futures Deals - Don't Miss Out"
        ];
      case 'thursday-expiring':
        return [
          "⏰ Deals Expiring This Weekend",
          "Last Chance - Deals End Soon",
          "48 Hours Left - Grab These Deals"
        ];
      default:
        return ["Custom Email Campaign"];
    }
  };

  const getFilteredDeals = () => {
    if (!formData.content?.includeDeals) return [];
    
    return deals.filter(deal => 
      formData.content?.dealCategories.includes(deal.category)
    ).slice(0, 4);
  };

  const renderBanner = () => {
    const banner = bannerOptions.find(b => b.id === formData.bannerId);
    
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
        
        <h1 className="font-bold mb-2">{formData.subject}</h1>
        
        {formData.content?.preheader && (
          <p className="text-sm opacity-90">{formData.content.preheader}</p>
        )}
      </div>
    );
  };

  const renderPreview = () => {
    const filteredDeals = getFilteredDeals();

    return (
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Banner Section */}
        {renderBanner()}

        {/* Custom Message */}
        {formData.content?.customMessage && (
          <div className="p-6 bg-slate-50 border-b border-slate-200">
            <p className="text-slate-700">{formData.content.customMessage}</p>
          </div>
        )}

        {/* Deals Section */}
        {formData.content?.includeDeals && filteredDeals.length > 0 && (
          <div className="p-6">
            <div className="space-y-4">
              {filteredDeals.map((deal) => (
                <div key={deal.id} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
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
                        <div className="bg-blue-500 text-white text-sm px-3 py-1 rounded-full font-medium">
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

            {/* CTA */}
            <div className="mt-6 text-center">
              <div className="bg-blue-500 text-white px-6 py-3 rounded-lg font-medium inline-block">
                {formData.content?.ctaText}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {isNew ? 'Create New Campaign' : 'Edit Campaign'}
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <Badge variant={formData.status === 'draft' ? 'secondary' : formData.status === 'scheduled' ? 'default' : 'outline'}>
                {formData.status}
              </Badge>
              {hasUnsavedChanges && (
                <Badge variant="outline" className="text-orange-600 border-orange-200">
                  Unsaved Changes
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setIsPreviewMode(!isPreviewMode)}>
            <Eye className="w-4 h-4 mr-2" />
            {isPreviewMode ? 'Hide Preview' : 'Preview'}
          </Button>
          
          {!isNew && onDelete && (
            <Button variant="outline" onClick={() => setShowDeleteDialog(true)}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor Panel */}
        <div className="space-y-6">
          {/* Basic Settings */}
          <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-500" />
                Campaign Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Campaign Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Monday CFD Deals - Week 1"
                />
              </div>

              <div>
                <Label htmlFor="templateType">Template Type</Label>
                <Select value={formData.templateType} onValueChange={(value) => handleInputChange('templateType', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monday-cfd">Monday CFD Deals</SelectItem>
                    <SelectItem value="tuesday-futures">Tuesday Futures Deals</SelectItem>
                    <SelectItem value="thursday-expiring">Thursday Expiring Deals</SelectItem>
                    <SelectItem value="custom">Custom Template</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="subject">Email Subject Line</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  placeholder="Enter email subject"
                />
                <div className="mt-2">
                  <p className="text-sm text-slate-600 mb-2">Quick suggestions:</p>
                  <div className="flex flex-wrap gap-2">
                    {getTemplateSubjects().map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleInputChange('subject', suggestion)}
                        className="text-xs"
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="preheader">Preheader Text (Optional)</Label>
                <Input
                  id="preheader"
                  value={formData.content?.preheader || ''}
                  onChange={(e) => handleContentChange('preheader', e.target.value)}
                  placeholder="Preview text shown in email clients"
                />
              </div>
            </CardContent>
          </Card>

          {/* Sender Settings */}
          <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-blue-500" />
                Sender Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="fromName">From Name</Label>
                <Input
                  id="fromName"
                  value={formData.fromName}
                  onChange={(e) => handleInputChange('fromName', e.target.value)}
                  placeholder="REDUZED Team"
                />
              </div>

              <div>
                <Label htmlFor="fromEmail">From Email</Label>
                <Select value={formData.fromEmail} onValueChange={(value) => handleInputChange('fromEmail', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deals@reduzed.com">deals@reduzed.com</SelectItem>
                    <SelectItem value="team@reduzed.com">team@reduzed.com</SelectItem>
                    <SelectItem value="noreply@reduzed.com">noreply@reduzed.com</SelectItem>
                    <SelectItem value="support@reduzed.com">support@reduzed.com</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Design Settings */}
          <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="w-5 h-5 text-blue-500" />
                Design & Language
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="banner">Email Banner</Label>
                <Select value={formData.bannerId} onValueChange={(value) => handleInputChange('bannerId', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {bannerOptions.map((banner) => (
                      <SelectItem key={banner.id} value={banner.id}>
                        {banner.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-slate-600 mt-1">Controls the header banner appearance</p>
              </div>

              <div>
                <Label htmlFor="language">Email Language</Label>
                <Select value={formData.language} onValueChange={(value) => handleInputChange('language', value)}>
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
                <p className="text-sm text-slate-600 mt-1">Language for email content and interface</p>
              </div>

              {/* Banner Preview */}
              <div>
                <Label>Banner Preview</Label>
                <div className="border border-slate-200 rounded-lg overflow-hidden mt-2">
                  {renderBanner() || (
                    <div className="flex items-center justify-center h-12 bg-slate-100 text-slate-500 text-sm">
                      No Banner Selected
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Settings */}
          <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-500" />
                Content Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="customMessage">Custom Message (Optional)</Label>
                <Textarea
                  id="customMessage"
                  value={formData.content?.customMessage || ''}
                  onChange={(e) => handleContentChange('customMessage', e.target.value)}
                  placeholder="Add a personal message above the deals"
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Include Deals</Label>
                  <p className="text-sm text-slate-600">Show deals in this email</p>
                </div>
                <Switch
                  checked={formData.content?.includeDeals ?? true}
                  onCheckedChange={(checked) => handleContentChange('includeDeals', checked)}
                />
              </div>

              {formData.content?.includeDeals && (
                <>
                  <div>
                    <Label>Deal Categories</Label>
                    <div className="mt-2 space-y-2">
                      {['CFD Prop', 'Futures Prop', 'Broker Bonuses'].map((category) => (
                        <div key={category} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={category}
                            checked={formData.content?.dealCategories.includes(category) ?? false}
                            onChange={(e) => {
                              const currentCategories = formData.content?.dealCategories || [];
                              const newCategories = e.target.checked
                                ? [...currentCategories, category]
                                : currentCategories.filter(c => c !== category);
                              handleContentChange('dealCategories', newCategories);
                            }}
                            className="rounded"
                          />
                          <Label htmlFor={category} className="text-sm">{category}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="ctaText">Call-to-Action Text</Label>
                    <Input
                      id="ctaText"
                      value={formData.content?.ctaText || ''}
                      onChange={(e) => handleContentChange('ctaText', e.target.value)}
                      placeholder="View All Deals"
                    />
                  </div>

                  <div>
                    <Label htmlFor="ctaUrl">Call-to-Action URL</Label>
                    <Input
                      id="ctaUrl"
                      value={formData.content?.ctaUrl || ''}
                      onChange={(e) => handleContentChange('ctaUrl', e.target.value)}
                      placeholder="https://reduzed.com/deals"
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button onClick={handleSave} className="flex-1" disabled={!formData.name || !formData.subject}>
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
            <Button 
              onClick={handlePublish} 
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={!formData.name || !formData.subject}
            >
              <Send className="w-4 h-4 mr-2" />
              {formData.status === 'draft' ? 'Schedule & Publish' : 'Update & Republish'}
            </Button>
          </div>
        </div>

        {/* Preview Panel */}
        {isPreviewMode && (
          <div className="lg:sticky lg:top-4">
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-center">Email Preview</CardTitle>
                <p className="text-sm text-slate-600 text-center">
                  From: {formData.fromName} &lt;{formData.fromEmail}&gt;
                </p>
              </CardHeader>
              <CardContent>
                {renderPreview()}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Campaign</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{formData.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete Campaign
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}