import { useEffect, useRef } from 'react';
import type { SocketId } from '../../../../../shared/types/core';

interface RemoteAudioProps {
  socketId: SocketId;
  stream: MediaStream;
  onAutoplayBlocked?: () => void;
}

export default function RemoteAudio({ socketId, stream, onAutoplayBlocked }: RemoteAudioProps) {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement || !stream) return;

    audioElement.srcObject = stream;

    // attempt to play with better error handling
    const attemptPlay = async () => {
      try {
        // store the promise reference
        const playPromise = audioElement.play();

        await playPromise;
        console.log(`✅ Playing audio for user with socketId ${socketId}`);
      } catch (error: unknown) {
        if (error instanceof DOMException) {
          // ignore AbortError - this happens when play() is interrupted
          if (error.name === 'AbortError') {
            console.log(`⏸️ Play interrupted for ${socketId} (this is normal during mounting)`);
            return;
          }

          // handle NotAllowedError - browser blocked autoplay
          if (error.name === 'NotAllowedError') {
            console.warn(`🔇 Autoplay blocked for ${socketId}`, error);
            onAutoplayBlocked?.();
            return;
          }
        }
        // log other errors
        console.error(`❌ Error playing audio for ${socketId}:`, error);
      }
    };

    attemptPlay();

    // cleanup function
    return () => {
      // cancel any pending play promise
      // playPromiseRef.current = null;

      if (audioElement) {
        audioElement.pause(); // most important line
        audioElement.srcObject = null;
      }
    };
  }, [stream, socketId, onAutoplayBlocked]);

  return (
    <audio
      ref={audioRef}
      autoPlay
      playsInline
      style={{ display: 'none' }}
      data-user-id={socketId}
    />
  );
}
