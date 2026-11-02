import { Suspense, useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { queryClient } from '@/lib/queryClient';
import { router } from '@/routes';
import { watchSystemTheme } from '@/stores/uiStore';
import { ErrorBoundary } from '@/components/layout/ErrorBoundary';
import { PageLoader } from '@/components/layout/PageLoader';
import { Toaster } from '@/components/features/notifications/Toaster';

export default function App() {
  useEffect(watchSystemTheme, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Suspense fallback={<PageLoader />}>
          <RouterProvider router={router} future={{ v7_startTransition: true }} />
        </Suspense>
        <Toaster />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
