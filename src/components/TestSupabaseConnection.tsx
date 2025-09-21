import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { AlertCircle, CheckCircle, Database, Users, CreditCard, Activity } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { toast } from 'sonner@2.0.3'
import { AnalyticsSetupNotice } from './AnalyticsSetupNotice'
import { AnalyticsTestSuite } from './AnalyticsTestSuite'

interface TestResult {
  test: string
  status: 'pending' | 'success' | 'error'
  message: string
  duration?: number
}

export function TestSupabaseConnection() {
  const [tests, setTests] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [overallStatus, setOverallStatus] = useState<'pending' | 'success' | 'error'>('pending')
  const [hasValidConfig, setHasValidConfig] = useState(false)
  const [hasAnalyticsTables, setHasAnalyticsTables] = useState<boolean | null>(null)

  // Check if Supabase is properly configured
  useEffect(() => {
    const checkConfig = async () => {
      // Check if we're using the real credentials
      const hasRealUrl = supabase.supabaseUrl.includes('unghlvhuvbuxygsolzrk.supabase.co')
      const hasRealKey = supabase.supabaseKey.length > 100 // Real keys are much longer
      
      setHasValidConfig(hasRealUrl && hasRealKey)

      // Check if analytics tables exist
      if (hasRealUrl && hasRealKey) {
        try {
          const { error } = await supabase.from('user_sessions').select('count', { count: 'exact', head: true })
          setHasAnalyticsTables(!error)
        } catch (error) {
          setHasAnalyticsTables(false)
        }
      }
    }
    
    checkConfig()
  }, [])

  const updateTestResult = (testName: string, status: 'success' | 'error', message: string, duration: number) => {
    setTests(prev => prev.map(test => 
      test.test === testName 
        ? { ...test, status, message, duration }
        : test
    ))
  }

  const runTests = async () => {
    if (!hasValidConfig) {
      toast.error('Supabase credentials are not properly configured!')
      return
    }
    
    setIsRunning(true)
    setOverallStatus('pending')
    
    const testList = [
      'Database Connection',
      'Authentication System',
      'Profiles Table',
      'Trading Firms Table',
      'Deals Table',
      'User Saved Deals Table',
      'User Actions Table'
    ]

    setTests(testList.map(test => ({
      test,
      status: 'pending',
      message: 'Running...'
    })))

    let allPassed = true

    // Test 1: Database Connection
    try {
      const start = Date.now()
      const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true })
      const duration = Date.now() - start
      
      if (error) throw error
      updateTestResult('Database Connection', 'success', 'Connected successfully', duration)
    } catch (error: any) {
      updateTestResult('Database Connection', 'error', error.message || 'Connection failed', 0)
      allPassed = false
    }

    // Test 2: Authentication System
    try {
      const start = Date.now()
      const { data: { user } } = await supabase.auth.getUser()
      const duration = Date.now() - start
      
      updateTestResult('Authentication System', 'success', 
        user ? `Authenticated as ${user.email}` : 'Auth system ready (not logged in)', duration)
    } catch (error: any) {
      updateTestResult('Authentication System', 'error', error.message || 'Auth test failed', 0)
      allPassed = false
    }

    // Test 3: Profiles Table
    try {
      const start = Date.now()
      const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true })
      const duration = Date.now() - start
      
      if (error) throw error
      updateTestResult('Profiles Table', 'success', 
        `Table accessible (${data || 0} records)`, duration)
    } catch (error: any) {
      updateTestResult('Profiles Table', 'error', error.message || 'Table not accessible', 0)
      allPassed = false
    }

    // Test 4: Trading Firms Table
    try {
      const start = Date.now()
      const { data, error } = await supabase.from('trading_firms').select('count', { count: 'exact', head: true })
      const duration = Date.now() - start
      
      if (error) throw error
      updateTestResult('Trading Firms Table', 'success', 
        `Table accessible (${data || 0} records)`, duration)
    } catch (error: any) {
      updateTestResult('Trading Firms Table', 'error', error.message || 'Table not accessible', 0)
      allPassed = false
    }

    // Test 5: Deals Table
    try {
      const start = Date.now()
      const { data, error } = await supabase.from('deals').select('count', { count: 'exact', head: true })
      const duration = Date.now() - start
      
      if (error) throw error
      updateTestResult('Deals Table', 'success', 
        `Table accessible (${data || 0} records)`, duration)
    } catch (error: any) {
      updateTestResult('Deals Table', 'error', error.message || 'Table not accessible', 0)
      allPassed = false
    }

    // Test 6: User Saved Deals Table
    try {
      const start = Date.now()
      const { data, error } = await supabase.from('user_saved_deals').select('count', { count: 'exact', head: true })
      const duration = Date.now() - start
      
      if (error) throw error
      updateTestResult('User Saved Deals Table', 'success', 
        `Table accessible (${data || 0} records)`, duration)
    } catch (error: any) {
      updateTestResult('User Saved Deals Table', 'error', error.message || 'Table not accessible', 0)
      allPassed = false
    }

    // Test 7: User Actions Table
    try {
      const start = Date.now()
      const { data, error } = await supabase.from('user_actions').select('count', { count: 'exact', head: true })
      const duration = Date.now() - start
      
      if (error) throw error
      updateTestResult('User Actions Table', 'success', 
        `Table accessible (${data || 0} records)`, duration)
    } catch (error: any) {
      updateTestResult('User Actions Table', 'error', error.message || 'Table not accessible', 0)
      allPassed = false
    }

    setOverallStatus(allPassed ? 'success' : 'error')
    setIsRunning(false)
    
    if (allPassed) {
      toast.success('🎉 All Supabase tests passed! Your database is ready for REDUZED.')
    } else {
      toast.error('⚠️ Some tests failed. You need to set up your database tables first.')
    }
  }

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />
      default:
        return <div className="w-4 h-4 rounded-full bg-yellow-400 animate-pulse" />
    }
  }

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Passed</Badge>
      case 'error':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Failed</Badge>
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Running</Badge>
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Tabs defaultValue={hasAnalyticsTables === false ? "analytics-setup" : "basic-tests"} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic-tests">Database Tests</TabsTrigger>
          <TabsTrigger value="analytics-setup">
            Analytics Setup
            {hasAnalyticsTables === false && (
              <Badge variant="destructive" className="ml-2 scale-75">
                Required
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="analytics-tests">
            Analytics Tests
            {hasAnalyticsTables === true && (
              <Badge variant="default" className="ml-2 scale-75 bg-green-100 text-green-800">
                Ready
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic-tests" className="space-y-6">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Database className="w-6 h-6 text-blue-600" />
                REDUZED Supabase Database Test
              </CardTitle>
              <CardDescription>
                Verify your database is set up correctly and ready for production
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!hasValidConfig ? (
                <div className="space-y-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <h3 className="font-semibold text-red-800">Database Not Connected</h3>
                    </div>
                    <p className="text-red-700 mb-4">
                      Your Supabase credentials are not configured correctly. 
                    </p>
                    <div className="space-y-2 text-sm text-red-700">
                      <div>Expected URL: unghlvhuvbuxygsolzrk.supabase.co</div>
                      <div>Current URL: {supabase.supabaseUrl}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <h3 className="font-semibold text-green-800">Database Connected</h3>
                    </div>
                    <p className="text-green-700 text-sm mt-1">
                      Supabase credentials are configured correctly. Ready to test database tables!
                    </p>
                  </div>
                </div>
              )}
              
              <div className="flex justify-center mb-6 mt-6">
                <Button 
                  onClick={runTests} 
                  disabled={isRunning || !hasValidConfig}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isRunning ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Testing Database...
                    </>
                  ) : (
                    'Test Database Tables'
                  )}
                </Button>
              </div>

              {tests.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Test Results</h3>
                    {overallStatus !== 'pending' && (
                      <Badge className={
                        overallStatus === 'success' 
                          ? 'bg-green-100 text-green-800 border-green-200' 
                          : 'bg-red-100 text-red-800 border-red-200'
                      }>
                        {overallStatus === 'success' ? 'All Tests Passed' : 'Some Tests Failed'}
                      </Badge>
                    )}
                  </div>

                  <div className="grid gap-3">
                    {tests.map((test, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(test.status)}
                          <div>
                            <div className="font-medium">{test.test}</div>
                            <div className="text-sm text-slate-600">{test.message}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {test.duration && (
                            <span className="text-xs text-slate-500">{test.duration}ms</span>
                          )}
                          {getStatusBadge(test.status)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {overallStatus === 'error' && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-5 h-5 text-yellow-600" />
                        <h3 className="font-semibold text-yellow-800">Next Steps</h3>
                      </div>
                      <p className="text-yellow-700 mb-2">
                        Some database tables are missing. You need to run the SQL setup:
                      </p>
                      <ol className="text-sm text-yellow-700 space-y-1 list-decimal ml-4">
                        <li>Go to your Supabase dashboard</li>
                        <li>Navigate to SQL Editor</li>
                        <li>Copy and run the SQL from /database-setup.sql</li>
                        <li>Come back and run tests again</li>
                      </ol>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Database Schema Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                REDUZED Database Schema
              </CardTitle>
              <CardDescription>
                Tables and functionality for your deal finder app
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <h4 className="font-semibold">User Management</h4>
                  </div>
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li>• profiles - User accounts and preferences</li>
                    <li>• user_saved_deals - Wallet/saved deals</li>
                    <li>• user_actions - Swipe tracking and analytics</li>
                  </ul>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="w-4 h-4 text-green-600" />
                    <h4 className="font-semibold">Deal Management</h4>
                  </div>
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li>• deals - All prop firm deals and offers</li>
                    <li>• trading_firms - Prop firms and broker info</li>
                    <li>• Affiliate tracking and promo codes</li>
                  </ul>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-purple-600" />
                    <h4 className="font-semibold">Analytics & Tracking</h4>
                  </div>
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li>• user_sessions - Session tracking</li>
                    <li>• deal_analytics - Deal performance</li>
                    <li>• firm_analytics - Prop firm metrics</li>
                  </ul>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-orange-600" />
                    <h4 className="font-semibold">Security & Compliance</h4>
                  </div>
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li>• Row Level Security enabled</li>
                    <li>• GDPR compliant data handling</li>
                    <li>• Terms and privacy controls</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics-setup">
          <AnalyticsSetupNotice />
        </TabsContent>

        <TabsContent value="analytics-tests">
          <AnalyticsTestSuite />
        </TabsContent>
      </Tabs>
    </div>
  )
}