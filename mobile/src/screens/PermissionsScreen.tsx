import { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, Mic } from 'lucide-react-native';
import type { AppPermissions } from '../hooks/useAppPermissions.types';
import { PERMISSION_STATUS } from '../hooks/useAppPermissions.types';
import { pressedStyle } from '../styles/common';
import {
  BACKGROUND_CARD,
  BACKGROUND_PRIMARY,
  BORDER_MUTED,
  NEUTRAL_COLOR,
  TEXT_MUTED,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
} from '../styles/colors';

interface PermissionsScreenProps {
  permissions: AppPermissions;
}

export default function PermissionsScreen({
  permissions,
}: PermissionsScreenProps) {
  const insets = useSafeAreaInsets();
  const { notificationsPermission, microphonePermission, requestAll } =
    permissions;

  useEffect(() => {
    requestAll();
  }, [requestAll]);

  const items = [
    {
      key: 'notifications',
      icon: <Bell size={18} color="#64748b" strokeWidth={1.75} />,
      label: 'Notifications',
      description: 'required to receive incoming calls',
      status: notificationsPermission.status,
    },
    {
      key: 'microphone',
      icon: <Mic size={18} color="#64748b" strokeWidth={1.75} />,
      label: 'Microphone',
      description: 'required for voice calls',
      status: microphonePermission.status,
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        <View style={styles.heading}>
          <Text style={styles.title}>Voice needs access</Text>
          <Text style={styles.subtitle}>
            both permissions are required to use the app
          </Text>
        </View>

        <View>
          <Text style={styles.sectionLabel}>required permissions</Text>
          <View style={styles.card}>
            {items.map(({ key, icon, label, description, status }, index) => (
              <View key={key}>
                {index > 0 && <View style={styles.separator} />}
                <View style={styles.row}>
                  {icon}
                  <View style={styles.rowText}>
                    <Text style={styles.rowLabel}>{label}</Text>
                    <Text style={styles.rowDescription}>{description}</Text>
                  </View>
                  <View
                    style={[
                      styles.statusDot,
                      status === PERMISSION_STATUS.GRANTED
                        ? styles.statusGranted
                        : status === PERMISSION_STATUS.DENIED
                        ? styles.statusDenied
                        : styles.statusChecking,
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [styles.button, pressed && pressedStyle]}
          onPress={requestAll}
        >
          <Text style={styles.buttonText}>Grant permissions</Text>
        </Pressable>

        <Text style={styles.hint}>
          if the system dialog doesn't appear, open settings and grant manually
        </Text>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_PRIMARY,
    justifyContent: 'center',
  },
  content: {
    padding: 20,
    gap: 12,
  },
  heading: {
    gap: 4,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: TEXT_SECONDARY,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: TEXT_MUTED,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    paddingBottom: 6,
  },
  card: {
    backgroundColor: BACKGROUND_CARD,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: NEUTRAL_COLOR,
    overflow: 'hidden',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: BORDER_MUTED,
    marginLeft: 46,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  rowLabel: {
    fontSize: 15,
    color: TEXT_PRIMARY,
    includeFontPadding: false,
  },
  rowDescription: {
    fontSize: 12,
    color: TEXT_SECONDARY,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusGranted: {
    backgroundColor: '#22c55e',
  },
  statusDenied: {
    backgroundColor: '#ef4444',
  },
  statusChecking: {
    backgroundColor: NEUTRAL_COLOR,
  },
  button: {
    backgroundColor: TEXT_PRIMARY,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonText: {
    color: BACKGROUND_PRIMARY,
    fontSize: 16,
    fontWeight: '500',
  },
  hint: {
    fontSize: 12,
    color: TEXT_MUTED,
    textAlign: 'center',
    lineHeight: 18,
  },
});
