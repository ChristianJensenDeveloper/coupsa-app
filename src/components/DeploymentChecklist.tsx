import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { CheckCircle, AlertTriangle, Clock, Rocket, Shield, Database, Globe, FileText, Users, Zap } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface ChecklistItem {
  id: string;
  category: 'technical' | 'legal' | 'business' | 'security' | 'performance';
  title: string;
  description: string;
  status: 'complete' | 'partial' | 'pending' | 'blocked';
  priority: 'critical' | 'high' | 'medium' | 'low';
  estimatedTime: string;
  dependencies?: string[];
  resources?: string[];
  validationMethod?: string;
}

interface DeploymentChecklistProps {
  className?: string;
}

const DEPLOYMENT_CHECKLIST: ChecklistItem[] = [
  // Technical Infrastructure
  {
    id: 'domain-ssl',
    category: 'technical',
    title: 'Domain & SSL Certificate',
    description: 'Production domain configured with SSL certificate',
    status: 'pending',
    priority: 'critical',
    estimatedTime: '2-4 hours',
    resources: ['Domain registrar', 'SSL certificate provider'],
    validationMethod: 'Check HTTPS access and certificate validity'
  },
  {
    id: 'cdn-setup',
    category: 'technical',
    title: 'CDN Configuration',
    description: 'Content Delivery Network configured for global performance',
    status: 'pending',
    priority: 'high',
    estimatedTime: '1-2 hours',
    dependencies: ['domain-ssl'],
    resources: ['CloudFlare/AWS CloudFront'],
    validationMethod: 'Test global load times and cache headers'
  },
  {
    id: 'database-production',
    category: 'technical',
    title: 'Production Database Setup',
    description: 'Supabase production instance configured with proper backups',
    status: 'partial',
    priority: 'critical',
    estimatedTime: '2-3 hours',
    resources: ['Supabase dashboard', 'Database migration scripts'],
    validationMethod: 'Test database connectivity and backup restoration'
  },
  {
    id: 'environment-variables',
    category: 'technical',
    title: 'Environment Variables',
    description: 'All production environment variables configured securely',
    status: 'partial',
    priority: 'critical',
    estimatedTime: '1 hour',
    resources: ['Deployment platform dashboard'],
    validationMethod: 'Verify all required env vars are set and functional'
  },
  {
    id: 'analytics-setup',
    category: 'technical',
    title: 'Analytics & Monitoring',
    description: 'Google Analytics, error tracking, and performance monitoring',
    status: 'complete',
    priority: 'high',
    estimatedTime: '2-3 hours',
    resources: ['Google Analytics', 'Sentry/LogRocket', 'Vercel Analytics'],
    validationMethod: 'Verify event tracking and error reporting'
  },

  // Security & Compliance
  {
    id: 'security-headers',
    category: 'security',
    title: 'Security Headers',
    description: 'CSP, HSTS, and other security headers properly configured',
    status: 'complete',
    priority: 'critical',
    estimatedTime: '2-4 hours',
    resources: ['Security configuration file', 'Header testing tools'],
    validationMethod: 'Run security header scanner and fix violations'
  },
  {
    id: 'rate-limiting',
    category: 'security',
    title: 'Rate Limiting',
    description: 'API rate limiting implemented for all endpoints',
    status: 'partial',
    priority: 'high',
    estimatedTime: '3-4 hours',
    dependencies: ['environment-variables'],
    resources: ['Rate limiting middleware', 'Redis/Memory cache'],
    validationMethod: 'Test rate limit enforcement with automated tools'
  },
  {
    id: 'penetration-testing',
    category: 'security',
    title: 'Security Audit',
    description: 'Third-party security audit and penetration testing',
    status: 'pending',
    priority: 'high',
    estimatedTime: '1-2 weeks',
    dependencies: ['security-headers', 'rate-limiting'],
    resources: ['Security auditing service'],
    validationMethod: 'Professional security report with remediation plan'
  },

  // Legal & Compliance
  {
    id: 'legal-documents',
    category: 'legal',
    title: 'Legal Documents',
    description: 'Terms of Service, Privacy Policy, and Cookie Policy updated',
    status: 'complete',
    priority: 'critical',
    estimatedTime: '4-6 hours',
    resources: ['Legal counsel', 'Compliance checklist'],
    validationMethod: 'Legal review and approval of all documents'
  },
  {
    id: 'gdpr-compliance',
    category: 'legal',
    title: 'GDPR Compliance',
    description: 'Full GDPR compliance including data processing agreements',
    status: 'complete',
    priority: 'critical',
    estimatedTime: '1-2 days',
    dependencies: ['legal-documents'],
    resources: ['GDPR consultant', 'Data mapping documentation'],
    validationMethod: 'GDPR compliance audit and documentation review'
  },
  {
    id: 'affiliate-disclosures',
    category: 'legal',
    title: 'Affiliate Disclosures',
    description: 'FTC-compliant affiliate marketing disclosures',
    status: 'complete',
    priority: 'critical',
    estimatedTime: '2-3 hours',
    resources: ['FTC guidelines', 'Legal review'],
    validationMethod: 'Review disclosure placement and language compliance'
  },

  // Business Operations
  {
    id: 'business-registration',
    category: 'business',
    title: 'Business Registration',
    description: 'Company legally registered with proper licenses',
    status: 'pending',
    priority: 'critical',
    estimatedTime: '1-2 weeks',
    resources: ['Business registration authority', 'Legal counsel'],
    validationMethod: 'Certificate of incorporation and business licenses'
  },
  {
    id: 'financial-accounts',
    category: 'business',
    title: 'Financial Setup',
    description: 'Business bank accounts and payment processing configured',
    status: 'pending',
    priority: 'high',
    estimatedTime: '3-5 days',
    dependencies: ['business-registration'],
    resources: ['Bank', 'Payment processor (Stripe/PayPal)'],
    validationMethod: 'Test payment flows and fund transfers'
  },
  {
    id: 'support-system',
    category: 'business',
    title: 'Customer Support',
    description: 'Support system and processes established',
    status: 'partial',
    priority: 'medium',
    estimatedTime: '1-2 days',
    resources: ['Support platform', 'Knowledge base', 'Support staff'],
    validationMethod: 'Test support ticket flow and response times'
  },

  // Performance & Optimization
  {
    id: 'performance-optimization',
    category: 'performance',
    title: 'Performance Optimization',
    description: 'Code splitting, lazy loading, and bundle optimization',
    status: 'complete',
    priority: 'high',
    estimatedTime: '1-2 days',
    resources: ['Build tools', 'Performance monitoring'],
    validationMethod: 'Lighthouse audit score >90 for all metrics'
  },
  {
    id: 'mobile-optimization',
    category: 'performance',
    title: 'Mobile Optimization',
    description: 'Responsive design and mobile performance optimization',
    status: 'complete',
    priority: 'high',
    estimatedTime: '2-3 days',
    resources: ['Mobile testing devices', 'Cross-browser testing'],
    validationMethod: 'Test on multiple devices and browsers'
  },
  {
    id: 'seo-optimization',
    category: 'performance',
    title: 'SEO Optimization',
    description: 'Meta tags, structured data, and search engine optimization',
    status: 'partial',
    priority: 'medium',
    estimatedTime: '1-2 days',
    resources: ['SEO tools', 'Content optimization'],
    validationMethod: 'SEO audit and search console setup'
  },

  // Final Launch Preparation
  {
    id: 'backup-recovery',
    category: 'technical',
    title: 'Backup & Recovery',
    description: 'Automated backups and disaster recovery plan tested',
    status: 'pending',
    priority: 'critical',
    estimatedTime: '4-6 hours',
    dependencies: ['database-production'],
    resources: ['Backup service', 'Recovery procedures'],
    validationMethod: 'Test full system recovery from backup'
  },
  {
    id: 'monitoring-alerts',
    category: 'technical',
    title: 'Monitoring & Alerts',
    description: 'Comprehensive monitoring and alerting system configured',
    status: 'partial',
    priority: 'high',
    estimatedTime: '3-4 hours',
    resources: ['Monitoring service', 'Alert channels'],
    validationMethod: 'Test alert notifications for critical events'
  },
  {
    id: 'launch-announcement',
    category: 'business',
    title: 'Launch Marketing',
    description: 'Marketing materials and launch announcement prepared',
    status: 'pending',
    priority: 'medium',
    estimatedTime: '1-2 weeks',
    resources: ['Marketing team', 'Press kit', 'Social media accounts'],
    validationMethod: 'Marketing campaign ready for launch'
  }
];

