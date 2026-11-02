import { useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useUiStore } from '@/stores/uiStore';
import { ActivityIcon, BellIcon, CloseIcon, HomeIcon, SettingsIcon, UsersIcon } from '@/components/common/icons';

const NAV = [
  { to: '/', label: 'Dashboard', icon: HomeIcon, end: true },
  { to: '/users', label: 'Users', icon: UsersIcon },
  { to: '/activity', label: 'Activity', icon: ActivityIcon },
  { to: '/notifications', label: 'Notifications', icon: BellIcon },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
];

function Brand() {
  return (
    <div className="flex items-center gap-2 px-2">
      <img src="/favicon.svg" alt="" width={32} height={32} className="size-8" />
      <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">AdminFlow</span>
    </div>
  );
}

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <ul className="space-y-1">
      {NAV.map(({ to, label, icon: Icon, end }) => (
        <li key={to}>
          <NavLink
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-50 font-semibold text-brand-800 shadow-[inset_3px_0_0_var(--color-brand-600)] dark:bg-brand-800/40 dark:text-white dark:shadow-[inset_3px_0_0_var(--color-brand-300)]'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white',
              )
            }
          >
            <Icon className="size-5" />
            {label}
          </NavLink>
        </li>
      ))}
    </ul>
  );
}

export function Sidebar() {
  const open = useUiStore((s) => s.sidebarOpen);
  const close = useUiStore((s) => s.closeSidebar);
  const drawerRef = useRef<HTMLDivElement>(null);

  useFocusTrap(drawerRef, open);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => e.key === 'Escape' && close();
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, close]);

  return (
    <>
      {/* Desktop: persistent sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:block dark:border-slate-800 dark:bg-slate-900">
        <div className="sticky top-0 flex h-screen flex-col gap-6 p-4">
          <Brand />
          <nav aria-label="Main">
            <NavItems />
          </nav>
        </div>
      </aside>

      {/* Mobile: modal drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="animate-fade-in absolute inset-0 bg-slate-950/60" aria-hidden="true" onClick={close} />
          <div
            ref={drawerRef}
            id="mobile-nav"
            role="dialog"
            aria-modal="true"
            aria-label="Main menu"
            className="relative flex h-full w-72 max-w-[85vw] flex-col gap-6 bg-white p-4 shadow-xl dark:bg-slate-900"
          >
            <div className="flex items-center justify-between">
              <Brand />
              <button
                type="button"
                onClick={close}
                aria-label="Close menu"
                className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <CloseIcon className="size-5" />
              </button>
            </div>
            <nav aria-label="Main">
              <NavItems onNavigate={close} />
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
