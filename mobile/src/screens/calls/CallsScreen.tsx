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
import { startCall } from '../../utils/start-call';
import CallRow from './CallRow';
import RejoinCard from './RejoinCard';
import Header from '../../components/Header';
import CreateRoomButton from '../../components/CreateRoomButton';
import { TEXT_MUTED } from '../../styles/colors';

function CallsScreen() {
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

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header title="Calls" />

      <RejoinCard />

      {isLoading && history.length === 0 && (
        <ActivityIndicator style={styles.loader} color="#94a3b8" />
      )}

      <ScrollView contentContainerStyle={styles.list}>
        <CreateRoomButton style={styles.createRoomButton} />
        {!isLoading && history.length === 0 && (
          <Text style={styles.empty}>No past calls</Text>
        )}

        {history.map(entry => (
          <View key={entry.id}>
            <View style={styles.separator} />
            <CallRow
              entry={entry}
              onPress={() =>
                startCall({
                  contactId: entry.contactId,
                  contactEmail: entry.contactEmail,
                  contactName: entry.contactName,
                })
              }
            />
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
  loader: {
    marginTop: 48,
  },
  list: {
    paddingTop: 8,
  },
  createRoomButton: {
    marginHorizontal: 16,
    marginBottom: 4,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#e2e8f0',
    marginLeft: 58,
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    color: TEXT_MUTED,
    fontSize: 15,
  },
});

export default memo(CallsScreen);
