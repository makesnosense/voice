import { Pressable, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useState } from 'react';
import { createRoom } from '../utils/create-room';
import { pressedStyle } from '../styles/common';
import { TEXT_MUTED, BORDER_MUTED } from '../styles/colors';

interface CreateRoomButtonProps {
  mutedColor: boolean;
}

export default function CreateRoomButton({
  mutedColor = false,
}: CreateRoomButtonProps) {
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const handleCreateRoom = async () => {
    if (isCreatingRoom) return;
    setIsCreatingRoom(true);
    try {
      await createRoom();
    } catch (error) {
      console.error('❌ Failed to create room:', error);
    } finally {
      setIsCreatingRoom(false);
    }
  };

  return (
    <Pressable
      onPress={handleCreateRoom}
      disabled={isCreatingRoom}
      style={({ pressed }) => [
        styles.button,
        mutedColor ? styles.mutedColor : styles.normal,
        pressed && pressedStyle,
      ]}
    >
      {isCreatingRoom ? (
        <ActivityIndicator size="small" color="#94a3b8" />
      ) : (
        <Text
          style={[
            styles.label,
            mutedColor ? styles.labelMutedColor : styles.labelNormal,
          ]}
        >
          Create call
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44,
    minHeight: 44,
  },
  normal: {
    borderColor: '#bfdbfe',
  },
  mutedColor: {
    borderColor: BORDER_MUTED,
  },
  label: {
    fontSize: 14,
  },
  labelNormal: {
    color: '#3b82f6',
  },
  labelMutedColor: {
    color: TEXT_MUTED,
  },
});
