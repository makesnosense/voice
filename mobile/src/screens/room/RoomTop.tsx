import type { RoomId } from '../../../../shared/types/core';
import {
  KeyboardAvoidingView,
  useAnimatedKeyboard,
} from 'react-native-keyboard-controller';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  useAnimatedRef,
} from 'react-native-reanimated';
import { useCallback } from 'react';
import ChatCard from './components/ChatCard';
import OtherParty from './components/other-party/OtherParty';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoomStore } from '../../../../shared/stores/useRoomStore';

const SCREEN_HEIGHT = Dimensions.get('window').height;

interface RoomTopProps {
  roomId: RoomId;
}

export default function RoomTop({ roomId }: RoomTopProps) {
  const insets = useSafeAreaInsets();
  const messages = useRoomStore(state => state.messages);
  const hasMessages = messages.length > 0;

  const { height: keyboardHeight } = useAnimatedKeyboard();
  const contentBottomY = useSharedValue(0);
  const contentRef = useAnimatedRef<Animated.View>();

  const onContentLayout = useCallback(() => {
    contentRef.current?.measure((_x, _y, _w, height, _pageX, pageY) => {
      contentBottomY.value = pageY + height;
    });
  }, [contentBottomY, contentRef]);

  const avoidanceStyle = useAnimatedStyle(() => {
    const keyboardTop = SCREEN_HEIGHT - keyboardHeight.value;
    const overlap = Math.max(0, contentBottomY.value - keyboardTop);
    return { transform: [{ translateY: -overlap }] };
  });

  return (
    <KeyboardAvoidingView
      behavior="padding"
      enabled={hasMessages}
      keyboardVerticalOffset={insets.top + 8}
      style={styles.container}
    >
      {!hasMessages && <View style={styles.filler} />}
      <Animated.View
        ref={contentRef}
        onLayout={onContentLayout}
        style={[
          styles.content,
          hasMessages && styles.contentExpanded,
          !hasMessages && avoidanceStyle,
        ]}
      >
        <OtherParty roomId={roomId} />
        <ChatCard />
      </Animated.View>
      {!hasMessages && <View style={styles.filler} />}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filler: {
    flex: 1,
  },
  content: {
    gap: 8,
  },
  contentExpanded: {
    flex: 1,
  },
});
