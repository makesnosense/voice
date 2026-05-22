import { useRef, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { Svg, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Users, Phone, Settings } from 'lucide-react-native';
import { pressedStyle } from '../styles/common';
import {
  TEXT_PRIMARY,
  TEXT_MUTED,
  BACKGROUND_NAV,
  NEUTRAL_COLOR,
  BACKGROUND_CARD,
  TEXT_SECONDARY,
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

export const SCREEN_PADDING_H = 50;
const NAV_PILL_HEIGHT = 67;

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
    <>
      <Svg
        style={[styles.wash, { height: insets.bottom + 20 + NAV_PILL_HEIGHT }]}
        width="100%"
      >
        <Defs>
          <LinearGradient id="wash" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#ffffff" stopOpacity="0" />
            <Stop offset="0.25" stopColor="#ffffff" stopOpacity="0.7" />
            <Stop offset="1" stopColor="#ffffff" stopOpacity="0.8" />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#wash)" />
      </Svg>
      <View
        style={[
          styles.container,
          {
            bottom: insets.bottom + 20,
            left: SCREEN_PADDING_H + insets.left,
            right: SCREEN_PADDING_H + insets.right,
          },
        ]}
      >
        {TABS.map(({ key, label, icon: Icon }, i) => {
          const isActive = key === activeTab;
          return (
            <Pressable
              key={key}
              style={({ pressed }) => [styles.tab, pressed && pressedStyle]}
              onPress={() => onTabPress(key)}
            >
              <View style={styles.pill}>
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
              </View>
            </Pressable>
          );
        })}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  wash: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  container: {
    position: 'absolute',
    flexDirection: 'row',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: NEUTRAL_COLOR,
    borderRadius: 24,
    backgroundColor: BACKGROUND_NAV,
    overflow: 'hidden',
  },

  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
  },
  pill: {
    width: 72,
    alignItems: 'center',
    paddingVertical: 6,
    gap: 2,
  },
  indicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    backgroundColor: BACKGROUND_CARD,
  },
  label: {
    fontSize: 10,
    color: TEXT_SECONDARY,
    fontWeight: '500',
  },
  labelActive: {
    color: TEXT_PRIMARY,
    fontWeight: '500',
  },
});
