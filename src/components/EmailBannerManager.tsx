import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Image, Palette, Upload, Eye, Copy, Trash2, Settings, Monitor, Smartphone, ArrowLeft, Plus, Edit, Download } from "lucide-react";
import { toast } from "sonner@2.0.3";

// Banner configuration types
export interface EmailBanner {
  id: string;
  name: string;
  type: 'none' | 'color_only' | 'simple' | 'logo_text' | 'full_custom';
  backgroundColor?: string;
  textColor?: string;
  logoUrl?: string;
  logoPosition?: 'left' | 'center' | 'right';
  customHtml?: string;
  height?: number;
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
  usageCount?: number;
}

export interface EmailBannerSettings {
  globalDefault: string; // Banner ID
  templateOverrides: Record<string, string>; // templateId -> bannerId
  campaignOverrides: Record<string, string>; // campaignId -> bannerId
  allowTemplateOverride: boolean;
  allowCampaignOverride: boolean;
}

interface EmailBannerManagerProps {
  onBack: () => void;
}

// Predefined banner templates
const defaultBanners: EmailBanner[] = [
  {
    id: 'none',
    name: 'No Banner',
    type: 'none',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    usageCount: 45,
    isDefault: false
  },
  {
    id: 'reduzed-primary',
    name: 'REDUZED Primary Blue',
    type: 'logo_text',
    backgroundColor: '#3b82f6',
    textColor: '#ffffff',
    logoPosition: 'left',
    height: 80,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    usageCount: 234,
    isDefault: true
  },
  {
    id: 'reduzed-minimal',
    name: 'REDUZED Minimal',
    type: 'color_only',
    backgroundColor: '#f8fafc',
    textColor: '#1e293b',
    height: 60,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    usageCount: 156
  },
  {
    id: 'reduzed-gradient',
    name: 'REDUZED Gradient',
    type: 'logo_text',
    backgroundColor: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    textColor: '#ffffff',
    logoPosition: 'center',
    height: 100,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    usageCount: 89
  },
  {
    id: 'deals-promo',
    name: 'Deals Promo Banner',
    type: 'full_custom',
    customHtml: '<div style="background: linear-gradient(45deg, #10b981, #059669); padding: 20px; text-align: center; color: white;"><h2 style="margin: 0; font-size: 24px;">🎯 EXCLUSIVE DEALS INSIDE</h2><p style="margin: 5px 0 0 0; opacity: 0.9;">Save money on your next prop trading challenge</p></div>',
    height: 120,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    usageCount: 67
  },
  {
    id: 'urgent-expiry',
    name: 'Urgent Expiry Alert',
    type: 'full_custom',
    customHtml: '<div style="background: linear-gradient(45deg, #ef4444, #dc2626); padding: 15px; text-align: center; color: white; border-left: 4px solid #ffffff;"><div style="display: flex; align-items: center; justify-content: center; gap: 10px;"><span style="font-size: 24px;">⏰</span><div><h3 style="margin: 0; font-size: 18px;">DEAL EXPIRES SOON</h3><p style="margin: 0; font-size: 14px; opacity: 0.9;">Don\'t miss out on this exclusive offer</p></div></div></div>',
    height: 100,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    usageCount: 123
  }
];

