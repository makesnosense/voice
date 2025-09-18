import { useState, useEffect, useRef, } from 'react';
import { io } from 'socket.io-client';
import type { RoomId, TypedSocket, Message, ConnectionStatus, SocketId } from '../../../../shared/types';
import { useMicrophoneStore } from '../../stores/microphoneStore';
import { useWebRTCStore } from '../../stores/webRTCStore';

export default function useRoom(roomId: RoomId | null, initialStatus: ConnectionStatus) {
  const [connectionStatus, setConnectionStatus] = useState(initialStatus);
  const [roomUsers, setRoomUsers] = useState<SocketId[]>([]);
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
    isMuted,
    toggleMute,
    remoteStreams,
    cleanup: cleanupWebRTC
  } = useWebRTCStore();

  // console.log(micPermissionStatus);
  // console.log(connectionStatus);
  // console.log(localStream);
  // console.log(socketRef);
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

    newSocket.on('room-join-success', async (data: { roomId: RoomId }) => {
      console.log('✅ Successfully joined room:', data.roomId);
      setConnectionStatus('joined');
    });

    // newSocket.on('initiate-webrtc-call', () => {
    //   console.log('🎬 Server says initiate WebRTC');
    //   setShouldInitWebRTC(true);
    // });

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
    isMuted,
    toggleMute,
    remoteStreams,
    micPermissionStatus
  };
}