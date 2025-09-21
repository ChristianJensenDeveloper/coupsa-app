import { useState, useEffect, useMemo, Suspense } from "react";
import React from "react";
import { CompactHeader } from "./components/CompactHeader";
import { MyDeals } from "./components/MyDeals";
import { Profile } from "./components/Profile";
import { Preferences } from "./components/Preferences";
import { FAQ } from "./components/FAQ";
import { Settings as SettingsPage } from "./components/Settings";
import { Contact } from "./components/Contact";
import { WhatIsCOUPSA } from "./components/WhatIsCOUPSA";
import { TermsOfService } from "./components/TermsOfService";
import { PrivacyPolicy } from "./components/PrivacyPolicy";
import { LoginModal } from "./components/LoginModal";
import { AppProviders } from "./components/AppProviders";
import { HomeContent } from "./components/HomeContent";
import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from "./components/ui/alert-dialog";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner@2.0.3";
import { Heart, X, ArrowLeft, RefreshCw, AlertCircle } from "lucide-react";
import { Coupon, CouponCategory, AppPage, User as UserType } from "./components/types";
import { supabase } from "./lib/supabase";
import { useDealsData } from "./hooks/useDealsData";
import { DetailedAffiliateDisclosure } from "./components/AffiliateDisclosure";
import { SEOHead } from "./components/SEOHead";
import { CookieConsent } from "./components/CookieConsent";
import { FullPageLoading, NetworkStatus } from "./components/LoadingStates";
import { useNetworkStatus } from "./hooks/useNetworkStatus";

// Core components as direct imports
import { ChatSupport } from './components/ChatSupport';
import { AnalyticsStatusIndicator } from './components/AnalyticsStatusIndicator';
import { CookieSettings } from './components/CookieSettings';
import { Giveaways } from './components/Giveaways';
import { ShareLeaderboard } from './components/ShareLeaderboard';

// Lazy load heavy components
const AdminAppProduction = React.lazy(() => import('./AdminAppProduction'));
const BrokerRegistration = React.lazy(() => import('./components/BrokerRegistration').then(module => ({ default: module.BrokerRegistration })));
const BrokerDashboard = React.lazy(() => import('./components/BrokerDashboard').then(module => ({ default: module.BrokerDashboard })));

