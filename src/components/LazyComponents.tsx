import { lazy, Suspense, ComponentType } from 'react';
import { FullPageLoading, InlineLoading } from './LoadingStates';

// Lazy load heavy components that aren't needed immediately
export const AdminAppProduction = lazy(() => import('../AdminAppProduction'));
export const BrokerRegistration = lazy(() => import('./BrokerRegistration'));
export const BrokerDashboard = lazy(() => import('./BrokerDashboard'));
export const ChatSupport = lazy(() => import('./ChatSupport'));
export const TestSupabaseConnection = lazy(() => import('./TestSupabaseConnection'));
export const DatabaseDebugger = lazy(() => import('./DatabaseDebugger'));
export const ProductionReadinessChecker = lazy(() => import('./ProductionReadinessChecker'));
export const AnalyticsStatusIndicator = lazy(() => import('./AnalyticsStatusIndicator'));
export const CookieSettings = lazy(() => import('./CookieSettings'));
export const Giveaways = lazy(() => import('./Giveaways'));
export const ShareLeaderboard = lazy(() => import('./ShareLeaderboard'));

// Performance monitoring components
export const PerformanceMonitor = lazy(() => import('./PerformanceMonitor'));
export const SecurityMonitor = lazy(() => import('./SecurityMonitor'));

// Wrapper component for lazy loading with proper error boundaries
interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  name?: string;
}

export function LazyWrapper({ children, fallback, name }: LazyWrapperProps) {
  const defaultFallback = fallback || <InlineLoading text={`Loading ${name}...`} />;
  
  return (
    <Suspense fallback={defaultFallback}>
      {children}
    </Suspense>
  );
}

// High-order component for lazy loading with performance tracking
export function withLazyLoading<T extends object>(
  Component: ComponentType<T>,
  componentName: string,
  fallback?: React.ReactNode
) {
  return function LazyComponent(props: T) {
    const startTime = performance.now();
    
    const handleLoad = () => {
      const loadTime = performance.now() - startTime;
      
      // Track component load time
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'component_load', {
          component_name: componentName,
          load_time: Math.round(loadTime),
          custom_parameter: 'lazy_load'
        });
      }
      
      console.log(`Component ${componentName} loaded in ${Math.round(loadTime)}ms`);
    };

    return (
      <LazyWrapper 
        fallback={fallback || <InlineLoading text={`Loading ${componentName}...`} />}
        name={componentName}
      >
        <Component {...props} onComponentLoad={handleLoad} />
      </LazyWrapper>
    );
  };
}

// Pre-load critical components for better UX
export function preloadCriticalComponents() {
  // Preload components that are likely to be needed soon
  setTimeout(() => {
    import('./BrokerRegistration');
    import('./ChatSupport');
  }, 2000);
  
  // Preload admin components for admin users
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  if (isAdmin) {
    setTimeout(() => {
      import('../AdminAppProduction');
    }, 1000);
  }
}

// Component prefetch utility
export function prefetchComponent(componentPath: string) {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      import(componentPath);
    });
  } else {
    setTimeout(() => {
      import(componentPath);
    }, 100);
  }
}