import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Download, Wifi, WifiOff, Bell, BellOff } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface PWAManagerProps {
  className?: string;
}

export function PWAManager({ className = '' }: PWAManagerProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [syncInProgress, setSyncInProgress] = useState(false);

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      registerServiceWorker();
    }

    // Check if app is installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Check notification permission
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Back online! Syncing data...');
      handleBackgroundSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.info('You are now offline. The app will work with cached data.');
    };

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered successfully:', registration);

      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              toast.info('New version available! Refresh to update.');
            }
          });
        }
      });
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  };

  const handleInstallApp = async () => {
    if (!installPrompt) return;

    const result = await installPrompt.prompt();
    if (result.outcome === 'accepted') {
      setIsInstalled(true);
      setInstallPrompt(null);
      toast.success('KOOCAO installed successfully!');
    }
  };

  const handleEnableNotifications = async () => {
    if (!('Notification' in window)) {
      toast.error('Notifications not supported in this browser');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        toast.success('Notifications enabled!');
        
        // Subscribe to push notifications if available
        if ('serviceWorker' in navigator && 'PushManager' in window) {
          const registration = await navigator.serviceWorker.ready;
          await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(process.env.REACT_APP_VAPID_PUBLIC_KEY || '')
          });
        }
      } else {
        toast.error('Notifications permission denied');
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast.error('Failed to enable notifications');
    }
  };

  const handleDisableNotifications = async () => {
    setNotificationsEnabled(false);
    toast.info('Notifications disabled');
  };

  const handleBackgroundSync = async () => {
    if (!('serviceWorker' in navigator) || !('sync' in window.ServiceWorkerRegistration.prototype)) {
      return;
    }

    try {
      setSyncInProgress(true);
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register('background-sync');
      console.log('Background sync registered');
    } catch (error) {
      console.error('Background sync failed:', error);
    } finally {
      setSyncInProgress(false);
    }
  };

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  return (
    <div className={`bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg rounded-xl border border-white/30 dark:border-slate-700/40 p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
        <h3 className="font-semibold text-slate-900 dark:text-slate-100">
          App Status
        </h3>
      </div>

      <div className="space-y-3">
        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isOnline ? <Wifi className="w-4 h-4 text-green-500" /> : <WifiOff className="w-4 h-4 text-red-500" />}
            <span className="text-sm text-slate-600 dark:text-slate-400">
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
          {syncInProgress && (
            <div className="text-xs text-blue-500 animate-pulse">Syncing...</div>
          )}
        </div>

        {/* Install App */}
        {!isInstalled && installPrompt && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Install App
            </span>
            <Button
              size="sm"
              onClick={handleInstallApp}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Download className="w-3 h-3 mr-1" />
              Install
            </Button>
          </div>
        )}

        {/* Notifications */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {notificationsEnabled ? <Bell className="w-4 h-4 text-green-500" /> : <BellOff className="w-4 h-4 text-slate-400" />}
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Notifications
            </span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={notificationsEnabled ? handleDisableNotifications : handleEnableNotifications}
            className="text-xs"
          >
            {notificationsEnabled ? 'Disable' : 'Enable'}
          </Button>
        </div>

        {/* PWA Features */}
        {isInstalled && (
          <div className="pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              ✅ Installed as app
              <br />
              ✅ Works offline
              <br />
              ✅ Fast loading
            </div>
          </div>
        )}
      </div>
    </div>
  );
}