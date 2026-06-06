import { useEffect } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { queryClient } from '../query-client';
import { contactsQueryOptions } from '../queries/contacts';
import { prependCallHistoryEntry } from '../queries/call-history';
import { drainDismissedCallLogsQueue } from '../native/dismissed-call-logs-queue';
import { CALL_DIRECTION } from '../../../shared/constants/calls';
import NativeDismissedCallEvents from '../native/specs/NativeDismissedCallEvents';
import type { Contact } from '../../../shared/types/contacts';

function prependDismissedCallLogs() {
  const entries = drainDismissedCallLogsQueue();
  if (entries.length === 0) return;

  const cachedContacts =
    queryClient.getQueryData<Contact[]>(contactsQueryOptions.queryKey) ?? [];

  for (const entry of entries) {
    const contact = cachedContacts.find(c => c.id === entry.callerUserId);
    prependCallHistoryEntry({
      id: entry.callId,
      createdAt: new Date(entry.createdAt).toISOString(),
      direction: CALL_DIRECTION.INCOMING,
      outcome: entry.outcome,
      contactId: entry.callerUserId,
      contactEmail: entry.callerEmail,
      contactName: entry.callerName,
      contactHasMobileDevice: contact?.hasMobileDevice ?? true,
    });
  }
}

export function useDismissedCallLogs() {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) return;
    queryClient
      .ensureQueryData(contactsQueryOptions)
      .catch(() => {})
      .finally(prependDismissedCallLogs);
  }, [isAuthenticated]);

  useEffect(() => {
    const subscription = NativeDismissedCallEvents.onCallDismissed(
      prependDismissedCallLogs,
    );
    return () => subscription.remove();
  }, []);
}
