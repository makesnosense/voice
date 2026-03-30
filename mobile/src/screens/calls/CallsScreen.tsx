import { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import RejoinCard from './RejoinCard';
import { useShallow } from 'zustand/react/shallow';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../stores/useAuthStore';
import { api } from '../../api';
import CallRow from './CallRow';
import { useCallHistoryStore } from '../../stores/useCallHistoryStore';
import { CALL_DIRECTION } from '../../../../shared/constants/calls';
import { useRejoinStore } from '../../stores/useRejoinStore';
import { memo } from 'react';
import type { CallHistoryEntry } from '../../../../shared/types/calls';
import type { RoomId } from '../../../../shared/types/core';

function CallSeparator() {
  return <View style={styles.separator} />;
}

interface CallsScreenProps {
  onCall: (roomId: RoomId) => void;
}

function CallsScreen({ onCall }: CallsScreenProps) {
  const insets = useSafeAreaInsets();
  const getValidAccessToken = useAuthStore(state => state.getValidAccessToken);
  const lastRoomId = useRejoinStore(state => state.lastRoomId);

  const { history, isLoading, fetchHistory, prependEntry } =
    useCallHistoryStore(
      useShallow(state => ({
        history: state.history,
        isLoading: state.isLoading,
        fetchHistory: state.fetchHistory,
        prependEntry: state.prependEntry,
      })),
    );

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  useEffect(() => {
    if (!lastRoomId) return;
    api.rooms.checkAlive(lastRoomId).then(({ alive }) => {
      if (!alive) useRejoinStore.setState({ lastRoomId: null });
    });
  }, [lastRoomId]);

  const handleCall = async (entry: CallHistoryEntry) => {
    try {
      const token = await getValidAccessToken();
      const { roomId } = await api.calls.create(entry.contactId, token);
      prependEntry({
        direction: CALL_DIRECTION.OUTGOING,
        contactId: entry.contactId,
        contactEmail: entry.contactEmail,
        contactName: entry.contactName,
      });
      onCall(roomId);
    } catch (error) {
      console.error('❌ Failed to initiate call:', error);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Calls</Text>
      </View>

      {lastRoomId && <RejoinCard roomId={lastRoomId} onPress={onCall} />}

      {isLoading && history.length === 0 && (
        <ActivityIndicator style={styles.loader} color="#94a3b8" />
      )}

      {!isLoading && history.length === 0 && (
        <Text style={styles.empty}>No past calls</Text>
      )}

      <FlatList
        data={history}
        keyExtractor={entry => entry.id}
        renderItem={({ item }) => (
          <CallRow entry={item} onPress={() => handleCall(item)} />
        )}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={CallSeparator}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.3,
  },
  loader: {
    marginTop: 48,
  },
  empty: {
    textAlign: 'center',
    marginTop: 80,
    color: '#94a3b8',
    fontSize: 15,
  },
  list: {
    paddingTop: 8,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#e2e8f0',
    marginLeft: 58,
  },
});

export default memo(CallsScreen);
