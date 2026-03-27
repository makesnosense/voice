import { useRef, useState } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
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
  const [activeTab, setActiveTab] = useState<HomeTab>(HOME_TAB.CONTACTS);
  const tabSelectionAnimationValueRef = useRef(new Animated.Value(0));

  const handleTabPress = (pressedTab: HomeTab, pressedTabIndex: number) => {
    setActiveTab(pressedTab);
    Animated.spring(tabSelectionAnimationValueRef.current, {
      toValue: pressedTabIndex,
      useNativeDriver: true,
      tension: 60,
      friction: 10,
    }).start();
  };

  return (
    <View style={homeScreenStyles.container}>
      <View style={homeScreenStyles.content}>
        {activeTab === HOME_TAB.CALLS && <CallsScreen onCall={onCall} />}
        {activeTab === HOME_TAB.CONTACTS && <ContactsScreen />}
        {activeTab === HOME_TAB.SETTINGS && <SettingsScreen />}
      </View>
      <NavigationBar
        activeTab={activeTab}
        tabSelectionAnimationValue={tabSelectionAnimationValueRef.current}
        onTabPress={handleTabPress}
      />
    </View>
  );
}

const homeScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
  },
});
