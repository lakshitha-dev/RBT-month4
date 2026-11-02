import { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { ErrorBoundary } from './ErrorBoundary';
import { PageLoader } from './PageLoader';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only z-[70] rounded-lg bg-brand-600 px-4 py-2 font-medium text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
    >
      Skip to main content
    </a>
  );
}

export function AppLayout() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen">
      <SkipLink />
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main id="main-content" tabIndex={-1} className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            {/* Per-route boundary: a crash on one page never takes down the shell. */}
            <ErrorBoundary resetKeys={[location.pathname]}>
              <Suspense fallback={<PageLoader />}>
                <Outlet />
              </Suspense>
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
}
