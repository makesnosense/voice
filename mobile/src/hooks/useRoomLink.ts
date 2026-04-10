import { useEffect, useRef } from 'react';
import { Linking } from 'react-native';
import { PROD_HOST } from '../config';
import { validateRoomId } from '../../../shared/utils/room';
import type { RoomId } from '../../../shared/types/core';

function extractRoomId(url: string): RoomId | null {
  try {
    const { hostname, pathname } = new URL(url);
    if (hostname !== PROD_HOST) return null;

    const roomIdCleaned = pathname.replace(/\//g, '');

    if (!validateRoomId(roomIdCleaned)) {
      console.warn('Unrecognized deep link path:', pathname);
      return null;
    }

    return roomIdCleaned;
  } catch {
    console.warn('Failed to parse deep link URL:', url);
    return null;
  }
}
export function useRoomLink(onRoom: (roomId: RoomId) => void) {
  // needed so onRoom has stable ref and listener is set only once
  const onRoomRef = useRef(onRoom);
  onRoomRef.current = onRoom;

  useEffect(() => {
    const handleUrl = (url: string) => {
      const roomId = extractRoomId(url);
      if (roomId) onRoomRef.current(roomId);
    };

    // url from intent that started the app
    Linking.getInitialURL().then(url => {
      if (url) handleUrl(url);
    });

    const listener = Linking.addEventListener('url', ({ url }) =>
      handleUrl(url),
    );
    return () => listener.remove();
  }, []);
}
