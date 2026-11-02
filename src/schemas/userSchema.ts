import { z } from 'zod';
import { DEPARTMENTS, ROLES } from '@/types';

export const userSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(60, 'Name must be 60 characters or fewer'),
  email: z.string().trim().min(1, 'Email is required').email('Invalid email address'),
  role: z.enum(ROLES, { error: 'Select a role' }),
  isActive: z.boolean(),
});

export type UserFormValues = z.infer<typeof userSchema>;

/** Multi-step wizard: each step validates only its own fields before advancing. */
export const wizardProfileSchema = userSchema.pick({ name: true, email: true }).extend({
  department: z.enum(DEPARTMENTS, { error: 'Select a department' }),
});

export const wizardAccessSchema = userSchema.pick({ role: true, isActive: true }).extend({
  sendInvite: z.boolean(),
});

export const wizardSchema = wizardProfileSchema.extend(wizardAccessSchema.shape).extend({
  confirmed: z.boolean().refine((value) => value, 'Please confirm the details are correct'),
});

export type WizardValues = z.infer<typeof wizardSchema>;
