import { useState, useEffect, useRef, } from 'react';
import { io } from 'socket.io-client';
import { useMicrophoneStore } from '../../stores/useMicrophoneStore';
import { useWebRTCStore } from '../../stores/useWebRTCStore';
import type { RoomId, TypedSocket, Message, ConnectionStatus, UserDataClientSide } from '../../../../shared/types';

export default function useRoom(roomId: RoomId | null, initialStatus: ConnectionStatus) {
  const [connectionStatus, setConnectionStatus] = useState(initialStatus);
  const [roomUsers, setRoomUsers] = useState<UserDataClientSide[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  const socketRef = useRef<TypedSocket | null>(null);

  const {
    stream: localStream,
    status: micPermissionStatus,
    requestMicrophone,
    cleanup: cleanupMicrophone
  } = useMicrophoneStore();

  const {
    initializeWebRTC,
    isMicActive,
    audioFrequencyData,
    isMutedLocal,
    toggleMute,
    remoteStream,
    remoteUserId,
    remoteAudioFrequencyData,
    cleanup: cleanupWebRTC
  } = useWebRTCStore();

  useEffect(() => {
    requestMicrophone();
  }, [requestMicrophone]);

  // initialize WebRTC when conditions are met
  useEffect(() => {
    if (micPermissionStatus === 'granted' && connectionStatus === 'joined' && localStream && socketRef.current) {

      const hasLiveTracks = localStream.getTracks().some(track => track.readyState === 'live');

      if (!hasLiveTracks) {
        console.log('🚫 Stream has ended tracks, requesting fresh stream...');
        requestMicrophone(); // Request fresh stream
        return;
      }


      console.log('🎬 All conditions met, initializing WebRTC');
      initializeWebRTC(socketRef.current, localStream);
    }
  }, [micPermissionStatus, connectionStatus, localStream, initializeWebRTC, requestMicrophone]);

  useEffect(() => {
    if (!roomId || initialStatus === 'error') {
      return;
    }

    document.title = `Room ${roomId}`;

    const newSocket: TypedSocket = io({
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 10,
    });

    socketRef.current = newSocket;

    newSocket.io.engine.on('upgrade', (transport) => {
      console.log('[Socket] 🔄 Transport upgraded to:', transport.name);
    });

    newSocket.io.engine.on('close', (reason) => {
      console.error('❌ [Engine] Transport closed:', reason);
    });


    newSocket.on('connect', () => {
      console.log('✅ Connected to server:', newSocket.id);
      console.log('🔌 Transport:', newSocket.io.engine.transport.name);
      console.log('🔌 Engine ID:', newSocket.io.engine.id);

      console.log(`🏠 Attempting to join room: ${roomId}`);
      newSocket.emit('join-room', roomId as RoomId);
    });

    // enhanced disconnect logging
    newSocket.on('disconnect', (reason, details) => {
      console.error('❌ [Socket] Disconnect event:', {
        reason,
        details,
        transport: newSocket.io.engine?.transport?.name,
        timestamp: new Date().toISOString()
      });
    });

    newSocket.on('connect_error', (error: any) => {
      console.error('❌ [Socket] Connection error:', error.message);
    });

    newSocket.on('room-not-found', (error: string) => {
      setConnectionStatus('error');
      console.error('❌ Room error:', error);
    });

    // handle room full error
    newSocket.on('room-full', (error: string) => {
      setConnectionStatus('room-full');
      console.error('🚫 Room full:', error);
    });

    newSocket.on('room-join-success', async (data: { roomId: RoomId }) => {
      console.log('✅ Successfully joined room:', data.roomId);
      setConnectionStatus('joined');
    });

    // newSocket.on('initiate-webrtc-call', () => {
    //   console.log('🎬 Server says initiate WebRTC');
    //   setShouldInitWebRTC(true);
    // });

    newSocket.on('room-users-update', (users: UserDataClientSide[]) => {
      console.log('👥 Room users updated:', users);
      setRoomUsers(users);
    });

    newSocket.on('message', (message: Message) => {
      setMessages(messages => [...messages, message]);
    });
    return () => {
      console.log('🧹 [useRoom] Cleaning up socket connection');
      newSocket.off();
      newSocket.disconnect();
      cleanupWebRTC();
      cleanupMicrophone();
    };

  }, [roomId, initialStatus, cleanupWebRTC, cleanupMicrophone]);

  return {
    roomId: roomId as RoomId,
    connectionStatus,
    roomUsers,
    messages,
    socketRef,
    isMicActive,
    audioFrequencyData,
    isMutedLocal,
    toggleMute,
    remoteStream,
    remoteUserId,
    remoteAudioFrequencyData,
    micPermissionStatus
  };
}