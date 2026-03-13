import { db } from '../db';
import { contacts, users } from '../db/schema';
import { eq, and } from 'drizzle-orm';

export async function getContacts(ownerId: string) {
  return db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      addedAt: contacts.createdAt,
    })
    .from(contacts)
    .innerJoin(users, eq(contacts.contactId, users.id))
    .where(eq(contacts.ownerId, ownerId));
}

export async function addContact(ownerId: string, contactId: string) {
  const [row] = await db
    .insert(contacts)
    .values({ ownerId, contactId })
    .onConflictDoNothing()
    .returning();
  return row ?? null;
}

export async function removeContact(ownerId: string, contactId: string) {
  const [row] = await db
    .delete(contacts)
    .where(and(eq(contacts.ownerId, ownerId), eq(contacts.contactId, contactId)))
    .returning();
  return row ?? null;
}
