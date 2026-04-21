import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

export async function findUserByEmail(email: string) {
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return user ?? null;
}

export async function updateUserName(userId: string, name: string | null) {
  const [updated] = await db.update(users).set({ name }).where(eq(users.id, userId)).returning();
  return updated ?? null;
}
