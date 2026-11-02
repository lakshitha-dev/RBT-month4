import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import * as authApi from '@/api/auth';
import type { AuthUser, Credentials } from '@/types';

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (credentials: Credentials) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

// Only in the screenshot-inspection build (`vite build --mode inspect`): start signed in as the demo
// admin so the design inspector can reach the protected screens. Never set in a production build.
const inspectSession: Pick<AuthState, 'user' | 'token'> =
  import.meta.env.VITE_INSPECT_SESSION === 'true'
    ? { user: { id: 'usr_admin', name: 'Alex Admin', email: 'admin@adminflow.dev', role: 'admin' }, token: 'inspect' }
    : { user: null, token: null };

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      ...inspectSession,
      isLoading: false,
      error: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const { user, token } = await authApi.login(credentials);
          set({ user, token, isLoading: false });
        } catch (err) {
          set({ isLoading: false, error: err instanceof Error ? err.message : 'Sign in failed.' });
          throw err;
        }
      },

      logout: () => set({ user: null, token: null, error: null }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'adminflow-auth',
      storage: createJSONStorage(() => localStorage),
      // Only the session is persisted; transient flags always start fresh.
      partialize: ({ user, token }) => ({ user, token }),
    },
  ),
);

export const selectIsAuthenticated = (state: AuthState) => Boolean(state.user && state.token);
