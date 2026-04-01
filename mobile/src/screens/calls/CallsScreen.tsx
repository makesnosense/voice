import { memo, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCallHistoryStore } from '../../stores/useCallHistoryStore';
import CallRow from './CallRow';
import RejoinCard from './RejoinCard';
import Header from '../../components/Header';
import { startCall } from '../../utils/start-call';
import type { CallHistoryEntry } from '../../../../shared/types/calls';
import type { RoomId } from '../../../../shared/types/core';

interface CallsScreenProps {
  onCall: (roomId: RoomId) => void;
}

function CallsScreen({ onCall }: CallsScreenProps) {
  const insets = useSafeAreaInsets();

  const { history, isLoading, fetchHistory } = useCallHistoryStore(
    useShallow(state => ({
      history: state.history,
      isLoading: state.isLoading,
      fetchHistory: state.fetchHistory,
    })),
  );

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleCall = (entry: CallHistoryEntry) =>
    startCall(
      {
        contactId: entry.contactId,
        contactEmail: entry.contactEmail,
        contactName: entry.contactName,
      },
      onCall,
    );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header title="Calls" />

      <RejoinCard onPress={onCall} />

      {isLoading && history.length === 0 && (
        <ActivityIndicator style={styles.loader} color="#94a3b8" />
      )}

      {!isLoading && history.length === 0 && (
        <Text style={styles.empty}>No past calls</Text>
      )}

      <ScrollView contentContainerStyle={styles.list}>
        {history.map((entry, index) => (
          <View key={entry.id}>
            {index > 0 && <View style={styles.separator} />}
            <CallRow entry={entry} onPress={() => handleCall(entry)} />
          </View>
        ))}
      </ScrollView>
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
