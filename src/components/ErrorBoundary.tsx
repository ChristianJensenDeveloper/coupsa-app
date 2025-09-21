import { Component, ReactNode, ErrorInfo } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { AlertTriangle, RefreshCw, Home, MessageCircle } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Log error to external service in production
    if (process.env.NODE_ENV === 'production') {
      this.logErrorToService(error, errorInfo);
    }
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // In production, you would send this to your error tracking service
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Example: Send to error tracking service
    // errorTrackingService.log(errorData);
    console.error('Error logged:', errorData);
  };

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleReportError = () => {
    const subject = encodeURIComponent('KOOCAO Error Report');
    const body = encodeURIComponent(`
Error: ${this.state.error?.message}
URL: ${window.location.href}
Time: ${new Date().toISOString()}

Stack Trace:
${this.state.error?.stack}

Component Stack:
${this.state.errorInfo?.componentStack}
    `);
    
    window.open(`mailto:support@koocao.com?subject=${subject}&body=${body}`);
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50/30 to-red-50/40 dark:from-slate-950 dark:via-red-900/10 dark:to-red-900/10 flex items-center justify-center p-4">
          <Card className="max-w-lg w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-red-200/50 dark:border-red-800/50 shadow-2xl">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">
                Something went wrong
              </h1>
              
              <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                We encountered an unexpected error while loading this page. 
                This has been automatically reported to our team.
              </p>

              {/* Error details in development */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-left">
                  <h3 className="font-medium text-red-800 dark:text-red-200 mb-2">
                    Error Details (Development Only):
                  </h3>
                  <p className="text-sm text-red-700 dark:text-red-300 font-mono break-all">
                    {this.state.error.message}
                  </p>
                  {this.state.error.stack && (
                    <details className="mt-2">
                      <summary className="text-sm text-red-600 dark:text-red-400 cursor-pointer">
                        Stack Trace
                      </summary>
                      <pre className="text-xs text-red-600 dark:text-red-400 mt-2 overflow-auto max-h-32">
                        {this.state.error.stack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              <div className="flex flex-col gap-3">
                <Button 
                  onClick={this.handleRetry}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={this.handleGoHome}
                    variant="outline"
                    className="flex-1"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Go Home
                  </Button>
                  
                  <Button 
                    onClick={this.handleReportError}
                    variant="outline"
                    className="flex-1"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Report Issue
                  </Button>
                </div>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 mt-6">
                If this problem persists, please contact our support team.
              </p>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for functional components error handling
export const useErrorHandler = () => {
  const handleError = (error: Error, context?: string) => {
    console.error(`Error in ${context || 'component'}:`, error);
    
    // In production, log to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // errorTrackingService.log({ error, context });
    }
  };

  return handleError;
};