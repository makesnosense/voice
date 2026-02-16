import { useEffect } from 'react';
import { useMicrophoneStore, MIC_PERMISSION_STATUS } from '../../stores/useMicrophoneStore';
import { useWebRTCStore } from '../../stores/useWebRTCStore';
import { ROOM_CONNECTION_STATUS } from './RoomPage.constants';
import type { RoomConnectionStatus } from './RoomPage.constants';
import type { TypedSocket } from '../../../../shared/types';

export default function useWebRTCInit(
  socketRef: React.RefObject<TypedSocket | null>,
  connectionStatus: RoomConnectionStatus
) {
  const localStream = useMicrophoneStore((state) => state.stream);
  const micPermissionStatus = useMicrophoneStore((state) => state.status);
  const requestMicrophone = useMicrophoneStore((state) => state.requestMicrophone);

  useEffect(() => {
    if (
      micPermissionStatus !== MIC_PERMISSION_STATUS.GRANTED ||
      connectionStatus !== ROOM_CONNECTION_STATUS.JOINED ||
      !localStream ||
      !socketRef.current
    )
      return;

    const hasLiveTracks = localStream.getTracks().some((track) => track.readyState === 'live');
    if (!hasLiveTracks) {
      console.log('🚫 Stream has ended tracks, requesting fresh stream...');
      requestMicrophone(); // Request fresh stream
      return;
    }

    console.log('🎬 All conditions met, initializing WebRTC');
    useWebRTCStore.getState().initializeWebRTC(socketRef.current, localStream); // initializeWebRTC never changes
  }, [micPermissionStatus, connectionStatus, localStream, socketRef, requestMicrophone]);
}
