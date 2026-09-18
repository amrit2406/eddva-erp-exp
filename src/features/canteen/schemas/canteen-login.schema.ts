import { z } from 'zod';

export const canteenLoginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type CanteenLoginFormData = z.infer<typeof canteenLoginSchema>;
