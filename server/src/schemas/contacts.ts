import { z } from 'zod';

export const addContactSchema = z.object({
  email: z.email().transform((email) => email.toLowerCase()),
});

export const contactIdSchema = z.object({
  contactId: z.uuid(),
});
