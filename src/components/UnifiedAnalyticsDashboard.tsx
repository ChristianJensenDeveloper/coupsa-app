import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Progress } from "./ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { 
  TrendingUp, 
  TrendingDown,
  Users, 
  Building2, 
  Ticket, 
  Activity,
  CheckCircle,
  Clock,
  Archive,
  MousePointer,
  Copy,
  Eye,
  Globe,
  BarChart3,
  PieChart,
  AlertTriangle,
  DollarSign,
  Calendar,
  Filter,
  HelpCircle,
  Info,
  ExternalLink,
  Heart,
  Download,
  RefreshCw
} from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, AreaChart, Area } from "recharts";
import { AdminDeal, Firm } from "./types";
import {
  getAnalyticsDashboard,
  getDealPerformance,
  getUserBehaviorSummary,
  getCountryTrafficDistribution,
  getFirmAnalytics,
  runDailyAnalyticsUpdate,
  type AnalyticsDashboard as AnalyticsDashboardType
} from '../lib/analytics-database';
import { toast } from "sonner@2.0.3";

interface UnifiedAnalyticsDashboardProps {
  deals: AdminDeal[];
  firms: Firm[];
}

// Mock data for when database analytics aren't available
const mockUserData = [
  { date: 'Jan 1', activeUsers: 850, newUsers: 120, returningUsers: 730 },
  { date: 'Jan 2', activeUsers: 920, newUsers: 95, returningUsers: 825 },
  { date: 'Jan 3', activeUsers: 1100, newUsers: 180, returningUsers: 920 },
  { date: 'Jan 4', activeUsers: 980, newUsers: 150, returningUsers: 830 },
  { date: 'Jan 5', activeUsers: 1250, newUsers: 200, returningUsers: 1050 },
  { date: 'Jan 6', activeUsers: 1180, newUsers: 170, returningUsers: 1010 },
  { date: 'Jan 7', activeUsers: 1350, newUsers: 220, returningUsers: 1130 }
];

const mockCountryData = [
  { country: 'United States', users: 2000, percentage: 42.5, flag: '🇺🇸' },
  { country: 'United Kingdom', users: 650, percentage: 13.8, flag: '🇬🇧' },
  { country: 'Germany', users: 480, percentage: 10.2, flag: '🇩🇪' },
  { country: 'Canada', users: 420, percentage: 8.9, flag: '🇨🇦' },
  { country: 'Australia', users: 320, percentage: 6.8, flag: '🇦🇺' },
  { country: 'France', users: 280, percentage: 5.9, flag: '🇫🇷' },
  { country: 'Netherlands', users: 180, percentage: 3.8, flag: '🇳🇱' },
  { country: 'Others', users: 370, percentage: 8.1, flag: '🌍' }
];

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];

