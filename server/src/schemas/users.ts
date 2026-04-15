import { z } from 'zod';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

export const byEmailSchema = z.object({ email: z.email() });

export const updateNameSchema = z.object({
  name: z
    .string()
    .max(40)
    .trim()
    .transform((val) => (val.length > 0 ? val : null)),
});

export async function updateUserName(userId: string, name: string | null) {
  const [updated] = await db.update(users).set({ name }).where(eq(users.id, userId)).returning();
  return updated ?? null;
}
