import { toast } from 'sonner@2.0.3';
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Switch } from './ui/switch';
import { 
  Plus, 
  Search, 
  Calendar,
  Building2,
  CheckCircle,
  XCircle,
  Clock,
  Edit,
  Eye,
  Trash2,
  Users,
  Settings,
  AlertCircle,
  RefreshCw,
  Shield,
  Link as LinkIcon,
  Copy,
  Zap,
  ArrowDown,
  AlertTriangle
} from 'lucide-react';
import { AdminDeal, BrokerDeal, Company } from './types';

interface UnifiedDealsManagerEnhancedProps {
  adminDeals: AdminDeal[];
  brokerDeals: BrokerDeal[];
  companies: Company[];
  onCreateAdminDeal?: (deal: Omit<AdminDeal, 'id'>) => void;
  onEditAdminDeal?: (deal: AdminDeal) => void;
  onDeleteAdminDeal?: (dealId: string) => void;
  onApproveBrokerDeal?: (dealId: string, marketingData?: { affiliateLink: string; couponCode: string }) => void;
  onRejectBrokerDeal?: (dealId: string, reason: string) => void;
  onEditBrokerDeal?: (deal: BrokerDeal) => void;
  onInheritMarketingData?: (dealId: string, companyId: string) => void;
  onOverrideMarketingData?: (dealId: string, overrideData: { affiliateLink?: string; couponCode?: string; notes?: string }) => void;
  isLoading?: boolean;
  onRefresh?: () => void;
}

type DealType = 'all' | 'admin' | 'broker';
type DealStatus = 'all' | 'draft' | 'pending' | 'live' | 'approved' | 'rejected';

