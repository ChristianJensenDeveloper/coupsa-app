import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { Switch } from "./ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Shield, Download, Trash2, UserX, Search, Info, Clock, CheckCircle, AlertTriangle, FileText, Database, Settings, Eye, Mail, Globe } from "lucide-react";
import { toast } from "sonner@2.0.3";

interface DataRequest {
  id: string;
  userId: string;
  userEmail: string;
  type: 'export' | 'delete' | 'anonymize';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requestDate: string;
  completedDate?: string;
  adminNotes?: string;
}

interface ConsentRecord {
  id: string;
  userId: string;
  userEmail: string;
  consentType: 'email_marketing' | 'cookies_analytics' | 'third_party_offers';
  status: 'given' | 'withdrawn';
  timestamp: string;
  source: 'banner' | 'form' | 'settings';
  version: string;
}

interface DataAction {
  id: string;
  adminId: string;
  adminName: string;
  action: 'export' | 'delete' | 'anonymize';
  userId: string;
  userEmail: string;
  timestamp: string;
  notes?: string;
}

// Mock data
const mockDataRequests: DataRequest[] = [
  {
    id: '1',
    userId: 'user_123',
    userEmail: 'john.trader@email.com',
    type: 'export',
    status: 'completed',
    requestDate: '2025-01-01T10:30:00Z',
    completedDate: '2025-01-01T15:45:00Z',
    adminNotes: 'Exported profile, consents, and activity logs'
  },
  {
    id: '2',
    userId: 'user_456',
    userEmail: 'sarah.prop@email.com',
    type: 'delete',
    status: 'pending',
    requestDate: '2025-01-02T09:15:00Z',
    adminNotes: 'User requested full account deletion'
  },
  {
    id: '3',
    userId: 'user_789',
    userEmail: 'mike.futures@email.com',
    type: 'anonymize',
    status: 'processing',
    requestDate: '2025-01-02T14:20:00Z',
    adminNotes: 'Anonymizing personal data while preserving analytics'
  }
];

const mockConsentRecords: ConsentRecord[] = [
  {
    id: '1',
    userId: 'user_123',
    userEmail: 'john.trader@email.com',
    consentType: 'email_marketing',
    status: 'given',
    timestamp: '2025-01-01T08:00:00Z',
    source: 'banner',
    version: 'v1.0'
  },
  {
    id: '2',
    userId: 'user_123',
    userEmail: 'john.trader@email.com',
    consentType: 'cookies_analytics',
    status: 'given',
    timestamp: '2025-01-01T08:00:00Z',
    source: 'banner',
    version: 'v1.0'
  },
  {
    id: '3',
    userId: 'user_456',
    userEmail: 'sarah.prop@email.com',
    consentType: 'email_marketing',
    status: 'withdrawn',
    timestamp: '2025-01-02T12:30:00Z',
    source: 'settings',
    version: 'v1.0'
  },
  {
    id: '4',
    userId: 'user_789',
    userEmail: 'mike.futures@email.com',
    consentType: 'third_party_offers',
    status: 'given',
    timestamp: '2025-01-02T16:45:00Z',
    source: 'form',
    version: 'v1.0'
  }
];

const mockDataActions: DataAction[] = [
  {
    id: '1',
    adminId: 'admin_1',
    adminName: 'Admin User',
    action: 'export',
    userId: 'user_123',
    userEmail: 'john.trader@email.com',
    timestamp: '2025-01-01T15:45:00Z',
    notes: 'User data exported successfully'
  },
  {
    id: '2',
    adminId: 'admin_1',
    adminName: 'Admin User',
    action: 'anonymize',
    userId: 'user_456',
    userEmail: 'sarah.prop@email.com',
    timestamp: '2025-01-02T11:20:00Z',
    notes: 'Personal data anonymized, analytics preserved'
  }
];

