import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { Switch } from "./ui/switch";
import { Slider } from "./ui/slider";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Textarea } from "./ui/textarea";
import { Plus, Search, Edit, Trash2, Eye, Calendar, Target, TrendingUp, Briefcase, FileText, AlertCircle, ExternalLink, Copy, Building2, CheckCircle, XCircle, Clock, Ticket, Users, BarChart3, Image, Upload, RotateCcw, X } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { AdminDeal, Firm } from "./types";
import { SwipeableCouponCard } from "./SwipeableCouponCard";

interface DealsManagerProps {
  deals: AdminDeal[];
  firms: Firm[];
  onCreateDeal: (deal: Omit<AdminDeal, 'id'>) => void;
  onUpdateDeal: (deal: AdminDeal) => void;
  onDeleteDeal: (dealId: string) => void;
}

export function DealsManager({ deals, firms, onCreateDeal, onUpdateDeal, onDeleteDeal }: DealsManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Published' | 'Draft' | 'Archived'>('All');
  const [categoryFilter, setCategoryFilter] = useState<'All' | 'CFD Prop' | 'Futures Prop' | 'Broker Bonuses'>('All');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<AdminDeal | null>(null);
  const [deletingDeal, setDeletingDeal] = useState<AdminDeal | null>(null);
  const [viewingDeal, setViewingDeal] = useState<AdminDeal | null>(null);
  
  const [formData, setFormData] = useState({
    firmId: '',
    title: '',
    discountPercentage: 0,
    discountType: 'percentage' as 'percentage' | 'fixed' | 'free',
    fixedAmount: '',
    freeText: '',
    couponCode: '',
    category: 'CFD Prop' as 'CFD Prop' | 'Futures Prop' | 'Broker Bonuses',
    startDate: '',
    endDate: '',
    status: 'Draft' as 'Draft' | 'Published' | 'Archived',
    hasVerificationBadge: false,
    cardNotes: '',
    affiliateLink: '',
    buttonConfig: 'both' as 'both' | 'claim-only' | 'code-only',
    backgroundImageUrl: '',
    backgroundImagePosition: 'center' as 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right',
    backgroundBlur: 0,
    backgroundType: 'default' as 'default' | 'custom'
  });

  const [formErrors, setFormErrors] = useState({
    firmId: '',
    title: '',
    discountPercentage: '',
    startDate: '',
    endDate: ''
  });

  const filteredDeals = deals.filter(deal => {
    const matchesSearch = deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          firms.find(f => f.id === deal.firmId)?.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || deal.status === statusFilter;
    const matchesCategory = categoryFilter === 'All' || deal.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Calculate metrics
  const totalDeals = deals.length;
  const publishedDeals = deals.filter(d => d.status === 'Published').length;
  const draftDeals = deals.filter(d => d.status === 'Draft').length;
  const archivedDeals = deals.filter(d => d.status === 'Archived').length;
  const activeDeals = deals.filter(d => d.status === 'Published' && new Date(d.endDate) > new Date()).length;

  const validateForm = () => {
    const errors = { 
      firmId: '', 
      title: '', 
      discountPercentage: '', 
      startDate: '', 
      endDate: ''
    };
    let isValid = true;

    if (!formData.firmId) {
      errors.firmId = 'Please select a firm';
      isValid = false;
    }

    if (!formData.title.trim()) {
      errors.title = 'Deal title is required';
      isValid = false;
    }

    if (formData.discountType === 'percentage' && (formData.discountPercentage <= 0 || formData.discountPercentage > 100)) {
      errors.discountPercentage = 'Discount percentage must be between 1-100';
      isValid = false;
    }

    if (!formData.startDate) {
      errors.startDate = 'Start date is required';
      isValid = false;
    }

    if (!formData.endDate) {
      errors.endDate = 'End date is required';
      isValid = false;
    }

    if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      errors.endDate = 'End date must be after start date';
      isValid = false;
    }

    // Coupon code is now optional - when empty, buttonConfig will auto-set to 'claim-only'

    setFormErrors(errors);
    return isValid;
  };

  const resetForm = () => {
    setFormData({
      firmId: '',
      title: '',
      discountPercentage: 0,
      discountType: 'percentage',
      fixedAmount: '',
      freeText: '',
      couponCode: '',
      category: 'CFD Prop',
      startDate: '',
      endDate: '',
      status: 'Draft',
      hasVerificationBadge: false,
      cardNotes: '',
      affiliateLink: '',
      buttonConfig: 'both',
      backgroundImageUrl: '',
      backgroundImagePosition: 'center',
      backgroundBlur: 0,
      backgroundType: 'default'
    });
    setFormErrors({ firmId: '', title: '', discountPercentage: '', startDate: '', endDate: '' });
  };

  const handleFirmSelect = (firmId: string) => {
    const selectedFirm = firms.find(f => f.id === firmId);
    if (selectedFirm) {
      setFormData(prev => ({
        ...prev,
        firmId,
        couponCode: selectedFirm.couponCode,
        affiliateLink: selectedFirm.affiliateLink,
        category: selectedFirm.category === 'Broker' ? 'Broker Bonuses' : selectedFirm.category as 'CFD Prop' | 'Futures Prop'
      }));
    }
  };

  const handleCreateDeal = () => {
    if (!validateForm()) {
      return;
    }

    // Auto-set button configuration based on coupon code presence
    const couponCode = formData.couponCode.trim();
    const buttonConfig = !couponCode ? 'claim-only' : formData.buttonConfig;

    const newDeal = {
      firmId: formData.firmId,
      title: formData.title.trim(),
      discountPercentage: formData.discountType === 'percentage' ? formData.discountPercentage : 
                          formData.discountType === 'fixed' ? 0 : 100,
      couponCode: couponCode.toUpperCase(),
      category: formData.category,
      startDate: formData.startDate,
      endDate: formData.endDate,
      status: formData.status,
      hasVerificationBadge: formData.hasVerificationBadge,
      cardNotes: formData.cardNotes.trim(),
      affiliateLink: formData.affiliateLink.trim(),
      buttonConfig: buttonConfig,
      backgroundImageUrl: formData.backgroundType === 'custom' ? formData.backgroundImageUrl : '',
      backgroundImagePosition: formData.backgroundType === 'custom' ? formData.backgroundImagePosition : 'center',
      backgroundBlur: formData.backgroundType === 'custom' ? formData.backgroundBlur : 0
    };

    onCreateDeal(newDeal);
    resetForm();
    setIsCreateDialogOpen(false);
    toast.success("Deal created successfully");
  };

  const handleEditDeal = (deal: AdminDeal) => {
    setEditingDeal(deal);
    const selectedFirm = firms.find(f => f.id === deal.firmId);
    
    setFormData({
      firmId: deal.firmId,
      title: deal.title,
      discountPercentage: deal.discountPercentage,
      discountType: deal.discountPercentage === 100 ? 'free' : 'percentage',
      fixedAmount: '',
      freeText: '',
      couponCode: deal.couponCode,
      category: deal.category,
      startDate: deal.startDate,
      endDate: deal.endDate,
      status: deal.status,
      hasVerificationBadge: deal.hasVerificationBadge,
      cardNotes: deal.cardNotes,
      affiliateLink: deal.affiliateLink || selectedFirm?.affiliateLink || '',
      buttonConfig: deal.buttonConfig || 'both',
      backgroundImageUrl: deal.backgroundImageUrl || '',
      backgroundImagePosition: deal.backgroundImagePosition || 'center',
      backgroundBlur: deal.backgroundBlur || 0,
      backgroundType: deal.backgroundImageUrl ? 'custom' : 'default'
    });
    setFormErrors({ firmId: '', title: '', discountPercentage: '', startDate: '', endDate: '' });
  };

  const handleUpdateDeal = () => {
    if (!validateForm() || !editingDeal) {
      return;
    }

    // Auto-set button configuration based on coupon code presence
    const couponCode = formData.couponCode.trim();
    const buttonConfig = !couponCode ? 'claim-only' : formData.buttonConfig;

    const updatedDeal = {
      ...editingDeal,
      firmId: formData.firmId,
      title: formData.title.trim(),
      discountPercentage: formData.discountType === 'percentage' ? formData.discountPercentage : 
                          formData.discountType === 'fixed' ? 0 : 100,
      couponCode: couponCode.toUpperCase(),
      category: formData.category,
      startDate: formData.startDate,
      endDate: formData.endDate,
      status: formData.status,
      hasVerificationBadge: formData.hasVerificationBadge,
      cardNotes: formData.cardNotes.trim(),
      affiliateLink: formData.affiliateLink.trim(),
      buttonConfig: buttonConfig,
      backgroundImageUrl: formData.backgroundType === 'custom' ? formData.backgroundImageUrl : '',
      backgroundImagePosition: formData.backgroundType === 'custom' ? formData.backgroundImagePosition : 'center',
      backgroundBlur: formData.backgroundType === 'custom' ? formData.backgroundBlur : 0
    };

    onUpdateDeal(updatedDeal);
    resetForm();
    setEditingDeal(null);
    toast.success("Deal updated successfully");
  };

  const handleDeleteDeal = (deal: AdminDeal) => {
    setDeletingDeal(deal);
  };

  const confirmDeleteDeal = () => {
    if (deletingDeal) {
      onDeleteDeal(deletingDeal.id);
      setDeletingDeal(null);
      toast.success("Deal deleted successfully");
    }
  };

  const getFirmName = (firmId: string) => {
    return firms.find(f => f.id === firmId)?.name || 'Unknown Firm';
  };

  const getFirmLogo = (firmId: string) => {
    return firms.find(f => f.id === firmId)?.logo;
  };

  const getDiscountDisplay = (deal: AdminDeal) => {
    if (deal.discountPercentage === 100) {
      return 'FREE';
    }
    return `${deal.discountPercentage}% OFF`;
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard`);
  };

  const handleUploadBackgroundImage = () => {
    // For demo purposes, set a sample background image
    const sampleImageUrl = 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib251cyUyMG1vbmV5JTIwdHJhZGluZ3xlbnwxfHx8fDE3NTY0NjY4Njd8MA&ixlib=rb-4.1.0&q=80&w=1080';
    setFormData(prev => ({ 
      ...prev, 
      backgroundImageUrl: sampleImageUrl
    }));
    toast.success("Sample background image added! You can now adjust position and blur.");
  };

  const handleBackgroundTypeChange = (type: 'default' | 'custom') => {
    setFormData(prev => ({
      ...prev,
      backgroundType: type,
      // Clear background image if switching to default
      backgroundImageUrl: type === 'default' ? '' : prev.backgroundImageUrl,
    }));
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

  // Convert AdminDeal to Coupon for preview
  const convertDealToCoupon = (deal: AdminDeal) => {
    const firm = firms.find(f => f.id === deal.firmId);
    return {
      id: deal.id,
      title: deal.title,
      description: deal.cardNotes,
      discount: getDiscountDisplay(deal),
      category: deal.category,
      merchant: firm?.name || 'Unknown Firm',
      validUntil: new Date(deal.endDate).toLocaleDateString(),
      startDate: deal.startDate,
      endDate: deal.endDate,
      terms: deal.cardNotes,
      code: deal.couponCode,
      isClaimed: false,
      imageUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmFkaW5nJTIwZm9yZXglMjBjaGFydHxlbnwxfHx8fDE3NTY0NjY4NjN8MA&ixlib=rb-4.1.0&q=80&w=1080',
      logoUrl: firm?.logo,
      affiliateLink: deal.affiliateLink || firm?.affiliateLink || '',
      hasVerificationBadge: deal.hasVerificationBadge,
      buttonConfig: deal.buttonConfig,
      backgroundImageUrl: deal.backgroundImageUrl,
      backgroundImagePosition: deal.backgroundImagePosition,
      backgroundBlur: deal.backgroundBlur
    };
  };

  // Render the form fields component
  const renderFormFields = () => (
    <>
      {/* Firm Selection */}
      <div className="space-y-2">
        <Label htmlFor="firmSelect">Select Firm *</Label>
        <Select value={formData.firmId} onValueChange={handleFirmSelect}>
          <SelectTrigger className={formErrors.firmId ? "border-red-500" : ""}>
            <SelectValue placeholder="Choose a partner firm" />
          </SelectTrigger>
          <SelectContent>
            {firms.filter(f => f.status === 'Active').map(firm => (
              <SelectItem key={firm.id} value={firm.id}>
                <div className="flex items-center gap-2">
                  {firm.logo && <img src={firm.logo} alt={firm.name} className="w-4 h-4 rounded" />}
                  <span>{firm.name}</span>
                  <Badge variant="secondary" className="text-xs ml-2">
                    {firm.category}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {formErrors.firmId && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {formErrors.firmId}
          </p>
        )}
      </div>

      {/* Deal Title */}
      <div className="space-y-2">
        <Label htmlFor="dealTitle">Deal Title *</Label>
        <Input
          id="dealTitle"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="e.g., 30% off Challenge Fee"
          className={formErrors.title ? "border-red-500" : ""}
        />
        {formErrors.title && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {formErrors.title}
          </p>
        )}
      </div>

      {/* Discount Configuration */}
      <div className="space-y-4">
        <Label>Discount Configuration *</Label>
        
        <div className="flex gap-4">
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="percentage"
              name="discountType"
              checked={formData.discountType === 'percentage'}
              onChange={() => setFormData(prev => ({ ...prev, discountType: 'percentage' }))}
            />
            <Label htmlFor="percentage">Percentage Off</Label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="free"
              name="discountType"
              checked={formData.discountType === 'free'}
              onChange={() => setFormData(prev => ({ ...prev, discountType: 'free' }))}
            />
            <Label htmlFor="free">Free/Bonus</Label>
          </div>
        </div>

        {formData.discountType === 'percentage' && (
          <div className="space-y-2">
            <Label htmlFor="discountPercentage">Discount Percentage</Label>
            <div className="flex items-center gap-2">
              <Input
                id="discountPercentage"
                type="number"
                min="1"
                max="100"
                value={formData.discountPercentage || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, discountPercentage: parseInt(e.target.value) || 0 }))}
                placeholder="30"
                className={`max-w-20 ${formErrors.discountPercentage ? "border-red-500" : ""}`}
              />
              <span className="text-muted-foreground">%</span>
            </div>
            {formErrors.discountPercentage && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {formErrors.discountPercentage}
              </p>
            )}
          </div>
        )}

        {formData.discountType === 'free' && (
          <div className="space-y-2">
            <Label htmlFor="freeText">Free Offer Description</Label>
            <Input
              id="freeText"
              value={formData.freeText}
              onChange={(e) => setFormData(prev => ({ ...prev, freeText: e.target.value }))}
              placeholder="e.g., Free Trial, Free Reset, $100 Bonus"
            />
          </div>
        )}
      </div>

      {/* Auto-populated fields when firm is selected */}
      {formData.firmId && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
          <div className="space-y-2">
            <Label>Category (Auto-filled)</Label>
            <Input value={formData.category} readOnly className="bg-background" />
          </div>
          <div className="space-y-2">
            <Label>Coupon Code</Label>
            <Input
              value={formData.couponCode}
              onChange={(e) => {
                const value = e.target.value.toUpperCase();
                setFormData(prev => ({ 
                  ...prev, 
                  couponCode: value,
                  // Auto-adjust button config based on coupon code presence
                  buttonConfig: !value.trim() ? 'claim-only' : (prev.buttonConfig === 'claim-only' ? 'both' : prev.buttonConfig)
                }));
              }}
              placeholder="Enter coupon code (Optional)"
            />
            <p className="text-xs text-muted-foreground">
              Optional: Leave empty if this is an affiliate-only deal. Button configuration will auto-adjust.
            </p>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Affiliate Link (Auto-filled)</Label>
            <Input
              value={formData.affiliateLink}
              onChange={(e) => setFormData(prev => ({ ...prev, affiliateLink: e.target.value }))}
              className="bg-background"
            />
          </div>
        </div>
      )}

      {/* Date Range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date *</Label>
          <Input
            id="startDate"
            type="datetime-local"
            value={formData.startDate}
            onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
            className={formErrors.startDate ? "border-red-500" : ""}
          />
          {formErrors.startDate && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {formErrors.startDate}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">End Date *</Label>
          <Input
            id="endDate"
            type="datetime-local"
            value={formData.endDate}
            onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
            className={formErrors.endDate ? "border-red-500" : ""}
          />
          {formErrors.endDate && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {formErrors.endDate}
            </p>
          )}
        </div>
      </div>

      {/* Card Notes */}
      <div className="space-y-2">
        <Label htmlFor="cardNotes">Deal Description</Label>
        <Textarea
          id="cardNotes"
          value={formData.cardNotes}
          onChange={(e) => setFormData(prev => ({ ...prev, cardNotes: e.target.value }))}
          placeholder="Brief description that will appear on the deal card"
          rows={3}
        />
      </div>

      {/* Banner Background Image Section */}
      <div className="space-y-3 p-3 border border-border rounded-lg bg-muted/50">
        <div className="flex items-center gap-2">
          <Image className="w-4 h-4" />
          <Label className="text-sm font-semibold">Banner Background Options</Label>
        </div>
        
        {/* Background Type Selection */}
        <div className="space-y-2">
          <Label className="text-sm">Background Style</Label>
          <RadioGroup
            value={formData.backgroundType}
            onValueChange={(value: 'default' | 'custom') => handleBackgroundTypeChange(value)}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="default" id="bg-default" />
              <Label htmlFor="bg-default" className="text-sm">Default Light Grey</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="custom" id="bg-custom" />
              <Label htmlFor="bg-custom" className="text-sm">Custom Background Image</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Default Background Preview */}
        {formData.backgroundType === 'default' && (
          <div className="space-y-2">
            <Label className="text-sm">Preview</Label>
            <div className="relative h-16 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-lg overflow-hidden border border-border">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white/90 dark:bg-black/90 px-2 py-1 rounded text-xs font-medium">
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
              <Label className="text-sm">Background Image</Label>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleUploadBackgroundImage}
                  className="flex-1 justify-start gap-2 h-9"
                  type="button"
                >
                  <Upload className="w-4 h-4" />
                  {formData.backgroundImageUrl ? 'Change Image' : 'Upload Background Image'}
                </Button>
                {formData.backgroundImageUrl && (
                  <Button 
                    variant="outline"
                    onClick={() => setFormData(prev => ({ ...prev, backgroundImageUrl: '' }))}
                    className="px-3 h-9"
                    type="button"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
              {formData.backgroundImageUrl && (
                <div className="p-2 bg-muted rounded text-xs text-muted-foreground truncate">
                  Current: {formData.backgroundImageUrl.split('/').pop()}
                </div>
              )}
            </div>

            {/* Background Position */}
            <div className="space-y-2">
              <Label className="text-sm">Image Position</Label>
              <Select 
                value={formData.backgroundImagePosition} 
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, backgroundImagePosition: value }))}
              >
                <SelectTrigger className="h-9">
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
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Background Blur</Label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-mono">{formData.backgroundBlur}px</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFormData(prev => ({ ...prev, backgroundBlur: 0 }))}
                    className="p-1 h-5 w-5"
                    type="button"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <Slider
                value={[formData.backgroundBlur || 0]}
                onValueChange={(value) => setFormData(prev => ({ ...prev, backgroundBlur: value[0] }))}
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
                <Label className="text-sm">Preview</Label>
                <div className="relative h-16 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-lg overflow-hidden border border-border">
                  <div
                    className="absolute inset-0 bg-cover bg-no-repeat"
                    style={{
                      backgroundImage: `url(${formData.backgroundImageUrl})`,
                      backgroundPosition: formData.backgroundImagePosition?.replace('-', ' ') || 'center',
                      filter: `blur(${formData.backgroundBlur || 0}px)`,
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white/90 dark:bg-black/90 px-2 py-1 rounded text-xs font-medium">
                      Custom Background Preview
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Verification Badge */}
      <div className="flex items-center space-x-2">
        <Switch
          id="verificationBadge"
          checked={formData.hasVerificationBadge}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hasVerificationBadge: checked }))}
        />
        <Label htmlFor="verificationBadge">Show verification badge</Label>
      </div>

      {/* Button Configuration */}
      <div className="space-y-3 p-3 border border-border rounded-lg bg-muted/50">
        <div className="flex items-center gap-2">
          <Ticket className="w-4 h-4" />
          <Label className="text-sm font-semibold">Action Buttons Configuration</Label>
        </div>
        
        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Current:</strong> {
            !formData.couponCode.trim() ? 'Claim Deal Only (Auto-configured)' :
            formData.buttonConfig === 'both' ? 'Both Buttons (Claim Deal + Copy Code)' :
            formData.buttonConfig === 'claim-only' ? 'Claim Deal Only' :
            'Copy Code Only'
          }</p>
          <p>
            {!formData.couponCode.trim() 
              ? '⚡ No coupon code provided - automatically showing "Claim Deal" button only'
              : '✓ Coupon code provided - you can choose button configuration'
            }
          </p>
        </div>

        {formData.couponCode.trim() && (
          <RadioGroup
            value={formData.buttonConfig}
            onValueChange={(value: 'both' | 'claim-only' | 'code-only') => 
              setFormData(prev => ({ ...prev, buttonConfig: value }))}
            className="space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="both" id="config-both" />
              <Label htmlFor="config-both" className="text-sm">Both Buttons (Default)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="claim-only" id="config-claim" />
              <Label htmlFor="config-claim" className="text-sm">Claim Deal Only</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="code-only" id="config-code" />
              <Label htmlFor="config-code" className="text-sm">Copy Code Only</Label>
            </div>
          </RadioGroup>
        )}
      </div>

      {/* Status */}
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select value={formData.status} onValueChange={(value: 'Draft' | 'Published' | 'Archived') => 
          setFormData(prev => ({ ...prev, status: value }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Draft">Save as Draft</SelectItem>
            <SelectItem value="Published">Published</SelectItem>
            <SelectItem value="Archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Deals Management</h2>
            <p className="text-muted-foreground">Create and manage propfirm deals and promotions</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
            setIsCreateDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Deal
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl h-[90vh] max-h-[90vh] flex flex-col">
              <DialogHeader className="flex-shrink-0 pb-4">
                <DialogTitle>Create New Deal</DialogTitle>
                <DialogDescription>
                  Create a new deal for one of your partner firms. The affiliate link and coupon code will be automatically populated.
                </DialogDescription>
              </DialogHeader>
              
              <ScrollArea className="flex-1 overflow-auto">
                <div className="space-y-6 pb-6 pr-4">
                  {renderFormFields()}
                </div>
              </ScrollArea>

              <DialogFooter className="flex-shrink-0 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateDeal} className="bg-blue-600 hover:bg-blue-700">
                  Create Deal
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Dashboard Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Target className="w-8 h-8 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold">{totalDeals}</div>
                  <div className="text-sm text-muted-foreground">Total Deals</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <div className="text-2xl font-bold">{publishedDeals}</div>
                  <div className="text-sm text-muted-foreground">Published</div>
                </div>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                {activeDeals} currently active
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-yellow-600" />
                <div>
                  <div className="text-2xl font-bold">{draftDeals}</div>
                  <div className="text-sm text-muted-foreground">Draft Deals</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <XCircle className="w-8 h-8 text-gray-600" />
                <div>
                  <div className="text-2xl font-bold">{archivedDeals}</div>
                  <div className="text-sm text-muted-foreground">Archived</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Building2 className="w-8 h-8 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold">{firms.filter(f => f.status === 'Active').length}</div>
                  <div className="text-sm text-muted-foreground">Active Firms</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search deals by title or firm name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={(value: 'All' | 'Published' | 'Draft' | 'Archived') => 
                setStatusFilter(value)}>
                <SelectTrigger className="w-full lg:w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Status</SelectItem>
                  <SelectItem value="Published">Published</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={(value: 'All' | 'CFD Prop' | 'Futures Prop' | 'Broker Bonuses') => 
                setCategoryFilter(value)}>
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Categories</SelectItem>
                  <SelectItem value="CFD Prop">CFD Prop</SelectItem>
                  <SelectItem value="Futures Prop">Futures Prop</SelectItem>
                  <SelectItem value="Broker Bonuses">Broker Bonuses</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Deals Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              All Deals ({filteredDeals.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Deal</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDeals.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex flex-col items-center gap-3 text-muted-foreground">
                          <FileText className="w-8 h-8" />
                          <p>No deals found matching your criteria</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDeals.map((deal) => (
                      <TableRow key={deal.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                              {getFirmLogo(deal.firmId) ? (
                                <img
                                  src={getFirmLogo(deal.firmId)}
                                  alt={getFirmName(deal.firmId)}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
                                  <span className="text-primary font-semibold text-sm">
                                    {getFirmName(deal.firmId).charAt(0)}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-left">{deal.title}</div>
                              <div className="text-sm text-muted-foreground text-left">
                                {getFirmName(deal.firmId)}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                            {getDiscountDisplay(deal)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={deal.status === 'Published' ? 'default' : 
                                   deal.status === 'Draft' ? 'secondary' : 'outline'}
                            className={
                              deal.status === 'Published' ? 'bg-green-50 text-green-700 border-green-200' :
                              deal.status === 'Draft' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                              'bg-gray-50 text-gray-700 border-gray-200'
                            }
                          >
                            {deal.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{deal.category}</span>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(deal.endDate).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(deal.endDate) > new Date() ? 'Active' : 'Expired'}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setViewingDeal(deal)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Preview deal</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditDeal(deal)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Edit deal</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(deal.couponCode, "Coupon code")}
                                  className="h-8 w-8 p-0"
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Copy code</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(deal.affiliateLink || '', "Affiliate link")}
                                  className="h-8 w-8 p-0"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Copy link</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteDeal(deal)}
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Delete deal</TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Edit Deal Dialog */}
        <Dialog open={!!editingDeal} onOpenChange={(open) => {
          if (!open) {
            setEditingDeal(null);
            resetForm();
          }
        }}>
          <DialogContent className="sm:max-w-2xl h-[90vh] max-h-[90vh] flex flex-col">
            <DialogHeader className="flex-shrink-0 pb-4">
              <DialogTitle>Edit Deal</DialogTitle>
              <DialogDescription>
                Update deal information and settings.
              </DialogDescription>
            </DialogHeader>
            
            <ScrollArea className="flex-1 overflow-auto">
              <div className="space-y-6 pb-6 pr-4">
                {renderFormFields()}
              </div>
            </ScrollArea>

            <DialogFooter className="flex-shrink-0 pt-4 border-t">
              <Button variant="outline" onClick={() => setEditingDeal(null)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateDeal} className="bg-blue-600 hover:bg-blue-700">
                Update Deal
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Preview Deal Dialog */}
        <Dialog open={!!viewingDeal} onOpenChange={(open) => !open && setViewingDeal(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader className="pb-2">
              <DialogTitle>Deal Preview</DialogTitle>
              <DialogDescription>
                How this deal will appear to users
              </DialogDescription>
            </DialogHeader>
            
            {viewingDeal && (
              <div className="flex justify-center">
                <div style={{ transform: 'scale(0.8)', transformOrigin: 'top' }}>
                  <SwipeableCouponCard
                    coupon={convertDealToCoupon(viewingDeal)}
                    onSwipeLeft={() => {}}
                    onSwipeRight={() => {}}
                    onClaim={() => {}}
                    isAuthenticated={true}
                    onLoginRequired={() => {}}
                  />
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Deal Dialog */}
        <AlertDialog open={!!deletingDeal} onOpenChange={(open) => !open && setDeletingDeal(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Deal</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{deletingDeal?.title}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteDeal}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete Deal
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}