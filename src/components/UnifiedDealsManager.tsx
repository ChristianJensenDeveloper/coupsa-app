import { toast } from 'sonner@2.0.3';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Plus, 
  Search, 
  Filter, 
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
  AlertCircle
} from 'lucide-react';
import { AdminDeal, BrokerDeal, Company } from './types';

interface UnifiedDealsManagerProps {
  adminDeals: AdminDeal[];
  brokerDeals: BrokerDeal[];
  companies: Company[];
  onCreateAdminDeal?: () => void;
  onEditAdminDeal?: (deal: AdminDeal) => void;
  onDeleteAdminDeal?: (dealId: string) => void;
  onApproveBrokerDeal?: (dealId: string) => void;
  onRejectBrokerDeal?: (dealId: string) => void;
  onEditBrokerDeal?: (deal: BrokerDeal) => void;
}

type DealType = 'all' | 'admin' | 'broker';
type DealStatus = 'all' | 'draft' | 'pending' | 'live' | 'approved' | 'rejected';

export function UnifiedDealsManager({
  adminDeals = [],
  brokerDeals = [],
  companies = [],
  onCreateAdminDeal,
  onEditAdminDeal,
  onDeleteAdminDeal,
  onApproveBrokerDeal,
  onRejectBrokerDeal,
  onEditBrokerDeal
}: UnifiedDealsManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<DealType>('all');
  const [statusFilter, setStatusFilter] = useState<DealStatus>('all');
  const [editingDeal, setEditingDeal] = useState<AdminDeal | BrokerDeal | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  // Form state for editing
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

  const [formErrors, setFormErrors] = useState({
    firmId: '',
    title: '',
    discountPercentage: '',
    startDate: '',
    endDate: ''
  });

  // Combine and normalize deals
  const normalizedDeals = [
    ...adminDeals.map(deal => ({
      id: deal.id,
      title: deal.title,
      type: 'admin' as const,
      status: deal.status.toLowerCase() as 'draft' | 'published' | 'archived',
      category: deal.category,
      firmName: companies.find(c => c.id === deal.firmId)?.name || 'Unknown Firm',
      discount: deal.discountPercentage === 100 ? 'FREE' : `${deal.discountPercentage}% OFF`,
      startDate: deal.startDate,
      endDate: deal.endDate,
      hasVerificationBadge: deal.hasVerificationBadge,
      originalDeal: deal
    })),
    ...brokerDeals.map(deal => ({
      id: deal.id,
      title: deal.title,
      type: 'broker' as const, 
      status: deal.status as 'pending_approval' | 'approved' | 'rejected' | 'draft' | 'archived',
      category: deal.category,
      firmName: companies.find(c => c.id === deal.companyId)?.name || 'Unknown Company',
      discount: deal.discountValue ? 
        (deal.discountType === 'percentage' ? `${deal.discountValue}% OFF` :
         deal.discountType === 'fixed' ? `$${deal.fixedAmount} OFF` :
         deal.freeText || 'FREE') : 'N/A',
      startDate: deal.startDate || '',
      endDate: deal.endDate || '',
      hasVerificationBadge: deal.hasVerificationBadge || false,
      originalDeal: deal
    }))
  ];

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

  const getStatusBadge = (status: string, type: 'admin' | 'broker') => {
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

  const getTypeBadge = (type: 'admin' | 'broker') => {
    return type === 'admin' 
      ? <Badge className="bg-blue-500 hover:bg-blue-600"><Settings className="w-3 h-3 mr-1" />Admin</Badge>
      : <Badge className="bg-purple-500 hover:bg-purple-600"><Users className="w-3 h-3 mr-1" />Broker</Badge>;
  };

  const adminDealsCount = sortedDeals.filter(d => d.type === 'admin').length;
  const brokerDealsCount = sortedDeals.filter(d => d.type === 'broker').length;
  const pendingCount = sortedDeals.filter(d => d.status === 'pending_approval' || d.status === 'draft').length;
  const liveCount = sortedDeals.filter(d => d.status === 'published' || d.status === 'approved').length;

  // Handle editing functions
  const handleEditDeal = (deal: AdminDeal | BrokerDeal) => {
    setEditingDeal(deal);
    if ('firmId' in deal) {
      // Admin deal
      const adminDeal = deal as AdminDeal;
      setFormData({
        firmId: adminDeal.firmId,
        title: adminDeal.title,
        discountPercentage: adminDeal.discountPercentage,
        discountType: adminDeal.discountPercentage === 100 ? 'free' : 'percentage',
        fixedAmount: '',
        freeText: '',
        couponCode: adminDeal.couponCode,
        category: adminDeal.category as 'CFD' | 'Futures' | 'Crypto' | 'Brokers',
        startDate: adminDeal.startDate,
        endDate: adminDeal.endDate,
        status: adminDeal.status.toLowerCase() as 'draft' | 'published' | 'archived',
        hasVerificationBadge: adminDeal.hasVerificationBadge,
        cardNotes: adminDeal.cardNotes,
        affiliateLink: adminDeal.affiliateLink || '',
        buttonConfig: adminDeal.buttonConfig || 'both'
      });
    } else {
      // Broker deal
      const brokerDeal = deal as BrokerDeal;
      setFormData({
        firmId: brokerDeal.companyId,
        title: brokerDeal.title,
        discountPercentage: brokerDeal.discountValue || 0,
        discountType: brokerDeal.discountType as 'percentage' | 'fixed' | 'free',
        fixedAmount: brokerDeal.fixedAmount || '',
        freeText: brokerDeal.freeText || '',
        couponCode: brokerDeal.couponCode || '',
        category: brokerDeal.category as 'CFD' | 'Futures' | 'Crypto' | 'Brokers',
        startDate: brokerDeal.startDate || '',
        endDate: brokerDeal.endDate || '',
        status: 'draft',
        hasVerificationBadge: brokerDeal.hasVerificationBadge || false,
        cardNotes: brokerDeal.description,
        affiliateLink: '',
        buttonConfig: 'both'
      });
    }
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (editingDeal) {
      if ('firmId' in editingDeal) {
        // Admin deal
        const updatedDeal: AdminDeal = {
          ...editingDeal as AdminDeal,
          title: formData.title,
          discountPercentage: formData.discountPercentage,
          couponCode: formData.couponCode,
          category: formData.category,
          startDate: formData.startDate,
          endDate: formData.endDate,
          status: formData.status.charAt(0).toUpperCase() + formData.status.slice(1) as 'Draft' | 'Published' | 'Archived',
          hasVerificationBadge: formData.hasVerificationBadge,
          cardNotes: formData.cardNotes,
          affiliateLink: formData.affiliateLink,
          buttonConfig: formData.buttonConfig
        };
        onEditAdminDeal?.(updatedDeal);
      } else {
        // Broker deal
        const updatedDeal: BrokerDeal = {
          ...editingDeal as BrokerDeal,
          title: formData.title,
          discountValue: formData.discountPercentage,
          discountType: formData.discountType,
          fixedAmount: formData.fixedAmount,
          freeText: formData.freeText,
          couponCode: formData.couponCode,
          category: formData.category,
          startDate: formData.startDate,
          endDate: formData.endDate,
          hasVerificationBadge: formData.hasVerificationBadge,
          description: formData.cardNotes
        };
        onEditBrokerDeal?.(updatedDeal);
      }
      setIsEditDialogOpen(false);
      setEditingDeal(null);
      toast.success('Deal updated successfully');
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Deals Management</h2>
          <p className="text-slate-600 dark:text-slate-400">Manage admin-created deals and broker-submitted deals</p>
        </div>
        {onCreateAdminDeal && (
          <Button 
            onClick={onCreateAdminDeal}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Deal
          </Button>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

      {/* Deals List */}
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
              {/* Admin Deals Section */}
              {sortedDeals.some(d => d.type === 'admin') && (
                <>
                  <div className="flex items-center gap-2 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                    <Settings className="w-4 h-4" />
                    <span>Admin-created deals ({sortedDeals.filter(d => d.type === 'admin').length})</span>
                  </div>
                  <div className="space-y-3">
                    {sortedDeals.filter(d => d.type === 'admin').map((deal) => (
                      <div key={`admin-${deal.id}`} className="border rounded-lg p-4 bg-blue-50/30 dark:bg-blue-900/10">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                              <Settings className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">{deal.title}</h3>
                                {getTypeBadge(deal.type)}
                                {getStatusBadge(deal.status, deal.type)}
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
                                  <span>Until {new Date(deal.endDate).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 ml-4">
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleEditDeal(deal.originalDeal as AdminDeal)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600" onClick={() => onDeleteAdminDeal?.(deal.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Broker Deals Section */}
              {sortedDeals.some(d => d.type === 'broker') && (
                <>
                  {sortedDeals.some(d => d.type === 'admin') && <div className="border-t my-6"></div>}
                  <div className="flex items-center gap-2 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                    <Users className="w-4 h-4" />
                    <span>Broker-submitted deals ({sortedDeals.filter(d => d.type === 'broker').length})</span>
                  </div>
                  <div className="space-y-3">
                    {sortedDeals.filter(d => d.type === 'broker').map((deal) => (
                      <div key={`broker-${deal.id}`} className="border rounded-lg p-4 bg-purple-50/30 dark:bg-purple-900/10">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                              <Users className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">{deal.title}</h3>
                                {getTypeBadge(deal.type)}
                                {getStatusBadge(deal.status, deal.type)}
                                <Badge variant="outline" className="text-xs">
                                  {deal.category}
                                </Badge>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-slate-500 dark:text-slate-400">
                                <div className="flex items-center gap-2">
                                  <Building2 className="w-4 h-4" />
                                  <span className="truncate">{deal.firmName}</span>
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
                            </div>
                          </div>

                          <div className="flex items-center gap-2 ml-4">
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            
                            {deal.status === 'pending_approval' && (
                              <>
                                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => onApproveBrokerDeal?.(deal.id)}>
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Approve
                                </Button>
                                <Button variant="outline" size="sm" className="text-red-600" onClick={() => onRejectBrokerDeal?.(deal.id)}>
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Reject
                                </Button>
                              </>
                            )}
                            
                            <Button variant="outline" size="sm" onClick={() => handleEditDeal(deal.originalDeal as BrokerDeal)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Deal</DialogTitle>
            <DialogDescription>
              Update the details of this deal. Changes will be saved immediately.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
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

            {/* Category and Coupon Code */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={formData.category} onValueChange={(value: 'CFD' | 'Futures' | 'Crypto' | 'Brokers') => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CFD">CFD</SelectItem>
                    <SelectItem value="Futures">Futures</SelectItem>
                    <SelectItem value="Crypto">Crypto</SelectItem>
                    <SelectItem value="Brokers">Brokers</SelectItem>
                  </SelectContent>
                </Select>
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
                      buttonConfig: !value.trim() ? 'claim-only' : (prev.buttonConfig === 'claim-only' ? 'both' : prev.buttonConfig)
                    }));
                  }}
                  placeholder="Enter coupon code (Optional)"
                />
              </div>
            </div>

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

            {/* Status (Admin deals only) */}
            {'firmId' in (editingDeal || {}) && (
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(value: 'draft' | 'published' | 'archived') => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} className="bg-blue-600 hover:bg-blue-700">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}