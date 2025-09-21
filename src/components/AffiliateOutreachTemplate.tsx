import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Copy, Mail, TrendingUp, Users, Eye, Link } from "lucide-react";
import { toast } from "sonner@2.0.3";

interface AffiliateOutreachTemplateProps {
  companyName: string;
  companyCategory: string;
  dealsCount: number;
  monthlyViews?: number;
  clickThroughRate?: string;
}

export function AffiliateOutreachTemplate({ 
  companyName, 
  companyCategory, 
  dealsCount,
  monthlyViews = 1200,
  clickThroughRate = "3.2%"
}: AffiliateOutreachTemplateProps) {
  const emailTemplate = `Subject: Your ${companyName} deals are performing well on KOOCAO - Partnership Invitation

Hi ${companyName} Team,

I hope this email finds you well. My name is [Your Name] and I'm reaching out from KOOCAO (koocao.com), a trading deals platform where we help traders discover the best prop firm and broker offers.

I wanted to let you know that we've been promoting ${companyName} as one of our affiliate partners for the past few months. As your affiliate marketing partner, we've been listing your deals on our platform to drive quality traffic to your offers.

Here's how your ${companyName} deals have been performing on KOOCAO:
• ${dealsCount} active deals currently listed
• ~${monthlyViews.toLocaleString()} monthly views across your offers  
• ${clickThroughRate} average click-through rate to your platform
• Growing trader engagement in the ${companyCategory} category

Our affiliate marketing team has been manually managing your deal listings, but I'd love to invite you to take direct control of how your offers are presented on our platform. This collaboration would allow you to:

✅ Update deals in real-time as they change
✅ Access detailed performance analytics 
✅ Control your brand messaging and presentation
✅ Add new deals instantly to reach our trader community
✅ Work directly with our team to optimize performance

We believe this partnership approach will be more efficient than our current manual process and give you better control over how ${companyName} is represented on KOOCAO.

If you're interested in exploring this collaboration, you can:
1. Visit koocao.com/broker-register to request access
2. Or simply reply to this email and I'll walk you through the process

No pressure at all - we're happy to continue promoting your deals as we have been. But if you'd like more direct control and better analytics, this could be a great opportunity for both of us.

Best regards,
[Your Name]
[Your Title]
KOOCAO Team
[Your Email]
[Your Phone]

P.S. You can see how we're currently promoting ${companyName} at koocao.com - feel free to take a look!

---

IMPORTANT: This is a template. Customize with:
- Real performance data from your analytics
- Specific deal names that performed well
- Personal touches about why you chose them as a partner
- Screenshots of their current listings (optional)`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(emailTemplate);
    toast.success("Email template copied to clipboard!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Affiliate Partnership Outreach Template
        </h3>
        <p className="text-slate-600 dark:text-slate-400">
          Professional email template for reaching out to companies you're promoting as affiliate partners
        </p>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Link className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Active Deals</p>
                <p className="font-bold text-slate-900 dark:text-slate-100">{dealsCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <Eye className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Monthly Views</p>
                <p className="font-bold text-slate-900 dark:text-slate-100">{monthlyViews.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">CTR</p>
                <p className="font-bold text-slate-900 dark:text-slate-100">{clickThroughRate}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Category</p>
                <p className="font-bold text-slate-900 dark:text-slate-100">{companyCategory}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Email Template */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Email Template for {companyName}</CardTitle>
              <CardDescription>
                Professional outreach emphasizing your existing affiliate relationship
              </CardDescription>
            </div>
            <Button 
              onClick={copyToClipboard}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Template
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <pre className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300 font-mono leading-relaxed">
              {emailTemplate}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Key Points */}
      <Card>
        <CardHeader>
          <CardTitle>🎯 Key Messaging Points</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
            <p><strong>Transparency First:</strong> Clearly state you're already their affiliate partner</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
            <p><strong>Value Demonstrated:</strong> Show real performance data from your promotions</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
            <p><strong>Collaboration Focus:</strong> Frame as partnership improvement, not takeover</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
            <p><strong>No Pressure:</strong> Make it clear you'll continue promoting them regardless</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
            <p><strong>Mutual Benefit:</strong> Emphasize how collaboration helps both parties</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}