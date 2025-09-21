import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Progress } from './ui/progress';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Database,
  Activity,
  Users,
  Eye,
  MousePointer,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  PlayCircle
} from 'lucide-react';
import { 
  getAnalyticsDashboard,
  getDealPerformance,
  getUserBehaviorSummary,
  getCountryTrafficDistribution,
  getFirmAnalytics,
  runDailyAnalyticsUpdate,
  trackUserAction,
  startUserSession,
  endUserSession,
  AnalyticsSession
} from '../lib/analytics-database';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner@2.0.3';

interface TestResult {
  name: string;
  description: string;
  status: 'pending' | 'running' | 'success' | 'error';
  error?: string;
  duration?: number;
  data?: any;
}

interface AnalyticsTestSuiteProps {
  className?: string;
}

export function AnalyticsTestSuite({ className }: AnalyticsTestSuiteProps) {
  const [tests, setTests] = useState<TestResult[]>([
    {
      name: 'Database Tables',
      description: 'Check if analytics tables exist',
      status: 'pending'
    },
    {
      name: 'Session Management',
      description: 'Test user session creation and tracking',
      status: 'pending'
    },
    {
      name: 'Action Tracking',
      description: 'Test user action tracking functions',
      status: 'pending'
    },
    {
      name: 'Analytics Functions',
      description: 'Test database analytics functions',
      status: 'pending'
    },
    {
      name: 'Dashboard Data',
      description: 'Test analytics dashboard data retrieval',
      status: 'pending'
    },
    {
      name: 'Views & Aggregations',
      description: 'Test analytics views and data aggregation',
      status: 'pending'
    }
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const [testSession, setTestSession] = useState<AnalyticsSession | null>(null);

  const updateTestStatus = (index: number, updates: Partial<TestResult>) => {
    setTests(prev => prev.map((test, i) => 
      i === index ? { ...test, ...updates } : test
    ));
  };

  const runTest = async (testIndex: number, testFn: () => Promise<any>) => {
    const startTime = Date.now();
    updateTestStatus(testIndex, { status: 'running' });

    try {
      const result = await testFn();
      const duration = Date.now() - startTime;
      
      updateTestStatus(testIndex, { 
        status: 'success', 
        duration,
        data: result
      });
      
      return result;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      
      updateTestStatus(testIndex, { 
        status: 'error', 
        duration,
        error: error.message || 'Unknown error'
      });
      
      throw error;
    }
  };

  // Test 1: Check database tables
  const testDatabaseTables = async () => {
    const tables = [
      'user_sessions',
      'user_actions', 
      'deal_analytics',
      'firm_analytics',
      'platform_analytics',
      'country_analytics'
    ];

    const results = [];
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*', { count: 'exact' })
        .limit(1);

      if (error) {
        throw new Error(`Table ${table} not found or inaccessible: ${error.message}`);
      }
      
      results.push({ table, exists: true, accessible: true });
    }

    // Check if views exist
    const views = [
      'deal_performance_summary',
      'user_behavior_summary', 
      'country_traffic_distribution'
    ];

    for (const view of views) {
      const { data, error } = await supabase
        .from(view)
        .select('*')
        .limit(1);

      if (error) {
        throw new Error(`View ${view} not found: ${error.message}`);
      }
      
      results.push({ view, exists: true });
    }

    return { tables: results.filter(r => 'table' in r), views: results.filter(r => 'view' in r) };
  };

  // Test 2: Session management
  const testSessionManagement = async () => {
    // Use undefined instead of invalid UUID string for testing
    const session = new AnalyticsSession();
    const sessionResult = await session.start(window.location.href, {
      source: 'test',
      medium: 'analytics-test',
      campaign: 'setup-verification'
    });

    if (sessionResult.error) {
      throw new Error(`Session creation failed: ${sessionResult.error.message}`);
    }

    // Track a test action
    await session.trackPageView('/analytics-test');
    
    // End session
    await session.end();
    
    setTestSession(session);
    
    return {
      sessionId: session.getSessionId(),
      userId: session.getUserId(),
      success: true
    };
  };

  // Test 3: Action tracking
  const testActionTracking = async () => {
    const actions = [
      'page_view',
      'deal_view', 
      'deal_swipe_right',
      'deal_swipe_left',
      'deal_save',
      'deal_click',
      'affiliate_click',
      'search',
      'category_filter'
    ] as const;

    const results = [];
    
    for (const action of actions) {
      const result = await trackUserAction(action, {
        // Use undefined for all ID fields to avoid UUID issues
        userId: undefined,
        sessionId: undefined,
        dealId: undefined,
        firmId: undefined,
        pageUrl: `/test/${action}`,
        category: 'Test Category',
        searchQuery: action === 'search' ? 'test query' : undefined,
        actionData: { test: true, action_type: action }
      });

      if (result.error) {
        throw new Error(`Failed to track ${action}: ${result.error.message}`);
      }

      results.push({ action, success: true });
    }

    return results;
  };

  // Test 4: Analytics functions
  const testAnalyticsFunctions = async () => {
    const functions = [
      {
        name: 'get_analytics_dashboard',
        test: () => getAnalyticsDashboard()
      },
      {
        name: 'update_deal_analytics', 
        test: () => runDailyAnalyticsUpdate()
      }
    ];

    const results = [];
    
    for (const func of functions) {
      const result = await func.test();
      
      if (result.error) {
        throw new Error(`Function ${func.name} failed: ${result.error.message}`);
      }
      
      results.push({ 
        function: func.name, 
        success: true,
        hasData: !!result.data
      });
    }

    return results;
  };

  // Test 5: Dashboard data
  const testDashboardData = async () => {
    const [
      dashboardResult,
      dealResult,
      userResult,
      countryResult,
      firmResult
    ] = await Promise.all([
      getAnalyticsDashboard(),
      getDealPerformance(),
      getUserBehaviorSummary(),
      getCountryTrafficDistribution(),
      getFirmAnalytics()
    ]);

    const results = {
      dashboard: { 
        success: !dashboardResult.error,
        error: dashboardResult.error?.message,
        hasData: !!dashboardResult.data
      },
      deals: { 
        success: !dealResult.error,
        error: dealResult.error?.message,
        count: dealResult.data?.length || 0
      },
      users: { 
        success: !userResult.error,
        error: userResult.error?.message,
        count: userResult.data?.length || 0
      },
      countries: { 
        success: !countryResult.error,
        error: countryResult.error?.message,
        count: countryResult.data?.length || 0
      },
      firms: { 
        success: !firmResult.error,
        error: firmResult.error?.message,
        count: firmResult.data?.length || 0
      }
    };

    // Check if any failed
    const failures = Object.entries(results).filter(([key, result]) => !result.success);
    if (failures.length > 0) {
      throw new Error(`Dashboard data retrieval failed: ${failures.map(([key, result]) => `${key}: ${result.error}`).join(', ')}`);
    }

    return results;
  };

  // Test 6: Views and aggregations
  const testViewsAndAggregations = async () => {
    // Test each view directly
    const viewTests = [
      {
        name: 'deal_performance_summary',
        query: () => supabase.from('deal_performance_summary').select('*').limit(5)
      },
      {
        name: 'user_behavior_summary',
        query: () => supabase.from('user_behavior_summary').select('*').limit(5)
      },
      {
        name: 'country_traffic_distribution', 
        query: () => supabase.from('country_traffic_distribution').select('*').limit(5)
      }
    ];

    const results = [];
    
    for (const view of viewTests) {
      const { data, error } = await view.query();
      
      if (error) {
        throw new Error(`View ${view.name} query failed: ${error.message}`);
      }
      
      results.push({
        view: view.name,
        success: true,
        rowCount: data?.length || 0
      });
    }

    return results;
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setOverallProgress(0);

    const testFunctions = [
      testDatabaseTables,
      testSessionManagement,
      testActionTracking,
      testAnalyticsFunctions,
      testDashboardData,
      testViewsAndAggregations
    ];

    try {
      for (let i = 0; i < testFunctions.length; i++) {
        await runTest(i, testFunctions[i]);
        setOverallProgress(((i + 1) / testFunctions.length) * 100);
        
        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      toast.success('All analytics tests completed successfully!');
    } catch (error) {
      console.error('Test suite failed:', error);
      toast.error('Some analytics tests failed. Check the results below.');
    } finally {
      setIsRunning(false);
    }
  };

  const resetTests = () => {
    setTests(prev => prev.map(test => ({ 
      ...test, 
      status: 'pending' as const, 
      error: undefined, 
      duration: undefined,
      data: undefined 
    })));
    setOverallProgress(0);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'running':
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    const variants = {
      success: 'default',
      error: 'destructive', 
      running: 'secondary',
      pending: 'outline'
    } as const;

    return (
      <Badge variant={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const successCount = tests.filter(t => t.status === 'success').length;
  const errorCount = tests.filter(t => t.status === 'error').length;
  const pendingCount = tests.filter(t => t.status === 'pending').length;

  return (
    <div className={className}>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Activity className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Analytics Test Suite
          </h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            Comprehensive testing of your REDUZED analytics backend
          </p>
        </div>

        {/* Overall Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Test Progress</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">
                  {successCount} passed • {errorCount} failed • {pendingCount} pending
                </span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={overallProgress} className="h-2" />
            
            <div className="flex gap-3">
              <Button 
                onClick={runAllTests} 
                disabled={isRunning}
                className="flex items-center gap-2"
              >
                {isRunning ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <PlayCircle className="w-4 h-4" />
                )}
                {isRunning ? 'Running Tests...' : 'Run All Tests'}
              </Button>
              
              <Button 
                onClick={resetTests} 
                variant="outline"
                disabled={isRunning}
              >
                Reset Tests
              </Button>
            </div>

            {isRunning && (
              <Alert>
                <Activity className="h-4 w-4" />
                <AlertDescription>
                  Testing your analytics backend... This may take a few moments.
                </AlertDescription>
              </Alert>
            )}

            {successCount === tests.length && successCount > 0 && (
              <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 dark:text-green-200">
                  🎉 All tests passed! Your analytics backend is fully functional and ready for production.
                </AlertDescription>
              </Alert>
            )}

            {errorCount > 0 && (
              <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800 dark:text-red-200">
                  Some tests failed. Please check the database setup and ensure all SQL has been executed properly.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Individual Test Results */}
        <div className="grid gap-4">
          {tests.map((test, index) => (
            <Card key={test.name}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(test.status)}
                    <span>{test.name}</span>
                    {getStatusBadge(test.status)}
                  </div>
                  {test.duration && (
                    <span className="text-sm text-slate-500">
                      {test.duration}ms
                    </span>
                  )}
                </CardTitle>
                <CardDescription>
                  {test.description}
                </CardDescription>
              </CardHeader>
              
              {(test.status === 'error' || test.data) && (
                <CardContent>
                  {test.status === 'error' && test.error && (
                    <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800 dark:text-red-200">
                        <strong>Error:</strong> {test.error}
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {test.status === 'success' && test.data && (
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                      <pre className="text-xs text-slate-700 dark:text-slate-300 overflow-auto max-h-32">
                        {JSON.stringify(test.data, null, 2)}
                      </pre>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {/* Next Steps */}
        {successCount === tests.length && successCount > 0 && (
          <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
            <CardHeader>
              <CardTitle className="text-green-800 dark:text-green-200">
                🚀 Analytics Ready!
              </CardTitle>
              <CardDescription className="text-green-700 dark:text-green-300">
                Your analytics backend is fully operational. Here's what you can do next:
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-green-800 dark:text-green-200">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                <span>All database tables and functions are working</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>User session and action tracking is active</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <span>Analytics dashboard will start showing real data</span>
              </div>
              <div className="flex items-center gap-2">
                <MousePointer className="w-4 h-4" />
                <span>All user interactions are being tracked</span>
              </div>
              <div className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                <span>Affiliate clicks and revenue tracking enabled</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}