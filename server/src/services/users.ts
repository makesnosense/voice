import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

export async function findUserByEmail(email: string) {
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return user ?? null;
}
