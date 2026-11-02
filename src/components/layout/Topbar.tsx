import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';
import { notify } from '@/stores/notificationStore';
import { Avatar } from '@/components/common/Avatar';
import { LogoutIcon, MenuIcon } from '@/components/common/icons';
import { NotificationBell } from '@/components/features/notifications/NotificationBell';
import { ThemeToggle } from './ThemeToggle';

const iconButton =
  'rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white';

export function Topbar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    // Drop cached server data so the next user never sees it.
    queryClient.clear();
    notify({ type: 'info', title: 'Signed out', message: 'You have been signed out safely.', inbox: false });
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-2 border-b border-slate-200 bg-white px-4 sm:px-6 dark:border-slate-800 dark:bg-slate-900">
      <button
        type="button"
        onClick={toggleSidebar}
        aria-label="Open menu"
        aria-expanded={sidebarOpen}
        aria-controls="mobile-nav"
        className={`${iconButton} lg:hidden`}
      >
        <MenuIcon className="size-5" />
      </button>

      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        <ThemeToggle />
        <NotificationBell />
        <div className="mx-1 hidden h-6 w-px bg-slate-200 sm:block dark:bg-slate-700" aria-hidden="true" />
        {user && (
          <div className="flex items-center gap-2">
            <Avatar name={user.name} />
            <div className="hidden text-sm leading-tight sm:block">
              <p className="font-medium text-slate-900 dark:text-white">{user.name}</p>
              <p className="text-slate-600 capitalize dark:text-slate-400">{user.role}</p>
            </div>
          </div>
        )}
        <button type="button" onClick={handleLogout} aria-label="Sign out" title="Sign out" className={iconButton}>
          <LogoutIcon className="size-5" />
        </button>
      </div>
    </header>
  );
}
