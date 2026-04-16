import { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { memo } from 'react';
import { Check, X } from 'lucide-react-native';
import { useAuthStore } from '../../../stores/useAuthStore';
import { pressedStyle } from '../../../styles/common';
import {
  TEXT_PRIMARY,
  TEXT_MUTED,
  STATUS_GREEN,
  STATUS_RED,
} from '../../../styles/colors';
import type { ObjectValues } from '../../../../../shared/types/core';

const NAME_FIELD_MODE = {
  IDLE: 'idle',
  EDITING: 'editing',
  SAVING: 'saving',
} as const;

type NameFieldMode = ObjectValues<typeof NAME_FIELD_MODE>;

interface EditActionsProps {
  isSaving: boolean;
  onSave: () => void;
  onCancel: () => void;
}

function EditActions({ isSaving, onSave, onCancel }: EditActionsProps) {
  if (isSaving) {
    return (
      <ActivityIndicator
        size="small"
        color={TEXT_MUTED}
        style={styles.spinner}
      />
    );
  }

  return (
    <View style={styles.actionButtons}>
      <Pressable
        style={({ pressed }) => pressed && pressedStyle}
        onPress={onSave}
        hitSlop={16}
      >
        <Check size={26} color={STATUS_GREEN} strokeWidth={2} />
      </Pressable>
      <Pressable
        style={({ pressed }) => pressed && pressedStyle}
        onPress={onCancel}
        hitSlop={16}
      >
        <X size={26} color={STATUS_RED} strokeWidth={2} />
      </Pressable>
    </View>
  );
}

interface NameRowProps {
  cancelRef: React.RefObject<(() => void) | null>;
  onEditingChange: (isEditing: boolean) => void;
}

function NameRow({ cancelRef, onEditingChange }: NameRowProps) {
  const { user, updateName } = useAuthStore();

  const [mode, setMode] = useState<NameFieldMode>(NAME_FIELD_MODE.IDLE);
  const [draft, setDraft] = useState('');

  const cancelEditing = () => {
    setMode(NAME_FIELD_MODE.IDLE);
    setDraft('');
    onEditingChange(false);
  };

  useEffect(() => {
    cancelRef.current = cancelEditing;
  });

  const startEditing = () => {
    setDraft(user?.name ?? '');
    setMode(NAME_FIELD_MODE.EDITING);
    onEditingChange(true);
  };

  const saveName = async () => {
    const trimmed = draft.trim();
    const newName = trimmed.length > 0 ? trimmed : null;
    if (newName === (user?.name ?? null)) {
      cancelEditing();
      return;
    }
    setMode(NAME_FIELD_MODE.SAVING);
    try {
      await updateName(newName);
      setMode(NAME_FIELD_MODE.IDLE);
      onEditingChange(false);
    } catch (error) {
      console.error('❌ Failed to update name:', error);
      setMode(NAME_FIELD_MODE.EDITING);
    }
  };

  return (
    <View style={styles.nameRow}>
      {mode === NAME_FIELD_MODE.IDLE && (
        <Pressable style={styles.displayRow} onPress={startEditing}>
          <Text
            style={[
              styles.nameDisplay,
              { color: user?.name ? TEXT_PRIMARY : TEXT_MUTED },
            ]}
          >
            {user?.name ?? 'Your name'}
          </Text>
        </Pressable>
      )}

      {(mode === NAME_FIELD_MODE.EDITING ||
        mode === NAME_FIELD_MODE.SAVING) && (
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
            editable={mode === NAME_FIELD_MODE.EDITING}
            autoCorrect={false}
          />

          <EditActions
            isSaving={mode === NAME_FIELD_MODE.SAVING}
            onSave={saveName}
            onCancel={cancelEditing}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  nameRow: {
    height: 60,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  displayRow: {
    flex: 1,
    justifyContent: 'center',
  },
  nameDisplay: {
    fontSize: 18,
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

export default memo(NameRow);
