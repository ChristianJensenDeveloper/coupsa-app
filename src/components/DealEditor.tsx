import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Switch } from "./ui/switch";
import { Slider } from "./ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Upload, Image, RotateCcw } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { AdminDeal, Firm, AdminCategory } from "./types";

interface DealEditorProps {
  deal?: AdminDeal;
  firms: Firm[];
  onSave: (deal: Partial<AdminDeal>, isDraft: boolean) => void;
  onCancel: () => void;
}

export function DealEditor({ deal, firms, onSave, onCancel }: DealEditorProps) {
  const [formData, setFormData] = useState<Partial<AdminDeal>>({
    firmId: deal?.firmId || '',
    title: deal?.title || '',
    discountPercentage: deal?.discountPercentage || 0,
    couponCode: deal?.couponCode || '',
    category: deal?.category || 'CFD Prop',
    startDate: deal?.startDate || '',
    endDate: deal?.endDate || '',
    status: deal?.status || 'Draft',
    hasVerificationBadge: deal?.hasVerificationBadge || false,
    cardNotes: deal?.cardNotes || '',
    affiliateLink: deal?.affiliateLink || '',
    buttonConfig: deal?.buttonConfig || 'both',
    backgroundImageUrl: deal?.backgroundImageUrl || '',
    backgroundImagePosition: deal?.backgroundImagePosition || 'center',
    backgroundBlur: deal?.backgroundBlur || 0,
    backgroundType: deal?.backgroundImageUrl ? 'custom' : 'default',
  });

  const handleInputChange = (field: keyof AdminDeal, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleBackgroundTypeChange = (type: 'default' | 'custom') => {
    setFormData(prev => ({
      ...prev,
      backgroundType: type,
      // Clear background image if switching to default
      backgroundImageUrl: type === 'default' ? '' : prev.backgroundImageUrl,
    }));
  };

  const handleSaveDraft = () => {
    // Clean up background data based on type selection
    const cleanedData = { ...formData };
    if (formData.backgroundType === 'default') {
      cleanedData.backgroundImageUrl = '';
      cleanedData.backgroundImagePosition = 'center';
      cleanedData.backgroundBlur = 0;
    }
    delete cleanedData.backgroundType; // Remove helper field
    
    // Auto-set button configuration based on coupon code presence
    if (!cleanedData.couponCode || cleanedData.couponCode.trim() === '') {
      cleanedData.buttonConfig = 'claim-only';
      cleanedData.couponCode = ''; // Ensure it's an empty string, not undefined
    }
    
    onSave(cleanedData, true);
    toast.success("Deal saved as draft");
  };

  const handleSaveAndPublish = () => {
    if (!formData.firmId || !formData.title || !formData.startDate || !formData.endDate) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    // Clean up background data based on type selection
    const cleanedData = { ...formData, status: 'Published' };
    if (formData.backgroundType === 'default') {
      cleanedData.backgroundImageUrl = '';
      cleanedData.backgroundImagePosition = 'center';
      cleanedData.backgroundBlur = 0;
    }
    delete cleanedData.backgroundType; // Remove helper field
    
    // Auto-set button configuration based on coupon code presence
    if (!cleanedData.couponCode || cleanedData.couponCode.trim() === '') {
      cleanedData.buttonConfig = 'claim-only';
      cleanedData.couponCode = ''; // Ensure it's an empty string, not undefined
    }
    
    onSave(cleanedData, false);
    toast.success("Deal published successfully");
  };

  const handleUploadLogo = () => {
    toast.info("Logo upload functionality would be implemented here");
  };

  const handleUploadBackgroundImage = () => {
    toast.info("Background image upload functionality would be implemented here");
  };

  const positionOptions = [
    { value: 'center', label: 'Center' },
    { value: 'top', label: 'Top' },
    { value: 'bottom', label: 'Bottom' },
    { value: 'left', label: 'Left' },
    { value: 'right', label: 'Right' },
    { value: 'top-left', label: 'Top Left' },
    { value: 'top-right', label: 'Top Right' },
    { value: 'bottom-left', label: 'Bottom Left' },
    { value: 'bottom-right', label: 'Bottom Right' },
  ];

  return (
    <div className="max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Deal Editor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Firm Selection */}
          <div className="space-y-2">
            <Label htmlFor="firm">Firm</Label>
            <Select 
              value={formData.firmId} 
              onValueChange={(value) => handleInputChange('firmId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select firm" />
              </SelectTrigger>
              <SelectContent>
                {firms.map((firm) => (
                  <SelectItem key={firm.id} value={firm.id}>
                    {firm.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Upload Campaign Logo */}
          <div className="space-y-2">
            <Button 
              variant="outline" 
              onClick={handleUploadLogo}
              className="w-full justify-start gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload Campaign Logo
            </Button>
          </div>

          {/* Background Image Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Image className="w-5 h-5" />
                Banner Background Options
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Background Type Selection */}
              <div className="space-y-3">
                <Label>Background Style</Label>
                <RadioGroup
                  value={formData.backgroundType}
                  onValueChange={(value: 'default' | 'custom') => handleBackgroundTypeChange(value)}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="default" id="bg-default" />
                    <Label htmlFor="bg-default">Default Light Grey</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="custom" id="bg-custom" />
                    <Label htmlFor="bg-custom">Custom Background Image</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Default Background Preview */}
              {formData.backgroundType === 'default' && (
                <div className="space-y-2">
                  <Label>Preview</Label>
                  <div className="relative h-24 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-lg overflow-hidden border border-border">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-white/90 dark:bg-black/90 px-3 py-1 rounded-md text-sm font-medium">
                        Default Light Grey Banner
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Custom Background Image Controls */}
              {formData.backgroundType === 'custom' && (
                <>
                  {/* Upload Background Image */}
                  <div className="space-y-2">
                    <Label>Background Image</Label>
                    <Button 
                      variant="outline" 
                      onClick={handleUploadBackgroundImage}
                      className="w-full justify-start gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Upload Background Image
                    </Button>
                    {formData.backgroundImageUrl && (
                      <div className="mt-2 p-2 bg-muted rounded-md">
                        <p className="text-sm text-muted-foreground truncate">
                          Current: {formData.backgroundImageUrl}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Background Position */}
                  <div className="space-y-2">
                    <Label>Image Position</Label>
                    <Select 
                      value={formData.backgroundImagePosition} 
                      onValueChange={(value: any) => handleInputChange('backgroundImagePosition', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                      <SelectContent>
                        {positionOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Background Blur */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Background Blur Intensity</Label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{formData.backgroundBlur}px</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleInputChange('backgroundBlur', 0)}
                          className="p-1 h-6 w-6"
                        >
                          <RotateCcw className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <Slider
                      value={[formData.backgroundBlur || 0]}
                      onValueChange={(value) => handleInputChange('backgroundBlur', value[0])}
                      max={20}
                      min={0}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Sharp (0px)</span>
                      <span>Very Blurred (20px)</span>
                    </div>
                  </div>

                  {/* Preview Section */}
                  {formData.backgroundImageUrl && (
                    <div className="space-y-2">
                      <Label>Preview</Label>
                      <div className="relative h-24 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-lg overflow-hidden border border-border">
                        <div
                          className="absolute inset-0 bg-cover bg-no-repeat"
                          style={{
                            backgroundImage: `url(${formData.backgroundImageUrl})`,
                            backgroundPosition: formData.backgroundImagePosition?.replace('-', ' ') || 'center',
                            filter: `blur(${formData.backgroundBlur || 0}px)`,
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-white/90 dark:bg-black/90 px-3 py-1 rounded-md text-sm font-medium">
                            Custom Background Preview
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter deal title"
            />
          </div>

          {/* Discount % and Coupon Code */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="discount">Discount %</Label>
              <Input
                id="discount"
                type="number"
                value={formData.discountPercentage}
                onChange={(e) => handleInputChange('discountPercentage', Number(e.target.value))}
                placeholder="50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="couponCode">Coupon Code</Label>
              <Input
                id="couponCode"
                value={formData.couponCode}
                onChange={(e) => {
                  const value = e.target.value;
                  handleInputChange('couponCode', value);
                  // Auto-adjust button config based on coupon code presence
                  if (!value || value.trim() === '') {
                    handleInputChange('buttonConfig', 'claim-only');
                  } else if (formData.buttonConfig === 'claim-only') {
                    handleInputChange('buttonConfig', 'both');
                  }
                }}
                placeholder="Enter coupon code (Optional)"
              />
              <p className="text-xs text-muted-foreground">
                Optional: Leave empty if this is an affiliate-only deal. Button configuration will auto-adjust.
              </p>
            </div>
          </div>

          {/* Category */}
          <div className="space-y-3">
            <Label>Category</Label>
            <RadioGroup
              value={formData.category}
              onValueChange={(value: AdminCategory) => handleInputChange('category', value)}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="CFD Prop" id="cfd-prop" />
                <Label htmlFor="cfd-prop">CFD Prop</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Futures Prop" id="futures-prop" />
                <Label htmlFor="futures-prop">Futures Prop</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Broker Bonuses" id="broker-bonuses" />
                <Label htmlFor="broker-bonuses">Broker Bonuses</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Start Date and End Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date & Time</Label>
              <Input
                id="startDate"
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date & Time</Label>
              <Input
                id="endDate"
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
              />
            </div>
          </div>

          {/* Verification Badge */}
          <div className="space-y-2">
            <Label htmlFor="verification">Verification Badge</Label>
            <div className="flex items-center space-x-2">
              <Switch
                id="verification"
                checked={formData.hasVerificationBadge}
                onCheckedChange={(checked) => handleInputChange('hasVerificationBadge', checked)}
              />
              <span className="text-sm text-muted-foreground">
                Show verification badge on deal card
              </span>
            </div>
          </div>

          {/* Button Configuration */}
          <div className="space-y-3">
            <Label>Action Buttons Configuration</Label>
            <RadioGroup
              value={formData.buttonConfig || 'both'}
              onValueChange={(value: 'both' | 'claim-only' | 'code-only') => handleInputChange('buttonConfig', value)}
              className="space-y-3"
            >
              <div className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="both" id="buttons-both" className="mt-0.5" />
                <div className="flex-1">
                  <Label htmlFor="buttons-both" className="cursor-pointer font-medium">
                    Both Buttons (Default)
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Show "Claim Deal" and "Copy Code" buttons. Use when you have both affiliate link and coupon code.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="claim-only" id="buttons-claim" className="mt-0.5" />
                <div className="flex-1">
                  <Label htmlFor="buttons-claim" className="cursor-pointer font-medium">
                    Claim Deal Only
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Show only "Claim Deal" button. Use when you only have affiliate link (no coupon code needed).
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="code-only" id="buttons-code" className="mt-0.5" />
                <div className="flex-1">
                  <Label htmlFor="buttons-code" className="cursor-pointer font-medium">
                    Copy Code Only
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Show only "Copy Code" button. Use when deal requires manual coupon code entry on merchant site.
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select 
              value={formData.status} 
              onValueChange={(value: 'Draft' | 'Published' | 'Archived') => handleInputChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Published">Published</SelectItem>
                <SelectItem value="Archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Affiliate Link */}
          <div className="space-y-2">
            <Label htmlFor="affiliateLink">Affiliate Link</Label>
            <Input
              id="affiliateLink"
              value={formData.affiliateLink}
              onChange={(e) => handleInputChange('affiliateLink', e.target.value)}
              placeholder="https://example.com/affiliate"
            />
          </div>

          {/* Card Notes */}
          <div className="space-y-2">
            <Label htmlFor="cardNotes">Card Notes</Label>
            <Textarea
              id="cardNotes"
              value={formData.cardNotes}
              onChange={(e) => handleInputChange('cardNotes', e.target.value)}
              placeholder="Add any additional notes..."
              rows={4}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              onClick={handleSaveDraft}
              variant="outline"
            >
              Save Draft
            </Button>
            <Button 
              onClick={handleSaveAndPublish}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Save & Publish
            </Button>
            <Button 
              onClick={onCancel}
              variant="ghost"
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}