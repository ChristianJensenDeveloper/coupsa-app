import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Database, 
  CheckCircle, 
  AlertTriangle, 
  X, 
  ExternalLink 
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AnalyticsStatusIndicatorProps {
  className?: string;
}

export function AnalyticsStatusIndicator({ className }: AnalyticsStatusIndicatorProps) {
  const [analyticsConfigured, setAnalyticsConfigured] = useState<boolean | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkAnalyticsStatus();
  }, []);

  const checkAnalyticsStatus = async () => {
    try {
      // Check if analytics tables exist
      const { error } = await supabase
        .from('user_sessions')
        .select('count', { count: 'exact', head: true })
        .limit(0);

      setAnalyticsConfigured(!error);
    } catch (error) {
      setAnalyticsConfigured(false);
    } finally {
      setChecking(false);
    }
  };

  // Don't show anything if checking, dismissed, or analytics is configured
  if (checking || dismissed || analyticsConfigured) {
    return null;
  }

  return (
    <div className={className}>
      <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-orange-800 dark:text-orange-200">
                  Analytics Not Configured
                </h4>
                <Badge variant="outline" className="border-orange-300 text-orange-700 dark:text-orange-300">
                  Demo Mode
                </Badge>
              </div>
              <AlertDescription className="text-orange-700 dark:text-orange-300 text-sm">
                Your app is running without analytics tracking. User behavior and business metrics won't be collected.
              </AlertDescription>
              <div className="flex items-center gap-2 mt-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open('/database-setup.sql', '_blank')}
                  className="border-orange-300 text-orange-700 hover:bg-orange-100 dark:text-orange-300 dark:hover:bg-orange-900/30"
                >
                  <Database className="w-3 h-3 mr-1" />
                  View Setup Guide
                </Button>
                <Button
                  size="sm"
                  onClick={() => setDismissed(true)}
                  variant="ghost"
                  className="text-orange-600 hover:bg-orange-100 dark:text-orange-400 dark:hover:bg-orange-900/30"
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setDismissed(true)}
            className="text-orange-500 hover:bg-orange-100 dark:hover:bg-orange-900/30 p-1 h-auto"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </Alert>
    </div>
  );
}