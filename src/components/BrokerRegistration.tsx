import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Checkbox } from "./ui/checkbox";
import { AlertCircle, Building2, CheckCircle, Globe, Mail, Phone, ArrowLeft, X } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import { toast } from "sonner@2.0.3";
import { Company, User } from "./types";
import { CompanyClaimDialog, CompanyClaimData } from "./CompanyClaimDialog";
import { checkExistingCompany, createCompany, claimCompany } from "../lib/admin-companies";

interface BrokerRegistrationProps {
  user: User;
  onBack: () => void;
  onRegisterSuccess: (company: Company) => void;
  onClaimSubmitted?: (claimData: CompanyClaimData) => void; // Add callback for claim submissions
}

export function BrokerRegistration({ user, onBack, onRegisterSuccess, onClaimSubmitted }: BrokerRegistrationProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    website: '',
    categories: [] as string[], // Changed to support multiple categories
    country: '',
    contactEmail: user.email || '',
    contactPhone: user.phoneNumber || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Company claim dialog state
  const [existingCompany, setExistingCompany] = useState<Company | null>(null);
  const [isClaimDialogOpen, setIsClaimDialogOpen] = useState(false);

  const availableCategories = ['CFD', 'Futures', 'Crypto', 'Brokers', 'Casinos'];

  // Mock existing companies for demonstration
  const mockExistingCompanies: Company[] = [
    {
      id: 'ftmo-existing',
      name: 'FTMO',
      description: 'Leading prop trading firm offering funded trading accounts to skilled traders worldwide.',
      website: 'https://ftmo.com',
      categories: ['CFD', 'Futures'],
      contactEmail: 'info@ftmo.com',
      createdAt: '2024-01-15T10:00:00Z',
      status: 'admin_created',
      createdBy: 'admin',
      originalCreatorId: 'admin_001'
    },
    {
      id: 'topstep-existing', 
      name: 'TopstepTrader',
      description: 'Futures prop trading firm focused on developing and funding futures traders.',
      website: 'https://topsteptrader.com',
      categories: ['Futures'],
      contactEmail: 'support@topsteptrader.com',
      createdAt: '2024-02-20T14:30:00Z',
      status: 'admin_created',
      createdBy: 'admin',
      originalCreatorId: 'admin_001'
    }
  ];

  const checkForExistingCompany = (companyName: string, website: string): Company | null => {
    const normalizedName = companyName.toLowerCase().trim();
    const normalizedWebsite = website.replace(/^(https?:\/\/)?(www\.)?/, '').toLowerCase().trim();
    
    return mockExistingCompanies.find(company => {
      const existingName = company.name.toLowerCase().trim();
      const existingWebsite = company.website.replace(/^(https?:\/\/)?(www\.)?/, '').toLowerCase().trim();
      
      return existingName === normalizedName || existingWebsite === normalizedWebsite;
    }) || null;
  };

  const handleClaimSubmission = async (claimData: CompanyClaimData) => {
    if (!existingCompany) return;
    
    try {
      const { success, error } = await claimCompany(existingCompany.id, user.id, claimData);
      
      if (success) {
        if (onClaimSubmitted) {
          onClaimSubmitted(claimData);
        }
        toast.success("Company claim submitted! Our team will review your request and get back to you within 1-3 business days.");
        onBack();
      } else {
        toast.error(error || "Failed to submit claim. Please try again.");
      }
    } catch (error) {
      console.error('Claim submission error:', error);
      toast.error("Failed to submit claim. Please try again.");
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Check if we're already promoting this company as affiliates
    const { company: existingComp } = await checkExistingCompany(formData.name, formData.website);
    if (existingComp) {
      setExistingCompany(existingComp);
      setIsClaimDialogOpen(true);
      return;
    }

    setIsSubmitting(true);

    try {
      const { success, company, error } = await createCompany({
        name: formData.name,
        description: formData.description,
        website: formData.website,
        categories: formData.categories as ('CFD' | 'Futures' | 'Crypto' | 'Brokers' | 'Casinos')[],
        country: formData.country || undefined,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone || undefined,
        status: 'pending',
        userId: user.id,
        createdBy: 'user'
      });

      if (success && company) {
        onRegisterSuccess(company);
        toast.success("Company registration submitted! You'll be notified once approved.");
      } else {
        toast.error(error || "Failed to submit registration. Please try again.");
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error("Failed to submit registration. Please try again.");
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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="mb-4 rounded-xl border-slate-200/50 dark:border-slate-700/50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl rounded-2xl border border-white/30 dark:border-slate-700/40 shadow-xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Register Your Company</h1>
              <p className="text-slate-600 dark:text-slate-400">Join KOOCAO and list your deals to reach more traders</p>
            </div>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your company will need admin approval before you can create deals. This usually takes 1-3 business days.
            </AlertDescription>
          </Alert>
        </div>
      </div>

      {/* Registration Form */}
      <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl rounded-2xl border border-white/30 dark:border-slate-700/40 shadow-xl p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Company Information
              </CardTitle>
              <CardDescription>
                Tell us about your company and what you offer
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Company Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., FTMO, TopStep"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Business Categories *</Label>
                  <div className="space-y-3">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Select all categories that apply to your business. You can create deals in any category regardless of your selection here.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
                            className="cursor-pointer flex items-center gap-2"
                          >
                            <Badge variant="outline" className="text-xs">
                              {category}
                            </Badge>
                          </Label>
                        </div>
                      ))}
                    </div>
                    {formData.categories.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Selected:</span>
                        {formData.categories.map(category => (
                          <Badge 
                            key={category} 
                            variant="default" 
                            className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                          >
                            {category}
                            <button
                              type="button"
                              onClick={() => handleCategoryToggle(category)}
                              className="ml-2 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  {errors.categories && <p className="text-sm text-red-500">{errors.categories}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Company Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your company, services, and what makes you unique..."
                  rows={4}
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website">Website URL *</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="https://yourcompany.com"
                      className={`pl-10 ${errors.website ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.website && <p className="text-sm text-red-500">{errors.website}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
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
                How can our team reach you for verification and support?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="contactEmail"
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                      placeholder="contact@yourcompany.com"
                      className={`pl-10 ${errors.contactEmail ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.contactEmail && <p className="text-sm text-red-500">{errors.contactEmail}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
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

          {/* Terms & Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Guidelines & Requirements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5">1</Badge>
                  <p>All deals must be legitimate offers available to the public</p>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5">2</Badge>
                  <p>You cannot include affiliate links or coupon codes - our admin team handles all monetization</p>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5">3</Badge>
                  <p>Company verification is required before listing deals</p>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5">4</Badge>
                  <p>All deals are subject to admin approval before going live</p>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5">5</Badge>
                  <p>You can create deals in any category - your business categories are for organizational purposes only</p>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5">6</Badge>
                  <p>Maintain accurate and up-to-date deal information</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl px-8 py-3 font-semibold shadow-lg"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <Building2 className="w-4 h-4 mr-2" />
                  Submit for Approval
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Company Claim Dialog */}
      {existingCompany && (
        <CompanyClaimDialog
          isOpen={isClaimDialogOpen}
          onClose={() => {
            setIsClaimDialogOpen(false);
            setExistingCompany(null);
          }}
          existingCompany={existingCompany}
          user={user}
          onClaimSubmitted={handleClaimSubmission}
        />
      )}
    </div>
  );
}