import { Navigate, useLocation, useNavigate, type Location } from 'react-router-dom';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { selectIsAuthenticated, useAuthStore } from '@/stores/authStore';
import { notify } from '@/stores/notificationStore';
import { LoginForm } from '@/components/features/auth/LoginForm';
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
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-brand-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-brand-800/30">
      <header className="flex items-center justify-between p-4 sm:p-6">
        <div className="flex items-center gap-2">
          <img src="/favicon.svg" alt="" width={32} height={32} className="size-8" />
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">AdminFlow</span>
        </div>
        <ThemeToggle />
      </header>
      <main id="main-content" className="flex flex-1 items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8 dark:border-slate-800 dark:bg-slate-900">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Sign in to AdminFlow</h1>
          <p className="mt-1 mb-6 text-sm text-slate-600 dark:text-slate-400">
            {from ? 'Please sign in to continue to the page you requested.' : 'Welcome back! Enter your details below.'}
          </p>
          <LoginForm onSuccess={onSuccess} />
        </div>
      </main>
    </div>
  );
}
