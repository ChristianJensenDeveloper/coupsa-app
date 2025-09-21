import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
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
  Info
} from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, AreaChart, Area } from "recharts";
import { AdminDeal, Firm } from "./types";

interface AdminDashboardProps {
  deals: AdminDeal[];
  firms: Firm[];
}

// Mock data for comprehensive dashboard metrics
const mockUserData = [
  { date: 'Jan 1', activeUsers: 850, newUsers: 120, returningUsers: 730 },
  { date: 'Jan 2', activeUsers: 920, newUsers: 95, returningUsers: 825 },
  { date: 'Jan 3', activeUsers: 1100, newUsers: 180, returningUsers: 920 },
  { date: 'Jan 4', activeUsers: 980, newUsers: 150, returningUsers: 830 },
  { date: 'Jan 5', activeUsers: 1250, newUsers: 200, returningUsers: 1050 },
  { date: 'Jan 6', activeUsers: 1180, newUsers: 170, returningUsers: 1010 },
  { date: 'Jan 7', activeUsers: 1350, newUsers: 220, returningUsers: 1130 }
];

const mockEngagementData = [
  { name: 'Total Claims', value: 4250, change: 12.5, trend: 'up' },
  { name: 'Go to Offer Clicks', value: 3180, change: 8.7, trend: 'up' },
  { name: 'Copy Code Clicks', value: 2940, change: -2.3, trend: 'down' },
  { name: 'Conversion Rate', value: 24.8, change: 5.2, trend: 'up', suffix: '%' }
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

const mockTrafficSources = [
  { source: 'Direct', visits: 1850, percentage: 35.2, color: '#3b82f6' },
  { source: 'Google Search', visits: 1420, percentage: 27.0, color: '#10b981' },
  { source: 'Social Media', visits: 980, percentage: 18.7, color: '#f59e0b' },
  { source: 'Email', visits: 650, percentage: 12.4, color: '#ef4444' },
  { source: 'Referrals', visits: 350, percentage: 6.7, color: '#8b5cf6' }
];

const mockConversionFunnel = [
  { stage: 'Views', users: 5000, percentage: 100 },
  { stage: 'Saves', users: 2400, percentage: 48 },
  { stage: 'Clicks', users: 1800, percentage: 36 },
  { stage: 'Conversions', users: 540, percentage: 10.8 }
];

const mockCategoryBreakdown = [
  { category: 'CFD Prop', count: 12, color: '#3b82f6' },
  { category: 'Futures Prop', count: 8, color: '#10b981' },
  { category: 'Broker Bonuses', count: 15, color: '#f59e0b' }
];

export function AdminDashboard({ deals, firms }: AdminDashboardProps) {
  const [dateFilter, setDateFilter] = useState("7d");
  
  const publishedDeals = deals.filter(d => d.status === 'Published').length;
  const draftDeals = deals.filter(d => d.status === 'Draft').length;
  const archivedDeals = deals.filter(d => d.status === 'Archived').length;
  const verifiedDeals = deals.filter(d => d.hasVerificationBadge).length;

  const totalUsers = 4700;
  const activeUsers = 1350;
  const uniqueUsers = 3850;
  const newUsers = 220;
  const returningUsers = 1130;
  const retentionRate = 67.5;

  const propFirms = firms.filter(f => f.name.toLowerCase().includes('prop') || 
    ['FTMO', 'TopStep', 'Apex Trader', 'FuturesFund Pro', 'Elite Traders Fund', 'PropTrader Elite', 'MaxProfit Trading', 'FlashTrade Pro', 'Earn2Trade'].includes(f.name)).length;
  const brokers = firms.length - propFirms;

  const recentDeals = deals
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
    .slice(0, 5);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const renderTrendIcon = (trend: string, change: number) => {
    if (trend === 'up') {
      return <TrendingUp className="w-3 h-3 text-green-600" />;
    } else {
      return <TrendingDown className="w-3 h-3 text-red-600" />;
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header with Date Filter */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent">
              Dashboard Overview
            </h2>
            <p className="text-slate-600 dark:text-slate-400 font-medium">Platform performance at a glance</p>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-32 rounded-xl border-slate-200/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-0 shadow-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
                <SelectItem value="1d">Today</SelectItem>
                <SelectItem value="7d">7 Days</SelectItem>
                <SelectItem value="30d">30 Days</SelectItem>
                <SelectItem value="90d">90 Days</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

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
                    <p className="max-w-xs">All users who have ever registered on COUPZA, including active, inactive, and suspended accounts.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(totalUsers)}</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <TrendingUp className="w-3 h-3 text-green-600" />
                <span className="text-green-600">+12.5%</span> vs last period
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-700/30 shadow-lg rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-3 h-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Users who have logged in and interacted with the platform within the selected time period (swiping, saving deals, etc.).</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(activeUsers)}</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <TrendingUp className="w-3 h-3 text-green-600" />
                <span className="text-green-600">+8.7%</span> vs last period
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-700/30 shadow-lg rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-3 h-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Number of times users saved deals to their "My Deals" folder. Each swipe right or save action counts as one claim.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <MousePointer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(4250)}</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <TrendingUp className="w-3 h-3 text-green-600" />
                <span className="text-green-600">+15.2%</span> vs last period
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-700/30 shadow-lg rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-3 h-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Percentage of users who click "Go to Offer" after saving a deal. Measures how well saved deals convert to actual propfirm sign-ups.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24.8%</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <TrendingUp className="w-3 h-3 text-green-600" />
                <span className="text-green-600">+5.2%</span> vs last period
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Metrics */}
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
                    <p className="max-w-xs">Daily breakdown of user activity showing active users (logged in + engaged) and new user registrations over time.</p>
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
              <div className="flex items-center gap-2">
                <CardTitle>User Metrics</CardTitle>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-4 h-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Breakdown of user types and retention metrics for the selected time period.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <span>Unique Users</span>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-3 h-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Distinct individual users, removing duplicates from total active users count.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <span className="font-medium">{formatNumber(uniqueUsers)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <span>New Users</span>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-3 h-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Users who created their account within the selected time period.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <span className="font-medium">{formatNumber(newUsers)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <span>Returning Users</span>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-3 h-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Users who previously registered and are now active again in the selected period.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <span className="font-medium">{formatNumber(returningUsers)}</span>
                </div>
              </div>
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between text-sm mb-2">
                  <div className="flex items-center gap-1">
                    <span>Retention Rate</span>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-3 h-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Percentage of users who return to the platform after their first visit. Higher retention means better user engagement.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <span className="font-medium">{retentionRate}%</span>
                </div>
                <Progress value={retentionRate} className="h-2" />
              </div>
            </CardContent>
          </Card>
      </div>

        {/* Engagement Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-700/30 shadow-lg rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium text-muted-foreground">Total Claims</span>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-3 h-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Total number of deals saved by users. Each "swipe right" or "save" action counts as one claim.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <TrendingUp className="w-3 h-3 text-green-600" />
              </div>
              <div className="text-2xl font-bold">{formatNumber(4250)}</div>
              <div className="text-xs text-muted-foreground">
                <span className="text-green-600">+12.5%</span> vs last period
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-700/30 shadow-lg rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium text-muted-foreground">Go to Offer Clicks</span>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-3 h-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Number of times users clicked "Go to Offer" button, redirecting them to the propfirm's signup page.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <TrendingUp className="w-3 h-3 text-green-600" />
              </div>
              <div className="text-2xl font-bold">{formatNumber(3180)}</div>
              <div className="text-xs text-muted-foreground">
                <span className="text-green-600">+8.7%</span> vs last period
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-700/30 shadow-lg rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium text-muted-foreground">Copy Code Clicks</span>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-3 h-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Times users clicked "Copy Code" to copy discount/promo codes to their clipboard for use during signup.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <TrendingDown className="w-3 h-3 text-red-600" />
              </div>
              <div className="text-2xl font-bold">{formatNumber(2940)}</div>
              <div className="text-xs text-muted-foreground">
                <span className="text-red-600">-2.3%</span> vs last period
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-700/30 shadow-lg rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium text-muted-foreground">Conversion Rate</span>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-3 h-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Percentage of saved deals that result in users clicking "Go to Offer". Higher rate = better deal quality and user intent.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <TrendingUp className="w-3 h-3 text-green-600" />
              </div>
              <div className="text-2xl font-bold">24.8%</div>
              <div className="text-xs text-muted-foreground">
                <span className="text-green-600">+5.2%</span> vs last period
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Geographic Distribution & Conversion Funnel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                    <p className="max-w-xs">Geographic breakdown showing where your users are located. Helps identify key markets and expansion opportunities.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockCountryData.map((country, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{country.flag}</span>
                    <span className="text-sm font-medium">{country.country}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm font-medium">{formatNumber(country.users)}</div>
                      <div className="text-xs text-muted-foreground">{country.percentage}%</div>
                    </div>
                    <div className="w-16">
                      <Progress value={country.percentage} className="h-2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

          <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-700/30 shadow-lg rounded-2xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Conversion Funnel
                </CardTitle>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-4 h-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">User journey from viewing deals → saving them → clicking offers → actual conversions. Shows where users drop off in the process.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockConversionFunnel.map((stage, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{stage.stage}</span>
                      <div className="text-right">
                        <div className="font-medium">{formatNumber(stage.users)}</div>
                        <div className="text-xs text-muted-foreground">{stage.percentage}%</div>
                      </div>
                    </div>
                    <div className="relative">
                      <Progress value={stage.percentage} className="h-3" />
                      {index < mockConversionFunnel.length - 1 && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Drop-off: {formatNumber(stage.users - mockConversionFunnel[index + 1].users)} users
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
      </div>

      {/* Deals Overview & Traffic Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-700/30 shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="w-5 h-5" />
              Deals Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold">{deals.length}</div>
                <div className="text-xs text-muted-foreground">Total Deals</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{publishedDeals}</div>
                <div className="text-xs text-muted-foreground">Published</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{verifiedDeals}</div>
                <div className="text-xs text-muted-foreground">Verified</div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={mockCategoryBreakdown}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="category" className="text-xs" />
                <YAxis className="text-xs" />
                <RechartsTooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--background)', 
                    border: '1px solid var(--border)',
                    borderRadius: '8px'
                  }} 
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-700/30 shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Traffic Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <ResponsiveContainer width="100%" height={150}>
                  <RechartsPieChart>
                    <RechartsTooltip 
                      contentStyle={{ 
                        backgroundColor: 'var(--background)', 
                        border: '1px solid var(--border)',
                        borderRadius: '8px'
                      }} 
                    />
                    <Pie 
                      data={mockTrafficSources} 
                      dataKey="visits" 
                      nameKey="source" 
                      cx="50%" 
                      cy="50%" 
                      innerRadius={30} 
                      outerRadius={60}
                      startAngle={90}
                      endAngle={450}
                    >
                      {mockTrafficSources.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {mockTrafficSources.map((source, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded" 
                        style={{ backgroundColor: source.color }}
                      />
                      <span>{source.source}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatNumber(source.visits)}</div>
                      <div className="text-xs text-muted-foreground">{source.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Prop Firms & Performance Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Partner Firms
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Total Firms</span>
              <span className="text-2xl font-bold">{firms.length}</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Prop Firms</span>
                <Badge variant="secondary">{propFirms}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Brokers</span>
                <Badge variant="secondary">{brokers}</Badge>
              </div>
            </div>
            <div className="pt-2 border-t">
              <div className="flex items-center justify-center gap-1 text-xs text-green-600">
                <TrendingUp className="w-3 h-3" />
                <span>+2 new firms this month</span>
              </div>
            </div>
          </CardContent>
        </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Revenue Impact
                </CardTitle>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-4 h-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Estimated revenue generated from affiliate commissions when users sign up with propfirms through COUPZA referral links. Click "Revenue" in the sidebar to input actual monthly earnings from each partner.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold">$127K</div>
                <div className="text-xs text-muted-foreground">Estimated Monthly Value</div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Avg. Deal Value</span>
                  <span className="font-medium">$87</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Commission Rate</span>
                  <span className="font-medium">3.5%</span>
                </div>
              </div>
              <div className="pt-2 border-t space-y-2">
                <div className="flex items-center justify-center gap-1 text-xs text-green-600">
                  <TrendingUp className="w-3 h-3" />
                  <span>+18% vs last month</span>
                </div>
                <Button variant="outline" size="sm" className="w-full text-xs">
                  <DollarSign className="w-3 h-3 mr-1" />
                  Manage Revenue
                </Button>
              </div>
            </CardContent>
          </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Uptime</span>
                <span className="text-green-600 font-medium">99.9%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Failed Actions</span>
                <span className="text-yellow-600 font-medium">0.3%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Broken Links</span>
                <span className="text-red-600 font-medium">2</span>
              </div>
            </div>
            <div className="pt-2 border-t">
              <Button variant="outline" size="sm" className="w-full">
                <Eye className="w-3 h-3 mr-2" />
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Deals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Top Performing Deals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentDeals.slice(0, 3).map((deal, index) => (
              <div key={deal.id} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant={index === 0 ? "default" : "secondary"}>
                    #{index + 1}
                  </Badge>
                  <div className="text-xs text-muted-foreground">
                    {Math.floor(Math.random() * 500 + 200)} claims
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-sm">{deal.title}</h4>
                  <p className="text-xs text-muted-foreground">{deal.merchant || 'Unknown Firm'}</p>
                </div>
                <div className="flex items-center justify-between">
                  <Badge className="bg-green-100 text-green-800">
                    {deal.discountPercentage}% OFF
                  </Badge>
                  <div className="text-xs text-muted-foreground">
                    CTR: {(Math.random() * 15 + 10).toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      </div>
    </TooltipProvider>
  );
}