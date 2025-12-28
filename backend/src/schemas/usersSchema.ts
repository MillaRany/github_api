import { z } from 'zod';
import { UserRole } from '../types';

export const createUserRequestSchema = z.object({
  name: z.string()
    .min(2, 'Name too short')
    .max(100, 'Name too long'),
  email: z.email('Invalid email')
    .max(255, 'Email too long'),
  password: z.string()
    .min(6, 'Password too short')
    .max(128, 'Password too long'),
  role: z.enum(UserRole, { message: 'Invalid role' })
});

export const deleteUserParamsSchema = z.object({
  id: z.string()
    .regex(/^\d+$/, 'ID must be a number')
    .transform(Number)
});