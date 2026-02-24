import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useRoomStore } from '../stores/useRoomStore';
import { ROOM_CONNECTION_STATUS } from '../constants/room';
import type { RoomId, TypedClientSocket } from '../types';

const SOCKET_OPTIONS = {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 10,
} as const;

export function useRoomSocket(
  roomId: RoomId,
  onDisconnect: () => void,
  onCleanup: () => void,
  url?: string
) {
  const socketRef = useRef<TypedClientSocket | null>(null);

  useEffect(() => {
    const socket: TypedClientSocket = url ? io(url, SOCKET_OPTIONS) : io(SOCKET_OPTIONS);
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ Connected to server:', socket.id);
      socket.emit('join-room', roomId);
    });

    socket.on('room-join-success', ({ roomId: joinedId }) => {
      console.log('✅ Successfully joined room:', joinedId);
      useRoomStore.getState().setConnectionStatus(ROOM_CONNECTION_STATUS.JOINED);
    });

    socket.on('room-users-update', (users) => {
      console.log('👥 Room users updated:', users);
      useRoomStore.getState().setRoomUsers(users);
    });

    socket.on('message', (message) => {
      useRoomStore.getState().addMessage(message);
    });

    socket.on('room-not-found', (error) => {
      console.error('❌ Room error:', error);
      useRoomStore.getState().setConnectionStatus(ROOM_CONNECTION_STATUS.ERROR);
    });

    socket.on('room-full', (error) => {
      console.error('🚫 Room full:', error);
      useRoomStore.getState().setConnectionStatus(ROOM_CONNECTION_STATUS.ROOM_FULL);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ [Socket] Connection error:', error.message);
    });

    socket.on('disconnect', (reason, details) => {
      if (reason === 'io client disconnect') {
        console.log('👋 [Socket] Intentional disconnect');
      } else {
        console.error('❌ [Socket] Disconnect event:', {
          reason,
          details,
          transport: socket.io.engine?.transport?.name,
          timestamp: new Date().toISOString(),
        });
      }
      useRoomStore.getState().setConnectionStatus(ROOM_CONNECTION_STATUS.CONNECTING);
      onDisconnect();
    });

    return () => {
      console.log('🧹 [useRoom] Cleaning up socket connection');
      socket.disconnect();
      useRoomStore.getState().reset();
      onCleanup();
    };
  }, [roomId]);

  return socketRef;
}
