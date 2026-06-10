import { db } from './index';
import { users, contacts, refreshTokens, devices } from './schema';
import { eq } from 'drizzle-orm';
import { PLATFORM } from './schema';

const namedUsers = [
  { email: 'choi@voice.k.vu', name: 'Choi', deviceName: 'iPhone 14 Pro' },
  { email: 'link@voice.k.vu', name: 'Link', deviceName: 'iPhone 15' },
  { email: 'mouse@voice.k.vu', name: 'Mouse', deviceName: 'iPhone 13' },
  { email: 'whiterabbitgirl@voice.k.vu', name: 'Dujour', deviceName: 'iPhone 15 Pro Max' },
  { email: 'tank@voice.k.vu', name: 'Tank', deviceName: 'iPhone 12 Pro' },
  { email: 'zee@voice.k.vu', name: 'Zee', deviceName: 'iPhone 14' },
  { email: 'cas@voice.k.vu', name: 'Cas', deviceName: 'iPhone 13 Pro' },
  { email: 'dozer@voice.k.vu', name: 'Dozer', deviceName: 'iPhone 11' },
  { email: 'apoc@voice.k.vu', name: 'Apoc', deviceName: 'iPhone 13 Mini' },
];

// find or create owner
let [loginUser] = await db.select().from(users).where(eq(users.email, 'noldya@gmail.com')).limit(1);
if (!loginUser) {
  [loginUser] = await db
    .insert(users)
    .values({ email: 'noldya@gmail.com', name: 'Sasha' })
    .returning();
  console.log('Created noldya@gmail.com');
}

for (const { email, name, deviceName } of namedUsers) {
  const [newUser] = await db
    .insert(users)
    .values({ email, name })
    .onConflictDoNothing()
    .returning();

  if (newUser) {
    const [token] = await db.insert(refreshTokens).values({ userId: newUser.id }).returning();
    await db.insert(devices).values({
      jti: token.jti,
      userId: newUser.id,
      platform: PLATFORM.IOS,
      deviceName,
    });
    console.log(`Created ${email} with ${deviceName}`);
  } else {
    console.log(`${email} already exists, skipping`);
  }

  const userId =
    newUser?.id ??
    (await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1))[0].id;

  await db
    .insert(contacts)
    .values({ ownerId: loginUser.id, contactId: userId })
    .onConflictDoNothing();
}

console.log('Done');
process.exit(0);
