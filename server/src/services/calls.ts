import { sendCallNotification } from '../utils/fcm';
import { db } from '../db';
import { calls } from '../db/schema';
import { sql } from 'drizzle-orm';

import type { RoomId } from '../../../shared/types/core';

export async function notifyDevicesOfCall(
  callerEmail: string,
  devices: { fcmToken: string | null }[],
  roomId: RoomId
): Promise<void> {
  await Promise.allSettled(
    devices.map((device) =>
      sendCallNotification(device.fcmToken!, {
        callerEmail,
        callerName: null,
        roomId,
      })
    )
  );
}

export async function createCallsLogEntry(fromUserId: string, toUserId: string) {
  await db.insert(calls).values({ fromUserId, toUserId });
}

export async function getCallHistory(userId: string) {
  const result = await db.execute(sql`
    WITH outgoing_calls_for_user AS (
      SELECT
        calls.id,
        calls.created_at,
        'outgoing' AS direction,
        users.id    AS contact_id,
        users.email AS contact_email,
        users.name  AS contact_name
      FROM calls
      JOIN users ON users.id = calls.to_user_id
      WHERE calls.from_user_id = ${userId}
    ),
    incoming_calls_for_user AS (
      SELECT
        calls.id,
        calls.created_at,
        'incoming' AS direction,
        users.id    AS contact_id,
        users.email AS contact_email,
        users.name  AS contact_name
      FROM calls
      JOIN users ON users.id = calls.from_user_id
      WHERE calls.to_user_id = ${userId}
    )
    SELECT * FROM outgoing_calls_for_user
    UNION ALL
    SELECT * FROM incoming_calls_for_user
    ORDER BY created_at DESC
    LIMIT 10
  `);

  return result;
}
