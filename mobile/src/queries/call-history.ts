import { queryOptions } from '@tanstack/react-query';
import { api } from '../api';
import { useAuthStore } from '../stores/useAuthStore';
import type { CallHistoryEntry } from '../../../shared/types/calls';

async function fetchCallHistory(): Promise<CallHistoryEntry[]> {
  const token = await useAuthStore.getState().getValidAccessToken();
  return api.calls.getHistory(token);
}

export const callHistoryQueryOptions = queryOptions({
  queryKey: ['call-history'],
  queryFn: fetchCallHistory,
  staleTime: Infinity,
});
