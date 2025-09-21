import { useEffect, useState, useCallback } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Shield, AlertTriangle, CheckCircle, Lock, Eye, Globe, Zap, RefreshCw } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface SecurityCheck {
  id: string;
  name: string;
  description: string;
  status: 'pass' | 'warning' | 'fail' | 'checking';
  details?: string;
  recommendation?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface SecurityScore {
  overall: number;
  categories: {
    headers: number;
    cookies: number;
    content: number;
    network: number;
  };
}

interface SecurityMonitorProps {
  className?: string;
}

export default function SecurityMonitor({ className = "" }: SecurityMonitorProps) {
  const [securityChecks, setSecurityChecks] = useState<SecurityCheck[]>([]);
  const [securityScore, setSecurityScore] = useState<SecurityScore | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const performSecurityCheck = useCallback(async () => {
    setIsChecking(true);
    
    const checks: SecurityCheck[] = [
      {
        id: 'https',
        name: 'HTTPS Connection',
        description: 'Website is served over HTTPS',
        status: 'checking',
        severity: 'critical'
      },
      {
        id: 'csp',
        name: 'Content Security Policy',
        description: 'CSP headers are configured',
        status: 'checking',
        severity: 'high'
      },
      {
        id: 'hsts',
        name: 'HTTP Strict Transport Security',
        description: 'HSTS header is present',
        status: 'checking',
        severity: 'high'
      },
      {
        id: 'xframe',
        name: 'X-Frame-Options',
        description: 'Clickjacking protection enabled',
        status: 'checking',
        severity: 'medium'
      },
      {
        id: 'xcontent',
        name: 'X-Content-Type-Options',
        description: 'MIME type sniffing protection',
        status: 'checking',
        severity: 'medium'
      },
      {
        id: 'cookies',
        name: 'Secure Cookies',
        description: 'Cookies have secure flags',
        status: 'checking',
        severity: 'high'
      },
      {
        id: 'mixed-content',
        name: 'Mixed Content',
        description: 'No mixed HTTP/HTTPS content',
        status: 'checking',
        severity: 'medium'
      },
      {
        id: 'xss-protection',
        name: 'XSS Protection',
        description: 'Cross-site scripting protection',
        status: 'checking',
        severity: 'high'
      }
    ];

    setSecurityChecks(checks);

    // Perform actual security checks
    const updatedChecks = await Promise.all(
      checks.map(async (check) => {
        try {
          switch (check.id) {
            case 'https':
              const isHttps = window.location.protocol === 'https:';
              return {
                ...check,
                status: isHttps ? 'pass' : 'fail' as const,
                details: isHttps ? 'Site is served over HTTPS' : 'Site is not using HTTPS',
                recommendation: !isHttps ? 'Enable HTTPS for all traffic' : undefined
              };

            case 'csp':
              const cspCheck = await checkCSPHeader();
              return {
                ...check,
                status: cspCheck.hasCSP ? 'pass' : 'warning' as const,
                details: cspCheck.details,
                recommendation: cspCheck.recommendation
              };

            case 'hsts':
              const hstsCheck = await checkHSTSHeader();
              return {
                ...check,
                status: hstsCheck.hasHSTS ? 'pass' : 'warning' as const,
                details: hstsCheck.details,
                recommendation: hstsCheck.recommendation
              };

            case 'xframe':
              const xFrameCheck = await checkXFrameOptions();
              return {
                ...check,
                status: xFrameCheck.hasXFrame ? 'pass' : 'warning' as const,
                details: xFrameCheck.details,
                recommendation: xFrameCheck.recommendation
              };

            case 'xcontent':
              const xContentCheck = await checkXContentTypeOptions();
              return {
                ...check,
                status: xContentCheck.hasXContent ? 'pass' : 'warning' as const,
                details: xContentCheck.details,
                recommendation: xContentCheck.recommendation
              };

            case 'cookies':
              const cookieCheck = checkSecureCookies();
              return {
                ...check,
                status: cookieCheck.secure ? 'pass' : 'warning' as const,
                details: cookieCheck.details,
                recommendation: cookieCheck.recommendation
              };

            case 'mixed-content':
              const mixedContentCheck = checkMixedContent();
              return {
                ...check,
                status: mixedContentCheck.clean ? 'pass' : 'warning' as const,
                details: mixedContentCheck.details,
                recommendation: mixedContentCheck.recommendation
              };

            case 'xss-protection':
              const xssCheck = await checkXSSProtection();
              return {
                ...check,
                status: xssCheck.hasProtection ? 'pass' : 'warning' as const,
                details: xssCheck.details,
                recommendation: xssCheck.recommendation
              };

            default:
              return { ...check, status: 'warning' as const };
          }
        } catch (error) {
          console.error(`Security check failed for ${check.id}:`, error);
          return {
            ...check,
            status: 'fail' as const,
            details: 'Check failed due to error',
            recommendation: 'Manual verification required'
          };
        }
      })
    );

    setSecurityChecks(updatedChecks);
    
    // Calculate security score
    const score = calculateSecurityScore(updatedChecks);
    setSecurityScore(score);
    setLastCheck(new Date());
    setIsChecking(false);

    // Send security metrics to analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'security_audit', {
        security_score: score.overall,
        https_enabled: window.location.protocol === 'https:',
        total_checks: updatedChecks.length,
        passed_checks: updatedChecks.filter(c => c.status === 'pass').length,
        failed_checks: updatedChecks.filter(c => c.status === 'fail').length
      });
    }

    if (score.overall < 70) {
      toast.warning(`Security score: ${score.overall}/100. Review recommendations.`);
    }

  }, []);

  // Helper functions for security checks
  async function checkCSPHeader() {
    try {
      const response = await fetch(window.location.href, { method: 'HEAD' });
      const csp = response.headers.get('content-security-policy');
      return {
        hasCSP: !!csp,
        details: csp ? 'CSP header present' : 'No CSP header found',
        recommendation: !csp ? 'Implement Content Security Policy headers' : undefined
      };
    } catch {
      return {
        hasCSP: false,
        details: 'Unable to check CSP header',
        recommendation: 'Verify CSP configuration'
      };
    }
  }

  async function checkHSTSHeader() {
    try {
      const response = await fetch(window.location.href, { method: 'HEAD' });
      const hsts = response.headers.get('strict-transport-security');
      return {
        hasHSTS: !!hsts,
        details: hsts ? 'HSTS header present' : 'No HSTS header found',
        recommendation: !hsts ? 'Enable HTTP Strict Transport Security' : undefined
      };
    } catch {
      return {
        hasHSTS: false,
        details: 'Unable to check HSTS header',
        recommendation: 'Verify HSTS configuration'
      };
    }
  }

  async function checkXFrameOptions() {
    try {
      const response = await fetch(window.location.href, { method: 'HEAD' });
      const xFrame = response.headers.get('x-frame-options');
      return {
        hasXFrame: !!xFrame,
        details: xFrame ? `X-Frame-Options: ${xFrame}` : 'No X-Frame-Options header',
        recommendation: !xFrame ? 'Set X-Frame-Options to DENY or SAMEORIGIN' : undefined
      };
    } catch {
      return {
        hasXFrame: false,
        details: 'Unable to check X-Frame-Options',
        recommendation: 'Verify X-Frame-Options configuration'
      };
    }
  }

  async function checkXContentTypeOptions() {
    try {
      const response = await fetch(window.location.href, { method: 'HEAD' });
      const xContent = response.headers.get('x-content-type-options');
      return {
        hasXContent: xContent === 'nosniff',
        details: xContent ? `X-Content-Type-Options: ${xContent}` : 'No X-Content-Type-Options header',
        recommendation: !xContent ? 'Set X-Content-Type-Options to nosniff' : undefined
      };
    } catch {
      return {
        hasXContent: false,
        details: 'Unable to check X-Content-Type-Options',
        recommendation: 'Verify X-Content-Type-Options configuration'
      };
    }
  }

  function checkSecureCookies() {
    const cookies = document.cookie.split(';');
    const secureCookies = cookies.filter(cookie => cookie.includes('Secure'));
    const sameSiteCookies = cookies.filter(cookie => cookie.includes('SameSite'));
    
    return {
      secure: cookies.length === 0 || (secureCookies.length > 0 && sameSiteCookies.length > 0),
      details: cookies.length === 0 
        ? 'No cookies found' 
        : `${secureCookies.length}/${cookies.length} cookies have Secure flag`,
      recommendation: cookies.length > 0 && secureCookies.length === 0 
        ? 'Enable Secure and SameSite flags for all cookies' 
        : undefined
    };
  }

  function checkMixedContent() {
    const images = Array.from(document.querySelectorAll('img'));
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    const links = Array.from(document.querySelectorAll('link[href]'));
    
    const mixedContent = [
      ...images.filter(img => img.src.startsWith('http:')),
      ...scripts.filter(script => script.src.startsWith('http:')),
      ...links.filter(link => link.href.startsWith('http:'))
    ];

    return {
      clean: mixedContent.length === 0,
      details: mixedContent.length === 0 
        ? 'No mixed content detected' 
        : `${mixedContent.length} mixed content resources found`,
      recommendation: mixedContent.length > 0 
        ? 'Replace HTTP resources with HTTPS versions' 
        : undefined
    };
  }

  async function checkXSSProtection() {
    try {
      const response = await fetch(window.location.href, { method: 'HEAD' });
      const xssProtection = response.headers.get('x-xss-protection');
      return {
        hasProtection: !!xssProtection,
        details: xssProtection ? `X-XSS-Protection: ${xssProtection}` : 'No X-XSS-Protection header',
        recommendation: !xssProtection ? 'Enable X-XSS-Protection header' : undefined
      };
    } catch {
      return {
        hasProtection: false,
        details: 'Unable to check XSS protection',
        recommendation: 'Verify XSS protection configuration'
      };
    }
  }

  function calculateSecurityScore(checks: SecurityCheck[]): SecurityScore {
    const weights = {
      critical: 30,
      high: 20,
      medium: 10,
      low: 5
    };

    let totalPossible = 0;
    let earnedPoints = 0;

    checks.forEach(check => {
      const weight = weights[check.severity];
      totalPossible += weight;
      
      if (check.status === 'pass') {
        earnedPoints += weight;
      } else if (check.status === 'warning') {
        earnedPoints += weight * 0.5;
      }
    });

    const overall = totalPossible > 0 ? Math.round((earnedPoints / totalPossible) * 100) : 0;

    return {
      overall,
      categories: {
        headers: 85, // Mock category scores
        cookies: 75,
        content: 90,
        network: 80
      }
    };
  }

  const getStatusIcon = (status: SecurityCheck['status']) => {
    switch (status) {
      case 'pass': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'fail': return AlertTriangle;
      case 'checking': return RefreshCw;
    }
  };

  const getStatusColor = (status: SecurityCheck['status']) => {
    switch (status) {
      case 'pass': return 'text-green-600 dark:text-green-400';
      case 'warning': return 'text-yellow-600 dark:text-yellow-400';
      case 'fail': return 'text-red-600 dark:text-red-400';
      case 'checking': return 'text-blue-600 dark:text-blue-400';
    }
  };

  const getSeverityColor = (severity: SecurityCheck['severity']) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
    }
  };

  useEffect(() => {
    // Run initial security check
    performSecurityCheck();
  }, [performSecurityCheck]);

  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">Security Monitor</h3>
        </div>
        <div className="flex items-center gap-2">
          {securityScore && (
            <div className="text-right">
              <div className={`font-bold text-lg ${
                securityScore.overall >= 90 ? 'text-green-600 dark:text-green-400' :
                securityScore.overall >= 70 ? 'text-yellow-600 dark:text-yellow-400' :
                'text-red-600 dark:text-red-400'
              }`}>
                {securityScore.overall}/100
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">
                Security Score
              </div>
            </div>
          )}
          <Button 
            onClick={performSecurityCheck} 
            disabled={isChecking}
            size="sm"
            variant="outline"
          >
            {isChecking ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Shield className="w-4 h-4" />
            )}
            {isChecking ? 'Checking...' : 'Scan'}
          </Button>
        </div>
      </div>

      {lastCheck && (
        <div className="text-xs text-slate-600 dark:text-slate-400 mb-4">
          Last checked: {lastCheck.toLocaleString()}
        </div>
      )}

      <div className="space-y-3">
        {securityChecks.map((check) => {
          const StatusIcon = getStatusIcon(check.status);
          return (
            <div key={check.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <StatusIcon className={`w-4 h-4 ${getStatusColor(check.status)} ${
                    check.status === 'checking' ? 'animate-spin' : ''
                  }`} />
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {check.name}
                  </span>
                  <Badge className={`text-xs ${getSeverityColor(check.severity)}`}>
                    {check.severity}
                  </Badge>
                </div>
                <Badge 
                  variant={
                    check.status === 'pass' ? 'secondary' : 
                    check.status === 'warning' ? 'secondary' : 
                    'destructive'
                  }
                  className="text-xs"
                >
                  {check.status.toUpperCase()}
                </Badge>
              </div>
              
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                {check.description}
              </div>
              
              {check.details && (
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                  {check.details}
                </div>
              )}
              
              {check.recommendation && (
                <div className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded mt-2">
                  💡 {check.recommendation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {securityScore && (
        <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
          <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">Category Breakdown</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>Headers: {securityScore.categories.headers}/100</div>
            <div>Cookies: {securityScore.categories.cookies}/100</div>
            <div>Content: {securityScore.categories.content}/100</div>
            <div>Network: {securityScore.categories.network}/100</div>
          </div>
        </div>
      )}
    </Card>
  );
}