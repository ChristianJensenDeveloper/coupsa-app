import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "./ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";
import { 
  Building2, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  Globe, 
  Mail, 
  Phone, 
  MapPin,
  Search,
  Filter,
  Calendar,
  Users,
  TrendingUp,
  AlertTriangle,
  Link,
  Plus,
  ArrowRight,
  Zap,
  Building,
  UserPlus,
  Edit3,
  DollarSign,
  Tag
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from "sonner@2.0.3";
import { Company, BrokerDeal, CompanyStatus } from "./types";
import { CompanyApprovalModal } from "./CompanyApprovalModal";

interface CompaniesManagerProps {
  companies: Company[];
  brokerDeals: BrokerDeal[];
  onApproveCompany: (companyId: string, marketingData?: any) => void;
  onRejectCompany: (companyId: string, reason: string) => void;
  onSuspendCompany: (companyId: string) => void;
  onUpdateCompany: (company: Company) => void;
  onMergeCompanies?: (existingCompanyId: string, pendingCompany: Company, notes?: string) => void;
}

// Mock data for demonstration
const mockCompanies: Company[] = [
  {
    id: '1',
    name: 'FundedNext',
    description: 'Leading prop trading firm offering funded accounts up to $300K. We focus on developing skilled traders through our comprehensive evaluation process.',
    website: 'https://fundednext.com',
    categories: ['CFD', 'Futures'], // Changed to array
    country: 'United Arab Emirates',
    contactEmail: 'partnerships@fundednext.com',
    contactPhone: '+971 4 123 4567',
    createdAt: '2024-12-20T09:30:00Z',
    status: 'pending',
    userId: 'user123'
  },
  {
    id: '2',
    name: 'TradeForge Pro',
    description: 'Innovative crypto trading platform with advanced tools and 24/7 support.',
    website: 'https://tradeforge.pro',
    categories: ['Crypto', 'Brokers'], // Changed to array
    country: 'Estonia',
    contactEmail: 'hello@tradeforge.pro',
    createdAt: '2024-12-18T14:20:00Z',
    status: 'approved',
    userId: 'user456',
    approvedBy: 'admin1',
    approvedAt: '2024-12-19T10:15:00Z'
  },
  {
    id: '3',
    name: 'SharpTraders',
    description: 'Premium forex and CFD broker with tight spreads and fast execution.',
    website: 'https://sharptraders.com',
    categories: ['Brokers', 'CFD'], // Changed to array
    country: 'United Kingdom',
    contactEmail: 'support@sharptraders.com',
    contactPhone: '+44 20 7946 0958',
    createdAt: '2024-12-15T11:45:00Z',
    status: 'rejected',
    userId: 'user789',
    rejectionReason: 'Unable to verify regulatory licenses. Please provide valid FCA registration.'
  },
  {
    id: '4',
    name: 'CasinoElite',
    description: 'Premium online casino with live dealers and crypto support.',
    website: 'https://casinoelite.com',
    categories: ['Casinos', 'Crypto'], // Changed to array
    country: 'Malta',
    contactEmail: 'partnerships@casinoelite.com',
    createdAt: '2024-12-22T16:00:00Z',
    status: 'pending',
    userId: 'user321'
  },
  {
    id: '5',
    name: 'FuturesMax',
    description: 'Specialized futures prop firm with advanced risk management.',
    website: 'https://futuresmax.com',
    categories: ['Futures'], // Changed to array
    country: 'United States',
    contactEmail: 'info@futuresmax.com',
    contactPhone: '+1 312 555 0123',
    createdAt: '2024-12-10T08:30:00Z',
    status: 'approved',
    userId: 'user654',
    approvedBy: 'admin2',
    approvedAt: '2024-12-11T09:20:00Z'
  }
];

// Mock data for existing companies that admin created earlier (for connecting)
const mockExistingCompanies: Company[] = [
  {
    id: 'admin_1',
    name: 'FTMO',
    description: 'One of the largest prop trading firms, offering funded trading accounts up to $400K.',
    website: 'https://ftmo.com',
    categories: ['CFD', 'Futures'],
    country: 'Czech Republic',
    contactEmail: 'partnerships@ftmo.com',
    createdAt: '2024-01-15T10:30:00Z',
    status: 'admin_created',
    userId: 'admin',
    hasActiveDeals: true,
    dealCount: 5,
    defaultMarketingData: {
      defaultAffiliateLink: 'https://ftmo.com/?ref=koocao',
      defaultCouponCode: 'KOOCAO15',
      commissionRate: '25%',
      trackingEnabled: true,
      isComplete: true,
      notes: 'High-converting prop firm with excellent support'
    }
  },
  {
    id: 'admin_2', 
    name: 'TopStep',
    description: 'Leading futures prop trading firm with comprehensive training programs.',
    website: 'https://topstep.com',
    categories: ['Futures'],
    country: 'United States',
    contactEmail: 'info@topstep.com',
    createdAt: '2024-01-20T14:15:00Z',
    status: 'admin_created',
    userId: 'admin',
    hasActiveDeals: true,
    dealCount: 3,
    defaultMarketingData: {
      defaultAffiliateLink: 'https://topstep.com/partner/koocao',
      defaultCouponCode: 'TSKOOCAO',
      commissionRate: '$50 per funded trader',
      trackingEnabled: true,
      isComplete: true,
      notes: 'Futures-focused with good conversion rates'
    }
  },
  {
    id: 'admin_3',
    name: 'IC Markets',
    description: 'Premium ECN broker with tight spreads and fast execution.',
    website: 'https://icmarkets.com',
    categories: ['Brokers', 'CFD'],
    country: 'Australia',
    contactEmail: 'affiliates@icmarkets.com',
    createdAt: '2024-02-01T09:20:00Z',
    status: 'admin_created',
    userId: 'admin',
    hasActiveDeals: true,
    dealCount: 2,
    defaultMarketingData: {
      defaultAffiliateLink: 'https://icmarkets.com/?camp=koocao',
      defaultCouponCode: 'ICKOOCAO',
      commissionRate: '$400 per qualified trader',
      trackingEnabled: true,
      isComplete: true,
      notes: 'Premium broker with high-value clients'
    }
  },
  {
    id: 'admin_4',
    name: 'Apex Trader Funding',
    description: 'Futures prop firm with unique evaluation process and profit splits.',
    website: 'https://apextrader.com',
    categories: ['Futures'],
    country: 'United States',
    contactEmail: 'partnerships@apextrader.com',
    createdAt: '2024-02-10T11:45:00Z',
    status: 'admin_created',
    userId: 'admin',
    hasActiveDeals: false,
    dealCount: 0
    // Note: No defaultMarketingData - this will show as "Needs Marketing Setup"
  }
];

export function CompaniesManager({ 
  companies: propCompanies = mockCompanies, 
  brokerDeals = [], 
  onApproveCompany, 
  onRejectCompany, 
  onSuspendCompany, 
  onUpdateCompany,
  onMergeCompanies
}: CompaniesManagerProps) {
  const [companies, setCompanies] = useState<Company[]>(propCompanies);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<CompanyStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  
  // New states for company connection feature
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [selectedExistingCompany, setSelectedExistingCompany] = useState<Company | null>(null);
  const [existingCompanies] = useState<Company[]>(mockExistingCompanies);
  const [connectionNotes, setConnectionNotes] = useState('');

  // Add approval modal state
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [pendingCompanyForApproval, setPendingCompanyForApproval] = useState<Company | null>(null);

  const getStatusBadge = (status: CompanyStatus) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case 'suspended':
        return <Badge variant="secondary"><AlertTriangle className="w-3 h-3 mr-1" />Suspended</Badge>;
      case 'connected':
        return <Badge className="bg-purple-500 hover:bg-purple-600"><Link className="w-3 h-3 mr-1" />Connected</Badge>;
      case 'admin_created':
        return <Badge className="bg-blue-500 hover:bg-blue-600"><Building className="w-3 h-3 mr-1" />Admin Created</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getMarketingStatusBadge = (company: Company) => {
    const marketing = company.defaultMarketingData;
    if (!marketing || !marketing.isComplete) {
      return <Badge variant="outline" className="text-amber-600 border-amber-300 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />Needs Marketing Setup</Badge>;
    }
    
    return <Badge className="bg-green-500 hover:bg-green-600 flex items-center gap-1"><CheckCircle className="w-3 h-3" />Marketing Complete</Badge>;
  };

  // Enhanced approval handler that opens the approval modal
  const handleOpenApprovalModal = (company: Company) => {
    setPendingCompanyForApproval(company);
    setIsApprovalModalOpen(true);
  };

  // Handle approval with marketing data from modal
  const handleApprovalModalCreateNew = (pendingCompany: Company, marketingData?: any) => {
    setCompanies(prev => prev.map(company => 
      company.id === pendingCompany.id 
        ? { 
            ...company, 
            status: 'approved' as CompanyStatus,
            approvedBy: 'current_admin',
            approvedAt: new Date().toISOString(),
            defaultMarketingData: marketingData
          }
        : company
    ));
    
    if (onApproveCompany) onApproveCompany(pendingCompany.id, marketingData);
    toast.success(`${pendingCompany.name} approved with marketing data!`);
  };

  // Handle merging companies
  const handleApprovalModalMerge = (existingCompanyId: string, pendingCompany: Company, notes?: string) => {
    setCompanies(prev => prev.map(company => 
      company.id === pendingCompany.id 
        ? { 
            ...company, 
            status: 'connected' as CompanyStatus,
            connectedToCompanyId: existingCompanyId,
            connectionNotes: notes,
            approvedBy: 'current_admin',
            approvedAt: new Date().toISOString()
          }
        : company
    ));
    
    if (onMergeCompanies) onMergeCompanies(existingCompanyId, pendingCompany, notes);
    
    const existingCompany = existingCompanies.find(c => c.id === existingCompanyId);
    toast.success(`${pendingCompany.name} connected to ${existingCompany?.name || 'existing company'}!`);
  };

  // Find potential matches for company approval modal
  const findPotentialMatches = (company: Company) => {
    return existingCompanies.filter(existingCompany => {
      const nameMatch = existingCompany.name.toLowerCase().includes(company.name.toLowerCase()) ||
                       company.name.toLowerCase().includes(existingCompany.name.toLowerCase());
      const websiteMatch = existingCompany.website.toLowerCase().includes(company.website.toLowerCase()) ||
                          company.website.toLowerCase().includes(existingCompany.website.toLowerCase());
      const categoryMatch = existingCompany.categories.some(cat => company.categories.includes(cat));
      
      return nameMatch || websiteMatch || categoryMatch;
    });
  };

  const handleApprove = (companyId: string) => {
    setCompanies(prev => prev.map(company => 
      company.id === companyId 
        ? { 
            ...company, 
            status: 'approved' as CompanyStatus,
            approvedBy: 'current_admin',
            approvedAt: new Date().toISOString()
          }
        : company
    ));
    
    if (onApproveCompany) onApproveCompany(companyId);
    toast.success("Company approved successfully!");
  };

  const handleReject = () => {
    if (!selectedCompany || !rejectionReason.trim()) {
      toast.error("Please provide a rejection reason.");
      return;
    }

    setCompanies(prev => prev.map(company => 
      company.id === selectedCompany.id 
        ? { 
            ...company, 
            status: 'rejected' as CompanyStatus,
            rejectionReason: rejectionReason
          }
        : company
    ));
    
    if (onRejectCompany) onRejectCompany(selectedCompany.id, rejectionReason);
    setIsRejectModalOpen(false);
    setRejectionReason('');
    setSelectedCompany(null);
    toast.success("Company rejected with reason provided.");
  };

  const handleSuspend = (companyId: string) => {
    setCompanies(prev => prev.map(company => 
      company.id === companyId 
        ? { ...company, status: 'suspended' as CompanyStatus }
        : company
    ));
    
    if (onSuspendCompany) onSuspendCompany(companyId);
    toast.success("Company suspended successfully!");
  };

  // New handler for connecting companies
  const handleConnectToExisting = () => {
    if (!selectedCompany || !selectedExistingCompany) {
      toast.error("Please select a company to connect to.");
      return;
    }

    // Update the pending company to show it's been connected
    setCompanies(prev => prev.map(company => 
      company.id === selectedCompany.id 
        ? { 
            ...company, 
            status: 'connected' as CompanyStatus,
            connectedToCompanyId: selectedExistingCompany.id,
            connectionNotes: connectionNotes,
            approvedBy: 'current_admin',
            approvedAt: new Date().toISOString()
          }
        : company
    ));
    
    // Close modal and reset state
    setIsConnectModalOpen(false);
    setSelectedExistingCompany(null);
    setConnectionNotes('');
    setSelectedCompany(null);
    
    toast.success(`Successfully connected "${selectedCompany.name}" to existing "${selectedExistingCompany.name}" profile!`);
  };

  const getStatsCards = () => {
    const totalCompanies = companies.length;
    const pendingCompanies = companies.filter(c => c.status === 'pending').length;
    const approvedCompanies = companies.filter(c => c.status === 'approved').length;
    const connectedCompanies = companies.filter(c => c.status === 'connected').length;
    const totalDeals = brokerDeals.length;

    return [
      { title: 'Total Companies', value: totalCompanies, icon: Building2, color: 'text-blue-500' },
      { title: 'Pending Approval', value: pendingCompanies, icon: Clock, color: 'text-yellow-500' },
      { title: 'Approved New', value: approvedCompanies, icon: CheckCircle, color: 'text-green-500' },
      { title: 'Connected', value: connectedCompanies, icon: Link, color: 'text-purple-500' },
      { title: 'Total Deals', value: totalDeals, icon: TrendingUp, color: 'text-indigo-500' },
    ];
  };

  function renderCompaniesGrid(companiesToRender: Company[]) {
    const displayedCompanies = companiesToRender.filter(company => {
      const matchesSearch = company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           company.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           company.contactEmail.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || company.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || company.categories.includes(categoryFilter);
      
      return matchesSearch && matchesStatus && matchesCategory;
    });

    if (displayedCompanies.length === 0) {
      return (
        <Card>
          <CardContent className="text-center py-12">
            <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">No companies found</h3>
            <p className="text-slate-600 dark:text-slate-400">
              {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all'
                ? "No companies match your current filters."
                : "No companies have been registered yet."
              }
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
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
                    placeholder="Search companies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as CompanyStatus | 'all')}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="connected">Connected</SelectItem>
                    <SelectItem value="admin_created">Admin Created</SelectItem>
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

        {/* Companies Grid */}
        <div className="grid gap-4">
          {displayedCompanies.map((company) => (
            <Card key={company.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Building2 className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">{company.name}</h3>
                        {getStatusBadge(company.status)}
                        {(company.status === 'approved' || company.status === 'admin_created') && getMarketingStatusBadge(company)}
                        <div className="flex flex-wrap gap-1">
                          {company.categories.map(category => (
                            <Badge key={category} variant="outline" className="text-xs">
                              {category}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <p className="text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">{company.description}</p>
                      
                      {/* Marketing data display for approved companies */}
                      {(company.status === 'approved' || company.status === 'admin_created') && company.defaultMarketingData?.isComplete && (
                        <div className="mb-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Link className="w-4 h-4 text-green-600" />
                              <span className="text-green-700 dark:text-green-400">Affiliate Link Set</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Tag className="w-4 h-4 text-green-600" />
                              <span className="text-green-700 dark:text-green-400">Code: {company.defaultMarketingData.defaultCouponCode}</span>
                            </div>
                            {company.defaultMarketingData.commissionRate && (
                              <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-green-600" />
                                <span className="text-green-700 dark:text-green-400">{company.defaultMarketingData.commissionRate}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          <span className="truncate">{company.website}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          <span className="truncate">{company.contactEmail}</span>
                        </div>
                        {company.contactPhone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            <span>{company.contactPhone}</span>
                          </div>
                        )}
                        {company.country && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{company.country}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-slate-400 mt-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Created {new Date(company.createdAt).toLocaleDateString()}
                        </div>
                        {company.approvedAt && (
                          <div className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Approved {new Date(company.approvedAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>

                      {company.rejectionReason && (
                        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                          <p className="text-sm text-red-800 dark:text-red-200">
                            <strong>Rejection reason:</strong> {company.rejectionReason}
                          </p>
                        </div>
                      )}

                      {/* Show connection info for connected companies */}
                      {company.status === 'connected' && company.connectedToCompanyId && (
                        <div className="mt-3 p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                          <p className="text-sm text-purple-800 dark:text-purple-200">
                            <strong>Connected to:</strong> {existingCompanies.find(c => c.id === company.connectedToCompanyId)?.name || 'Unknown Company'}
                            {company.connectionNotes && (
                              <>
                                <br />
                                <strong>Notes:</strong> {company.connectionNotes}
                              </>
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedCompany(company);
                        setIsViewModalOpen(true);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>

                    {company.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleOpenApprovalModal(company)}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Zap className="w-4 h-4 mr-1" />
                          Review
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => {
                            setSelectedCompany(company);
                            setIsRejectModalOpen(true);
                          }}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}

                    {company.status === 'admin_created' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Edit3 className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    )}

                    {company.status === 'approved' && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-yellow-600 hover:text-yellow-700"
                          >
                            <AlertTriangle className="w-4 h-4 mr-1" />
                            Suspend
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Suspend Company</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to suspend "{company.name}"? They will no longer be able to create or manage deals.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleSuspend(company.id)}
                              className="bg-yellow-600 hover:bg-yellow-700"
                            >
                              Suspend Company
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Companies Manager</h2>
        <p className="text-slate-600 dark:text-slate-400">Manage all companies: admin-created, self-registered, and approval requests</p>
      </div>

      <Tabs defaultValue="all-companies" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all-companies">All Companies</TabsTrigger>
          <TabsTrigger value="pending-approval" className="relative">
            Pending Approval
            {companies.filter(c => c.status === 'pending').length > 0 && (
              <Badge className="ml-2 bg-yellow-500 text-white text-xs px-1.5 py-0.5 min-w-[1.25rem] h-5">
                {companies.filter(c => c.status === 'pending').length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="admin-created">Admin Created</TabsTrigger>
        </TabsList>

        <TabsContent value="all-companies" className="space-y-6">
          {/* Quick Actions for Pending Companies */}
          {companies.filter(c => c.status === 'pending').length > 0 && (
            <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                  <AlertTriangle className="w-5 h-5" />
                  {companies.filter(c => c.status === 'pending').length} Company{companies.filter(c => c.status === 'pending').length !== 1 ? 'ies' : 'y'} Awaiting Approval
                </CardTitle>
                <CardDescription className="text-yellow-700 dark:text-yellow-300">
                  Review and approve new company registrations. You can approve them as new companies or connect them to existing profiles.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {companies.filter(c => c.status === 'pending').slice(0, 3).map((company) => (
                    <div key={company.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border border-yellow-200 dark:border-yellow-700">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900 dark:text-slate-100">{company.name}</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">{company.categories.join(', ')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(company.id)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          New
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedCompany(company);
                            setIsConnectModalOpen(true);
                          }}
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          <Link className="w-3 h-3 mr-1" />
                          Connect
                        </Button>
                      </div>
                    </div>
                  ))}
                  {companies.filter(c => c.status === 'pending').length > 3 && (
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 text-center pt-2">
                      +{companies.filter(c => c.status === 'pending').length - 3} more pending companies in the "Pending Approval" tab
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

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

          {/* Create New Company Button */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">Create New Company</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Add a new company as an admin for affiliate partnerships</p>
                </div>
                <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Company
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* All Companies List */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">All Companies</h3>
            {renderCompaniesGrid(companies)}
          </div>
        </TabsContent>

        <TabsContent value="pending-approval" className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Companies Pending Approval ({companies.filter(c => c.status === 'pending').length})
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Review and approve new company registrations. You can approve them as new companies or connect them to existing profiles.
            </p>
            {renderCompaniesGrid(companies.filter(c => c.status === 'pending'))}
          </div>
        </TabsContent>

        <TabsContent value="admin-created" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
                Admin Created Companies ({existingCompanies.length})
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Companies created by admins for affiliate partnerships
              </p>
            </div>
            <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white">
              <UserPlus className="w-4 h-4 mr-2" />
              Add New Company
            </Button>
          </div>
          {renderCompaniesGrid(existingCompanies)}
        </TabsContent>
      </Tabs>

      {/* Move all modals outside tabs to prevent conflicts */}
      {renderModals()}
    </div>
  );

  function renderModals() {
    return (
      <>
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedCompany?.name}</DialogTitle>
              <DialogDescription>Company details and information</DialogDescription>
            </DialogHeader>
            {selectedCompany && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Status</Label>
                    <div className="mt-1">{getStatusBadge(selectedCompany.status)}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Categories</Label>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {selectedCompany.categories.map(category => (
                        <Badge key={category} variant="outline" className="text-xs">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Website</Label>
                    <p className="mt-1 text-blue-600 hover:underline cursor-pointer">{selectedCompany.website}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Country</Label>
                    <p className="mt-1">{selectedCompany.country || 'Not specified'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Contact Email</Label>
                    <p className="mt-1">{selectedCompany.contactEmail}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Contact Phone</Label>
                    <p className="mt-1">{selectedCompany.contactPhone || 'Not provided'}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Description</Label>
                  <p className="mt-1">{selectedCompany.description}</p>
                </div>
                {selectedCompany.rejectionReason && (
                  <div>
                    <Label className="text-sm font-medium text-red-600">Rejection Reason</Label>
                    <p className="mt-1 text-red-800 dark:text-red-200">{selectedCompany.rejectionReason}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={isConnectModalOpen} onOpenChange={setIsConnectModalOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Link className="w-5 h-5" />
                Connect "{selectedCompany?.name}" to Existing Company
              </DialogTitle>
              <DialogDescription>
                Select an existing company profile that you created as an affiliate partner. This will give the new company control over that existing profile.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Company being connected info */}
              {selectedCompany && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Company Requesting Access:</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Name:</span> {selectedCompany.name}
                    </div>
                    <div>
                      <span className="font-medium">Website:</span> {selectedCompany.website}
                    </div>
                    <div>
                      <span className="font-medium">Email:</span> {selectedCompany.contactEmail}
                    </div>
                    <div>
                      <span className="font-medium">Categories:</span> {selectedCompany.categories.join(', ')}
                    </div>
                  </div>
                </div>
              )}

              {/* Select existing company */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Select Existing Company Profile to Connect To:</Label>
                <div className="grid gap-3 max-h-96 overflow-y-auto">
                  {existingCompanies.map((existingCompany) => (
                    <div
                      key={existingCompany.id}
                      className={`p-4 border rounded-xl cursor-pointer transition-all ${
                        selectedExistingCompany?.id === existingCompany.id
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                      onClick={() => setSelectedExistingCompany(existingCompany)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h5 className="font-semibold">{existingCompany.name}</h5>
                              {getStatusBadge(existingCompany.status)}
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 line-clamp-2">
                              {existingCompany.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-slate-500">
                              <span className="flex items-center gap-1">
                                <Globe className="w-3 h-3" />
                                {existingCompany.website}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {existingCompany.country}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2 mb-1">
                            {existingCompany.hasActiveDeals ? (
                              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                <Zap className="w-3 h-3 mr-1" />
                                {existingCompany.dealCount} Active Deals
                              </Badge>
                            ) : (
                              <Badge variant="outline">No Active Deals</Badge>
                            )}
                          </div>
                          <div className="text-xs text-slate-400">
                            Created {new Date(existingCompany.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1">
                        {existingCompany.categories.map(category => (
                          <Badge key={category} variant="outline" className="text-xs">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Connection notes */}
              <div className="space-y-2">
                <Label htmlFor="connection-notes">Connection Notes (Optional)</Label>
                <Textarea
                  id="connection-notes"
                  value={connectionNotes}
                  onChange={(e) => setConnectionNotes(e.target.value)}
                  placeholder="Add any notes about this connection for future reference..."
                  rows={3}
                />
              </div>

              {/* Preview of connection */}
              {selectedExistingCompany && (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                  <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
                    <ArrowRight className="w-4 h-4" />
                    Connection Preview:
                  </h4>
                  <p className="text-sm text-green-800 dark:text-green-200">
                    <strong>"{selectedCompany?.name}"</strong> will gain control of the existing <strong>"{selectedExistingCompany.name}"</strong> profile 
                    {selectedExistingCompany.hasActiveDeals && ` including ${selectedExistingCompany.dealCount} active deals`}.
                    They'll be able to manage all existing affiliate links and create new deals.
                  </p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsConnectModalOpen(false);
                  setSelectedExistingCompany(null);
                  setConnectionNotes('');
                  setSelectedCompany(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConnectToExisting}
                disabled={!selectedExistingCompany}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Link className="w-4 h-4 mr-2" />
                Connect Companies
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Company</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting "{selectedCompany?.name}". This will be sent to the company.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="rejection-reason">Rejection Reason *</Label>
                <Textarea
                  id="rejection-reason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g., Unable to verify regulatory licenses, incomplete documentation, etc."
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
                Reject Company
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <CompanyApprovalModal
          isOpen={isApprovalModalOpen}
          onClose={() => setIsApprovalModalOpen(false)}
          pendingCompany={pendingCompanyForApproval}
          potentialMatches={pendingCompanyForApproval ? findPotentialMatches(pendingCompanyForApproval) : []}
          onMergeWithExisting={handleApprovalModalMerge}
          onCreateNew={handleApprovalModalCreateNew}
        />
      </>
    );
  }
}