export default function DeploymentChecklist({ className = "" }: DeploymentChecklistProps) {
  const [checklist, setChecklist] = useState<ChecklistItem[]>(DEPLOYMENT_CHECKLIST);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [completionStats, setCompletionStats] = useState<any>({});

  useEffect(() => {
    calculateCompletionStats();
  }, [checklist]);

  const calculateCompletionStats = () => {
    const stats = {
      total: checklist.length,
      complete: checklist.filter(item => item.status === 'complete').length,
      partial: checklist.filter(item => item.status === 'partial').length,
      pending: checklist.filter(item => item.status === 'pending').length,
      blocked: checklist.filter(item => item.status === 'blocked').length,
      critical: checklist.filter(item => item.priority === 'critical').length,
      criticalComplete: checklist.filter(item => item.priority === 'critical' && item.status === 'complete').length
    };
    
    stats.percentageComplete = Math.round((stats.complete / stats.total) * 100);
    stats.criticalPercentage = Math.round((stats.criticalComplete / stats.critical) * 100);
    stats.readyForLaunch = stats.criticalComplete === stats.critical && stats.complete >= (stats.total * 0.8);
    
    setCompletionStats(stats);
  };

  const updateItemStatus = (itemId: string, newStatus: ChecklistItem['status']) => {
    setChecklist(prev => prev.map(item => 
      item.id === itemId ? { ...item, status: newStatus } : item
    ));
    toast.success(`Item marked as ${newStatus}`);
  };

  const getStatusIcon = (status: ChecklistItem['status']) => {
    switch (status) {
      case 'complete': return CheckCircle;
      case 'partial': return Clock;
      case 'pending': return AlertTriangle;
      case 'blocked': return AlertTriangle;
    }
  };

  const getStatusColor = (status: ChecklistItem['status']) => {
    switch (status) {
      case 'complete': return 'text-green-600 dark:text-green-400';
      case 'partial': return 'text-yellow-600 dark:text-yellow-400';
      case 'pending': return 'text-orange-600 dark:text-orange-400';
      case 'blocked': return 'text-red-600 dark:text-red-400';
    }
  };

  const getPriorityColor = (priority: ChecklistItem['priority']) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
    }
  };

  const getCategoryIcon = (category: ChecklistItem['category']) => {
    switch (category) {
      case 'technical': return Database;
      case 'legal': return FileText;
      case 'business': return Users;
      case 'security': return Shield;
      case 'performance': return Zap;
      default: return Globe;
    }
  };

  const filteredItems = selectedCategory === 'all' 
    ? checklist 
    : checklist.filter(item => item.category === selectedCategory);

  const categories = ['all', 'technical', 'security', 'legal', 'business', 'performance'];

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
            <Rocket className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Production Deployment Checklist
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Pre-launch checklist for KOOCAO production deployment
            </p>
          </div>
        </div>
        
        {completionStats.readyForLaunch ? (
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              🚀 Ready to Launch!
            </div>
            <div className="text-sm text-green-700 dark:text-green-300">
              All critical items complete
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {completionStats.percentageComplete}%
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Overall Progress
            </div>
          </div>
        )}
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/30">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {completionStats.complete}
          </div>
          <div className="text-sm text-green-700 dark:text-green-300">
            Complete
          </div>
        </div>
        
        <div className="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800/30">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {completionStats.partial}
          </div>
          <div className="text-sm text-yellow-700 dark:text-yellow-300">
            In Progress
          </div>
        </div>
        
        <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800/30">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {completionStats.pending}
          </div>
          <div className="text-sm text-orange-700 dark:text-orange-300">
            Pending
          </div>
        </div>
        
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {completionStats.criticalPercentage}%
          </div>
          <div className="text-sm text-red-700 dark:text-red-300">
            Critical Items
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map(category => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className="capitalize"
          >
            {category === 'all' ? 'All Categories' : category}
          </Button>
        ))}
      </div>

      {/* Checklist Items */}
      <div className="space-y-4">
        {filteredItems.map(item => {
          const StatusIcon = getStatusIcon(item.status);
          const CategoryIcon = getCategoryIcon(item.category);
          
          return (
            <div 
              key={item.id} 
              className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center mt-1">
                    <CategoryIcon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                        {item.title}
                      </h4>
                      <Badge className={`text-xs ${getPriorityColor(item.priority)}`}>
                        {item.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                      {item.description}
                    </p>
                    <div className="text-xs text-slate-500 dark:text-slate-500">
                      Estimated time: {item.estimatedTime}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusIcon className={`w-5 h-5 ${getStatusColor(item.status)}`} />
                  <Badge 
                    variant={
                      item.status === 'complete' ? 'secondary' : 
                      item.status === 'partial' ? 'secondary' : 
                      item.status === 'blocked' ? 'destructive' :
                      'outline'
                    }
                    className="text-xs"
                  >
                    {item.status.toUpperCase()}
                  </Badge>
                </div>
              </div>

              {item.dependencies && item.dependencies.length > 0 && (
                <div className="mb-3">
                  <h5 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Dependencies:
                  </h5>
                  <div className="flex flex-wrap gap-1">
                    {item.dependencies.map(dep => (
                      <Badge key={dep} variant="outline" className="text-xs">
                        {checklist.find(i => i.id === dep)?.title || dep}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {item.resources && item.resources.length > 0 && (
                <div className="mb-3">
                  <h5 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Required Resources:
                  </h5>
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    {item.resources.join(', ')}
                  </div>
                </div>
              )}

              {item.validationMethod && (
                <div className="mb-3">
                  <h5 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Validation Method:
                  </h5>
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    {item.validationMethod}
                  </div>
                </div>
              )}

              {/* Status Update Buttons */}
              <div className="flex gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateItemStatus(item.id, 'complete')}
                  disabled={item.status === 'complete'}
                  className="text-green-600 border-green-300 hover:bg-green-50 dark:text-green-400 dark:border-green-600 dark:hover:bg-green-900/20"
                >
                  Complete
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateItemStatus(item.id, 'partial')}
                  disabled={item.status === 'partial'}
                  className="text-yellow-600 border-yellow-300 hover:bg-yellow-50 dark:text-yellow-400 dark:border-yellow-600 dark:hover:bg-yellow-900/20"
                >
                  In Progress
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateItemStatus(item.id, 'pending')}
                  disabled={item.status === 'pending'}
                  className="text-orange-600 border-orange-300 hover:bg-orange-50 dark:text-orange-400 dark:border-orange-600 dark:hover:bg-orange-900/20"
                >
                  Reset
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Launch Button */}
      {completionStats.readyForLaunch && (
        <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/10 dark:to-blue-900/10 rounded-2xl border border-green-200 dark:border-green-800/30 text-center">
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            🎉 Ready for Production Launch!
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            All critical items are complete and the application is ready for production deployment.
          </p>
          <Button
            onClick={() => {
              toast.success('🚀 KOOCAO production launch initiated!');
            }}
            className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Rocket className="w-5 h-5 mr-2" />
            Launch KOOCAO
          </Button>
        </div>
      )}
    </Card>
  );
}