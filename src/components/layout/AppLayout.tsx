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
      className="sr-only z-[70] rounded-control bg-primary px-4 py-2 text-sm font-medium text-on-primary focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
    >
      Skip to main content
    </a>
  );
}

/**
 * Shell: one tinted L-frame (sidebar + 48px top bar on the ground, no rule between them) around a white
 * sheet inset 8px from the window's right and bottom edges, 16px radius, 1px edge, no shadow.
 * On phones and tablets the frame folds away and the sheet becomes the screen.
 */
export function AppLayout() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-ground">
      <SkipLink />
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 bg-surface lg:mr-2 lg:mb-2 lg:rounded-sheet lg:border lg:border-line"
        >
          {/* Canvas: 24px padding, fluid up to 1312px of content. */}
          <div className="mx-auto max-w-[1360px] px-4 pt-5 pb-10 sm:px-6 sm:pt-6">
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
