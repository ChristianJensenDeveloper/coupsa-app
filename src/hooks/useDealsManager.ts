import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner@2.0.3';
import { Coupon, CouponCategory, User as UserType } from '../components/types';
import { useDealsData } from './useDealsData';

export function useDealsManager(user: UserType | null) {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [savedDeals, setSavedDeals] = useState<Coupon[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CouponCategory>('All');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewedCoupons, setViewedCoupons] = useState<Set<string>>(new Set());
  
  // Rejection confirmation state
  const [isRejectConfirmOpen, setIsRejectConfirmOpen] = useState(false);
  const [pendingRejectCoupon, setPendingRejectCoupon] = useState<Coupon | null>(null);

  // Use real data fetching hook
  const { coupons: fetchedCoupons, loading: dealsLoading, error: dealsError, refetch: refetchDeals } = useDealsData();

  // Update local state when fetched data changes
  useEffect(() => {
    setCoupons(fetchedCoupons);
  }, [fetchedCoupons]);

  // Add demo saved deals for new users
  useEffect(() => {
    if (user && savedDeals.length === 0) {
      setSavedDeals([{
        id: 'ftmo-demo',
        title: '30% off Challenge Fee',
        description: 'Get 30% discount on FTMO Challenge fee. Perfect for experienced traders looking to get funded.',
        discount: '30% OFF',
        category: 'CFD',
        merchant: 'FTMO',
        validUntil: 'Mar 15, 2026',
        startDate: '2025-01-01T00:00:00Z',
        endDate: '2026-03-15T23:59:59Z',
        terms: 'Valid for new users only. One-time use per account.',
        code: 'FTMO30',
        isClaimed: true,
        affiliateLink: 'https://ftmo.com/signup?ref=koocao',
        logoUrl: 'https://images.unsplash.com/photo-1642310290564-30033ff60334?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21wYW55JTIwbG9nbyUyMHByb2Zlc3Npb25hbCUyMGZpbmFuY2V8ZW58MXx8fHwxNzU2NTQ2Nzg0fDA&ixlib=rb-4.0&q=80&w=1080',
        hasVerificationBadge: true
      }]);
    } else if (!user) {
      setSavedDeals([]);
    }
  }, [user, savedDeals.length]);

  // Filter coupons based on category and remove expired deals
  const filteredCoupons = useMemo(() => {
    const now = new Date();
    const categoryFiltered = coupons.filter(coupon => {
      const matchesCategory = selectedCategory === 'All' || coupon.category === selectedCategory;
      const isActive = new Date(coupon.endDate) > now;
      return matchesCategory && isActive;
    });

    // Separate saved and unsaved deals
    const savedDealIds = new Set(savedDeals.map(deal => deal.id));
    const unsavedDeals = categoryFiltered.filter(coupon => !savedDealIds.has(coupon.id));
    const activeSavedDeals = categoryFiltered.filter(coupon => savedDealIds.has(coupon.id));

    return [...unsavedDeals, ...activeSavedDeals];
  }, [coupons, selectedCategory, savedDeals]);

  const currentCoupon = filteredCoupons[currentIndex] || null;

  // Reset index when category changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [selectedCategory]);

  const handleClaimCoupon = (couponId: string) => {
    setCoupons(prev => 
      prev.map(coupon => 
        coupon.id === couponId 
          ? { ...coupon, isClaimed: true }
          : coupon
      )
    );
  };

  const handleCategoryChange = (category: CouponCategory) => {
    setSelectedCategory(category);
  };

  const goToNextCoupon = () => {
    setCurrentIndex(prev => {
      const nextIndex = prev + 1;
      if (nextIndex >= filteredCoupons.length) {
        toast.info("You've seen all deals! Starting over...");
        return 0;
      }
      return nextIndex;
    });
  };

  const handleSwipeLeft = (onLoginRequired: () => void) => {
    if (!user) {
      onLoginRequired();
      return;
    }
    
    if (currentCoupon) {
      setPendingRejectCoupon(currentCoupon);
      setIsRejectConfirmOpen(true);
    }
  };

  const handleSwipeRight = (onLoginRequired: () => void) => {
    if (!user) {
      onLoginRequired();
      return;
    }
    
    if (currentCoupon) {
      setViewedCoupons(prev => new Set(prev).add(currentCoupon.id));
      
      const isAlreadySaved = savedDeals.some(deal => deal.id === currentCoupon.id);
      
      if (!currentCoupon.isClaimed && !isAlreadySaved) {
        handleClaimCoupon(currentCoupon.id);
        setSavedDeals(prev => {
          toast.success('saved to "My Deals"');
          return [...prev, { ...currentCoupon, isClaimed: true }];
        });
      } else if (isAlreadySaved) {
        toast.info("Already in your deals folder!");
      } else {
        toast.info("Deal already claimed!");
      }
      goToNextCoupon();
    }
  };

  const handleConfirmReject = () => {
    if (pendingRejectCoupon) {
      setViewedCoupons(prev => new Set(prev).add(pendingRejectCoupon.id));
      toast.info("Deal dismissed");
      goToNextCoupon();
    }
    setIsRejectConfirmOpen(false);
    setPendingRejectCoupon(null);
  };

  const handleCancelReject = () => {
    setIsRejectConfirmOpen(false);
    setPendingRejectCoupon(null);
  };

  const handleSaveInsteadOfReject = () => {
    if (pendingRejectCoupon) {
      const isAlreadySaved = savedDeals.some(deal => deal.id === pendingRejectCoupon.id);
      
      if (!isAlreadySaved) {
        handleClaimCoupon(pendingRejectCoupon.id);
        setSavedDeals(prev => {
          toast.success('saved to "My Deals"');
          return [...prev, { ...pendingRejectCoupon, isClaimed: true }];
        });
      } else {
        toast.info("Already in your deals folder!");
      }
      setViewedCoupons(prev => new Set(prev).add(pendingRejectCoupon.id));
      goToNextCoupon();
    }
    setIsRejectConfirmOpen(false);
    setPendingRejectCoupon(null);
  };

  const handleClearExpiredDeals = () => {
    setSavedDeals(prev => prev.filter(deal => new Date(deal.endDate) > new Date()));
    toast.success("Expired deals cleared!");
  };

  const handleRemoveDeal = (dealId: string) => {
    setSavedDeals(prev => prev.filter(deal => deal.id !== dealId));
    toast.success("Deal removed from saved!");
  };

  return {
    // State
    coupons,
    savedDeals,
    searchQuery,
    selectedCategory,
    currentIndex,
    currentCoupon,
    filteredCoupons,
    dealsLoading,
    dealsError,
    isRejectConfirmOpen,
    pendingRejectCoupon,
    
    // Actions
    setSearchQuery,
    handleCategoryChange,
    handleSwipeLeft,
    handleSwipeRight,
    handleClaimCoupon,
    handleConfirmReject,
    handleCancelReject,
    handleSaveInsteadOfReject,
    handleClearExpiredDeals,
    handleRemoveDeal,
    refetchDeals,
    setCurrentIndex
  };
}