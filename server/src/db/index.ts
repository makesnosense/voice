import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const client = postgres(connectionString);
export const db = drizzle(client, { schema });

export async function runMigrations(): Promise<void> {
  // separate single-connection client just for migrations
  const migrationClient = postgres(connectionString!, { max: 1 });
  await migrate(drizzle(migrationClient), {
    migrationsFolder: new URL('../../drizzle', import.meta.url).pathname,
  });
  await migrationClient.end();
}
