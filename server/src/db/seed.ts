import { db } from './index';
import { users, contacts } from './schema';
import { eq } from 'drizzle-orm';

const seedUsers = Array.from({ length: 10 }, (_, i) => ({
  email: `test${i + 1}@example.com`,
  name: `Test User ${i + 1}`,
}));

// find or create owner
let [loginUser] = await db.select().from(users).where(eq(users.email, 'noldya@gmail.com')).limit(1);
if (!loginUser) {
  [loginUser] = await db
    .insert(users)
    .values({ email: 'noldya@gmail.com', name: 'Sasha' })
    .returning();
  console.log('Created noldya@gmail.com');
}

const inserted = await db.insert(users).values(seedUsers).onConflictDoNothing().returning();

if (inserted.length > 0) {
  await db
    .insert(contacts)
    .values(inserted.map((insertedUser) => ({ ownerId: loginUser.id, contactId: insertedUser.id })))
    .onConflictDoNothing();
}

console.log(`Seeded ${inserted.length} users and added them to noldya@gmail.com contacts`);
process.exit(0);
