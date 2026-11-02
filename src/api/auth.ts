import type { AuthResponse, Credentials } from '@/types';
import { ApiError, latency } from './client';
import { logActivity, persist } from './db';

export const DEMO_CREDENTIALS: Credentials = {
  email: 'admin@adminflow.dev',
  password: 'Password123!',
};

export async function login({ email, password }: Credentials): Promise<AuthResponse> {
  await latency(400, 800);
  if (email.trim().toLowerCase() !== DEMO_CREDENTIALS.email || password !== DEMO_CREDENTIALS.password) {
    throw new ApiError('Invalid email or password.', 401);
  }
  logActivity('Alex Admin', 'login', 'signed in');
  persist();
  return {
    user: { id: 'usr_admin', name: 'Alex Admin', email: DEMO_CREDENTIALS.email, role: 'admin' },
    token: `demo.${btoa(email)}.${Date.now()}`,
  };
}
