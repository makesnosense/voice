import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import { pressedStyle } from '../../../../../styles/common';
import { TEXT_PRIMARY, TEXT_MUTED } from '../../../../../styles/colors';
import type { Contact } from '../../../../../../../shared/types/contacts';

interface ContactRowProps {
  contact: Contact;
  isInvited: boolean;
  hasError: boolean;
  disabled: boolean;
  onInvite: (contact: Contact) => void;
}

export default function ContactRow({
  contact,
  isInvited,
  hasError,
  disabled,
  onInvite,
}: ContactRowProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        pressed && pressedStyle,
        disabled && styles.rowDisabled,
      ]}
      onPress={() => onInvite(contact)}
      disabled={disabled}
    >
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {contact.name ?? contact.email}
        </Text>
        {contact.name && (
          <Text style={styles.email} numberOfLines={1}>
            {contact.email}
          </Text>
        )}
      </View>
      {isInvited && <ActivityIndicator size="small" color={TEXT_MUTED} />}
      {hasError && <AlertCircle size={16} color="#ef4444" />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: 56,
    gap: 12,
  },
  rowDisabled: {
    opacity: 0.5,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 15,
    fontWeight: '500',
    color: TEXT_PRIMARY,
  },
  email: {
    fontSize: 12,
    color: TEXT_MUTED,
  },
});
