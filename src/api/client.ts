export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const isTest = import.meta.env.MODE === 'test';

/** Simulates network latency so loading states are visible in the UI. */
export function latency(min = 250, max = 650): Promise<void> {
  if (isTest) return Promise.resolve();
  const ms = min + Math.random() * (max - min);
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Returns a deep copy so callers can never mutate the mock database directly. */
export function clone<T>(value: T): T {
  return structuredClone(value);
}
