import React from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { CookieProvider } from './CookieContext';
import { StringProvider } from './useStrings';
import { ChatProvider } from './ChatContext';
import { AnalyticsProvider } from './AnalyticsContext';

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ErrorBoundary>
      <CookieProvider>
        <StringProvider>
          <ChatProvider>
            <AnalyticsProvider>
              {children}
            </AnalyticsProvider>
          </ChatProvider>
        </StringProvider>
      </CookieProvider>
    </ErrorBoundary>
  );
}