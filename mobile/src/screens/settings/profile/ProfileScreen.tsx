import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { memo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, X } from 'lucide-react-native';
import { useAuthStore } from '../../../stores/useAuthStore';
import Header from '../../../components/Header';
import HeaderBackButton from '../../../components/HeaderBackButton';
import { pressedStyle } from '../../../styles/common';
import {
  TEXT_PRIMARY,
  TEXT_MUTED,
  NEUTRAL_COLOR,
  BACKGROUND_PRIMARY,
  BACKGROUND_CARD,
  STATUS_GREEN,
  STATUS_RED,
} from '../../../styles/colors';

interface ProfileScreenProps {
  onBack: () => void;
}

function ProfileScreen({ onBack }: ProfileScreenProps) {
  const insets = useSafeAreaInsets();
  const { user, updateName } = useAuthStore();

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const startEditing = () => {
    setDraft(user?.name ?? '');
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setDraft('');
  };

  const saveName = async () => {
    const trimmed = draft.trim();
    const newName = trimmed.length > 0 ? trimmed : null;
    if (newName === (user?.name ?? null)) {
      cancelEditing();
      return;
    }
    setIsSaving(true);
    try {
      await updateName(newName);
      setIsEditing(false);
    } catch (error) {
      console.error('❌ Failed to update name:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const Wrapper = isEditing ? Pressable : View;

  return (
    <Wrapper
      style={[styles.container, { paddingTop: insets.top }]}
      {...(isEditing && { onPress: cancelEditing })}
    >
      <Header
        title="Profile"
        leftSlot={<HeaderBackButton onPress={onBack} />}
      />

      <View style={styles.content}>
        <Text style={styles.sectionLabel}>name</Text>
        <View style={styles.card}>
          <View style={styles.nameRow}>
            {isEditing ? (
              <View style={styles.editRow}>
                <TextInput
                  autoFocus
                  style={styles.input}
                  value={draft}
                  onChangeText={setDraft}
                  onSubmitEditing={saveName}
                  placeholder="Your name"
                  placeholderTextColor={TEXT_MUTED}
                  maxLength={40}
                  returnKeyType="done"
                  editable={!isSaving}
                  autoCorrect={false}
                />
                {isSaving ? (
                  <ActivityIndicator
                    size="small"
                    color={TEXT_MUTED}
                    style={styles.spinner}
                  />
                ) : (
                  <View style={styles.actionButtons}>
                    <Pressable
                      style={({ pressed }) => pressed && pressedStyle}
                      onPress={saveName}
                      hitSlop={16}
                    >
                      <Check size={26} color={STATUS_GREEN} strokeWidth={2} />
                    </Pressable>
                    <Pressable
                      style={({ pressed }) => pressed && pressedStyle}
                      onPress={cancelEditing}
                      hitSlop={16}
                    >
                      <X size={26} color={STATUS_RED} strokeWidth={2} />
                    </Pressable>
                  </View>
                )}
              </View>
            ) : (
              <Pressable style={styles.displayRow} onPress={startEditing}>
                <Text
                  style={user?.name ? styles.nameText : styles.namePlaceholder}
                >
                  {user?.name ?? 'Your name'}
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </Wrapper>
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
  displayRow: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    height: 60,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  nameText: {
    fontSize: 18,
    color: TEXT_PRIMARY,
    includeFontPadding: false,
  },
  namePlaceholder: {
    fontSize: 18,
    color: TEXT_MUTED,
    includeFontPadding: false,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  input: {
    fontSize: 18,
    flex: 1,
    color: TEXT_PRIMARY,
    paddingVertical: 0,
    paddingHorizontal: 0,
    includeFontPadding: false,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 22,
  },
  spinner: {
    width: 40,
    height: 40,
  },
});

export default memo(ProfileScreen);