function AppContent() {
  // Core state
  const [currentPage, setCurrentPage] = useState<AppPage>('home');
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [savedDeals, setSavedDeals] = useState<Coupon[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CouponCategory>('All');
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [userCompany, setUserCompany] = useState<import('./components/types').Company | null>(null);
  const [postLoginDestination, setPostLoginDestination] = useState<AppPage | null>(null);
  
  // Admin and testing modes
  const [isAdminMode, setIsAdminMode] = useState(false);
  
  // Network status
  const networkStatus = useNetworkStatus();
  const [showNetworkStatus, setShowNetworkStatus] = useState(false);

  // Data fetching
  const { coupons: fetchedCoupons, loading: dealsLoading, error: dealsError, refetch: refetchDeals } = useDealsData();

  // Update local state when fetched data changes
  useEffect(() => {
    setCoupons(fetchedCoupons);
  }, [fetchedCoupons]);

  // Handle network status changes
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (!networkStatus.isOnline) {
      setShowNetworkStatus(true);
    } else if (showNetworkStatus) {
      timeoutId = setTimeout(() => setShowNetworkStatus(false), 3000);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [networkStatus.isOnline, showNetworkStatus]);

  // Authentication effect
  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const newUser: UserType = {
            id: session.user.id,
            loginMethod: session.user.app_metadata?.provider as 'google' | 'facebook' | 'apple' || 'email',
            name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0],
            email: session.user.email,
            phoneNumber: session.user.phone,
            joinedAt: session.user.created_at,
            consents: {
              termsAccepted: true,
              gdprAccepted: true,
              marketingConsent: true,
              emailMarketing: true,
              smsMarketing: true,
              whatsappMarketing: true,
              pushNotifications: true,
              consentDate: new Date().toISOString()
            },
            notificationPreferences: {
              smsNotifications: true,
              whatsappNotifications: true,
              updatedAt: new Date().toISOString()
            }
          };
          
          setUser(newUser);
          
          setSavedDeals(prev => {
            if (prev.length === 0) {
              return [{
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
                affiliateLink: 'https://ftmo.com/signup?ref=coupsa',
                logoUrl: 'https://images.unsplash.com/photo-1642310290564-30033ff60334?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21wYW55JTIwbG9nbyUyMHByb2Zlc3Npb25hbCUyMGZpbmFuY2V8ZW58MXx8fHwxNzU2NTQ2Nzg0fDA&ixlib=rb-4.0&q=80&w=1080',
                hasVerificationBadge: true
              }];
            }
            return prev;
          });
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setIsAuthLoading(false);
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (event === 'SIGNED_IN' && session?.user) {
          const newUser: UserType = {
            id: session.user.id,
            loginMethod: session.user.app_metadata?.provider as 'google' | 'facebook' | 'apple' || 'email',
            name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0],
            email: session.user.email,
            phoneNumber: session.user.phone,
            joinedAt: session.user.created_at,
            consents: {
              termsAccepted: true,
              gdprAccepted: true,
              marketingConsent: true,
              emailMarketing: true,
              smsMarketing: true,
              whatsappMarketing: true,
              pushNotifications: true,
              consentDate: new Date().toISOString()
            },
            notificationPreferences: {
              smsNotifications: true,
              whatsappNotifications: true,
              updatedAt: new Date().toISOString()
            }
          };
          
          setUser(newUser);
          setIsLoginModalOpen(false);
          toast.success(`Welcome to COUPSA, ${newUser.name}!`);
          
          if (postLoginDestination) {
            setCurrentPage(postLoginDestination);
            setPostLoginDestination(null);
            
            if (postLoginDestination === 'broker-register') {
              toast.success('Now you can register your company!');
            }
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setSavedDeals([]);
          setUserCompany(null);
          setPostLoginDestination(null);
          setCurrentPage('home');
          toast.success("Logged out successfully");
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
      } finally {
        setIsAuthLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Swipe and deal logic
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewedCoupons, setViewedCoupons] = useState<Set<string>>(new Set());
  const [isRejectConfirmOpen, setIsRejectConfirmOpen] = useState(false);
  const [pendingRejectCoupon, setPendingRejectCoupon] = useState<Coupon | null>(null);

  // Filter coupons
  const filteredCoupons = useMemo(() => {
    const now = new Date();
    const categoryFiltered = coupons.filter(coupon => {
      const matchesCategory = selectedCategory === 'All' || coupon.category === selectedCategory;
      const isActive = new Date(coupon.endDate) > now;
      return matchesCategory && isActive;
    });

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

  // Event handlers
  const handleClaimCoupon = (couponId: string) => {
    setCoupons(prev => 
      prev.map(coupon => 
        coupon.id === couponId 
          ? { ...coupon, isClaimed: true }
          : coupon
      )
    );
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

  const handleSwipeLeft = () => {
    if (currentCoupon) {
      setViewedCoupons(prev => new Set(prev).add(currentCoupon.id));
      toast.info("Deal dismissed");
      goToNextCoupon();
    }
  };

  const handleSwipeRight = () => {
    if (currentCoupon) {
      if (!user) {
        setIsLoginModalOpen(true);
        return;
      }

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

  const handleMenuItemClick = (page: AppPage) => {
    if ((page === 'profile' || page === 'my-deals' || page === 'preferences' || page === 'broker-register' || page === 'broker-dashboard') && !user) {
      if (page === 'broker-register') {
        setPostLoginDestination(page);
      }
      setIsLoginModalOpen(true);
      return;
    }
    setCurrentPage(page);
  };

  const handleBackToHome = () => {
    setCurrentPage('home');
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
        toast.error('Failed to logout');
      }
      setUserCompany(null);
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  const handleLoginRequired = () => {
    setIsLoginModalOpen(true);
  };

  // Show admin mode
  if (isAdminMode) {
    return (
      <Suspense fallback={<FullPageLoading title="COUPSA" subtitle="Loading admin panel..." />}>
        <AdminAppProduction onBackToUser={() => setIsAdminMode(false)} />
      </Suspense>
    );
  }

  // Show loading states
  if (isAuthLoading) {
    return <FullPageLoading title="COUPSA" subtitle="Loading your deals..." />;
  }

  if (dealsLoading && !user) {
    return (
      <FullPageLoading 
        title="COUPSA" 
        subtitle={dealsError ? "Loading with backup data..." : "Loading latest deals..."} 
      />
    );
  }

  // Render different pages
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'profile':
        return <Profile user={user} onLogout={handleLogout} />;
      case 'my-deals':
        return <MyDeals 
          savedDeals={savedDeals} 
          onClearExpired={() => {
            setSavedDeals(prev => prev.filter(deal => new Date(deal.endDate) > new Date()));
            toast.success("Expired deals cleared!");
          }}
          onRemoveDeal={(dealId) => {
            setSavedDeals(prev => prev.filter(deal => deal.id !== dealId));
            toast.success("Deal removed from saved!");
          }}
          userName={user?.name} 
        />;
      case 'preferences':
        return <Preferences />;
      case 'faq':
        return <FAQ />;
      case 'contact':
        return <Contact />;
      case 'what-is-coupsa':
        return <WhatIsCOUPSA />;
      case 'terms':
        return <TermsOfService />;
      case 'privacy':
        return <PrivacyPolicy />;
      case 'settings':
        return <SettingsPage user={user} onNavigateToPage={(page) => setCurrentPage(page)} />;
      case 'share-leaderboard':
        return <ShareLeaderboard userStats={{ shares: 12, signups: 3, points: 165, rank: 47 }} />;
      case 'giveaways':
        return <Giveaways user={user} onLoginRequired={handleLoginRequired} />;
      case 'cookie-settings':
        return <CookieSettings onBack={() => setCurrentPage('settings')} />;
      case 'broker-register':
        if (!user) {
          setIsLoginModalOpen(true);
          return null;
        }
        return (
          <Suspense fallback={<FullPageLoading title="COUPSA" subtitle="Loading registration form..." />}>
            <BrokerRegistration 
              user={user}
              onBack={handleBackToHome}
              onRegisterSuccess={(company) => {
                setUserCompany(company);
                setCurrentPage('broker-dashboard');
                toast.success('Company registration submitted for review!');
              }}
              onClaimSubmitted={(claimData) => {
                console.log('Company access request submitted:', claimData);
                toast.success("Access request submitted! Our team will review and get back to you within 1-3 business days.");
              }}
            />
          </Suspense>
        );
      case 'broker-dashboard':
        if (!user) {
          setIsLoginModalOpen(true);
          return null;
        }
        return (
          <Suspense fallback={<FullPageLoading title="COUPSA" subtitle="Loading dashboard..." />}>
            <BrokerDashboard 
              user={user}
              company={userCompany}
              onBack={handleBackToHome}
              onNavigateToRegistration={() => setCurrentPage('broker-register')}
              onCompanyUpdated={(company) => setUserCompany(company)}
            />
          </Suspense>
        ); 
      default:
        return (
          <HomeContent
            user={user}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            handleCategoryChange={(category: CouponCategory) => setSelectedCategory(category)}
            handleLoginRequired={handleLoginRequired}
            filteredCoupons={filteredCoupons}
            currentIndex={currentIndex}
            currentCoupon={currentCoupon}
            handleSwipeLeft={handleSwipeLeft}
            handleSwipeRight={handleSwipeRight}
            handleButtonSwipeLeft={handleSwipeLeft}
            handleButtonSwipeRight={handleSwipeRight}
            handleClaimCoupon={handleClaimCoupon}
            setSelectedCategory={setSelectedCategory}
            setCurrentIndex={setCurrentIndex}
            dealsError={dealsError}
            dealsLoading={dealsLoading}
            coupons={coupons}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-blue-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      <SEOHead 
        currentPage={currentPage} 
        dealCount={filteredCoupons.length}
        userName={user?.name}
      />
      
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <CompactHeader
          user={user}
          currentPage={currentPage}
          savedDealsCount={savedDeals.length}
          totalDealsCount={filteredCoupons.length}
          onMenuItemClick={handleMenuItemClick}
          onBackToHome={handleBackToHome}
          onLoginRequired={handleLoginRequired}
          onAdminMode={() => setIsAdminMode(true)}
          onTestSupabase={() => {}}
          onDatabaseDebug={() => {}}
          onNavigateToGiveaways={() => {
            if (!user) {
              setIsLoginModalOpen(true);
            } else {
              setCurrentPage('giveaways');
            }
          }}
          hasCurrentDeal={!!currentCoupon && currentPage === 'home'}
        />

        {/* Data Status Banner */}
        {currentPage === 'home' && (dealsError || dealsLoading) && (
          <div className="mb-4">
            {dealsError && (
              <div className="bg-gradient-to-r from-yellow-100 to-yellow-200 dark:from-yellow-900/20 dark:to-yellow-800/20 border border-yellow-300 dark:border-yellow-700 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                    <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      Using backup deals - Database connection issue
                    </span>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => refetchDeals()}
                    disabled={dealsLoading}
                    className="text-yellow-700 border-yellow-300 hover:bg-yellow-50 dark:text-yellow-300 dark:border-yellow-600 dark:hover:bg-yellow-900/20"
                  >
                    {dealsLoading ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      'Retry'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {renderCurrentPage()}

        {currentPage === 'home' && (
          <AnalyticsStatusIndicator className="mt-6" />
        )}

        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onLogin={(newUser: UserType) => {
            setUser(newUser);
            setIsLoginModalOpen(false);
            
            if (postLoginDestination) {
              setCurrentPage(postLoginDestination);
              setPostLoginDestination(null);
              
              if (postLoginDestination === 'broker-register') {
                toast.success('Now you can register your company!');
              }
            }
          }}
        />

        {/* Reject Confirmation Dialog */}
        <AlertDialog open={isRejectConfirmOpen} onOpenChange={setIsRejectConfirmOpen}>
          <AlertDialogContent className="max-w-lg border-0 shadow-2xl bg-white dark:bg-slate-900 rounded-3xl overflow-hidden p-0">
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 px-8 pt-8 pb-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
                <X className="w-8 h-8 text-white" />
              </div>
              <AlertDialogTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                Wait, don't miss out!
              </AlertDialogTitle>
              <AlertDialogDescription className="text-slate-600 dark:text-slate-400 text-base leading-relaxed">
                You're about to dismiss this exclusive deal. Why not save it for later instead?
              </AlertDialogDescription>
            </div>
            
            {pendingRejectCoupon && (
              <div className="mx-8 -mt-2 mb-6">
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 px-6 py-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white dark:bg-slate-700 rounded-xl shadow-sm flex items-center justify-center">
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                            {pendingRejectCoupon.merchant.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-slate-100">
                            {pendingRejectCoupon.merchant}
                          </div>
                          <Badge className="bg-gradient-to-r from-blue-500 to-blue-500 text-white text-xs px-3 py-1 rounded-full border-0">
                            {pendingRejectCoupon.discount}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-slate-700 dark:text-slate-300 font-medium">
                      {pendingRejectCoupon.title}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="px-8 pb-8 space-y-3">
              <AlertDialogAction
                onClick={() => {
                  if (pendingRejectCoupon) {
                    if (!user) {
                      setIsLoginModalOpen(true);
                      setIsRejectConfirmOpen(false);
                      setPendingRejectCoupon(null);
                      return;
                    }

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
                }}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-500 hover:from-blue-600 hover:to-blue-600 text-white font-semibold py-4 rounded-2xl text-base shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] border-0"
              >
                <Heart className="w-5 h-5 mr-3" fill="currentColor" />
                Save to My Deals
              </AlertDialogAction>
              
              <div className="flex gap-3">
                <AlertDialogCancel 
                  onClick={() => {
                    setIsRejectConfirmOpen(false);
                    setPendingRejectCoupon(null);
                  }}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold py-4 rounded-2xl text-base border-0 transition-all duration-200 hover:scale-[1.02]"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go Back
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    if (pendingRejectCoupon) {
                      setViewedCoupons(prev => new Set(prev).add(pendingRejectCoupon.id));
                      toast.info("Deal dismissed");
                      goToNextCoupon();
                    }
                    setIsRejectConfirmOpen(false);
                    setPendingRejectCoupon(null);
                  }}
                  className="flex-1 bg-gradient-to-r from-slate-400 to-slate-500 hover:from-slate-500 hover:to-slate-600 text-white font-semibold py-4 rounded-2xl text-base shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] border-0"
                >
                  <X className="w-4 h-4 mr-2" />
                  Reject
                </AlertDialogAction>
              </div>
            </div>
          </AlertDialogContent>
        </AlertDialog>

        <Toaster />
        <ChatSupport user={user} onLoginRequired={handleLoginRequired} />
        <CookieConsent onConsentChange={(prefs) => console.log('Cookie preferences updated:', prefs)} />
        
        {showNetworkStatus && <NetworkStatus isOnline={networkStatus.isOnline} />}
        
        {(currentPage === 'my-deals' || currentPage === 'what-is-coupsa') && (
          <div className="mt-8 mb-4">
            <DetailedAffiliateDisclosure />
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProviders>
      <AppContent />
    </AppProviders>
  );
}