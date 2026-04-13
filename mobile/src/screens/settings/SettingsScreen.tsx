import { View, Text, Pressable, StyleSheet } from 'react-native';
import { memo, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LogOut, Smartphone, ChevronRight } from 'lucide-react-native';
import { useAuthStore } from '../../stores/useAuthStore';
import Header from '../../components/Header';
import DevicesScreen from './devices/DevicesScreen';
import { pressedStyle } from '../../styles/common';
import {
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  TEXT_MUTED,
  NEUTRAL_COLOR,
  BORDER_MUTED,
  BACKGROUND_PRIMARY,
  BACKGROUND_CARD,
} from '../../styles/colors';
import type { ObjectValues } from '../../../../shared/types/core';

const SETTINGS_VIEW = {
  MAIN: 'main',
  DEVICES: 'devices',
} as const;

type SettingsView = ObjectValues<typeof SETTINGS_VIEW>;

function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuthStore();
  const [view, setView] = useState<SettingsView>(SETTINGS_VIEW.MAIN);

  if (view === SETTINGS_VIEW.DEVICES) {
    return <DevicesScreen onBack={() => setView(SETTINGS_VIEW.MAIN)} />;
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header title="Settings" />

      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.accountRow}>
            <View style={styles.accountInfo}>
              <Text style={styles.email}>{user?.email}</Text>
              <Text style={styles.hint}>logged in</Text>
            </View>
            <Pressable
              style={({ pressed }) => [
                styles.logoutButton,
                pressed && pressedStyle,
              ]}
              onPress={logout}
              hitSlop={8}
            >
              <LogOut size={16} color="#ef4444" strokeWidth={1.75} />
              <Text style={styles.logoutLabel}>log out</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.menuCard}>
          <Pressable
            style={({ pressed }) => [
              styles.menuRow,
              pressed && styles.menuRowPressed,
            ]}
            onPress={() => setView(SETTINGS_VIEW.DEVICES)}
          >
            <Smartphone size={18} color={TEXT_SECONDARY} strokeWidth={1.75} />
            <Text style={styles.menuLabel}>Devices</Text>
            <ChevronRight size={16} color={NEUTRAL_COLOR} strokeWidth={1.75} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_PRIMARY,
  },
  content: {
    padding: 20,
    gap: 8,
  },
  card: {
    backgroundColor: BACKGROUND_CARD,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: NEUTRAL_COLOR,
    padding: 16,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  accountInfo: {
    gap: 3,
  },
  email: {
    fontSize: 15,
    fontWeight: '500',
    color: TEXT_PRIMARY,
  },
  hint: {
    fontSize: 12,
    color: TEXT_MUTED,
  },
  logoutButton: {
    alignItems: 'center',
    gap: 3,
    opacity: 0.7,
  },
  logoutLabel: {
    fontSize: 11,
    color: '#ef4444',
  },
  menuCard: {
    backgroundColor: BACKGROUND_CARD,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: NEUTRAL_COLOR,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    paddingHorizontal: 16,
  },
  menuRowPressed: {
    backgroundColor: BORDER_MUTED,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    color: TEXT_PRIMARY,
    includeFontPadding: false,
  },
});

export default memo(SettingsScreen);
