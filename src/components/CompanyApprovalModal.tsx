import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { Switch } from './ui/switch';
import { 
  Building2,
  Users,
  Globe,
  Mail,
  MapPin,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Search,
  Shield,
  Link as LinkIcon,
  Copy,
  DollarSign,
  Tag,
  ExternalLink
} from 'lucide-react';
import { Company } from './types';
import { toast } from 'sonner@2.0.3';

interface CompanyApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendingCompany: Company | null;
  potentialMatches: Company[];
  onMergeWithExisting: (existingCompanyId: string, pendingCompany: Company, notes?: string) => void;
  onCreateNew: (pendingCompany: Company, marketingData?: any) => void;
}

export function CompanyApprovalModal({
  isOpen,
  onClose,
  pendingCompany,
  potentialMatches,
  onMergeWithExisting,
  onCreateNew
}: CompanyApprovalModalProps) {
  const [selectedAction, setSelectedAction] = useState<'merge' | 'create' | null>(null);
  const [selectedExistingCompany, setSelectedExistingCompany] = useState<Company | null>(null);
  const [connectionNotes, setConnectionNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Marketing data state
  const [marketingData, setMarketingData] = useState({
    defaultAffiliateLink: '',
    defaultCouponCode: '',
    commissionRate: '',
    trackingEnabled: true,
    notes: ''
  });

  if (!pendingCompany) return null;

  const filteredMatches = potentialMatches.filter(company =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.website.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleMerge = () => {
    if (selectedExistingCompany) {
      onMergeWithExisting(selectedExistingCompany.id, pendingCompany, connectionNotes.trim());
      resetForm();
      onClose();
      toast.success(`${pendingCompany.name} merged with existing ${selectedExistingCompany.name} profile`);
    }
  };

  const handleCreateNew = () => {
    // Include marketing data when creating new company
    const marketingDataToSend = {
      defaultAffiliateLink: marketingData.defaultAffiliateLink.trim(),
      defaultCouponCode: marketingData.defaultCouponCode.trim(),
      commissionRate: marketingData.commissionRate.trim(),
      trackingEnabled: marketingData.trackingEnabled,
      notes: marketingData.notes.trim(),
      isComplete: !!(marketingData.defaultAffiliateLink.trim() && marketingData.defaultCouponCode.trim())
    };
    
    onCreateNew(pendingCompany, marketingDataToSend);
    resetForm();
    onClose();
    toast.success(`${pendingCompany.name} approved as new company profile`);
  };

  const resetForm = () => {
    setSelectedAction(null);
    setSelectedExistingCompany(null);
    setConnectionNotes('');
    setSearchQuery('');
    setMarketingData({
      defaultAffiliateLink: '',
      defaultCouponCode: '',
      commissionRate: '',
      trackingEnabled: true,
      notes: ''
    });
  };

  const getMarketingStatusBadge = (company: Company) => {
    const marketing = company.defaultMarketingData;
    if (!marketing || !marketing.isComplete) {
      return <Badge variant="outline" className="text-amber-600 border-amber-300 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />Needs Marketing Setup</Badge>;
    }
    
    return <Badge className="bg-green-500 hover:bg-green-600 flex items-center gap-1"><CheckCircle className="w-3 h-3" />Marketing Complete</Badge>;
  };

  const isMarketingDataComplete = marketingData.defaultAffiliateLink.trim() && marketingData.defaultCouponCode.trim();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Company Application Review
          </DialogTitle>
          <DialogDescription>
            Review the company application and decide whether to merge with an existing profile or create a new one.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Pending Company Details */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Pending Application
            </h3>
            
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                {pendingCompany.logoUrl ? (
                  <img src={pendingCompany.logoUrl} alt={pendingCompany.name} className="w-14 h-14 rounded-lg object-cover" />
                ) : (
                  <Building2 className="w-8 h-8 text-white" />
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-semibold text-xl text-slate-900 dark:text-slate-100">{pendingCompany.name}</h4>
                  <Badge variant="outline" className="text-yellow-600 border-yellow-300">Pending Approval</Badge>
                </div>
                
                <p className="text-slate-600 dark:text-slate-400 mb-3">{pendingCompany.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-slate-500" />
                    <a href={pendingCompany.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {pendingCompany.website}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-500" />
                    <span>{pendingCompany.contactEmail}</span>
                  </div>
                  {pendingCompany.country && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-500" />
                      <span>{pendingCompany.country}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-500" />
                    <div className="flex gap-1">
                      {pendingCompany.categories.map(category => (
                        <Badge key={category} variant="secondary" className="text-xs">{category}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="text-xs text-slate-400 mt-3">
                  Applied: {new Date(pendingCompany.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          {/* Action Selection */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">Choose Action</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Merge Option */}
              <div 
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  selectedAction === 'merge' 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
                onClick={() => setSelectedAction('merge')}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    selectedAction === 'merge' ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}>
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100">Merge with Existing</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Connect to an existing company profile</p>
                    {potentialMatches.length > 0 && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                        {potentialMatches.length} potential match{potentialMatches.length !== 1 ? 'es' : ''} found
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Create New Option */}
              <div 
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  selectedAction === 'create' 
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
                onClick={() => setSelectedAction('create')}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    selectedAction === 'create' ? 'bg-green-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}>
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100">Create New Profile</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Approve as a new company profile</p>
                    <p className="text-xs text-slate-500 mt-1">Use if no duplicates exist</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Marketing Data Setup - Only for Create New */}
          {selectedAction === 'create' && (
            <div className="space-y-4">
              <Separator />
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  Marketing Data Setup
                  {isMarketingDataComplete && (
                    <Badge className="bg-green-500 hover:bg-green-600 text-white">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Complete
                    </Badge>
                  )}
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  Set up affiliate tracking and default coupon codes for this company. This data will be inherited by all deals from this company.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="affiliate-link" className="flex items-center gap-2">
                      <LinkIcon className="w-4 h-4" />
                      Default Affiliate Link *
                    </Label>
                    <Input
                      id="affiliate-link"
                      value={marketingData.defaultAffiliateLink}
                      onChange={(e) => setMarketingData(prev => ({ ...prev, defaultAffiliateLink: e.target.value }))}
                      placeholder="https://partner.example.com/ref=koocao"
                      className="bg-white dark:bg-slate-800"
                    />
                    <p className="text-xs text-slate-500">Main affiliate/referral link for revenue tracking</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="coupon-code" className="flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Default Coupon Code *
                    </Label>
                    <Input
                      id="coupon-code"
                      value={marketingData.defaultCouponCode}
                      onChange={(e) => setMarketingData(prev => ({ ...prev, defaultCouponCode: e.target.value }))}
                      placeholder="KOOCAO20"
                      className="bg-white dark:bg-slate-800"
                    />
                    <p className="text-xs text-slate-500">Default discount code for deals</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="commission-rate">Commission Rate</Label>
                    <Input
                      id="commission-rate"
                      value={marketingData.commissionRate}
                      onChange={(e) => setMarketingData(prev => ({ ...prev, commissionRate: e.target.value }))}
                      placeholder="e.g., 25% or $50 per signup"
                      className="bg-white dark:bg-slate-800"
                    />
                    <p className="text-xs text-slate-500">Revenue per conversion (optional)</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="tracking" className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Enable Tracking
                      </Label>
                      <Switch
                        id="tracking"
                        checked={marketingData.trackingEnabled}
                        onCheckedChange={(checked) => setMarketingData(prev => ({ ...prev, trackingEnabled: checked }))}
                      />
                    </div>
                    <p className="text-xs text-slate-500">Track clicks and conversions for analytics</p>
                  </div>
                </div>
                
                <div className="space-y-2 mt-4">
                  <Label htmlFor="marketing-notes">Marketing Notes</Label>
                  <Textarea
                    id="marketing-notes"
                    value={marketingData.notes}
                    onChange={(e) => setMarketingData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Special instructions, contact details, or notes about this partnership..."
                    rows={3}
                    className="bg-white dark:bg-slate-800"
                  />
                </div>
                
                {!isMarketingDataComplete && (
                  <div className="flex items-center gap-2 mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                      Affiliate link and coupon code are required for deals to go live
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Merge Details */}
          {selectedAction === 'merge' && (
            <div className="space-y-4">
              <Separator />
              <h4 className="font-semibold text-slate-900 dark:text-slate-100">Select Existing Company</h4>
              
              {potentialMatches.length > 0 && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search existing companies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              )}
              
              <div className="max-h-60 overflow-y-auto space-y-2">
                {filteredMatches.length > 0 ? (
                  filteredMatches.map((company) => (
                    <div
                      key={company.id}
                      className={`border rounded-lg p-3 cursor-pointer transition-all ${
                        selectedExistingCompany?.id === company.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                      onClick={() => setSelectedExistingCompany(company)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-slate-400 to-slate-500 rounded-lg flex items-center justify-center">
                          {company.logoUrl ? (
                            <img src={company.logoUrl} alt={company.name} className="w-8 h-8 rounded-lg object-cover" />
                          ) : (
                            <Building2 className="w-5 h-5 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h5 className="font-medium text-slate-900 dark:text-slate-100">{company.name}</h5>
                            {getMarketingStatusBadge(company)}
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">{company.website}</p>
                          <div className="flex gap-1 mt-1">
                            {company.categories.map(category => (
                              <Badge key={category} variant="outline" className="text-xs">{category}</Badge>
                            ))}
                          </div>
                          
                          {/* Show marketing data if available */}
                          {company.defaultMarketingData?.isComplete && (
                            <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                              <div className="flex items-center gap-4 text-xs">
                                <div className="flex items-center gap-1">
                                  <LinkIcon className="w-3 h-3 text-green-600" />
                                  <span className="text-green-700 dark:text-green-400">Affiliate Link Set</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Tag className="w-3 h-3 text-green-600" />
                                  <span className="text-green-700 dark:text-green-400">Code: {company.defaultMarketingData.defaultCouponCode}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        {selectedExistingCompany?.id === company.id && (
                          <CheckCircle className="w-5 h-5 text-blue-500" />
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    {searchQuery ? 'No matches found for your search' : 'No existing companies to merge with'}
                  </div>
                )}
              </div>
              
              {selectedExistingCompany && (
                <div className="space-y-3">
                  <Label>Connection Notes (Optional)</Label>
                  <Textarea
                    value={connectionNotes}
                    onChange={(e) => setConnectionNotes(e.target.value)}
                    placeholder="Add notes about this company connection..."
                    rows={3}
                  />
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => { resetForm(); onClose(); }}>
              Cancel
            </Button>
            
            {selectedAction === 'merge' && (
              <Button 
                onClick={handleMerge}
                disabled={!selectedExistingCompany}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Users className="w-4 h-4 mr-2" />
                Merge Companies
              </Button>
            )}
            
            {selectedAction === 'create' && (
              <Button 
                onClick={handleCreateNew}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Create New Profile
                {!isMarketingDataComplete && (
                  <AlertTriangle className="w-4 h-4 ml-2 text-yellow-200" />
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}