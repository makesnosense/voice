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
      <View style={styles.leftSlot}>{leftSlot}</View>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.rightSlot}>{rightSlot}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
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
  leftSlot: {
    width: 44,
    alignItems: 'flex-start',
  },
  rightSlot: {
    width: 44,
    alignItems: 'flex-end',
  },
});
