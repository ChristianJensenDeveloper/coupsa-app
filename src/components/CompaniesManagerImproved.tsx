import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { 
  Building2, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  Globe, 
  Mail, 
  MapPin,
  AlertTriangle,
  Link,
  Edit3,
  Plus,
  Search,
  RefreshCw,
  X,
  Users,
  Shield,
  DollarSign,
  Tag,
  Upload,
  Image
} from "lucide-react";
import { Company, BrokerDeal, CompanyStatus } from "./types";
import { CompanyApprovalModal } from "./CompanyApprovalModal";
import { AdminCompanyCreator } from "./AdminCompanyCreator";
import { toast } from "sonner";

interface CompaniesManagerProps {
  companies: Company[];
  brokerDeals: BrokerDeal[];
  onApproveCompany: (companyId: string) => void;
  onRejectCompany: (companyId: string, reason: string) => void;
  onSuspendCompany: (companyId: string) => void;
  onUpdateCompany: (company: Company) => void;
  onAddCompany?: (company: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onConnectCompany?: (existingCompanyId: string, applicantData: any) => void;
  onMergeCompanies?: (existingCompanyId: string, pendingCompany: Company, notes?: string) => void;
  isLoading?: boolean;
  onRefresh?: () => void;
}

export function CompaniesManagerImproved({ 
  companies = [], 
  brokerDeals = [],
  onApproveCompany,
  onRejectCompany,
  onSuspendCompany,
  onUpdateCompany,
  onAddCompany,
  onConnectCompany,
  onMergeCompanies,
  isLoading = false,
  onRefresh
}: CompaniesManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [rejectingCompany, setRejectingCompany] = useState<Company | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [viewingCompany, setViewingCompany] = useState<Company | null>(null);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [uploadedEditLogo, setUploadedEditLogo] = useState<string | null>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  
  // New approval modal state
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [pendingCompanyForApproval, setPendingCompanyForApproval] = useState<Company | null>(null);
  
  const availableCategories = ['CFD', 'Futures', 'Crypto', 'Brokers', 'Casinos'];
  
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    website: '',
    categories: [] as string[],
    country: '',
    contactEmail: '',
    contactPhone: '',
    logoUrl: '',
    affiliateLink: '',
    couponCode: '',
    commissionRate: ''
  });

  const getStatusBadge = (status: CompanyStatus) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-300">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-500 hover:bg-green-600">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'suspended':
        return <Badge variant="outline" className="text-red-600 border-red-300">Suspended</Badge>;
      case 'admin_created':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Admin Created</Badge>;
      case 'connected':
        return <Badge className="bg-purple-500 hover:bg-purple-600">Connected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getMarketingStatusBadge = (company: Company) => {
    // Check if company has affiliate link and coupon code
    if (!company.affiliateLink || !company.couponCode) {
      return <Badge variant="outline" className="text-amber-600 border-amber-300 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />Needs Setup</Badge>;
    }
    
    return <Badge className="bg-green-500 hover:bg-green-600 flex items-center gap-1"><CheckCircle className="w-3 h-3" />Complete</Badge>;
  };

  const handleApproveClick = (company: Company) => {
    // Check if this is a company that might be claiming an existing admin-created company
    if (company.status === 'pending') {
      const potentialMatches = companies.filter(c => 
        c.status === 'admin_created' && 
        (c.name.toLowerCase().includes(company.name.toLowerCase()) ||
         company.name.toLowerCase().includes(c.name.toLowerCase()) ||
         c.website === company.website)
      );
      
      // Show approval modal if potential matches found or always show for review
      setPendingCompanyForApproval(company);
      setIsApprovalModalOpen(true);
      return;
    }
    
    onApproveCompany(company.id);
  };

  const handleMergeCompanies = (existingCompanyId: string, pendingCompany: Company, notes?: string) => {
    if (onMergeCompanies) {
      onMergeCompanies(existingCompanyId, pendingCompany, notes);
    }
    setIsApprovalModalOpen(false);
    setPendingCompanyForApproval(null);
  };

  const handleCreateNewCompany = (pendingCompany: Company) => {
    onApproveCompany(pendingCompany.id);
    setIsApprovalModalOpen(false);
    setPendingCompanyForApproval(null);
  };

  const handleRejectClick = (company: Company) => {
    setRejectingCompany(company);
    setRejectionReason('');
  };

  const handleConfirmReject = () => {
    if (rejectingCompany && rejectionReason.trim()) {
      onRejectCompany(rejectingCompany.id, rejectionReason.trim());
      setRejectingCompany(null);
      setRejectionReason('');
    }
  };

  const handleSuspendClick = (company: Company) => {
    onSuspendCompany(company.id);
  };

  const handleViewClick = (company: Company) => {
    setViewingCompany(company);
  };

  const handleEditClick = (company: Company) => {
    setEditingCompany(company);
    setEditForm({
      name: company.name,
      description: company.description,
      website: company.website,
      categories: company.categories,
      country: company.country || '',
      contactEmail: company.contactEmail,
      contactPhone: company.contactPhone || '',
      logoUrl: company.logoUrl || '',
      affiliateLink: company.affiliateLink || '',
      couponCode: company.couponCode || '',
      commissionRate: company.commissionRate || ''
    });
    // Reset uploaded logo state
    setUploadedEditLogo(null);
  };

  const handleEditSave = () => {
    if (editingCompany) {
      const updatedCompany: Company = {
        ...editingCompany,
        name: editForm.name,
        description: editForm.description,
        website: editForm.website,
        categories: editForm.categories,
        country: editForm.country,
        contactEmail: editForm.contactEmail,
        contactPhone: editForm.contactPhone,
        logoUrl: uploadedEditLogo || editForm.logoUrl,
        affiliateLink: editForm.affiliateLink,
        couponCode: editForm.couponCode,
        commissionRate: editForm.commissionRate,
        marketingComplete: !!(editForm.affiliateLink && editForm.couponCode)
      };
      
      onUpdateCompany(updatedCompany);
      setEditingCompany(null);
      setUploadedEditLogo(null);
      toast.success('Company updated successfully!');
    }
  };

  const handleEditLogoUpload = (files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target) {
            const dataUrl = e.target.result as string;
            setUploadedEditLogo(dataUrl);
            setEditForm(prev => ({ ...prev, logoUrl: dataUrl }));
          }
        };
        reader.readAsDataURL(file);
      } else {
        toast.error('Please select a valid image file');
      }
    }
  };

  const handleEditCategoryToggle = (category: string) => {
    setEditForm(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };
  
  // Filter companies based on search query
  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.contactEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Companies Manager</h2>
          <p className="text-slate-600 dark:text-slate-400">Manage all companies: admin-created, self-registered, and approval requests</p>
        </div>
        {onAddCompany && (
          <AdminCompanyCreator 
            onCompanyCreated={onAddCompany}
            adminUserId="current-admin-id"
          />
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-blue-500">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Companies</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{companies.length}</p>
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
                <p className="text-sm text-slate-600 dark:text-slate-400">Pending Approval</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {companies.filter(c => c.status === 'pending').length}
                </p>
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
                <p className="text-sm text-slate-600 dark:text-slate-400">Approved</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {companies.filter(c => c.status === 'approved').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-amber-500">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Marketing Complete</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {companies.filter(c => c.affiliateLink && c.couponCode).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Companies List */}
      <Card>
        <CardHeader>
          <CardTitle>All Companies ({companies.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {companies.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">No companies found</h3>
              <p className="text-slate-600 dark:text-slate-400">No companies have been registered yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search companies..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {onRefresh && (
                  <Button variant="outline" size="sm" onClick={onRefresh}>
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                )}
              </div>
              {filteredCompanies.map((company) => (
                <div key={company.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                        {company.logoUrl ? (
                          <img src={company.logoUrl} alt={company.name} className="w-10 h-10 rounded-lg object-cover" />
                        ) : (
                          <Building2 className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">{company.name}</h3>
                          {getStatusBadge(company.status)}
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
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-slate-500 dark:text-slate-400">
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4" />
                            <span className="truncate">{company.website}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            <span className="truncate">{company.contactEmail}</span>
                          </div>
                          {company.country && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              <span>{company.country}</span>
                            </div>
                          )}
                        </div>

                        <div className="text-xs text-slate-400 mt-3">
                          Created {new Date(company.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Button variant="outline" size="sm" onClick={() => handleViewClick(company)}>
                        <Eye className="w-4 h-4" />
                      </Button>

                      {company.status === 'pending' && (
                        <>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleApproveClick(company)}>
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600" onClick={() => handleRejectClick(company)}>
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}

                      {(company.status === 'approved' || company.status === 'connected') && (
                        <Button variant="outline" size="sm" className="text-orange-600" onClick={() => handleSuspendClick(company)}>
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          Suspend
                        </Button>
                      )}

                      {company.status === 'admin_created' && (
                        <Button variant="outline" size="sm" className="text-blue-600" onClick={() => handleEditClick(company)}>
                          <Edit3 className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Company Dialog */}
      {viewingCompany && (
        <Dialog open={viewingCompany !== null} onOpenChange={() => setViewingCompany(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  {viewingCompany.logoUrl ? (
                    <img src={viewingCompany.logoUrl} alt={viewingCompany.name} className="w-10 h-10 rounded-lg object-cover" />
                  ) : (
                    <Building2 className="w-6 h-6 text-white" />
                  )}
                </div>
                {viewingCompany.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Company Details */}
              <div>
                <h3 className="font-semibold mb-3">Company Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Status:</span> {getStatusBadge(viewingCompany.status)}
                  </div>
                  <div>
                    <span className="font-medium">Categories:</span> {viewingCompany.categories.join(', ')}
                  </div>
                  <div>
                    <span className="font-medium">Website:</span> <a href={viewingCompany.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{viewingCompany.website}</a>
                  </div>
                  <div>
                    <span className="font-medium">Email:</span> {viewingCompany.contactEmail}
                  </div>
                  {viewingCompany.contactPhone && (
                    <div>
                      <span className="font-medium">Phone:</span> {viewingCompany.contactPhone}
                    </div>
                  )}
                  {viewingCompany.country && (
                    <div>
                      <span className="font-medium">Country:</span> {viewingCompany.country}
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <span className="font-medium">Description:</span>
                  <p className="mt-1 text-slate-600 dark:text-slate-400">{viewingCompany.description}</p>
                </div>
              </div>

              {/* Marketing Information */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Marketing Information
                </h3>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                  {viewingCompany.affiliateLink || viewingCompany.couponCode ? (
                    <div className="space-y-3">
                      {viewingCompany.affiliateLink && (
                        <div className="flex items-center gap-2">
                          <Link className="w-4 h-4 text-blue-600" />
                          <span className="font-medium">Affiliate Link:</span>
                          <code className="bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded text-xs">{viewingCompany.affiliateLink}</code>
                        </div>
                      )}
                      {viewingCompany.couponCode && (
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-amber-600" />
                          <span className="font-medium">Coupon Code:</span>
                          <code className="bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded text-xs">{viewingCompany.couponCode}</code>
                        </div>
                      )}
                      {viewingCompany.commissionRate && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span className="font-medium">Commission Rate:</span>
                          <span className="font-semibold text-green-600">{viewingCompany.commissionRate}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                      <p className="text-amber-600 font-medium">Marketing data not set up</p>
                      <p className="text-sm text-slate-500">Affiliate link and coupon code required for revenue tracking</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Company Dialog */}
      {editingCompany && (
        <Dialog open={editingCompany !== null} onOpenChange={() => setEditingCompany(null)}>
          <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto border-0 shadow-2xl bg-white dark:bg-slate-900 rounded-3xl p-0">
            {/* Header */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 px-8 pt-8 pb-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Edit3 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                    Edit Company: {editingCompany.name}
                  </DialogTitle>
                  <p className="text-slate-600 dark:text-slate-400">
                    Update company information and marketing settings
                  </p>
                </div>
              </div>
            </div>

            {/* Form Content */}
            <div className="px-8 py-6">
              <div className="space-y-8">
                {/* Company Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="w-5 h-5" />
                      Company Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Company Logo Section */}
                    <div>
                      <Label className="text-base font-medium">Company Logo</Label>
                      <div className="mt-2 flex items-center gap-6">
                        {/* Logo Preview */}
                        <div className="flex-shrink-0">
                          <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-xl flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600 overflow-hidden">
                            {uploadedEditLogo || editForm.logoUrl ? (
                              <img 
                                src={uploadedEditLogo || editForm.logoUrl} 
                                alt="Company logo" 
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <Image className="w-8 h-8 text-slate-400" />
                            )}
                          </div>
                        </div>
                        
                        {/* Upload Controls */}
                        <div className="flex-1 space-y-3">
                          <div className="flex gap-3">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => editFileInputRef.current?.click()}
                              className="flex items-center gap-2"
                            >
                              <Upload className="w-4 h-4" />
                              Upload New Logo
                            </Button>
                            {(uploadedEditLogo || editForm.logoUrl) && (
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  setUploadedEditLogo(null);
                                  setEditForm(prev => ({ ...prev, logoUrl: '' }));
                                }}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="w-4 h-4" />
                                Remove
                              </Button>
                            )}
                          </div>
                          <Input
                            type="file"
                            ref={editFileInputRef}
                            onChange={(e) => handleEditLogoUpload(e.target.files)}
                            accept="image/*"
                            className="hidden"
                          />
                          <div className="text-sm text-slate-500 dark:text-slate-400">
                            <p>Upload a company logo (PNG, JPG, or SVG)</p>
                            <p>Recommended size: 200x200 pixels or larger</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Alternative: Logo URL */}
                      <div className="mt-4">
                        <Label className="text-sm">Or paste logo URL:</Label>
                        <Input
                          type="url"
                          value={editForm.logoUrl}
                          onChange={(e) => setEditForm(prev => ({ ...prev, logoUrl: e.target.value }))}
                          placeholder="https://example.com/logo.png"
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-base font-medium">Company Name</Label>
                        <Input
                          value={editForm.name}
                          onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                          className="mt-2"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label className="text-base font-medium">Business Categories</Label>
                        <div className="grid grid-cols-2 gap-3">
                          {availableCategories.map(category => (
                            <div key={category} className="flex items-center space-x-3">
                              <Checkbox
                                id={`edit-category-${category}`}
                                checked={editForm.categories.includes(category)}
                                onCheckedChange={() => handleEditCategoryToggle(category)}
                              />
                              <Label
                                htmlFor={`edit-category-${category}`}
                                className="cursor-pointer flex items-center gap-2 text-sm font-medium"
                              >
                                <Badge variant="outline" className="text-xs px-2 py-1">
                                  {category}
                                </Badge>
                              </Label>
                            </div>
                          ))}
                        </div>
                        {editForm.categories.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                            <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">Selected:</span>
                            {editForm.categories.map(category => (
                              <Badge 
                                key={category} 
                                className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-3 py-1"
                              >
                                {category}
                                <button
                                  type="button"
                                  onClick={() => handleEditCategoryToggle(category)}
                                  className="ml-2 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5 transition-colors"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-base font-medium">Website</Label>
                        <Input
                          value={editForm.website}
                          onChange={(e) => setEditForm({...editForm, website: e.target.value})}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label className="text-base font-medium">Country</Label>
                        <Input
                          value={editForm.country}
                          onChange={(e) => setEditForm({...editForm, country: e.target.value})}
                          className="mt-2"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-base font-medium">Contact Email</Label>
                        <Input
                          value={editForm.contactEmail}
                          onChange={(e) => setEditForm({...editForm, contactEmail: e.target.value})}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label className="text-base font-medium">Contact Phone</Label>
                        <Input
                          value={editForm.contactPhone}
                          onChange={(e) => setEditForm({...editForm, contactPhone: e.target.value})}
                          className="mt-2"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-base font-medium">Description</Label>
                      <Textarea
                        value={editForm.description}
                        onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                        rows={4}
                        className="mt-2"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Marketing Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Marketing Information
                    </CardTitle>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      Affiliate tracking and revenue management settings
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-base font-medium">Affiliate Link</Label>
                        <Input
                          value={editForm.affiliateLink}
                          onChange={(e) => setEditForm({...editForm, affiliateLink: e.target.value})}
                          placeholder="https://affiliate.company.com"
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label className="text-base font-medium">Coupon Code</Label>
                        <Input
                          value={editForm.couponCode}
                          onChange={(e) => setEditForm({...editForm, couponCode: e.target.value})}
                          placeholder="e.g., KOOCAO15"
                          className="mt-2"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-base font-medium">Commission Rate</Label>
                        <Input
                          value={editForm.commissionRate}
                          onChange={(e) => setEditForm({...editForm, commissionRate: e.target.value})}
                          placeholder="e.g., 25% or $50 per signup"
                          className="mt-2"
                        />
                      </div>
                    </div>

                    {/* Marketing Preview */}
                    {(editForm.affiliateLink || editForm.couponCode) && (
                      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 mt-6">
                        <div className="flex items-center gap-2 mb-4">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="font-semibold text-slate-900 dark:text-slate-100">Marketing Setup Preview</span>
                        </div>
                        <div className="space-y-3">
                          {editForm.affiliateLink && (
                            <div className="flex items-center gap-3">
                              <Link className="w-4 h-4 text-blue-600 flex-shrink-0" />
                              <span className="text-slate-600 dark:text-slate-400 font-medium min-w-0">Affiliate:</span>
                              <code className="bg-slate-200 dark:bg-slate-700 px-3 py-1 rounded text-sm flex-1 truncate">{editForm.affiliateLink}</code>
                            </div>
                          )}
                          {editForm.couponCode && (
                            <div className="flex items-center gap-3">
                              <Tag className="w-4 h-4 text-amber-600 flex-shrink-0" />
                              <span className="text-slate-600 dark:text-slate-400 font-medium">Code:</span>
                              <code className="bg-slate-200 dark:bg-slate-700 px-3 py-1 rounded text-sm">{editForm.couponCode}</code>
                            </div>
                          )}
                          {editForm.commissionRate && (
                            <div className="flex items-center gap-3">
                              <DollarSign className="w-4 h-4 text-green-600 flex-shrink-0" />
                              <span className="text-slate-600 dark:text-slate-400 font-medium">Rate:</span>
                              <span className="font-semibold text-green-600">{editForm.commissionRate}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Action Buttons */}
            <DialogFooter className="px-8 pb-8 flex gap-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setEditingCompany(null);
                  setUploadedEditLogo(null);
                }}
                className="flex-1 rounded-2xl py-4 text-base"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleEditSave} 
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl py-4 text-base font-semibold"
              >
                <CheckCircle className="w-5 h-5 mr-3" />
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Reject Company Dialog */}
      {rejectingCompany && (
        <AlertDialog open={rejectingCompany !== null} onOpenChange={() => setRejectingCompany(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reject Company</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to reject the company "{rejectingCompany.name}"?
                Please provide a reason for rejection.
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
              <AlertDialogCancel onClick={() => setRejectingCompany(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleConfirmReject}
                disabled={!rejectionReason.trim()}
                className="bg-red-600 hover:bg-red-700"
              >
                Reject Company
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Company Approval Modal */}
      {isApprovalModalOpen && pendingCompanyForApproval && (
        <CompanyApprovalModal
          isOpen={isApprovalModalOpen}
          onClose={() => {
            setIsApprovalModalOpen(false);
            setPendingCompanyForApproval(null);
          }}
          pendingCompany={pendingCompanyForApproval}
          existingCompanies={companies.filter(c => c.status === 'admin_created')}
          onMergeCompanies={handleMergeCompanies}
          onCreateNewCompany={handleCreateNewCompany}
        />
      )}
    </div>
  );
}