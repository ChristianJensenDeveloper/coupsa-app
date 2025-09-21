import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { Switch } from "./ui/switch";
import { Checkbox } from "./ui/checkbox";
import { Shield, Globe, Plus, Edit, Trash2, Info, Eye, EyeOff, Search, CheckCircle, AlertTriangle, Building2 } from "lucide-react";
import { toast } from "sonner@2.0.3";

interface ComplianceRule {
  id: string;
  companyName: string;
  offerName: string;
  allowedRegions: string[];
  blockedRegions: string[];
  regulationTag: 'Regulated' | 'Unregulated' | 'Unknown';
  status: 'Active' | 'Paused';
  lastUpdated: string;
}

// Mock compliance rules data - focusing on blocked regions since global is default
const mockComplianceRules: ComplianceRule[] = [
  {
    id: '1',
    companyName: 'FTMO',
    offerName: '30% off Challenge Fee',
    allowedRegions: [], // Empty means global by default
    blockedRegions: ['USA'], // Only block specific regions
    regulationTag: 'Regulated',
    status: 'Active',
    lastUpdated: '2025-01-02'
  },
  {
    id: '2',
    companyName: 'TopStep',
    offerName: 'Free Trial Week',
    allowedRegions: [], // Global by default
    blockedRegions: [], // No restrictions
    regulationTag: 'Regulated',
    status: 'Active',
    lastUpdated: '2025-01-01'
  },
  {
    id: '3',
    companyName: 'IC Markets',
    offerName: '$100 Welcome Credit',
    allowedRegions: [], // Global by default
    blockedRegions: ['USA', 'Canada'], // Block specific regions
    regulationTag: 'Regulated',
    status: 'Paused',
    lastUpdated: '2024-12-30'
  },
  {
    id: '4',
    companyName: 'PropTrader Elite',
    offerName: '90% Off CFD Challenge Fee',
    allowedRegions: [], // Global by default
    blockedRegions: ['USA', 'Canada'], // Block high-risk regions
    regulationTag: 'Unregulated',
    status: 'Active',
    lastUpdated: '2024-12-28'
  }
];

const regions = [
  'Global', 'USA', 'Europe', 'Asia', 'LATAM', 'Canada', 'Australia', 'UK', 'Middle East', 'Africa'
];

const companies = [
  'FTMO', 'TopStep', 'PropTrader Elite', 'IC Markets', 'Pepperstone', 'XM Trading', 
  'Apex Trader', 'SurgeTrader', 'Elite Traders Fund', 'TradeMaster'
];

