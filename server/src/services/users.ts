import { db } from '../db';
import { users, contacts } from '../db/schema';
import { sql, eq } from 'drizzle-orm';
import { getCallHistory } from './calls';
import { getContacts } from './contacts';

export async function findUserByEmail(email: string) {
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return user ?? null;
}

export async function findUserById(userId: string) {
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  return user ?? null;
}

export async function updateUserName(userId: string, name: string | null) {
  const [updated] = await db.update(users).set({ name }).where(eq(users.id, userId)).returning();
  return updated ?? null;
}

export async function deleteUser(userId: string) {
  const [deleted] = await db.delete(users).where(eq(users.id, userId)).returning({ id: users.id });
  return deleted ?? null;
}

export async function exportUserData(userId: string) {
  const profile = await findUserById(userId);
  if (!profile) return null;

  const [userContacts, callHistory] = await Promise.all([
    getContacts(userId),
    getCallHistory(userId),
  ]);

  return {
    exportedAt: new Date().toISOString(),
    profile: profile,
    contacts: userContacts,
    callHistory,
  };
}
