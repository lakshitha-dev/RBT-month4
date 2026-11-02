import { useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { selectUnreadCount, useNotificationStore } from '@/stores/notificationStore';
import { useUiStore } from '@/stores/uiStore';
import { ActivityIcon, BellIcon, CloseIcon, HomeIcon, SettingsIcon, UsersIcon } from '@/components/common/icons';
import { Wordmark } from './BrandMark';

const MAIN_NAV = [
  { to: '/', label: 'Overview', icon: HomeIcon, end: true },
  { to: '/users', label: 'Users', icon: UsersIcon },
  { to: '/activity', label: 'Activity', icon: ActivityIcon },
  { to: '/notifications', label: 'Notifications', icon: BellIcon, countsUnread: true },
];
const UTILITY_NAV = [{ to: '/settings', label: 'Settings', icon: SettingsIcon }];

type NavItem = (typeof MAIN_NAV)[number] | (typeof UTILITY_NAV)[number];

function NavRow({ item, unread, onNavigate }: { item: NavItem; unread: number; onNavigate?: () => void }) {
  const { to, label, icon: Icon } = item;
  const showCount = 'countsUnread' in item && item.countsUnread && unread > 0;
  return (
    <li>
      <NavLink
        to={to}
        end={'end' in item ? item.end : undefined}
        onClick={onNavigate}
        className={({ isActive }) =>
          clsx(
            'flex h-8 items-center gap-2.5 rounded-control px-2.5 text-sm transition-colors',
            // Active: a neutral grey pill with the label in ink and semibold (a cue beyond colour).
            isActive ? 'bg-active font-semibold text-ink' : 'text-muted hover:bg-raised hover:text-ink',
          )
        }
      >
        <Icon className="size-4 shrink-0" />
        <span className="flex-1">{label}</span>
        {/* A count only on a queue that needs action, with its noun in the label. */}
        {showCount && (
          <>
            <span aria-hidden="true" className="num text-xs text-muted">
              {unread}
            </span>
            {/* One phrase: a leading space inside a hidden span is dropped from the name ("2unread"). */}
            <span className="sr-only">{`, ${unread} unread`}</span>
          </>
        )}
      </NavLink>
    </li>
  );
}

function NavContent({ onNavigate }: { onNavigate?: () => void }) {
  const unread = useNotificationStore(selectUnreadCount);
  return (
    <>
      <nav aria-label="Main" className="flex flex-1 flex-col">
        <ul className="space-y-0.5">
          {MAIN_NAV.map((item) => (
            <NavRow key={item.to} item={item} unread={unread} onNavigate={onNavigate} />
          ))}
        </ul>
        <ul className="mt-auto space-y-0.5 pt-6">
          {UTILITY_NAV.map((item) => (
            <NavRow key={item.to} item={item} unread={unread} onNavigate={onNavigate} />
          ))}
        </ul>
      </nav>
    </>
  );
}

/** The scope this admin works in, shown under the product's name. */
function WorkspaceScope() {
  return (
    <div className="px-2.5">
      <p className="text-sm font-medium text-ink">Main workspace</p>
      <p className="text-xs text-muted">Admin console</p>
    </div>
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
      {/* Desktop: the sidebar is part of the tinted frame, on the ground, with no rule. */}
      <aside className="hidden w-[228px] shrink-0 lg:block">
        <div className="sticky top-0 flex h-screen flex-col gap-5 px-3 pt-3 pb-4">
          <div className="flex h-9 items-center px-2.5">
            <Wordmark />
          </div>
          <WorkspaceScope />
          <NavContent />
        </div>
      </aside>

      {/* Phone and tablet: a full-height sheet over the screen. */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="animate-fade-in absolute inset-0 bg-black/45" aria-hidden="true" onClick={close} />
          <div
            ref={drawerRef}
            id="mobile-nav"
            role="dialog"
            aria-modal="true"
            aria-label="Main menu"
            className="animate-rise-in relative flex h-full w-72 max-w-[85vw] flex-col gap-5 bg-ground px-3 pt-3 pb-4"
          >
            <div className="flex h-9 items-center justify-between px-2.5">
              <Wordmark />
              <button
                type="button"
                onClick={close}
                aria-label="Close menu"
                className="-mr-1.5 flex size-9 items-center justify-center rounded-control text-muted hover:bg-raised hover:text-ink"
              >
                <CloseIcon className="size-5" />
              </button>
            </div>
            <WorkspaceScope />
            <NavContent onNavigate={close} />
          </div>
        </div>
      )}
    </>
  );
}
