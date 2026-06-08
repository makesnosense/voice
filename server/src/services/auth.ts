import { db } from '../db';
import { otpCodes, users } from '../db/schema';
import { eq, and, gt } from 'drizzle-orm';

export async function findValidOtp(email: string, code: string) {
  const [otpRecord] = await db
    .select()
    .from(otpCodes)
    .where(
      and(eq(otpCodes.email, email), eq(otpCodes.code, code), gt(otpCodes.expiresAt, new Date()))
    )
    .limit(1);

  return otpRecord ?? null;
}

export async function deleteOtpById(id: string) {
  await db.delete(otpCodes).where(eq(otpCodes.id, id));
}

export async function findOrCreateUserForEmail(email: string) {
  const [existingUser] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existingUser) return existingUser;

  const [newUser] = await db.insert(users).values({ email }).returning();
  return newUser;
}
