import { memo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { startCall } from '../../utils/start-call';
import { TEXT_PRIMARY } from '../../styles/colors';
import { pressedStyle } from '../../styles/common';
import type { Contact } from '../../../../shared/types/contacts';

interface ContactRowProps {
  contact: Contact;
}

function ContactRow({ contact }: ContactRowProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.contactRow,
        pressed && pressedStyle,
        !contact.hasMobileDevice && styles.contactRowDisabled,
      ]}
      disabled={!contact.hasMobileDevice}
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
            !contact.hasMobileDevice && styles.contactTextDisabled,
          ]}
        >
          {contact.name ?? contact.email}
        </Text>
        {contact.name && (
          <Text style={styles.contactEmail}>{contact.email}</Text>
        )}
      </View>
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
});

export default memo(ContactRow);
