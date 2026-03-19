import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Users, Phone, Settings } from 'lucide-react-native';
import type { ObjectValues } from '../../../shared/types/core';

export const HOME_TAB = {
  CONTACTS: 'contacts',
  CALLS: 'calls',
  SETTINGS: 'settings',
} as const;

export type HomeTab = ObjectValues<typeof HOME_TAB>;

const TABS = [
  { key: HOME_TAB.CONTACTS, label: 'Contacts', icon: Users },
  { key: HOME_TAB.CALLS, label: 'Calls', icon: Phone },
  { key: HOME_TAB.SETTINGS, label: 'Settings', icon: Settings },
] as const;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TAB_WIDTH = SCREEN_WIDTH / TABS.length;
const INDICATOR_WIDTH = 76;

interface NavBarProps {
  activeTab: HomeTab;
  tabSelectionAnimationValue: Animated.Value;
  onTabPress: (tab: HomeTab, index: number) => void;
}

export default function NavigationBar({
  activeTab,
  tabSelectionAnimationValue,
  onTabPress,
}: NavBarProps) {
  const insets = useSafeAreaInsets();

  const selectionIndicatorX = tabSelectionAnimationValue.interpolate({
    inputRange: TABS.map((_, i) => i),
    outputRange: TABS.map(
      (_, i) => i * TAB_WIDTH + (TAB_WIDTH - INDICATOR_WIDTH) / 2,
    ),
  });

  return (
    <View
      style={[navBarStyles.container, { paddingBottom: insets.bottom || 16 }]}
    >
      {/* sliding indicator */}
      <Animated.View
        style={[
          navBarStyles.indicator,
          { transform: [{ translateX: selectionIndicatorX }] },
        ]}
      />

      {TABS.map(({ key, label, icon: Icon }, index) => {
        const isActive = activeTab === key;
        return (
          <Pressable
            key={key}
            style={navBarStyles.tab}
            onPress={() => onTabPress(key, index)}
          >
            <Icon
              size={24}
              color={isActive ? '#0f172a' : '#94a3b8'}
              strokeWidth={isActive ? 2 : 1.75}
            />
            <Text
              style={[navBarStyles.label, isActive && navBarStyles.labelActive]}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const navBarStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e2e8f0',
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    top: 10,
    width: INDICATOR_WIDTH,
    height: 52,
    borderRadius: 22,
    backgroundColor: '#f1f5f9',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingTop: 4,
    zIndex: 1,
  },
  label: {
    fontSize: 11,
    color: '#94a3b8',
  },
  labelActive: {
    color: '#0f172a',
    fontWeight: '500',
  },
  labelDisabled: {
    opacity: 0.4,
  },
});
