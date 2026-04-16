import { useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { memo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '../../../components/Header';
import HeaderBackButton from '../../../components/HeaderBackButton';
import NameRow from './NameRow';
import {
  TEXT_MUTED,
  NEUTRAL_COLOR,
  BACKGROUND_PRIMARY,
  BACKGROUND_CARD,
} from '../../../styles/colors';

interface ProfileScreenProps {
  onBack: () => void;
}

function ProfileScreen({ onBack }: ProfileScreenProps) {
  const insets = useSafeAreaInsets();
  const [isEditing, setIsEditing] = useState(false);
  const cancelEditingRef = useRef<(() => void) | null>(null);

  return (
    <Pressable
      style={[styles.container, { paddingTop: insets.top }]}
      onPress={isEditing ? () => cancelEditingRef.current?.() : undefined}
    >
      <Header
        title="Profile"
        leftSlot={<HeaderBackButton onPress={onBack} />}
      />
      <View style={styles.content}>
        <Text style={styles.sectionLabel}>name</Text>
        <View style={styles.card}>
          <NameRow
            cancelRef={cancelEditingRef}
            onEditingChange={setIsEditing}
          />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_PRIMARY,
  },
  content: {
    padding: 20,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: TEXT_MUTED,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    paddingHorizontal: 4,
    paddingBottom: 6,
  },
  card: {
    backgroundColor: BACKGROUND_CARD,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: NEUTRAL_COLOR,
    overflow: 'hidden',
  },
});

export default memo(ProfileScreen);
