import { DEPARTMENTS, ROLES, type Activity, type ActivityType, type TrendPoint, type User } from '@/types';

/** Deterministic PRNG so the demo data is identical on every machine. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FIRST = ['Amara', 'Ben', 'Chen', 'Dilani', 'Elena', 'Farah', 'Gabriel', 'Hiro', 'Isla', 'Jonah', 'Kavya', 'Liam', 'Maya', 'Nuwan', 'Olivia', 'Priya', 'Quinn', 'Ravi', 'Sofia', 'Tariq', 'Uma', 'Victor', 'Wen', 'Yasmin', 'Zane'];
const LAST = ['Perera', 'Smith', 'Fernando', 'Garcia', 'Nakamura', 'Silva', 'Okafor', 'Müller', 'Khan', 'Johnson', 'Rossi', 'Dubois', 'Kim', 'Jayasuriya', 'Novak'];

const DAY = 86_400_000;

export function seedUsers(count = 124, now = Date.now()): User[] {
  const rand = mulberry32(42);
  const pick = <T,>(list: readonly T[]) => list[Math.floor(rand() * list.length)]!;
  const used = new Set<string>();

  return Array.from({ length: count }, (_, i) => {
    let first = pick(FIRST);
    let last = pick(LAST);
    while (used.has(`${first} ${last}`)) {
      first = pick(FIRST);
      last = pick(LAST);
    }
    used.add(`${first} ${last}`);
    const createdAt = new Date(now - Math.floor(rand() * 400 + 1) * DAY);
    const role = rand() < 0.12 ? ROLES[0] : rand() < 0.35 ? ROLES[1] : ROLES[2];
    return {
      id: `usr_${(i + 1).toString().padStart(4, '0')}`,
      name: `${first} ${last}`,
      email: `${first}.${last}`.toLowerCase().replace(/[^a-z.]/g, '') + '@example.com',
      role,
      isActive: rand() > 0.18,
      department: pick(DEPARTMENTS),
      createdAt: createdAt.toISOString(),
      lastActiveAt: new Date(now - Math.floor(rand() * 20 * DAY)).toISOString(),
      deletedAt: null,
    };
  });
}

export function seedTrend(days = 90, now = Date.now()): TrendPoint[] {
  const rand = mulberry32(7);
  let revenue = 8200;
  return Array.from({ length: days }, (_, i) => {
    const date = new Date(now - (days - 1 - i) * DAY);
    const weekend = date.getDay() === 0 || date.getDay() === 6;
    revenue = Math.max(4000, revenue + (rand() - 0.42) * 900);
    const dayRevenue = Math.round(revenue * (weekend ? 0.72 : 1));
    return {
      date: date.toISOString().slice(0, 10),
      revenue: dayRevenue,
      orders: Math.round(dayRevenue / (68 + rand() * 14)),
    };
  });
}

const ACTIVITY_TEMPLATES: [ActivityType, (target: string) => string][] = [
  ['create', (t) => `created user ${t}`],
  ['update', (t) => `updated the role of ${t}`],
  ['update', (t) => `deactivated ${t}`],
  ['delete', (t) => `deleted user ${t}`],
  ['restore', (t) => `restored user ${t}`],
  ['login', () => 'signed in'],
];

export function seedActivity(users: User[], count = 500, now = Date.now()): Activity[] {
  const rand = mulberry32(1337);
  let timestamp = now - 2 * 60_000;
  return Array.from({ length: count }, (_, i) => {
    const [type, message] = ACTIVITY_TEMPLATES[Math.floor(rand() * ACTIVITY_TEMPLATES.length)]!;
    const actor = users[Math.floor(rand() * 10)]!.name;
    const target = users[Math.floor(rand() * users.length)]!.name;
    timestamp -= Math.floor(rand() * 90 + 5) * 60_000;
    return {
      id: `act_${i + 1}`,
      actor,
      type,
      message: message(target),
      timestamp: new Date(timestamp).toISOString(),
    };
  });
}
