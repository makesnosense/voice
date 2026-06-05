import { createMMKV } from 'react-native-mmkv';
import type { CallOutcome } from '../../../shared/constants/calls';

const storage = createMMKV({ id: 'dismissed-call-logs' });
const QUEUE_KEY = 'queue';

interface DismissedCallEntry {
  callId: string;
  callerUserId: string;
  callerEmail: string;
  callerName: string | null;
  createdAt: number;
  outcome: CallOutcome;
}

export function drainDismissedCallLogsQueue(): DismissedCallEntry[] {
  const raw = storage.getString(QUEUE_KEY);
  if (!raw) return [];

  storage.remove(QUEUE_KEY);

  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}
