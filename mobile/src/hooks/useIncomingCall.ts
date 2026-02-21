import { useEffect, useRef } from 'react';
import { Linking } from 'react-native';

function extractRoomId(url: string): string | null {
  const match = url.match(/voice:\/\/call\?roomId=([^&]+)/);
  return match ? match[1] : null;
}

export function useIncomingCall(onRoomId: (roomId: string) => void) {
  const onRoomIdRef = useRef(onRoomId);
  onRoomIdRef.current = onRoomId;

  useEffect(() => {
    console.log('useIncomingCall effect mounted');

    Linking.getInitialURL().then(url => {
      console.log('getInitialURL:', url);
      if (!url) return;
      const roomId = extractRoomId(url);
      console.log('extracted roomId from initial url:', roomId);
      if (roomId) onRoomIdRef.current(roomId);
    });

    const sub = Linking.addEventListener('url', ({ url }) => {
      console.log('url event fired:', url);
      const roomId = extractRoomId(url);
      console.log('extracted roomId from url event:', roomId);
      if (roomId) onRoomIdRef.current(roomId);
    });

    return () => sub.remove();
  }, []);
}
