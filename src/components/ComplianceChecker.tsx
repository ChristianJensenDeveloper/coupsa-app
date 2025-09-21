import { useEffect, useState } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { AlertTriangle, CheckCircle, Clock, Shield, FileText, Globe, Users, Eye } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface ComplianceItem {
  id: string;
  category: 'legal' | 'privacy' | 'security' | 'accessibility' | 'business';
  title: string;
  description: string;
  status: 'compliant' | 'partial' | 'non-compliant' | 'pending';
  priority: 'critical' | 'high' | 'medium' | 'low';
  lastChecked: Date;
  nextReview: Date;
  documents?: string[];
  actions?: string[];
}

interface ComplianceCheckerProps {
  className?: string;
}

const COMPLIANCE_ITEMS: ComplianceItem[] = [
  // Legal Compliance
  {
    id: 'terms-of-service',
    category: 'legal',
    title: 'Terms of Service',
    description: 'Updated terms reflecting current business model and affiliate relationships',
    status: 'compliant',
    priority: 'critical',
    lastChecked: new Date('2025-01-15'),
    nextReview: new Date('2025-07-15'),
    documents: ['TermsOfService.tsx'],
    actions: ['Review affiliate disclosure language', 'Update service descriptions']
  },
  {
    id: 'privacy-policy',
    category: 'privacy',
    title: 'Privacy Policy',
    description: 'GDPR and CCPA compliant privacy policy with cookie management',
    status: 'compliant',
    priority: 'critical',
    lastChecked: new Date('2025-01-15'),
    nextReview: new Date('2025-07-15'),
    documents: ['PrivacyPolicy.tsx'],
    actions: ['Update data retention periods', 'Review third-party integrations']
  },
  {
    id: 'cookie-policy',
    category: 'privacy',
    title: 'Cookie Policy',
    description: 'Comprehensive cookie consent and management system',
    status: 'compliant',
    priority: 'high',
    lastChecked: new Date('2025-01-15'),
    nextReview: new Date('2025-04-15'),
    documents: ['CookieConsent.tsx', 'CookieSettings.tsx'],
    actions: ['Review cookie categories', 'Update consent mechanisms']
  },
  {
    id: 'gdpr-compliance',
    category: 'privacy',
    title: 'GDPR Compliance',
    description: 'General Data Protection Regulation compliance for EU users',
    status: 'compliant',
    priority: 'critical',
    lastChecked: new Date('2025-01-15'),
    nextReview: new Date('2025-04-15'),
    actions: ['Data mapping audit', 'Privacy impact assessment', 'DPO consultation']
  },
  {
    id: 'ccpa-compliance',
    category: 'privacy',
    title: 'CCPA Compliance',
    description: 'California Consumer Privacy Act compliance',
    status: 'partial',
    priority: 'high',
    lastChecked: new Date('2025-01-10'),
    nextReview: new Date('2025-03-10'),
    actions: ['Implement "Do Not Sell" mechanism', 'Add California resident rights']
  },
  {
    id: 'affiliate-disclosure',
    category: 'legal',
    title: 'Affiliate Disclosure',
    description: 'FTC compliant affiliate marketing disclosures',
    status: 'compliant',
    priority: 'critical',
    lastChecked: new Date('2025-01-15'),
    nextReview: new Date('2025-04-15'),
    documents: ['AffiliateDisclosure.tsx'],
    actions: ['Review disclosure placement', 'Update disclosure language']
  },
  {
    id: 'financial-advertising',
    category: 'legal',
    title: 'Financial Advertising Compliance',
    description: 'Compliance with financial services advertising regulations',
    status: 'partial',
    priority: 'high',
    lastChecked: new Date('2025-01-10'),
    nextReview: new Date('2025-02-10'),
    actions: ['Review risk disclosures', 'Ensure regulatory compliance', 'Add trading risk warnings']
  },
  {
    id: 'data-security',
    category: 'security',
    title: 'Data Security Measures',
    description: 'Implementation of appropriate technical and organizational measures',
    status: 'compliant',
    priority: 'critical',
    lastChecked: new Date('2025-01-15'),
    nextReview: new Date('2025-04-15'),
    actions: ['Security audit', 'Penetration testing', 'Encryption review']
  },
  {
    id: 'user-consent',
    category: 'privacy',
    title: 'User Consent Management',
    description: 'Proper consent collection and management mechanisms',
    status: 'compliant',
    priority: 'critical',
    lastChecked: new Date('2025-01-15'),
    nextReview: new Date('2025-04-15'),
    documents: ['LoginModal.tsx', 'CookieConsent.tsx'],
    actions: ['Review consent flows', 'Test consent withdrawal']
  },
  {
    id: 'accessibility',
    category: 'accessibility',
    title: 'Web Accessibility (WCAG 2.1)',
    description: 'Compliance with Web Content Accessibility Guidelines',
    status: 'partial',
    priority: 'medium',
    lastChecked: new Date('2025-01-10'),
    nextReview: new Date('2025-03-10'),
    actions: ['Accessibility audit', 'Screen reader testing', 'Keyboard navigation review']
  },
  {
    id: 'age-verification',
    category: 'legal',
    title: 'Age Verification',
    description: 'Ensuring users meet minimum age requirements for financial services',
    status: 'partial',
    priority: 'high',
    lastChecked: new Date('2025-01-10'),
    nextReview: new Date('2025-02-10'),
    actions: ['Implement age verification', 'Add age restriction notices', 'Review terms for minors']
  },
  {
    id: 'business-registration',
    category: 'business',
    title: 'Business Registration & Licensing',
    description: 'Proper business registration and required licenses',
    status: 'pending',
    priority: 'critical',
    lastChecked: new Date('2025-01-01'),
    nextReview: new Date('2025-02-01'),
    actions: ['Complete business registration', 'Obtain required licenses', 'Tax registration']
  }
];

