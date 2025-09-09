import './RoomPage.css';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { io } from 'socket.io-client';
import type { TypedSocket, RoomId } from '../../../shared/types';

export default function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>();

  const [roomUserCount, setRoomUserCount] = useState(0);

  useEffect(() => {
    const newSocket: TypedSocket = io();

    newSocket.on('connect', () => {
      console.log('✅ Connected to server:', newSocket.id);

      console.log(`🏠 Attempting to join room: ${roomId}`);
      newSocket.emit('join-room', roomId as RoomId);
    });

    newSocket.on('room-join-success', (data: { roomId: RoomId, userCount: number }) => {
      console.log('✅ Successfully joined room:', data.roomId);
      setRoomUserCount(data.userCount);
    });
    return () => {
      newSocket.disconnect();
    };
  }, [roomId]);

  return (
    <>
      <h1>📞 Voice Chat Room</h1>

      <div id="chat">
        <h3>Room: <span id="roomId"></span></h3>
        <p>Users connected: <span id="userCount">{roomUserCount}</span></p>

        <div id="messages"></div>

        <div>
          <input type="text" id="messageInput" placeholder="Type message..." />
          <button>Send</button>
        </div>
      </div>
    </>
  );


}