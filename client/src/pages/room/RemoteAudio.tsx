import { useEffect, useRef } from 'react';
import type { SocketId } from '../../../../shared/types';

interface RemoteAudioProps {
  userId: SocketId;
  stream: MediaStream;
  onAutoplayBlocked?: () => void;
}

export default function RemoteAudio({ userId, stream }: RemoteAudioProps) {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audioElement = audioRef.current; // capture the ref value

    if (audioElement && stream) {
      audioElement.srcObject = stream;

      audioElement.play().catch(console.error);
    }

    return () => {
      if (audioElement) {
        audioElement.srcObject = null;
      }
    };
  }, [stream]); // stream is the dependency

  return (
    <audio
      ref={audioRef}
      autoPlay
      playsInline
      style={{ display: 'none' }} // audio only, no video
      data-user-id={userId}
    />
  );
}