export function UnifiedDealsManagerEnhanced({
  adminDeals = [],
  brokerDeals = [],
  companies = [],
  onCreateAdminDeal,
  onEditAdminDeal,
  onDeleteAdminDeal,
  onApproveBrokerDeal,
  onRejectBrokerDeal,
  onEditBrokerDeal,
  onInheritMarketingData,
  onOverrideMarketingData,
  isLoading = false,
  onRefresh
}: UnifiedDealsManagerEnhancedProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<DealType>('all');
  const [statusFilter, setStatusFilter] = useState<DealStatus>('all');
  const [editingDeal, setEditingDeal] = useState<AdminDeal | BrokerDeal | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isMarketingDialogOpen, setIsMarketingDialogOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<BrokerDeal | null>(null);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // Form state for creating/editing deals
  const [formData, setFormData] = useState({
    firmId: '',
    title: '',
    discountPercentage: 0,
    discountType: 'percentage' as 'percentage' | 'fixed' | 'free',
    fixedAmount: '',
    freeText: '',
    couponCode: '',
    category: 'CFD' as 'CFD' | 'Futures' | 'Crypto' | 'Brokers',
    startDate: '',
    endDate: '',
    status: 'draft' as 'draft' | 'published' | 'archived',
    hasVerificationBadge: false,
    cardNotes: '',
    affiliateLink: '',
    buttonConfig: 'both' as 'both' | 'claim-only' | 'code-only'
  });

  // Marketing override form
  const [marketingOverrideForm, setMarketingOverrideForm] = useState({
    useInherited: true,
    overrideAffiliateLink: '',
    overrideCouponCode: '',
    overrideNotes: ''
  });

  const [formErrors, setFormErrors] = useState({
    firmId: '',
    title: '',
    discountPercentage: '',
    startDate: '',
    endDate: '',
    couponCode: '',
    affiliateLink: ''
  });

  // Helper function to check if company has complete marketing data
  const hasCompleteMarketingData = (companyId: string) => {
    const company = companies.find(c => c.id === companyId);
    return company?.defaultMarketingData?.isComplete || false;
  };

  // Helper function to get missing marketing fields
  const getMissingMarketingFields = (companyId: string) => {
    const company = companies.find(c => c.id === companyId);
    const marketing = company?.defaultMarketingData;
    const missing: string[] = [];
    
    if (!marketing?.affiliateLink) missing.push('Affiliate Link');
    if (!marketing?.defaultCouponCode) missing.push('Coupon Code');
    
    return missing;
  };

  // Enhanced deal normalization with marketing validation
  const normalizedDeals = useMemo(() => {
    return [
      ...adminDeals.map(deal => {
        const company = companies.find(c => c.id === deal.firmId);
        return {
          id: deal.id,
          title: deal.title,
          type: 'admin' as const,
          status: deal.status.toLowerCase() as 'draft' | 'published' | 'archived',
          category: deal.category,
          firmName: company?.name || 'Unknown Firm',
          discount: deal.discountPercentage === 100 ? 'FREE' : `${deal.discountPercentage}% OFF`,
          startDate: deal.startDate,
          endDate: deal.endDate,
          hasVerificationBadge: deal.hasVerificationBadge,
          originalDeal: deal,
          canGoLive: true, // Admin deals can always go live
          marketingComplete: true,
          missingFields: [] as string[]
        };
      }),
      ...brokerDeals.map(deal => {
        const company = companies.find(c => c.id === deal.companyId);
        const missingFields = getMissingMarketingFields(deal.companyId);
        const canGoLive = missingFields.length === 0;
        
        return {
          id: deal.id,
          title: deal.title,
          type: 'broker' as const, 
          status: deal.status as 'pending_approval' | 'approved' | 'rejected' | 'draft' | 'archived',
          category: deal.category,
          firmName: company?.name || 'Unknown Company',
          discount: deal.discountValue ? 
            (deal.discountType === 'percentage' ? `${deal.discountValue}% OFF` :
             deal.discountType === 'fixed' ? `$${deal.fixedAmount} OFF` :
             deal.freeText || 'FREE') : 'N/A',
          startDate: deal.startDate || '',
          endDate: deal.endDate || '',
          hasVerificationBadge: deal.hasVerificationBadge || false,
          originalDeal: deal,
          canGoLive: canGoLive,
          marketingComplete: hasCompleteMarketingData(deal.companyId),
          missingFields: missingFields,
          marketingDataSource: deal.marketingDataSource,
          inheritedFromCompany: deal.inheritedFromCompany
        };
      })
    ];
  }, [adminDeals, brokerDeals, companies]);

  // Filter deals
  const filteredDeals = normalizedDeals.filter(deal => {
    const matchesSearch = deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         deal.firmName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === 'all' || deal.type === typeFilter;
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'draft' && deal.status === 'draft') ||
                         (statusFilter === 'pending' && (deal.status === 'pending_approval' || deal.status === 'pending')) ||
                         (statusFilter === 'live' && (deal.status === 'published' || deal.status === 'approved')) ||
                         (statusFilter === 'approved' && deal.status === 'approved') ||
                         (statusFilter === 'rejected' && deal.status === 'rejected');
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // Sort deals: Admin deals first, then broker deals, then by date
  const sortedDeals = filteredDeals.sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === 'admin' ? -1 : 1;
    }
    return new Date(b.startDate || '').getTime() - new Date(a.startDate || '').getTime();
  });

  const getStatusBadge = (status: string, type: 'admin' | 'broker', canGoLive?: boolean, missingFields?: string[]) => {
    if (type === 'broker' && status === 'pending_approval' && !canGoLive) {
      return (
        <div className="flex items-center gap-2">
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Cannot Approve
          </Badge>
          {missingFields && missingFields.length > 0 && (
            <span className="text-xs text-red-600">Missing: {missingFields.join(', ')}</span>
          )}
        </div>
      );
    }

    if (type === 'admin') {
      switch (status) {
        case 'draft':
          return <Badge variant="outline" className="text-yellow-600 border-yellow-300"><Clock className="w-3 h-3 mr-1" />Draft</Badge>;
        case 'published':
          return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />Live</Badge>;
        case 'archived':
          return <Badge variant="secondary"><XCircle className="w-3 h-3 mr-1" />Archived</Badge>;
        default:
          return <Badge variant="outline">{status}</Badge>;
      }
    } else {
      switch (status) {
        case 'pending_approval':
          return <Badge variant="outline" className="text-yellow-600 border-yellow-300"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
        case 'approved':
          return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
        case 'rejected':
          return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
        default:
          return <Badge variant="outline">{status}</Badge>;
      }
    }
  };

  const getMarketingInheritanceBadge = (deal: any) => {
    if (deal.type === 'admin') return null;
    
    if (deal.marketingDataSource === 'inherited') {
      return <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1"><ArrowDown className="w-3 h-3" />Inherited</Badge>;
    } else if (deal.marketingDataSource === 'override') {
      return <Badge className="bg-purple-100 text-purple-800 flex items-center gap-1"><Settings className="w-3 h-3" />Override</Badge>;
    } else if (deal.marketingDataSource === 'manual') {
      return <Badge className="bg-slate-100 text-slate-800 flex items-center gap-1"><Edit className="w-3 h-3" />Manual</Badge>;
    }
    
    return null;
  };

  const getTypeBadge = (type: 'admin' | 'broker') => {
    return type === 'admin' 
      ? <Badge className="bg-blue-500 hover:bg-blue-600"><Settings className="w-3 h-3 mr-1" />Admin</Badge>
      : <Badge className="bg-purple-500 hover:bg-purple-600"><Users className="w-3 h-3 mr-1" />Broker</Badge>;
  };

  const adminDealsCount = sortedDeals.filter(d => d.type === 'admin').length;
  const brokerDealsCount = sortedDeals.filter(d => d.type === 'broker').length;
  const pendingCount = sortedDeals.filter(d => d.status === 'pending_approval' || d.status === 'draft').length;
  const liveCount = sortedDeals.filter(d => d.status === 'published' || d.status === 'approved').length;
  const blockedCount = sortedDeals.filter(d => d.type === 'broker' && d.status === 'pending_approval' && !d.canGoLive).length;

  // Handle approve broker deal with marketing validation
  const handleApproveBrokerDeal = (deal: any) => {
    if (!deal.canGoLive) {
      toast.error(`Cannot approve: Missing ${deal.missingFields.join(', ')}`);
      return;
    }

    const brokerDeal = deal.originalDeal as BrokerDeal;
    const company = companies.find(c => c.id === brokerDeal.companyId);
    
    if (company?.defaultMarketingData?.isComplete) {
      // Auto-inherit marketing data
      onApproveBrokerDeal?.(deal.id, {
        affiliateLink: company.defaultMarketingData.affiliateLink!,
        couponCode: company.defaultMarketingData.defaultCouponCode!
      });
      toast.success('Deal approved with inherited marketing data');
    } else {
      // Should not happen due to validation, but safety check
      toast.error('Company marketing data is incomplete');
    }
  };

  const handleMarketingOverride = (deal: any) => {
    const brokerDeal = deal.originalDeal as BrokerDeal;
    const company = companies.find(c => c.id === brokerDeal.companyId);
    
    setSelectedDeal(brokerDeal);
    setMarketingOverrideForm({
      useInherited: true,
      overrideAffiliateLink: company?.defaultMarketingData?.affiliateLink || '',
      overrideCouponCode: company?.defaultMarketingData?.defaultCouponCode || '',
      overrideNotes: ''
    });
    setIsMarketingDialogOpen(true);
  };

  const handleSaveMarketingOverride = () => {
    if (!selectedDeal) return;

    if (marketingOverrideForm.useInherited) {
      onInheritMarketingData?.(selectedDeal.id, selectedDeal.companyId);
      toast.success('Marketing data inherited from company profile');
    } else {
      onOverrideMarketingData?.(selectedDeal.id, {
        affiliateLink: marketingOverrideForm.overrideAffiliateLink,
        couponCode: marketingOverrideForm.overrideCouponCode,
        notes: marketingOverrideForm.overrideNotes
      });
      toast.success('Marketing data override applied');
    }

    setIsMarketingDialogOpen(false);
    setSelectedDeal(null);
  };

  const handleRejectBrokerDeal = (deal: any) => {
    setSelectedDeal(deal.originalDeal);
    setRejectionReason('');
    setIsRejectDialogOpen(true);
  };

  const handleConfirmReject = () => {
    if (selectedDeal && rejectionReason.trim()) {
      onRejectBrokerDeal?.(selectedDeal.id, rejectionReason.trim());
      setIsRejectDialogOpen(false);
      setSelectedDeal(null);
      setRejectionReason('');
      toast.success('Deal rejected');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Enhanced Deals Management</h2>
          <p className="text-slate-600 dark:text-slate-400">Manage deals with marketing data inheritance and validation</p>
        </div>
        <div className="flex gap-2">
          {onRefresh && (
            <Button variant="outline" onClick={onRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          )}
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Deal
          </Button>
        </div>
      </div>

      {/* Enhanced Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-blue-500">
                <Settings className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Admin Deals</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{adminDealsCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-purple-500">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Broker Deals</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{brokerDealsCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-yellow-500">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Pending</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{pendingCount}</p>
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
                <p className="text-sm text-slate-600 dark:text-slate-400">Live</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{liveCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-red-500">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Blocked</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{blockedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search deals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={(value: DealType) => setTypeFilter(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="admin">Admin Deals</SelectItem>
                  <SelectItem value="broker">Broker Deals</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={(value: DealStatus) => setStatusFilter(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="live">Live</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Deals List */}
      <Card>
        <CardHeader>
          <CardTitle>All Deals ({sortedDeals.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {sortedDeals.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">No deals found</h3>
              <p className="text-slate-600 dark:text-slate-400">No deals match your current filters.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedDeals.map((deal) => (
                <div key={`${deal.type}-${deal.id}`} className={`border rounded-lg p-4 ${
                  deal.type === 'admin' ? 'bg-blue-50/30 dark:bg-blue-900/10' : 'bg-purple-50/30 dark:bg-purple-900/10'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        deal.type === 'admin' 
                          ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                          : 'bg-gradient-to-br from-purple-500 to-purple-600'
                      }`}>
                        {deal.type === 'admin' ? (
                          <Settings className="w-6 h-6 text-white" />
                        ) : (
                          <Users className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">{deal.title}</h3>
                          {getTypeBadge(deal.type)}
                          {getStatusBadge(deal.status, deal.type, deal.canGoLive, deal.missingFields)}
                          {getMarketingInheritanceBadge(deal)}
                          <Badge variant="outline" className="text-xs">
                            {deal.category}
                          </Badge>
                          {deal.hasVerificationBadge && (
                            <Badge className="bg-green-100 text-green-800 text-xs">
                              Verified
                            </Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-slate-500 dark:text-slate-400">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4" />
                            <span className="truncate">{deal.firmName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {deal.discount}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {deal.startDate && deal.endDate ? 
                                `${new Date(deal.startDate).toLocaleDateString()} - ${new Date(deal.endDate).toLocaleDateString()}` : 
                                'No dates set'
                              }
                            </span>
                          </div>
                        </div>

                        {/* Marketing validation warning for broker deals */}
                        {deal.type === 'broker' && !deal.marketingComplete && (
                          <div className="mt-3 p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded text-sm">
                            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                              <AlertTriangle className="w-4 h-4" />
                              <span>Company marketing data incomplete: {deal.missingFields.join(', ')}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      
                      {deal.type === 'broker' && deal.status === 'pending_approval' && (
                        <>
                          {deal.canGoLive ? (
                            <Button 
                              size="sm" 
                              className="bg-green-600 hover:bg-green-700 text-white" 
                              onClick={() => handleApproveBrokerDeal(deal)}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                          ) : (
                            <Button 
                              size="sm" 
                              disabled
                              className="bg-slate-400 text-white cursor-not-allowed"
                              title={`Missing: ${deal.missingFields.join(', ')}`}
                            >
                              <AlertTriangle className="w-4 h-4 mr-1" />
                              Blocked
                            </Button>
                          )}
                          
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-blue-600"
                            onClick={() => handleMarketingOverride(deal)}
                          >
                            <LinkIcon className="w-4 h-4 mr-1" />
                            Marketing
                          </Button>
                          
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-600" 
                            onClick={() => handleRejectBrokerDeal(deal)}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}

                      {deal.type === 'admin' && (
                        <>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Marketing Override Dialog */}
      {selectedDeal && (
        <Dialog open={isMarketingDialogOpen} onOpenChange={setIsMarketingDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Marketing Data - {selectedDeal.title}</DialogTitle>
              <DialogDescription>
                Configure affiliate link and coupon code for this deal
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <div className="flex items-center justify-between mb-3">
                  <Label htmlFor="use-inherited" className="font-medium">Use inherited marketing data</Label>
                  <Switch
                    id="use-inherited"
                    checked={marketingOverrideForm.useInherited}
                    onCheckedChange={(checked) => setMarketingOverrideForm(prev => ({ ...prev, useInherited: checked }))}
                  />
                </div>
                {marketingOverrideForm.useInherited && (
                  <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                    <p><strong>Affiliate Link:</strong> {companies.find(c => c.id === selectedDeal.companyId)?.defaultMarketingData?.affiliateLink || 'Not set'}</p>
                    <p><strong>Coupon Code:</strong> {companies.find(c => c.id === selectedDeal.companyId)?.defaultMarketingData?.defaultCouponCode || 'Not set'}</p>
                  </div>
                )}
              </div>

              {!marketingOverrideForm.useInherited && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Override Affiliate Link</Label>
                    <Input
                      type="url"
                      value={marketingOverrideForm.overrideAffiliateLink}
                      onChange={e => setMarketingOverrideForm(prev => ({ ...prev, overrideAffiliateLink: e.target.value }))}
                      placeholder="https://company.com/signup?ref=koocao&deal=special"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Override Coupon Code</Label>
                    <Input
                      type="text"
                      value={marketingOverrideForm.overrideCouponCode}
                      onChange={e => setMarketingOverrideForm(prev => ({ ...prev, overrideCouponCode: e.target.value.toUpperCase() }))}
                      placeholder="SPECIAL20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Override Notes</Label>
                    <Textarea
                      value={marketingOverrideForm.overrideNotes}
                      onChange={e => setMarketingOverrideForm(prev => ({ ...prev, overrideNotes: e.target.value }))}
                      placeholder="Reason for override..."
                      rows={3}
                    />
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsMarketingDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveMarketingOverride} className="bg-blue-600 hover:bg-blue-700 text-white">
                Save Marketing Data
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Reject Dialog */}
      <AlertDialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Deal</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for rejecting this deal.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsRejectDialogOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmReject}
              disabled={!rejectionReason.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              Reject Deal
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}