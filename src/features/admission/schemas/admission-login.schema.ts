import { z } from 'zod';

export const admissionLoginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  institute_id: z.string().optional(),
});

export type AdmissionLoginFormData = z.infer<typeof admissionLoginSchema>;
