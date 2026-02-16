import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useMicrophoneStore } from '../../stores/useMicrophoneStore';
import { ROOM_CONNECTION_STATUS } from './RoomPage.constants';
import { useWebRTCStore } from '../../stores/useWebRTCStore';
import { useRoomStore } from '../../stores/useRoomStore';

import useWebRTCInit from './useWebRTCInit';
import type { RoomConnectionStatus } from './RoomPage.constants';
import type { RoomId, TypedSocket, Message, UserDataClientSide } from '../../../../shared/types';
import type { Transport } from 'engine.io-client';

export default function useRoom(roomId: RoomId | null, initialStatus: RoomConnectionStatus) {
  const socketRef = useRef<TypedSocket | null>(null);
  const requestMicrophone = useMicrophoneStore((state) => state.requestMicrophone);

  useWebRTCInit(socketRef);

  useEffect(() => {
    requestMicrophone();
  }, [requestMicrophone]);

  useEffect(() => {
    requestMicrophone();
  }, [requestMicrophone]);

  useEffect(() => {
    if (!roomId || initialStatus === ROOM_CONNECTION_STATUS.ERROR) {
      return;
    }

    useRoomStore.getState().setConnectionStatus(initialStatus);

    document.title = `Room ${roomId}`;

    const newSocket: TypedSocket = io({
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 10,
    });

    socketRef.current = newSocket;

    newSocket.io.engine.on('upgrade', (transport: Transport) => {
      console.log('[Socket] 🔄 Transport upgraded to:', transport.name);
    });

    newSocket.on('connect', () => {
      console.log('✅ Connected to server:', newSocket.id);
      console.log('🔌 Transport:', newSocket.io.engine.transport.name);
      console.log('🔌 Engine ID:', newSocket.io.engine.id);
      console.log(`🏠 Attempting to join room: ${roomId}`);
      newSocket.emit('join-room', roomId as RoomId);
    });

    newSocket.on(
      'disconnect',
      (
        reason: string,
        details?:
          | Error
          | {
              description?: string;
              context?: unknown;
            }
      ) => {
        if (reason === 'io client disconnect') {
          console.log('👋 [Socket] Intentional disconnect');
        } else {
          console.error('❌ [Socket] Disconnect event:', {
            reason,
            details,
            transport: newSocket.io.engine?.transport?.name,
            timestamp: new Date().toISOString(),
          });
        }
        // clean up webrtc manager when socket disconnects
        // this ensures we start fresh when reconnecting
        useWebRTCStore.getState().cleanup();
        // set status to connecting so reconnection triggers webrtc re-initialization
        useRoomStore.getState().setConnectionStatus('connecting');
      }
    );

    newSocket.on('connect_error', (error: Error) => {
      console.error('❌ [Socket] Connection error:', error.message);
    });

    newSocket.on('room-not-found', (error: string) => {
      useRoomStore.getState().setConnectionStatus('error');
      console.error('❌ Room error:', error);
    });

    // handle room full error
    newSocket.on('room-full', (error: string) => {
      useRoomStore.getState().setConnectionStatus('room-full');
      console.error('🚫 Room full:', error);
    });

    newSocket.on('room-join-success', (data: { roomId: RoomId }) => {
      console.log('✅ Successfully joined room:', data.roomId);
      useRoomStore.getState().setConnectionStatus('joined');
    });

    newSocket.on('room-users-update', (users: UserDataClientSide[]) => {
      console.log('👥 Room users updated:', users);
      useRoomStore.getState().setRoomUsers(users);
    });

    newSocket.on('message', (message: Message) => {
      useRoomStore.getState().addMessage(message);
    });

    return () => {
      console.log('🧹 [useRoom] Cleaning up socket connection');
      newSocket.disconnect();
      useWebRTCStore.getState().cleanup();
      useMicrophoneStore.getState().cleanup();
      useRoomStore.getState().reset();
    };
  }, [roomId, initialStatus]);

  return {
    socketRef,
  };
}
