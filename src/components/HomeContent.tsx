import React from 'react';
import { SwipeableCouponCard } from './SwipeableCouponCard';
import { CouponFilters } from './CouponFilters';
import { Button } from './ui/button';
import { Target, Heart, X, Ticket } from 'lucide-react';
import { Coupon, CouponCategory, User as UserType } from './types';

interface HomeContentProps {
  user: UserType | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: CouponCategory;
  handleCategoryChange: (category: CouponCategory) => void;
  handleLoginRequired: () => void;
  filteredCoupons: Coupon[];
  currentIndex: number;
  currentCoupon: Coupon | null;
  handleSwipeLeft: () => void;
  handleSwipeRight: () => void;
  handleButtonSwipeLeft: () => void;
  handleButtonSwipeRight: () => void;
  handleClaimCoupon: (couponId: string) => void;
  setSelectedCategory: (category: CouponCategory) => void;
  setCurrentIndex: (index: number) => void;
  dealsError: any;
  dealsLoading: boolean;
  coupons: Coupon[];
}

export function HomeContent({
  user,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  handleCategoryChange,
  handleLoginRequired,
  filteredCoupons,
  currentIndex,
  currentCoupon,
  handleSwipeLeft,
  handleSwipeRight,
  handleButtonSwipeLeft,
  handleButtonSwipeRight,
  handleClaimCoupon,
  setSelectedCategory,
  setCurrentIndex,
  dealsError,
  dealsLoading,
  coupons
}: HomeContentProps) {
  return (
    <>
      {/* Combined Hero & Filters Section */}
      <div className="mb-6 w-full max-w-md mx-auto px-3">
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl rounded-2xl border border-white/30 dark:border-slate-700/40 shadow-xl shadow-black/5 p-5">
          {/* Hero Text */}
          <div className="text-center mb-5">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2 leading-tight">
              Save Money on Your Next Challenge
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Verified • Daily updates • {user ? 'Save deals' : 'Browse free'}
              {!dealsError && !dealsLoading && coupons.length > 0 && (
                <span className="ml-2 inline-flex items-center gap-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block"></span>
                  Live data
                </span>
              )}
            </p>
          </div>
          
          {/* Filters */}
          <CouponFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            isAuthenticated={!!user}
            onLoginRequired={handleLoginRequired}
          />
        </div>
      </div>

      {/* Optimized Swipeable Deal Section */}
      <div className="flex flex-col items-center">
        {currentCoupon ? (
          <div className="w-full max-w-md mx-auto px-3">
            {/* Premium Card Stack with Better Depth */}
            <div 
              className="h-[420px] sm:h-[440px] flex items-start justify-center relative"
              style={{
                perspective: '1200px',
                transformStyle: 'preserve-3d'
              }}
            >
              {filteredCoupons.slice(currentIndex, Math.min(currentIndex + 4, filteredCoupons.length)).map((coupon, index) => {
                const isTopCard = index === 0;
                const zIndex = 40 - index;
                const scale = 1 - (index * 0.06);
                const yOffset = index * 16;
                const xOffset = (index * 6) - (index * 3);
                const rotation = index * -1.5;
                const opacity = index === 0 ? 1 : (index === 1 ? 0.85 : (index === 2 ? 0.6 : 0.4));
                
                return (
                  <div
                    key={`${coupon.id}-${index}`}
                    className="absolute w-full max-w-md"
                    style={{
                      zIndex,
                      transform: `scale(${scale}) translateY(${yOffset}px) translateX(${xOffset}px) rotate(${rotation}deg)`,
                      opacity: opacity,
                      pointerEvents: isTopCard ? 'auto' : 'none',
                      filter: isTopCard 
                        ? 'drop-shadow(0 25px 50px rgba(0,0,0,0.15)) drop-shadow(0 10px 20px rgba(59,130,246,0.1))' 
                        : `blur(${index * 0.8}px) drop-shadow(0 15px 30px rgba(0,0,0,0.1))`,
                    }}
                  >
                    <div 
                      className={`${!isTopCard ? 'ring-1 ring-white/20 dark:ring-slate-700/30' : ''}`}
                      style={{
                        borderRadius: '1.5rem',
                        transform: !isTopCard ? 'translateZ(0)' : 'none',
                      }}
                    >
                      <SwipeableCouponCard
                        coupon={coupon}
                        onSwipeLeft={isTopCard ? handleSwipeLeft : () => {}}
                        onSwipeRight={isTopCard ? handleSwipeRight : () => {}}
                        onClaim={handleClaimCoupon}
                        isAuthenticated={!!user}
                        onLoginRequired={handleLoginRequired}
                        userName={user?.name}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Premium Progress & Actions Section */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-2xl border border-white/40 dark:border-slate-700/50 shadow-2xl shadow-black/10 p-3 mt-2">
              {/* Enhanced Progress Bar */}
              <div className="mb-1">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Progress</span>
                    {currentCoupon && new Date(currentCoupon.endDate) > new Date() && new Date(currentCoupon.endDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && (
                      <span className="text-xs bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 rounded-full animate-pulse shadow-md">
                        ⏰ Expires Soon
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-bold text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                    {currentIndex + 1} / {filteredCoupons.length}
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1 overflow-hidden shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-500 rounded-full transition-all duration-700 ease-out shadow-sm"
                    style={{ width: `${((currentIndex + 1) / filteredCoupons.length) * 100}%` }}
                  />
                </div>
              </div>
              
              {/* Premium Action Buttons */}
              <div className="flex justify-center gap-8 pt-2">
                <div className="flex flex-col items-center gap-1.5">
                  <Button
                    size="lg"
                    onClick={handleButtonSwipeLeft}
                    className="w-14 h-14 rounded-full bg-gradient-to-br from-slate-400 to-slate-500 hover:from-slate-500 hover:to-slate-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center p-0 hover:scale-110 active:scale-95 border-2 border-white/20"
                  >
                    <X className="w-6 h-6" />
                  </Button>
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Pass</span>
                </div>
                
                <div className="flex flex-col items-center gap-1.5 relative">
                  <Button
                    size="lg"
                    onClick={handleButtonSwipeRight}
                    className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center p-0 hover:scale-110 active:scale-95 border-2 border-white/30"
                  >
                    <Heart className="w-6 h-6" fill="currentColor" />
                  </Button>
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    {user ? 'Save Deal' : 'Save Deal'}
                  </span>
                </div>
              </div>
            </div>

          </div>
        ) : (
          <div className="w-full max-w-md mx-auto">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-3xl border border-white/30 dark:border-slate-700/40 shadow-2xl shadow-black/10 p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/50 dark:to-blue-800/50 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg">
                <Ticket className="w-8 h-8 text-blue-500 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
                Looking for propfirm deals...
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                We search propfirms and brokers for the best deals. Try adjusting your filters or check back later.
              </p>
              <div className="flex flex-col gap-3">
                <Button 
                  onClick={() => {
                    setSelectedCategory('All');
                    setCurrentIndex(0);
                  }} 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-xl border-0 rounded-2xl py-4 font-semibold relative overflow-hidden"
                >
                  <Target className="w-5 h-5 mr-3" />
                  Show All Deals
                </Button>
                <Button 
                  onClick={() => {
                    setCurrentIndex(0);
                  }} 
                  variant="outline"
                  className="rounded-2xl border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 py-3"
                >
                  <X className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}