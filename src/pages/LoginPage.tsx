import { Navigate, useLocation, useNavigate, type Location } from 'react-router-dom';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { selectIsAuthenticated, useAuthStore } from '@/stores/authStore';
import { notify } from '@/stores/notificationStore';
import { LoginForm } from '@/components/features/auth/LoginForm';
import { Wordmark } from '@/components/layout/BrandMark';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

export default function LoginPage() {
  useDocumentTitle('Sign in');
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: Location } | null)?.from;
  const destination = from ? `${from.pathname}${from.search}` : '/';

  if (isAuthenticated) return <Navigate to={destination} replace />;

  const onSuccess = () => {
    const name = useAuthStore.getState().user?.name;
    notify({ type: 'success', title: `Welcome back${name ? `, ${name.split(' ')[0]}` : ''}!`, inbox: false });
    navigate(destination, { replace: true });
  };

  return (
    // Same tinted frame as the app; the sign-in form sits on one white sheet. No gradient, no shadow.
    <div className="flex min-h-screen flex-col bg-ground">
      <header className="flex h-12 items-center justify-between px-4 sm:px-6">
        <Wordmark />
        <ThemeToggle />
      </header>
      <main id="main-content" className="flex flex-1 items-start justify-center px-4 pt-[12vh] pb-16">
        <div className="w-full max-w-[400px] rounded-sheet border border-line bg-surface p-6 sm:p-8">
          <h1 className="text-[22px] leading-7 font-semibold tracking-[-0.01em] text-ink">Sign in to AdminFlow</h1>
          <p className="mt-1 mb-6 text-sm text-muted">
            {from ? 'Sign in to continue to the page you asked for.' : 'The admin console for your workspace.'}
          </p>
          <LoginForm onSuccess={onSuccess} />
        </div>
      </main>
    </div>
  );
}
