import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
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
  Phone, 
  MapPin,
  AlertTriangle,
  Link,
  Edit3,
  Plus,
  Search,
  RefreshCw,
  Upload,
  X,
  Users
} from "lucide-react";
import { Company, BrokerDeal, CompanyStatus } from "./types";

interface CompaniesManagerProps {
  companies: Company[];
  brokerDeals: BrokerDeal[];
  onApproveCompany: (companyId: string) => void;
  onRejectCompany: (companyId: string, reason: string) => void;
  onSuspendCompany: (companyId: string) => void;
  onUpdateCompany: (company: Company) => void;
  onAddCompany?: (company: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onConnectCompany?: (existingCompanyId: string, applicantData: any) => void;
  isLoading?: boolean;
  onRefresh?: () => void;
}

export function CompaniesManagerSimple({ 
  companies = [], 
  brokerDeals = [],
  onApproveCompany,
  onRejectCompany,
  onSuspendCompany,
  onUpdateCompany,
  onAddCompany,
  onConnectCompany,
  isLoading = false,
  onRefresh
}: CompaniesManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [rejectingCompany, setRejectingCompany] = useState<Company | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isClaimDialogOpen, setIsClaimDialogOpen] = useState(false);
  const [claimingCompany, setClaimingCompany] = useState<Company | null>(null);
  const [uploadedLogo, setUploadedLogo] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const availableCategories = ['CFD', 'Futures', 'Crypto', 'Brokers'];
  
  const [newCompanyForm, setNewCompanyForm] = useState({
    name: '',
    description: '',
    website: '',
    categories: [] as string[],
    country: '',
    contactEmail: '',
    contactPhone: '',
    logoUrl: '',
    status: 'admin_created' as CompanyStatus
  });
  
  const [formErrors, setFormErrors] = useState({
    name: '',
    contactEmail: '',
    website: '',
    categories: ''
  });

  // Check for existing companies when typing company name
  const [potentialMatches, setPotentialMatches] = useState<Company[]>([]);
  
  const handleCompanyNameChange = (name: string) => {
    setNewCompanyForm(prev => ({ ...prev, name }));
    
    if (name.length > 2) {
      const matches = companies.filter(company => 
        company.name.toLowerCase().includes(name.toLowerCase()) && 
        company.status === 'admin_created'
      );
      setPotentialMatches(matches);
    } else {
      setPotentialMatches([]);
    }
  };
  
  const handleApproveClick = (company: Company) => {
    // Check if this is a company that might be claiming an existing admin-created company
    if (company.status === 'pending') {
      const potentialMatch = companies.find(c => 
        c.status === 'admin_created' && 
        (c.name.toLowerCase().includes(company.name.toLowerCase()) ||
         company.name.toLowerCase().includes(c.name.toLowerCase()) ||
         c.website === company.website)
      );
      
      if (potentialMatch) {
        setClaimingCompany(potentialMatch);
        setIsClaimDialogOpen(true);
        return;
      }
    }
    
    onApproveCompany(company.id);
  };

  const handleConnectToExisting = () => {
    if (claimingCompany && onConnectCompany) {
      // Find the pending company that wants to claim the existing one
      const pendingCompany = companies.find(c => c.status === 'pending');
      if (pendingCompany) {
        onConnectCompany(claimingCompany.id, pendingCompany);
      }
    }
    setIsClaimDialogOpen(false);
    setClaimingCompany(null);
  };

