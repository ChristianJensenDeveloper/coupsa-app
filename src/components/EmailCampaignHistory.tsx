import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Search, Filter, MoreHorizontal, Edit, Trash2, Copy, TrendingUp, TrendingDown, Mail, Calendar, DollarSign, MousePointer, Eye } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { EmailCampaign } from "./EmailCampaignEditor";

interface EmailCampaignHistoryProps {
  campaigns: EmailCampaign[];
  onEditCampaign: (campaign: EmailCampaign) => void;
  onDeleteCampaign: (campaignId: string) => void;
  onDuplicateCampaign: (campaign: EmailCampaign) => void;
  onCreateNew: () => void;
}

export function EmailCampaignHistory({ 
  campaigns, 
  onEditCampaign, 
  onDeleteCampaign, 
  onDuplicateCampaign,
  onCreateNew 
}: EmailCampaignHistoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [templateFilter, setTemplateFilter] = useState<string>('all');

  // Filter campaigns
  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         campaign.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    const matchesTemplate = templateFilter === 'all' || campaign.templateType === templateFilter;
    
    return matchesSearch && matchesStatus && matchesTemplate;
  });

  // Sort by most recent first
  const sortedCampaigns = [...filteredCampaigns].sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  // Calculate summary stats
  const totalCampaigns = campaigns.length;
  const sentCampaigns = campaigns.filter(c => c.status === 'sent');
  const avgOpenRate = sentCampaigns.length > 0 
    ? sentCampaigns.reduce((acc, c) => acc + (c.openRate || 0), 0) / sentCampaigns.length 
    : 0;
  const avgClickRate = sentCampaigns.length > 0 
    ? sentCampaigns.reduce((acc, c) => acc + (c.clickRate || 0), 0) / sentCampaigns.length 
    : 0;
  const totalRevenue = sentCampaigns.reduce((acc, c) => acc + (c.revenue || 0), 0);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-slate-100 text-slate-700';
      case 'scheduled':
        return 'bg-blue-100 text-blue-700';
      case 'sent':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getTemplateIcon = (templateType: string) => {
    switch (templateType) {
      case 'monday-cfd':
      case 'tuesday-futures':
        return '📊';
      case 'thursday-expiring':
        return '⏰';
      case 'custom':
        return '✉️';
      default:
        return '📧';
    }
  };

  const handleDuplicate = (campaign: EmailCampaign) => {
    const duplicatedCampaign = {
      ...campaign,
      id: Date.now().toString(),
      name: `${campaign.name} (Copy)`,
      status: 'draft' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sentDate: '',
      scheduledDate: '',
      openRate: undefined,
      clickRate: undefined,
      ctr: undefined,
      revenue: undefined
    };
    
    onDuplicateCampaign(duplicatedCampaign);
    toast.success("Campaign duplicated");
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Campaigns</p>
                <p className="text-2xl font-bold text-slate-900">{totalCampaigns}</p>
              </div>
              <Mail className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Avg Open Rate</p>
                <p className="text-2xl font-bold text-slate-900">{avgOpenRate.toFixed(1)}%</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                  <span className="text-xs text-green-600">+2.3% from last month</span>
                </div>
              </div>
              <Eye className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Avg Click Rate</p>
                <p className="text-2xl font-bold text-slate-900">{avgClickRate.toFixed(1)}%</p>
                <div className="flex items-center mt-1">
                  <TrendingDown className="w-3 h-3 text-orange-500 mr-1" />
                  <span className="text-xs text-orange-600">-0.8% from last month</span>
                </div>
              </div>
              <MousePointer className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Revenue</p>
                <p className="text-2xl font-bold text-slate-900">${totalRevenue.toLocaleString()}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                  <span className="text-xs text-green-600">+15.2% from last month</span>
                </div>
              </div>
              <DollarSign className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Email Campaign History</CardTitle>
            <Button onClick={onCreateNew}>
              <Mail className="w-4 h-4 mr-2" />
              Create New Campaign
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
              </SelectContent>
            </Select>

            <Select value={templateFilter} onValueChange={setTemplateFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Templates</SelectItem>
                <SelectItem value="monday-cfd">Monday CFD</SelectItem>
                <SelectItem value="tuesday-futures">Tuesday Futures</SelectItem>
                <SelectItem value="thursday-expiring">Thursday Expiring</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Campaigns Table */}
          <div className="rounded-lg border border-slate-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Campaign</TableHead>
                  <TableHead>Template</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Recipients</TableHead>
                  <TableHead>Open Rate</TableHead>
                  <TableHead>Click Rate</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedCampaigns.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="text-slate-500">
                        <Mail className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No campaigns found</p>
                        <p className="text-sm">Try adjusting your search or filters</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedCampaigns.map((campaign) => (
                    <TableRow key={campaign.id} className="hover:bg-slate-50">
                      <TableCell>
                        <div>
                          <div className="font-medium text-slate-900">{campaign.name}</div>
                          <div className="text-sm text-slate-600 truncate max-w-xs">
                            {campaign.subject}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{getTemplateIcon(campaign.templateType)}</span>
                          <span className="text-sm capitalize">
                            {campaign.templateType.replace('-', ' ')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(campaign.status)} border-0`}>
                          {campaign.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{campaign.recipientCount.toLocaleString()}</TableCell>
                      <TableCell>
                        {campaign.openRate !== undefined ? (
                          <div className="flex items-center gap-1">
                            <span>{campaign.openRate}%</span>
                            {campaign.openRate > avgOpenRate ? (
                              <TrendingUp className="w-3 h-3 text-green-500" />
                            ) : (
                              <TrendingDown className="w-3 h-3 text-red-500" />
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {campaign.clickRate !== undefined ? (
                          <div className="flex items-center gap-1">
                            <span>{campaign.clickRate}%</span>
                            {campaign.clickRate > avgClickRate ? (
                              <TrendingUp className="w-3 h-3 text-green-500" />
                            ) : (
                              <TrendingDown className="w-3 h-3 text-red-500" />
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {campaign.revenue !== undefined ? (
                          <span className="font-medium text-green-600">
                            ${campaign.revenue.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {campaign.status === 'sent' && campaign.sentDate ? (
                            <>
                              <div>Sent</div>
                              <div className="text-slate-500">{formatDate(campaign.sentDate)}</div>
                            </>
                          ) : campaign.status === 'scheduled' && campaign.scheduledDate ? (
                            <>
                              <div>Scheduled</div>
                              <div className="text-slate-500">{formatDate(campaign.scheduledDate)}</div>
                            </>
                          ) : (
                            <>
                              <div>Updated</div>
                              <div className="text-slate-500">{formatDate(campaign.updatedAt)}</div>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEditCampaign(campaign)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicate(campaign)}>
                              <Copy className="w-4 h-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => onDeleteCampaign(campaign.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}