import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  timestamp,
  boolean,
  primaryKey,
} from 'drizzle-orm/pg-core';
import { ObjectValues } from '../../../shared/types';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const refreshTokens = pgTable('refresh_tokens', {
  jti: uuid('jti').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const otpCodes = pgTable('otp_codes', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull(),
  code: varchar('code', { length: 6 }).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const PLATFORM = {
  WEB: 'web',
  IOS: 'ios',
  ANDROID: 'android',
} as const;

export type Platform = ObjectValues<typeof PLATFORM>;

export const platformEnum = pgEnum('platform', [PLATFORM.WEB, PLATFORM.IOS, PLATFORM.ANDROID]);

export const devices = pgTable('devices', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  platform: platformEnum('platform').notNull(),

  refreshTokenJti: uuid('refresh_token_jti')
    .notNull()
    .references(() => refreshTokens.jti, { onDelete: 'cascade' }),

  // push notification tokens (NULL for web)
  fcmToken: varchar('fcm_token', { length: 255 }),
  voipPushToken: varchar('voip_push_token', { length: 255 }),

  // metadata
  deviceName: varchar('device_name', { length: 100 }),
  lastSeen: timestamp('last_seen').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
