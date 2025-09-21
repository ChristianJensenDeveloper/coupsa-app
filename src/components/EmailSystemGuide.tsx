import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { CheckCircle, XCircle, ArrowRight, Zap, Mail, Users, DollarSign, Code, Shield, Clock, TrendingUp } from "lucide-react";
import { useState } from "react";

interface EmailSystemGuideProps {
  onClose: () => void;
}

export function EmailSystemGuide({ onClose }: EmailSystemGuideProps) {
  const [showComparison, setShowComparison] = useState(false);

  const emailTypes = [
    {
      type: 'Marketing Campaigns',
      description: 'Weekly deal newsletters, promotional emails',
      customPros: ['Full control over design', 'Integrated with your app', 'Custom analytics'],
      customCons: ['Development time', 'Deliverability challenges', 'Compliance complexity'],
      externalPros: ['Professional deliverability', 'Advanced segmentation', 'A/B testing'],
      externalCons: ['Monthly costs', 'Limited customization', 'External dependency'],
      recommendation: 'External (Mailchimp, ConvertKit)',
      icon: <Mail className="w-6 h-6 text-blue-500" />
    },
    {
      type: 'Transactional Emails',
      description: 'Password resets, welcome emails, confirmations',
      customPros: ['Complete integration', 'No per-email costs', 'Real-time delivery'],
      customCons: ['Infrastructure setup', 'Bounce handling', 'Security concerns'],
      externalPros: ['Reliable delivery', 'Built-in security', 'Easy setup'],
      externalCons: ['Per-email pricing', 'API limits', 'Less customization'],
      recommendation: 'External (SendGrid, Postmark)',
      icon: <Zap className="w-6 h-6 text-green-500" />
    },
    {
      type: 'Automated Flows',
      description: 'Drip campaigns, expiration alerts, re-engagement',
      customPros: ['Custom triggers', 'Deep personalization', 'No flow limits'],
      customCons: ['Complex logic', 'Testing challenges', 'Maintenance burden'],
      externalPros: ['Visual flow builder', 'Pre-built templates', 'Easy optimization'],
      externalCons: ['Flow limitations', 'Higher costs', 'Platform lock-in'],
      recommendation: 'Hybrid Approach',
      icon: <Users className="w-6 h-6 text-purple-500" />
    }
  ];

  const platforms = [
    {
      name: 'Mailchimp',
      type: 'Marketing',
      pricing: '$10-300/month',
      pros: ['Easy to use', 'Great templates', 'Advanced analytics', 'A/B testing'],
      cons: ['Expensive for large lists', 'Limited automation', 'Strict compliance'],
      bestFor: 'Weekly newsletters, promotional campaigns',
      integration: 'Good API for syncing contacts and sending campaigns'
    },
    {
      name: 'SendGrid',
      type: 'Transactional',
      pricing: '$20-750/month',
      pros: ['Excellent deliverability', 'Powerful API', 'Email validation', 'Real-time analytics'],
      cons: ['Complex pricing', 'Learning curve', 'Limited templates'],
      bestFor: 'Password resets, welcome emails, notifications',
      integration: 'Perfect for transactional emails via API'
    },
    {
      name: 'ConvertKit',
      type: 'Automation',
      pricing: '$29-500/month',
      pros: ['Visual automation', 'Creator-focused', 'Easy segmentation', 'Landing pages'],
      cons: ['Limited design options', 'No free plan', 'Creator-focused features'],
      bestFor: 'Automated sequences, subscriber nurturing',
      integration: 'Great API for triggering automated sequences'
    },
    {
      name: 'Postmark',
      type: 'Transactional',
      pricing: '$10-750/month',
      pros: ['Amazing deliverability', 'Simple pricing', 'Fast delivery', 'Great support'],
      cons: ['No marketing features', 'Limited templates', 'Transactional only'],
      bestFor: 'Mission-critical transactional emails',
      integration: 'Simple API for reliable email delivery'
    }
  ];

  const hybridApproach = {
    title: 'Recommended Hybrid Setup for REDUZED',
    description: 'Combine the best of both worlds for maximum effectiveness',
    components: [
      {
        system: 'Custom Built (Current System)',
        use: 'Campaign Management & Analytics',
        features: ['Campaign creation', 'Performance tracking', 'Deal integration', 'Admin controls'],
        icon: <Code className="w-5 h-5 text-blue-500" />
      },
      {
        system: 'SendGrid or Postmark',
        use: 'Transactional Emails',
        features: ['Password resets', 'Welcome emails', 'Account notifications', 'Reliable delivery'],
        icon: <Shield className="w-5 h-5 text-green-500" />
      },
      {
        system: 'ConvertKit or Mailchimp',
        use: 'Marketing Campaigns',
        features: ['Weekly newsletters', 'Promotional emails', 'Subscriber management', 'A/B testing'],
        icon: <TrendingUp className="w-5 h-5 text-purple-500" />
      },
      {
        system: 'Custom Automation',
        use: 'Deal-Specific Triggers',
        features: ['Expiration alerts', 'Personalized recommendations', 'User behavior triggers', 'Deep integration'],
        icon: <Clock className="w-5 h-5 text-orange-500" />
      }
    ]
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">
          Email System Architecture Guide
        </h1>
        <p className="text-lg text-slate-600 max-w-3xl mx-auto">
          Should you build custom email features or use external platforms like Mailchimp? 
          Here's a comprehensive guide for REDUZED's email strategy.
        </p>
      </div>

      {/* Email Types Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {emailTypes.map((emailType, index) => (
          <Card key={index} className="border-0 shadow-lg bg-white/70 backdrop-blur-xl">
            <CardHeader>
              <div className="flex items-center gap-3 mb-4">
                {emailType.icon}
                <div>
                  <CardTitle className="text-xl">{emailType.type}</CardTitle>
                  <p className="text-sm text-slate-600">{emailType.description}</p>
                </div>
              </div>
              
              <Badge 
                className={`w-fit ${
                  emailType.recommendation.includes('External') 
                    ? 'bg-blue-100 text-blue-700'
                    : emailType.recommendation.includes('Hybrid')
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-green-100 text-green-700'
                } border-0`}
              >
                Recommended: {emailType.recommendation}
              </Badge>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Custom Approach */}
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Custom Built</h4>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs font-medium text-green-700 mb-1">Pros:</p>
                    {emailType.customPros.map((pro, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                        <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                        {pro}
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-red-700 mb-1">Cons:</p>
                    {emailType.customCons.map((con, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                        <XCircle className="w-3 h-3 text-red-500 flex-shrink-0" />
                        {con}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* External Approach */}
              <div className="border-t border-slate-200 pt-4">
                <h4 className="font-semibold text-slate-900 mb-2">External Platform</h4>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs font-medium text-green-700 mb-1">Pros:</p>
                    {emailType.externalPros.map((pro, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                        <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                        {pro}
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-red-700 mb-1">Cons:</p>
                    {emailType.externalCons.map((con, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                        <XCircle className="w-3 h-3 text-red-500 flex-shrink-0" />
                        {con}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recommended Hybrid Approach */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl text-slate-900">{hybridApproach.title}</CardTitle>
              <p className="text-slate-600">{hybridApproach.description}</p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {hybridApproach.components.map((component, index) => (
              <div key={index} className="bg-white/70 rounded-xl p-6 backdrop-blur-sm">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                    {component.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 mb-1">{component.system}</h4>
                    <p className="text-sm text-slate-600 mb-3">{component.use}</p>
                    <div className="space-y-1">
                      {component.features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-slate-700">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Platform Comparison Button */}
      <div className="text-center">
        <Button onClick={() => setShowComparison(true)} size="lg">
          <DollarSign className="w-5 h-5 mr-2" />
          Compare Email Platforms & Pricing
        </Button>
      </div>

      {/* Quick Implementation Guide */}
      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <ArrowRight className="w-6 h-6 text-blue-500" />
            Quick Implementation Guide for REDUZED
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">1</span>
                </div>
                <h4 className="font-bold text-slate-900 mb-2">Start with Transactional</h4>
                <p className="text-sm text-slate-600">
                  Set up SendGrid/Postmark for password resets and welcome emails. Critical for user onboarding.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-green-600">2</span>
                </div>
                <h4 className="font-bold text-slate-900 mb-2">Add Marketing Platform</h4>
                <p className="text-sm text-slate-600">
                  Use your current system to create campaigns, then send via Mailchimp API for better deliverability.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-purple-600">3</span>
                </div>
                <h4 className="font-bold text-slate-900 mb-2">Build Custom Flows</h4>
                <p className="text-sm text-slate-600">
                  Create deal-specific automation that external platforms can't match. Your competitive advantage.
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-6">
              <h4 className="font-bold text-slate-900 mb-4">💡 Pro Tips for REDUZED:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-700">
                <div className="space-y-2">
                  <p>• Use current system for campaign creation & analytics</p>
                  <p>• SendGrid for reliable transactional delivery</p>
                  <p>• Custom automation for deal expiration alerts</p>
                </div>
                <div className="space-y-2">
                  <p>• Mailchimp for professional newsletters</p>
                  <p>• Template system for consistent branding</p>
                  <p>• A/B testing for optimization</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Close Button */}
      <div className="text-center">
        <Button onClick={onClose} size="lg" variant="outline">
          Got it, thanks!
        </Button>
      </div>

      {/* Platform Comparison Dialog */}
      <AlertDialog open={showComparison} onOpenChange={setShowComparison}>
        <AlertDialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Email Platform Comparison</AlertDialogTitle>
            <AlertDialogDescription>
              Detailed comparison of popular email platforms for different use cases
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {platforms.map((platform, index) => (
              <Card key={index} className="bg-white">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{platform.name}</CardTitle>
                      <Badge className={`mt-2 ${
                        platform.type === 'Marketing' ? 'bg-blue-100 text-blue-700' :
                        platform.type === 'Transactional' ? 'bg-green-100 text-green-700' :
                        'bg-purple-100 text-purple-700'
                      } border-0`}>
                        {platform.type}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-900">{platform.pricing}</div>
                      <div className="text-xs text-slate-600">per month</div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-medium text-slate-900 mb-2">Best For:</p>
                    <p className="text-sm text-slate-600">{platform.bestFor}</p>
                  </div>
                  
                  <div>
                    <p className="font-medium text-slate-900 mb-2">Integration:</p>
                    <p className="text-sm text-slate-600">{platform.integration}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium text-green-700 mb-2">Pros:</p>
                      {platform.pros.map((pro, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-slate-600 mb-1">
                          <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                          {pro}
                        </div>
                      ))}
                    </div>
                    
                    <div>
                      <p className="text-xs font-medium text-red-700 mb-2">Cons:</p>
                      {platform.cons.map((con, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-slate-600 mb-1">
                          <XCircle className="w-3 h-3 text-red-500 flex-shrink-0" />
                          {con}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <AlertDialogFooter className="mt-8">
            <AlertDialogCancel>Close Comparison</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}