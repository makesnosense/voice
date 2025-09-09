import './RoomPage.css';
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router';
import { io } from 'socket.io-client';
import type { TypedSocket, Message, RoomId } from '../../../shared/types';

export default function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>();

  const socketRef = useRef<TypedSocket | null>(null);
  const [roomUserCount, setRoomUserCount] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');

  useEffect(() => {
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
      console.log('Message arrived from', message.userId, message.text);
      setMessages(messages => [...messages, message]);
    });
    return () => {
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


  return (
    <>
      <h1>📞 Voice Chat Room</h1>

      <div id="chat">
        <h3>Room: <span id="roomId"></span></h3>
        <p>Users connected: <span id="userCount">{roomUserCount}</span></p>

        <div id="messages">
          {messages.map((msg, index) => (
            <div key={index} className="message">
              <strong>{msg.userId}:</strong> {msg.text}
              <div className="timestamp">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>

        <div>
          <input type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
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