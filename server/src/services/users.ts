import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { getCallHistory } from './calls';
import { getContacts } from './contacts';
import type { DataExport } from '../../../shared/types/core';

export async function findUserByEmail(email: string) {
  const [user] = await db
    .select({ id: users.id, email: users.email, name: users.name })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
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

export async function exportUserData(userId: string): Promise<DataExport | null> {
  const profile = await findUserById(userId);
  if (!profile) return null;

  const [userContacts, callHistory] = await Promise.all([
    getContacts(userId),
    getCallHistory(userId),
  ]);

  return {
    exportedAt: new Date().toISOString(),
    profile: {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      createdAt: profile.createdAt.toISOString(),
    },
    contacts: userContacts,
    callHistory,
  };
}
