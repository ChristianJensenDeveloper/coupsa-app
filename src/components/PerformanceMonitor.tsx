import { useEffect, useState, useCallback } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Activity, Zap, Clock, Wifi, AlertTriangle, CheckCircle, TrendingUp, BarChart3 } from 'lucide-react';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

interface PerformanceMetrics {
  loadTime: number;
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
  memoryUsage: number;
  jsHeapSize: number;
  domElements: number;
  resourceCount: number;
}

interface PerformanceMonitorProps {
  className?: string;
  onMetrics?: (metrics: PerformanceMetrics) => void;
}

export default function PerformanceMonitor({ className = "", onMetrics }: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isCollecting, setIsCollecting] = useState(false);
  const [performanceScore, setPerformanceScore] = useState<number>(0);
  const networkStatus = useNetworkStatus();

  const collectMetrics = useCallback(async () => {
    setIsCollecting(true);
    
    try {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      
      // Web Vitals
      let fcp = 0;
      let lcp = 0;
      let fid = 0;
      let cls = 0;

      // First Contentful Paint
      const fcpEntry = paint.find(entry => entry.name === 'first-contentful-paint');
      if (fcpEntry) fcp = fcpEntry.startTime;

      // Largest Contentful Paint (using Performance Observer if available)
      if ('PerformanceObserver' in window) {
        try {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            if (lastEntry) lcp = lastEntry.startTime;
          });
          observer.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (e) {
          console.warn('LCP observer not supported');
        }
      }

      // Memory usage (if available)
      let memoryUsage = 0;
      let jsHeapSize = 0;
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // MB
        jsHeapSize = memory.totalJSHeapSize / 1024 / 1024; // MB
      }

      const newMetrics: PerformanceMetrics = {
        loadTime: navigation.loadEventEnd - navigation.fetchStart,
        fcp,
        lcp,
        fid,
        cls,
        ttfb: navigation.responseStart - navigation.requestStart,
        memoryUsage,
        jsHeapSize,
        domElements: document.querySelectorAll('*').length,
        resourceCount: performance.getEntriesByType('resource').length
      };

      setMetrics(newMetrics);
      
      // Calculate performance score (0-100)
      const score = calculatePerformanceScore(newMetrics);
      setPerformanceScore(score);
      
      onMetrics?.(newMetrics);

      // Send to analytics if available
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'performance_metrics', {
          load_time: Math.round(newMetrics.loadTime),
          fcp: Math.round(newMetrics.fcp),
          lcp: Math.round(newMetrics.lcp),
          ttfb: Math.round(newMetrics.ttfb),
          memory_usage: Math.round(newMetrics.memoryUsage),
          performance_score: score,
          network_type: networkStatus.effectiveType
        });
      }

    } catch (error) {
      console.error('Error collecting performance metrics:', error);
    } finally {
      setIsCollecting(false);
    }
  }, [networkStatus, onMetrics]);

  const calculatePerformanceScore = (metrics: PerformanceMetrics): number => {
    // Scoring based on Core Web Vitals thresholds
    let score = 100;
    
    // FCP scoring (good: <1.8s, needs improvement: 1.8-3s, poor: >3s)
    if (metrics.fcp > 3000) score -= 25;
    else if (metrics.fcp > 1800) score -= 10;
    
    // LCP scoring (good: <2.5s, needs improvement: 2.5-4s, poor: >4s)
    if (metrics.lcp > 4000) score -= 25;
    else if (metrics.lcp > 2500) score -= 10;
    
    // Load time scoring
    if (metrics.loadTime > 5000) score -= 20;
    else if (metrics.loadTime > 3000) score -= 10;
    
    // Memory usage scoring
    if (metrics.memoryUsage > 50) score -= 15;
    else if (metrics.memoryUsage > 25) score -= 5;
    
    return Math.max(0, score);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400';
    if (score >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 90) return CheckCircle;
    if (score >= 70) return AlertTriangle;
    return AlertTriangle;
  };

  useEffect(() => {
    // Collect initial metrics after page load
    if (document.readyState === 'complete') {
      setTimeout(collectMetrics, 1000);
    } else {
      window.addEventListener('load', () => {
        setTimeout(collectMetrics, 1000);
      });
    }
  }, [collectMetrics]);

  const ScoreIcon = getScoreIcon(performanceScore);

  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">Performance Monitor</h3>
        </div>
        <div className="flex items-center gap-2">
          {metrics && (
            <div className="flex items-center gap-2">
              <ScoreIcon className={`w-4 h-4 ${getScoreColor(performanceScore)}`} />
              <span className={`font-semibold ${getScoreColor(performanceScore)}`}>
                {performanceScore}/100
              </span>
            </div>
          )}
          <Button 
            onClick={collectMetrics} 
            disabled={isCollecting}
            size="sm"
            variant="outline"
          >
            {isCollecting ? <Activity className="w-4 h-4 animate-spin" /> : <BarChart3 className="w-4 h-4" />}
            {isCollecting ? 'Collecting...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {metrics ? (
        <div className="space-y-4">
          {/* Core Web Vitals */}
          <div>
            <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Core Web Vitals
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">First Contentful Paint</div>
                <div className="font-semibold text-slate-900 dark:text-slate-100">
                  {Math.round(metrics.fcp)}ms
                </div>
                <Badge 
                  variant={metrics.fcp < 1800 ? "secondary" : metrics.fcp < 3000 ? "secondary" : "destructive"}
                  className="text-xs mt-1"
                >
                  {metrics.fcp < 1800 ? 'Good' : metrics.fcp < 3000 ? 'Needs Work' : 'Poor'}
                </Badge>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Largest Contentful Paint</div>
                <div className="font-semibold text-slate-900 dark:text-slate-100">
                  {Math.round(metrics.lcp)}ms
                </div>
                <Badge 
                  variant={metrics.lcp < 2500 ? "secondary" : metrics.lcp < 4000 ? "secondary" : "destructive"}
                  className="text-xs mt-1"
                >
                  {metrics.lcp < 2500 ? 'Good' : metrics.lcp < 4000 ? 'Needs Work' : 'Poor'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Load Metrics */}
          <div>
            <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Load Performance
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Total Load Time</div>
                <div className="font-semibold text-slate-900 dark:text-slate-100">
                  {Math.round(metrics.loadTime)}ms
                </div>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Time to First Byte</div>
                <div className="font-semibold text-slate-900 dark:text-slate-100">
                  {Math.round(metrics.ttfb)}ms
                </div>
              </div>
            </div>
          </div>

          {/* Resource Usage */}
          <div>
            <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Resource Usage
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Memory Usage</div>
                <div className="font-semibold text-slate-900 dark:text-slate-100">
                  {Math.round(metrics.memoryUsage)}MB
                </div>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">DOM Elements</div>
                <div className="font-semibold text-slate-900 dark:text-slate-100">
                  {metrics.domElements.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Network Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-700/30">
            <div className="flex items-center gap-2 mb-2">
              <Wifi className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="font-medium text-blue-800 dark:text-blue-200">Network Status</span>
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-300">
              Connection: {networkStatus.effectiveType || 'Unknown'} | 
              Downlink: {networkStatus.downlink}Mbps | 
              RTT: {networkStatus.rtt}ms
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <Activity className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-slate-600 dark:text-slate-400">
            Click "Refresh" to collect performance metrics
          </p>
        </div>
      )}
    </Card>
  );
}