import { beforeEach, describe, expect, it } from 'vitest';
import { DEMO_CREDENTIALS } from '@/api/auth';
import { selectIsAuthenticated, useAuthStore } from '../authStore';

describe('authStore', () => {
  beforeEach(() => useAuthStore.setState({ user: null, token: null, isLoading: false, error: null }));

  it('logs in with the demo credentials and persists the session', async () => {
    await useAuthStore.getState().login(DEMO_CREDENTIALS);
    const state = useAuthStore.getState();
    expect(selectIsAuthenticated(state)).toBe(true);
    expect(state.user?.email).toBe(DEMO_CREDENTIALS.email);
    expect(JSON.parse(localStorage.getItem('adminflow-auth')!).state.token).toBe(state.token);
  });

  it('exposes an error and stays signed out on bad credentials', async () => {
    await expect(
      useAuthStore.getState().login({ email: DEMO_CREDENTIALS.email, password: 'wrong-pass' }),
    ).rejects.toThrow();
    const state = useAuthStore.getState();
    expect(selectIsAuthenticated(state)).toBe(false);
    expect(state.error).toMatch(/invalid email or password/i);
    expect(state.isLoading).toBe(false);
  });

  it('clears the session on logout', async () => {
    await useAuthStore.getState().login(DEMO_CREDENTIALS);
    useAuthStore.getState().logout();
    expect(selectIsAuthenticated(useAuthStore.getState())).toBe(false);
  });
});
