import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { SwipeableCouponCard } from './SwipeableCouponCard';
import { AdminDeal, BrokerDeal, Company, Coupon } from './types';
import { Monitor, Smartphone, Eye, Edit, CheckCircle, XCircle } from 'lucide-react';

interface DealPreviewModalProps {
  deal: AdminDeal | BrokerDeal | null;
  companies: Company[];
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (deal: AdminDeal | BrokerDeal) => void;
  onApprove?: (dealId: string) => void;
  onReject?: (dealId: string) => void;
  viewMode?: 'mobile' | 'desktop';
  onViewModeChange?: (mode: 'mobile' | 'desktop') => void;
}

export function DealPreviewModal({
  deal,
  companies,
  isOpen,
  onClose,
  onEdit,
  onApprove,
  onReject,
  viewMode = 'mobile',
  onViewModeChange
}: DealPreviewModalProps) {
  if (!deal) return null;

  // Convert deal to Coupon format for preview
  const convertDealToCoupon = (deal: AdminDeal | BrokerDeal): Coupon => {
    const company = companies.find(c => 
      'firmId' in deal ? c.id === deal.firmId : c.id === deal.companyId
    );
    
    if ('firmId' in deal) {
      // Admin deal
      const adminDeal = deal as AdminDeal;
      return {
        id: adminDeal.id,
        title: adminDeal.title,
        description: adminDeal.cardNotes || `Get ${adminDeal.discountPercentage === 100 ? 'FREE' : adminDeal.discountPercentage + '% off'} on ${company?.name || 'this amazing offer'}`,
        discount: adminDeal.discountPercentage === 100 ? 'FREE' : `${adminDeal.discountPercentage}% OFF`,
        category: adminDeal.category,
        merchant: company?.name || 'Unknown Company',
        validUntil: new Date(adminDeal.endDate).toLocaleDateString(),
        startDate: adminDeal.startDate,
        endDate: adminDeal.endDate,
        terms: 'Terms and conditions apply. Valid for limited time only.',
        code: adminDeal.couponCode || '',
        isClaimed: false,
        imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmFkaW5nJTIwY2hhcnR8ZW58MXx8fHwxNzU2NTQ2Nzg0fDA&ixlib=rb-4.0&q=80&w=1080',
        logoUrl: company?.logoUrl || 'https://images.unsplash.com/photo-1642310290564-30033ff60334?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21wYW55JTIwbG9nbyUyMHByb2Zlc3Npb25hbCUyMGZpbmFuY2V8ZW58MXx8fHwxNzU2NTQ2Nzg0fDA&ixlib=rb-4.0&q=80&w=1080',
        affiliateLink: adminDeal.affiliateLink || '',
        hasVerificationBadge: adminDeal.hasVerificationBadge,
        status: adminDeal.status as 'Draft' | 'Published' | 'Archived',
        buttonConfig: adminDeal.buttonConfig
      };
    } else {
      // Broker deal
      const brokerDeal = deal as BrokerDeal;
      const discountText = brokerDeal.discountType === 'percentage' ? `${brokerDeal.discountValue}% OFF` :
                          brokerDeal.discountType === 'fixed' ? `$${brokerDeal.fixedAmount} OFF` :
                          brokerDeal.freeText || 'FREE';
      
      return {
        id: brokerDeal.id,
        title: brokerDeal.title,
        description: brokerDeal.description || `Special offer from ${company?.name || 'this company'}`,
        discount: discountText,
        category: brokerDeal.category,
        merchant: company?.name || 'Unknown Company',
        validUntil: new Date(brokerDeal.endDate || Date.now()).toLocaleDateString(),
        startDate: brokerDeal.startDate || new Date().toISOString(),
        endDate: brokerDeal.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        terms: brokerDeal.terms || 'Terms and conditions apply. Valid for limited time only.',
        code: brokerDeal.couponCode || '',
        isClaimed: false,
        imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmFkaW5nJTIwY2hhcnR8ZW58MXx8fHwxNzU2NTQ2Nzg0fDA&ixlib=rb-4.0&q=80&w=1080',
        logoUrl: company?.logoUrl || 'https://images.unsplash.com/photo-1642310290564-30033ff60334?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21wYW55JTIwbG9nbyUyMHByb2Zlc3Npb25hbCUyMGZpbmFuY2V8ZW58MXx8fHwxNzU2NTQ2Nzg0fDA&ixlib=rb-4.0&q=80&w=1080',
        affiliateLink: brokerDeal.affiliateLink || '',
        hasVerificationBadge: brokerDeal.hasVerificationBadge || false,
        status: 'Published',
        buttonConfig: brokerDeal.buttonConfig || 'both'
      };
    }
  };

  const previewCoupon = convertDealToCoupon(deal);
  const dealType = 'firmId' in deal ? 'Admin' : 'Broker';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Frontpage Preview
              </DialogTitle>
              <DialogDescription className="mt-1">
                {dealType}-created deal • How it will appear on the frontpage
              </DialogDescription>
            </div>
            
            {/* View Mode Toggle */}
            {onViewModeChange && (
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                <Button
                  size="sm"
                  variant={viewMode === 'mobile' ? 'default' : 'ghost'}
                  onClick={() => onViewModeChange('mobile')}
                  className={`rounded-md ${viewMode === 'mobile' ? 'shadow-sm' : ''}`}
                >
                  <Smartphone className="w-4 h-4 mr-1" />
                  Mobile
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === 'desktop' ? 'default' : 'ghost'}
                  onClick={() => onViewModeChange('desktop')}
                  className={`rounded-md ${viewMode === 'desktop' ? 'shadow-sm' : ''}`}
                >
                  <Monitor className="w-4 h-4 mr-1" />
                  Desktop
                </Button>
              </div>
            )}
          </div>
        </DialogHeader>
        
        <div className="py-6">
          {/* Preview Container */}
          <div className="flex justify-center">
            <div 
              className={`
                ${viewMode === 'mobile' 
                  ? 'w-full max-w-sm mx-auto' 
                  : 'w-full max-w-md mx-auto'
                }
                transition-all duration-300
              `}
            >
              {/* Status Indicator */}
              <div className="mb-4 text-center">
                <Badge 
                  className={`
                    ${dealType === 'Admin' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-purple-100 text-purple-800'
                    }
                  `}
                >
                  {dealType} Deal Preview
                </Badge>
              </div>

              {/* KOOCAO App Simulation Background */}
              <div className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-blue-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-2xl">
                
                {/* Mock Header */}
                <div className="mb-6 text-center">
                  <div className="inline-flex items-center gap-2 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm rounded-full px-4 py-2 mb-4 border border-white/30 dark:border-slate-700/40">
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xs font-bold">K</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">KOOCAO</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
                    Save Money on Your Next Challenge
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Verified deals • Updated daily
                  </p>
                </div>

                {/* Deal Card Preview */}
                <SwipeableCouponCard
                  coupon={previewCoupon}
                  onSwipeLeft={() => {}} // Disabled in preview
                  onSwipeRight={() => {}} // Disabled in preview  
                  onClaim={() => {}} // Disabled in preview
                  isAuthenticated={true} // Always show as authenticated in preview
                  onLoginRequired={() => {}} // Disabled in preview
                  userName="Admin User"
                />

                {/* Mock Progress & Actions (Disabled) */}
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-2xl border border-white/40 dark:border-slate-700/50 shadow-2xl shadow-black/10 p-3 mt-4 opacity-50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Progress</span>
                    <span className="text-sm font-bold text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                      1 / 6
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1 overflow-hidden shadow-inner mb-3">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-blue-500 rounded-full transition-all duration-700 ease-out shadow-sm w-1/6" />
                  </div>
                  
                  <div className="flex justify-center gap-8">
                    <div className="flex flex-col items-center gap-1.5 opacity-50">
                      <Button size="lg" className="w-14 h-14 rounded-full bg-gradient-to-br from-slate-400 to-slate-500 text-white pointer-events-none">
                        ✕
                      </Button>
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Pass</span>
                    </div>
                    <div className="flex flex-col items-center gap-1.5 opacity-50">
                      <Button size="lg" className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white pointer-events-none">
                        ♥
                      </Button>
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Save Deal</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview Notice */}
              <div className="mt-4 text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  🔍 Preview Mode - Interactions disabled
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {previewCoupon.category}
            </Badge>
            <Badge variant="outline">
              {previewCoupon.discount}
            </Badge>
            {previewCoupon.hasVerificationBadge && (
              <Badge className="bg-green-100 text-green-800">
                Verified
              </Badge>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Close Preview
            </Button>
            {onEdit && (
              <Button 
                onClick={() => {
                  onClose();
                  onEdit(deal);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Deal
              </Button>
            )}
            {onApprove && (
              <Button 
                onClick={() => {
                  onClose();
                  onApprove(deal.id);
                }}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve Deal
              </Button>
            )}
            {onReject && (
              <Button 
                onClick={() => {
                  onClose();
                  onReject(deal.id);
                }}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject Deal
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}