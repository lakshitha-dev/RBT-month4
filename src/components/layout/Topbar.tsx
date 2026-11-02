import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';
import { notify } from '@/stores/notificationStore';
import { Avatar } from '@/components/common/Avatar';
import { LogoutIcon, MenuIcon, SearchIcon } from '@/components/common/icons';
import { NotificationBell } from '@/components/features/notifications/NotificationBell';
import { Wordmark } from './BrandMark';
import { ThemeToggle } from './ThemeToggle';

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

const iconButton =
  'flex size-9 items-center justify-center rounded-control text-muted transition-colors hover:bg-raised hover:text-ink';

/**
 * Searches people from anywhere: submits to the Users list. Ctrl+K / Cmd+K focuses it. A modifier shortcut, not a
 * single key: screen readers in browse mode swallow single keys, and WCAG 2.1.4 forbids un-remappable ones
 * (NVDA finding F5).
 */
function PeopleSearch() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState('');

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'k' && (event.ctrlKey || event.metaKey) && !event.altKey && !event.shiftKey) {
        event.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const q = value.trim();
    navigate(q ? `/users?q=${encodeURIComponent(q)}` : '/users');
    setValue('');
    inputRef.current?.blur();
  };

  return (
    <form role="search" aria-label="Search people" onSubmit={onSubmit} className="relative w-full max-w-[548px]">
      <label htmlFor="people-search" className="sr-only">
        Search people
      </label>
      <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
      <input
        ref={inputRef}
        id="people-search"
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search people by name, email or department"
        aria-keyshortcuts="Control+K Meta+K"
        autoComplete="off"
        className="h-8 w-full rounded-control border border-control bg-surface pr-16 pl-9 text-sm text-ink placeholder:text-muted hover:border-ink"
      />
      <kbd
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-2 hidden h-5 -translate-y-1/2 items-center rounded-[4px] border border-line px-1.5 text-xs text-muted sm:flex"
      >
        {isMac ? '⌘K' : 'Ctrl K'}
      </kbd>
    </form>
  );
}

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
    // Part of the tinted frame: same ground as the sidebar, 48px, no rule.
    <header className="sticky top-0 z-20 flex h-12 shrink-0 items-center gap-3 bg-ground px-3 lg:static lg:pr-2 lg:pl-0">
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
      <Wordmark className="lg:hidden" />

      <div className="hidden flex-1 justify-center md:flex">
        <PeopleSearch />
      </div>

      <div className="ml-auto flex items-center gap-1 md:ml-0">
        <ThemeToggle />
        <NotificationBell />
        {user && (
          <div className="ml-1 hidden items-center gap-2 border-l border-line pl-3 sm:flex">
            <Avatar name={user.name} size="sm" />
            <div className="text-xs leading-tight">
              <p className="font-medium text-ink">{user.name}</p>
              <p className="text-muted capitalize">{user.role}</p>
            </div>
          </div>
        )}
        <button type="button" onClick={handleLogout} aria-label="Sign out" title="Sign out" className={iconButton}>
          <LogoutIcon className="size-[18px]" />
        </button>
      </div>
    </header>
  );
}
