import { useState } from 'react';
import { AppPage } from '../components/types';

export function useNavigation() {
  const [currentPage, setCurrentPage] = useState<AppPage>('home');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [isDatabaseDebugMode, setIsDatabaseDebugMode] = useState(false);
  const [showProductionReadiness, setShowProductionReadiness] = useState(false);

  // Performance and monitoring states
  const [showPerformanceMonitor, setShowPerformanceMonitor] = useState(false);
  const [showSecurityMonitor, setShowSecurityMonitor] = useState(false);
  const [showComplianceChecker, setShowComplianceChecker] = useState(false);

  const handleMenuItemClick = (page: AppPage, requireAuth?: (page: AppPage) => boolean) => {
    if (requireAuth && !requireAuth(page)) {
      return;
    }
    setCurrentPage(page);
  };

  const handleBackToHome = () => {
    setCurrentPage('home');
  };

  const handleNavigateToGiveaways = (onLoginRequired: () => void, user: any) => {
    if (!user) {
      onLoginRequired();
    } else {
      setCurrentPage('giveaways');
    }
  };

  const toggleMode = (mode: 'admin' | 'supabase' | 'debug' | 'production') => {
    switch (mode) {
      case 'admin':
        setIsAdminMode(!isAdminMode);
        break;
      case 'supabase':
        setIsTestingSupabase(!isTestingSupabase);
        break;
      case 'debug':
        setIsDatabaseDebugMode(!isDatabaseDebugMode);
        break;
      case 'production':
        setShowProductionReadiness(!showProductionReadiness);
        break;
    }
  };

  const toggleMonitor = (monitor: 'performance' | 'security' | 'compliance') => {
    switch (monitor) {
      case 'performance':
        setShowPerformanceMonitor(!showPerformanceMonitor);
        break;
      case 'security':
        setShowSecurityMonitor(!showSecurityMonitor);
        break;
      case 'compliance':
        setShowComplianceChecker(!showComplianceChecker);
        break;
    }
  };

  return {
    // Navigation state
    currentPage,
    isAdminMode,
    isTestingSupabase,
    isDatabaseDebugMode,
    showProductionReadiness,
    
    // Monitoring state
    showPerformanceMonitor,
    showSecurityMonitor,
    showComplianceChecker,
    
    // Actions
    setCurrentPage,
    handleMenuItemClick,
    handleBackToHome,
    handleNavigateToGiveaways,
    toggleMode,
    toggleMonitor,
    
    // Mode setters (for direct access)
    setIsAdminMode,
    setIsTestingSupabase,
    setIsDatabaseDebugMode,
    setShowProductionReadiness
  };
}