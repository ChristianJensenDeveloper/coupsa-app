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
import { Checkbox } from './ui/checkbox';
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
  Tag,
  Link,
  Monitor,
  Smartphone
} from 'lucide-react';
import { AdminDeal, BrokerDeal, Company, Coupon } from './types';
import { SwipeableCouponCard } from './SwipeableCouponCard';
import { DealPreviewModal } from './DealPreviewModal';

interface UnifiedDealsManagerProps {
  adminDeals: AdminDeal[];
  brokerDeals: BrokerDeal[];
  companies: Company[];
  onCreateAdminDeal?: (deal: Omit<AdminDeal, 'id'>) => void;
  onEditAdminDeal?: (deal: AdminDeal) => void;
  onDeleteAdminDeal?: (dealId: string) => void;
  onApproveBrokerDeal?: (dealId: string) => void;
  onRejectBrokerDeal?: (dealId: string) => void;
  onEditBrokerDeal?: (deal: BrokerDeal) => void;
  isLoading?: boolean;
  onRefresh?: () => void;
}

type DealType = 'all' | 'admin' | 'broker';
type DealStatus = 'all' | 'draft' | 'pending' | 'live' | 'approved' | 'rejected';

export function UnifiedDealsManagerImproved({
  adminDeals = [],
  brokerDeals = [],
  companies = [],
  onCreateAdminDeal,
  onEditAdminDeal,
  onDeleteAdminDeal,
  onApproveBrokerDeal,
  onRejectBrokerDeal,
  onEditBrokerDeal,
  isLoading = false,
  onRefresh
}: UnifiedDealsManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<DealType>('all');
  const [statusFilter, setStatusFilter] = useState<DealStatus>('all');
  const [editingDeal, setEditingDeal] = useState<AdminDeal | BrokerDeal | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [viewingDeal, setViewingDeal] = useState<AdminDeal | BrokerDeal | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  
  // Preview modal state
  const [previewDeal, setPreviewDeal] = useState<AdminDeal | BrokerDeal | null>(null);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [previewViewMode, setPreviewViewMode] = useState<'desktop' | 'mobile'>('mobile');
  
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

  const [formErrors, setFormErrors] = useState({
    firmId: '',
    title: '',
    discountPercentage: '',
    startDate: '',
    endDate: '',
    couponCode: '',
    affiliateLink: ''
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

  // Handle create deal
  const handleCreateDeal = () => {
    setFormData({
      firmId: '',
      title: '',
      discountPercentage: 0,
      discountType: 'percentage',
      fixedAmount: '',
      freeText: '',
      couponCode: '',
      category: 'CFD',
      startDate: '',
      endDate: '',
      status: 'draft',
      hasVerificationBadge: false,
      cardNotes: '',
      affiliateLink: '',
      buttonConfig: 'both'
    });
    setFormErrors({
      firmId: '',
      title: '',
      discountPercentage: '',
      startDate: '',
      endDate: '',
      couponCode: '',
      affiliateLink: ''
    });
    setIsCreateDialogOpen(true);
  };

  const validateForm = () => {
    const errors = {
      firmId: !formData.firmId ? 'Company is required' : '',
      title: !formData.title ? 'Title is required' : '',
      discountPercentage: formData.discountType === 'percentage' && (!formData.discountPercentage || formData.discountPercentage <= 0) ? 'Discount percentage is required' : '',
      startDate: !formData.startDate ? 'Start date is required' : '',
      endDate: !formData.endDate ? 'End date is required' : '',
      couponCode: !formData.couponCode ? 'Coupon code is required' : '',
      affiliateLink: !formData.affiliateLink ? 'Affiliate link is required' : ''
    };

    setFormErrors(errors);
    return !Object.values(errors).some(error => error !== '');
  };

  const handleSaveCreateDeal = () => {
    if (validateForm() && onCreateAdminDeal) {
      const newDeal: Omit<AdminDeal, 'id'> = {
        firmId: formData.firmId,
        title: formData.title,
        discountPercentage: formData.discountType === 'percentage' ? formData.discountPercentage : 
                           formData.discountType === 'free' ? 100 : 0,
        couponCode: formData.couponCode,
        category: formData.category,
        startDate: formData.startDate,
        endDate: formData.endDate,
        status: formData.status.charAt(0).toUpperCase() + formData.status.slice(1) as 'Draft' | 'Published' | 'Archived',
        hasVerificationBadge: formData.hasVerificationBadge,
        cardNotes: formData.cardNotes,
        affiliateLink: formData.affiliateLink,
        buttonConfig: formData.buttonConfig,
        discountType: formData.discountType
      };
      onCreateAdminDeal(newDeal);
      setIsCreateDialogOpen(false);
      toast.success('Deal created successfully');
    }
  };

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
        discountType: adminDeal.discountType || (adminDeal.discountPercentage === 100 ? 'free' : 'percentage'),
        fixedAmount: '',
        freeText: adminDeal.discountType === 'free' ? 'FREE' : '',
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

  const handleApproveBrokerDeal = (dealId: string) => {
    onApproveBrokerDeal?.(dealId);
    toast.success('Broker deal approved and moved to live!');
  };

  const handleRejectBrokerDeal = (dealId: string) => {
    onRejectBrokerDeal?.(dealId);
    toast.success('Broker deal rejected');
  };

  const handleViewDeal = (deal: AdminDeal | BrokerDeal) => {
    setViewingDeal(deal);
    if ('firmId' in deal) {
      // Admin deal
      const adminDeal = deal as AdminDeal;
      setFormData({
        firmId: adminDeal.firmId,
        title: adminDeal.title,
        discountPercentage: adminDeal.discountPercentage,
        discountType: adminDeal.discountType || (adminDeal.discountPercentage === 100 ? 'free' : 'percentage'),
        fixedAmount: '',
        freeText: adminDeal.discountType === 'free' ? 'FREE' : '',
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
    setIsViewDialogOpen(true);
  };

  // Convert deal to Coupon format for preview
  const convertDealToCoupon = (deal: AdminDeal | BrokerDeal): Coupon => {
    const company = companies.find(c => 
      'firmId' in deal ? c.id === deal.firmId : c.id === deal.companyId
    );
    
    if ('firmId' in deal) {
      // Admin deal
      const adminDeal = deal as AdminDeal;
      return {
        id: adminDeal.id,
        title: adminDeal.title,
        description: adminDeal.cardNotes || `Get ${adminDeal.discountPercentage === 100 ? 'FREE' : adminDeal.discountPercentage + '% off'} on ${company?.name || 'this amazing offer'}`,
        discount: adminDeal.discountPercentage === 100 ? 'FREE' : `${adminDeal.discountPercentage}% OFF`,
        category: adminDeal.category,
        merchant: company?.name || 'Unknown Company',
        validUntil: new Date(adminDeal.endDate).toLocaleDateString(),
        startDate: adminDeal.startDate,
        endDate: adminDeal.endDate,
        terms: 'Terms and conditions apply. Valid for limited time only.',
        code: adminDeal.couponCode || '',
        isClaimed: false,
        imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmFkaW5nJTIwY2hhcnR8ZW58MXx8fHwxNzU2NTQ2Nzg0fDA&ixlib=rb-4.0&q=80&w=1080',
        logoUrl: company?.logoUrl || 'https://images.unsplash.com/photo-1642310290564-30033ff60334?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21wYW55JTIwbG9nbyUyMHByb2Zlc3Npb25hbCUyMGZpbmFuY2V8ZW58MXx8fHwxNzU2NTQ2Nzg0fDA&ixlib=rb-4.0&q=80&w=1080',
        affiliateLink: adminDeal.affiliateLink || '',
        hasVerificationBadge: adminDeal.hasVerificationBadge,
        status: adminDeal.status as 'Draft' | 'Published' | 'Archived',
        buttonConfig: adminDeal.buttonConfig
      };
    } else {
      // Broker deal
      const brokerDeal = deal as BrokerDeal;
      const discountText = brokerDeal.discountType === 'percentage' ? `${brokerDeal.discountValue}% OFF` :
                          brokerDeal.discountType === 'fixed' ? `$${brokerDeal.fixedAmount} OFF` :
                          brokerDeal.freeText || 'FREE';
      
      return {
        id: brokerDeal.id,
        title: brokerDeal.title,
        description: brokerDeal.description || `Special offer from ${company?.name || 'this company'}`,
        discount: discountText,
        category: brokerDeal.category,
        merchant: company?.name || 'Unknown Company',
        validUntil: new Date(brokerDeal.endDate || Date.now()).toLocaleDateString(),
        startDate: brokerDeal.startDate || new Date().toISOString(),
        endDate: brokerDeal.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        terms: brokerDeal.terms || 'Terms and conditions apply. Valid for limited time only.',
        code: brokerDeal.couponCode || '',
        isClaimed: false,
        imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmFkaW5nJTIwY2hhcnR8ZW58MXx8fHwxNzU2NTQ2Nzg0fDA&ixlib=rb-4.0&q=80&w=1080',
        logoUrl: company?.logoUrl || 'https://images.unsplash.com/photo-1642310290564-30033ff60334?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21wYW55JTIwbG9nbyUyMHByb2Zlc3Npb25hbCUyMGZpbmFuY2V8ZW58MXx8fHwxNzU2NTQ2Nzg0fDA&ixlib=rb-4.0&q=80&w=1080',
        affiliateLink: brokerDeal.affiliateLink || '',
        hasVerificationBadge: brokerDeal.hasVerificationBadge || false,
        status: 'Published',
        buttonConfig: brokerDeal.buttonConfig || 'both'
      };
    }
  };

  // Handle preview deal with better workflow integration
  const handlePreviewDeal = (deal: AdminDeal | BrokerDeal) => {
    setPreviewDeal(deal);
    setIsPreviewDialogOpen(true);
  };

  // Enhanced approval handler that encourages preview first
  const handleApproveBrokerDealWithPreview = (dealId: string) => {
    const deal = brokerDeals.find(d => d.id === dealId);
    if (deal) {
      // Show preview first, then allow approval from preview modal
      handlePreviewDeal(deal);
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
        <div className="flex gap-2">
          {onRefresh && (
            <Button variant="outline" onClick={onRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          )}
          <Button 
            onClick={handleCreateDeal}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Deal
          </Button>
        </div>
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
                            <Button variant="outline" size="sm" onClick={() => handleViewDeal(deal.originalDeal as AdminDeal)}>
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
                            </div>
                          </div>

                          <div className="flex items-center gap-2 ml-4">
                            <Button variant="outline" size="sm" onClick={() => handleViewDeal(deal.originalDeal as BrokerDeal)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handlePreviewDeal(deal.originalDeal)}
                              className="text-blue-600 border-blue-200 hover:bg-blue-50"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Frontpage Preview
                            </Button>
                            
                            {deal.status === 'pending_approval' && (
                              <>
                                <Button 
                                  size="sm" 
                                  className="bg-green-600 hover:bg-green-700 text-white" 
                                  onClick={() => handleApproveBrokerDealWithPreview(deal.id)}
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Preview & Approve
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-red-600 border-red-200 hover:bg-red-50" 
                                  onClick={() => handleRejectBrokerDeal(deal.id)}
                                >
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

      {/* Create Deal Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Deal</DialogTitle>
            <DialogDescription>
              Create a new admin deal that will be available to users.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Company Selection */}
            <div className="space-y-2">
              <Label htmlFor="company">Company *</Label>
              <Select value={formData.firmId} onValueChange={(value) => setFormData(prev => ({ ...prev, firmId: value }))}>
                <SelectTrigger className={formErrors.firmId ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select a company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
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
                      className={formErrors.discountPercentage ? "border-red-500 w-24" : "w-24"}
                    />
                    <span className="text-slate-500">%</span>
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
                  <Label htmlFor="freeText">Free Offer Text</Label>
                  <Input
                    id="freeText"
                    value={formData.freeText}
                    onChange={(e) => setFormData(prev => ({ ...prev, freeText: e.target.value }))}
                    placeholder="e.g., Free Challenge, Bonus Account"
                  />
                </div>
              )}
            </div>

            {/* Coupon Code */}
            <div className="space-y-2">
              <Label htmlFor="couponCode">Coupon Code *</Label>
              <Input
                id="couponCode"
                value={formData.couponCode}
                onChange={(e) => setFormData(prev => ({ ...prev, couponCode: e.target.value.toUpperCase() }))}
                placeholder="SAVE30"
                className={formErrors.couponCode ? "border-red-500" : ""}
              />
              {formErrors.couponCode && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {formErrors.couponCode}
                </p>
              )}
            </div>

            {/* Category & Status */}
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

            {/* Affiliate Link */}
            <div className="space-y-2">
              <Label htmlFor="affiliateLink">Affiliate Link *</Label>
              <Input
                id="affiliateLink"
                type="url"
                value={formData.affiliateLink}
                onChange={(e) => setFormData(prev => ({ ...prev, affiliateLink: e.target.value }))}
                placeholder="https://company.com/signup?ref=koocao"
                className={formErrors.affiliateLink ? "border-red-500" : ""}
              />
              {formErrors.affiliateLink && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {formErrors.affiliateLink}
                </p>
              )}
            </div>

            {/* Card Notes */}
            <div className="space-y-2">
              <Label htmlFor="cardNotes">Card Notes</Label>
              <Textarea
                id="cardNotes"
                value={formData.cardNotes}
                onChange={(e) => setFormData(prev => ({ ...prev, cardNotes: e.target.value }))}
                placeholder="Additional information to display on the deal card"
                rows={3}
              />
            </div>

            {/* Options */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasVerificationBadge"
                  checked={formData.hasVerificationBadge}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hasVerificationBadge: checked as boolean }))}
                />
                <Label htmlFor="hasVerificationBadge">Verified Deal (show verification badge)</Label>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCreateDeal} className="bg-blue-600 hover:bg-blue-700 text-white">
              Create Deal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
            {/* Same form fields as create dialog but without some required validations */}
            {/* Deal Title */}
            <div className="space-y-2">
              <Label htmlFor="editDealTitle">Deal Title *</Label>
              <Input
                id="editDealTitle"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., 30% off Challenge Fee"
              />
            </div>

            {/* Discount Configuration */}
            <div className="space-y-4">
              <Label>Discount Configuration *</Label>
              
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="editPercentage"
                    name="editDiscountType"
                    checked={formData.discountType === 'percentage'}
                    onChange={() => setFormData(prev => ({ ...prev, discountType: 'percentage' }))}
                  />
                  <Label htmlFor="editPercentage">Percentage Off</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="editFree"
                    name="editDiscountType"
                    checked={formData.discountType === 'free'}
                    onChange={() => setFormData(prev => ({ ...prev, discountType: 'free' }))}
                  />
                  <Label htmlFor="editFree">Free/Bonus</Label>
                </div>
              </div>

              {formData.discountType === 'percentage' && (
                <div className="space-y-2">
                  <Label htmlFor="editDiscountPercentage">Discount Percentage</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="editDiscountPercentage"
                      type="number"
                      min="1"
                      max="100"
                      value={formData.discountPercentage || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, discountPercentage: parseInt(e.target.value) || 0 }))}
                      placeholder="30"
                      className="w-24"
                    />
                    <span className="text-slate-500">%</span>
                  </div>
                </div>
              )}
            </div>

            {/* Coupon Code */}
            <div className="space-y-2">
              <Label htmlFor="editCouponCode">Coupon Code</Label>
              <Input
                id="editCouponCode"
                value={formData.couponCode}
                onChange={(e) => setFormData(prev => ({ ...prev, couponCode: e.target.value }))}
                placeholder="SAVE30"
              />
            </div>

            {/* Category & Status */}
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

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editStartDate">Start Date</Label>
                <Input
                  id="editStartDate"
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="editEndDate">End Date</Label>
                <Input
                  id="editEndDate"
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>

            {/* Card Notes */}
            <div className="space-y-2">
              <Label htmlFor="editCardNotes">Card Notes</Label>
              <Textarea
                id="editCardNotes"
                value={formData.cardNotes}
                onChange={(e) => setFormData(prev => ({ ...prev, cardNotes: e.target.value }))}
                placeholder="Additional information to display on the deal card"
                rows={3}
              />
            </div>

            {/* Options */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="editHasVerificationBadge"
                  checked={formData.hasVerificationBadge}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hasVerificationBadge: checked as boolean }))}
                />
                <Label htmlFor="editHasVerificationBadge">Verified Deal (show verification badge)</Label>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} className="bg-blue-600 hover:bg-blue-700 text-white">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Deal Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              View Deal Details
            </DialogTitle>
            <DialogDescription>
              {viewingDeal && 'firmId' in viewingDeal ? 'Admin-created deal' : 'Broker-submitted deal'} information
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Basic Information */}
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Deal Title</Label>
                  <div className="mt-1 p-3 bg-white dark:bg-slate-700 rounded border">
                    {formData.title || 'No title'}
                  </div>
                </div>
                
                <div>
                  <Label>Company</Label>
                  <div className="mt-1 p-3 bg-white dark:bg-slate-700 rounded border">
                    {companies.find(c => c.id === formData.firmId)?.name || 'Unknown Company'}
                  </div>
                </div>
                
                <div>
                  <Label>Category</Label>
                  <div className="mt-1 p-3 bg-white dark:bg-slate-700 rounded border">
                    <Badge variant="outline">{formData.category}</Badge>
                  </div>
                </div>
                
                <div>
                  <Label>Status</Label>
                  <div className="mt-1 p-3 bg-white dark:bg-slate-700 rounded border">
                    {viewingDeal && 'firmId' in viewingDeal ? 
                      getStatusBadge(formData.status, 'admin') : 
                      getStatusBadge((viewingDeal as BrokerDeal)?.status || 'draft', 'broker')
                    }
                  </div>
                </div>
              </div>
            </div>

            {/* Discount Information */}
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Discount Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Discount Type</Label>
                  <div className="mt-1 p-3 bg-white dark:bg-slate-700 rounded border">
                    <Badge className={
                      formData.discountType === 'percentage' ? 'bg-blue-100 text-blue-800' :
                      formData.discountType === 'fixed' ? 'bg-green-100 text-green-800' :
                      'bg-yellow-100 text-yellow-800'
                    }>
                      {formData.discountType === 'percentage' ? 'Percentage Off' :
                       formData.discountType === 'fixed' ? 'Fixed Amount Off' :
                       'Free/Bonus Offer'}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <Label>Discount Value</Label>
                  <div className="mt-1 p-3 bg-white dark:bg-slate-700 rounded border font-semibold">
                    {formData.discountType === 'percentage' ? `${formData.discountPercentage}% OFF` :
                     formData.discountType === 'fixed' ? `$${formData.fixedAmount} OFF` :
                     formData.freeText || 'FREE'}
                  </div>
                </div>
                
                <div>
                  <Label>Coupon Code</Label>
                  <div className="mt-1 p-3 bg-white dark:bg-slate-700 rounded border font-mono">
                    {formData.couponCode || 'No coupon code'}
                  </div>
                </div>
                
                <div>
                  <Label>Verification Status</Label>
                  <div className="mt-1 p-3 bg-white dark:bg-slate-700 rounded border">
                    {formData.hasVerificationBadge ? (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified Deal
                      </Badge>
                    ) : (
                      <Badge variant="outline">Not Verified</Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Date Information */}
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <div className="mt-1 p-3 bg-white dark:bg-slate-700 rounded border">
                    {formData.startDate ? 
                      new Date(formData.startDate).toLocaleString() : 
                      'No start date set'
                    }
                  </div>
                </div>
                
                <div>
                  <Label>End Date</Label>
                  <div className="mt-1 p-3 bg-white dark:bg-slate-700 rounded border">
                    {formData.endDate ? 
                      new Date(formData.endDate).toLocaleString() : 
                      'No end date set'
                    }
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            {formData.cardNotes && (
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Additional Notes
                </h3>
                
                <div className="p-3 bg-white dark:bg-slate-700 rounded border">
                  {formData.cardNotes}
                </div>
              </div>
            )}

            {/* Admin Deal Specific Information */}
            {viewingDeal && 'firmId' in viewingDeal && formData.affiliateLink && (
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Link className="w-4 h-4" />
                  Marketing Information
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <Label>Affiliate Link</Label>
                    <div className="mt-1 p-3 bg-white dark:bg-slate-700 rounded border font-mono text-sm break-all">
                      {formData.affiliateLink}
                    </div>
                  </div>
                  
                  <div>
                    <Label>Button Configuration</Label>
                    <div className="mt-1 p-3 bg-white dark:bg-slate-700 rounded border">
                      <Badge variant="outline">
                        {formData.buttonConfig === 'both' ? 'Claim Button + Code' :
                         formData.buttonConfig === 'claim-only' ? 'Claim Button Only' :
                         'Code Only'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            {viewingDeal && (
              <Button 
                onClick={() => {
                  setIsViewDialogOpen(false);
                  handleEditDeal(viewingDeal);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Deal
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Deal Dialog */}
      <DealPreviewModal
        deal={previewDeal}
        companies={companies}
        isOpen={isPreviewDialogOpen}
        onClose={() => setIsPreviewDialogOpen(false)}
        onEdit={handleEditDeal}
        onApprove={(dealId) => {
          // Only show approve button for broker deals that are pending approval
          if (previewDeal && !('firmId' in previewDeal) && previewDeal.status === 'pending_approval') {
            handleApproveBrokerDeal(dealId);
          }
        }}
        onReject={(dealId) => {
          // Only show reject button for broker deals that are pending approval
          if (previewDeal && !('firmId' in previewDeal) && previewDeal.status === 'pending_approval') {
            handleRejectBrokerDeal(dealId);
          }
        }}
        viewMode={previewViewMode}
        onViewModeChange={setPreviewViewMode}
      />
    </div>
  );
}