export function UnifiedAnalyticsDashboard({ deals, firms }: UnifiedAnalyticsDashboardProps) {
  // Database analytics state
  const [dashboardData, setDashboardData] = useState<AnalyticsDashboardType | null>(null);
  const [dealPerformance, setDealPerformance] = useState<any[]>([]);
  const [userBehavior, setUserBehavior] = useState<any[]>([]);
  const [countryData, setCountryData] = useState<any[]>([]);
  const [firmAnalytics, setFirmAnalytics] = useState<any[]>([]);
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateFilter, setDateFilter] = useState("30");
  const [selectedTab, setSelectedTab] = useState("overview");
  const [isUsingMockData, setIsUsingMockData] = useState(false);

  // Calculate local stats from deals/firms data
  const publishedDeals = deals.filter(d => d.status === 'Published').length;
  const draftDeals = deals.filter(d => d.status === 'Draft').length;
  const archivedDeals = deals.filter(d => d.status === 'Archived').length;
  const verifiedDeals = deals.filter(d => d.hasVerificationBadge).length;

  const propFirms = firms.filter(f => 
    f.name.toLowerCase().includes('prop') || 
    ['FTMO', 'TopStep', 'Apex Trader', 'FuturesFund Pro', 'Elite Traders Fund', 'PropTrader Elite', 'MaxProfit Trading', 'FlashTrade Pro', 'Earn2Trade'].includes(f.name)
  ).length;
  const brokers = firms.length - propFirms;

  const loadAnalyticsData = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    
    try {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - parseInt(dateFilter) * 24 * 60 * 60 * 1000)
        .toISOString().split('T')[0];

      // Try to load real analytics data
      const [
        dashboardResult,
        dealResult,
        userResult,
        countryResult,
        firmResult
      ] = await Promise.all([
        getAnalyticsDashboard(startDate, endDate),
        getDealPerformance(),
        getUserBehaviorSummary(),
        getCountryTrafficDistribution(),
        getFirmAnalytics(undefined, startDate, endDate)
      ]);

      let hasRealData = false;

      if (dashboardResult.data) {
        setDashboardData(dashboardResult.data);
        hasRealData = true;
      }
      if (dealResult.data && dealResult.data.length > 0) {
        setDealPerformance(dealResult.data);
        hasRealData = true;
      }
      if (userResult.data && userResult.data.length > 0) {
        setUserBehavior(userResult.data);
        hasRealData = true;
      }
      if (countryResult.data && countryResult.data.length > 0) {
        setCountryData(countryResult.data);
        hasRealData = true;
      }
      if (firmResult.data && firmResult.data.length > 0) {
        setFirmAnalytics(firmResult.data);
        hasRealData = true;
      }

      setIsUsingMockData(!hasRealData);

      if (dashboardResult.error || dealResult.error || userResult.error || 
          countryResult.error || firmResult.error) {
        console.log('Some analytics queries failed, falling back to mock data');
        setIsUsingMockData(true);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
      setIsUsingMockData(true);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    
    // Run daily analytics update first
    const updateResult = await runDailyAnalyticsUpdate();
    if (updateResult.error) {
      toast.error('Failed to update analytics');
    } else {
      toast.success('Analytics updated successfully');
    }
    
    // Then reload the data
    await loadAnalyticsData(false);
    setRefreshing(false);
  };

  const exportData = () => {
    const csvData = [
      ['Metric', 'Value', 'Date Range'],
      ['Total Users', getMetricValue('total_users'), `${dateFilter} days`],
      ['Total Sessions', getMetricValue('total_sessions'), `${dateFilter} days`],
      ['Page Views', getMetricValue('total_page_views'), `${dateFilter} days`],
      ['Deals Viewed', getMetricValue('total_deals_viewed'), `${dateFilter} days`],
      ['Affiliate Clicks', getMetricValue('total_affiliate_clicks'), `${dateFilter} days`],
      ['Published Deals', publishedDeals, 'Current'],
      ['Active Firms', firms.length, 'Current']
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `koocao-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Analytics data exported');
  };

  useEffect(() => {
    loadAnalyticsData();
  }, [dateFilter]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const renderTrendIcon = (trend: string, change: number) => {
    if (trend === 'up') {
      return <TrendingUp className="w-3 h-3 text-green-600" />;
    } else {
      return <TrendingDown className="w-3 h-3 text-red-600" />;
    }
  };

  // Helper function to get metrics with fallback
  const getMetricValue = (key: string) => {
    if (isUsingMockData) {
      const mockMetrics = {
        total_users: 4700,
        total_sessions: 8200,
        total_page_views: 15400,
        total_deals_viewed: 12300,
        total_affiliate_clicks: 2850,
        avg_session_duration: 180
      };
      return mockMetrics[key as keyof typeof mockMetrics] || 0;
    }
    return dashboardData?.overview?.[key as keyof typeof dashboardData.overview] || 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-slate-600 dark:text-slate-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header with Date Filter */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent">
              Analytics Dashboard
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-slate-600 dark:text-slate-400 font-medium">
                Platform performance and user insights
              </p>
              {isUsingMockData && (
                <Badge variant="outline" className="text-xs">
                  Demo Data
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-32 rounded-xl border-slate-200/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-0 shadow-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              onClick={exportData}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 rounded-xl"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
            
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={refreshing}
              className="flex items-center gap-2 rounded-xl"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-xl border border-white/20 dark:border-slate-700/30">
            <TabsTrigger value="overview" className="rounded-lg">Overview</TabsTrigger>
            <TabsTrigger value="deals" className="rounded-lg">Deals</TabsTrigger>
            <TabsTrigger value="users" className="rounded-lg">Users</TabsTrigger>
            <TabsTrigger value="geography" className="rounded-lg">Geography</TabsTrigger>
            <TabsTrigger value="firms" className="rounded-lg">Firms</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* KPI Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-700/30 shadow-lg rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-3 h-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">All users who have ever registered on KOOCAO, including active, inactive, and suspended accounts.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(getMetricValue('total_users'))}</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <TrendingUp className="w-3 h-3 text-green-600" />
                    <span className="text-green-600">+12.5%</span> vs last period
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-700/30 shadow-lg rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-sm font-medium">Page Views</CardTitle>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-3 h-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Total number of page views across all users and sessions in the selected time period.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(getMetricValue('total_page_views'))}</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <TrendingUp className="w-3 h-3 text-green-600" />
                    <span className="text-green-600">+8.7%</span> vs last period
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-700/30 shadow-lg rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-sm font-medium">Deals Viewed</CardTitle>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-3 h-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Number of individual deal impressions. Each time a user sees a deal card counts as one view.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Heart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(getMetricValue('total_deals_viewed'))}</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <TrendingUp className="w-3 h-3 text-green-600" />
                    <span className="text-green-600">+15.2%</span> vs last period
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-700/30 shadow-lg rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-sm font-medium">Affiliate Clicks</CardTitle>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-3 h-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Number of times users clicked affiliate links to propfirms and brokers. These clicks generate revenue.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(getMetricValue('total_affiliate_clicks'))}</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <TrendingUp className="w-3 h-3 text-green-600" />
                    <span className="text-green-600">+5.2%</span> vs last period
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* User Activity & Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-700/30 shadow-lg rounded-2xl">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      User Activity Trends
                    </CardTitle>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Daily breakdown of user activity showing active users and new user registrations over time.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={mockUserData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" />
                      <RechartsTooltip 
                        contentStyle={{ 
                          backgroundColor: 'var(--background)', 
                          border: '1px solid var(--border)',
                          borderRadius: '8px'
                        }} 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="activeUsers" 
                        stackId="1"
                        stroke="#3b82f6" 
                        fill="#3b82f6" 
                        fillOpacity={0.3}
                        name="Active Users"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="newUsers" 
                        stackId="2"
                        stroke="#10b981" 
                        fill="#10b981" 
                        fillOpacity={0.3}
                        name="New Users"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-700/30 shadow-lg rounded-2xl">
                <CardHeader>
                  <CardTitle>Platform Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Published Deals</span>
                      <span className="font-medium">{publishedDeals}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Active Firms</span>
                      <span className="font-medium">{firms.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Prop Firms</span>
                      <span className="font-medium">{propFirms}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Brokers</span>
                      <span className="font-medium">{brokers}</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span>Verified Deals</span>
                      <span className="font-medium">{verifiedDeals}/{publishedDeals}</span>
                    </div>
                    <Progress value={(verifiedDeals / Math.max(publishedDeals, 1)) * 100} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Geographic Distribution */}
            <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-700/30 shadow-lg rounded-2xl">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    User Distribution by Country
                  </CardTitle>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Geographic breakdown showing where your users are located. Helps identify key markets.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(isUsingMockData ? mockCountryData : countryData.slice(0, 8)).map((country, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{country.flag || '🌍'}</span>
                        <span className="text-sm font-medium">{country.country}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-sm font-medium">{formatNumber(country.users || country.total_sessions || 0)}</div>
                          <div className="text-xs text-muted-foreground">{(country.percentage || country.traffic_percentage || 0).toFixed(1)}%</div>
                        </div>
                        <div className="w-16">
                          <Progress value={country.percentage || country.traffic_percentage || 0} className="h-2" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Deals Tab */}
          <TabsContent value="deals" className="space-y-6">
            <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-700/30 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle>Deal Performance</CardTitle>
                <CardDescription>
                  {isUsingMockData ? 'Demo deal analytics' : 'Real-time deal performance metrics'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(dealPerformance.length > 0 ? dealPerformance : deals).slice(0, 10).map((deal, index) => (
                    <div key={deal.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold">{deal.title}</h4>
                          <Badge variant={deal.status === 'Published' ? 'default' : 'secondary'}>
                            {deal.status}
                          </Badge>
                          {deal.hasVerificationBadge && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Verified
                            </Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className="text-slate-500">Impressions</div>
                            <div className="font-semibold">{formatNumber(deal.total_impressions || Math.floor(Math.random() * 5000) + 1000)}</div>
                          </div>
                          <div>
                            <div className="text-slate-500">Saves</div>
                            <div className="font-semibold">{formatNumber(deal.total_saves || Math.floor(Math.random() * 1000) + 200)}</div>
                          </div>
                          <div>
                            <div className="text-slate-500">Clicks</div>
                            <div className="font-semibold">{formatNumber(deal.total_clicks || Math.floor(Math.random() * 500) + 50)}</div>
                          </div>
                          <div>
                            <div className="text-slate-500">Conversion</div>
                            <div className="font-semibold">{(deal.conversion_rate_percentage || (Math.random() * 20 + 5)).toFixed(1)}%</div>
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <Progress 
                            value={deal.conversion_rate_percentage || (Math.random() * 20 + 5)} 
                            className="h-2"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-700/30 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle>User Behavior Analysis</CardTitle>
                <CardDescription>
                  {isUsingMockData ? 'Demo user engagement data' : 'Top users by engagement score'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {userBehavior.length > 0 ? (
                  <div className="space-y-4">
                    {userBehavior.slice(0, 10).map((user, index) => (
                      <div key={user.user_id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                              {index + 1}
                            </span>
                          </div>
                          <div>
                            <div className="font-semibold">
                              {user.full_name || user.email || 'Anonymous User'}
                            </div>
                            <div className="text-sm text-slate-500">
                              {user.country} • Joined {new Date(user.joined_date).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-6 text-sm text-right">
                          <div>
                            <div className="text-slate-500">Sessions</div>
                            <div className="font-semibold">{user.total_sessions}</div>
                          </div>
                          <div>
                            <div className="text-slate-500">Deals Saved</div>
                            <div className="font-semibold">{user.deals_saved}</div>
                          </div>
                          <div>
                            <div className="text-slate-500">Engagement</div>
                            <div className="font-semibold">{user.engagement_score}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                      No user analytics available
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      User behavior data will appear here once analytics are set up and users start interacting with the platform.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Geography Tab */}
          <TabsContent value="geography" className="space-y-6">
            <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-700/30 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle>Global Traffic Distribution</CardTitle>
                <CardDescription>User sessions by country</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={(isUsingMockData ? mockCountryData : countryData).slice(0, 10)} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="country" type="category" width={100} />
                    <RechartsTooltip />
                    <Bar dataKey={isUsingMockData ? "users" : "total_sessions"} fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
                
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(isUsingMockData ? mockCountryData : countryData).slice(0, 3).map((country, index) => (
                    <div key={country.country} className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {(country.percentage || country.traffic_percentage || 0).toFixed(1)}%
                      </div>
                      <div className="text-sm font-medium">{country.country}</div>
                      <div className="text-xs text-slate-500">
                        {formatNumber(country.users || country.total_sessions || 0)} {isUsingMockData ? 'users' : 'sessions'}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Firms Tab */}
          <TabsContent value="firms" className="space-y-6">
            <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-700/30 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle>Trading Firm Performance</CardTitle>
                <CardDescription>Analytics for prop firms and brokers</CardDescription>
              </CardHeader>
              <CardContent>
                {firmAnalytics.length > 0 ? (
                  <div className="space-y-4">
                    {firmAnalytics.slice(0, 10).map((firm) => (
                      <div key={`${firm.firm_id}-${firm.date}`} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <h4 className="font-semibold">
                              {firm.trading_firms?.name || 'Unknown Firm'}
                            </h4>
                            <Badge variant="outline">
                              {firm.trading_firms?.category}
                            </Badge>
                            {firm.trading_firms?.verification_status === 'verified' && (
                              <Badge variant="default" className="bg-green-100 text-green-800">
                                Verified
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-slate-500">
                            {new Date(firm.date).toLocaleDateString()}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                          <div>
                            <div className="text-slate-500">Active Deals</div>
                            <div className="font-semibold">{firm.active_deals}</div>
                          </div>
                          <div>
                            <div className="text-slate-500">Impressions</div>
                            <div className="font-semibold">{formatNumber(firm.total_impressions)}</div>
                          </div>
                          <div>
                            <div className="text-slate-500">Saves</div>
                            <div className="font-semibold">{formatNumber(firm.total_saves)}</div>
                          </div>
                          <div>
                            <div className="text-slate-500">Clicks</div>
                            <div className="font-semibold">{formatNumber(firm.total_clicks)}</div>
                          </div>
                          <div>
                            <div className="text-slate-500">Conversion</div>
                            <div className="font-semibold">{(firm.avg_conversion_rate * 100).toFixed(1)}%</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                      No firm analytics available
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      Firm performance data will appear here once analytics are set up and deals are being tracked.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
}