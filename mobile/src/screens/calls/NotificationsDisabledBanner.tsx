import { View, Pressable, Text, StyleSheet } from 'react-native';
import { Linking } from 'react-native';
import { BellOff } from 'lucide-react-native';
import { useAppPermissions } from '../../hooks/useAppPermissions.android';
import { PERMISSION_STATUS } from '../../types/permissions';
import { pressedStyle } from '../../styles/common';
import { AMBER_BG, AMBER_BORDER, AMBER_TEXT } from '../../styles/colors';
import { ArrowRight } from 'lucide-react-native';

export default function NotificationsDisabledBanner() {
  const { notificationsPermission } = useAppPermissions();

  if (notificationsPermission.status !== PERMISSION_STATUS.DENIED) return null;

  return (
    <Pressable
      style={({ pressed }) => [styles.banner, pressed && pressedStyle]}
      onPress={() => Linking.openSettings()}
    >
      <BellOff size={14} color={AMBER_TEXT} strokeWidth={1.75} />
      <Text style={styles.message}>
        Notifications off — you won't receive calls
      </Text>
      <View style={styles.action}>
        <Text style={styles.actionText}>Settings</Text>
        <ArrowRight size={13} color={AMBER_TEXT} strokeWidth={2} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: AMBER_BG,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderTopColor: AMBER_BORDER,
    borderBottomColor: AMBER_BORDER,
  },
  message: {
    flex: 1,
    fontSize: 13,
    color: AMBER_TEXT,
    includeFontPadding: false,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '500',
    color: AMBER_TEXT,
    includeFontPadding: false,
  },
});