  const handleCreateNewCompany = (company: Company) => {
    onApproveCompany(company.id);
    setIsClaimDialogOpen(false);
    setClaimingCompany(null);
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

  const handleAddCompanyClick = () => {
    setIsAddDialogOpen(true);
  };

  const handleLogoUpload = (files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target) {
            const dataUrl = e.target.result as string;
            setUploadedLogo(dataUrl);
            setNewCompanyForm(prev => ({ ...prev, logoUrl: dataUrl }));
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleCategoryToggle = (category: string) => {
    setNewCompanyForm(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const handleAddCompanyConfirm = () => {
    const { name, description, website, categories, country, contactEmail, contactPhone, logoUrl, status } = newCompanyForm;
    if (name && contactEmail && website && categories.length > 0) {
      onAddCompany?.({
        name,
        description,
        website,
        categories,
        country,
        contactEmail,
        contactPhone,
        logoUrl: uploadedLogo || logoUrl,
        status
      });
      setIsAddDialogOpen(false);
      setNewCompanyForm({
        name: '',
        description: '',
        website: '',
        categories: [] as string[],
        country: '',
        contactEmail: '',
        contactPhone: '',
        logoUrl: '',
        status: 'admin_created' as CompanyStatus
      });
      setFormErrors({
        name: '',
        contactEmail: '',
        website: '',
        categories: ''
      });
      setUploadedLogo(null);
      setPotentialMatches([]);
    } else {
      setFormErrors({
        name: !name ? 'Name is required' : '',
        contactEmail: !contactEmail ? 'Email is required' : '',
        website: !website ? 'Website is required' : '',
        categories: !categories.length ? 'At least one category is required' : ''
      });
    }
  };

  const handleAddCompanyCancel = () => {
    setIsAddDialogOpen(false);
    setNewCompanyForm({
      name: '',
      description: '',
      website: '',
      categories: [] as string[],
      country: '',
      contactEmail: '',
      contactPhone: '',
      logoUrl: '',
      status: 'admin_created' as CompanyStatus
    });
    setFormErrors({
      name: '',
      contactEmail: '',
      website: '',
      categories: ''
    });
    setUploadedLogo(null);
    setPotentialMatches([]);
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
          <Button 
            onClick={handleAddCompanyClick}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Company
          </Button>
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
              <div className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-indigo-500">
                <Plus className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Deals</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{brokerDeals.length}</p>
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
                <Input
                  type="text"
                  placeholder="Search companies..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
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
                        <Building2 className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">{company.name}</h3>
                          {getStatusBadge(company.status)}
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
                      <Button variant="outline" size="sm">
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
                        <Button variant="outline" size="sm" className="text-blue-600">
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

      {/* Add Company Dialog */}
      {isAddDialogOpen && (
        <Dialog open={isAddDialogOpen} onOpenChange={() => setIsAddDialogOpen(false)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Company</DialogTitle>
              <DialogDescription>
                Add a new company to the list.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label>Company Name *</Label>
                <Input
                  type="text"
                  value={newCompanyForm.name}
                  onChange={e => handleCompanyNameChange(e.target.value)}
                  placeholder="e.g., ACME PropFirm"
                  className={formErrors.name ? "border-red-500" : ""}
                />
                {formErrors.name && (
                  <p className="text-red-500 text-sm">{formErrors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={newCompanyForm.description}
                  onChange={e => setNewCompanyForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the company"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Website *</Label>
                <Input
                  type="url"
                  value={newCompanyForm.website}
                  onChange={e => setNewCompanyForm(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://company.com"
                  className={formErrors.website ? "border-red-500" : ""}
                />
                {formErrors.website && (
                  <p className="text-red-500 text-sm">{formErrors.website}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Categories *</Label>
                <div className="grid grid-cols-2 gap-2">
                  {availableCategories.map(category => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category}`}
                        checked={newCompanyForm.categories.includes(category)}
                        onCheckedChange={() => handleCategoryToggle(category)}
                      />
                      <Label htmlFor={`category-${category}`} className="text-sm">
                        {category}
                      </Label>
                    </div>
                  ))}
                </div>
                {newCompanyForm.categories.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {newCompanyForm.categories.map(category => (
                      <Badge key={category} variant="secondary" className="text-xs">
                        {category}
                        <button
                          type="button"
                          onClick={() => handleCategoryToggle(category)}
                          className="ml-1 text-slate-500 hover:text-slate-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                {formErrors.categories && (
                  <p className="text-red-500 text-sm">{formErrors.categories}</p>
                )}
              </div>

              {/* Show potential matches if any */}
              {potentialMatches.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-amber-600">⚠️ Potential Matches Found</Label>
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                    <p className="text-sm text-amber-800 dark:text-amber-200 mb-2">
                      Similar companies already exist. Consider connecting to an existing company instead:
                    </p>
                    <div className="space-y-2">
                      {potentialMatches.map(match => (
                        <div key={match.id} className="flex items-center justify-between bg-white dark:bg-slate-800 p-2 rounded border">
                          <div>
                            <p className="font-medium text-sm">{match.name}</p>
                            <p className="text-xs text-slate-500">{match.website}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setClaimingCompany(match);
                              setIsClaimDialogOpen(true);
                              setIsAddDialogOpen(false);
                            }}
                          >
                            <Users className="w-3 h-3 mr-1" />
                            Connect
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Country</Label>
                <Input
                  type="text"
                  value={newCompanyForm.country}
                  onChange={e => setNewCompanyForm(prev => ({ ...prev, country: e.target.value }))}
                  placeholder="e.g., United States"
                />
              </div>

              <div className="space-y-2">
                <Label>Contact Email *</Label>
                <Input
                  type="email"
                  value={newCompanyForm.contactEmail}
                  onChange={e => setNewCompanyForm(prev => ({ ...prev, contactEmail: e.target.value }))}
                  placeholder="contact@company.com"
                  className={formErrors.contactEmail ? "border-red-500" : ""}
                />
                {formErrors.contactEmail && (
                  <p className="text-red-500 text-sm">{formErrors.contactEmail}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Contact Phone</Label>
                <Input
                  type="tel"
                  value={newCompanyForm.contactPhone}
                  onChange={e => setNewCompanyForm(prev => ({ ...prev, contactPhone: e.target.value }))}
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div className="space-y-2">
                <Label>Logo URL</Label>
                <Input
                  type="url"
                  value={newCompanyForm.logoUrl}
                  onChange={e => setNewCompanyForm(prev => ({ ...prev, logoUrl: e.target.value }))}
                  placeholder="https://company.com/logo.png"
                />
              </div>

              <div className="space-y-2">
                <Label>Upload Logo</Label>
                <Input
                  type="file"
                  ref={fileInputRef}
                  onChange={e => handleLogoUpload(e.target.files)}
                  className="block w-full text-sm text-gray-500 dark:text-gray-400"
                />
                {uploadedLogo && (
                  <div className="mt-2">
                    <p className="text-sm text-slate-600 dark:text-slate-400">Uploaded Logo: {uploadedLogo}</p>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={handleAddCompanyCancel}>Cancel</Button>
              <Button variant="outline" size="sm" className="text-blue-600" onClick={handleAddCompanyConfirm}>
                Add Company
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Claim Company Dialog */}
      {isClaimDialogOpen && (
        <Dialog open={isClaimDialogOpen} onOpenChange={() => setIsClaimDialogOpen(false)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Claim Company</DialogTitle>
              <DialogDescription>
                The company "{newCompanyForm.name}" is trying to claim the existing company "{claimingCompany?.name}".
                Do you want to connect them?
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label>Company Name</Label>
                <Input
                  type="text"
                  value={newCompanyForm.name}
                  onChange={e => setNewCompanyForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., ACME PropFirm"
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={newCompanyForm.description}
                  onChange={e => setNewCompanyForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the company"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Website</Label>
                <Input
                  type="url"
                  value={newCompanyForm.website}
                  onChange={e => setNewCompanyForm(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://company.com"
                />
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select 
                  value={newCompanyForm.categories[0] || ""} 
                  onValueChange={(value) => setNewCompanyForm(prev => ({ ...prev, categories: [value] }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Country</Label>
                <Input
                  type="text"
                  value={newCompanyForm.country}
                  onChange={e => setNewCompanyForm(prev => ({ ...prev, country: e.target.value }))}
                  placeholder="e.g., United States"
                />
              </div>

              <div className="space-y-2">
                <Label>Contact Email</Label>
                <Input
                  type="email"
                  value={newCompanyForm.contactEmail}
                  onChange={e => setNewCompanyForm(prev => ({ ...prev, contactEmail: e.target.value }))}
                  placeholder="contact@company.com"
                />
              </div>

              <div className="space-y-2">
                <Label>Contact Phone</Label>
                <Input
                  type="tel"
                  value={newCompanyForm.contactPhone}
                  onChange={e => setNewCompanyForm(prev => ({ ...prev, contactPhone: e.target.value }))}
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div className="space-y-2">
                <Label>Logo URL</Label>
                <Input
                  type="url"
                  value={newCompanyForm.logoUrl}
                  onChange={e => setNewCompanyForm(prev => ({ ...prev, logoUrl: e.target.value }))}
                  placeholder="https://company.com/logo.png"
                />
              </div>

              <div className="space-y-2">
                <Label>Upload Logo</Label>
                <Input
                  type="file"
                  ref={fileInputRef}
                  onChange={e => handleLogoUpload(e.target.files)}
                  className="block w-full text-sm text-gray-500 dark:text-gray-400"
                />
                {uploadedLogo && (
                  <div className="mt-2">
                    <p className="text-sm text-slate-600 dark:text-slate-400">Uploaded Logo: {uploadedLogo}</p>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={handleCreateNewCompany}>Create New Company</Button>
              <Button variant="outline" size="sm" className="text-blue-600" onClick={handleConnectToExisting}>
                Connect to Existing
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function getStatusBadge(status: CompanyStatus) {
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
      return <Badge className="bg-blue-500 hover:bg-blue-600"><Building2 className="w-3 h-3 mr-1" />Admin Created</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function handleLogoUpload(files: FileList | null) {
  if (files && files.length > 0) {
    const file = files[0];
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target) {
          const dataUrl = e.target.result as string;
          setUploadedLogo(dataUrl);
          setNewCompanyForm(prev => ({ ...prev, logoUrl: dataUrl }));
        }
      };
      reader.readAsDataURL(file);
    }
  }
}

function handleCategoryToggle(category: string) {
  setNewCompanyForm(prev => ({
    ...prev,
    categories: prev.categories.includes(category)
      ? prev.categories.filter(c => c !== category)
      : [...prev.categories, category]
  }));
}

function handleAddCompanyConfirm() {
  const { name, description, website, categories, country, contactEmail, contactPhone, logoUrl, status } = newCompanyForm;
  if (name && contactEmail && website && categories.length > 0) {
    onAddCompany?.({
      name,
      description,
      website,
      categories,
      country,
      contactEmail,
      contactPhone,
      logoUrl: uploadedLogo || logoUrl,
      status
    });
    setIsAddDialogOpen(false);
    setNewCompanyForm({
      name: '',
      description: '',
      website: '',
      categories: [] as string[],
      country: '',
      contactEmail: '',
      contactPhone: '',
      logoUrl: '',
      status: 'admin_created' as CompanyStatus
    });
    setFormErrors({
      name: '',
      contactEmail: '',
      website: '',
      categories: ''
    });
    setUploadedLogo(null);
    setPotentialMatches([]);
  } else {
    setFormErrors({
      name: !name ? 'Name is required' : '',
      contactEmail: !contactEmail ? 'Email is required' : '',
      website: !website ? 'Website is required' : '',
      categories: !categories.length ? 'At least one category is required' : ''
    });
  }
}

function handleAddCompanyCancel() {
  setIsAddDialogOpen(false);
  setNewCompanyForm({
    name: '',
    description: '',
    website: '',
    categories: [] as string[],
    country: '',
    contactEmail: '',
    contactPhone: '',
    logoUrl: '',
    status: 'admin_created' as CompanyStatus
  });
  setFormErrors({
    name: '',
    contactEmail: '',
    website: '',
    categories: ''
  });
  setUploadedLogo(null);
  setPotentialMatches([]);
}