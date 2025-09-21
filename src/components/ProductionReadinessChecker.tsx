import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { AlertTriangle, CheckCircle, Clock, Database, Shield, Globe, FileText, TrendingUp, Settings, Users, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from "./ui/alert";
import { useDealsData } from "../hooks/useDealsData";

interface CheckItem {
  id: string;
  title: string;
  description: string;
  status: 'complete' | 'warning' | 'critical';
  category: 'data' | 'legal' | 'technical' | 'business' | 'security';
  details?: string;
  actionRequired?: string;
}

const ProductionReadinessChecker: React.FC = () => {
  const [checks, setChecks] = useState<CheckItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Check real data integration status
  const { coupons, loading: dealsLoading, error: dealsError } = useDealsData();

  useEffect(() => {
    // Simulate checking various production readiness items
    const runChecks = async () => {
      setLoading(true);
      
      // Simulate async checks
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Determine data integration status
      const hasRealData = !dealsError && coupons.length > 0;
      const dataIntegrationStatus: 'complete' | 'warning' | 'critical' = hasRealData ? 'complete' : 'critical';
      
      const checkResults: CheckItem[] = [
        // DATA INTEGRATION
        {
          id: 'production-data',
          title: 'Production Data Integration',
          description: hasRealData 
            ? `Successfully loaded ${coupons.length} deals from database`
            : 'App is still using mock data instead of real deals from database',
          status: dataIntegrationStatus,
          category: 'data',
          details: hasRealData 
            ? 'Connected to Supabase and fetching real deal data'
            : dealsError 
              ? `Database error: ${dealsError}`
              : 'Currently using mockCoupons array in App.tsx',
          actionRequired: hasRealData 
            ? undefined
            : 'Replace mockCoupons with Supabase data fetching'
        },
        {
          id: 'affiliate-links',
          title: 'Real Affiliate Links',
          description: 'Mock affiliate URLs need to be replaced with real partnership links',
          status: 'critical',
          category: 'data',
          details: 'Using placeholder URLs like "https://ftmo.com/signup?ref=koocao"',
          actionRequired: 'Obtain real affiliate links from prop firms and brokers'
        },
        {
          id: 'loading-states',
          title: 'Loading States & Error Handling',
          description: 'Missing loading states and error handling for data fetching',
          status: 'warning',
          category: 'technical',
          actionRequired: 'Add loading spinners and error boundaries'
        },

        // LEGAL & COMPLIANCE
        {
          id: 'affiliate-disclosure',
          title: 'FTC Affiliate Disclosure',
          description: 'Required legal disclosure for affiliate marketing missing',
          status: 'critical',
          category: 'legal',
          details: 'FTC requires clear disclosure of affiliate relationships',
          actionRequired: 'Add affiliate disclosure statement to all deal pages'
        },
        {
          id: 'gdpr-compliance',
          title: 'GDPR Cookie Consent',
          description: 'EU users need explicit cookie consent',
          status: 'warning',
          category: 'legal',
          actionRequired: 'Implement cookie consent banner'
        },
        {
          id: 'terms-review',
          title: 'Legal Document Review',
          description: 'Terms and Privacy Policy should be reviewed by legal counsel',
          status: 'warning',
          category: 'legal',
          actionRequired: 'Get legal review for affiliate marketing compliance'
        },

        // SEO & DISCOVERABILITY
        {
          id: 'meta-tags',
          title: 'SEO Meta Tags',
          description: 'Missing essential meta tags for search engines',
          status: 'warning',
          category: 'technical',
          details: 'No title, description, or Open Graph tags',
          actionRequired: 'Add meta tags for better search visibility'
        },
        {
          id: 'sitemap',
          title: 'XML Sitemap',
          description: 'Search engines need a sitemap to index your content',
          status: 'warning',
          category: 'technical',
          actionRequired: 'Generate and submit sitemap to Google Search Console'
        },
        {
          id: 'structured-data',
          title: 'Structured Data',
          description: 'Missing schema markup for rich snippets',
          status: 'warning',
          category: 'technical',
          actionRequired: 'Add JSON-LD structured data for deals'
        },

        // BUSINESS & ANALYTICS
        {
          id: 'analytics-setup',
          title: 'Analytics Tracking',
          description: 'Need comprehensive analytics for business metrics',
          status: 'warning',
          category: 'business',
          details: 'Has analytics components but may need Google Analytics setup',
          actionRequired: 'Configure Google Analytics and conversion tracking'
        },
        {
          id: 'revenue-tracking',
          title: 'Affiliate Revenue Tracking',
          description: 'Need system to track affiliate conversions and revenue',
          status: 'critical',
          category: 'business',
          actionRequired: 'Implement affiliate link tracking and revenue reporting'
        },

        // SECURITY & PERFORMANCE
        {
          id: 'security-headers',
          title: 'Security Headers',
          description: 'Missing important security headers',
          status: 'warning',
          category: 'security',
          actionRequired: 'Add CSP, HSTS, and other security headers'
        },
        {
          id: 'rate-limiting',
          title: 'API Rate Limiting',
          description: 'Need protection against API abuse',
          status: 'warning',
          category: 'security',
          actionRequired: 'Implement rate limiting on Supabase functions'
        },
        {
          id: 'performance-optimization',
          title: 'Performance Optimization',
          description: 'Code splitting and image optimization needed',
          status: 'warning',
          category: 'technical',
          actionRequired: 'Optimize bundle size and implement lazy loading'
        },

        // OPERATIONAL
        {
          id: 'monitoring',
          title: 'System Monitoring',
          description: 'Need monitoring and alerting for production issues',
          status: 'warning',
          category: 'technical',
          actionRequired: 'Set up error tracking and uptime monitoring'
        },
        {
          id: 'backup-strategy',
          title: 'Database Backup',
          description: 'Ensure automated backups are configured',
          status: 'warning',
          category: 'data',
          actionRequired: 'Verify Supabase backup settings'
        },
        {
          id: 'content-management',
          title: 'Deal Management Process',
          description: 'Need workflow for managing and updating deals',
          status: 'complete',
          category: 'business',
          details: 'Admin panel with approval workflow is implemented'
        }
      ];

      setChecks(checkResults);
      setLoading(false);
    };

    runChecks();
  }, []);

  const getStatusIcon = (status: CheckItem['status']) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'critical':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusBadge = (status: CheckItem['status']) => {
    switch (status) {
      case 'complete':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">Complete</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">Warning</Badge>;
      case 'critical':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">Critical</Badge>;
    }
  };

  const getCategoryIcon = (category: CheckItem['category']) => {
    switch (category) {
      case 'data':
        return <Database className="w-4 h-4" />;
      case 'legal':
        return <FileText className="w-4 h-4" />;
      case 'technical':
        return <Settings className="w-4 h-4" />;
      case 'business':
        return <TrendingUp className="w-4 h-4" />;
      case 'security':
        return <Shield className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  const categoryCounts = checks.reduce((acc, check) => {
    acc[check.category] = (acc[check.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusCounts = checks.reduce((acc, check) => {
    acc[check.status] = (acc[check.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const criticalIssues = checks.filter(check => check.status === 'critical');
  const readinessScore = Math.round(((statusCounts.complete || 0) / checks.length) * 100);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-blue-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Checking Production Readiness</h2>
          <p className="text-slate-600 dark:text-slate-400">Analyzing your app for launch...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-blue-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      <div className="container mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl">
            <TrendingUp className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Production Readiness Check
          </h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Before going live, here's what needs attention to ensure a successful launch of KOOCAO.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-white/30 dark:border-slate-700/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${readinessScore >= 80 ? 'bg-green-500' : readinessScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                Readiness Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                {readinessScore}%
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {readinessScore >= 80 ? 'Almost ready!' : readinessScore >= 60 ? 'Getting there' : 'Needs work'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-white/30 dark:border-slate-700/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                Critical Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                {statusCounts.critical || 0}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Must fix before launch
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-white/30 dark:border-slate-700/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {statusCounts.complete || 0}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Ready to go
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Critical Issues Alert */}
        {criticalIssues.length > 0 && (
          <Alert className="mb-8 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 dark:text-red-200">
              <strong>⚠️ {criticalIssues.length} Critical Issues Found:</strong> These must be resolved before launching to avoid legal or technical problems.
            </AlertDescription>
          </Alert>
        )}

        {/* Detailed Checks */}
        <div className="space-y-6">
          {Object.entries(categoryCounts).map(([category, count]) => (
            <Card key={category} className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-white/30 dark:border-slate-700/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  {getCategoryIcon(category as CheckItem['category'])}
                  <span className="capitalize">{category}</span>
                  <Badge variant="outline" className="ml-auto">
                    {count} items
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {category === 'data' && 'Database integration and data management'}
                  {category === 'legal' && 'Legal compliance and regulatory requirements'}
                  {category === 'technical' && 'Technical implementation and performance'}
                  {category === 'business' && 'Business metrics and revenue tracking'}
                  {category === 'security' && 'Security measures and protection'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {checks
                  .filter(check => check.category === category)
                  .map((check, index) => (
                    <div key={check.id}>
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1">
                          {getStatusIcon(check.status)}
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between gap-4">
                            <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                              {check.title}
                            </h4>
                            {getStatusBadge(check.status)}
                          </div>
                          <p className="text-slate-600 dark:text-slate-400">
                            {check.description}
                          </p>
                          {check.details && (
                            <p className="text-sm text-slate-500 dark:text-slate-500 italic">
                              {check.details}
                            </p>
                          )}
                          {check.actionRequired && (
                            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                Action Required: {check.actionRequired}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      {index < checks.filter(c => c.category === category).length - 1 && (
                        <Separator className="mt-4" />
                      )}
                    </div>
                  ))}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Priority Action Items */}
        <Card className="mt-8 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-xl text-blue-800 dark:text-blue-200">
              🚀 Next Steps for Launch
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-white/80 dark:bg-slate-800/80 rounded-lg p-4">
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  1. Immediate Priority (Critical Issues)
                </h4>
                <ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
                  <li>• Replace mock data with real Supabase integration</li>
                  <li>• Add FTC-compliant affiliate disclosure to all deal pages</li>
                  <li>• Obtain and implement real affiliate links</li>
                  <li>• Set up affiliate revenue tracking system</li>
                </ul>
              </div>
              
              <div className="bg-white/80 dark:bg-slate-800/80 rounded-lg p-4">
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  2. Pre-Launch (Warnings)
                </h4>
                <ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
                  <li>• Add SEO meta tags and structured data</li>
                  <li>• Implement GDPR cookie consent</li>
                  <li>• Set up Google Analytics and conversion tracking</li>
                  <li>• Add error handling and loading states</li>
                </ul>
              </div>

              <div className="bg-white/80 dark:bg-slate-800/80 rounded-lg p-4">
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  3. Post-Launch Optimization
                </h4>
                <ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
                  <li>• Performance optimization and code splitting</li>
                  <li>• System monitoring and alerting setup</li>
                  <li>• Security headers and rate limiting</li>
                  <li>• Legal document review</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProductionReadinessChecker;