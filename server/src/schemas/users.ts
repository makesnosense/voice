import { z } from 'zod';

export const byEmailSchema = z.object({
  email: z.email().transform((email) => email.toLowerCase()),
});

export const updateNameSchema = z.object({
  name: z
    .string()
    .max(40)
    .trim()
    .transform((val) => (val.length > 0 ? val : null)),
});
