import { z } from 'zod';

export const addContactSchema = z.object({
  email: z.email(),
});

export const contactIdSchema = z.object({
  contactId: z.uuid(),
});
