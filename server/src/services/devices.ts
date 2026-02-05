import { devices, refreshTokens } from '../db/schema';
import { db } from '../db';
import { eq, and, desc } from 'drizzle-orm';
import type { Platform } from '../db/schema';

export async function findDeviceByRefreshJti(jti: string) {
  const [device] = await db.select().from(devices).where(eq(devices.jti, jti)).limit(1);

  return device;
}

export async function createDevice(
  jti: string,
  userId: string,
  platform: Platform,
  deviceName?: string,
  fcmToken?: string,
  voipPushToken?: string
) {
  const [device] = await db
    .insert(devices)
    .values({
      jti, // primary key
      userId,
      platform,
      deviceName: deviceName || null,
      fcmToken: fcmToken || null,
      voipPushToken: voipPushToken || null,
    })
    .returning();

  return device;
}

export async function updateDevice(
  jti: string,
  userId: string,
  platform?: Platform,
  deviceName?: string,
  fcmToken?: string,
  voipPushToken?: string
) {
  const updateData: Partial<typeof devices.$inferInsert> = { lastSeen: new Date() };

  if (platform !== undefined) updateData.platform = platform;
  if (deviceName !== undefined) updateData.deviceName = deviceName || null;
  if (fcmToken !== undefined) updateData.fcmToken = fcmToken || null;
  if (voipPushToken !== undefined) updateData.voipPushToken = voipPushToken || null;

  const [updated] = await db
    .update(devices)
    .set(updateData)
    .where(and(eq(devices.jti, jti), eq(devices.userId, userId)))

    .returning();

  return updated;
}

export async function getUserDevices(userId: string) {
  const userDevices = await db
    .select({
      jti: devices.jti,
      platform: devices.platform,
      deviceName: devices.deviceName,
      lastSeen: devices.lastSeen,
      createdAt: devices.createdAt,
    })
    .from(devices)
    .where(eq(devices.userId, userId))
    .orderBy(desc(devices.lastSeen));

  return userDevices;
}
