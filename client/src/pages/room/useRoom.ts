import { useEffect } from 'react';
import useWebRTCInit from './useWebRTCInit';
import { useMicrophoneStore } from '../../stores/useMicrophoneStore';
import { useAudioAnalyserStore } from '../../stores/useAudioAnalyserStore';
import { useWebRTCStore } from '../../../../shared/stores/useWebRTCStore';
import { useRoomSocket } from '../../../../shared/hooks/useRoomSocket';

import type { RoomId } from '../../../../shared/types';

export default function useRoom(roomId: RoomId) {
  const requestMicrophone = useMicrophoneStore((state) => state.requestMicrophone);

  useEffect(() => {
    requestMicrophone();
  }, [requestMicrophone]);

  const socketRef = useRoomSocket(
    roomId!,
    () => useWebRTCStore.getState().cleanup(),
    () => {
      useWebRTCStore.getState().cleanup();
      useMicrophoneStore.getState().cleanup();
      useAudioAnalyserStore.getState().cleanup();
    }
  );

  useWebRTCInit(socketRef);

  return {
    socketRef,
  };
}
