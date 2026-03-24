import { db } from '../db';
import { contacts, users } from '../db/schema';
import { eq, and, sql } from 'drizzle-orm';

const hasMobileDevice = sql<boolean>`exists (
  select 1 from devices
  where devices.user_id = ${users.id}
  and devices.platform in ('android', 'ios')
)`;

export async function getContacts(ownerId: string) {
  return db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      addedAt: contacts.createdAt,
      hasMobileDevice,
    })
    .from(contacts)
    .innerJoin(users, eq(contacts.contactId, users.id))
    .where(eq(contacts.ownerId, ownerId));
}

export async function getContact(ownerId: string, contactId: string) {
  const [row] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      addedAt: contacts.createdAt,
      hasMobileDevice,
    })
    .from(contacts)
    .innerJoin(users, eq(contacts.contactId, users.id))
    .where(and(eq(contacts.ownerId, ownerId), eq(contacts.contactId, contactId)));

  return row ?? null;
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
