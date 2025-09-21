import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { Plus, Edit, Trash2, DollarSign, TrendingUp, Calendar, Info, Building2, BarChart3, Calculator } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { Firm } from "./types";

interface RevenueEntry {
  id: string;
  firmId: string;
  startDate: string; // YYYY-MM-DD format
  endDate: string; // YYYY-MM-DD format
  revenue: number; // Total amount generated for the company
  commissionReceived: number; // The payout received from the company
  conversions: number; // Successful actions (funded account purchase, trading challenge signup, deposit)
  commissionRate: number; // Calculated: (Commission ÷ Revenue) × 100
  notes?: string;
}

interface RevenueManagerProps {
  firms: Firm[];
}

// Mock revenue data with updated structure
const mockRevenueData: RevenueEntry[] = [
  {
    id: '1',
    firmId: '1', // FTMO
    startDate: '2025-01-01',
    endDate: '2025-01-31',
    revenue: 45000, // Total amount generated for FTMO
    commissionReceived: 13500, // The payout received from FTMO
    conversions: 45, // Number of funded account purchases
    commissionRate: 30, // Calculated: (13500 ÷ 45000) × 100
    notes: 'Strong performance from CFD prop category - Q1 campaign'
  },
  {
    id: '2',
    firmId: '4', // TopStep
    startDate: '2025-01-01',
    endDate: '2025-01-31',
    revenue: 35000, // Total amount generated for TopStep
    commissionReceived: 8750, // The payout received from TopStep
    conversions: 28, // Number of trading challenge signups
    commissionRate: 25, // Calculated: (8750 ÷ 35000) × 100
    notes: 'Free trial campaign was successful - increased conversions'
  },
  {
    id: '3',
    firmId: '11', // IC Markets
    startDate: '2025-01-01',
    endDate: '2025-01-31',
    revenue: 41333, // Total amount generated for IC Markets
    commissionReceived: 6200, // The payout received from IC Markets
    conversions: 35, // Number of deposits
    commissionRate: 15, // Calculated: (6200 ÷ 41333) × 100
    notes: 'Welcome bonus drove good conversions - broker category strong'
  },
  {
    id: '4',
    firmId: '1', // FTMO
    startDate: '2024-12-01',
    endDate: '2024-12-31',
    revenue: 37333, // Total amount generated for FTMO
    commissionReceived: 11200, // The payout received from FTMO
    conversions: 38, // Number of funded account purchases
    commissionRate: 30, // Calculated: (11200 ÷ 37333) × 100
    notes: 'Holiday campaign performance - seasonal dip expected'
  },
  {
    id: '5',
    firmId: '4', // TopStep
    startDate: '2024-12-01',
    endDate: '2024-12-31',
    revenue: 29600, // Total amount generated for TopStep
    commissionReceived: 7400, // The payout received from TopStep
    conversions: 22, // Number of trading challenge signups
    commissionRate: 25, // Calculated: (7400 ÷ 29600) × 100
    notes: 'Lower activity during holidays - expected seasonal trend'
  },
  {
    id: '6',
    firmId: '2', // PropTrader Elite
    startDate: '2025-01-01',
    endDate: '2025-01-31',
    revenue: 22500, // Total amount generated for PropTrader Elite
    commissionReceived: 4500, // The payout received from PropTrader Elite
    conversions: 18, // Number of funded account purchases
    commissionRate: 20, // Calculated: (4500 ÷ 22500) × 100
    notes: 'New partnership, growing steadily - good potential'
  }
];

