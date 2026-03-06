import { useEffect } from 'react';
import { useRoomStore } from '../../../shared/stores/useRoomStore';
import { useWebRTCStore } from '../../../shared/stores/useWebRTCStore';
import { useMicrophoneStore } from '../stores/useMicrophoneStore';
import { MIC_PERMISSION_STATUS } from '../../../shared/constants/microphone';
import { ROOM_CONNECTION_STATUS } from '../../../shared/constants/room';
import type { TypedClientSocket } from '../../../shared/types';

const TURN_SERVER_CONFIG = __DEV__
  ? {
      credentialsUrl: 'https://localhost:3003/api/turn-credentials',
      host: 'voice.k.vu',
      port: '3478',
    }
  : {
      credentialsUrl: 'https://voice.k.vu/api/turn-credentials',
      host: 'voice.k.vu',
      port: '3478',
    };

export default function useWebRTCInit(
  socketRef: React.RefObject<TypedClientSocket | null>,
) {
  const connectionStatus = useRoomStore(state => state.connectionStatus);
  const localStream = useMicrophoneStore(state => state.stream);
  const micPermissionStatus = useMicrophoneStore(state => state.status);
  const requestMicrophone = useMicrophoneStore(
    state => state.requestMicrophone,
  );

  useEffect(() => {
    // hard prerequisites — nothing works without these
    if (
      connectionStatus !== ROOM_CONNECTION_STATUS.JOINED ||
      !socketRef.current
    )
      return;

    // mic was cleaned up between calls — re-request it
    if (micPermissionStatus !== MIC_PERMISSION_STATUS.GRANTED || !localStream) {
      requestMicrophone();
      return;
    }

    useWebRTCStore
      .getState()
      .initializeWebRTC(
        socketRef.current,
        localStream as unknown as MediaStream,
        TURN_SERVER_CONFIG,
      );
  }, [
    micPermissionStatus,
    connectionStatus,
    localStream,
    socketRef,
    requestMicrophone,
  ]);
}
