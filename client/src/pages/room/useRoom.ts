import { useEffect } from 'react';
import useWebRTCInit from './useWebRTCInit';
import { useMicrophoneStore } from '../../stores/useMicrophoneStore';
import { ROOM_CONNECTION_STATUS, type RoomConnectionStatus } from '../../../../shared/room';
import { useWebRTCStore } from '../../stores/useWebRTCStore';
import { useRoomStore } from '../../../../shared/stores/useRoomStore';
import { useRoomSocket } from '../../../../shared/hooks/useRoomSocket';

import type { RoomId } from '../../../../shared/types';

export default function useRoom(roomId: RoomId | null, initialStatus: RoomConnectionStatus) {
  const requestMicrophone = useMicrophoneStore((state) => state.requestMicrophone);

  useEffect(() => {
    requestMicrophone();
  }, [requestMicrophone]);

  useEffect(() => {
    if (!roomId || initialStatus === ROOM_CONNECTION_STATUS.ERROR) return;
    useRoomStore.getState().setConnectionStatus(initialStatus);
  }, [roomId, initialStatus]);

  const socketRef = useRoomSocket(
    roomId!,
    () => useWebRTCStore.getState().cleanup(),
    () => {
      useWebRTCStore.getState().cleanup();
      useMicrophoneStore.getState().cleanup();
    }
  );

  useWebRTCInit(socketRef);

  return {
    socketRef,
  };
}
