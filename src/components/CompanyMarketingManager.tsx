import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { 
  Link,
  Shield, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Edit,
  Save,
  RefreshCw,
  ExternalLink,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';
import { Company } from './types';
import { toast } from 'sonner@2.0.3';

interface CompanyMarketingManagerProps {
  companies: Company[];
  onUpdateCompanyMarketing: (companyId: string, marketingData: Company['defaultMarketingData']) => void;
  isLoading?: boolean;
  onRefresh?: () => void;
}

export function CompanyMarketingManager({ 
  companies = [], 
  onUpdateCompanyMarketing,
  isLoading = false,
  onRefresh
}: CompanyMarketingManagerProps) {
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [showAffiliateLinks, setShowAffiliateLinks] = useState(false);

  const [marketingForm, setMarketingForm] = useState({
    affiliateLink: '',
    defaultCouponCode: '',
    trackingParameters: '',
    conversionPixel: '',
    notes: ''
  });

  const [formErrors, setFormErrors] = useState({
    affiliateLink: '',
    defaultCouponCode: ''
  });

  const handleEditMarketing = (company: Company) => {
    setEditingCompany(company);
    const marketing = company.defaultMarketingData || {};
    setMarketingForm({
      affiliateLink: marketing.affiliateLink || '',
      defaultCouponCode: marketing.defaultCouponCode || '',
      trackingParameters: marketing.trackingParameters || '',
      conversionPixel: marketing.conversionPixel || '',
      notes: marketing.notes || ''
    });
    setFormErrors({
      affiliateLink: '',
      defaultCouponCode: ''
    });
    setIsEditDialogOpen(true);
  };

  const validateForm = () => {
    const errors = {
      affiliateLink: !marketingForm.affiliateLink ? 'Affiliate link is required' : '',
      defaultCouponCode: !marketingForm.defaultCouponCode ? 'Default coupon code is required' : ''
    };

    setFormErrors(errors);
    return !Object.values(errors).some(error => error !== '');
  };

  const handleSaveMarketing = () => {
    if (validateForm() && editingCompany) {
      const updatedMarketingData: Company['defaultMarketingData'] = {
        affiliateLink: marketingForm.affiliateLink.trim(),
        defaultCouponCode: marketingForm.defaultCouponCode.trim(),
        trackingParameters: marketingForm.trackingParameters.trim(),
        conversionPixel: marketingForm.conversionPixel.trim(),
        notes: marketingForm.notes.trim(),
        isComplete: !!(marketingForm.affiliateLink.trim() && marketingForm.defaultCouponCode.trim()),
        updatedAt: new Date().toISOString(),
        updatedBy: 'admin-user-id' // In production, get from auth context
      };

      onUpdateCompanyMarketing(editingCompany.id, updatedMarketingData);
      setIsEditDialogOpen(false);
      setEditingCompany(null);
      toast.success('Company marketing data updated successfully');
    }
  };

  const getMarketingStatusBadge = (company: Company) => {
    const marketing = company.defaultMarketingData;
    if (!marketing) {
      return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="w-3 h-3" />No Data</Badge>;
    }
    
    if (marketing.isComplete) {
      return <Badge className="bg-green-500 hover:bg-green-600 flex items-center gap-1"><CheckCircle className="w-3 h-3" />Complete</Badge>;
    }
    
    return <Badge variant="outline" className="text-amber-600 border-amber-300 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />Incomplete</Badge>;
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${label} copied to clipboard`);
    });
  };

  const approvedCompanies = companies.filter(c => c.status === 'approved' || c.status === 'admin_created' || c.status === 'connected');
  const completeMarketingCount = approvedCompanies.filter(c => c.defaultMarketingData?.isComplete).length;
  const incompleteMarketingCount = approvedCompanies.filter(c => !c.defaultMarketingData?.isComplete).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Company Marketing Manager</h2>
          <p className="text-slate-600 dark:text-slate-400">Manage affiliate links and coupon codes - source of truth for all deals</p>
        </div>
        <div className="flex gap-2">
          {onRefresh && (
            <Button variant="outline" onClick={onRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          )}
          <Button 
            variant="outline" 
            onClick={() => setShowAffiliateLinks(!showAffiliateLinks)}
            className={showAffiliateLinks ? "bg-slate-100 dark:bg-slate-800" : ""}
          >
            {showAffiliateLinks ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {showAffiliateLinks ? 'Hide Links' : 'Show Links'}
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-blue-500">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Active Companies</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{approvedCompanies.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-green-500">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Complete Marketing</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{completeMarketingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-amber-500">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Need Setup</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{incompleteMarketingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Companies List */}
      <Card>
        <CardHeader>
          <CardTitle>Company Marketing Data ({approvedCompanies.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {approvedCompanies.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">No approved companies</h3>
              <p className="text-slate-600 dark:text-slate-400">No companies have been approved yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {approvedCompanies.map((company) => (
                <div key={company.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                        {company.logoUrl ? (
                          <img src={company.logoUrl} alt={company.name} className="w-10 h-10 rounded-lg object-cover" />
                        ) : (
                          <Shield className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">{company.name}</h3>
                          {getMarketingStatusBadge(company)}
                          <div className="flex flex-wrap gap-1">
                            {company.categories.map(category => (
                              <Badge key={category} variant="outline" className="text-xs">
                                {category}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <p className="text-slate-600 dark:text-slate-400 mb-3">{company.description}</p>
                        
                        {/* Marketing Data Preview */}
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 space-y-2">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-slate-500 dark:text-slate-400">Affiliate Link:</span>
                              <div className="flex items-center gap-2 mt-1">
                                {company.defaultMarketingData?.affiliateLink ? (
                                  <>
                                    <code className="text-xs bg-white dark:bg-slate-700 px-2 py-1 rounded">
                                      {showAffiliateLinks 
                                        ? company.defaultMarketingData.affiliateLink.substring(0, 40) + '...'
                                        : '••••••••••••••••'
                                      }
                                    </code>
                                    {showAffiliateLinks && (
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={() => copyToClipboard(company.defaultMarketingData!.affiliateLink!, 'Affiliate link')}
                                      >
                                        <Copy className="w-3 h-3" />
                                      </Button>
                                    )}
                                  </>
                                ) : (
                                  <span className="text-slate-400 italic">Not set</span>
                                )}
                              </div>
                            </div>
                            
                            <div>
                              <span className="text-slate-500 dark:text-slate-400">Default Coupon:</span>
                              <div className="flex items-center gap-2 mt-1">
                                {company.defaultMarketingData?.defaultCouponCode ? (
                                  <>
                                    <code className="text-xs bg-white dark:bg-slate-700 px-2 py-1 rounded font-semibold">
                                      {company.defaultMarketingData.defaultCouponCode}
                                    </code>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      onClick={() => copyToClipboard(company.defaultMarketingData!.defaultCouponCode!, 'Coupon code')}
                                    >
                                      <Copy className="w-3 h-3" />
                                    </Button>
                                  </>
                                ) : (
                                  <span className="text-slate-400 italic">Not set</span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {company.defaultMarketingData?.updatedAt && (
                            <div className="text-xs text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-600">
                              Last updated: {new Date(company.defaultMarketingData.updatedAt).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEditMarketing(company)}
                        className="text-blue-600"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit Marketing
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Marketing Dialog */}
      {editingCompany && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Marketing Data - {editingCompany.name}</DialogTitle>
              <DialogDescription>
                Set up affiliate links and coupon codes that will be inherited by all deals from this company.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
                <div className="flex items-start gap-2">
                  <Shield className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Source of Truth</p>
                    <p className="text-xs text-blue-700 dark:text-blue-300">This data will be automatically inherited by all deals from this company. Admins can override on a per-deal basis.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Affiliate Link *</Label>
                <Input
                  type="url"
                  value={marketingForm.affiliateLink}
                  onChange={e => setMarketingForm(prev => ({ ...prev, affiliateLink: e.target.value }))}
                  placeholder="https://company.com/signup?ref=koocao"
                  className={formErrors.affiliateLink ? "border-red-500" : ""}
                />
                {formErrors.affiliateLink && (
                  <p className="text-red-500 text-sm">{formErrors.affiliateLink}</p>
                )}
                <p className="text-xs text-slate-500">Primary affiliate link for all deals from this company</p>
              </div>

              <div className="space-y-2">
                <Label>Default Coupon Code *</Label>
                <Input
                  type="text"
                  value={marketingForm.defaultCouponCode}
                  onChange={e => setMarketingForm(prev => ({ ...prev, defaultCouponCode: e.target.value.toUpperCase() }))}
                  placeholder="KOOCAO20"
                  className={formErrors.defaultCouponCode ? "border-red-500" : ""}
                />
                {formErrors.defaultCouponCode && (
                  <p className="text-red-500 text-sm">{formErrors.defaultCouponCode}</p>
                )}
                <p className="text-xs text-slate-500">Default coupon code that will be inherited by deals</p>
              </div>

              <div className="space-y-2">
                <Label>Tracking Parameters (Optional)</Label>
                <Input
                  type="text"
                  value={marketingForm.trackingParameters}
                  onChange={e => setMarketingForm(prev => ({ ...prev, trackingParameters: e.target.value }))}
                  placeholder="utm_source=koocao&utm_medium=affiliate"
                />
                <p className="text-xs text-slate-500">Additional tracking parameters to append to links</p>
              </div>

              <div className="space-y-2">
                <Label>Conversion Pixel (Optional)</Label>
                <Textarea
                  value={marketingForm.conversionPixel}
                  onChange={e => setMarketingForm(prev => ({ ...prev, conversionPixel: e.target.value }))}
                  placeholder="<!-- Conversion tracking pixel code -->"
                  rows={3}
                />
                <p className="text-xs text-slate-500">Conversion tracking pixel or code for this company</p>
              </div>

              <div className="space-y-2">
                <Label>Notes (Optional)</Label>
                <Textarea
                  value={marketingForm.notes}
                  onChange={e => setMarketingForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Internal notes about this company's marketing setup..."
                  rows={3}
                />
                <p className="text-xs text-slate-500">Internal notes for admin reference</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
              <Button 
                onClick={handleSaveMarketing} 
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Marketing Data
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}