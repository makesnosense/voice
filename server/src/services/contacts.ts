import { db } from '../db';
import { contacts, users } from '../db/schema';
import { eq, and, sql } from 'drizzle-orm';
import type { Contact } from '../../../shared/types/contacts';

const hasMobileDevice = sql<boolean>`EXISTS(
  SELECT 1 FROM devices
   WHERE devices.user_id = ${users.id}
     AND devices.platform in ('android', 'ios')
)`;

function mapContactRow(row: {
  id: string;
  email: string;
  name: string | null;
  addedAt: Date;
  hasMobileDevice: boolean;
}): Contact {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    addedAt: row.addedAt.toISOString(),
    hasMobileDevice: row.hasMobileDevice,
  };
}

export async function getContacts(ownerId: string): Promise<Contact[]> {
  const rows = await db
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

  return rows.map(mapContactRow);
}

export async function getContact(ownerId: string, contactId: string): Promise<Contact | null> {
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

  return row ? mapContactRow(row) : null;
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