export function RevenueManager({ firms }: RevenueManagerProps) {
  const [revenueData, setRevenueData] = useState<RevenueEntry[]>(mockRevenueData);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<RevenueEntry | null>(null);
  const [selectedMonth, setSelectedMonth] = useState('2025-01');
  
  const [formData, setFormData] = useState({
    firmId: '',
    startDate: new Date().toISOString().slice(0, 7) + '-01', // First day of current month
    endDate: new Date().toISOString().slice(0, 7) + '-31', // Last day of current month
    revenue: '',
    commissionReceived: '',
    conversions: '',
    commissionRate: '', // Will be calculated automatically
    notes: ''
  });

  const getFirmName = (firmId: string) => {
    return firms.find(f => f.id === firmId)?.name || 'Unknown Firm';
  };

  const getCurrentMonthData = () => {
    return revenueData.filter(entry => {
      const entryMonth = entry.startDate.slice(0, 7); // Extract YYYY-MM
      return entryMonth === selectedMonth;
    });
  };

  const getTotalRevenue = (month?: string) => {
    const data = month ? revenueData.filter(e => e.startDate.slice(0, 7) === month) : revenueData;
    return data.reduce((sum, entry) => sum + entry.revenue, 0);
  };

  const getTotalCommissionReceived = (month?: string) => {
    const data = month ? revenueData.filter(e => e.startDate.slice(0, 7) === month) : revenueData;
    return data.reduce((sum, entry) => sum + entry.commissionReceived, 0);
  };

  const getTotalConversions = (month?: string) => {
    const data = month ? revenueData.filter(e => e.startDate.slice(0, 7) === month) : revenueData;
    return data.reduce((sum, entry) => sum + entry.conversions, 0);
  };

  const getAverageCommissionRate = (month?: string) => {
    const data = month ? revenueData.filter(e => e.startDate.slice(0, 7) === month) : revenueData;
    if (data.length === 0) return 0;
    const totalCommission = data.reduce((sum, entry) => sum + entry.commissionReceived, 0);
    const totalRevenue = data.reduce((sum, entry) => sum + entry.revenue, 0);
    return totalRevenue > 0 ? (totalCommission / totalRevenue) * 100 : 0;
  };

  const getMonthGrowth = () => {
    const currentMonth = selectedMonth;
    const [year, month] = currentMonth.split('-').map(Number);
    const prevMonth = month === 1 
      ? `${year - 1}-12` 
      : `${year}-${String(month - 1).padStart(2, '0')}`;
    
    const currentCommission = getTotalCommissionReceived(currentMonth);
    const previousCommission = getTotalCommissionReceived(prevMonth);
    
    if (previousCommission === 0) return 0;
    return ((currentCommission - previousCommission) / previousCommission) * 100;
  };

  // Calculate commission rate automatically
  const calculateCommissionRate = (revenue: string, commission: string) => {
    const revenueNum = parseFloat(revenue);
    const commissionNum = parseFloat(commission);
    if (revenueNum > 0 && commissionNum > 0) {
      return ((commissionNum / revenueNum) * 100).toFixed(2);
    }
    return '';
  };

  const handleCreateEntry = () => {
    if (!formData.firmId || !formData.startDate || !formData.endDate || !formData.revenue || !formData.commissionReceived || !formData.conversions) {
      toast.error("Please fill in all required fields");
      return;
    }

    const calculatedCommissionRate = calculateCommissionRate(formData.revenue, formData.commissionReceived);

    const newEntry: RevenueEntry = {
      id: Date.now().toString(),
      firmId: formData.firmId,
      startDate: formData.startDate,
      endDate: formData.endDate,
      revenue: parseFloat(formData.revenue),
      commissionReceived: parseFloat(formData.commissionReceived),
      conversions: parseInt(formData.conversions),
      commissionRate: parseFloat(calculatedCommissionRate) || 0,
      notes: formData.notes
    };

    setRevenueData(prev => [...prev, newEntry]);
    setFormData({
      firmId: '',
      startDate: new Date().toISOString().slice(0, 7) + '-01',
      endDate: new Date().toISOString().slice(0, 7) + '-31',
      revenue: '',
      commissionReceived: '',
      conversions: '',
      commissionRate: '',
      notes: ''
    });
    setIsCreateDialogOpen(false);
    toast.success("Revenue entry added successfully");
  };

  const handleEditEntry = (entry: RevenueEntry) => {
    setEditingEntry(entry);
    setFormData({
      firmId: entry.firmId,
      startDate: entry.startDate,
      endDate: entry.endDate,
      revenue: entry.revenue.toString(),
      commissionReceived: entry.commissionReceived.toString(),
      conversions: entry.conversions.toString(),
      commissionRate: entry.commissionRate.toString(),
      notes: entry.notes || ''
    });
  };

  const handleUpdateEntry = () => {
    if (!editingEntry || !formData.firmId || !formData.startDate || !formData.endDate || !formData.revenue || !formData.commissionReceived || !formData.conversions) {
      toast.error("Please fill in all required fields");
      return;
    }

    const calculatedCommissionRate = calculateCommissionRate(formData.revenue, formData.commissionReceived);

    const updatedEntry: RevenueEntry = {
      ...editingEntry,
      firmId: formData.firmId,
      startDate: formData.startDate,
      endDate: formData.endDate,
      revenue: parseFloat(formData.revenue),
      commissionReceived: parseFloat(formData.commissionReceived),
      conversions: parseInt(formData.conversions),
      commissionRate: parseFloat(calculatedCommissionRate) || 0,
      notes: formData.notes
    };

    setRevenueData(prev => prev.map(entry => 
      entry.id === editingEntry.id ? updatedEntry : entry
    ));
    
    setEditingEntry(null);
    setFormData({
      firmId: '',
      startDate: new Date().toISOString().slice(0, 7) + '-01',
      endDate: new Date().toISOString().slice(0, 7) + '-31',
      revenue: '',
      commissionReceived: '',
      conversions: '',
      commissionRate: '',
      notes: ''
    });
    toast.success("Revenue entry updated successfully");
  };

  const handleDeleteEntry = (entryId: string) => {
    setRevenueData(prev => prev.filter(entry => entry.id !== entryId));
    toast.success("Revenue entry deleted successfully");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatMonth = (monthString: string) => {
    const [year, month] = monthString.split('-');
    return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  const monthGrowth = getMonthGrowth();

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-blue-500" />
              Revenue Management
            </h2>
            <p className="text-slate-600 dark:text-slate-400 font-medium">Track commission earnings from propfirm partnerships</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-40 rounded-xl border-slate-200/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-0 shadow-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
                <SelectItem value="2025-01">January 2025</SelectItem>
                <SelectItem value="2024-12">December 2024</SelectItem>
                <SelectItem value="2024-11">November 2024</SelectItem>
                <SelectItem value="2024-10">October 2024</SelectItem>
              </SelectContent>
            </Select>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg border-0 rounded-xl">
                  <Plus className="w-4 h-4" />
                  Add Revenue Entry
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-700/30 shadow-lg rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium text-muted-foreground">Commission Received</span>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-3 h-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">The payout you receive from the company based on the revenue/conversions.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <DollarSign className="w-4 h-4 text-green-600" />
              </div>
              <div className="text-2xl font-bold">{formatCurrency(getTotalCommissionReceived(selectedMonth))}</div>
              <div className="text-xs text-muted-foreground">
                <span className={monthGrowth >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {monthGrowth >= 0 ? '+' : ''}{monthGrowth.toFixed(1)}%
                </span> vs last month
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-700/30 shadow-lg rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium text-muted-foreground">Conversions</span>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-3 h-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">A successful action defined by the company (e.g., funded account purchase, trading challenge signup, deposit) that generates revenue.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <TrendingUp className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-bold">{getTotalConversions(selectedMonth)}</div>
              <div className="text-xs text-muted-foreground">
                Successful actions
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-700/30 shadow-lg rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium text-muted-foreground">Total Revenue</span>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-3 h-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">The total amount generated for the company during the selected period.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <BarChart3 className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-bold">{formatCurrency(getTotalRevenue(selectedMonth))}</div>
              <div className="text-xs text-muted-foreground">
                Company revenue
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-700/30 shadow-lg rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium text-muted-foreground">Avg Commission Rate</span>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-3 h-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Calculated as (Commission ÷ Revenue) × 100. Note: Commission rates vary per company and may change based on performance tiers.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Calculator className="w-4 h-4 text-orange-600" />
              </div>
              <div className="text-2xl font-bold">{getAverageCommissionRate(selectedMonth).toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground">
                Dynamic rate
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Table */}
        <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-700/30 shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle>Revenue Entries for {formatMonth(selectedMonth)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Partner Firm</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>Conversions</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getCurrentMonthData().map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">{getFirmName(entry.firmId)}</TableCell>
                      <TableCell className="text-sm">
                        <div className="flex flex-col">
                          <span>{new Date(entry.startDate).toLocaleDateString()}</span>
                          <span className="text-muted-foreground">to {new Date(entry.endDate).toLocaleDateString()}</span>
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(entry.revenue)}</TableCell>
                      <TableCell className="font-semibold text-green-600">{formatCurrency(entry.commissionReceived)}</TableCell>
                      <TableCell>{entry.conversions}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{entry.commissionRate.toFixed(1)}%</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {entry.notes || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditEntry(entry)}
                            className="rounded-xl"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteEntry(entry.id)}
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

            {getCurrentMonthData().length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No revenue entries for {formatMonth(selectedMonth)}</p>
                <Button onClick={() => setIsCreateDialogOpen(true)} variant="outline" className="rounded-xl">
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Entry
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog open={isCreateDialogOpen || !!editingEntry} onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false);
            setEditingEntry(null);
            setFormData({
              firmId: '',
              startDate: new Date().toISOString().slice(0, 7) + '-01',
              endDate: new Date().toISOString().slice(0, 7) + '-31',
              revenue: '',
              commissionReceived: '',
              conversions: '',
              commissionRate: '',
              notes: ''
            });
          }
        }}>
          <DialogContent className="max-w-lg rounded-2xl border-0 shadow-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent">
                {editingEntry ? 'Edit Revenue Entry' : 'Add Revenue Entry'}
              </DialogTitle>
              <DialogDescription className="text-slate-600 dark:text-slate-400">
                {editingEntry ? 'Update the revenue information for this partner.' : 'Add revenue data from a propfirm partner with automatic commission rate calculation.'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="firmSelect">Company Name *</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-3 h-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Select the propfirm or broker partner for this revenue entry.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Select value={formData.firmId} onValueChange={(value) => setFormData(prev => ({ ...prev, firmId: value }))}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select a company..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {firms.map((firm) => (
                      <SelectItem key={firm.id} value={firm.id}>
                        {firm.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="startDateInput">Start Date *</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-3 h-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Beginning of the reporting period.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="startDateInput"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="endDateInput">End Date *</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-3 h-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">End of the reporting period.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="endDateInput"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="revenueInput">Revenue ($) *</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-3 h-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">The total amount generated for the company during the selected period.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="revenueInput"
                    type="number"
                    value={formData.revenue}
                    onChange={(e) => {
                      const newRevenue = e.target.value;
                      setFormData(prev => ({ 
                        ...prev, 
                        revenue: newRevenue,
                        commissionRate: calculateCommissionRate(newRevenue, prev.commissionReceived)
                      }));
                    }}
                    placeholder="45000"
                    min="0"
                    step="0.01"
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="commissionReceivedInput">Commission Received ($) *</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-3 h-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">The payout you receive from the company based on the revenue/conversions.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="commissionReceivedInput"
                    type="number"
                    value={formData.commissionReceived}
                    onChange={(e) => {
                      const newCommission = e.target.value;
                      setFormData(prev => ({ 
                        ...prev, 
                        commissionReceived: newCommission,
                        commissionRate: calculateCommissionRate(prev.revenue, newCommission)
                      }));
                    }}
                    placeholder="13500"
                    min="0"
                    step="0.01"
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="conversionsInput">Conversions *</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-3 h-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">A successful action defined by the company (e.g., funded account purchase, trading challenge signup, deposit) that generates revenue.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="conversionsInput"
                    type="number"
                    value={formData.conversions}
                    onChange={(e) => setFormData(prev => ({ ...prev, conversions: e.target.value }))}
                    placeholder="45"
                    min="0"
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="commissionRateInput">Commission Rate (%) *</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-3 h-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Calculated as (Commission ÷ Revenue) × 100. This is auto-calculated but can be manually adjusted as rates may vary per company and change based on performance tiers.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="relative">
                    <Input
                      id="commissionRateInput"
                      type="number"
                      value={formData.commissionRate}
                      onChange={(e) => setFormData(prev => ({ ...prev, commissionRate: e.target.value }))}
                      placeholder="30"
                      min="0"
                      max="100"
                      step="0.1"
                      className="rounded-xl pr-12"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Calculator className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Auto-calculated, manually adjustable</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notesInput">Notes</Label>
                <Input
                  id="notesInput"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Campaign performance notes, tier changes, etc..."
                  className="rounded-xl"
                />
              </div>

              {formData.revenue && formData.commissionReceived && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3">
                  <div className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                    Calculation Preview
                  </div>
                  <div className="text-xs text-blue-700 dark:text-blue-300">
                    Commission Rate = ({formatCurrency(parseFloat(formData.commissionReceived) || 0)} ÷ {formatCurrency(parseFloat(formData.revenue) || 0)}) × 100 = {formData.commissionRate}%
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsCreateDialogOpen(false);
                setEditingEntry(null);
              }} className="rounded-xl">
                Cancel
              </Button>
              <Button onClick={editingEntry ? handleUpdateEntry : handleCreateEntry} className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg border-0 rounded-xl">
                {editingEntry ? 'Update Entry' : 'Add Entry'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}