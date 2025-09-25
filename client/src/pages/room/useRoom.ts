import { useState, useEffect, useRef, } from 'react';
import { io } from 'socket.io-client';
import type { RoomId, TypedSocket, Message, ConnectionStatus, UserDataClientSide } from '../../../../shared/types';
import { useMicrophoneStore } from '../../stores/useMicrophoneStore';
import { useWebRTCStore } from '../../stores/useWebRTCStore';

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
      console.log('🎬 All conditions met, initializing WebRTC');
      initializeWebRTC(socketRef.current, localStream);
    }
  }, [micPermissionStatus, connectionStatus, localStream, initializeWebRTC]);

  useEffect(() => {
    if (!roomId || initialStatus === 'error') {
      return;
    }

    document.title = `Room ${roomId}`;

    const newSocket: TypedSocket = io();
    socketRef.current = newSocket;


    newSocket.on('connect', () => {
      console.log('✅ Connected to server:', newSocket.id);

      console.log(`🏠 Attempting to join room: ${roomId}`);
      newSocket.emit('join-room', roomId as RoomId);
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