import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Smartphone, Monitor, Trash2 } from 'lucide-react-native';
import { pressedStyle } from '../../../styles/common';
import {
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  TEXT_MUTED,
  NEUTRAL_COLOR,
  BACKGROUND_PRIMARY,
} from '../../../styles/colors';
import { formatLastSeen } from '../../../../../shared/utils/format-last-seen';
import type { Device } from '../../../../../shared/types/devices';

interface DeviceRowProps {
  device: Device;
  isCurrentDevice: boolean;
  isEditing: boolean;
  isRemoving: boolean;
  onRemove: () => void;
}

export default function DeviceRow({
  device,
  isCurrentDevice,
  isEditing,
  isRemoving,
  onRemove,
}: DeviceRowProps) {
  const icon =
    device.platform === 'web' ? (
      <Monitor size={18} color={TEXT_SECONDARY} strokeWidth={1.75} />
    ) : (
      <Smartphone size={18} color={TEXT_SECONDARY} strokeWidth={1.75} />
    );

  return (
    <View style={styles.row}>
      <View style={styles.icon}>{icon}</View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {device.deviceName ?? device.platform}
        </Text>
        <Text style={styles.meta}>
          {device.platform} · {formatLastSeen(device.lastSeen)}
        </Text>
      </View>
      {isCurrentDevice && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>this device</Text>
        </View>
      )}
      {!isCurrentDevice &&
        isEditing &&
        (isRemoving ? (
          <ActivityIndicator size="small" color="#ef4444" />
        ) : (
          <Pressable
            style={({ pressed }) => [
              styles.trashButton,
              pressed && pressedStyle,
            ]}
            onPress={onRemove}
            hitSlop={8}
          >
            <Trash2 size={14} color="#ef4444" strokeWidth={2} />
          </Pressable>
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 9,
    backgroundColor: BACKGROUND_PRIMARY,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: NEUTRAL_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 15,
    fontWeight: '500',
    color: TEXT_PRIMARY,
    includeFontPadding: false,
  },
  meta: {
    fontSize: 12,
    color: TEXT_MUTED,
  },
  badge: {
    backgroundColor: '#E6F1FB',
    borderRadius: 5,
    paddingVertical: 2,
    paddingHorizontal: 7,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#0C447C',
  },
  trashButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
