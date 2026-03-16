import { useEffect } from 'react';
import { useMicrophoneStore } from '../../stores/useMicrophoneStore';
import { MIC_PERMISSION_STATUS } from '../../../../shared/constants/microphone';
import { useWebRTCStore } from '../../../../shared/stores/useWebRTCStore';
import { useAudioAnalyserStore } from '../../stores/useAudioAnalyserStore';
import { useRoomStore } from '../../../../shared/stores/useRoomStore';
import { ROOM_CONNECTION_STATUS } from '../../../../shared/constants/room';
import type { TypedClientSocket } from '../../../../shared/types/core';

export default function useWebRTCInit(socketRef: React.RefObject<TypedClientSocket | null>) {
  const roomConnectionStatus = useRoomStore((state) => state.roomConnectionStatus);
  const localStream = useMicrophoneStore((state) => state.stream);
  const micPermissionStatus = useMicrophoneStore((state) => state.status);
  const requestMicrophone = useMicrophoneStore((state) => state.requestMicrophone);

  useEffect(() => {
    if (
      micPermissionStatus !== MIC_PERMISSION_STATUS.GRANTED ||
      roomConnectionStatus !== ROOM_CONNECTION_STATUS.JOINED ||
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

    const analyserCallbacks = {
      onLocalStream: (stream: MediaStream) =>
        useAudioAnalyserStore.getState().initializeLocalAnalyser(stream),
      onRemoteStream: (stream: MediaStream) =>
        useAudioAnalyserStore.getState().initializeRemoteAnalyser(stream),
    };

    const turnServerConfig = {
      credentialsUrl: '/api/turn-credentials',
      host: import.meta.env.VITE_TURN_SERVER_HOST,
      port: import.meta.env.VITE_TURN_SERVER_PORT,
    };

    useWebRTCStore
      .getState()
      .initializeWebRTC(socketRef.current, localStream, turnServerConfig, analyserCallbacks);
  }, [micPermissionStatus, roomConnectionStatus, localStream, socketRef, requestMicrophone]);
}
