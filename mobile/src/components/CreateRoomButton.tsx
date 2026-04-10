import { Pressable, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useState } from 'react';
import { createRoom } from '../utils/create-room';
import { pressedStyle } from '../styles/common';
import {
  ACTIVE_COLOR,
  TEXT_PRIMARY,
  BORDER_PRIMARY,
  NEUTRAL_COLOR,
} from '../styles/colors';
import type { StyleProp, ViewStyle } from 'react-native';

interface CreateRoomButtonProps {
  mutedColor?: boolean;
  style?: StyleProp<ViewStyle>;
}

export default function CreateRoomButton({
  mutedColor = false,
  style,
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
        mutedColor ? styles.mutedBorder : styles.normalBorder,
        style,
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
  normalBorder: {
    borderColor: BORDER_PRIMARY,
  },
  mutedBorder: {
    borderColor: NEUTRAL_COLOR,
  },
  label: {
    fontSize: 14,
  },
  labelNormal: {
    color: TEXT_PRIMARY,
  },
  labelMutedColor: {
    color: ACTIVE_COLOR,
  },
});
