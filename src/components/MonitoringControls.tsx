import React from 'react';
import { Button } from './ui/button';
import PerformanceMonitor from './PerformanceMonitor';
import SecurityMonitor from './SecurityMonitor';
import ComplianceChecker from './ComplianceChecker';
import { LazyLoadingStatus } from './LazyLoadingStatus';

interface MonitoringControlsProps {
  currentPage: string;
  showPerformanceMonitor: boolean;
  showSecurityMonitor: boolean;
  showComplianceChecker: boolean;
  onTogglePerformance: () => void;
  onToggleSecurity: () => void;
  onToggleCompliance: () => void;
  onShowProductionReadiness: () => void;
}

export function MonitoringControls({
  currentPage,
  showPerformanceMonitor,
  showSecurityMonitor,
  showComplianceChecker,
  onTogglePerformance,
  onToggleSecurity,
  onToggleCompliance,
  onShowProductionReadiness
}: MonitoringControlsProps) {
  if (currentPage !== 'home') return null;

  return (
    <>
      {/* Production Readiness Banner */}
      <div className="mb-4 bg-gradient-to-r from-orange-100 to-orange-200 dark:from-orange-900/20 dark:to-orange-800/20 border border-orange-300 dark:border-orange-700 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-orange-800 dark:text-orange-200">
              Pre-Launch Mode - Performance & Security Monitoring Available
            </span>
          </div>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={onTogglePerformance}
              className="text-orange-700 border-orange-300 hover:bg-orange-50 dark:text-orange-300 dark:border-orange-600 dark:hover:bg-orange-900/20"
            >
              Performance
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={onToggleSecurity}
              className="text-orange-700 border-orange-300 hover:bg-orange-50 dark:text-orange-300 dark:border-orange-600 dark:hover:bg-orange-900/20"
            >
              Security
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={onToggleCompliance}
              className="text-orange-700 border-orange-300 hover:bg-orange-50 dark:text-orange-300 dark:border-orange-600 dark:hover:bg-orange-900/20"
            >
              Compliance
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={onShowProductionReadiness}
              className="text-orange-700 border-orange-300 hover:bg-orange-50 dark:text-orange-300 dark:border-orange-600 dark:hover:bg-orange-900/20"
            >
              Checklist
            </Button>
          </div>
        </div>
      </div>

      {/* Performance Monitor */}
      {showPerformanceMonitor && (
        <div className="mb-4">
          <PerformanceMonitor className="w-full" />
        </div>
      )}

      {/* Security Monitor */}
      {showSecurityMonitor && (
        <div className="mb-4">
          <SecurityMonitor className="w-full" />
        </div>
      )}

      {/* Compliance Checker */}
      {showComplianceChecker && (
        <div className="mb-4">
          <ComplianceChecker className="w-full" />
        </div>
      )}

      {/* Lazy Loading Status */}
      {showPerformanceMonitor && (
        <div className="mb-4">
          <LazyLoadingStatus className="w-full" />
        </div>
      )}
    </>
  );
}