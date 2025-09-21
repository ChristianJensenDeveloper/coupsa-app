import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { Plus, Search, Edit, Trash2, Building2, Upload, Eye, ExternalLink, Copy, TrendingUp, Briefcase, PieChart, AlertCircle, ImageIcon, Calendar, Clock, Users, BarChart3, CheckCircle, XCircle, Ticket } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { Firm, AdminDeal } from "./types";

interface FirmsManagerProps {
  firms: Firm[];
  deals: AdminDeal[];
  onCreateFirm: (firm: Omit<Firm, 'id'>) => void;
  onUpdateFirm: (firm: Firm) => void;
  onDeleteFirm: (firmId: string) => void;
}

export function FirmsManager({ firms, deals, onCreateFirm, onUpdateFirm, onDeleteFirm }: FirmsManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'All' | 'CFD Prop' | 'Futures Prop' | 'Broker'>('All');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingFirm, setEditingFirm] = useState<Firm | null>(null);
  const [deletingFirm, setDeletingFirm] = useState<Firm | null>(null);
  const [viewingFirm, setViewingFirm] = useState<Firm | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    affiliateLink: '',
    couponCode: '',
    category: 'CFD Prop' as 'CFD Prop' | 'Futures Prop' | 'Broker'
  });

  const [formErrors, setFormErrors] = useState({
    name: '',
    affiliateLink: '',
    couponCode: ''
  });

  const filteredFirms = firms.filter(firm => {
    const matchesSearch = firm.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || firm.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Calculate metrics
  const totalFirms = firms.length;
  const cfdProps = firms.filter(f => f.category === 'CFD Prop').length;
  const futuresProps = firms.filter(f => f.category === 'Futures Prop').length;
  const brokers = firms.filter(f => f.category === 'Broker').length;
  const activeFirms = firms.filter(f => f.status === 'Active').length;

  const validateForm = () => {
    const errors = { name: '', affiliateLink: '', couponCode: '' };
    let isValid = true;

    if (!formData.name.trim()) {
      errors.name = 'Company name is required';
      isValid = false;
    }

    if (!formData.affiliateLink.trim()) {
      errors.affiliateLink = 'Affiliate link is required';
      isValid = false;
    } else if (!formData.affiliateLink.startsWith('http://') && !formData.affiliateLink.startsWith('https://')) {
      errors.affiliateLink = 'Please enter a valid URL (must start with http:// or https://)';
      isValid = false;
    }

    // Coupon code is now optional - no validation required

    setFormErrors(errors);
    return isValid;
  };

  const resetForm = () => {
    setFormData({
      name: '',
      logo: '',
      affiliateLink: '',
      couponCode: '',
      category: 'CFD Prop'
    });
    setFormErrors({ name: '', affiliateLink: '', couponCode: '' });
  };

  const handleCreateFirm = () => {
    if (!validateForm()) {
      return;
    }

    const newFirm = {
      name: formData.name.trim(),
      logo: formData.logo.trim() || undefined,
      affiliateLink: formData.affiliateLink.trim(),
      couponCode: formData.couponCode.trim().toUpperCase() || '', // Allow empty coupon code
      category: formData.category,
      createdAt: new Date().toISOString(),
      status: 'Active' as const
    };

    onCreateFirm(newFirm);
    resetForm();
    setIsCreateDialogOpen(false);
    toast.success("Firm created successfully");
  };

  const handleEditFirm = (firm: Firm) => {
    setEditingFirm(firm);
    setFormData({
      name: firm.name,
      logo: firm.logo || '',
      affiliateLink: firm.affiliateLink,
      couponCode: firm.couponCode,
      category: firm.category
    });
    setFormErrors({ name: '', affiliateLink: '', couponCode: '' });
  };

  const handleUpdateFirm = () => {
    if (!validateForm() || !editingFirm) {
      return;
    }

    const updatedFirm = {
      ...editingFirm,
      name: formData.name.trim(),
      logo: formData.logo.trim() || undefined,
      affiliateLink: formData.affiliateLink.trim(),
      couponCode: formData.couponCode.trim().toUpperCase() || '', // Allow empty coupon code
      category: formData.category
    };

    onUpdateFirm(updatedFirm);
    resetForm();
    setEditingFirm(null);
    toast.success("Firm updated successfully");
  };

  const handleDeleteFirm = (firm: Firm) => {
    setDeletingFirm(firm);
  };

  const confirmDeleteFirm = () => {
    if (deletingFirm) {
      onDeleteFirm(deletingFirm.id);
      setDeletingFirm(null);
      toast.success("Firm deleted successfully");
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real app, you would upload this to a file storage service
      // For now, we'll just simulate with a placeholder URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({ ...prev, logo: e.target?.result as string }));
        toast.success("Logo uploaded successfully");
      };
      reader.readAsDataURL(file);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard`);
  };

  // Calculate deals count for each firm
  const getDealsCount = (firmId: string) => {
    const firmDeals = deals.filter(deal => deal.firmId === firmId);
    const activeDeals = firmDeals.filter(deal => deal.status === 'Published' && new Date(deal.endDate) > new Date());
    const expiredDeals = firmDeals.filter(deal => new Date(deal.endDate) <= new Date());
    return {
      total: firmDeals.length,
      active: activeDeals.length,
      expired: expiredDeals.length,
      draft: firmDeals.filter(deal => deal.status === 'Draft').length
    };
  };

  // Get sample deals for a firm
  const getFirmDeals = (firmId: string) => {
    return deals.filter(deal => deal.firmId === firmId);
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Firms Management</h2>
            <p className="text-muted-foreground">Manage propfirm and broker partners</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
            setIsCreateDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Firm
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
              <DialogHeader className="flex-shrink-0">
                <DialogTitle>Add New Firm</DialogTitle>
                <DialogDescription>
                  Add a new propfirm or broker partner to the platform. All fields marked with * are required.
                </DialogDescription>
              </DialogHeader>
              
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-6 pb-4">
                  {/* Company Name */}
                  <div className="space-y-2">
                    <Label htmlFor="firmName">Company Name *</Label>
                    <Input
                      id="firmName"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., FTMO, TopStep, IC Markets"
                      className={formErrors.name ? "border-red-500" : ""}
                    />
                    {formErrors.name && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {formErrors.name}
                      </p>
                    )}
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.category} onValueChange={(value: 'CFD Prop' | 'Futures Prop' | 'Broker') => 
                      setFormData(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select firm category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CFD Prop">CFD Prop Firm</SelectItem>
                        <SelectItem value="Futures Prop">Futures Prop Firm</SelectItem>
                        <SelectItem value="Broker">Broker</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Logo Upload */}
                  <div className="space-y-2">
                    <Label htmlFor="firmLogo">Company Logo</Label>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <Input
                          id="firmLogo"
                          value={formData.logo}
                          onChange={(e) => setFormData(prev => ({ ...prev, logo: e.target.value }))}
                          placeholder="Enter logo URL or upload file"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="shrink-0"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload
                      </Button>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    {formData.logo && (
                      <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                        <ImageIcon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm truncate">{formData.logo}</span>
                      </div>
                    )}
                  </div>

                  {/* Affiliate Link */}
                  <div className="space-y-2">
                    <Label htmlFor="affiliateLink">Affiliate Link *</Label>
                    <Input
                      id="affiliateLink"
                      value={formData.affiliateLink}
                      onChange={(e) => setFormData(prev => ({ ...prev, affiliateLink: e.target.value }))}
                      placeholder="https://partner.com/signup?ref=coupza"
                      className={formErrors.affiliateLink ? "border-red-500" : ""}
                    />
                    {formErrors.affiliateLink && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {formErrors.affiliateLink}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      The URL users will be redirected to when clicking "Go To Offer"
                    </p>
                  </div>

                  {/* Coupon Code */}
                  <div className="space-y-2">
                    <Label htmlFor="couponCode">Default Coupon Code</Label>
                    <Input
                      id="couponCode"
                      value={formData.couponCode}
                      onChange={(e) => setFormData(prev => ({ ...prev, couponCode: e.target.value.toUpperCase() }))}
                      placeholder="COUPZA20 (Optional)"
                      className={formErrors.couponCode ? "border-red-500" : ""}
                    />
                    {formErrors.couponCode && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {formErrors.couponCode}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Optional: Leave empty if you only have affiliate links without coupon codes. Deals from this firm will automatically show only "Claim Deal" button.
                    </p>
                  </div>
                </div>
              </ScrollArea>

              <DialogFooter className="flex-shrink-0">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateFirm} className="bg-blue-600 hover:bg-blue-700">
                  Create Firm
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Building2 className="w-8 h-8 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold">{totalFirms}</div>
                  <div className="text-sm text-muted-foreground">Total Firms</div>
                </div>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                {activeFirms} active • {totalFirms - activeFirms} inactive
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-green-600" />
                <div>
                  <div className="text-2xl font-bold">{cfdProps}</div>
                  <div className="text-sm text-muted-foreground">CFD Props</div>
                </div>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                {totalFirms > 0 ? Math.round((cfdProps / totalFirms) * 100) : 0}% of total firms
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <PieChart className="w-8 h-8 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold">{futuresProps}</div>
                  <div className="text-sm text-muted-foreground">Futures Props</div>
                </div>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                {totalFirms > 0 ? Math.round((futuresProps / totalFirms) * 100) : 0}% of total firms
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Briefcase className="w-8 h-8 text-orange-600" />
                <div>
                  <div className="text-2xl font-bold">{brokers}</div>
                  <div className="text-sm text-muted-foreground">Brokers</div>
                </div>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                {totalFirms > 0 ? Math.round((brokers / totalFirms) * 100) : 0}% of total firms
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search firms by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={(value: 'All' | 'CFD Prop' | 'Futures Prop' | 'Broker') => 
                setCategoryFilter(value)}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Categories</SelectItem>
                  <SelectItem value="CFD Prop">CFD Prop Firms</SelectItem>
                  <SelectItem value="Futures Prop">Futures Prop Firms</SelectItem>
                  <SelectItem value="Broker">Brokers</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Firms Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>All Firms ({filteredFirms.length})</span>
              <Badge variant="secondary" className="text-xs">
                {filteredFirms.length} of {totalFirms}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Logo</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Deals</TableHead>
                    <TableHead>Coupon Code</TableHead>
                    <TableHead>Affiliate Link</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFirms.map((firm) => (
                    <TableRow key={firm.id}>
                      <TableCell>
                        {firm.logo ? (
                          <img src={firm.logo} alt={firm.name} className="w-10 h-10 rounded-lg object-cover border" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center border">
                            <Building2 className="w-5 h-5 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{firm.name}</div>
                          <div className="text-xs text-muted-foreground">
                            Added {new Date(firm.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="secondary"
                          className={
                            firm.category === 'CFD Prop' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            firm.category === 'Futures Prop' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                            'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                          }
                        >
                          {firm.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {(() => {
                          const dealsCounts = getDealsCount(firm.id);
                          return (
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">{dealsCounts.total}</span>
                                <span className="text-xs text-muted-foreground">total</span>
                              </div>
                              <div className="flex items-center gap-3 text-xs">
                                <div className="flex items-center gap-1">
                                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                  <span>{dealsCounts.active} active</span>
                                </div>
                                {dealsCounts.expired > 0 && (
                                  <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                                    <span>{dealsCounts.expired} expired</span>
                                  </div>
                                )}
                                {dealsCounts.draft > 0 && (
                                  <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                    <span>{dealsCounts.draft} draft</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })()}
                      </TableCell>
                      <TableCell>
                        {firm.couponCode ? (
                          <div className="flex items-center gap-2">
                            <code className="bg-muted px-2 py-1 rounded text-xs font-mono">
                              {firm.couponCode}
                            </code>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(firm.couponCode, 'Coupon code')}
                                  className="p-1 h-6 w-6"
                                >
                                  <Copy className="w-3 h-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Copy coupon code</TooltipContent>
                            </Tooltip>
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground italic">
                            Affiliate only
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 max-w-48">
                          <span className="truncate text-sm text-muted-foreground">
                            {firm.affiliateLink}
                          </span>
                          <div className="flex gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(firm.affiliateLink, 'Affiliate link')}
                                  className="p-1 h-6 w-6"
                                >
                                  <Copy className="w-3 h-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Copy link</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.open(firm.affiliateLink, '_blank')}
                                  className="p-1 h-6 w-6"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Open link</TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={
                            firm.status === 'Active' 
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                              : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                          }
                        >
                          {firm.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setViewingFirm(firm)}
                                className="p-2 h-8 w-8"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>View deals</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditFirm(firm)}
                                className="p-2 h-8 w-8"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit firm</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteFirm(firm)}
                                className="p-2 h-8 w-8 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Delete firm</TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredFirms.length === 0 && (
              <div className="text-center py-12">
                <Building2 className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No firms found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || categoryFilter !== 'All' 
                    ? "Try adjusting your search or filter criteria" 
                    : "Get started by adding your first firm"
                  }
                </p>
                {!searchQuery && categoryFilter === 'All' && (
                  <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Firm
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enhanced Edit Dialog */}
        <Dialog open={!!editingFirm} onOpenChange={(open) => {
          if (!open) {
            setEditingFirm(null);
            resetForm();
          }
        }}>
          <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle>Edit Firm</DialogTitle>
              <DialogDescription>
                Update firm information. All fields marked with * are required.
              </DialogDescription>
            </DialogHeader>
            
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-6 pb-4">
                {/* Company Name */}
                <div className="space-y-2">
                  <Label htmlFor="editFirmName">Company Name *</Label>
                  <Input
                    id="editFirmName"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., FTMO, TopStep, IC Markets"
                    className={formErrors.name ? "border-red-500" : ""}
                  />
                  {formErrors.name && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {formErrors.name}
                    </p>
                  )}
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="editCategory">Category *</Label>
                  <Select value={formData.category} onValueChange={(value: 'CFD Prop' | 'Futures Prop' | 'Broker') => 
                    setFormData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select firm category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CFD Prop">CFD Prop Firm</SelectItem>
                      <SelectItem value="Futures Prop">Futures Prop Firm</SelectItem>
                      <SelectItem value="Broker">Broker</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Logo Upload */}
                <div className="space-y-2">
                  <Label htmlFor="editFirmLogo">Company Logo</Label>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <Input
                        id="editFirmLogo"
                        value={formData.logo}
                        onChange={(e) => setFormData(prev => ({ ...prev, logo: e.target.value }))}
                        placeholder="Enter logo URL or upload file"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="shrink-0"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </Button>
                  </div>
                  {formData.logo && (
                    <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                      <ImageIcon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm truncate">{formData.logo}</span>
                    </div>
                  )}
                </div>

                {/* Affiliate Link */}
                <div className="space-y-2">
                  <Label htmlFor="editAffiliateLink">Affiliate Link *</Label>
                  <Input
                    id="editAffiliateLink"
                    value={formData.affiliateLink}
                    onChange={(e) => setFormData(prev => ({ ...prev, affiliateLink: e.target.value }))}
                    placeholder="https://partner.com/signup?ref=coupza"
                    className={formErrors.affiliateLink ? "border-red-500" : ""}
                  />
                  {formErrors.affiliateLink && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {formErrors.affiliateLink}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    The URL users will be redirected to when clicking "Go To Offer"
                  </p>
                </div>

                {/* Coupon Code */}
                <div className="space-y-2">
                  <Label htmlFor="editCouponCode">Default Coupon Code</Label>
                  <Input
                    id="editCouponCode"
                    value={formData.couponCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, couponCode: e.target.value.toUpperCase() }))}
                    placeholder="COUPZA20 (Optional)"
                    className={formErrors.couponCode ? "border-red-500" : ""}
                  />
                  {formErrors.couponCode && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {formErrors.couponCode}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Optional: Leave empty if you only have affiliate links without coupon codes. Deals from this firm will automatically show only "Claim Deal" button.
                  </p>
                </div>
              </div>
            </ScrollArea>
            
            <DialogFooter className="flex-shrink-0">
              <Button variant="outline" onClick={() => setEditingFirm(null)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateFirm} className="bg-blue-600 hover:bg-blue-700">
                Update Firm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deletingFirm} onOpenChange={() => setDeletingFirm(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete "{deletingFirm?.name}" and all associated deals. 
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmDeleteFirm}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete Firm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Enhanced View Firm Details Dialog */}
        <Dialog open={!!viewingFirm} onOpenChange={() => setViewingFirm(null)}>
          <DialogContent className="sm:max-w-4xl max-h-[85vh] flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle className="flex items-center gap-3">
                {viewingFirm?.logo ? (
                  <img src={viewingFirm.logo} alt={viewingFirm.name} className="w-12 h-12 rounded-lg object-cover border" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center border">
                    <Building2 className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <div>{viewingFirm?.name}</div>
                  <Badge variant="secondary" className="text-xs mt-1">
                    {viewingFirm?.category}
                  </Badge>
                </div>
              </DialogTitle>
              <DialogDescription>
                Firm details and associated deals
              </DialogDescription>
            </DialogHeader>
            
            <ScrollArea className="flex-1 pr-4">
              {viewingFirm && (
                <div className="space-y-6 pb-4">
                  {/* Firm Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Affiliate Link</Label>
                      <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                        <span className="text-sm truncate flex-1">{viewingFirm.affiliateLink}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(viewingFirm.affiliateLink, 'Affiliate link')}
                          className="p-1 h-6 w-6"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(viewingFirm.affiliateLink, '_blank')}
                          className="p-1 h-6 w-6"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Coupon Code</Label>
                      <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                        <code className="text-sm font-mono flex-1">{viewingFirm.couponCode}</code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(viewingFirm.couponCode, 'Coupon code')}
                          className="p-1 h-6 w-6"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Status and Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground">Status</div>
                      <Badge className={viewingFirm.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {viewingFirm.status}
                      </Badge>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-lg font-semibold">{getDealsCount(viewingFirm.id).active}</div>
                      <div className="text-sm text-muted-foreground">Active Deals</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-lg font-semibold">{getDealsCount(viewingFirm.id).total}</div>
                      <div className="text-sm text-muted-foreground">Total Deals</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground">Added</div>
                      <div className="text-xs">{new Date(viewingFirm.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>

                  <Separator />

                  {/* Associated Deals */}
                  <div>
                    <h4 className="font-medium mb-4 flex items-center gap-2">
                      <Ticket className="w-4 h-4" />
                      Associated Deals ({getFirmDeals(viewingFirm.id).length})
                    </h4>
                    
                    {getFirmDeals(viewingFirm.id).length > 0 ? (
                      <div className="space-y-3">
                        {getFirmDeals(viewingFirm.id).map((deal) => (
                          <Card key={deal.id} className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h5 className="font-medium">{deal.title}</h5>
                                  <Badge 
                                    variant="secondary" 
                                    className={
                                      deal.category === 'CFD Prop' ? 'bg-green-100 text-green-800' :
                                      deal.category === 'Futures Prop' ? 'bg-purple-100 text-purple-800' :
                                      'bg-orange-100 text-orange-800'
                                    }
                                  >
                                    {deal.category}
                                  </Badge>
                                  {deal.hasVerificationBadge && (
                                    <Badge className="bg-blue-100 text-blue-800">
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      Verified
                                    </Badge>
                                  )}
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                  <div>
                                    <span className="text-muted-foreground">Discount:</span>
                                    <div className="font-medium">{deal.discountPercentage}% OFF</div>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Code:</span>
                                    <div className="font-mono text-xs bg-muted px-1 py-0.5 rounded inline-block">
                                      {deal.couponCode}
                                    </div>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Valid Until:</span>
                                    <div className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      {new Date(deal.endDate).toLocaleDateString()}
                                    </div>
                                  </div>
                                </div>
                                
                                {deal.cardNotes && (
                                  <div className="mt-2 text-sm text-muted-foreground">
                                    {deal.cardNotes}
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex flex-col items-end gap-2 ml-4">
                                <Badge 
                                  className={
                                    deal.status === 'Published' ? 'bg-green-100 text-green-800' :
                                    deal.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                                  }
                                >
                                  {deal.status}
                                </Badge>
                                
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Clock className="w-3 h-3" />
                                  {new Date(deal.endDate) > new Date() ? 'Active' : 'Expired'}
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="border border-dashed rounded-lg p-8 text-center">
                        <Ticket className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                        <h4 className="font-medium mb-2">No deals yet</h4>
                        <p className="text-sm text-muted-foreground mb-4">
                          This firm doesn't have any deals associated with it yet.
                        </p>
                        <Button variant="outline" size="sm">
                          <Plus className="w-4 h-4 mr-2" />
                          Create First Deal
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </ScrollArea>
            
            <DialogFooter className="flex-shrink-0">
              <Button variant="outline" onClick={() => setViewingFirm(null)}>
                Close
              </Button>
              <Button onClick={() => {
                if (viewingFirm) {
                  handleEditFirm(viewingFirm);
                  setViewingFirm(null);
                }
              }} className="bg-blue-600 hover:bg-blue-700">
                <Edit className="w-4 h-4 mr-2" />
                Edit Firm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}