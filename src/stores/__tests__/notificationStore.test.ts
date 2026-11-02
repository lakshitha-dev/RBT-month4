import { beforeEach, describe, expect, it } from 'vitest';
import { selectUnreadCount, useNotificationStore } from '../notificationStore';

describe('notificationStore', () => {
  beforeEach(() => useNotificationStore.setState({ notifications: [], toasts: [] }));

  it('adds to the inbox and shows a toast by default', () => {
    const id = useNotificationStore.getState().notify({ type: 'success', title: 'Saved' });
    const state = useNotificationStore.getState();
    expect(state.notifications[0]).toMatchObject({ id, title: 'Saved', read: false });
    expect(state.toasts).toHaveLength(1);
    expect(selectUnreadCount(state)).toBe(1);
  });

  it('supports toast-only and inbox-only notifications', () => {
    const { notify } = useNotificationStore.getState();
    notify({ title: 'Toast only', inbox: false });
    notify({ title: 'Inbox only', toast: false });
    const state = useNotificationStore.getState();
    expect(state.notifications.map((n) => n.title)).toEqual(['Inbox only']);
    expect(state.toasts.map((t) => t.title)).toEqual(['Toast only']);
  });

  it('marks notifications as read', () => {
    const { notify, markRead, markAllRead } = useNotificationStore.getState();
    const first = notify({ title: 'One' });
    notify({ title: 'Two' });
    markRead(first);
    expect(selectUnreadCount(useNotificationStore.getState())).toBe(1);
    markAllRead();
    expect(selectUnreadCount(useNotificationStore.getState())).toBe(0);
  });
});
