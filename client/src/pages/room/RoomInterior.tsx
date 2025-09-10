import Messages from './Messages';
import { useState } from 'react';
import type { RoomId, Message, TypedSocket } from "../../../../shared/types";

interface RoomInteriorProps {
  roomId: RoomId;
  roomUserCount: number;
  messages: Message[];
  socketRef: React.RefObject<TypedSocket | null>;
}


export default function RoomInterior({
  roomId,
  roomUserCount,
  messages,
  socketRef
}: RoomInteriorProps) {


  const [messageInput, setMessageInput] = useState('');

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

  const copyRoomUrl = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      console.log('Room URL copied!');
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };
  return (
    <>
      <span><button onClick={copyRoomUrl}>📋 Copy Room URL</button></span>

      <div>
        <h3>Room: <span>{roomId}</span></h3>
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

