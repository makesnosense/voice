import { Pressable, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useState } from 'react';
import { createRoom } from '../utils/create-room';
import { pressedStyle } from '../styles/common';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TEXT_MUTED, BORDER_MUTED } from '../styles/colors';

export default function CreateRoomButton() {
  const insets = useSafeAreaInsets();
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
        styles.createRoomButton,
        { bottom: insets.bottom + 32 },
        pressed && pressedStyle,
      ]}
    >
      {isCreatingRoom ? (
        <ActivityIndicator size="small" color="#94a3b8" />
      ) : (
        <Text style={styles.createRoomLabel}>Create call</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  createRoomButton: {
    position: 'absolute',
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER_MUTED,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44,
    minHeight: 44,
  },
  createRoomLabel: {
    fontSize: 14,
    color: TEXT_MUTED,
  },
});
