import { View, Text, StyleSheet } from 'react-native';
import type { ReactNode } from 'react';

interface HeaderProps {
  title: string;
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
}

export default function Header({ title, leftSlot, rightSlot }: HeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.slot}>{leftSlot}</View>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.slot}>{rightSlot}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.3,
    includeFontPadding: false,
  },
  slot: {
    width: 36,
    alignItems: 'center',
  },
});
