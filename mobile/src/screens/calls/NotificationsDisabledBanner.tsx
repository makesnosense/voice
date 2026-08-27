import { View, Pressable, Text, StyleSheet } from 'react-native';
import { Linking } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BellOff } from 'lucide-react-native';
import {
  PERMISSION_STATUS,
  type PermissionStatus,
} from '../../types/permissions';
import { pressedStyle } from '../../styles/common';
import { AMBER_BG, AMBER_BORDER, AMBER_TEXT } from '../../styles/colors';
import { ArrowRight } from 'lucide-react-native';
import { usePermissionsStore } from '../../stores/usePermissionsStore';

// any resolved status other than granted means notifications won't
// actually work — checkNotifications() can't reliably distinguish
// "denied, can ask again" from "blocked, permanently denied" the way
// requestNotifications() can, so we treat both the same here
const NOTIFICATIONS_BROKEN_STATUSES: PermissionStatus[] = [
  PERMISSION_STATUS.DENIED,
  PERMISSION_STATUS.BLOCKED,
];

export default function NotificationsDisabledBanner() {
  const { t } = useTranslation();
  const notificationsStatus = usePermissionsStore(
    state => state.notificationsStatus,
  );

  if (!NOTIFICATIONS_BROKEN_STATUSES.includes(notificationsStatus)) return null;

  return (
    <Pressable
      style={({ pressed }) => [styles.banner, pressed && pressedStyle]}
      onPress={() => Linking.openSettings()}
    >
      <BellOff size={14} color={AMBER_TEXT} strokeWidth={1.75} />
      <Text style={styles.message}>{t('calls.notificationsDisabled')}</Text>
      <View style={styles.action}>
        <Text style={styles.actionText}>{t('calls.openSystemSettings')}</Text>
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
