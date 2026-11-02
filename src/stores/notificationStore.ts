import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { AppNotification, NotificationType } from '@/types';
import { createId } from '@/utils/id';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface Toast {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  action?: ToastAction;
}

export interface NotifyOptions {
  type?: NotificationType;
  title: string;
  message?: string;
  /** Show a transient toast in addition to adding it to the inbox (default true). */
  toast?: boolean;
  /** Record it in the persistent inbox (default true). Use false for transient confirmations. */
  inbox?: boolean;
  action?: ToastAction;
}

interface NotificationState {
  /** Persistent inbox shown in the bell menu and the Notifications page. */
  notifications: AppNotification[];
  /** Transient toasts; never persisted. */
  toasts: Toast[];
  notify: (options: NotifyOptions) => string;
  dismissToast: (id: string) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  remove: (id: string) => void;
  clearAll: () => void;
}

const MAX_INBOX = 50;
const MAX_TOASTS = 4;

const welcome: AppNotification[] = [
  {
    id: 'ntf_welcome',
    type: 'info',
    title: 'Welcome to AdminFlow',
    message: 'Manage users, track metrics and stay on top of activity from one place.',
    createdAt: new Date(Date.now() - 3_600_000).toISOString(),
    read: false,
  },
  {
    id: 'ntf_report',
    type: 'success',
    title: 'Monthly report ready',
    message: 'The October revenue report has been generated.',
    createdAt: new Date(Date.now() - 26 * 3_600_000).toISOString(),
    read: false,
  },
  {
    id: 'ntf_storage',
    type: 'warning',
    title: 'Storage at 82%',
    message: 'Consider archiving old exports.',
    createdAt: new Date(Date.now() - 3 * 86_400_000).toISOString(),
    read: true,
  },
];

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      notifications: welcome,
      toasts: [],

      notify: ({ type = 'info', title, message, toast = true, inbox = true, action }) => {
        const id = createId('ntf');
        set((state) => ({
          notifications: inbox
            ? [
                { id, type, title, message, createdAt: new Date().toISOString(), read: false },
                ...state.notifications,
              ].slice(0, MAX_INBOX)
            : state.notifications,
          toasts: toast ? [...state.toasts, { id, type, title, message, action }].slice(-MAX_TOASTS) : state.toasts,
        }));
        return id;
      },

      dismissToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

      markRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
        })),

      markAllRead: () =>
        set((state) => ({ notifications: state.notifications.map((n) => ({ ...n, read: true })) })),

      remove: (id) => set((state) => ({ notifications: state.notifications.filter((n) => n.id !== id) })),

      clearAll: () => set({ notifications: [] }),
    }),
    {
      name: 'adminflow-notifications',
      storage: createJSONStorage(() => localStorage),
      partialize: ({ notifications }) => ({ notifications }),
    },
  ),
);

export const selectUnreadCount = (state: NotificationState) =>
  state.notifications.reduce((count, n) => count + (n.read ? 0 : 1), 0);

/** Convenience for non-React code (e.g. mutation callbacks). */
export const notify = (options: NotifyOptions) => useNotificationStore.getState().notify(options);
