import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Building2, CheckCircle, Mail, Phone, FileText, AlertTriangle, Shield } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { Company, User } from "./types";

interface CompanyClaimDialogProps {
  isOpen: boolean;
  onClose: () => void;
  existingCompany: Company;
  user: User;
  onClaimSubmitted: (claimData: CompanyClaimData) => void;
}

export interface CompanyClaimData {
  companyId: string;
  userId: string;
  verificationMethod: 'email_domain' | 'email_verification' | 'manual_approval';
  contactEmail: string;
  contactPhone?: string;
  verificationReason: string;
  supportingDocuments?: string[];
}

export function CompanyClaimDialog({
  isOpen,
  onClose,
  existingCompany,
  user,
  onClaimSubmitted
}: CompanyClaimDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationMethod, setVerificationMethod] = useState<'email_domain' | 'email_verification' | 'manual_approval'>('email_domain');
  const [contactEmail, setContactEmail] = useState(user.email || '');
  const [contactPhone, setContactPhone] = useState(user.phoneNumber || '');
  const [verificationReason, setVerificationReason] = useState('');
  
  const getCompanyDomain = (website: string) => {
    try {
      const url = new URL(website.startsWith('http') ? website : `https://${website}`);
      return url.hostname.replace('www.', '');
    } catch {
      return website.replace(/^(https?:\/\/)?(www\.)?/, '');
    }
  };

  const getUserEmailDomain = (email: string) => {
    return email.split('@')[1]?.toLowerCase();
  };

  const companyDomain = getCompanyDomain(existingCompany.website);
  const userEmailDomain = getUserEmailDomain(user.email || '');
  const domainMatches = companyDomain.toLowerCase() === userEmailDomain;

  const handleSubmit = async () => {
    if (!contactEmail.trim()) {
      toast.error("Contact email is required");
      return;
    }

    if (!verificationReason.trim()) {
      toast.error("Please explain your relationship to the company and why you should have access");
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call to submit claim
      await new Promise(resolve => setTimeout(resolve, 1500));

      const claimData: CompanyClaimData = {
        companyId: existingCompany.id,
        userId: user.id,
        verificationMethod,
        contactEmail: contactEmail.trim(),
        contactPhone: contactPhone.trim() || undefined,
        verificationReason: verificationReason.trim(),
      };

      onClaimSubmitted(claimData);
      toast.success("Access request submitted for review!");
      onClose();
    } catch (error) {
      toast.error("Failed to submit access request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] border-0 shadow-2xl bg-white dark:bg-slate-900 rounded-3xl overflow-hidden p-0 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 px-8 pt-8 pb-6 flex-shrink-0">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                Take Control of Your Deal Listings
              </DialogTitle>
              <DialogDescription className="text-slate-600 dark:text-slate-400">
                We're already promoting your deals as your affiliate partner
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-8 py-4">
          {/* Existing Company Info */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white dark:bg-slate-700 rounded-xl shadow-sm flex items-center justify-center flex-shrink-0">
                <Building2 className="w-6 h-6 text-slate-600 dark:text-slate-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-2">
                  {existingCompany.name}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                  {existingCompany.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {existingCompany.categories.map(category => (
                    <Badge key={category} variant="outline" className="text-xs">
                      {category}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-1">
                    <span>🌐</span>
                    <a href={existingCompany.website} target="_blank" rel="noopener noreferrer" 
                       className="text-blue-600 hover:underline">
                      {companyDomain}
                    </a>
                  </div>
                  <div className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    <span>{existingCompany.contactEmail}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Domain Match Indicator */}
          {domainMatches ? (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-semibold text-green-800 dark:text-green-200">
                    Domain Match Detected
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Your email domain ({userEmailDomain}) matches the company website ({companyDomain})
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/40 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="font-semibold text-amber-800 dark:text-amber-200">
                    Domain Verification Required
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Your email ({userEmailDomain}) doesn't match the company domain ({companyDomain})
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Verification Method Selection */}
          <div className="mb-6">
            <Label className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4 block">
              Verification Method
            </Label>
            <RadioGroup
              value={verificationMethod}
              onValueChange={(value: 'email_domain' | 'email_verification' | 'manual_approval') => 
                setVerificationMethod(value)
              }
              className="space-y-3"
            >
              <div className={`flex items-start space-x-3 p-4 rounded-xl border transition-colors ${
                verificationMethod === 'email_domain' 
                  ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20' 
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}>
                <RadioGroupItem value="email_domain" id="domain" className="mt-0.5" disabled={!domainMatches} />
                <div className="flex-1">
                  <Label htmlFor="domain" className={`cursor-pointer font-medium ${!domainMatches ? 'opacity-50' : ''}`}>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Domain Verification {domainMatches && <Badge className="bg-green-500 text-white text-xs">Recommended</Badge>}
                    </div>
                  </Label>
                  <p className={`text-sm mt-1 ${!domainMatches ? 'opacity-50' : 'text-slate-600 dark:text-slate-400'}`}>
                    Instant verification using your company email domain
                    {!domainMatches && ' (Not available - domain mismatch)'}
                  </p>
                </div>
              </div>

              <div className={`flex items-start space-x-3 p-4 rounded-xl border transition-colors ${
                verificationMethod === 'email_verification' 
                  ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20' 
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}>
                <RadioGroupItem value="email_verification" id="email" className="mt-0.5" />
                <div className="flex-1">
                  <Label htmlFor="email" className="cursor-pointer font-medium">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email Verification
                    </div>
                  </Label>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    We'll send verification emails to both your email and the company's listed email
                  </p>
                </div>
              </div>

              <div className={`flex items-start space-x-3 p-4 rounded-xl border transition-colors ${
                verificationMethod === 'manual_approval' 
                  ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20' 
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}>
                <RadioGroupItem value="manual_approval" id="manual" className="mt-0.5" />
                <div className="flex-1">
                  <Label htmlFor="manual" className="cursor-pointer font-medium">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Manual Review
                    </div>
                  </Label>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Our team will manually review your claim with additional documentation
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Contact Information */}
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email *</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="your@company-email.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input
                  id="contactPhone"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
          </div>

          {/* Information Notice */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-semibold mb-1">How Our Affiliate Partnership Works:</p>
                <ul className="space-y-1 text-sm">
                  <li>• We are already your affiliate partners, promoting your deals on KOOCAO</li>
                  <li>• Our marketing team regularly lists your offers to drive traffic to your platform</li>
                  <li>• We're inviting you to take direct control of how your deals are presented</li>
                  <li>• This collaboration helps us work together to optimize deal performance</li>
                  <li>• You can add new deals directly and reach our growing trader community</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Verification Reason */}
          <div className="space-y-2 mb-6">
            <Label htmlFor="reason">Please explain your relationship to {existingCompany.name} and why you should have access to manage their deal listings *</Label>
            <Textarea
              id="reason"
              value={verificationReason}
              onChange={(e) => setVerificationReason(e.target.value)}
              placeholder={`I am a representative of ${existingCompany.name} and would like to collaborate with KOOCAO to manage our deal listings directly. My role is...`}
              rows={4}
            />
          </div>
        </div>

        {/* Fixed Action Buttons at Bottom */}
        <div className="px-8 pb-8 flex gap-3 flex-shrink-0 border-t border-slate-200/50 dark:border-slate-700/50 pt-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="flex-1 rounded-2xl py-3"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl py-3 font-semibold"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Submitting Request...
              </>
            ) : (
              <>
                <Building2 className="w-4 h-4 mr-2" />
                Request Access to Manage Deals
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}