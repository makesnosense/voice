import { useState, useEffect, useRef, } from 'react';
import { io } from 'socket.io-client';
import type { RoomId, TypedSocket, Message, ConnectionStatus } from '../../../../shared/types';
import useWebRTC from '../../webrtc/useWebRTC';

export default function useRoom(roomId: RoomId | null, initialStatus: ConnectionStatus) {
  const [connectionStatus, setConnectionStatus] = useState(initialStatus);
  const [roomUserCount, setRoomUserCount] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [shouldInitWebRTC, setShouldInitWebRTC] = useState(false);

  const socketRef = useRef<TypedSocket | null>(null);

  // WebRTC hook - only activates when shouldInitWebRTC is true
  const { isMicActive, audioLevel } = useWebRTC(socketRef.current, shouldInitWebRTC);



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

    newSocket.on('room-join-success', async (data: { roomId: RoomId, userCount: number }) => {
      console.log('✅ Successfully joined room:', data.roomId);
      setConnectionStatus('joined');
      setRoomUserCount(data.userCount);

      // Here we trigger WebRTC initialization
      setShouldInitWebRTC(true);
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
    roomUserCount,
    messages,
    socketRef,
    isMicActive,
    audioLevel
  };
}