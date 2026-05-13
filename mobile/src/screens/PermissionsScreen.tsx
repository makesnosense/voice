import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, Mic } from 'lucide-react-native';
import { PERMISSION_STATUS } from '../types/permissions';
import { pressedStyle } from '../styles/common';
import {
  BACKGROUND_CARD,
  BACKGROUND_PRIMARY,
  BORDER_MUTED,
  NEUTRAL_COLOR,
  STATUS_GREEN,
  STATUS_RED,
  TEXT_MUTED,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
} from '../styles/colors';
import { usePermissionsStore } from '../stores/usePermissionsStore.android';

export default function PermissionsScreen() {
  const insets = useSafeAreaInsets();
  const {
    notificationsStatus,
    microphoneStatus,
    requestPermissions,
    permissionsRequested,
    openAppSettings,
    dismiss,
  } = usePermissionsStore();

  const anyDenied =
    permissionsRequested &&
    (notificationsStatus === PERMISSION_STATUS.DENIED ||
      microphoneStatus === PERMISSION_STATUS.DENIED);

  const items = [
    {
      key: 'notifications',
      icon: <Bell size={18} color={TEXT_SECONDARY} strokeWidth={1.75} />,
      label: 'Notifications',
      description: 'required to receive incoming calls',
      status: notificationsStatus,
    },
    {
      key: 'microphone',
      icon: <Mic size={18} color={TEXT_SECONDARY} strokeWidth={1.75} />,
      label: 'Microphone',
      description: 'required for voice calls',
      status: microphoneStatus,
    },
  ];

  const canDismiss =
    permissionsRequested &&
    microphoneStatus === PERMISSION_STATUS.GRANTED &&
    notificationsStatus === PERMISSION_STATUS.DENIED;

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

        {anyDenied ? (
          <Pressable
            style={({ pressed }) => [styles.button, pressed && pressedStyle]}
            onPress={openAppSettings}
          >
            <Text style={styles.buttonText}>Open settings</Text>
          </Pressable>
        ) : (
          <Pressable
            style={({ pressed }) => [styles.button, pressed && pressedStyle]}
            onPress={requestPermissions}
          >
            <Text style={styles.buttonText}>Grant permissions</Text>
          </Pressable>
        )}
        <Text style={styles.hint}>
          if the system dialog doesn't appear, open settings and grant manually
        </Text>

        {canDismiss && (
          <Pressable
            style={({ pressed }) => [
              styles.buttonSecondary,
              pressed && pressedStyle,
            ]}
            onPress={dismiss}
          >
            <Text style={styles.buttonSecondaryText}>Skip</Text>
          </Pressable>
        )}
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
    backgroundColor: STATUS_GREEN,
  },
  statusDenied: {
    backgroundColor: STATUS_RED,
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
    paddingBottom: 16,
  },
  buttonSecondary: {
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: NEUTRAL_COLOR,
    padding: 14,
    alignItems: 'center',
  },
  buttonSecondaryText: {
    color: TEXT_SECONDARY,
    fontSize: 15,
  },
});
