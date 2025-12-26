import {z} from 'zod';

export const githubUsernameSchema = z.object({
  username: z.string().nonempty('Username is required').min(1, 'Username cannot be empty').trim(),
});