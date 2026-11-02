import { describe, expect, it } from 'vitest';
import { userSchema } from './userSchema';

describe('userSchema', () => {
  it('accepts a valid user', () => {
    const result = userSchema.safeParse({ name: 'Ada Lovelace', email: 'ada@example.com', role: 'admin', isActive: true });
    expect(result.success).toBe(true);
  });

  it('reports a readable message per invalid field', () => {
    const result = userSchema.safeParse({ name: 'A', email: 'not-an-email', role: 'owner', isActive: true });
    expect(result.success).toBe(false);
    const messages = Object.fromEntries(result.error!.issues.map((i) => [i.path[0], i.message]));
    expect(messages).toEqual({
      name: 'Name must be at least 2 characters',
      email: 'Invalid email address',
      role: 'Select a role',
    });
  });
});
