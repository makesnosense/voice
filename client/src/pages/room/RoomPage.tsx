import './RoomPage.css';
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router';
import { io } from 'socket.io-client';
import Messages from './Messages';
import type { TypedSocket, Message, RoomId } from '../../../../shared/types';



export default function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>();

  const socketRef = useRef<TypedSocket | null>(null);
  const [roomUserCount, setRoomUserCount] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');

  useEffect(() => {

    document.title = `Room ${roomId}`;

    const newSocket: TypedSocket = io();
    socketRef.current = newSocket;


    newSocket.on('connect', () => {
      console.log('✅ Connected to server:', newSocket.id);

      console.log(`🏠 Attempting to join room: ${roomId}`);
      newSocket.emit('join-room', roomId as RoomId);
    });

    newSocket.on('room-join-success', (data: { roomId: RoomId, userCount: number }) => {
      console.log('✅ Successfully joined room:', data.roomId);
      setRoomUserCount(data.userCount);
    });

    newSocket.on('message', (message: Message) => {
      setMessages(messages => [...messages, message]);
    });
    return () => {
      newSocket.off();
      newSocket.disconnect();
    };

  }, [roomId]);


  const sendMessage = () => {
    const text = messageInput.trim();
    if (text && socketRef.current) {
      console.log(messageInput);
      socketRef.current.emit('message', { text });
      setMessageInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };



  return (
    <>
      <h1>📞 Voice Chat Room</h1>

      <div>
        <h3>Room: <span></span></h3>
        <p>Users connected: <span>{roomUserCount}</span></p>

        <Messages messages={messages} />

        <div>
          <input type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type message..." />
          <button
            onClick={sendMessage}
            className="send-button"
          >Send</button>
        </div>
      </div>
    </>
  );
}


