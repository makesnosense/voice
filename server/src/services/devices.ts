import { devices, refreshTokens } from '../db/schema';
import { db } from '../db';
import { eq, and, desc, inArray, isNotNull, or } from 'drizzle-orm';
import { PLATFORM } from '../db/schema';
import type { Platform } from '../db/schema';
import type { Device } from '../../../shared/types/devices';

export async function findDeviceByRefreshJti(jti: string) {
  const [device] = await db.select().from(devices).where(eq(devices.jti, jti)).limit(1);

  return device;
}

function mapDeviceRow(row: {
  jti: string;
  platform: Platform;
  deviceName: string | null;
  lastSeen: Date;
  createdAt: Date;
}): Device {
  return {
    jti: row.jti,
    platform: row.platform,
    deviceName: row.deviceName,
    lastSeen: row.lastSeen.toISOString(),
    createdAt: row.createdAt.toISOString(),
  };
}

export async function createDevice(
  jti: string,
  userId: string,
  platform: Platform,
  deviceName?: string,
  fcmToken?: string,
  voipPushToken?: string
): Promise<Device> {
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

  return mapDeviceRow(device);
}

export async function updateDevice(
  jti: string,
  userId: string,
  platform?: Platform,
  deviceName?: string,
  fcmToken?: string,
  voipPushToken?: string
): Promise<Device | null> {
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

  return updated ? mapDeviceRow(updated) : null;
}

export async function getUserDevices(userId: string): Promise<Device[]> {
  const rows = await db
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

  return rows.map(mapDeviceRow);
}

export async function getUserMobileDevicesPushTokens(userId: string) {
  const rows = await db
    .select({
      fcmToken: devices.fcmToken,
      voipPushToken: devices.voipPushToken,
    })
    .from(devices)
    .where(
      and(
        eq(devices.userId, userId),
        inArray(devices.platform, [PLATFORM.ANDROID, PLATFORM.IOS]),
        or(isNotNull(devices.fcmToken), isNotNull(devices.voipPushToken))
      )
    )
    .orderBy(desc(devices.lastSeen));

  const fcmTokens: string[] = [];
  const voipPushTokens: string[] = [];

  for (const { fcmToken, voipPushToken } of rows) {
    if (fcmToken !== null) fcmTokens.push(fcmToken);
    if (voipPushToken !== null) voipPushTokens.push(voipPushToken);
  }

  return { fcmTokens, voipPushTokens };
}
