import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "./ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";
import { 
  Building2, 
  Plus, 
  Calendar, 
  Clock, 
  Edit3, 
  Trash2, 
  Eye, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  PauseCircle, 
  ArrowLeft,
  FileText,
  TrendingUp,
  Users,
  DollarSign,
  Mail,
  MessageCircle
} from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import { toast } from "sonner@2.0.3";
import { Company, BrokerDeal, User } from "./types";
import { CategoryExpansionDialog } from "./CategoryExpansionDialog";
import { useCategoryValidation } from "./useCategoryValidation";

interface BrokerDashboardProps {
  user: User;
  company?: Company; // Make company optional since user might not have one yet
  onBack: () => void;
  onLoginRequired?: () => void; // Add this prop that App.tsx is passing
  onNavigateToRegistration?: () => void; // Add navigation to registration
  onCompanyUpdated?: (company: Company) => void; // Add callback for when company is updated
}

// Mock data for demonstration
const mockBrokerDeals: BrokerDeal[] = [
  {
    id: '1',
    companyId: 'comp1',
    title: '50% Off Trading Challenge',
    description: 'Get 50% discount on our $100K trading challenge. Perfect for experienced traders looking to get funded.',
    category: 'CFD',
    startDate: '2025-01-01T00:00',
    endDate: '2025-03-31T23:59',
    terms: 'Valid for new customers only. One-time use per account.',
    status: 'approved',
    createdAt: '2024-12-15T10:30:00Z',
    updatedAt: '2024-12-15T10:30:00Z',
    approvedAt: '2024-12-16T14:20:00Z',
    approvedBy: 'admin1'
  },
  {
    id: '2',
    companyId: 'comp1',
    title: 'Free Reset on Failed Challenge',
    description: 'Get a free reset if you fail your first trading challenge attempt.',
    category: 'CFD',
    startDate: '2025-01-01T00:00',
    endDate: '2025-12-31T23:59',
    terms: 'Available once per customer. Must be used within 30 days of initial challenge failure.',
    status: 'pending_approval',
    createdAt: '2024-12-20T09:15:00Z',
    updatedAt: '2024-12-20T09:15:00Z'
  },
  {
    id: '3',
    companyId: 'comp1',
    title: 'New Year Special - 75% Off',
    description: 'Limited time New Year offer with maximum savings.',
    category: 'CFD',
    startDate: '2024-12-28T00:00',
    endDate: '2024-12-31T23:59',
    terms: 'Limited time offer.',
    status: 'rejected',
    createdAt: '2024-12-28T16:45:00Z',
    updatedAt: '2024-12-28T16:45:00Z',
    rejectionReason: 'Discount too high, please provide more reasonable offer.'
  }
];

