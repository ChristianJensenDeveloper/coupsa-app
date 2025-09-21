import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Eye, 
  MousePointer, 
  Heart, 
  ExternalLink,
  Globe,
  Building2,
  Activity,
  DollarSign,
  Calendar,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import {
  getAnalyticsDashboard,
  getDealPerformance,
  getUserBehaviorSummary,
  getCountryTrafficDistribution,
  getFirmAnalytics,
  runDailyAnalyticsUpdate,
  type AnalyticsDashboard as AnalyticsDashboardType
} from '../lib/analytics-database';
import { toast } from 'sonner@2.0.3';

interface AnalyticsDashboardProps {
  className?: string;
}

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];

export function AnalyticsDashboard({ className }: AnalyticsDashboardProps) {
  const [dashboardData, setDashboardData] = useState<AnalyticsDashboardType | null>(null);
  const [dealPerformance, setDealPerformance] = useState<any[]>([]);
  const [userBehavior, setUserBehavior] = useState<any[]>([]);
  const [countryData, setCountryData] = useState<any[]>([]);
  const [firmAnalytics, setFirmAnalytics] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState('30'); // days
  const [selectedTab, setSelectedTab] = useState('overview');

  const loadAnalyticsData = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    
    try {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - parseInt(dateRange) * 24 * 60 * 60 * 1000)
        .toISOString().split('T')[0];

      // Load all analytics data in parallel
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

      if (dashboardResult.data) setDashboardData(dashboardResult.data);
      if (dealResult.data) setDealPerformance(dealResult.data);
      if (userResult.data) setUserBehavior(userResult.data);
      if (countryResult.data) setCountryData(countryResult.data);
      if (firmResult.data) setFirmAnalytics(firmResult.data);

      if (dashboardResult.error || dealResult.error || userResult.error || 
          countryResult.error || firmResult.error) {
        toast.error('Some analytics data failed to load');
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
      toast.error('Failed to load analytics data');
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
    // Create CSV export of current data
    const csvData = [
      ['Metric', 'Value', 'Date Range'],
      ['Total Users', dashboardData?.overview.total_users || 0, `${dateRange} days`],
      ['Total Sessions', dashboardData?.overview.total_sessions || 0, `${dateRange} days`],
      ['Page Views', dashboardData?.overview.total_page_views || 0, `${dateRange} days`],
      ['Deals Viewed', dashboardData?.overview.total_deals_viewed || 0, `${dateRange} days`],
      ['Affiliate Clicks', dashboardData?.overview.total_affiliate_clicks || 0, `${dateRange} days`]
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reduzed-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Analytics data exported');
  };

  useEffect(() => {
    loadAnalyticsData();
  }, [dateRange]);

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

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Analytics Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Track user behavior and platform performance
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
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
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
          
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="deals">Deals</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="geography">Geography</TabsTrigger>
          <TabsTrigger value="firms">Firms</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber(dashboardData?.overview.total_users || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Last {dateRange} days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Page Views</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber(dashboardData?.overview.total_page_views || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatNumber(dashboardData?.overview.total_sessions || 0)} sessions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Deals Viewed</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber(dashboardData?.overview.total_deals_viewed || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Avg {formatDuration(dashboardData?.overview.avg_session_duration || 0)} per session
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Affiliate Clicks</CardTitle>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber(dashboardData?.overview.total_affiliate_clicks || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Revenue generating clicks
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Country Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Traffic by Country</CardTitle>
                <CardDescription>Top countries by session count</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={dashboardData?.country_distribution?.slice(0, 5) || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ country, percentage }) => `${country} (${percentage}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="sessions"
                    >
                      {(dashboardData?.country_distribution || []).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Performing Deals */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Deals</CardTitle>
                <CardDescription>By conversion rate</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dashboardData?.top_performing_deals?.slice(0, 5) || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="title" 
                      tick={{ fontSize: 12 }}
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="conversion_rate" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Deals Tab */}
        <TabsContent value="deals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Deal Performance</CardTitle>
              <CardDescription>
                Detailed analytics for all deals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dealPerformance.slice(0, 10).map((deal, index) => (
                  <div key={deal.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold">{deal.title}</h4>
                        <Badge variant={deal.status === 'Active' ? 'default' : 'secondary'}>
                          {deal.status}
                        </Badge>
                        {deal.firm_name && (
                          <span className="text-sm text-slate-600 dark:text-slate-400">
                            by {deal.firm_name}
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-slate-500">Impressions</div>
                          <div className="font-semibold">{formatNumber(deal.total_impressions)}</div>
                        </div>
                        <div>
                          <div className="text-slate-500">Saves</div>
                          <div className="font-semibold">{formatNumber(deal.total_saves)}</div>
                        </div>
                        <div>
                          <div className="text-slate-500">Clicks</div>
                          <div className="font-semibold">{formatNumber(deal.total_clicks)}</div>
                        </div>
                        <div>
                          <div className="text-slate-500">Conversion</div>
                          <div className="font-semibold">{deal.conversion_rate_percentage}%</div>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <Progress 
                          value={deal.conversion_rate_percentage} 
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
          <Card>
            <CardHeader>
              <CardTitle>User Behavior Analysis</CardTitle>
              <CardDescription>
                Top users by engagement score
              </CardDescription>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Geography Tab */}
        <TabsContent value="geography" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Global Traffic Distribution</CardTitle>
              <CardDescription>
                User sessions by country
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={countryData.slice(0, 15)} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="country" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="total_sessions" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                {countryData.slice(0, 3).map((country, index) => (
                  <div key={country.country} className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {country.traffic_percentage}%
                    </div>
                    <div className="text-sm font-medium">{country.country}</div>
                    <div className="text-xs text-slate-500">
                      {formatNumber(country.total_sessions)} sessions
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Firms Tab */}
        <TabsContent value="firms" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Trading Firm Performance</CardTitle>
              <CardDescription>
                Analytics for prop firms and brokers
              </CardDescription>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}