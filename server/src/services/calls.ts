import { sendCallNotification } from '../utils/fcm';
import { db } from '../db';
import { calls } from '../db/schema';
import { sql } from 'drizzle-orm';

import type { RoomId } from '../../../shared/types/core';
import type { CallDirection } from '../../../shared/constants/calls';
import type { CallHistoryEntry } from '../../../shared/types/calls';

export async function notifyDevicesOfCall(
  caller: { userId: string; email: string; name: string | null },
  devices: { fcmToken: string | null }[],
  roomId: RoomId
): Promise<void> {
  await Promise.allSettled(
    devices.map((device) =>
      sendCallNotification(device.fcmToken!, {
        callerUserId: caller.userId,
        callerEmail: caller.email,
        callerName: caller.name,
        roomId,
      })
    )
  );
}

export async function createCallsLogEntry(fromUserId: string, toUserId: string) {
  await db.insert(calls).values({ fromUserId, toUserId });
}

export async function getCallHistory(userId: string) {
  const rows = await db.execute(sql`
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
    LIMIT 20
  `);

  return rows.map(mapCallHistoryRow);
}

function mapCallHistoryRow(row: Record<string, unknown>): CallHistoryEntry {
  return {
    id: row.id as string,
    createdAt: row.created_at as string,
    direction: row.direction as CallDirection,
    contactId: row.contact_id as string,
    contactEmail: row.contact_email as string,
    contactName: row.contact_name as string | null,
  };
}
