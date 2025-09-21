import { useState, useEffect, Suspense } from "react";
import React from "react";
import { MyDeals } from "./components/MyDeals";
import { Profile } from "./components/Profile";
import { Preferences } from "./components/Preferences";
import { FAQ } from "./components/FAQ";
import { Settings as SettingsPage } from "./components/Settings";
import { LoginModal } from "./components/LoginModal";
import { StringProvider } from "./components/useStrings";
import { ChatProvider } from "./components/ChatContext";
import { AnalyticsProvider } from "./components/AnalyticsContext";
import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from "./components/ui/alert-dialog";
import { Toaster } from "./components/ui/sonner";
import { X, ArrowLeft, Heart, RefreshCw, AlertCircle } from "lucide-react";
import { AppPage, User as UserType } from "./components/types";
import { DetailedAffiliateDisclosure } from "./components/AffiliateDisclosure";
import { SEOHead } from "./components/SEOHead";
import { ErrorBoundary, useErrorHandler } from "./components/ErrorBoundary";
import { CookieConsent } from "./components/CookieConsent";
import { CookieProvider } from "./components/CookieContext";
import { FullPageLoading, NetworkStatus } from "./components/LoadingStates";
import { useNetworkStatus } from "./hooks/useNetworkStatus";

// Extracted custom hooks
import { useAuth } from "./hooks/useAuth";
import { useDealsManager } from "./hooks/useDealsManager";
import { useNavigation } from "./hooks/useNavigation";
import { useCompanyManager } from "./hooks/useCompanyManager";

// Extracted components
import { HomePage } from "./components/HomePage";
import { MonitoringControls } from "./components/MonitoringControls";
import { PWAManager } from "./components/PWAManager";

// Keep core components as direct imports for stability
import { CompactHeader } from "./components/CompactHeader";
import { ChatSupport } from './components/ChatSupport';
import { AnalyticsStatusIndicator } from './components/AnalyticsStatusIndicator';
import { CookieSettings } from './components/CookieSettings';
import { Giveaways } from './components/Giveaways';
import { ShareLeaderboard } from './components/ShareLeaderboard';

// Lazy load heavy components for better performance
const AdminAppProduction = React.lazy(() => import('./AdminAppProduction'));
const BrokerRegistration = React.lazy(() => import('./components/BrokerRegistration').then(module => ({ default: module.BrokerRegistration })));
const BrokerDashboard = React.lazy(() => import('./components/BrokerDashboard').then(module => ({ default: module.BrokerDashboard })));
const TestSupabaseConnection = React.lazy(() => import('./components/TestSupabaseConnection').then(module => ({ default: module.TestSupabaseConnection })));
const DatabaseDebugger = React.lazy(() => import('./components/DatabaseDebugger').then(module => ({ default: module.DatabaseDebugger })));
const ProductionReadinessChecker = React.lazy(() => import('./components/ProductionReadinessChecker'));

