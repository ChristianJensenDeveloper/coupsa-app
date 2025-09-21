import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "./ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  Search,
  Filter,
  Calendar,
  Building2,
  TrendingUp,
  DollarSign,
  Edit3,
  AlertTriangle,
  FileText
} from "lucide-react";
import { toast } from "sonner@2.0.3";
import { BrokerDeal, Company, BrokerDealStatus } from "./types";

interface BrokerDealsManagerProps {
  brokerDeals: BrokerDeal[];
  companies: Company[];
  onApproveDeal: (dealId: string, adminData: any) => void;
  onRejectDeal: (dealId: string, reason: string) => void;
  onUpdateDeal: (deal: BrokerDeal) => void;
}

// Mock data for demonstration
const mockBrokerDeals: BrokerDeal[] = [
  {
    id: '1',
    companyId: '1',
    title: '50% Off Trading Challenge',
    description: 'Get 50% discount on our $100K trading challenge. Perfect for experienced traders looking to get funded.',
    category: 'CFD',
    startDate: '2025-01-01T00:00',
    endDate: '2025-03-31T23:59',
    terms: 'Valid for new customers only. One-time use per account.',
    status: 'pending_approval',
    createdAt: '2024-12-20T09:30:00Z',
    updatedAt: '2024-12-20T09:30:00Z'
  },
  {
    id: '2',
    companyId: '2',
    title: 'Free Crypto Trading Signals',
    description: 'Get access to our premium crypto trading signals for free for 30 days.',
    category: 'Crypto',
    startDate: '2025-01-01T00:00',
    endDate: '2025-02-28T23:59',
    terms: 'Limited to first 100 users. Must verify email.',
    status: 'approved',
    createdAt: '2024-12-18T14:20:00Z',
    updatedAt: '2024-12-19T10:15:00Z',
    approvedBy: 'admin1',
    approvedAt: '2024-12-19T10:15:00Z',
    affiliateLink: 'https://tradeforge.pro/signup?ref=koocao',
    discountType: 'free',
    freeText: 'FREE ACCESS',
    hasVerificationBadge: true
  },
  {
    id: '3',
    companyId: '5',
    title: 'Futures Challenge Discount',
    description: 'Get 70% off our futures evaluation program.',
    category: 'Futures',
    startDate: '2024-12-15T00:00',
    endDate: '2025-01-31T23:59',
    terms: 'One-time offer per user.',
    status: 'rejected',
    createdAt: '2024-12-15T11:45:00Z',
    updatedAt: '2024-12-16T09:20:00Z',
    rejectionReason: 'Discount percentage is too high for this type of offer. Please adjust to 30-50% range.'
  }
];

