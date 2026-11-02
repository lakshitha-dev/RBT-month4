import type { Activity, ActivityType, TrendPoint, User } from '@/types';
import { createId } from '@/utils/id';
import { seedActivity, seedTrend, seedUsers } from './seed';

/**
 * In-memory "database" backing the mock API. Users and activity are persisted to
 * localStorage so CRUD changes survive a reload, mimicking a real backend.
 */
interface Database {
  users: User[];
  activity: Activity[];
  trend: TrendPoint[];
}

const STORAGE_KEY = 'adminflow-db-v1';

function load(): Database {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Pick<Database, 'users' | 'activity'>;
      return { ...parsed, trend: seedTrend() };
    }
  } catch {
    // Corrupt or unavailable storage: fall back to fresh seed data.
  }
  const users = seedUsers();
  return { users, activity: seedActivity(users), trend: seedTrend() };
}

let db: Database | null = null;

export function getDb(): Database {
  db ??= load();
  return db;
}

export function persist() {
  if (!db) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ users: db.users, activity: db.activity }));
  } catch {
    // Storage full or blocked; the in-memory copy still works for this session.
  }
}

export function logActivity(actor: string, type: ActivityType, message: string) {
  getDb().activity.unshift({
    id: createId('act'),
    actor,
    type,
    message,
    timestamp: new Date().toISOString(),
  });
}

/** Restores the original seed data (used by tests and the Settings page). */
export function resetDb() {
  db = null;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