function AppContent() {
  // Use extracted custom hooks
  const auth = useAuth();
  const navigation = useNavigation();
  const dealsManager = useDealsManager(auth.user);
  const companyManager = useCompanyManager(auth.user);
  
  // Network status
  const networkStatus = useNetworkStatus();
  const [showNetworkStatus, setShowNetworkStatus] = useState(false);
  const errorHandler = useErrorHandler();

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

  // Handle auth post-login navigation
  useEffect(() => {
    if (auth.postLoginDestination) {
      navigation.setCurrentPage(auth.postLoginDestination);
      auth.setPostLoginDestination(null);
    }
  }, [auth.postLoginDestination, navigation, auth]);

  // Special rendering modes
  if (navigation.isAdminMode) {
    return (
      <Suspense fallback={<FullPageLoading title="KOOCAO" subtitle="Loading admin panel..." />}>
        <AdminAppProduction onBackToUser={() => navigation.setIsAdminMode(false)} />
      </Suspense>
    );
  }

  if (navigation.showProductionReadiness) {
    return (
      <Suspense fallback={<FullPageLoading title="KOOCAO" subtitle="Loading production checklist..." />}>
        <ProductionReadinessChecker />
      </Suspense>
    );
  }

  if (auth.isAuthLoading) {
    return <FullPageLoading title="KOOCAO" subtitle="Loading your deals..." />;
  }

  if (dealsManager.dealsLoading && !auth.user) {
    return (
      <FullPageLoading 
        title="KOOCAO" 
        subtitle={dealsManager.dealsError ? "Loading with backup data..." : "Loading latest deals..."} 
      />
    );
  }

  // Database testing interface
  if (navigation.isTestingSupabase) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-blue-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="mb-6 flex items-center justify-between">
            <Button 
              onClick={() => navigation.setIsTestingSupabase(false)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to App
            </Button>
            <h1 className="text-2xl font-bold">Database Testing</h1>
          </div>
          <Suspense fallback={<FullPageLoading title="KOOCAO" subtitle="Loading database tools..." />}>
            <TestSupabaseConnection />
          </Suspense>
        </div>
      </div>
    );
  }

  if (navigation.isDatabaseDebugMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-blue-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="mb-6 flex items-center justify-between">
            <Button 
              onClick={() => navigation.setIsDatabaseDebugMode(false)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to App
            </Button>
            <h1 className="text-2xl font-bold">Database Debugging</h1>
          </div>
          <Suspense fallback={<FullPageLoading title="KOOCAO" subtitle="Loading debug tools..." />}>
            <DatabaseDebugger />
          </Suspense>
        </div>
      </div>
    );
  }

  const renderCurrentPage = () => {
    switch (navigation.currentPage) {
      case 'profile':
        return (
          <Profile 
            user={auth.user} 
            onLogout={auth.handleLogout}
          />
        );
      case 'my-deals':
        return (
          <MyDeals 
            savedDeals={dealsManager.savedDeals} 
            onClearExpired={dealsManager.handleClearExpiredDeals} 
            onRemoveDeal={dealsManager.handleRemoveDeal} 
            userName={auth.user?.name} 
          />
        );
      case 'preferences':
        return <Preferences />;
      case 'faq':
        return <FAQ />;
      case 'settings':
        return <SettingsPage user={auth.user} onNavigateToPage={navigation.setCurrentPage} />;
      case 'share-leaderboard':
        return <ShareLeaderboard userStats={{ shares: 12, signups: 3, points: 165, rank: 47 }} />;
      case 'giveaways':
        return <Giveaways user={auth.user} onLoginRequired={auth.handleLoginRequired} />;
      case 'cookie-settings':
        return <CookieSettings onBack={() => navigation.setCurrentPage('settings')} />;
      case 'broker-register':
        if (!auth.user) {
          auth.setIsLoginModalOpen(true);
          return null;
        }
        return (
          <Suspense fallback={<FullPageLoading title="KOOCAO" subtitle="Loading registration form..." />}>
            <BrokerRegistration 
              user={auth.user}
              onBack={navigation.handleBackToHome}
              onRegisterSuccess={(company) => companyManager.handleRegisterSuccess(company, navigation.setCurrentPage)}
              onClaimSubmitted={companyManager.handleClaimSubmitted}
            />
          </Suspense>
        );
      case 'broker-dashboard':
        if (!auth.user) {
          auth.setIsLoginModalOpen(true);
          return null;
        }
        return (
          <Suspense fallback={<FullPageLoading title="KOOCAO" subtitle="Loading dashboard..." />}>
            <BrokerDashboard 
              user={auth.user}
              company={companyManager.userCompany}
              onBack={navigation.handleBackToHome}
              onNavigateToRegistration={() => navigation.setCurrentPage('broker-register')}
              onCompanyUpdated={companyManager.handleCompanyUpdated}
            />
          </Suspense>
        ); 
      default:
        return (
          <HomePage
            user={auth.user}
            coupons={dealsManager.coupons}
            searchQuery={dealsManager.searchQuery}
            selectedCategory={dealsManager.selectedCategory}
            currentIndex={dealsManager.currentIndex}
            currentCoupon={dealsManager.currentCoupon}
            filteredCoupons={dealsManager.filteredCoupons}
            dealsLoading={dealsManager.dealsLoading}
            dealsError={dealsManager.dealsError}
            onSearchChange={dealsManager.setSearchQuery}
            onCategoryChange={dealsManager.handleCategoryChange}
            onSwipeLeft={() => dealsManager.handleSwipeLeft(auth.handleLoginRequired)}
            onSwipeRight={() => dealsManager.handleSwipeRight(auth.handleLoginRequired)}
            onClaimCoupon={dealsManager.handleClaimCoupon}
            onLoginRequired={auth.handleLoginRequired}
            setSelectedCategory={dealsManager.handleCategoryChange}
            setCurrentIndex={dealsManager.setCurrentIndex}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-blue-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      {/* SEO Head Management */}
      <SEOHead 
        currentPage={navigation.currentPage} 
        dealCount={dealsManager.filteredCoupons.length}
        userName={auth.user?.name}
      />
      
      <div className="container mx-auto px-4 sm:px-6 py-4">
        {/* Compact Header */}
        <CompactHeader
          user={auth.user}
          currentPage={navigation.currentPage}
          savedDealsCount={dealsManager.savedDeals.length}
          totalDealsCount={dealsManager.filteredCoupons.length}
          onMenuItemClick={(page) => navigation.handleMenuItemClick(page, auth.requireAuth)}
          onBackToHome={navigation.handleBackToHome}
          onLoginRequired={auth.handleLoginRequired}
          onAdminMode={() => navigation.toggleMode('admin')}
          onTestSupabase={() => navigation.toggleMode('supabase')}
          onDatabaseDebug={() => navigation.toggleMode('debug')}
          onNavigateToGiveaways={() => navigation.handleNavigateToGiveaways(auth.handleLoginRequired, auth.user)}
          hasCurrentDeal={!!dealsManager.currentCoupon && navigation.currentPage === 'home'}
        />

        {/* Monitoring Controls */}
        <MonitoringControls
          currentPage={navigation.currentPage}
          showPerformanceMonitor={navigation.showPerformanceMonitor}
          showSecurityMonitor={navigation.showSecurityMonitor}
          showComplianceChecker={navigation.showComplianceChecker}
          onTogglePerformance={() => navigation.toggleMonitor('performance')}
          onToggleSecurity={() => navigation.toggleMonitor('security')}
          onToggleCompliance={() => navigation.toggleMonitor('compliance')}
          onShowProductionReadiness={() => navigation.toggleMode('production')}
        />

        {/* PWA Manager */}
        {navigation.currentPage === 'home' && navigation.showPerformanceMonitor && (
          <div className="mb-4">
            <PWAManager className="w-full" />
          </div>
        )}

        {/* Data Status Banner */}
        {navigation.currentPage === 'home' && (dealsManager.dealsError || dealsManager.dealsLoading) && (
          <div className="mb-4">
            {dealsManager.dealsError && (
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
                    onClick={() => dealsManager.refetchDeals()}
                    disabled={dealsManager.dealsLoading}
                    className="text-yellow-700 border-yellow-300 hover:bg-yellow-50 dark:text-yellow-300 dark:border-yellow-600 dark:hover:bg-yellow-900/20"
                  >
                    {dealsManager.dealsLoading ? (
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

        {/* Render Current Page */}
        {renderCurrentPage()}

        {/* Analytics Status Indicator */}
        {navigation.currentPage === 'home' && (
          <AnalyticsStatusIndicator className="mt-6" />
        )}

        <LoginModal
          isOpen={auth.isLoginModalOpen}
          onClose={() => auth.setIsLoginModalOpen(false)}
          onLogin={auth.handleLogin}
        />

        {/* Reject Confirmation Dialog */}
        <AlertDialog open={dealsManager.isRejectConfirmOpen} onOpenChange={() => dealsManager.handleCancelReject()}>
          <AlertDialogContent className="max-w-lg border-0 shadow-2xl bg-white dark:bg-slate-900 rounded-3xl overflow-hidden p-0">
            {/* Header with gradient background */}
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
            
            {/* Deal Preview Card */}
            {dealsManager.pendingRejectCoupon && (
              <div className="mx-8 -mt-2 mb-6">
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 px-6 py-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white dark:bg-slate-700 rounded-xl shadow-sm flex items-center justify-center">
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                            {dealsManager.pendingRejectCoupon.merchant.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-slate-100">
                            {dealsManager.pendingRejectCoupon.merchant}
                          </div>
                          <Badge className="bg-gradient-to-r from-blue-500 to-blue-500 text-white text-xs px-3 py-1 rounded-full border-0">
                            {dealsManager.pendingRejectCoupon.discount}
                          </Badge>
                        </div>
                      </div>
                      {dealsManager.pendingRejectCoupon.hasVerificationBadge && (
                        <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
                          <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="text-slate-700 dark:text-slate-300 font-medium">
                      {dealsManager.pendingRejectCoupon.title}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="px-8 pb-8 space-y-3">
              <AlertDialogAction
                onClick={dealsManager.handleSaveInsteadOfReject}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-500 hover:from-blue-600 hover:to-blue-600 text-white font-semibold py-4 rounded-2xl text-base shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] border-0"
              >
                <Heart className="w-5 h-5 mr-3" fill="currentColor" />
                Save to My Deals
              </AlertDialogAction>
              
              <div className="flex gap-3">
                <AlertDialogCancel 
                  onClick={dealsManager.handleCancelReject} 
                  className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold py-4 rounded-2xl text-base border-0 transition-all duration-200 hover:scale-[1.02]"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Go Back
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={dealsManager.handleConfirmReject}
                  className="flex-1 bg-gradient-to-r from-slate-400 to-slate-500 hover:from-slate-500 hover:to-slate-600 text-white font-semibold py-4 rounded-2xl text-base shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] border-0"
                >
                  <X className="w-4 h-4 mr-2" />
                  Reject
                </AlertDialogAction>
              </div>
              
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-4 leading-relaxed">
                Rejected deals won't be shown again. You can always find more deals by browsing different categories.
              </p>
            </div>
          </AlertDialogContent>
        </AlertDialog>

        {/* Toast notifications */}
        <Toaster />

        {/* Chat Support */}
        <ChatSupport user={auth.user} onLoginRequired={auth.handleLoginRequired} />
        
        {/* Cookie Consent */}
        <CookieConsent onConsentChange={(prefs) => console.log('Cookie preferences updated:', prefs)} />
        
        {/* Network Status Indicator */}
        {showNetworkStatus && <NetworkStatus isOnline={networkStatus.isOnline} />}
        
        {/* Footer with Affiliate Disclosure */}
        {(navigation.currentPage === 'home' || navigation.currentPage === 'my-deals' || navigation.currentPage === 'what-is-koocao') && (
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
    <ErrorBoundary>
      <CookieProvider>
        <StringProvider>
          <ChatProvider>
            <AnalyticsProvider>
              <AppContent />
            </AnalyticsProvider>
          </ChatProvider>
        </StringProvider>
      </CookieProvider>
    </ErrorBoundary>
  );
}