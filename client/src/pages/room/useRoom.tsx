import { useState, useEffect, useRef, } from 'react';
import { io } from 'socket.io-client';
import type { RoomId, TypedSocket, Message, ConnectionStatus, SocketId } from '../../../../shared/types';
import useWebRTC from '../../webrtc/useWebRTC';

export default function useRoom(roomId: RoomId | null, initialStatus: ConnectionStatus) {
  const [connectionStatus, setConnectionStatus] = useState(initialStatus);
  const [roomUsers, setRoomUsers] = useState<SocketId[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [audioSetupComplete, setAudioSetupComplete] = useState(false);

  const socketRef = useRef<TypedSocket | null>(null);

  const shouldInitWebRTC = connectionStatus === 'joined' && audioSetupComplete;


  // WebRTC hook - only activates when shouldInitWebRTC is true
  const { isMicActive, audioLevel, isMuted, toggleMute, remoteStreams } = useWebRTC(socketRef.current, shouldInitWebRTC);

  useEffect(() => {
    const checkMicrophonePermission = async () => {
      try {
        // Try to get media stream - this is the most reliable check
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log('🎤 Microphone already available, skipping overlay');

        // Stop tracks immediately
        stream.getTracks().forEach(track => track.stop());

        // Skip overlay entirely
        setAudioSetupComplete(true);

      } catch (error) {
        console.log('🎤 Microphone not available, will show overlay');
        console.error(error);
        // audioSetupComplete stays false, overlay will show
      }
    };

    checkMicrophonePermission();
  }, []);


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

    newSocket.on('room-join-success', async (data: { roomId: RoomId }) => {
      console.log('✅ Successfully joined room:', data.roomId);
      setConnectionStatus('joined');

      // // Here we trigger WebRTC initialization
      // setShouldInitWebRTC(true);
    });


    newSocket.on('room-users-update', (users: SocketId[]) => {
      console.log('👥 Room users updated:', users);
      setRoomUsers(users);
    });

    newSocket.on('message', (message: Message) => {
      setMessages(messages => [...messages, message]);
    });
    return () => {
      newSocket.off();
      newSocket.disconnect();
    };

  }, [roomId, initialStatus]);

  return {
    roomId: roomId as RoomId,
    connectionStatus,
    roomUsers,
    messages,
    socketRef,
    isMicActive,
    audioLevel,
    isMuted,
    toggleMute,
    remoteStreams,
    audioSetupComplete,
    setAudioSetupComplete
  };
}