import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { AffiliateDisclosure } from './AffiliateDisclosure';
import { 
  Building2,
  CheckCircle,
  Clock,
  Copy,
  ExternalLink,
  ArrowDown,
  Settings,
  Shield,
  AlertTriangle,
  Eye,
  Calendar,
  Tag
} from 'lucide-react';
import { Coupon, Company } from './types';
import { toast } from 'sonner@2.0.3';

interface EnhancedDealCardProps {
  deal: Coupon;
  company?: Company;
  onClaimDeal?: (dealId: string) => void;
  onCopyCode?: (code: string) => void;
  isAuthenticated?: boolean;
  onLoginRequired?: () => void;
  userName?: string;
  showInheritanceInfo?: boolean;
}

export function EnhancedDealCard({ 
  deal, 
  company,
  onClaimDeal,
  onCopyCode,
  isAuthenticated = false,
  onLoginRequired,
  userName,
  showInheritanceInfo = false
}: EnhancedDealCardProps) {
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  const handleClaimDeal = () => {
    if (!isAuthenticated) {
      onLoginRequired?.();
      return;
    }
    
    if (deal.affiliateLink) {
      window.open(deal.affiliateLink, '_blank');
      onClaimDeal?.(deal.id);
      toast.success('Redirecting to deal...');
    }
  };

  const handleCopyCode = () => {
    if (!isAuthenticated) {
      onLoginRequired?.();
      return;
    }

    if (deal.code) {
      navigator.clipboard.writeText(deal.code);
      onCopyCode?.(deal.code);
      toast.success('Coupon code copied!');
    }
  };

  const getInheritanceBadge = () => {
    if (!showInheritanceInfo || !company) return null;

    // Check if this deal likely inherited from company
    const isInherited = company.defaultMarketingData?.affiliateLink === deal.affiliateLink ||
                       company.defaultMarketingData?.defaultCouponCode === deal.code;

    if (isInherited) {
      return (
        <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
          <ArrowDown className="w-3 h-3" />
          Inherited
        </Badge>
      );
    }

    return (
      <Badge className="bg-purple-100 text-purple-800 flex items-center gap-1">
        <Settings className="w-3 h-3" />
        Custom
      </Badge>
    );
  };

  const getMarketingStatusBadge = () => {
    if (!company) return null;

    const hasCompleteMarketing = deal.affiliateLink && deal.code;
    
    if (hasCompleteMarketing) {
      return (
        <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Complete
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="text-amber-600 border-amber-300 flex items-center gap-1">
        <AlertTriangle className="w-3 h-3" />
        Incomplete
      </Badge>
    );
  };

  const isExpired = new Date(deal.endDate) < new Date();
  const isExpiringSoon = new Date(deal.endDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  return (
    <>
      <Card className={`overflow-hidden transition-all duration-300 hover:shadow-lg ${
        isExpired ? 'opacity-60' : ''
      }`}>
        <CardContent className="p-0">
          {/* Background Image */}
          {deal.backgroundImageUrl && (
            <div 
              className="h-32 bg-cover bg-center relative"
              style={{
                backgroundImage: `url(${deal.backgroundImageUrl})`,
                backgroundPosition: deal.backgroundImagePosition || 'center',
                filter: deal.backgroundBlur ? `blur(${deal.backgroundBlur}px)` : 'none'
              }}
            >
              <div className="absolute inset-0 bg-black/20" />
            </div>
          )}

          <div className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  {deal.logoUrl ? (
                    <img src={deal.logoUrl} alt={deal.merchant} className="w-10 h-10 rounded-lg object-cover" />
                  ) : (
                    <Building2 className="w-6 h-6 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">{deal.merchant}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{deal.category}</p>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-2">
                {deal.hasVerificationBadge && (
                  <Badge className="bg-green-100 text-green-800">
                    <Shield className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
                {isExpiringSoon && !isExpired && (
                  <Badge variant="outline" className="text-amber-600 border-amber-300 animate-pulse">
                    <Clock className="w-3 h-3 mr-1" />
                    Expires Soon
                  </Badge>
                )}
              </div>
            </div>

            {/* Deal Title and Discount */}
            <div className="mb-4">
              <h4 className="font-semibold text-xl text-slate-900 dark:text-slate-100 mb-2">{deal.title}</h4>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white text-lg px-4 py-2">
                  {deal.discount}
                </Badge>
                {showInheritanceInfo && getInheritanceBadge()}
                {getMarketingStatusBadge()}
              </div>
              <p className="text-slate-600 dark:text-slate-400">{deal.description}</p>
            </div>

            {/* Deal Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-500 dark:text-slate-400 mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Valid until {new Date(deal.endDate).toLocaleDateString()}</span>
              </div>
              {deal.code && (
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-xs font-mono">
                    {deal.code}
                  </code>
                </div>
              )}
            </div>

            {/* Affiliate Disclosure for deals with affiliate links */}
            {deal.affiliateLink && isAuthenticated && (
              <div className="mb-4">
                <AffiliateDisclosure variant="compact" />
              </div>
            )}

            {/* Enhanced Dual Button Logic */}
            <div className="flex gap-3">
              {deal.buttonConfig === 'both' || deal.buttonConfig === 'claim-only' || !deal.buttonConfig ? (
                <Button 
                  onClick={handleClaimDeal}
                  disabled={isExpired || !deal.affiliateLink}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  {isExpired ? 'Expired' : 'Claim Deal'}
                </Button>
              ) : null}

              {(deal.buttonConfig === 'both' || deal.buttonConfig === 'code-only') && deal.code ? (
                <Button 
                  variant="outline" 
                  onClick={handleCopyCode}
                  disabled={isExpired}
                  className={deal.buttonConfig === 'code-only' ? 'flex-1' : ''}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Code
                </Button>
              ) : null}

              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsDetailsDialogOpen(true)}
              >
                <Eye className="w-4 h-4" />
              </Button>
            </div>

            {/* Inheritance Information for Admin */}
            {showInheritanceInfo && company && (
              <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Marketing Data Source</h5>
                <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Affiliate Link:</span>
                    <span className={deal.affiliateLink === company.defaultMarketingData?.affiliateLink ? 'text-blue-600' : 'text-purple-600'}>
                      {deal.affiliateLink === company.defaultMarketingData?.affiliateLink ? 'Inherited' : 'Override'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Coupon Code:</span>
                    <span className={deal.code === company.defaultMarketingData?.defaultCouponCode ? 'text-blue-600' : 'text-purple-600'}>
                      {deal.code === company.defaultMarketingData?.defaultCouponCode ? 'Inherited' : 'Override'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* User Interaction Status */}
            {isAuthenticated && userName && (
              <div className="mt-4 text-xs text-slate-500 dark:text-slate-400">
                {deal.isClaimed ? `Saved by ${userName}` : 'Not saved yet'}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Deal Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              {deal.title}
            </DialogTitle>
            <DialogDescription>
              Full details for this deal from {deal.merchant}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Description</h4>
              <p className="text-slate-600 dark:text-slate-400">{deal.description}</p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Terms & Conditions</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">{deal.terms}</p>
            </div>

            {deal.cardNotes && (
              <div>
                <h4 className="font-semibold mb-2">Additional Notes</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">{deal.cardNotes}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Valid From:</span>
                <p className="text-slate-600 dark:text-slate-400">{new Date(deal.startDate).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="font-medium">Valid Until:</span>
                <p className="text-slate-600 dark:text-slate-400">{new Date(deal.endDate).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Affiliate Disclosure in dialog */}
            {deal.affiliateLink && (
              <div className="border-t pt-4">
                <AffiliateDisclosure variant="detailed" />
              </div>
            )}

            {showInheritanceInfo && company && (
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Marketing Data Analysis</h4>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium">Company Default:</span>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        Link: {company.defaultMarketingData?.affiliateLink ? '✓ Set' : '✗ Missing'}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Code: {company.defaultMarketingData?.defaultCouponCode || 'Not set'}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">This Deal:</span>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        Link: {deal.affiliateLink ? '✓ Set' : '✗ Missing'}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Code: {deal.code || 'Not set'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}