export function EmailBannerManager({ onBack }: EmailBannerManagerProps) {
  const [banners, setBanners] = useState<EmailBanner[]>(defaultBanners);
  const [bannerSettings, setBannerSettings] = useState<EmailBannerSettings>({
    globalDefault: 'reduzed-primary',
    templateOverrides: {},
    campaignOverrides: {},
    allowTemplateOverride: true,
    allowCampaignOverride: true
  });

  const [selectedBanner, setSelectedBanner] = useState<EmailBanner | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [deleteBannerId, setDeleteBannerId] = useState<string | null>(null);

  const [formData, setFormData] = useState<EmailBanner>({
    id: '',
    name: '',
    type: 'color_only',
    backgroundColor: '#3b82f6',
    textColor: '#ffffff',
    logoPosition: 'left',
    height: 80,
    createdAt: '',
    updatedAt: ''
  });

  const handleCreateNew = () => {
    setFormData({
      id: Date.now().toString(),
      name: '',
      type: 'color_only',
      backgroundColor: '#3b82f6',
      textColor: '#ffffff',
      logoPosition: 'left',
      height: 80,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    setSelectedBanner(null);
    setIsCreatingNew(true);
  };

  const handleEditBanner = (banner: EmailBanner) => {
    setFormData(banner);
    setSelectedBanner(banner);
    setIsCreatingNew(false);
  };

  const handleSave = () => {
    if (!formData.name) {
      toast.error("Please add a banner name");
      return;
    }

    setBanners(prev => {
      const existing = prev.find(b => b.id === formData.id);
      if (existing) {
        return prev.map(b => b.id === formData.id ? { ...formData, updatedAt: new Date().toISOString() } : b);
      } else {
        return [...prev, formData];
      }
    });
    
    setSelectedBanner(null);
    setIsCreatingNew(false);
    toast.success("Email banner saved successfully");
  };

  const handleDuplicateBanner = (banner: EmailBanner) => {
    const duplicatedBanner = {
      ...banner,
      id: Date.now().toString(),
      name: `${banner.name} (Copy)`,
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usageCount: 0
    };
    setBanners(prev => [...prev, duplicatedBanner]);
    toast.success("Banner duplicated successfully");
  };

  const handleDeleteBanner = (bannerId: string) => {
    setBanners(prev => prev.filter(b => b.id !== bannerId));
    
    // Remove from settings if it was being used
    setBannerSettings(prev => ({
      ...prev,
      globalDefault: prev.globalDefault === bannerId ? 'none' : prev.globalDefault,
      templateOverrides: Object.fromEntries(
        Object.entries(prev.templateOverrides).filter(([_, id]) => id !== bannerId)
      ),
      campaignOverrides: Object.fromEntries(
        Object.entries(prev.campaignOverrides).filter(([_, id]) => id !== bannerId)
      )
    }));
    
    setDeleteBannerId(null);
    toast.success("Banner deleted successfully");
  };

  const handleSetAsDefault = (bannerId: string) => {
    setBannerSettings(prev => ({ ...prev, globalDefault: bannerId }));
    setBanners(prev => prev.map(b => ({ ...b, isDefault: b.id === bannerId })));
    toast.success("Default banner updated");
  };

  const generateBannerPreview = (banner: EmailBanner, isEmailPreview: boolean = false) => {
    if (banner.type === 'none') {
      return isEmailPreview ? null : (
        <div className="flex items-center justify-center h-16 bg-slate-100 dark:bg-slate-800 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600">
          <span className="text-slate-500 dark:text-slate-400 text-sm">No Banner</span>
        </div>
      );
    }

    if (banner.type === 'full_custom' && banner.customHtml) {
      return (
        <div 
          dangerouslySetInnerHTML={{ __html: banner.customHtml }}
          className="rounded-lg overflow-hidden"
        />
      );
    }

    const style = {
      background: banner.backgroundColor || '#3b82f6',
      color: banner.textColor || '#ffffff',
      height: `${banner.height || 80}px`,
      padding: '20px',
      display: 'flex',
      alignItems: 'center',
      borderRadius: isEmailPreview ? '0' : '8px'
    };

    const justifyContent = banner.logoPosition === 'center' ? 'center' : 
                          banner.logoPosition === 'right' ? 'flex-end' : 'flex-start';

    return (
      <div style={{ ...style, justifyContent }}>
        {banner.logoUrl && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Image className="w-5 h-5" />
            </div>
          </div>
        )}
        <div className={banner.logoUrl ? 'ml-3' : ''}>
          <div className="text-lg font-bold">REDUZED</div>
          <div className="text-sm opacity-90">AI Deal Finder</div>
        </div>
      </div>
    );
  };

  if (selectedBanner || isCreatingNew) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => { setSelectedBanner(null); setIsCreatingNew(false); }}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Banners
            </Button>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {isCreatingNew ? 'Create Email Banner' : 'Edit Email Banner'}
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Design banners for your email campaigns and templates
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
              <Settings className="w-4 h-4 mr-2" />
              Save Banner
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Banner Configuration */}
          <div className="space-y-6">
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-xl">
              <CardHeader>
                <CardTitle>Banner Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Banner Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., REDUZED Primary Banner"
                  />
                </div>

                <div>
                  <Label htmlFor="type">Banner Type</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Banner</SelectItem>
                      <SelectItem value="color_only">Background Color Only</SelectItem>
                      <SelectItem value="simple">Simple Text</SelectItem>
                      <SelectItem value="logo_text">Logo + Text</SelectItem>
                      <SelectItem value="full_custom">Custom HTML</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.type !== 'none' && (
                  <>
                    <div>
                      <Label htmlFor="height">Banner Height (px)</Label>
                      <Input
                        id="height"
                        type="number"
                        value={formData.height || 80}
                        onChange={(e) => setFormData(prev => ({ ...prev, height: parseInt(e.target.value) }))}
                        min="40"
                        max="200"
                      />
                    </div>

                    {formData.type !== 'full_custom' && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="bgColor">Background Color</Label>
                            <div className="flex gap-2">
                              <Input
                                id="bgColor"
                                type="color"
                                value={formData.backgroundColor || '#3b82f6'}
                                onChange={(e) => setFormData(prev => ({ ...prev, backgroundColor: e.target.value }))}
                                className="w-16 h-10 p-1 rounded"
                              />
                              <Input
                                value={formData.backgroundColor || '#3b82f6'}
                                onChange={(e) => setFormData(prev => ({ ...prev, backgroundColor: e.target.value }))}
                                placeholder="#3b82f6"
                                className="flex-1"
                              />
                            </div>
                          </div>
                          
                          <div>
                            <Label htmlFor="textColor">Text Color</Label>
                            <div className="flex gap-2">
                              <Input
                                id="textColor"
                                type="color"
                                value={formData.textColor || '#ffffff'}
                                onChange={(e) => setFormData(prev => ({ ...prev, textColor: e.target.value }))}
                                className="w-16 h-10 p-1 rounded"
                              />
                              <Input
                                value={formData.textColor || '#ffffff'}
                                onChange={(e) => setFormData(prev => ({ ...prev, textColor: e.target.value }))}
                                placeholder="#ffffff"
                                className="flex-1"
                              />
                            </div>
                          </div>
                        </div>

                        {(formData.type === 'logo_text' || formData.type === 'simple') && (
                          <div>
                            <Label htmlFor="logoPosition">Logo Position</Label>
                            <Select 
                              value={formData.logoPosition || 'left'} 
                              onValueChange={(value: any) => setFormData(prev => ({ ...prev, logoPosition: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="left">Left</SelectItem>
                                <SelectItem value="center">Center</SelectItem>
                                <SelectItem value="right">Right</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        {formData.type === 'logo_text' && (
                          <div>
                            <Label htmlFor="logoUrl">Logo URL</Label>
                            <div className="flex gap-2">
                              <Input
                                id="logoUrl"
                                value={formData.logoUrl || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, logoUrl: e.target.value }))}
                                placeholder="https://example.com/logo.png"
                                className="flex-1"
                              />
                              <Button variant="outline" size="sm">
                                <Upload className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {formData.type === 'full_custom' && (
                      <div>
                        <Label htmlFor="customHtml">Custom HTML</Label>
                        <Textarea
                          id="customHtml"
                          value={formData.customHtml || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, customHtml: e.target.value }))}
                          placeholder="<div style='background: #3b82f6; padding: 20px; color: white;'>Your custom banner HTML</div>"
                          rows={6}
                          className="font-mono text-sm"
                        />
                        <p className="text-xs text-slate-500 mt-2">
                          Use inline CSS styles for best email client compatibility
                        </p>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
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
                <div className={`space-y-4 ${previewDevice === 'mobile' ? 'max-w-sm mx-auto' : ''}`}>
                  {/* Banner Preview */}
                  <div className="space-y-2">
                    <Label>Banner</Label>
                    <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                      {generateBannerPreview(formData, true)}
                    </div>
                  </div>

                  {/* Email Preview */}
                  <div className="space-y-2">
                    <Label>Email Preview</Label>
                    <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-800">
                      {formData.type !== 'none' && generateBannerPreview(formData, true)}
                      
                      <div className="p-6 space-y-4">
                        <div className="space-y-2">
                          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                            🎯 Exclusive Prop Trading Deal
                          </h3>
                          <p className="text-slate-600 dark:text-slate-400">
                            Hi {'{{firstName}}'},
                          </p>
                          <p className="text-slate-600 dark:text-slate-400">
                            We found an amazing deal that matches your interests! Get 90% off your next CFD prop trading challenge.
                          </p>
                        </div>
                        
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                              <span className="text-white font-bold">PT</span>
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900 dark:text-slate-100">PropTrader Elite</div>
                              <div className="text-blue-600 dark:text-blue-400 font-bold">90% OFF</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-3">
                          <Button className="flex-1 bg-blue-500 hover:bg-blue-600">
                            Claim Deal
                          </Button>
                          <Button variant="outline" className="flex-1">
                            View Details
                          </Button>
                        </div>
                        
                        <div className="text-xs text-slate-500 dark:text-slate-400 text-center pt-4 border-t border-slate-200 dark:border-slate-700">
                          REDUZED - AI Deal Finder for Traders
                        </div>
                      </div>
                    </div>
                  </div>
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
              <Image className="w-5 h-5 text-white" />
            </div>
            Email Banner Control
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage banner designs for all your email templates and campaigns
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Email Management
          </Button>
          <Button onClick={handleCreateNew}>
            <Plus className="w-4 h-4 mr-2" />
            Create Banner
          </Button>
        </div>
      </div>

      <Tabs defaultValue="banners" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="banners">Banner Library</TabsTrigger>
          <TabsTrigger value="settings">Global Settings</TabsTrigger>
          <TabsTrigger value="overrides">Template Overrides</TabsTrigger>
        </TabsList>

        {/* Banner Library */}
        <TabsContent value="banners" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {banners.map((banner) => (
              <Card key={banner.id} className="border-0 shadow-lg bg-white/70 backdrop-blur-xl hover:shadow-xl transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{banner.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={banner.isDefault ? "default" : "secondary"} className="text-xs">
                          {banner.isDefault ? "Default" : banner.type.replace('_', ' ')}
                        </Badge>
                        {banner.usageCount !== undefined && (
                          <Badge variant="outline" className="text-xs">
                            {banner.usageCount} uses
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Banner Preview */}
                  <div className="space-y-2">
                    <Label className="text-sm">Preview</Label>
                    <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                      {generateBannerPreview(banner)}
                    </div>
                  </div>

                  {/* Banner Info */}
                  <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                    <div>Type: {banner.type.replace('_', ' ')}</div>
                    {banner.height && <div>Height: {banner.height}px</div>}
                    {banner.backgroundColor && banner.type !== 'none' && (
                      <div className="flex items-center gap-2">
                        Background: 
                        <div 
                          className="w-4 h-4 rounded border border-slate-300"
                          style={{ background: banner.backgroundColor }}
                        />
                        <span className="text-xs font-mono">{banner.backgroundColor}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleEditBanner(banner)}
                      className="flex-1"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDuplicateBanner(banner)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                    {!banner.isDefault && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setDeleteBannerId(banner.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>

                  {!banner.isDefault && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleSetAsDefault(banner.id)}
                      className="w-full"
                    >
                      Set as Default
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Global Settings */}
        <TabsContent value="settings" className="space-y-6">
          <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-xl">
            <CardHeader>
              <CardTitle>Global Banner Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Default Banner for All Emails</Label>
                <Select 
                  value={bannerSettings.globalDefault} 
                  onValueChange={(value) => setBannerSettings(prev => ({ ...prev, globalDefault: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {banners.map(banner => (
                      <SelectItem key={banner.id} value={banner.id}>
                        {banner.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                  This banner will be used for all emails unless overridden
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label>Allow Template Override</Label>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Let individual email templates use different banners
                    </p>
                  </div>
                  <Switch
                    checked={bannerSettings.allowTemplateOverride}
                    onCheckedChange={(checked) => setBannerSettings(prev => ({ ...prev, allowTemplateOverride: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label>Allow Campaign Override</Label>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Let individual email campaigns use different banners
                    </p>
                  </div>
                  <Switch
                    checked={bannerSettings.allowCampaignOverride}
                    onCheckedChange={(checked) => setBannerSettings(prev => ({ ...prev, allowCampaignOverride: checked }))}
                  />
                </div>
              </div>

              {/* Current Default Preview */}
              <div className="space-y-2">
                <Label>Current Default Banner Preview</Label>
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                  {generateBannerPreview(banners.find(b => b.id === bannerSettings.globalDefault) || banners[0])}
                </div>
              </div>

              <Button onClick={() => toast.success('Banner settings saved!')}>
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Template Overrides */}
        <TabsContent value="overrides" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Template Overrides */}
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-xl">
              <CardHeader>
                <CardTitle>Template Banner Overrides</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['welcome-1', 'welcome-2', 'expiry-1', 'expiry-2', 'reset-1'].map(templateId => (
                    <div key={templateId} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{templateId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">Email template</div>
                      </div>
                      <Select 
                        value={bannerSettings.templateOverrides[templateId] || 'default'} 
                        onValueChange={(value) => setBannerSettings(prev => ({ 
                          ...prev, 
                          templateOverrides: { 
                            ...prev.templateOverrides, 
                            [templateId]: value === 'default' ? undefined : value 
                          } 
                        }))}
                        disabled={!bannerSettings.allowTemplateOverride}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">Use Default</SelectItem>
                          {banners.map(banner => (
                            <SelectItem key={banner.id} value={banner.id}>
                              {banner.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Campaign Overrides */}
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-xl">
              <CardHeader>
                <CardTitle>Campaign Banner Overrides</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['Monday CFD Deals', 'Tuesday Futures', 'Thursday Expiring', 'Weekly Newsletter'].map((campaignName, index) => {
                    const campaignId = `campaign-${index + 1}`;
                    return (
                      <div key={campaignId} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{campaignName}</div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">Email campaign</div>
                        </div>
                        <Select 
                          value={bannerSettings.campaignOverrides[campaignId] || 'default'} 
                          onValueChange={(value) => setBannerSettings(prev => ({ 
                            ...prev, 
                            campaignOverrides: { 
                              ...prev.campaignOverrides, 
                              [campaignId]: value === 'default' ? undefined : value 
                            } 
                          }))}
                          disabled={!bannerSettings.allowCampaignOverride}
                        >
                          <SelectTrigger className="w-48">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="default">Use Default</SelectItem>
                            {banners.map(banner => (
                              <SelectItem key={banner.id} value={banner.id}>
                                {banner.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteBannerId} onOpenChange={(open) => !open && setDeleteBannerId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Email Banner</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this banner? This action cannot be undone and will affect any templates or campaigns using this banner.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteBannerId && handleDeleteBanner(deleteBannerId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Banner
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}