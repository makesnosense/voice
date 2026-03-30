import { useState, useCallback, useEffect } from 'react';
import { api } from '../api';
import { useRejoinStore } from '../stores/useRejoinStore';
import { View, StyleSheet } from 'react-native';
import ContactsScreen from './contacts-screen/ContactsScreen';
import CallsScreen from './calls/CallsScreen';
import SettingsScreen from './SettingsScreen';
import NavigationBar, {
  HOME_TAB,
  type HomeTab,
} from '../components/NavigationBar';
import type { RoomId } from '../../../shared/types/core';

interface HomeScreenProps {
  onCall: (roomId: RoomId) => void;
}

export default function HomeScreen({ onCall }: HomeScreenProps) {
  const [activeTab, setActiveTab] = useState<HomeTab>(HOME_TAB.CALLS);

  const handleTabPress = useCallback((pressedTab: HomeTab) => {
    setActiveTab(pressedTab);
  }, []);

  useEffect(() => {
    if (activeTab !== HOME_TAB.CALLS) return;
    const { lastRoomId } = useRejoinStore.getState();
    if (!lastRoomId) return;
    api.rooms.checkAlive(lastRoomId).then(({ alive, userCount }) => {
      if (!alive) {
        useRejoinStore.setState({ lastRoomId: null, userCount: null });
      } else {
        useRejoinStore.setState({ userCount });
      }
    });
  }, [activeTab]);

  const tabStyle = (tab: HomeTab) =>
    activeTab === tab ? styles.content : styles.hidden;

  return (
    <View style={styles.container}>
      <View style={tabStyle(HOME_TAB.CALLS)}>
        <CallsScreen onCall={onCall} />
      </View>
      <View style={tabStyle(HOME_TAB.CONTACTS)}>
        <ContactsScreen />
      </View>
      <View style={tabStyle(HOME_TAB.SETTINGS)}>
        <SettingsScreen />
      </View>
      <NavigationBar activeTab={activeTab} onTabPress={handleTabPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  content: { flex: 1 },
  hidden: { display: 'none' },
});
