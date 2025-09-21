import { useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { Separator } from "./ui/separator";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { TooltipProvider } from "./ui/tooltip";
import { User, ShieldCheck, ShieldX, ShieldAlert, Mail, Phone, MapPin, Calendar, Activity, MousePointer, ExternalLink, BarChart3, TrendingUp, Edit, Ban, Trash2, Globe, Chrome, Smartphone, Clock, Building2, Copy } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { User as UserType, UserActivity, CompanyClick, DailyActivity } from "./types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

interface UserProfileDetailProps {
  user: UserType | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (userId: string, status: 'active' | 'suspended' | 'banned') => void;
  onDeleteUser: (userId: string) => void;
  onEditUser: (user: UserType) => void;
}

// Mock user activity data - in real app this would come from API
const generateMockUserActivity = (userId: string): UserActivity => {
  const companies = [
    { name: 'FTMO', id: '1', logoUrl: 'https://images.unsplash.com/photo-1642310290564-30033ff60334?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21wYW55JTIwbG9nbyUyMHByb2Zlc3Npb25hbCUyMGZpbmFuY2V8ZW58MXx8fHwxNzU2NTQ2Nzg0fDA&ixlib=rb-4.1.0&q=80&w=100' },
    { name: 'PropTrader Elite', id: '2', logoUrl: 'https://images.unsplash.com/photo-1588651157380-74fdc94da88a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaW50ZWNoJTIwc3RhcnR1cCUyMGxvZ28lMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzU2NTQ2Nzk0fDA&ixlib=rb-4.1.0&q=80&w=100' },
    { name: 'TopStep', id: '3', logoUrl: 'https://images.unsplash.com/photo-1660071155921-7204712d7d1a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmFkaW5nJTIwcGxhdGZvcm0lMjBsb2dvJTIwYnJhbmR8ZW58MXx8fHwxNzU2NTQ2ODAyfDA&ixlib=rb-4.1.0&q=80&w=100' },
    { name: 'IC Markets', id: '4', logoUrl: 'https://images.unsplash.com/photo-1669217541257-f46f1d24712a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBjb3Jwb3JhdGUlMjBsb2dvJTIwYnJhbmR8ZW58MXx8fHwxNzU2NTQ2NzkwfDA&ixlib=rb-4.1.0&q=80&w=100' },
    { name: 'Apex Trader', id: '5', logoUrl: 'https://images.unsplash.com/photo-1664948962404-e699cfda2f80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMGxvZ28lMjB0cmFkaW5nJTIwY29tcGFueXxlbnwxfHx8fDE3NTY1NDY3ODh8MA&ixlib=rb-4.1.0&q=80&w=1080' },
    { name: 'Pepperstone', id: '6' }
  ];

  const companyClicks: CompanyClick[] = companies.map(company => ({
    companyName: company.name,
    companyId: company.id,
    clicks: Math.floor(Math.random() * 50) + 1,
    logoUrl: company.logoUrl
  })).sort((a, b) => b.clicks - a.clicks);

  const dailyActivity: DailyActivity[] = [];
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const clicks = Math.floor(Math.random() * 20);
    dailyActivity.push({
      date: date.toISOString().split('T')[0],
      clicks: clicks,
      affiliateClicks: Math.floor(clicks * 0.7),
      couponClicks: Math.floor(clicks * 0.3)
    });
  }

  const totalAffiliateClicks = companyClicks.reduce((sum, company) => sum + company.clicks, 0);
  const totalCouponClicks = Math.floor(totalAffiliateClicks * 1.3);

  return {
    totalCouponClicks,
    totalAffiliateClicks,
    companyClicks,
    dailyActivity
  };
};

