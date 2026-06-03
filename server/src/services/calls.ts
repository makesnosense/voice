import { sendCallNotification } from '../utils/fcm';
import { db } from '../db';
import { calls } from '../db/schema';
import { and, eq, sql } from 'drizzle-orm';

import type { RoomId } from '../../../shared/types/core';
import { CALL_OUTCOME, CallOutcome, type CallDirection } from '../../../shared/constants/calls';
import type { CallHistoryEntry } from '../../../shared/types/calls';

export async function notifyDevicesOfCall(
  caller: { userId: string; email: string; name: string | null },
  fcmTokens: string[],
  roomId: RoomId,
  callId: string
): Promise<void> {
  const sentAt = Date.now();
  await Promise.allSettled(
    fcmTokens.map((token) =>
      sendCallNotification(token, {
        callerUserId: caller.userId,
        callerEmail: caller.email,
        callerName: caller.name,
        roomId,
        callId,
        sentAt,
      })
    )
  );
}

export async function createCallsLogEntry(fromUserId: string, toUserId: string) {
  const [entry] = await db.insert(calls).values({ fromUserId, toUserId }).returning();
  return entry;
}

export async function getCallHistory(userId: string) {
  const rows = await db.execute(sql`
            WITH outgoing_calls_for_user AS (
          SELECT calls.id,
                 calls.created_at,
                 calls.outcome,
                 'outgoing' AS direction,
                 users.id AS contact_id,
                 users.email AS contact_email,
                 users.name  AS contact_name
            FROM calls
            JOIN users ON users.id = calls.to_user_id
           WHERE calls.from_user_id = ${userId}
                 ),
           
                 incoming_calls_for_user AS (
          SELECT calls.id, 
                 calls.created_at,
                 calls.outcome,
                 'incoming' AS direction,
                 users.id AS contact_id,
                 users.email AS contact_email,
                 users.name AS contact_name
            FROM calls
            JOIN users ON users.id = calls.from_user_id
           WHERE calls.to_user_id = ${userId}),

                 all_calls_for_user AS (
          SELECT * 
            FROM outgoing_calls_for_user
           UNION ALL
          SELECT * 
            FROM incoming_calls_for_user
        ORDER BY created_at DESC
                 )
          SELECT *, 
                 EXISTS (SELECT 1 
                           FROM devices
                          WHERE devices.user_id = all_calls_for_user.contact_id
                            AND devices.platform in ('android', 'ios')) AS has_mobile_device
                           FROM all_calls_for_user
  `);

  return rows.map(mapCallHistoryRow);
}

export async function markCallAnswered(callId: string, toUserId: string) {
  const [updated] = await db
    .update(calls)
    .set({ outcome: CALL_OUTCOME.ANSWERED })
    .where(
      and(
        eq(calls.id, callId),
        eq(calls.toUserId, toUserId),
        eq(calls.outcome, CALL_OUTCOME.NO_ANSWER)
      )
    )
    .returning({ id: calls.id });
  return updated;
}

function mapCallHistoryRow(row: Record<string, unknown>): CallHistoryEntry {
  return {
    id: row.id as string,
    createdAt: row.created_at as string,
    direction: row.direction as CallDirection,
    outcome: row.outcome as CallOutcome,
    contactId: row.contact_id as string,
    contactEmail: row.contact_email as string,
    contactName: row.contact_name as string | null,
    contactHasMobileDevice: row.has_mobile_device as boolean,
  };
}
