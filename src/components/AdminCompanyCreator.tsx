import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Checkbox } from "./ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "./ui/dialog";
import { Building2, Plus, Globe, Mail, Phone, CheckCircle, X, DollarSign, Link, Tag, Upload, Image } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { Company } from "./types";

interface AdminCompanyCreatorProps {
  onCompanyCreated: (company: Company) => void;
  adminUserId: string;
}

export function AdminCompanyCreator({ onCompanyCreated, adminUserId }: AdminCompanyCreatorProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedLogo, setUploadedLogo] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    website: '',
    categories: [] as string[],
    country: '',
    contactEmail: '',
    contactPhone: '',
    logoUrl: '',
    // Marketing data fields
    affiliateLink: '',
    couponCode: '',
    commissionRate: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const availableCategories = ['CFD', 'Futures', 'Crypto', 'Brokers', 'Casinos'];

  const handleLogoUpload = (files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target) {
            const dataUrl = e.target.result as string;
            setUploadedLogo(dataUrl);
            setFormData(prev => ({ ...prev, logoUrl: dataUrl }));
          }
        };
        reader.readAsDataURL(file);
      } else {
        toast.error('Please select a valid image file');
      }
    }
  };

  const handleCategoryToggle = (category: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
    
    // Clear category error if user selects at least one category
    if (errors.categories && !formData.categories.includes(category)) {
      setErrors(prev => ({ ...prev, categories: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Company name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Company description is required';
    }

    if (!formData.website.trim()) {
      newErrors.website = 'Website URL is required';
    } else if (!formData.website.match(/^https?:\/\/.+/)) {
      newErrors.website = 'Please enter a valid website URL (include http:// or https://)';
    }

    if (formData.categories.length === 0) {
      newErrors.categories = 'Please select at least one category';
    }

    if (!formData.contactEmail.trim()) {
      newErrors.contactEmail = 'Contact email is required';
    } else if (!formData.contactEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.contactEmail = 'Please enter a valid email address';
    }

    // Marketing data validation
    if (!formData.affiliateLink.trim()) {
      newErrors.affiliateLink = 'Affiliate link is required for revenue tracking';
    } else if (!formData.affiliateLink.match(/^https?:\/\/.+/)) {
      newErrors.affiliateLink = 'Please enter a valid affiliate URL (include http:// or https://)';
    }

    if (!formData.couponCode.trim()) {
      newErrors.couponCode = 'Coupon code is required for tracking';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newCompany: Company = {
        id: `admin-created-${Date.now()}`,
        name: formData.name,
        description: formData.description,
        website: formData.website,
        categories: formData.categories as ('CFD' | 'Futures' | 'Crypto' | 'Brokers' | 'Casinos')[],
        country: formData.country || undefined,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone || undefined,
        logoUrl: uploadedLogo || formData.logoUrl || undefined,
        createdAt: new Date().toISOString(),
        status: 'admin_created',
        createdBy: 'admin',
        originalCreatorId: adminUserId,
        // Marketing data
        affiliateLink: formData.affiliateLink,
        couponCode: formData.couponCode,
        commissionRate: formData.commissionRate || undefined,
        marketingComplete: true
      };

      onCompanyCreated(newCompany);
      
      // Reset form
      resetForm();
      
      setIsCreateModalOpen(false);
      toast.success(`${newCompany.name} created successfully with complete affiliate tracking! You can now add deals for this company.`);
    } catch (error) {
      toast.error("Failed to create company. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      website: '',
      categories: [],
      country: '',
      contactEmail: '',
      contactPhone: '',
      logoUrl: '',
      affiliateLink: '',
      couponCode: '',
      commissionRate: ''
    });
    setErrors({});
    setUploadedLogo(null);
  };

  return (
    <Dialog open={isCreateModalOpen} onOpenChange={(open) => {
      setIsCreateModalOpen(open);
      if (!open) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add Company
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto border-0 shadow-2xl bg-white dark:bg-slate-900 rounded-3xl p-0">
        {/* Header */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 px-8 pt-8 pb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                Create Company with Affiliate Setup
              </DialogTitle>
              <DialogDescription className="text-slate-600 dark:text-slate-400">
                Set up affiliate partnerships and start promoting their deals on KOOCAO
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="px-8 py-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Company Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Company Information
                </CardTitle>
                <CardDescription>
                  Basic information about the company you're setting up as an affiliate partner
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Company Logo Section */}
                <div>
                  <Label className="text-base font-medium">Company Logo</Label>
                  <div className="mt-2 flex items-center gap-6">
                    {/* Logo Preview */}
                    <div className="flex-shrink-0">
                      <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-xl flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600 overflow-hidden">
                        {uploadedLogo ? (
                          <img 
                            src={uploadedLogo} 
                            alt="Company logo" 
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Image className="w-8 h-8 text-slate-400" />
                        )}
                      </div>
                    </div>
                    
                    {/* Upload Controls */}
                    <div className="flex-1 space-y-3">
                      <div className="flex gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center gap-2"
                        >
                          <Upload className="w-4 h-4" />
                          Upload Logo
                        </Button>
                        {uploadedLogo && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setUploadedLogo(null);
                              setFormData(prev => ({ ...prev, logoUrl: '' }));
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                            Remove
                          </Button>
                        )}
                      </div>
                      <Input
                        type="file"
                        ref={fileInputRef}
                        onChange={(e) => handleLogoUpload(e.target.files)}
                        accept="image/*"
                        className="hidden"
                      />
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        <p>Upload a company logo (PNG, JPG, or SVG)</p>
                        <p>Recommended size: 200x200 pixels or larger</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Alternative: Logo URL */}
                  <div className="mt-4">
                    <Label htmlFor="logoUrl" className="text-sm">Or paste logo URL:</Label>
                    <Input
                      id="logoUrl"
                      type="url"
                      value={formData.logoUrl}
                      onChange={(e) => handleInputChange('logoUrl', e.target.value)}
                      placeholder="https://example.com/logo.png"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-base font-medium">Company Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="e.g., FTMO, TopStep"
                      className={errors.name ? 'border-red-500' : ''}
                    />
                    {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                  </div>

                  <div className="space-y-3">
                    <Label className="text-base font-medium">Business Categories *</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {availableCategories.map(category => (
                        <div key={category} className="flex items-center space-x-3">
                          <Checkbox
                            id={`category-${category}`}
                            checked={formData.categories.includes(category)}
                            onCheckedChange={() => handleCategoryToggle(category)}
                            className={errors.categories ? 'border-red-500' : ''}
                          />
                          <Label
                            htmlFor={`category-${category}`}
                            className="cursor-pointer flex items-center gap-2 text-sm font-medium"
                          >
                            <Badge variant="outline" className="text-xs px-2 py-1">
                              {category}
                            </Badge>
                          </Label>
                        </div>
                      ))}
                    </div>
                    {formData.categories.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">Selected:</span>
                        {formData.categories.map(category => (
                          <Badge 
                            key={category} 
                            className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 px-3 py-1"
                          >
                            {category}
                            <button
                              type="button"
                              onClick={() => handleCategoryToggle(category)}
                              className="ml-2 hover:bg-green-200 dark:hover:bg-green-800 rounded-full p-0.5 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                    {errors.categories && <p className="text-sm text-red-500">{errors.categories}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-base font-medium">Company Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe the company, their services, and what makes them unique..."
                    rows={4}
                    className={errors.description ? 'border-red-500' : ''}
                  />
                  {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="website" className="text-base font-medium">Website URL *</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="website"
                        value={formData.website}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                        placeholder="https://company.com"
                        className={`pl-10 ${errors.website ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {errors.website && <p className="text-sm text-red-500">{errors.website}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-base font-medium">Country</Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      placeholder="e.g., United States, Czech Republic"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Contact Information
                </CardTitle>
                <CardDescription>
                  Contact details for reaching out about partnership opportunities and verification
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail" className="text-base font-medium">Contact Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="contactEmail"
                        type="email"
                        value={formData.contactEmail}
                        onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                        placeholder="info@company.com"
                        className={`pl-10 ${errors.contactEmail ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {errors.contactEmail && <p className="text-sm text-red-500">{errors.contactEmail}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactPhone" className="text-base font-medium">Contact Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="contactPhone"
                        value={formData.contactPhone}
                        onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                        placeholder="+1 (555) 123-4567"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Marketing Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Marketing Information
                </CardTitle>
                <CardDescription>
                  Information for tracking affiliate revenue and deals
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="affiliateLink" className="text-base font-medium">Affiliate Link *</Label>
                    <div className="relative">
                      <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="affiliateLink"
                        value={formData.affiliateLink}
                        onChange={(e) => handleInputChange('affiliateLink', e.target.value)}
                        placeholder="https://affiliate.company.com"
                        className={`pl-10 ${errors.affiliateLink ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {errors.affiliateLink && <p className="text-sm text-red-500">{errors.affiliateLink}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="couponCode" className="text-base font-medium">Coupon Code *</Label>
                    <Input
                      id="couponCode"
                      value={formData.couponCode}
                      onChange={(e) => handleInputChange('couponCode', e.target.value)}
                      placeholder="e.g., KOOCAO15"
                      className={errors.couponCode ? 'border-red-500' : ''}
                    />
                    {errors.couponCode && <p className="text-sm text-red-500">{errors.couponCode}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="commissionRate" className="text-base font-medium">Commission Rate</Label>
                    <div className="relative">
                      <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="commissionRate"
                        value={formData.commissionRate}
                        onChange={(e) => handleInputChange('commissionRate', e.target.value)}
                        placeholder="e.g., 25% or $50 per signup"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                {/* Marketing Preview */}
                {(formData.affiliateLink || formData.couponCode) && (
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 mt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-slate-900 dark:text-slate-100">Marketing Setup Preview</span>
                    </div>
                    <div className="space-y-3">
                      {formData.affiliateLink && (
                        <div className="flex items-center gap-3">
                          <Link className="w-4 h-4 text-blue-600 flex-shrink-0" />
                          <span className="text-slate-600 dark:text-slate-400 font-medium min-w-0">Affiliate:</span>
                          <code className="bg-slate-200 dark:bg-slate-700 px-3 py-1 rounded text-sm flex-1 truncate">{formData.affiliateLink}</code>
                        </div>
                      )}
                      {formData.couponCode && (
                        <div className="flex items-center gap-3">
                          <Tag className="w-4 h-4 text-amber-600 flex-shrink-0" />
                          <span className="text-slate-600 dark:text-slate-400 font-medium">Code:</span>
                          <code className="bg-slate-200 dark:bg-slate-700 px-3 py-1 rounded text-sm">{formData.couponCode}</code>
                        </div>
                      )}
                      {formData.commissionRate && (
                        <div className="flex items-center gap-3">
                          <DollarSign className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <span className="text-slate-600 dark:text-slate-400 font-medium">Rate:</span>
                          <span className="font-semibold text-green-600">{formData.commissionRate}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Information Notice */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <p className="font-semibold mb-2">Complete Affiliate Setup:</p>
                  <ul className="space-y-1 text-sm leading-relaxed">
                    <li>• Affiliate link and coupon code are required for revenue tracking</li>
                    <li>• All deals from this company will automatically inherit these marketing settings</li>
                    <li>• Companies can later manage their own deals but cannot modify affiliate data</li>
                    <li>• This ensures consistent revenue generation across all partnerships</li>
                  </ul>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Action Buttons */}
        <div className="px-8 pb-8 flex gap-4">
          <Button 
            type="button"
            variant="outline" 
            onClick={() => setIsCreateModalOpen(false)}
            className="flex-1 rounded-2xl py-4 text-base"
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-2xl py-4 text-base font-semibold"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
                Creating Company...
              </>
            ) : (
              <>
                <Building2 className="w-5 h-5 mr-3" />
                Create Company with Affiliate Setup
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}