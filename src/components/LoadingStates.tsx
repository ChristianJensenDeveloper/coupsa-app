import { ReactNode } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';
import { Badge } from './ui/badge';
import { Loader2, Wifi, WifiOff, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';

// Full page loading screen
export function FullPageLoading({ 
  title = "KOOCAO", 
  subtitle = "Loading your deals...",
  showProgress = false,
  progress = 0 
}: {
  title?: string;
  subtitle?: string;
  showProgress?: boolean;
  progress?: number;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-blue-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
        >
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        </motion.div>
        
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          {title}
        </h2>
        
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          {subtitle}
        </p>

        {showProgress && (
          <div className="w-64 mx-auto">
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {Math.round(progress)}% complete
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Inline loading spinner
export function InlineLoading({ 
  size = "default",
  text,
  className = ""
}: {
  size?: "sm" | "default" | "lg";
  text?: string;
  className?: string;
}) {
  const sizeClasses = {
    sm: "w-4 h-4",
    default: "w-6 h-6",
    lg: "w-8 h-8"
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-500`} />
      {text && (
        <span className="text-sm text-slate-600 dark:text-slate-400">
          {text}
        </span>
      )}
    </div>
  );
}

// Card loading skeleton
export function CardSkeleton({ 
  showImage = true,
  showBadge = true,
  lines = 3 
}: {
  showImage?: boolean;
  showBadge?: boolean;
  lines?: number;
}) {
  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-start gap-4">
        {showImage && (
          <Skeleton className="w-12 h-12 rounded-xl" />
        )}
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-32" />
            {showBadge && <Skeleton className="h-6 w-16 rounded-full" />}
          </div>
          {Array.from({ length: lines }).map((_, i) => (
            <Skeleton 
              key={i} 
              className={`h-4 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} 
            />
          ))}
        </div>
      </div>
    </Card>
  );
}

// Loading states for deal cards
export function DealCardsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

// Network status indicator
export function NetworkStatus({ isOnline }: { isOnline: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg ${
        isOnline
          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800'
          : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
      }`}
    >
      <div className="flex items-center gap-2">
        {isOnline ? (
          <Wifi className="w-4 h-4" />
        ) : (
          <WifiOff className="w-4 h-4" />
        )}
        <span className="text-sm font-medium">
          {isOnline ? 'Back online' : 'Connection lost'}
        </span>
      </div>
    </motion.div>
  );
}

// Error state component
export function ErrorState({
  title = "Something went wrong",
  description = "We encountered an error while loading this content.",
  action,
  actionLabel = "Try again",
  onAction,
  showDetails = false,
  error,
  className = ""
}: {
  title?: string;
  description?: string;
  action?: 'retry' | 'refresh' | 'custom';
  actionLabel?: string;
  onAction?: () => void;
  showDetails?: boolean;
  error?: Error | string;
  className?: string;
}) {
  const handleAction = () => {
    if (onAction) {
      onAction();
    } else if (action === 'refresh') {
      window.location.reload();
    }
  };

  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
      </div>
      
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
        {title}
      </h3>
      
      <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
        {description}
      </p>

      {showDetails && error && (
        <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-left max-w-md mx-auto">
          <p className="text-sm text-red-700 dark:text-red-300 font-mono break-all">
            {typeof error === 'string' ? error : error.message}
          </p>
        </div>
      )}

      {(action || onAction) && (
        <Button 
          onClick={handleAction}
          variant="outline"
          className="border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

// Empty state component
export function EmptyState({
  title = "No results found",
  description = "Try adjusting your search or filters to find what you're looking for.",
  icon: Icon = AlertCircle,
  action,
  actionLabel,
  onAction,
  className = ""
}: {
  title?: string;
  description?: string;
  icon?: any;
  action?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}) {
  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Icon className="w-8 h-8 text-slate-400" />
      </div>
      
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
        {title}
      </h3>
      
      <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
        {description}
      </p>

      {action || (onAction && actionLabel) && (
        <div>
          {action || (
            <Button onClick={onAction} variant="outline">
              {actionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// Success state component
export function SuccessState({
  title = "Success!",
  description,
  action,
  actionLabel,
  onAction,
  autoHide = false,
  autoHideDelay = 3000,
  className = ""
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  autoHide?: boolean;
  autoHideDelay?: number;
  className?: string;
}) {
  return (
    <motion.div 
      className={`text-center py-12 ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      {...(autoHide && {
        animate: { opacity: 1, scale: 1 },
        transition: { delay: autoHideDelay / 1000 }
      })}
    >
      <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
      </div>
      
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
        {title}
      </h3>
      
      {description && (
        <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
          {description}
        </p>
      )}

      {action || (onAction && actionLabel) && (
        <div>
          {action || (
            <Button onClick={onAction}>
              {actionLabel}
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );
}

// Loading wrapper that handles different states
export function LoadingWrapper({
  loading,
  error,
  empty,
  children,
  loadingComponent,
  errorComponent,
  emptyComponent,
  retryAction
}: {
  loading: boolean;
  error?: Error | string | null;
  empty?: boolean;
  children: ReactNode;
  loadingComponent?: ReactNode;
  errorComponent?: ReactNode;
  emptyComponent?: ReactNode;
  retryAction?: () => void;
}) {
  if (loading) {
    return <>{loadingComponent || <InlineLoading text="Loading..." />}</>;
  }

  if (error) {
    return <>{errorComponent || (
      <ErrorState 
        error={error}
        onAction={retryAction}
      />
    )}</>;
  }

  if (empty) {
    return <>{emptyComponent || <EmptyState />}</>;
  }

  return <>{children}</>;
}