import { useRef, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Users, Phone, Settings } from 'lucide-react-native';
import { pressedStyle } from '../styles/common';
import {
  TEXT_PRIMARY,
  TEXT_MUTED,
  BORDER_MUTED,
  BACKGROUND_NAV,
  BACKGROUND_SECONDARY,
} from '../styles/colors';
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

const INDICATOR_WIDTH = 76;

interface NavBarProps {
  activeTab: HomeTab;
  onTabPress: (tab: HomeTab) => void;
}

export default function NavigationBar({ activeTab, onTabPress }: NavBarProps) {
  const insets = useSafeAreaInsets();

  const indicatorScales = useRef(
    TABS.map(({ key }) => new Animated.Value(key === activeTab ? 1 : 0)),
  ).current;

  useEffect(() => {
    TABS.forEach(({ key }, i) => {
      Animated.spring(indicatorScales[i], {
        toValue: key === activeTab ? 1 : 0,
        useNativeDriver: true,
        tension: 80,
        friction: 10,
      }).start();
    });
  }, [activeTab, indicatorScales]);

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom || 16 }]}>
      {TABS.map(({ key, label, icon: Icon }, i) => {
        const isActive = key === activeTab;
        return (
          <Pressable
            key={key}
            style={({ pressed }) => [styles.tab, pressed && pressedStyle]}
            onPress={() => onTabPress(key)}
          >
            <Animated.View
              style={[
                styles.indicator,
                { transform: [{ scale: indicatorScales[i] }] },
              ]}
            />
            <Icon
              size={24}
              color={isActive ? TEXT_PRIMARY : TEXT_MUTED}
              strokeWidth={isActive ? 2 : 1.75}
            />
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: BORDER_MUTED,
    backgroundColor: BACKGROUND_NAV,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingTop: 7,
    zIndex: 1,
  },
  indicator: {
    position: 'absolute',
    alignSelf: 'center',
    top: 0,
    width: INDICATOR_WIDTH,
    height: 58,
    borderRadius: 28,
    backgroundColor: BACKGROUND_SECONDARY,
  },
  label: {
    fontSize: 11,
    color: TEXT_MUTED,
  },
  labelActive: {
    color: TEXT_PRIMARY,
    fontWeight: '500',
  },
});
