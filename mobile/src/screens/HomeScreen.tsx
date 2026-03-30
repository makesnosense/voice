import { useState, useCallback } from 'react';
import { useRejoinStoreRefresh } from '../hooks/useRejoinStoreRefresh';
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

  useRejoinStoreRefresh(activeTab);

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
