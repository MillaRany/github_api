import { z } from 'zod';
import { UserRole } from '../types';

export const deleteUserRequestSchema = z.object({
  userId: z.string().uuid(),
});

export const createUserRequestSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.nativeEnum(UserRole, { message: 'Invalid role' })
});

export const deleteUserParamsSchema = z.object({
  id: z.string()
    .regex(/^\d+$/, 'ID must be a number')
    .transform(Number)
});