export function BrokerDealsManager({ 
  brokerDeals: propBrokerDeals = mockBrokerDeals, 
  companies = [], 
  onApproveDeal, 
  onRejectDeal, 
  onUpdateDeal 
}: BrokerDealsManagerProps) {
  const [brokerDeals, setBrokerDeals] = useState<BrokerDeal[]>(propBrokerDeals);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<BrokerDealStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedDeal, setSelectedDeal] = useState<BrokerDeal | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  
  // Admin approval form data
  const [adminData, setAdminData] = useState({
    affiliateLink: '',
    couponCode: '',
    discountType: 'percentage' as 'percentage' | 'fixed' | 'free',
    discountValue: 0,
    fixedAmount: '',
    freeText: '',
    hasVerificationBadge: false,
    cardNotes: '',
    buttonConfig: 'both' as 'both' | 'claim-only' | 'code-only'
  });

  const filteredDeals = brokerDeals.filter(deal => {
    const company = companies.find(c => c.id === deal.companyId);
    const companyName = company?.name || 'Unknown Company';
    
    const matchesSearch = deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         deal.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         companyName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || deal.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || deal.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusBadge = (status: BrokerDealStatus) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline"><FileText className="w-3 h-3 mr-1" />Draft</Badge>;
      case 'pending_approval':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case 'archived':
        return <Badge variant="secondary"><FileText className="w-3 h-3 mr-1" />Archived</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleApprove = () => {
    if (!selectedDeal) return;

    const updatedDeal: BrokerDeal = {
      ...selectedDeal,
      status: 'approved',
      approvedBy: 'current_admin',
      approvedAt: new Date().toISOString(),
      ...adminData
    };

    setBrokerDeals(prev => prev.map(deal => 
      deal.id === selectedDeal.id ? updatedDeal : deal
    ));
    
    if (onApproveDeal) onApproveDeal(selectedDeal.id, adminData);
    setIsApproveModalOpen(false);
    setSelectedDeal(null);
    resetAdminData();
    toast.success("Deal approved and published!");
  };

  const handleReject = () => {
    if (!selectedDeal || !rejectionReason.trim()) {
      toast.error("Please provide a rejection reason.");
      return;
    }

    const updatedDeal: BrokerDeal = {
      ...selectedDeal,
      status: 'rejected',
      rejectionReason: rejectionReason
    };

    setBrokerDeals(prev => prev.map(deal => 
      deal.id === selectedDeal.id ? updatedDeal : deal
    ));
    
    if (onRejectDeal) onRejectDeal(selectedDeal.id, rejectionReason);
    setIsRejectModalOpen(false);
    setRejectionReason('');
    setSelectedDeal(null);
    toast.success("Deal rejected with reason provided.");
  };

  const resetAdminData = () => {
    setAdminData({
      affiliateLink: '',
      couponCode: '',
      discountType: 'percentage',
      discountValue: 0,
      fixedAmount: '',
      freeText: '',
      hasVerificationBadge: false,
      cardNotes: '',
      buttonConfig: 'both'
    });
  };

  const getCompanyName = (companyId: string) => {
    return companies.find(c => c.id === companyId)?.name || 'Unknown Company';
  };

  const getStatsCards = () => {
    const totalDeals = brokerDeals.length;
    const pendingDeals = brokerDeals.filter(d => d.status === 'pending_approval').length;
    const approvedDeals = brokerDeals.filter(d => d.status === 'approved').length;
    const activeDeals = brokerDeals.filter(d => d.status === 'approved' && new Date(d.endDate) > new Date()).length;

    return [
      { title: 'Total Broker Deals', value: totalDeals, icon: FileText, color: 'text-blue-500' },
      { title: 'Pending Approval', value: pendingDeals, icon: Clock, color: 'text-yellow-500' },
      { title: 'Approved', value: approvedDeals, icon: CheckCircle, color: 'text-green-500' },
      { title: 'Active Deals', value: activeDeals, icon: TrendingUp, color: 'text-purple-500' },
    ];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Broker Deals Manager</h2>
        <p className="text-slate-600 dark:text-slate-400">Review and approve deals submitted by companies</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {getStatsCards().map((stat, index) => (
          <Card key={index}>
            <CardContent className="flex items-center p-6">
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-full bg-slate-100 dark:bg-slate-800 ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{stat.title}</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="search"
                  placeholder="Search deals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as BrokerDealStatus | 'all')}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending_approval">Pending Approval</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="CFD">CFD</SelectItem>
                  <SelectItem value="Futures">Futures</SelectItem>
                  <SelectItem value="Crypto">Crypto</SelectItem>
                  <SelectItem value="Brokers">Brokers</SelectItem>
                  <SelectItem value="Casinos">Casinos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="invisible">Actions</Label>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setCategoryFilter('all');
                }}
                className="w-full"
              >
                <Filter className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deals List */}
      <div className="grid gap-4">
        {filteredDeals.length > 0 ? filteredDeals.map((deal) => (
          <Card key={deal.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">{deal.title}</h3>
                    {getStatusBadge(deal.status)}
                    <Badge variant="outline">{deal.category}</Badge>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">{getCompanyName(deal.companyId)}</span>
                  </div>
                  
                  <p className="text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">{deal.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(deal.startDate).toLocaleDateString()} - {new Date(deal.endDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Created {new Date(deal.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  {deal.rejectionReason && (
                    <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-sm text-red-800 dark:text-red-200">
                        <strong>Rejection reason:</strong> {deal.rejectionReason}
                      </p>
                    </div>
                  )}

                  <div className="text-sm">
                    <strong>Terms:</strong> {deal.terms}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedDeal(deal)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>{selectedDeal?.title}</DialogTitle>
                        <DialogDescription>Deal details from {getCompanyName(selectedDeal?.companyId || '')}</DialogDescription>
                      </DialogHeader>
                      {selectedDeal && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Status</Label>
                              <div className="mt-1">{getStatusBadge(selectedDeal.status)}</div>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Category</Label>
                              <p className="mt-1">{selectedDeal.category}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Start Date</Label>
                              <p className="mt-1">{new Date(selectedDeal.startDate).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">End Date</Label>
                              <p className="mt-1">{new Date(selectedDeal.endDate).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Description</Label>
                            <p className="mt-1">{selectedDeal.description}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Terms & Conditions</Label>
                            <p className="mt-1">{selectedDeal.terms}</p>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>

                  {deal.status === 'pending_approval' && (
                    <>
                      <Dialog open={isApproveModalOpen} onOpenChange={setIsApproveModalOpen}>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedDeal(deal);
                              setAdminData({
                                ...adminData,
                                cardNotes: deal.description
                              });
                            }}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Approve Deal: {selectedDeal?.title}</DialogTitle>
                            <DialogDescription>
                              Add admin-controlled monetization details before approving this deal.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="affiliateLink">Affiliate Link *</Label>
                                <Input
                                  id="affiliateLink"
                                  value={adminData.affiliateLink}
                                  onChange={(e) => setAdminData(prev => ({ ...prev, affiliateLink: e.target.value }))}
                                  placeholder="https://company.com/signup?ref=koocao"
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="couponCode">Coupon Code</Label>
                                <Input
                                  id="couponCode"
                                  value={adminData.couponCode}
                                  onChange={(e) => setAdminData(prev => ({ ...prev, couponCode: e.target.value }))}
                                  placeholder="e.g., KOOCAO30"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="discountType">Discount Type</Label>
                                <Select 
                                  value={adminData.discountType} 
                                  onValueChange={(value) => setAdminData(prev => ({ ...prev, discountType: value as 'percentage' | 'fixed' | 'free' }))}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="percentage">Percentage</SelectItem>
                                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                                    <SelectItem value="free">Free/Special</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              {adminData.discountType === 'percentage' && (
                                <div className="space-y-2">
                                  <Label htmlFor="discountValue">Discount %</Label>
                                  <Input
                                    id="discountValue"
                                    type="number"
                                    value={adminData.discountValue}
                                    onChange={(e) => setAdminData(prev => ({ ...prev, discountValue: Number(e.target.value) }))}
                                    placeholder="30"
                                  />
                                </div>
                              )}

                              {adminData.discountType === 'fixed' && (
                                <div className="space-y-2">
                                  <Label htmlFor="fixedAmount">Fixed Amount</Label>
                                  <Input
                                    id="fixedAmount"
                                    value={adminData.fixedAmount}
                                    onChange={(e) => setAdminData(prev => ({ ...prev, fixedAmount: e.target.value }))}
                                    placeholder="$100"
                                  />
                                </div>
                              )}

                              {adminData.discountType === 'free' && (
                                <div className="space-y-2">
                                  <Label htmlFor="freeText">Free Text</Label>
                                  <Input
                                    id="freeText"
                                    value={adminData.freeText}
                                    onChange={(e) => setAdminData(prev => ({ ...prev, freeText: e.target.value }))}
                                    placeholder="FREE TRIAL"
                                  />
                                </div>
                              )}

                              <div className="space-y-2">
                                <Label htmlFor="buttonConfig">Button Config</Label>
                                <Select 
                                  value={adminData.buttonConfig} 
                                  onValueChange={(value) => setAdminData(prev => ({ ...prev, buttonConfig: value as 'both' | 'claim-only' | 'code-only' }))}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="both">Both Buttons</SelectItem>
                                    <SelectItem value="claim-only">Claim Only</SelectItem>
                                    <SelectItem value="code-only">Code Only</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="cardNotes">Card Notes</Label>
                              <Textarea
                                id="cardNotes"
                                value={adminData.cardNotes}
                                onChange={(e) => setAdminData(prev => ({ ...prev, cardNotes: e.target.value }))}
                                placeholder="Additional notes to display on the deal card..."
                                rows={2}
                              />
                            </div>

                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id="hasVerificationBadge"
                                checked={adminData.hasVerificationBadge}
                                onChange={(e) => setAdminData(prev => ({ ...prev, hasVerificationBadge: e.target.checked }))}
                                className="rounded"
                              />
                              <Label htmlFor="hasVerificationBadge">Add verification badge</Label>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsApproveModalOpen(false)}>
                              Cancel
                            </Button>
                            <Button
                              onClick={handleApprove}
                              className="bg-green-600 hover:bg-green-700 text-white"
                              disabled={!adminData.affiliateLink.trim()}
                            >
                              Approve & Publish Deal
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      
                      <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                            onClick={() => setSelectedDeal(deal)}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Reject Deal</DialogTitle>
                            <DialogDescription>
                              Please provide a reason for rejecting "{selectedDeal?.title}". This will be sent to the company.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="rejection-reason">Rejection Reason *</Label>
                              <Textarea
                                id="rejection-reason"
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="e.g., Discount percentage is too high, terms are unclear, etc."
                                rows={3}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsRejectModalOpen(false)}>
                              Cancel
                            </Button>
                            <Button
                              onClick={handleReject}
                              className="bg-red-600 hover:bg-red-700 text-white"
                              disabled={!rejectionReason.trim()}
                            >
                              Reject Deal
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )) : (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">No deals found</h3>
              <p className="text-slate-600 dark:text-slate-400">
                {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all'
                  ? "No deals match your current filters."
                  : "No broker deals have been submitted yet."
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}