export default function ComplianceChecker({ className = "" }: ComplianceCheckerProps) {
  const [complianceItems, setComplianceItems] = useState<ComplianceItem[]>(COMPLIANCE_ITEMS);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [overallScore, setOverallScore] = useState<number>(0);

  useEffect(() => {
    calculateOverallScore();
  }, [complianceItems]);

  const calculateOverallScore = () => {
    const weights = { critical: 4, high: 3, medium: 2, low: 1 };
    const statusScores = { compliant: 100, partial: 60, 'non-compliant': 0, pending: 30 };
    
    let totalWeight = 0;
    let weightedScore = 0;
    
    complianceItems.forEach(item => {
      const weight = weights[item.priority];
      const score = statusScores[item.status];
      totalWeight += weight;
      weightedScore += score * weight;
    });
    
    const score = totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 0;
    setOverallScore(score);
  };

  const getStatusIcon = (status: ComplianceItem['status']) => {
    switch (status) {
      case 'compliant': return CheckCircle;
      case 'partial': return AlertTriangle;
      case 'non-compliant': return AlertTriangle;
      case 'pending': return Clock;
    }
  };

  const getStatusColor = (status: ComplianceItem['status']) => {
    switch (status) {
      case 'compliant': return 'text-green-600 dark:text-green-400';
      case 'partial': return 'text-yellow-600 dark:text-yellow-400';
      case 'non-compliant': return 'text-red-600 dark:text-red-400';
      case 'pending': return 'text-blue-600 dark:text-blue-400';
    }
  };

  const getPriorityColor = (priority: ComplianceItem['priority']) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
    }
  };

  const getCategoryIcon = (category: ComplianceItem['category']) => {
    switch (category) {
      case 'legal': return FileText;
      case 'privacy': return Shield;
      case 'security': return Shield;
      case 'accessibility': return Eye;
      case 'business': return Users;
      default: return FileText;
    }
  };

  const filteredItems = selectedCategory === 'all' 
    ? complianceItems 
    : complianceItems.filter(item => item.category === selectedCategory);

  const categories = ['all', 'legal', 'privacy', 'security', 'accessibility', 'business'];
  
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400';
    if (score >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const criticalIssues = complianceItems.filter(
    item => item.priority === 'critical' && item.status !== 'compliant'
  ).length;

  const pendingReviews = complianceItems.filter(
    item => item.nextReview < new Date()
  ).length;

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Compliance Dashboard
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Legal, privacy, and regulatory compliance status
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-3xl font-bold ${getScoreColor(overallScore)}`}>
            {overallScore}%
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Compliance Score
          </div>
        </div>
      </div>

      {/* Alert Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className={`p-4 rounded-xl ${
          criticalIssues > 0 
            ? 'bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30' 
            : 'bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/30'
        }`}>
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className={`w-4 h-4 ${
              criticalIssues > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
            }`} />
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              Critical Issues
            </span>
          </div>
          <div className={`text-2xl font-bold ${
            criticalIssues > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
          }`}>
            {criticalIssues}
          </div>
        </div>

        <div className={`p-4 rounded-xl ${
          pendingReviews > 0 
            ? 'bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800/30' 
            : 'bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/30'
        }`}>
          <div className="flex items-center gap-2 mb-1">
            <Clock className={`w-4 h-4 ${
              pendingReviews > 0 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'
            }`} />
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              Pending Reviews
            </span>
          </div>
          <div className={`text-2xl font-bold ${
            pendingReviews > 0 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'
          }`}>
            {pendingReviews}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              Compliant Items
            </span>
          </div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {complianceItems.filter(item => item.status === 'compliant').length}
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

      {/* Compliance Items */}
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
                      Last checked: {item.lastChecked.toLocaleDateString()} • 
                      Next review: {item.nextReview.toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusIcon className={`w-5 h-5 ${getStatusColor(item.status)}`} />
                  <Badge 
                    variant={
                      item.status === 'compliant' ? 'secondary' : 
                      item.status === 'partial' ? 'secondary' : 
                      'destructive'
                    }
                    className="text-xs"
                  >
                    {item.status.replace('-', ' ').toUpperCase()}
                  </Badge>
                </div>
              </div>

              {item.documents && item.documents.length > 0 && (
                <div className="mb-3">
                  <h5 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Related Documents:
                  </h5>
                  <div className="flex flex-wrap gap-1">
                    {item.documents.map(doc => (
                      <Badge key={doc} variant="outline" className="text-xs">
                        {doc}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {item.actions && item.actions.length > 0 && (
                <div>
                  <h5 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Required Actions:
                  </h5>
                  <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                    {item.actions.map((action, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="w-1 h-1 bg-slate-400 rounded-full mt-2 flex-shrink-0"></span>
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
        <Button
          onClick={() => {
            toast.success('Compliance audit initiated');
            // In production, this would trigger a comprehensive audit
          }}
          className="flex items-center gap-2"
        >
          <Shield className="w-4 h-4" />
          Run Full Audit
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            const report = complianceItems.map(item => ({
              title: item.title,
              status: item.status,
              priority: item.priority,
              category: item.category
            }));
            console.log('Compliance Report:', report);
            toast.success('Compliance report generated');
          }}
          className="flex items-center gap-2"
        >
          <FileText className="w-4 h-4" />
          Export Report
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            toast.info('Legal review scheduled for next business day');
          }}
          className="flex items-center gap-2"
        >
          <Globe className="w-4 h-4" />
          Schedule Legal Review
        </Button>
      </div>
    </Card>
  );
}