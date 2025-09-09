import type { Message } from '../../../../shared/types';


interface MessagesProps {
  messages: Message[];
}

export default function Messages({ messages }: MessagesProps) {
  return <>
    <div className="messages">
      {messages.map((msg, index) => (
        <div key={index} className="message">
          <strong>{msg.userId}:</strong> {msg.text}
          <div className="timestamp">
            {new Date(msg.timestamp).toLocaleTimeString()}
          </div>
        </div>
      ))}
    </div>

  </>


}