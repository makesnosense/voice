import { useEffect } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { queryClient } from '../query-client';
import { contactsQueryOptions } from '../queries/contacts';
import {
  callHistoryQueryOptions,
  prependCallHistoryEntry,
} from '../queries/call-history';
import { drainDismissedCallLogsQueue } from '../native/dismissed-call-logs-queue';
import { CALL_DIRECTION } from '../../../shared/constants/calls';
import NativeCallDismissedEventEmitterAndroid from '../native/specs/NativeCallDismissedEventEmitterAndroid';
import { subscribeCallDismissedIos } from '../native/voip-callkit-ios';
import type { Contact } from '../../../shared/types/contacts';
import { Platform as RNPlatform } from 'react-native';

function someDismissedCallersAreNotInContacts(
  entries: { callerUserId: string }[],
  contacts: Contact[],
): boolean {
  const contactIds = new Set(contacts.map(contact => contact.id));
  return entries.some(entry => !contactIds.has(entry.callerUserId));
}

function prependDismissedCallLogs() {
  const entries = drainDismissedCallLogsQueue();
  if (entries.length === 0) return;

  const cachedContacts =
    queryClient.getQueryData<Contact[]>(contactsQueryOptions.queryKey) ?? [];

  const callHistoryRefetchNeeded = someDismissedCallersAreNotInContacts(
    entries,
    cachedContacts,
  );

  if (callHistoryRefetchNeeded) {
    queryClient.invalidateQueries({
      queryKey: callHistoryQueryOptions.queryKey,
    });
    return;
  }

  for (const entry of entries) {
    const contact = cachedContacts.find(c => c.id === entry.callerUserId);

    prependCallHistoryEntry({
      id: entry.callId,
      createdAt: entry.createdAt,
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
    if (RNPlatform.OS === 'ios') {
      const subscription = subscribeCallDismissedIos(prependDismissedCallLogs);
      return () => subscription.remove();
    }

    if (RNPlatform.OS === 'android') {
      if (!NativeCallDismissedEventEmitterAndroid) {
        throw new Error(
          'NativeCallDismissedEventEmitterAndroid native module missing on Android',
        );
      }

      const subscription =
        NativeCallDismissedEventEmitterAndroid.onCallDismissed(
          prependDismissedCallLogs,
        );
      return () => subscription.remove();
    }
  }, []);
}