export function UserProfileDetail({ 
  user, 
  isOpen, 
  onClose, 
  onUpdateStatus, 
  onDeleteUser, 
  onEditUser 
}: UserProfileDetailProps) {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [statusConfirmOpen, setStatusConfirmOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<'active' | 'suspended' | 'banned' | null>(null);

  if (!user) return null;

  const userActivity = generateMockUserActivity(user.id);

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'active':
        return <ShieldCheck className="w-4 h-4 text-green-600" />;
      case 'suspended':
        return <ShieldAlert className="w-4 h-4 text-yellow-600" />;
      case 'banned':
        return <ShieldX className="w-4 h-4 text-red-600" />;
      default:
        return <ShieldCheck className="w-4 h-4 text-green-600" />;
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'suspended':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'banned':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    }
  };

  const getLoginMethodDetails = (method: string) => {
    switch (method) {
      case 'google':
        return { icon: <Chrome className="w-4 h-4" />, label: 'Google', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' };
      case 'facebook':
        return { icon: <Globe className="w-4 h-4" />, label: 'Facebook', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' };
      case 'apple':
        return { icon: <Smartphone className="w-4 h-4" />, label: 'Apple ID', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' };
      case 'email':
        return { icon: <Mail className="w-4 h-4" />, label: 'Email', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' };
      default:
        return { icon: <Mail className="w-4 h-4" />, label: method, color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' };
    }
  };

  const handleStatusChange = (newStatus: 'active' | 'suspended' | 'banned') => {
    setPendingStatus(newStatus);
    setStatusConfirmOpen(true);
  };

  const confirmStatusChange = () => {
    if (pendingStatus) {
      onUpdateStatus(user.id, pendingStatus);
      toast.success(`User status updated to ${pendingStatus === 'active' ? 'approved' : pendingStatus}`);
    }
    setStatusConfirmOpen(false);
    setPendingStatus(null);
  };

  const handleDeleteUser = () => {
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteUser = () => {
    onDeleteUser(user.id);
    setDeleteConfirmOpen(false);
    onClose();
    toast.success("User account deleted");
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const loginMethodDetails = getLoginMethodDetails(user.loginMethod);

  // Prepare chart data
  const companyChartData = userActivity.companyClicks.slice(0, 10).map(company => ({
    name: company.companyName.length > 12 ? company.companyName.substring(0, 12) + '...' : company.companyName,
    clicks: company.clicks,
    fullName: company.companyName
  }));

  const timelineData = userActivity.dailyActivity.slice(-14).map(day => ({
    date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    total: day.clicks,
    affiliate: day.affiliateClicks,
    coupon: day.couponClicks
  }));

  const activitySummary = [
    { name: 'Affiliate Clicks', value: userActivity.totalAffiliateClicks, color: '#3b82f6' },
    { name: 'Coupon Views', value: userActivity.totalCouponClicks, color: '#10b981' }
  ];

  return (
    <TooltipProvider>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-[85vw] max-h-[85vh] w-full h-full">
          
          {/* Header */}
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="flex items-center gap-4">
              <Avatar className="w-12 h-12">
                <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                  {user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-foreground">{user.name || 'Anonymous User'}</h2>
                <div className="flex items-center gap-2">
                  {getStatusIcon(user.status)}
                  <Badge className={getStatusBadge(user.status)}>
                    {user.status || 'active'}
                  </Badge>
                </div>
              </div>
            </DialogTitle>
            <DialogDescription className="text-base text-muted-foreground mt-2">
              Complete user profile and activity overview
            </DialogDescription>
          </DialogHeader>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-6 p-1">
              
              {/* Basic Information Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <User className="w-5 h-5" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Left Column */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium text-muted-foreground">Email</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-base text-foreground break-all">{user.email || 'Not provided'}</span>
                          {user.email && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(user.email!, 'Email')}
                              className="p-1 h-6 w-6"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium text-muted-foreground">Phone</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-base text-foreground">{user.phoneNumber}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(user.phoneNumber, 'Phone number')}
                            className="p-1 h-6 w-6"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium text-muted-foreground">Country</span>
                        </div>
                        <span className="text-base text-foreground">{user.country || 'Not specified'}</span>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          {loginMethodDetails.icon}
                          <span className="text-sm font-medium text-muted-foreground">Login Method</span>
                        </div>
                        <Badge className={loginMethodDetails.color}>
                          {loginMethodDetails.label}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium text-muted-foreground">Joined</span>
                        </div>
                        <span className="text-base text-foreground">{formatDate(user.joinedAt)}</span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium text-muted-foreground">Last Active</span>
                        </div>
                        <span className="text-base text-foreground">{user.lastActive ? formatDate(user.lastActive) : 'Today'}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Activity Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Activity className="w-5 h-5" />
                    Activity Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <MousePointer className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-foreground">{userActivity.totalCouponClicks}</div>
                      <div className="text-sm text-muted-foreground">Total Coupon Clicks</div>
                    </div>
                    
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <ExternalLink className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-foreground">{userActivity.totalAffiliateClicks}</div>
                      <div className="text-sm text-muted-foreground">Affiliate Link Clicks</div>
                    </div>
                    
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <Building2 className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-foreground">{userActivity.companyClicks.length}</div>
                      <div className="text-sm text-muted-foreground">Companies Engaged</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Analytics Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <BarChart3 className="w-5 h-5" />
                    Detailed Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="companies" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-4">
                      <TabsTrigger value="companies">Company Breakdown</TabsTrigger>
                      <TabsTrigger value="timeline">Activity Timeline</TabsTrigger>
                      <TabsTrigger value="overview">Quick Overview</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="companies" className="space-y-6 mt-4">
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={companyChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="name" 
                              fontSize={12}
                              angle={-45}
                              textAnchor="end"
                              height={80}
                            />
                            <YAxis fontSize={12} />
                            <Bar dataKey="clicks" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      
                      <div className="space-y-4">
                        <h4 className="font-medium text-base">Company Statistics</h4>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {userActivity.companyClicks.map((company, index) => (
                            <div key={company.companyId} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                                  {index + 1}
                                </div>
                                {company.logoUrl ? (
                                  <img src={company.logoUrl} alt={company.companyName} className="w-6 h-6 rounded object-cover" />
                                ) : (
                                  <div className="w-6 h-6 rounded bg-muted-foreground/20 flex items-center justify-center">
                                    <Building2 className="w-3 h-3 text-muted-foreground" />
                                  </div>
                                )}
                                <span className="text-sm font-medium text-foreground">{company.companyName}</span>
                              </div>
                              <Badge variant="secondary" className="text-xs">
                                {company.clicks} clicks
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="timeline" className="space-y-6 mt-4">
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={timelineData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" fontSize={12} />
                            <YAxis fontSize={12} />
                            <Line 
                              type="monotone" 
                              dataKey="total" 
                              stroke="#3b82f6" 
                              strokeWidth={3}
                              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                              name="Total Clicks"
                            />
                            <Line 
                              type="monotone" 
                              dataKey="affiliate" 
                              stroke="#10b981" 
                              strokeWidth={2}
                              strokeDasharray="5 5"
                              dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
                              name="Affiliate Clicks"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="text-sm text-muted-foreground text-center">
                        Activity timeline showing user engagement over the last 14 days
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="overview" className="space-y-6 mt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h4 className="font-medium text-base">Activity Distribution</h4>
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={activitySummary}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={40}
                                  outerRadius={80}
                                  paddingAngle={5}
                                  dataKey="value"
                                >
                                  {activitySummary.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                                </Pie>
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="flex justify-center gap-4">
                            {activitySummary.map((item, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <div 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ backgroundColor: item.color }}
                                />
                                <span className="text-sm text-foreground">{item.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <h4 className="font-medium text-base">Top Performing Companies</h4>
                          <div className="space-y-3 max-h-64 overflow-y-auto">
                            {userActivity.companyClicks.slice(0, 8).map((company, index) => (
                              <div key={company.companyId} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">
                                    {index + 1}
                                  </span>
                                  <span className="text-sm font-medium text-foreground">{company.companyName}</span>
                                </div>
                                <span className="text-xs text-muted-foreground">{company.clicks} clicks</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Activity className="w-5 h-5" />
                    Account Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Primary Actions */}
                    <div className="flex flex-wrap gap-3">
                      <Button
                        variant="outline"
                        onClick={() => onEditUser(user)}
                        className="flex items-center gap-2 min-w-fit"
                      >
                        <Edit className="w-4 h-4" />
                        Edit Profile
                      </Button>
                      
                      {(user.status === 'suspended' || user.status === 'banned') && (
                        <Button
                          variant="outline"
                          onClick={() => handleStatusChange('active')}
                          className="flex items-center gap-2 text-green-600 hover:text-green-700 border-green-200 hover:border-green-300 min-w-fit"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          Approve Account
                        </Button>
                      )}
                      
                      {(!user.status || user.status === 'active') && (
                        <Button
                          variant="outline"
                          onClick={() => handleStatusChange('suspended')}
                          className="flex items-center gap-2 text-yellow-600 hover:text-yellow-700 border-yellow-200 hover:border-yellow-300 min-w-fit"
                        >
                          <ShieldAlert className="w-4 h-4" />
                          Suspend Account
                        </Button>
                      )}
                      
                      {user.status !== 'banned' && (
                        <Button
                          variant="outline"
                          onClick={() => handleStatusChange('banned')}
                          className="flex items-center gap-2 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 min-w-fit"
                        >
                          <Ban className="w-4 h-4" />
                          Ban Account
                        </Button>
                      )}
                    </div>
                    
                    {/* Destructive Action */}
                    <div className="pt-3 border-t">
                      <Button
                        variant="destructive"
                        onClick={handleDeleteUser}
                        className="flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Status Change Confirmation Dialog */}
      <AlertDialog open={statusConfirmOpen} onOpenChange={setStatusConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Status Change</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {pendingStatus === 'active' ? 'approve and activate' : pendingStatus} this user account? 
              {pendingStatus === 'banned' && ' This action will prevent the user from accessing the application.'}
              {pendingStatus === 'suspended' && ' This action will temporarily restrict the user\'s access.'}
              {pendingStatus === 'active' && ' This action will grant the user full access to the application.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmStatusChange}
              className={
                pendingStatus === 'banned' ? 'bg-red-600 hover:bg-red-700' :
                pendingStatus === 'suspended' ? 'bg-yellow-600 hover:bg-yellow-700' :
                'bg-green-600 hover:bg-green-700'
              }
            >
              {pendingStatus === 'banned' && <Ban className="w-4 h-4 mr-2" />}
              {pendingStatus === 'suspended' && <ShieldAlert className="w-4 h-4 mr-2" />}
              {pendingStatus === 'active' && <ShieldCheck className="w-4 h-4 mr-2" />}
              Confirm {pendingStatus === 'active' ? 'Approval' : pendingStatus}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete this user account? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteUser}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
}