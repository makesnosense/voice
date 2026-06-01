import { queryOptions } from '@tanstack/react-query';
import { queryClient } from '../query-client';
import { api } from '../api';
import { useAuthStore } from '../stores/useAuthStore';
import type { CallHistoryEntry } from '../../../shared/types/calls';

const HISTORY_CAP = 20;

async function fetchCallHistory(): Promise<CallHistoryEntry[]> {
  const token = await useAuthStore.getState().getValidAccessToken();
  return api.calls.getHistory(token);
}

export const callHistoryQueryOptions = queryOptions({
  queryKey: ['call-history'],
  queryFn: fetchCallHistory,
  staleTime: Infinity,
});

export function prependCallHistoryEntry(entry: CallHistoryEntry) {
  queryClient.setQueryData<CallHistoryEntry[]>(
    callHistoryQueryOptions.queryKey,
    (current = []) => [entry, ...current].slice(0, HISTORY_CAP),
  );
}
