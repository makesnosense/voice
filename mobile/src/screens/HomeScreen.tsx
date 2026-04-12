import { useState, useCallback } from 'react';
import { useRejoinStoreRefresh } from '../hooks/useRejoinStoreRefresh';
import { View, StyleSheet } from 'react-native';
import ContactsScreen from './contacts/ContactsScreen';
import CallsScreen from './calls/CallsScreen';
import SettingsScreen from './settings/SettingsScreen';
import NavigationBar, {
  HOME_TAB,
  type HomeTab,
} from '../components/NavigationBar';

export default function HomeScreen() {
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
        <CallsScreen />
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
