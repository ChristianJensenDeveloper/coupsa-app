import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { CheckCircle, AlertCircle, XCircle, ExternalLink, Copy, Search, Globe, Share2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { SitemapInfo } from './SitemapGenerator';

interface SEOCheck {
  name: string;
  status: 'success' | 'warning' | 'error';
  description: string;
  recommendation?: string;
}

export function SEOAnalytics() {
  const [seoChecks, setSeoChecks] = useState<SEOCheck[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    performSEOAudit();
  }, []);

  const performSEOAudit = () => {
    setLoading(true);
    
    const checks: SEOCheck[] = [];
    
    // Check page title
    const title = document.title;
    checks.push({
      name: 'Page Title',
      status: title && title.length > 10 && title.length < 60 ? 'success' : 'warning',
      description: `Title: "${title}" (${title.length} characters)`,
      recommendation: title.length > 60 ? 'Title is too long, keep under 60 characters' : 
                    title.length < 10 ? 'Title is too short, aim for 10-60 characters' : undefined
    });

    // Check meta description
    const metaDesc = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    checks.push({
      name: 'Meta Description',
      status: metaDesc && metaDesc.length > 120 && metaDesc.length < 160 ? 'success' : 'warning',
      description: `Description: ${metaDesc.length} characters`,
      recommendation: metaDesc.length > 160 ? 'Description is too long, keep under 160 characters' : 
                    metaDesc.length < 120 ? 'Description is too short, aim for 120-160 characters' : undefined
    });

    // Check keywords
    const keywords = document.querySelector('meta[name="keywords"]')?.getAttribute('content') || '';
    checks.push({
      name: 'Meta Keywords',
      status: keywords ? 'success' : 'warning',
      description: keywords ? `Keywords present` : 'No keywords meta tag found',
      recommendation: !keywords ? 'Add relevant keywords for better categorization' : undefined
    });

    // Check Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content');
    const ogDesc = document.querySelector('meta[property="og:description"]')?.getAttribute('content');
    const ogImage = document.querySelector('meta[property="og:image"]')?.getAttribute('content');
    
    checks.push({
      name: 'Open Graph Tags',
      status: ogTitle && ogDesc && ogImage ? 'success' : 'warning',
      description: `Title: ${ogTitle ? '✓' : '✗'}, Description: ${ogDesc ? '✓' : '✗'}, Image: ${ogImage ? '✓' : '✗'}`,
      recommendation: !(ogTitle && ogDesc && ogImage) ? 'Complete Open Graph tags for better social media sharing' : undefined
    });

    // Check structured data
    const structuredData = document.querySelector('#structured-data');
    checks.push({
      name: 'Structured Data',
      status: structuredData ? 'success' : 'error',
      description: structuredData ? 'JSON-LD structured data present' : 'No structured data found',
      recommendation: !structuredData ? 'Add structured data for better search engine understanding' : undefined
    });

    // Check canonical URL
    const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href');
    checks.push({
      name: 'Canonical URL',
      status: canonical ? 'success' : 'warning',
      description: canonical ? `Canonical: ${canonical}` : 'No canonical URL set',
      recommendation: !canonical ? 'Add canonical URLs to prevent duplicate content issues' : undefined
    });

    // Check mobile viewport
    const viewport = document.querySelector('meta[name="viewport"]')?.getAttribute('content');
    checks.push({
      name: 'Mobile Viewport',
      status: viewport?.includes('width=device-width') ? 'success' : 'error',
      description: viewport ? `Viewport: ${viewport}` : 'No viewport meta tag',
      recommendation: !viewport?.includes('width=device-width') ? 'Add proper viewport meta tag for mobile optimization' : undefined
    });

    // Check robots meta
    const robots = document.querySelector('meta[name="robots"]')?.getAttribute('content');
    checks.push({
      name: 'Robots Meta',
      status: robots ? 'success' : 'warning',
      description: robots ? `Robots: ${robots}` : 'No robots meta tag',
      recommendation: !robots ? 'Add robots meta tag to control search engine crawling' : undefined
    });

    setSeoChecks(checks);
    setLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    };
    
    return (
      <Badge className={variants[status as keyof typeof variants] || ''}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const copyStructuredData = () => {
    const structuredDataElement = document.querySelector('#structured-data');
    if (structuredDataElement) {
      navigator.clipboard.writeText(structuredDataElement.textContent || '');
      toast.success('Structured data copied to clipboard');
    }
  };

  const successCount = seoChecks.filter(check => check.status === 'success').length;
  const warningCount = seoChecks.filter(check => check.status === 'warning').length;
  const errorCount = seoChecks.filter(check => check.status === 'error').length;
  const totalChecks = seoChecks.length;
  const scorePercentage = Math.round((successCount / totalChecks) * 100);

  return (
    <div className="space-y-6">
      {/* SEO Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Search className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">SEO Score</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {loading ? '...' : `${scorePercentage}%`}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Passed</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {loading ? '...' : successCount}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Warnings</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {loading ? '...' : warningCount}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Errors</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {loading ? '...' : errorCount}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* SEO Checks List */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Search className="w-5 h-5" />
            SEO Audit Results
          </h3>
          <Button onClick={performSEOAudit} variant="outline" size="sm">
            Re-run Audit
          </Button>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-slate-600 dark:text-slate-400">Running SEO audit...</p>
            </div>
          ) : (
            seoChecks.map((check, index) => (
              <div key={index} className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <div className="mt-0.5">
                  {getStatusIcon(check.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-slate-900 dark:text-slate-100">{check.name}</h4>
                    {getStatusBadge(check.status)}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{check.description}</p>
                  {check.recommendation && (
                    <p className="text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                      💡 {check.recommendation}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* SEO Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5" />
            SEO Tools
          </h3>
          <div className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              onClick={() => window.open('https://search.google.com/search-console', '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Google Search Console
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => window.open('https://developers.google.com/search/docs/crawling-indexing/robots/intro', '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Robots.txt Tester
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => window.open('https://search.google.com/test/rich-results', '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Rich Results Test
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => window.open('https://developers.facebook.com/tools/debug/', '_blank')}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Facebook Sharing Debugger
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Structured Data</h3>
          <div className="space-y-3">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Current page includes structured data for better search engine understanding.
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={copyStructuredData}
              className="w-full"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Structured Data
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open('https://search.google.com/test/rich-results', '_blank')}
              className="w-full"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Test in Google
            </Button>
          </div>
        </Card>
      </div>

      {/* Sitemap Information */}
      <Card className="p-6">
        <SitemapInfo />
      </Card>

      {/* SEO Recommendations */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">SEO Recommendations</h3>
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Page Speed Optimization</h4>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Consider implementing image optimization, lazy loading, and code splitting to improve page load times.
            </p>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">Content Strategy</h4>
            <p className="text-sm text-green-800 dark:text-green-200">
              Create blog content around prop trading tips, deal analysis, and market insights to improve organic reach.
            </p>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
            <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2">Local SEO</h4>
            <p className="text-sm text-purple-800 dark:text-purple-200">
              If targeting specific regions, consider adding location-based structured data and local business information.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}