export function AdminCompliance() {
  const [complianceRules, setComplianceRules] = useState<ComplianceRule[]>(mockComplianceRules);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<ComplianceRule | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formData, setFormData] = useState({
    companyName: '',
    offerName: '',
    allowedRegions: [] as string[],
    blockedRegions: [] as string[],
    regulationTag: 'Unknown' as 'Regulated' | 'Unregulated' | 'Unknown',
    status: 'Active' as 'Active' | 'Paused',
    applyToAllOffers: false
  });

  const filteredRules = complianceRules.filter(rule => 
    rule.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rule.offerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rule.allowedRegions.some(region => region.toLowerCase().includes(searchQuery.toLowerCase())) ||
    rule.blockedRegions.some(region => region.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const activeRules = complianceRules.filter(rule => rule.status === 'Active').length;
  const pausedRules = complianceRules.filter(rule => rule.status === 'Paused').length;
  const regulatedOffers = complianceRules.filter(rule => rule.regulationTag === 'Regulated').length;
  const unregulatedOffers = complianceRules.filter(rule => rule.regulationTag === 'Unregulated').length;

  const resetForm = () => {
    setFormData({
      companyName: '',
      offerName: '',
      allowedRegions: [],
      blockedRegions: [],
      regulationTag: 'Unknown',
      status: 'Active',
      applyToAllOffers: false
    });
  };

  const handleCreateRule = () => {
    if (!formData.companyName || !formData.offerName) {
      toast.error("Please fill in required fields");
      return;
    }

    const newRule: ComplianceRule = {
      id: Date.now().toString(),
      companyName: formData.companyName,
      offerName: formData.offerName,
      allowedRegions: formData.allowedRegions,
      blockedRegions: formData.blockedRegions,
      regulationTag: formData.regulationTag,
      status: formData.status,
      lastUpdated: new Date().toISOString().slice(0, 10)
    };

    setComplianceRules(prev => [...prev, newRule]);
    resetForm();
    setIsCreateDialogOpen(false);
    toast.success("Compliance rule created successfully");
  };

  const handleEditRule = (rule: ComplianceRule) => {
    setEditingRule(rule);
    setFormData({
      companyName: rule.companyName,
      offerName: rule.offerName,
      allowedRegions: rule.allowedRegions,
      blockedRegions: rule.blockedRegions,
      regulationTag: rule.regulationTag,
      status: rule.status,
      applyToAllOffers: false
    });
  };

  const handleUpdateRule = () => {
    if (!editingRule || !formData.companyName || !formData.offerName) {
      toast.error("Please fill in required fields");
      return;
    }

    const updatedRule: ComplianceRule = {
      ...editingRule,
      companyName: formData.companyName,
      offerName: formData.offerName,
      allowedRegions: formData.allowedRegions,
      blockedRegions: formData.blockedRegions,
      regulationTag: formData.regulationTag,
      status: formData.status,
      lastUpdated: new Date().toISOString().slice(0, 10)
    };

    setComplianceRules(prev => prev.map(rule => 
      rule.id === editingRule.id ? updatedRule : rule
    ));

    resetForm();
    setEditingRule(null);
    toast.success("Compliance rule updated successfully");
  };

  const handleDeleteRule = (ruleId: string) => {
    setComplianceRules(prev => prev.filter(rule => rule.id !== ruleId));
    toast.success("Compliance rule deleted successfully");
  };

  const handleToggleStatus = (ruleId: string) => {
    setComplianceRules(prev => prev.map(rule => 
      rule.id === ruleId 
        ? { ...rule, status: rule.status === 'Active' ? 'Paused' : 'Active', lastUpdated: new Date().toISOString().slice(0, 10) }
        : rule
    ));
  };

  const handleRegionToggle = (region: string, type: 'allowed' | 'blocked') => {
    if (type === 'allowed') {
      setFormData(prev => ({
        ...prev,
        allowedRegions: prev.allowedRegions.includes(region)
          ? prev.allowedRegions.filter(r => r !== region)
          : [...prev.allowedRegions, region],
        // Remove from blocked if adding to allowed (they're mutually exclusive)
        blockedRegions: prev.allowedRegions.includes(region) 
          ? prev.blockedRegions 
          : prev.blockedRegions.filter(r => r !== region)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        blockedRegions: prev.blockedRegions.includes(region)
          ? prev.blockedRegions.filter(r => r !== region)
          : [...prev.blockedRegions, region],
        // Remove from allowed if adding to blocked (blocked takes precedence)
        allowedRegions: prev.blockedRegions.includes(region)
          ? prev.allowedRegions
          : prev.allowedRegions.filter(r => r !== region)
      }));
    }
  };

  const getRegulationBadgeColor = (tag: string) => {
    switch (tag) {
      case 'Regulated':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'Unregulated':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    return status === 'Active' 
      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent flex items-center gap-2">
              <Shield className="w-6 h-6 text-blue-500" />
              Compliance
            </h2>
            <p className="text-slate-600 dark:text-slate-400 font-medium">All offers are globally visible by default. Add restrictions to block specific regions where needed.</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg border-0 rounded-xl">
                <Plus className="w-4 h-4" />
                Add Rule
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-700/30 shadow-lg rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                  <Eye className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{activeRules}</div>
                  <div className="text-sm text-muted-foreground">Active Rules</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-700/30 shadow-lg rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-500 rounded-xl flex items-center justify-center">
                  <EyeOff className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{pausedRules}</div>
                  <div className="text-sm text-muted-foreground">Paused Rules</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-700/30 shadow-lg rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{regulatedOffers}</div>
                  <div className="text-sm text-muted-foreground">Regulated Offers</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-700/30 shadow-lg rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{unregulatedOffers}</div>
                  <div className="text-sm text-muted-foreground">Unregulated Offers</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-700/30 shadow-lg rounded-2xl">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by company, offer, or region..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 rounded-xl"
              />
            </div>
          </CardContent>
        </Card>

        {/* Compliance Rules Table */}
        <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-700/30 shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Compliance Rules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-white/20 dark:border-slate-700/30 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Offer</TableHead>
                    <TableHead>Visibility</TableHead>
                    <TableHead>Blocked Regions</TableHead>
                    <TableHead>Regulation</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell className="font-medium">{rule.companyName}</TableCell>
                      <TableCell className="max-w-xs truncate">{rule.offerName}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {rule.allowedRegions.length > 0 ? (
                            rule.allowedRegions.map((region) => (
                              <Badge key={region} variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700/30">
                                {region}
                              </Badge>
                            ))
                          ) : (
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">Global</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {rule.blockedRegions.length > 0 ? (
                            rule.blockedRegions.map((region) => (
                              <Badge key={region} variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700/30">
                                {region}
                              </Badge>
                            ))
                          ) : (
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-sm text-green-600 dark:text-green-400">No restrictions</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRegulationBadgeColor(rule.regulationTag)}>
                          {rule.regulationTag}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusBadgeColor(rule.status)}>
                            {rule.status}
                          </Badge>
                          <Switch
                            checked={rule.status === 'Active'}
                            onCheckedChange={() => handleToggleStatus(rule.id)}
                            size="sm"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditRule(rule)}
                            className="rounded-xl"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteRule(rule.id)}
                            className="text-destructive hover:text-destructive rounded-xl"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredRules.length === 0 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                  No compliance rules found
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  Create your first compliance rule to control offer visibility.
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)} variant="outline" className="rounded-xl">
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Rule
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Example Use Cases */}
        <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-700/30 shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Example Use Cases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="font-semibold text-blue-900 dark:text-blue-100">Global by Default</span>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  All offers are visible worldwide unless you add specific regional restrictions.
                </p>
              </div>
              
              <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="font-semibold text-red-900 dark:text-red-100">Block High-Risk Regions</span>
                </div>
                <p className="text-sm text-red-700 dark:text-red-300">
                  Block Forex broker ads in <strong>USA/Canada</strong> due to regulatory restrictions.
                </p>
              </div>
              
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="font-semibold text-orange-900 dark:text-orange-100">Track Regulation Status</span>
                </div>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  Tag offers as <strong>Regulated/Unregulated</strong> for internal awareness and risk management.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Create/Edit Rule Dialog */}
        <Dialog open={isCreateDialogOpen || !!editingRule} onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false);
            setEditingRule(null);
            resetForm();
          }
        }}>
          <DialogContent className="max-w-2xl rounded-2xl border-0 shadow-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent">
                {editingRule ? 'Edit Compliance Rule' : 'Add Compliance Rule'}
              </DialogTitle>
              <DialogDescription className="text-slate-600 dark:text-slate-400">
                This offer is visible globally by default. Add regional restrictions below if needed. We only manage visibility, not transactions.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="companySelect">Company Name *</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-3 h-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Select the company this rule applies to.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Select value={formData.companyName} onValueChange={(value) => setFormData(prev => ({ ...prev, companyName: value }))}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select company..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {companies.map((company) => (
                        <SelectItem key={company} value={company}>
                          {company}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="offerName">Offer Name *</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-3 h-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Name of the specific offer or deal this rule applies to.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="offerName"
                    value={formData.offerName}
                    onChange={(e) => setFormData(prev => ({ ...prev, offerName: e.target.value }))}
                    placeholder="e.g., 30% off Challenge Fee"
                    className="rounded-xl"
                  />
                </div>
              </div>

              {/* Global visibility indicator */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700/30">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="font-semibold text-blue-900 dark:text-blue-100">Default: Global Visibility</span>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  This offer will be visible to users worldwide unless you add specific regional restrictions below.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Label>Blocked Regions (Primary Control)</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-3 h-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Select regions where this offer should NOT be visible. This is the main control for compliance.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-700/30">
                    {regions.filter(region => region !== 'Global').map((region) => (
                      <div key={region} className="flex items-center space-x-2">
                        <Checkbox
                          id={`blocked-${region}`}
                          checked={formData.blockedRegions.includes(region)}
                          onCheckedChange={() => handleRegionToggle(region, 'blocked')}
                        />
                        <Label htmlFor={`blocked-${region}`} className="text-sm">{region}</Label>
                      </div>
                    ))}
                  </div>
                  {formData.blockedRegions.length === 0 && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                      No regions blocked - offer visible globally
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Label>Restrict to Specific Regions (Advanced)</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-3 h-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Advanced: Only show in selected regions. If none selected, offer remains globally visible (except blocked regions above).</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-700/30">
                    {regions.filter(region => region !== 'Global').map((region) => (
                      <div key={region} className="flex items-center space-x-2">
                        <Checkbox
                          id={`allowed-${region}`}
                          checked={formData.allowedRegions.includes(region)}
                          onCheckedChange={() => handleRegionToggle(region, 'allowed')}
                        />
                        <Label htmlFor={`allowed-${region}`} className="text-sm">{region}</Label>
                      </div>
                    ))}
                  </div>
                  {formData.allowedRegions.length === 0 && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                      No restrictions - using global visibility
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label>Regulation Tag</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-3 h-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Mark the regulatory status for internal tracking. This doesn't affect visibility.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Select value={formData.regulationTag} onValueChange={(value: 'Regulated' | 'Unregulated' | 'Unknown') => setFormData(prev => ({ ...prev, regulationTag: value }))}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="Regulated">Regulated</SelectItem>
                      <SelectItem value="Unregulated">Unregulated</SelectItem>
                      <SelectItem value="Unknown">Unknown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={(value: 'Active' | 'Paused') => setFormData(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Paused">Paused</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Summary of current settings */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                <div className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">
                  Current Visibility Settings:
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  {formData.blockedRegions.length === 0 && formData.allowedRegions.length === 0 && (
                    <span className="text-blue-600 dark:text-blue-400 font-medium">🌍 Visible globally (default)</span>
                  )}
                  {formData.blockedRegions.length > 0 && formData.allowedRegions.length === 0 && (
                    <span>🌍 Visible globally, <span className="text-red-600 dark:text-red-400 font-medium">blocked in: {formData.blockedRegions.join(', ')}</span></span>
                  )}
                  {formData.allowedRegions.length > 0 && (
                    <span><span className="text-green-600 dark:text-green-400 font-medium">Only visible in: {formData.allowedRegions.join(', ')}</span></span>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-700/30">
                <Checkbox
                  id="applyToAllOffers"
                  checked={formData.applyToAllOffers}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, applyToAllOffers: !!checked }))}
                />
                <Label htmlFor="applyToAllOffers" className="text-sm">
                  Apply to All Offers from This Company
                </Label>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-3 h-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">When checked, these regional restrictions will apply to all current and future offers from this company.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsCreateDialogOpen(false);
                setEditingRule(null);
                resetForm();
              }} className="rounded-xl">
                Cancel
              </Button>
              <Button onClick={editingRule ? handleUpdateRule : handleCreateRule} className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg border-0 rounded-xl">
                {editingRule ? 'Update Rule' : 'Create Rule'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}