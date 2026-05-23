import { View, Text, StyleSheet } from 'react-native';
import { Svg, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TEXT_PRIMARY } from '../styles/colors';
import type { ReactNode } from 'react';

export const HEADER_HEIGHT = 56;

interface HeaderProps {
  title: string;
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
}

export default function Header({ title, leftSlot, rightSlot }: HeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.leftSlot}>{leftSlot}</View>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.rightSlot}>{rightSlot}</View>
      </View>
      <Svg
        style={[styles.wash, { height: insets.top + HEADER_HEIGHT }]}
        width="100%"
      >
        <Defs>
          <LinearGradient id="wash" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#ffffff" stopOpacity="0.8" />
            <Stop offset="0.75" stopColor="#ffffff" stopOpacity="0.7" />
            <Stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#wash)" />
      </Svg>
    </>
  );
}

const styles = StyleSheet.create({
  wash: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    zIndex: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    letterSpacing: -0.3,
    includeFontPadding: false,
  },
  leftSlot: {
    width: 44,
    alignItems: 'flex-start',
  },
  rightSlot: {
    width: 44,
    alignItems: 'flex-end',
  },
});