export function AdminGDPR() {
  const [dataRequests, setDataRequests] = useState<DataRequest[]>(mockDataRequests);
  const [consentRecords, setConsentRecords] = useState<ConsentRecord[]>(mockConsentRecords);
  const [dataActions, setDataActions] = useState<DataAction[]>(mockDataActions);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<DataRequest | null>(null);
  const [isProcessDialogOpen, setIsProcessDialogOpen] = useState(false);

  // Settings state
  const [settings, setSettings] = useState({
    privacyPolicyUrl: 'https://coupza.com/privacy-policy',
    cookiePolicyUrl: 'https://coupza.com/cookie-policy',
    dataRequestsEmail: 'privacy@coupza.com',
    retentionDays: 30,
    newUserEmailMarketing: false,
    newUserThirdPartyOffers: false,
    cookieBannerRequired: true
  });

  const filteredRequests = dataRequests.filter(request => 
    request.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.userId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'processing':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'failed':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'export':
        return <Download className="w-4 h-4" />;
      case 'delete':
        return <Trash2 className="w-4 h-4" />;
      case 'anonymize':
        return <UserX className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getConsentTypeLabel = (type: string) => {
    switch (type) {
      case 'email_marketing':
        return 'Email Marketing';
      case 'cookies_analytics':
        return 'Cookies & Analytics';
      case 'third_party_offers':
        return 'Third-party Offers';
      default:
        return type;
    }
  };

  const handleProcessRequest = (request: DataRequest, action: 'approve' | 'reject', notes?: string) => {
    setDataRequests(prev => prev.map(req => 
      req.id === request.id 
        ? { 
            ...req, 
            status: action === 'approve' ? 'processing' : 'failed',
            adminNotes: notes || req.adminNotes
          }
        : req
    ));

    // Add to data actions log
    const newAction: DataAction = {
      id: Date.now().toString(),
      adminId: 'current_admin',
      adminName: 'Current Admin',
      action: request.type,
      userId: request.userId,
      userEmail: request.userEmail,
      timestamp: new Date().toISOString(),
      notes: notes
    };
    setDataActions(prev => [newAction, ...prev]);

    toast.success(`Request ${action === 'approve' ? 'processed' : 'rejected'} successfully`);
    setIsProcessDialogOpen(false);
    setSelectedRequest(null);
  };

  const exportDataActionsCSV = () => {
    const headers = ['Timestamp', 'Admin', 'Action', 'User Email', 'Notes'];
    const rows = dataActions.map(action => [
      new Date(action.timestamp).toLocaleString(),
      action.adminName,
      action.action,
      action.userEmail,
      action.notes || ''
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gdpr-data-actions.csv';
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Data actions exported to CSV');
  };

  const handleSettingsUpdate = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    toast.success('Settings updated');
  };

  const pendingRequestsCount = dataRequests.filter(req => req.status === 'pending').length;
  const processingRequestsCount = dataRequests.filter(req => req.status === 'processing').length;
  const completedRequestsCount = dataRequests.filter(req => req.status === 'completed').length;
  const totalConsentsGiven = consentRecords.filter(record => record.status === 'given').length;

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-500" />
            GDPR
          </h2>
          <p className="text-slate-600 dark:text-slate-400 font-medium">Handle user data requests and manage consent records. We store minimal data and act as an affiliate.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-700/30 shadow-lg rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{pendingRequestsCount}</div>
                  <div className="text-sm text-muted-foreground">Pending Requests</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-700/30 shadow-lg rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                  <Database className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{processingRequestsCount}</div>
                  <div className="text-sm text-muted-foreground">Processing</div>
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
                  <div className="text-2xl font-bold">{completedRequestsCount}</div>
                  <div className="text-sm text-muted-foreground">Completed</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-700/30 shadow-lg rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                  <Eye className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{totalConsentsGiven}</div>
                  <div className="text-sm text-muted-foreground">Active Consents</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="requests" className="space-y-6">
          <TabsList className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-700/30 shadow-lg rounded-xl p-1">
            <TabsTrigger value="requests" className="rounded-lg">Data Requests</TabsTrigger>
            <TabsTrigger value="consents" className="rounded-lg">Consent Management</TabsTrigger>
            <TabsTrigger value="actions" className="rounded-lg">Data Actions Log</TabsTrigger>
            <TabsTrigger value="settings" className="rounded-lg">Policies & Settings</TabsTrigger>
          </TabsList>

          {/* Data Requests Tab */}
          <TabsContent value="requests" className="space-y-4">
            <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-700/30 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  User Data Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Search */}
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by email or user ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 rounded-xl"
                    />
                  </div>
                </div>

                {/* Requests Table */}
                <div className="rounded-xl border border-white/20 dark:border-slate-700/30 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Request Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Request Date</TableHead>
                        <TableHead>Completed Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{request.userEmail}</div>
                              <div className="text-sm text-muted-foreground">{request.userId}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getTypeIcon(request.type)}
                              <span className="capitalize">{request.type}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(request.status)}>
                              {request.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(request.requestDate).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {request.completedDate 
                              ? new Date(request.completedDate).toLocaleString()
                              : '-'
                            }
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setIsProcessDialogOpen(true);
                                }}
                                className="rounded-xl"
                              >
                                Process
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Info Note */}
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700/30">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                      <strong>Export includes:</strong> profile data, consent records, activity logs. No payment data is stored as we are an affiliate aggregator.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Consent Management Tab */}
          <TabsContent value="consents" className="space-y-4">
            <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-700/30 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Consent Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Consent Types */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Consent Types (All Versioned)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-700/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Mail className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <span className="font-medium text-green-900 dark:text-green-100">Email Marketing</span>
                      </div>
                      <p className="text-sm text-green-700 dark:text-green-300">v1.0</p>
                    </div>
                    
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="font-medium text-blue-900 dark:text-blue-100">Cookies & Analytics</span>
                      </div>
                      <p className="text-sm text-blue-700 dark:text-blue-300">v1.0</p>
                    </div>
                    
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-700/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Globe className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <span className="font-medium text-purple-900 dark:text-purple-100">Third-party Offers</span>
                      </div>
                      <p className="text-sm text-purple-700 dark:text-purple-300">v1.0</p>
                    </div>
                  </div>
                </div>

                {/* Consent Log Table */}
                <div>
                  <h4 className="font-medium mb-3">Consent Log</h4>
                  <div className="rounded-xl border border-white/20 dark:border-slate-700/30 overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Consent Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Timestamp</TableHead>
                          <TableHead>Source</TableHead>
                          <TableHead>Version</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {consentRecords.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{record.userEmail}</div>
                                <div className="text-sm text-muted-foreground">{record.userId}</div>
                              </div>
                            </TableCell>
                            <TableCell>{getConsentTypeLabel(record.consentType)}</TableCell>
                            <TableCell>
                              <Badge className={record.status === 'given' 
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                              }>
                                {record.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(record.timestamp).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {record.source}
                              </Badge>
                            </TableCell>
                            <TableCell>{record.version}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Actions Log Tab */}
          <TabsContent value="actions" className="space-y-4">
            <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-700/30 shadow-lg rounded-2xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Data Actions Log
                  </CardTitle>
                  <Button onClick={exportDataActionsCSV} variant="outline" className="rounded-xl">
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-xl border border-white/20 dark:border-slate-700/30 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Admin</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dataActions.map((action) => (
                        <TableRow key={action.id}>
                          <TableCell>
                            {new Date(action.timestamp).toLocaleString()}
                          </TableCell>
                          <TableCell className="font-medium">{action.adminName}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getTypeIcon(action.action)}
                              <span className="capitalize">{action.action}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{action.userEmail}</div>
                              <div className="text-sm text-muted-foreground">{action.userId}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{action.notes || '-'}</span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Policies & Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Policies & Contacts */}
              <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-700/30 shadow-lg rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Policies & Contacts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Privacy Policy URL</Label>
                    <Input
                      value={settings.privacyPolicyUrl}
                      onChange={(e) => handleSettingsUpdate('privacyPolicyUrl', e.target.value)}
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Cookie Policy URL</Label>
                    <Input
                      value={settings.cookiePolicyUrl}
                      onChange={(e) => handleSettingsUpdate('cookiePolicyUrl', e.target.value)}
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Data Requests Email</Label>
                    <Input
                      value={settings.dataRequestsEmail}
                      onChange={(e) => handleSettingsUpdate('dataRequestsEmail', e.target.value)}
                      className="rounded-xl"
                    />
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700/30">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-700 dark:text-blue-300">
                        These URLs are shown live in the app privacy settings.
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Default Settings */}
              <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-700/30 shadow-lg rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Default Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">New User Defaults</h4>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Email Marketing</Label>
                        <p className="text-sm text-muted-foreground">Default consent for new users</p>
                      </div>
                      <Switch
                        checked={settings.newUserEmailMarketing}
                        onCheckedChange={(checked) => handleSettingsUpdate('newUserEmailMarketing', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Third-party Offers</Label>
                        <p className="text-sm text-muted-foreground">Default consent for new users</p>
                      </div>
                      <Switch
                        checked={settings.newUserThirdPartyOffers}
                        onCheckedChange={(checked) => handleSettingsUpdate('newUserThirdPartyOffers', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Cookie Banner in EEA</Label>
                        <p className="text-sm text-muted-foreground">Show banner for EU users</p>
                      </div>
                      <Switch
                        checked={settings.cookieBannerRequired}
                        onCheckedChange={(checked) => handleSettingsUpdate('cookieBannerRequired', checked)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Data Retention (Days)</Label>
                    <Input
                      type="number"
                      value={settings.retentionDays}
                      onChange={(e) => handleSettingsUpdate('retentionDays', parseInt(e.target.value))}
                      className="rounded-xl"
                    />
                    <p className="text-sm text-muted-foreground">
                      We retain basic account data for {settings.retentionDays} days after deletion for fraud/abuse prevention.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Process Request Dialog */}
        <Dialog open={isProcessDialogOpen} onOpenChange={setIsProcessDialogOpen}>
          <DialogContent className="max-w-lg rounded-2xl border-0 shadow-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle>Process Data Request</DialogTitle>
              <DialogDescription>
                Review and process this user data request. All actions are logged for audit purposes.
              </DialogDescription>
            </DialogHeader>
            
            {selectedRequest && (
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <div className="space-y-2">
                    <div><strong>User:</strong> {selectedRequest.userEmail}</div>
                    <div><strong>Request Type:</strong> {selectedRequest.type}</div>
                    <div><strong>Status:</strong> {selectedRequest.status}</div>
                    <div><strong>Request Date:</strong> {new Date(selectedRequest.requestDate).toLocaleString()}</div>
                    {selectedRequest.adminNotes && (
                      <div><strong>Notes:</strong> {selectedRequest.adminNotes}</div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Admin Notes</Label>
                  <Textarea
                    placeholder="Add notes about this request processing..."
                    className="rounded-xl"
                  />
                </div>
              </div>
            )}

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setIsProcessDialogOpen(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                onClick={() => selectedRequest && handleProcessRequest(selectedRequest, 'reject')}
                className="rounded-xl text-destructive hover:text-destructive"
              >
                Reject
              </Button>
              <Button
                onClick={() => selectedRequest && handleProcessRequest(selectedRequest, 'approve')}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg border-0 rounded-xl"
              >
                Process Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}