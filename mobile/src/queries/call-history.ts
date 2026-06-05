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

export function prependCallHistoryEntry(newEntry: CallHistoryEntry) {
  queryClient.setQueryData<CallHistoryEntry[]>(
    callHistoryQueryOptions.queryKey,
    (current = []) => {
      const alreadyPresent = current.some(
        existing => existing.id === newEntry.id,
      );
      if (alreadyPresent) return current;

      return [newEntry, ...current].slice(0, HISTORY_CAP);
    },
  );
}
