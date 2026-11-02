export const ROLES = ['admin', 'editor', 'user'] as const;
export type Role = (typeof ROLES)[number];

export const DEPARTMENTS = ['Engineering', 'Sales', 'Marketing', 'Support', 'Finance', 'Operations'] as const;
export type Department = (typeof DEPARTMENTS)[number];

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  department: string;
  createdAt: string;
  lastActiveAt: string;
  /** Soft-delete marker: deleted users are hidden by default but can be restored. */
  deletedAt: string | null;
}

export type UserInput = Pick<User, 'name' | 'email' | 'role' | 'isActive'> & {
  department?: string;
};

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Credentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

export type SortDirection = 'asc' | 'desc';
export type UserSortField = 'name' | 'email' | 'role' | 'createdAt';
/** 'all' means every current member; deleted (soft-deleted) accounts are their own view. */
export type StatusFilter = 'all' | 'active' | 'inactive' | 'deleted';

export interface UsersQuery {
  page: number;
  pageSize: number;
  search: string;
  role: Role | 'all';
  status: StatusFilter;
  sortBy: UserSortField;
  sortDir: SortDirection;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

/** How many users each status view holds for the current search and role filter. */
export type StatusCounts = Record<StatusFilter, number>;

export interface UsersPage extends Paginated<User> {
  counts: StatusCounts;
}

export type MetricFormat = 'number' | 'currency' | 'percent';

export interface Metric {
  id: 'users' | 'revenue' | 'orders' | 'conversion';
  label: string;
  value: number;
  /** Percentage change vs the previous period of the same length; null when there is nothing to compare. */
  change: number | null;
  /** Which direction is good for this metric, so colour says good/bad rather than up/down. */
  goodDirection: 'up' | 'down';
  /** One short line naming the baseline or context, e.g. "vs previous 30 days". */
  caption: string;
  format: MetricFormat;
}

export interface RosterPerson {
  id: string;
  name: string;
  isActive: boolean;
}

export interface RosterGroup {
  department: string;
  people: RosterPerson[];
}

export type TrendRange = '7d' | '30d' | '90d';

export interface TrendPoint {
  date: string;
  revenue: number;
  orders: number;
}

export type ActivityType = 'create' | 'update' | 'delete' | 'restore' | 'login';

export interface Activity {
  id: string;
  actor: string;
  type: ActivityType;
  message: string;
  timestamp: string;
}

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  createdAt: string;
  read: boolean;
}
