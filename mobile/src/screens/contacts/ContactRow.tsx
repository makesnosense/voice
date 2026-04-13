import { useState, memo } from 'react';
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Trash2 } from 'lucide-react-native';
import { startCall } from '../../utils/start-call';
import { TEXT_PRIMARY } from '../../styles/colors';
import { pressedStyle } from '../../styles/common';
import type { Contact } from '../../../../shared/types/contacts';

interface ContactRowProps {
  contact: Contact;
  onRemove?: () => Promise<void>;
}

function ContactRow({ contact, onRemove }: ContactRowProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleRemove = async () => {
    if (isDeleting || !onRemove) return;
    setIsDeleting(true);
    try {
      await onRemove();
    } catch {
      setIsDeleting(false);
    }
  };

  const isRemoveModeActive = onRemove !== undefined;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.contactRow,
        !isRemoveModeActive && pressed && pressedStyle,
        !isRemoveModeActive &&
          !contact.hasMobileDevice &&
          styles.contactRowDisabled,
      ]}
      disabled={isRemoveModeActive || !contact.hasMobileDevice}
      onPress={() =>
        startCall({
          contactId: contact.id,
          contactEmail: contact.email,
          contactName: contact.name,
        })
      }
    >
      <View style={styles.contactInfo}>
        <Text
          style={[
            styles.contactName,
            !isRemoveModeActive &&
              !contact.hasMobileDevice &&
              styles.contactTextDisabled,
          ]}
        >
          {contact.name ?? contact.email}
        </Text>
        {contact.name && (
          <Text style={styles.contactEmail} numberOfLines={1}>
            {contact.email}
          </Text>
        )}
      </View>

      {isRemoveModeActive && (
        <Pressable
          onPress={handleRemove}
          disabled={isDeleting}
          style={({ pressed }) => [
            styles.removeButton,
            pressed && pressedStyle,
          ]}
          hitSlop={8}
        >
          {isDeleting ? (
            <ActivityIndicator size="small" color="#94a3b8" />
          ) : (
            <Trash2 size={20} color="#ef4444" strokeWidth={1.75} />
          )}
        </Pressable>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 14,
  },
  contactInfo: {
    flex: 1,
    gap: 2,
  },
  contactName: {
    color: TEXT_PRIMARY,
    fontSize: 16,
    fontWeight: '500',
  },
  contactEmail: {
    color: '#94a3b8',
    fontSize: 13,
  },
  contactRowDisabled: {
    opacity: 0.38,
  },
  contactTextDisabled: {
    color: '#94a3b8',
  },
  removeButton: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default memo(ContactRow);