export function BrokerDashboard({ user, company, onBack, onLoginRequired, onNavigateToRegistration, onCompanyUpdated }: BrokerDashboardProps) {
  const [deals, setDeals] = useState<BrokerDeal[]>(mockBrokerDeals);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<BrokerDeal | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Category validation hook
  const {
    validationState,
    validateCategoryForDeal,
    handleCategoryAdded,
    handleProceedAnyway,
    closeDialog
  } = useCategoryValidation();

  // Form state for creating/editing deals
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    startDate: '',
    endDate: '',
    terms: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when modals close
  useEffect(() => {
    if (!isCreateModalOpen && !isEditModalOpen) {
      setFormData({
        title: '',
        description: '',
        category: '',
        startDate: '',
        endDate: '',
        terms: ''
      });
      setErrors({});
      setSelectedDeal(null);
    }
  }, [isCreateModalOpen, isEditModalOpen]);

  // Populate form when editing
  useEffect(() => {
    if (selectedDeal && isEditModalOpen) {
      setFormData({
        title: selectedDeal.title,
        description: selectedDeal.description,
        category: selectedDeal.category,
        startDate: selectedDeal.startDate.slice(0, 16), // Format for datetime-local input
        endDate: selectedDeal.endDate.slice(0, 16),
        terms: selectedDeal.terms
      });
    }
  }, [selectedDeal, isEditModalOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Deal title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Deal description is required';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = 'End date must be after start date';
    }

    if (!formData.terms.trim()) {
      newErrors.terms = 'Terms and conditions are required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Check if category validation is needed
    const proceedWithSubmit = () => {
      performActualSubmit();
    };

    // Validate category and potentially show expansion dialog
    const shouldContinue = validateCategoryForDeal(company, formData.category, proceedWithSubmit);
    
    if (!shouldContinue) {
      // Category validation dialog will be shown, submission will continue in callback
      return;
    }
  };

  const performActualSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (selectedDeal) {
        // Update existing deal
        const updatedDeal: BrokerDeal = {
          ...selectedDeal,
          title: formData.title,
          description: formData.description,
          category: formData.category as 'CFD' | 'Futures' | 'Crypto' | 'Brokers' | 'Casinos',
          startDate: formData.startDate,
          endDate: formData.endDate,
          terms: formData.terms,
          status: 'pending_approval', // Reset to pending when edited
          updatedAt: new Date().toISOString()
        };

        setDeals(prev => prev.map(deal => deal.id === selectedDeal.id ? updatedDeal : deal));
        setIsEditModalOpen(false);
        toast.success("Deal updated and submitted for re-approval!");
      } else {
        // Create new deal
        const newDeal: BrokerDeal = {
          id: Date.now().toString(),
          companyId: company?.id || '',
          title: formData.title,
          description: formData.description,
          category: formData.category as 'CFD' | 'Futures' | 'Crypto' | 'Brokers' | 'Casinos',
          startDate: formData.startDate,
          endDate: formData.endDate,
          terms: formData.terms,
          status: 'pending_approval',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        setDeals(prev => [...prev, newDeal]);
        setIsCreateModalOpen(false);
        toast.success("Deal created and submitted for approval!");
      }
    } catch (error) {
      toast.error("Failed to save deal. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDeal = async (dealId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setDeals(prev => prev.filter(deal => deal.id !== dealId));
      toast.success("Deal deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete deal. Please try again.");
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getStatusBadge = (status: BrokerDeal['status']) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline"><PauseCircle className="w-3 h-3 mr-1" />Draft</Badge>;
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

  const getStatsCards = () => {
    const totalDeals = deals.length;
    const approvedDeals = deals.filter(d => d.status === 'approved').length;
    const pendingDeals = deals.filter(d => d.status === 'pending_approval').length;
    const activeDeals = deals.filter(d => d.status === 'approved' && new Date(d.endDate) > new Date()).length;

    return [
      { title: 'Total Deals', value: totalDeals, icon: FileText, color: 'text-blue-500' },
      { title: 'Active Deals', value: activeDeals, icon: TrendingUp, color: 'text-green-500' },
      { title: 'Pending Approval', value: pendingDeals, icon: Clock, color: 'text-yellow-500' },
      { title: 'Approved Deals', value: approvedDeals, icon: CheckCircle, color: 'text-green-600' },
    ];
  };

  const DealForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Deal Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          placeholder="e.g., 50% Off Trading Challenge"
          className={errors.title ? 'border-red-500' : ''}
        />
        {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Deal Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Describe the deal, what it includes, and who it's for..."
          rows={3}
          className={errors.description ? 'border-red-500' : ''}
        />
        {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category *</Label>
        <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
          <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="CFD">CFD</SelectItem>
            <SelectItem value="Futures">Futures</SelectItem>
            <SelectItem value="Crypto">Crypto</SelectItem>
            <SelectItem value="Brokers">Brokers</SelectItem>
            <SelectItem value="Casinos">Casinos</SelectItem>
          </SelectContent>
        </Select>
        {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date *</Label>
          <Input
            id="startDate"
            type="datetime-local"
            value={formData.startDate}
            onChange={(e) => handleInputChange('startDate', e.target.value)}
            className={errors.startDate ? 'border-red-500' : ''}
          />
          {errors.startDate && <p className="text-sm text-red-500">{errors.startDate}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">End Date *</Label>
          <Input
            id="endDate"
            type="datetime-local"
            value={formData.endDate}
            onChange={(e) => handleInputChange('endDate', e.target.value)}
            className={errors.endDate ? 'border-red-500' : ''}
          />
          {errors.endDate && <p className="text-sm text-red-500">{errors.endDate}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="terms">Terms & Conditions *</Label>
        <Textarea
          id="terms"
          value={formData.terms}
          onChange={(e) => handleInputChange('terms', e.target.value)}
          placeholder="e.g., Valid for new customers only. One-time use per account."
          rows={2}
          className={errors.terms ? 'border-red-500' : ''}
        />
        {errors.terms && <p className="text-sm text-red-500">{errors.terms}</p>}
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Note: Affiliate links and coupon codes will be added by our admin team after approval.
        </AlertDescription>
      </Alert>
    </form>
  );

  // If user doesn't have a company, show registration prompt
  if (!company) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="mb-4 rounded-xl border-slate-200/50 dark:border-slate-700/50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl rounded-2xl border border-white/30 dark:border-slate-700/40 shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">No Company Registered</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            You need to register your company first before you can access the dashboard and create deals.
          </p>
          <Button
            onClick={() => {
              // Navigate to broker registration page
              if (onNavigateToRegistration) {
                onNavigateToRegistration();
              } else {
                window.location.hash = 'broker-register';
              }
            }}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl px-6 py-3"
          >
            <Building2 className="w-4 h-4 mr-2" />
            Register Company
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{company?.name || 'No Company'}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex flex-wrap gap-1">
                    {company?.categories ? company.categories.map(category => (
                      <Badge key={category} variant="outline" className="text-xs">
                        {category}
                      </Badge>
                    )) : (
                      <Badge variant="outline" className="text-xs">No Category</Badge>
                    )}
                  </div>
                  {company?.status === 'approved' ? (
                    <Badge className="bg-green-500 hover:bg-green-600">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Approved
                    </Badge>
                  ) : (
                    <Badge className="bg-yellow-500 hover:bg-yellow-600">
                      <Clock className="w-3 h-3 mr-1" />
                      Pending Approval
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {company?.status === 'approved' && (
              <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Deal
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Deal</DialogTitle>
                    <DialogDescription>
                      Create a new deal for your company. It will be submitted for admin approval.
                    </DialogDescription>
                  </DialogHeader>
                  <DealForm />
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                          Creating...
                        </>
                      ) : (
                        'Create Deal'
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </div>

      {/* Company Status Notice */}
      {company?.status !== 'approved' && (
        <div className="mb-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your company is pending admin approval. You'll be able to create deals once approved.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Conditional Content Based on Approval Status */}
      {company?.status === 'approved' || company?.status === 'admin_created' ? (
        // Full Dashboard for Approved Companies
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="deals">My Deals</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
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

            {/* Company Info */}
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Website</Label>
                    <p className="text-blue-600 hover:underline cursor-pointer">{company?.website || 'No Website'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Contact Email</Label>
                    <p>{company?.contactEmail || 'No Email'}</p>
                  </div>
                  {company?.country && (
                    <div>
                      <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Country</Label>
                      <p>{company?.country}</p>
                    </div>
                  )}
                  {company?.contactPhone && (
                    <div>
                      <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Phone</Label>
                      <p>{company?.contactPhone}</p>
                    </div>
                  )}
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Description</Label>
                  <p className="mt-1">{company?.description || 'No Description'}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deals" className="space-y-6">
            <div className="grid gap-4">
              {deals.length > 0 ? deals.map((deal) => (
                <Card key={deal.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{deal.title}</h3>
                          {getStatusBadge(deal.status)}
                          <Badge variant="outline">{deal.category}</Badge>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 mb-3">{deal.description}</p>
                        
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
                          <Alert className="mb-3">
                            <XCircle className="h-4 w-4" />
                            <AlertDescription>
                              <strong>Rejection reason:</strong> {deal.rejectionReason}
                            </AlertDescription>
                          </Alert>
                        )}

                        <div className="text-sm">
                          <strong>Terms:</strong> {deal.terms}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        {deal.status === 'draft' || deal.status === 'rejected' ? (
                          <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedDeal(deal)}
                              >
                                <Edit3 className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Edit Deal</DialogTitle>
                                <DialogDescription>
                                  Make changes to your deal. It will be resubmitted for approval.
                                </DialogDescription>
                              </DialogHeader>
                              <DealForm />
                              <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                                  Cancel
                                </Button>
                                <Button
                                  type="submit"
                                  onClick={handleSubmit}
                                  disabled={isSubmitting}
                                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                                >
                                  {isSubmitting ? (
                                    <>
                                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                      Updating...
                                    </>
                                  ) : (
                                    'Update Deal'
                                  )}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        ) : (
                          <Button variant="outline" size="sm" disabled>
                            <Eye className="w-4 h-4" />
                          </Button>
                        )}

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Deal</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this deal? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteDeal(deal.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">No Deals Yet</h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                      You haven't created any deals yet. Start by creating your first deal to promote on KOOCAO.
                    </p>
                    <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white">
                          <Plus className="w-4 h-4 mr-2" />
                          Create Your First Deal
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Create New Deal</DialogTitle>
                          <DialogDescription>
                            Create a new deal for your company. It will be submitted for admin approval.
                          </DialogDescription>
                        </DialogHeader>
                        <DealForm />
                        <DialogFooter>
                          <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                          >
                            {isSubmitting ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                Creating...
                              </>
                            ) : (
                              'Create Deal'
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        // Limited View for Pending/Unapproved Companies
        <div className="space-y-6">
          {/* Pending Status Info */}
          <Card>
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Clock className="w-10 h-10 text-amber-600 dark:text-amber-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">
                Company Approval Pending
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
                Your company registration has been submitted and is currently under review by our admin team. 
                This process typically takes 1-3 business days.
              </p>
              
              {/* What happens next */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 text-left max-w-lg mx-auto">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">What happens next?</h3>
                <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 text-blue-600 dark:text-blue-400" />
                    Our team will verify your company information
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 text-blue-600 dark:text-blue-400" />
                    We'll check your website and business legitimacy
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 text-blue-600 dark:text-blue-400" />
                    You'll receive an email notification once approved
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 text-blue-600 dark:text-blue-400" />
                    After approval, you can create and manage deals
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Company Information (Read-Only) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Submitted Company Information
              </CardTitle>
              <CardDescription>
                The information you submitted for review
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Company Name</Label>
                  <p className="font-medium">{company?.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Website</Label>
                  <p className="text-blue-600 hover:underline cursor-pointer">{company?.website}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Contact Email</Label>
                  <p>{company?.contactEmail}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Categories</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {company?.categories.map(category => (
                      <Badge key={category} variant="outline" className="text-xs">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
                {company?.country && (
                  <div>
                    <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Country</Label>
                    <p>{company?.country}</p>
                  </div>
                )}
                {company?.contactPhone && (
                  <div>
                    <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Phone</Label>
                    <p>{company?.contactPhone}</p>
                  </div>
                )}
              </div>
              <div>
                <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Description</Label>
                <p className="mt-1">{company?.description}</p>
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                <strong>Submitted:</strong> {new Date(company?.createdAt || '').toLocaleDateString()}
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Need Help?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                If you have questions about the approval process or need to update your information, feel free to contact us.
              </p>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contact Support
                </Button>
                <Button variant="outline" className="flex-1">
                  <Mail className="w-4 h-4 mr-2" />
                  Send Email
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Category Expansion Dialog */}
      {validationState.isDialogOpen && company && validationState.attemptedCategory && (
        <CategoryExpansionDialog
          isOpen={validationState.isDialogOpen}
          onClose={closeDialog}
          company={company}
          attemptedCategory={validationState.attemptedCategory}
          onCategoryAdded={(updatedCompany) => {
            if (onCompanyUpdated) {
              onCompanyUpdated(updatedCompany);
            }
            handleCategoryAdded(updatedCompany);
          }}
          onProceedAnyway={handleProceedAnyway}
        />
      )}
    </div>
  );
}